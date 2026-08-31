// Reload both room pages and capture console messages / exceptions for 35s.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function watch(port, label) {
  const targets = await (await fetch(`http://localhost:${port}/json`)).json();
  const page = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000') && t.url.includes('/room'));
  if (!page) { console.log(`${label}: no room page target!`); return; }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  const logs = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = (msg.params.args || []).map(a => a.value ?? a.description ?? '').join(' ');
      logs.push(`[${msg.params.type}] ${text}`);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      logs.push(`[EXCEPTION] ${msg.params.exceptionDetails.text} ${msg.params.exceptionDetails.exception?.description || ''}`);
    }
  };
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
  ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
  ws.send(JSON.stringify({ id: 4, method: 'Page.reload' }));
  await sleep(35000);
  console.log(`\n===== ${label} console (${logs.length} entries) =====`);
  logs.slice(0, 60).forEach(l => console.log(l.slice(0, 400)));
}

(async () => {
  await Promise.all([watch(9333, 'PARTICIPANT A'), watch(9334, 'PARTICIPANT B')]);
  const presence = await (await fetch('http://localhost:3000/api/meetings/91316089-2cd1-4c95-9871-620a1548185d/presence')).json();
  console.log('\n===== PRESENCE =====');
  console.log(JSON.stringify(presence.participants.map(p => ({ peerId: p.peerId, name: p.name, status: p.status })), null, 1));
})();
