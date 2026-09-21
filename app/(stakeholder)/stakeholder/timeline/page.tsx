"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Plus,
  Download,
  Share2,
  Building2,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";

export default function StakeholderTimelinePage() {
  const [selectedProject, setSelectedProject] = useState("Eko Atlantic Horizon Towers");

  const milestones = [
    {
      id: "MS-01",
      name: "Architectural & MEP Drawing Approval",
      category: "Regulatory Permitting",
      startDate: "01 Aug 2026",
      dueDate: "15 Aug 2026",
      isHoldPoint: true,
      governmentSignoff: "Approved by LASPPPA",
      progress: 100,
      status: "Completed",
    },
    {
      id: "MS-02",
      name: "Soil Investigation & Deep Foundation Piling",
      category: "Civil & Substructure",
      startDate: "16 Aug 2026",
      dueDate: "05 Sep 2026",
      isHoldPoint: true,
      governmentSignoff: "Approved by LASBCA",
      progress: 100,
      status: "Completed",
    },
    {
      id: "MS-03",
      name: "Level 1 to 3 Reinforced Concrete Slab Pour",
      category: "Structural Construction",
      startDate: "06 Sep 2026",
      dueDate: "26 Sep 2026",
      isHoldPoint: true,
      governmentSignoff: "Pending Inspection Pass (INS-041)",
      progress: 85,
      status: "Active Hold-Point",
    },
    {
      id: "MS-04",
      name: "Superstructure Steel Framing (Levels 4–12)",
      category: "Structural Construction",
      startDate: "27 Sep 2026",
      dueDate: "25 Oct 2026",
      isHoldPoint: false,
      governmentSignoff: "Awaiting Gate 3 Clearance",
      progress: 20,
      status: "Upcoming",
    },
    {
      id: "MS-05",
      name: "Fire Life Safety & MEP Riser Installation",
      category: "Building Services",
      startDate: "26 Oct 2026",
      dueDate: "20 Nov 2026",
      isHoldPoint: true,
      governmentSignoff: "Federal Fire Service Clearance",
      progress: 0,
      status: "Future Gate",
    },
    {
      id: "MS-06",
      name: "Pre-Occupancy Final Inspection & Certificate of Completion",
      category: "Statutory Commissioning",
      startDate: "21 Nov 2026",
      dueDate: "15 Dec 2026",
      isHoldPoint: true,
      governmentSignoff: "Ministerial Certificate of Occupancy",
      progress: 0,
      status: "Final Gate",
    },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
            <Calendar size={14} />
            Pillar 2 &bull; Project Timeline & Stage-Gates
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
            Timeline & Stage-Gate Governance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Critical path schedule synchronized with statutory government approval hold-points and contractor deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { message: "Syncing timeline with Google Calendar and iCal...", type: "info" }
            }))}
            className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Export Calendar</span>
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { message: "Timeline revision proposal submitted to Project Team!", type: "success" }
            }))}
            className="flex items-center gap-2 px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold cursor-pointer"
          >
            <Plus size={15} />
            <span>Propose Schedule Revision</span>
          </button>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-[#022C4F]" />
          <span className="text-xs font-bold text-gray-500">Active Project:</span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-[#022C4F] bg-gray-50 focus:outline-none"
          >
            <option value="Eko Atlantic Horizon Towers">Eko Atlantic Horizon Towers</option>
            <option value="Victoria Island Central Commercial Hub">Victoria Island Central Commercial Hub</option>
            <option value="Lekki Phase 1 Residential Estate">Lekki Phase 1 Residential Estate</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-gray-500 font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-gray-500 font-medium">Active Hold-Point</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
            <span className="text-gray-500 font-medium">Upcoming</span>
          </div>
        </div>
      </div>

      {/* Critical Path Gantt & Milestones Container */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#022C4F]">Stage-Gate Regulatory Sequence</h2>
          <p className="text-xs text-gray-400">
            Mandatory hold-points enforce that physical construction cannot proceed without official government stage certification.
          </p>
        </div>

        <div className="space-y-6">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                m.status === "Active Hold-Point"
                  ? "bg-amber-50/40 border-amber-200 shadow-sm"
                  : m.status === "Completed"
                  ? "bg-gray-50/50 border-gray-100"
                  : "bg-white border-gray-100 opacity-80"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-mono text-xs font-bold text-[#022C4F] shrink-0 shadow-xs">
                    {m.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#022C4F]">{m.name}</h3>
                      {m.isHoldPoint && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          Statutory Hold-Point
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{m.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      m.status === "Completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : m.status === "Active Hold-Point"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Dates */}
              <div className="my-3">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5">
                  <span>Start: <strong>{m.startDate}</strong></span>
                  <span>Progress: <strong className="text-[#022C4F]">{m.progress}%</strong></span>
                  <span>Gate Due: <strong>{m.dueDate}</strong></span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.progress === 100
                        ? "bg-emerald-500"
                        : m.isHoldPoint
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              </div>

              {/* Government Signoff Stamp Box */}
              <div className="mt-3 pt-3 border-t border-gray-100/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className={m.progress === 100 ? "text-emerald-600" : "text-amber-600"} />
                  <span>Statutory Clearance: <strong>{m.governmentSignoff}</strong></span>
                </div>
                {m.status === "Active Hold-Point" && (
                  <Link
                    href="/stakeholder/inspections"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>Coordinate Inspection Pass</span>
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
