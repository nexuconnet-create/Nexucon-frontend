"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { History, Search, Filter, AlertCircle, CheckCircle2, ChevronRight, XCircle, Download, RefreshCw } from "lucide-react";
import { IntegrationLog, getIntegrationLogs } from "@/services/integrations";

export default function IntegrationLogs() {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getIntegrationLogs({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      setLogs(data);
    } catch (err) {
      console.error("Failed to load integration logs", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Log ID", "Service", "Event", "Status", "HTTP Code", "Payload", "Timestamp", "Details"];
    const rows = logs.map(l => [
      l.log_reference,
      `"${l.service_name}"`,
      `"${l.event_name}"`,
      l.status,
      l.http_status_code,
      l.payload_size,
      `"${l.created_at}"`,
      `"${l.details || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Integration_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Integration logs exported to CSV!', type: 'success' } }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-orange-500" />
            Integration & Webhook Logs
          </h1>
          <p className="text-gray-500 mt-1">Audit trail of all inbound and outbound API and webhook activity.</p>
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

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs by ID, service, or event..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
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
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Service</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Event</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log, idx) => (
                <motion.tr 
                  key={log.id || idx} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-800">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{log.log_reference}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">{log.service_name}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-700">{log.event_name}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
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
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <span className="text-gray-500 font-mono text-[11px]">{log.details || log.payload_size}</span>
                  </td>
                </motion.tr>
              ))}

              {logs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 text-xs">
                    No integration logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
