"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, Clock, ShieldAlert, ArrowRight, 
  Flag, Calendar, MessageSquare, AlertCircle, RefreshCw, 
  UserCheck, ShieldCheck, QrCode 
} from "lucide-react";
import { ApprovalRequest, getApprovalRequests } from "@/services/approvals";
import ApproveRequestModal from "@/components/dashboard/ApproveRequestModal";
import AssignApprovalReviewerModal from "@/components/dashboard/AssignApprovalReviewerModal";
import RequestInfoModal from "@/components/dashboard/RequestInfoModal";

export default function EscalatedReviews() {
  const [escalations, setEscalations] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const fetchEscalations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getApprovalRequests({ request_type: 'Escalated' });
      if (data.length > 0) {
        setEscalations(data);
      } else {
        const allData = await getApprovalRequests();
        const escList = allData.filter(r => r.request_type === 'Escalated' || r.status === 'Escalated' || (Number(r.value_amount) > 50000000));
        setEscalations(escList);
      }
    } catch (err) {
      console.error("Failed to load escalations", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEscalations();
  }, [fetchEscalations]);

  const getSeverityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-600 text-white shadow-red-500/30';
      case 'High': return 'bg-orange-500 text-white shadow-orange-500/30';
      case 'Medium': return 'bg-amber-500 text-white shadow-amber-500/30';
      default: return 'bg-slate-500 text-white shadow-slate-500/30';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldAlert className="text-red-500" />
            Escalated Reviews & Statutory Blockers
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">High-priority triage for critical path delays, financial threshold breaches (&gt;₦50M), and inter-agency disputes.</p>
        </div>
        
        <button 
          onClick={fetchEscalations}
          className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors self-start md:self-auto cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Attention Banner */}
      <div className="bg-red-50/80 border border-red-200 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <AlertCircle size={30} />
        </div>
        <div>
          <h2 className="text-base font-black text-red-950 mb-0.5">Executive Attention Required</h2>
          <p className="text-xs text-red-800 font-medium leading-relaxed">
            There are currently <span className="font-bold underline">{escalations.length} active escalations</span> blocking project critical milestones. Review and execute immediate executive resolution or reassign to lead technical directors.
          </p>
        </div>
      </div>

      {/* Escalation Cards */}
      <div className="grid grid-cols-1 gap-6">
        {escalations.map((esc, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={esc.id}
            className="bg-white rounded-3xl border border-red-100 shadow-sm overflow-hidden flex flex-col lg:flex-row group hover:shadow-md transition-all"
          >
            {/* Left Status Indicator */}
            <div className={`w-full lg:w-3.5 h-3 lg:h-auto ${getSeverityStyle(esc.priority)}`}></div>

            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getSeverityStyle(esc.priority)}`}>
                      {esc.priority} Priority
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border text-purple-700 bg-purple-50 border-purple-200">
                      {esc.discipline}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {esc.request_reference}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-xl text-xs font-bold">
                    <Clock size={14} />
                    <span>{esc.days_overdue || 5} Days Overdue</span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 leading-snug group-hover:text-red-600 transition-colors">
                  {esc.title}
                </h3>
                <p className="text-xs text-slate-600 mb-6 max-w-3xl leading-relaxed">
                  {esc.description || 'Statutory blocker escalated due to compliance requirement mismatch or financial ceiling.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">Identified Bottleneck</span>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Flag size={13} className="text-red-500" /> {esc.bottleneck || 'Executive Review Required'}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">Assigned / Submitter</span>
                  <p className="font-bold text-slate-800">{esc.assigned_to_name || esc.submitted_by_name}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">DoA Level</span>
                  <p className="font-bold text-purple-700">{esc.doa_level_required}</p>
                </div>
              </div>
            </div>

            {/* Right Action Bar */}
            <div className="bg-slate-50/70 p-6 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-center gap-3 min-w-[240px]">
              <button 
                onClick={() => { setSelectedRequest(esc); setIsResolveOpen(true); }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md shadow-red-600/20 transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertTriangle size={15} />
                <span>Resolve Escalation</span>
              </button>

              <button 
                onClick={() => { setSelectedRequest(esc); setIsReassignOpen(true); }}
                className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck size={15} className="text-blue-600" />
                <span>Reassign Official</span>
              </button>

              <button 
                onClick={() => { setSelectedRequest(esc); setIsInfoOpen(true); }}
                className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare size={14} />
                <span>Request Clarification</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <ApproveRequestModal
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        request={selectedRequest}
        onSuccess={fetchEscalations}
      />

      <AssignApprovalReviewerModal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        request={selectedRequest}
        onSuccess={fetchEscalations}
      />

      <RequestInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        request={selectedRequest}
        onSuccess={fetchEscalations}
      />
    </div>
  );
}
