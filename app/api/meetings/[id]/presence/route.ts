import { NextRequest, NextResponse } from "next/server";

// In-memory real-time state cache per meeting across Vercel execution instances
const meetingPresenceStore: Record<string, {
  participants: Array<{
    id: string;
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
      participants: [
        { id: 'p-seed-1', name: 'Engr. Babatunde Sanwo', email: 'head@regulator.gov.ng', role: 'Agency Head / Director General', time: '10:00 AM', status: 'Live In Room', lastSeen: Date.now(), isMicOn: true, isVideoOn: true },
        { id: 'p-seed-2', name: 'Michael Thorne', email: 'm.thorne@nexucon.net', role: 'Master Developer', time: '10:00 AM', status: 'Live In Room', lastSeen: Date.now(), isMicOn: true, isVideoOn: false },
        { id: 'p-seed-3', name: 'Marcus Chen', email: 'm.chen@inspections.gov.ng', role: 'Field Auditor', time: '10:01 AM', status: 'Live In Room', lastSeen: Date.now(), isMicOn: false, isVideoOn: false },
        { id: 'p-seed-4', name: 'David Rivera', email: 'd.rivera@apexconstruct.com', role: 'Lead Contractor', time: '10:02 AM', status: 'Live In Room', lastSeen: Date.now(), isMicOn: true, isVideoOn: false }
      ],
      votes: { yes: 3, no: 0, total: 4, voters: {} },
      chatMessages: [
        { sender: 'Engr. Babatunde Sanwo', role: 'Agency Head', text: 'Welcome to the platform council session. We are reviewing the Level 5 slab casting certification.', time: '10:02 AM' },
        { sender: 'Marcus Chen', role: 'Inspector', text: 'Telemetry GPR scan confirms rebar spacing compliance along Grid 4.', time: '10:04 AM' },
        { sender: 'David Rivera', role: 'Contractor', text: 'Ready to proceed with concrete pour once quorum vote is recorded.', time: '10:05 AM' }
      ]
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

  // Clean stale participants (inactive for more than 15 minutes)
  const now = Date.now();
  store.participants = store.participants.map(p => {
    // keep seeded or active
    if (now - p.lastSeen > 15 * 60 * 1000 && !p.id.startsWith('p-seed-')) {
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

        const existingIdx = store.participants.findIndex(
          p => (pEmail && p.email === pEmail) || p.name.toLowerCase() === pName.toLowerCase() || p.name.includes(pName)
        );

        if (existingIdx >= 0) {
          store.participants[existingIdx] = {
            ...store.participants[existingIdx],
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
            id: `p-${now}-${Math.floor(Math.random() * 1000)}`,
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
        const p = store.participants.find(x => x.name.includes(pName));
        if (p) {
          p.isHandRaised = Boolean(participant.isHandRaised);
          p.lastSeen = now;
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
