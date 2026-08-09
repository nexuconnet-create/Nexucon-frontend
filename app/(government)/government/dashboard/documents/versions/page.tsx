"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { History, ArrowRight, FileText, UploadCloud, FileDiff, GitBranch, Download, Eye } from "lucide-react";

export default function DocumentVersions() {
  const [selectedVersion, setSelectedVersion] = useState("v4.0");

  const versions = [
    {
      id: "v4.0",
      date: "Oct 12, 2026 at 14:30",
      author: "Legal Team",
      changes: "Finalized contractual clauses and updated payment schedules.",
      status: "Current",
    },
    {
      id: "v3.2",
      date: "Oct 05, 2026 at 09:15",
      author: "Project Manager",
      changes: "Incorporated feedback from the environmental review board.",
      status: "Superseded",
    },
    {
      id: "v3.0",
      date: "Sep 28, 2026 at 16:45",
      author: "City Council",
      changes: "Major revision following the Q3 planning committee meeting.",
      status: "Superseded",
    },
    {
      id: "v2.1",
      date: "Sep 15, 2026 at 11:20",
      author: "Legal Team",
      changes: "Initial draft of the secondary compliance terms.",
      status: "Superseded",
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Project Documents</span>
            <ArrowRight size={14} />
            <span>Contracts & Legal</span>
            <ArrowRight size={14} />
            <span className="font-semibold text-blue-600">Master_Contract_Phase2.pdf</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Document Version History
          </h1>
          <p className="text-gray-500 mt-1">Track revisions, compare changes, and restore previous document states.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
            <FileDiff size={16} />
            Compare
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold">
            <UploadCloud size={16} />
            Upload New Revision
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GitBranch size={20} className="text-gray-400" />
              Revision Timeline
            </h2>
            
            <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
              {versions.map((version, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={version.id} 
                  className="relative pl-8"
                >
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                    version.status === 'Current' 
                      ? 'bg-blue-600 border-blue-200 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' 
                      : 'bg-white border-gray-300'
                  }`}></div>
                  
                  <div className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    selectedVersion === version.id 
                      ? 'border-blue-200 bg-blue-50/30 shadow-md' 
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white'
                  }`}
                  onClick={() => setSelectedVersion(version.id)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                            version.status === 'Current' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {version.id}
                          </span>
                          {version.status === 'Current' && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Current Master
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 font-medium">{version.changes}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-500">{version.date}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{version.author}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Selected Version Info */}
        <div className="lg:col-span-1">
          <motion.div 
            key={selectedVersion}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6"
          >
            <div className="h-32 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative">
              <FileText size={48} className="text-blue-500/40" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="text-blue-700 font-mono font-bold text-lg bg-blue-100 border border-blue-200 px-3 py-1 rounded shadow-sm">
                  {selectedVersion}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Document Details</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">Author</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {versions.find(v => v.id === selectedVersion)?.author.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{versions.find(v => v.id === selectedVersion)?.author}</p>
                  </div>
                </div>
                
                <div>
                  <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">File Size</span>
                  <p className="text-sm font-semibold text-gray-700">2.4 MB</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                <button className="w-full py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <Eye size={16} />
                  Preview Document
                </button>
                <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
