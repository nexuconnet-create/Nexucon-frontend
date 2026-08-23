"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertOctagon, ShieldAlert, Building2, Send, AlertTriangle } from 'lucide-react';
import { Inspection, StopWorkOrder, issueStopWorkOrder, createStopWorkOrder } from '@/services/inspections';
import { getProjects, Project } from '@/services/projects';
import { CustomSelect } from '@/components/CustomSelect';

interface IssueStopWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection?: Inspection | null;
  project?: Project | null;
  projectsList?: Project[];
  onSuccess?: (swo?: StopWorkOrder) => void;
}

export default function IssueStopWorkModal({
  isOpen,
  onClose,
  inspection,
  project,
  projectsList = [],
  onSuccess
}: IssueStopWorkModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [reason, setReason] = useState('Critical structural defect and unauthorized modifications posing imminent danger to public safety.');
  const [severity, setSeverity] = useState('CRITICAL');
  const [availableProjects, setAvailableProjects] = useState<Project[]>(projectsList);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setAvailableProjects(list);
        if (project?.id) {
          setSelectedProjectId(project.id);
        } else if (typeof project === 'string') {
          setSelectedProjectId(project);
        } else if (inspection?.project) {
          setSelectedProjectId(inspection.project);
        } else if (list.length > 0 && !selectedProjectId) {
          const activeProj = list.find((p: Project) => p.status === 'ACTIVE') || list[0];
          setSelectedProjectId(activeProj.id);
        }
      })
      .catch(err => console.error("Failed to load projects", err));
  }, [isOpen, inspection, project, projectsList]);

  if (!isOpen) return null;

  const currentProject = project || availableProjects.find(p => p.id === selectedProjectId) || (inspection ? { name: inspection.project_name, reference_number: inspection.project_reference, id: inspection.project } : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProject = selectedProjectId || (typeof project === 'string' ? project : project?.id) || inspection?.project || availableProjects[0]?.id;
    if (!targetProject && !inspection?.id) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select a construction project site', type: 'error' } }));
      return;
    }
    if (!reason.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Statutory violation reason is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      let swo: StopWorkOrder;
      if (inspection?.id) {
        swo = await issueStopWorkOrder(inspection.id, {
          reason: reason.trim(),
          severity,
          project: targetProject
        });
      } else {
        swo = await createStopWorkOrder({
          project: targetProject,
          reason: reason.trim(),
          severity,
          inspection: inspection?.id
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `Stop-Work Order ${swo?.order_number || 'Enforced'} successfully issued. Site activities suspended in database.`, 
          type: 'success' 
        } 
      }));
      
      onClose();
      if (onSuccess) onSuccess(swo);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to issue Stop-Work Order';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertOctagon size={22} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider">Statutory Enforcement</span>
              <h3 className="text-lg font-black text-[#022C4F]">Issue Stop-Work Order</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl mb-4 text-xs text-rose-900 leading-relaxed font-medium">
          <span className="font-bold">Legal Enforcement Notice:</span> Issuing this order will immediately update the project status to <span className="font-bold text-rose-700">SUSPENDED</span> in the database and enforce a full site work shutdown.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Target Construction Site */}
          {!project && !inspection ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Construction Project
              </label>
              <CustomSelect
                value={selectedProjectId}
                onChange={(val) => setSelectedProjectId(val)}
                options={availableProjects.map(p => ({
                  value: p.id,
                  label: `${p.name} (${p.reference_number || p.id.slice(0, 8)}) - ${p.status || 'Active'}`
                }))}
                placeholder="Select project to suspend..."
                searchable={true}
              />
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Project</span>
                <h4 className="text-xs font-extrabold text-[#022C4F]">{currentProject?.name}</h4>
                <p className="text-[11px] text-slate-500">{currentProject?.reference_number || currentProject?.id}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 uppercase">
                To Be Suspended
              </span>
            </div>
          )}

          {/* Severity Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Violation Severity Level
            </label>
            <CustomSelect
              value={severity}
              onChange={(val) => setSeverity(val)}
              options={[
                { value: "CRITICAL", label: "Critical - Immediate Structural Hazard & Evacuation" },
                { value: "HIGH", label: "High - Severe Code Non-Compliance" },
                { value: "MEDIUM", label: "Medium - Environmental / Safety Hazard" },
                { value: "EMERGENCY", label: "Emergency - Imminent Collapse Threat" }
              ]}
              placeholder="Select severity..."
            />
          </div>

          {/* Reason / Grounds */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Statutory Violation Grounds & Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              placeholder="Specify the regulatory breach, safety violation, structural deficiency, or missing statutory permits..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!selectedProjectId && !inspection?.id)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <AlertOctagon size={15} /> {isSubmitting ? 'Enforcing Suspension...' : 'Enforce Stop-Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
