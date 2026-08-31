// Trace the exact negotiation sequence: PC creation, addTrack, SLD/SRD with directions.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const HOOK = `
(() => {
  const OrigPC = window.RTCPeerConnection;
  window.__trace = [];
  const log = (s) => window.__trace.push(Date.now() % 100000 + ' ' + s);
  window.RTCPeerConnection = function(...args) {
    const pc = new OrigPC(...args);
    const id = window.__trace.filter(s => s.includes('NEW PC')).length;
    log('NEW PC #' + id);
    const origAddTrack = pc.addTrack.bind(pc);
    pc.addTrack = (t, s) => { log('PC#' + id + ' addTrack ' + t.kind); return origAddTrack(t, s); };
    const origAddTrans = pc.addTransceiver.bind(pc);
    pc.addTransceiver = (k, o) => { log('PC#' + id + ' addTransceiver ' + (typeof k === 'string' ? k : '?') + ' dir=' + (o && o.direction)); return origAddTrans(k, o); };
    const origSLD = pc.setLocalDescription.bind(pc);
    pc.setLocalDescription = async (d) => {
      await origSLD(d);
      const dirs = (pc.localDescription ? pc.localDescription.sdp.split('\\r\\n').filter(l => l.startsWith('a=sendrecv')||l.startsWith('a=recvonly')||l.startsWith('a=sendonly')).map(l => l.trim()) : []).join(',');
      log('PC#' + id + ' SLD ' + pc.localDescription.type + ' dirs=[' + dirs + '] tracks=' + pc.getSenders().map(s => s.track ? s.track.kind : '-').join(','));
    };
    const origSRD = pc.setRemoteDescription.bind(pc);
    pc.setRemoteDescription = async (d) => {
      await origSRD(d);
      const dirs = (pc.remoteDescription ? pc.remoteDescription.sdp.split('\\r\\n').filter(l => l.startsWith('a=sendrecv')||l.startsWith('a=recvonly')||l.startsWith('a=sendonly')).map(l => l.trim()) : []).join(',');
      log('PC#' + id + ' SRD ' + pc.remoteDescription.type + ' dirs=[' + dirs + '] mySenders=' + pc.getSenders().map(s => s.track ? s.track.kind : '-').join(','));
    };
    pc.addEventListener('connectionstatechange', () => log('PC#' + id + ' state=' + pc.connectionState));
    return pc;
  };
  window.RTCPeerConnection.prototype = OrigPC.prototype;
})();
`;

async function trace(port, label) {
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
    ws.send(JSON.stringify({ id: 99, method: 'Runtime.evaluate', params: { expression: `(window.__trace || []).join('\\n')`, returnByValue: true } }));
  });
  console.log(`\n===== ${label} =====`);
  console.log(result);
  ws.close();
}

(async () => { await trace(9333, 'A'); await trace(9334, 'B'); })();
