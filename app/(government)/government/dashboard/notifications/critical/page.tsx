"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, MapPin, Radio, Megaphone, PhoneCall, HandMetal, AlertOctagon, CheckCircle2 } from "lucide-react";

export default function CriticalIssues() {
  const incidents = [
    {
      id: "CRIT-001",
      title: "Work Stoppage: Unstable Trench Wall",
      location: "Sector A, Deep Foundation",
      detectedAt: "15 mins ago",
      status: "Active",
      description: "Trench wall showing signs of collapse near active heavy machinery. All personnel evacuated from immediate vicinity.",
      reporter: "Site Safety Supervisor",
      actionRequired: "Acknowledge receipt and dispatch structural engineer."
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      {/* High Urgency Header */}
      <div className="bg-red-600 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg shadow-red-600/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm mt-1 animate-pulse">
            <AlertOctagon size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              Critical Incidents & Blockers
            </h1>
            <p className="text-red-100 mt-2 max-w-xl text-sm leading-relaxed">
              This dashboard displays high-priority safety incidents, work stoppages, and critical path blockers. Immediate acknowledgement and action are required.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white text-red-700 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-colors">
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
            transition={{ delay: idx * 0.1 }}
            key={incident.id}
            className="bg-white rounded-2xl border-2 border-red-500 shadow-xl overflow-hidden"
          >
            {/* Top Bar */}
            <div className="bg-red-50 px-6 py-3 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  {incident.status} Incident
                </span>
                <span className="text-gray-300">|</span>
                <span className="font-mono text-xs font-bold text-gray-500">{incident.id}</span>
              </div>
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Clock size={14} /> Logged: {incident.detectedAt}
              </span>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{incident.title}</h2>

                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-6 bg-gray-50 inline-flex px-3 py-1.5 rounded-lg border border-gray-200">
                  <MapPin size={16} className="text-red-500" /> {incident.location}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Incident Description</h4>
                    <p className="text-gray-700 leading-relaxed bg-red-50/50 p-4 rounded-xl border border-red-100">
                      {incident.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Reported By:</span>
                    <span className="text-sm font-bold text-gray-700">{incident.reporter}</span>
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="md:w-72 shrink-0 flex flex-col gap-3">
                <div className="bg-red-600 text-white p-4 rounded-xl shadow-inner mb-2">
                  <h4 className="text-xs font-bold uppercase text-red-200 tracking-wider mb-2">Required Action</h4>
                  <p className="text-sm font-semibold">{incident.actionRequired}</p>
                </div>

                <button className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 text-white rounded-xl font-bold shadow-md hover:bg-red-700 transition-colors">
                  <HandMetal size={18} /> Acknowledge
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-red-200 text-red-700 rounded-xl font-bold shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors">
                  <PhoneCall size={18} /> Contact Site Supervisor
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors mt-2">
                  <Megaphone size={18} /> Escalate to Director
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty State / All Clear */}
        {incidents.length === 0 && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">All Clear</h3>
            <p className="text-emerald-700">There are no active critical incidents or work stoppages at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
