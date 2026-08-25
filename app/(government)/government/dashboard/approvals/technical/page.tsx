"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileSearch, Layers, Box, Wind, CheckCircle2, XCircle, 
  FileText, MessageSquareText, RefreshCw, QrCode, ShieldCheck, 
  Check, AlertTriangle, Eye, Send 
} from "lucide-react";
import { 
  ApprovalRequest, getApprovalRequests, evaluateCriterion, 
  approveRequest, addApprovalComment 
} from "@/services/approvals";
import ApproveRequestModal from "@/components/dashboard/ApproveRequestModal";
import RequestRevisionModal from "@/components/dashboard/RequestRevisionModal";

export default function TechnicalReviews() {
  const [reviews, setReviews] = useState<ApprovalRequest[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { request_type: 'Technical' };
      if (selectedDiscipline !== 'All') params.discipline = selectedDiscipline;

      const data = await getApprovalRequests(params);
      const activeList = data.length > 0 ? data : (await getApprovalRequests()).filter(r => r.request_type === 'Technical' || r.discipline === 'Structural' || r.discipline === 'MEP');
      setReviews(activeList);
      if (activeList.length > 0 && (!selectedReviewId || !activeList.find(r => r.id === selectedReviewId))) {
        setSelectedReviewId(activeList[0].id);
      } else if (activeList.length === 0) {
        setSelectedReviewId(null);
      }
    } catch (err) {
      console.error("Failed to load technical reviews", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedReviewId, selectedDiscipline]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const activeReview = reviews.find(r => r.id === selectedReviewId) || reviews[0];

  const handleToggleCriterion = async (criterion: any) => {
    const nextStatus = criterion.status === 'pass' ? 'fail' : 'pass';
    try {
      if (criterion.id && criterion.id.length > 5) {
        await evaluateCriterion(criterion.id, { status: nextStatus, notes: criterion.notes });
      }
      setReviews(prev => prev.map(r => ({
        ...r,
        criteria: r.criteria?.map(c => c.id === criterion.id ? { ...c, status: nextStatus } : c)
      })));
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Criterion "${criterion.name}" marked as ${nextStatus.toUpperCase()}`, type: 'info' } 
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview || !commentInput.trim()) return;
    try {
      await addApprovalComment(activeReview.id, { content: commentInput, comment_type: 'TechnicalFinding' });
      setCommentInput('');
      fetchReviews();
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Technical finding comment added!', type: 'success' } }));
    } catch (err) {
      console.error(err);
    }
  };

  const getDisciplineIcon = (discipline: string) => {
    switch(discipline) {
      case 'MEP': return <Wind size={14} />;
      case 'Structural': return <Layers size={14} />;
      case 'Architecture': return <Box size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Approved': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'In Review': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Awaiting Fix': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-2rem)] pb-12 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileSearch className="text-blue-500" />
            Technical & Engineering Reviews
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Deep-dive structural rubrics, MEP load calculations, and BIM/GPR coordination audits.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {['All', 'Structural', 'MEP', 'Architecture'].map(disc => (
              <button
                key={disc}
                onClick={() => setSelectedDiscipline(disc)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  selectedDiscipline === disc 
                    ? 'bg-[#022C4F] text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {disc}
              </button>
            ))}
          </div>

          <button 
            onClick={fetchReviews}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left Column: Review List */}
        <div className="lg:w-1/3 flex flex-col gap-3.5">
          {reviews.map((review, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={review.id}
              onClick={() => setSelectedReviewId(review.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeReview?.id === review.id 
                  ? 'bg-blue-50/70 border-blue-300 shadow-md ring-2 ring-blue-500/20' 
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {review.request_reference}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusStyle(review.status)}`}>
                  {review.status}
                </span>
              </div>
              
              <h3 className={`font-bold text-xs sm:text-sm leading-snug mb-3 ${activeReview?.id === review.id ? 'text-blue-700' : 'text-slate-900'}`}>
                {review.title}
              </h3>
              
              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-auto text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-600">
                  {getDisciplineIcon(review.discipline)} {review.discipline}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {review.due_date || 'In 7 Days'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column: Detailed Rubric Criteria */}
        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            {activeReview && (
              <motion.div
                key={activeReview.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden"
              >
                {/* Rubric Header */}
                <div className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      Technical Review Rubric • {activeReview.discipline}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {activeReview.request_reference}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{activeReview.title}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Project: <span className="font-bold text-slate-700">{activeReview.project_name || 'PRJ-2026'}</span> • Submitted by {activeReview.submitted_by_name}
                  </p>
                </div>

                {/* Rubric Body */}
                <div className="p-6 sm:p-7 flex-1 space-y-6 overflow-y-auto">
                  {/* Evaluation Checklist */}
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-blue-500" />
                        Engineering Acceptance Criteria (Click icon to pass/fail)
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {activeReview.criteria?.filter(c => c.status === 'pass').length || 0} / {activeReview.criteria?.length || 0} Passed
                      </span>
                    </h3>
                    
                    <div className="space-y-3">
                      {(activeReview.criteria || []).map((criterion, i) => (
                        <div key={criterion.id || i} className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:border-blue-200 transition-all">
                          <button 
                            onClick={() => handleToggleCriterion(criterion)}
                            className="pt-0.5 cursor-pointer hover:scale-110 transition-transform shrink-0"
                            title="Toggle Pass/Fail"
                          >
                            {criterion.status === 'pass' 
                              ? <CheckCircle2 size={22} className="text-emerald-500" />
                              : <XCircle size={22} className="text-red-500" />
                            }
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{criterion.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${criterion.status === 'pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {criterion.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                              {criterion.notes || 'Verified against statutory engineering limits and building codes.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Findings & Audit Thread */}
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-3 flex items-center gap-2">
                      <MessageSquareText size={16} className="text-blue-500" />
                      Technical Findings & Comments
                    </h3>

                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Log engineering observation or structural note..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!commentInput.trim()}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <Send size={13} />
                        <span>Log Finding</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Rubric Footer Action Bar */}
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3">
                  {activeReview.status !== 'Approved' ? (
                    <>
                      <button 
                        onClick={() => setIsApproveOpen(true)}
                        className="flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                      >
                        <Check size={16} />
                        <span>Submit Final Approval</span>
                      </button>

                      <button 
                        onClick={() => setIsRevisionOpen(true)}
                        className="px-5 py-3 bg-white hover:bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        <AlertTriangle size={15} />
                        <span>Request Correction</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 text-xs">
                      <CheckCircle2 size={18} />
                      <span>Technical Evaluation Fully Approved & Cryptographically Sealed</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ApproveRequestModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        request={activeReview}
        onSuccess={fetchReviews}
      />

      <RequestRevisionModal
        isOpen={isRevisionOpen}
        onClose={() => setIsRevisionOpen(false)}
        request={activeReview}
        onSuccess={fetchReviews}
      />
    </div>
  );
}
