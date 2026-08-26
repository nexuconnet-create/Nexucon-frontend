"use client";

import React, { useState } from 'react';
import { X, MapPin, UserCheck, Shield, Loader2 } from 'lucide-react';
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

  const zones = [
    { name: 'Zone A (Lekki / Victoria Island)', desc: 'High-density commercial and high-rise developments' },
    { name: 'Zone B (Ikeja / Central Business District)', desc: 'Government infrastructure and industrial facilities' },
    { name: 'Zone C (East Corridor)', desc: 'Rapid residential and mixed-use expansions' },
    { name: 'Zone D (Harbor & Maritime Hub)', desc: 'Port infrastructure and maritime terminals' },
  ];

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Sidepop Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#022C4F] text-white flex items-center justify-center shadow-md shadow-[#022C4F]/20">
                <MapPin size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {inspector.inspector_id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• Inspector Redeployment</span>
                </div>
                <h2 className="text-lg font-black text-[#022C4F] mt-0.5">
                  Reassign Field Jurisdiction
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <form onSubmit={handleReassign} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inspector Profile</p>
                <p className="text-base font-black text-[#022C4F] mt-0.5">{inspector.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{inspector.role_title}</p>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Current Zone:</span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {inspector.assigned_zone}
                  </span>
                </div>
              </div>

              {/* Zone Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select New Operational Zone
                </label>
                <div className="space-y-2">
                  {zones.map((z) => {
                    const isSelected = zone === z.name;
                    return (
                      <button
                        type="button"
                        key={z.name}
                        onClick={() => setZone(z.name)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900 font-bold'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{z.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{z.desc}</p>
                        </div>
                        {isSelected && <UserCheck size={16} className="text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#022C4F]/20 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Reassigning...</span>
                  </>
                ) : (
                  <>
                    <MapPin size={14} />
                    <span>Confirm Zone Transfer</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
