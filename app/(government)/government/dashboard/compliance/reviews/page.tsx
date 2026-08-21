"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileSearch, Search, Filter, Calendar, User, CheckCircle2, Circle, MoreVertical, PlayCircle, Clock, RefreshCw } from "lucide-react";
import { ComplianceReview, getComplianceReviews } from "@/services/compliance";

export default function ComplianceReviews() {
  const [reviews, setReviews] = useState<ComplianceReview[]>([]);
  const [selectedStage, setSelectedStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {['All', 'Initiation', 'Audit in Progress', 'Reporting', 'Final Review'].map(stg => (
            <button 
              key={stg}
              onClick={() => setSelectedStage(stg)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reviews.map((review, idx) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={review.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative"
          >
            {/* Progress Bar Top Edge */}
            <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                style={{ width: `${review.progress}%` }}
              ></div>
            </div>

            <div className="p-5 pt-6 flex-1">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${getStageColor(review.stage)}`}>
                  {getStageIcon(review.stage)}
                  {review.stage}
                </span>
                <button className="text-gray-400 hover:text-gray-700 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>

              <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                {review.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{review.review_reference}</span>
                <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded">{review.review_type}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <User size={14} className="text-gray-400" />
                  <span className="font-semibold text-gray-500 w-16">Auditor:</span>
                  <span className="font-medium">{review.auditor_name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="font-semibold text-gray-500 w-16">Started:</span>
                  <span className="font-medium">{review.start_date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100/50">
                  <Clock size={14} className="text-amber-500" />
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
    </div>
  );
}
