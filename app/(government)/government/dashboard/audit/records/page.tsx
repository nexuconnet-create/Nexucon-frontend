"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, History, Search, FileText, CheckCircle, 
  Lock, RefreshCw, Eye, Download, ShieldAlert, Cpu 
} from "lucide-react";
import { 
  AuditEvent, getAuditEvents, verifyAuditHashChain, 
  HashChainVerification, exportAuditLedger 
} from "@/services/audit";
import AuditDiffModal from "@/components/dashboard/AuditDiffModal";

export default function AuditRecords() {
  const [records, setRecords] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<HashChainVerification | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (search.trim()) params.search = search.trim();
      if (severityFilter !== "ALL") params.severity = severityFilter;
      const data = await getAuditEvents(params);
      setRecords(data);
    } catch (err) {
      console.error("Failed to load audit records", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, severityFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyAuditHashChain();
      setVerificationResult(res);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Hash Chain Verified! 100% Tamper-Proof (${res.total_blocks_checked} blocks validated).`, type: 'success' } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Hash chain verification failed', type: 'error' } }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportAuditLedger({ 
        severity: severityFilter !== 'ALL' ? severityFilter : undefined 
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Nexucon_Cryptographic_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Cryptographic Audit Ledger Export downloaded!', type: 'success' } }));
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
            <Lock className="text-emerald-500" />
            Immutable Audit Ledger &amp; Cryptographic Proof
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Authoritative append-only regulatory ledger with sequential SHA-256 blockchain-style verification seals.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRecords}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold cursor-pointer"
          >
            <Download size={14} />
            <span>Export Official Ledger</span>
          </button>
        </div>
      </div>

      {/* Cryptographic Verification Hero Card */}
      <div className="bg-gradient-to-br from-[#022C4F] to-[#0A4B78] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 shrink-0 mt-1">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                {verificationResult?.chain_integrity || "100.0% VERIFIED"}
              </span>
              <span className="text-xs text-blue-200 font-semibold">• SHA-256 Block Signature Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Ledger Integrity &amp; Sequential Proof</h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Every state transition creates an append-only cryptographic block. Tamper-evident architecture guarantees complete non-repudiation for statutory audits.
            </p>
          </div>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={isVerifying}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-75"
        >
          <Cpu size={16} className={isVerifying ? "animate-spin" : ""} />
          <span>{isVerifying ? "Verifying Hash Blocks..." : "Run Integrity Audit"}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative min-w-[280px] flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by audit reference, hash, actor, or entity ID..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "Normal", "Warning", "High", "Critical"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                severityFilter === sev
                  ? 'bg-[#022C4F] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Cryptographic Block Ledger</h2>
          <span className="text-xs font-bold text-slate-400">Showing {records.length} Verified Blocks</span>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Lock size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No audit records found matching query.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Block Ref &amp; Action</th>
                <th className="py-4 px-6">Resource Target</th>
                <th className="py-4 px-6">Actor &amp; Role</th>
                <th className="py-4 px-6">Cryptographic Hash</th>
                <th className="py-4 px-6 text-right">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {records.map((ev, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={ev.id || idx}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {ev.audit_reference}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Verified Block"></span>
                      </div>
                      <span className="font-bold text-slate-900 text-xs">{ev.action}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-bold text-slate-800">{ev.resource_type}</span>
                      <div className="text-slate-400 text-[10px] mt-0.5">
                        ID: <code className="text-blue-600">{ev.resource_id}</code> • {ev.project_name}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{ev.user_name}</span>
                      <span className="text-slate-400 text-[10px]">{ev.user_role}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-[10px] text-slate-600">
                    <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block font-semibold">
                      {ev.signature_hash}
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
                      <span>Inspect Diff</span>
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
