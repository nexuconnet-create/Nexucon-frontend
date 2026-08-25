"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  CheckCircle, AlertTriangle, ShieldCheck, FileText, 
  ChevronRight, Check, X, RefreshCw, QrCode, ArrowUpRight, 
  Building2, UserCheck, KeyRound 
} from "lucide-react";
import { ApprovalRequest, getApprovalRequests } from "@/services/approvals";
import ApproveRequestModal from "@/components/dashboard/ApproveRequestModal";
import RejectRequestModal from "@/components/dashboard/RejectRequestModal";
import EscalateRequestModal from "@/components/dashboard/EscalateRequestModal";

export default function PermitDecisions() {
  const [permits, setPermits] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPermit, setSelectedPermit] = useState<ApprovalRequest | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isConditionalOpen, setIsConditionalOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);

  const fetchPermits = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getApprovalRequests({ request_type: 'Permit' });
      if (data.length > 0) {
        setPermits(data);
      } else {
        const allData = await getApprovalRequests();
        const permitList = allData.filter(r => r.request_type === 'Permit' || r.discipline === 'Legal');
        setPermits(permitList.length > 0 ? permitList : allData);
      }
    } catch (err) {
      console.error("Failed to load permit decisions", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <CheckCircle className="text-blue-500" />
            Permit Decisions & Delegation of Authority (DoA)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Review pending statutory permits, verify conditions, and execute authorizations based on financial thresholds.</p>
        </div>
        
        <button 
          onClick={fetchPermits}
          className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors self-start md:self-auto cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {permits.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-16 text-center text-slate-400">
          <ShieldCheck size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No permit applications currently pending decision.</p>
          <p className="text-xs text-slate-400 mt-1">All permit requests have been decided and processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mb-8">
          {permits.map((permit) => {
            const isHighValue = Number(permit.value_amount) > 50000000;
            return (
              <div key={permit.id} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                          {permit.request_reference} • {permit.discipline}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {permit.source_version_hash?.slice(0, 10) || '0x8f2c991'}
                        </span>
                      </div>
                      <h3 className="font-black text-lg text-slate-900 leading-snug">{permit.title}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Project: {permit.project_name || 'PRJ-2026'}</p>
                    </div>

                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                      isHighValue 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5' 
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {isHighValue && <ShieldCheck size={14} className="text-rose-600" />}
                      <span>{isHighValue ? `High Value (>₦50M)` : `Standard Value`}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-5">
                    {permit.description || 'Statutory construction and excavation permit application.'}
                  </p>

                  {/* DoA Banner */}
                  {isHighValue ? (
                    <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 mb-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-xs text-purple-900 uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck size={16} className="text-purple-600" />
                          Delegation of Authority (DoA) Threshold Exceeded
                        </h4>
                        <span className="text-xs font-black text-purple-800">₦{(Number(permit.value_amount)/1000000).toFixed(1)}M</span>
                      </div>
                      <p className="text-xs text-purple-700">
                        This project value exceeds the standard ₦50M threshold and requires executive authorization from the Permanent Secretary / Director-General.
                      </p>
                      <button 
                        onClick={() => { setSelectedPermit(permit); setIsEscalateOpen(true); }}
                        className="w-full mt-2 bg-[#022C4F] hover:bg-[#033c6c] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ArrowUpRight size={14} />
                        <span>Escalate to Permanent Secretary / DG</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Directorate Authorization Level</span>
                        <span className="text-xs font-mono font-bold text-blue-700">₦{(Number(permit.value_amount)/1000000).toFixed(1)}M</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Authorized for Director-level sign-off under Lagos State building regulation statutes.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                {!isHighValue && (
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                    <button 
                      onClick={() => { setSelectedPermit(permit); setIsApproveOpen(true); }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check size={15} />
                      <span>Full Approval</span>
                    </button>

                    <button 
                      onClick={() => { setSelectedPermit(permit); setIsConditionalOpen(true); }}
                      className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle size={14} />
                      <span>Conditional Approval</span>
                    </button>

                    <button 
                      onClick={() => { setSelectedPermit(permit); setIsRejectOpen(true); }}
                      className="px-4 py-2.5 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ApproveRequestModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        request={selectedPermit}
        isConditional={false}
        onSuccess={fetchPermits}
      />

      <ApproveRequestModal
        isOpen={isConditionalOpen}
        onClose={() => setIsConditionalOpen(false)}
        request={selectedPermit}
        isConditional={true}
        onSuccess={fetchPermits}
      />

      <RejectRequestModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        request={selectedPermit}
        onSuccess={fetchPermits}
      />

      <EscalateRequestModal
        isOpen={isEscalateOpen}
        onClose={() => setIsEscalateOpen(false)}
        request={selectedPermit}
        onSuccess={fetchPermits}
      />
    </div>
  );
}
