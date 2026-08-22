"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Send, ShieldAlert } from 'lucide-react';
import { createSiteIssue, SiteIssue } from '@/services/monitoring';
import { createStopWorkOrder } from '@/services/inspections';
import { getProjects, Project } from '@/services/projects';
import { CustomSelect } from '@/components/CustomSelect';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (issue?: SiteIssue) => void;
}

export default function ReportIssueModal({
  isOpen,
  onClose,
  onSuccess
}: ReportIssueModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [enforceStopWork, setEnforceStopWork] = useState(false);
  const [assignedToName, setAssignedToName] = useState('Site Engineer');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          const activeProj = list.find((p: Project) => p.status === 'ACTIVE') || list[0];
          setSelectedProjectId(activeProj.id);
        }
      })
      .catch(err => console.error("Failed to load projects", err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !title.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Project and issue title are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      const issue = await createSiteIssue({
        project: selectedProjectId,
        title: title.trim(),
        description: description.trim(),
        severity: enforceStopWork ? 'CRITICAL' : severity,
        assigned_to_name: assignedToName,
        due_date: dueDate || undefined,
        enforce_stop_work: enforceStopWork
      } as any);

      if (enforceStopWork) {
        await createStopWorkOrder({
          project: selectedProjectId,
          reason: `${title.trim()}: ${description.trim() || 'Immediate site safety and building regulation breach.'}`,
          severity: 'CRITICAL'
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: enforceStopWork 
            ? 'Stop-Work Order enforced! Site suspended and registered in Stop-Work Orders Registry.'
            : 'Site issue reported successfully', 
          type: 'success' 
        } 
      }));
      onClose();
      if (onSuccess) onSuccess(issue);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to report site issue';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Report Construction Site Issue</h3>
              <p className="text-xs text-slate-500">Log site defects, regulatory breaches, and safety hazards.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Construction Project</label>
            <CustomSelect
              value={selectedProjectId}
              onChange={(val) => setSelectedProjectId(val)}
              options={projects.map(p => ({
                value: p.id,
                label: `${p.name} (${p.reference_number || p.id.slice(0,8)}) - ${p.status || 'Active'}`
              }))}
              placeholder="Select project..."
              searchable={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Issue Severity</label>
              <CustomSelect
                value={severity}
                onChange={(val) => setSeverity(val)}
                options={[
                  { value: "LOW", label: "Low Severity" },
                  { value: "MEDIUM", label: "Medium Severity" },
                  { value: "HIGH", label: "High Severity" },
                  { value: "CRITICAL", label: "Critical Severity (Immediate)" }
                ]}
                placeholder="Severity..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Resolution Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Issue Title & Summary</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Scaffolding anchor bolts missing on Eastern facade"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Detailed Description & Evidence</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide context on the defect, affected structural elements, and risk factors..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Remedial Officer / Contractor</label>
            <input
              type="text"
              value={assignedToName}
              onChange={(e) => setAssignedToName(e.target.value)}
              placeholder="e.g. Julius Berger Site HSE Manager"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={18} className="text-rose-600 shrink-0" />
              <div>
                <label htmlFor="enforce-swo-checkbox" className="text-xs font-bold text-rose-900 cursor-pointer block">
                  Enforce Statutory Stop-Work Order
                </label>
                <p className="text-[10px] text-rose-700 font-medium">
                  Immediately suspends site construction and registers in Stop-Work Orders Registry
                </p>
              </div>
            </div>
            <input
              id="enforce-swo-checkbox"
              type="checkbox"
              checked={enforceStopWork}
              onChange={(e) => {
                setEnforceStopWork(e.target.checked);
                if (e.target.checked) setSeverity('CRITICAL');
              }}
              className="w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500 cursor-pointer"
            />
          </div>

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
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                enforceStopWork ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
              }`}
            >
              <Send size={14} /> {isSubmitting ? 'Submitting...' : (enforceStopWork ? 'Issue Stop-Work & Report Defect' : 'Report Issue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
