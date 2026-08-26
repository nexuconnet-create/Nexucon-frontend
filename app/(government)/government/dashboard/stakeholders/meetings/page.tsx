"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, Video, Phone, Users, Clock, Plus, 
  ShieldCheck, MapPin, Play, RefreshCw, UserCheck, 
  CheckCircle2, AlertCircle, ListTodo, ChevronLeft, ChevronRight, 
  Globe, ExternalLink, Sparkles, Filter, LayoutGrid, List
} from "lucide-react";
import { 
  StakeholderMeeting, getMeetings, startMeeting, 
  addMeetingActionItem 
} from "@/services/stakeholders";
import ScheduleMeetingModal from "@/components/dashboard/ScheduleMeetingModal";
import PaginationBar from "@/components/dashboard/PaginationBar";

export default function StakeholderMeetings() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<StakeholderMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [newActionText, setNewActionText] = useState<Record<string, string>>({});

  // View Mode: 'calendar' (Google Calendar Grid) vs 'list' (Agenda List)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Active Calendar Month & Year (Default to current date or August 2026)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 26)); // August 2026

  // Selected Date for Popover / Quick View
  const [selectedDayEvents, setSelectedDayEvents] = useState<StakeholderMeeting[] | null>(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>('');

  // Pagination for List View
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (err) {
      console.error("Failed to load meetings", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
    setCurrentPage(1);
  }, [fetchMeetings]);

  const handleLaunchCall = async (meeting: StakeholderMeeting) => {
    try {
      await startMeeting(meeting.id);
    } catch (err) {
      console.warn("Meeting start sync note", err);
    }
    // Navigate directly to the dedicated room page
    router.push(`/government/dashboard/stakeholders/meetings/${meeting.id}/room`);
  };

  const handleAddActionItem = async (meetingId: string) => {
    const text = newActionText[meetingId];
    if (!text || !text.trim()) return;

    try {
      await addMeetingActionItem(meetingId, { title: text.trim() });
      setNewActionText(prev => ({ ...prev, [meetingId]: '' }));
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Action item recorded for council session', type: 'success' }
      }));
      fetchMeetings();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to add action item', type: 'error' }
      }));
    }
  };

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date(2026, 7, 26)); // August 2026 reference
  };

  // Map meetings to calendar dates
  // meeting.date strings: e.g. "Aug 28, 2026", "Aug 30, 2026", "Oct 24, 2026"
  const meetingsByDay = useMemo(() => {
    const map: Record<number, StakeholderMeeting[]> = {};
    meetings.forEach(m => {
      // Try to parse day number
      const match = m.date.match(/(\d+)/);
      if (match) {
        const dayNum = parseInt(match[1], 10);
        if (dayNum >= 1 && dayNum <= 31) {
          if (!map[dayNum]) map[dayNum] = [];
          map[dayNum].push(m);
        }
      }
    });
    return map;
  }, [meetings]);

  const paginatedMeetings = meetings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full min-h-screen pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
              <CalendarIcon className="text-blue-500" />
              Stakeholder Council Meetings &amp; Google Meet Calendar
            </h1>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <Globe size={11} className="text-blue-600" />
              Google Meet API Enabled
            </span>
          </div>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Official cross-stakeholder sessions, live Google Meet video rooms, and monthly regulatory scheduling matrix.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle: Calendar Grid vs List */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200/80">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar' 
                  ? 'bg-white text-[#022C4F] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Month Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-white text-[#022C4F] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List size={14} />
              <span>Agenda List</span>
            </button>
          </div>

          <button 
            onClick={fetchMeetings}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: GOOGLE CALENDAR MONTHLY GRID */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          
          {/* Calendar Toolbar */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={jumpToToday}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Today
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-[#022C4F]">
                {monthName} {year}
              </h2>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-600">Video Call (Google Meet)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span className="text-slate-600">Audio Bridge</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-slate-600">In-Person Council</span>
              </span>
            </div>
          </div>

          {/* Month Calendar Grid Matrix */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center text-xs font-black uppercase tracking-wider text-slate-400 py-3">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
              
              {/* Empty leading padding slots */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="min-h-[115px] p-2 bg-slate-50/30" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isToday = dayNum === 26 && month === 7; // Reference Aug 26
                const dayEvents = meetingsByDay[dayNum] || [];

                return (
                  <div
                    key={dayNum}
                    onClick={() => {
                      if (dayEvents.length > 0) {
                        setSelectedDayEvents(dayEvents);
                        setSelectedDateLabel(`${monthName} ${dayNum}, ${year}`);
                      }
                    }}
                    className={`min-h-[115px] p-2 transition-all group flex flex-col justify-between ${
                      dayEvents.length > 0 ? 'hover:bg-blue-50/30 cursor-pointer' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isToday 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black' 
                          : 'text-slate-700'
                      }`}>
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                          {dayEvents.length} mtg
                        </span>
                      )}
                    </div>

                    {/* Meeting Chips */}
                    <div className="space-y-1 overflow-hidden">
                      {dayEvents.map((m) => {
                        const isVideo = m.meeting_type === 'Video Call';
                        const isAudio = m.meeting_type === 'Audio Call';
                        const badgeColor = isVideo 
                          ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' 
                          : isAudio 
                            ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';

                        return (
                          <div
                            key={m.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLaunchCall(m);
                            }}
                            className={`p-1.5 rounded-xl border text-[11px] font-bold transition-all truncate flex items-center justify-between gap-1 shadow-2xs ${badgeColor}`}
                            title={`${m.title} (${m.time_slot}) - Click to Join`}
                          >
                            <div className="flex items-center gap-1 truncate">
                              {isVideo && <Video size={11} className="shrink-0 text-blue-600" />}
                              {isAudio && <Phone size={11} className="shrink-0 text-purple-600" />}
                              {!isVideo && !isAudio && <MapPin size={11} className="shrink-0 text-emerald-600" />}
                              <span className="truncate">{m.title}</span>
                            </div>
                            <span className="text-[9px] font-mono shrink-0 px-1 rounded bg-white/80">
                              Join
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="h-1" />
                  </div>
                );
              })}
            </div>

          </div>

          {/* Quick Day Event Popover Modal */}
          <AnimatePresence>
            {selectedDayEvents && (
              <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-[#0F181F]/50 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Scheduled Sessions
                      </span>
                      <h3 className="text-base font-black text-[#022C4F] mt-1">{selectedDateLabel}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedDayEvents(null)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedDayEvents.map((m) => (
                      <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-blue-700">{m.meeting_reference}</span>
                            <span className="text-[10px] font-bold text-slate-500">{m.time_slot}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{m.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{m.agenda}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <span className="text-xs font-bold text-slate-600">{m.project_name}</span>
                          <button
                            onClick={() => handleLaunchCall(m)}
                            className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                          >
                            <Play size={12} fill="white" />
                            <span>Join Conference Room</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* VIEW MODE 2: AGENDA LIST */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {paginatedMeetings.map((meeting) => {
              const isVideo = meeting.meeting_type === 'Video Call';
              const isAudio = meeting.meeting_type === 'Audio Call';

              return (
                <div
                  key={meeting.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                          {meeting.meeting_reference}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                          isVideo ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          isAudio ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {meeting.meeting_type}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {meeting.status}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-[#022C4F]">{meeting.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{meeting.agenda}</p>
                    </div>

                    <button
                      onClick={() => handleLaunchCall(meeting)}
                      className="px-5 py-3 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#022C4F]/20 cursor-pointer self-start shrink-0"
                    >
                      <Play size={14} fill="white" />
                      <span>Join Council Room</span>
                    </button>
                  </div>

                  {/* Metadata Row */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-blue-500" />
                      <span>{meeting.date} • {meeting.time_slot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span>{meeting.participants?.length || 4} Council Stakeholders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Project: {meeting.project_name}</span>
                    </div>
                  </div>

                  {/* Action Items Mini List */}
                  {meeting.action_items && meeting.action_items.length > 0 && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                        <ListTodo size={12} /> Recorded Action Items ({meeting.action_items.length})
                      </p>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {meeting.action_items.map((act) => (
                          <li key={act.id} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>{act.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({act.due_date})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {meetings.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6">
              <PaginationBar
                currentPage={currentPage}
                totalItems={meetings.length}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Schedule Meeting Slide-Over Drawer */}
      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={fetchMeetings}
      />

    </div>
  );
}
