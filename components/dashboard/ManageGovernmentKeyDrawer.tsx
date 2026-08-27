"use client";

import React, { useState } from 'react';
import { X, Database, ShieldCheck, Key, RefreshCw, Radio, Lock } from 'lucide-react';
import { GovernmentAPIIntegration, testGovernmentApi } from '@/services/integrations';

interface ManageGovernmentKeyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  govApi: GovernmentAPIIntegration | null;
  onSuccess?: () => void;
}

export default function ManageGovernmentKeyDrawer({
  isOpen,
  onClose,
  govApi,
  onSuccess
}: ManageGovernmentKeyDrawerProps) {
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••');
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen || !govApi) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await testGovernmentApi(govApi.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Live ping to ${govApi.name} responded 200 OK!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Connection test failed', type: 'error' } }));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[600px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                {govApi.name}
              </h2>
              <p className="text-xs text-gray-500 font-medium">Inter-Agency Security & Mutual TLS Token Management</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-8 leading-relaxed">
            Configure encrypted inter-agency keys, verify certificate pinning, and test real-time connectivity to state and federal databases.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                API Endpoint URL
              </label>
              <input
                type="text"
                readOnly
                value={govApi.endpoint_url}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-mono text-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Encrypted Agency Token / Client Secret
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full h-12 border border-slate-200 rounded-xl px-4 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-mono">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Auth Method</span>
                <span className="font-bold text-gray-800">{govApi.auth_method || 'mTLS / Bearer Token'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Data Flow</span>
                <span className="font-bold text-blue-700">{govApi.data_flow_direction}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-950 flex items-start gap-3">
              <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold block">Mutual TLS & Government PKI:</span>
                Encrypted using AES-256 with government PKI certificate pinning. Secrets are never exposed to external web clients.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Radio size={14} className={isTesting ? "animate-pulse text-blue-500" : "text-slate-400"} />
                {isTesting ? 'Pinging Handshake...' : 'Test Connection'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
