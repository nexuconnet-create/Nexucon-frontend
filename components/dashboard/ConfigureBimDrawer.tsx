"use client";

import React, { useState } from 'react';
import { X, Box, CheckCircle2, Shield, RefreshCw, Layers, LinkIcon } from 'lucide-react';
import { BIMIntegration, connectBimPlatform } from '@/services/integrations';

interface ConfigureBimDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bimPlatform: BIMIntegration | null;
  onSuccess?: () => void;
}

export default function ConfigureBimDrawer({
  isOpen,
  onClose,
  bimPlatform,
  onSuccess
}: ConfigureBimDrawerProps) {
  const [provider, setProvider] = useState(bimPlatform?.provider || 'Trimble Connect');
  const [environment, setEnvironment] = useState(bimPlatform?.environment || 'Production');
  const [clientId, setClientId] = useState(bimPlatform?.client_id || 'trimble_connect_prod_01');
  const [webhookUrl, setWebhookUrl] = useState(bimPlatform?.webhook_url || 'https://api.nexucon.gov.ng/api/v1/integrations/bim/webhook');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleProviderSelect = (p: string) => {
    setProvider(p);
    if (p === 'Trimble Connect') {
      setClientId('trimble_connect_prod_01');
      setWebhookUrl('https://api.nexucon.gov.ng/api/v1/integrations/bim/trimble');
    } else if (p === 'Autodesk Construction Cloud') {
      setClientId('acc_prod_9921');
      setWebhookUrl('https://api.nexucon.gov.ng/api/v1/integrations/bim/autodesk');
    } else if (p === 'Procore Construction OS') {
      setClientId('procore_ent_8832');
      setWebhookUrl('https://api.nexucon.gov.ng/api/v1/integrations/bim/procore');
    } else {
      setClientId('bentley_itwin_7721');
      setWebhookUrl('https://api.nexucon.gov.ng/api/v1/integrations/bim/bentley');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await connectBimPlatform({
        provider: bimPlatform ? bimPlatform.provider : provider,
        client_id: clientId.trim(),
        webhook_url: webhookUrl.trim(),
        environment: environment,
        status: 'Connected',
        icon_code: provider[0] || 'B'
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `BIM integration "${provider}" configured and active!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to configure BIM platform', type: 'error' } }));
    } finally {
      setIsSubmitting(false);
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
              <Box size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                {bimPlatform ? `Configure ${bimPlatform.provider}` : 'Connect BIM Platform'}
              </h2>
              <p className="text-xs text-gray-500 font-medium">Trimble Connect, Autodesk, Procore & Bentley OAuth 2.0.</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-8 leading-relaxed">
            Configure external design platforms to link IFC models, technical revisions, clash detection matrices, and 3D architectural reviews to Nexucon project workflows.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!bimPlatform && (
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                  Select BIM Platform
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Trimble Connect', label: 'Trimble Connect (Default)' },
                    { id: 'Autodesk Construction Cloud', label: 'Autodesk Construction Cloud' },
                    { id: 'Procore Construction OS', label: 'Procore Construction OS' },
                    { id: 'Bentley iTwin', label: 'Bentley iTwin' }
                  ].map((p) => {
                    const isSelected = provider === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleProviderSelect(p.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all text-xs font-bold ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50/40 text-blue-900 ring-1 ring-blue-500' 
                            : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300'
                        }`}
                      >
                        <span>{p.label}</span>
                        {isSelected && <CheckCircle2 size={14} className="text-blue-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Environment Tier
              </label>
              <div className="flex gap-3">
                {['Production', 'Staging / Sandbox'].map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      environment === env 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm' 
                        : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                OAuth 2.0 Client App ID / Account Key
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="e.g. trimble_connect_prod_01"
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Live Webhook Notification Endpoint
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.nexucon.gov.ng/..."
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-950 flex items-start gap-3">
              <Shield size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold block">Bi-directional Model Synchronization:</span>
                Nexucon verifies incoming webhook signatures using HMAC-SHA256 to ensure zero duplicate model ingestion.
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
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                {isSubmitting ? 'Saving Configuration...' : 'Save & Connect'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
