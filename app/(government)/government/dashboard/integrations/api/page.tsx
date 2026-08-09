"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code2, Network, Key, Server, Activity, ShieldCheck, Settings2 } from "lucide-react";

export default function ApiConnections() {
  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Code2 className="text-pink-500" />
            API Connections
          </h1>
          <p className="text-gray-500 mt-1">Monitor external applications connecting to your agency via API.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total API Requests (24h)", value: "1.2M", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Active Webhooks", value: "24", icon: Network, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Failed Requests", value: "0.04%", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-50" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-[#022C4F]">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Server size={20} className="text-gray-400" /> Connected Applications
          </h2>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
            Manage Keys
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {[
              { name: "Contractor Portal Sync", type: "OAuth 2.0 App", usage: "High (450k/day)", status: "Healthy" },
              { name: "City Zoning Validator", type: "Server-to-Server", usage: "Medium (50k/day)", status: "Healthy" },
              { name: "Mobile Inspection App", type: "API Token", usage: "Low (5k/day)", status: "Healthy" }
            ].map((app, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors bg-white hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                    <Key size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{app.name}</h4>
                    <span className="text-xs font-semibold text-gray-500">{app.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Volume</span>
                    <span className="text-sm font-semibold text-gray-700">{app.usage}</span>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                    <Settings2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
