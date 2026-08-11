"use client";
import React from "react";
import { Link2, ShieldCheck, Activity, Key, Database, RefreshCw, AlertTriangle } from "lucide-react";

export default function GovernmentIntegrations() {
  const integrations = [
    { 
      id: "cac", name: "CAC (Corporate Affairs)", 
      desc: "Verify developer and contractor company registration status automatically.",
      status: "connected", lastSync: "10 mins ago"
    },
    { 
      id: "lasrra", name: "LASRRA Identity", 
      desc: "Validate Lagos State Resident Registration for on-site professionals and workers.",
      status: "connected", lastSync: "2 hours ago"
    },
    { 
      id: "egis", name: "Lagos e-GIS Registry", 
      desc: "Cross-reference project coordinates against state cadastral and land title data.",
      status: "degraded", lastSync: "1 day ago"
    },
    { 
      id: "fmw", name: "FMW (Federal Ministry of Works)", 
      desc: "Federal infrastructure alignment and highway proximity checks.",
      status: "connected", lastSync: "5 mins ago"
    },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Government System Integrations</h1>
          <p className="text-gray-500 mt-1">Manage API connections to state and federal databases (CAC, LASRRA, e-GIS, FMW).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {integrations.map((api) => (
          <div key={api.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:border-blue-200 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database size={24}/>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                api.status === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {api.status === 'connected' ? <ShieldCheck size={12}/> : <Activity size={12}/>}
                {api.status}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{api.name}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">{api.desc}</p>
            
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1"><RefreshCw size={12}/> {api.lastSync}</span>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1">
                <Key size={14}/> Manage Keys
              </button>
            </div>
          </div>
        ))}
        
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mb-4">
            <Link2 size={24}/>
          </div>
          <h3 className="font-bold text-gray-700 mb-1">Add Integration</h3>
          <p className="text-sm text-gray-500">Connect to LIRS, NIBSS, or other APIs</p>
        </div>
      </div>
    </div>
  );
}
