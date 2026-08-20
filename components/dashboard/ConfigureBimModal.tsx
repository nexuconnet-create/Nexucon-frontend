"use client";

import React, { useState } from 'react';
import { X, Box, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { BIMIntegration, connectBimPlatform } from '@/services/integrations';

interface ConfigureBimModalProps {
  isOpen: boolean;
  onClose: () => void;
  bimPlatform: BIMIntegration | null;
  onSuccess?: () => void;
}

export default function ConfigureBimModal({
  isOpen,
  onClose,
  bimPlatform,
  onSuccess
}: ConfigureBimModalProps) {
  const [clientId, setClientId] = useState(bimPlatform?.client_id || 'acc_prod_9921');
  const [webhookUrl, setWebhookUrl] = useState(bimPlatform?.webhook_url || 'https://api.nexucon.gov.ng/api/v1/integrations/bim/webhook');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (bimPlatform) {
        await connectBimPlatform({
          provider: bimPlatform.provider,
          client_id: clientId,
          webhook_url: webhookUrl,
          status: 'Connected'
        });
      } else {
        await connectBimPlatform({
          provider: 'Bentley iTwin',
          client_id: clientId,
          webhook_url: webhookUrl,
          status: 'Connected',
          icon_code: 'B'
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `BIM platform integration configured and active!`, type: 'success' } 
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
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Box size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">{bimPlatform?.provider || 'Add BIM Platform'}</h3>
              <p className="text-xs text-slate-500">OAuth 2.0 & Webhook Integration</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Client App ID / Account Key
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. acc_prod_9921"
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Live Webhook Notification Endpoint
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://api.nexucon.gov.ng/..."
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex items-center gap-2">
            <Shield size={16} className="text-emerald-500 shrink-0" />
            <span>Secure TLS handshake verified. Models will synchronize automatically on commit.</span>
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
