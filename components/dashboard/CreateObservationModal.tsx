"use client";

import React, { useState, useEffect } from 'react';
import { X, Eye, Plus, Send, AlertTriangle, ShieldCheck } from 'lucide-react';
import { createFieldObservation, FieldObservation } from '@/services/monitoring';
import { getProjects, Project } from '@/services/projects';
import { CustomSelect } from '@/components/CustomSelect';

interface CreateObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (observation?: FieldObservation) => void;
}

export default function CreateObservationModal({
  isOpen,
  onClose,
  onSuccess
}: CreateObservationModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [category, setCategory] = useState('QUALITY');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('LOW');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          const activeProj = list.find((p: Project) => p.status === 'ACTIVE') || list[0];
          setSelectedProjectId(activeProj.id);
        }
      })
      .catch(err => console.error("Failed to load projects", err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !title.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Project and title are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      const obs = await createFieldObservation({
        project: selectedProjectId,
        category,
        title: title.trim(),
        description: description.trim(),
        severity,
        corrective_action: correctiveAction.trim()
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Field observation recorded successfully', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess(obs);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to record observation';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Record Field Observation</h3>
              <p className="text-xs text-slate-500">Document site visit notes, quality checks, and safety points.</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Construction Project</label>
            <CustomSelect
              value={selectedProjectId}
              onChange={(val) => setSelectedProjectId(val)}
              options={projects.map(p => ({
                value: p.id,
                label: `${p.name} (${p.reference_number || p.id.slice(0,8)}) - ${p.status || 'Active'}`
              }))}
              placeholder="Select project..."
              searchable={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val)}
                options={[
                  { value: "QUALITY", label: "Quality & Workmanship" },
                  { value: "SAFETY", label: "Safety & Scaffolding" },
                  { value: "PROGRESS", label: "Progress & Pacing" },
                  { value: "ENVIRONMENTAL", label: "Environmental & Drainage" },
                  { value: "GENERAL", label: "General Site Observation" }
                ]}
                placeholder="Category..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Severity</label>
              <CustomSelect
                value={severity}
                onChange={(val) => setSeverity(val)}
                options={[
                  { value: "LOW", label: "Low (Informational)" },
                  { value: "MEDIUM", label: "Medium (Correction Needed)" },
                  { value: "HIGH", label: "High (Non-Conformance)" },
                  { value: "CRITICAL", label: "Critical (Stop Risk)" }
                ]}
                placeholder="Severity..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Observation Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Inadequate rebar lap length on column C-4"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Detailed Findings & Observations</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what was observed during the physical inspection walk..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Recommended Corrective Action</label>
            <textarea
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              rows={2}
              placeholder="Recommended remedial work or structural rectification required..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
              <Send size={14} /> {isSubmitting ? 'Saving...' : 'Record Observation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
