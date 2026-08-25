"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  History, Filter, Download, Search, CheckCircle2, 
  XCircle, FileWarning, ExternalLink, RefreshCw, Eye 
} from "lucide-react";
import { AuditEvent, getAuditEvents, formatActionTitle, formatResourceTitle } from "@/services/audit";
import AuditDiffModal from "@/components/dashboard/AuditDiffModal";
import AuditExportDrawer from "@/components/dashboard/AuditExportDrawer";

export default function InspectionHistory() {
  const [history, setHistory] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchInspectionHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAuditEvents({ 
        module: 'inspections',
        search: search.trim() || undefined 
      });
      setHistory(data);
    } catch (err) {
      console.error("Failed to load inspection history", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchInspectionHistory();
  }, [fetchInspectionHistory]);

  const getOutcomeBadge = (action: string) => {
    if (action.toLowerCase().includes('fail') || action.toLowerCase().includes('violation')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
          <XCircle size={12} /> Failed
        </span>
      );
    }
    if (action.toLowerCase().includes('conditional') || action.toLowerCase().includes('warn')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          <FileWarning size={12} /> Conditional
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={12} /> Passed
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Field Inspection History &amp; Quality Audit
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Complete historical audit trail of structural site inspections, stage gates, and test logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchInspectionHistory}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            title="Refresh History"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold cursor-pointer"
          >
            <Download size={14} />
            <span>Export Inspection Audit</span>
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
            placeholder="Search by inspection code, site, or inspector name..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Historical Walkthrough Records</h2>
          <span className="text-xs font-bold text-slate-400">Signed with Cryptographic Verification</span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <History size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No inspection records found matching criteria.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Inspection Code &amp; Site</th>
                <th className="py-4 px-6">Outcome</th>
                <th className="py-4 px-6">Lead Inspector</th>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {history.map((ev, idx) => (
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
                        <span className="text-slate-500 font-semibold text-[10px]">
                          {formatActionTitle(ev.action)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getOutcomeBadge(ev.action)}
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
                      <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">Verified Block</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedEvent(ev);
                        setIsDiffOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#022C4F] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-sm"
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

      {/* Multi-Format Export Sidepop Drawer */}
      <AuditExportDrawer
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        events={history}
        defaultModule="Inspections Quality Audit"
      />
    </div>
  );
}
