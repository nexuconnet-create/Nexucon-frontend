"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSearch, Layers, Box, Zap, Wind, CheckCircle2, XCircle, FileText, ChevronRight, MessageSquareText } from "lucide-react";

export default function TechnicalReviews() {
  const [selectedReview, setSelectedReview] = useState<string | null>("TR-502");

  const reviews = [
    {
      id: "TR-502",
      title: "HVAC Zone 4 Load Calculations",
      discipline: "MEP",
      status: "In Review",
      author: "M. Chen",
      date: "Oct 12, 2026",
      criteria: [
        { name: "Cooling Load Capacity", status: "pass", notes: "Exceeds minimum requirements by 12%." },
        { name: "Ductwork Routing Clash", status: "fail", notes: "Clash detected at grid line C4 with structural beam." },
        { name: "Energy Efficiency Ratio", status: "pass", notes: "Meets LEED v4 standards." },
      ]
    },
    {
      id: "TR-501",
      title: "Foundation Rebar Density (North)",
      discipline: "Structural",
      status: "Awaiting Fix",
      author: "A. Rivera",
      date: "Oct 10, 2026",
      criteria: [
        { name: "Tensile Strength Limits", status: "pass", notes: "Acceptable for load-bearing specifications." },
        { name: "Concrete Cover Depth", status: "fail", notes: "Insufficient cover depth at column C12." },
      ]
    },
    {
      id: "TR-499",
      title: "Facade Glazing Thermal Specs",
      discipline: "Architecture",
      status: "Approved",
      author: "S. Jenkins",
      date: "Oct 05, 2026",
      criteria: [
        { name: "U-Value Targets", status: "pass", notes: "Verified against local building codes." },
        { name: "Solar Heat Gain Coefficient", status: "pass", notes: "Compliant." },
      ]
    }
  ];

  const getDisciplineIcon = (discipline: string) => {
    switch(discipline) {
      case 'MEP': return <Wind size={16} />;
      case 'Structural': return <Layers size={16} />;
      case 'Architecture': return <Box size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Approved': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'In Review': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Awaiting Fix': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const activeReview = reviews.find(r => r.id === selectedReview);

  return (
    <div className="w-full min-h-[calc(100vh-2rem)] pb-12 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileSearch className="text-blue-500" />
            Technical & Engineering Reviews
          </h1>
          <p className="text-gray-500 mt-1">Deep-dive technical evaluations and criteria assessments.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left Column: Review List */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          {reviews.map((review, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={review.id}
              onClick={() => setSelectedReview(review.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedReview === review.id 
                  ? 'bg-white border-blue-300 shadow-md ring-1 ring-blue-500/20' 
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {review.id}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusStyle(review.status)}`}>
                  {review.status}
                </span>
              </div>
              
              <h3 className={`font-bold text-sm leading-snug mb-3 ${selectedReview === review.id ? 'text-blue-600' : 'text-gray-900'}`}>
                {review.title}
              </h3>
              
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  {getDisciplineIcon(review.discipline)} {review.discipline}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {review.date}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column: Detailed Criteria */}
        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            {activeReview && (
              <motion.div
                key={activeReview.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full"
              >
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Technical Review Criteria
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{activeReview.title}</h2>
                  <p className="text-sm text-gray-500 font-medium">Submitted by {activeReview.author}</p>
                </div>

                <div className="p-6 flex-1">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-blue-500" />
                    Evaluation Checklist
                  </h3>
                  
                  <div className="space-y-4">
                    {activeReview.criteria.map((criterion, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-colors">
                        <div className="pt-0.5">
                          {criterion.status === 'pass' 
                            ? <CheckCircle2 size={20} className="text-emerald-500" />
                            : <XCircle size={20} className="text-red-500" />
                          }
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm mb-1">{criterion.name}</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100/50 mt-2">
                            {criterion.notes}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex items-center gap-4 rounded-b-2xl">
                  {activeReview.status !== 'Approved' && (
                    <>
                      <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors text-sm">
                        Submit Final Review
                      </button>
                      <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                        <MessageSquareText size={16} />
                        Add Comment
                      </button>
                    </>
                  )}
                  {activeReview.status === 'Approved' && (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg">
                      <CheckCircle2 size={18} />
                      Review Fully Approved
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
