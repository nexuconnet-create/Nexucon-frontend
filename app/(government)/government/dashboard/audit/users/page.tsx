"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Users, Search, Filter, Shield, Key, Clock, ShieldAlert, ArrowUpRight } from "lucide-react";

export default function UserActivityLog() {
  const users = [
    { name: "Elena Rodriguez", role: "City Planner", status: "Active Now", logins: 42, color: "bg-emerald-100 text-emerald-700" },
    { name: "Marcus Chen", role: "Structural Engineer", status: "Last active 2h ago", logins: 128, color: "bg-blue-100 text-blue-700" },
    { name: "David Rivera", role: "Legal Oversight", status: "Last active 1d ago", logins: 34, color: "bg-purple-100 text-purple-700" },
  ];

  const riskLogs = [
    {
      id: "ULOG-992",
      user: "System Admin (Auto)",
      action: "Permission Escalation",
      detail: "Granted 'Approve Exceptions' to Marcus Chen",
      time: "Oct 09, 10:45 AM",
      risk: "High",
      icon: Key
    },
    {
      id: "ULOG-991",
      user: "Elena Rodriguez",
      action: "Bulk Data Export",
      detail: "Exported Q3 Compliance Records (CSV)",
      time: "Oct 08, 04:20 PM",
      risk: "Medium",
      icon: ArrowUpRight
    },
    {
      id: "ULOG-990",
      user: "David Rivera",
      action: "Failed Login Attempt",
      detail: "IP: 192.168.1.104 (3 failed attempts)",
      time: "Oct 07, 09:15 AM",
      risk: "High",
      icon: ShieldAlert
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Activity className="text-purple-500" />
            User Activity & Security
          </h1>
          <p className="text-gray-500 mt-1">Monitor personnel logins, permission changes, and high-risk actions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Users */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-blue-500" /> Active Personnel
              </h2>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search user..." 
                className="pl-9 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-4">
              {users.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.color}`}>
                    {user.name.charAt(0)}{user.name.split(' ')[1].charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">{user.name}</h4>
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
            transition={{ delay: 0.2 }}
            className="bg-[#022C4F] rounded-2xl shadow-md p-6 text-white"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" /> System Security
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-blue-900/50 pb-2">
                <span className="text-blue-200 text-sm font-semibold">Active Sessions</span>
                <span className="font-bold">42</span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-900/50 pb-2">
                <span className="text-blue-200 text-sm font-semibold">2FA Enabled</span>
                <span className="font-bold text-emerald-400">100%</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-blue-200 text-sm font-semibold">Failed Logins (24h)</span>
                <span className="font-bold text-red-400">3</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: High Risk Activity Log */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Privileged & Risk Activity</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm">
                <Filter size={14} /> Filter Events
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-100">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 rounded-tl-lg">Event</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">User</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Details</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Time</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 rounded-tr-lg">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {riskLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${
                            log.risk === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <log.icon size={14} />
                          </div>
                          <span className="font-bold text-sm text-gray-900">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">
                        {log.user}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {log.detail}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> {log.time}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          log.risk === 'High' ? 'text-red-700 bg-red-50 border-red-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}>
                          {log.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
