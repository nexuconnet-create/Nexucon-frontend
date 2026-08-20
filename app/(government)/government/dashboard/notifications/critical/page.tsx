"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Radio, Megaphone, PhoneCall, HandMetal, AlertOctagon, CheckCircle2, RefreshCw } from "lucide-react";
import { Notification, getNotifications, acknowledgeCriticalIncident, createNotification } from "@/services/notifications";
import SoundAlarmModal from "@/components/dashboard/SoundAlarmModal";
import ContactSupervisorModal from "@/components/dashboard/ContactSupervisorModal";

export default function CriticalIssues() {
  const [incidents, setIncidents] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlarmOpen, setIsAlarmOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Notification | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

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
              Critical Incidents & Blockers
            </h1>
            <p className="text-red-100 mt-2 max-w-xl text-sm leading-relaxed">
              High-priority safety incidents, work stoppages, and critical path collapse risks. Immediate acknowledgement and action are required.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button 
            onClick={fetchCriticalIncidents}
            className="p-3 bg-red-700/50 hover:bg-red-700 rounded-2xl text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsAlarmOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-white text-red-700 rounded-2xl font-bold shadow-lg hover:bg-red-50 transition-colors text-sm"
          >
            <Radio size={18} />
            Sound Site Alarm
          </button>
        </div>
      </div>

      <div className="space-y-6 max-w-5xl">
        {incidents.map((incident, idx) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.08 }}
            key={incident.id}
            className={`rounded-3xl border-2 shadow-xl overflow-hidden bg-white ${
              incident.is_acknowledged ? 'border-gray-200 opacity-90' : 'border-red-500'
            }`}
          >
            {/* Top Bar */}
            <div className={`px-6 py-3 border-b flex items-center justify-between ${
              incident.is_acknowledged ? 'bg-gray-50 border-gray-100' : 'bg-red-50 border-red-100'
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
                  {incident.is_acknowledged ? 'Acknowledged Incident' : `${incident.severity || 'Active'} Incident`}
                </span>
                <span className="text-gray-300">|</span>
                <span className="font-mono text-xs font-bold text-gray-500">{incident.notification_reference}</span>
              </div>
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Clock size={14} /> {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{incident.title}</h2>

                {incident.location && (
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-6 bg-gray-50 inline-flex px-3 py-1.5 rounded-xl border border-gray-200">
                    <MapPin size={16} className="text-red-500" /> {incident.location}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Incident Description</h4>
                    <p className="text-gray-700 leading-relaxed bg-red-50/40 p-4 rounded-2xl border border-red-100">
                      {incident.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Reported To:</span>
                    <span className="text-sm font-bold text-gray-700">{incident.recipient_role || 'Site Safety Team'}</span>
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="md:w-72 shrink-0 flex flex-col gap-3">
                <div className="bg-red-600 text-white p-4 rounded-2xl shadow-inner mb-2">
                  <h4 className="text-xs font-bold uppercase text-red-200 tracking-wider mb-2">Required Action</h4>
                  <p className="text-sm font-semibold">{incident.action_required || 'Immediate site verification required.'}</p>
                </div>

                {!incident.is_acknowledged ? (
                  <button 
                    onClick={() => handleAcknowledge(incident.id)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 text-white rounded-2xl font-bold shadow-md hover:bg-red-700 transition-colors text-sm"
                  >
                    <HandMetal size={18} /> Acknowledge
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl font-bold text-sm">
                    <CheckCircle2 size={18} /> Acknowledged
                  </div>
                )}

                <button 
                  onClick={() => { setSelectedIncident(incident); setIsContactOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-red-200 text-red-700 rounded-2xl font-bold shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors text-sm"
                >
                  <PhoneCall size={18} /> Contact Site Supervisor
                </button>

                <button 
                  onClick={() => handleEscalateToDirector(incident)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors text-sm"
                >
                  <Megaphone size={18} /> Escalate to Director
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {incidents.length === 0 && !isLoading && (
          <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">All Clear</h3>
            <p className="text-emerald-700 font-medium">There are no active critical incidents or work stoppages at this time.</p>
          </div>
        )}
      </div>

      <SoundAlarmModal
        isOpen={isAlarmOpen}
        onClose={() => setIsAlarmOpen(false)}
        onSuccess={fetchCriticalIncidents}
      />

      <ContactSupervisorModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        notification={selectedIncident}
      />
    </div>
  );
}
