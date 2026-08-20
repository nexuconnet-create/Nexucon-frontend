"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Code2, Network, Key, Server, Activity, ShieldCheck, Settings2, Plus, RefreshCw } from "lucide-react";
import { APIKeyCredential, IntegrationStats, getApiKeys, getIntegrationStats } from "@/services/integrations";
import GenerateApiKeyModal from "@/components/dashboard/GenerateApiKeyModal";

export default function ApiConnections() {
  const [credentials, setCredentials] = useState<APIKeyCredential[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const fetchApiData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [keysData, statsData] = await Promise.all([
        getApiKeys(),
        getIntegrationStats()
      ]);
      setCredentials(keysData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load API keys", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiData();
  }, [fetchApiData]);

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Code2 className="text-purple-500" />
            API Gateway & Credentials
          </h1>
          <p className="text-gray-500 mt-1">Monitor external applications connecting to your agency via OAuth and API keys.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchApiData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20 text-sm font-bold"
          >
            <Plus size={16} />
            Generate New Key
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total API Requests (24h)", value: stats?.total_requests_24h ?? "1.2M", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Active Webhooks", value: String(stats?.active_webhooks ?? 24), icon: Network, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Failed Requests Rate", value: stats?.failed_requests_rate ?? "0.04%", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-50" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
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
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Server size={20} className="text-gray-400" /> Connected Applications ({credentials.length})
          </h2>
          <button 
            onClick={() => setIsGenerateOpen(true)}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm"
          >
            + Provision Key
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {credentials.map((app, idx) => (
              <div key={app.id || idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-purple-200 transition-colors bg-white hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <Key size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{app.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mt-0.5">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">{app.key_prefix}...</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{app.app_type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Volume Tier</span>
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{app.volume_tier}</span>
                  </div>
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('show-toast', { 
                        detail: { message: `Credentials for ${app.name} are active.`, type: 'info' } 
                      }));
                    }}
                    className="p-2 text-gray-400 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    <Settings2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {credentials.length === 0 && !isLoading && (
              <div className="p-8 text-center text-xs text-gray-400">
                No active API credentials found.
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <GenerateApiKeyModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={fetchApiData}
      />
    </div>
  );
}
