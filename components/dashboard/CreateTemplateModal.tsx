"use client";

import React, { useState } from 'react';
import { X, CheckSquare, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { createInspectionTemplate } from '@/services/settings';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ChecklistDraftItem {
  title: string;
  field_type: 'Number Input' | 'Pass/Fail Toggle' | 'Photo Upload' | 'Text Input';
  is_required: boolean;
}

export default function CreateTemplateModal({
  isOpen,
  onClose,
  onSuccess
}: CreateTemplateModalProps) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Structural');
  const [items, setItems] = useState<ChecklistDraftItem[]>([
    { title: 'Verify site boundary coordinates match CAD survey', field_type: 'Pass/Fail Toggle', is_required: true },
    { title: 'Measure concrete slump rating (inches)', field_type: 'Number Input', is_required: true }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { title: 'New Inspection Item', field_type: 'Pass/Fail Toggle', is_required: true }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createInspectionTemplate({ name, department, items });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Inspection template "${name}" created with ${items.length} items!`, type: 'success' } 
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
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">New Inspection Template</h3>
              <p className="text-xs text-slate-500">Field Checklist & Data Collection Builder</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pre-Pour Slab & Rebar Checklist"
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department Jurisdiction
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
            >
              <option value="Structural">Structural</option>
              <option value="Environmental">Environmental</option>
              <option value="MEP">MEP (Mechanical, Electrical, Plumbing)</option>
              <option value="Civil & Drainage">Civil & Drainage</option>
              <option value="Fire & Life Safety">Fire & Life Safety</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Checklist Items ({items.length})
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Item {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                    placeholder="Question or inspection directive..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={item.field_type}
                      onChange={(e) => handleItemChange(idx, 'field_type', e.target.value)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none"
                    >
                      <option value="Pass/Fail Toggle">Pass/Fail Toggle</option>
                      <option value="Number Input">Number Input</option>
                      <option value="Photo Upload">Photo Upload</option>
                      <option value="Text Input">Text Input</option>
                    </select>

                    <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.is_required}
                        onChange={(e) => handleItemChange(idx, 'is_required', e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Required
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
