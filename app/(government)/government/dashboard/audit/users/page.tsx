"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Activity, Users, Search, Filter, Shield, Key, Clock, ShieldAlert, ArrowUpRight, RefreshCw } from "lucide-react";
import { AuditEvent, AuditSummary, getAuditEvents, getAuditSummary } from "@/services/audit";
import AuditDiffModal from "@/components/dashboard/AuditDiffModal";

export default function UserActivityLog() {
  const [riskLogs, setRiskLogs] = useState<AuditEvent[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [eventsData, summaryData] = await Promise.all([
        getAuditEvents({ search: search.trim() || undefined }),
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

  const activeUsers = [
    { name: "Elena Rodriguez", role: "City Planner", status: "Active Now", logins: 42, color: "bg-emerald-100 text-emerald-700" },
    { name: "Marcus Chen", role: "Structural Engineer", status: "Last active 2h ago", logins: 128, color: "bg-blue-100 text-blue-700" },
    { name: "David Rivera", role: "Legal Oversight", status: "Last active 1d ago", logins: 34, color: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Activity className="text-purple-500" />
            User Activity & Security Audit
          </h1>
          <p className="text-gray-500 mt-1">Monitor personnel logins, permission escalations, and high-risk operations.</p>
        </div>
        
        <button 
          onClick={fetchUserData}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Users & Security Stats */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-blue-500" /> Active Personnel
              </h2>
            </div>

            <div className="space-y-3">
              {activeUsers.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.color}`}>
                    {user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0) || ''}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-xs">{user.name}</h4>
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{user.role}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 mb-1">
                      {user.status === 'Active Now' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      <span className="text-[10px] font-semibold text-gray-500">{user.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#022C4F] rounded-3xl shadow-md p-6 text-white"
          >
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" /> System Security Integrity
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-blue-900/50 pb-2">
                <span className="text-blue-200 text-xs font-semibold">Active Sessions</span>
                <span className="font-bold text-sm">{summary?.active_sessions ?? 42}</span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-900/50 pb-2">
                <span className="text-blue-200 text-xs font-semibold">2FA Protection</span>
                <span className="font-bold text-sm text-emerald-400">{summary?.two_factor_coverage ?? '100%'}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-blue-200 text-xs font-semibold">Failed Logins (24h)</span>
                <span className="font-bold text-sm text-red-400">{summary?.failed_logins_24h ?? 3}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: High Risk Activity Log */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-base font-bold text-gray-900">Privileged & Risk Activity Logs</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter events..." 
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-100">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 rounded-tl-lg">Event</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">User</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Target</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Time</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 rounded-tr-lg">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {riskLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => { setSelectedEvent(log); setIsDiffOpen(true); }}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            log.severity === 'Critical' || log.severity === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <Key size={14} />
                          </div>
                          <span className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors">{log.action.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-gray-600">
                        {log.user_name}
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-600">
                        {log.resource_type} ({log.resource_id})
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          log.severity === 'Critical' || log.severity === 'High' ? 'text-red-700 bg-red-50 border-red-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {riskLogs.length === 0 && !isLoading && (
              <div className="p-8 text-center text-gray-500 text-xs">
                No user risk events found.
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AuditDiffModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}
