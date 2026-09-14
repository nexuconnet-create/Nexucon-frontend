import React, { useEffect, useState } from 'react';
import { X, Check, ZoomIn, ZoomOut, Clock, FileText } from 'lucide-react';
import { CustomSelect } from "@/components/CustomSelect";
import { getDocuments, reviewDocument, Document } from "@/services/documents";

interface ReviewDrawingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewDrawingDrawer({ isOpen, onClose }: ReviewDrawingDrawerProps) {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false);
  const [issueCategory, setIssueCategory] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real drawing submissions awaiting review — nothing is fabricated here.
  const [drawings, setDrawings] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const docs = await getDocuments();
        if (cancelled) return;
        const pending = docs.filter((d) =>
          (d.document_type === 'SUBMITTED_DRAWING' || d.document_type === 'DRAWING') &&
          (d.status === 'PENDING_REVIEW' || d.status === 'UNDER_REVIEW')
        );
        setDrawings(pending);
        setSelectedId(pending[0]?.id ?? "");
      } catch (err) {
        if (!cancelled) setError("Drawing submissions could not be loaded.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen]);

  const selected = drawings.find((d) => d.id === selectedId) ?? null;

  const categoryOptions = [
    { value: "architectural", label: "Architectural & Layout" },
    { value: "structural", label: "Structural Integrity" },
    { value: "mep", label: "MEP (Mechanical, Electrical, Plumbing)" },
    { value: "aesthetics", label: "Aesthetics & Materials" },
    { value: "other", label: "Other" }
  ];

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const submitDecision = async (status: 'APPROVED' | 'CHANGES_REQUESTED', comments?: string) => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await reviewDocument(selected.id, { status, comments });
      setIsSuccessModalOpen(true);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Your review could not be submitted. Please try again.', type: 'error' } }));
    } finally {
      setIsSubmitting(false);
      setIsChangeRequestModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#022C4F]/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full sm:h-[calc(100vh-32px)] sm:my-4 sm:mr-4 rounded-[32px] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out z-10 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col p-6 lg:p-8">
          <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-2 pr-8 shrink-0">Review Drawing Submission</h2>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-4 shrink-0">
            Review project drawings, add comments, annotate design elements, approve revisions, or request changes before the project progresses to the next stage.
          </p>

          {isLoading && (
            <div className="flex-1 flex items-center justify-center text-[12px] font-medium text-gray-500 py-12">
              Loading drawing submissions…
            </div>
          )}

          {!isLoading && error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <p className="text-[13px] font-bold text-rose-700 mb-2">{error}</p>
              <button onClick={onClose} className="px-4 py-2 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold">Close</button>
            </div>
          )}

          {!isLoading && !error && drawings.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <FileText size={36} className="text-[#022C4F]/30 mb-4" />
              <p className="text-[14px] font-bold text-[#022C4F] mb-1">No drawings awaiting your review.</p>
              <p className="text-[11px] text-gray-500">Drawing submissions will appear here as soon as they are submitted for review.</p>
            </div>
          )}

          {!isLoading && !error && drawings.length > 0 && selected && (
            <>
              {drawings.length > 1 && (
                <div className="mb-5 shrink-0">
                  <label className="block text-[11px] font-bold text-[#0F181F] mb-2">Drawing Submission</label>
                  <CustomSelect
                    options={drawings.map((d) => ({ value: d.id, label: d.title }))}
                    value={selectedId}
                    onChange={setSelectedId}
                    placeholder="Select a drawing"
                  />
                </div>
              )}

              <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-3 shrink-0">Drawing Information</h3>

              <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-5 shrink-0">
                <div>
                  <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Drawing Name</p>
                  <p className="text-[11px] text-gray-600 font-medium">{selected.title}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Discipline</p>
                  <p className="text-[11px] text-gray-600 font-medium">{selected.discipline}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Project</p>
                  <p className="text-[11px] text-gray-600 font-medium">{selected.project_name || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Submitted by</p>
                  <p className="text-[11px] text-gray-600 font-medium">{selected.uploader_name || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Submission Date</p>
                  <p className="text-[11px] text-gray-600 font-medium">
                    {selected.created_at ? new Date(selected.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Version</p>
                  <p className="text-[11px] text-gray-600 font-medium">{selected.current_version}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Status</p>
                  <p className="text-[11px] text-gray-600 font-medium">
                    {selected.status === 'UNDER_REVIEW' ? 'Under Review' : 'Awaiting Review'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Reference</p>
                  <p className="text-[11px] text-gray-600 font-medium font-mono">{selected.document_reference}</p>
                </div>
              </div>

              <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-4 shrink-0 flex items-start gap-2">
                <Clock size={14} className="text-gray-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                  No approval deadline has been recorded for this submission. Approve or request changes when your review is complete.
                </p>
              </div>

              <div className="flex-1 mt-auto flex flex-col justify-end">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsPreviewModalOpen(true)}
                    disabled={!selected.file_url}
                    className="w-full py-3.5 bg-[#022C4F] text-white text-[12px] font-bold rounded-xl hover:bg-[#033A6B] transition-colors shadow-md disabled:opacity-50"
                  >
                    Preview Drawing
                  </button>
                  <button
                    onClick={() => submitDecision('APPROVED')}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-green-600 text-white text-[12px] font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md disabled:opacity-75"
                  >
                    {isSubmitting ? 'Submitting…' : 'Approve Submission'}
                  </button>
                  <button
                    onClick={() => setIsChangeRequestModalOpen(true)}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-red-50 text-red-600 border border-red-200 text-[12px] font-bold rounded-xl hover:bg-red-100 transition-colors shadow-sm disabled:opacity-75"
                  >
                    Request Changes
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success Modal Overlay */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#022C4F]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-[90%] max-w-md shadow-2xl flex flex-col items-center text-center p-10 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="text-green-600" size={40} />
            </div>
            <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-3">Review Submitted</h2>
            <p className="text-[13px] font-medium text-gray-500 leading-relaxed mb-8">
              Your review and comments have been successfully submitted to the project team. They will be notified immediately.
            </p>
            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                onClose();
              }}
              className="w-full py-4 bg-[#022C4F] text-white text-[13px] font-bold rounded-xl hover:bg-[#033A6B] transition-colors shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal Overlay */}
      {isPreviewModalOpen && selected?.file_url && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#022C4F]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <button
            onClick={() => {
              setIsPreviewModalOpen(false);
              setTimeout(() => {
                setZoomScale(1);
                setPosition({ x: 0, y: 0 });
              }, 300); // Reset zoom and pan after modal closes
            }}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>

          <div className="bg-[#0F181F] rounded-[24px] w-[90%] max-w-5xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden border border-white/10">
            {/* Top: Image Section */}
            <div className="relative w-full h-[65vh] bg-white overflow-hidden p-2 rounded-t-[24px]">
              <div
                className={`w-full h-full rounded-[20px] overflow-hidden flex items-center justify-center ${zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* The real uploaded drawing file — no stock placeholder images. */}
                <img
                  src={selected.file_url}
                  alt={selected.title}
                  className="object-contain w-full h-full"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoomScale})`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Bottom: Details & Controls */}
            <div className="p-8 flex items-center justify-between">
              <div>
                <h2 className="text-white text-lg font-bold mb-1">{selected.title}</h2>
                <p className="text-gray-400 text-sm">{selected.project_name || '—'}</p>
              </div>

              <div className="flex bg-[#022C4F] rounded-lg overflow-hidden border border-white/5 shadow-inner">
                <button
                  onClick={() => setZoomScale(s => Math.min(s + 0.3, 4))}
                  className="px-5 py-3 text-white hover:bg-[#033A6B] transition-colors flex items-center justify-center"
                >
                  <ZoomIn size={20} />
                </button>
                <div className="w-[1px] bg-white/20 my-2"></div>
                <button
                  onClick={() => setZoomScale(s => {
                    const newScale = Math.max(s - 0.3, 0.5);
                    if (newScale <= 1) setPosition({ x: 0, y: 0 });
                    return newScale;
                  })}
                  className="px-5 py-3 text-white hover:bg-[#033A6B] transition-colors flex items-center justify-center"
                >
                  <ZoomOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Request Form Modal */}
      {isChangeRequestModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#022C4F]/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl flex flex-col p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-extrabold text-[#022C4F]">Change Request Form</h2>
              <button
                onClick={() => setIsChangeRequestModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-bold text-[#0F181F] mb-2">Issue Category</label>
                <div className="w-full">
                  <CustomSelect
                    options={categoryOptions}
                    value={issueCategory}
                    onChange={setIssueCategory}
                    placeholder="Select a category"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F181F] mb-2">Detailed Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Describe the required changes specifically..."
                  className="w-full h-32 rounded-xl border border-gray-300 p-4 text-[12px] focus:outline-none focus:border-[#022C4F] resize-none placeholder:text-gray-400"
                ></textarea>
              </div>

              <button
                onClick={() => {
                  const comments = [
                    issueCategory ? `Category: ${categoryOptions.find(c => c.value === issueCategory)?.label ?? issueCategory}` : null,
                    feedback.trim() || null,
                  ].filter(Boolean).join('\n\n') || undefined;
                  submitDecision('CHANGES_REQUESTED', comments);
                }}
                disabled={isSubmitting || !feedback.trim()}
                className="w-full py-4 bg-black text-white text-[13px] font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-md mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting…' : 'Submit Change Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
