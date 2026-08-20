"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Video, Phone, Users, Clock, Plus, ShieldCheck, MapPin, Play, RefreshCw, UserCheck } from "lucide-react";
import { StakeholderMeeting, getMeetings, startMeeting } from "@/services/stakeholders";
import ScheduleMeetingModal from "@/components/dashboard/ScheduleMeetingModal";
import MeetingCallRoomModal from "@/components/dashboard/MeetingCallRoomModal";

export default function StakeholderMeetings() {
  const [meetings, setMeetings] = useState<StakeholderMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [activeCallMeeting, setActiveCallMeeting] = useState<StakeholderMeeting | null>(null);
  const [isCallRoomOpen, setIsCallRoomOpen] = useState(false);

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

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
              <Calendar className="text-blue-500" />
              Stakeholder Council Meetings & Calls
            </h1>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
              Agency Head Authorization
            </span>
          </div>
          <p className="text-gray-500 mt-1">Official cross-stakeholder sessions, live video conferences, and coordination councils.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchMeetings}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all text-sm"
          >
            <Plus size={16} /> Schedule Official Meeting
          </button>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {meetings.map((mtg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={mtg.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
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
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">{mtg.title}</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Project: {mtg.project_name}</p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-100">
                  {mtg.meeting_type === 'Video Call' ? <Video size={20} className="text-blue-500" /> : <Phone size={20} className="text-emerald-500" />}
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100/80 leading-relaxed">
                "{mtg.agenda}"
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
                  {mtg.participants.map((p, pIdx) => (
                    <span key={pIdx} className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {p.name} ({p.role})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
              <span className="text-xs text-slate-400 font-medium">
                Initiator: <span className="font-bold text-slate-700">{mtg.initiator_name}</span>
              </span>

              <button 
                onClick={() => handleLaunchCall(mtg)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Play size={14} /> Join Video/Call Room
              </button>
            </div>
          </motion.div>
        ))}

        {meetings.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm col-span-2">
            No official stakeholder meetings scheduled. Agency Head can schedule a session above.
          </div>
        )}
      </div>

      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={fetchMeetings}
      />

      <MeetingCallRoomModal
        isOpen={isCallRoomOpen}
        onClose={() => setIsCallRoomOpen(false)}
        meeting={activeCallMeeting}
      />
    </div>
  );
}
