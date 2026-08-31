// Controlled experiment: which answerer-side construction yields a sendrecv answer?
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run(port) {
  const targets = await (await fetch(`http://localhost:${port}/json`)).json();
  // Run inside the room page — it is a secure context with fake media flags.
  const page = targets.find(t => t.type === 'page' && t.url.includes('localhost:3100') && t.url.includes('/room'));
  if (!page) {
    // create a blank tab (PUT verb in newer Chrome) and navigate it to a
    // localhost page — about:blank is not a secure context, so no mediaDevices.
    await fetch(`http://localhost:${port}/json/new?about:blank`, { method: 'PUT' });
    await sleep(500);
    const targets2 = await (await fetch(`http://localhost:${port}/json`)).json();
    page = targets2.find(t => t.type === 'page' && t.url.startsWith('about:'));
    if (page) {
      const ws2 = new WebSocket(page.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws2.onopen = res; ws2.onerror = rej; });
      ws2.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'http://localhost:3100/nonexistent-secure-context' } }));
      await sleep(2500);
      ws2.close();
    }
    const targets3 = await (await fetch(`http://localhost:${port}/json`)).json();
    page = targets3.find(t => t.type === 'page' && t.url.includes('nonexistent-secure-context'));
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  const send = (id, method, params) => ws.send(JSON.stringify({ id, method, params }));
  const result = await new Promise((res) => {
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === 99) {
        if (msg.result?.exceptionDetails) {
          res('EXCEPTION: ' + JSON.stringify(msg.result.exceptionDetails.exception?.description || msg.result.exceptionDetails).slice(0, 500));
        } else {
          res(msg.result?.result?.value);
        }
      }
    };
    send(1, 'Runtime.enable', {});
    send(99, 'Runtime.evaluate', { expression: `(async () => {
      const cfg = { iceServers: [] };
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      async function tryPattern(name, buildAnswerer) {
        const A = new RTCPeerConnection(cfg);
        const B = new RTCPeerConnection(cfg);
        A.onicecandidate = e => e.candidate && B.addIceCandidate(e.candidate).catch(()=>{});
        B.onicecandidate = e => e.candidate && A.addIceCandidate(e.candidate).catch(()=>{});
        stream.getTracks().forEach(t => A.addTrack(t, stream));
        await buildAnswerer(B, stream);
        const offer = await A.createOffer();
        await A.setLocalDescription(offer);
        await B.setRemoteDescription(offer);
        const answer = await B.createAnswer();
        await B.setLocalDescription(answer);
        await A.setRemoteDescription(answer);
        const dirs = B.getTransceivers().map(t => t.mid + ':' + (t.sender.track ? t.sender.track.kind : '?') + '/' + t.direction + '/cur=' + t.currentDirection);
        const sdpDirs = answer.sdp.split('\\r\\n').filter(l => l.startsWith('a=sendrecv') || l.startsWith('a=recvonly') || l.startsWith('a=sendonly')).map(l => l.trim());
        return name + ' => transceivers: [' + dirs.join(' | ') + ']  answer dirs: [' + sdpDirs.join(', ') + ']';
      }

      const out = [];
      // Pattern 1 (current page code): addTransceiver x2 THEN addTrack
      out.push(await tryPattern('P1 addTransceiver-then-addTrack', async (B, s) => {
        B.addTransceiver('audio', { direction: 'sendrecv' });
        B.addTransceiver('video', { direction: 'sendrecv' });
        s.getTracks().forEach(t => B.addTrack(t, s));
      }));
      // Pattern 2: addTrack only
      out.push(await tryPattern('P2 addTrack-only', async (B, s) => {
        s.getTracks().forEach(t => B.addTrack(t, s));
      }));
      // Pattern 3: addTransceiver only, attach after SRD via replaceTrack
      out.push(await tryPattern('P3 transceivers + replaceTrack-after-SRD', async (B, s) => {
        B.addTransceiver('audio', { direction: 'sendrecv' });
        B.addTransceiver('video', { direction: 'sendrecv' });
      }));
      return out.join('\\n\\n');
    })()`, returnByValue: true, awaitPromise: true });
  });
  console.log(result);
  ws.close();
}

(async () => { await run(9333); })();
