"use client";

import React, { useState } from 'react';
import { 
  X, Calendar, Clock, Video, Users, Check, Plus, 
  AlertCircle, ShieldCheck, Phone, MapPin, Sparkles, Loader2 
} from 'lucide-react';
import { scheduleMeeting } from '@/services/stakeholders';

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
        detail: { message: 'Official Stakeholder Meeting scheduled & room created!', type: 'success' }
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

  const meetingTypes = [
    { id: 'Video Call' as const, label: 'Encrypted Video Call', icon: Video, desc: 'Google Meet room auto-generation' },
    { id: 'Audio Call' as const, label: 'Audio Conference', icon: Phone, desc: 'Direct multi-party voice bridge' },
    { id: 'In-Person Council' as const, label: 'Council Chambers', icon: MapPin, desc: 'Physical boardroom session' },
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
                <Calendar size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    DIRECTOR GENERAL DISPATCH
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• Room Generator</span>
                </div>
                <h2 className="text-lg font-black text-[#022C4F] mt-0.5">
                  Schedule Stakeholder Meeting
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
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Meeting Title / Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Structural Stage-Gate Approval & GPR Concrete Review"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Meeting Type Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Meeting Protocol &amp; Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {meetingTypes.map((mt) => {
                    const IconComp = mt.icon;
                    const isSelected = meetingType === mt.id;
                    return (
                      <button
                        type="button"
                        key={mt.id}
                        onClick={() => setMeetingType(mt.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <IconComp size={16} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                          {isSelected && <Check size={14} className="text-blue-600" />}
                        </div>
                        <div>
                          <p className="text-xs font-black">{mt.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{mt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project & Schedule Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Associated Project
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Aug 30, 2026"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="10:00 AM - 11:30 AM"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Agenda */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Agenda &amp; Deliberation Scope
                </label>
                <textarea
                  rows={3}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="State the core inspection items, stage-gate signoffs, or NCR reviews to be addressed..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Participants Preview */}
              <div className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-[#022C4F] flex items-center gap-1.5 mb-2">
                  <ShieldCheck size={15} className="text-blue-600" />
                  Statutory Council Invitees
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-xl border border-blue-200 text-blue-900 shadow-sm">
                    🏛️ Engr. Babatunde Sanwo (Agency Head)
                  </span>
                  <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-slate-800 shadow-sm">
                    🏗️ Michael Thorne (Developer)
                  </span>
                  <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-slate-800 shadow-sm">
                    🔍 Marcus Chen (Inspector)
                  </span>
                  <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-slate-800 shadow-sm">
                    👷 David Rivera (Contractor)
                  </span>
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
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={14} />
                    <span>Schedule &amp; Dispatch Meeting</span>
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
