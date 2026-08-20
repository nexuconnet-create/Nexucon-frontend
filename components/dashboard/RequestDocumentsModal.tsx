"use client";

import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, Send } from 'lucide-react';
import { Application, requestApplicationDocs } from '@/services/applications';

interface RequestDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onSuccess?: () => void;
}

export default function RequestDocumentsModal({
  isOpen,
  onClose,
  application,
  onSuccess
}: RequestDocumentsModalProps) {
  const [items, setItems] = useState<string[]>(['Revised Structural Beam Calculations']);
  const [newItem, setNewItem] = useState('');
  const [instructions, setInstructions] = useState('Please upload stamped and signed PDF revisions within 7 days.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !application) return null;

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
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
      await requestApplicationDocs(application.id, {
        document_items: items,
        instructions
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Document request sent to applicant', type: 'success' } 
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

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-lg font-black text-[#022C4F]">Request Additional Documents</h3>
            <p className="text-xs text-slate-500">{application.application_reference} • {application.project_name}</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Required Document Items</label>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800">
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-600" /> {item}
                  </span>
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. Soil Bearing Capacity Test Report"
                className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Instructions to Applicant</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Send size={14} /> {isSubmitting ? 'Sending...' : 'Send Formal Request'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
