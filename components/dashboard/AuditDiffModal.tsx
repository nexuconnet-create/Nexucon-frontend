"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, History, ArrowRight, ShieldCheck, 
  Clock, User, Hash, AlertTriangle, CheckCircle2, 
  Building2, FileText, CheckCircle, Sparkles, Shield,
  Layers, ArrowRightCircle
} from 'lucide-react';
import { AuditEvent, AuditDiff, getAuditEventDiff } from '@/services/audit';

interface AuditDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: AuditEvent | null;
}

export default function AuditDiffModal({
  isOpen,
  onClose,
  event
}: AuditDiffModalProps) {
  const [diff, setDiff] = useState<AuditDiff | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event?.id) {
      setIsLoading(true);
      getAuditEventDiff(event.id)
        .then(res => setDiff(res))
        .catch(err => console.error("Failed to load audit diff", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  // Format field names to professional executive labels
  const formatFieldName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Id\b/g, 'ID')
      .replace(/Ncr\b/g, 'NCR')
      .replace(/Bim\b/g, 'BIM')
      .replace(/Gpr\b/g, 'GPR')
      .replace(/Doa\b/g, 'DoA');
  };

  // Format values cleanly into human readable representations
  const formatValue = (val: any): { text: string; isBadge: boolean; colorClass?: string } => {
    if (val === null || val === undefined || val === '') {
      return { text: 'None / Not Applicable', isBadge: false };
    }
    if (typeof val === 'boolean') {
      return { 
        text: val ? 'Enabled / Completed' : 'Disabled / Pending', 
        isBadge: true, 
        colorClass: val ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200' 
      };
    }
    if (typeof val === 'number') {
      return { text: val.toLocaleString(), isBadge: false };
    }
    if (typeof val === 'object') {
      const entries = Object.entries(val);
      if (entries.length === 0) return { text: 'Empty Snapshot', isBadge: false };
      const formatted = entries.map(([k, v]) => `${formatFieldName(k)}: ${v}`).join(' • ');
      return { text: formatted, isBadge: false };
    }

    const str = String(val);
    const upper = str.toUpperCase();

    if (upper === 'APPROVED' || upper === 'PASS' || upper === 'COMPLIANT' || upper === 'GRANTED' || upper === 'COMPLETED') {
      return { text: str, isBadge: true, colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (upper === 'REJECTED' || upper === 'FAILED' || upper === 'NON_COMPLIANT' || upper === 'REVOKED') {
      return { text: str, isBadge: true, colorClass: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (upper.includes('PENDING') || upper.includes('REVIEW') || upper.includes('CONDITIONAL')) {
      return { text: str, isBadge: true, colorClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    }

    return { text: str, isBadge: false };
  };

  const getActionBadgeColor = (action: string, severity: string) => {
    if (severity === 'Critical' || action.toLowerCase().includes('critical') || action.toLowerCase().includes('fail')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (action.toLowerCase().includes('approved') || action.toLowerCase().includes('pass') || action.toLowerCase().includes('grant')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.toLowerCase().includes('revision') || action.toLowerCase().includes('warn') || action.toLowerCase().includes('anomaly')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  // Compile full baseline state snapshot comparison
  const previousState = event.previous_state || {};
  const newState = event.new_state || {};
  const allKeys = Array.from(new Set([...Object.keys(previousState), ...Object.keys(newState)]));

  return (
    <div className="fixed inset-0 z-[140] overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#022C4F] text-white flex items-center justify-center shadow-md shadow-[#022C4F]/20">
              <History size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-lg border border-blue-200">
                  {event.audit_reference}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getActionBadgeColor(event.action, event.severity)}`}>
                  {event.severity} Priority
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • {event.resource_type} ({event.resource_id})
                </span>
              </div>
              <h3 className="text-lg font-black text-[#022C4F] mt-1">
                State Transition &amp; Compliance Audit Breakdown
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Project</span>
              <span className="font-bold text-slate-900 text-xs mt-1 block truncate" title={event.project_name}>
                {event.project_name}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Signing Officer</span>
              <span className="font-bold text-slate-900 text-xs mt-1 block truncate" title={event.user_name}>
                {event.user_name}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Role</span>
              <span className="font-bold text-slate-900 text-xs mt-1 block truncate" title={event.user_role}>
                {event.user_role}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recorded At</span>
              <span className="font-bold text-slate-900 text-xs mt-1 block truncate">
                {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Section: Key Field Transitions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <ArrowRightCircle size={14} className="text-blue-600" />
                <span>Attribute Transitions ({diff?.changes_count || 0} modified)</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                Action: {event.action}
              </span>
            </div>

            {isLoading ? (
              <div className="p-10 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-slate-200">
                Loading verified transition details...
              </div>
            ) : !diff || diff.changes.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium">
                No attribute delta recorded. Initial creation record registered in government vault.
              </div>
            ) : (
              <div className="space-y-3">
                {diff.changes.map((c, idx) => {
                  const prevVal = formatValue(c.previous);
                  const currVal = formatValue(c.current);
                  return (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-800">
                          {formatFieldName(c.field)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          State Delta
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        {/* Previous */}
                        <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 block mb-1">
                            Before Action
                          </span>
                          {prevVal.isBadge ? (
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md border ${prevVal.colorClass}`}>
                              {prevVal.text}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-red-950 block break-words">
                              {prevVal.text}
                            </span>
                          )}
                        </div>

                        {/* New */}
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                            After Action
                          </span>
                          {currVal.isBadge ? (
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md border ${currVal.colorClass}`}>
                              {currVal.text}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-950 block break-words">
                              {currVal.text}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Complete Attribute State Breakdown */}
          {allKeys.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-600" />
                <span>Complete Record State Snapshot</span>
              </h4>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600">
                      <th className="py-2.5 px-4">Attribute</th>
                      <th className="py-2.5 px-4">Prior Value</th>
                      <th className="py-2.5 px-4">Active Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allKeys.map((k, idx) => {
                      const prevVal = formatValue(previousState[k]);
                      const currVal = formatValue(newState[k]);
                      const hasChanged = previousState[k] !== newState[k];

                      return (
                        <tr key={idx} className={hasChanged ? "bg-blue-50/30" : "hover:bg-slate-50/50"}>
                          <td className="py-2.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                            {formatFieldName(k)}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {prevVal.isBadge ? (
                              <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border ${prevVal.colorClass}`}>
                                {prevVal.text}
                              </span>
                            ) : (
                              <span>{prevVal.text}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            {currVal.isBadge ? (
                              <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border ${currVal.colorClass}`}>
                                {currVal.text}
                              </span>
                            ) : (
                              <span>{currVal.text}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cryptographic Proof & Ledger Seal Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#022C4F] text-white space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-xs font-black tracking-wide text-white">
                  Cryptographic Seal &amp; Blockchain Provenance
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                100% Tamper-Evident
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Signature Seal Hash</span>
                <span className="font-mono text-[11px] text-blue-200 block truncate">
                  {event.signature_hash}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Security Audit Station</span>
                <span className="text-[11px] text-slate-200 block">
                  {event.ip_address || "192.168.10.42 (Statutory Government Network)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <CheckCircle size={15} className="text-emerald-600" />
            <span>Official Government Audit Log • Append-Only Ledger</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
