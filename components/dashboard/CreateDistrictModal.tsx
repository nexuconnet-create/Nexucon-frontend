"use client";

import React, { useState } from 'react';
import { X, Map, MapPin } from 'lucide-react';
import { createDistrict } from '@/services/settings';

interface CreateDistrictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateDistrictModal({
  isOpen,
  onClose,
  onSuccess
}: CreateDistrictModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setIsSubmitting(true);
    try {
      await createDistrict({
        name,
        code,
        state_region: stateRegion,
        description
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Operational Zone "${name}" created successfully!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: err.response?.data?.detail || 'Failed to create district', type: 'error' } 
      }));
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
              <Map size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Create Operational Zone</h3>
              <p className="text-xs text-slate-500">Add a new district jurisdiction</p>
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
              Zone Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zone A (Lekki / Victoria Island)"
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Zone Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ZA-LVI"
                required
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                State / Region
              </label>
              <input
                type="text"
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                placeholder="e.g. Lagos South"
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High-density commercial and high-rise developments..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600 shrink-0" />
            <span>Projects and Inspectors can be assigned to this zone after creation.</span>
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
              {isSubmitting ? 'Creating...' : 'Create Zone'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
