// Verify the two headless participants actually connected via WebRTC.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function cdpEval(port, expr) {
  const targets = await (await fetch(`http://localhost:${port}/json`)).json();
  const page = targets.find(t => t.type === 'page' && t.url.includes('localhost:3100') && t.url.includes('/room'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  return new Promise((res, rej) => {
    const id = 1;
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === id) { ws.close(); res(msg.result?.result?.value); }
    };
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
  });
}

(async () => {
  const MEETING_ID = process.argv[2] || '91316089-2cd1-4c95-9871-620a1548185d';
  console.log('waiting 30s for signaling + ICE negotiation...');
  await sleep(30000);

  for (const [port, label] of [[9333, 'PARTICIPANT A (Chief Adaeze Okonkwo)'], [9334, 'PARTICIPANT B (default: Engr. Babatunde Sanwo)']]) {
    const result = await cdpEval(port, `(() => {
      const videos = Array.from(document.querySelectorAll('video')).map(v => ({
        src: v.srcObject ? (v.srcObject.getTracks().map(t => t.kind + (t.enabled ? '' : ':disabled')).join(',')) : null,
        readyState: v.readyState,
        videoWidth: v.videoWidth,
        muted: v.muted
      }));
      const audios = Array.from(document.querySelectorAll('audio')).map(a => ({
        tracks: a.srcObject ? a.srcObject.getTracks().map(t => t.kind + (t.enabled ? '' : ':disabled')).join(',') : null,
        readyState: a.readyState
      }));
      const body = document.body.innerText;
      return JSON.stringify({
        url: location.pathname + location.search,
        videos, audios,
        seesOtherParticipant: label => body.includes(label),
        hasBabatunde: body.includes('Babatunde'),
        hasAdaeze: body.includes('Adaeze'),
        liveConnectedBadges: (body.match(/Live Connected/g) || []).length,
        mutedBadges: (body.match(/Muted/g) || []).length
      }, null, 1);
    })()`);
    console.log(`\n===== ${label} =====`);
    console.log(result);
  }

  const presence = await (await fetch(`http://localhost:3100/api/meetings/${MEETING_ID}/presence`)).json();
  console.log('\n===== PRESENCE STORE =====');
  console.log(JSON.stringify(presence.participants.map(p => ({ peerId: p.peerId, name: p.name, status: p.status, isMicOn: p.isMicOn, isVideoOn: p.isVideoOn })), null, 1));
})();
