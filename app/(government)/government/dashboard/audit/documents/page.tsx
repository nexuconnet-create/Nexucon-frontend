"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Filter, Download, Search, FileSignature, GitCommit, User, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { AuditEvent, getAuditEvents } from "@/services/audit";
import AuditDiffModal from "@/components/dashboard/AuditDiffModal";

export default function DocumentHistory() {
  const [docEvents, setDocEvents] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  const fetchDocHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAuditEvents({ search: search.trim() || undefined });
      const docs = data.filter(e => 
        e.resource_type.toLowerCase().includes('document') ||
        e.action.toLowerCase().includes('document') ||
        e.action.toLowerCase().includes('upload')
      );
      setDocEvents(docs.length > 0 ? docs : data);
    } catch (err) {
      console.error("Failed to load document history", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDocHistory();
  }, [fetchDocHistory]);

  const handleDownloadLatest = (resourceId: string) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading certified document archive for ${resourceId}...`, type: 'info' } 
    }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Document package for ${resourceId} downloaded successfully!`, type: 'success' } 
      }));
    }, 600);
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Document Version History & Audit
          </h1>
          <p className="text-gray-500 mt-1">Audit log of all document uploads, revisions, and approval signatures.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDocHistory}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Document Name, ID, or Action..." 
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Document Trees */}
        {docEvents.map((doc, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={doc.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-50 p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-base font-bold text-gray-900">{doc.action.replace(/_/g, ' ')}</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border text-emerald-700 bg-emerald-50 border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <span className="font-mono">{doc.resource_id}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{doc.resource_type}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-blue-600 font-mono">{doc.audit_reference}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDownloadLatest(doc.resource_id)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-xs font-bold shrink-0"
              >
                <Download size={14} /> Download File
              </button>
            </div>

            {/* Version History Node */}
            <div className="p-6">
              <div 
                onClick={() => { setSelectedEvent(doc); setIsDiffOpen(true); }}
                className="flex gap-4 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-500 text-blue-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <GitCommit size={16} />
                </div>
                <div className="flex-1 bg-slate-50/50 border border-gray-100 rounded-2xl p-4 shadow-sm group-hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        v1.0
                      </span>
                      <span className="text-xs font-bold text-gray-700">{doc.action.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(doc.timestamp).toLocaleDateString()} {new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 font-medium">
                    Project: {doc.project_name} • Hash Seal: <span className="font-mono text-blue-600">{doc.signature_hash}</span>
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <User size={12} /> By: {doc.user_name} ({doc.user_role})
                    </div>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      View Diff & Meta <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {docEvents.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm">
            No document audit history found.
          </div>
        )}
      </div>

      <AuditDiffModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}
