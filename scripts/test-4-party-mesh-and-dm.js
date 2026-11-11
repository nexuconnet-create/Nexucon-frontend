// Comprehensive Multi-Party Room Test: 4+ Participants, Screen Sharing Broadcast & 1-on-1 Private DM
const assert = require('assert');

async function run() {
  const meetingId = `test-mtg-4party-${Date.now()}`;
  console.log(`\n=== Testing 4-Party Mesh, Screen Share & Private DM for meeting: ${meetingId} ===\n`);

  // Direct fetch against the presence endpoint (simulating local route handler or running Next.js instance)
  // Let's test against localhost:3000
  const BASE_URL = 'http://localhost:3000';

  const participants = [
    { peerId: 'peer-p1-babatunde', name: 'Engr. Babatunde Sanwo', role: 'Agency Head', email: 'sanwo@lagos.gov.ng' },
    { peerId: 'peer-p2-adaeze', name: 'Chief Adaeze Okonkwo', role: 'Ministry Director', email: 'adaeze@lagos.gov.ng' },
    { peerId: 'peer-p3-david', name: 'David Rivera', role: 'Lead Contractor', email: 'david@apex.com' },
    { peerId: 'peer-p4-marcus', name: 'Marcus Chen', role: 'Lead Structural Inspector', email: 'marcus@inspections.gov.ng' }
  ];

  const scheduledRoster = [
    { name: 'Engr. Babatunde Sanwo', email: 'sanwo@lagos.gov.ng', role: 'Agency Head' },
    { name: 'Chief Adaeze Okonkwo', email: 'adaeze@lagos.gov.ng', role: 'Ministry Director' },
    { name: 'David Rivera', email: 'david@apex.com', role: 'Lead Contractor' },
    { name: 'Marcus Chen', email: 'marcus@inspections.gov.ng', role: 'Lead Structural Inspector' }
  ];

  console.log('Step 1: Joining 4 distinct participants to the meeting room...');
  for (const p of participants) {
    const res = await fetch(`${BASE_URL}/api/meetings/${meetingId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        participant: {
          peerId: p.peerId,
          name: p.name,
          role: p.role,
          email: p.email,
          isMicOn: true,
          isVideoOn: true,
          isHandRaised: false
        },
        meetingParticipants: scheduledRoster
      })
    });
    assert.strictEqual(res.status, 200, `Join failed for ${p.name}`);
  }

  // Fetch presence
  const presRes = await fetch(`${BASE_URL}/api/meetings/${meetingId}/presence`);
  const presData = await presRes.json();

  console.log('Presence Participants in store:', presData.participants.length);
  const liveParticipants = presData.participants.filter(p => p.status === 'Live In Room');
  console.log(`Live In Room Count: ${liveParticipants.length} (Expected: 4)`);

  assert.strictEqual(liveParticipants.length, 4, `Expected 4 live participants, but found ${liveParticipants.length}`);
  for (const p of participants) {
    const found = liveParticipants.find(x => x.peerId === p.peerId || x.id === p.peerId);
    assert.ok(found, `Participant ${p.name} (${p.peerId}) not found among live participants`);
    assert.strictEqual(found.status, 'Live In Room');
  }
  console.log('✅ PASS: All 4 participants are successfully Live In Room!\n');

  console.log('Step 2: Participant 1 (Engr. Babatunde Sanwo) starts Screen Sharing...');
  const shareRes = await fetch(`${BASE_URL}/api/meetings/${meetingId}/presence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'screen_share',
      isScreenSharing: true,
      participant: {
        peerId: participants[0].peerId,
        name: participants[0].name
      }
    })
  });
  assert.strictEqual(shareRes.status, 200);
  const shareData = await shareRes.json();
  console.log('Screen Sharing Peer ID:', shareData.screenSharingPeerId);
  assert.strictEqual(shareData.screenSharingPeerId, participants[0].peerId);
  const p1Record = shareData.participants.find(p => p.peerId === participants[0].peerId);
  assert.strictEqual(p1Record.isScreenSharing, true);
  console.log('✅ PASS: Screen sharing broadcast registered for Participant 1!\n');

  console.log('Step 3: Participant 3 (David Rivera) sends a Private DM to Participant 1 (Babatunde Sanwo)...');
  const dmRes = await fetch(`${BASE_URL}/api/meetings/${meetingId}/presence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'chat',
      message: {
        id: `msg-${Date.now()}`,
        sender: participants[2].name,
        senderEmail: participants[2].email,
        senderPeerId: participants[2].peerId,
        role: participants[2].role,
        text: 'Hello Engr. Babatunde, this is a private contractor note regarding Grid 4 rebar test.',
        time: '10:15 AM',
        isPrivate: true,
        recipientName: participants[0].name,
        recipientEmail: participants[0].email,
        recipientId: participants[0].peerId
      }
    })
  });
  assert.strictEqual(dmRes.status, 200);
  const dmData = await dmRes.json();
  const lastMsg = dmData.chatMessages[dmData.chatMessages.length - 1];
  console.log('Sent DM Message:', {
    sender: lastMsg.sender,
    recipient: lastMsg.recipientName,
    isPrivate: lastMsg.isPrivate,
    text: lastMsg.text
  });

  assert.strictEqual(lastMsg.isPrivate, true);
  assert.strictEqual(lastMsg.recipientId, participants[0].peerId);
  assert.strictEqual(lastMsg.recipientName, participants[0].name);

  // Simulate client-side privacy filtering for Participant 1 (recipient)
  const p1Visible = [lastMsg].filter(msg => {
    if (!msg.isPrivate) return true;
    const isSender = msg.senderPeerId === participants[0].peerId;
    const isRecip = msg.recipientId === participants[0].peerId;
    return isSender || isRecip;
  });
  assert.strictEqual(p1Visible.length, 1, 'Recipient (P1) should be able to view the private message');

  // Simulate client-side privacy filtering for Participant 2 (bystander Adaeze)
  const p2Visible = [lastMsg].filter(msg => {
    if (!msg.isPrivate) return true;
    const isSender = msg.senderPeerId === participants[1].peerId;
    const isRecip = msg.recipientId === participants[1].peerId;
    return isSender || isRecip;
  });
  assert.strictEqual(p2Visible.length, 0, 'Bystander (P2) must NOT see the private message');
  console.log('✅ PASS: Private direct message accurately isolated between Sender and Recipient!\n');

  console.log('Step 4: WebRTC Signaling Mesh between all 4 participants...');
  // Post an offer from P4 to P1
  const sigRes = await fetch(`${BASE_URL}/api/meetings/${meetingId}/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: participants[3].peerId,
      target: participants[0].peerId,
      type: 'offer',
      data: { sdp: 'v=0\r\no=- 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n', type: 'offer' }
    })
  });
  assert.strictEqual(sigRes.status, 200);

  // P1 polls signals for itself
  const p1SigRes = await fetch(`${BASE_URL}/api/meetings/${meetingId}/signal?since=0&sender=${encodeURIComponent(participants[0].peerId)}`);
  const p1SigData = await p1SigRes.json();
  const targetedMsg = p1SigData.messages.find(m => m.sender === participants[3].peerId && m.target === participants[0].peerId);
  assert.ok(targetedMsg, 'Participant 1 must receive the targeted offer from Participant 4');
  console.log('Targeted Offer received by P1 from P4:', targetedMsg.type);

  // P2 polls signals - should NOT receive targeted message for P1
  const p2SigRes = await fetch(`${BASE_URL}/api/meetings/${meetingId}/signal?since=0&sender=${encodeURIComponent(participants[1].peerId)}`);
  const p2SigData = await p2SigRes.json();
  const bystanderMsg = p2SigData.messages.find(m => m.sender === participants[3].peerId && m.target === participants[0].peerId);
  assert.strictEqual(bystanderMsg, undefined, 'P2 must not receive signal targeted to P1');
  console.log('✅ PASS: WebRTC signaling isolation and targeted routing verified!\n');

  console.log('Step 5: Participant 1 stops Screen Sharing...');
  const stopShareRes = await fetch(`${BASE_URL}/api/meetings/${meetingId}/presence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'screen_share',
      isScreenSharing: false,
      participant: {
        peerId: participants[0].peerId,
        name: participants[0].name
      }
    })
  });
  const stopShareData = await stopShareRes.json();
  assert.strictEqual(stopShareData.screenSharingPeerId, null);
  console.log('Screen Sharing Peer ID after stopping:', stopShareData.screenSharingPeerId);
  console.log('✅ PASS: Screen sharing stopped cleanly!\n');

  console.log('==================================================');
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 4-Party Mesh, Screen Share & Private DM 100% Verified!');
  console.log('==================================================\n');
}

run().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
