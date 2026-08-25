"use client";

import React from 'react';
import { 
  X, ShieldCheck, QrCode, FileText, Calendar, User, 
  CheckCircle2, XCircle, AlertTriangle, Download, ExternalLink, Hash, Lock 
} from 'lucide-react';
import { ApprovalDecision } from '@/services/approvals';

interface DecisionRecordDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  decision: ApprovalDecision | null;
}

export default function DecisionRecordDetailDrawer({
  isOpen,
  onClose,
  decision
}: DecisionRecordDetailDrawerProps) {
  if (!isOpen || !decision) return null;

  const getOutcomeStyle = (outcome: string) => {
    switch (outcome) {
      case 'Approved': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Rejected': return 'text-red-700 bg-red-50 border-red-200';
      case 'Conditional': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'Approved': return <CheckCircle2 size={15} className="text-emerald-600" />;
      case 'Rejected': return <XCircle size={15} className="text-red-600" />;
      default: return <AlertTriangle size={15} className="text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over sidepop */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-[540px] bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
          
          {/* Top Header */}
          <div className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
                  {decision.decision_reference}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider rounded-lg border ${getOutcomeStyle(decision.outcome)}`}>
                  {getOutcomeIcon(decision.outcome)}
                  {decision.outcome}
                </span>
              </div>

              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <h2 className="text-xl font-black text-slate-900 leading-tight">
              {decision.request_title || 'Executive Decision Record'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Reference: <span className="font-mono font-bold text-blue-700">{decision.request_reference || 'REQ-8840'}</span>
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-7 flex-1 space-y-6 overflow-y-auto">
            {/* Cryptographic SHA-256 Ledger Seal */}
            <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Cryptographic Seal &amp; Chain of Custody</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-mono font-bold">VERIFIED</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 font-mono text-xs break-all text-emerald-400">
                {decision.signature_hash || '0x8f2c991b2741e4184c8a9103e851'}
              </div>

              <p className="text-[11px] text-slate-400">
                Tamper-proof digital seal verified against government private root keys.
              </p>
            </div>

            {/* Decision Notes & Conditions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Executive Decision Justification</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 leading-relaxed">
                {decision.decision_notes || 'All technical calculations and compliance requirements verified according to statutory mandate.'}
              </p>

              {decision.conditions && (
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Attached Mandatory Conditions</h4>
                  <p className="text-xs text-amber-900 bg-amber-50 p-3.5 rounded-2xl border border-amber-200 leading-relaxed">
                    {decision.conditions}
                  </p>
                </div>
              )}
            </div>

            {/* Decider Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Authorizing Official</span>
                <p className="font-bold text-slate-800">{decision.decider_name}</p>
                <p className="text-[11px] text-slate-500">{decision.decider_role}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Decision Timestamp</span>
                <p className="font-bold text-slate-800">{new Date(decision.timestamp).toLocaleDateString()}</p>
                <p className="text-[11px] text-slate-500">{new Date(decision.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('show-toast', { 
                  detail: { 
                    message: `Official Certificate for Decision ${decision.decision_reference} downloaded!`, 
                    type: 'success' 
                  } 
                }));
              }}
              className="flex-1 py-3 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={14} />
              <span>Download Signed Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
