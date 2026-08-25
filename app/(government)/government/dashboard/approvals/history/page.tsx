"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  History, Search, Filter, Download, Calendar, User, 
  FileText, CheckCircle2, XCircle, ArrowRight, ShieldCheck, 
  RefreshCw, Lock 
} from "lucide-react";
import { ApprovalDecision, getApprovalDecisions } from "@/services/approvals";
import DecisionRecordDetailDrawer from "@/components/dashboard/DecisionRecordDetailDrawer";

export default function ApprovalHistory() {
  const [historyLog, setHistoryLog] = useState<ApprovalDecision[]>([]);
  const [selectedOutcome, setSelectedOutcome] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState<ApprovalDecision | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const handleOpenDetail = (log: ApprovalDecision) => {
    setSelectedDecision(log);
    setIsDrawerOpen(true);
  };

  const getOutcomeStyle = (outcome: string) => {
    switch (outcome) {
      case 'Approved': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Rejected': return 'text-red-700 bg-red-50 border-red-200';
      case 'Conditional': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'Approved': return <CheckCircle2 size={13} className="text-emerald-600" />;
      case 'Rejected': return <XCircle size={13} className="text-red-600" />;
      default: return <ShieldCheck size={13} className="text-amber-600" />;
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Approval History & Immutable Audit Ledger
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Tamper-proof log of executive authorizations, cryptographic seals, and conditions.</p>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold cursor-pointer self-start md:self-auto"
        >
          <Download size={15} />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Search by ID, title, reference, or decider..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={fetchHistory}
            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Approved', 'Rejected', 'Conditional'].map(out => (
            <button 
              key={out}
              onClick={() => setSelectedOutcome(out)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                selectedOutcome === out 
                  ? 'bg-[#022C4F] text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {out}
            </button>
          ))}
        </div>
      </div>

      {/* History Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {historyLog.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <History size={44} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No approval history entries recorded yet.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Decision Log & Ref</th>
                <th className="py-4 px-6">Item Title</th>
                <th className="py-4 px-6">Decision Outcome</th>
                <th className="py-4 px-6">Timestamp & Authorizer</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {historyLog.map((log, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={log.id} 
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  onClick={() => handleOpenDetail(log)}
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-mono font-bold text-slate-900">{log.decision_reference}</span>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-max flex items-center gap-1">
                        REF: {log.request_reference || 'REQ-8840'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1 max-w-sm">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors truncate" title={log.request_title}>
                        {log.request_title || 'Permit Authorization'}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-500">{log.project_name || 'PRJ-2026'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${getOutcomeStyle(log.outcome)}`}>
                        {getOutcomeIcon(log.outcome)}
                        {log.outcome}
                      </span>
                      {log.decision_notes && (
                        <p className="text-[11px] text-slate-500 max-w-xs line-clamp-1 truncate" title={log.decision_notes}>
                          {log.decision_notes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Calendar size={13} className="text-slate-400" /> 
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <User size={12} className="text-slate-400" /> {log.decider_name} ({log.decider_role})
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleOpenDetail(log)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm cursor-pointer"
                      >
                        <FileText size={13} /> View Seal
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Sidepop Drawer */}
      <DecisionRecordDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        decision={selectedDecision}
      />
    </div>
  );
}
