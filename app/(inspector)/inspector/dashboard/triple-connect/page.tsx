"use client";

import React, { useState } from "react";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneMissed,
  Users,
  Settings,
  Share2,
  ShieldCheck,
  Radio,
  MapPin,
  Clock,
  Layers,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function TripleConnectLiveStreamPage() {
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/inspector/dashboard" className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Triple Connect Live-Stream</h1>
          <p className="text-sm text-slate-500 font-medium">Remote Incident Review & Real-time Collaboration</p>
        </div>
      </div>

      {/* Main Broadcast Arena */}
      <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row min-h-[600px]">
        
        {/* Stream Canvas */}
        <div className="flex-1 relative flex flex-col">
          {/* Top Overlay Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLive ? 'bg-rose-500/90 text-white' : 'bg-slate-700/80 text-slate-300'}`}>
                {isLive ? <><span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE STREAMING</> : "OFFLINE"}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-slate-300 text-[11px] font-mono flex items-center gap-1.5">
                <Clock size={12} /> 00:00:00
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-black/40 border border-white/10 text-emerald-400">
                <ShieldCheck size={16} />
              </span>
              <span className="p-2 rounded-xl bg-black/40 border border-white/10 text-cyan-400">
                <MapPin size={16} />
              </span>
            </div>
          </div>

          {/* Placeholder Viewfinder */}
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center relative bg-gradient-to-br from-slate-900 to-slate-950">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            
            <div className="w-24 h-24 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-6 relative z-10">
              <Radio size={40} className={isLive ? "text-rose-500 animate-pulse" : "text-slate-600"} />
            </div>
            <h2 className="text-xl font-bold text-slate-200 mb-2 z-10">
              {isLive ? "Transmitting Feed..." : "Camera Feed Standby"}
            </h2>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed z-10">
              Connect your field camera or mobile device to initiate the Triple Connect live-stream with Government HQ and Lead Engineers.
            </p>
          </div>

          {/* Bottom Control Bar */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-xl border transition-colors ${isMuted ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-3 rounded-xl border transition-colors ${isVideoOff ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
                {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
              </button>
            </div>
            
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-8 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center gap-2 ${isLive ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/50' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/50'}`}
            >
              {isLive ? <PhoneMissed size={18} /> : <Radio size={18} />}
              {isLive ? "END BROADCAST" : "START LIVE FEED"}
            </button>
            
            <div className="flex items-center gap-2">
              <button className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors">
                <Settings size={18} />
              </button>
              <button className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel: Participants & Chat */}
        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Active Participants</h3>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-xs font-mono text-cyan-400">3</span>
          </div>
          
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">YOU</div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Field Inspector (Site)</p>
                  <p className="text-[10px] text-emerald-400">Host • Transmitting</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">GOV</div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Gov. Command Center</p>
                  <p className="text-[10px] text-slate-400">Standby</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">ENG</div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Lead Engineer (Remote)</p>
                  <p className="text-[10px] text-slate-400">Standby</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-800">
            <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition-colors">
              <Users size={16} /> Invite Stakeholders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
