"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, ShieldCheck, Calendar, Layers, 
  Building2, AlertTriangle, FileText, Plus, Trash2,
  Clock, Sparkles, Check, ChevronRight
} from 'lucide-react';
import { getProjects, Project } from '@/services/projects';
import { createMilestone, ConstructionMilestone } from '@/services/monitoring';

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newMilestone?: ConstructionMilestone) => void;
  defaultProjectId?: string;
}

const PHASES = [
  { id: 'SUBSTRUCTURE', label: 'Substructure & Foundation Piling' },
  { id: 'STRUCTURAL_FRAME', label: 'Reinforced Concrete Superstructure Frame' },
  { id: 'SUPERSTRUCTURE', label: 'Superstructure & Floor Slabs' },
  { id: 'MEP_ROUGHIN', label: 'MEP Services & Conduit Rough-ins' },
  { id: 'FACADE_ENVELOPE', label: 'Facade Glazing, Cladding & Envelope' },
  { id: 'FINISHES', label: 'Internal Partitions, Screed & Finishes' },
  { id: 'COMMISSIONING', label: 'Testing, Statutory Commissioning & Handover' },
];

export default function CreateMilestoneModal({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId
}: CreateMilestoneModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || '');
  const [name, setName] = useState('');
  const [milestoneCode, setMilestoneCode] = useState('');
  const [phase, setPhase] = useState('SUPERSTRUCTURE');
  const [description, setDescription] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [criticalPath, setCriticalPath] = useState(false);
  const [sequenceOrder, setSequenceOrder] = useState('1');

  // Verification requirements gates
  const [verificationReqs, setVerificationReqs] = useState({
    require_inspections_passed: true,
    require_zero_critical_defects: true,
    require_survey_within_tolerance: true,
    require_lab_test_evidence: true,
    require_engineer_signoff: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getProjects().then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          if (!selectedProjectId) {
            setSelectedProjectId(defaultProjectId || data[0].id);
          }
        }
      });

      // Default auto code
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setMilestoneCode(`MS-26-${randomSuffix}`);

      // Default dates
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30);
      setPlannedStartDate(today.toISOString().split('T')[0]);
      setTargetDate(nextMonth.toISOString().split('T')[0]);
    }
  }, [isOpen, defaultProjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedProjectId || !targetDate) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Milestone name, project, and target completion date are required.', type: 'error' } 
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProjectObj = projects.find(p => p.id === selectedProjectId);
      const payload: Partial<ConstructionMilestone> = {
        project: selectedProjectId,
        project_name: selectedProjectObj?.name || 'Construction Project',
        project_reference: selectedProjectObj?.reference_number || 'PRJ-NEXUCON',
        project_location: selectedProjectObj?.site_address || selectedProjectObj?.location || 'Lagos, Nigeria',
        name: name.trim(),
        milestone_code: milestoneCode.trim() || `MS-${Math.floor(1000 + Math.random() * 9000)}`,
        phase,
        description: description.trim(),
        planned_start_date: plannedStartDate || undefined,
        target_date: targetDate,
        duration_days: parseInt(durationDays, 10) || 30,
        critical_path: criticalPath,
        sequence_order: parseInt(sequenceOrder, 10) || 1,
        status: 'PLANNED',
        progress_percentage: 0,
        verification_requirements: verificationReqs,
        risk_level: 'LOW'
      };

      const result = await createMilestone(payload);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Construction milestone "${name}" successfully scheduled!`, type: 'success' } 
      }));

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create construction milestone';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 my-8 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#022C4F] text-white flex items-center justify-center shadow-md shadow-[#022C4F]/20">
              <Plus size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Programme Management
              </span>
              <h2 className="text-xl font-black text-[#022C4F] mt-0.5">Schedule Construction Milestone</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Project & Code Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#022C4F]">Target Construction Project *</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.reference_number || 'Lagos State'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#022C4F]">Milestone Code</label>
              <input 
                type="text"
                value={milestoneCode}
                onChange={(e) => setMilestoneCode(e.target.value)}
                placeholder="e.g. MS-01-PIL"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Name & Phase Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#022C4F]">Milestone Title *</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Foundation Piling & Raft Slab Certification"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#022C4F]">Construction Phase Category</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PHASES.map(ph => (
                  <option key={ph.id} value={ph.id}>{ph.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#022C4F]">Planned Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="date"
                  value={plannedStartDate}
                  onChange={(e) => setPlannedStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#022C4F]">Target Completion Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#022C4F]">Estimated Duration (Days)</label>
              <input 
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              />
            </div>
          </div>

          {/* Critical Path & Sequence */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#022C4F]">Critical Construction Path</span>
                {criticalPath && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-800">
                    High Priority
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Delays on critical path milestones directly impact total statutory project delivery.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={criticalPath}
                onChange={(e) => setCriticalPath(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#022C4F]">Scope of Work & Technical Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific structural, geotechnical, or MEP milestones requirements..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Verification Requirements Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-black text-[#022C4F] uppercase tracking-wider block">
              Configured Verification Gate Requirements
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { key: 'require_inspections_passed', label: 'Mandatory Site Inspections Passed' },
                { key: 'require_zero_critical_defects', label: 'Zero Open Critical Site Defects / SWOs' },
                { key: 'require_survey_within_tolerance', label: 'BIM / GNSS RTK Rover within Tolerance' },
                { key: 'require_lab_test_evidence', label: 'Certified Lab Compression Test Reports' },
                { key: 'require_engineer_signoff', label: 'Registered Structural Engineer Seal' }
              ].map(gate => (
                <label key={gate.key} className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors">
                  <input 
                    type="checkbox"
                    checked={(verificationReqs as any)[gate.key]}
                    onChange={(e) => setVerificationReqs(prev => ({ ...prev, [gate.key]: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">{gate.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Scheduling Milestone...</>
              ) : (
                <>
                  <CheckCircle size={15} /> Save Milestone Schedule
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
