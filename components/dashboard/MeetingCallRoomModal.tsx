"use client";

import React, { useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Users, ScreenShare, Shield, MessageSquare, Volume2 } from 'lucide-react';
import { StakeholderMeeting } from '@/services/stakeholders';

interface MeetingCallRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: StakeholderMeeting | null;
}

export default function MeetingCallRoomModal({
  isOpen,
  onClose,
  meeting
}: MeetingCallRoomModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 bg-[#0A1015]/90 backdrop-blur-md z-[120] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0F1820] border border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0B1218]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {meeting.title}
                <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                  {meeting.meeting_reference}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">Host: {meeting.initiator_name} • Room: {meeting.room_id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Feeds Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 overflow-y-auto bg-[#070D12]">
          
          {/* Main Feed: Agency Head */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B1520] to-[#04101A] border border-slate-800/80 flex items-center justify-center overflow-hidden min-h-[220px]">
            <div className="w-20 h-20 rounded-full bg-blue-600/30 border-2 border-blue-400 text-blue-300 flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/10">
              BS
            </div>
            <div className="absolute bottom-3 left-3 bg-[#0A121A]/80 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-bold text-white border border-slate-700/60 flex items-center gap-2">
              <Shield size={12} className="text-emerald-400" />
              Engr. Babatunde Sanwo (Agency Head)
            </div>
            <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <Volume2 size={10} /> Speaking
            </div>
          </div>

          {/* Feed 2: Developer */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-[#0C171F] to-[#0A1017] border border-slate-800/80 flex items-center justify-center overflow-hidden min-h-[220px]">
            <div className="w-20 h-20 rounded-full bg-emerald-600/30 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center font-black text-2xl">
              MT
            </div>
            <div className="absolute bottom-3 left-3 bg-[#0A121A]/80 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-bold text-white border border-slate-700/60">
              Michael Thorne (Nexucon Dev)
            </div>
          </div>

          {/* Feed 3: Contractor */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-[#12161E] to-[#0A0E15] border border-slate-800/80 flex items-center justify-center overflow-hidden min-h-[220px]">
            <div className="w-20 h-20 rounded-full bg-amber-600/30 border-2 border-amber-400 text-amber-300 flex items-center justify-center font-black text-2xl">
              DR
            </div>
            <div className="absolute bottom-3 left-3 bg-[#0A121A]/80 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-bold text-white border border-slate-700/60">
              David Rivera (Apex Construction)
            </div>
          </div>

          {/* Feed 4: Inspector */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-[#101420] to-[#080B12] border border-slate-800/80 flex items-center justify-center overflow-hidden min-h-[220px]">
            <div className="w-20 h-20 rounded-full bg-purple-600/30 border-2 border-purple-400 text-purple-300 flex items-center justify-center font-black text-2xl">
              MC
            </div>
            <div className="absolute bottom-3 left-3 bg-[#0A121A]/80 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-bold text-white border border-slate-700/60">
              Marcus Chen (Lead Inspector)
            </div>
          </div>

        </div>

        {/* Bottom Call Controls */}
        <div className="p-4 bg-[#0B1218] border-t border-slate-800 flex items-center justify-center gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-colors ${
              isMuted ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-700'
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-colors ${
              isVideoOff ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-700'
            }`}
            title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <button 
            onClick={() => {
              setIsScreenSharing(!isScreenSharing);
              window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: isScreenSharing ? 'Screen sharing stopped' : 'Screen sharing active', type: 'info' } 
              }));
            }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-colors ${
              isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-700'
            }`}
            title="Share Screen"
          >
            <ScreenShare size={20} />
          </button>

          <button 
            onClick={onClose}
            className="px-6 h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors shadow-lg shadow-rose-600/30"
          >
            <PhoneOff size={18} /> Leave Call
          </button>
        </div>

      </div>
    </div>
  );
}
