"use client";

import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { StopWorkOrder, liftStopWorkOrder } from '@/services/inspections';

interface LiftStopWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  swo: StopWorkOrder | null;
  onSuccess?: () => void;
}

export default function LiftStopWorkModal({
  isOpen,
  onClose,
  swo,
  onSuccess
}: LiftStopWorkModalProps) {
  const [justification, setJustification] = useState('All corrective actions verified through physical re-inspection and engineering compliance reports.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !swo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Justification is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await liftStopWorkOrder(swo.id, { justification });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Stop-Work Order ${swo.order_number} lifted. Site activities reinstated!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to lift Stop-Work Order';
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
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Lift Stop-Work Order</h3>
              <p className="text-xs text-slate-500">{swo.order_number} • {swo.project_name}</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Directorate Reinstatement Justification</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              required
              placeholder="Detail the verification and grounds for lifting the suspension..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle size={14} /> {isSubmitting ? 'Lifting...' : 'Confirm Reinstatement'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
