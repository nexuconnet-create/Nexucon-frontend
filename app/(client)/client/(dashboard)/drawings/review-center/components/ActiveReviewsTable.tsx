'use client';

import React from 'react';
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface ActiveReviewsTableProps {
  onOpenDrawer: () => void;
}

export default function ActiveReviewsTable({ onOpenDrawer }: ActiveReviewsTableProps) {
  const reviews = [
    { id: 1, drawing: 'Foundation Layout.pdf', discipline: 'Structural', reviewer: 'Michael Adeyemi', status: 'In Review', date: 'Jun 22' },
    { id: 2, drawing: 'Building Elevations.pdf', discipline: 'Architectural', reviewer: 'Sarah Williams', status: 'In Review', date: 'Jun 21' },
    { id: 3, drawing: 'Electrical layout.pdf', discipline: 'Electrical', reviewer: 'James Ibrahim', status: 'Awaiting Feedback', date: 'Jun 23' },
    { id: 4, drawing: 'HVAC Layout.pdf', discipline: 'Mechanical', reviewer: 'Daniel Okoro', status: 'Under Review', date: 'Jun 24' },
    { id: 5, drawing: 'Drainage Layout.pdf', discipline: 'Plumbing', reviewer: 'Samuel Bello', status: 'In Review', date: 'Jun 22' },
  ];

  return (
    <div className="bg-white rounded-[32px] border border-[#022C4F] p-8 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[20px] font-extrabold text-[#022C4F]">Active Reviews</h3>

        {/* Pagination Dots & Arrows */}
        <div className="flex items-center gap-3">
          <button className="w-6 h-6 rounded-full bg-[#022C4F] flex items-center justify-center text-white hover:bg-[#033A6B] transition-colors shadow-sm">
            <ChevronLeft size={14} />
          </button>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
            <div className="w-4 h-2.5 rounded-full bg-[#022C4F]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
          </div>
          <button className="w-6 h-6 rounded-full bg-[#022C4F] flex items-center justify-center text-white hover:bg-[#033A6B] transition-colors shadow-sm">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="bg-[#022C4F] text-white">
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider rounded-l-full">Drawing</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Discipline</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Reviewer</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Status</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Date</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider rounded-r-full">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review, index) => (
              <tr
                key={review.id}
                onClick={onOpenDrawer}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <td className="py-5 px-6 text-[11px] font-bold text-[#0F181F]">{review.drawing}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{review.discipline}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{review.reviewer}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{review.status}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{review.date}</td>
                <td className="py-5 px-6">
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Menu executed successfully!', type: 'success' } })); }} className="w-8 h-8 rounded-full flex items-center justify-center text-[#022C4F] hover:bg-[#022C4F]/10 transition-colors ml-auto">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
