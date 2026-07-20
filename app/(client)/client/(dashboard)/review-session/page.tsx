'use client';

import React, { useState } from 'react';
import { MicOff, Video, MonitorUp, Phone, Volume2, MoreHorizontal, Square, CheckSquare, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ReviewSessionPage() {
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topic: string) => {
    setCheckedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  const topics = [
    'Foundation Layout Review',
    'Structural Reinforcement Review',
    'Design Coordination Issues',
    'Outstanding Comments',
    'Annotation Resolution',
    'Approval Recommendations'
  ];

  const participants = [
    { name: 'Ibrahim Yusuf', role: 'Architect', image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&q=80' },
    { name: 'Sarah Williams', role: 'Structural Engineer', image: 'https://images.unsplash.com/photo-1580893246395-52aead8960dc?w=400&q=80' },
    { name: 'Daniel Otero', role: 'Client Rep', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
    { name: 'Samuel Bello', role: 'Project Manager', image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&q=80' }
  ];

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left Column (Main Stage) */}
        <div className="w-full lg:w-[65%] flex flex-col">
          <div className="mb-8">
            <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
              Live Session
            </h1>
            <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-2xl leading-relaxed">
              Conduct structured collaborative review sessions for drawings, reports, specifications, and project deliverables. Gather technical feedback, discuss findings, resolve issues, and record recommendations before approval.
            </p>
          </div>

          {/* Main Video Player */}
          <div className="relative w-full h-[400px] md:h-[500px] rounded-[32px] overflow-hidden mb-4 shadow-sm bg-gray-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=1200&q=80"
              alt="Main Speaker"
              className="w-full h-full object-cover"
            />

            {/* Live Badge */}
            <div className="absolute top-6 left-6 bg-[#0F181F]/80 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/10">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Live</span>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            </div>

            {/* Volume Control */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 w-8 h-32 bg-[#0F181F]/80 backdrop-blur-md rounded-full flex flex-col items-center justify-between p-2 border border-white/10">
              <div className="w-1 h-[70px] bg-white/20 rounded-full relative mt-2">
                <div className="absolute bottom-0 w-full h-[40px] bg-blue-400 rounded-full"></div>
              </div>
              <Volume2 size={16} className="text-white mb-1" />
            </div>

            {/* Video Controls Pill */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#0F181F]/90 backdrop-blur-md rounded-full p-2 flex items-center gap-2 shadow-2xl border border-white/10">
              <button className="w-12 h-12 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#033A6B] transition-colors">
                <MicOff size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#033A6B] transition-colors">
                <Video size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#033A6B] transition-colors">
                <MonitorUp size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-[#E53935] text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg">
                <Phone size={20} className="rotate-[135deg]" />
              </button>
            </div>
          </div>

          {/* Participant Thumbnails */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {participants.map((participant, index) => (
              <div key={index} className="relative aspect-video rounded-[16px] overflow-hidden bg-gray-900 shadow-sm group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={participant.image}
                  alt={participant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div>
                    <p className="text-[11px] font-bold text-white leading-tight">{participant.name}</p>
                    <p className="text-[9px] font-medium text-gray-300">{participant.role}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#0F181F]/80 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <MicOff size={10} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Review Items */}
          <div>
            <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-4">Active Review Items</h3>
            <div className="flex flex-col gap-3">
              {[
                { title: 'Foundation Layout Plan', type: 'PDF Document • 4.2 MB' },
                { title: 'Structural Reinforcement Details', type: 'CAD File • 12.8 MB' }
              ].map((item, index) => (
                <div key={index} className="w-full bg-[#022C4F] rounded-2xl h-[72px] px-6 flex items-center justify-between hover:bg-[#033A6B] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-white group-hover:text-blue-100 transition-colors">{item.title}</h4>
                      <p className="text-[11px] text-white/60">{item.type}</p>
                    </div>
                  </div>
                  <button className="text-white/60 hover:text-white transition-colors">
                    <MoreHorizontal size={24} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Session Overview) */}
        <div className="w-full lg:w-[35%] flex flex-col">
          <div className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm flex flex-col h-full sticky top-4">
            <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-8">Session Overview</h2>

            {/* Grid details */}
            <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-12">
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Session Title</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">Structural Design Coordination Review</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Project</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">Victoria Heights Residential Estate</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Review Package</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">Structural Design Package V3.0</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Session Type</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">Technical Peer Review</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Status</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">In Progress</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Date</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">June 25, 2026</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Time</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">10:00 AM - 12:00 PM</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Duration</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">2 Hours</span>
              </div>
            </div>

            {/* Session Agenda */}
            <div className="flex-1">
              <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-4">Session Agenda</h3>
              <h4 className="text-[12px] font-bold text-[#0F181F] mb-4">Discussion Topics</h4>

              <div className="flex flex-col gap-4">
                {topics.map(topic => (
                  <div key={topic} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleTopic(topic)}>
                    <div className={`w-[14px] h-[14px] border flex items-center justify-center transition-colors ${checkedTopics[topic] ? 'border-[#0F181F] bg-[#0F181F]' : 'border-gray-300 border-2'}`}>
                      {checkedTopics[topic] && <CheckSquare size={10} className="text-white" />}
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium group-hover:text-gray-900">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col gap-3">
              <Button variant="primary" className="!w-full h-[48px]">
                End Review Session
              </Button>
              <Button variant="outline" className="!w-full h-[48px] bg-black text-white hover:bg-gray-900 border-none">
                Leave Session
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
