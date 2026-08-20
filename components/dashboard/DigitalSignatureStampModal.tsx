"use client";

import React, { useState } from 'react';
import { X, Stamp, ShieldCheck, CheckCircle, Award } from 'lucide-react';
import { Document, applyDocumentStamp } from '@/services/documents';

interface DigitalSignatureStampModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSuccess?: () => void;
}

export default function DigitalSignatureStampModal({
  isOpen,
  onClose,
  document,
  onSuccess
}: DigitalSignatureStampModalProps) {
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !document) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await applyDocumentStamp(document.id, {
        comments: comments || 'Officially reviewed, stamped, and approved by government regulatory board.'
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Official digital stamp and certificate applied to "${document.title}"!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to apply digital stamp';
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
              <Stamp size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Government Digital Stamp</h3>
              <p className="text-xs text-slate-500">Official Directorate Approval Seal</p>
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
            <p className="font-bold text-slate-800">{document.title}</p>
            <p className="text-slate-500">{document.document_reference} • {document.discipline} ({document.current_version})</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Approval & Stamping Remarks</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder="e.g. Approved and certified by Planning & Regulatory Directorate..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <span>Applies SHA-256 tamper-proof cryptographic stamp and archives into the immutable approval vault.</span>
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Award size={14} /> {isSubmitting ? 'Signing...' : 'Apply Stamp & Sign'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
