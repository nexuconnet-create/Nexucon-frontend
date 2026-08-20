"use client";

import React, { useState } from 'react';
import { X, AlertOctagon, UserX, ShieldAlert } from 'lucide-react';
import { toggleBlacklist } from '@/services/stakeholders';

interface BlacklistEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BlacklistEntityModal({
  isOpen,
  onClose,
  onSuccess
}: BlacklistEntityModalProps) {
  const [entityType, setEntityType] = useState('Contractor');
  const [entityId, setEntityId] = useState('');
  const [entityName, setEntityName] = useState('');
  const [reason, setReason] = useState('');
  const [statusVal, setStatusVal] = useState<'Blacklisted' | 'Monitoring' | 'Suspended'>('Blacklisted');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName.trim() || !reason.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Entity name and violation reason are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await toggleBlacklist({
        entity_type: entityType,
        entity_id: entityId || `ENT-${Math.floor(100 + Math.random() * 900)}`,
        entity_name: entityName,
        reason,
        status: statusVal
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `${entityName} placed under ${statusVal} status!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to update blacklist status', type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-rose-500">
        
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <UserX size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-rose-950">Regulatory Blacklist & Sanction</h3>
              <p className="text-xs text-rose-600 font-semibold">Flag Recurring Violator</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Entity Type
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-medium"
              >
                <option value="Contractor">Contractor</option>
                <option value="Developer">Developer</option>
                <option value="Consultant">Consultant</option>
                <option value="Professional">Professional / Engineer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sanction Status
              </label>
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value as any)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-bold text-rose-700"
              >
                <option value="Blacklisted">Blacklisted</option>
                <option value="Monitoring">Monitoring (Warning)</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Entity / Organization Name
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="e.g. Apex Builders Ltd."
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Violation Reason & Evidence
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. 3 Stop-Work Orders issued in the last 12 months due to deep trench structural failure."
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
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
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/30 transition-all flex items-center gap-2"
            >
              <AlertOctagon size={16} /> {isSubmitting ? 'Enforcing...' : 'Apply Sanction'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
