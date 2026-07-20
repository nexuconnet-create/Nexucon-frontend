import React, { useState, useRef } from "react";
import { Search, Bell, MoreHorizontal, CheckCircle, Hourglass, FileText, Upload, X, ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DrawingPreviewModal from "@/components/dashboard/DrawingPreviewModal";
import DocumentPreviewModal from "@/components/dashboard/DocumentPreviewModal";
import Button from "@/components/ui/Button";


export default function DocumentsTab({ uploadedFiles, isDragging, handleDragOver, handleDragLeave, handleDrop, handleFileSelect, fileInputRef, removeFile, setPreviewDocument }: any) {
  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-3">Project Documents</h3>
              <p className="text-[11px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
                Manage design documents, reports, specifications, approvals, and project deliverables.<br />
                Share files with team members, reviewers, and consultants while maintaining version history and review records.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search Documents"
                  className="w-full border border-[#022C4F] rounded-full py-2.5 px-6 text-[11px] text-[#022C4F] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#022C4F] transition-shadow"
                />
              </div>
              <Button 
                variant="primary"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'New executed successfully!', type: 'success' } })); }}
              >
                New
              </Button>
            </div>
          </div>

          <div
            className={`w-full rounded-[32px] min-h-[450px] flex flex-col p-8 transition-colors ${uploadedFiles.length === 0
                ? (isDragging ? 'bg-[#033A6B] border-2 border-dashed border-white/50 cursor-copy' : 'bg-[#022C4F] border-2 border-dashed border-transparent hover:border-white/20 cursor-pointer')
                : 'bg-white border border-gray-200'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (uploadedFiles.length === 0) {
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileSelect}
            />

            {uploadedFiles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white">
                <div className={`mb-6 transition-transform ${isDragging ? 'scale-110 opacity-100' : 'opacity-90'}`}>
                  {isDragging ? (
                    <Upload width="72" height="72" strokeWidth={1.5} />
                  ) : (
                    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                    </svg>
                  )}
                </div>
                <p className="text-[11px] font-medium text-gray-300 mb-2">The folder is empty</p>
                <p className="text-[13px] font-bold text-gray-400">
                  {isDragging ? 'Drop files now' : 'Drop file here or click to upload'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full w-full">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[15px] font-bold text-[#022C4F]">Uploaded Documents</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#022C4F] rounded-lg text-[11px] font-bold transition-colors border border-gray-200"
                  >
                    <Upload size={14} /> Add More Files
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploadedFiles.map((file: File, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors group cursor-pointer"
                        onClick={() => {
                          setPreviewDocument(file);
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#022C4F]/10 flex items-center justify-center text-[#022C4F] shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-[#0F181F] truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100 shrink-0"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
  );
}
