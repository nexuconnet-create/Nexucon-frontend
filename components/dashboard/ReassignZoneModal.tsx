"use client";

import React, { useState } from 'react';
import { X, MapPin, UserCheck, Shield } from 'lucide-react';
import { Inspector, reassignInspectorZone } from '@/services/stakeholders';

interface ReassignZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspector: Inspector | null;
  onSuccess?: () => void;
}

export default function ReassignZoneModal({
  isOpen,
  onClose,
  inspector,
  onSuccess
}: ReassignZoneModalProps) {
  const [zone, setZone] = useState('Zone C (East Corridor)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !inspector) return null;

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await reassignInspectorZone(inspector.id, zone);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `${inspector.name} reassigned to ${zone}!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to reassign zone', type: 'error' } }));
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
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Reassign Field Zone</h3>
              <p className="text-xs text-slate-500">{inspector.name} • {inspector.inspector_id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleReassign} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Current Zone</span>
            <p className="font-bold text-slate-800">{inspector.assigned_zone}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select New Jurisdiction Zone
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="Zone A (Downtown Core)">Zone A (Downtown Core)</option>
              <option value="Zone B (Westside Industrial)">Zone B (Westside Industrial)</option>
              <option value="Zone C (East Corridor & Airport)">Zone C (East Corridor & Airport)</option>
              <option value="Zone D (Harbor & Deep Foundation)">Zone D (Harbor & Deep Foundation)</option>
              <option value="City-Wide Special Taskforce">City-Wide Special Taskforce</option>
            </select>
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
              {isSubmitting ? 'Updating...' : 'Save Reassignment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
