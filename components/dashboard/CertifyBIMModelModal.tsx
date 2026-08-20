"use client";

import React, { useState } from 'react';
import { X, Award, ShieldCheck, CheckCircle } from 'lucide-react';
import { BIMModel, certifyBIMModel, requestBIMChanges } from '@/services/bim';

interface CertifyBIMModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: BIMModel | null;
  onSuccess?: () => void;
}

export default function CertifyBIMModelModal({
  isOpen,
  onClose,
  model,
  onSuccess
}: CertifyBIMModelModalProps) {
  const [actionType, setActionType] = useState<'CERTIFY' | 'REQUEST_CHANGES'>('CERTIFY');
  const [reason, setReason] = useState('');
  const [hashSignature, setHashSignature] = useState(`0x3f8a${Math.random().toString(16).substring(2, 8)}c91`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !model) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (actionType === 'CERTIFY') {
        await certifyBIMModel(model.id, { hash_signature: hashSignature });
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `BIM Model "${model.name}" officially certified & stamped!`, type: 'success' } 
        }));
      } else {
        await requestBIMChanges(model.id, { reason: reason || 'Modifications requested by reviewing desk.' });
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `Design changes requested for "${model.name}".`, type: 'warning' } 
        }));
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update certification status';
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Government Digital Stamp</h3>
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
            <p className="text-slate-500">{model.discipline} • {model.current_version} ({model.format})</p>
          </div>

          <div className="flex items-center gap-3 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActionType('CERTIFY')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                actionType === 'CERTIFY' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Digitally Certify & Stamp
            </button>
            <button
              type="button"
              onClick={() => setActionType('REQUEST_CHANGES')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                actionType === 'REQUEST_CHANGES' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Request Changes
            </button>
          </div>

          {actionType === 'CERTIFY' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Cryptographic Hash Seal</label>
              <input
                type="text"
                value={hashSignature}
                onChange={(e) => setHashSignature(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400">Lock model into immutable certified record with official agency timestamp.</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Revision Justification</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                placeholder="State required adjustments for structural / MEP compliance..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          )}

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
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 text-white ${
                actionType === 'CERTIFY' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              <CheckCircle size={14} /> {isSubmitting ? 'Saving...' : actionType === 'CERTIFY' ? 'Apply Digital Stamp' : 'Confirm Changes Request'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
