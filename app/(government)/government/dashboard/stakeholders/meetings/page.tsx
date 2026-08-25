"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, Video, Phone, Users, Clock, Plus, 
  ShieldCheck, MapPin, Play, RefreshCw, UserCheck, 
  CheckCircle2, AlertCircle, ListTodo 
} from "lucide-react";
import { 
  StakeholderMeeting, getMeetings, startMeeting, 
  addMeetingActionItem 
} from "@/services/stakeholders";
import ScheduleMeetingModal from "@/components/dashboard/ScheduleMeetingModal";
import MeetingCallRoomModal from "@/components/dashboard/MeetingCallRoomModal";
import PaginationBar from "@/components/dashboard/PaginationBar";

export default function StakeholderMeetings() {
  const [meetings, setMeetings] = useState<StakeholderMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [activeCallMeeting, setActiveCallMeeting] = useState<StakeholderMeeting | null>(null);
  const [isCallRoomOpen, setIsCallRoomOpen] = useState(false);
  const [newActionText, setNewActionText] = useState<Record<string, string>>({});

  // Pagination
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
      setActiveCallMeeting(meeting);
      setIsCallRoomOpen(true);
      fetchMeetings();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to launch call room', type: 'error' } }));
    }
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

  const paginatedMeetings = meetings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
              <Calendar className="text-blue-500" />
              Stakeholder Council Meetings &amp; Calls
            </h1>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
              Agency Head Authorization
            </span>
          </div>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Official cross-stakeholder sessions, live video conferences, and technical coordination councils.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchMeetings}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl font-bold shadow-md shadow-[#022C4F]/20 transition-all text-xs cursor-pointer"
          >
            <Plus size={15} /> Schedule Official Meeting
          </button>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {paginatedMeetings.map((mtg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            key={mtg.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {mtg.meeting_reference}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      mtg.status === 'In Progress' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' :
                      mtg.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {mtg.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">{mtg.title}</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Project: {mtg.project_name}</p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-100">
                  {mtg.meeting_type === 'Video Call' ? <Video size={20} className="text-blue-500" /> : <Phone size={20} className="text-emerald-500" />}
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100/80 leading-relaxed font-medium">
                &ldquo;{mtg.agenda}&rdquo;
              </p>

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <Calendar size={14} className="text-blue-500" /> {mtg.date}
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <Clock size={14} className="text-amber-500" /> {mtg.time_slot}
                </div>
              </div>

              {/* Attendees */}
              <div className="mb-4">
                <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Confirmed Stakeholders</span>
                <div className="flex flex-wrap gap-1.5">
                  {(mtg.participants || []).map((p, pIdx) => (
                    <span key={pIdx} className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {p.name} ({p.role})
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Items List */}
              {mtg.action_items && mtg.action_items.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <span className="block text-[10px] font-bold uppercase text-blue-800 tracking-wider mb-1.5 flex items-center gap-1">
                    <ListTodo size={12} /> Assigned Deliverables
                  </span>
                  <div className="space-y-1">
                    {mtg.action_items.map((item) => (
                      <div key={item.id} className="text-xs text-slate-700 font-medium flex items-center justify-between">
                        <span>• {item.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{item.due_date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                <ShieldCheck size={13} className="text-blue-500" /> Authorized Room
              </div>

              <button
                onClick={() => handleLaunchCall(mtg)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  mtg.status === 'In Progress'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 animate-pulse'
                    : 'bg-[#022C4F] hover:bg-[#033c6c] text-white shadow-[#022C4F]/20'
                }`}
              >
                <Play size={12} />
                <span>{mtg.status === 'In Progress' ? 'Join Live Session' : 'Launch Call Room'}</span>
              </button>
            </div>
          </motion.div>
        ))}

        {meetings.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm col-span-2">
            No stakeholder council meetings currently scheduled.
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {meetings.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6 max-w-6xl">
          <PaginationBar
            currentPage={currentPage}
            totalItems={meetings.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[2, 4, 8, 16]}
          />
        </div>
      )}

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={fetchMeetings}
      />

      {/* Live Call Room Modal */}
      <MeetingCallRoomModal
        isOpen={isCallRoomOpen}
        onClose={() => setIsCallRoomOpen(false)}
        meeting={activeCallMeeting}
      />
    </div>
  );
}
