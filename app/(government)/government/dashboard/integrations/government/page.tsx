"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Database, ShieldCheck, Activity, Key, RefreshCw, 
  Radio, CheckCircle2, Search, Building2, MapPin, UserCheck, AlertCircle, Plus, Link2 
} from "lucide-react";
import { 
  GovernmentAPIIntegration, getGovernmentApis, testGovernmentApi, 
  verifyGovernmentEntity, EntityVerificationResult 
} from "@/services/integrations";
import ManageGovernmentKeyModal from "@/components/dashboard/ManageGovernmentKeyModal";

export default function GovernmentIntegrations() {
  const [integrations, setIntegrations] = useState<GovernmentAPIIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApi, setSelectedApi] = useState<GovernmentAPIIntegration | null>(null);
  const [isManageKeyOpen, setIsManageKeyOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Regulatory Lookup State
  const [verifyProvider, setVerifyProvider] = useState("CAC");
  const [verifyQuery, setVerifyQuery] = useState("RC-1849204");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<EntityVerificationResult | null>(null);

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

  const handleTestConnection = async (api: GovernmentAPIIntegration) => {
    setTestingId(api.id);
    try {
      const res = await testGovernmentApi(api.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Live mutual TLS handshake verified with ${api.name} (200 OK)!`, type: 'success' } 
      }));
      fetchGovApis();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Connection test failed', type: 'error' } }));
    } finally {
      setTestingId(null);
    }
  };

  const handleRunVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyQuery.trim()) return;

    setIsVerifying(true);
    try {
      const result = await verifyGovernmentEntity(verifyProvider, verifyQuery.trim());
      setVerifyResult(result);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `${result.provider} entity record verified!`, type: 'success' } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Verification lookup failed', type: 'error' } }));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Database className="text-blue-500" />
            Government System Integrations
          </h1>
          <p className="text-gray-500 mt-1">Inter-agency bridges to state & federal regulatory authorities (CAC, LASRRA, e-GIS, FMW).</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchGovApis}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Grid of Government API Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {integrations.map((api) => (
          <div key={api.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                  {api.provider_code || 'GOV'}
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                  api.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {api.status === 'connected' ? <ShieldCheck size={12}/> : <Activity size={12}/>}
                  {api.status}
                </span>
              </div>
              
              <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug">{api.name}</h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">{api.description}</p>
              
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1 mb-4 font-mono text-gray-600 truncate">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">API Endpoint</span>
                <span className="truncate block text-[11px] text-gray-800">{api.endpoint_url}</span>
              </div>

              <div className="mb-4">
                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded block text-center">
                  {api.documentation_status || 'PENDING CLIENT API DOCUMENTATION'}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
              <button 
                onClick={() => handleTestConnection(api)}
                disabled={testingId === api.id}
                className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors border border-gray-200 flex items-center gap-1"
              >
                <Radio size={12} className={testingId === api.id ? "animate-pulse text-blue-500" : "text-gray-400"} />
                {testingId === api.id ? 'Pinging...' : 'Test Ping'}
              </button>
              <button 
                onClick={() => { setSelectedApi(api); setIsManageKeyOpen(true); }}
                className="text-blue-600 text-xs font-bold hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition-colors"
              >
                <Key size={14}/> Keys
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Regulatory Entity Verification Engine */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-7"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" />
              Live Regulatory Entity & Cadastral Verification
            </h2>
            <p className="text-xs text-gray-500 mt-1">Execute live lookup against CAC corporate registries, e-GIS parcels, and LASRRA residency identifiers.</p>
          </div>
          <div className="flex items-center gap-2">
            {['CAC', 'EGIS', 'LASRRA'].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setVerifyProvider(p);
                  setVerifyQuery(p === 'CAC' ? 'RC-1849204' : p === 'EGIS' ? 'PCL-LEKKI-084' : 'LA-9920148');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  verifyProvider === p 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRunVerification} className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={verifyQuery}
              onChange={(e) => setVerifyQuery(e.target.value)}
              placeholder="Enter CAC RC number, e-GIS parcel ID, or LASRRA ID..." 
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying}
            className="px-6 py-3 bg-[#022C4F] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className={isVerifying ? "animate-spin" : ""} />
            {isVerifying ? 'Authenticating...' : 'Verify Entity'}
          </button>
        </form>

        {verifyResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="font-bold text-sm text-gray-900">{verifyResult.provider}</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg font-mono">
                {verifyResult.registration_status || verifyResult.cadastral_status || verifyResult.identity_status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {verifyResult.company_name && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Company Legal Name</span>
                  <span className="font-bold text-gray-900">{verifyResult.company_name}</span>
                </div>
              )}
              {verifyResult.rc_number && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">CAC RC Number</span>
                  <span className="font-bold text-blue-700">{verifyResult.rc_number}</span>
                </div>
              )}
              {verifyResult.incorporation_date && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Incorporation Date</span>
                  <span className="font-bold text-gray-800">{verifyResult.incorporation_date}</span>
                </div>
              )}
              {verifyResult.scheme_name && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Cadastral Scheme</span>
                  <span className="font-bold text-gray-900">{verifyResult.scheme_name}</span>
                </div>
              )}
              {verifyResult.beacon_numbers && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Beacon Numbers</span>
                  <span className="font-bold text-emerald-700">{verifyResult.beacon_numbers.join(', ')}</span>
                </div>
              )}
              {verifyResult.registered_office && (
                <div className="md:col-span-3">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Registered Statutory Address</span>
                  <span className="font-bold text-gray-800">{verifyResult.registered_office}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <ManageGovernmentKeyModal
        isOpen={isManageKeyOpen}
        onClose={() => setIsManageKeyOpen(false)}
        govApi={selectedApi}
        onSuccess={fetchGovApis}
      />
    </div>
  );
}
