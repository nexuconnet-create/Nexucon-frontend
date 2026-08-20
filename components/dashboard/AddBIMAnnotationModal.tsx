"use client";

import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { BIMModel, createBIMAnnotation } from '@/services/bim';
import { getProjects, Project } from '@/services/projects';

interface AddBIMAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  model?: BIMModel | null;
  models?: BIMModel[];
  onSuccess?: () => void;
}

export default function AddBIMAnnotationModal({
  isOpen,
  onClose,
  model,
  models = [],
  onSuccess
}: AddBIMAnnotationModalProps) {
  const [selectedModelId, setSelectedModelId] = useState(model?.id || '');
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [authorRole, setAuthorRole] = useState('Lead Architect');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (model) setSelectedModelId(model.id);
    else if (models.length > 0) setSelectedModelId(models[0].id);
  }, [model, models]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModelId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Model is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      const activeModel = models.find(m => m.id === selectedModelId) || model;
      await createBIMAnnotation({
        model: selectedModelId,
        project: activeModel?.project,
        text,
        priority,
        author_role: authorRole,
        status: 'Open'
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Review comment and BCF markup added!', type: 'success' } 
      }));
      setText('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add annotation';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Add Review Annotation</h3>
              <p className="text-xs text-slate-500">BCF Markup & Design Comment</p>
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
          {models.length > 0 && !model && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Model</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.discipline})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Critical">Critical Issue</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reviewer Role</label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Observation / Question</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              required
              placeholder="e.g. The headroom clearance here seems to be under the 2.4m requirement. Can we check HVAC duct placement?"
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
              <Send size={14} /> {isSubmitting ? 'Posting...' : 'Post Annotation'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
