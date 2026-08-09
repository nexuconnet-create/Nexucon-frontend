"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, ShieldAlert, ArrowRight, Flag, Calendar, MessageSquare, AlertCircle } from "lucide-react";

export default function EscalatedReviews() {
  const escalations = [
    {
      id: "ESC-892",
      title: "Disputed Environmental NCR Penalty",
      type: "Dispute",
      bottleneck: "Legal Review Pending",
      daysOverdue: 14,
      originalRequest: "REQ-8840",
      escalatedBy: "EcoSolve Ltd.",
      dateEscalated: "Oct 01, 2026",
      severity: "Critical",
      details: "Subcontractor disputes the non-conformance penalty for dust control violation, citing inaccurate sensor data."
    },
    {
      id: "ESC-891",
      title: "Blocked Foundation Permit (Zone B)",
      type: "Blocker",
      bottleneck: "Missing Geotech Sign-off",
      daysOverdue: 7,
      originalRequest: "PRM-B-8801",
      escalatedBy: "Apex Construction",
      dateEscalated: "Oct 05, 2026",
      severity: "High",
      details: "Cannot proceed with concrete pour until the independent geotechnical report is approved and signed."
    },
    {
      id: "ESC-889",
      title: "Overdue HVAC Submittal Approval",
      type: "Overdue",
      bottleneck: "MEP Engineer Workload",
      daysOverdue: 5,
      originalRequest: "REQ-8870",
      escalatedBy: "Project Manager",
      dateEscalated: "Oct 07, 2026",
      severity: "Medium",
      details: "Standard review SLA of 10 days exceeded. Needs urgent reassignment to prevent schedule slippage."
    }
  ];

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600 text-white shadow-red-500/30';
      case 'High': return 'bg-orange-500 text-white shadow-orange-500/30';
      case 'Medium': return 'bg-amber-500 text-white shadow-amber-500/30';
      default: return 'bg-gray-500 text-white shadow-gray-500/30';
    }
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'Dispute': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Blocker': return 'text-red-700 bg-red-50 border-red-200';
      case 'Overdue': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldAlert className="text-red-500" />
            Escalated Reviews & Blockers
          </h1>
          <p className="text-gray-500 mt-1">Immediate attention required for blocked, overdue, or disputed approvals.</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertCircle size={32} className="text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-red-900 mb-1">Attention Required</h2>
          <p className="text-sm text-red-700 font-medium">There are currently <span className="font-bold">3 active escalations</span> that are causing delays in the project critical path. Please review and resolve or reassign these bottlenecks immediately.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {escalations.map((esc, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={esc.id}
            className="bg-white rounded-2xl border-2 border-red-100 shadow-sm overflow-hidden flex flex-col md:flex-row group"
          >
            {/* Left Status Bar */}
            <div className={`w-2 md:w-3 ${getSeverityStyle(esc.severity)}`}></div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${getSeverityStyle(esc.severity)}`}>
                      {esc.severity} Priority
                    </span>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getTypeStyle(esc.type)}`}>
                      {esc.type}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">
                      {esc.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-lg text-sm font-bold">
                    <Clock size={16} />
                    {esc.daysOverdue} Days Overdue
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-red-600 transition-colors">
                  {esc.title}
                </h3>
                <p className="text-sm text-gray-600 mb-6 max-w-3xl leading-relaxed">
                  {esc.details}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Current Bottleneck</span>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <Flag size={14} className="text-red-500" /> {esc.bottleneck}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Escalated By</span>
                  <p className="text-sm font-semibold text-gray-800">{esc.escalatedBy}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Original Request</span>
                  <p className="text-sm font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                    {esc.originalRequest} <ArrowRight size={12} />
                  </p>
                </div>
              </div>
            </div>

            {/* Right Action Area */}
            <div className="bg-gray-50/50 p-6 border-l border-gray-100 flex flex-col justify-center gap-3 min-w-[240px]">
              <button className="w-full py-2.5 bg-red-600 text-white rounded-lg font-bold shadow-md hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2">
                <AlertTriangle size={16} /> Resolve Escalation
              </button>
              <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm">
                Reassign Workflow
              </button>
              <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
                <MessageSquare size={16} /> Discussion Thread
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
