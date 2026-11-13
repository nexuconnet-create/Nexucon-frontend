"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Calendar, Clock, Video, Users, Check, Plus,
  AlertCircle, ShieldCheck, Phone, MapPin, Loader2,
  Search, UserCheck, HardHat, Building2, Bell, Mail
} from 'lucide-react';
import {
  scheduleMeeting,
  getAvailableMeetingParticipants,
  type AvailableParticipant
} from '@/services/stakeholders';
import { getProjects, type Project } from '@/services/projects';
import { sendEmailViaResend } from '@/services/email';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TIME_OPTIONS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM'
];

const PRESET_SLOTS = [
  { label: 'Morning Review (09:00 - 10:00 AM)', start: '09:00 AM', end: '10:00 AM' },
  { label: 'Mid-Morning Council (10:00 - 11:30 AM)', start: '10:00 AM', end: '11:30 AM' },
  { label: 'Afternoon Session (02:00 - 03:30 PM)', start: '02:00 PM', end: '03:30 PM' },
  { label: 'Late Afternoon Sync (04:00 - 05:00 PM)', start: '04:00 PM', end: '05:00 PM' },
];

function formatIsoToDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dt = new Date(year, month, day);
  if (isNaN(dt.getTime())) return isoDate;
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function ScheduleMeetingModal({
  isOpen,
  onClose,
  onSuccess
}: ScheduleMeetingModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [customProjectName, setCustomProjectName] = useState<string>('');
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);

  // Date & Time Selectors
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(getTodayIso());
  const [startTime, setStartTime] = useState<string>('10:00 AM');
  const [endTime, setEndTime] = useState<string>('11:30 AM');
  const [meetingType, setMeetingType] = useState<'Video Call' | 'Audio Call' | 'In-Person Council'>('Video Call');

  // Registered Stakeholders & Inspectors Directory
  const [roster, setRoster] = useState<AvailableParticipant[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [participantFilter, setParticipantFilter] = useState<'all' | 'inspector' | 'stakeholder'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState('');
  const [showAdditionalEmailInput, setShowAdditionalEmailInput] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const loadRosterAndProjects = async () => {
      setIsLoadingRoster(true);
      setIsLoadingProjects(true);
      try {
        const [participantsData, fetchedProjects] = await Promise.all([
          getAvailableMeetingParticipants(),
          getProjects(),
        ]);
        if (!mounted) return;
        setRoster(participantsData);

        const list = Array.isArray(fetchedProjects) ? fetchedProjects : [];
        setProjectsList(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id);
          setProjectName(list[0].name);
        } else {
          setSelectedProjectId('__custom__');
          setProjectName('__custom__');
        }
      } catch (err) {
        console.warn('Failed to load meeting participants roster or projects', err);
      } finally {
        if (mounted) {
          setIsLoadingRoster(false);
          setIsLoadingProjects(false);
        }
      }
    };

    loadRosterAndProjects();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const filteredRoster = useMemo(() => {
    return roster.filter((p) => {
      if (participantFilter === 'inspector' && p.category !== 'inspector') return false;
      if (participantFilter === 'stakeholder' && p.category !== 'stakeholder') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchUser = (p.username || '').toLowerCase().includes(q);
        const matchEmail = (p.email || '').toLowerCase().includes(q);
        const matchRole = (p.role || '').toLowerCase().includes(q);
        const matchOrg = (p.organization || '').toLowerCase().includes(q);
        const matchType = (p.entity_type || '').toLowerCase().includes(q);
        return matchName || matchUser || matchEmail || matchRole || matchOrg || matchType;
      }
      return true;
    });
  }, [roster, participantFilter, searchQuery]);

  const selectedParticipants = useMemo(
    () => roster.filter((p) => selectedIds.includes(p.id)),
    [roster, selectedIds]
  );

  const inspectorCount = useMemo(
    () => roster.filter((p) => p.category === 'inspector').length,
    [roster]
  );
  const stakeholderCount = useMemo(
    () => roster.filter((p) => p.category === 'stakeholder').length,
    [roster]
  );

  if (!isOpen) return null;

  const toggleParticipant = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectByCategory = (cat: 'inspector' | 'stakeholder') => {
    const ids = roster.filter((p) => p.category === cat).map((p) => p.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const setQuickDate = (daysOffset: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + daysOffset);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    setSelectedIsoDate(`${y}-${m}-${d}`);
  };

  const formattedDate = formatIsoToDisplayDate(selectedIsoDate);
  const computedTimeSlot = `${startTime} - ${endTime}`;

  const selectedProject = useMemo(() => {
    return projectsList.find((p) => p.id === selectedProjectId) || null;
  }, [projectsList, selectedProjectId]);

  const resolvedProjectName = useMemo(() => {
    if (selectedProjectId === '__custom__' || projectName === '__custom__') {
      return customProjectName.trim();
    }
    return selectedProject?.name || projectName.trim();
  }, [selectedProjectId, customProjectName, selectedProject, projectName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Meeting title is required.');
      return;
    }
    if (!selectedIsoDate) {
      setErrorMsg('Please select a meeting date.');
      return;
    }

    const extraEmails = additionalEmails
      .split(',')
      .map((em) => em.trim())
      .filter((em) => em.includes('@'));

    if (selectedParticipants.length === 0 && extraEmails.length === 0) {
      setErrorMsg('Please select at least one registered Stakeholder or Inspector for this meeting.');
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
            date: formattedDate,
            time_slot: computedTimeSlot
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

    const hostName =
      user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email : 'Meeting Host';
    const hostRole = user?.role_name || 'Agency Head / Director General';

    try {
      const realParticipants = [
        {
          user_id: user?.id ? String(user.id) : undefined,
          name: hostName,
          username: user?.username || undefined,
          email: user?.email || '',
          role: hostRole,
          category: 'government',
          status: 'Confirmed'
        },
        ...selectedParticipants.map((p) => ({
          id: p.id,
          user_id: p.user_id,
          name: p.name,
          username: p.username,
          email: p.email,
          role: p.role,
          category: p.category,
          entity_type: p.entity_type,
          organization: p.organization,
          status: 'Invited'
        })),
        ...extraEmails.map((email) => ({
          name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          email,
          role: 'Invited Stakeholder',
          category: 'stakeholder',
          status: 'Invited'
        }))
      ];

      const createdMeeting = await scheduleMeeting({
        title: title.trim(),
        agenda: agenda.trim() || 'Official technical review and inter-agency coordination session.',
        project_name: resolvedProjectName || (selectedProject ? selectedProject.name : 'General Statutory Review'),
        date: formattedDate,
        time_slot: computedTimeSlot,
        meeting_type: meetingType,
        google_meet_url: googleMeetUrl || undefined,
        initiator_name: hostName,
        initiator_role: hostRole,
        bypass_agency_head_check: true,
        send_invite_emails: true,
        participants: realParticipants
      });

      // Also trigger frontend Resend route as backup for immediate delivery
      const meetingRefId = createdMeeting?.id || 'room';
      const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nexucon-frontend-8x3a.vercel.app';

      for (const participant of realParticipants.slice(1)) {
        if (!participant.email || !participant.email.includes('@')) continue;
        const isInsp =
          participant.category === 'inspector' ||
          (participant.role || '').toLowerCase().includes('inspector');
        const portalRoomPath = isInsp
          ? `/inspector/dashboard/meetings/${meetingRefId}/room`
          : `/stakeholder/meetings/${meetingRefId}/room`;
        const liveMeetingUrl = `${originUrl}${portalRoomPath}`;

        sendEmailViaResend({
          to: participant.email,
          subject: `📅 Scheduled Meeting: ${title.trim()}${createdMeeting?.meeting_reference ? ` [${createdMeeting.meeting_reference}]` : ''}`,
          type: 'INVITE_DIRECTOR',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #060D15; color: #f8fafc; padding: 36px 20px; max-width: 600px; margin: 0 auto; border-radius: 20px; border: 1px solid #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="background-color: rgba(59, 130, 246, 0.15); display: inline-block; padding: 6px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.3);">
                  OFFICIAL NEXUCON MEETING INVITATION
                </div>
                <h1 style="color: #ffffff; font-size: 21px; font-weight: 900; margin: 14px 0 6px 0;">Hello ${participant.name}</h1>
                <p style="color: #94a3b8; font-size: 13px; margin: 0;">You have been added to an official coordination meeting on Nexucon.</p>
              </div>

              <div style="background: #0f172a; padding: 22px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 24px;">
                <h2 style="color: #ffffff; font-size: 17px; font-weight: 800; margin: 0 0 14px 0;">${title.trim()}</h2>
                <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; width: 120px;">Date &amp; Time:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #ffffff;">${formattedDate} • ${computedTimeSlot}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8;">Project:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #ffffff;">${resolvedProjectName || 'General Regulatory Review'}${selectedProject?.reference_number ? ` [${selectedProject.reference_number}]` : ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8;">Format:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #60a5fa;">${meetingType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8;">Host:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #ffffff;">${hostName} (${hostRole})</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-bottom: 20px;">
                <a href="${liveMeetingUrl}" style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block;">
                  Join Live Meeting Room →
                </a>
              </div>
            </div>
          `
        }).catch((e) => console.warn('Email dispatch warning', e));
      }

      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `Meeting scheduled! Email & in-app notifications sent to ${selectedParticipants.length + extraEmails.length} participant(s).`,
            type: 'success'
          }
        })
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.detail || err?.message || 'Failed to schedule meeting');
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
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#022C4F] text-white flex items-center justify-center shadow-md shadow-[#022C4F]/20 shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    NEXUCON MEETING HUB
                  </span>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline flex items-center gap-1">
                    • In-App &amp; Email Alerts Enabled
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#022C4F] mt-0.5">
                  Schedule Coordination Meeting
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Info Callout */}
              <div className="p-3.5 bg-gradient-to-br from-blue-50/90 to-indigo-50/50 rounded-2xl border border-blue-200/80 flex items-start gap-3">
                <Bell size={18} className="text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Automatic Stakeholder &amp; Inspector Dispatch
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Select registered Stakeholders and Field Inspectors directly from the platform directory below. Every selected participant receives both an <b>In-App Notification</b> and an <b>Official Email Invitation</b> with a direct link to join from their portal.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Meeting Title & Project Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Meeting Title / Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q3 Structural Stage-Gate Review"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Project / Site <span className="text-red-500">*</span>
                    </label>
                    {projectsList.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {projectsList.length} Active {projectsList.length === 1 ? 'Project' : 'Projects'}
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedProjectId || (projectName === '__custom__' ? '__custom__' : projectName)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__custom__') {
                        setSelectedProjectId('__custom__');
                        setProjectName('__custom__');
                      } else {
                        const p = projectsList.find((proj) => proj.id === val || proj.name === val);
                        if (p) {
                          setSelectedProjectId(p.id);
                          setProjectName(p.name);
                        } else {
                          setSelectedProjectId(val);
                          setProjectName(val);
                        }
                      }
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {projectsList.length === 0 && !isLoadingProjects && (
                      <option value="__custom__">No pre-registered projects found (Enter custom site name)</option>
                    )}
                    {projectsList.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name} ({proj.reference_number || (proj as any).project_number || 'Project'})
                      </option>
                    ))}
                    <option value="__custom__">+ Enter Custom Project Name...</option>
                  </select>

                  {(selectedProjectId === '__custom__' || projectName === '__custom__') && (
                    <input
                      type="text"
                      value={customProjectName}
                      onChange={(e) => setCustomProjectName(e.target.value)}
                      placeholder="Type custom project or site name..."
                      className="w-full mt-2 p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {/* Ongoing Project Details Card */}
                  {selectedProject && selectedProjectId !== '__custom__' && (
                    <div className="mt-2.5 p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
                            <Building2 size={13} className="text-blue-600 shrink-0" />
                            <span>{selectedProject.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span>Ref: <strong className="text-slate-700">{selectedProject.reference_number || (selectedProject as any).project_number || 'PRJ-NXC'}</strong></span>
                            <span>•</span>
                            <span className="capitalize">{selectedProject.project_type || 'Commercial'}</span>
                            {selectedProject.number_of_floors ? (
                              <>
                                <span>•</span>
                                <span>{selectedProject.number_of_floors} Floors</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border shrink-0 ${
                          selectedProject.status === 'ACTIVE' || selectedProject.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {selectedProject.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-200/60 text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Location &amp; LGA:</span>
                          <span className="font-semibold text-slate-700 truncate block">
                            {selectedProject.site_address || selectedProject.lga ? `${selectedProject.site_address || ''}${selectedProject.lga ? ` (${selectedProject.lga})` : ''}` : 'State Jurisdiction'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Regulatory Authority:</span>
                          <span className="font-semibold text-slate-700 truncate block">
                            {selectedProject.regulatory_authority || (selectedProject as any).agency_name || 'Ministry of Physical Planning'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Developer / Org:</span>
                          <span className="font-semibold text-slate-700 truncate block">
                            {selectedProject.developer_organization || selectedProject.developer_name || selectedProject.client_name || 'Registered Developer'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Permit Status:</span>
                          <span className="font-semibold text-slate-700 truncate block">
                            {selectedProject.permit_number ? `Permit #${selectedProject.permit_number}` : (selectedProject.permit_status || 'Under Stage-Gate Review')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2.Registered Stakeholders & Inspectors Selector */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={15} className="text-blue-600" />
                    <span>Select Registered Stakeholders &amp; Inspectors</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => selectByCategory('inspector')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                    >
                      + All Inspectors ({inspectorCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => selectByCategory('stakeholder')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                    >
                      + All Stakeholders ({stakeholderCount})
                    </button>
                    {selectedIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedIds([])}
                        className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Clear ({selectedIds.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs + Search Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex bg-slate-200/70 p-1 rounded-xl shrink-0">
                    {[
                      { id: 'all' as const, label: `All (${roster.length})` },
                      { id: 'inspector' as const, label: `Inspectors (${inspectorCount})` },
                      { id: 'stakeholder' as const, label: `Stakeholders (${stakeholderCount})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setParticipantFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          participantFilter === tab.id
                            ? 'bg-[#022C4F] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, @username, role, firm, or email..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Selected Participants Chips */}
                {selectedParticipants.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedParticipants.map((p) => (
                      <span
                        key={p.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          p.category === 'inspector'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {p.category === 'inspector' ? <HardHat size={11} /> : <Building2 size={11} />}
                        <span>{p.name}</span>
                        {p.username && !p.username.includes('@') && (
                          <span className="opacity-70 font-mono text-[10px]">@{p.username}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleParticipant(p.id)}
                          className="hover:text-red-600 ml-0.5 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Roster List */}
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl">
                  {isLoadingRoster ? (
                    <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 size={15} className="animate-spin text-blue-600" />
                      <span>Loading registered platform stakeholders &amp; inspectors...</span>
                    </div>
                  ) : filteredRoster.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-400">
                      No matching registered stakeholders or inspectors found.
                    </div>
                  ) : (
                    filteredRoster.map((person) => {
                      const isChecked = selectedIds.includes(person.id);
                      const isInspector = person.category === 'inspector';
                      return (
                        <div
                          key={person.id}
                          onClick={() => toggleParticipant(person.id)}
                          className={`p-2.5 px-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isChecked ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isChecked
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check size={12} />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {person.name}
                                </span>
                                {person.username && !person.username.includes('@') && (
                                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                    @{person.username}
                                  </span>
                                )}
                                <span
                                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                    isInspector
                                      ? 'bg-indigo-100 text-indigo-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {person.entity_type || (isInspector ? 'Inspector' : 'Stakeholder')}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {person.role}
                                {person.organization ? ` • ${person.organization}` : ''}
                                {person.email ? ` • ${person.email}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <span className="text-[10px] font-semibold text-slate-400">
                              {isChecked ? 'Selected' : 'Add'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Optional External Guest Email Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdditionalEmailInput((v) => !v)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Mail size={12} />
                    <span>
                      {showAdditionalEmailInput
                        ? 'Hide external guest email field'
                        : '+ Add external guest email (optional)'}
                    </span>
                  </button>
                  {showAdditionalEmailInput && (
                    <input
                      type="text"
                      value={additionalEmails}
                      onChange={(e) => setAdditionalEmails(e.target.value)}
                      placeholder="Optional external email(s), comma-separated"
                      className="w-full mt-2 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* 3. Interactive Date & Time Selectors */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-600" />
                    <span>Meeting Date &amp; Time Selector</span>
                  </label>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {formattedDate} • {computedTimeSlot}
                  </span>
                </div>

                {/* Date Picker + Quick Date Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Select Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        min={getTodayIso()}
                        value={selectedIsoDate}
                        onChange={(e) => setSelectedIsoDate(e.target.value)}
                        className="w-full p-2.5 pl-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="flex-1 py-2.5 px-2 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="flex-1 py-2.5 px-2 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(3)}
                      className="flex-1 py-2.5 px-2 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      In 3 Days
                    </button>
                  </div>
                </div>

                {/* Start & End Time Selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Start Time
                    </label>
                    <div className="relative">
                      <select
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-2.5 pl-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={`start-${t}`} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      End Time
                    </label>
                    <div className="relative">
                      <select
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full p-2.5 pl-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={`end-${t}`} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Preset Time Slot Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SLOTS.map((slot) => {
                    const active = startTime === slot.start && endTime === slot.end;
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        onClick={() => {
                          setStartTime(slot.start);
                          setEndTime(slot.end);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Meeting Type */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Session Medium
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {meetingTypes.map((t) => {
                    const isSelected = meetingType === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMeetingType(t.id)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 text-[#022C4F] shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            <Icon size={15} />
                          </div>
                          {isSelected && <Check size={15} className="text-blue-600" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{t.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{t.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Agenda */}
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
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
              <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <UserCheck size={15} className="text-blue-600" />
                <span>{selectedParticipants.length} Platform Participant(s) Selected</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#022C4F]/20 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Scheduling &amp; Notifying...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Schedule &amp; Notify Participants</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
