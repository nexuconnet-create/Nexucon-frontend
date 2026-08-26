"use client";

import React, { useState } from 'react';
import { X, AlertOctagon, UserX, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-[150] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Sidepop Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-red-50 via-white to-orange-50/40 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
                <AlertOctagon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    STATUTORY ENFORCEMENT
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• Sanctions Registry</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  Flag / Sanction Entity
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="p-3.5 bg-red-50/60 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2.5">
                <ShieldAlert size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Sanctioned entities are barred from permit applications and government stage-gate submissions across all jurisdictions.
                </p>
              </div>

              {/* Entity Type */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Entity Category
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Contractor">Contractor / Construction Firm</option>
                  <option value="Developer">Property Developer</option>
                  <option value="Consultant">Engineering Consultant</option>
                  <option value="Licensed Professional">Licensed Professional (COREN/ARCON)</option>
                </select>
              </div>

              {/* Name & Ref ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Entity / Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="e.g. Apex Civil Foundations Ltd"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Regulatory Reference ID
                  </label>
                  <input
                    type="text"
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    placeholder="e.g. CONTR-9021"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Sanction Severity Level
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as any)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Blacklisted">Blacklisted (Immediate Suspension &amp; Revocation)</option>
                  <option value="Suspended">Suspended (Temporary Freeze Pending Inquiry)</option>
                  <option value="Monitoring">Special Monitoring (Enhanced Audit Scrutiny)</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Violation Reason / Tribunal Finding <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Document the exact structural defect, unapproved modification, or safety code breach..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Executing Sanction...</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon size={14} />
                    <span>Enforce Sanction</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
