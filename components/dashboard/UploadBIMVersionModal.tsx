"use client";

import React, { useState } from 'react';
import { X, GitCommit, UploadCloud, CheckCircle } from 'lucide-react';
import { BIMModel, createBIMVersion } from '@/services/bim';

interface UploadBIMVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: BIMModel | null;
  onSuccess?: () => void;
}

export default function UploadBIMVersionModal({
  isOpen,
  onClose,
  model,
  onSuccess
}: UploadBIMVersionModalProps) {
  const [versionLabel, setVersionLabel] = useState('v2.0');
  const [changesSummary, setChangesSummary] = useState('');
  const [authorName, setAuthorName] = useState('Sarah Jenkins');
  const [authorRole, setAuthorRole] = useState('Lead Architect');
  const [statsAdded, setStatsAdded] = useState(45);
  const [statsModified, setStatsModified] = useState(20);
  const [statsRemoved, setStatsRemoved] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !model) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createBIMVersion(model.id, {
        version_label: versionLabel,
        changes_summary: changesSummary || 'Updated IFC geometry and MEP coordination interfaces.',
        author_name: authorName,
        author_role: authorRole,
        stats_added: statsAdded,
        stats_modified: statsModified,
        stats_removed: statsRemoved,
        file_size: model.file_size,
        file_url: model.file_url
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Revision ${versionLabel} pushed for ${model.name}!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create new revision';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GitCommit size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Push Model Revision</h3>
              <p className="text-xs text-slate-500">{model.name}</p>
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
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Author Role</label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Summary of Modifications</label>
            <textarea
              value={changesSummary}
              onChange={(e) => setChangesSummary(e.target.value)}
              rows={3}
              required
              placeholder="Describe changes (e.g. Revised internal partition walls in main concourse, resolved HVAC duct overlap)..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Estimated Element Diffs</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-emerald-600 font-bold block">+ Added</span>
                <input
                  type="number"
                  value={statsAdded}
                  onChange={(e) => setStatsAdded(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-emerald-700 font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-amber-600 font-bold block">~ Modified</span>
                <input
                  type="number"
                  value={statsModified}
                  onChange={(e) => setStatsModified(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-amber-700 font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-rose-600 font-bold block">- Removed</span>
                <input
                  type="number"
                  value={statsRemoved}
                  onChange={(e) => setStatsRemoved(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-rose-700 font-bold"
                />
              </div>
            </div>
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
