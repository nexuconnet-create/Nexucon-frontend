"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  UserCheck,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Calendar,
  Building2,
  ChevronLeft,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Radio,
  FileSearch,
  Search
} from "lucide-react";

export default function StakeholderDispatchPage() {
  const [search, setSearch] = useState("");

  const activeDispatches = [
    {
      id: "DISP-2026-0904",
      inspectionId: "INS-STG-2026-041",
      project: "Eko Atlantic Horizon Towers",
      stage: "Foundation Pour & Rebar Cover",
      inspector: {
        name: "Engr. Olufemi Adebayo",
        role: "Senior Building Inspector",
        badge: "LASBCA-HQ-904",
        phone: "+234 802 345 6789",
        vehicle: "Toyota Hilux (Government Fleet LAG-402-BA)",
        agency: "LASBCA HQ Directorate",
      },
      status: "In Transit",
      eta: "14:00 Today (Est. 25 mins)",
      distance: "4.2 km away",
      departureTime: "13:20 WAT",
      geofenceStatus: "Approving Zone Outer Boundary",
    },
    {
      id: "DISP-2026-0712",
      inspectionId: "INS-STG-2026-044",
      project: "Victoria Island Central Commercial Hub",
      stage: "Level 4 Floor Slab Concrete Pour",
      inspector: {
        name: "Arc. Chioma Nwosu",
        role: "Zonal Review Officer",
        badge: "LASPPPA-ZN-712",
        phone: "+234 803 987 6543",
        vehicle: "Official Transport (LAG-119-PA)",
        agency: "LASPPPA Zonal Office",
      },
      status: "Dispatched",
      eta: "Tomorrow 10:00 WAT",
      distance: "Scheduled",
      departureTime: "Scheduled for 09:15 WAT",
      geofenceStatus: "Pre-dispatch clearance",
    },
  ];

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/stakeholder/inspections"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#022C4F] transition-colors mb-2"
          >
            <ChevronLeft size={16} />
            Back to Building Inspection Desk
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-sm">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
                Field Inspector Dispatch & Live ETA
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time tracking of statutory field inspectors, assigned vehicles, and arrival estimations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/stakeholder/inspections/ncrs"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#022C4F] shadow-sm transition-all"
          >
            NCR Remediation Desk
          </Link>
          <Link
            href="/stakeholder/inspections"
            className="px-4 py-2.5 rounded-xl bg-[#022C4F] text-white text-xs font-bold shadow-md hover:bg-[#033c69] transition-all"
          >
            Stage Inspections
          </Link>
        </div>
      </div>

      {/* Dispatches List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeDispatches.map((disp) => (
          <div
            key={disp.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400">{disp.inspectionId}</span>
                <h3 className="text-base font-bold text-[#022C4F] mt-0.5">{disp.project}</h3>
                <span className="text-xs font-semibold text-blue-600">{disp.stage}</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <Radio size={12} className="text-blue-600 animate-pulse" />
                {disp.status}
              </span>
            </div>

            {/* Live ETA Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#022C4F] to-[#044377] text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-300">
                  Estimated Arrival Window
                </span>
                <span className="text-xs font-mono font-bold bg-white/10 px-2 py-0.5 rounded">
                  {disp.distance}
                </span>
              </div>
              <div className="text-2xl font-black">{disp.eta}</div>
              <div className="flex items-center justify-between text-xs text-white/80 pt-2 border-t border-white/10">
                <span>Departed Station: {disp.departureTime}</span>
                <span className="text-cyan-200 font-semibold">{disp.geofenceStatus}</span>
              </div>
            </div>

            {/* Officer Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-sm text-[#022C4F]">
                  <UserCheck size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#022C4F]">{disp.inspector.name}</div>
                  <div className="text-[11px] text-slate-500">{disp.inspector.role} &bull; {disp.inspector.agency}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Badge: {disp.inspector.badge}</div>
                </div>
              </div>

              <a
                href={`tel:${disp.inspector.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-[#022C4F] font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
              >
                <Phone size={14} />
                <span>Call Inspector</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
