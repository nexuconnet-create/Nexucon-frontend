"use client";

import React, { useState, useRef } from 'react';
import { X, GitCommit, UploadCloud, CheckCircle } from 'lucide-react';
import { Document, createDocumentVersion } from '@/services/documents';

interface UploadDocumentVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSuccess?: () => void;
}

export default function UploadDocumentVersionModal({
  isOpen,
  onClose,
  document,
  onSuccess
}: UploadDocumentVersionModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [versionLabel, setVersionLabel] = useState('v2.0');
  const [changesSummary, setChangesSummary] = useState('');
  const [authorName, setAuthorName] = useState('Senior Project Architect');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !document) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
        formData.append('changes_summary', changesSummary || 'Updated clauses and statutory engineering annotations.');
        formData.append('author_name', authorName);
        formData.append('author_role', 'Review Team');

        await createDocumentVersion(document.id, formData);
      } else {
        await createDocumentVersion(document.id, {
          version_label: versionLabel,
          changes_summary: changesSummary || 'Updated contractual terms and specifications.',
          author_name: authorName,
          author_role: 'Review Team',
          file_size: document.file_size,
          file_url: document.file_url
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Revision ${versionLabel} uploaded and recorded in Cloudflare R2!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to push revision';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GitCommit size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Push Document Revision</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">{document.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">New Version Tag</label>
            <input
              type="text"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              required
              placeholder="e.g. v2.1"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Author / Submitting Desk</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Revision Changes Summary</label>
            <textarea
              rows={3}
              value={changesSummary}
              onChange={(e) => setChangesSummary(e.target.value)}
              placeholder="Detail changes made from previous revision..."
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.dwg,.dxf,.docx,.xlsx"
          />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-200 rounded-2xl p-4 text-center hover:border-blue-400 bg-blue-50/30 transition-colors cursor-pointer"
          >
            <UploadCloud className="mx-auto text-blue-600 mb-1" size={24} />
            {selectedFile ? (
              <p className="text-xs font-black text-slate-800">{selectedFile.name}</p>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-700">Click to Select New Revision File</p>
                <p className="text-[10px] text-slate-400">Stream directly to Cloudflare R2 (nexucondocument)</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <GitCommit size={15} /> {isSubmitting ? 'Uploading to R2...' : 'Push Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
