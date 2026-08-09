"use client";

import React, { useState } from "react";
import { 
  Settings,
  Key,
  Shield,
  RefreshCcw,
  Wifi,
  WifiOff,
  Link as LinkIcon,
  Save,
  CheckCircle,
  Copy
} from "lucide-react";

export default function IntegrationSettings() {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const apiKey = "nex_live_8f92j10xmv83h2nc94";

  const hardware = [
    { id: "NAVIS-V3-001", model: "Tersus S1", lastSeen: "2 mins ago", status: "online", battery: "84%" },
    { id: "NAVIS-V3-002", model: "Tersus S1", lastSeen: "5 hrs ago", status: "offline", battery: "0%" },
    { id: "NAVIS-V3-003", model: "Tersus S1", lastSeen: "Just now", status: "online", battery: "92%" },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Integration Settings</h1>
          <p className="text-gray-500 mt-1">Manage API keys, webhooks, and connected Tersus S1 hardware.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Key size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">API Credentials</h2>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Live Secret Key</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input 
                    type={apiKeyVisible ? "text" : "password"} 
                    value={apiKey} 
                    readOnly
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-800 focus:outline-none"
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                    onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  >
                    {apiKeyVisible ? <Shield size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                <button className="px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm font-medium text-sm flex items-center gap-2 transition-colors">
                  <Copy size={16} /> Copy
                </button>
                <button className="px-4 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
                  <RefreshCcw size={16} /> Revoke
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Use this key to authenticate requests from your custom applications to the Nexucon processing engine.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL (Optional)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="url" 
                  placeholder="https://your-domain.com/webhook/nexucon" 
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm">
                  <Save size={16} /> Save
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">We will send a POST request to this URL whenever a scan finishes processing.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <LinkIcon size={20} className="text-emerald-500" />
              <h2 className="text-lg font-bold text-gray-800">Connected Hardware Fleet</h2>
            </div>

            <div className="space-y-4">
              {hardware.map((device) => (
                <div key={device.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      device.status === 'online' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {device.status === 'online' ? <Wifi size={20} /> : <WifiOff size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        {device.id}
                        {device.status === 'online' && <CheckCircle size={14} className="text-emerald-500" />}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{device.model} • Battery: {device.battery}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                      device.status === 'online' ? 'text-emerald-600 bg-emerald-100' : 'text-gray-500 bg-gray-200'
                    }`}>
                      {device.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Last seen: {device.lastSeen}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-6 w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              + Register New Device
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-blue-400" />
              API Documentation
            </h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Integrate Nexucon directly into your ERP or project management software. Our RESTful API allows you to trigger scans programmatically and fetch results.
            </p>
            <div className="space-y-3">
              <a href="#" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-sm font-medium">
                Authentication Guide
              </a>
              <a href="#" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-sm font-medium">
                Endpoints Reference
              </a>
              <a href="#" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-sm font-medium">
                Webhook Event Types
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Eye Icon component for toggle visibility
function EyeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
