"use client";

import React, { useState } from 'react';
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
  const [versionLabel, setVersionLabel] = useState('v2.0');
  const [changesSummary, setChangesSummary] = useState('');
  const [authorName, setAuthorName] = useState('Legal Team');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !document) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createDocumentVersion(document.id, {
        version_label: versionLabel,
        changes_summary: changesSummary || 'Updated contractual terms and specifications.',
        author_name: authorName,
        author_role: 'Review Team',
        file_size: document.file_size,
        file_url: document.file_url
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Revision ${versionLabel} uploaded for ${document.title}!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to push revision';
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
              <p className="text-xs text-slate-500">{document.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
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
              value={changesSummary}
              onChange={(e) => setChangesSummary(e.target.value)}
              rows={3}
              required
              placeholder="Describe modifications made in this document revision..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <UploadCloud size={14} /> {isSubmitting ? 'Uploading...' : 'Commit Revision'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
