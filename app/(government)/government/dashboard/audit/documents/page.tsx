"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Filter, Download, Search, FileSignature, 
  GitCommit, User, Clock, ArrowRight, RefreshCw, Eye 
} from "lucide-react";
import { AuditEvent, getAuditEvents, exportAuditLedger } from "@/services/audit";
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
      const data = await getAuditEvents({ 
        module: 'documents',
        search: search.trim() || undefined 
      });
      setDocEvents(data);
    } catch (err) {
      console.error("Failed to load document history", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDocHistory();
  }, [fetchDocHistory]);

  const handleExport = async () => {
    try {
      const blob = await exportAuditLedger({ module: 'documents' });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Nexucon_Document_Audit_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Document Version Audit Export downloaded!', type: 'success' } }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Document Vault &amp; Revision Audit History
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Audit trail of all drawing revisions, structural calculations, and statutory regulatory stamps.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDocHistory}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            title="Refresh History"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold cursor-pointer"
          >
            <Download size={14} />
            <span>Export Document Audit</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative min-w-[280px] flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by drawing reference, document code, or stamping officer..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Document History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Document Revisions &amp; Cryptographic Stamps</h2>
          <span className="text-xs font-bold text-slate-400">Vault Immutability Ledger</span>
        </div>

        {docEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No document audit records matching search.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Document Code &amp; Project</th>
                <th className="py-4 px-6">Action / Event</th>
                <th className="py-4 px-6">Stamping Officer</th>
                <th className="py-4 px-6">Timestamp &amp; Hash</th>
                <th className="py-4 px-6 text-right">State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {docEvents.map((ev, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={ev.id || idx}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{ev.project_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {ev.resource_id}
                        </span>
                        <span className="text-slate-400 text-[10px]">• Ref: {ev.audit_reference}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      <FileSignature size={12} /> {ev.action}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{ev.user_name}</span>
                      <span className="text-slate-400 text-[10px]">{ev.user_role}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-medium">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ev.timestamp).toLocaleDateString()}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400 mt-0.5">{ev.signature_hash}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedEvent(ev);
                        setIsDiffOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* State Delta Modal */}
      <AuditDiffModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}
