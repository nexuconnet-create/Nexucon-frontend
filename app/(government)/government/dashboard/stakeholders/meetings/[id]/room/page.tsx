"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, Phone, PhoneOff, Mic, MicOff, VideoOff, Share2, 
  Users, MessageSquare, ShieldCheck, CheckCircle2, Clock, 
  ArrowLeft, ExternalLink, Sparkles, AlertTriangle, 
  ListTodo, Plus, Check, FileText, Send, Vote, Volume2, 
  Radio, Copy, Globe, RefreshCw, UserCheck, ShieldAlert
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

  // Active Sidebar Tab
  const [activeTab, setActiveTab] = useState<'action_items' | 'minutes' | 'participants' | 'voting'>('action_items');

  // Collaboration State
  const [minutesText, setMinutesText] = useState('');
  const [isSavingMinutes, setIsSavingMinutes] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('Engr. Babatunde Sanwo');
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);
  const [isAddingAction, setIsAddingAction] = useState(false);

  // Voting State
  const [voteStatus, setVoteStatus] = useState<'IDLE' | 'VOTED_YES' | 'VOTED_NO'>('IDLE');
  const [quorumVotes, setQuorumVotes] = useState({ yes: 3, no: 0, total: 4 });

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(148); // e.g. 2m 28s

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
      // Local optimistic fallback
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

  // Compute Google Meet Link
  const meetUrl = meeting?.google_meet_url || `https://meet.google.com/nxu-${(meeting?.room_id || 'mtg').slice(0, 4)}-hub`;

  return (
    <div className="w-full min-h-screen bg-[#070E17] text-slate-100 flex flex-col justify-between overflow-hidden">
      
      {/* Top Bar Navigation */}
      <header className="px-6 py-4 bg-[#0A1420]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/government/dashboard/stakeholders/meetings')}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Council Dashboard</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                {meeting?.meeting_reference || 'MTG-SESSION'}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE COUNCIL SESSION
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">
                ⏱️ {formatElapsed(elapsedSeconds)}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white mt-1">
              {meeting?.title || 'Q3 Structural Stage-Gate Deliberation & GPR Review'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Launch Google Meet Web/App</span>
          </a>

          <button
            onClick={() => router.push('/government/dashboard/stakeholders/meetings')}
            className="px-4 py-2.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/20"
          >
            <PhoneOff size={14} />
            <span>Leave Council</span>
          </button>
        </div>
      </header>

      {/* Main Room Body: Left Stage + Right Collaboration Drawer */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-6 overflow-hidden">
        
        {/* Left Video Stage (8 cols) */}
        <section className="lg:col-span-8 flex flex-col justify-between rounded-3xl bg-[#0C1929]/90 border border-slate-800/90 p-5 shadow-2xl relative overflow-hidden">
          
          {/* Active Stage Participants Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            
            {/* Primary Speaker Box 1: Agency Head (Engr. Babatunde Sanwo) */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#091522] to-[#040A10] border-2 border-blue-500/60 p-4 flex flex-col justify-between overflow-hidden shadow-inner group">
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-lg shadow">
                  🏛️ Council Lead / Agency Head
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  <Volume2 size={12} className="animate-pulse" /> Speaking
                </span>
              </div>

              {/* Avatar / Video Stream Mock */}
              <div className="flex-1 flex flex-col items-center justify-center my-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-xl ring-4 ring-blue-500/30">
                  BS
                </div>
                <h3 className="text-sm font-bold text-white mt-3">Engr. Babatunde Sanwo</h3>
                <p className="text-[11px] text-slate-400 font-medium">Director General, Regulatory Directorate</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-semibold text-slate-400">Audio 48kHz • 1080p Stream</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
              </div>
            </div>

            {/* Participant Box 2: Master Developer (Michael Thorne) */}
            <div className="relative rounded-2xl bg-[#091522] border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg">
                  🏗️ Master Developer
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center my-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-200 font-bold text-xl flex items-center justify-center border border-slate-700">
                  MT
                </div>
                <h3 className="text-sm font-bold text-white mt-3">Michael Thorne</h3>
                <p className="text-[11px] text-slate-400 font-medium">Nexucon Real Estate Dev Ltd</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800/80">
                <span className="text-[10px]">Client Audio Verified</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* Participant Box 3: Lead Structural Inspector (Marcus Chen) */}
            <div className="relative rounded-2xl bg-[#091522] border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg">
                  🔍 Lead Inspector
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  Zone A Assigned
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center my-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-200 font-bold text-xl flex items-center justify-center border border-slate-700">
                  MC
                </div>
                <h3 className="text-sm font-bold text-white mt-3">Marcus Chen</h3>
                <p className="text-[11px] text-slate-400 font-medium">Senior Structural Auditor</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800/80">
                <span className="text-[10px]">Field Telemetry Syncing</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* Participant Box 4: General Contractor (David Rivera) */}
            <div className="relative rounded-2xl bg-[#091522] border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg">
                  👷 General Contractor
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  Apex Construction
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center my-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-200 font-bold text-xl flex items-center justify-center border border-slate-700">
                  DR
                </div>
                <h3 className="text-sm font-bold text-white mt-3">David Rivera</h3>
                <p className="text-[11px] text-slate-400 font-medium">Project Director (Apex)</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-slate-800/80">
                <span className="text-[10px]">Site Engineer Connected</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>

          </div>

          {/* Google Meet Direct Link Banner */}
          <div className="mt-4 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Globe size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Google Meet Conference Room</p>
                <p className="text-[11px] font-mono text-slate-400">{meetUrl}</p>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(meetUrl);
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Google Meet link copied to clipboard!', type: 'success' } }));
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy size={13} />
              <span>Copy Link</span>
            </button>
          </div>

          {/* Video / Audio Control Dock */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                isMicOn 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
              <span>{isMicOn ? 'Mute' : 'Unmuted'}</span>
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                isVideoOn 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              <span>{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                isScreenSharing 
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              <Share2 size={18} />
              <span>{isScreenSharing ? 'Sharing BIM Screen' : 'Share BIM / Screen'}</span>
            </button>

            <button
              onClick={() => setIsHandRaised(!isHandRaised)}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                isHandRaised 
                  ? 'bg-amber-500 text-slate-900 font-black' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              <span>✋</span>
              <span>{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
            </button>
          </div>

        </section>

        {/* Right Collaboration Drawer (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col rounded-3xl bg-[#0A1420]/90 border border-slate-800/90 shadow-2xl overflow-hidden">
          
          {/* Collaboration Tabs */}
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
              <span>Action Items</span>
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
              <span>Vote / Gate</span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            
            {/* TAB 1: ACTION ITEMS */}
            {activeTab === 'action_items' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Council Action Items &amp; Directives
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

                {/* Add Action Item Form */}
                <form onSubmit={handleAddAction} className="pt-2 border-t border-slate-800/80 space-y-2">
                  <input
                    type="text"
                    required
                    value={newActionTitle}
                    onChange={(e) => setNewActionTitle(e.target.value)}
                    placeholder="Add statutory action item..."
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
                    Live Meeting Minutes &amp; Deliberation Record
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
                  <span>{isSavingMinutes ? 'Saving to Blockchain Audit Ledger...' : 'Save & Publish Official Minutes'}</span>
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

          </div>

        </aside>

      </main>

    </div>
  );
}
