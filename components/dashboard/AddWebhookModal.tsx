"use client";

import React, { useState } from 'react';
import { X, Code2, ShieldCheck } from 'lucide-react';
import { createWebhook } from '@/services/settings';

interface AddWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddWebhookModal({
  isOpen,
  onClose,
  onSuccess
}: AddWebhookModalProps) {
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [events, setEvents] = useState(['permit.created', 'permit.updated', 'inspection.failed']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const availableEvents = [
    'permit.created',
    'permit.updated',
    'permit.approved',
    'inspection.scheduled',
    'inspection.failed',
    'stop_work.issued',
    'deviation.detected'
  ];

  const toggleEvent = (evt: string) => {
    if (events.includes(evt)) {
      setEvents(events.filter(e => e !== evt));
    } else {
      setEvents([...events, evt]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await createWebhook({ name, target_url: targetUrl, events });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Webhook "${name}" endpoint registered!`, type: 'success' } 
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
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Code2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Add Webhook Endpoint</h3>
              <p className="text-xs text-slate-500">Real-Time Event Dispatch Gateway</p>
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
              Subscription Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Contractor Portal Sync"
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payload Delivery URL
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://api.contractorsync.dev/v1/events"
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Events to Subscribe
            </label>
            <div className="flex flex-wrap gap-2">
              {availableEvents.map((evt) => (
                <button
                  type="button"
                  key={evt}
                  onClick={() => toggleEvent(evt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                    events.includes(evt)
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {evt}
                </button>
              ))}
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              {isSubmitting ? 'Registering...' : 'Add Endpoint'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
