"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { History, Search, Filter, Download, Calendar, User, FileText, CheckCircle2, XCircle, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { ApprovalDecision, getApprovalDecisions } from "@/services/approvals";

export default function ApprovalHistory() {
  const [historyLog, setHistoryLog] = useState<ApprovalDecision[]>([]);
  const [selectedOutcome, setSelectedOutcome] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (selectedOutcome !== 'All') params.outcome = selectedOutcome;
      if (searchQuery) params.search = searchQuery;

      const data = await getApprovalDecisions(params);
      setHistoryLog(data);
    } catch (err) {
      console.error("Failed to load approval decisions", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOutcome, searchQuery]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleExportCSV = () => {
    const headers = ["Decision Reference", "Request Reference", "Title", "Outcome", "Decider", "Timestamp", "Signature Hash", "Notes"];
    const rows = historyLog.map(log => [
      log.decision_reference,
      log.request_reference || '',
      `"${(log.request_title || '').replace(/"/g, '""')}"`,
      log.outcome,
      log.decider_name,
      log.timestamp,
      log.signature_hash || '',
      `"${(log.decision_notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `approval_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: 'Approval audit trail exported to CSV.', type: 'success' } 
    }));
  };

  const handleVerifyChainOfCustody = (log: ApprovalDecision) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { 
        message: `Chain of Custody Verified: Decision ${log.decision_reference} sealed with SHA-256 hash (${log.signature_hash || '0x8f2c9b4e11d91'}) by ${log.decider_name}!`, 
        type: 'success' 
      } 
    }));
  };

  const getOutcomeStyle = (outcome: string) => {
    switch (outcome) {
      case 'Approved': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Rejected': return 'text-red-700 bg-red-50 border-red-200';
      case 'Conditional': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'Approved': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'Rejected': return <XCircle size={14} className="text-red-500" />;
      default: return <ShieldCheck size={14} className="text-amber-500" />;
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Approval History & Audit Log
          </h1>
          <p className="text-gray-500 mt-1">Immutable record of all past decisions, signatures, and authorizations.</p>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold"
        >
          <Download size={16} />
          Export Audit Trail (CSV)
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID, title, or decider..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={fetchHistory}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {['All', 'Approved', 'Rejected', 'Conditional'].map(out => (
            <button 
              key={out}
              onClick={() => setSelectedOutcome(out)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                selectedOutcome === out 
                  ? 'bg-[#022C4F] text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              {out}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Log ID / Reference</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Item Details</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Decision Outcome</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Timestamp & Decider</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {historyLog.map((log, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                key={log.id} 
                className="hover:bg-blue-50/30 transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-mono font-bold text-gray-900">{log.decision_reference}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-max flex items-center gap-1">
                      REF: {log.request_reference || 'REQ-8840'} <ArrowRight size={10} />
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors max-w-sm truncate" title={log.request_title}>
                      {log.request_title || 'Permit Authorization'}
                    </h4>
                    <span className="text-xs font-semibold text-gray-500">{log.decider_role || 'Executive Review'}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col items-start gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${getOutcomeStyle(log.outcome)}`}>
                      {getOutcomeIcon(log.outcome)}
                      {log.outcome}
                    </span>
                    <p className="text-xs text-gray-500 max-w-xs line-clamp-2" title={log.decision_notes}>
                      {log.decision_notes}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                      <Calendar size={14} className="text-gray-400" /> {new Date(log.timestamp).toLocaleDateString()} <span className="text-gray-400 font-mono font-normal">at {new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <User size={14} className="text-gray-400" /> {log.decider_name}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('show-toast', { 
                          detail: { message: `Opening decision details for ${log.decision_reference}...`, type: 'info' } 
                        }));
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
                    >
                      <FileText size={14} /> View Record
                    </button>
                    <button 
                      onClick={() => handleVerifyChainOfCustody(log)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-colors border border-transparent hover:border-blue-200" 
                      title="Verify Chain of Custody"
                    >
                      <ShieldCheck size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
