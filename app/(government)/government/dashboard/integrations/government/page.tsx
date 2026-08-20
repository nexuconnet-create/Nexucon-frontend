"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link2, ShieldCheck, Activity, Key, Database, RefreshCw, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { GovernmentAPIIntegration, getGovernmentApis, testGovernmentApi } from "@/services/integrations";
import ManageGovernmentKeyModal from "@/components/dashboard/ManageGovernmentKeyModal";

export default function GovernmentIntegrations() {
  const [integrations, setIntegrations] = useState<GovernmentAPIIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApi, setSelectedApi] = useState<GovernmentAPIIntegration | null>(null);
  const [isManageKeyOpen, setIsManageKeyOpen] = useState(false);

  const fetchGovApis = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getGovernmentApis();
      setIntegrations(data);
    } catch (err) {
      console.error("Failed to load government APIs", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGovApis();
  }, [fetchGovApis]);

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Database className="text-blue-500" />
            Government System Integrations
          </h1>
          <p className="text-gray-500 mt-1">Manage inter-agency API connections to state and federal databases (CAC, LASRRA, e-GIS, FMW).</p>
        </div>
        
        <button 
          onClick={fetchGovApis}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {integrations.map((api) => (
          <div key={api.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Database size={24}/>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                  api.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {api.status === 'connected' ? <ShieldCheck size={12}/> : <Activity size={12}/>}
                  {api.status}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{api.name}</h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">{api.description}</p>
              
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1 mb-6 font-mono text-gray-600 truncate">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">API Endpoint</span>
                <span className="truncate block text-[11px]">{api.endpoint_url}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 flex items-center gap-1 font-semibold">
                <RefreshCw size={12}/> {new Date(api.last_sync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button 
                onClick={() => { setSelectedApi(api); setIsManageKeyOpen(true); }}
                className="text-blue-600 text-xs font-bold hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition-colors"
              >
                <Key size={14}/> Manage Keys
              </button>
            </div>
          </div>
        ))}
        
        <div 
          onClick={() => {
            setSelectedApi(integrations[0] || null);
            setIsManageKeyOpen(true);
          }}
          className="bg-slate-50 rounded-3xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100/80 transition-colors min-h-[260px]"
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-3">
            <Link2 size={24}/>
          </div>
          <h3 className="font-bold text-gray-900 text-sm mb-1">Add State/Federal Integration</h3>
          <p className="text-xs text-gray-500">Connect to LIRS, NIBSS, or additional government APIs</p>
        </div>
      </div>

      <ManageGovernmentKeyModal
        isOpen={isManageKeyOpen}
        onClose={() => setIsManageKeyOpen(false)}
        govApi={selectedApi}
        onSuccess={fetchGovApis}
      />
    </div>
  );
}
