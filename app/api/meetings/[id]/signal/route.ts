import { NextRequest, NextResponse } from "next/server";

// WebRTC Signaling Exchange Store in memory for peer negotiation
interface SignalMessage {
  id: string;
  sender: string;
  target?: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-peer';
  data: any;
  timestamp: number;
}

const meetingSignalStore: Record<string, SignalMessage[]> = {};

// Signaling messages only make sense while both peers are still negotiating.
// Older messages (from peers that reloaded or left) would otherwise be
// replayed to fresh clients, creating dead peer connections.
const SIGNAL_TTL_MS = 30 * 1000;

function pruneStore(meetingId: string) {
  const messages = meetingSignalStore[meetingId];
  if (!messages || messages.length === 0) return;
  const cutoff = Date.now() - SIGNAL_TTL_MS;
  meetingSignalStore[meetingId] = messages.filter(m => m.timestamp > cutoff);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const meetingId = resolvedParams?.id || 'room';
  const url = new URL(req.url);
  const since = parseInt(url.searchParams.get('since') || '0', 10);
  const sender = url.searchParams.get('sender') || '';

  pruneStore(meetingId);
  const messages = meetingSignalStore[meetingId] || [];
  
  // Filter messages newer than `since` and not sent by current sender
  const newMessages = messages.filter(
    m => m.timestamp > since && (!sender || m.sender !== sender) && (!m.target || m.target === sender)
  );

  return NextResponse.json({
    status: 'success',
    messages: newMessages,
    timestamp: Date.now()
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const meetingId = resolvedParams?.id || 'room';

  try {
    const body = await req.json();
    const { sender, target, type, data } = body;

    if (!sender || !type) {
      return NextResponse.json({ error: 'sender and type are required' }, { status: 400 });
    }

    if (!meetingSignalStore[meetingId]) {
      meetingSignalStore[meetingId] = [];
    }

    const newMsg: SignalMessage = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      sender,
      target,
      type,
      data,
      timestamp: Date.now()
    };

    meetingSignalStore[meetingId].push(newMsg);
    pruneStore(meetingId);

    // Keep only last 100 signal messages to prevent memory growth
    if (meetingSignalStore[meetingId].length > 100) {
      meetingSignalStore[meetingId] = meetingSignalStore[meetingId].slice(-100);
    }

    return NextResponse.json({ status: 'success', messageId: newMsg.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
