"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code2, Network, Key, Server, Activity, ShieldCheck, 
  RotateCw, Trash2, Plus, RefreshCw, Copy, CheckCircle2, AlertTriangle, Shield 
} from "lucide-react";
import { 
  APIKeyCredential, IntegrationStats, getApiKeys, 
  getIntegrationStats, rotateApiKey, revokeApiKey 
} from "@/services/integrations";
import GenerateApiKeyModal from "@/components/dashboard/GenerateApiKeyModal";

export default function ApiConnections() {
  const [credentials, setCredentials] = useState<APIKeyCredential[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [rotatedKeyNotice, setRotatedKeyNotice] = useState<{ id: string; name: string; key: string } | null>(null);

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

  const handleRotateKey = async (cred: APIKeyCredential) => {
    if (!confirm(`Are you sure you want to rotate the API secret for "${cred.name}"? The previous token will immediately cease functioning.`)) {
      return;
    }

    setRotatingId(cred.id);
    try {
      const res = await rotateApiKey(cred.id);
      if (res.raw_key) {
        setRotatedKeyNotice({ id: cred.id, name: cred.name, key: res.raw_key });
      }
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `API secret for "${cred.name}" successfully rotated!`, type: 'success' } 
      }));
      fetchApiData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to rotate key', type: 'error' } }));
    } finally {
      setRotatingId(null);
    }
  };

  const handleRevokeKey = async (cred: APIKeyCredential) => {
    if (!confirm(`Permanently revoke access for "${cred.name}"? This action cannot be undone.`)) {
      return;
    }

    setRevokingId(cred.id);
    try {
      await revokeApiKey(cred.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Token for "${cred.name}" revoked.`, type: 'info' } 
      }));
      fetchApiData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to revoke key', type: 'error' } }));
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Code2 className="text-purple-500" />
            API Gateway & Credentials
          </h1>
          <p className="text-gray-500 mt-1">Manage secure inter-agency OAuth 2.0 clients, rate limits, secret rotation, and API credentials.</p>
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
            Provision New Key
          </button>
        </div>
      </div>

      {/* Rotated Key Banner */}
      <AnimatePresence>
        {rotatedKeyNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-5 bg-purple-50 border border-purple-200 rounded-3xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-purple-600 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-sm text-purple-950">New Secret Key Generated for {rotatedKeyNotice.name}</h4>
                  <p className="text-xs text-purple-700 mt-0.5">Please copy this secret now. For security purposes, it will never be displayed again.</p>
                </div>
              </div>
              <button 
                onClick={() => setRotatedKeyNotice(null)}
                className="text-purple-500 hover:text-purple-700 text-xs font-bold px-2"
              >
                Dismiss
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={rotatedKeyNotice.key}
                className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-900 focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rotatedKeyNotice.key);
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'New secret copied!', type: 'success' } }));
                }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <Copy size={14} /> Copy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <Server size={20} className="text-gray-400" /> Connected Applications & Keys ({credentials.length})
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
              <div key={app.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-purple-200 transition-colors bg-white hover:shadow-sm gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    app.status === 'Healthy' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    <Key size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-sm">{app.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        app.status === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-semibold mt-1 font-mono">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] text-gray-700">{app.key_prefix}••••••••••••8A72</span>
                      <span className="text-gray-300">•</span>
                      <span>{app.app_type}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-purple-700">{app.volume_tier}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  {app.status === 'Healthy' && (
                    <>
                      <button 
                        onClick={() => handleRotateKey(app)}
                        disabled={rotatingId === app.id}
                        title="Rotate Secret"
                        className="px-3 py-1.5 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-xl text-xs font-bold border border-gray-200 flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCw size={13} className={rotatingId === app.id ? "animate-spin text-purple-600" : ""} />
                        Rotate
                      </button>
                      <button 
                        onClick={() => handleRevokeKey(app)}
                        disabled={revokingId === app.id}
                        title="Revoke Access"
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 size={13} />
                        Revoke
                      </button>
                    </>
                  )}
                  {app.status === 'Revoked' && (
                    <span className="text-xs text-gray-400 font-mono">Revoked on {new Date(app.last_used_at).toLocaleDateString()}</span>
                  )}
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
