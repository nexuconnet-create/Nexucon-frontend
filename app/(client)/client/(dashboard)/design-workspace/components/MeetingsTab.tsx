"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Video, Phone, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import { getMeetings, StakeholderMeeting } from "@/services/stakeholders";

export default function MeetingsTab() {
  const [meetings, setMeetings] = useState<StakeholderMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getMeetings();
        if (cancelled) return;
        // Upcoming = still scheduled or in progress. Everything else is history.
        setMeetings(data.filter((m) => m.status === 'Scheduled' || m.status === 'In Progress'));
      } catch (err) {
        if (!cancelled) setError("Meetings could not be loaded.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleJoin = (meeting: StakeholderMeeting) => {
    if (meeting.google_meet_url) {
      window.open(meeting.google_meet_url, '_blank');
    } else {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'No meeting link has been recorded for this meeting yet.', type: 'warning' }
      }));
    }
  };

  const typeBadge = (type: StakeholderMeeting['meeting_type']) =>
    type === 'In-Person Council'
      ? { label: 'On-Site', cls: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]' }
      : { label: 'Virtual', cls: 'bg-[#E1F5FE] text-[#0277BD] border-[#B3E5FC]' };

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-3">Upcoming Meetings</h3>
          <p className="text-[11px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
            Schedule, manage, and participate in project meetings, design reviews, stakeholder discussions, peer-review sessions, and coordination workshops throughout the project lifecycle.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Schedule Meeting executed successfully!', type: 'success' } })); }}
        >
          Schedule Meeting
        </Button>
      </div>

      {isLoading && (
        <div className="border border-[#022C4F] rounded-[32px] p-12 text-center text-[12px] font-medium text-gray-500">
          Loading meetings…
        </div>
      )}

      {!isLoading && error && (
        <div className="border border-rose-200 bg-rose-50/60 rounded-[32px] p-12 text-center">
          <p className="text-[12px] font-bold text-rose-700">{error}</p>
          <p className="text-[11px] text-gray-500 mt-1">Check your connection and try again.</p>
        </div>
      )}

      {!isLoading && !error && meetings.length === 0 && (
        <div className="border border-[#022C4F] rounded-[32px] p-12 text-center">
          <Calendar size={32} className="mx-auto mb-3 text-[#022C4F]/40" />
          <p className="text-[13px] font-bold text-[#022C4F]">No upcoming meetings scheduled.</p>
          <p className="text-[11px] text-gray-500 mt-1">Meetings will appear here once they are scheduled for this project.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {meetings.map((meeting) => {
          const badge = typeBadge(meeting.meeting_type);
          return (
            <div key={meeting.id} className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm min-h-[400px]">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-[15px] font-bold text-[#022C4F] pr-4">{meeting.title}</h4>
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${badge.cls}`}>{badge.label}</span>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-[#0277BD]" />
                  <span className="text-[11px] text-gray-600 font-medium">
                    {meeting.date ? new Date(meeting.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-[#0277BD]" />
                  <span className="text-[11px] text-gray-600 font-medium">{meeting.time_slot || '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-[#E53935]" />
                  <span className="text-[11px] text-gray-600 font-medium">
                    {meeting.meeting_type === 'In-Person Council'
                      ? (meeting.agenda ? 'In-person — see agenda for venue details' : 'In-person')
                      : (meeting.google_meet_url
                          ? <a href={meeting.google_meet_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#0277BD] font-medium hover:underline flex items-center gap-1"><Video size={11} /> Virtual Meeting (Open Link)</a>
                          : 'Virtual — link not yet recorded')}
                  </span>
                </div>
              </div>

              <h5 className="text-[13px] font-bold text-[#022C4F] mb-4">Project Details</h5>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-start">
                  <span className="text-[11px] text-[#0F181F] font-bold w-24 shrink-0">Project:</span>
                  <span className="text-[11px] text-gray-600 font-medium">{meeting.project_name || '—'}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-[11px] text-[#0F181F] font-bold w-24 shrink-0">Organizer:</span>
                  <span className="text-[11px] text-gray-600 font-medium">
                    {meeting.initiator_name || '—'}{meeting.initiator_role ? ` (${meeting.initiator_role})` : ''}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-[11px] text-[#0F181F] font-bold w-24 shrink-0">Participants:</span>
                  <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1.5">
                    <Users size={11} /> {meeting.participants?.length || 0} Invited
                  </span>
                </div>
                <div className="flex items-start flex-col gap-2">
                  <span className="text-[11px] text-[#0F181F] font-bold shrink-0">Agenda:</span>
                  {meeting.agenda ? (
                    <span className="text-[11px] text-gray-600 pl-2">{meeting.agenda}</span>
                  ) : (
                    <span className="text-[11px] text-gray-400 pl-2">No agenda recorded yet.</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-4 max-w-[90%]">
                <button
                  onClick={() => handleJoin(meeting)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {meeting.meeting_type === 'In-Person Council' ? 'Meeting Details' : 'Join Meeting'}
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: meeting.minutes_notes ? 'Meeting minutes available.' : 'No notes recorded for this meeting yet.', type: meeting.minutes_notes ? 'success' : 'warning' } })); }}
                  className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
                >
                  View Notes
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
