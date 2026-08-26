"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, Phone, PhoneOff, Mic, MicOff, VideoOff, Share2, 
  Users, MessageSquare, ShieldCheck, CheckCircle2, Clock, 
  ArrowLeft, ExternalLink, Sparkles, AlertTriangle, 
  ListTodo, Plus, Check, FileText, Send, Vote, Volume2, 
  Radio, Copy, Globe, RefreshCw, UserCheck, ShieldAlert,
  Maximize2, Minimize2, LayoutGrid, User, Layers, 
  Subtitles, ChevronRight, ChevronLeft, Hand, Smile
} from "lucide-react";
import { 
  StakeholderMeeting, getMeetingById, updateMeetingNotes, 
  addMeetingActionItem, MeetingActionItem 
} from "@/services/stakeholders";

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = (params?.id as string) || '';

  const [meeting, setMeeting] = useState<StakeholderMeeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Audio/Video Controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<'sanwo' | 'thorne' | 'chen' | 'rivera'>('sanwo');

  // Fullscreen & Layout Modes
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'spotlight'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Active Sidebar Tab
  const [activeTab, setActiveTab] = useState<'action_items' | 'minutes' | 'voting' | 'chat'>('action_items');

  // Collaboration State
  const [minutesText, setMinutesText] = useState('');
  const [isSavingMinutes, setIsSavingMinutes] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('Engr. Babatunde Sanwo');
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);
  const [isAddingAction, setIsAddingAction] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; role: string; text: string; time: string }>>([
    { sender: 'Engr. Babatunde Sanwo', role: 'Agency Head', text: 'Welcome everyone. We are reviewing the Level 5 slab casting certification.', time: '10:02 AM' },
    { sender: 'Marcus Chen', role: 'Inspector', text: 'Telemetry GPR scan confirms rebar spacing compliance along Grid 4.', time: '10:04 AM' },
    { sender: 'David Rivera', role: 'Contractor', text: 'Ready to proceed with concrete pour once quorum vote is recorded.', time: '10:05 AM' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Voting State
  const [voteStatus, setVoteStatus] = useState<'IDLE' | 'VOTED_YES' | 'VOTED_NO'>('IDLE');
  const [quorumVotes, setQuorumVotes] = useState({ yes: 3, no: 0, total: 4 });

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(248); // 4m 08s

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Speaker switching simulation for dynamic realism
  useEffect(() => {
    const speakerInterval = setInterval(() => {
      const speakers: Array<'sanwo' | 'thorne' | 'chen' | 'rivera'> = ['sanwo', 'chen', 'thorne', 'rivera'];
      setActiveSpeaker(speakers[Math.floor(Math.random() * speakers.length)]);
    }, 12000);
    return () => clearInterval(speakerInterval);
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
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'Engr. Babatunde Sanwo',
        role: 'Agency Head',
        text: newChatMessage.trim(),
        time
      }
    ]);
    setNewChatMessage('');
  };

  const handleCastVote = (vote: 'YES' | 'NO') => {
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
  };

  // Google Meet Room Link
  const meetUrl = (meeting?.google_meet_url && !meeting.google_meet_url.includes('nxu-'))
    ? meeting.google_meet_url 
    : 'https://meet.google.com/new';

  return (
    <div className="fixed inset-0 z-[120] w-screen h-screen bg-[#060D15] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Top Header Bar (Full-Bleed Glassmorphism) */}
      <header className="h-16 px-5 bg-[#091422]/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-30 shrink-0">
        
        {/* Left: Meeting Info */}
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
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE COUNCIL
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded">
                ⏱️ {formatElapsed(elapsedSeconds)}
              </span>
            </div>
            <h1 className="text-sm font-black text-white truncate max-w-[280px] sm:max-w-md mt-0.5">
              {meeting?.title || 'Q3 Structural Stage-Gate Deliberation & GPR Review'}
            </h1>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Layout Mode Toggle */}
          <button
            onClick={() => setLayoutMode(layoutMode === 'grid' ? 'spotlight' : 'grid')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title={layoutMode === 'grid' ? 'Switch to Spotlight View' : 'Switch to Grid View'}
          >
            <LayoutGrid size={15} />
            <span className="hidden md:inline">{layoutMode === 'grid' ? 'Grid' : 'Spotlight'}</span>
          </button>

          {/* Browser Fullscreen Toggle */}
          <button
            onClick={toggleNativeFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isNativeFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isNativeFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Direct Google Meet Launch */}
          <a
            href={meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <ExternalLink size={14} />
            <span className="hidden lg:inline">Google Meet App</span>
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
            
            {/* SPOTLIGHT / SCREEN SHARING VIEW */}
            {layoutMode === 'spotlight' || isScreenSharing ? (
              <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                
                {/* Main Spotlight Window */}
                <div className="flex-1 bg-gradient-to-b from-[#0B1726] to-[#04080F] rounded-3xl border-2 border-blue-500/50 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between z-10">
                    <span className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-xl flex items-center gap-1.5 shadow">
                      <Share2 size={14} />
                      <span>{isScreenSharing ? 'Active BIM Model Screen Stream (3D Structural)' : 'Primary Speaker Stage'}</span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-800 flex items-center gap-1">
                      <Volume2 size={13} className="animate-pulse" /> Active Audio
                    </span>
                  </div>

                  {/* Spotlight Center Visualizer / BIM Simulation */}
                  <div className="flex-1 flex flex-col items-center justify-center my-4">
                    {isScreenSharing ? (
                      <div className="text-center space-y-3">
                        <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 animate-pulse">
                          <Layers size={48} />
                        </div>
                        <h2 className="text-lg font-black text-white">Revit BIM Model - Level 5 Post-Tensioned Slab Mesh</h2>
                        <p className="text-xs text-slate-400 font-mono">Live Screen Sharing • 60 FPS • 1080p Crystal Clear</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-4xl flex items-center justify-center shadow-2xl ring-8 ring-blue-500/20">
                          BS
                        </div>
                        <h2 className="text-xl font-black text-white">Engr. Babatunde Sanwo</h2>
                        <p className="text-xs text-slate-400 font-medium">Agency Head & Director General • Regulatory Directorate</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono">Conference ID: {meeting?.meeting_reference || 'MTG-1092'}</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      4 Council Members Connected
                    </span>
                  </div>
                </div>

                {/* Bottom Thumbnail Strip */}
                <div className="h-28 grid grid-cols-4 gap-3">
                  {[
                    { name: 'Michael Thorne', role: 'Developer', initials: 'MT', active: activeSpeaker === 'thorne' },
                    { name: 'Marcus Chen', role: 'Inspector', initials: 'MC', active: activeSpeaker === 'chen' },
                    { name: 'David Rivera', role: 'Contractor', initials: 'DR', active: activeSpeaker === 'rivera' },
                    { name: 'Engr. Sanwo', role: 'Agency Head', initials: 'BS', active: activeSpeaker === 'sanwo' },
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl bg-[#091522] border p-2.5 flex items-center gap-3 transition-all ${
                        p.active ? 'border-blue-500 bg-blue-950/20' : 'border-slate-800'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0 border border-slate-700">
                        {p.initials}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              
              /* GRID VIEW MATRIX: 4 EQUAL CARDS (Google Meet Style) */
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 overflow-hidden">
                
                {/* Tile 1: Agency Head (Sanwo) */}
                <div className={`relative rounded-3xl bg-gradient-to-b from-[#091522] to-[#040A10] border-2 p-5 flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${
                  activeSpeaker === 'sanwo' ? 'border-blue-500 shadow-blue-500/10' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-lg shadow">
                      🏛️ Agency Head / Council Lead
                    </span>
                    {activeSpeaker === 'sanwo' && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        <Volume2 size={12} className="animate-pulse" /> Speaking
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center my-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-2xl ring-4 ring-blue-500/30">
                      BS
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-3">Engr. Babatunde Sanwo</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Director General, Regulatory Control</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono">1080p HD • 48kHz Audio</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                  </div>
                </div>

                {/* Tile 2: Master Developer (Michael Thorne) */}
                <div className={`relative rounded-3xl bg-[#091522] border-2 p-5 flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${
                  activeSpeaker === 'thorne' ? 'border-blue-500 shadow-blue-500/10' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-700">
                      🏗️ Master Developer
                    </span>
                    {activeSpeaker === 'thorne' ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        <Volume2 size={12} className="animate-pulse" /> Speaking
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                        Connected
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center my-3">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-slate-800 text-slate-200 font-bold text-xl sm:text-2xl flex items-center justify-center border border-slate-700">
                      MT
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-3">Michael Thorne</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Nexucon Real Estate Dev Ltd</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono">Developer Feed Online</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* Tile 3: Lead Inspector (Marcus Chen) */}
                <div className={`relative rounded-3xl bg-[#091522] border-2 p-5 flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${
                  activeSpeaker === 'chen' ? 'border-blue-500 shadow-blue-500/10' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-700">
                      🔍 Field Inspector
                    </span>
                    {activeSpeaker === 'chen' ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        <Volume2 size={12} className="animate-pulse" /> Speaking
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                        Zone A Assigned
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center my-3">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-slate-800 text-slate-200 font-bold text-xl sm:text-2xl flex items-center justify-center border border-slate-700">
                      MC
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-3">Marcus Chen</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Senior Structural Auditor</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono">Field Telemetry Active</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* Tile 4: General Contractor (David Rivera) */}
                <div className={`relative rounded-3xl bg-[#091522] border-2 p-5 flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${
                  activeSpeaker === 'rivera' ? 'border-blue-500 shadow-blue-500/10' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-700">
                      👷 Lead Contractor
                    </span>
                    {activeSpeaker === 'rivera' ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        <Volume2 size={12} className="animate-pulse" /> Speaking
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                        Apex Construction
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center my-3">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-slate-800 text-slate-200 font-bold text-xl sm:text-2xl flex items-center justify-center border border-slate-700">
                      DR
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-3">David Rivera</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Project Director (Apex)</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono">Site Civil Engineer</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Live Closed Captions Bar */}
          {showCaptions && (
            <div className="mt-3 py-2.5 px-4 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-300 shadow-lg">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-blue-400 shrink-0">
                  {activeSpeaker === 'sanwo' ? 'Engr. Babatunde Sanwo:' :
                   activeSpeaker === 'chen' ? 'Marcus Chen (Inspector):' :
                   activeSpeaker === 'thorne' ? 'Michael Thorne (Dev):' :
                   'David Rivera (Apex):'}
                </span>
                <span className="truncate italic text-slate-300">
                  {activeSpeaker === 'sanwo' ? '"The structural GPR scan is verified. We will proceed to record the quorum signoff for the 5th floor slab."' :
                   activeSpeaker === 'chen' ? '"All rebar ties and cover block spacing on the eastern deck meet code requirements."' :
                   activeSpeaker === 'thorne' ? '"The MEP conduit layout drawings have been cross-checked with the revised structural model."' :
                   '"Casting batch plant pumps are standing by for immediate placement once approval is sealed."'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 hidden sm:inline">
                Live Subtitles
              </span>
            </div>
          )}

          {/* FLOATING BOTTOM CONTROL DOCK */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            
            {/* Meeting Link Pill */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(meetUrl);
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Google Meet link copied to clipboard!', type: 'success' } }));
                }}
                className="px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy Google Meet Link"
              >
                <Copy size={13} />
                <span className="hidden sm:inline font-mono">{meetUrl.replace('https://', '')}</span>
              </button>
            </div>

            {/* Core Media Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Mic Toggle */}
              <button
                onClick={() => setIsMicOn(!isMicOn)}
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
                onClick={() => setIsVideoOn(!isVideoOn)}
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
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shadow-lg ${
                  isScreenSharing 
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-blue-600/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isScreenSharing ? 'Stop Screen Sharing' : 'Share BIM Screen'}
              >
                <Share2 size={18} />
                <span className="hidden md:inline">{isScreenSharing ? 'Sharing BIM' : 'Share BIM'}</span>
              </button>

              {/* Raise Hand */}
              <button
                onClick={() => setIsHandRaised(!isHandRaised)}
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
                <span className="hidden sm:inline">Collaboration Panel</span>
              </button>
            </div>

          </div>

        </main>

        {/* RIGHT COLLAPSIBLE COLLABORATION DRAWER */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-[#08121E]/95 border-l border-slate-800/90 flex flex-col shadow-2xl overflow-hidden shrink-0 z-20"
            >
              {/* Drawer Tabs */}
              <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('action_items')}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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

    </div>
  );
}
