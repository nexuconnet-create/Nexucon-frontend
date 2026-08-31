// Headless crawler for the 12 Digital Eye pages.
// Captures console errors, failed network requests, and a text snapshot per page.
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 9335;
const BASE = 'http://localhost:3000';
const TOKENS = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'Nexucon_backend', '_tmp_tokens.json'), 'utf8')
);

const PAGES = [
  ['Overview', '/government/dashboard/digital-eye/overview'],
  ['Scan Planning', '/government/dashboard/digital-eye/scan-planning'],
  ['Site Surveys', '/government/dashboard/digital-eye/scan-sessions'],
  ['Scan Library', '/government/dashboard/digital-eye/scan-library'],
  ['Data Processing', '/government/dashboard/digital-eye/processing-pipeline'],
  ['Scan-to-BIM', '/government/dashboard/digital-eye/scan-to-bim'],
  ['Deviation Heatmap', '/government/dashboard/digital-eye/deviation-heatmap'],
  ['AI Analysis', '/government/dashboard/digital-eye/ai-analysis'],
  ['Automated Compliance', '/government/dashboard/digital-eye/compliance'],
  ['Compliance Results', '/government/dashboard/digital-eye/qa-qc-insights'],
  ['Reports', '/government/dashboard/digital-eye/reports'],
  ['Integration Settings', '/government/dashboard/digital-eye/integration-settings'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openTab() {
  const targets = await (await fetch(`http://localhost:${PORT}/json`)).json();
  const page = targets.find((t) => t.type === 'page' && t.url.includes('about:blank'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  return ws;
}

function send(ws, id, method, params = {}) {
  return new Promise((res, rej) => {
    const onMsg = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === id) {
        ws.removeEventListener('message', onMsg);
        if (msg.error) rej(new Error(method + ': ' + JSON.stringify(msg.error)));
        else res(msg.result);
      }
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  const proc = spawn(EDGE, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=' + path.join(process.env.TEMP || '/tmp', 'de-edge-profile'),
    '--no-first-run',
    '--window-size=1600,1000',
    'about:blank',
  ], { stdio: 'ignore' });

  // wait for CDP
  for (let i = 0; i < 40; i++) {
    try { await fetch(`http://localhost:${PORT}/json`); break; } catch { await sleep(250); }
  }

  const ws = await openTab();
  let idc = 1;
  const events = { console: [], failed: [] };

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
      events.console.push(msg.params.type + ': ' + msg.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      events.console.push('EXCEPTION: ' + (msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || '').slice(0, 300));
    }
    if (msg.method === 'Network.responseReceived') {
      const r = msg.params.response;
      if (r.status >= 400 && r.url.includes('localhost:8000')) {
        events.failed.push(r.status + ' ' + r.url.replace('http://localhost:8000', ''));
      }
    }
  });
  await send(ws, idc++, 'Runtime.enable');
  await send(ws, idc++, 'Network.enable');

  // Seed auth on the origin
  await send(ws, idc++, 'Page.navigate', { url: BASE + '/government/login' });
  await sleep(2500);
  await send(ws, idc++, 'Runtime.evaluate', {
    expression: `localStorage.setItem('nexucon_access_token', ${JSON.stringify(TOKENS.access)}); localStorage.setItem('nexucon_refresh_token', ${JSON.stringify(TOKENS.refresh)}); localStorage.setItem('nexucon_auth_user', JSON.stringify({email:'admin@nexucon.com'})); 'ok'`,
  });

  const report = {};
  for (const [name, route] of PAGES) {
    events.console = [];
    events.failed = [];
    await send(ws, idc++, 'Page.navigate', { url: BASE + route });
    await sleep(5000);
    const snap = await send(ws, idc++, 'Runtime.evaluate', {
      expression: `(() => {
        const txt = document.body.innerText;
        return JSON.stringify({
          title: document.title,
          url: location.pathname,
          heading: (document.querySelector('h1,h2')||{}).innerText || '',
          textLen: txt.length,
          hasErrorBoundary: /Application error|Unhandled Runtime Error/i.test(txt),
          textSample: txt.replace(/\\s+/g,' ').slice(0, 700),
        });
      })()`,
      returnByValue: true,
    });
    let info;
    try { info = JSON.parse(snap.result.value); } catch { info = { parseFail: true }; }
    report[name] = { route, ...info, consoleErrors: events.console, apiFailures: [...new Set(events.failed)] };
    console.log(`\n########## ${name} (${route})`);
    console.log(JSON.stringify(report[name], null, 1));
  }

  fs.writeFileSync(path.join(__dirname, 'de-page-audit.json'), JSON.stringify(report, null, 2));
  proc.kill();
}

main().catch((e) => { console.error('HARNESS FAILED:', e.message); process.exit(1); });
