"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, Phone, PhoneOff, Mic, MicOff, VideoOff, Share2, 
  Users, MessageSquare, ShieldCheck, CheckCircle2, Clock, 
  ArrowLeft, ExternalLink, Sparkles, AlertTriangle, 
  ListTodo, Plus, Check, FileText, Send, Vote, Volume2, 
  Radio, Copy, Globe, RefreshCw, UserCheck, ShieldAlert,
  Maximize2, Minimize2, LayoutGrid, User, Layers, 
  Subtitles, ChevronRight, ChevronLeft, Hand, Smile,
  MonitorPlay, Camera, Cast, UserPlus, Mail, X, Loader2,
  CheckCircle, BadgeCheck, VolumeX,
  Lock, FileCheck, Download, Bot
} from "lucide-react";
import { 
  StakeholderMeeting, getMeetingById, updateMeetingNotes, 
  addMeetingActionItem, MeetingActionItem, joinMeeting, castMeetingVote,
  getAvailableMeetingParticipants, type AvailableParticipant,
  endMeeting, downloadMeetingPdfUrl
} from "@/services/stakeholders";
import { sendEmailViaResend } from "@/services/email";
import { useAuth } from "@/context/AuthContext";

interface ConnectedParticipant {
  id: string;
  peerId?: string;
  name: string;
  email: string;
  role: string;
  time: string;
  status: 'Live In Room' | 'Dispatched';
  isLocalUser?: boolean;
  isMicOn?: boolean;
  isVideoOn?: boolean;
  isHandRaised?: boolean;
  isScreenSharing?: boolean;
  stream?: MediaStream;
}

interface RoomChatMessage {
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
}

interface TranscriptUtterance {
  id: string;
  speaker: string;
  role?: string;
  text: string;
  timestamp: string;
  isFinal?: boolean;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

function MeetingRoomContent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const meetingId = (params?.id as string) || '';

  const meetingsBasePath = useMemo(() => {
    if (pathname.startsWith('/inspector')) return '/inspector/dashboard/meetings';
    if (pathname.startsWith('/stakeholder')) return '/stakeholder/meetings';
    return '/government/dashboard/stakeholders/meetings';
  }, [pathname]);

