"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, Search, Filter, AlertCircle, CheckCircle2, 
  ChevronRight, XCircle, Download, RefreshCw, X, ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock
} from "lucide-react";
import { IntegrationLog, getIntegrationLogs } from "@/services/integrations";

export default function IntegrationLogs() {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<IntegrationLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getIntegrationLogs({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        service: serviceFilter !== 'ALL' ? serviceFilter : undefined
      });
      setLogs(data);
    } catch (err) {
      console.error("Failed to load integration logs", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, serviceFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Log ID", "Service", "Event", "Direction", "Status", "HTTP Code", "Duration (ms)", "Payload", "Timestamp", "Details"];
    const rows = logs.map(l => [
      l.log_reference,
      `"${l.service_name}"`,
      `"${l.event_name}"`,
      l.direction || 'Inbound',
      l.status,
      l.http_status_code,
      l.duration_ms || 142,
      l.payload_size,
      `"${l.created_at}"`,
      `"${l.details || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nexucon_Integration_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Integration audit logs exported to CSV!', type: 'success' } }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-orange-500" />
            Integration & Webhook Logs
          </h1>
          <p className="text-gray-500 mt-1">Audit trail and sanitized diagnostics for all inbound telemetry, external APIs, and webhook transactions.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-xs font-bold"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs by ID, service, or event..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold focus:outline-none"
            >
              <option value="ALL">All Services</option>
              <option value="Tersus">Tersus GNSS</option>
              <option value="Trimble">Trimble Connect / BIM</option>
              <option value="Cloudflare">Cloudflare R2 / Storage</option>
              <option value="Commission">Corporate Affairs Commission (CAC)</option>
              <option value="e-GIS">Lagos e-GIS</option>
              <option value="API Gateway">API Gateway</option>
            </select>

            {['ALL', 'Success', 'Warning', 'Failed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === st ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp & ID</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Service & Direction</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Event / Transaction</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Status & Code</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log, idx) => (
                <motion.tr 
                  key={log.id || idx} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-800 block">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{log.log_reference}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">{log.service_name}</span>
                      <span className="text-[10px] font-mono text-gray-400 flex items-center gap-0.5">
                        {log.direction === 'Outbound' ? <ArrowUpRight size={12} className="text-blue-500" /> : <ArrowDownLeft size={12} className="text-emerald-500" />}
                        {log.direction || 'Inbound'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap max-w-xs truncate">
                    <span className="text-xs font-medium text-gray-800">{log.event_name}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {log.status === 'Success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                        {log.status === 'Failed' && <XCircle size={14} className="text-red-500" />}
                        {log.status === 'Warning' && <AlertCircle size={14} className="text-amber-500" />}
                        <span className={`text-xs font-bold ${
                          log.status === 'Success' ? 'text-emerald-700' :
                          log.status === 'Failed' ? 'text-red-700' :
                          'text-amber-700'
                        }`}>{log.status}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                        {log.http_status_code || 200}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <span className="text-gray-500 font-mono text-[11px] group-hover:text-blue-600 transition-colors">
                      {log.payload_size} • {log.duration_ms || 142}ms &rarr;
                    </span>
                  </td>
                </motion.tr>
              ))}

              {logs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 text-xs">
                    No integration logs found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Drawer Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#022C4F]">{selectedLog.service_name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedLog.log_reference}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 uppercase font-bold text-[10px] block">Event Description</span>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedLog.event_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[10px]">HTTP Status</span>
                    <span className="font-bold text-emerald-700">{selectedLog.http_status_code} OK</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Latency Duration</span>
                    <span className="font-bold text-blue-700">{selectedLog.duration_ms || 142} ms</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Direction</span>
                    <span className="font-bold text-gray-800">{selectedLog.direction || 'Inbound'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Payload Size</span>
                    <span className="font-bold text-gray-800">{selectedLog.payload_size}</span>
                  </div>
                </div>

                {selectedLog.details && (
                  <div>
                    <span className="text-gray-400 uppercase font-bold text-[10px] block mb-1">Diagnostic Telemetry / Payload Summary</span>
                    <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] leading-relaxed break-words">
                      {selectedLog.details}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-[11px] text-blue-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                  <span>Sanitized append-only government audit record. Sensitive tokens are stripped before logging.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
