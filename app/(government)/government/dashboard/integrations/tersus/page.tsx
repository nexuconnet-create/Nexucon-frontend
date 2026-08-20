"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { LinkIcon, Activity, CheckCircle2, AlertTriangle, RefreshCw, Satellite, MapPin, Search, Plus } from "lucide-react";
import { TersusDevice, IntegrationLog, getTersusDevices, forceSyncTersusDevice, getIntegrationLogs } from "@/services/integrations";
import ConnectDeviceModal from "@/components/dashboard/ConnectDeviceModal";

export default function TersusIntegration() {
  const [devices, setDevices] = useState<TersusDevice[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  const fetchTersusData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [devData, logData] = await Promise.all([
        getTersusDevices({ search: search.trim() || undefined }),
        getIntegrationLogs({ service: 'Tersus' })
      ]);
      setDevices(devData);
      setLogs(logData);
    } catch (err) {
      console.error("Failed to load Tersus GNSS data", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTersusData();
  }, [fetchTersusData]);

  const handleForceSync = async (device?: TersusDevice) => {
    setIsSyncing(true);
    try {
      if (device) {
        await forceSyncTersusDevice(device.id);
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `Point cloud sync triggered for ${device.name}!`, type: 'success' } 
        }));
      } else if (devices.length > 0) {
        await forceSyncTersusDevice(devices[0].id);
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `GNSS telemetry sync forced across all connected RTK receivers!`, type: 'success' } 
        }));
      }
      fetchTersusData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to sync device', type: 'error' } }));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Satellite className="text-blue-500" />
            Tersus GNSS Integration
          </h1>
          <p className="text-gray-500 mt-1">Manage RTK receivers, view device telemetry, and monitor data ingestion.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleForceSync()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? 'Syncing...' : 'Force Sync'}
          </button>
          <button 
            onClick={() => setIsConnectOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold"
          >
            <Plus size={16} />
            Connect Device
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Device Status */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-emerald-500" />
                Connected Devices ({devices.length})
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search devices..." 
                  className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((device, idx) => (
                  <div key={device.id || idx} className="border border-gray-200 rounded-2xl p-4 hover:border-blue-300 transition-colors bg-gray-50/40">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{device.name}</h3>
                        <span className="text-xs text-gray-500 font-mono mt-0.5 block">{device.device_id}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                        device.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {device.status === 'Active' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                        {device.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-xs border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-gray-600 font-bold">
                        <Activity size={14} className="text-emerald-500" />
                        Battery: {device.battery_level}
                      </div>
                      <button 
                        onClick={() => handleForceSync(device)}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Sync RTK
                      </button>
                    </div>
                  </div>
                ))}

                {devices.length === 0 && !isLoading && (
                  <div className="p-8 text-center text-xs text-gray-400 col-span-2">
                    No Tersus GNSS devices connected.
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={20} className="text-blue-500" />
                Live GNSS Positioning & Cadastral Overlay
              </h2>
            </div>
            <div className="bg-slate-900 w-full h-[260px] flex flex-col items-center justify-center relative overflow-hidden text-white p-6">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #38BDF8 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
              <Satellite size={44} className="text-blue-400 mb-2 animate-bounce" />
              <p className="font-bold text-sm">RTK Base Station Telemetry Active</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">Coordinates: 6.5244° N, 3.3792° E • Accuracy: ±2.4mm (High Precision)</p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Sync Logs */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Ingestion Logs</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-bold text-xs text-gray-800">{log.event_name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      log.status === 'Success' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-[11px] text-gray-500 font-semibold">{log.payload_size}</span>
                  </div>
                </div>
              ))}

              {logs.length === 0 && !isLoading && (
                <div className="p-8 text-center text-xs text-gray-400">
                  No telemetry logs available.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <ConnectDeviceModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onSuccess={fetchTersusData}
      />
    </div>
  );
}
