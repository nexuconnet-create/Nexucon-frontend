"use client";

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, History, ArrowRight, Lock, Calendar, User, Code } from 'lucide-react';
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
    if (isOpen && event) {
      setIsLoading(true);
      getAuditEventDiff(event.id)
        .then(data => setDiff(data))
        .catch(err => console.error("Failed to load diff", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Audit Event Record Details</h3>
              <p className="text-xs text-slate-500 font-mono">{event.audit_reference} • {event.action}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Actor</span>
              <p className="font-bold text-slate-800">{event.user_name}</p>
              <p className="text-[10px] text-slate-500">{event.user_role}</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Resource</span>
              <p className="font-bold text-slate-800">{event.resource_type}</p>
              <p className="text-[10px] text-slate-500">{event.resource_id}</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Timestamp</span>
              <p className="font-bold text-slate-800">{new Date(event.timestamp).toLocaleDateString()}</p>
              <p className="text-[10px] text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Integrity</span>
              <p className="font-bold text-emerald-600 flex items-center gap-1">
                <Lock size={12} /> Verified
              </p>
              <p className="text-[10px] font-mono text-blue-600 truncate">{event.signature_hash}</p>
            </div>
          </div>

          {/* State Diff Viewer */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
              <Code size={14} /> State Delta & Changed Attributes
            </h4>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Computing state diff...</div>
            ) : diff && diff.changes.length > 0 ? (
              <div className="space-y-2">
                {diff.changes.map((ch, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 w-max">
                      {ch.field}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-mono border border-rose-100">
                        {String(ch.previous ?? 'null')}
                      </span>
                      <ArrowRight size={12} className="text-slate-400 shrink-0" />
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold border border-emerald-100">
                        {String(ch.current ?? 'null')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs text-slate-500">
                Action recorded with immutable initial state.
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
          <span className="text-[11px] font-mono text-slate-400">
            Hash Seal: {event.signature_hash}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close Record
          </button>
        </div>

      </div>
    </div>
  );
}
