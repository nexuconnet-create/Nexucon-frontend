import { NextRequest, NextResponse } from "next/server";

// In-memory real-time state cache per meeting across Vercel execution instances
const meetingPresenceStore: Record<string, {
  participants: Array<{
    id: string;
    peerId?: string;
    name: string;
    email: string;
    role: string;
    time: string;
    status: 'Live In Room' | 'Dispatched';
    isMicOn?: boolean;
    isVideoOn?: boolean;
    isHandRaised?: boolean;
    lastSeen: number;
  }>;
  actionItems?: any[];
  minutesNotes?: string;
  votes?: { yes: number; no: number; total: number; voters: Record<string, string> };
  chatMessages?: Array<{ sender: string; role: string; text: string; time: string }>;
}> = {};

function getStore(meetingId: string) {
  const cleanId = meetingId || 'default_room';
  if (!meetingPresenceStore[cleanId]) {
    meetingPresenceStore[cleanId] = {
      participants: [],
      votes: { yes: 0, no: 0, total: 0, voters: {} },
      chatMessages: []
    };
  }
  return meetingPresenceStore[cleanId];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const meetingId = resolvedParams?.id || 'room';
  const store = getStore(meetingId);

  // Clean stale participants (inactive for more than 12 seconds — the room
  // heartbeats every 2.5s, so anything older has left the meeting). The old
  // 15-minute window kept departed participants visible and made live peers
  // attempt WebRTC connections to ghost peer ids.
  const now = Date.now();
  store.participants = store.participants.map(p => {
    // keep seeded or active
    if (now - p.lastSeen > 12 * 1000 && !p.id.startsWith('p-seed-')) {
      return { ...p, status: 'Dispatched' as const };
    }
    return p;
  });

  return NextResponse.json({
    status: 'success',
    meetingId,
    participants: store.participants,
    votes: store.votes,
    chatMessages: store.chatMessages,
    timestamp: now
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const meetingId = resolvedParams?.id || 'room';
  const store = getStore(meetingId);

  try {
    const body = await req.json();
    const { action, participant, vote, message } = body;
    const now = Date.now();
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (action === 'join' || action === 'heartbeat') {
      if (participant && participant.name) {
        const pName = participant.name.replace('(You)', '').trim();
        const pEmail = participant.email || '';
        const pRole = participant.role || 'Stakeholder Representative';
        const pPeerId = participant.peerId || '';

        // Match by peerId first — it is the unique per-tab identity used for
        // WebRTC signaling. Display names/emails are NOT unique (two tabs can
        // default to the same agency head), so name/email matching alone
        // collapses distinct participants into one.
        let existingIdx = -1;
        if (pPeerId) {
          existingIdx = store.participants.findIndex(p => p.peerId === pPeerId);
        }
        if (existingIdx < 0) {
          existingIdx = store.participants.findIndex(
            p => (pEmail && p.email === pEmail) || p.name.toLowerCase() === pName.toLowerCase() || p.name.includes(pName)
          );
        }

        if (existingIdx >= 0) {
          store.participants[existingIdx] = {
            ...store.participants[existingIdx],
            peerId: pPeerId || store.participants[existingIdx].peerId,
            name: pName,
            role: pRole,
            email: pEmail || store.participants[existingIdx].email,
            status: 'Live In Room',
            lastSeen: now,
            isMicOn: participant.isMicOn !== undefined ? participant.isMicOn : store.participants[existingIdx].isMicOn,
            isVideoOn: participant.isVideoOn !== undefined ? participant.isVideoOn : store.participants[existingIdx].isVideoOn,
            isHandRaised: participant.isHandRaised !== undefined ? participant.isHandRaised : store.participants[existingIdx].isHandRaised
          };
        } else {
          store.participants.push({
            id: pPeerId || `p-${now}-${Math.floor(Math.random() * 1000)}`,
            peerId: pPeerId,
            name: pName,
            email: pEmail,
            role: pRole,
            time: timeString,
            status: 'Live In Room',
            lastSeen: now,
            isMicOn: participant.isMicOn ?? true,
            isVideoOn: participant.isVideoOn ?? true,
            isHandRaised: participant.isHandRaised ?? false
          });
        }
      }
    } else if (action === 'raise_hand') {
      if (participant && participant.name) {
        const pName = participant.name.replace('(You)', '').trim();
        const pPeerId = participant.peerId || '';
        const p = pPeerId
          ? store.participants.find(x => x.peerId === pPeerId)
          : store.participants.find(x => x.name.includes(pName));
        if (p) {
          p.isHandRaised = Boolean(participant.isHandRaised);
          p.lastSeen = now;
        }
      }
    } else if (action === 'leave') {
      // Immediate departure (page unload) — remove the participant instead
      // of waiting for the staleness window.
      const pPeerId = participant?.peerId || '';
      const pName = (participant?.name || '').replace('(You)', '').trim();
      store.participants = store.participants.filter(
        p => !(pPeerId && p.peerId === pPeerId) && !(pPeerId ? false : p.name.includes(pName))
      );
    } else if (action === 'vote') {
      if (vote && vote.voter_name && store.votes) {
        const voter = vote.voter_name;
        const currentVote = store.votes.voters[voter];
        if (!currentVote) {
          if (vote.vote === 'YES') {
            store.votes.yes += 1;
          } else {
            store.votes.no += 1;
          }
          store.votes.voters[voter] = vote.vote;
        }
      }
    } else if (action === 'chat') {
      if (message && message.text) {
        store.chatMessages?.push({
          sender: message.sender || 'Council Member',
          role: message.role || 'Stakeholder',
          text: message.text,
          time: timeString
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      participants: store.participants,
      votes: store.votes,
      chatMessages: store.chatMessages
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
