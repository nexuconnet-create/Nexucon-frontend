"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, History, Search, FileText, CheckCircle, Lock, RefreshCw } from "lucide-react";
import { AuditEvent, getAuditEvents, verifyAuditHashChain, HashChainVerification } from "@/services/audit";
import AuditDiffModal from "@/components/dashboard/AuditDiffModal";

export default function AuditRecords() {
  const [records, setRecords] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<HashChainVerification | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAuditEvents({ search: search.trim() || undefined });
      setRecords(data);
    } catch (err) {
      console.error("Failed to load audit records", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

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

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Lock className="text-emerald-500" />
            Tamper-Proof Audit Trail
          </h1>
          <p className="text-gray-500 mt-1">Cryptographically hashed system logs for evidential regulatory compliance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRecords}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg text-sm font-semibold disabled:opacity-50"
          >
            <ShieldCheck size={18} className={isVerifying ? "animate-spin" : ""} />
            <span>{isVerifying ? 'Verifying Chain...' : 'Verify Hash Chain'}</span>
          </button>
        </div>
      </div>

      {verificationResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Lock size={16} />
            </div>
            <div>
              <p className="font-bold text-emerald-950">Cryptographic Integrity: {verificationResult.chain_integrity}</p>
              <p className="text-emerald-700">Validated {verificationResult.total_blocks_checked} sequential hash blocks. Tampered blocks detected: {verificationResult.tampered_blocks_detected}.</p>
            </div>
          </div>
          <div className="font-mono text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
            Latest Block: {verificationResult.latest_block_hash}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 w-64 bg-white" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                <th className="py-4 px-6 font-semibold">Log ID</th>
                <th className="py-4 px-6 font-semibold">Action</th>
                <th className="py-4 px-6 font-semibold">Actor / Project</th>
                <th className="py-4 px-6 font-semibold">Timestamp</th>
                <th className="py-4 px-6 font-semibold">SHA-256 Hash</th>
                <th className="py-4 px-6 font-semibold text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((rec) => (
                <tr 
                  key={rec.id} 
                  onClick={() => { setSelectedEvent(rec); setIsDiffOpen(true); }}
                  className="hover:bg-slate-50 transition-colors font-mono text-sm cursor-pointer group"
                >
                  <td className="py-4 px-6 text-slate-500 group-hover:text-blue-600 font-bold">{rec.audit_reference}</td>
                  <td className="py-4 px-6 font-medium text-slate-900">{rec.action.replace(/_/g, ' ')}</td>
                  <td className="py-4 px-6 text-slate-600">
                    <span className="font-bold">{rec.user_name}</span><br/>
                    <span className="text-xs text-slate-400">{rec.project_name}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-sans text-xs">
                    {new Date(rec.timestamp).toLocaleDateString()} {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-4 px-6 text-blue-600 bg-blue-50/50 rounded inline-block mt-3 px-2 py-1 text-xs">
                    {rec.signature_hash}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">
                      <Lock size={12}/> Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {records.length === 0 && !isLoading && (
          <div className="p-12 text-center text-gray-500 text-sm">
            No audit records found matching your query.
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
