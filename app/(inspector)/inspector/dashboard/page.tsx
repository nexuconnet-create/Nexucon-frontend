"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  ClipboardCheck,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Clock,
  MapPin,
  ChevronRight,
  RefreshCw,
  Play,
  CheckCircle2,
  FileText,
  Eye,
  Activity,
  Calendar,
  ArrowUpRight,
  ExternalLink,
  Scan,
  Radio,
  Zap,
  Bell,
  User,
  Settings,
  AlertOctagon,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { getInspectorDashboard, InspectorDashboardData } from "@/services/inspector";
import { getPendingSyncCount, getVerifiedEvidenceCount } from "@/lib/offline-sync";

export default function InspectorDashboardPage() {
  const [data, setData] = useState<InspectorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingSync, setPendingSync] = useState(3);
  const [verifiedFiles, setVerifiedFiles] = useState(247);

  const fetchData = async () => {
    try {
      const res = await getInspectorDashboard();
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    setPendingSync(getPendingSyncCount());
    setVerifiedFiles(getVerifiedEvidenceCount());

    const handleSyncUpdate = () => {
      setPendingSync(getPendingSyncCount());
      setVerifiedFiles(getVerifiedEvidenceCount());
    };
    window.addEventListener("nexucon_sync_updated", handleSyncUpdate);
    return () => window.removeEventListener("nexucon_sync_updated", handleSyncUpdate);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const profile = data?.profile;
  const kpis = data?.kpis;

  // Static wireframe reference schedule items if dynamic are fewer
  const SCHEDULE_ITEMS = (data?.today_schedule && data.today_schedule.length >= 3)
    ? data.today_schedule.map((item, idx) => ({
        id: item.id || `insp-00${idx + 1}`,
        time: item.scheduled_date ? new Date(item.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ["09:00", "11:30", "14:00"][idx] || "09:00",
        projectName: item.project_name || ["Eko Atlantic Tower", "Landmark Towers", "Chief Magistrate"][idx],
        location: item.location || ["Lekki Phase 1", "Victoria Island", "Ebute Metta"][idx],
        type: item.inspection_type || "STRUCTURAL",
      }))
    : [
        { id: "insp-001", time: "09:00", projectName: "Eko Atlantic Tower", location: "Lekki Phase 1", type: "FOUNDATION" },
        { id: "insp-002", time: "11:30", projectName: "Landmark Towers", location: "Victoria Island", type: "REBAR" },
        { id: "insp-003", time: "14:00", projectName: "Chief Magistrate", location: "Ebute Metta", type: "CONCRETE" },
      ];

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300 min-w-0 pb-12">
      {/* Top Header Section & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
            <span>COMMAND CENTER</span>
            <span>•</span>
            <span className="text-[#022C4F]">OPERATIONAL COCKPIT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#022C4F] tracking-tight">
            Inspector: Badge #{profile?.badge_number || "LAG-INS-042"} • {profile?.district || "Ikeja North Directorate"}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active 🟢
            </span>
            <Link
              href="/inspector/dashboard/sync"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono hover:bg-amber-100 transition-colors"
            >
              <span>{pendingSync} Pending Sync ⚠️</span>
            </Link>
          </div>
        </div>

        {/* Quick Icon Links: Notifications, Profile, Settings, Refresh */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <Link
            href="/inspector/dashboard/notifications"
            title="Alerts & Notifications"
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-sm"
          >
            <Bell size={17} />
          </Link>
          <Link
            href="/inspector/dashboard/settings"
            title="Inspector Profile"
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-sm"
          >
            <User size={17} />
          </Link>
          <Link
            href="/inspector/dashboard/settings"
            title="Settings & Calibration"
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-sm"
          >
            <Settings size={17} />
          </Link>
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh Live Data"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm ml-1"
          >
            <RefreshCw size={17} className={isRefreshing ? "animate-spin text-[#0284C7]" : ""} />
          </button>
        </div>
      </div>

      {/* Overview Stat Cards (Wireframe 1: 5 Core Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          {
            title: "Assigned Sites",
            value: kpis?.assigned_projects ?? 12,
            icon: Building2,
            border: "border-l-blue-600",
            textColor: "text-blue-600",
            href: "/inspector/dashboard/projects",
          },
          {
            title: "Upcoming Tasks",
            value: kpis?.upcoming_inspections ?? 5,
            icon: ClipboardCheck,
            border: "border-l-amber-500",
            textColor: "text-amber-600",
            href: "/inspector/dashboard/inspections",
          },
          {
            title: "Open Findings",
            value: kpis?.open_findings ?? 8,
            icon: AlertTriangle,
            border: "border-l-rose-500",
            textColor: "text-rose-600",
            href: "/inspector/dashboard/findings",
          },
          {
            title: "Non-Compliances",
            value: kpis?.compliance_issues ?? 3,
            icon: ShieldCheck,
            border: "border-l-purple-600",
            textColor: "text-purple-600",
            href: "/inspector/dashboard/compliance",
          },
          {
            title: "Pending Sync",
            value: pendingSync,
            icon: Layers,
            border: "border-l-emerald-600",
            textColor: "text-emerald-600",
            href: "/inspector/dashboard/sync",
          },
        ].map((stat, idx) => (
          <Link
            key={idx}
            href={stat.href}
            className={`bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col shadow-sm hover:shadow-md transition-all group border-l-4 ${stat.border}`}
          >
            <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {stat.title}
            </span>
            <div className="flex items-end justify-between mt-auto">
              <span className={`text-2xl sm:text-3xl font-black ${stat.textColor} group-hover:scale-105 transition-transform origin-left font-mono`}>
                {stat.value}
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-gray-400 group-hover:text-gray-700 transition-colors">
                <stat.icon size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* TODAY'S FIELD INSPECTION SCHEDULE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#022C4F] flex items-center gap-2">
              <Clock size={18} className="text-[#0284C7]" />
              TODAY&apos;S FIELD INSPECTION SCHEDULE
            </h2>
            <p className="text-xs text-gray-500">Mandatory GPS geofence arrival check-in prior to structural inspection checklist</p>
          </div>
          <Link
            href="/inspector/dashboard/inspections"
            className="text-xs font-bold text-[#022C4F] hover:text-[#0284C7] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Schedule</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-3">
          {SCHEDULE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-mono font-black shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>{item.time}</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{item.projectName}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <span>{item.location}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md">
                  {item.type}
                </span>
                <Link
                  href={`/inspector/dashboard/inspections/${item.id}`}
                  className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Play size={12} className="fill-current text-cyan-300" />
                  <span>CHECK IN</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DIGITAL EYE RADAR BANNER (Module 4/5 Hub) */}
      <div className="bg-gradient-to-br from-[#022C4F] via-[#012440] to-[#011B30] rounded-2xl p-6 text-white shadow-md space-y-4 border border-blue-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Scan size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">DIGITAL EYE RADAR BANNER</h3>
              <p className="text-xs text-cyan-200/80">Unified NDT, Radargram & 3D Spatial Geometry Analysis Hub</p>
            </div>
          </div>
          <Link
            href="/inspector/dashboard/digital-eye"
            className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Full Suite</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* GPR SCAN */}
          <Link
            href="/inspector/dashboard/digital-eye/gpr"
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📡</span>
              <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-400/40 px-2 py-0.5 rounded-full">
                RADAR
              </span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors mb-1">
              GPR SCAN
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Subsurface radar scan, rebar spacing & void detection.
            </p>
            <div className="mt-3 text-[11px] font-bold text-cyan-400 flex items-center gap-1 group-hover:underline">
              <span>View Radargram</span>
              <ArrowRight size={12} />
            </div>
          </Link>

          {/* UPV ANALYZER */}
          <Link
            href="/inspector/dashboard/digital-eye/upv"
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔊</span>
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                PUNDIT
              </span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors mb-1">
              UPV ANALYZER
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Pulse velocity, SonReb concrete strength & locked formula engine.
            </p>
            <div className="mt-3 text-[11px] font-bold text-emerald-400 flex items-center gap-1 group-hover:underline">
              <span>Open UPV Terminal</span>
              <ArrowRight size={12} />
            </div>
          </Link>

          {/* BIM DEVIATION */}
          <Link
            href="/inspector/dashboard/digital-eye/bim"
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏗️</span>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-400/40 px-2 py-0.5 rounded-full">
                3D SLICE
              </span>
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors mb-1">
              BIM DEVIATION
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              3D laser scan vs IFC design model with deviation heatmaps.
            </p>
            <div className="mt-3 text-[11px] font-bold text-amber-400 flex items-center gap-1 group-hover:underline">
              <span>Compare As-Built</span>
              <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>

      {/* CRITICAL FINDINGS & STOP WORK ORDERS */}
      <div className="bg-white rounded-2xl border border-rose-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertOctagon size={18} />
            <h3 className="text-base font-bold text-[#022C4F]">CRITICAL FINDINGS &amp; STOP WORK ORDERS</h3>
          </div>
          <Link
            href="/inspector/dashboard/findings"
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            View All Findings
          </Link>
        </div>

        {/* Active SWO Card specified in Wireframe 1 */}
        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🚨</span>
              <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">
                STOP-WORK ORDER: Eko Atlantic Tower - Sector 4
              </h4>
            </div>
            <p className="text-xs font-semibold text-rose-800">
              Reason: Structural deviation &gt;10mm on Column C4
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 font-mono pt-0.5">
              <span>Issued: 2 days ago</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                Status: ACTIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <Link
              href="/inspector/dashboard/findings/find-001/swo"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              VIEW DETAILS
            </Link>
          </div>
        </div>
      </div>

      {/* EVIDENCE INTEGRITY WIDGET */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0284C7] shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              EVIDENCE INTEGRITY WIDGET
            </h4>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm font-bold text-gray-900">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>{verifiedFiles} files SHA-256 verified</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                <span>{pendingSync} files pending sync</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/inspector/dashboard/sync"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            Sync Center
          </Link>
          <Link
            href="/inspector/dashboard/evidence"
            className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-bold transition-colors flex items-center gap-1"
          >
            <span>Evidence Vault</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
