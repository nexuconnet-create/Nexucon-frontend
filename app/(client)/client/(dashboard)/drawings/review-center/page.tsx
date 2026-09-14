'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Loader2, FileText } from 'lucide-react';
import ReviewMetrics from './components/ReviewMetrics';
import ActiveReviewsTable from './components/ActiveReviewsTable';
import AwaitingReviewCards from './components/AwaitingReviewCards';
import ReviewDrawingDrawer from './components/ReviewDrawingDrawer';
import AddCommentDrawer from './components/AddCommentDrawer';
import AssignReviewerDrawer from './components/AssignReviewerDrawer';
import SendReminderDrawer from './components/SendReminderDrawer';
import Button from '@/components/ui/Button';
import ProfilePill from '@/components/ui/ProfilePill';
import { getDocuments, Document } from '@/services/documents';

const isDrawingType = (d: Document) =>
  d.document_type === 'SUBMITTED_DRAWING' || d.document_type === 'DRAWING';

const isInReview = (d: Document) =>
  d.status === 'PENDING_REVIEW' || d.status === 'UNDER_REVIEW';

export default function DrawingReviewCenterPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [isAssignReviewerDrawerOpen, setIsAssignReviewerDrawerOpen] = useState(false);
  const [isSendReminderDrawerOpen, setIsSendReminderDrawerOpen] = useState(false);

  // Real drawing documents from the documents service. No fabricated
  // drawings, submitters, or dates — everything on this page is derived
  // from what the backend actually returns.
  const [drawings, setDrawings] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const docs = await getDocuments();
        if (cancelled) return;
        setDrawings(docs.filter(isDrawingType));
      } catch (err) {
        if (!cancelled) setError('Drawing reviews could not be loaded.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Silent refresh after a review decision, so lists update without a
  // full-page loading flash.
  const refresh = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDrawings(docs.filter(isDrawingType));
    } catch (err) {
      // Keep the previously loaded data on a failed refresh.
    }
  }, []);

  const retryLoad = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await getDocuments();
      setDrawings(docs.filter(isDrawingType));
    } catch (err) {
      setError('Drawing reviews could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  const inReviewDocuments = drawings.filter(isInReview);

  const openReviewDrawer = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDrawerOpen(true);
  };

  const openCommentDrawer = (doc: Document) => {
    setSelectedDocument(doc);
    setIsCommentDrawerOpen(true);
  };

  const openAssignReviewerDrawer = () => {
    setIsAssignReviewerDrawerOpen(true);
  };

  const openSendReminderDrawer = () => {
    setIsSendReminderDrawerOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-8 animate-in fade-in slide-in-from-bottom-8 duration-500">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[32px] font-extrabold text-[#022C4F] mb-3 tracking-tight">Drawing Review Center</h1>
          <p className="text-[12px] text-[#0F181F] font-medium leading-relaxed">
            Collaborate with architects, engineers, consultants, and reviewers to evaluate drawings, resolve comments, track annotations, and manage approvals before project sign-off.
          </p>
        </div>

        <div className="flex items-center gap-4 ml-auto shrink-0">
          {/* Search Icon */}
          <button className="w-12 h-12 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm">
            <Search size={20} />
          </button>

          {/* Notifications */}
          <button className="relative w-12 h-12 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#0F181F] rounded-full"></span>
          </button>

          {/* Profile Pill */}
          <ProfilePill />
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex justify-end mb-10 gap-4">
        <Button
          variant="outline"
          onClick={openAssignReviewerDrawer}
        >
          Add Reviewer
        </Button>
        <Button
          variant="primary"
          onClick={openSendReminderDrawer}
        >
          Send Reminder
        </Button>
      </div>

      {isLoading && (
        <div className="border border-[#022C4F] rounded-[32px] p-12 text-center">
          <Loader2 size={28} className="mx-auto mb-3 text-[#022C4F] animate-spin" />
          <p className="text-[12px] font-medium text-gray-500">Loading drawing reviews…</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="border border-rose-200 bg-rose-50/60 rounded-[32px] p-12 text-center">
          <p className="text-[12px] font-bold text-rose-700">{error}</p>
          <button onClick={retryLoad} className="mt-3 px-4 py-2 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Top Metrics Grid — computed from the real fetched drawings */}
          <ReviewMetrics documents={drawings} />

          {inReviewDocuments.length === 0 ? (
            <div className="border border-[#022C4F] rounded-[32px] p-12 text-center">
              <FileText size={32} className="mx-auto mb-3 text-[#022C4F]/40" />
              <p className="text-[13px] font-bold text-[#022C4F]">No drawings are currently in review.</p>
              <p className="text-[11px] text-gray-500 mt-1">
                Drawings submitted for review will appear here with their live review status.
              </p>
            </div>
          ) : (
            /* Main Split Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <ActiveReviewsTable documents={inReviewDocuments} onOpenDrawer={openReviewDrawer} />
              </div>

              <div className="lg:col-span-1">
                <AwaitingReviewCards
                  documents={inReviewDocuments}
                  onOpenDrawer={openReviewDrawer}
                  onOpenCommentDrawer={openCommentDrawer}
                />
              </div>
            </div>
          )}
        </>
      )}

      <ReviewDrawingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        drawing={selectedDocument}
        onReviewSubmitted={refresh}
      />

      <AddCommentDrawer
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        drawing={selectedDocument}
      />

      <AssignReviewerDrawer
        isOpen={isAssignReviewerDrawerOpen}
        onClose={() => setIsAssignReviewerDrawerOpen(false)}
        drawing={selectedDocument}
      />

      <SendReminderDrawer
        isOpen={isSendReminderDrawerOpen}
        onClose={() => setIsSendReminderDrawerOpen(false)}
        drawing={selectedDocument}
      />
    </div>
  );
}
