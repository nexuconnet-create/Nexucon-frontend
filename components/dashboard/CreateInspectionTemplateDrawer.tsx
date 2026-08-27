"use client";

import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { createInspectionTemplate } from '@/services/settings';

interface CreateInspectionTemplateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateInspectionTemplateDrawer({
  isOpen,
  onClose,
  onSuccess
}: CreateInspectionTemplateDrawerProps) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Structural');
  const [items, setItems] = useState([
    { title: 'Verify reinforcement bar grade and spacing', field_type: 'Pass/Fail Toggle', is_required: true },
    { title: 'Record concrete slump measurement (inches)', field_type: 'Number Input', is_required: true },
    { title: 'Upload site elevation photo before pouring', field_type: 'Photo Upload', is_required: false }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { title: '', field_type: 'Pass/Fail Toggle', is_required: true }]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = val;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Template name is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createInspectionTemplate({
        name: name.trim(),
        department,
        items
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Inspection template "${name}" created with ${items.length} checklist items!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to create template', type: 'error' } }));
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
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[620px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                Create Inspection Template
              </h2>
              <p className="text-xs text-gray-500 font-medium">Standardized Field Checklists & Mandatory Observations</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-8 leading-relaxed">
            Construct standardized inspection checklists used by field inspectors on the mobile app. All items are verified during site inspections.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pre-Pour Concrete Slab & Rebar Inspection"
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Department / Discipline
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              >
                <option value="Structural">Structural Engineering</option>
                <option value="Environmental">Environmental & Drainage</option>
                <option value="Safety">Site Safety & OSHA</option>
                <option value="Geotechnical">Geotechnical & Foundation</option>
                <option value="MEP">Mechanical, Electrical & Plumbing</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                  Checklist Items & Criteria ({items.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        Item {idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                        placeholder="Enter observation question or measurement..."
                        required
                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-800 bg-white"
                      />
                      <div className="flex items-center justify-between gap-4">
                        <select
                          value={item.field_type}
                          onChange={(e) => handleItemChange(idx, 'field_type', e.target.value)}
                          className="h-9 rounded-lg border border-gray-200 px-3 text-xs font-bold text-gray-700 bg-white"
                        >
                          <option value="Pass/Fail Toggle">Pass/Fail Toggle</option>
                          <option value="Number Input">Number Measurement</option>
                          <option value="Photo Upload">Photo Upload</option>
                          <option value="Text Input">Text Note</option>
                        </select>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                          <input
                            type="checkbox"
                            checked={item.is_required}
                            onChange={(e) => handleItemChange(idx, 'is_required', e.target.checked)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span>Mandatory</span>
                        </label>
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
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                {isSubmitting ? 'Creating Template...' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
