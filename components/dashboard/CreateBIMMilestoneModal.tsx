"use client";

import React, { useState, useEffect } from 'react';
import { X, Flag, Box, Layers, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
import { createBIMMilestone, getBIMModels, BIMModel } from '@/services/bim';
import { getProjects, Project } from '@/services/projects';

interface CreateBIMMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateBIMMilestoneModal({
  isOpen,
  onClose,
  onSuccess
}: CreateBIMMilestoneModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  const [models, setModels] = useState<BIMModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<'SUBSTRUCTURE' | 'STRUCTURAL_FRAME' | 'SUPERSTRUCTURE' | 'MEP_ROUGHIN' | 'FACADE_ENVELOPE' | 'FINISHES' | 'COMMISSIONING'>('SUPERSTRUCTURE');
  const [sequenceOrder, setSequenceOrder] = useState(1);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [toleranceMaxMm, setToleranceMaxMm] = useState(15.0);
  const [elementCategory, setElementCategory] = useState('Structural Columns & Shear Core');
  const [lod, setLod] = useState('LOD 400');
  const [elementCount, setElementCount] = useState(24);
  const [gprClearanceRequired, setGprClearanceRequired] = useState(false);
  const [description, setDescription] = useState('');
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
    if (!selectedProjectId) {
      setModels([]);
      setSelectedModelId('');
      return;
    }
    getBIMModels({ project: selectedProjectId })
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setModels(list);
        if (list.length > 0) setSelectedModelId(list[0].id);
      })
      .catch(err => console.error("Failed to load BIM models", err));
  }, [selectedProjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedModelId) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Project and Approved BIM Model are required.', type: 'error' } 
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedModel = models.find(m => m.id === selectedModelId);
      const currentVer = selectedModel?.versions?.find(v => v.is_current) || selectedModel?.versions?.[0];

      await createBIMMilestone({
        project: selectedProjectId,
        bim_model: selectedModelId,
        model_version: currentVer?.id,
        name: name || `${phase.replace('_', ' ')} Verification Stage`,
        phase,
        sequence_order: sequenceOrder,
        target_date: targetDate,
        tolerance_max_mm: toleranceMaxMm,
        gpr_clearance_status: gprClearanceRequired ? 'PENDING' : 'NOT_APPLICABLE',
        description,
        bim_elements: [
          {
            id: `ELEM-${phase.slice(0, 3)}-001`,
            name: elementCategory,
            discipline: selectedModel?.discipline || 'Structural',
            count: elementCount,
            lod
          }
        ]
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'BIM Construction Milestone created and linked to model.', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create milestone';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Flag size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#022C4F]">Create BIM Construction Milestone</h2>
              <p className="text-xs text-slate-500">Bind construction schedule gate to approved BIM geometry & tolerances.</p>
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
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Project *</label>
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              required
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.reference_number || 'PRJ'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Associated BIM Model *</label>
            <select 
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              required
            >
              {models.length === 0 ? (
                <option value="">No BIM Models Found for Project</option>
              ) : (
                models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.discipline} • {m.current_version} • {m.is_digitally_certified ? 'Certified' : m.status})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Milestone Stage Name *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Level 1-4 Core Shear Wall Alignment & Penetrations"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Construction Phase</label>
              <select 
                value={phase}
                onChange={(e) => setPhase(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SUBSTRUCTURE">Substructure & Foundation Piling</option>
                <option value="STRUCTURAL_FRAME">Reinforced Concrete Superstructure Frame</option>
                <option value="SUPERSTRUCTURE">Superstructure & Floor Slabs</option>
                <option value="MEP_ROUGHIN">MEP Services & Conduit Rough-ins</option>
                <option value="FACADE_ENVELOPE">Facade Glazing & Building Envelope</option>
                <option value="FINISHES">Architectural Finishes</option>
                <option value="COMMISSIONING">Testing & Statutory Handover</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Sequence Order</label>
              <input 
                type="number" 
                min="1"
                value={sequenceOrder}
                onChange={(e) => setSequenceOrder(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Target Completion Date</label>
              <input 
                type="date" 
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Max Allowable Tolerance (mm)</label>
              <input 
                type="number" 
                step="0.5"
                value={toleranceMaxMm}
                onChange={(e) => setToleranceMaxMm(parseFloat(e.target.value) || 15.0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-[#022C4F] flex items-center gap-1.5">
              <Layers size={14} className="text-blue-600" /> Associated BIM Elements & LOD
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input 
                  type="text" 
                  value={elementCategory}
                  onChange={(e) => setElementCategory(e.target.value)}
                  placeholder="Element category / scope"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select 
                  value={lod}
                  onChange={(e) => setLod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOD 300">LOD 300</option>
                  <option value="LOD 350">LOD 350</option>
                  <option value="LOD 400">LOD 400</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="gpr_check"
                checked={gprClearanceRequired}
                onChange={(e) => setGprClearanceRequired(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="gpr_check" className="text-xs font-medium text-slate-700 cursor-pointer">
                Require GPR Subsurface Scan / Rebar Clearance Verification
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Verification Notes & Scope</label>
            <textarea 
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope details for regulatory reviewer and surveyor..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || models.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Creating...' : 'Register Milestone'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
