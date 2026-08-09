"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Filter, Download, Search, FileSignature, GitCommit, User, Clock, ArrowRight } from "lucide-react";

export default function DocumentHistory() {
  const documents = [
    {
      id: "DOC-992",
      title: "Master Subcontractor Agreement",
      currentVersion: "v2.0",
      type: "Legal",
      status: "Active",
      history: [
        { version: "v2.0", action: "Approved & Signed", by: "Elena Rodriguez", date: "Oct 08, 2026 - 11:00 AM", note: "Final signatures applied." },
        { version: "v1.2", action: "Revised Upload", by: "David Rivera", date: "Oct 07, 2026 - 04:30 PM", note: "Added missing insurance clauses." },
        { version: "v1.0", action: "Initial Upload", by: "Contractor Portal", date: "Oct 05, 2026 - 09:00 AM", note: "Original submission." }
      ]
    },
    {
      id: "DOC-985",
      title: "HVAC Load Calculations (Sector A)",
      currentVersion: "v1.1",
      type: "Engineering",
      status: "Under Review",
      history: [
        { version: "v1.1", action: "Revised Upload", by: "MEP Team", date: "Oct 09, 2026 - 08:15 AM", note: "Adjusted for new glazing specs." },
        { version: "v1.0", action: "Initial Upload", by: "MEP Team", date: "Oct 01, 2026 - 10:20 AM", note: "First draft submission." }
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Document Version History
          </h1>
          <p className="text-gray-500 mt-1">Audit log of all document uploads, revisions, and approval signatures.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Document Name or ID..." 
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Document Trees */}
        {documents.map((doc, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={doc.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-50 p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-bold text-gray-900">{doc.title}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    doc.status === 'Active' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <span className="font-mono">{doc.id}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{doc.type} Document</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-blue-600">Current: {doc.currentVersion}</span>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold shrink-0">
                <Download size={16} /> Download Latest
              </button>
            </div>

            {/* Version History Tree */}
            <div className="p-6 relative">
              <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-gray-100 z-0"></div>
              
              <div className="space-y-6 relative z-10">
                {doc.history.map((entry, hIdx) => (
                  <div key={hIdx} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-500 text-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                      <GitCommit size={16} />
                    </div>
                    <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {entry.version}
                          </span>
                          <span className="text-sm font-bold text-gray-700">{entry.action}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                          <Clock size={12} /> {entry.date}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{entry.note}</p>
                      
                      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                          <User size={12} /> By: {entry.by}
                        </div>
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          View File <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
