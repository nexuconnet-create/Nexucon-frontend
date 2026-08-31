// Interactive test: click mic/camera toggle buttons and verify track state +
// presence propagation on BOTH participants.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getRoomPage(port) {
  const targets = await (await fetch(`http://localhost:${port}/json`)).json();
  return targets.find(t => t.type === 'page' && t.url.includes('localhost:3100') && t.url.includes('/room'));
}

async function evalOn(port, expr) {
  const page = await getRoomPage(port);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  return new Promise((res) => {
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === 1) { ws.close(); res(msg.result?.result?.value); }
    };
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
  });
}

(async () => {
  const query = (sel) => `document.querySelector('${sel}')`;

  // Helper to click by title attribute
  const clickByTitle = (port, title) => evalOn(port, `(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => (b.title || '') === '${title}');
    if (!btn) return 'NOT FOUND';
    btn.click();
    return 'clicked';
  })()`);

  const trackState = (port) => evalOn(port, `(() => {
    const vids = Array.from(document.querySelectorAll('video')).map(v => {
      const tracks = v.srcObject ? v.srcObject.getTracks().map(t => t.kind + (t.enabled ? '' : ':disabled')) : [];
      return tracks.join(',');
    });
    const body = document.body.innerText;
    return JSON.stringify({
      videoEls: vids,
      micBadge: body.includes('Live Mic'),
      mutedBadge: (body.match(/Muted/g) || []).length,
      selfViewVisible: Array.from(document.querySelectorAll('video')).some(v => v.muted && v.srcObject)
    });
  })()`);

  console.log('--- initial state ---');
  console.log('A:', await trackState(9333));
  console.log('B:', await trackState(9334));

  console.log('\n--- A clicks "Mute Microphone" ---');
  console.log(await clickByTitle(9333, 'Mute Microphone'));
  await sleep(4000); // let presence heartbeat propagate
  console.log('A:', await trackState(9333));
  console.log('B (should show muted badge for A):', await trackState(9334));

  console.log('\n--- A clicks "Unmute Microphone" ---');
  console.log(await clickByTitle(9333, 'Unmute Microphone'));
  await sleep(4000);
  console.log('A:', await trackState(9333));
  console.log('B:', await trackState(9334));

  console.log('\n--- B clicks "Turn Off Camera" ---');
  console.log(await clickByTitle(9334, 'Turn Off Camera'));
  await sleep(4000);
  console.log('A (should no longer see remote video):', await trackState(9333));
  console.log('B:', await trackState(9334));

  console.log('\n--- B clicks "Turn On Camera" ---');
  console.log(await clickByTitle(9334, 'Turn On Camera'));
  await sleep(4000);
  console.log('A:', await trackState(9333));
  console.log('B:', await trackState(9334));
})();
