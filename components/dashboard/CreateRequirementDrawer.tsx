"use client";

import React, { useState, useEffect } from 'react';
import { X, ListTodo, ShieldCheck, Plus, CheckCircle, Tag, Building2, FileCheck } from 'lucide-react';
import { createRequirement } from '@/services/compliance';
import { getProjects, Project } from '@/services/projects';

interface CreateRequirementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateRequirementDrawer({
  isOpen,
  onClose,
  onSuccess
}: CreateRequirementDrawerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [requirementReference, setRequirementReference] = useState('');
  const [category, setCategory] = useState<'Environmental' | 'Safety & Health' | 'Building Codes' | 'Legal & Planning'>('Building Codes');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authority, setAuthority] = useState('Lagos State Building Control Agency (LASBCA)');
  const [evidenceRequired, setEvidenceRequired] = useState('Laboratory Test Report / Stamped Engineering Cert');
  const [verificationMethod, setVerificationMethod] = useState('Physical Inspection & Documentation');
  const [isMandatory, setIsMandatory] = useState(true);
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

    const randNum = Math.floor(100 + Math.random() * 900);
    setRequirementReference(`REQ-STAT-${randNum}`);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createRequirement({
        requirement_reference: requirementReference || `REQ-STAT-${Date.now().toString().slice(-4)}`,
        project: selectedProjectId || undefined,
        category: category,
        title: title || 'Statutory Code Conformance',
        description: description || 'Mandatory standard compliance clause verified by regulatory authority.',
        authority: authority || 'LASBCA',
        evidence_required: evidenceRequired,
        verification_method: verificationMethod,
        mandatory: isMandatory,
        status: 'Compliant'
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Statutory requirement "${requirementReference}" successfully registered!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create requirement';
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
              <ListTodo size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#022C4F]">Add Regulatory Requirement</h2>
              <p className="text-xs text-slate-500 mt-0.5">Register statutory code clauses, standards, or permit criteria.</p>
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
          
          {/* Requirement Reference & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Requirement Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={requirementReference}
                onChange={(e) => setRequirementReference(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Building Codes">Building Codes & Structure</option>
                <option value="Environmental">Environmental Standards</option>
                <option value="Safety & Health">Safety & Health Standards</option>
                <option value="Legal & Planning">Legal & Urban Planning</option>
              </select>
            </div>
          </div>

          {/* Applicable Project */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Applicable Project (Optional / General)
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All State-wide Projects (Universal Standard)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.reference_number || 'PRJ'})</option>
              ))}
            </select>
          </div>

          {/* Requirement Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Standard / Requirement Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Concrete Compressive Strength (28-day Cube Test)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Regulating Authority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Regulating Authority <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lagos State Building Control Agency (LASBCA)"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Evidence Required & Verification Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Evidence Required
              </label>
              <input
                type="text"
                placeholder="e.g. Certified Lab Test Sheet"
                value={evidenceRequired}
                onChange={(e) => setEvidenceRequired(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Verification Method
              </label>
              <input
                type="text"
                placeholder="e.g. Physical Core Audit"
                value={verificationMethod}
                onChange={(e) => setVerificationMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Statutory Description & Acceptance Criteria
            </label>
            <textarea
              rows={3}
              placeholder="Detail minimum grade requirements, tolerances, and compliance parameters..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* Mandatory Checkbox */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-900">Mandatory Statutory Prerequisite</p>
              <p className="text-[11px] text-blue-700 mt-0.5">Permit decisions and fitness certificates require this item to be compliant.</p>
            </div>
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span>Register Requirement</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </>
  );
}
