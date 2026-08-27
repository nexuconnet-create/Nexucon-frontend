"use client";

import React, { useState } from 'react';
import { X, GitBranch, Plus, Trash2, ArrowDown, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { createApprovalWorkflow } from '@/services/settings';

interface CreateWorkflowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateWorkflowDrawer({
  isOpen,
  onClose,
  onSuccess
}: CreateWorkflowDrawerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([
    { title: 'Initial Document Screening', role: 'Technical Reviewer' },
    { title: 'Structural Safety Assessment', role: 'Lead Inspector' },
    { title: 'Directorate Approval Sign-off', role: 'City Planner' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddStep = () => {
    setSteps([...steps, { title: 'New Review Step', role: 'Reviewer' }]);
  };

  const handleRemoveStep = (idx: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleStepChange = (idx: number, field: 'title' | 'role', val: string) => {
    const updated = [...steps];
    updated[idx][field] = val;
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Workflow name is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createApprovalWorkflow({
        name: name.trim(),
        description: description.trim(),
        steps: steps.map(s => ({ title: s.title, role: s.role, icon: 'ShieldCheck' }))
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Approval workflow "${name}" created with ${steps.length} sequential review stages!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to create workflow', type: 'error' } }));
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
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[600px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <GitBranch size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                Create Approval Workflow
              </h2>
              <p className="text-xs text-gray-500 font-medium">Configure Multi-Stage Statutory Review Pipelines</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-8 leading-relaxed">
            Construct sequential decision pipelines for building permits, architectural clearances, and zoning variances.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Workflow Title / Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. High-Rise Commercial Permit Pipeline"
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Description / Purpose
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe statutory applicability, review criteria, and mandate..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 p-4 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                  Sequential Review Stages ({steps.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus size={13} /> Add Stage
                </button>
              </div>

              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Stage 0{idx + 1}
                      </span>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove stage"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                          placeholder="Stage Title"
                          required
                          className="w-full h-10 rounded-lg border border-gray-200 px-3 text-xs font-bold text-gray-800 bg-white"
                        />
                      </div>
                      <div>
                        <select
                          value={step.role}
                          onChange={(e) => handleStepChange(idx, 'role', e.target.value)}
                          className="w-full h-10 rounded-lg border border-gray-200 px-3 text-xs font-bold text-gray-800 bg-white"
                        >
                          <option value="Technical Reviewer">Technical Reviewer</option>
                          <option value="Lead Inspector">Lead Inspector</option>
                          <option value="City Planner">City Planner</option>
                          <option value="Agency Approvers">Agency Approvers</option>
                          <option value="Director">Agency Director</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                {isSubmitting ? 'Creating Workflow...' : 'Create Workflow'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
