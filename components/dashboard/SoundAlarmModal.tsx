"use client";

import React, { useState } from 'react';
import { X, Radio, AlertOctagon, ShieldAlert } from 'lucide-react';
import { soundSiteAlarm } from '@/services/notifications';

interface SoundAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SoundAlarmModal({
  isOpen,
  onClose,
  onSuccess
}: SoundAlarmModalProps) {
  const [location, setLocation] = useState('Sector A — Deep Foundation');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSoundAlarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Specify the reason for the emergency alarm', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await soundSiteAlarm({ location, reason });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Emergency Site Alarm broadcasted for ${location}!`, type: 'error' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to sound alarm', type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-red-500">
        
        <div className="flex items-center justify-between pb-4 border-b border-red-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center animate-pulse">
              <AlertOctagon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-red-900">Sound Site Emergency Alarm</h3>
              <p className="text-xs text-red-600 font-semibold">Immediate Audible Evacuation Alert</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSoundAlarm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hazard Location / Sector
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Emergency Reason & Evacuation Protocol
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Imminent structural trench collapse near Tower Crane #2. Immediate evacuation ordered."
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-[11px] text-red-700 font-medium">
            ⚠️ Triggering this alarm will sound sirens, dispatch SMS/Email alerts to all active engineers on site, and freeze active heavy equipment permits.
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
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/30 transition-all flex items-center gap-2"
            >
              <Radio size={16} /> {isSubmitting ? 'Sounding Alarm...' : 'Trigger Site Alarm'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
