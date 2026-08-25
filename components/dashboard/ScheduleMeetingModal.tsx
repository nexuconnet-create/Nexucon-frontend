"use client";

import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Users, Check, Plus, AlertCircle, ShieldCheck } from 'lucide-react';
import { scheduleMeeting, StakeholderMeeting } from '@/services/stakeholders';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleMeetingModal({
  isOpen,
  onClose,
  onSuccess
}: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [projectName, setProjectName] = useState('Central Metro Transit Hub');
  const [date, setDate] = useState('Aug 30, 2026');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:30 AM');
  const [meetingType, setMeetingType] = useState<'Video Call' | 'Audio Call' | 'In-Person Council'>('Video Call');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Meeting title is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await scheduleMeeting({
        title: title.trim(),
        agenda: agenda.trim() || 'Official technical review and inter-agency coordination session.',
        project_name: projectName.trim(),
        date: date.trim(),
        time_slot: timeSlot.trim(),
        meeting_type: meetingType,
        initiator_name: 'Engr. Babatunde Sanwo',
        initiator_role: 'Agency Head / Director General',
        bypass_agency_head_check: true,
        participants: [
          { name: 'Engr. Babatunde Sanwo', role: 'Agency Head / Director General', status: 'Confirmed' },
          { name: 'Michael Thorne', role: 'Master Developer (Nexucon)', status: 'Confirmed' },
          { name: 'Marcus Chen', role: 'Lead Structural Inspector', status: 'Invited' },
          { name: 'David Rivera', role: 'General Contractor (Apex)', status: 'Invited' }
        ]
      });

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Official Stakeholder Meeting scheduled successfully!', type: 'success' }
      }));
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to schedule meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0F181F]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#022C4F] text-white flex items-center justify-center shadow-md shadow-[#022C4F]/20">
              <Calendar size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  DIRECTOR GENERAL DISPATCH
                </span>
              </div>
              <h2 className="text-base font-black text-[#022C4F] mt-0.5">
                Schedule Official Stakeholder Meeting
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Meeting Title / Council Session
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q3 Structural Stage-Gate & GPR Tolerances Review"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Target Project</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Central Metro Transit Hub"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Meeting Format</label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Video Call">Live Video Conference</option>
                <option value="Audio Call">Audio Conference Call</option>
                <option value="In-Person Council">In-Person Council Session</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Scheduled Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g., Aug 30, 2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Time Slot</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g., 10:00 AM - 11:30 AM"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Agenda &amp; Discussion Objectives
            </label>
            <textarea
              rows={3}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Outline deliverables, non-conformance review points, and participant actions..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#022C4F]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Calendar size={14} />
              <span>{isSubmitting ? 'Scheduling...' : 'Dispatch Meeting Invitation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
