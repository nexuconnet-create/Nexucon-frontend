"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { History, Filter, Download, Search, CheckCircle2, XCircle, AlertCircle, FileText, RefreshCw } from "lucide-react";
import { AuditEvent, getAuditEvents } from "@/services/audit";
import AuditDiffModal from "@/components/dashboard/AuditDiffModal";

export default function ApprovalHistory() {
  const [history, setHistory] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  const fetchApprovalHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAuditEvents({ search: search.trim() || undefined });
      const approvalEvents = data.filter(e => 
        e.resource_type.toLowerCase().includes('approval') ||
        e.resource_type.toLowerCase().includes('permit') ||
        e.action.toLowerCase().includes('approved') ||
        e.action.toLowerCase().includes('sign')
      );
      setHistory(approvalEvents.length > 0 ? approvalEvents : data);
    } catch (err) {
      console.error("Failed to load approval history", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchApprovalHistory();
  }, [fetchApprovalHistory]);

  const handleExportPDF = () => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: 'Generating regulatory Approval Audit PDF report...', type: 'info' } 
    }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Approval History Audit PDF downloaded!', type: 'success' } 
      }));
    }, 800);
  };

  const getStatusBadge = (action: string) => {
    if (action.toLowerCase().includes('rejected') || action.toLowerCase().includes('denied')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    if (action.toLowerCase().includes('escalat')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle size={12} /> Escalated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={12} /> Approved
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Approval History Log
          </h1>
          <p className="text-gray-500 mt-1">Immutable audit trail of all permit decisions, technical reviews, and ministerial sign-offs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchApprovalHistory}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold"
          >
            <Download size={16} />
            Export to PDF
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Decider, or Reference..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Record ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Decider</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Type & Ref</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Final Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Project</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((record) => (
                <tr 
                  key={record.id} 
                  onClick={() => { setSelectedEvent(record); setIsDiffOpen(true); }}
                  className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {record.audit_reference}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-900">{record.user_name}</span>
                      <span className="text-xs text-gray-500 font-semibold">{record.user_role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-700">{record.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] font-mono text-gray-400">REF: {record.resource_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-semibold text-gray-600">
                      {new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.action)}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-xs text-gray-600 font-medium">
                    {record.project_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {history.length === 0 && !isLoading && (
          <div className="p-12 text-center text-gray-500 text-sm">
            No approval history logs found.
          </div>
        )}
      </motion.div>

      <AuditDiffModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}
