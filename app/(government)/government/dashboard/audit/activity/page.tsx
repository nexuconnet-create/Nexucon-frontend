"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  History, Filter, Download, FileText, CheckCircle2, 
  ShieldAlert, User, Clock, FileSignature, RefreshCw, 
  Search, Eye, ArrowUpRight, ShieldCheck, Building2 
} from "lucide-react";
import { AuditEvent, getAuditEvents, formatActionTitle, formatResourceTitle } from "@/services/audit";
import AuditDiffModal from "@/components/dashboard/AuditDiffModal";
import AuditExportDrawer from "@/components/dashboard/AuditExportDrawer";
import PaginationBar from "@/components/dashboard/PaginationBar";

export default function ActivityLog() {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [activeModule, setActiveModule] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (activeModule !== 'ALL') params.module = activeModule;
      if (search.trim()) params.search = search.trim();
      const data = await getAuditEvents(params);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeModule, search]);

  useEffect(() => {
    fetchLogs();
    setCurrentPage(1);
  }, [fetchLogs]);

  const handleOpenExport = () => {
    setIsExportOpen(true);
  };

  const getLogIcon = (action: string, severity: string) => {
    if (severity === 'Critical' || action.toLowerCase().includes('stop') || action.toLowerCase().includes('hazard') || action.toLowerCase().includes('ncr')) {
      return { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' };
    }
    if (action.toLowerCase().includes('approved') || action.toLowerCase().includes('pass') || action.toLowerCase().includes('granted')) {
      return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    }
    if (action.toLowerCase().includes('document') || action.toLowerCase().includes('drawing') || action.toLowerCase().includes('stamp')) {
      return { icon: FileSignature, color: 'text-blue-600', bg: 'bg-blue-50' };
    }
    return { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' };
  };

  const modules = [
    { key: 'ALL', label: 'All Activities' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'inspections', label: 'Inspections' },
    { key: 'documents', label: 'Documents' },
    { key: 'compliance', label: 'Compliance' },
    { key: 'users', label: 'Users & RBAC' },
    { key: 'bim', label: 'BIM 3D' },
    { key: 'gpr', label: 'GPR Survey' },
  ];

  // Slice paginated records
  const paginatedLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Statutory Activity Stream &amp; Audit Trail
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time authoritative ledger of regulatory events, technical approvals, and field actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            title="Refresh Feed"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleOpenExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold cursor-pointer"
          >
            <Download size={14} />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {modules.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  setActiveModule(m.key);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeModule === m.key
                    ? 'bg-[#022C4F] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search actions, officers, IDs..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3.5 max-w-5xl">
        {paginatedLogs.map((log, idx) => {
          const { icon: LogIcon, color, bg } = getLogIcon(log.action, log.severity);
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              key={log.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 hover:border-blue-200 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
                  <LogIcon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {log.audit_reference}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {formatResourceTitle(log.resource_type)}: <span className="text-blue-700 font-semibold">{log.resource_id}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      • {log.project_name}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {formatActionTitle(log.action)}
                  </h3>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium flex-wrap">
                    <span className="flex items-center gap-1">
                      <User size={13} className="text-slate-400" />
                      <strong className="text-slate-700">{log.user_name}</strong> ({log.user_role})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" />
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => {
                    setSelectedEvent(log);
                    setIsDiffOpen(true);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-[#022C4F] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Eye size={13} />
                  <span>Inspect Audit Details</span>
                </button>
              </div>
            </motion.div>
          );
        })}

        {logs.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500">
            No activity records found matching filters.
          </div>
        )}

        {/* Pagination Bar */}
        {logs.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mt-4">
            <PaginationBar
              currentPage={currentPage}
              totalItems={logs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
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
        events={logs}
        defaultModule="All Activities"
      />
    </div>
  );
}
