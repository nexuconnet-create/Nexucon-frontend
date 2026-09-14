"use client";

import React, { useEffect, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import { getDocuments, Document } from "@/services/documents";

const statusLabel: Record<Document['status'], string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Awaiting Review',
  UNDER_REVIEW: 'In Progress',
  CHANGES_REQUESTED: 'Changes Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  EXPIRING_SOON: 'Expiring Soon',
  ARCHIVED: 'Archived',
};

export default function ReviewsTab() {
  // Real documents currently in a review workflow. No fabricated review
  // sessions — the review pipeline is the document review status itself.
  const [reviews, setReviews] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await getDocuments();
      setReviews(docs.filter((d) =>
        d.status === 'PENDING_REVIEW' || d.status === 'UNDER_REVIEW' || d.status === 'CHANGES_REQUESTED' || d.status === 'REJECTED'
      ));
    } catch (err) {
      setError("Reviews could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialLoad = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const docs = await getDocuments();
        if (cancelled) return;
        setReviews(docs.filter((d) =>
          d.status === 'PENDING_REVIEW' || d.status === 'UNDER_REVIEW' || d.status === 'CHANGES_REQUESTED' || d.status === 'REJECTED'
        ));
      } catch (err) {
        if (!cancelled) setError("Reviews could not be loaded.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    initialLoad();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-3">Design Reviews & Peer Review Center</h3>
          <p className="text-[11px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
            Manage design reviews, peer-review sessions, consultant endorsements, client approvals, and collaborative feedback to ensure project quality before execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2.5 border border-[#022C4F] rounded-full text-[#022C4F] hover:bg-gray-50 transition-colors" title="Refresh reviews">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <Button variant="primary">
            Go to Peer Review Center
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="border border-[#022C4F] rounded-[32px] p-12 text-center text-[12px] font-medium text-gray-500">
          Loading reviews…
        </div>
      )}

      {!isLoading && error && (
        <div className="border border-rose-200 bg-rose-50/60 rounded-[32px] p-12 text-center">
          <p className="text-[12px] font-bold text-rose-700">{error}</p>
          <button onClick={load} className="mt-3 px-4 py-2 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold">Retry</button>
        </div>
      )}

      {!isLoading && !error && reviews.length === 0 && (
        <div className="border border-[#022C4F] rounded-[32px] p-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-[#022C4F]/40" />
          <p className="text-[13px] font-bold text-[#022C4F]">No documents are in review right now.</p>
          <p className="text-[11px] text-gray-500 mt-1">Documents submitted for review will appear here with their live review status.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reviews.map((doc) => (
          <div key={doc.id} className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm h-fit">
            <div className="flex justify-between items-start mb-8 gap-4">
              <h4 className="text-[15px] font-bold text-[#022C4F] pr-4">{doc.title}</h4>
              <span className="text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 border bg-[#E1F5FE] text-[#0277BD] border-[#B3E5FC] font-mono">
                {doc.current_version}
              </span>
            </div>

            <div className="flex flex-col gap-5 mb-8">
              <div className="flex items-center">
                <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Project:</span>
                <span className="text-[11px] text-gray-600 font-medium">{doc.project_name || '—'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Discipline:</span>
                <span className="text-[11px] text-gray-600 font-medium">{doc.discipline}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Document Type:</span>
                <span className="text-[11px] text-gray-600 font-medium">{doc.document_type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Submitted By:</span>
                <span className="text-[11px] text-gray-600 font-medium">{doc.uploader_name || '—'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Status:</span>
                <span className={`text-[11px] font-medium ${
                  doc.status === 'REJECTED' || doc.status === 'CHANGES_REQUESTED' ? 'text-rose-600' :
                  doc.status === 'UNDER_REVIEW' ? 'text-amber-600' : 'text-gray-600'
                }`}>{statusLabel[doc.status]}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Reference:</span>
                <span className="text-[11px] text-gray-600 font-medium font-mono">{doc.document_reference}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-auto pt-4 max-w-[80%]">
              <button
                onClick={() => { if (doc.file_url) window.open(doc.file_url, '_blank'); }}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Open Document
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: doc.file_url ? 'Review opened in Documents module.' : 'No file attached to this document.', type: doc.file_url ? 'success' : 'warning' } })); }}
                className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
              >
                Add Feedback
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
