"use client";

import React from "react";
import { motion } from "framer-motion";
import { History, Filter, Download, Search, CheckCircle2, XCircle, FileWarning, ExternalLink } from "lucide-react";

export default function InspectionHistory() {
  const history = [
    {
      id: "INSP-810",
      type: "Structural Framing",
      inspector: "Marcus Chen",
      date: "Oct 06, 2026",
      location: "Zone 3, Level 2",
      outcome: "Passed",
      defects: 0,
      notes: "All welds pass visual and UT inspection."
    },
    {
      id: "INSP-809",
      type: "Concrete Slump (Pour #44)",
      inspector: "Sarah Jenkins",
      date: "Oct 05, 2026",
      location: "Sector B",
      outcome: "Failed",
      defects: 1,
      notes: "Slump exceeded max limit by 2 inches. Pour halted.",
      ncrRef: "NCR-8893"
    },
    {
      id: "INSP-805",
      type: "Environmental Silt Fence",
      inspector: "David Rivera",
      date: "Oct 03, 2026",
      location: "Western Perimeter",
      outcome: "Conditional Pass",
      defects: 2,
      notes: "Minor sagging in two sections. Contractor given 24h to fix."
    }
  ];

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'Passed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> {outcome}
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} /> {outcome}
          </span>
        );
      case 'Conditional Pass':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <FileWarning size={12} /> {outcome}
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
            <History className="text-emerald-500" />
            Inspection History Log
          </h1>
          <p className="text-gray-500 mt-1">Immutable audit trail of all completed site inspections and outcomes.</p>
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
              placeholder="Search by ID, Inspector, or Location..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Inspection ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date & Inspector</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Type & Location</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Outcome</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Defects Logged</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Notes & NCRs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {record.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-900">{record.inspector}</span>
                      <span className="text-xs text-gray-500 font-semibold">{record.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-700">{record.type}</span>
                      <span className="text-xs text-gray-500">{record.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getOutcomeBadge(record.outcome)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.defects > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                        {record.defects}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-bold">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p className="max-w-xs truncate mb-1">{record.notes}</p>
                    {record.ncrRef && (
                      <a href="#" className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 hover:bg-red-100 transition-colors">
                        View {record.ncrRef} <ExternalLink size={10} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm">
          <span className="text-gray-500 font-semibold">Showing 1 to 3 of 1,822 records</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 bg-white font-semibold shadow-sm disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 bg-white font-semibold shadow-sm">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
