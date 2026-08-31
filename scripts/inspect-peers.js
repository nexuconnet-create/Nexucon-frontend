// Instrument RTCPeerConnection in the page (test-only, via CDP) and inspect
// the live connection state of participant on `port` after a reload.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const HOOK = `
(() => {
  const OrigPC = window.RTCPeerConnection;
  window.__pcs = [];
  window.__pcErrors = [];
  window.RTCPeerConnection = function(...args) {
    const pc = new OrigPC(...args);
    window.__pcs.push(pc);
    pc.addEventListener('iceconnectionstatechange', () => {});
    return pc;
  };
  window.RTCPeerConnection.prototype = OrigPC.prototype;
  window.addEventListener('error', e => window.__pcErrors.push(String(e.message)));
})();
`;

async function inspect(port, label) {
  const targets = await (await fetch(`http://localhost:${port}/json`)).json();
  const page = targets.find(t => t.type === 'page' && t.url.includes('localhost:3100') && t.url.includes('/room'));
  if (!page) { console.log(`${label}: no room target`); return; }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  const logs = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
      logs.push(`[${msg.params.type}] ` + (msg.params.args || []).map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300));
    } else if (msg.method === 'Runtime.exceptionThrown') {
      logs.push(`[EXCEPTION] ${msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text}`.slice(0, 300));
    }
  };
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
  ws.send(JSON.stringify({ id: 3, method: 'Page.addScriptToEvaluateOnNewDocument', params: { source: HOOK } }));
  ws.send(JSON.stringify({ id: 4, method: 'Page.reload' }));

  await sleep(30000);

  const result = await new Promise((res) => {
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === 99) res(msg.result?.result?.value);
    };
    ws.send(JSON.stringify({ id: 99, method: 'Runtime.evaluate', params: { expression: `JSON.stringify({
      pcs: (window.__pcs || []).map(pc => ({
        signaling: pc.signalingState,
        ice: pc.iceConnectionState,
        conn: pc.connectionState,
        localDescType: pc.localDescription ? pc.localDescription.type : null,
        remoteDescType: pc.remoteDescription ? pc.remoteDescription.type : null,
        senders: pc.getSenders().map(s => s.track ? s.track.kind + (s.track.enabled ? '' : ':off') : 'null'),
        receivers: pc.getReceivers().map(s => s.track ? s.track.kind + (s.track.enabled ? '' : ':off') : 'null'),
        remoteStreamTracks: pc.getReceivers().length
      })),
      errors: window.__pcErrors || []
    }, null, 1)`, returnByValue: true } }));
  });
  console.log(`\n===== ${label} =====`);
  console.log(result);
  if (logs.length) { console.log(`--- console errors/warnings ---`); logs.slice(0, 3).forEach(l => console.log(l)); }
  ws.close();
}

(async () => {
  await inspect(9333, 'PARTICIPANT A (Adaeze, offerer if id > B)');
  await inspect(9334, 'PARTICIPANT B (Babatunde)');
})();
