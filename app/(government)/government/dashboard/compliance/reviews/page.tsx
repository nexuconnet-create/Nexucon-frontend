"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  FileSearch, Search, Filter, Calendar, User, CheckCircle2, 
  Circle, MoreVertical, PlayCircle, Clock, RefreshCw, Plus, 
  ChevronRight, ArrowRight, ShieldCheck 
} from "lucide-react";
import { ComplianceReview, getComplianceReviews, advanceReviewStage } from "@/services/compliance";
import CreateComplianceReviewDrawer from "@/components/dashboard/CreateComplianceReviewDrawer";

export default function ComplianceReviews() {
  const [reviews, setReviews] = useState<ComplianceReview[]>([]);
  const [selectedStage, setSelectedStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (selectedStage !== 'All') params.stage = selectedStage;
      if (searchQuery) params.search = searchQuery;

      const data = await getComplianceReviews(params);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load compliance reviews", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStage, searchQuery]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleAdvanceStage = async (review: ComplianceReview, e: React.MouseEvent) => {
    e.stopPropagation();
    const stageFlow: Record<string, string> = {
      'Initiation': 'Audit in Progress',
      'Audit in Progress': 'Reporting',
      'Reporting': 'Final Review',
      'Final Review': 'Completed',
      'Completed': 'Initiation'
    };
    const nextStage = stageFlow[review.stage] || 'Audit in Progress';
    try {
      await advanceReviewStage(review.id, { stage: nextStage });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Review "${review.review_reference}" advanced to ${nextStage}!`, type: 'success' } 
      }));
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Initiation': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Audit in Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Reporting': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Final Review': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Initiation': return <PlayCircle size={14} />;
      case 'Audit in Progress': return <Clock size={14} />;
      case 'Reporting': return <FileSearch size={14} />;
      case 'Final Review': return <CheckCircle2 size={14} />;
      default: return <Circle size={14} />;
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileSearch className="text-blue-500" />
            Compliance Reviews & Audits Lifecycle
          </h1>
          <p className="text-gray-500 mt-1">Manage scheduled and active compliance audits through their statutory lifecycle stages.</p>
        </div>

        <button 
          onClick={() => setIsCreateDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Schedule Compliance Audit
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search reviews by title, code or auditor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={fetchReviews}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Initiation', 'Audit in Progress', 'Reporting', 'Final Review', 'Completed'].map(stg => (
            <button 
              key={stg}
              onClick={() => setSelectedStage(stg)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                selectedStage === stg 
                  ? 'bg-[#022C4F] text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              {stg}
            </button>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center text-gray-400">
          <FileSearch size={44} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold text-gray-700">No compliance reviews found for the selected filter.</p>
          <p className="text-xs text-gray-400 mt-1">Schedule a new statutory review to begin audit tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reviews.map((review, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={review.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-blue-200 transition-all relative"
            >
              {/* Progress Bar Top Edge */}
              <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
                <div 
                  className="h-full bg-blue-500 transition-all duration-700 ease-out" 
                  style={{ width: `${review.progress}%` }}
                ></div>
              </div>

              <div className="p-5 pt-6 flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${getStageColor(review.stage)}`}>
                    {getStageIcon(review.stage)}
                    {review.stage}
                  </span>
                  <button 
                    onClick={(e) => handleAdvanceStage(review, e)}
                    className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md border border-blue-100 transition-colors cursor-pointer"
                    title="Advance to next audit stage"
                  >
                    + Stage
                  </button>
                </div>

                <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors text-sm">
                  {review.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{review.review_reference}</span>
                  <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">{review.review_type}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} className="text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-500 w-16">Auditor:</span>
                    <span className="font-medium truncate">{review.auditor_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-500 w-16">Started:</span>
                    <span className="font-medium">{review.start_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100/50">
                    <Clock size={14} className="text-amber-500 shrink-0" />
                    <span className="font-semibold w-14">Due By:</span>
                    <span className="font-bold">{review.due_date || 'In 14 Days'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Audit Completion</span>
                <span className="text-sm font-bold text-blue-600">{review.progress}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateComplianceReviewDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSuccess={fetchReviews}
      />
    </div>
  );
}
