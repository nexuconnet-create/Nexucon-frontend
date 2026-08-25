"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, History, ArrowRight, ShieldCheck, 
  Clock, User, Hash, AlertTriangle, FileCode, CheckCircle2 
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

  return (
    <div className="fixed inset-0 z-[140] overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <History size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {event.audit_reference}
                </span>
                <span className="text-xs font-bold text-slate-500">• {event.resource_type} ({event.resource_id})</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">State Delta &amp; Audit Trail Diff</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Diff Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Action</span>
              <span className="font-bold text-slate-900 mt-0.5 block truncate">{event.action}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Actor</span>
              <span className="font-bold text-slate-900 mt-0.5 block truncate">{event.user_name}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role</span>
              <span className="font-bold text-slate-900 mt-0.5 block truncate">{event.user_role}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timestamp</span>
              <span className="font-bold text-slate-900 mt-0.5 block truncate">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Diff Table / List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Field Modifications ({diff?.changes_count || 0} changes)</span>
              <span className="text-[10px] font-mono text-slate-400">Block Signature: {event.signature_hash}</span>
            </h4>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold">
                Computing cryptographic delta...
              </div>
            ) : !diff || diff.changes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                No discrete field-level changes recorded for this snapshot.
              </div>
            ) : (
              <div className="space-y-3">
                {diff.changes.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
                    <span className="font-mono font-bold text-slate-800 text-[11px] block">
                      Field: <span className="text-blue-700">.{c.field}</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-red-50/80 border border-red-200 rounded-xl text-red-900 font-mono text-[11px] break-all">
                        <span className="text-[9px] font-bold uppercase text-red-600 block mb-1">Previous State</span>
                        {typeof c.previous === 'object' ? JSON.stringify(c.previous) : String(c.previous ?? 'null')}
                      </div>
                      <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-mono text-[11px] break-all">
                        <span className="text-[9px] font-bold uppercase text-emerald-600 block mb-1">New State</span>
                        {typeof c.current === 'object' ? JSON.stringify(c.current) : String(c.current ?? 'null')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Payload Snapshot */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raw JSON State Snapshot</h4>
            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-[160px] border border-slate-800">
              {JSON.stringify({ previous: event.previous_state, new: event.new_state }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <ShieldCheck size={16} />
            <span>Immutable &amp; Cryptographically Sealed (SHA-256)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
