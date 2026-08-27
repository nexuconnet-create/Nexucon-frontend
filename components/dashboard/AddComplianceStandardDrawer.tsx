"use client";

import React, { useState } from 'react';
import { X, ShieldAlert, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { createStatutoryDocument } from '@/services/settings';

interface AddComplianceStandardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddComplianceStandardDrawer({
  isOpen,
  onClose,
  onSuccess
}: AddComplianceStandardDrawerProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [features, setFeatures] = useState('Structural Tolerances, Concrete Slump, Rebar Tensile Strength');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Code and name are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createStatutoryDocument({
        code: code.trim(),
        name: name.trim(),
        connected_features: features.split(',').map(f => f.trim()).filter(Boolean),
        document_url: documentUrl.trim() || undefined
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Statutory standard "${code}" registered successfully!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to add statutory standard', type: 'error' } }));
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                Add Statutory Standard
              </h2>
              <p className="text-xs text-gray-500 font-medium">Link Official Regulatory Acts & National Building Codes</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-8 leading-relaxed">
            Reference official statutory instruments (e.g. National Building Code of Nigeria, Standards Organization of Nigeria SON NIS standards, LASPPPA Urban Planning laws).
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Standard / Act Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SON-NIS-117"
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Statutory Instrument Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standards Organization of Nigeria (SON Steel Rebar Benchmark)"
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Enforced Engineering Features (Comma-Separated)
              </label>
              <input
                type="text"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Yield Strength, Steel Elongation, High-Rise Setbacks"
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Official Gazette / Document URL
              </label>
              <input
                type="url"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://son.gov.ng/..."
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
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
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                {isSubmitting ? 'Registering Standard...' : 'Register Standard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
