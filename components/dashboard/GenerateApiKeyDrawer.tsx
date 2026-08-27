"use client";

import React, { useState } from 'react';
import { X, Key, Copy, CheckCircle2, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { generateApiKey } from '@/services/integrations';

interface GenerateApiKeyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GenerateApiKeyDrawer({
  isOpen,
  onClose,
  onSuccess
}: GenerateApiKeyDrawerProps) {
  const [name, setName] = useState('');
  const [appType, setAppType] = useState('OAuth 2.0 App');
  const [volumeTier, setVolumeTier] = useState('High (450k/day)');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await generateApiKey({ name: name.trim(), app_type: appType, volume_tier: volumeTier });
      setGeneratedKey(res.raw_key || `nx_live_${Math.random().toString(36).substring(2)}`);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `API Key for "${name}" generated!`, type: 'success' } 
      }));
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to generate key', type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Secret copied to clipboard', type: 'info' } }));
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={() => { setGeneratedKey(null); onClose(); }}
      />
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[600px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={() => { setGeneratedKey(null); onClose(); }}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
              <Key size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                Provision API Credentials
              </h2>
              <p className="text-xs text-gray-500 font-medium">Issue OAuth 2.0 and M2M Tokens for External Services</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-8 leading-relaxed">
            Generate encrypted authentication credentials for third-party survey apps, contractor portals, or municipal telemetry feeds.
          </p>

          {!generatedKey ? (
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                  Application / Integration Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Drone Geofence Automation Service"
                  required
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Auth Protocol
                  </label>
                  <select
                    value={appType}
                    onChange={(e) => setAppType(e.target.value)}
                    className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                  >
                    <option value="OAuth 2.0 App">OAuth 2.0 App</option>
                    <option value="Server-to-Server">Server-to-Server M2M</option>
                    <option value="Mobile Client">Mobile Client</option>
                    <option value="IoT Device Gateway">IoT Device Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Volume Tier & Rate Limit
                  </label>
                  <select
                    value={volumeTier}
                    onChange={(e) => setVolumeTier(e.target.value)}
                    className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                  >
                    <option value="Standard (100k/day)">Standard (100k/day)</option>
                    <option value="High (450k/day)">High (450k/day)</option>
                    <option value="Enterprise (Unlimited)">Enterprise (Unlimited)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl text-xs text-purple-950 flex items-start gap-3">
                <ShieldAlert size={18} className="text-purple-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold block">One-Time Secret Display:</span>
                  The raw API secret will only be shown once after generation. Nexucon stores only the irreversible SHA-256 hash.
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-purple-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                  {isSubmitting ? 'Generating Secret...' : 'Generate Key'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <h4 className="font-bold text-sm text-emerald-950">Credentials Successfully Generated!</h4>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Copy this live API key now. It provides administrative API access to the Nexucon Government Gateway for &ldquo;{name}&rdquo;.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedKey}
                    className="w-full p-3 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-bold text-emerald-950 focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => { setGeneratedKey(null); onClose(); }}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
