"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCheck,
  Building2,
  Trash2,
} from "lucide-react";

export default function InspectorNotificationsPage() {
  const [filter, setFilter] = useState("ALL");

  const sampleNotifications = [
    {
      id: "notif-1",
      category: "Assignment",
      title: "New Project Assignment: Eko Atlantic Tower D",
      desc: "Agency Directorate attached your badge to the Foundation Phase structural inspection.",
      time: "15 minutes ago",
      icon: Building2,
      color: "text-emerald-600",
    },
    {
      id: "notif-2",
      category: "Finding",
      title: "Critical Defect Action Overdue",
      desc: "Contractor remediation on Rebar Cover #FND-88A1 due in 24 hours.",
      time: "2 hours ago",
      icon: AlertTriangle,
      color: "text-amber-600",
    },
    {
      id: "notif-3",
      category: "Sync",
      title: "GPR Radargram Batch Synchronized",
      desc: "14 subsurface profile files uploaded and registered with SHA-256 hashes.",
      time: "5 hours ago",
      icon: Radio,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
            Notifications & Field Alerts
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
            System telemetry, project assignments, finding resolution notices, and sync alerts.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
        {sampleNotifications.map((n) => (
          <div
            key={n.id}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition-all flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
              <n.icon size={18} className={n.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold text-blue-700 uppercase">
                  {n.category}
                </span>
                <span className="text-xs text-slate-400">{n.time}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#022C4F] mb-0.5">{n.title}</h3>
              <p className="text-xs text-slate-600 leading-snug">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
