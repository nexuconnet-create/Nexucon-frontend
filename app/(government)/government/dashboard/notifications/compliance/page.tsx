"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, Filter, CheckCircle2, Volume2, ShieldAlert, Droplet, FileWarning } from "lucide-react";

export default function ComplianceAlerts() {
  const alerts = [
    {
      id: "ALT-889",
      title: "Noise Decibel Limit Exceeded (Night Shift)",
      category: "Environmental",
      location: "Zone 2 Perimeter",
      detectedAt: "30 mins ago",
      isUnread: true,
      severity: "Warning",
      snippet: "Sensor N-41 registered sustained noise levels above 85dB between 02:00 and 02:45 AM. Contractor has been automatically notified.",
      icon: Volume2
    },
    {
      id: "ALT-888",
      title: "Failed Concrete Slump Test",
      category: "Quality / Structural",
      location: "Foundation Pour - Sector B",
      detectedAt: "2 hours ago",
      isUnread: true,
      severity: "Action Required",
      snippet: "Batch ticket #4402 failed slump criteria (recorded 8 inches, max allowed 6). Pour was halted by inspector.",
      icon: ShieldAlert
    },
    {
      id: "ALT-885",
      title: "Silt Fence Breach Detected",
      category: "Environmental",
      location: "Western Boundary",
      detectedAt: "Yesterday",
      isUnread: false,
      severity: "Warning",
      snippet: "Drone survey identified a 15ft breach in the perimeter silt fence following heavy rainfall.",
      icon: Droplet
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <div className="relative">
              <AlertTriangle className="text-amber-500" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            Compliance Alerts
          </h1>
          <p className="text-gray-500 mt-1">Automated warnings and inspector-flagged compliance infractions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Unread Only
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
            <CheckCircle2 size={16} />
            Acknowledge All
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-5xl">
        {alerts.map((alert, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={alert.id}
            className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border transition-all ${
              alert.isUnread ? 'bg-white border-amber-200 shadow-md ring-1 ring-amber-500/10' : 'bg-gray-50/50 border-gray-100 shadow-sm opacity-80'
            }`}
          >
            {/* Icon Column */}
            <div className="shrink-0 pt-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                alert.isUnread ? 'bg-amber-100 text-amber-600' : 'bg-white border border-gray-200 text-gray-400'
              }`}>
                <alert.icon size={20} />
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className={`text-base font-bold ${alert.isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                  {alert.title}
                </h3>
                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap flex items-center gap-1">
                  <Clock size={12} /> {alert.detectedAt}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {alert.category}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  alert.severity === 'Action Required' ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                }`}>
                  {alert.severity}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-xs font-semibold text-gray-500">{alert.location}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                {alert.snippet}
              </p>
              
              <div className="flex flex-wrap items-center gap-3">
                <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  alert.isUnread ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                  <FileWarning size={14} /> Generate NCR (Non-Conformance)
                </button>
                {alert.isUnread && (
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    Acknowledge & Dismiss
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
