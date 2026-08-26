"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  CheckCircle, BadgeCheck, VolumeX
} from "lucide-react";
import { 
  StakeholderMeeting, getMeetingById, updateMeetingNotes, 
  addMeetingActionItem, MeetingActionItem, joinMeeting, castMeetingVote 
} from "@/services/stakeholders";
import { sendEmailViaResend } from "@/services/email";

interface ConnectedParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
  time: string;
  status: 'Live In Room' | 'Dispatched';
  isLocalUser?: boolean;
  isMicOn?: boolean;
  isVideoOn?: boolean;
  isHandRaised?: boolean;
  stream?: MediaStream;
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

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = (params?.id as string) || '';

  const [meeting, setMeeting] = useState<StakeholderMeeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local User Identity in this Meeting Session
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string }>({
    name: searchParams?.get('guest_name') || 'Engr. Babatunde Sanwo',
    role: searchParams?.get('role') || 'Agency Head / Director General',
    email: searchParams?.get('email') || 'head@regulator.gov.ng'
  });

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

  // WebRTC Remote Peer Connections & Streams
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const lastSignalTimestampRef = useRef<number>(0);

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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
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

  // Collaboration State
  const [minutesText, setMinutesText] = useState('');
  const [isSavingMinutes, setIsSavingMinutes] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState(currentUser.name);
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);
  const [isAddingAction, setIsAddingAction] = useState(false);

  // Chat State (Starts Clean for Real Attendee Messaging)
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; role: string; text: string; time: string }>>([]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Voting State
  const [voteStatus, setVoteStatus] = useState<'IDLE' | 'VOTED_YES' | 'VOTED_NO'>('IDLE');
  const [quorumVotes, setQuorumVotes] = useState({ yes: 0, no: 0, total: 1 });

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Standard live URL using production domain
  const getLiveMeetingUrl = () => {
    return `https://nexucon-frontend-8x3a.vercel.app/government/dashboard/stakeholders/meetings/${meetingId || 'room'}/room`;
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
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn("Camera/mic permission notice:", err);
      }
    };
    initMedia();

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Update track enable/disable on state toggle
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOn;
      });
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
      });
    }
  }, [isVideoOn, isMicOn, localStream]);

  // 2. WebRTC Peer Connection Helper
  const getOrCreatePeerConnection = (peerId: string) => {
    if (peerConnectionsRef.current[peerId]) {
      return peerConnectionsRef.current[peerId];
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Add local tracks to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote track received
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        setRemoteStreams(prev => ({
          ...prev,
          [peerId]: remoteStream
        }));
      }
    };

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        fetch(`/api/meetings/${meetingId}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: currentUser.name,
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

  // 3. WebRTC Signaling Loop & Presence Sync
  useEffect(() => {
    if (!meetingId) return;

    // A. Handshake with Next.js Serverless Presence API
    const joinServerless = async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join',
            participant: {
              name: currentUser.name,
              role: currentUser.role,
              email: currentUser.email,
              isMicOn,
              isVideoOn,
              isHandRaised
            }
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.participants) {
            updateParticipantsFromData(data.participants);
          }
          if (data && data.votes) {
            setQuorumVotes(data.votes);
          }
          if (data && data.chatMessages && data.chatMessages.length > chatMessages.length) {
            setChatMessages(data.chatMessages);
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
        const res = await fetch(`/api/meetings/${meetingId}/signal?since=${lastSignalTimestampRef.current}&sender=${encodeURIComponent(currentUser.name)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.messages && data.messages.length > 0) {
            lastSignalTimestampRef.current = data.timestamp || Date.now();

            for (const msg of data.messages) {
              const peerName = msg.sender;
              const pc = getOrCreatePeerConnection(peerName);

              if (msg.type === 'offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                await fetch(`/api/meetings/${meetingId}/signal`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    sender: currentUser.name,
                    target: peerName,
                    type: 'answer',
                    data: answer
                  })
                });
              } else if (msg.type === 'answer') {
                if (pc.signalingState !== 'stable') {
                  await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
                }
              } else if (msg.type === 'ice-candidate') {
                if (msg.data) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(msg.data));
                  } catch (e) {}
                }
              } else if (msg.type === 'join-peer') {
                // New peer wants connection, create offer
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await fetch(`/api/meetings/${meetingId}/signal`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    sender: currentUser.name,
                    target: peerName,
                    type: 'offer',
                    data: offer
                  })
                });
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
        sender: currentUser.name,
        type: 'join-peer',
        data: {}
      })
    }).catch(() => {});

    // D. Poll Presence API every 2.5 seconds
    const presenceInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}/presence`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.participants) {
            updateParticipantsFromData(data.participants);
          }
          if (data && data.votes) {
            setQuorumVotes(data.votes);
          }
          if (data && data.chatMessages && data.chatMessages.length > chatMessages.length) {
            setChatMessages(data.chatMessages);
          }
        }
      } catch (err) {}
    }, 2500);

    return () => {
      clearInterval(signalInterval);
      clearInterval(presenceInterval);
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    };
  }, [meetingId, currentUser, localStream]);

  const updateParticipantsFromData = (remoteList: any[]) => {
    setParticipants(prev => {
      const merged: ConnectedParticipant[] = [];
      const seen = new Set<string>();

      // 1. Add current local user
      merged.push({
        id: 'user-local',
        name: `${currentUser.name} (You)`,
        email: currentUser.email,
        role: currentUser.role,
        time: '10:00 AM',
        status: 'Live In Room',
        isLocalUser: true,
        isMicOn,
        isVideoOn,
        isHandRaised
      });
      seen.add(currentUser.name.toLowerCase());
      if (currentUser.email) seen.add(currentUser.email.toLowerCase());

      // 2. Add remote participants
      for (const p of remoteList) {
        const cleanName = (p.name || '').replace('(You)', '').trim();
        const cleanEmail = (p.email || '').trim().toLowerCase();
        
        if (cleanName.toLowerCase() === currentUser.name.toLowerCase() || (cleanEmail && cleanEmail === currentUser.email.toLowerCase())) {
          continue;
        }

        if (!seen.has(cleanName.toLowerCase())) {
          seen.add(cleanName.toLowerCase());
          if (cleanEmail) seen.add(cleanEmail);

          merged.push({
            id: p.id || `p-${cleanName}`,
            name: cleanName,
            email: p.email || '',
            role: p.role || 'Stakeholder Representative',
            time: p.time || p.joined_at || '10:00 AM',
            status: p.status === 'Live In Room' ? 'Live In Room' : 'Dispatched',
            isLocalUser: false,
            isMicOn: p.isMicOn ?? true,
            isVideoOn: p.isVideoOn ?? false,
            isHandRaised: p.isHandRaised ?? false
          });
        }
      }

      return merged;
    });
  };

  // Screen Share Handler (Interactive Screen / BIM Model Sharing)
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        if (navigator.mediaDevices?.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
          setScreenStream(stream);
          setIsScreenSharing(true);
          setLayoutMode('spotlight');
          if (screenShareVideoRef.current) {
            screenShareVideoRef.current.srcObject = stream;
          }
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Screen sharing started (Broadcasting live in 60 FPS)', type: 'success' }
          }));

          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            setScreenStream(null);
            window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { message: 'Screen sharing ended', type: 'info' }
            }));
          };
        } else {
          setIsScreenSharing(true);
          setLayoutMode('spotlight');
        }
      } catch (err) {
        console.warn("Screen share cancelled or not allowed:", err);
        setIsScreenSharing(false);
      }
    } else {
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Screen sharing stopped', type: 'info' }
      }));
    }
  };

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
        participant: { name: currentUser.name, isMicOn: nextState }
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
        participant: { name: currentUser.name, isVideoOn: nextState }
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
        participant: { name: currentUser.name, isHandRaised: nextState }
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
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin: 0 0 16px 0;">${meeting?.title || 'Q3 Structural Stage-Gate Deliberation & GPR Review'}</h2>
          
          <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Meeting Ref:</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: 800; color: #60a5fa;">${meeting?.meeting_reference || 'MTG-1092'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Project:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #ffffff;">${meeting?.project_name || 'Central Metro Transit Hub'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Invited Role:</td>
              <td style="padding: 6px 0; color: #fbbf24; font-weight: 700;">${inviteRole}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Convened By:</td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">Engr. Babatunde Sanwo (Agency Head)</td>
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
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgObj = {
      sender: currentUser.name,
      role: currentUser.role,
      text: newChatMessage.trim(),
      time
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

  return (
    <div className="fixed inset-0 z-[120] w-screen h-screen bg-[#060D15] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Top Header Bar (Full-Bleed Glassmorphism) */}
      <header className="h-16 px-5 bg-[#091422]/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-30 shrink-0">
        
        {/* Left: Meeting Info & Live Connected Indicator */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => router.push('/government/dashboard/stakeholders/meetings')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Leave Meeting"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Exit</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                {meeting?.meeting_reference || 'MTG-1092'}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE ({activeInRoomCount} IN ROOM)</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded">
                ⏱️ {formatElapsed(elapsedSeconds)}
              </span>
            </div>
            <h1 className="text-sm font-black text-white truncate max-w-[240px] sm:max-w-md mt-0.5 flex items-center gap-2">
              <span>{meeting?.title || 'Q3 Structural Stage-Gate Deliberation & GPR Review'}</span>
              <span className="text-[11px] font-normal text-slate-400 hidden md:inline">
                • Connected as <span className="text-emerald-400 font-bold">{currentUser.name}</span>
              </span>
            </h1>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Top Quick Invite Button */}
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            title="Send Email Invitation via Resend"
          >
            <UserPlus size={15} />
            <span className="hidden sm:inline">Invite User</span>
          </button>

          {/* Stage Engine Switcher */}
          <div className="bg-slate-900/90 p-1 rounded-2xl border border-slate-800 hidden lg:flex items-center">
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
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title={layoutMode === 'grid' ? 'Switch to Spotlight View' : 'Switch to Grid View'}
          >
            <LayoutGrid size={15} />
            <span className="hidden xl:inline">{layoutMode === 'grid' ? 'Grid' : 'Spotlight'}</span>
          </button>

          {/* Browser Fullscreen Toggle */}
          <button
            onClick={toggleNativeFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isNativeFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isNativeFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Direct Google Meet Popout Link */}
          <a
            href={meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Launch Google Meet App"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Meet App</span>
          </a>

          {/* Leave Button */}
          <button
            onClick={() => router.push('/government/dashboard/stakeholders/meetings')}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-red-600/20"
          >
            <PhoneOff size={14} />
            <span className="hidden sm:inline">Leave</span>
          </button>

        </div>

      </header>

      {/* Main Full-Screen Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* CENTER STAGE: VIDEO MATRIX (Expands to 100% when sidebar is closed) */}
        <main className={`flex-1 flex flex-col justify-between p-3 sm:p-5 transition-all duration-300 overflow-hidden ${
          isSidebarOpen ? 'lg:pr-2' : 'pr-3 sm:pr-5'
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
                {layoutMode === 'spotlight' || isScreenSharing ? (
                  <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                    
                    {/* Main Spotlight Window */}
                    <div className="flex-1 bg-gradient-to-b from-[#0B1726] to-[#04080F] rounded-3xl border-2 border-blue-500/50 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                      <div className="flex items-center justify-between z-10">
                        <span className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-xl flex items-center gap-1.5 shadow">
                          <Share2 size={14} />
                          <span>{isScreenSharing ? 'Active Screen / BIM Model Stream' : 'Spotlight Stage'}</span>
                        </span>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-800 flex items-center gap-1">
                          <Volume2 size={13} className="animate-pulse" /> Live HD Audio Stream
                        </span>
                      </div>

                      {/* Center Stage Video / BIM Visualization */}
                      <div className="flex-1 flex flex-col items-center justify-center my-3 relative overflow-hidden">
                        {isScreenSharing && screenStream ? (
                          <video
                            ref={screenShareVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain rounded-2xl"
                          />
                        ) : isScreenSharing ? (
                          <div className="text-center space-y-3">
                            <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 animate-pulse">
                              <Layers size={48} />
                            </div>
                            <h2 className="text-lg font-black text-white">Revit BIM Model - Level 5 Post-Tensioned Slab Mesh</h2>
                            <p className="text-xs text-slate-400 font-mono">Live Screen Sharing • 60 FPS • 1080p Crystal Clear</p>
                          </div>
                        ) : isVideoOn && localStream ? (
                          <div className="relative w-full max-w-xl h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                            <video
                              ref={localVideoRef}
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
                          className={`min-w-[170px] max-w-[200px] rounded-2xl bg-[#091522] border p-2.5 flex items-center gap-3 transition-all shrink-0 ${
                            p.isLocalUser ? 'border-emerald-500/80 bg-emerald-950/20' : 'border-slate-800'
                          }`}
                        >
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
                      ))}
                    </div>

                  </div>
                ) : (
                  
                  /* GRID VIEW MATRIX: DYNAMIC INTERACTIVE TILES FOR ALL JOINED PARTICIPANTS WITH LIVE MEDIA */
                  <div className={`flex-1 grid gap-3 sm:gap-4 overflow-y-auto p-1 ${
                    participants.length <= 1 
                      ? 'grid-cols-1' 
                      : participants.length === 2 
                        ? 'grid-cols-1 sm:grid-cols-2' 
                        : participants.length <= 4 
                          ? 'grid-cols-1 sm:grid-cols-2' 
                          : 'grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {participants.map((p, idx) => {
                      const remoteStream = !p.isLocalUser ? (remoteStreams[p.name] || remoteStreams[p.id]) : null;

                      return (
                        <div
                          key={p.id || idx}
                          className={`relative rounded-3xl p-4 flex flex-col justify-between overflow-hidden shadow-2xl transition-all min-h-[190px] sm:min-h-[220px] ${
                            p.isLocalUser
                              ? 'bg-gradient-to-b from-[#091522] to-[#040A10] border-2 border-emerald-500/70 shadow-emerald-500/10'
                              : p.status === 'Live In Room'
                                ? 'bg-[#091522] border-2 border-blue-500/40 shadow-blue-500/10'
                                : 'bg-[#091522]/80 border border-slate-800'
                          }`}
                        >
                          {/* Hidden Audio Player for Remote Audio Stream */}
                          {!p.isLocalUser && remoteStream && (
                            <audio
                              autoPlay
                              ref={(el) => {
                                if (el && el.srcObject !== remoteStream) {
                                  el.srcObject = remoteStream;
                                  el.play().catch(() => {});
                                }
                              }}
                            />
                          )}

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
                                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Connected
                                </span>
                              ) : (
                                <span className="text-[10px] text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50 font-mono">
                                  Dispatched
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Center Stage Media: Real Video for Local User OR Real Stream for Remote Users */}
                          <div className="flex-1 flex flex-col items-center justify-center my-2 relative overflow-hidden rounded-2xl bg-black/40">
                            {p.isLocalUser && isVideoOn && localStream ? (
                              <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover rounded-2xl transform -scale-x-100"
                              />
                            ) : !p.isLocalUser && remoteStream && remoteStream.getVideoTracks().length > 0 ? (
                              <video
                                autoPlay
                                playsInline
                                ref={(el) => {
                                  if (el && el.srcObject !== remoteStream) {
                                    el.srcObject = remoteStream;
                                    el.play().catch(() => {});
                                  }
                                }}
                                className="w-full h-full object-cover rounded-2xl"
                              />
                            ) : (
                              <div className="flex flex-col items-center text-center p-3">
                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full font-black text-xl sm:text-2xl flex items-center justify-center shadow-2xl ${
                                  p.isLocalUser
                                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white ring-4 ring-emerald-500/30'
                                    : p.status === 'Live In Room'
                                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white ring-4 ring-blue-500/30'
                                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}>
                                  {p.name.replace('(You)', '').trim().split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <h3 className="text-xs sm:text-sm font-bold text-white mt-2.5 truncate max-w-[180px]">
                                  {p.name}
                                </h3>
                                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-[190px]">
                                  {p.email || p.role}
                                </p>
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
                )}
              </>
            )}

          </div>

          {/* Live Closed Captions Bar */}
          {showCaptions && (
            <div className="mt-3 py-2.5 px-4 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-300 shadow-lg">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-blue-400 shrink-0">
                  {currentUser.name} (You):
                </span>
                <span className="truncate italic text-slate-300">
                  "Connected to the official council session. Reviewing stage-gate signoff for Level 5 slab casting."
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 hidden sm:inline">
                Live In-App Subtitles
              </span>
            </div>
          )}

          {/* FLOATING BOTTOM CONTROL DOCK */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            
            {/* Meeting Link Copy Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const liveLink = getLiveMeetingUrl();
                  navigator.clipboard.writeText(liveLink);
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Live room link copied (${liveLink})!`, type: 'success' } }));
                }}
                className="px-3.5 py-2 rounded-2xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-600/40 text-blue-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-950/50"
                title="Copy Live Production Meeting Link"
              >
                <Copy size={14} className="text-blue-400" />
                <span className="font-mono text-[11px]">Copy Live Portal Link</span>
              </button>
            </div>

            {/* Core Media Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Mic Toggle */}
              <button
                onClick={handleToggleMic}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shadow-lg ${
                  isMicOn 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                }`}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                <span className="hidden md:inline">{isMicOn ? 'Mute' : 'Unmute'}</span>
              </button>

              {/* Video Toggle */}
              <button
                onClick={handleToggleVideo}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shadow-lg ${
                  isVideoOn 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                }`}
                title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
                <span className="hidden md:inline">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
              </button>

              {/* Screen Share Toggle */}
              <button
                onClick={handleToggleScreenShare}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shadow-lg ${
                  isScreenSharing 
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-blue-600/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isScreenSharing ? 'Stop Screen Sharing' : 'Share BIM / Screen'}
              >
                <Share2 size={18} />
                <span className="hidden md:inline">{isScreenSharing ? 'Sharing Screen' : 'Share Screen'}</span>
              </button>

              {/* Raise Hand Toggle */}
              <button
                onClick={handleToggleRaiseHand}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                  isHandRaised 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
              >
                <Hand size={18} />
                <span className="hidden md:inline">{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
              </button>

              {/* Captions Toggle */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                  showCaptions ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
                title="Toggle Live Subtitles"
              >
                <Subtitles size={18} />
              </button>

            </div>

            {/* Right Toggle for Collaboration Drawer */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSidebarOpen 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isSidebarOpen ? 'Collapse Side Panel' : 'Expand Side Panel'}
              >
                <MessageSquare size={18} />
                <span className="hidden sm:inline">Collaboration &amp; People</span>
              </button>
            </div>

          </div>

        </main>

        {/* RIGHT COLLAPSIBLE COLLABORATION & INVITATION DRAWER */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 390, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-[#08121E]/95 border-l border-slate-800/90 flex flex-col shadow-2xl overflow-hidden shrink-0 z-20"
            >
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
                          <span>Invite Stakeholder via Email</span>
                        </span>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          Resend API
                        </span>
                      </div>

                      <div>
                        <input
                          type="email"
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="e.g. developer@nexucon.net"
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
                          <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
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
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${
                              p.status === 'Live In Room' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {p.status}
                            </span>
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
                          <option value="Engr. Babatunde Sanwo">Engr. Babatunde Sanwo (Agency Head)</option>
                          <option value="Michael Thorne (Nexucon)">Michael Thorne (Master Developer)</option>
                          <option value="Marcus Chen (Inspector)">Marcus Chen (Inspector)</option>
                          <option value="David Rivera (Apex)">David Rivera (Contractor)</option>
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

                {/* TAB 2: MINUTES NOTES */}
                {activeTab === 'minutes' && (
                  <div className="space-y-3 flex flex-col h-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                        Live Meeting Minutes
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Auto-Audited
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={minutesText}
                      onChange={(e) => setMinutesText(e.target.value)}
                      placeholder="Record formal resolutions, stage-gate conditions, and engineering observations..."
                      className="w-full flex-1 p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-mono resize-none"
                    />

                    <button
                      onClick={handleSaveMinutes}
                      disabled={isSavingMinutes}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

                {/* TAB 4: LIVE CHAT */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full space-y-3">
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-blue-400">{msg.sender} ({msg.role})</span>
                            <span className="text-slate-500 font-mono">{msg.time}</span>
                          </div>
                          <p className="text-xs text-slate-200">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        placeholder="Send message to council..."
                        className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!newChatMessage.trim()}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Send size={15} />
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </motion.aside>
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
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Stakeholder Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. developer@nexucon.net, inspector@gov.ng"
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

    </div>
  );
}
