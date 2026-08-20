"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert, Plus } from 'lucide-react';
import { createNCR } from '@/services/compliance';
import { getProjects, Project } from '@/services/projects';

interface LogNCRDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LogNCRDrawer({
  isOpen,
  onClose,
  onSuccess
}: LogNCRDrawerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('Major');
  const [category, setCategory] = useState('Safety');
  const [assigneeName, setAssigneeName] = useState('Lead Contractor');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('MANUAL');
  const [sourceReference, setSourceReference] = useState('');
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Project is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createNCR({
        project: selectedProjectId,
        title: title || 'Site Non-Conformance Report',
        severity: severity as any,
        category: category as any,
        assignee_name: assigneeName,
        description: description || 'Non-conformance identified during regulatory compliance audit.',
        source: source as any,
        source_reference: sourceReference || undefined
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Non-Conformance Report logged and linked to CAPA!', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to log NCR';
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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-[#022C4F] flex items-center gap-2">
              <ShieldAlert className="text-amber-500" size={22} /> Log Non-Conformance Report (NCR)
            </h2>
            <p className="text-xs text-slate-500 mt-1">Record site deviations, safety violations, or material test failures.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.reference_number})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">NCR Title</label>
            <input
              type="text"
              placeholder="e.g. Improper Scaffold Tie-offs at Sector 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-red-600"
              >
                <option value="Critical">Critical (Stop-Work Risk)</option>
                <option value="Major">Major (High Defect)</option>
                <option value="Minor">Minor (Standard Non-Conformance)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Discipline / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Safety">Safety & Health</option>
                <option value="Environmental">Environmental</option>
                <option value="Quality">Quality Assurance</option>
                <option value="Structural">Structural & Engineering</option>
                <option value="General">General Compliance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Assignee / Contractor</label>
              <input
                type="text"
                placeholder="e.g. Lead Structural Contractor"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Detection Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="MANUAL">Manual Regulatory Citation</option>
                <option value="INSPECTION">Field Inspection Finding</option>
                <option value="SITE_MONITORING">Site Monitoring / Drone Survey</option>
                <option value="BIM_CLASH">BIM Clash Detection</option>
                <option value="GPR_SCAN">Subsurface / GPR Anomaly</option>
                <option value="PERMIT_REVIEW">Permit Review Non-Conformance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Source Reference (Optional)</label>
            <input
              type="text"
              placeholder="e.g. INSP-504 or CLASH-08"
              value={sourceReference}
              onChange={(e) => setSourceReference(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Non-Conformance Description & Evidence</label>
            <textarea
              rows={4}
              placeholder="Describe the exact statutory violation, observed conditions, and corrective urgency..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <AlertTriangle size={16} /> {isSubmitting ? 'Logging...' : 'Log NCR'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
