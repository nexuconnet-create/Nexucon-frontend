// Dump transceiver-level state to understand why the offerer gets no media.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const HOOK = `
(() => {
  const OrigPC = window.RTCPeerConnection;
  window.__pcs = [];
  window.RTCPeerConnection = function(...args) {
    const pc = new OrigPC(...args);
    window.__pcs.push(pc);
    return pc;
  };
  window.RTCPeerConnection.prototype = OrigPC.prototype;
})();
`;

async function dump(port, label) {
  const targets = await (await fetch(`http://localhost:${port}/json`)).json();
  const page = targets.find(t => t.type === 'page' && t.url.includes('localhost:3100') && t.url.includes('/room'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
  ws.send(JSON.stringify({ id: 2, method: 'Page.addScriptToEvaluateOnNewDocument', params: { source: HOOK } }));
  ws.send(JSON.stringify({ id: 3, method: 'Page.reload' }));
  await sleep(25000);
  const result = await new Promise((res) => {
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === 99) res(msg.result?.result?.value);
    };
    ws.send(JSON.stringify({ id: 99, method: 'Runtime.evaluate', params: { expression: `JSON.stringify((window.__pcs || []).map((pc, i) => ({
      idx: i,
      sig: pc.signalingState,
      ice: pc.iceConnectionState,
      localDir: pc.localDescription ? pc.localDescription.sdp.split('\\r\\n').filter(l => l.startsWith('a=')).filter(l => l.includes('SENDRECV') || l.includes('RECVONLY') || l.includes('SENDONLY') || l.includes('INACTIVE')) : null,
      remoteDir: pc.remoteDescription ? pc.remoteDescription.sdp.split('\\r\\n').filter(l => l.startsWith('a=')).filter(l => l.includes('SENDRECV') || l.includes('RECVONLY') || l.includes('SENDONLY') || l.includes('INACTIVE')) : null,
      transceivers: pc.getTransceivers().map(t => ({ mid: t.mid, kind: t.sender.track ? t.sender.track.kind : '?', dir: t.direction, cur: t.currentDirection, hasSenderTrack: !!t.sender.track }))
    })), null, 1)`, returnByValue: true } }));
  });
  console.log(`\n===== ${label} =====`);
  console.log(result);
  ws.close();
}

(async () => { await dump(9333, 'A'); await dump(9334, 'B'); })();
