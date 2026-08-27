"use client";

import React, { useState } from 'react';
import { X, Code2, Plus, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { createWebhookSubscription } from '@/services/settings';

interface AddWebhookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddWebhookDrawer({
  isOpen,
  onClose,
  onSuccess
}: AddWebhookDrawerProps) {
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [events, setEvents] = useState(['permit.approved', 'defect.critical']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const availableEvents = [
    { id: 'permit.created', label: 'Permit Application Submitted' },
    { id: 'permit.approved', label: 'Permit Approved' },
    { id: 'inspection.logged', label: 'Field Inspection Logged' },
    { id: 'defect.critical', label: 'Critical Defect Detected' },
    { id: 'telemetry.alert', label: 'IoT / Sensor Threshold Breach' }
  ];

  const handleToggleEvent = (eventId: string) => {
    if (events.includes(eventId)) {
      if (events.length > 1) setEvents(events.filter(e => e !== eventId));
    } else {
      setEvents([...events, eventId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetUrl.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Name and Target URL are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createWebhookSubscription({
        name: name.trim(),
        target_url: targetUrl.trim(),
        events
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Webhook endpoint "${name}" registered!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to create webhook', type: 'error' } }));
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
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[560px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Code2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                Add Webhook Endpoint
              </h2>
              <p className="text-xs text-gray-500 font-medium">Real-time HTTP Event Subscriptions & Payloads</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-8 leading-relaxed">
            Register webhook HTTPS listeners to consume state updates (e.g. ERP integrations, automated municipal dispatch systems).
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Webhook Name / Integration Alias
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. LASRRA Civil Registry Bridge"
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Target HTTPS Payload URL
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://api.agency.gov.ng/webhooks/nexucon"
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-mono font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Subscribed Event Topics
              </label>
              <div className="space-y-2">
                {availableEvents.map(evt => (
                  <label key={evt.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={events.includes(evt.id)}
                      onChange={() => handleToggleEvent(evt.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">{evt.label}</span>
                      <span className="text-[10px] font-mono text-gray-400">{evt.id}</span>
                    </div>
                  </label>
                ))}
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
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                {isSubmitting ? 'Registering Webhook...' : 'Register Webhook'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
