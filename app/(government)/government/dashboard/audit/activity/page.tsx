"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { History, Filter, Download, FileText, CheckCircle2, ShieldAlert, User, Clock, FileSignature, RefreshCw } from "lucide-react";
import { AuditEvent, getAuditEvents } from "@/services/audit";
import AuditDiffModal from "@/components/dashboard/AuditDiffModal";

export default function ActivityLog() {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAuditEvents();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Reference", "Action", "Resource Type", "Resource ID", "Actor", "Role", "Project", "Timestamp", "Hash"];
    const rows = logs.map(l => [
      l.audit_reference,
      `"${l.action}"`,
      l.resource_type,
      l.resource_id,
      `"${l.user_name}"`,
      `"${l.user_role}"`,
      `"${l.project_name}"`,
      `"${new Date(l.timestamp).toISOString()}"`,
      l.signature_hash
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nexucon_Activity_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Audit Log CSV Export downloaded!', type: 'success' } }));
  };

  const getLogIcon = (action: string, severity: string) => {
    if (severity === 'Critical' || action.toLowerCase().includes('stop') || action.toLowerCase().includes('hazard')) {
      return { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' };
    }
    if (action.toLowerCase().includes('approved') || action.toLowerCase().includes('certified')) {
      return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    }
    if (action.toLowerCase().includes('sign') || action.toLowerCase().includes('permit')) {
      return { icon: FileSignature, color: 'text-purple-500', bg: 'bg-purple-50' };
    }
    return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' };
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Project Activity Log
          </h1>
          <p className="text-gray-500 mt-1">Chronological timeline of all system actions, uploads, and regulatory approvals.</p>
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
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
        >
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>

            <div className="space-y-8 relative">
              {logs.map((log) => {
                const style = getLogIcon(log.action, log.severity);
                const IconComponent = style.icon;

                return (
                  <div 
                    key={log.id} 
                    onClick={() => { setSelectedEvent(log); setIsDiffOpen(true); }}
                    className="flex gap-6 relative cursor-pointer group"
                  >
                    {/* Timeline Node */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-110 ${style.bg} ${style.color}`}>
                      <IconComponent size={20} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-2 pb-4 border-b border-gray-50 group-hover:bg-slate-50/60 p-3 rounded-2xl transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{log.user_name}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {log.user_role}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {log.audit_reference}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 shrink-0">
                          <Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium text-gray-500">{log.action.replace(/_/g, ' ')}: </span>
                        <span className="font-bold">{log.resource_type} ({log.resource_id})</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">{log.project_name}</p>
                    </div>
                  </div>
                );
              })}

              {logs.length === 0 && !isLoading && (
                <div className="p-12 text-center text-gray-500 text-sm">
                  No activity logs found.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AuditDiffModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}
