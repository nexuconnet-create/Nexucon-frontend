"use client";

import React from "react";

interface UrgentNotificationsProps {
  onReviewClick?: () => void;
  onApproveClick?: () => void;
}

export default function UrgentNotifications({ onReviewClick, onApproveClick }: UrgentNotificationsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#022C4F] flex flex-col shadow-sm h-full">
      <div className="space-y-6 flex-1">

        {/* Notification 1 */}
        <div className="pb-6 border-b border-gray-200">
          <span className="inline-block bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2">
            Urgent
          </span>
          <p className="text-sm font-bold text-[#0F181F] mb-1">
            Submitted by Engr. Okonwo (Structure)
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#6A994E] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
              Due
            </span>
            <span className="text-xs text-[#0F181F] font-bold">Oct 25, 2026</span>
            <span className="text-[11px] text-[#FF9800] font-bold">(1 day remaining)</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onReviewClick}
              className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              Review Document
            </button>
            <button 
              onClick={onApproveClick}
              className="px-5 py-3 bg-[#022C4F] text-white rounded-full text-xs font-bold hover:bg-[#022C4F]/90 transition-colors"
            >
              Approve
            </button>
          </div>
        </div>

        {/* Notification 2 */}
        <div>
          <span className="inline-block bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2">
            Urgent
          </span>
          <p className="text-sm font-bold text-[#022C4F] mb-1">
            BOQ & Cost Estimation
          </p>
          <p className="text-xs text-gray-500 font-medium mb-1">
            Submitted by David Johnson (QS)
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#6A994E] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
              Due
            </span>
            <span className="text-xs text-[#0F181F] font-bold">Oct 26, 2026</span>
            <span className="text-[11px] text-gray-500 font-medium">(2 days remaining)</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onReviewClick}
              className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              Review Document
            </button>
            <button 
              onClick={onApproveClick}
              className="px-5 py-3 bg-[#022C4F] text-white rounded-full text-xs font-bold hover:bg-[#022C4F]/90 transition-colors"
            >
              Approve
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
