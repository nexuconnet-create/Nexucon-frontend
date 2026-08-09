"use client";

import React from "react";
import { motion } from "framer-motion";
import { History, Search, Filter, Download, Calendar, User, FileText, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function ApprovalHistory() {
  const historyLog = [
    {
      id: "LOG-0442",
      refId: "PRM-E-4421",
      title: "Groundwater Discharge Authorization",
      type: "Permit",
      outcome: "Approved",
      decider: "Gov. Environmental Board",
      date: "Oct 12, 2026",
      time: "14:32:11",
      notes: "Approved with standard conditions regarding seasonal limits."
    },
    {
      id: "LOG-0441",
      refId: "DOC-991",
      title: "Budget Reallocation Request - Q4",
      type: "Document Signature",
      outcome: "Approved",
      decider: "Finance Director",
      date: "Oct 11, 2026",
      time: "09:15:00",
      notes: "Fully executed and sent to accounting."
    },
    {
      id: "LOG-0440",
      refId: "TR-499",
      title: "Facade Glazing Thermal Specs",
      type: "Technical Review",
      outcome: "Approved",
      decider: "Lead Architect",
      date: "Oct 10, 2026",
      time: "16:45:22",
      notes: "Specs exceed minimum requirements. Approved for procurement."
    },
    {
      id: "LOG-0439",
      refId: "PRM-S-1099",
      title: "Crane Erection & Operation",
      type: "Permit",
      outcome: "Denied",
      decider: "Safety Inspector",
      date: "Oct 08, 2026",
      time: "11:20:45",
      notes: "Denied due to high wind warnings. Resubmit after weather clears."
    },
    {
      id: "LOG-0438",
      refId: "REQ-8871",
      title: "Subcontractor Prequalification: Apex",
      type: "General Approval",
      outcome: "Approved",
      decider: "Procurement Comm.",
      date: "Oct 05, 2026",
      time: "10:05:12",
      notes: "Cleared for bidding on structural packages."
    }
  ];

  const getOutcomeStyle = (outcome: string) => {
    switch (outcome) {
      case 'Approved': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Denied': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'Approved': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'Denied': return <XCircle size={14} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Approval History & Audit Log
          </h1>
          <p className="text-gray-500 mt-1">Immutable record of all past decisions, signatures, and authorizations.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
          <Download size={16} />
          Export Audit Trail (CSV)
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID, title, or decider..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-600">Last 30 Days</span>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Advanced Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Log ID / Reference</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Item Details</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Decision Outcome</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Timestamp & Decider</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {historyLog.map((log, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={log.id} 
                className="hover:bg-blue-50/30 transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-mono font-bold text-gray-900">{log.id}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-max flex items-center gap-1">
                      REF: {log.refId} <ArrowRight size={10} />
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors max-w-sm truncate" title={log.title}>
                      {log.title}
                    </h4>
                    <span className="text-xs font-semibold text-gray-500">{log.type}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col items-start gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${getOutcomeStyle(log.outcome)}`}>
                      {getOutcomeIcon(log.outcome)}
                      {log.outcome}
                    </span>
                    <p className="text-xs text-gray-500 max-w-xs line-clamp-2" title={log.notes}>
                      {log.notes}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                      <Calendar size={14} className="text-gray-400" /> {log.date} <span className="text-gray-400 font-mono font-normal">at {log.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <User size={14} className="text-gray-400" /> {log.decider}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shadow-sm">
                      <FileText size={14} /> View Record
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Verify Chain of Custody">
                      <ShieldCheck size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
