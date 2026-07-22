import React from 'react';

export default function CommentOnDocumentModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="bg-white rounded-[32px] p-12 w-full max-w-[900px] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300 z-10">
        
        {/* Header section with button */}
        <div className="flex justify-between items-start mb-12">
          <div className="max-w-[500px]">
            <h2 className="text-[28px] font-extrabold text-[#022C4F] mb-3">
              Comment on Document
            </h2>
            <p className="text-[12px] text-gray-600 leading-relaxed">
              Share feedback, request revisions, ask technical questions, or collaborate with project team members by adding comments directly to a project document or drawing.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-10 py-3.5 rounded-full font-bold transition-colors text-[13px] shadow-sm shrink-0"
          >
            Post Comment
          </button>
        </div>

        {/* Document Information */}
        <div className="mb-12">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Document Information</h3>
          
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Document</span>
              <span className="text-[12px] text-gray-500">Architectural Design Package - V4.0</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Category</span>
              <span className="text-[12px] text-gray-500">Architectural Drawings</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Current Version</span>
              <span className="text-[12px] text-gray-500">V4.0</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Uploaded By</span>
              <span className="text-[12px] text-gray-500">Olivia Thompson</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <span className="text-[12px] text-gray-500">Under Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Comment */}
        <div className="flex flex-col">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-4">Add Comment</h3>
          
          <label className="block text-[11px] font-extrabold text-[#022C4F] mb-3">Comment</label>
          <textarea 
            className="w-full h-[250px] rounded-[16px] border border-[#022C4F] p-5 text-[14px] resize-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"
          ></textarea>
        </div>

      </div>
    </div>
  );
}
