"use client";

import React, { useState } from 'react';
import { X, Network, AlertTriangle, Clock, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { createNotificationRoutingRule } from '@/services/settings';

interface AddRoutingRuleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddRoutingRuleDrawer({
  isOpen,
  onClose,
  onSuccess
}: AddRoutingRuleDrawerProps) {
  const [triggerEvent, setTriggerEvent] = useState('Critical Structural Defect');
  const [primaryRecipient, setPrimaryRecipient] = useState('Lead Structural Engineer');
  const [slaTimeline, setSlaTimeline] = useState('Within 15 mins');
  const [escalationTarget, setEscalationTarget] = useState('Director General / Agency Head');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerEvent.trim() || !primaryRecipient.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'All fields are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createNotificationRoutingRule({
        trigger_event: triggerEvent.trim(),
        primary_recipient: primaryRecipient.trim(),
        sla_timeline: slaTimeline.trim(),
        escalation_target: escalationTarget.trim()
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Routing rule for "${triggerEvent}" configured!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to add routing rule', type: 'error' } }));
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
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
              <Network size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                Add Notification Routing Rule
              </h2>
              <p className="text-xs text-gray-500 font-medium">Configure Escalation Timelines & Critical Incident Routing</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-8 leading-relaxed">
            Specify automatic multi-channel dispatch rules and escalation chains for high-severity site occurrences.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Trigger Event
              </label>
              <select
                value={triggerEvent}
                onChange={(e) => setTriggerEvent(e.target.value)}
                className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              >
                <option value="Critical Structural Defect">Critical Structural Defect</option>
                <option value="Noise Level Breach">Noise Level / Environmental Breach</option>
                <option value="Soil Liquefaction Detected">Soil Liquefaction Detected</option>
                <option value="Emergency Stop-Work Order">Emergency Stop-Work Order</option>
                <option value="High-Rise Density Violation">High-Rise Density Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Primary Recipient Role / Entity
              </label>
              <input
                type="text"
                value={primaryRecipient}
                onChange={(e) => setPrimaryRecipient(e.target.value)}
                placeholder="e.g. Lead Structural Engineer"
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                SLA / Action Timeline
              </label>
              <select
                value={slaTimeline}
                onChange={(e) => setSlaTimeline(e.target.value)}
                className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              >
                <option value="Immediate (< 5 mins)">Immediate (&lt; 5 mins)</option>
                <option value="Within 15 mins">Within 15 mins</option>
                <option value="Within 1 hour">Within 1 hour</option>
                <option value="Within 4 hours">Within 4 hours</option>
                <option value="Within 24 hours">Within 24 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Escalation Target
              </label>
              <input
                type="text"
                value={escalationTarget}
                onChange={(e) => setEscalationTarget(e.target.value)}
                placeholder="e.g. Director General / Agency Head"
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              />
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
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                {isSubmitting ? 'Configuring Rule...' : 'Configure Rule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
