"use client";

import React, { useState, useEffect } from 'react';
import { X, Building2, Plus, FileText, Calendar, DollarSign, ShieldAlert, Check } from 'lucide-react';
import { createApplication } from '@/services/applications';
import { getProjects, Project } from '@/services/projects';
import { CustomSelect } from '@/components/CustomSelect';

interface CreateApplicationSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateApplicationSideDrawer({
  isOpen,
  onClose,
  onCreated
}: CreateApplicationSideDrawerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [applicationType, setApplicationType] = useState('Building Permit');
  const [priority, setPriority] = useState('Normal');
  const [feeAmount, setFeeAmount] = useState('50000');
  const [jurisdiction, setJurisdiction] = useState('Lagos State Planning Authority');
  const [reviewDeadline, setReviewDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
      })
      .catch(err => console.error("Failed to load projects", err))
      .finally(() => setIsLoading(false));
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
      await createApplication({
        project: selectedProjectId,
        title: title || `${applicationType} Application`,
        application_type: applicationType,
        priority,
        jurisdiction,
        fee_amount: parseFloat(feeAmount) || 0,
        review_deadline: reviewDeadline || undefined,
        required_action: 'Initial screening and document verification required.'
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Application submitted successfully', type: 'success' } 
      }));
      onClose();
      if (onCreated) onCreated();
    } catch (err: any) {
      const errorData = err.response?.data;
      let msg = 'Failed to submit application';
      if (errorData?.message) {
        msg = errorData.message;
      } else if (errorData?.errors) {
        msg = typeof errorData.errors === 'object' ? Object.values(errorData.errors).flat().join('; ') : String(errorData.errors);
      } else if (errorData?.detail) {
        msg = errorData.detail;
      }
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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[580px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-[#022C4F]">New Regulatory Application</h2>
            <p className="text-xs text-slate-500 mt-1">Submit a permit application for government screening and review.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Construction Project</label>
            <CustomSelect
              value={selectedProjectId}
              onChange={(val) => setSelectedProjectId(val)}
              options={projects.map(p => ({
                value: p.id,
                label: `${p.name} (${p.developer_name || p.location || p.id})`
              }))}
              placeholder="Select project..."
              searchable={true}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Application Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Phase 2 Commercial Building Permit"
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Permit / Approval Type</label>
              <CustomSelect
                value={applicationType}
                onChange={(val) => setApplicationType(val)}
                options={[
                  { value: "Building Permit", label: "Building Permit" },
                  { value: "Renovation Permit", label: "Renovation Permit" },
                  { value: "Planning Approval", label: "Planning Approval" },
                  { value: "Demolition Permit", label: "Demolition Permit" },
                  { value: "Structural Approval", label: "Structural Approval" },
                  { value: "Environmental Clearance", label: "Environmental Clearance" }
                ]}
                placeholder="Select permit type..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Priority Level</label>
              <CustomSelect
                value={priority}
                onChange={(val) => setPriority(val)}
                options={[
                  { value: "Low", label: "Low" },
                  { value: "Normal", label: "Normal" },
                  { value: "Medium", label: "Medium" },
                  { value: "High", label: "High" },
                  { value: "Critical", label: "Critical" }
                ]}
                placeholder="Select priority..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Regulatory Fee (₦)</label>
              <input
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                placeholder="50000"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Review Deadline</label>
              <input
                type="date"
                value={reviewDeadline}
                onChange={(e) => setReviewDeadline(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jurisdiction Authority</label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="e.g. Lagos State Building Control Agency"
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
              <Plus size={16} /> {isSubmitting ? 'Submitting...' : 'Create Application'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
