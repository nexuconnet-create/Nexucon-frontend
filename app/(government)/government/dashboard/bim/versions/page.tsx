"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { History, ArrowRight, UploadCloud, GitCommit, FileDiff, Box, GitBranch, Eye } from "lucide-react";

export default function ModelVersions() {
  const [selectedVersion, setSelectedVersion] = useState("v2.4");

  const versionHistory = [
    {
      id: "v2.4",
      date: "Oct 12, 2026 at 14:30",
      author: "Sarah Jenkins",
      role: "Lead Architect",
      changes: "Updated facade panel layouts for Zone B and resolved curtain wall overlaps.",
      stats: { added: 142, modified: 35, removed: 12 },
      current: true,
    },
    {
      id: "v2.3",
      date: "Oct 05, 2026 at 09:15",
      author: "Michael Chen",
      role: "BIM Coordinator",
      changes: "Integrated MEP clash resolutions from Coordination Meeting #14.",
      stats: { added: 56, modified: 110, removed: 4 },
      current: false,
    },
    {
      id: "v2.2",
      date: "Sep 28, 2026 at 16:45",
      author: "Sarah Jenkins",
      role: "Lead Architect",
      changes: "Revised internal partition walls in the main concourse area.",
      stats: { added: 89, modified: 12, removed: 45 },
      current: false,
    },
    {
      id: "v2.1",
      date: "Sep 15, 2026 at 11:20",
      author: "Alex Rivera",
      role: "Structural Engineer",
      changes: "Foundation updates following geotech report review.",
      stats: { added: 300, modified: 150, removed: 0 },
      current: false,
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>BIM Models</span>
            <ArrowRight size={14} />
            <span className="font-semibold text-blue-600">Downtown Metro Station</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Model Version History
          </h1>
          <p className="text-gray-500 mt-1">Track changes, compare revisions, and manage model lifecycle.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
            <FileDiff size={16} />
            Compare Versions
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
              {versionHistory.map((version, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={version.id}
                  className="relative pl-8"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${version.current
                      ? 'bg-blue-600 border-blue-200 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]'
                      : 'bg-white border-gray-300'
                    }`}></div>

                  <div className={`p-5 rounded-xl border transition-all cursor-pointer ${selectedVersion === version.id
                      ? 'border-blue-200 bg-blue-50/30 shadow-md'
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white'
                    }`}
                    onClick={() => setSelectedVersion(version.id)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${version.current ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {version.id}
                          </span>
                          {version.current && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Current Master
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 font-medium">{version.changes}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-500">{version.date}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{version.author} • {version.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100/50">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        <span>+</span>{version.stats.added} added
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        <span>~</span>{version.stats.modified} modified
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                        <span>-</span>{version.stats.removed} removed
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
            <div className="h-40 bg-gradient-to-br from-blue-900 to-[#022C4F] relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mix-blend-overlay"></div>
              <Box size={64} className="text-white/20" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="text-white font-mono font-bold text-lg bg-black/30 px-3 py-1 rounded backdrop-blur-sm">
                  {selectedVersion}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Version Details</h3>

              <div className="space-y-4">
                <div>
                  <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">Author</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {versionHistory.find(v => v.id === selectedVersion)?.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{versionHistory.find(v => v.id === selectedVersion)?.author}</p>
                      <p className="text-xs text-gray-500">{versionHistory.find(v => v.id === selectedVersion)?.role}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">Commit Hash</span>
                  <div className="flex items-center gap-2 text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                    <GitCommit size={14} className="text-gray-400" />
                    a8f93bc2
                  </div>
                </div>

                <div>
                  <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">File Size</span>
                  <p className="text-sm font-semibold text-gray-700">345 MB (IFC 4x3)</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                <button className="w-full py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <Eye size={16} />
                  Open in Viewer
                </button>
                <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-colors">
                  Download IFC File
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
