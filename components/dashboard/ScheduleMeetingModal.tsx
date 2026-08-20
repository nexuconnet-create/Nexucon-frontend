"use client";

import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Users, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { scheduleMeeting } from '@/services/stakeholders';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ScheduleMeetingModal({
  isOpen,
  onClose,
  onSuccess
}: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [projectName, setProjectName] = useState('Central Metro Transit Hub');
  const [date, setDate] = useState('Oct 28, 2026');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:30 AM');
  const [meetingType, setMeetingType] = useState<'Video Call' | 'Audio Call' | 'In-Person Council'>('Video Call');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !agenda.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Title and agenda are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await scheduleMeeting({
        title,
        agenda,
        project_name: projectName,
        date,
        time_slot: timeSlot,
        meeting_type: meetingType,
        initiator_name: 'Engr. Babatunde Sanwo',
        initiator_role: 'Agency Head / Director General'
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Official meeting "${title}" successfully scheduled by Agency Head!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || 'Only the Agency Head or Director General can schedule official meetings.';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#022C4F]">Schedule Stakeholder Council</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                  Agency Head Only
                </span>
              </div>
              <p className="text-xs text-slate-500">Authorized by Directorate General Command</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Agency Head Banner */}
        <div className="mb-4 p-3 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-center gap-3 text-xs text-blue-900">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <UserCheck size={16} />
          </div>
          <div>
            <p className="font-bold">Initiating Authority: Engr. Babatunde Sanwo</p>
            <p className="text-[11px] text-blue-700">Official invitations will be dispatched to developer, contractor, and inspector representatives.</p>
          </div>
        </div>

        <form onSubmit={handleSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 High-Rise Structural Coordination & Foundation Sign-Off"
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Meeting Format
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as any)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="Video Call">Live Video Conference</option>
                <option value="Audio Call">Audio Conference Call</option>
                <option value="In-Person Council">In-Person Council Session</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Oct 28, 2026"
                required
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Time Window
              </label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="10:00 AM - 11:30 AM"
                required
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Agenda & Review Deliverables
            </label>
            <textarea
              rows={3}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="e.g. Inspect structural concrete slump results, evaluate contractor NCR response, and sign off on Level 3 framing."
              required
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Calendar size={14} /> {isSubmitting ? 'Scheduling...' : 'Authorize & Dispatch Meeting'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
