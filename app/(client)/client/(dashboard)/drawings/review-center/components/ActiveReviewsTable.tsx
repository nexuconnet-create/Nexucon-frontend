'use client';

import React from 'react';
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document } from '@/services/documents';

interface ActiveReviewsTableProps {
  documents: Document[];
  onOpenDrawer: (doc: Document) => void;
}

const statusLabel: Record<Document['status'], string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Awaiting Review',
  UNDER_REVIEW: 'Under Review',
  CHANGES_REQUESTED: 'Changes Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  EXPIRING_SOON: 'Expiring Soon',
  ARCHIVED: 'Archived',
};

const formatDate = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ActiveReviewsTable({ documents, onOpenDrawer }: ActiveReviewsTableProps) {
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
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Submitted By</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Status</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Date</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider rounded-r-full">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 px-6 text-center text-[12px] font-medium text-gray-500">
                  No drawings are currently in review.
                </td>
              </tr>
            )}
            {documents.map((doc) => (
              <tr
                key={doc.id}
                onClick={() => onOpenDrawer(doc)}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <td className="py-5 px-6 text-[11px] font-bold text-[#0F181F]">{doc.title || '—'}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{doc.discipline || '—'}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{doc.uploader_name || '—'}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{statusLabel[doc.status] || doc.status}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{formatDate(doc.created_at)}</td>
                <td className="py-5 px-6">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenDrawer(doc); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#022C4F] hover:bg-[#022C4F]/10 transition-colors ml-auto"
                    title={`Open ${doc.title || 'drawing'}`}
                  >
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
