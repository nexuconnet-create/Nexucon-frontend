"use client";

import React, { useState } from 'react';
import { 
  X, FileText, CheckCircle, XCircle, Clock, AlertTriangle, 
  Calendar, User, Building2, MapPin, ShieldCheck, ArrowRight,
  ClipboardCheck, Send, Plus, ChevronRight, AlertCircle, FileSearch, RefreshCw
} from 'lucide-react';
import { Application, transitionApplication, assignApplicationReviewer, updateApplicationReviewItem } from '@/services/applications';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'documents' | 'history'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionReason, setDecisionReason] = useState('');
  const [conditionalNotes, setConditionalNotes] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState<'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL' | null>(null);

  if (!isOpen || !application) return null;

  const handleTransition = async (newStatus: string) => {
    setIsSubmitting(true);
    try {
      await transitionApplication(application.id, {
        status: newStatus,
        reason: decisionReason,
        conditions: conditionalNotes
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Application updated to ${newStatus}`, type: 'success' } 
      }));
      setShowDecisionModal(null);
      setDecisionReason('');
      setConditionalNotes('');
      if (onUpdated) onUpdated();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to transition application';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChecklistToggle = async (item: any, newStatus: 'PASSED' | 'FAILED' | 'PENDING') => {
    try {
      await updateApplicationReviewItem(application.id, {
        item_id: item.id,
        status: newStatus,
        notes: item.notes
      });
      if (onUpdated) onUpdated();
    } catch (err: any) {
      console.error("Checklist update failed", err);
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

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[700px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300 overflow-hidden">
        
        {/* Top bar */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{application.application_reference}</span>
              {getStatusBadge(application.status)}
            </div>
            <h2 className="text-2xl font-black text-[#022C4F]">{application.title || application.application_type}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Building2 size={14} className="text-blue-600" /> {application.project_name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-slate-100 py-3 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'checklist', label: `Review Checklist (${(application.review_items || []).length})` },
            { id: 'documents', label: `Documents (${(application.attached_documents || []).length})` },
            { id: 'history', label: 'Decision History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Applicant</span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" /> {application.applicant_name}
                  </p>
                  <p className="text-xs text-slate-500">{application.applicant_email}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Permit Type</span>
                  <p className="text-sm font-bold text-slate-800">{application.application_type}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                    application.priority === 'High' || application.priority === 'Critical'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {application.priority} Priority
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Reviewer</span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> 
                    {application.assigned_reviewer_name || 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Deadline & Next Action Box */}
              <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600" /> Current Workflow Action
                </h4>
                <p className="text-sm font-medium text-slate-700">
                  {application.required_action || 'Review pending technical documents and complete audit checklist.'}
                </p>
                {application.review_deadline && (
                  <p className="text-xs font-bold text-blue-700 mt-2 flex items-center gap-1">
                    <Calendar size={12} /> Target SLA Deadline: {new Date(application.review_deadline).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Conditions / Notes if present */}
              {application.conditions && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Conditional Approval Requirements
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap">{application.conditions}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#022C4F]">Regulatory & Technical Verification</h4>
                <span className="text-xs text-slate-400 font-semibold">Click to verify item</span>
              </div>
              
              <div className="space-y-3">
                {(application.review_items && application.review_items.length > 0) ? (
                  application.review_items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:shadow-sm transition-all">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        {item.notes && <p className="text-xs text-slate-500 mt-1">{item.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleChecklistToggle(item, 'PASSED')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                            item.status === 'PASSED' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle size={14} /> Pass
                        </button>
                        <button
                          onClick={() => handleChecklistToggle(item, 'FAILED')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                            item.status === 'FAILED' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <XCircle size={14} /> Fail
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                    No review criteria checklist configured for this application type.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#022C4F]">Submitted Documentation</h4>
                {onRequestDocs && (
                  <button 
                    onClick={() => onRequestDocs(application)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Request More Docs
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl p-2 border border-slate-100">
                {(application.attached_documents && application.attached_documents.length > 0) ? (
                  application.attached_documents.map((doc, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-white rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{doc.name || `Document_${idx+1}.pdf`}</p>
                          <span className="text-[10px] text-slate-400">{doc.type || 'Technical Drawing'}</span>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-blue-600 hover:underline">
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

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#022C4F]">Audit & Decision Trail</h4>
              <div className="border-l-2 border-slate-200 ml-4 space-y-6 py-2">
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                  <p className="text-xs font-bold text-slate-800">Application Submitted</p>
                  <p className="text-[11px] text-slate-400">{new Date(application.created_at).toLocaleString()}</p>
                </div>
                {application.decision_date && (
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-sm"></div>
                    <p className="text-xs font-bold text-slate-800">Decision Executed: {application.status}</p>
                    <p className="text-[11px] text-slate-400">{new Date(application.decision_date).toLocaleString()}</p>
                    {application.decision_reason && (
                      <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg">{application.decision_reason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Action Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            {onRequestDocs && (
              <button 
                onClick={() => onRequestDocs(application)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Request Docs
              </button>
            )}
            <button 
              onClick={() => router.push(`/government/dashboard/projects/view/${application.project}/monitoring`)}
              className="px-4 py-2.5 border border-blue-200 text-blue-700 bg-blue-50/50 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <FileSearch size={14} /> Open Project
            </button>
          </div>

          <div className="flex items-center gap-2">
            {application.status === 'SUBMITTED' && (
              <button
                disabled={isSubmitting}
                onClick={() => handleTransition('UNDER_REVIEW')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                Accept for Review
              </button>
            )}

            {application.status === 'UNDER_REVIEW' && (
              <>
                <button
                  disabled={isSubmitting}
                  onClick={() => setShowDecisionModal('CONDITIONAL_APPROVAL')}
                  className="px-4 py-2.5 bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors"
                >
                  Conditional Pass
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleTransition('REVIEW_COMPLETED')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Complete Review
                </button>
              </>
            )}

            {(application.status === 'REVIEW_COMPLETED' || application.status === 'APPROVAL_REQUESTED' || application.status === 'CONDITIONAL_APPROVAL') && (
              <>
                <button
                  disabled={isSubmitting}
                  onClick={() => setShowDecisionModal('REJECTED')}
                  className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
                >
                  Reject
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => setShowDecisionModal('APPROVED')}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle size={14} /> Approve & Issue Permit
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal for Decision confirmation with Reason / Conditions */}
        {showDecisionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-[#022C4F] mb-2">
                {showDecisionModal === 'APPROVED' ? 'Confirm Permit Approval' : showDecisionModal === 'REJECTED' ? 'Confirm Application Rejection' : 'Conditional Approval Requirements'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {showDecisionModal === 'APPROVED' 
                  ? 'Approving will immediately generate an official building permit and activate the associated construction project.'
                  : 'Please specify the regulatory reason or required conditions for this decision.'}
              </p>

              {showDecisionModal === 'CONDITIONAL_APPROVAL' && (
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-600 block mb-1">Required Conditions</label>
                  <textarea
                    value={conditionalNotes}
                    onChange={(e) => setConditionalNotes(e.target.value)}
                    placeholder="e.g. Subject to submission of revised structural beam calculations prior to casting..."
                    className="w-full h-24 p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="text-xs font-bold text-slate-600 block mb-1">Decision Notes / Justification</label>
                <textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Enter remarks for the regulatory audit trail..."
                  className="w-full h-20 p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDecisionModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleTransition(showDecisionModal)}
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all ${
                    showDecisionModal === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    showDecisionModal === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Decision'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
