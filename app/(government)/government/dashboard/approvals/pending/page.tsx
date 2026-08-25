"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, Clock, AlertCircle, FileText, User, Calendar, 
  Check, X, MessageSquare, ShieldCheck, RefreshCw, QrCode, 
  Send, UserCheck, AlertTriangle, Download, ExternalLink, Hash, Lock 
} from "lucide-react";
import { 
  ApprovalRequest, getApprovalRequests, addApprovalComment 
} from "@/services/approvals";
import ApproveRequestModal from "@/components/dashboard/ApproveRequestModal";
import RejectRequestModal from "@/components/dashboard/RejectRequestModal";
import RequestInfoModal from "@/components/dashboard/RequestInfoModal";
import RequestRevisionModal from "@/components/dashboard/RequestRevisionModal";
import AssignApprovalReviewerModal from "@/components/dashboard/AssignApprovalReviewerModal";

export default function PendingApprovals() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Modals
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getApprovalRequests();
      const pendingList = data.filter(r => ['Pending', 'In Review', 'Awaiting Fix', 'Conditional'].includes(r.status));
      const listToShow = pendingList.length > 0 ? pendingList : data;
      setRequests(listToShow);
      if (listToShow.length > 0 && (!selectedItem || !listToShow.find(r => r.id === selectedItem))) {
        setSelectedItem(listToShow[0].id);
      } else if (listToShow.length === 0) {
        setSelectedItem(null);
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

  const activeItem = requests.find(item => item.id === selectedItem) || requests[0];

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const comment = await addApprovalComment(activeItem.id, { content: newComment, comment_type: 'General' });
      setRequests(prev => prev.map(r => {
        if (r.id === activeItem.id) {
          return {
            ...r,
            comments: [...(r.comments || []), comment]
          };
        }
        return r;
      }));
      setNewComment('');
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Review comment posted to audit trail!', type: 'success' } }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsPostingComment(false);
    }
  };

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
      case 'High': return <AlertCircle size={13} className="text-red-500" />;
      case 'Medium': return <Clock size={13} className="text-amber-500" />;
      case 'Low': return <CheckCircle size={13} className="text-emerald-500" />;
      default: return null;
    }
  };

  const getDelegationOfAuthority = (value: number) => {
    if (value > 50000000) {
      return { role: "Permanent Secretary / Director General", rule: "Above ₦50M", color: "text-purple-800 bg-purple-50 border-purple-200" };
    }
    return { role: "Director", rule: "₦50M and below", color: "text-blue-800 bg-blue-50 border-blue-200" };
  };

  return (
    <div className="w-full min-h-[calc(100vh-2rem)] pb-12 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <CheckCircle className="text-blue-500" />
            Action Center: Pending Approvals
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Review, assign, and execute statutory authorizations with cryptographic version traceability.</p>
        </div>
        
        <button 
          onClick={fetchRequests}
          className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors self-start md:self-auto cursor-pointer"
          title="Refresh Queue"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left Column: Inbox List */}
        <div className="lg:w-1/3 flex flex-col gap-3.5">
          {requests.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={item.id}
              onClick={() => setSelectedItem(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeItem?.id === item.id 
                  ? 'bg-blue-50/70 border-blue-300 shadow-md ring-2 ring-blue-500/20' 
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyle(item.priority)}`}>
                  {getPriorityIcon(item.priority)}
                  {item.priority}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{item.request_reference}</span>
              </div>
              
              <h3 className={`font-bold text-xs sm:text-sm leading-snug mb-2 ${activeItem?.id === item.id ? 'text-blue-700' : 'text-slate-900'}`}>
                {item.title}
              </h3>
              
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                <div className="flex items-center gap-1">
                  <User size={12} className="text-slate-400" /> {item.submitted_by_name}
                </div>
                <div className={`font-semibold ${item.priority === 'High' ? 'text-red-600' : 'text-slate-500'}`}>
                  Due: {item.due_date || 'In 5 Days'}
                </div>
              </div>
              
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ₦{(Number(item.value_amount) / 1000000).toFixed(1)}M • {item.discipline}
                </span>
                <button 
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 border border-emerald-200 cursor-pointer shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item.id);
                    setIsApproveOpen(true);
                  }}
                >
                  <Check size={12} /> Approve
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
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden"
              >
                {/* Detail Header */}
                <div className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/40">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wider">
                        {activeItem.request_type} Approval
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {activeItem.request_reference}
                      </span>
                    </div>

                    <button
                      onClick={() => setIsAssignOpen(true)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <UserCheck size={14} className="text-blue-600" />
                      <span>Reviewer: {activeItem.assigned_to_name || 'Assign Reviewer'}</span>
                    </button>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 leading-tight">
                    {activeItem.title}
                  </h2>

                  {/* Cryptographic Version & Compliance Lineage Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <QrCode size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Source Version Hash (Lineage)</p>
                        <p className="text-xs font-mono font-bold text-slate-800 truncate">{activeItem.source_version_hash || '0x8f2c991b2741e4184'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Compliance Gate</p>
                        <p className="text-xs font-bold text-emerald-700">{activeItem.compliance_gate_status || 'Passed'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                        {activeItem.submitted_by_name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Submitted By</p>
                        <p className="font-bold text-slate-800">{activeItem.submitted_by_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Project Reference</p>
                        <p className="font-bold text-slate-800">{activeItem.project_name || 'PRJ-2026'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeItem.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Decision Required By</p>
                        <p className={`font-bold ${activeItem.priority === 'High' ? 'text-red-600' : 'text-amber-600'}`}>{activeItem.due_date || 'In 5 Days'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delegation of Authority Banner */}
                  <div className={`mt-5 p-4 rounded-2xl border flex items-start gap-3.5 ${getDelegationOfAuthority(Number(activeItem.value_amount)).color}`}>
                    <ShieldCheck size={22} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-80">Delegation of Authority (DoA) Limit</p>
                      <p className="font-black text-xs sm:text-sm">Authorized Tier: {getDelegationOfAuthority(Number(activeItem.value_amount)).role}</p>
                      <p className="text-[11px] font-medium opacity-90 mt-0.5">
                        Rule: Financial Value is {getDelegationOfAuthority(Number(activeItem.value_amount)).rule} (Declared: ₦{(Number(activeItem.value_amount) / 1000000).toFixed(1)}M)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detail Body */}
                <div className="p-6 sm:p-7 flex-1 space-y-6 overflow-y-auto">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Description & Statutory Context</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activeItem.description || 'Statutory review submission for structural and architectural compliance.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Attached Document Artifact (Cloudflare R2)</h4>
                    <div 
                      onClick={() => {
                        if (activeItem.attached_file_url) window.open(activeItem.attached_file_url, '_blank');
                      }}
                      className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-2xl transition-all cursor-pointer w-full max-w-sm"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{activeItem.title}.pdf</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Cloudflare R2 Stamped PDF • Signed State</p>
                      </div>
                      <ExternalLink size={14} className="text-slate-400" />
                    </div>
                  </div>

                  {/* Audit Trail & Review Comments Thread */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Official Review Notes & Audit Comments</h4>
                    
                    <div className="space-y-2.5 mb-4">
                      {activeItem.comments && activeItem.comments.length > 0 ? (
                        activeItem.comments.map(c => (
                          <div key={c.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{c.author_name}</span>
                              <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-600">{c.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No comments recorded yet. Post an audit note below.</p>
                      )}
                    </div>

                    <form onSubmit={handlePostComment} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add review comment or note to audit log..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={isPostingComment || !newComment.trim()}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <Send size={13} />
                        <span>Post</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Detail Action Bar */}
                <div className="p-5 border-t border-slate-100 bg-white flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => setIsApproveOpen(true)}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Check size={16} />
                    <span>Approve Request</span>
                  </button>

                  <button 
                    onClick={() => setIsRevisionOpen(true)}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    <AlertTriangle size={15} />
                    <span>Request Revision</span>
                  </button>

                  <button 
                    onClick={() => setIsRejectOpen(true)}
                    className="px-5 py-3 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    <X size={15} />
                    <span>Reject</span>
                  </button>

                  <button 
                    onClick={() => setIsInfoOpen(true)}
                    className="px-5 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    <MessageSquare size={15} />
                    <span>Request Info</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals & Dialogs */}
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

      <RequestRevisionModal
        isOpen={isRevisionOpen}
        onClose={() => setIsRevisionOpen(false)}
        request={activeItem}
        onSuccess={fetchRequests}
      />

      <AssignApprovalReviewerModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        request={activeItem}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
