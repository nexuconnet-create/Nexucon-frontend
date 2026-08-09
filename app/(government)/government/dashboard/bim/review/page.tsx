"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileSearch, MessageSquare, Check, X, 
  Maximize, Minimize, MousePointer2, Ruler, 
  BoxSelect, Camera, MoreHorizontal, Send
} from "lucide-react";

export default function DesignReview() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState('select');

  const comments = [
    { id: 1, author: "Sarah Jenkins", role: "Lead Architect", time: "2 hours ago", text: "The headroom clearance here seems to be under the 2.4m requirement. Can we check the HVAC ducting placement?", status: "open" },
    { id: 2, author: "Michael Chen", role: "MEP Engineer", time: "1 hour ago", text: "I've reviewed the ducting. We can route it closer to the beam web. I'll issue an update in the next revision.", status: "resolved" },
    { id: 3, author: "Alex Rivera", role: "Structural", time: "45 mins ago", text: "Please ensure the new duct routing doesn't interfere with the secondary beam connections.", status: "open" },
  ];

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-100 flex flex-col' : 'min-h-[calc(100vh-8rem)] flex flex-col'}`}>
      
      {/* Header */}
      <div className={`flex items-center justify-between gap-4 mb-4 ${isFullscreen ? 'p-4 bg-white border-b shadow-sm' : ''}`}>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileSearch className="text-blue-500" />
            Design Review: Downtown Metro Station
          </h1>
          <p className="text-sm text-gray-500 mt-1">Reviewing Architecture Model v2.4</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm text-sm font-semibold">
            <X size={16} />
            Request Changes
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md text-sm font-semibold">
            <Check size={16} />
            Approve Design
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col lg:flex-row gap-6 ${isFullscreen ? 'p-4 overflow-hidden' : ''}`}>
        
        {/* Left: 3D Viewer Area */}
        <div className={`relative flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-200 shadow-inner overflow-hidden min-h-[400px] flex flex-col`}>
          {/* Viewer Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-lg z-10 shadow-lg">
            {[
              { id: 'select', icon: MousePointer2, label: 'Select' },
              { id: 'measure', icon: Ruler, label: 'Measure' },
              { id: 'section', icon: BoxSelect, label: 'Section Box' },
              { id: 'snapshot', icon: Camera, label: 'Snapshot' },
            ].map(tool => (
              <button 
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={`p-2 rounded-md transition-colors ${
                  activeTool === tool.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                <tool.icon size={18} />
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors z-10"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          {/* Grid Background Mockup */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" style={{ backgroundSize: '50px' }}></div>
          
          <div className="flex-1 flex items-center justify-center relative z-0">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto border-4 border-blue-500/30 rounded-xl mb-4 animate-pulse flex items-center justify-center bg-blue-500/10 backdrop-blur-sm">
                <FileSearch size={40} className="text-blue-400" />
              </div>
              <p className="text-gray-400 font-medium">Interactive 3D Viewer Placeholder</p>
              <p className="text-xs text-gray-500 mt-2">Model geometry and textures would render here.</p>
            </div>
          </div>

          {/* Context Menu Overlay Mockup */}
          {activeTool === 'measure' && (
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm border border-white/10 text-white text-xs px-3 py-2 rounded-lg">
              Click two points to measure distance.
            </div>
          )}
        </div>

        {/* Right: Comments / Threads */}
        <div className={`w-full lg:w-[400px] flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm ${isFullscreen ? 'h-full' : 'h-[600px] lg:h-auto'}`}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" />
              Review Comments
            </h3>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">3 items</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={comment.id}
                className={`p-4 rounded-xl border ${
                  comment.status === 'resolved' ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-blue-50/30 border-blue-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {comment.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-none">{comment.author}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{comment.role} • {comment.time}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={14} /></button>
                </div>
                <p className="text-sm text-gray-700 mt-3">{comment.text}</p>
                
                {comment.status === 'resolved' && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-flex">
                    <Check size={12} /> Resolved
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <div className="relative">
              <textarea 
                placeholder="Add a review comment..." 
                className="w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              ></textarea>
              <button className="absolute bottom-3 right-3 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
