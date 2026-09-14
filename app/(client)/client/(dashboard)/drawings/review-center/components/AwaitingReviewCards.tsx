'use client';

import React from 'react';
import { Document } from '@/services/documents';

interface AwaitingReviewCardsProps {
  documents: Document[];
  onOpenDrawer: (doc: Document) => void;
  onOpenCommentDrawer?: (doc: Document) => void;
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
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function AwaitingReviewCards({ documents, onOpenDrawer, onOpenCommentDrawer }: AwaitingReviewCardsProps) {
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-[32px] border border-[#022C4F] p-8 shadow-sm flex flex-col h-full justify-center text-center">
        <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-3">Awaiting Your Review</h3>
        <p className="text-[12px] font-medium text-gray-500">No drawings awaiting your review yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {documents.map((doc) => (
        <div key={doc.id} className="bg-white rounded-[32px] border border-[#022C4F] p-8 shadow-sm flex flex-col">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Awaiting Your Review</h3>

          <h4 className="text-[14px] font-extrabold text-[#022C4F] mb-4">{doc.title || '—'}</h4>

          <div className="space-y-3 mb-8">
            <div className="text-[11px]">
              <span className="font-extrabold text-[#0F181F]">Submitted By:</span>{' '}
              <span className="font-medium text-gray-500">{doc.uploader_name || '—'}</span>
            </div>
            <div className="text-[11px]">
              <span className="font-extrabold text-[#0F181F]">Discipline:</span>{' '}
              <span className="font-medium text-gray-500">{doc.discipline || '—'}</span>
            </div>
            <div className="text-[11px]">
              <span className="font-extrabold text-[#0F181F]">Project:</span>{' '}
              <span className="font-medium text-gray-500">{doc.project_name || '—'}</span>
            </div>
            <div className="text-[11px]">
              <span className="font-extrabold text-[#0F181F]">Submitted:</span>{' '}
              <span className="font-medium text-gray-500">{formatDate(doc.created_at)}</span>
            </div>
            <div className="text-[11px]">
              <span className="font-extrabold text-[#0F181F]">Version:</span>{' '}
              <span className="font-medium text-gray-500">{doc.current_version || '—'}</span>
            </div>
            <div className="text-[11px]">
              <span className="font-extrabold text-[#0F181F]">Status:</span>{' '}
              <span className="font-medium text-gray-500">{statusLabel[doc.status] || doc.status}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenDrawer(doc); }}
              className="flex-1 py-3 border border-[#022C4F] text-[#022C4F] rounded-xl text-[10px] font-bold hover:bg-gray-50 transition-colors shadow-sm text-center"
            >
              Start Review
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onOpenCommentDrawer) onOpenCommentDrawer(doc); }}
              className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[10px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm text-center"
            >
              Add Comment
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenDrawer(doc); }}
              className="flex-1 py-3 bg-[#0F181F] text-white rounded-xl text-[10px] font-bold hover:bg-[#1A2630] transition-colors shadow-sm text-center"
            >
              Request Revision
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
