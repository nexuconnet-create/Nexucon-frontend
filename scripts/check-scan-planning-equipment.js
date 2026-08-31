// Headless CDP check: Scan Planning list must show chosen capture modalities
// in the Equipment column instead of "—".
const fs = require('fs');
const tokens = JSON.parse(fs.readFileSync('../../Nexucon_backend/_tmp_tokens.json', 'utf8'));
const PAGE = 'http://localhost:3000/government/dashboard/digital-eye/scan-planning';
const PORT = 9333;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const page = list.find(t => t.type === 'page');
  if (!page) throw new Error('No CDP page target');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise((res) => {
    const id = ++msgId;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });

  // Seed auth tokens before any page script runs
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `localStorage.setItem('nexucon_access_token', ${JSON.stringify(tokens.access)});
             localStorage.setItem('token', ${JSON.stringify(tokens.access)});`
  });
  await send('Page.enable');
  await send('Page.navigate', { url: PAGE });
  await sleep(8000); // wait for Next.js + API data

  const evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const rows = [...document.querySelectorAll('table tbody tr')];
      return rows.map(r => {
        const cells = [...r.querySelectorAll('td')];
        return {
          plan: cells[0]?.innerText.trim(),
          equipment: cells[4]?.innerText.trim().replace(/\\n/g, ' | '),
          status: cells[5]?.innerText.trim()
        };
      });
    })()`
  });

  const rows = evalRes.result?.result?.value || [];
  console.log(JSON.stringify(rows, null, 2));
  const missing = rows.filter(r => r.equipment === '—' || r.equipment === '' || !r.equipment);
  console.log(missing.length === 0
    ? 'PASS: every plan shows equipment (capture modalities)'
    : `FAIL: ${missing.length} plan(s) still show no equipment`);
  ws.close();
  process.exit(0);
}

main().catch(e => { console.error('ERROR', e.message); process.exit(1); });
