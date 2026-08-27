"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  FileText, CheckCircle2, FolderSync, Plus, HardDrive, 
  Cloud, RefreshCw, Radio, Lock, ShieldCheck, Database 
} from "lucide-react";
import { 
  DocumentSystemIntegration, getDocumentSystems, syncDocumentSystem, 
  getDocumentHealth, HealthCheckResult 
} from "@/services/integrations";
import ConnectDmsDrawer from "@/components/dashboard/ConnectDmsDrawer";

export default function DocumentIntegrations() {
  const [systems, setSystems] = useState<DocumentSystemIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [healthResults, setHealthResults] = useState<Record<string, HealthCheckResult>>({});
  const [testingHealthId, setTestingHealthId] = useState<string | null>(null);

  const fetchDocumentSystems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDocumentSystems();
      setSystems(data);
    } catch (err) {
      console.error("Failed to load document integrations", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentSystems();
  }, [fetchDocumentSystems]);

  const handleSync = async (id: string, name: string) => {
    setSyncingId(id);
    try {
      await syncDocumentSystem(id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `File synchronization completed for ${name}!`, type: 'success' } 
      }));
      fetchDocumentSystems();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to sync files', type: 'error' } }));
    } finally {
      setSyncingId(null);
    }
  };

  const handleHealthCheck = async (system: DocumentSystemIntegration) => {
    setTestingHealthId(system.id);
    try {
      const res = await getDocumentHealth(system.id);
      setHealthResults(prev => ({ ...prev, [system.id]: res }));
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `${system.name} responded in ${res.response_time_ms}ms (Status: ${res.status})`, type: 'success' } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Storage health check failed', type: 'error' } }));
    } finally {
      setTestingHealthId(null);
    }
  };

  const getSystemIcon = (systemType: string) => {
    if (systemType.toLowerCase().includes('cloud') || systemType.toLowerCase().includes('r2')) return Cloud;
    if (systemType.toLowerCase().includes('network') || systemType.toLowerCase().includes('on-prem')) return HardDrive;
    return FileText;
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FolderSync className="text-emerald-500" />
            Document Systems & Storage
          </h1>
          <p className="text-gray-500 mt-1">Manage Cloudflare R2 primary object storage, Cloudinary media CDN, and connected document repositories.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDocumentSystems}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsConnectOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold"
          >
            <Plus size={16} />
            Connect System
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">System Name & Bucket</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Storage Provider</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Status & Health</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Synced Files</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {systems.map((system, idx) => {
                const IconComponent = getSystemIcon(system.system_type || system.storage_provider || '');
                const health = healthResults[system.id];

                return (
                  <motion.tr 
                    key={system.id || idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                          <IconComponent size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900 block">{system.name}</span>
                            {system.name.includes('Cloudflare') && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono block mt-0.5">Bucket: {system.bucket_or_drive_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {system.storage_provider || system.system_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${
                          system.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          system.status === 'Syncing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {system.status === 'Active' && <CheckCircle2 size={10} />}
                          {system.status === 'Syncing' && <FolderSync size={10} className="animate-spin" />}
                          {system.status}
                        </span>
                        {health && (
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            {health.response_time_ms}ms
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-bold text-gray-900 font-mono block">{system.synced_files_count.toLocaleString()} files</span>
                        <span className="text-[11px] text-gray-400 font-mono">{system.folder_count || 8} mapped folders</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleHealthCheck(system)}
                          disabled={testingHealthId === system.id}
                          className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors border border-gray-200 flex items-center gap-1"
                        >
                          <Radio size={12} className={testingHealthId === system.id ? "animate-pulse text-emerald-500" : "text-gray-400"} />
                          {testingHealthId === system.id ? 'Pinging...' : 'Ping'}
                        </button>
                        <button 
                          onClick={() => handleSync(system.id, system.name)}
                          disabled={syncingId === system.id}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                        >
                          {syncingId === system.id ? 'Syncing...' : 'Sync Now'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}

              {systems.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 text-xs">
                    No document storage systems connected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConnectDmsDrawer
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onSuccess={fetchDocumentSystems}
      />
    </div>
  );
}
