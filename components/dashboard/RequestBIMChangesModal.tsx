"use client";

import React, { useState } from 'react';
import { X, AlertCircle, FileEdit, Send } from 'lucide-react';
import { BIMModel, requestBIMChanges } from '@/services/bim';

interface RequestBIMChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: BIMModel | null;
  onSuccess?: () => void;
}

export default function RequestBIMChangesModal({
  isOpen,
  onClose,
  model,
  onSuccess
}: RequestBIMChangesModalProps) {
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'Medium' | 'High' | 'Critical'>('High');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !model) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Please specify the revision requirements.', type: 'warning' } 
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      await requestBIMChanges(model.id, { 
        reason: `[${priority} Priority] ${reason}` 
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Design revision request submitted for "${model.name}". Status changed to Changes Requested.`, type: 'success' } 
      }));
      setReason('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit changes request';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Request Design Changes</h3>
              <p className="text-xs text-slate-500">{model.name}</p>
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
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-slate-800">{model.name}</p>
            <p className="text-slate-500">{model.discipline} • Current Revision: {model.current_version} ({model.format})</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Urgency / Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Medium', 'High', 'Critical'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    priority === p
                      ? p === 'Critical'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : p === 'High'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Revision Notes & Regulatory Deficiencies *
            </label>
            <textarea 
              rows={4}
              required
              placeholder="Detail required BIM modifications, code non-compliances, or clashes that must be resolved prior to certification..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-800 leading-relaxed">
            <strong>Notice:</strong> Submitting will mark this model as <em>Changes Requested</em> and post an open BCF design review annotation to the author's workspace.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-900/20 flex items-center gap-2"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Changes Request'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
