"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Box, CheckCircle2, AlertTriangle, RefreshCw, Plus, 
  ExternalLink, Radio, Shield, Layers, Power, LinkIcon, Settings2 
} from "lucide-react";
import { 
  BIMIntegration, getBimIntegrations, syncBimPlatform, 
  disconnectBimPlatform, getBimHealth, HealthCheckResult 
} from "@/services/integrations";
import ConfigureBimDrawer from "@/components/dashboard/ConfigureBimDrawer";

export default function BimIntegrations() {
  const [platforms, setPlatforms] = useState<BIMIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedBim, setSelectedBim] = useState<BIMIntegration | null>(null);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [healthResults, setHealthResults] = useState<Record<string, HealthCheckResult>>({});
  const [testingHealthId, setTestingHealthId] = useState<string | null>(null);

  const fetchBimData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBimIntegrations();
      setPlatforms(data);
    } catch (err) {
      console.error("Failed to load BIM integrations", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBimData();
  }, [fetchBimData]);

  const handleSync = async (id: string, provider: string) => {
    setSyncingId(id);
    try {
      await syncBimPlatform(id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `3D model ingestion synchronized with ${provider}!`, type: 'success' } 
      }));
      fetchBimData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to sync models', type: 'error' } }));
    } finally {
      setSyncingId(null);
    }
  };

  const handleHealthCheck = async (platform: BIMIntegration) => {
    setTestingHealthId(platform.id);
    try {
      const res = await getBimHealth(platform.id);
      setHealthResults(prev => ({ ...prev, [platform.id]: res }));
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `${platform.provider} OAuth bridge responded in ${res.response_time_ms}ms (Status: ${res.status})`, type: 'success' } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Health check failed', type: 'error' } }));
    } finally {
      setTestingHealthId(null);
    }
  };

  const handleToggleDisconnect = async (platform: BIMIntegration) => {
    if (platform.status === 'Connected') {
      try {
        await disconnectBimPlatform(platform.id);
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `${platform.provider} disconnected`, type: 'info' } 
        }));
        fetchBimData();
      } catch (err) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to disconnect', type: 'error' } }));
      }
    } else {
      setSelectedBim(platform);
      setIsConfigureOpen(true);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Box className="text-blue-500" />
            BIM & Design Platforms
          </h1>
          <p className="text-gray-500 mt-1">Connect and synchronize 3D models and IFC revisions from Trimble Connect, Autodesk, Procore, and Bentley.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchBimData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => { setSelectedBim(null); setIsConfigureOpen(true); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold"
          >
            <Plus size={16} />
            Add Integration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map((platform, idx) => {
          const health = healthResults[platform.id];

          return (
            <motion.div
              key={platform.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl font-black text-blue-800">
                      {platform.icon_code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{platform.provider}</h3>
                        {platform.provider === 'Trimble Connect' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${platform.status === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span className="text-xs font-semibold text-gray-500">{platform.status}</span>
                        <span className="text-[11px] text-gray-400 font-mono">• {platform.environment || 'Production'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleHealthCheck(platform)}
                      disabled={testingHealthId === platform.id}
                      title="Test Connection"
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-gray-200 transition-colors"
                    >
                      <Radio size={12} className={testingHealthId === platform.id ? "animate-pulse text-blue-500" : "text-gray-400"} />
                      {testingHealthId === platform.id ? 'Testing...' : (health ? `${health.response_time_ms}ms` : 'Ping')}
                    </button>
                    <button 
                      onClick={() => { setSelectedBim(platform); setIsConfigureOpen(true); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Configure"
                    >
                      <Settings2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Synced 3D Models</span>
                    <span className="text-2xl font-black text-[#022C4F]">{platform.synced_models_count}</span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Active Projects</span>
                    <span className="text-2xl font-black text-blue-600">{platform.project_count || 4}</span>
                  </div>
                </div>

                {platform.webhook_url && (
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-mono text-gray-600 mb-4 truncate">
                    <span className="text-gray-400 mr-1">Webhook:</span>
                    <span className="text-gray-700">{platform.webhook_url}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => handleSync(platform.id, platform.provider)}
                  disabled={syncingId === platform.id || platform.status !== 'Connected'}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-xs font-bold disabled:opacity-50"
                >
                  <RefreshCw size={14} className={syncingId === platform.id ? "animate-spin" : ""} />
                  {syncingId === platform.id ? 'Syncing...' : 'Sync Models'}
                </button>
                <button 
                  onClick={() => handleToggleDisconnect(platform)}
                  className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl transition-colors shadow-sm text-xs font-bold ${
                    platform.status === 'Connected' 
                      ? 'bg-slate-900 text-white hover:bg-slate-800' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <Power size={14} />
                  {platform.status === 'Connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </motion.div>
          );
        })}

        {platforms.length === 0 && !isLoading && (
          <div className="p-12 text-center text-gray-400 text-xs col-span-2">
            No BIM platforms connected.
          </div>
        )}
      </div>

      <ConfigureBimDrawer
        isOpen={isConfigureOpen}
        onClose={() => setIsConfigureOpen(false)}
        bimPlatform={selectedBim}
        onSuccess={fetchBimData}
      />
    </div>
  );
}
