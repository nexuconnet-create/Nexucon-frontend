"use client";

import React, { useState } from 'react';
import { X, AlertTriangle, AlertOctagon, Send } from 'lucide-react';
import { Inspection, logInspectionFinding } from '@/services/inspections';

interface LogFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection | null;
  onSuccess?: () => void;
}

export default function LogFindingModal({
  isOpen,
  onClose,
  inspection,
  onSuccess
}: LogFindingModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [category, setCategory] = useState('STRUCTURAL');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [requiresReinspection, setRequiresReinspection] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !inspection) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Title and description are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await logInspectionFinding(inspection.id, {
        title,
        description,
        severity,
        category,
        corrective_action_required: correctiveAction,
        requires_reinspection: requiresReinspection
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Inspection defect finding recorded', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to log finding';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-lg font-black text-[#022C4F] flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} /> Log Inspection Finding
            </h3>
            <p className="text-xs text-slate-500">{inspection.inspection_reference} • {inspection.project_name}</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Defect Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Column Concrete Honeycombing at Grid 4-C"
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="LOW">Low Severity</option>
                <option value="MEDIUM">Medium Severity</option>
                <option value="HIGH">High Severity</option>
                <option value="CRITICAL">Critical (Stop-Work)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="STRUCTURAL">Structural Integrity</option>
                <option value="SAFETY">Site Safety & Scaffolding</option>
                <option value="ENVIRONMENTAL">Environmental & Drainage</option>
                <option value="MEP">MEP Engineering</option>
                <option value="PERMIT_DEVIATION">Permit Deviation</option>
                <option value="QUALITY">Material Quality</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Observation Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the non-conformance observed in the field..."
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Required Corrective Action</label>
            <textarea
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              rows={2}
              placeholder="Instructions for developer/contractor rectification..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="reinspect"
              checked={requiresReinspection}
              onChange={(e) => setRequiresReinspection(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="reinspect" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Requires field re-inspection before sign-off
            </label>
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Send size={14} /> {isSubmitting ? 'Logging...' : 'Save Finding'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
