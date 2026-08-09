"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Shield, Download, Lock, Search, Filter, CalendarDays, ExternalLink, ShieldCheck } from "lucide-react";

export default function AuditRecords() {
  const records = [
    {
      id: "AR-2026-Q3",
      title: "Q3 Official Compliance & Environmental Audit",
      dateSealed: "Oct 01, 2026",
      sealedBy: "City Oversight Board",
      size: "14.2 MB",
      status: "Immutable Record",
      hash: "0x8f2a...391c",
      description: "Comprehensive package containing all Q3 safety logs, environmental sensor data, and structural sign-offs."
    },
    {
      id: "AR-2026-Q2",
      title: "Q2 Master Project Audit",
      dateSealed: "Jul 01, 2026",
      sealedBy: "City Oversight Board",
      size: "12.8 MB",
      status: "Immutable Record",
      hash: "0x4b1d...9f2a",
      description: "Q2 consolidated permit decisions, inspector logs, and contractor prequalifications."
    },
    {
      id: "AR-2026-Q1",
      title: "Q1 Master Project Audit",
      dateSealed: "Apr 01, 2026",
      sealedBy: "City Oversight Board",
      size: "10.5 MB",
      status: "Immutable Record",
      hash: "0x1a9c...77e2",
      description: "Initial groundbreaking compliance package. Contains master zoning variances and foundational permits."
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      {/* High Security Header */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm mt-1 border border-white/20">
              <ShieldCheck size={32} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                Sealed Audit Records
              </h1>
              <p className="text-slate-300 mt-2 max-w-xl text-sm leading-relaxed">
                Legally binding, immutable compliance packets generated for official oversight. These records are cryptographically sealed and cannot be modified.
              </p>
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col gap-2">
             <button className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg transition-colors border border-blue-400/50">
               <Lock size={18} />
               Generate New Record
             </button>
             <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-wider">
               Requires Director Auth
             </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Search by ID or Title..." 
               className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 shadow-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
             />
           </div>
           <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
             <Filter size={16} /> Filter
           </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {records.map((record, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={record.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row"
            >
              <div className="p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-bold text-slate-900">{record.title}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                      <Lock size={10} /> {record.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4 text-xs font-semibold text-gray-500">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">{record.id}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1"><CalendarDays size={14} /> Sealed: {record.dateSealed}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>By: {record.sealedBy}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-0">
                    {record.description}
                  </p>
                </div>
              </div>

              {/* Action Sidebar */}
              <div className="p-6 border-t md:border-t-0 md:border-l border-gray-100 bg-slate-50 flex flex-col justify-center md:w-1/3">
                <div className="mb-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">SHA-256 Hash</p>
                  <p className="text-xs font-mono font-bold text-slate-700 bg-white border border-gray-200 px-2 py-1 rounded inline-block">
                    {record.hash}
                  </p>
                </div>
                
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl font-bold shadow-sm hover:bg-slate-700 transition-colors text-sm mb-2">
                  <Download size={16} /> Download Package ({record.size})
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm">
                  View Manifest <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
