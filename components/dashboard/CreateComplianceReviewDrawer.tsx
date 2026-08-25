"use client";

import React, { useState, useEffect } from 'react';
import { X, FileSearch, Calendar, User, Plus, Building2, ShieldCheck, Tag } from 'lucide-react';
import { createComplianceReview } from '@/services/compliance';
import { getProjects, Project } from '@/services/projects';

interface CreateComplianceReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateComplianceReviewDrawer({
  isOpen,
  onClose,
  onSuccess
}: CreateComplianceReviewDrawerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [reviewType, setReviewType] = useState<'Safety' | 'Building Code' | 'Environmental' | 'Quality'>('Safety');
  const [auditorName, setAuditorName] = useState('Engr. Babatunde Jinadu (Lead Auditor)');
  const [stage, setStage] = useState<'Initiation' | 'Audit in Progress' | 'Reporting' | 'Final Review' | 'Completed'>('Initiation');
  const [dueDate, setDueDate] = useState('');
  const [findingsSummary, setFindingsSummary] = useState('');
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

    const today = new Date();
    today.setDate(today.getDate() + 14);
    setDueDate(today.toISOString().split('T')[0]);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Target project is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createComplianceReview({
        project: selectedProjectId,
        title: title || `${reviewType} Statutory Compliance Audit`,
        review_type: reviewType,
        auditor_name: auditorName || 'Lead Compliance Officer',
        stage: stage,
        progress: stage === 'Initiation' ? 20 : stage === 'Audit in Progress' ? 50 : stage === 'Reporting' ? 75 : stage === 'Final Review' ? 90 : 100,
        due_date: dueDate || undefined,
        findings_summary: findingsSummary || 'Initial scope and statutory audit verification scheduled.'
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Compliance Review audit successfully scheduled!', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to schedule review';
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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-white p-7 sm:p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <FileSearch size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#022C4F]">Schedule Compliance Audit</h2>
              <p className="text-xs text-slate-500 mt-0.5">Initialize a formal statutory review across project stages.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Target Project */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Project <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.reference_number || 'PRJ'})</option>
              ))}
            </select>
          </div>

          {/* Audit Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Audit / Review Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Comprehensive Structural & Fire Safety Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Review Type & Initial Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Review Discipline Type
              </label>
              <select
                value={reviewType}
                onChange={(e: any) => setReviewType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Safety">Safety & Occupational Health</option>
                <option value="Building Code">Building Code & Structural</option>
                <option value="Environmental">Environmental Impact (EIA)</option>
                <option value="Quality">Quality Assurance & Materials</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Initial Stage
              </label>
              <select
                value={stage}
                onChange={(e: any) => setStage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Initiation">Initiation (20%)</option>
                <option value="Audit in Progress">Audit in Progress (50%)</option>
                <option value="Reporting">Reporting (75%)</option>
                <option value="Final Review">Final Review (90%)</option>
                <option value="Completed">Completed (100%)</option>
              </select>
            </div>
          </div>

          {/* Lead Auditor & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Lead Auditor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Target Completion Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Scope / Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Audit Scope & Evidence Checkpoints
            </label>
            <textarea
              rows={3}
              placeholder="Specify site checkpoints, BIM model coordination, GPR scans, and material lab tests to inspect..."
              value={findingsSummary}
              onChange={(e) => setFindingsSummary(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span>Schedule Audit</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </>
  );
}
