"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, AlertTriangle, ShieldCheck, FileText, ChevronRight, Check, X, RefreshCw } from "lucide-react";
import { ApprovalRequest, getApprovalRequests } from "@/services/approvals";
import ApproveRequestModal from "@/components/dashboard/ApproveRequestModal";
import RejectRequestModal from "@/components/dashboard/RejectRequestModal";
import EscalateRequestModal from "@/components/dashboard/EscalateRequestModal";

export default function PermitDecisions() {
  const [permits, setPermits] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPermit, setSelectedPermit] = useState<ApprovalRequest | null>(null);
  const [isConditionalOpen, setIsConditionalOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);

  const fetchPermits = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getApprovalRequests({ type: 'Permit' });
      if (data.length > 0) {
        setPermits(data);
      } else {
        // Fallback default permit decisions
        setPermits([
          {
            id: "1",
            request_reference: "PRM-DEC-001",
            project: "1",
            title: "Riverside Commercial Complex",
            request_type: "Permit",
            discipline: "General",
            priority: "Medium",
            status: "Pending",
            value_amount: 15000000,
            doa_level_required: "Director",
            submitted_by_name: "Riverside Holdings",
            description: "The structural engineer must submit the revised load-bearing calculations for Floor 3 before construction begins.",
            days_overdue: 0,
            signatories_required: 1,
            signatories_completed: 0,
            created_at: ''
          },
          {
            id: "2",
            request_reference: "PRM-DEC-002",
            project: "1",
            title: "Downtown Metro Station",
            request_type: "Permit",
            discipline: "Structural",
            priority: "Critical",
            status: "Pending",
            value_amount: 250000000,
            doa_level_required: "Permanent Secretary / Director General",
            submitted_by_name: "Metro Transit Authority",
            description: "This project exceeds the standard ₦50M threshold. It requires Director-level sign-off before the permit can be issued.",
            days_overdue: 0,
            signatories_required: 1,
            signatories_completed: 0,
            created_at: ''
          }
        ]);
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
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Permit Decisions & Delegation</h1>
          <p className="text-gray-500 mt-1">Review pending permits with DoA thresholds and conditional requirements.</p>
        </div>
        <button 
          onClick={fetchPermits}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors self-start md:self-auto"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {permits.map((permit) => {
          const isHighValue = Number(permit.value_amount) > 50000000;
          return (
            <div key={permit.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">{permit.request_reference} • Building Permit</span>
                    <h3 className="font-bold text-xl text-gray-900">{permit.title}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isHighValue 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1' 
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {isHighValue && <ShieldCheck size={12} />}
                    {isHighValue ? `High Value (₦${(Number(permit.value_amount)/1000000).toFixed(0)}M)` : `Standard Value (₦${(Number(permit.value_amount)/1000000).toFixed(0)}M)`}
                  </div>
                </div>

                {isHighValue ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">Delegation of Authority (DoA) Limit Exceeded</h4>
                    <p className="text-sm text-slate-600 mb-3">{permit.description || 'This project exceeds the standard ₦50M threshold. It requires Permanent Secretary / DG sign-off.'}</p>
                    <button 
                      onClick={() => { setSelectedPermit(permit); setIsEscalateOpen(true); }}
                      className="w-full bg-[#022C4F] hover:bg-[#033c6c] text-white py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg"
                    >
                      Escalate to Director / DG
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2"><AlertTriangle size={16}/> Subject To Conditions</h4>
                    <p className="text-sm text-amber-800 mb-3">{permit.description || 'Structural load-bearing calculations must be verified before site mobilization.'}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setSelectedPermit(permit); setIsConditionalOpen(true); }}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                      >
                        Issue Conditional Approval
                      </button>
                      <button 
                        onClick={() => { setSelectedPermit(permit); setIsRejectOpen(true); }}
                        className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
