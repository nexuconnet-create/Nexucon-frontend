"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Clock, MapPin, Radio, Megaphone, PhoneCall, 
  HandMetal, AlertOctagon, CheckCircle2, RefreshCw, 
  SlidersHorizontal, MessageSquare 
} from "lucide-react";
import { 
  Notification, getNotifications, 
  acknowledgeCriticalIncident, createNotification 
} from "@/services/notifications";
import SoundAlarmModal from "@/components/dashboard/SoundAlarmModal";
import ContactSupervisorModal from "@/components/dashboard/ContactSupervisorModal";
import NotificationActionDrawer from "@/components/dashboard/NotificationActionDrawer";
import NotificationPreferencesModal from "@/components/dashboard/NotificationPreferencesModal";

export default function CriticalIssues() {
  const [incidents, setIncidents] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlarmOpen, setIsAlarmOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Notification | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  const fetchCriticalIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications({ category: 'CRITICAL' });
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load critical incidents", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCriticalIncidents();
  }, [fetchCriticalIncidents]);

  const handleOpenAction = (incident: Notification) => {
    setSelectedIncident(incident);
    setIsDrawerOpen(true);
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeCriticalIncident(id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Incident successfully acknowledged and logged!', type: 'success' } 
      }));
      fetchCriticalIncidents();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to acknowledge incident', type: 'error' } }));
    }
  };

  const handleEscalateToDirector = async (incident: Notification) => {
    try {
      await createNotification({
        category: 'CRITICAL',
        title: `EXECUTIVE ESCALATION: ${incident.title}`,
        message: `Direct ministerial escalation triggered for critical incident: ${incident.message}`,
        priority: 'Critical',
        location: incident.location,
        recipient_role: 'Director General'
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Escalation dispatched directly to Director General!`, type: 'success' } 
      }));
      fetchCriticalIncidents();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to escalate', type: 'error' } }));
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* High Urgency Header */}
      <div className="bg-red-600 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-xl shadow-red-600/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm mt-1 animate-pulse">
            <AlertOctagon size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              Critical Incidents &amp; Blockers
            </h1>
            <p className="text-red-100 mt-2 max-w-xl text-xs sm:text-sm leading-relaxed">
              High-priority safety incidents, work stoppages, and critical structural collapse risks. Immediate triage and action required.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsPrefsOpen(true)}
            className="px-4 py-3 bg-red-700/60 hover:bg-red-700 text-white border border-red-400/40 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal size={15} />
            <span>Email Settings</span>
          </button>

          <button 
            onClick={fetchCriticalIncidents}
            className="p-3 bg-red-700/50 hover:bg-red-700 rounded-2xl text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={() => setIsAlarmOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-white text-red-700 rounded-2xl font-bold shadow-lg hover:bg-red-50 transition-colors text-xs sm:text-sm cursor-pointer"
          >
            <Radio size={16} />
            <span>Sound Site Alarm</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 max-w-5xl">
        {incidents.map((incident, idx) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={incident.id}
            className={`rounded-3xl border-2 shadow-xl overflow-hidden bg-white ${
              incident.is_acknowledged ? 'border-slate-200 opacity-90' : 'border-red-500 ring-2 ring-red-400/20'
            }`}
          >
            {/* Top Bar */}
            <div className={`px-6 py-3 border-b flex items-center justify-between ${
              incident.is_acknowledged ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-100'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                  incident.is_acknowledged ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  {!incident.is_acknowledged && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                  {incident.is_acknowledged ? 'Acknowledged Incident' : `${incident.severity || 'Critical Active'} Incident`}
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-mono text-xs font-bold text-slate-500">{incident.notification_reference}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Clock size={14} /> {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 sm:gap-8">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">{incident.title}</h2>

                {incident.location && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 mb-4 bg-slate-50 inline-flex px-3 py-1.5 rounded-xl border border-slate-200">
                    <MapPin size={15} className="text-red-500" />
                    <span>{incident.location}</span>
                  </div>
                )}

                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 mb-6">
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {incident.message}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => handleOpenAction(incident)}
                    className="px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>Attend &amp; Issue Directives</span>
                  </button>

                  {!incident.is_acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(incident.id)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>Acknowledge Incident</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedIncident(incident);
                      setIsContactOpen(true);
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PhoneCall size={14} />
                    <span>Call Supervisor</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {incidents.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500">
            No critical incidents or safety blockers active.
          </div>
        )}
      </div>

      {/* Sidepop Action Drawer */}
      <NotificationActionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notification={selectedIncident}
        onUpdated={fetchCriticalIncidents}
      />

      {/* Modals */}
      <SoundAlarmModal
        isOpen={isAlarmOpen}
        onClose={() => setIsAlarmOpen(false)}
      />

      <ContactSupervisorModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        notification={selectedIncident}
      />

      <NotificationPreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
      />
    </div>
  );
}
