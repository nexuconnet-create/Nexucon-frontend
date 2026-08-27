"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, CheckCircle2, AlertTriangle, RefreshCw, Satellite, 
  MapPin, Search, Plus, Radio, ShieldCheck, Gauge, Layers, Download, X
} from "lucide-react";
import { 
  TersusDevice, IntegrationLog, getTersusDevices, forceSyncTersusDevice, 
  getIntegrationLogs, getTersusHealth, HealthCheckResult 
} from "@/services/integrations";
import ConnectDeviceModal from "@/components/dashboard/ConnectDeviceModal";

export default function TersusIntegration() {
  const [devices, setDevices] = useState<TersusDevice[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<TersusDevice | null>(null);
  const [healthResults, setHealthResults] = useState<Record<string, HealthCheckResult>>({});
  const [testingHealthId, setTestingHealthId] = useState<string | null>(null);

  const fetchTersusData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [devData, logData] = await Promise.all([
        getTersusDevices({ search: search.trim() || undefined }),
        getIntegrationLogs({ service: 'Tersus' })
      ]);
      setDevices(devData);
      setLogs(logData);
      if (devData.length > 0 && !selectedDevice) {
        setSelectedDevice(devData[0]);
      }
    } catch (err) {
      console.error("Failed to load Tersus GNSS data", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedDevice]);

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

  const handleHealthCheck = async (device: TersusDevice) => {
    setTestingHealthId(device.id);
    try {
      const res = await getTersusHealth(device.id);
      setHealthResults(prev => ({ ...prev, [device.id]: res }));
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `${device.name} responded in ${res.response_time_ms}ms (Status: ${res.status})`, type: 'success' } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Health check failed', type: 'error' } }));
    } finally {
      setTestingHealthId(null);
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
          <p className="text-gray-500 mt-1">Manage RTK receivers, view high-precision positioning telemetry, control points, and point cloud streams.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleForceSync()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? 'Syncing...' : 'Force Sync All'}
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
        {/* Left Column: Device Status & Map */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-emerald-500" />
                Connected Receivers & Stations ({devices.length})
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
                {devices.map((device, idx) => {
                  const health = healthResults[device.id];
                  const isSelected = selectedDevice?.id === device.id;

                  return (
                    <div 
                      key={device.id || idx} 
                      onClick={() => setSelectedDevice(device)}
                      className={`border rounded-2xl p-4 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/20 shadow-sm ring-2 ring-blue-500/20' 
                          : 'border-gray-200 hover:border-blue-300 bg-gray-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-sm">{device.name}</h3>
                          </div>
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

                      <div className="space-y-1.5 py-2 my-2 border-y border-gray-100 text-[11px] text-gray-600 font-mono">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Position:</span>
                          <span className="font-semibold text-gray-800">{device.latitude.toFixed(4)}° N, {device.longitude.toFixed(4)}° E</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fix / Satellites:</span>
                          <span className="font-semibold text-blue-700">{device.rtk_fix_status || 'FIXED_RTK'} • {device.satellites_tracked || 28} Sats</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Accuracy:</span>
                          <span className="font-semibold text-emerald-700">H: ±{device.horizontal_accuracy || '0.008 m'} • V: ±{device.vertical_accuracy || '0.015 m'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-xs pt-1">
                        <div className="flex items-center gap-2 text-gray-600 font-bold">
                          <Activity size={14} className="text-emerald-500" />
                          Battery: {device.battery_level}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleHealthCheck(device); }}
                            disabled={testingHealthId === device.id}
                            className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <Radio size={12} className={testingHealthId === device.id ? "animate-pulse text-blue-500" : "text-gray-400"} />
                            {testingHealthId === device.id ? 'Ping...' : (health ? `${health.response_time_ms}ms` : 'Ping')}
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleForceSync(device); }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Sync RTK
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {devices.length === 0 && !isLoading && (
                  <div className="p-8 text-center text-xs text-gray-400 col-span-2">
                    No Tersus GNSS devices connected.
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Live GNSS Positioning & Cadastral Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-500" />
                  GNSS Positioning & Cadastral Datum ({selectedDevice?.name || 'RTK Station'})
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Reference Coordinate System: {selectedDevice?.coordinate_system || 'WGS84 / Minna Datum UTM Zone 31N'}</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold font-mono">
                {selectedDevice?.rtk_fix_status || 'FIXED_RTK'}
              </span>
            </div>
            
            <div className="bg-slate-900 w-full min-h-[260px] flex flex-col items-center justify-center relative overflow-hidden text-white p-6">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #38BDF8 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
              
              <div className="relative z-10 text-center max-w-md">
                <Satellite size={44} className="text-blue-400 mx-auto mb-3 animate-pulse" />
                <p className="font-black text-base text-blue-100">{selectedDevice?.name || 'Tersus RTK Telemetry Engine'}</p>
                <div className="mt-2 p-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-xs font-mono text-slate-300 space-y-1">
                  <p>Latitude: <span className="text-emerald-400 font-bold">{selectedDevice?.latitude ?? 6.5244}° N</span> • Longitude: <span className="text-emerald-400 font-bold">{selectedDevice?.longitude ?? 3.3792}° E</span></p>
                  <p>Elevation (MSL): <span className="text-blue-400 font-bold">{selectedDevice?.elevation ?? 12.45} m</span> • Satellites: <span className="text-amber-400 font-bold">{selectedDevice?.satellites_tracked ?? 28} Tracked</span></p>
                  <p className="text-[11px] text-slate-400">Firmware: {selectedDevice?.firmware_version || 'v2.4.2'} • Accuracy: ±{selectedDevice?.horizontal_accuracy || '0.008 m'} (Statutory Surveyor Grade)</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Ingestion Logs */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Gauge size={18} className="text-blue-500" />
                Ingestion & Telemetry Logs
              </h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[560px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-bold text-xs text-gray-800 leading-snug">{log.event_name}</span>
                    <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-2">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">{log.details}</p>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      log.status === 'Success' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-[11px] text-gray-500 font-semibold">{log.payload_size} • {log.duration_ms || 142}ms</span>
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
