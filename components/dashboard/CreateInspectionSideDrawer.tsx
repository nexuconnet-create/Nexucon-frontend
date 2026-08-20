"use client";

import React, { useState, useEffect } from 'react';
import { X, Building2, Plus, Calendar, ShieldCheck, FileText } from 'lucide-react';
import { createInspection } from '@/services/inspections';
import { getProjects, Project } from '@/services/projects';

interface CreateInspectionSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateInspectionSideDrawer({
  isOpen,
  onClose,
  onCreated
}: CreateInspectionSideDrawerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [inspectionType, setInspectionType] = useState('Foundation Inspection');
  const [priority, setPriority] = useState('Normal');
  const [scheduledDate, setScheduledDate] = useState('');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
      })
      .catch(err => console.error("Failed to load projects", err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select a project', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createInspection({
        project: selectedProjectId,
        inspection_type: inspectionType,
        priority,
        scheduled_date: scheduledDate || undefined,
        summary_notes: summaryNotes
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Inspection request logged successfully', type: 'success' } 
      }));
      onClose();
      if (onCreated) onCreated();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create inspection request';
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
            <h2 className="text-xl font-black text-[#022C4F]">Create Inspection Request</h2>
            <p className="text-xs text-slate-500 mt-1">Schedule a regulatory or engineering inspection on site.</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Construction Site</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.reference_number || p.id.slice(0,8)})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Inspection Type</label>
              <select
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
              >
                <option value="Foundation Inspection">Foundation Inspection</option>
                <option value="Structural Review">Structural Review</option>
                <option value="Site Verification">Site Verification</option>
                <option value="Safety Audit">Safety Audit</option>
                <option value="MEP Inspection">MEP Inspection</option>
                <option value="Drainage & Environmental">Drainage & Environmental</option>
                <option value="Final Clearance">Final Clearance</option>
                <option value="Emergency Inspection">Emergency Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Proposed Date / Time</label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Scope & Special Instructions</label>
            <textarea
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              rows={4}
              placeholder="e.g. Inspect foundation rebar placement, column starter bars, and concrete cover..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
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
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> {isSubmitting ? 'Submitting...' : 'Log Request'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
