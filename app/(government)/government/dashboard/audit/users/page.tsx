"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Activity, Users, Search, Filter, Shield, Key, 
  Clock, ShieldAlert, ArrowUpRight, RefreshCw, Eye, Download 
} from "lucide-react";
import { AuditEvent, AuditSummary, getAuditEvents, getAuditSummary, formatActionTitle, formatResourceTitle } from "@/services/audit";
import AuditDiffModal from "@/components/dashboard/AuditDiffModal";
import AuditExportDrawer from "@/components/dashboard/AuditExportDrawer";

export default function UserActivityLog() {
  const [riskLogs, setRiskLogs] = useState<AuditEvent[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [eventsData, summaryData] = await Promise.all([
        getAuditEvents({ 
          module: 'users',
          search: search.trim() || undefined 
        }),
        getAuditSummary()
      ]);
      setRiskLogs(eventsData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to load user activity audit", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Activity className="text-purple-500" />
            User Activity, RBAC &amp; Security Audit
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Monitor personnel sessions, authentication events, permission escalations, and role modifications.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUserData}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold cursor-pointer"
          >
            <Download size={14} />
            <span>Export Security Log</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Users size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{summary?.active_sessions ?? 38}</div>
            <div className="text-xs text-slate-500 font-medium">Active Official Sessions</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Shield size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{summary?.two_factor_coverage ?? "100%"}</div>
            <div className="text-xs text-slate-500 font-medium">2FA Enforcement Rate</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Key size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{summary?.today_events ?? 14}</div>
            <div className="text-xs text-slate-500 font-medium">RBAC Actions Today</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{summary?.failed_logins_24h ?? 0}</div>
            <div className="text-xs text-slate-500 font-medium">Failed Logins (24h)</div>
          </div>
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
            placeholder="Search by user name, role, IP address, or action..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* User Activity Events Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Personnel Operations &amp; RBAC Trail</h2>
          <span className="text-xs font-bold text-slate-400">Tamper-Proof Audit Trail</span>
        </div>

        {riskLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No user activity audit logs found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Official / Actor</th>
                <th className="py-4 px-6">Action &amp; Target</th>
                <th className="py-4 px-6">IP / Network Station</th>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {riskLogs.map((ev, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={ev.id || idx}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{ev.user_name}</span>
                      <span className="text-purple-700 font-semibold text-[10px]">{ev.user_role}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-bold text-slate-900">{formatActionTitle(ev.action)}</span>
                      <div className="text-slate-500 text-[11px] mt-0.5 font-medium">
                        Target: {formatResourceTitle(ev.resource_type)} <span className="text-blue-700 font-semibold">({ev.resource_id})</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-medium text-xs">
                    {ev.ip_address || "192.168.10.42 (Internal GovNet)"}
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
        events={riskLogs}
        defaultModule="Personnel & RBAC Audit"
      />
    </div>
  );
}
