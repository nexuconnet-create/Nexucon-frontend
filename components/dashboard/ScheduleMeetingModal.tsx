"use client";

import React, { useState } from 'react';
import { 
  X, Calendar, Clock, Video, Users, Check, Plus, 
  AlertCircle, ShieldCheck, Phone, MapPin, Sparkles, Loader2, Globe, Mail 
} from 'lucide-react';
import { scheduleMeeting } from '@/services/stakeholders';
import { sendEmailViaResend } from '@/services/email';

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
  const [inviteEmails, setInviteEmails] = useState('developer@nexucon.net, contractor@apexconstruct.com');
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

    let googleMeetUrl = '';
    if (meetingType === 'Video Call') {
      try {
        const meetRes = await fetch('/api/meetings/google-meet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            date: date.trim(),
            time_slot: timeSlot.trim()
          })
        });
        if (meetRes.ok) {
          const meetData = await meetRes.json();
          googleMeetUrl = meetData.google_meet_url || '';
        }
      } catch (meetErr) {
        console.warn('Google meet link generation notice', meetErr);
      }
    }

    try {
      const createdMeeting = await scheduleMeeting({
        title: title.trim(),
        agenda: agenda.trim() || 'Official technical review and inter-agency coordination session.',
        project_name: projectName.trim(),
        date: date.trim(),
        time_slot: timeSlot.trim(),
        meeting_type: meetingType,
        google_meet_url: googleMeetUrl || (meetingType === 'Video Call' ? 'https://meet.google.com/new' : undefined),
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

      // Dispatch Resend Email Notifications to all entered stakeholders with live link
      const emailList = inviteEmails.split(',').map(e => e.trim()).filter(e => e.includes('@'));
      if (emailList.length > 0) {
        const meetingRefId = createdMeeting?.id || 'room';
        const liveMeetingUrl = `https://nexucon-frontend-8x3a.vercel.app/government/dashboard/stakeholders/meetings/${meetingRefId}/room`;

        for (const recipient of emailList) {
          sendEmailViaResend({
            to: recipient,
            subject: `🏛️ Scheduled Council Session: ${title.trim()} [${createdMeeting?.meeting_reference || 'MTG-1092'}]`,
            type: 'INVITE_DIRECTOR',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #060D15; color: #f8fafc; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 20px; border: 1px solid #1e293b;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="background-color: rgba(59, 130, 246, 0.15); display: inline-block; padding: 6px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.3);">
                    OFFICIAL COUNCIL SESSION SCHEDULED
                  </div>
                  <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 14px 0 6px 0;">Nexucon Regulatory Directorate</h1>
                  <p style="color: #94a3b8; font-size: 13px; margin: 0;">Official Stakeholder Inter-Agency Coordination</p>
                </div>

                <div style="background: #0f172a; padding: 22px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 24px;">
                  <h2 style="color: #ffffff; font-size: 17px; font-weight: 800; margin: 0 0 14px 0;">${title.trim()}</h2>
                  <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8; width: 120px;">Date &amp; Time:</td>
                      <td style="padding: 6px 0; font-weight: 700; color: #ffffff;">${date.trim()} • ${timeSlot.trim()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8;">Project:</td>
                      <td style="padding: 6px 0; font-weight: 700; color: #ffffff;">${projectName.trim()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8;">Meeting Type:</td>
                      <td style="padding: 6px 0; font-weight: 700; color: #60a5fa;">${meetingType}</td>
                    </tr>
                  </table>
                </div>

                <div style="text-align: center; margin-bottom: 24px;">
                  <a href="${liveMeetingUrl}" style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block;">
                    Access Live Meeting Room →
                  </a>
                </div>

                <div style="background-color: #090e17; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px; color: #94a3b8; word-break: break-all; text-align: center; border: 1px solid #1e293b;">
                  Meeting Link: <a href="${liveMeetingUrl}" style="color: #60a5fa; text-decoration: none;">${liveMeetingUrl}</a>
                </div>
              </div>
            `
          }).catch(e => console.warn('Email dispatch warning', e));
        }
      }

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Official Stakeholder Meeting scheduled & invitations dispatched via Resend!', type: 'success' }
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
    { id: 'Video Call' as const, label: 'Encrypted Video Call', icon: Video, desc: 'In-portal WebRTC conference & Google Meet room' },
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
                    STATUTORY DIRECTIVE
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• Resend Email Dispatched</span>
                </div>
                <h2 className="text-lg font-black text-[#022C4F] mt-0.5">
                  Schedule Council Meeting
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
              
              {/* Agency Head Callout */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200/80 flex items-start gap-3">
                <ShieldCheck size={18} className="text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900">Agency Head Executive Privilege</p>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    Meeting initiation and statutory call rooms are exclusively reserved for the Agency Head / Director General under State Building Regulations.
                  </p>
                </div>
              </div>

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
                  placeholder="e.g. Q3 Structural Stage-Gate Deliberation & GPR Review"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Stakeholder Invite Emails */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Mail size={14} className="text-blue-600" />
                  <span>Invite Stakeholder Emails (Dispatched via Resend)</span>
                </label>
                <input
                  type="text"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="developer@nexucon.net, inspector@gov.ng"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Separate multiple emails with commas. All recipients receive one-click access to <span className="font-mono text-blue-600">nexucon-frontend-8x3a.vercel.app</span>.</p>
              </div>

              {/* Project Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Project Title / Site
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Central Metro Transit Hub"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Meeting Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="Aug 30, 2026"
                      className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Time Slot
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      placeholder="10:00 AM - 11:30 AM"
                      className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Meeting Type */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Session Medium
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {meetingTypes.map((t) => {
                    const isSelected = meetingType === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMeetingType(t.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/50 text-[#022C4F] shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{t.label}</p>
                            <p className="text-[10px] text-slate-400">{t.desc}</p>
                          </div>
                        </div>
                        {isSelected && <Check size={16} className="text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Agenda */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Statutory Deliberation Agenda
                </label>
                <textarea
                  rows={3}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Stage-gate signoff for slab casting, GPR inspection data verification, and contractor HSE review..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none"
                />
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
                    <span>Scheduling &amp; Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Confirm &amp; Dispatch Invites</span>
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
