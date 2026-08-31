// Render-check the redesigned scan-session detail page over CDP.
// Usage: node --experimental-websocket scripts/check-session-page.js
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const SESSION_ID = process.argv[2] || 'd21849e0-c515-4f0c-9604-3e9c94e970d5';
const URL = `http://localhost:3000/government/dashboard/digital-eye/scan-sessions/${SESSION_ID}`;
const PORT = 9333;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function main() {
  const tokens = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../../Nexucon_backend/_tmp_tokens.json'), 'utf8'));

  const proc = execFile(EDGE, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new', '--disable-gpu', '--no-first-run',
    '--user-data-dir=' + path.resolve(__dirname, '../.edge-tmp'),
    'about:blank',
  ], () => {});

  // wait for DevTools endpoint
  let targets;
  for (let i = 0; i < 30; i++) {
    try {
      targets = await (await fetch(`http://localhost:${PORT}/json`)).json();
      if (targets.find(t => t.type === 'page')) break;
    } catch {}
    await sleep(500);
  }
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 0;
  const send = (method, params = {}) => new Promise(res => {
    const id = ++msgId;
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id === id) { ws.removeEventListener('message', onMsg); res(m.result); }
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  // capture console errors + failed network
  const consoleErrors = [];
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
      consoleErrors.push(m.params.args.map(a => a.value || a.description).join(' ').slice(0, 300));
    }
    if (m.method === 'Runtime.exceptionThrown') {
      consoleErrors.push('EXCEPTION: ' + (m.params.exceptionDetails?.exception?.description || '').slice(0, 300));
    }
  });

  // seed auth tokens before app scripts run
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    localStorage.setItem('nexucon_access_token', ${JSON.stringify(tokens.access)});
    localStorage.setItem('token', ${JSON.stringify(tokens.access)});
    localStorage.setItem('nexucon_refresh_token', ${JSON.stringify(tokens.refresh)});
  ` });
  await send('Page.navigate', { url: URL });
  await sleep(12000);

  const result = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const t = (s) => Array.from(document.querySelectorAll(s));
      return {
        title: document.querySelector('h1')?.textContent?.trim(),
        statusPill: document.querySelector('h1 + span, h1 ~ span')?.textContent?.trim(),
        headings: t('h2').map(h => h.textContent.trim()),
        buttons: t('button').map(b => (b.textContent || '').trim()).filter(Boolean).slice(0, 40),
        fileInputs: t('input[type=file]').length,
        modals: t('.fixed.inset-0').length,
        bodyLen: document.body.innerText.length,
        redirected: !location.pathname.includes('${SESSION_ID}'),
        location: location.pathname,
        hasProgressRing: !!document.querySelector('svg circle[strokeDasharray]'),
        cardsWithDeviation: document.body.innerText.includes('BIM Deviations'),
        clashCount: (document.body.innerText.match(/El 1:/g) || []).length,
        defectCount: (document.body.innerText.match(/Loc:/g) || []).length,
      };
    })()`,
  });

  console.log(JSON.stringify(result.result.value, null, 2));
  console.log('\n--- console errors/warnings ---');
  console.log(consoleErrors.length ? consoleErrors.join('\n') : '(none)');
  proc.kill();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
