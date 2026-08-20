"use client";

import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle, PlayCircle } from 'lucide-react';
import { BIMModel, runClashMatrix } from '@/services/bim';
import { getProjects, Project } from '@/services/projects';

interface RunClashMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  models?: BIMModel[];
  onSuccess?: () => void;
}

export default function RunClashMatrixModal({
  isOpen,
  onClose,
  models = [],
  onSuccess
}: RunClashMatrixModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [primaryModelId, setPrimaryModelId] = useState('');
  const [secondaryModelId, setSecondaryModelId] = useState('');
  const [tolerance, setTolerance] = useState('25mm');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].id);
      })
      .catch(err => console.error("Failed to load projects", err));
  }, [isOpen]);

  useEffect(() => {
    if (models.length > 0) {
      setPrimaryModelId(models[0].id);
      if (models.length > 1) setSecondaryModelId(models[1].id);
    }
  }, [models]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !primaryModelId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Project and primary model are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await runClashMatrix({
        project: selectedProjectId,
        primary_model: primaryModelId,
        secondary_model: secondaryModelId || undefined
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Multi-disciplinary clash matrix analysis completed!', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to run clash matrix';
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
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Layers size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Run Clash Matrix</h3>
              <p className="text-xs text-slate-500">Multi-Disciplinary Collision Detection</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Primary Discipline Model</label>
            <select
              value={primaryModelId}
              onChange={(e) => setPrimaryModelId(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.discipline})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Secondary Discipline Model (Optional)</label>
            <select
              value={secondaryModelId}
              onChange={(e) => setSecondaryModelId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="">None / Self-Clash Audit</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.discipline})</option>
              ))}
            </select>
          </div>

          <div className="bg-rose-50/70 border border-rose-100 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-bold text-rose-800">Clearance Tolerance:</span>
            <span className="font-mono font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200">{tolerance}</span>
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
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-900/20 transition-all flex items-center gap-1.5"
            >
              <PlayCircle size={14} /> {isSubmitting ? 'Analyzing...' : 'Execute Clash Audit'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
