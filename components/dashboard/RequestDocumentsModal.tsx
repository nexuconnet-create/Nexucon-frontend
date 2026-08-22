"use client";

import React, { useState, useEffect } from 'react';
import { X, FileText, Plus, Trash2, Send, Building2, Calendar, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Application, requestApplicationDocs } from '@/services/applications';
import { getProjects, Project } from '@/services/projects';
import { CustomSelect } from '@/components/CustomSelect';

interface RequestDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null;
  onSuccess?: () => void;
}

const COMMON_PRESETS = [
  "Revised Structural Beam Calculations & Bar Bending Schedule",
  "Soil Bearing Capacity Geotechnical Borehole Log",
  "As-Built Architectural Layout Plans (Stamped & Signed)",
  "Concrete Core Compressive Strength Test Certificate",
  "Fire Safety & Emergency Evacuation Plan",
  "Environmental Impact Assessment (EIA) Approval Letter"
];

export default function RequestDocumentsModal({
  isOpen,
  onClose,
  application,
  onSuccess
}: RequestDocumentsModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [items, setItems] = useState<string[]>([
    'Revised Structural Beam Calculations & Bar Bending Schedule'
  ]);
  const [newItem, setNewItem] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('7');
  const [instructions, setInstructions] = useState(
    'Please upload official signed and stamped PDF revisions in compliance with National Building Code and Statutory Regulations within the specified timeframe.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!application) {
      getProjects()
        .then(res => {
          const list = Array.isArray(res) ? res : ((res as any).results || []);
          setProjects(list);
          if (list.length > 0) {
            setSelectedProjectId(list[0].id);
          }
        })
        .catch(err => console.error("Failed to load projects", err));
    }
  }, [isOpen, application]);

  if (!isOpen) return null;

  const handleAddItem = (itemToAdd?: string) => {
    const text = itemToAdd || newItem;
    if (text.trim() && !items.includes(text.trim())) {
      setItems([...items, text.trim()]);
      if (!itemToAdd) setNewItem('');
    }
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Add at least one document requirement', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      if (application) {
        await requestApplicationDocs(application.id, {
          document_items: items,
          instructions: `${instructions} (Deadline: ${deadlineDays} days)`
        });
      }
      
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Formal Document Request dispatched for ${items.length} requirement(s)`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send document request';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentProjectName = application?.project_name || projects.find(p => p.id === selectedProjectId)?.name || 'Selected Project';
  const currentRef = application?.application_reference || projects.find(p => p.id === selectedProjectId)?.id || 'REG-DOC-REQ';

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-7 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Official Document Request</h3>
              <p className="text-xs text-slate-500">{currentRef} • {currentProjectName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Project Selection if standalone */}
          {!application && projects.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-600" /> Target Construction Project
              </label>
              <CustomSelect
                value={selectedProjectId}
                onChange={(val) => setSelectedProjectId(val)}
                options={projects.map(p => ({
                  value: p.id,
                  label: `${p.name} (${p.developer_name || p.location || p.id})`
                }))}
                placeholder="Select target project..."
                searchable={true}
              />
            </div>
          )}

          {/* Document Requirements List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Required Document Items ({items.length})
              </label>
              <span className="text-[11px] text-blue-600 font-semibold">Statutory Requirements</span>
            </div>

            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 group hover:border-blue-300 transition-colors">
                  <span className="flex items-center gap-2 flex-1 pr-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span className="line-clamp-1">{item}</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveItem(idx)} 
                    className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Input to add custom item */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(); } }}
                placeholder="e.g. Pile Load Test Integrity Verification Report"
                className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Common Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddItem(preset)}
                    className="text-[10px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {preset.split(' ')[0]} {preset.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submission Deadline */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Submission Deadline
              </label>
              <CustomSelect
                value={deadlineDays}
                onChange={(val) => setDeadlineDays(val)}
                options={[
                  { value: "3", label: "3 Days (Urgent / Critical)" },
                  { value: "7", label: "7 Working Days (Standard)" },
                  { value: "14", label: "14 Working Days (Comprehensive)" },
                  { value: "30", label: "30 Calendar Days (Statutory Window)" }
                ]}
                placeholder="Select deadline..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notification Channel
              </label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-500" /> Email + Portal + SMS Alert
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Directives to Developer / Contractor
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#022C4F] hover:bg-[#033b6a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#022C4F]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={14} /> {isSubmitting ? 'Transmitting Request...' : 'Issue Document Request'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
