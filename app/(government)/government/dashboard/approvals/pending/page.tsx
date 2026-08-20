"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, AlertCircle, FileText, User, Calendar, Check, X, MessageSquare, ShieldCheck, RefreshCw } from "lucide-react";
import { ApprovalRequest, getApprovalRequests } from "@/services/approvals";
import ApproveRequestModal from "@/components/dashboard/ApproveRequestModal";
import RejectRequestModal from "@/components/dashboard/RejectRequestModal";
import RequestInfoModal from "@/components/dashboard/RequestInfoModal";

export default function PendingApprovals() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getApprovalRequests();
      // Filter active pending items or show list
      const pendingList = data.filter(r => ['Pending', 'In Review', 'Awaiting Fix'].includes(r.status));
      if (pendingList.length > 0) {
        setRequests(pendingList);
        if (!selectedItem || !pendingList.find(r => r.id === selectedItem)) {
          setSelectedItem(pendingList[0].id);
        }
      } else if (data.length > 0) {
        setRequests(data);
        if (!selectedItem) setSelectedItem(data[0].id);
      } else {
        // Fallback default sample data
        setRequests([
          {
            id: "1",
            request_reference: "REQ-8892",
            project: "1",
            title: "Phase 2 Environmental Impact Addendum",
            request_type: "Document",
            discipline: "General",
            priority: "High",
            status: "Pending",
            submitted_by_name: "EcoSolve Ltd.",
            due_date: "Oct 15, 2026",
            value_amount: 120000000,
            doa_level_required: "Permanent Secretary / Director General",
            description: "Additional assessment required for the eastern boundary soil disruption. Needs expedited approval to prevent delay in foundation pour.",
            days_overdue: 0,
            signatories_required: 1,
            signatories_completed: 0,
            created_at: ''
          },
          {
            id: "2",
            request_reference: "REQ-8891",
            project: "1",
            title: "Structural Steel Shop Drawings (Z3)",
            request_type: "Technical",
            discipline: "Structural",
            priority: "Medium",
            status: "In Review",
            submitted_by_name: "Apex Engineering",
            due_date: "Oct 20, 2026",
            value_amount: 45000000,
            doa_level_required: "Director",
            description: "Final shop drawings for zone 3 structural steel. Includes revised connection details per RFI-142.",
            days_overdue: 0,
            signatories_required: 1,
            signatories_completed: 0,
            created_at: ''
          },
          {
            id: "3",
            request_reference: "REQ-8885",
            project: "1",
            title: "Night Shift Work Permit - November",
            request_type: "Permit",
            discipline: "Safety",
            priority: "Low",
            status: "Pending",
            submitted_by_name: "J. Jenkins (Site Lead)",
            due_date: "Oct 25, 2026",
            value_amount: 5000000,
            doa_level_required: "Director",
            description: "Standard monthly renewal for night shift operations. All noise mitigation protocols remain unchanged.",
            days_overdue: 0,
            signatories_required: 1,
            signatories_completed: 0,
            created_at: ''
          }
        ]);
        setSelectedItem("1");
      }
    } catch (err) {
      console.error("Failed to load approval requests", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'Critical':
      case 'High': return 'text-red-700 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'Critical':
      case 'High': return <AlertCircle size={14} className="text-red-500" />;
      case 'Medium': return <Clock size={14} className="text-amber-500" />;
      case 'Low': return <CheckCircle size={14} className="text-emerald-500" />;
      default: return null;
    }
  };

  const getDelegationOfAuthority = (value: number) => {
    if (value > 50000000) {
      return { role: "Permanent Secretary / Director General", rule: "Above ₦50M", color: "text-purple-700 bg-purple-50 border-purple-200" };
    }
    return { role: "Director", rule: "₦50M and below", color: "text-blue-700 bg-blue-50 border-blue-200" };
  };

  const activeItem = requests.find(item => item.id === selectedItem) || requests[0];

  return (
    <div className="w-full min-h-[calc(100vh-2rem)] pb-12 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <CheckCircle className="text-blue-500" />
            Action Center: Pending Approvals
          </h1>
          <p className="text-gray-500 mt-1">Review and action items currently awaiting executive sign-off.</p>
        </div>
        
        <button 
          onClick={fetchRequests}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors self-start md:self-auto"
          title="Refresh Queue"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left Column: Inbox List */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          {requests.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={item.id}
              onClick={() => setSelectedItem(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeItem?.id === item.id 
                  ? 'bg-blue-50/50 border-blue-200 shadow-md ring-1 ring-blue-500/20' 
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyle(item.priority)}`}>
                  {getPriorityIcon(item.priority)}
                  {item.priority}
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-500">{item.request_reference}</span>
              </div>
              <h3 className={`font-bold text-sm leading-snug mb-3 ${activeItem?.id === item.id ? 'text-blue-700' : 'text-gray-900'}`}>
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <User size={12} /> {item.submitted_by_name}
                </div>
                <div className={`font-semibold ${item.priority === 'High' ? 'text-red-600' : ''}`}>
                  Due: {item.due_date || 'In 5 Days'}
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-100/50 flex items-center justify-between mt-auto">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">₦{(Number(item.value_amount) / 1000000).toFixed(1)}M</span>
                <button 
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-200 hover:border-emerald-600 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item.id);
                    setIsApproveOpen(true);
                  }}
                >
                  <Check size={12} /> Quick Approve
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column: Detail View */}
        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            {activeItem && (
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full min-h-[500px]"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-wider">
                      {activeItem.request_type} Approval
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">
                      {activeItem.request_reference}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {activeItem.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                        {activeItem.submitted_by_name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">Submitted By</p>
                        <p className="font-semibold">{activeItem.submitted_by_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">Submitted Date</p>
                        <p className="font-semibold">Recently Logged</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeItem.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">Decision Required By</p>
                        <p className={`font-bold ${activeItem.priority === 'High' ? 'text-red-600' : 'text-amber-600'}`}>{activeItem.due_date || 'In 5 Days'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`mt-6 p-4 rounded-xl border flex items-start gap-4 ${getDelegationOfAuthority(Number(activeItem.value_amount)).color}`}>
                    <ShieldCheck size={24} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">Delegation of Authority Check</p>
                      <p className="font-bold text-sm">Required Approval: {getDelegationOfAuthority(Number(activeItem.value_amount)).role}</p>
                      <p className="text-xs font-medium opacity-90 mt-1">
                        Rule: Project/Permit Value is {getDelegationOfAuthority(Number(activeItem.value_amount)).rule} (Actual: ₦{(Number(activeItem.value_amount) / 1000000).toFixed(1)}M)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 bg-gray-50/30">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Description & Context</h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-8">
                    {activeItem.description}
                  </p>

                  <h4 className="text-sm font-bold text-gray-900 mb-3">Attached Artifacts</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors cursor-pointer w-72">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-gray-800 truncate">{activeItem.title}.pdf</p>
                        <p className="text-xs text-gray-400 mt-0.5">2.4 MB • Version 1.0</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white rounded-b-2xl flex items-center gap-4">
                  <button 
                    onClick={() => setIsApproveOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors"
                  >
                    <Check size={18} />
                    Approve Request
                  </button>
                  <button 
                    onClick={() => setIsRejectOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <X size={18} />
                    Reject
                  </button>
                  <button 
                    onClick={() => setIsInfoOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare size={18} />
                    Request Info
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ApproveRequestModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        request={activeItem}
        onSuccess={fetchRequests}
      />

      <RejectRequestModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        request={activeItem}
        onSuccess={fetchRequests}
      />

      <RequestInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        request={activeItem}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
