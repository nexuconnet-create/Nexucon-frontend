'use client';

import React from 'react';

interface AwaitingReviewCardsProps {
  onOpenDrawer: () => void;
  onOpenCommentDrawer?: () => void;
}

export default function AwaitingReviewCards({ onOpenDrawer, onOpenCommentDrawer }: AwaitingReviewCardsProps) {
  const awaitingReviews = [
    {
      id: 1,
      drawing: 'Foundation Layout.pdf',
      submittedBy: 'Michael Adeyemi',
      priority: 'High',
      priorityColor: 'text-red-500',
      submittedDate: 'Today • 10:42 AM',
      progress: '3 of 4 Reviewers Completed',
    },
    {
      id: 2,
      drawing: 'Building Elevations.pdf',
      submittedBy: 'Sarah Okafor',
      priority: 'Medium',
      priorityColor: 'text-orange-500',
      submittedDate: 'Yesterday',
      progress: '3 of 4 Reviewers Completed',
    }
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {awaitingReviews.map((review) => (
        <div key={review.id} className="bg-white rounded-[32px] border border-[#022C4F] p-8 shadow-sm flex flex-col">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Awaiting Your Review</h3>
          
          <h4 className="text-[14px] font-extrabold text-[#022C4F] mb-4">{review.drawing}</h4>
          
          <div className="space-y-3 mb-8">
            <div className="text-[11px]">
              <span className="font-extrabold text-[#0F181F]">Submitted By:</span>{' '}
              <span className="font-medium text-gray-500">{review.submittedBy}</span>
            </div>
            <div className="text-[11px]">
              <span className="font-extrabold text-[#0F181F]">Priority:</span>{' '}
              <span className={`font-bold ${review.priorityColor}`}>{review.priority}</span>
            </div>
            <div className="text-[11px]">
              <span className="font-extrabold text-[#0F181F]">Submitted:</span>{' '}
              <span className="font-medium text-gray-500">{review.submittedDate}</span>
            </div>
            <div className="text-[11px]">
              <span className="font-extrabold text-[#0F181F]">Review Progress:</span>{' '}
              <span className="font-medium text-gray-500">{review.progress}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenDrawer(); }} 
              className="flex-1 py-3 border border-[#022C4F] text-[#022C4F] rounded-xl text-[10px] font-bold hover:bg-gray-50 transition-colors shadow-sm text-center"
            >
              Start Review
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onOpenCommentDrawer) onOpenCommentDrawer(); }} 
              className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[10px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm text-center"
            >
              Add Comment
            </button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Request Revision executed successfully!', type: 'success' } })); }} className="flex-1 py-3 bg-[#0F181F] text-white rounded-xl text-[10px] font-bold hover:bg-[#1A2630] transition-colors shadow-sm text-center">
              Request Revision
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
