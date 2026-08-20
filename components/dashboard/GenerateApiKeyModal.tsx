"use client";

import React, { useState } from 'react';
import { X, Key, Copy, CheckCircle2, ShieldAlert } from 'lucide-react';
import { generateApiKey } from '@/services/integrations';

interface GenerateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GenerateApiKeyModal({
  isOpen,
  onClose,
  onSuccess
}: GenerateApiKeyModalProps) {
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
      const res = await generateApiKey({ name, app_type: appType, volume_tier: volumeTier });
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
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Key size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Provision API Credentials</h3>
              <p className="text-xs text-slate-500">Secure Token & Key Gateway</p>
            </div>
          </div>
          <button 
            onClick={() => { setGeneratedKey(null); onClose(); }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {!generatedKey ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application / Integration Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Drone Geofence Automation Service"
                required
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Auth Protocol
                </label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
                >
                  <option value="OAuth 2.0 App">OAuth 2.0 App</option>
                  <option value="Server-to-Server">Server-to-Server</option>
                  <option value="API Token">API Token</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rate Limit Tier
                </label>
                <select
                  value={volumeTier}
                  onChange={(e) => setVolumeTier(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
                >
                  <option value="High (450k/day)">High (450k/day)</option>
                  <option value="Medium (50k/day)">Medium (50k/day)</option>
                  <option value="Low (5k/day)">Low (5k/day)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all"
              >
                {isSubmitting ? 'Generating...' : 'Generate Secret Key'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>Copy this secret key now. For security purposes, it will never be displayed again.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your API Key Secret
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedKey}
                  className="w-full p-3 bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl text-xs font-mono font-bold select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
                  title="Copy"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => { setGeneratedKey(null); onClose(); }}
                className="px-6 py-2.5 bg-[#022C4F] text-white rounded-xl text-xs font-bold hover:bg-[#033E6E] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
