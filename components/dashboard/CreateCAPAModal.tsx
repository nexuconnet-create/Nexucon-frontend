"use client";

import React, { useState, useEffect } from 'react';
import { X, Activity, Plus } from 'lucide-react';
import { createCAPA, NonConformanceReport, getNCRs } from '@/services/compliance';
import { getProjects, Project } from '@/services/projects';

interface CreateCAPAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultNCR?: NonConformanceReport | null;
}

export default function CreateCAPAModal({
  isOpen,
  onClose,
  onSuccess,
  defaultNCR
}: CreateCAPAModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ncrs, setNcrs] = useState<NonConformanceReport[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedNcrId, setSelectedNcrId] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('High');
  const [status, setStatus] = useState('todo');
  const [assigneeName, setAssigneeName] = useState('HSE Officer');
  const [dueDate, setDueDate] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProjects().then(res => {
      const list = Array.isArray(res) ? res : ((res as any).results || []);
      setProjects(list);
      if (list.length > 0 && !selectedProjectId) setSelectedProjectId(list[0].id);
    });

    getNCRs().then(res => {
      setNcrs(res);
      if (defaultNCR) {
        setSelectedNcrId(defaultNCR.id);
        setSelectedProjectId(defaultNCR.project);
        setTitle(`Corrective Action: ${defaultNCR.title}`);
      }
    });
  }, [isOpen, defaultNCR]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Project is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createCAPA({
        project: selectedProjectId,
        ncr: selectedNcrId || undefined,
        title: title || 'Corrective Action Plan',
        priority: priority as any,
        status: status as any,
        assignee_name: assigneeName,
        due_date: dueDate || undefined,
        action_plan: actionPlan || undefined
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Corrective Action Plan (CAPA) created on Kanban board!', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create CAPA';
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
              <Activity size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">New Corrective Action (CAPA)</h3>
              <p className="text-xs text-slate-500">Create actionable resolution task</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.reference_number})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Linked NCR (Optional)</label>
            <select
              value={selectedNcrId}
              onChange={(e) => setSelectedNcrId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Standalone CAPA --</option>
              {ncrs.map(n => (
                <option key={n.id} value={n.id}>{n.ncr_reference}: {n.title} ({n.severity})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Action Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Install extra tie-offs on Sector 4 scaffolding"
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Under Review</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assignee Officer</label>
            <input
              type="text"
              value={assigneeName}
              onChange={(e) => setAssigneeName(e.target.value)}
              required
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
              <Plus size={14} /> {isSubmitting ? 'Creating...' : 'Create CAPA'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
