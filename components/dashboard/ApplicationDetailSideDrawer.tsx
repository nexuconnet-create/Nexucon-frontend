"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, FileText, CheckCircle, XCircle, Clock, AlertTriangle, 
  Calendar, User, Building2, MapPin, ShieldCheck, ArrowRight,
  ClipboardCheck, Send, Plus, ChevronRight, AlertCircle, FileSearch, RefreshCw,
  Check, FileCheck, CheckCircle2, History, ArrowUpRight, ShieldAlert, FileX
} from 'lucide-react';
import { 
  Application, transitionApplication, assignApplicationReviewer, 
  updateApplicationReviewItem, updateDocRequestProgress 
} from '@/services/applications';
import { CustomSelect } from '@/components/CustomSelect';
import { useRouter } from 'next/navigation';

interface ApplicationDetailSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onUpdated?: () => void;
  onRequestDocs?: (app: Application) => void;
}

export default function ApplicationDetailSideDrawer({
  isOpen,
  onClose,
  application,
  onUpdated,
  onRequestDocs
}: ApplicationDetailSideDrawerProps) {
  const router = useRouter();
  const [currentApp, setCurrentApp] = useState<Application | null>(application);
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'documents' | 'requested_docs' | 'history'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // Decision Modals State
  const [showDecisionModal, setShowDecisionModal] = useState<'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL' | null>(null);
  const [rejectionCategory, setRejectionCategory] = useState('Structural Safety Non-Compliance (NBC Sec 4.2)');
  const [decisionReason, setDecisionReason] = useState('');
  const [conditionalNotes, setConditionalNotes] = useState('');

  // Post-Decision Success Modal State
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    type: 'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL';
    title: string;
    description: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    setCurrentApp(application);
  }, [application]);

  if (!isOpen || !currentApp) return null;

  const handleTransition = async (newStatus: 'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL' | string) => {
    setIsSubmitting(true);
    const reasonText = newStatus === 'REJECTED' 
      ? `[${rejectionCategory}] ${decisionReason.trim() || 'Did not meet statutory regulatory building requirements.'}`
      : decisionReason;

    try {
      const updated = await transitionApplication(currentApp.id, {
        status: newStatus,
        reason: reasonText,
        conditions: conditionalNotes
      });

      // Update local state immediately
      setCurrentApp(prev => prev ? ({
        ...prev,
        status: newStatus as any,
        decision_date: new Date().toISOString(),
        decision_reason: reasonText,
        conditions: conditionalNotes
      }) : null);

      setShowDecisionModal(null);
      
      // Open Success Confirmation Modal
      setSuccessModalState({
        isOpen: true,
        type: newStatus as any,
        title: newStatus === 'REJECTED' 
          ? 'Permit Application Formally Rejected' 
          : newStatus === 'APPROVED' 
          ? 'Permit Approved & Certificate Issued' 
          : 'Conditional Approval Granted',
        description: newStatus === 'REJECTED'
          ? `Application ${currentApp.application_reference} has been rejected and moved to the Rejected registry. Official Refusal Notice dispatched to the applicant.`
          : newStatus === 'APPROVED'
          ? `Building permit successfully generated for ${currentApp.project_name}. Project activated in the regulatory registry.`
          : `Conditional permit granted with statutory stipulations recorded for ${currentApp.project_name}.`,
        details: reasonText || conditionalNotes
      });

      if (onUpdated) onUpdated();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to execute decision';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChecklistToggle = async (item: any, newStatus: 'PASSED' | 'FAILED' | 'PENDING') => {
    // 1. Optimistic update
    setCurrentApp(prev => {
      if (!prev) return prev;
      const reviewItems = (prev.review_items || []).map(it => 
        it.id === item.id ? { ...it, status: newStatus } : it
      );
      return { ...prev, review_items: reviewItems };
    });

    try {
      const res = await updateApplicationReviewItem(currentApp.id, {
        item_id: item.id,
        status: newStatus,
        notes: item.notes
      });
      if (res && res.id) setCurrentApp(res);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      console.error("Checklist update failed", err);
    }
  };

  const handleDocItemStatusUpdate = async (requestId: string, itemName: string, newStatus: 'VERIFIED' | 'SUBMITTED' | 'REJECTED' | 'PENDING') => {
    setUpdatingItemId(`${requestId}-${itemName}`);

    // 1. Instant optimistic local state update (0ms UI latency)
    setCurrentApp(prev => {
      if (!prev) return prev;
      const updatedRequests = (prev.document_requests || []).map((req: any) => {
        if (req.id === requestId || String(req.id) === String(requestId)) {
          const itemsProgress = { ...(req.items_progress || {}), [itemName]: newStatus };
          const items = req.requested_items || [];
          const verifiedCount = items.filter((it: string) => 
            itemsProgress[it] === 'VERIFIED' || itemsProgress[it] === 'PASSED' || itemsProgress[it] === 'APPROVED'
          ).length;
          const progressPct = items.length > 0 ? Math.round((verifiedCount / items.length) * 100) : 0;
          const overallStatus = progressPct === 100 ? 'COMPLETED' : (verifiedCount > 0 ? 'IN_PROGRESS' : req.status);
          
          const newHistory = [
            ...(req.status_history || []),
            {
              status: newStatus,
              updated_at: new Date().toISOString(),
              note: `Marked "${itemName}" as ${newStatus} by regulatory examiner.`,
              updated_by: 'Regulatory Desk'
            }
          ];

          return {
            ...req,
            items_progress: itemsProgress,
            progress: progressPct,
            status: overallStatus,
            status_history: newHistory
          };
        }
        return req;
      });

      return {
        ...prev,
        document_requests: updatedRequests
      };
    });

    try {
      const updated = await updateDocRequestProgress(currentApp.id, {
        request_id: requestId,
        item_name: itemName,
        item_status: newStatus,
        note: `Marked ${itemName} as ${newStatus} by regulatory reviewer.`
      });
      if (updated && updated.id) setCurrentApp(updated);
      
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `${itemName} marked as ${newStatus}`, type: 'success' } 
      }));
      if (onUpdated) onUpdated();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update requirement progress';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setUpdatingItemId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">Approved</span>;
      case 'REJECTED': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
      case 'UNDER_REVIEW': return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">Under Review</span>;
      case 'SUBMITTED': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">Submitted</span>;
      case 'CONDITIONAL_APPROVAL': return <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold uppercase tracking-wider">Conditional</span>;
      case 'REVIEW_COMPLETED': return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold uppercase tracking-wider">Review Complete</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const docRequests = currentApp.document_requests || [];

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[720px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300 overflow-hidden">
        
        {/* Top bar */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                PERMIT APPLICATION
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-500">{currentApp.application_reference}</span>
            </div>
            <h2 className="text-xl font-black text-[#022C4F]">{currentApp.title || currentApp.project_name}</h2>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(currentApp.status)}
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-2xl my-4 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('requested_docs')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'requested_docs' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Requested Docs ({docRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'checklist' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Checklist ({currentApp.review_items?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'documents' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Attached Docs ({currentApp.attached_documents?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Audit Trail
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Refusal / Rejection Notice Banner if Rejected */}
              {currentApp.status === 'REJECTED' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-red-800 font-extrabold text-xs uppercase tracking-wider">
                    <ShieldAlert size={16} /> Official Regulatory Refusal Notice
                  </div>
                  <p className="text-xs text-red-900 leading-relaxed font-medium">
                    {currentApp.decision_reason || 'This permit application has been formally rejected due to statutory building code or planning infractions.'}
                  </p>
                  {currentApp.decision_date && (
                    <span className="text-[10px] font-bold text-red-700 block">
                      Refusal Date: {new Date(currentApp.decision_date).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Approval Banner if Approved */}
              {currentApp.status === 'APPROVED' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                    <CheckCircle2 size={16} /> Official Building Permit Issued
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    Permit Number: <strong>{currentApp.permit_number || `LASBCA-PMT-${currentApp.application_reference.split('-')[1] || '2026'}`}</strong>
                  </p>
                  {currentApp.decision_reason && (
                    <p className="text-xs text-emerald-800">{currentApp.decision_reason}</p>
                  )}
                </div>
              )}

              {/* Key metadata grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Project Site</span>
                  <p className="text-xs font-bold text-[#022C4F] flex items-center gap-1.5">
                    <Building2 size={14} className="text-blue-600" /> {currentApp.project_name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{currentApp.project_location || 'Lagos Central Zone'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Applicant Entity</span>
                  <p className="text-xs font-bold text-[#022C4F] flex items-center gap-1.5">
                    <User size={14} className="text-blue-600" /> {currentApp.applicant_name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{currentApp.applicant_email || 'developer@nexucon.ng'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Application Type</span>
                  <p className="text-xs font-bold text-[#022C4F]">{currentApp.application_type}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Priority: <strong className="text-blue-700">{currentApp.priority}</strong></p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Inspector / Reviewer</span>
                  <p className="text-xs font-bold text-[#022C4F] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> 
                    {currentApp.assigned_reviewer_name || 'Unassigned (Awaiting Reviewer)'}
                  </p>
                  {currentApp.review_deadline && (
                    <p className="text-[11px] text-slate-500 mt-0.5">Deadline: {new Date(currentApp.review_deadline).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Requirement Summary */}
              {docRequests.length > 0 && (
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <FileCheck size={15} className="text-blue-600" /> Active Document Requirements
                    </span>
                    <button 
                      onClick={() => setActiveTab('requested_docs')}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View All ({docRequests.length}) <ArrowRight size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    {docRequests.length} document request batch(es) issued for technical verification.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* DEDICATED REQUESTED DOCUMENTS TAB */}
          {activeTab === 'requested_docs' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#022C4F]">Statutory Document Requests</h4>
                  <p className="text-xs text-slate-500">Track and update fulfillment progress for required engineering & compliance documents.</p>
                </div>
                {onRequestDocs && (
                  <button 
                    onClick={() => onRequestDocs(currentApp)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> New Document Request
                  </button>
                )}
              </div>

              {docRequests.length > 0 ? (
                <div className="space-y-4">
                  {docRequests.map((req: any, idx: number) => {
                    const items = req.requested_items || [];
                    const itemsProgress = req.items_progress || {};
                    const verifiedCount = items.filter((it: string) => 
                      itemsProgress[it] === 'VERIFIED' || itemsProgress[it] === 'PASSED' || itemsProgress[it] === 'APPROVED'
                    ).length;
                    const progressPct = req.progress !== undefined 
                      ? req.progress 
                      : (items.length > 0 ? Math.round((verifiedCount / items.length) * 100) : 0);

                    return (
                      <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                        
                        {/* Request Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-[#022C4F] flex items-center gap-1.5">
                                <FileText size={15} className="text-blue-600" /> {req.id || `REQ-${idx+1}`}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                progressPct === 100 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : progressPct > 0 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {progressPct === 100 ? 'Completed' : (req.status || 'Pending Submission')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Issued by: <strong className="text-slate-700">{req.requested_by || 'Government Desk'}</strong> • {req.requested_at ? new Date(req.requested_at).toLocaleDateString() : 'Recent'}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target SLA Deadline</span>
                            <span className="text-xs font-bold text-blue-700 flex items-center justify-end gap-1">
                              <Clock size={12} /> {req.deadline || '7 Days'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                            <span className="text-slate-600 flex items-center gap-1">
                              <CheckCircle2 size={13} className="text-emerald-600" /> Fulfillment Progress
                            </span>
                            <span className="text-blue-700">{verifiedCount} of {items.length} verified ({progressPct}%)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 rounded-full ${
                                progressPct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Itemized Requirements List with Real-Time Actions */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Requested Items & Verification Status:
                          </span>
                          <div className="space-y-2">
                            {items.map((item: string, i: number) => {
                              const itemState = itemsProgress[item] || 'PENDING';
                              const isItemUpdating = updatingItemId === `${req.id}-${item}`;

                              return (
                                <div key={i} className="p-3 bg-white border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2 hover:border-slate-300 transition-all">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                      itemState === 'VERIFIED' || itemState === 'PASSED'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : itemState === 'SUBMITTED'
                                        ? 'bg-blue-100 text-blue-700'
                                        : itemState === 'REJECTED'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {itemState === 'VERIFIED' || itemState === 'PASSED' ? <Check size={13} /> : i + 1}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-800">{item}</p>
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                        itemState === 'VERIFIED' || itemState === 'PASSED'
                                          ? 'text-emerald-700'
                                          : itemState === 'SUBMITTED'
                                          ? 'text-blue-700'
                                          : itemState === 'REJECTED'
                                          ? 'text-red-700'
                                          : 'text-amber-700'
                                      }`}>
                                        Status: {itemState}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Verification Actions with Instant Click Response */}
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={isItemUpdating}
                                      onClick={() => handleDocItemStatusUpdate(req.id, item, 'VERIFIED')}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                        itemState === 'VERIFIED' || itemState === 'PASSED'
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                      }`}
                                    >
                                      <Check size={12} /> Pass
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isItemUpdating}
                                      onClick={() => handleDocItemStatusUpdate(req.id, item, 'SUBMITTED')}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                        itemState === 'SUBMITTED'
                                          ? 'bg-blue-600 text-white shadow-xs'
                                          : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                                      }`}
                                    >
                                      <Clock size={12} /> Received
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isItemUpdating}
                                      onClick={() => handleDocItemStatusUpdate(req.id, item, 'REJECTED')}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                        itemState === 'REJECTED'
                                          ? 'bg-red-600 text-white shadow-xs'
                                          : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                                      }`}
                                    >
                                      <X size={12} /> Revision
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Instructions */}
                        {req.instructions && (
                          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/60">
                            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-1">Official Instructions / Requirements:</span>
                            <p className="text-xs text-slate-700 leading-relaxed">{req.instructions}</p>
                          </div>
                        )}

                        {/* Timeline / Status History */}
                        {req.status_history && req.status_history.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                              <History size={12} /> Progress Update Log:
                            </span>
                            <div className="space-y-1 text-[11px] text-slate-500">
                              {req.status_history.map((log: any, logIdx: number) => (
                                <div key={logIdx} className="flex items-start gap-2">
                                  <span className="text-slate-400 shrink-0">• {log.updated_at ? new Date(log.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Log'}:</span>
                                  <span>{log.note || log.status} {log.updated_by ? `(${log.updated_by})` : ''}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <FileText size={32} className="text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">No additional documents have been requested for this application yet.</p>
                  {onRequestDocs && (
                    <button 
                      onClick={() => onRequestDocs(currentApp)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} /> Issue First Document Request
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CHECKLIST TAB */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#022C4F]">Statutory Compliance Checklist</h4>
              <div className="space-y-2.5">
                {(currentApp.review_items && currentApp.review_items.length > 0) ? (
                  currentApp.review_items.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                          item.status === 'PASSED' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {item.status === 'PASSED' ? '✓' : item.status === 'FAILED' ? '✕' : '—'}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleChecklistToggle(item, 'PASSED')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            item.status === 'PASSED' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => handleChecklistToggle(item, 'FAILED')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            item.status === 'FAILED' ? 'bg-red-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Fail
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No review checklist items configured for this application type.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATTACHED DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#022C4F]">Submitted Technical Drawings & Files</h4>
              <div className="space-y-2.5">
                {(currentApp.attached_documents && currentApp.attached_documents.length > 0) ? (
                  currentApp.attached_documents.map((doc, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{doc.name || `Document_${idx+1}.pdf`}</p>
                          <span className="text-[10px] text-slate-400">{doc.type || 'Technical Drawing'}</span>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
                        View
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No files attached to this application record.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AUDIT TRAIL TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#022C4F]">Audit & Decision Trail</h4>
              <div className="border-l-2 border-slate-200 ml-4 space-y-6 py-2">
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                  <p className="text-xs font-bold text-slate-800">Application Submitted</p>
                  <p className="text-[11px] text-slate-400">{new Date(currentApp.created_at).toLocaleString()}</p>
                </div>
                {currentApp.decision_date && (
                  <div className="relative pl-6">
                    <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      currentApp.status === 'REJECTED' ? 'bg-red-600' : 'bg-emerald-600'
                    }`}></div>
                    <p className="text-xs font-bold text-slate-800">Decision Executed: {currentApp.status}</p>
                    <p className="text-[11px] text-slate-400">{new Date(currentApp.decision_date).toLocaleString()}</p>
                    {currentApp.decision_reason && (
                      <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{currentApp.decision_reason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM ACTION FOOTER */}
        <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-2">
            {onRequestDocs && (
              <button 
                type="button"
                onClick={() => onRequestDocs(currentApp)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Request Docs
              </button>
            )}
            <button 
              type="button"
              onClick={() => router.push(`/government/dashboard/projects/view/${currentApp.project}/monitoring`)}
              className="px-4 py-2.5 border border-blue-200 text-blue-700 bg-blue-50/50 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSearch size={14} /> Open Project
            </button>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Always provide Reject option if active application */}
            {currentApp.status !== 'REJECTED' && currentApp.status !== 'APPROVED' && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowDecisionModal('REJECTED')}
                className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileX size={14} /> Reject Application
              </button>
            )}

            {currentApp.status === 'SUBMITTED' && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleTransition('UNDER_REVIEW')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Accept for Review
              </button>
            )}

            {currentApp.status === 'UNDER_REVIEW' && (
              <>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowDecisionModal('CONDITIONAL_APPROVAL')}
                  className="px-4 py-2.5 bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Conditional Pass
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowDecisionModal('APPROVED')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={14} /> Approve & Issue Permit
                </button>
              </>
            )}

            {(currentApp.status === 'REVIEW_COMPLETED' || currentApp.status === 'APPROVAL_REQUESTED' || currentApp.status === 'CONDITIONAL_APPROVAL') && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowDecisionModal('APPROVED')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle size={14} /> Approve & Issue Permit
              </button>
            )}
          </div>
        </div>

        {/* DECISION CONFIRMATION MODAL */}
        {showDecisionModal && (
          <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[115] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    showDecisionModal === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    showDecisionModal === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {showDecisionModal === 'APPROVED' ? <CheckCircle size={22} /> :
                     showDecisionModal === 'REJECTED' ? <ShieldAlert size={22} /> : <ClipboardCheck size={22} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#022C4F]">
                      {showDecisionModal === 'APPROVED' ? 'Authorize & Issue Permit' : 
                       showDecisionModal === 'REJECTED' ? 'Confirm Permit Rejection' : 
                       'Conditional Approval Terms'}
                    </h3>
                    <p className="text-xs text-slate-500">{currentApp.application_reference} • {currentApp.project_name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDecisionModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Notice description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {showDecisionModal === 'APPROVED' 
                  ? 'Approving will immediately generate an official Lagos State Physical Planning & Development Authority Building Permit and activate the site construction project.'
                  : showDecisionModal === 'REJECTED'
                  ? 'Rejecting will formally issue a Refusal Notice to the developer and move this application to the Rejected registry with documented statutory citations.'
                  : 'Specify the required mandatory conditions that must be fulfilled before site works commence.'}
              </p>

              {/* REJECTION CATEGORY SELECT */}
              {showDecisionModal === 'REJECTED' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Statutory Rejection Ground
                  </label>
                  <CustomSelect
                    value={rejectionCategory}
                    onChange={(val) => setRejectionCategory(val)}
                    options={[
                      { value: "Structural Safety Non-Compliance (NBC Sec 4.2)", label: "Structural Safety & Integrity Non-Compliance (NBC Sec 4.2)" },
                      { value: "Statutory Zoning & Density Infraction (Lagos Urban Planning Code)", label: "Statutory Zoning & Density Infraction (Urban Planning Code)" },
                      { value: "Deficient Environmental Impact & Drainage Attenuation (EIA)", label: "Deficient Environmental Impact & Drainage Attenuation (EIA)" },
                      { value: "Defective / Invalid Title Documentation or Site Boundary Dispute", label: "Defective Title Documentation or Boundary Dispute" },
                      { value: "Disqualified / Non-Registered Professional Submission", label: "Disqualified / Non-Registered Professional Submission" },
                      { value: "Unresolved Critical Finding & Non-Conformance Violations", label: "Unresolved Critical Finding & NCR Violations" }
                    ]}
                    placeholder="Select rejection reason..."
                  />
                </div>
              )}

              {/* CONDITIONAL REQUIREMENTS */}
              {showDecisionModal === 'CONDITIONAL_APPROVAL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mandatory Pre-Construction Conditions
                  </label>
                  <textarea
                    value={conditionalNotes}
                    onChange={(e) => setConditionalNotes(e.target.value)}
                    placeholder="e.g. Subject to submission of revised pile load test results and environmental silt barriers before foundation casting..."
                    rows={3}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              )}

              {/* DECISION REMARKS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {showDecisionModal === 'REJECTED' ? 'Detailed Refusal Remarks / Instructions for Remedy' : 'Decision Remarks for Regulatory Audit Trail'}
                </label>
                <textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder={showDecisionModal === 'REJECTED' 
                    ? "Enter explicit directives on why this was rejected and what modifications are required for re-application..."
                    : "Enter remarks for official certificate issue..."}
                  rows={3}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleTransition(showDecisionModal)}
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    showDecisionModal === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' :
                    showDecisionModal === 'REJECTED' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 
                    'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                  }`}
                >
                  {isSubmitting ? 'Executing Decision...' : 
                   showDecisionModal === 'APPROVED' ? 'Authorize & Issue Permit' :
                   showDecisionModal === 'REJECTED' ? 'Confirm Formal Rejection' :
                   'Grant Conditional Approval'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* POST-DECISION SUCCESS CONFIRMATION MODAL */}
        {successModalState && (
          <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center space-y-4">
              
              <div className={`w-14 h-14 rounded-3xl mx-auto flex items-center justify-center ${
                successModalState.type === 'APPROVED' ? 'bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50' :
                successModalState.type === 'REJECTED' ? 'bg-red-100 text-red-600 ring-8 ring-red-50' : 
                'bg-teal-100 text-teal-600 ring-8 ring-teal-50'
              }`}>
                {successModalState.type === 'APPROVED' ? <CheckCircle size={32} /> :
                 successModalState.type === 'REJECTED' ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
              </div>

              <div>
                <h3 className="text-lg font-black text-[#022C4F]">{successModalState.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{successModalState.description}</p>
              </div>

              {successModalState.details && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs text-slate-700 font-medium space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recorded Decision Notice:</span>
                  <p className="leading-relaxed">{successModalState.details}</p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const targetRoute = successModalState.type === 'REJECTED' 
                      ? '/government/dashboard/applications/rejected'
                      : successModalState.type === 'APPROVED'
                      ? '/government/dashboard/applications/approved'
                      : '/government/dashboard/applications/conditional';
                    setSuccessModalState(null);
                    onClose();
                    router.push(targetRoute);
                  }}
                  className={`w-full py-2.5 text-xs font-bold rounded-xl text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    successModalState.type === 'REJECTED' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' :
                    successModalState.type === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' :
                    'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                  }`}
                >
                  View in {successModalState.type === 'REJECTED' ? 'Rejected' : successModalState.type === 'APPROVED' ? 'Approved' : 'Conditional'} Registry <ArrowUpRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessModalState(null);
                    onClose();
                  }}
                  className="w-full py-2.5 text-xs font-bold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
