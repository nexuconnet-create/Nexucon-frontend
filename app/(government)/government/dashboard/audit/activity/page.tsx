"use client";

import React from "react";
import { motion } from "framer-motion";
import { History, Filter, Download, FileText, CheckCircle2, ShieldAlert, User, Clock, FileSignature } from "lucide-react";

export default function ActivityLog() {
  const logs = [
    {
      id: "LOG-01",
      user: "Sarah Jenkins",
      role: "Lead Safety Officer",
      action: "Generated Non-Conformance Report",
      target: "NCR-8892: Noise Limit Violation",
      timestamp: "Today, 10:45 AM",
      icon: ShieldAlert,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      id: "LOG-02",
      user: "Marcus Chen",
      role: "Structural Engineer",
      action: "Approved Technical Review",
      target: "TR-502: HVAC Load Calculations",
      timestamp: "Today, 09:12 AM",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      id: "LOG-03",
      user: "David Rivera",
      role: "Project Manager (Apex)",
      action: "Uploaded Revised Document",
      target: "DOC-992: Master Subcontractor Agreement (v2)",
      timestamp: "Yesterday, 04:30 PM",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      id: "LOG-04",
      user: "Elena Rodriguez",
      role: "City Planner",
      action: "Signed Permit",
      target: "PRM-B-8902: Foundation Excavation",
      timestamp: "Yesterday, 11:15 AM",
      icon: FileSignature,
      color: "text-purple-500",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Project Activity Log
          </h1>
          <p className="text-gray-500 mt-1">Chronological timeline of all system actions, uploads, and approvals.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter Logs
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
        >
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>

            <div className="space-y-8 relative">
              {logs.map((log, idx) => (
                <div key={log.id} className="flex gap-6 relative">
                  {/* Timeline Node */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 ${log.bg} ${log.color}`}>
                    <log.icon size={20} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-2 pb-4 border-b border-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-gray-900">{log.user}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {log.role}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 shrink-0">
                        <Clock size={12} /> {log.timestamp}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium text-gray-500">{log.action}: </span>
                      <span className="font-bold">{log.target}</span>
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Load More Node */}
              <div className="flex gap-6 relative pt-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-gray-50 text-gray-400 border-4 border-white shadow-sm z-10">
                  <History size={20} />
                </div>
                <div className="flex-1 pt-3">
                  <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Load Older Activity...
                  </button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
