"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, History, User, Building2, 
  AlertTriangle, ShieldCheck, Check, Send, Sparkles 
} from 'lucide-react';
import { Inspection, createReInspection } from '@/services/inspections';
import { getInspectors, Inspector } from '@/services/stakeholders';
import { CustomSelect } from '@/components/CustomSelect';

interface ScheduleReInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection?: Inspection | null;
  inspectionsList?: Inspection[];
  onSuccess?: (reinspection?: Inspection) => void;
}

export default function ScheduleReInspectionModal({
  isOpen,
  onClose,
  inspection,
  inspectionsList = [],
  onSuccess
}: ScheduleReInspectionModalProps) {
  const [selectedInitialId, setSelectedInitialId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Critical'>('High');
  const [selectedInspectorName, setSelectedInspectorName] = useState<string>('');
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load registered database inspectors
    getInspectors()
      .then(res => {
        const list = Array.isArray(res) ? res : [];
        setInspectors(list);
      })
      .catch(err => console.error("Failed to load inspectors", err));

    if (inspection?.id) {
      setSelectedInitialId(inspection.id);
      setSelectedInspectorName(inspection.inspector_name || '');
      setSelectedInspectorId(inspection.inspector || '');
      setNotes(`Verification of defect rectification and building code compliance following initial inspection ${inspection.inspection_reference}.`);
    } else if (inspectionsList.length > 0) {
      const defaultInsp = inspectionsList.find(i => i.status === 'FAILED' || i.status === 'RE_INSPECTION_REQUIRED') || inspectionsList[0];
      setSelectedInitialId(defaultInsp.id);
      setSelectedInspectorName(defaultInsp.inspector_name || '');
      setSelectedInspectorId(defaultInsp.inspector || '');
      setNotes(`Verification of defect rectification and building code compliance following initial inspection ${defaultInsp.inspection_reference}.`);
    }

    // Default proposed date: 7 days from now at 10:00 AM
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const dateString = nextWeek.toISOString().slice(0, 16);
    setScheduledDate(dateString);
  }, [isOpen, inspection, inspectionsList]);

  if (!isOpen) return null;

  const currentInitialInspection = inspection || inspectionsList.find(i => i.id === selectedInitialId) || (inspectionsList.length > 0 ? inspectionsList[0] : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInitialInspection?.id) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select an initial inspection to reschedule', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      let isoDate: string | undefined = undefined;
      if (scheduledDate) {
        try {
          isoDate = new Date(scheduledDate).toISOString();
        } catch {
          isoDate = undefined;
        }
      }

      const reinspection = await createReInspection(currentInitialInspection.id, {
        scheduled_date: isoDate,
        inspector_name: selectedInspectorName || currentInitialInspection.inspector_name,
        inspector_id: selectedInspectorId || currentInitialInspection.inspector,
        priority,
        notes: notes.trim()
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `Re-Inspection ${reinspection.inspection_reference} scheduled for ${currentInitialInspection.project_name}.`, 
          type: 'success' 
        } 
      }));

      onClose();
      if (onSuccess) onSuccess(reinspection);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to schedule re-inspection';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
                Follow-Up Audit
              </span>
              <span className="text-xs text-slate-400 font-bold">Reschedule Initial Visit</span>
            </div>
            <h3 className="text-xl font-black text-[#022C4F] flex items-center gap-2 mt-1">
              <History className="text-blue-600" size={22} /> Schedule Site Re-Inspection
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Target Initial Inspection Selector */}
          {!inspection && inspectionsList.length > 0 ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Initial Inspection to Reschedule
              </label>
              <CustomSelect
                value={selectedInitialId}
                onChange={(val) => {
                  setSelectedInitialId(val);
                  const matched = inspectionsList.find(i => i.id === val);
                  if (matched) {
                    setSelectedInspectorName(matched.inspector_name || '');
                    setSelectedInspectorId(matched.inspector || '');
                    setNotes(`Verification of defect rectification and building code compliance following initial inspection ${matched.inspection_reference}.`);
                  }
                }}
                options={inspectionsList.map(i => ({
                  value: i.id,
                  label: `${i.inspection_reference} • ${i.project_name} (${i.inspection_type} - ${i.status})`
                }))}
                placeholder="Choose inspection..."
              />
            </div>
          ) : currentInitialInspection && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Initial Inspection</span>
                <h4 className="text-sm font-extrabold text-[#022C4F]">{currentInitialInspection.inspection_reference}</h4>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <Building2 size={13} className="text-blue-600" /> {currentInitialInspection.project_name} ({currentInitialInspection.inspection_type})
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase ${
                  currentInitialInspection.status === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                  currentInitialInspection.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {currentInitialInspection.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                  {currentInitialInspection.findings_count || (currentInitialInspection.findings || []).length} Defect(s)
                </p>
              </div>
            </div>
          )}

          {/* Reschedule Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Proposed Re-Inspection Date / Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Re-Inspection Priority
              </label>
              <CustomSelect
                value={priority}
                onChange={(val) => setPriority(val as any)}
                options={[
                  { value: "High", label: "High Priority (Default)" },
                  { value: "Critical", label: "Critical Priority (Stop-Work Risk)" },
                  { value: "Normal", label: "Normal Priority" }
                ]}
                placeholder="Priority..."
              />
            </div>
          </div>

          {/* Assigned Inspector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Field Inspector for Re-Audit
            </label>
            <CustomSelect
              value={selectedInspectorId || selectedInspectorName}
              onChange={(val) => {
                const found = inspectors.find(i => i.id === val || i.inspector_id === val || i.name === val);
                if (found) {
                  setSelectedInspectorId(found.id || found.inspector_id);
                  setSelectedInspectorName(found.name);
                } else {
                  setSelectedInspectorName(val);
                }
              }}
              options={
                inspectors.length > 0 
                  ? inspectors.map(i => ({
                      value: i.id || i.inspector_id,
                      label: `${i.name} (${i.role_title} - ${i.assigned_zone})`
                    }))
                  : [
                      { value: selectedInspectorName || "Engr. Babatunde Adeleke", label: selectedInspectorName || "Engr. Babatunde Adeleke (Lead Field Inspector)" }
                    ]
              }
              placeholder="Select inspector..."
            />
          </div>

          {/* Scope / Directives */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Re-Inspection Directives & Rectification Scope
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Audit concrete honeycombing repairs at Grid Line 4-C and re-verify reinforcement bar compliance..."
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !currentInitialInspection}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send size={14} /> {isSubmitting ? 'Rescheduling Re-Inspection...' : 'Confirm Re-Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
