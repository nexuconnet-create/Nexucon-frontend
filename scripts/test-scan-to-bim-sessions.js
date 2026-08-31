// Targeted check: scan-to-bim page, switching through every session.
// Verifies the PLY loads (or degrades gracefully) with no page-killing error.
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 9336;
const BASE = 'http://localhost:3000';
const TOKENS = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'Nexucon_backend', '_tmp_tokens.json'), 'utf8')
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function send(ws, id, method, params = {}) {
  return new Promise((res, rej) => {
    const onMsg = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === id) {
        ws.removeEventListener('message', onMsg);
        msg.error ? rej(new Error(method + ': ' + JSON.stringify(msg.error))) : res(msg.result);
      }
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  const proc = spawn(EDGE, [
    '--headless=new', `--remote-debugging-port=${PORT}`,
    '--user-data-dir=' + path.join(process.env.TEMP || '/tmp', 's2b-edge-profile'),
    '--no-first-run', '--window-size=1600,1000', 'about:blank',
  ], { stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    try { await fetch(`http://localhost:${PORT}/json`); break; } catch { await sleep(250); }
  }
  const targets = await (await fetch(`http://localhost:${PORT}/json`)).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  const events = { console: [], failed: [], exceptions: [] };
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      events.console.push(msg.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 250));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      events.exceptions.push((msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || '').slice(0, 250));
    }
    if (msg.method === 'Network.responseReceived') {
      const r = msg.params.response;
      if (r.status >= 400) events.failed.push(r.status + ' ' + r.url.replace(BASE, '').slice(0, 140));
    }
  });
  let idc = 1;
  await send(ws, idc++, 'Runtime.enable');
  await send(ws, idc++, 'Network.enable');
  await send(ws, idc++, 'Page.navigate', { url: BASE + '/government/login' });
  await sleep(2500);
  await send(ws, idc++, 'Runtime.evaluate', {
    expression: `localStorage.setItem('nexucon_access_token', ${JSON.stringify(TOKENS.access)}); localStorage.setItem('nexucon_refresh_token', ${JSON.stringify(TOKENS.refresh)}); localStorage.setItem('nexucon_auth_user', JSON.stringify({email:'admin@nexucon.com'})); 'ok'`,
  });

  await send(ws, idc++, 'Page.navigate', { url: BASE + '/government/dashboard/digital-eye/scan-to-bim' });
  await sleep(6000);

  const snap = async () => {
    const r = await send(ws, idc++, 'Runtime.evaluate', {
      expression: `(() => {
        const txt = document.body.innerText;
        const select = document.querySelector('select');
        return JSON.stringify({
          session: select ? select.value : null,
          plyLoaded: !!document.querySelector('canvas'),
          errorOverlay: /Runtime Error|Application error|Unhandled Runtime/i.test(txt),
          plyErrorMsg: /Point cloud could not be loaded/.test(txt),
          loadingMsg: /Loading point cloud/.test(txt),
          textLen: txt.length,
        });
      })()`,
      returnByValue: true,
    });
    return JSON.parse(r.result.value);
  };

  const sessions = await send(ws, idc++, 'Runtime.evaluate', {
    expression: `(() => { const s = document.querySelector('select'); return s ? JSON.stringify([...s.options].map(o => o.value)) : '[]'; })()`,
    returnByValue: true,
  });
  const allSessions = JSON.parse(sessions.result.value);
  console.log('sessions in picker:', allSessions);

  const report = {};
  for (const sid of allSessions) {
    events.console = []; events.failed = []; events.exceptions = [];
    await send(ws, idc++, 'Runtime.evaluate', {
      expression: `(() => { const s = document.querySelector('select'); s.value = ${JSON.stringify(sid)}; s.dispatchEvent(new Event('change', {bubbles:true})); 'ok'; })()`,
    });
    await sleep(8000); // PLY fetch + parse
    const s = await snap();
    report[sid] = { ...s, console: events.console, failed: [...new Set(events.failed)], exceptions: events.exceptions };
    console.log(`\n===== ${sid}`);
    console.log(JSON.stringify(report[sid], null, 1));
  }

  fs.writeFileSync(path.join(__dirname, 's2b-session-switch-test.json'), JSON.stringify(report, null, 2));
  proc.kill();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
