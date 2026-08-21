"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, ShieldAlert, ArrowRight, Flag, Calendar, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import { ApprovalRequest, getApprovalRequests } from "@/services/approvals";
import ApproveRequestModal from "@/components/dashboard/ApproveRequestModal";
import EscalateRequestModal from "@/components/dashboard/EscalateRequestModal";

export default function EscalatedReviews() {
  const [escalations, setEscalations] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);

  const fetchEscalations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getApprovalRequests({ request_type: 'Escalated' });
      if (data.length > 0) {
        setEscalations(data);
      } else {
        const allData = await getApprovalRequests();
        const escList = allData.filter(r => r.request_type === 'Escalated' || r.status === 'Escalated' || (r.value_amount && r.value_amount > 50000000));
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
      default: return 'bg-gray-500 text-white shadow-gray-500/30';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldAlert className="text-red-500" />
            Escalated Reviews & Blockers
          </h1>
          <p className="text-gray-500 mt-1">Immediate attention required for blocked, overdue, or disputed approvals.</p>
        </div>
        <button 
          onClick={fetchEscalations}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors self-start md:self-auto"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertCircle size={32} className="text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-red-900 mb-1">Attention Required</h2>
          <p className="text-sm text-red-700 font-medium">There are currently <span className="font-bold">{escalations.length} active escalations</span> that are causing delays in the project critical path. Please review and resolve or reassign these bottlenecks immediately.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {escalations.map((esc, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={esc.id}
            className="bg-white rounded-2xl border-2 border-red-100 shadow-sm overflow-hidden flex flex-col md:flex-row group"
          >
            {/* Left Status Bar */}
            <div className={`w-2 md:w-3 ${getSeverityStyle(esc.priority)}`}></div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${getSeverityStyle(esc.priority)}`}>
                      {esc.priority} Priority
                    </span>
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border text-purple-700 bg-purple-50 border-purple-200">
                      {esc.discipline}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">
                      {esc.request_reference}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-xl text-sm font-bold">
                    <Clock size={16} />
                    {esc.days_overdue || 5} Days Overdue
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-red-600 transition-colors">
                  {esc.title}
                </h3>
                <p className="text-sm text-gray-600 mb-6 max-w-3xl leading-relaxed">
                  {esc.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Current Bottleneck</span>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <Flag size={14} className="text-red-500" /> {esc.bottleneck || 'Pending Escalated Review'}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Escalated By</span>
                  <p className="text-sm font-semibold text-gray-800">{esc.submitted_by_name}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Original Request</span>
                  <p className="text-sm font-bold text-blue-600 flex items-center gap-1">
                    {esc.request_reference} <ArrowRight size={12} />
                  </p>
                </div>
              </div>
            </div>

            {/* Right Action Area */}
            <div className="bg-gray-50/50 p-6 border-l border-gray-100 flex flex-col justify-center gap-3 min-w-[240px]">
              <button 
                onClick={() => { setSelectedRequest(esc); setIsResolveOpen(true); }}
                className="w-full py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-md hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <AlertTriangle size={16} /> Resolve Escalation
              </button>
              <button 
                onClick={() => { setSelectedRequest(esc); setIsReassignOpen(true); }}
                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm"
              >
                Reassign Workflow
              </button>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: `Opening discussion thread for ${esc.request_reference}...`, type: 'info' } 
                  }));
                }}
                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} /> Discussion Thread
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

      <EscalateRequestModal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        request={selectedRequest}
        onSuccess={fetchEscalations}
      />
    </div>
  );
}
