import React, { useState } from 'react';
import { X, Check, ZoomIn, ZoomOut, Clock } from 'lucide-react';
import { CustomSelect } from "@/components/CustomSelect";

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

        <div className="flex-1 overflow-hidden flex flex-col p-6 lg:p-8">
          <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-2 pr-8 shrink-0">Review Drawing Submission</h2>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-4 shrink-0">
            Review project drawings, add comments, annotate design elements, approve revisions, or request changes before the project progresses to the next stage.
          </p>

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-3 shrink-0">Drawing Information</h3>

          <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-5 shrink-0">
            <div>
              <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Drawing Name</p>
              <p className="text-[11px] text-gray-600 font-medium">Structural Foundation Layout - Revision 03</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Discipline</p>
              <p className="text-[11px] text-gray-600 font-medium">Structural Engineering</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Project</p>
              <p className="text-[11px] text-gray-600 font-medium">Victoria Heights Residential Estate</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Submitted by</p>
              <p className="text-[11px] text-gray-600 font-medium">Sarah Okafor — Civil Engineer</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Submission Date</p>
              <p className="text-[11px] text-gray-600 font-medium">June 17, 2026 • 10:42 AM</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Version</p>
              <p className="text-[11px] text-gray-600 font-medium">V3.0</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-[#0F181F] mb-0.5">Status</p>
              <p className="text-[11px] text-gray-600 font-medium">Awaiting Client Review</p>
            </div>
          </div>

          {/* New Approval Deadline Block */}
          <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl p-4 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-orange-600" />
              <h4 className="text-[12px] font-extrabold text-orange-900">Approval Deadline</h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold text-orange-800/70 mb-1">Review Due By</p>
                <p className="text-[12px] font-bold text-orange-900">June 25, 2026</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-orange-800/70 mb-1">Days Remaining</p>
                <p className="text-[12px] font-bold text-orange-900">3 Days</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-orange-800/70 mb-1">Schedule Impact if Delayed</p>
                <p className="text-[12px] font-bold text-red-600">+14 Days</p>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-auto flex flex-col justify-end">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsPreviewModalOpen(true)}
                className="w-full py-3.5 bg-[#022C4F] text-white text-[12px] font-bold rounded-xl hover:bg-[#033A6B] transition-colors shadow-md"
              >
                Preview Drawings
              </button>
              <button
                onClick={() => setIsSuccessModalOpen(true)}
                className="w-full py-3.5 bg-green-600 text-white text-[12px] font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md"
              >
                Approve Submission
              </button>
              <button
                onClick={() => setIsChangeRequestModalOpen(true)}
                className="w-full py-3.5 bg-red-50 text-red-600 border border-red-200 text-[12px] font-bold rounded-xl hover:bg-red-100 transition-colors shadow-sm"
              >
                Request Changes
              </button>
            </div>
          </div>
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
      {isPreviewModalOpen && (
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
                <img
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784473289/image_1_lnspma.png"
                  alt="Drawing Preview"
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
                <h2 className="text-white text-lg font-bold mb-1">Structural Foundation Layout – Revision 03</h2>
                <p className="text-gray-400 text-sm">Victoria Heights Residential Estate</p>
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
                <label className="block text-[11px] font-bold text-[#0F181F] mb-2">Drawing Annotation / Element Reference</label>
                <input
                  type="text"
                  placeholder="e.g., Grid line A4, Section view 3"
                  className="w-full p-3.5 rounded-xl border border-gray-300 text-[12px] focus:outline-none focus:border-[#022C4F] placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F181F] mb-2">Detailed Feedback</label>
                <textarea
                  placeholder="Describe the required changes specifically..."
                  className="w-full h-32 rounded-xl border border-gray-300 p-4 text-[12px] focus:outline-none focus:border-[#022C4F] resize-none placeholder:text-gray-400"
                ></textarea>
              </div>

              <button
                onClick={() => {
                  setIsChangeRequestModalOpen(false);
                  setIsSuccessModalOpen(true);
                }}
                className="w-full py-4 bg-black text-white text-[13px] font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-md mt-2"
              >
                Submit Change Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
