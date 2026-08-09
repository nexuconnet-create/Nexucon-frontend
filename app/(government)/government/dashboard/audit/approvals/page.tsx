"use client";

import React from "react";
import { motion } from "framer-motion";
import { History, Filter, Download, Search, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";

export default function ApprovalHistory() {
  const history = [
    {
      id: "APRV-9902",
      type: "Permit Decision",
      ref: "PRM-B-8902",
      decider: "Elena Rodriguez",
      role: "City Planner",
      timestamp: "Oct 08, 2026 - 11:15 AM",
      status: "Approved",
      notes: "Standard setback variance accepted."
    },
    {
      id: "APRV-9901",
      type: "Technical Review",
      ref: "TR-502",
      decider: "Marcus Chen",
      role: "Structural Eng.",
      timestamp: "Oct 08, 2026 - 09:12 AM",
      status: "Approved",
      notes: "HVAC load calcs match zone requirements."
    },
    {
      id: "APRV-9899",
      type: "Document Sign-off",
      ref: "DOC-992",
      decider: "David Rivera",
      role: "Legal",
      timestamp: "Oct 07, 2026 - 04:30 PM",
      status: "Rejected",
      notes: "Missing insurance clauses in section 4."
    },
    {
      id: "APRV-9895",
      type: "Escalated Review",
      ref: "ESC-104",
      decider: "Director Board",
      role: "Oversight",
      timestamp: "Oct 05, 2026 - 10:00 AM",
      status: "Escalated",
      notes: "Requires full board vote next week."
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> {status}
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} /> {status}
          </span>
        );
      case 'Escalated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle size={12} /> {status}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Approval History Log
          </h1>
          <p className="text-gray-500 mt-1">Immutable audit trail of all permit decisions, reviews, and sign-offs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
            <Download size={16} />
            Export to PDF
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID, Decider, or Reference..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Record ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Decider</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Type & Ref</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Final Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {record.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-900">{record.decider}</span>
                      <span className="text-xs text-gray-500 font-semibold">{record.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-700">{record.type}</span>
                      <span className="text-[10px] font-mono text-gray-400">REF: {record.ref}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-600">{record.timestamp}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-600">
                    {record.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm">
          <span className="text-gray-500 font-semibold">Showing 1 to 4 of 2,451 records</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 bg-white font-semibold shadow-sm disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 bg-white font-semibold shadow-sm">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
