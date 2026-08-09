"use client";

import React from "react";
import { motion } from "framer-motion";
import { LinkIcon, Activity, CheckCircle2, AlertTriangle, RefreshCw, Satellite, MapPin, Search } from "lucide-react";

export default function TersusIntegration() {
  const devices = [
    { id: "T-S1-8842", name: "Tersus David (Base)", status: "Active", battery: "98%", lastSync: "2 mins ago" },
    { id: "T-S1-9921", name: "Tersus Oscar (Rover 1)", status: "Active", battery: "84%", lastSync: "2 mins ago" },
    { id: "T-S1-4410", name: "Tersus Oscar (Rover 2)", status: "Offline", battery: "12%", lastSync: "3 hours ago" },
  ];

  const recentSyncs = [
    { time: "10:45 AM", type: "RTK Correction Data", status: "Success", size: "2.4 MB" },
    { time: "10:30 AM", type: "Point Cloud Update", status: "Success", size: "145 MB" },
    { time: "09:15 AM", type: "Firmware Check", status: "Warning", size: "12 KB" },
  ];

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
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold">
            <RefreshCw size={16} />
            Force Sync
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <LinkIcon size={16} />
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
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-emerald-500" />
                Connected Devices
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search devices..." 
                  className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((device, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-gray-50/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{device.name}</h3>
                        <span className="text-xs text-gray-500 font-mono mt-1 block">{device.id}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        device.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {device.status === 'Active' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                        {device.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-sm border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Activity size={14} className="text-gray-400" />
                        Battery: {device.battery}
                      </div>
                      <div className="text-gray-500 text-xs font-semibold">
                        Sync: {device.lastSync}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={20} className="text-blue-500" />
                Live Tracking Map
              </h2>
            </div>
            <div className="bg-gray-100 w-full h-[300px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="text-center z-10">
                <Satellite size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 font-semibold">Map integration pending API key...</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Sync Logs */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Recent Sync Logs</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentSyncs.map((log, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-800">{log.type}</span>
                    <span className="text-xs text-gray-500 font-mono">{log.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      log.status === 'Success' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">{log.size}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                View Full Logs
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
