"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Search, Filter, Download, Maximize, Share2, Layers } from "lucide-react";

export default function SubmittedDrawings() {
  const drawings = [
    { id: "DWG-101", title: "Ground Floor Plan - Final", discipline: "Architecture", status: "Approved", version: "v3", date: "Oct 12, 2026", author: "Jenkins S.", type: "PDF" },
    { id: "DWG-102", title: "HVAC Layout Zone A", discipline: "MEP", status: "Under Review", version: "v2", date: "Oct 10, 2026", author: "Chen M.", type: "DWG" },
    { id: "DWG-103", title: "Foundation Reinforcement Details", discipline: "Structural", status: "Approved", version: "v4", date: "Oct 08, 2026", author: "Rivera A.", type: "PDF" },
    { id: "DWG-104", title: "Elevations - North & South", discipline: "Architecture", status: "Rejected", version: "v1", date: "Oct 05, 2026", author: "Jenkins S.", type: "PDF" },
    { id: "DWG-105", title: "Plumbing Riser Diagram", discipline: "MEP", status: "Approved", version: "v2", date: "Oct 02, 2026", author: "Chen M.", type: "PDF" },
    { id: "DWG-106", title: "Roof Framing Plan", discipline: "Structural", status: "Under Review", version: "v1", date: "Sep 28, 2026", author: "Rivera A.", type: "DWG" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20';
      case 'Under Review': return 'bg-amber-400 text-white border-amber-500 shadow-amber-500/20';
      case 'Rejected': return 'bg-red-500 text-white border-red-600 shadow-red-500/20';
      default: return 'bg-gray-500 text-white border-gray-600 shadow-gray-500/20';
    }
  };

  const getDisciplineIcon = (discipline: string) => {
    return <Layers size={14} className="opacity-70" />;
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Submitted Drawings
          </h1>
          <p className="text-gray-500 mt-1">Review, approve, and manage official 2D drawings and plans.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search drawing title or ID..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 p-2 px-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {['All', 'Architecture', 'Structural', 'MEP'].map(filter => (
            <button key={filter} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 rounded-md transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drawings.map((dwg, idx) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={dwg.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex flex-col"
          >
            {/* Blueprint Thumbnail Placeholder */}
            <div className="h-48 bg-[#0a192f] relative overflow-hidden flex items-center justify-center p-4">
              {/* Blueprint Grid Lines */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
              
              <div className="w-full h-full border-2 border-blue-500/30 rounded-lg relative z-10 flex items-center justify-center">
                <FileText size={48} className="text-blue-500/40" />
                <div className="absolute inset-4 border border-blue-500/20 rounded"></div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 left-3 z-20">
                <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border shadow-sm ${getStatusColor(dwg.status)}`}>
                  {dwg.status}
                </span>
              </div>

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center gap-3">
                <button className="p-3 bg-white text-blue-600 rounded-full hover:scale-110 shadow-lg transition-transform" title="View Fullscreen">
                  <Maximize size={20} />
                </button>
                <button className="p-3 bg-white text-blue-600 rounded-full hover:scale-110 shadow-lg transition-transform" title="Download">
                  <Download size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {dwg.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{dwg.id}</span>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{dwg.version}</span>
                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded bg-white">{dwg.type}</span>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-y-3 border-t border-gray-100 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">Discipline</span>
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    {getDisciplineIcon(dwg.discipline)} {dwg.discipline}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">Author</span>
                  <span className="text-xs font-semibold text-gray-700">{dwg.author}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">Submitted On</span>
                  <span className="text-xs font-semibold text-gray-700">{dwg.date}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