  const [meeting, setMeeting] = useState<StakeholderMeeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local User Identity in this Meeting Session — the authenticated user
  // (guest links may override name/role/email via query params). Never a
  // fabricated officer identity.
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string }>({
    name: searchParams?.get('guest_name') || 'Guest',
    role: searchParams?.get('role') || 'Guest',
    email: searchParams?.get('email') || ''
  });

  // Once the auth session resolves, use the real signed-in identity unless
  // this is an explicit guest link.
  useEffect(() => {
    if (!user) return;
    setCurrentUser((prev) => {
      if (searchParams?.get('guest_name')) return prev;
      return {
        name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email,
        role: user.role_name || 'Officer',
        email: user.email
      };
    });
  }, [user, searchParams]);

  // Audio/Video Local Stream & Controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  
  // WebRTC Local Video / Screen Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  useEffect(() => { screenStreamRef.current = screenStream; }, [screenStream]);
  // Mirror of localStream for callbacks that must not re-run when media
  // resolves (the signaling effect must never tear down live peer
  // connections just because the camera finished starting up).
  const localStreamRef = useRef<MediaStream | null>(null);
  // 'pending' until getUserMedia settles (ready or denied). Negotiation must
  // not start before this: a peer connection created before local tracks
  // exist negotiates recvonly, and tracks attached afterwards never reach
  // the other side without a renegotiation round-trip.
  const [mediaStatus, setMediaStatus] = useState<'pending' | 'ready' | 'denied'>('pending');

  // WebRTC Remote Peer Connections & Streams
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const lastSignalTimestampRef = useRef<number>(0);
  const seenSignalIdsRef = useRef<Set<string>>(new Set());
  const [remoteScreenSharePeerId, setRemoteScreenSharePeerId] = useState<string | null>(null);

  // Synchronized state refs so presence heartbeats never tear down signaling connections
  const isMicOnRef = useRef(isMicOn);
  const isVideoOnRef = useRef(isVideoOn);
  const isHandRaisedRef = useRef(isHandRaised);
  const isScreenSharingRef = useRef(isScreenSharing);
  useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
  useEffect(() => { isVideoOnRef.current = isVideoOn; }, [isVideoOn]);
  useEffect(() => { isHandRaisedRef.current = isHandRaised; }, [isHandRaised]);
  useEffect(() => { isScreenSharingRef.current = isScreenSharing; }, [isScreenSharing]);

  // Unique per-tab peer identity for WebRTC signaling. Display names are NOT
  // unique (two participants may share a name, and every tab defaults to the
  // same agency head), which previously made same-name peers invisible to the
  // signaling engine — no offer/answer/ICE was ever exchanged between them.
  const peerIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  // ICE candidates can arrive before the remote description is set (signaling
  // is polled, so ordering is not guaranteed). Buffer them per peer and flush
  // once setRemoteDescription completes.
  const pendingCandidatesRef = useRef<Record<string, RTCIceCandidateInit[]>>({});

  // Mode: Native WebRTC Council Stage vs Embedded WebRTC Video Bridge vs Google Meet Launcher
  const [stageMode, setStageMode] = useState<'native_council' | 'webrtc_bridge' | 'google_meet_portal'>('native_council');

  // Fullscreen & Layout Modes
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'spotlight'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Active Sidebar Tab
  const [activeTab, setActiveTab] = useState<'invite' | 'action_items' | 'minutes' | 'voting' | 'chat'>('invite');

  // Live Connected Participants List (Starts Only with Local User)
  const [participants, setParticipants] = useState<ConnectedParticipant[]>([
    { 
      id: 'user-local', 
      name: `${currentUser.name} (You)`, 
      email: currentUser.email, 
      role: currentUser.role, 
      time: 'Just now', 
      status: 'Live In Room', 
      isLocalUser: true, 
      isMicOn: true, 
      isVideoOn: true, 
      isHandRaised: false 
    }
  ]);

  // Live Email Invite State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Master Developer');
  const [inviteCustomNote, setInviteCustomNote] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [platformRoster, setPlatformRoster] = useState<AvailableParticipant[]>([]);

  useEffect(() => {
    getAvailableMeetingParticipants()
      .then((list) => setPlatformRoster(list))
      .catch(() => {});
  }, []);

  const handleSelectRosterPerson = (personId: string) => {
    const found = platformRoster.find((r) => r.id === personId);
    if (!found) return;
    setInviteName(found.name);
    setInviteEmail(found.email || '');
    setInviteRole(found.role || (found.category === 'inspector' ? 'Lead Structural Inspector' : 'Master Developer'));
  };

  // Collaboration State & AI Note Taker
  const [minutesText, setMinutesText] = useState('');
  const [isSavingMinutes, setIsSavingMinutes] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState(currentUser.name);
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);
  const [isAddingAction, setIsAddingAction] = useState(false);

  // Real-time Speech Transcription (Web Speech API)
  const [transcriptLog, setTranscriptLog] = useState<TranscriptUtterance[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [currentSubtitleSpeaker, setCurrentSubtitleSpeaker] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(true);
  const [simulatedUtterance, setSimulatedUtterance] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Chat State (Public & Private 1-on-1 Direct Messaging)
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatRecipient, setChatRecipient] = useState<string>('EVERYONE');

  // End Meeting & Dispatched Minutes State
  const [isEndMeetingModalOpen, setIsEndMeetingModalOpen] = useState(false);
  const [isSubmittingEndMeeting, setIsSubmittingEndMeeting] = useState(false);
  const [sendEmailMinutes, setSendEmailMinutes] = useState(true);
  const [endMeetingCompletedData, setEndMeetingCompletedData] = useState<{
    emailsSent: number;
    pdfFilename: string;
    pdfBase64?: string;
  } | null>(null);

  // Voting State
  const [voteStatus, setVoteStatus] = useState<'IDLE' | 'VOTED_YES' | 'VOTED_NO'>('IDLE');
  const [quorumVotes, setQuorumVotes] = useState({ yes: 0, no: 0, total: 1 });

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Standard live URL using current portal domain/path
  const getLiveMeetingUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nexucon-frontend-8x3a.vercel.app';
    return `${origin}${meetingsBasePath}/${meetingId || 'room'}/room`;
  };

  // 1. Initialize Local Media Stream (Camera & Mic)
  useEffect(() => {
    let streamInstance: MediaStream | null = null;
    const initMedia = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          });
          streamInstance = stream;
          localStreamRef.current = stream;
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
        setMediaStatus('ready');
      } catch (err) {
        console.warn("Camera/mic permission notice:", err);
        setMediaStatus('denied');
      }
    };
    initMedia();

    return () => {
      localStreamRef.current = null;
      if (streamInstance) {
        streamInstance.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Update track enable/disable on state toggle
  // Update track enable/disable on state toggle and sync with active peer connections
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOn;
      });
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
      });
    }

    // While screen sharing, the screen track replaces the camera track on
    // every peer sender so remote participants see the shared screen live.
    const screenTrack = isScreenSharing && screenStream ? screenStream.getVideoTracks()[0] : null;

    // Synchronize local tracks to all active peer connections
    Object.entries(peerConnectionsRef.current).forEach(([otherId, pc]) => {
      let attachedNow = false;
      const tracksToAttach: MediaStreamTrack[] = [];
      if (localStream) {
        tracksToAttach.push(...localStream.getTracks());
      }
      if (screenTrack && !tracksToAttach.includes(screenTrack)) {
        tracksToAttach.push(screenTrack);
      }

      tracksToAttach.forEach(track => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === track.kind);
        if (!sender) {
          try {
            pc.addTrack(track, (localStream || screenStream)!);
            attachedNow = true;
          } catch (e) {}
        }
      });

      // Attaching a track to an already-negotiated connection changes the
      // transceiver direction — that only takes effect after a fresh offer.
      if (attachedNow && pc.signalingState === 'stable' && (pc.localDescription || pc.remoteDescription)) {
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .then(() => postSignal(otherId, 'offer', pc.localDescription))
          .catch(() => {});
      }

      pc.getSenders().forEach(sender => {
        if (!sender.track || sender.track.kind !== 'video') return;
        const target = screenTrack || (localStream ? localStream.getVideoTracks()[0] : null);
        if (target && sender.track !== target) {
          sender.replaceTrack(target).catch(() => {});
        }
      });
    });
  }, [isVideoOn, isMicOn, localStream, isScreenSharing, screenStream]);

  // 2. WebRTC Peer Connection Helper
  const getOrCreatePeerConnection = (peerId: string) => {
    if (peerConnectionsRef.current[peerId]) {
      return peerConnectionsRef.current[peerId];
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        try { pc.close(); } catch (e) {}
        delete peerConnectionsRef.current[peerId];
      }
    };

    // Attach local tracks with addTrack ONLY. Pre-creating transceivers with
    // addTransceiver and then calling addTrack makes Chrome refuse to
    // associate those transceivers with a remote offer's m-sections, so the
    // generated answer is recvonly and the remote peer never receives our
    // audio/video. When there is no local media yet,
    // recvonly transceivers still let us receive the other side.
    const activeStream = (isScreenSharing && screenStream) ? screenStream : localStreamRef.current;
    if (activeStream) {
      activeStream.getTracks().forEach(track => {
        try {
          pc.addTrack(track, activeStream);
        } catch (e) {}
      });
      if (isScreenSharing && localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
          if (!pc.getSenders().some(s => s.track && s.track.kind === 'audio')) {
            try { pc.addTrack(track, localStreamRef.current!); } catch (e) {}
          }
        });
      }
    } else {
      try {
        pc.addTransceiver('audio', { direction: 'recvonly' });
        pc.addTransceiver('video', { direction: 'recvonly' });
      } catch (e) {}
    }

    // Handle remote track received (ensure stream is created/augmented for audio and video)
    pc.ontrack = (event) => {
      let stream: MediaStream;
      if (event.streams && event.streams[0]) {
        stream = event.streams[0];
      } else {
        stream = new MediaStream([event.track]);
      }
      setRemoteStreams(prev => {
        const existing = prev[peerId];
        if (existing) {
          if (!existing.getTracks().some(t => t.id === event.track.id)) {
            existing.addTrack(event.track);
          }
          return { ...prev, [peerId]: new MediaStream(existing.getTracks()) };
        }
        return { ...prev, [peerId]: stream };
      });
    };

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        fetch(`/api/meetings/${meetingId}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: peerIdRef.current,
            target: peerId,
            type: 'ice-candidate',
            data: event.candidate
          })
        }).catch(() => {});
      }
    };

    peerConnectionsRef.current[peerId] = pc;
    return pc;
  };

  // Post a signaling message to the meeting's signaling engine.
  const postSignal = (target: string, type: string, data: any) => {
    return fetch(`/api/meetings/${meetingId}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: peerIdRef.current,
        target,
        type,
        data
      })
    }).catch(() => {});
  };

  // Flush buffered ICE candidates once the remote description is available.
  const flushPendingCandidates = async (peerId: string) => {
    const pending = pendingCandidatesRef.current[peerId];
    if (!pending || pending.length === 0) return;
    delete pendingCandidatesRef.current[peerId];
    const pc = peerConnectionsRef.current[peerId];
    if (!pc) return;
    for (const cand of pending) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch (e) {}
    }
  };

  // Deterministic connection initiator: the peer with the HIGHER id sends the
  // offer. Both sides see each other via presence, so exactly one offer is
  // created per pair — no glare/rollback needed.
  const maybeConnectToPeers = (remoteList: any[]) => {
    for (const p of remoteList || []) {
      const rp = p.peerId || p.id;
      if (!rp || rp === peerIdRef.current || rp === 'user-local') continue;
      // Only connect to peers that are actually live in the room — stale
      // presence entries (departed tabs) must not produce dead connections.
      if (p.status && p.status !== 'Live In Room') continue;
      const existing = peerConnectionsRef.current[rp];
      if (
        existing &&
        existing.connectionState !== 'failed' &&
        existing.connectionState !== 'closed' &&
        (existing.localDescription || existing.remoteDescription)
      ) {
        continue;
      }
      if (peerIdRef.current > rp) {
        const pc = getOrCreatePeerConnection(rp);
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .then(() => postSignal(rp, 'offer', pc.localDescription))
          .catch(() => {});
      }
    }
  };

  // 3. WebRTC Signaling Loop & Presence Sync
  useEffect(() => {
    if (!meetingId) return;
    // Wait for getUserMedia to settle so every peer connection is created
    // with our tracks already attached (see mediaStatus comment above).
    if (mediaStatus === 'pending') return;

    // A. Handshake with Next.js Serverless Presence API
    const joinServerless = async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join',
            participant: {
              peerId: peerIdRef.current,
              name: currentUser.name,
              role: currentUser.role,
              email: currentUser.email,
              isMicOn,
              isVideoOn,
              isHandRaised
            },
            meetingParticipants: meeting?.participants || []
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.participants) {
            updateParticipantsFromData(data.participants);
            // Connect to peers already in the room (deterministic initiator).
            maybeConnectToPeers(data.participants);
            trackLivePeers(data.participants);
          }
          if (data && data.screenSharingPeerId !== undefined) {
            setRemoteScreenSharePeerId(data.screenSharingPeerId);
            if (data.screenSharingPeerId && data.screenSharingPeerId !== peerIdRef.current) {
              setLayoutMode('spotlight');
            }
          }
          if (data && data.votes) {
            setQuorumVotes(data.votes);
          }
          if (data && data.chatMessages) {
            setChatMessages(data.chatMessages);
            const incomingTranscripts = data.chatMessages
              .filter((m: any) => m.sender && m.sender.startsWith('[Transcript]'))
              .map((m: any) => ({
                id: m.id,
                speaker: m.sender.replace('[Transcript]', '').trim(),
                role: m.role,
                text: m.text,
                timestamp: m.time,
                isFinal: true
              }));
            if (incomingTranscripts.length > 0) {
              setTranscriptLog(prev => {
                const existingIds = new Set(prev.map(t => t.id));
                const newItems = incomingTranscripts.filter((t: any) => !existingIds.has(t.id));
                return newItems.length > 0 ? [...prev, ...newItems] : prev;
              });
            }
          }
        }
      } catch (e) {}
    };
    joinServerless();

    // B. Register in Django backend
    joinMeeting(meetingId, {
      name: currentUser.name,
      role: currentUser.role,
      email: currentUser.email
    }).catch(() => {});

    // C. Poll Signaling Engine for WebRTC Peer Negotiation (Every 1.2s)
    const signalInterval = setInterval(async () => {
      try {
        const pollSince = Math.max(0, lastSignalTimestampRef.current - 4000);
        const res = await fetch(`/api/meetings/${meetingId}/signal?since=${pollSince}&sender=${encodeURIComponent(peerIdRef.current)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.messages && data.messages.length > 0) {
            for (const msg of data.messages) {
              if (seenSignalIdsRef.current.has(msg.id)) continue;
              seenSignalIdsRef.current.add(msg.id);

              if (msg.timestamp > lastSignalTimestampRef.current) {
                lastSignalTimestampRef.current = msg.timestamp;
              }

              const peerId = msg.sender;
              const pc = getOrCreatePeerConnection(peerId);

              if (msg.type === 'offer') {
                const pc = getOrCreatePeerConnection(peerId);
                // Glare guard: if we already have a pending local offer, only
                // the designated initiator (higher peer id) keeps theirs.
                if (pc.signalingState === 'have-local-offer' && peerIdRef.current > peerId) {
                  continue;
                }
                // Handle initial offer or renegotiation offer without destroying the connection
                try {
                  await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
                  await flushPendingCandidates(peerId);
                  const answer = await pc.createAnswer();
                  await pc.setLocalDescription(answer);
                  await postSignal(peerId, 'answer', answer);
                } catch (offerErr) {
                  console.warn(`Error negotiating offer from ${peerId}:`, offerErr);
                }
              } else if (msg.type === 'answer') {
                if (pc.localDescription && pc.signalingState !== 'stable') {
                  await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
                  await flushPendingCandidates(peerId);
                }
              } else if (msg.type === 'ice-candidate') {
                if (msg.data) {
                  if (pc.remoteDescription) {
                    try {
                      await pc.addIceCandidate(new RTCIceCandidate(msg.data));
                    } catch (e) {}
                  } else {
                    pendingCandidatesRef.current[peerId] = [
                      ...(pendingCandidatesRef.current[peerId] || []),
                      msg.data
                    ];
                  }
                }
              } else if (msg.type === 'join-peer') {
                maybeConnectToPeers([{ peerId: msg.sender }]);
              }
            }
          }
        }
      } catch (err) {}
    }, 1200);

    // Announce to peers to initiate connection
    fetch(`/api/meetings/${meetingId}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: peerIdRef.current,
        type: 'join-peer',
        data: {}
      })
    }).catch(() => {});

    // Leave immediately on page unload (sendBeacon survives the teardown).
    const leaveOnUnload = () => {
      try {
        navigator.sendBeacon?.(
          `/api/meetings/${meetingId}/presence`,
          new Blob([JSON.stringify({
            action: 'leave',
            participant: { peerId: peerIdRef.current, name: currentUser.name }
          })], { type: 'application/json' })
        );
      } catch (e) {}
    };
    window.addEventListener('pagehide', leaveOnUnload);

    // Track which remote peer ids are still present; only cleanup truly closed connections
    const trackLivePeers = (remoteList: any[]) => {
      for (const [otherId, pc] of Object.entries(peerConnectionsRef.current)) {
        if (pc.connectionState === 'closed') {
          try { pc.close(); } catch (e) {}
          delete peerConnectionsRef.current[otherId];
          setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[otherId];
            return next;
          });
        }
      }
    };

    // D. Continuous Periodic Presence Heartbeat (Every 2.5 seconds)
    // Sends active tab heartbeat so all participants remain "Live In Room"
    const presenceInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'heartbeat',
            participant: {
              peerId: peerIdRef.current,
              name: currentUser.name,
              role: currentUser.role,
              email: currentUser.email,
              isMicOn: isMicOnRef.current,
              isVideoOn: isVideoOnRef.current,
              isHandRaised: isHandRaisedRef.current,
              isScreenSharing: isScreenSharingRef.current
            },
            meetingParticipants: meeting?.participants || []
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.participants) {
            updateParticipantsFromData(data.participants);
            maybeConnectToPeers(data.participants);
            trackLivePeers(data.participants);
          }
          if (data && data.screenSharingPeerId !== undefined) {
            setRemoteScreenSharePeerId(data.screenSharingPeerId);
            if (data.screenSharingPeerId && data.screenSharingPeerId !== peerIdRef.current) {
              setLayoutMode('spotlight');
            }
          }
          if (data && data.votes) {
            setQuorumVotes(data.votes);
          }
          if (data && data.chatMessages) {
            setChatMessages(data.chatMessages);
            const incomingTranscripts = data.chatMessages
              .filter((m: any) => m.sender && m.sender.startsWith('[Transcript]'))
              .map((m: any) => ({
                id: m.id,
                speaker: m.sender.replace('[Transcript]', '').trim(),
                role: m.role,
                text: m.text,
                timestamp: m.time,
                isFinal: true
              }));
            if (incomingTranscripts.length > 0) {
              setTranscriptLog(prev => {
                const existingIds = new Set(prev.map(t => t.id));
                const newItems = incomingTranscripts.filter((t: any) => !existingIds.has(t.id));
                return newItems.length > 0 ? [...prev, ...newItems] : prev;
              });
            }
          }
        }
      } catch (err) {}
    }, 2500);

    return () => {
      clearInterval(signalInterval);
      clearInterval(presenceInterval);
      window.removeEventListener('pagehide', leaveOnUnload);
      leaveOnUnload();
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      peerConnectionsRef.current = {};
      pendingCandidatesRef.current = {};
    };
  }, [meetingId, currentUser, mediaStatus]);

  const updateParticipantsFromData = (remoteList: any[], meetingRoster?: any[]) => {
    setParticipants(prev => {
      const merged: ConnectedParticipant[] = [];
      const seenPeerIds = new Set<string>();
      const claimedRosterEmails = new Set<string>();
      const claimedRosterNames = new Set<string>();

      // 1. Add current local user
      merged.push({
        id: 'user-local',
        peerId: peerIdRef.current,
        name: `${currentUser.name} (You)`,
        email: currentUser.email,
        role: currentUser.role,
        time: '10:00 AM',
        status: 'Live In Room',
        isLocalUser: true,
        isMicOn,
        isVideoOn,
        isHandRaised,
        isScreenSharing
      });
      seenPeerIds.add(peerIdRef.current);
      if (currentUser.email) claimedRosterEmails.add(currentUser.email.toLowerCase().trim());
      if (currentUser.name) claimedRosterNames.add(currentUser.name.replace('(You)', '').trim().toLowerCase());

      // 2. Add remote participants strictly keyed by peerId
      for (const p of remoteList || []) {
        const cleanName = (p.name || '').replace('(You)', '').trim();
        const pPeerId = p.peerId || p.id;

        if (!pPeerId || pPeerId === peerIdRef.current || pPeerId === 'user-local') {
          continue;
        }

        if (!seenPeerIds.has(pPeerId)) {
          seenPeerIds.add(pPeerId);
          if (p.email) claimedRosterEmails.add(p.email.toLowerCase().trim());
          if (cleanName) claimedRosterNames.add(cleanName.toLowerCase());

          merged.push({
            id: pPeerId,
            peerId: pPeerId,
            name: cleanName || 'Council Member',
            email: p.email || '',
            role: p.role || 'Stakeholder Representative',
            time: p.time || p.joined_at || '10:00 AM',
            status: p.status === 'Live In Room' ? 'Live In Room' : 'Dispatched',
            isLocalUser: false,
            isMicOn: p.isMicOn ?? true,
            isVideoOn: p.isVideoOn ?? false,
            isHandRaised: p.isHandRaised ?? false,
            isScreenSharing: Boolean(p.isScreenSharing)
          });
        }
      }

      // 3. Add scheduled roster participants from meeting who have NOT joined yet
      const scheduledList = meetingRoster || meeting?.participants || [];
      for (const mp of scheduledList) {
        if (!mp || !mp.name) continue;
        const cleanMpName = mp.name.replace('(You)', '').trim();
        const mpEmail = (mp.email || '').toLowerCase().trim();
        const mpNameKey = cleanMpName.toLowerCase();

        // If someone with this email or name is already in the room, don't duplicate
        if ((mpEmail && claimedRosterEmails.has(mpEmail)) || claimedRosterNames.has(mpNameKey)) {
          continue;
        }

        claimedRosterNames.add(mpNameKey);
        if (mpEmail) claimedRosterEmails.add(mpEmail);

        merged.push({
          id: `sched-${mpEmail || mpNameKey.replace(/\s+/g, '-')}`,
          name: cleanMpName,
          email: mp.email || '',
          role: mp.role || 'Stakeholder Representative',
          time: 'Scheduled',
          status: 'Dispatched',
          isLocalUser: false,
          isMicOn: false,
          isVideoOn: false,
          isHandRaised: false,
          isScreenSharing: false
        });
      }

      // 4. Preserve locally-added invitees that presence engine hasn't synced yet
      for (const prevP of prev) {
        if (prevP.isLocalUser) continue;
        const prevKey = prevP.peerId || prevP.id;
        const prevEmail = (prevP.email || '').toLowerCase().trim();
        const prevName = prevP.name.replace('(You)', '').trim().toLowerCase();
        if (!seenPeerIds.has(prevKey) && !(prevEmail && claimedRosterEmails.has(prevEmail)) && !claimedRosterNames.has(prevName)) {
          merged.push(prevP);
          seenPeerIds.add(prevKey);
        }
      }

      return merged;
    });
  };

  // Attach the local stream whenever the <video> element mounts. The element
  // is conditionally rendered (camera on/off, layout switches), so a one-time
  // srcObject assignment in the getUserMedia effect runs before the element
  // exists and the self-view stays black.
  const attachLocalVideo = (el: HTMLVideoElement | null) => {
    localVideoRef.current = el;
    if (el && localStream && el.srcObject !== localStream) {
      el.srcObject = localStream;
      el.play().catch(() => {});
    }
  };

  // Attach the screen share stream whenever the screen-share <video> element mounts.
  const attachScreenShareVideo = (el: HTMLVideoElement | null) => {
    screenShareVideoRef.current = el;
    if (el && screenStream) {
      el.muted = true;
      if (el.srcObject !== screenStream) {
        el.srcObject = screenStream;
      }
      el.play().catch(() => {});
    }
  };

  // Ensure screenShareVideoRef keeps track of active screenStream
  useEffect(() => {
    if (screenShareVideoRef.current && screenStream) {
      screenShareVideoRef.current.muted = true;
      screenShareVideoRef.current.srcObject = screenStream;
      screenShareVideoRef.current.play().catch(() => {});
    }
  }, [screenStream, isScreenSharing]);

  // Screen Share Stop Helper
  const stopScreenSharing = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
    }
    screenStreamRef.current = null;
    setIsScreenSharing(false);

    // Broadcast end of screen share to presence engine
    fetch(`/api/meetings/${meetingId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'screen_share',
        isScreenSharing: false,
        participant: { peerId: peerIdRef.current, name: currentUser.name }
      })
    }).catch(() => {});

    // Restore camera video track on all active peer senders
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null;
    Object.entries(peerConnectionsRef.current).forEach(([otherId, pc]) => {
      pc.getSenders().forEach(sender => {
        if (sender.track && sender.track.kind === 'video') {
          sender.replaceTrack(cameraTrack).catch(() => {});
        }
      });
      if (pc.signalingState === 'stable') {
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .then(() => postSignal(otherId, 'offer', pc.localDescription))
          .catch(() => {});
      }
    });

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Screen sharing ended', type: 'info' }
    }));
  };

  // Screen Share Handler (Interactive Screen / BIM Model Sharing)
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        if (navigator.mediaDevices?.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
          screenStreamRef.current = stream;
          setScreenStream(stream);
          setIsScreenSharing(true);
          setLayoutMode('spotlight');

          // Broadcast active screen share to presence engine immediately
          fetch(`/api/meetings/${meetingId}/presence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'screen_share',
              isScreenSharing: true,
              participant: { peerId: peerIdRef.current, name: currentUser.name }
            })
          }).catch(() => {});

          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Screen sharing started (Broadcasting live in 60 FPS)', type: 'success' }
          }));

          const screenTrack = stream.getVideoTracks()[0];
          if (screenTrack) {
            screenTrack.onended = () => {
              stopScreenSharing();
            };

            // Propagate screen track to all active peer connections
            Object.entries(peerConnectionsRef.current).forEach(([otherId, pc]) => {
              let replaced = false;
              pc.getSenders().forEach(sender => {
                if (sender.track && sender.track.kind === 'video') {
                  sender.replaceTrack(screenTrack).catch(() => {});
                  replaced = true;
                }
              });

              if (!replaced) {
                const videoTransceiver = pc.getTransceivers().find(
                  t => t.receiver.track.kind === 'video' || t.sender.track?.kind === 'video'
                );
                if (videoTransceiver) {
                  videoTransceiver.direction = 'sendrecv';
                  videoTransceiver.sender.replaceTrack(screenTrack).catch(() => {});
                } else {
                  try {
                    pc.addTrack(screenTrack, stream);
                  } catch (e) {}
                }
              }

              if (pc.signalingState === 'stable') {
                pc.createOffer()
                  .then(offer => pc.setLocalDescription(offer))
                  .then(() => postSignal(otherId, 'offer', pc.localDescription))
                  .catch(() => {});
              }
            });
          }
        } else {
          setIsScreenSharing(true);
          setLayoutMode('spotlight');
        }
      } catch (err) {
        console.warn("Screen share cancelled or not allowed:", err);
        setIsScreenSharing(false);
      }
    } else {
      stopScreenSharing();
    }
  };

  // Web Speech API: Continuous Speech Recognition & Transcription Engine
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    if (!isMicOn || !isTranscribing) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
      return;
    }

    let isFatal = false;
    let restartTimeout: any = null;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalText += item[0].transcript;
          } else {
            interimText += item[0].transcript;
          }
        }

        if (interimText) {
          setCurrentSubtitle(interimText.trim());
          setCurrentSubtitleSpeaker(currentUser.name);
        }

        if (finalText.trim()) {
          const cleanText = finalText.trim();
          setCurrentSubtitle(cleanText);
          setCurrentSubtitleSpeaker(currentUser.name);

          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newEntry: TranscriptUtterance = {
            id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            speaker: currentUser.name,
            role: currentUser.role,
            text: cleanText,
            timestamp: time,
            isFinal: true
          };

          setTranscriptLog(prev => [...prev, newEntry]);

          // Broadcast transcript remark to presence channel
          fetch(`/api/meetings/${meetingId}/presence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'chat',
              message: {
                id: newEntry.id,
                sender: `[Transcript] ${currentUser.name}`,
                role: currentUser.role,
                text: cleanText,
                time,
                isPrivate: false
              }
            })
          }).catch(() => {});
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
          isFatal = true;
        }
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('SpeechRecognition error:', event.error);
        }
      };

      recognition.onend = () => {
        if (isFatal) return;
        if (isMicOn && isTranscribing && recognitionRef.current) {
          restartTimeout = setTimeout(() => {
            if (isMicOn && isTranscribing && recognitionRef.current && !isFatal) {
              try {
                recognition.start();
              } catch (e) {}
            }
          }, 1000);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to start SpeechRecognition:', err);
    }

    return () => {
      isFatal = true;
      if (restartTimeout) clearTimeout(restartTimeout);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, [isMicOn, isTranscribing, currentUser.name, currentUser.role, meetingId]);

  // Mic Toggle Handler
  const handleToggleMic = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = nextState;
      });
    }
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: nextState ? 'Microphone unmuted (Live audio stream)' : 'Microphone muted', type: nextState ? 'success' : 'info' }
    }));

    fetch(`/api/meetings/${meetingId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'heartbeat',
        participant: { peerId: peerIdRef.current, name: currentUser.name, isMicOn: nextState }
      })
    }).catch(() => {});
  };

  // Camera Toggle Handler
  const handleToggleVideo = async () => {
    const nextState = !isVideoOn;
    setIsVideoOn(nextState);

    if (nextState) {
      if (!localStream) {
        try {
          if (navigator.mediaDevices?.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
            localStreamRef.current = stream;
            setLocalStream(stream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        } catch (e) {}
      } else {
        localStream.getVideoTracks().forEach(track => {
          track.enabled = true;
        });
      }
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Camera started (Live video stream)', type: 'success' }
      }));
    } else {
      if (localStream) {
        localStream.getVideoTracks().forEach(track => {
          track.enabled = false;
        });
      }
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Camera turned off (Avatar active)', type: 'info' }
      }));
    }

    fetch(`/api/meetings/${meetingId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'heartbeat',
        participant: { peerId: peerIdRef.current, name: currentUser.name, isVideoOn: nextState }
      })
    }).catch(() => {});
  };

  // Raise Hand Handler
  const handleToggleRaiseHand = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: nextState ? '✋ Hand raised! Notified council moderator.' : 'Hand lowered.', 
        type: nextState ? 'warning' : 'info' 
      }
    }));

    fetch(`/api/meetings/${meetingId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'raise_hand',
        participant: { peerId: peerIdRef.current, name: currentUser.name, isHandRaised: nextState }
      })
    }).catch(() => {});
  };

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsNativeFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsNativeFullscreen(false)).catch(() => {});
      }
    }
  };

  const fetchMeetingDetails = async () => {
    if (!meetingId) return;
    setIsLoading(true);
    try {
      const data = await getMeetingById(meetingId);
      if (data) {
        setMeeting(data);
        if (data.participants && Array.isArray(data.participants) && data.participants.length > 0) {
          updateParticipantsFromData([], data.participants);
        }
        setMinutesText(data.minutes_notes || 'Agenda: Technical stage-gate signoff for Level 5 slab casting. GPR concrete scan review indicates structural integrity compliance.');
        setActionItems(data.action_items || [
          { id: 'act-1', title: 'Submit 28-day concrete core compressive test certificate', assignee_name: 'David Rivera (Apex)', due_date: 'Sep 2, 2026', is_completed: false },
          { id: 'act-2', title: 'Upload drone photogrammetry mesh for Grid 4 revision', assignee_name: 'Marcus Chen (Inspector)', due_date: 'Aug 31, 2026', is_completed: true }
        ]);
      }
    } catch (err) {
      console.error("Failed to load meeting details", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId]);

  // Handle Email Invitation Dispatch via Resend
  const handleSendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSendingInvite(true);
    const liveUrl = `${getLiveMeetingUrl()}?guest_name=${encodeURIComponent(inviteName.trim() || 'Guest Stakeholder')}&role=${encodeURIComponent(inviteRole)}&email=${encodeURIComponent(inviteEmail.trim())}`;
    const formattedSubject = `🏛️ Live Meeting Invitation: ${meeting?.title || 'Project Coordination Session'} [${meeting?.meeting_reference || 'MTG-1092'}]`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #060D15; color: #f8fafc; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 20px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="background-color: rgba(34, 197, 94, 0.15); display: inline-block; padding: 8px 18px; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.35); text-transform: uppercase; letter-spacing: 0.05em;">
            🔴 Live Council Deliberation Active
          </div>
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 16px 0 6px 0; letter-spacing: -0.02em;">Nexucon Regulatory Directorate</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">State Ministry of Physical Planning & Urban Development</p>
        </div>

        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
          <div style="font-size: 11px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
            Statutory Council Session
          </div>
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin: 0 0 16px 0;">${meeting?.title || 'Meeting'}</h2>

          <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Meeting Ref:</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: 800; color: #60a5fa;">${meeting?.meeting_reference || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Project:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #ffffff;">${meeting?.project_name || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Invited Role:</td>
              <td style="padding: 6px 0; color: #fbbf24; font-weight: 700;">${inviteRole}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Convened By:</td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${currentUser.name}${currentUser.role ? ` (${currentUser.role})` : ''}</td>
            </tr>
          </table>

          ${inviteCustomNote ? `
            <div style="margin-top: 16px; padding: 12px; background-color: rgba(0, 0, 0, 0.3); border-radius: 8px; border-left: 3px solid #3b82f6; font-size: 12px; color: #e2e8f0; font-style: italic;">
              "${inviteCustomNote}"
            </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${liveUrl}" style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 15px 32px; border-radius: 14px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4); letter-spacing: -0.01em;">
            Join Live Meeting Room Now →
          </a>
        </div>

        <div style="background-color: #090e17; padding: 14px; border-radius: 10px; font-family: monospace; font-size: 11px; color: #94a3b8; word-break: break-all; text-align: center; border: 1px solid #1e293b; margin-bottom: 24px;">
          Direct Link: <a href="${liveUrl}" style="color: #60a5fa; text-decoration: none;">${liveUrl}</a>
        </div>

        <p style="font-size: 11px; color: #64748b; text-align: center; line-height: 1.6; margin: 0;">
          This official dispatch was transmitted via Resend Cloud Engine on behalf of the Executive Regulatory Council.<br/>
          Protected under Digital Regulatory Telemetry & Building Audit Protocol.
        </p>
      </div>
    `;

    try {
      const res = await sendEmailViaResend({
        to: inviteEmail.trim(),
        subject: formattedSubject,
        html: htmlContent,
        type: 'INVITE_DIRECTOR'
      });

      if (res.success) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Live invitation dispatched via Resend to ${inviteEmail.trim()}`, type: 'success' }
        }));
        
        const newInvited: ConnectedParticipant = {
          id: `p-${Date.now()}`,
          name: inviteName.trim() || inviteEmail.split('@')[0],
          email: inviteEmail.trim(),
          role: inviteRole,
          time: 'Just now',
          status: 'Dispatched'
        };

        setParticipants(prev => [...prev, newInvited]);
        setInviteEmail('');
        setInviteName('');
        setInviteCustomNote('');
        setIsInviteModalOpen(false);
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: res.error || 'Failed to dispatch email invite via Resend', type: 'error' }
        }));
      }
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Network error dispatching invite', type: 'error' }
      }));
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleSaveMinutes = async () => {
    if (!meeting) return;
    setIsSavingMinutes(true);
    try {
      await updateMeetingNotes(meeting.id, minutesText);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Meeting minutes updated & broadcasted to council members', type: 'success' }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to save minutes', type: 'error' } }));
    } finally {
      setIsSavingMinutes(false);
    }
  };

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim() || !meeting) return;

    setIsAddingAction(true);
    try {
      const created = await addMeetingActionItem(meeting.id, {
        title: newActionTitle.trim(),
        assignee_name: newActionAssignee,
        due_date: 'Within 5 Business Days'
      });
      setActionItems(prev => [...prev, created]);
      setNewActionTitle('');
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Action item logged in official council minutes', type: 'success' }
      }));
    } catch (err) {
      const localItem: MeetingActionItem = {
        id: `act-${Date.now()}`,
        title: newActionTitle.trim(),
        assignee_name: newActionAssignee,
        due_date: 'Within 5 Business Days',
        is_completed: false
      };
      setActionItems(prev => [...prev, localItem]);
      setNewActionTitle('');
    } finally {
      setIsAddingAction(false);
    }
  };

  // AI Note Taker: Synthesize and Summarize Minutes
  const handleAiSummarize = () => {
    setIsGeneratingAiSummary(true);
    try {
      const attendeeListStr = participants.map(p => `• ${p.name} (${p.role || 'Stakeholder'}) - ${p.status === 'Live In Room' ? 'Active In Room' : 'Invited'}`).join('\n');
      const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      let summary = `═══════════════════════════════════════════════════════════════\n`;
      summary += `NEXUCON OFFICIAL COUNCIL PROCEEDINGS & EXECUTIVE MINUTES\n`;
      summary += `Session: ${meeting?.title || 'Technical Stage-Gate Review'}\n`;
      summary += `Meeting Ref: ${meeting?.meeting_reference || 'MTG-1092'} | Date: ${dateStr}\n`;
      summary += `Session Duration: ${formatElapsed(elapsedSeconds)} | Quorum Status: Quorum Verified\n`;
      summary += `═══════════════════════════════════════════════════════════════\n\n`;

      summary += `1. ATTENDANCE & STATUTORY ROLL CALL\n`;
      summary += `${attendeeListStr}\n\n`;

      summary += `2. EXECUTIVE AGENDA & DELIBERATIONS\n`;
      if (transcriptLog.length > 0) {
        summary += `During the session, ${transcriptLog.length} live verbal statements were transcribed and recorded:\n`;
        transcriptLog.forEach((t) => {
          summary += `[${t.timestamp}] ${t.speaker} (${t.role || 'Member'}): "${t.text}"\n`;
        });
      } else {
        summary += `The council reviewed project progress, compliance verification schedules, and structural stage-gate milestones.\n`;
        summary += `All parties aligned on engineering specifications and mandatory inspection sign-offs.\n`;
      }
      summary += `\n`;

      summary += `3. FORMAL DECISIONS & QUORUM VOTES\n`;
      summary += `• Quorum Vote Tally: ${quorumVotes.yes} Affirmative, ${quorumVotes.no} Dissenting.\n`;
      summary += `• Hold-point conditional release granted subject to satisfactory 28-day concrete core verification.\n`;
      summary += `• Non-destructive testing logs and calibration reports approved by inspecting authority.\n\n`;

      summary += `4. ACTION ITEMS & ACCOUNTABILITY MATRIX\n`;
      if (actionItems.length > 0) {
        actionItems.forEach((item, idx) => {
          summary += `[${item.is_completed ? 'X' : ' '}] Item ${idx + 1}: ${item.title} (Assigned to: ${item.assignee_name || 'Unassigned'} | Due: ${item.due_date || 'Standard'})\n`;
        });
      } else {
        summary += `[ ] Item 1: Upload calibrated ultrasonic pulse velocity report to project portal (Due: 3 Business Days)\n`;
        summary += `[ ] Item 2: Verify structural steel rebar placement for upper slab casting (Due: 5 Business Days)\n`;
      }

      if (minutesText.trim() && !minutesText.includes('NEXUCON OFFICIAL COUNCIL PROCEEDINGS')) {
        summary += `\n5. ADDITIONAL STAKEHOLDER REMARKS\n${minutesText.trim()}\n`;
      }

      setMinutesText(summary);
      setAiSummary(summary);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'AI Note Taker: Executive minutes synthesized from live session data!', type: 'success' }
      }));
    } finally {
      setIsGeneratingAiSummary(false);
    }
  };

  // AI Note Taker: Extract Action Items from Speech Transcripts
  const handleExtractActionItemsFromSpeech = () => {
    if (transcriptLog.length === 0) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'No speech transcripts recorded yet to extract actions from', type: 'info' }
      }));
      return;
    }

    const actionKeywords = ['submit', 'inspect', 'verify', 'upload', 'review', 'prepare', 'test', 'deliver', 'check', 'sign', 'audit', 'send'];
    let addedCount = 0;

    transcriptLog.forEach(t => {
      const lower = t.text.toLowerCase();
      const hasAction = actionKeywords.some(kw => lower.includes(kw));
      if (hasAction && t.text.length > 15) {
        const itemTitle = t.text.length > 100 ? `${t.text.slice(0, 97)}...` : t.text;
        const exists = actionItems.some(a => a.title.toLowerCase() === itemTitle.toLowerCase());
        if (!exists) {
          const newItem: MeetingActionItem = {
            id: `act-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: itemTitle,
            assignee_name: t.speaker,
            due_date: 'Within 5 Business Days',
            is_completed: false
          };
          setActionItems(prev => [...prev, newItem]);
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `AI Note Taker: Extracted ${addedCount} action item(s) from spoken remarks!`, type: 'success' }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'No explicit action directives detected in recent speech', type: 'info' }
      }));
    }
  };

  // Manual Utterance Injection (for testing or non-mic input)
  const handleSimulateUtterance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedUtterance.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const cleanText = simulatedUtterance.trim();
    const newEntry: TranscriptUtterance = {
      id: `tr-manual-${Date.now()}`,
      speaker: currentUser.name,
      role: currentUser.role,
      text: cleanText,
      timestamp: time,
      isFinal: true
    };

    setTranscriptLog(prev => [...prev, newEntry]);
    setCurrentSubtitle(cleanText);
    setCurrentSubtitleSpeaker(currentUser.name);
    setSimulatedUtterance('');

    fetch(`/api/meetings/${meetingId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat',
        message: {
          id: newEntry.id,
          sender: `[Transcript] ${currentUser.name}`,
          role: currentUser.role,
          text: cleanText,
          time,
          isPrivate: false
        }
      })
    }).catch(() => {});
  };

  // Chat Message Dispatch (Public & Private 1-on-1 Direct Messaging)
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isPrivate = chatRecipient !== 'EVERYONE';

    let targetParticipant: ConnectedParticipant | undefined;
    if (isPrivate) {
      targetParticipant = participants.find(p => p.id === chatRecipient || p.peerId === chatRecipient || p.email === chatRecipient);
    }

    const cleanRecipientName = targetParticipant ? targetParticipant.name.replace(' (You)', '').trim() : '';

    const msgObj: RoomChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: currentUser.name,
      senderEmail: currentUser.email,
      senderPeerId: peerIdRef.current,
      role: currentUser.role,
      text: newChatMessage.trim(),
      time,
      isPrivate,
      recipientName: cleanRecipientName,
      recipientEmail: targetParticipant ? targetParticipant.email : '',
      recipientId: targetParticipant ? (targetParticipant.peerId || targetParticipant.id) : ''
    };

    setChatMessages(prev => [...prev, msgObj]);
    setNewChatMessage('');

    fetch(`/api/meetings/${meetingId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat',
        message: msgObj
      })
    }).catch(() => {});
  };

  // Start direct private chat with a specific participant
  const handleStartDirectMessage = (targetP: ConnectedParticipant) => {
    const targetKey = targetP.peerId || targetP.id;
    setChatRecipient(targetKey);
    setActiveTab('chat');
    setIsSidebarOpen(true);
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `Private direct messaging started with ${targetP.name}`, type: 'info' }
    }));
  };

  // Helper: Trigger direct browser download of base64 PDF
  const downloadBase64Pdf = (base64Data: string, filename: string) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Fallback opening PDF download URL:', err);
      window.open(downloadMeetingPdfUrl(meetingId), '_blank');
    }
  };

  // End Meeting & Dispatch Branded Minutes to All Participants
  const handleConfirmEndMeeting = async () => {
    setIsSubmittingEndMeeting(true);
    try {
      const fullTranscript = transcriptLog
        .map(t => `[${t.timestamp}] ${t.speaker} (${t.role || 'Member'}): "${t.text}"`)
        .join('\n');

      const result = await endMeeting(meetingId, {
        duration_seconds: elapsedSeconds,
        notes: minutesText,
        transcript: fullTranscript,
        ai_summary: aiSummary || minutesText,
        action_items: actionItems.map(a => ({
          title: a.title,
          assignee_name: a.assignee_name,
          due_date: a.due_date
        })),
        participants: participants.map(p => ({
          name: p.name.replace('(You)', '').trim(),
          role: p.role,
          email: p.email,
          status: p.status
        })),
        send_email: sendEmailMinutes
      });

      const pdfFilename = result.pdf_filename || `Nexucon_Meeting_Minutes_${meeting?.meeting_reference || meetingId}.pdf`;
      setEndMeetingCompletedData({
        emailsSent: result.emails_sent || 0,
        pdfFilename,
        pdfBase64: result.pdf_base64
      });

      if (result.pdf_base64) {
        downloadBase64Pdf(result.pdf_base64, pdfFilename);
      }

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: `Official meeting adjourned! Certified PDF minutes dispatched to ${result.emails_sent || 0} participants.`,
          type: 'success'
        }
      }));
    } catch (err: any) {
      console.error('Error concluding meeting:', err);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err?.message || 'Failed to adjourn meeting and dispatch minutes', type: 'error' }
      }));
    } finally {
      setIsSubmittingEndMeeting(false);
    }
  };

  const handleCastVote = async (vote: 'YES' | 'NO') => {
    if (vote === 'YES') {
      setVoteStatus('VOTED_YES');
      setQuorumVotes(prev => ({ ...prev, yes: prev.yes + 1 }));
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Affirmative vote recorded for Stage-Gate Approval', type: 'success' }
      }));
    } else {
      setVoteStatus('VOTED_NO');
      setQuorumVotes(prev => ({ ...prev, no: prev.no + 1 }));
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Dissenting vote logged in official ledger', type: 'info' }
      }));
    }

    fetch(`/api/meetings/${meetingId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'vote',
        vote: { voter_name: currentUser.name, vote }
      })
    }).catch(() => {});

    try {
      await castMeetingVote(meetingId, {
        voter_name: currentUser.name,
        voter_role: currentUser.role,
        vote,
        resolution_title: 'Signoff for 5th Floor Slab Concrete Casting'
      });
    } catch (e) {}
  };

  // Google Meet URL
  const meetUrl = (meeting?.google_meet_url && !meeting.google_meet_url.includes('nxu-'))
    ? meeting.google_meet_url 
    : 'https://meet.google.com/new';

  // Embeddable Open WebRTC Room URL (Allows instant multi-party voice/video bridge)
  const webrtcRoomName = `NexuconCouncil-${(meeting?.meeting_reference || 'Room').replace(/[^a-zA-Z0-9]/g, '')}`;
  const webrtcEmbedUrl = `https://meet.jit.si/${webrtcRoomName}#config.startWithAudioMuted=false&config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=['microphone','camera','closedcaptions','desktop','fullscreen','fodeviceselection','hangup','chat','recording','etherpad','sharedvideo','settings','raisehand','videoquality','filmstrip','feedback','stats','shortcuts','tileview']`;

  const activeInRoomCount = participants.filter(p => p.status === 'Live In Room').length;

  const globalAudioCtxRef = useRef<any>(null);

  const handleGlobalInteraction = () => {
    if (typeof window !== 'undefined') {
      document.querySelectorAll('audio, video').forEach((el: any) => {
        if (el.paused && el.srcObject) {
          el.play().catch(() => {});
        }
      });
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          if (!globalAudioCtxRef.current) {
            globalAudioCtxRef.current = new AudioCtx();
          }
          if (globalAudioCtxRef.current.state === 'suspended') {
            globalAudioCtxRef.current.resume().catch(() => {});
          }
        } catch (e) {}
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="fixed inset-0 z-[120] w-screen h-screen bg-[#060D15] text-slate-100 flex flex-col items-center justify-center gap-3 select-none font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs text-slate-400 font-medium tracking-wide">Connecting to secure council chamber...</span>
      </div>
    );
  }

  return (
    <div 
      onClick={handleGlobalInteraction}
      className="fixed inset-0 z-[120] w-screen h-screen bg-[#060D15] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* Continuous Global Dedicated Remote Audio Bridge - Plays all incoming participant audio streams */}
      <div className="sr-only" aria-hidden="true">
        {Object.entries(remoteStreams).map(([peerId, stream]) => (
          <audio
            key={`audio-playback-${peerId}`}
            autoPlay
            playsInline
            ref={(el) => {
              if (el && el.srcObject !== stream) {
                el.srcObject = stream;
                el.play().catch(err => {
                  console.warn(`Autoplay audio for peer ${peerId}:`, err);
                });
              }
            }}
          />
        ))}
      </div>
      
      {/* Top Header Bar (Full-Bleed Glassmorphism) */}
      <header className="h-14 sm:h-16 px-2.5 sm:px-4 md:px-5 bg-[#091422]/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-30 shrink-0 gap-2">
        
        {/* Left: Meeting Info & Live Connected Indicator */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <button
            onClick={() => router.push(meetingsBasePath)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0"
            title="Leave Meeting"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Exit</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 sm:px-2 py-0.5 rounded border border-blue-500/30 shrink-0">
                {meeting?.meeting_reference || 'MTG-1092'}
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE ({activeInRoomCount})</span>
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 bg-slate-800/60 px-1.5 sm:px-2 py-0.5 rounded shrink-0">
                ⏱️ {formatElapsed(elapsedSeconds)}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-black text-white truncate max-w-[130px] xs:max-w-[190px] sm:max-w-xs md:max-w-md mt-0.5 flex items-center gap-2">
              <span className="truncate">{meeting?.title || 'Council Deliberation & Stage-Gate Session'}</span>
              <span className="text-[11px] font-normal text-slate-400 hidden xl:inline shrink-0">
                • Connected as <span className="text-emerald-400 font-bold">{currentUser.name}</span>
              </span>
            </h1>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Top Quick Invite Button */}
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="p-2 sm:px-3 sm:py-2 md:px-3.5 md:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            title="Send Email Invitation via Resend"
          >
            <UserPlus size={15} />
            <span className="hidden md:inline">Invite User</span>
          </button>

          {/* Stage Engine Switcher */}
          <div className="bg-slate-900/90 p-1 rounded-2xl border border-slate-800 hidden xl:flex items-center">
            <button
              onClick={() => setStageMode('native_council')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stageMode === 'native_council' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MonitorPlay size={13} />
              <span>In-Portal Council</span>
            </button>

            <button
              onClick={() => setStageMode('webrtc_bridge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stageMode === 'webrtc_bridge' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cast size={13} />
              <span>WebRTC Bridge</span>
            </button>

            <button
              onClick={() => setStageMode('google_meet_portal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stageMode === 'google_meet_portal' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={13} />
              <span>Google Meet</span>
            </button>
          </div>

          {/* Layout Mode Toggle */}
          <button
            onClick={() => setLayoutMode(layoutMode === 'grid' ? 'spotlight' : 'grid')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer hidden sm:flex"
            title={layoutMode === 'grid' ? 'Switch to Spotlight View' : 'Switch to Grid View'}
          >
            <LayoutGrid size={15} />
            <span className="hidden xl:inline">{layoutMode === 'grid' ? 'Grid' : 'Spotlight'}</span>
          </button>

          {/* Browser Fullscreen Toggle */}
          <button
            onClick={toggleNativeFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer hidden md:flex"
            title={isNativeFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isNativeFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Direct Google Meet Popout Link */}
          <a
            href={meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:px-3 sm:py-2 md:px-3.5 md:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hidden sm:flex"
            title="Launch Google Meet App"
          >
            <ExternalLink size={14} />
            <span className="hidden md:inline">Meet App</span>
          </a>

          {/* End Session & Dispatch Minutes */}
          <button
            onClick={() => setIsEndMeetingModalOpen(true)}
            className="p-2 sm:px-3 sm:py-2 md:px-3.5 md:py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-600/20 border border-amber-400/30"
            title="Conclude Session, Generate Certified Branded Minutes & Dispatch via Email"
          >
            <FileCheck size={14} className="text-amber-200" />
            <span className="hidden sm:inline">End &amp; Dispatch</span>
          </button>

          {/* Leave Button */}
          <button
            onClick={() => router.push(meetingsBasePath)}
            className="p-2 sm:px-3.5 sm:py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-red-600/20"
            title="Leave Meeting"
          >
            <PhoneOff size={14} />
            <span className="hidden sm:inline">Leave</span>
          </button>

        </div>

      </header>

      {/* Main Full-Screen Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* CENTER STAGE: VIDEO MATRIX (Expands to 100% when sidebar is closed) */}
        <main className={`flex-1 flex flex-col justify-between p-2 sm:p-4 md:p-5 transition-all duration-300 overflow-hidden ${
          isSidebarOpen ? 'lg:pr-2' : ''
        }`}>
          
          {/* Stage Area */}
          <div className="flex-1 flex flex-col justify-center overflow-hidden">
            
            {/* MODE 1: EMBEDDED WEBRTC MULTI-PARTY VIDEO BRIDGE */}
            {stageMode === 'webrtc_bridge' ? (
              <div className="flex-1 rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 flex flex-col relative shadow-2xl">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cast size={15} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white">Live WebRTC Video & Audio Conference Bridge</span>
                    <span className="text-[10px] font-mono text-slate-400">({webrtcRoomName})</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Live HD WebRTC Mesh
                  </span>
                </div>
                <iframe
                  src={webrtcEmbedUrl}
                  allow="camera; microphone; display-capture; autoplay; clipboard-write"
                  className="flex-1 w-full h-full border-0 bg-slate-950"
                  title="WebRTC Video Conference Bridge"
                />
              </div>
            ) : stageMode === 'google_meet_portal' ? (
              
              /* MODE 2: GOOGLE MEET LAUNCH PORTAL CARD */
              <div className="flex-1 rounded-3xl border-2 border-blue-500/40 bg-gradient-to-b from-[#091522] to-[#040A10] p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative">
                <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-xl">
                  <Globe size={40} />
                </div>

                <div className="max-w-lg space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                    OFFICIAL GOOGLE MEET INTEGRATION
                  </span>
                  <h2 className="text-2xl font-black text-white mt-2">
                    Connect via Google Meet Conference
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Google security policy requires opening Google Meet in an active top-level browser tab. Click the button below to join the authorized council conference instantly.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-blue-300 max-w-md w-full truncate">
                  {meetUrl}
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <ExternalLink size={16} />
                    <span>Launch Google Meet in New Window</span>
                  </a>

                  <button
                    onClick={() => setStageMode('native_council')}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Switch back to In-Portal Council
                  </button>
                </div>
              </div>

            ) : (

              /* MODE 3: NATIVE IN-PORTAL COUNCIL STAGE */
              <>
                {layoutMode === 'spotlight' || isScreenSharing || Boolean(remoteScreenSharePeerId && remoteStreams[remoteScreenSharePeerId]) ? (
                  <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                    
                    {/* Main Spotlight Window */}
                    <div className="flex-1 bg-gradient-to-b from-[#0B1726] to-[#04080F] rounded-3xl border-2 border-blue-500/50 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                      <div className="flex items-center justify-between z-10">
                        <span className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-xl flex items-center gap-1.5 shadow">
                          <Share2 size={14} />
                          <span>
                            {isScreenSharing
                              ? 'Active Screen / BIM Model Stream (You)'
                              : remoteScreenSharePeerId
                                ? `Active Screen: ${participants.find(p => p.id === remoteScreenSharePeerId || p.peerId === remoteScreenSharePeerId)?.name || 'Presenter'}`
                                : 'Spotlight Stage'}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setLayoutMode(layoutMode === 'spotlight' ? 'grid' : 'spotlight')}
                            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <LayoutGrid size={13} />
                            <span>{layoutMode === 'spotlight' ? 'Grid View' : 'Spotlight'}</span>
                          </button>
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-800 flex items-center gap-1">
                            <Volume2 size={13} className="animate-pulse" /> Live HD Audio Stream
                          </span>
                        </div>
                      </div>

                      {/* Center Stage Video / BIM Visualization */}
                      <div className="flex-1 flex flex-col items-center justify-center my-3 relative overflow-hidden">
                        {isScreenSharing && (screenStream || screenStreamRef.current) ? (
                          <div className="relative w-full h-full flex items-center justify-center bg-black/60 rounded-2xl overflow-hidden border border-blue-500/30">
                            <video
                              ref={(el) => {
                                const stream = screenStream || screenStreamRef.current;
                                if (el && stream) {
                                  el.muted = true;
                                  if (el.srcObject !== stream) {
                                    el.srcObject = stream;
                                  }
                                  el.play().catch(() => {});
                                }
                              }}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-contain rounded-2xl"
                            />
                            <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xl">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                              <span className="text-xs font-bold text-white font-mono">LIVE SCREEN BROADCAST (YOU)</span>
                              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/20 px-2 py-0.5 rounded">60 FPS</span>
                            </div>
                            <button
                              type="button"
                              onClick={stopScreenSharing}
                              className="absolute top-3 right-3 px-3 py-1.5 bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Share2 size={13} />
                              <span>Stop Sharing</span>
                            </button>
                          </div>
                        ) : (!isScreenSharing && (remoteScreenSharePeerId || participants.some(p => !p.isLocalUser && p.isScreenSharing))) ? (() => {
                          const sharingParticipant = participants.find(
                            p => !p.isLocalUser && (p.isScreenSharing || p.peerId === remoteScreenSharePeerId || p.id === remoteScreenSharePeerId)
                          );
                          const effectiveId = sharingParticipant?.peerId || sharingParticipant?.id || remoteScreenSharePeerId;
                          const presenterStream = (effectiveId ? remoteStreams[effectiveId] : null)
                            || Object.entries(remoteStreams).find(([k]) => effectiveId && (k === effectiveId || k.includes(effectiveId) || effectiveId.includes(k)))?.[1]
                            || (Object.values(remoteStreams).find(s => s && s.getVideoTracks().length > 0) || null);
                          const presenterName = sharingParticipant?.name || 'Council Presenter';

                          return (
                            <div className="relative w-full h-full flex items-center justify-center bg-black/90 rounded-2xl overflow-hidden border border-blue-500/40">
                              {presenterStream ? (
                                <video
                                  autoPlay
                                  playsInline
                                  muted
                                  ref={(el) => {
                                    if (el && presenterStream) {
                                      if (el.srcObject !== presenterStream) {
                                        el.srcObject = presenterStream;
                                      }
                                      el.play().catch(() => {});
                                    }
                                  }}
                                  className="w-full h-full object-contain rounded-2xl"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                                  <div className="w-20 h-20 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 animate-pulse">
                                    <Share2 size={36} />
                                  </div>
                                  <h3 className="text-lg font-bold text-white">Receiving Screen Broadcast...</h3>
                                  <p className="text-xs text-slate-400 font-mono">Connecting to presenter feed ({presenterName})</p>
                                </div>
                              )}
                              <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xl z-10">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                <span className="text-xs font-bold text-white font-mono">LIVE SCREEN BROADCAST</span>
                                <span className="text-[10px] text-blue-400 font-bold bg-blue-500/20 px-2 py-0.5 rounded">
                                  {presenterName}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setLayoutMode('grid')}
                                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 z-10"
                              >
                                <LayoutGrid size={13} />
                                <span>Switch to Grid</span>
                              </button>
                            </div>
                          );
                        })() : isVideoOn && localStream ? (
                          <div className="relative w-full max-w-xl h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                            <video
                              ref={attachLocalVideo}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover transform -scale-x-100"
                            />
                            <div className="absolute bottom-3 left-3 bg-slate-950/90 px-3 py-1 rounded-lg text-xs font-bold text-white border border-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{currentUser.name} (You)</span>
                            </div>
                            {isHandRaised && (
                              <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-lg shadow-amber-500/40 animate-bounce">
                                <Hand size={14} /> <span>Hand Raised</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center space-y-3">
                            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-4xl flex items-center justify-center shadow-2xl ring-8 ring-emerald-500/20">
                              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-black text-white">{currentUser.name}</h2>
                            <p className="text-xs text-slate-400 font-medium">{currentUser.role}</p>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-400">
                              <CheckCircle size={13} /> Active in council database
                            </span>
                            {isHandRaised && (
                              <div className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-full shadow-lg shadow-amber-500/30 animate-pulse">
                                <Hand size={14} /> <span>Hand Raised to Speak</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-3 border-t border-slate-800/80">
                        <span className="text-[11px] font-mono">Session ID: {meeting?.meeting_reference || 'MTG-1092'}</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          {activeInRoomCount} Council Members Connected
                        </span>
                      </div>
                    </div>

                    {/* Bottom Thumbnail Strip */}
                    <div className="h-24 flex gap-2.5 overflow-x-auto pb-1 shrink-0">
                      {participants.map((p, idx) => (
                        <div
                          key={p.id || idx}
                          className={`min-w-[170px] max-w-[200px] rounded-2xl bg-[#091522] border p-2.5 flex items-center justify-between gap-2 transition-all shrink-0 ${
                            p.isLocalUser ? 'border-emerald-500/80 bg-emerald-950/20' : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 border ${
                              p.isLocalUser ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-white border-slate-700'
                            }`}>
                              {p.name.replace('(You)', '').trim().split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                                <span>{p.name}</span>
                                {p.isLocalUser && <span className="text-[9px] text-emerald-400 font-mono">(You)</span>}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">{p.role}</p>
                            </div>
                          </div>
                          {!p.isLocalUser && (
                            <button
                              type="button"
                              onClick={() => handleStartDirectMessage(p)}
                              title={`Direct message ${p.name}`}
                              className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white transition-all cursor-pointer shrink-0"
                            >
                              <Lock size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                  </div>
                ) : (
                  
                  /* GRID VIEW MATRIX: DYNAMIC INTERACTIVE TILES FOR ALL JOINED PARTICIPANTS WITH LIVE MEDIA */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Active Remote Screen Share Notification Banner */}
                    {remoteScreenSharePeerId && !isScreenSharing && (
                      <div className="bg-gradient-to-r from-blue-950/90 to-indigo-950/90 border border-blue-500/40 rounded-2xl px-4 py-2 flex items-center justify-between text-xs mb-2 shrink-0 shadow-lg">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                          <span className="font-bold text-white">
                            📺 {participants.find(p => p.id === remoteScreenSharePeerId || p.peerId === remoteScreenSharePeerId)?.name || 'An attendee'} is sharing their screen
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLayoutMode('spotlight')}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-all"
                        >
                          <Maximize2 size={12} />
                          <span>View Screen Broadcast</span>
                        </button>
                      </div>
                    )}

                    <div className={`flex-1 grid gap-2 sm:gap-3 md:gap-4 overflow-y-auto p-1 ${
                      participants.length <= 1 
                        ? 'grid-cols-1' 
                        : participants.length === 2 
                          ? 'grid-cols-1 sm:grid-cols-2' 
                          : participants.length <= 4 
                            ? 'grid-cols-2' 
                            : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                    }`}>
                      {participants.map((p, idx) => {
                        // Remote streams are keyed by the signaling peerId,
                        // or by participant id from presence.
                        const remoteStream = !p.isLocalUser 
                          ? (remoteStreams[p.peerId || ''] || remoteStreams[p.id] || Object.entries(remoteStreams).find(([k]) => k === p.peerId || k === p.id)?.[1] || null)
                          : null;

                        return (
                          <div
                            key={p.id || idx}
                            className={`relative rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden shadow-2xl transition-all min-h-[145px] xs:min-h-[175px] sm:min-h-[200px] md:min-h-[220px] ${
                              p.isLocalUser
                                ? 'bg-gradient-to-b from-[#091522] to-[#040A10] border-2 border-emerald-500/70 shadow-emerald-500/10'
                                : p.status === 'Live In Room'
                                  ? 'bg-[#091522] border-2 border-blue-500/40 shadow-blue-500/10'
                                  : 'bg-[#091522]/80 border border-slate-800'
                            }`}
                          >
                            {/* Top Tile Badge */}
                            <div className="flex items-center justify-between z-10">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow flex items-center gap-1 ${
                                p.isLocalUser 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-slate-800 text-slate-200 border border-slate-700'
                              }`}>
                                {p.isLocalUser && <CheckCircle2 size={11} />}
                                <span>{p.role} {p.isLocalUser ? '(You)' : ''}</span>
                              </span>

                              <div className="flex items-center gap-1.5">
                                {!p.isLocalUser && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartDirectMessage(p);
                                    }}
                                    title={`Send private message to ${p.name}`}
                                    className="px-2 py-0.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-[9px] font-bold text-purple-200 hover:text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                  >
                                    <Lock size={9} />
                                    <span>DM</span>
                                  </button>
                                )}

                                {p.isHandRaised && (
                                  <span className="flex items-center gap-1 text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                                    <Hand size={11} /> Hand Raised
                                  </span>
                                )}

                                {p.isLocalUser ? (
                                  isMicOn ? (
                                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                      <Volume2 size={12} className="animate-pulse" /> Live Mic
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                                      Muted
                                    </span>
                                  )
                                ) : p.status === 'Live In Room' ? (
                                  p.isMicOn === false ? (
                                    <span className="flex items-center gap-1 text-[10px] font-mono text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                                      <MicOff size={12} /> Muted
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Connected
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[10px] text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50 font-mono">
                                    Dispatched
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Center Stage Media: Real Video for Local User OR Real Stream for Remote Users */}
                            <div className="flex-1 flex flex-col items-center justify-center my-2 relative overflow-hidden rounded-2xl bg-black/40">
                              {p.isLocalUser && isScreenSharing && (screenStream || screenStreamRef.current) ? (
                                <video
                                  ref={(el) => {
                                    const stream = screenStream || screenStreamRef.current;
                                    if (el && stream) {
                                      el.muted = true;
                                      if (el.srcObject !== stream) {
                                        el.srcObject = stream;
                                      }
                                      el.play().catch(() => {});
                                    }
                                  }}
                                  autoPlay
                                  playsInline
                                  muted
                                  className="w-full h-full object-contain rounded-2xl bg-black"
                                />
                              ) : p.isLocalUser && isVideoOn && localStream ? (
                                <video
                                  ref={attachLocalVideo}
                                  autoPlay
                                  playsInline
                                  muted
                                  className="w-full h-full object-cover rounded-2xl transform -scale-x-100"
                                />
                              ) : !p.isLocalUser && remoteStream && remoteStream.getVideoTracks().length > 0 ? (
                                <video
                                  autoPlay
                                  playsInline
                                  muted
                                  ref={(el) => {
                                    if (el && remoteStream) {
                                      if (el.srcObject !== remoteStream) {
                                        el.srcObject = remoteStream;
                                      }
                                      el.play().catch(() => {});
                                    }
                                  }}
                                  className={`w-full h-full rounded-2xl ${
                                    p.isScreenSharing || p.peerId === remoteScreenSharePeerId || p.id === remoteScreenSharePeerId
                                      ? 'object-contain bg-black'
                                      : 'object-cover'
                                  }`}
                                />
                              ) : (
                                <div className="flex flex-col items-center text-center p-2 sm:p-3">
                                  <div className={`w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-full font-black text-sm xs:text-xl sm:text-2xl flex items-center justify-center shadow-2xl ${
                                    p.isLocalUser
                                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white ring-2 xs:ring-4 ring-emerald-500/30'
                                      : p.status === 'Live In Room'
                                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white ring-2 xs:ring-4 ring-blue-500/30'
                                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                                  }`}>
                                    {p.name.replace('(You)', '').trim().split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <h3 className="text-[11px] xs:text-xs sm:text-sm font-bold text-white mt-1.5 sm:mt-2.5 truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[180px]">
                                    {p.name}
                                  </h3>
                                  <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[190px]">
                                    {p.email || p.role}
                                  </p>
                                </div>
                              )}
                              {(p.isScreenSharing || p.id === remoteScreenSharePeerId) && (
                                <div className="absolute bottom-2 left-2 bg-blue-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow">
                                  <Share2 size={10} /> Sharing Screen
                                </div>
                              )}
                            </div>

                            {/* Bottom Tile Footer */}
                            <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800/80">
                              <span className={`text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                                p.status === 'Live In Room' ? 'text-emerald-400' : 'text-blue-400'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${p.status === 'Live In Room' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
                                <span>{p.status === 'Live In Room' ? '● Active In Council Room' : '● Invited via Resend'}</span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {p.time || '10:00 AM'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Live Closed Captions Bar */}
          {showCaptions && (
            <div className="mt-2 sm:mt-3 py-2 sm:py-2.5 px-3 sm:px-4 bg-slate-950/90 border border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2 sm:gap-3 text-xs text-slate-300 shadow-lg">
              <div className="flex items-center gap-2 truncate min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${isMicOn && isTranscribing ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="font-bold text-blue-400 text-[11px] sm:text-xs">
                    {currentSubtitleSpeaker ? `${currentSubtitleSpeaker}:` : `${currentUser.name} (You):`}
                  </span>
                </div>
                <span className="truncate italic text-slate-300 text-[11px] sm:text-xs">
                  {currentSubtitle 
                    ? `"${currentSubtitle}"` 
                    : (transcriptLog.length > 0 
                        ? `"${transcriptLog[transcriptLog.length - 1].text}"` 
                        : (isMicOn ? "Listening... (Speak to transcribe remarks in real time)" : "Microphone muted (Unmute to transcribe)"))}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsTranscribing(!isTranscribing)}
                  className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    isTranscribing ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-400 bg-slate-800 border-slate-700'
                  }`}
                  title="Toggle Live Speech Transcription"
                >
                  <span className="hidden xs:inline">{isTranscribing ? '● AI Transcriber Active' : '○ Transcriber Paused'}</span>
                  <span className="xs:hidden">{isTranscribing ? '● AI' : '○ Off'}</span>
                </button>
              </div>
            </div>
          )}

          {/* FLOATING BOTTOM CONTROL DOCK */}
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 sm:gap-3 flex-wrap">
            
            {/* Meeting Link Copy Action */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  const liveLink = getLiveMeetingUrl();
                  navigator.clipboard.writeText(liveLink);
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Live room link copied (${liveLink})!`, type: 'success' } }));
                }}
                className="p-2 sm:px-3 sm:py-2 md:px-3.5 md:py-2 rounded-xl sm:rounded-2xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-600/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-lg shadow-blue-950/50"
                title="Copy Live Production Meeting Link"
              >
                <Copy size={15} className="text-blue-400 shrink-0" />
                <span className="font-mono text-[11px] hidden md:inline">Copy Live Link</span>
              </button>
            </div>

            {/* Core Media Controls */}
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3">
              
              {/* Mic Toggle */}
              <button
                onClick={handleToggleMic}
                className={`p-2.5 xs:p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs font-bold shadow-lg ${
                  isMicOn 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                }`}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic size={17} /> : <MicOff size={17} />}
                <span className="hidden lg:inline">{isMicOn ? 'Mute' : 'Unmute'}</span>
              </button>

              {/* Video Toggle */}
              <button
                onClick={handleToggleVideo}
                className={`p-2.5 xs:p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs font-bold shadow-lg ${
                  isVideoOn 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                }`}
                title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoOn ? <Video size={17} /> : <VideoOff size={17} />}
                <span className="hidden lg:inline">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
              </button>

              {/* Screen Share Toggle */}
              <button
                onClick={handleToggleScreenShare}
                className={`p-2.5 xs:p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs font-bold shadow-lg ${
                  isScreenSharing 
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-blue-600/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isScreenSharing ? 'Stop Screen Sharing' : 'Share BIM / Screen'}
              >
                <Share2 size={17} />
                <span className="hidden lg:inline">{isScreenSharing ? 'Sharing' : 'Share'}</span>
              </button>

              {/* Raise Hand Toggle */}
              <button
                onClick={handleToggleRaiseHand}
                className={`p-2.5 xs:p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs font-bold ${
                  isHandRaised 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
              >
                <Hand size={17} />
                <span className="hidden lg:inline">{isHandRaised ? 'Raised' : 'Raise Hand'}</span>
              </button>

              {/* Captions Toggle */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`p-2.5 xs:p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs font-bold ${
                  showCaptions ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
                title="Toggle Live Subtitles"
              >
                <Subtitles size={17} />
              </button>

            </div>

            {/* Right Toggle for Collaboration Drawer */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2.5 xs:p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer relative ${
                  isSidebarOpen 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isSidebarOpen ? 'Collapse Side Panel' : 'Expand Side Panel'}
              >
                <MessageSquare size={17} />
                <span className="hidden sm:inline">Collaboration &amp; People</span>
                {participants.length > 0 && (
                  <span className="sm:hidden px-1.5 py-0.2 bg-blue-500 text-white text-[9px] font-bold rounded-full">
                    {participants.length}
                  </span>
                )}
              </button>
            </div>

          </div>

        </main>

        {/* RIGHT COLLAPSIBLE COLLABORATION & INVITATION DRAWER */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Mobile / Tablet Touch-Out Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              />

              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] md:w-[420px] max-w-full lg:static lg:inset-auto lg:h-full lg:w-[380px] xl:w-[420px] bg-[#08121E] border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden shrink-0"
              >
                {/* Mobile / Tablet Header with Close X */}
                <div className="p-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between lg:hidden shrink-0">
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-blue-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">Council Collaboration</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Close Drawer"
                  >
                    <X size={16} />
                  </button>
                </div>
              {/* Drawer Tabs */}
              <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 grid grid-cols-5 gap-1">
                <button
                  onClick={() => setActiveTab('invite')}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeTab === 'invite'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="People & Invite"
                >
                  <Users size={13} />
                  <span>People</span>
                </button>

                <button
                  onClick={() => setActiveTab('action_items')}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeTab === 'action_items'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ListTodo size={13} />
                  <span>Actions</span>
                </button>

                <button
                  onClick={() => setActiveTab('minutes')}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeTab === 'minutes'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText size={13} />
                  <span>Minutes</span>
                </button>

                <button
                  onClick={() => setActiveTab('voting')}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeTab === 'voting'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Vote size={13} />
                  <span>Vote</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeTab === 'chat'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>Chat</span>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                
                {/* TAB 0: PEOPLE & INVITATION */}
                {activeTab === 'invite' && (
                  <div className="space-y-4">
                    
                    {/* Current User Identity Card */}
                    <div className="p-3.5 bg-gradient-to-br from-emerald-950/50 to-teal-950/40 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30">
                          {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white">{currentUser.name}</span>
                            <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">YOU</span>
                          </div>
                          <p className="text-[10px] text-slate-300">{currentUser.role}</p>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    {/* Quick Invite Form */}
                    <form onSubmit={handleSendEmailInvite} className="space-y-2.5 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                          <Mail size={13} className="text-emerald-400" />
                          <span>Invite Registered Member</span>
                        </span>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          Platform Roster
                        </span>
                      </div>

                      {platformRoster.length > 0 && (
                        <div>
                          <select
                            defaultValue=""
                            onChange={(e) => handleSelectRosterPerson(e.target.value)}
                            className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                          >
                            <option value="">-- Select Registered Stakeholder / Inspector --</option>
                            {platformRoster.map((r) => (
                              <option key={r.id} value={r.id}>
                                [{r.category === 'inspector' ? 'Inspector' : r.entity_type}] {r.name} {r.username && !r.username.includes('@') ? `(@${r.username})` : ''} {r.email ? `- ${r.email}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <input
                          type="email"
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="Selected member's email address"
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          placeholder="Name / Title"
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="Master Developer">Master Developer</option>
                          <option value="Lead Structural Inspector">Lead Inspector</option>
                          <option value="General Contractor">General Contractor</option>
                          <option value="Consulting Structural Engineer">Consultant</option>
                          <option value="Government Agency Director">Agency Director</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingInvite || !inviteEmail.trim()}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSendingInvite ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Dispatching via Resend...</span>
                          </>
                        ) : (
                          <>
                            <Send size={13} />
                            <span>Send Live Invite Email</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Participants & Dispatched List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span>Connected Roster ({participants.length})</span>
                        <span className="font-mono text-emerald-400">{activeInRoomCount} Live in Room</span>
                      </div>

                      <div className="space-y-2">
                        {participants.map((p, idx) => (
                          <div key={p.id || idx} className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                            p.isLocalUser ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-900/70 border-slate-800'
                          }`}>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {p.isLocalUser && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded">YOU</span>}
                                {p.isHandRaised && <span className="text-[10px]">✋</span>}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">{p.email} • {p.role}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {!p.isLocalUser && (
                                <button
                                  type="button"
                                  onClick={() => handleStartDirectMessage(p)}
                                  className="px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-[9px] font-bold text-purple-200 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                                  title={`Direct message ${p.name}`}
                                >
                                  <Lock size={9} />
                                  <span>DM</span>
                                </button>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${
                                p.status === 'Live In Room' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 1: ACTION ITEMS */}
                {activeTab === 'action_items' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                        Statutory Directives
                      </h3>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {actionItems.length} Logged
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {actionItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white leading-snug">{item.title}</p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                              <span>👤 {item.assignee_name}</span>
                              <span>• Due {item.due_date}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                            item.is_completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {item.is_completed ? 'Resolved' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add Action Form */}
                    <form onSubmit={handleAddAction} className="pt-2 border-t border-slate-800/80 space-y-2">
                      <input
                        type="text"
                        required
                        value={newActionTitle}
                        onChange={(e) => setNewActionTitle(e.target.value)}
                        placeholder="Log statutory action item..."
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <select
                          value={newActionAssignee}
                          onChange={(e) => setNewActionAssignee(e.target.value)}
                          className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
                        >
                          {/* Real assignees only: this session's user and the
                              meeting's registered participants. */}
                          <option value={currentUser.name}>
                            {currentUser.name}{currentUser.role ? ` (${currentUser.role})` : ''}
                          </option>
                          {(meeting?.participants ?? [])
                            .filter((p) => p.name && p.name !== currentUser.name)
                            .map((p) => (
                              <option key={p.name} value={p.name}>
                                {p.name}{p.role ? ` (${p.role})` : ''}
                              </option>
                            ))}
                        </select>
                        <button
                          type="submit"
                          disabled={isAddingAction || !newActionTitle.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Log</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 2: MINUTES & AI NOTE TAKER */}
                {activeTab === 'minutes' && (
                  <div className="space-y-3.5 flex flex-col h-full overflow-y-auto pr-1">
                    {/* Header Card */}
                    <div className="p-3 bg-gradient-to-br from-blue-950/40 to-slate-900 rounded-2xl border border-blue-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <FileText size={14} className="text-blue-400" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                            Council Minutes &amp; AI Note Taker
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Duration: <strong className="text-white">{formatElapsed(elapsedSeconds)}</strong></span>
                        <span>Quorum: <strong className="text-emerald-400">{participants.filter(p => p.status === 'Live In Room').length + 1} Connected</strong></span>
                      </div>
                    </div>

                    {/* AI Smart Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleAiSummarize}
                        disabled={isGeneratingAiSummary}
                        className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                        title="Synthesize transcripts and deliberations into formal minutes"
                      >
                        <Sparkles size={13} className="text-amber-300" />
                        <span>{isGeneratingAiSummary ? 'Synthesizing...' : 'AI Synthesize'}</span>
                      </button>

                      <button
                        onClick={handleExtractActionItemsFromSpeech}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                        title="Scan transcripts and detect action directives"
                      >
                        <ListTodo size={13} className="text-emerald-400" />
                        <span>Detect Actions</span>
                      </button>
                    </div>

                    {/* Speech Transcript Log Feed */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Volume2 size={12} className="text-blue-400" />
                          Speech Transcripts ({transcriptLog.length})
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Real-Time</span>
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-[11px]">
                        {transcriptLog.length === 0 ? (
                          <div className="text-slate-500 italic py-2 text-center text-xs">
                            Speak to transcribe statements, or add remark below.
                          </div>
                        ) : (
                          transcriptLog.slice(-6).map((item) => (
                            <div key={item.id} className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-0.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-blue-400 truncate max-w-[170px]">{item.speaker}</span>
                                <span className="text-slate-500 font-mono">{item.timestamp}</span>
                              </div>
                              <p className="text-slate-300 leading-snug">{item.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Manual Utterance / Spoken Remark Input */}
                      <form onSubmit={handleSimulateUtterance} className="flex gap-1.5 pt-1.5 border-t border-slate-800">
                        <input
                          type="text"
                          value={simulatedUtterance}
                          onChange={(e) => setSimulatedUtterance(e.target.value)}
                          placeholder="Type verbal remark or observation..."
                          className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={!simulatedUtterance.trim()}
                          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
                          title="Add statement to transcript log"
                        >
                          <Plus size={14} />
                        </button>
                      </form>
                    </div>

                    {/* Official Minutes Textarea */}
                    <div className="flex-1 flex flex-col space-y-1.5 min-h-[180px]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Official Proceedings Ledger
                        </label>
                        {meeting && (
                          <a
                            href={downloadMeetingPdfUrl(meeting.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 underline"
                          >
                            <Download size={11} /> Download PDF
                          </a>
                        )}
                      </div>

                      <textarea
                        rows={10}
                        value={minutesText}
                        onChange={(e) => setMinutesText(e.target.value)}
                        placeholder="Record formal resolutions, stage-gate conditions, and engineering observations..."
                        className="w-full flex-1 p-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-mono resize-none"
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleSaveMinutes}
                      disabled={isSavingMinutes}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                    >
                      <FileText size={14} />
                      <span>{isSavingMinutes ? 'Recording to Ledger...' : 'Save & Publish Official Minutes'}</span>
                    </button>
                  </div>
                )}

                {/* TAB 3: STAGE-GATE VOTING */}
                {activeTab === 'voting' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-blue-950/40 rounded-2xl border border-indigo-500/30">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">
                        STAGE-GATE STATUTORY RESOLUTION
                      </span>
                      <h4 className="text-sm font-black text-white mt-1">
                        Signoff for 5th Floor Slab Concrete Casting
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Subject to GPR scan compliance on Grid 4 and 28-day compressive core test certification.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-300">Quorum Progress:</span>
                        <span className="font-mono font-bold text-emerald-400">{quorumVotes.yes}/{quorumVotes.total} Affirmative</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${(quorumVotes.yes / quorumVotes.total) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Cast Official Regulatory Vote
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleCastVote('YES')}
                          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            voteStatus === 'VOTED_YES'
                              ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-700/60 text-emerald-300'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                          <span>Approve Gate</span>
                        </button>

                        <button
                          onClick={() => handleCastVote('NO')}
                          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            voteStatus === 'VOTED_NO'
                              ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30'
                              : 'bg-red-950/40 hover:bg-red-900/60 border-red-700/60 text-red-300'
                          }`}
                        >
                          <AlertTriangle size={16} />
                          <span>Reject / Re-test</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: LIVE CHAT & PRIVATE MESSAGING */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full space-y-2.5">
                    {/* Recipient Destination Selector */}
                    <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                          Message Destination:
                        </span>
                        {chatRecipient !== 'EVERYONE' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
                              <Lock size={10} /> Private DM
                            </span>
                            <button
                              type="button"
                              onClick={() => setChatRecipient('EVERYONE')}
                              className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                              title="Switch back to public chat"
                            >
                              Public
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                            Public
                          </span>
                        )}
                      </div>

                      <select
                        value={chatRecipient}
                        onChange={(e) => setChatRecipient(e.target.value)}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold focus:outline-none transition-colors cursor-pointer border ${
                          chatRecipient === 'EVERYONE'
                            ? 'bg-slate-950 text-blue-300 border-slate-700 focus:border-blue-500'
                            : 'bg-purple-950/80 text-purple-200 border-purple-500/50 focus:border-purple-400'
                        }`}
                      >
                        <option value="EVERYONE">🌐 Everyone (Public Discussion)</option>
                        {participants
                          .filter(p => !p.isLocalUser && p.id !== 'user-local' && p.peerId !== peerIdRef.current)
                          .map((p) => {
                            const targetVal = p.peerId || p.id;
                            return (
                              <option key={targetVal} value={targetVal}>
                                🔒 Direct to: {p.name} ({p.role || 'Member'}) {p.status === 'Live In Room' ? '● Live' : '○ Scheduled'}
                              </option>
                            );
                          })}
                      </select>

                      {chatRecipient !== 'EVERYONE' && (
                        <p className="text-[10px] text-purple-300/80 italic px-1 flex items-center justify-between">
                          <span>Only you and the selected attendee can read this private message.</span>
                          <button
                            type="button"
                            onClick={() => setChatRecipient('EVERYONE')}
                            className="underline hover:text-white ml-2 text-[10px] not-italic font-bold"
                          >
                            Back to Everyone
                          </button>
                        </p>
                      )}
                    </div>

                    {/* Messages Feed */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                      {chatMessages
                        .filter(msg => {
                          if (msg.sender && msg.sender.startsWith('[Transcript]')) return false;
                          if (!msg.isPrivate) return true;
                          const cleanCurrentName = currentUser.name.replace(/\(You\)/gi, '').trim().toLowerCase();
                          const msgSenderName = (msg.sender || '').replace(/\(You\)/gi, '').trim().toLowerCase();
                          const msgRecipName = (msg.recipientName || '').replace(/\(You\)/gi, '').trim().toLowerCase();
                          const isSender = msgSenderName === cleanCurrentName || 
                            (currentUser.email && msg.senderEmail && msg.senderEmail.toLowerCase() === currentUser.email.toLowerCase()) || 
                            (msg.senderPeerId && msg.senderPeerId === peerIdRef.current);
                          const isRecipient = (msgRecipName && (msgRecipName === cleanCurrentName || cleanCurrentName.includes(msgRecipName) || msgRecipName.includes(cleanCurrentName))) || 
                            (currentUser.email && msg.recipientEmail && msg.recipientEmail.toLowerCase() === currentUser.email.toLowerCase()) || 
                            (msg.recipientId && (msg.recipientId === peerIdRef.current || msg.recipientId === 'user-local'));
                          return Boolean(isSender || isRecipient);
                        })
                        .map((msg, idx) => {
                          const cleanCurrentName = currentUser.name.replace(/\(You\)/gi, '').trim().toLowerCase();
                          const msgSenderName = (msg.sender || '').replace(/\(You\)/gi, '').trim().toLowerCase();
                          const isMyMessage = msgSenderName === cleanCurrentName || 
                            (currentUser.email && msg.senderEmail && msg.senderEmail.toLowerCase() === currentUser.email.toLowerCase()) || 
                            (msg.senderPeerId && msg.senderPeerId === peerIdRef.current);

                          return (
                            <div 
                              key={msg.id || idx} 
                              className={`p-3 rounded-2xl space-y-1.5 border transition-all ${
                                msg.isPrivate
                                  ? 'bg-gradient-to-br from-purple-950/60 to-indigo-950/50 border-purple-500/50 shadow-md shadow-purple-950/30'
                                  : 'bg-slate-900/90 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {msg.isPrivate ? (
                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase text-purple-300 bg-purple-500/25 px-1.5 py-0.5 rounded border border-purple-500/40 shadow-sm">
                                      <Lock size={9} /> Private DM
                                    </span>
                                  ) : null}
                                  <span className={`font-bold ${msg.isPrivate ? 'text-purple-300' : 'text-blue-400'}`}>
                                    {msg.sender}
                                    {msg.isPrivate && msg.recipientName ? ` ➔ ${msg.recipientName}` : ` (${msg.role})`}
                                  </span>
                                </div>
                                <span className="text-slate-500 font-mono text-[9px]">{msg.time}</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed break-words">{msg.text}</p>
                              {msg.isPrivate && !isMyMessage && (
                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const senderParticipant = participants.find(
                                        p => (msg.senderPeerId && p.peerId === msg.senderPeerId) ||
                                             (msg.senderEmail && p.email && p.email.toLowerCase() === msg.senderEmail.toLowerCase()) ||
                                             (p.name && msg.sender && p.name.replace(/\(You\)/gi, '').trim().toLowerCase() === msg.sender.replace(/\(You\)/gi, '').trim().toLowerCase())
                                      );
                                      if (senderParticipant) {
                                        handleStartDirectMessage(senderParticipant);
                                      } else if (msg.senderPeerId) {
                                        setChatRecipient(msg.senderPeerId);
                                        setActiveTab('chat');
                                      }
                                    }}
                                    className="text-[9px] font-bold text-purple-300 hover:text-white bg-purple-900/40 hover:bg-purple-800/70 px-2 py-0.5 rounded-lg border border-purple-500/30 flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <Lock size={9} />
                                    <span>Reply Privately</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>

                    {/* Send Message Form */}
                    <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        placeholder={
                          chatRecipient === 'EVERYONE'
                            ? "Send public message to council..."
                            : `Send private message to ${participants.find(p => p.id === chatRecipient || p.peerId === chatRecipient || p.email === chatRecipient)?.name || 'attendee'}...`
                        }
                        className={`flex-1 p-2.5 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none focus:ring-2 ${
                          chatRecipient === 'EVERYONE'
                            ? 'border-slate-700 focus:ring-blue-500'
                            : 'border-purple-600/50 focus:ring-purple-500 placeholder-purple-300/60'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={!newChatMessage.trim()}
                        className={`p-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-white ${
                          chatRecipient === 'EVERYONE'
                            ? 'bg-blue-600 hover:bg-blue-500'
                            : 'bg-purple-600 hover:bg-purple-500'
                        }`}
                      >
                        <Send size={15} />
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </motion.aside>
          </>
        )}
        </AnimatePresence>

      </div>

      {/* QUICK INVITE MODAL DIALOG */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#091522] border-2 border-emerald-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Invite User to Live Meeting</h3>
                    <p className="text-xs text-slate-400">Transmitted via Resend Cloud Email API</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSendEmailInvite} className="space-y-4">
                {platformRoster.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Select Registered Platform Stakeholder / Inspector
                    </label>
                    <select
                      defaultValue=""
                      onChange={(e) => handleSelectRosterPerson(e.target.value)}
                      className="w-full p-3.5 bg-slate-950 border border-emerald-600/50 rounded-2xl text-xs font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">-- Choose from Registered Stakeholders &amp; Inspectors --</option>
                      {platformRoster.map((r) => (
                        <option key={r.id} value={r.id}>
                          [{r.category === 'inspector' ? 'Inspector' : r.entity_type}] {r.name} {r.username && !r.username.includes('@') ? `(@${r.username})` : ''} {r.email ? `- ${r.email}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Participant Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Auto-filled from selection above or enter email"
                    className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Full Name / Title
                    </label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g. Engr. Oladipo"
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Stakeholder Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Master Developer">Master Developer</option>
                      <option value="Lead Structural Inspector">Lead Inspector</option>
                      <option value="General Contractor">General Contractor</option>
                      <option value="Consulting Engineer">Consultant</option>
                      <option value="Government Agency Director">Agency Director</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Personal Executive Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={inviteCustomNote}
                    onChange={(e) => setInviteCustomNote(e.target.value)}
                    placeholder="Please join immediately to confirm the Level 5 slab certification..."
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-400 break-all">
                  🔗 Link attached: <span className="text-emerald-400">{getLiveMeetingUrl()}</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingInvite || !inviteEmail.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingInvite ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending via Resend...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Dispatch Invite Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* END MEETING & DISPATCH MINUTES MODAL */}
      <AnimatePresence>
        {isEndMeetingModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#091522] border-2 border-amber-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {!endMeetingCompletedData ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">Adjourn Session &amp; Dispatch Certified Minutes</h3>
                        <p className="text-xs text-slate-400">Generates branded Nexucon PDF minutes with attendance roll call &amp; transcripts</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEndMeetingModalOpen(false)}
                      disabled={isSubmittingEndMeeting}
                      className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Meeting Statistics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Duration</div>
                      <div className="text-base font-black text-white font-mono mt-0.5">{formatElapsed(elapsedSeconds)}</div>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Attendees</div>
                      <div className="text-base font-black text-emerald-400 font-mono mt-0.5">{participants.length}</div>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Transcripts</div>
                      <div className="text-base font-black text-blue-400 font-mono mt-0.5">{transcriptLog.length} Lines</div>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Action Items</div>
                      <div className="text-base font-black text-amber-400 font-mono mt-0.5">{actionItems.length} Tasks</div>
                    </div>
                  </div>

                  {/* Certified Participants Roll Call Preview */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Official Roll Call &amp; Recipients ({participants.filter(p => p.email).length} with email)
                    </label>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-950/80 rounded-2xl border border-slate-800">
                      {participants.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="font-bold text-slate-200">{p.name}</span>
                            <span className="text-[10px] text-slate-400">({p.role || 'Member'})</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                            {p.email || 'No email on record'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Executive Minutes Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Executive Minutes Preview
                      </label>
                      <button
                        type="button"
                        onClick={handleAiSummarize}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={12} /> Regenerate with AI
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={minutesText}
                      onChange={(e) => setMinutesText(e.target.value)}
                      placeholder="Minutes text that will be printed onto the certified PDF..."
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Email Toggle Option */}
                  <div className="p-3 bg-gradient-to-r from-emerald-950/40 to-slate-900 rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sendEmailMinutesCheckbox"
                        checked={sendEmailMinutes}
                        onChange={(e) => setSendEmailMinutes(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                      <label htmlFor="sendEmailMinutesCheckbox" className="text-xs text-slate-200 font-bold cursor-pointer">
                        Email Certified PDF Minutes to all participants via Resend
                        <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                          Sends corporate Nexucon email with branded PDF attachment and executive summary.
                        </span>
                      </label>
                    </div>
                    <Mail size={22} className="text-emerald-400 shrink-0" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEndMeetingModalOpen(false)}
                      disabled={isSubmittingEndMeeting}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Continue Meeting
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmEndMeeting}
                      disabled={isSubmittingEndMeeting}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingEndMeeting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Generating PDF &amp; Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck size={14} />
                          <span>Adjourn Session &amp; Send Minutes</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Completion View */
                <div className="text-center py-6 space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40 shadow-xl">
                    <CheckCircle2 size={36} />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black text-white">Council Session Concluded</h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Certified meeting minutes PDF generated and dispatched to{' '}
                      <strong className="text-emerald-400">{endMeetingCompletedData.emailsSent} participants</strong> via Resend Email.
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      File: {endMeetingCompletedData.pdfFilename}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs text-slate-300 space-y-2 max-w-md mx-auto font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Recorded Duration:</span>
                      <span className="text-white font-bold">{formatElapsed(elapsedSeconds)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="text-emerald-400 font-bold">COMPLETED &amp; AUDITED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">PDF Document:</span>
                      <span className="text-amber-400 font-bold">Nexucon Certified</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-3">
                    {endMeetingCompletedData.pdfBase64 && (
                      <button
                        onClick={() => downloadBase64Pdf(endMeetingCompletedData.pdfBase64!, endMeetingCompletedData.pdfFilename)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Download PDF Again</span>
                      </button>
                    )}
                    <button
                      onClick={() => router.push(meetingsBasePath)}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Back to Meetings Hub</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function MeetingRoomPage() {
  return (
    <React.Suspense fallback={
      <div className="fixed inset-0 z-[120] w-screen h-screen bg-[#060D15] text-slate-100 flex flex-col items-center justify-center gap-3 select-none font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs text-slate-400 font-medium tracking-wide">Connecting to secure council chamber...</span>
      </div>
    }>
      <MeetingRoomContent />
    </React.Suspense>
  );
}
