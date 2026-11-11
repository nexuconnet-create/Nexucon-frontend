import { NextRequest, NextResponse } from "next/server";

// Global singleton real-time state cache per meeting across hot reloads and execution instances
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
    isScreenSharing?: boolean;
    lastSeen: number;
  }>;
  screenSharingPeerId?: string | null;
  actionItems?: any[];
  minutesNotes?: string;
  votes?: { yes: number; no: number; total: number; voters: Record<string, string> };
  chatMessages?: Array<{
    id?: string;
    sender: string;
    senderEmail?: string;
    senderPeerId?: string;
    role: string;
    text: string;
    time: string;
    isPrivate?: boolean;
    recipientName?: string;
    recipientEmail?: string;
    recipientId?: string;
  }>;
}> = (globalThis as any).__meetingPresenceStore || ((globalThis as any).__meetingPresenceStore = {});

function getStore(meetingId: string) {
  const cleanId = meetingId || 'default_room';
  if (!meetingPresenceStore[cleanId]) {
    meetingPresenceStore[cleanId] = {
      participants: [],
      screenSharingPeerId: null,
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

  const now = Date.now();
  // Keep live participants up to 90s and preserve dispatched/scheduled roster entries
  store.participants = store.participants
    .filter(p => (now - p.lastSeen <= 90 * 1000) || p.id.startsWith('p-seed-') || p.status === 'Dispatched')
    .map(p => {
      // Mark as Dispatched if no heartbeat for 45s (room heartbeats every 2.5s)
      if (now - p.lastSeen > 45 * 1000 && !p.id.startsWith('p-seed-') && p.status === 'Live In Room') {
        return { ...p, status: 'Dispatched' as const };
      }
      return p;
    });

  if (
    store.screenSharingPeerId &&
    !store.participants.some(
      p => (p.peerId === store.screenSharingPeerId || p.id === store.screenSharingPeerId) && p.status === 'Live In Room'
    )
  ) {
    store.screenSharingPeerId = null;
  }

  return NextResponse.json({
    status: 'success',
    meetingId,
    participants: store.participants,
    votes: store.votes,
    chatMessages: store.chatMessages,
    screenSharingPeerId: store.screenSharingPeerId || null,
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

    // Optional seeding of meeting participants from Django meeting roster
    if (body.meetingParticipants && Array.isArray(body.meetingParticipants)) {
      for (const mp of body.meetingParticipants) {
        if (!mp || !mp.name) continue;
        const mpName = mp.name.replace('(You)', '').trim();
        const mpEmail = mp.email || '';
        const exists = store.participants.some(
          p => (mpEmail && p.email && p.email.toLowerCase() === mpEmail.toLowerCase()) ||
               (p.name && p.name.toLowerCase() === mpName.toLowerCase())
        );
        if (!exists) {
          store.participants.push({
            id: `p-roster-${mpEmail || mpName.toLowerCase().replace(/\s+/g, '-')}`,
            name: mpName,
            email: mpEmail,
            role: mp.role || 'Stakeholder Representative',
            time: 'Scheduled',
            status: 'Dispatched',
            lastSeen: 0,
            isMicOn: false,
            isVideoOn: false,
            isHandRaised: false,
            isScreenSharing: false
          });
        }
      }
    }

    if (action === 'join' || action === 'heartbeat') {
      if (participant && participant.name) {
        const pName = participant.name.replace('(You)', '').trim();
        const pEmail = participant.email || '';
        const pRole = participant.role || 'Stakeholder Representative';
        const pPeerId = participant.peerId || '';

        // Match strictly by peerId: each tab/client has a unique peerId.
        // Never hijack an already-active live participant slot.
        let existingIdx = -1;
        if (pPeerId) {
          existingIdx = store.participants.findIndex(p => p.peerId === pPeerId || p.id === pPeerId);
          if (existingIdx === -1) {
            // Only claim an unattached roster entry if it is NOT currently active live in room
            existingIdx = store.participants.findIndex(
              p => (p.status !== 'Live In Room' || !p.peerId || (now - p.lastSeen > 45 * 1000)) &&
                   ((pEmail && p.email && p.email.toLowerCase() === pEmail.toLowerCase()) ||
                    (p.name && p.name.toLowerCase() === pName.toLowerCase() && p.id.startsWith('p-roster-')))
            );
          }
        } else {
          // Fallback if client has no peerId: only match unclaimed entries
          existingIdx = store.participants.findIndex(
            p => (p.status !== 'Live In Room' || !p.peerId || (now - p.lastSeen > 45 * 1000)) &&
                 ((pEmail && p.email && p.email.toLowerCase() === pEmail.toLowerCase()) || 
                  (p.name && p.name.toLowerCase() === pName.toLowerCase()))
          );
        }

        const isSharing = participant.isScreenSharing !== undefined
          ? Boolean(participant.isScreenSharing)
          : (existingIdx >= 0 ? Boolean(store.participants[existingIdx].isScreenSharing) : false);

        if (isSharing && pPeerId) {
          store.screenSharingPeerId = pPeerId;
        } else if (store.screenSharingPeerId === pPeerId && participant.isScreenSharing === false) {
          store.screenSharingPeerId = null;
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
            isHandRaised: participant.isHandRaised !== undefined ? participant.isHandRaised : store.participants[existingIdx].isHandRaised,
            isScreenSharing: isSharing
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
            isHandRaised: participant.isHandRaised ?? false,
            isScreenSharing: isSharing
          });
        }
      }
    } else if (action === 'screen_share') {
      const pPeerId = participant?.peerId || '';
      if (body.isScreenSharing) {
        store.screenSharingPeerId = pPeerId;
      } else if (store.screenSharingPeerId === pPeerId) {
        store.screenSharingPeerId = null;
      }
      const p = store.participants.find(x => x.peerId === pPeerId || x.id === pPeerId);
      if (p) {
        p.isScreenSharing = Boolean(body.isScreenSharing);
        p.lastSeen = now;
      }
    } else if (action === 'raise_hand') {
      if (participant && participant.name) {
        const pPeerId = participant.peerId || '';
        const p = pPeerId
          ? store.participants.find(x => x.peerId === pPeerId || x.id === pPeerId)
          : store.participants.find(x => x.name.includes(participant.name.replace('(You)', '').trim()));
        if (p) {
          p.isHandRaised = Boolean(participant.isHandRaised);
          p.lastSeen = now;
        }
      }
    } else if (action === 'leave') {
      const pPeerId = participant?.peerId || '';
      if (pPeerId) {
        const found = store.participants.find(p => p.peerId === pPeerId || p.id === pPeerId);
        if (found) {
          found.status = 'Dispatched';
          found.lastSeen = 0;
        }
        if (store.screenSharingPeerId === pPeerId) {
          store.screenSharingPeerId = null;
        }
      } else {
        const pName = (participant?.name || '').replace('(You)', '').trim();
        const found = store.participants.find(p => p.name.includes(pName));
        if (found) {
          found.status = 'Dispatched';
          found.lastSeen = 0;
        }
      }
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
        if (!store.chatMessages) store.chatMessages = [];
        store.chatMessages.push({
          id: message.id || `msg-${now}-${Math.floor(Math.random() * 1000)}`,
          sender: message.sender || 'Council Member',
          senderEmail: message.senderEmail || '',
          senderPeerId: message.senderPeerId || '',
          role: message.role || 'Stakeholder',
          text: message.text,
          time: message.time || timeString,
          isPrivate: Boolean(message.isPrivate),
          recipientName: message.recipientName || '',
          recipientEmail: message.recipientEmail || '',
          recipientId: message.recipientId || ''
        });

        // Keep last 250 messages
        if (store.chatMessages.length > 250) {
          store.chatMessages = store.chatMessages.slice(-250);
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      participants: store.participants,
      votes: store.votes,
      chatMessages: store.chatMessages,
      screenSharingPeerId: store.screenSharingPeerId || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
