"use client";

import React, { useState } from 'react';
import { X, Network, Clock, AlertTriangle, User } from 'lucide-react';
import { addRoutingRule } from '@/services/settings';

interface AddRoutingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddRoutingRuleModal({
  isOpen,
  onClose,
  onSuccess
}: AddRoutingRuleModalProps) {
  const [triggerEvent, setTriggerEvent] = useState('Critical Safety Incidents');
  const [primaryRecipient, setPrimaryRecipient] = useState('Agency Director');
  const [slaTimeline, setSlaTimeline] = useState('Within 15 mins');
  const [escalationTarget, setEscalationTarget] = useState('Permanent Secretary');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addRoutingRule({
        trigger_event: triggerEvent,
        primary_recipient: primaryRecipient,
        sla_timeline: slaTimeline,
        escalation_target: escalationTarget
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `SLA Routing rule added for ${triggerEvent}!`, type: 'success' } 
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
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Network size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Add Notification Routing Rule</h3>
              <p className="text-xs text-slate-500">SLA Timelines & Escalation Targets</p>
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
              Trigger Event
            </label>
            <select
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="Critical Safety Incidents">Critical Safety Incidents</option>
              <option value="Stop-Work Order Issued">Stop-Work Order Issued</option>
              <option value="Permit Review SLA Overdue">Permit Review SLA Overdue</option>
              <option value="Severe Structural Defect (NCR)">Severe Structural Defect (NCR)</option>
              <option value="Environmental Noise Breach">Environmental Noise Breach</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Recipient
              </label>
              <select
                value={primaryRecipient}
                onChange={(e) => setPrimaryRecipient(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
              >
                <option value="Agency Director">Agency Director</option>
                <option value="Chief Inspector">Chief Inspector</option>
                <option value="City Planner">City Planner</option>
                <option value="Lead Structural Engineer">Lead Structural Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                SLA / Timeline
              </label>
              <select
                value={slaTimeline}
                onChange={(e) => setSlaTimeline(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
              >
                <option value="Within 15 mins">Within 15 mins</option>
                <option value="Within 30 mins">Within 30 mins</option>
                <option value="Within 2 hours">Within 2 hours</option>
                <option value="Within 24 hours">Within 24 hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Escalation Target
            </label>
            <select
              value={escalationTarget}
              onChange={(e) => setEscalationTarget(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
            >
              <option value="Permanent Secretary">Permanent Secretary</option>
              <option value="Honourable Commissioner">Honourable Commissioner</option>
              <option value="Agency Director">Agency Director</option>
              <option value="Special Review Board">Special Review Board</option>
            </select>
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Add Rule'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
