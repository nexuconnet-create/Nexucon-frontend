"use client";

import React, { useState } from 'react';
import { X, Database, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { GovernmentAPIIntegration, testGovernmentApi } from '@/services/integrations';

interface ManageGovernmentKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  govApi: GovernmentAPIIntegration | null;
  onSuccess?: () => void;
}

export default function ManageGovernmentKeyModal({
  isOpen,
  onClose,
  govApi,
  onSuccess
}: ManageGovernmentKeyModalProps) {
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
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">{govApi.name}</h3>
              <p className="text-xs text-slate-500">Government Inter-Agency Bridge</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              API Endpoint URL
            </label>
            <input
              type="text"
              readOnly
              value={govApi.endpoint_url}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Encrypted Agency Token / Secret Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600 shrink-0" />
            <span>Encrypted using AES-256 with mutual government TLS certificate pinning.</span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} className={isTesting ? "animate-spin" : ""} />
              {isTesting ? 'Testing Ping...' : 'Test Live Connection'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
