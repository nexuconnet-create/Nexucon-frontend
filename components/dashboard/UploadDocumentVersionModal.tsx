"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, GitCommit, UploadCloud, CheckCircle, HardDrive, FileText, Sparkles, User, Tag, FileDiff } from 'lucide-react';
import { Document, createDocumentVersion } from '@/services/documents';

interface UploadDocumentVersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSuccess?: () => void;
}

export default function UploadDocumentVersionDrawer({
  isOpen,
  onClose,
  document,
  onSuccess
}: UploadDocumentVersionDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [versionLabel, setVersionLabel] = useState('v2.0');
  const [changesSummary, setChangesSummary] = useState('');
  const [authorName, setAuthorName] = useState('Senior Regulatory Architect / Engineer');
  const [authorRole, setAuthorRole] = useState('Lead Review Team');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileFormat, setFileFormat] = useState('PDF');
  const [fileSize, setFileSize] = useState('12.4 MB');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (document) {
      // Suggest next version label
      const curr = document.current_version || 'v1.0';
      const match = curr.match(/v?(\d+)(\.(\d+))?/i);
      if (match) {
        const major = parseInt(match[1], 10);
        const minor = match[3] ? parseInt(match[3], 10) : 0;
        setVersionLabel(`v${major}.${minor + 1}`);
      } else {
        setVersionLabel('v2.0');
      }
    }
  }, [document, isOpen]);

  if (!isOpen || !document) return null;

  const handleFileSelection = (f: File) => {
    setSelectedFile(f);
    const ext = f.name.split('.').pop()?.toUpperCase() || 'PDF';
    setFileFormat(ext);

    const mb = f.size / (1024 * 1024);
    setFileSize(mb >= 1 ? `${mb.toFixed(1)} MB` : `${(f.size / 1024).toFixed(1)} KB`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('version_label', versionLabel);
        formData.append('changes_summary', changesSummary || 'Updated structural specifications and engineering notes.');
        formData.append('author_name', authorName);
        formData.append('author_role', authorRole);
        formData.append('file_size', fileSize);

        await createDocumentVersion(document.id, formData);
      } else {
        await createDocumentVersion(document.id, {
          version_label: versionLabel,
          changes_summary: changesSummary || 'Updated clauses, engineering notes, and compliance revisions.',
          author_name: authorName,
          author_role: authorRole,
          file_size: fileSize || document.file_size,
          file_url: document.file_url
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Revision ${versionLabel} successfully uploaded and recorded in Cloudflare R2!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const respData = err.response?.data;
      let msg = 'Failed to push document revision';
      if (typeof respData === 'string') {
        msg = respData;
      } else if (respData?.message) {
        msg = respData.message;
      } else if (respData?.error) {
        msg = respData.error;
      } else if (respData && typeof respData === 'object') {
        const firstErr = Object.entries(respData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ');
        if (firstErr) msg = firstErr;
      }
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-white shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <GitCommit size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#022C4F]">Push Document Revision</h2>
              <p className="text-xs text-slate-500 truncate max-w-[320px]">{document.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Target Document Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Target Document</span>
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Current: {document.current_version}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 leading-snug">{document.title}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Ref: {document.document_reference} • Folder: {document.folder}</p>
          </div>

          {/* Version Tag & Author Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                New Version Tag <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder="e.g. v2.1"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Author Role
              </label>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Lead Review Team">Lead Review Team</option>
                <option value="Principal Architect">Principal Architect</option>
                <option value="Lead Structural Engineer">Lead Structural Engineer</option>
                <option value="Senior MEP Consultant">Senior MEP Consultant</option>
                <option value="Regulatory Inspector">Regulatory Inspector</option>
              </select>
            </div>
          </div>

          {/* Author Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Author / Submitting Desk Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Arc. Folashade Okonjo"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Revision Changes Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Revision Changes Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={changesSummary}
              onChange={(e) => setChangesSummary(e.target.value)}
              placeholder="Detail design alterations, code conformance updates, or structural changes from the previous version..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* Drag & Drop File Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              New Revision File (.PDF, .DWG, .DXF, .DOCX, .XLSX)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.dwg,.dxf,.docx,.xlsx,.ifc,.rvt"
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : selectedFile 
                    ? 'border-emerald-300 bg-emerald-50/30' 
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5 shadow-sm">
                <UploadCloud size={22} />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-xs font-black text-emerald-800">{selectedFile.name}</p>
                  <p className="text-[11px] text-emerald-600 mt-1">{fileSize} • {fileFormat} Format</p>
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                    Ready for Ingestion
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-700">Click to browse or drag and drop new revision file</p>
                  <p className="text-[10px] text-slate-400 mt-1">Direct stream to Cloudflare R2 bucket: <span className="font-mono text-blue-600">nexucondocument</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Storage Vault Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <HardDrive size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Storage Target: Cloudflare R2</p>
              <p className="text-[11px] text-slate-500 font-mono">
                projects/{document.project_reference || 'PRJ'}/revisions/{versionLabel}
              </p>
            </div>
          </div>

          {/* Action Footer (Inside form) */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading to R2...</span>
                </>
              ) : (
                <>
                  <GitCommit size={15} />
                  <span>Push Version {versionLabel}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </>
  );
}
