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
} from "lucide-react";
import { getInspectorDashboard, InspectorDashboardData } from "@/services/inspector";

export default function InspectorDashboardPage() {
  const [data, setData] = useState<InspectorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-gray-500">Loading Inspector Terminal...</span>
        </div>
      </div>
    );
  }

  const profile = data?.profile;
  const kpis = data?.kpis;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 min-w-0">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <ClipboardCheck size={20} />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#022C4F] leading-tight tracking-tight">
              Inspector Command Center
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Welcome back, <strong className="text-gray-800">{profile?.name || "Field Inspector"}</strong> (Badge #{profile?.badge_number || "LAG-INS-042"}). Real-time field oversight for active construction sites in <strong className="text-gray-800">{profile?.district || "Ikeja North Directorate"}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 sm:ml-[52px] md:ml-0">
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh live data"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <Link
            href="/inspector/dashboard/inspections"
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Play size={14} className="fill-current" />
            <span>Today&apos;s Schedule</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          {
            title: "Assigned Sites",
            value: kpis?.assigned_projects ?? 8,
            icon: Building2,
            border: "border-l-blue-600",
            textColor: "text-blue-600",
            href: "/inspector/dashboard/projects",
          },
          {
            title: "Upcoming Tasks",
            value: kpis?.upcoming_inspections ?? 4,
            icon: ClipboardCheck,
            border: "border-l-amber-500",
            textColor: "text-amber-600",
            href: "/inspector/dashboard/inspections",
          },
          {
            title: "Open Findings",
            value: kpis?.open_findings ?? 12,
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
            value: kpis?.pending_evidence ?? 2,
            icon: Layers,
            border: "border-l-emerald-600",
            textColor: "text-emerald-600",
            href: "/inspector/dashboard/evidence",
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
              <span className={`text-2xl sm:text-3xl font-extrabold ${stat.textColor} group-hover:scale-105 transition-transform origin-left`}>
                {stat.value}
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-gray-400 group-hover:text-gray-700 transition-colors">
                <stat.icon size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid: Today's Schedule & Scoped Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Schedule & Assigned Sites */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Today's Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#022C4F]">Today&apos;s Field Inspection Schedule</h2>
                <p className="text-xs text-gray-500">Mandatory GPS check-in required upon arrival at site boundary</p>
              </div>
              <Link
                href="/inspector/dashboard/inspections"
                className="text-xs font-bold text-[#022C4F] hover:text-[#0284C7] flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.today_schedule && data.today_schedule.length > 0) ? (
                data.today_schedule.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-[#022C4F] bg-blue-100/60 px-2 py-0.5 rounded-md">
                          {item.scheduled_date ? new Date(item.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "10:00 AM"}
                        </span>
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {item.project_name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">{item.location || "Lekki, Lagos"}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                        {item.inspection_type}
                      </span>
                      <Link
                        href={`/inspector/dashboard/inspections/${item.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-bold transition-colors"
                      >
                        Start Check-in
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs bg-slate-50/50 rounded-xl">
                  No pending inspections scheduled for today.
                </div>
              )}
            </div>
          </div>

          {/* Scoped Projects Directory */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#022C4F]">Jurisdiction Construction Sites</h2>
                <p className="text-xs text-gray-500">Supervised developments allocated under your inspection warrant</p>
              </div>
              <Link
                href="/inspector/dashboard/projects"
                className="text-xs font-bold text-[#022C4F] hover:text-[#0284C7] flex items-center gap-1"
              >
                <span>Full Directory</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {data?.assigned_projects?.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/inspector/dashboard/projects/${p.id}`}
                  className="p-4 rounded-xl border border-slate-200/70 hover:border-[#022C4F] bg-white hover:bg-slate-50/50 transition-all shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                      {p.reference_number}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.compliance_status === "COMPLIANT"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-[#022C4F] border border-blue-200"
                    }`}>
                      {p.compliance_status || p.current_phase || "ACTIVE"}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#022C4F] transition-colors truncate mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mb-3">
                    {p.location || "Lekki, Lagos"}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
                    <span>{p.open_findings || 0} findings open</span>
                    <span className="text-[#022C4F] font-bold flex items-center gap-0.5">
                      Open Site &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Digital Eye Quick Access & Critical Alerts */}
        <div className="space-y-6 sm:space-y-8">
          {/* Digital Eye Radar / NDT Banner Card */}
          <div className="bg-gradient-to-br from-[#022C4F] to-[#011C33] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-300 uppercase tracking-wider mb-2">
              <Eye size={16} />
              <span>Digital Eye Multi-Modal</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 leading-snug">
              BIM Verification & Subsurface NDT
            </h3>
            <p className="text-xs text-white/80 leading-relaxed mb-5">
              Inspect GPR rebar spacing radargrams, Ultrasonic Pulse Velocity strength test waveforms, and 3D Trimble BIM model deviations.
            </p>
            <Link
              href="/inspector/dashboard/digital-eye"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#022C4F] font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
            >
              <span>Launch 3D & NDT Viewer</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Critical Findings / Stop Work Orders Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={17} className="text-rose-600" />
                <h3 className="text-sm font-bold text-[#022C4F]">Priority Defect Findings</h3>
              </div>
              <Link
                href="/inspector/dashboard/findings"
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                All (12)
              </Link>
            </div>

            <div className="space-y-2.5">
              {data?.critical_findings && data.critical_findings.length > 0 ? (
                data.critical_findings.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold text-rose-700 uppercase">
                        {f.severity} SEVERITY
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {f.finding_reference}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 line-clamp-1 mb-1">
                      {f.title}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {f.project_name}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400 text-xs">
                  No active critical stop-work findings.
                </div>
              )}
            </div>
          </div>

          {/* Evidence Vault Sync Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={17} className="text-[#0284C7]" />
              <h3 className="text-sm font-bold text-[#022C4F]">Evidence Integrity & SHA-256</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              All field photos and test files are cryptographically hashed with SHA-256 and synchronized with immutable audit trails.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-gray-500">Synced Records:</span>
                <span className="font-bold text-gray-800">{data?.evidence_sync?.uploaded ?? 142}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-500">Pending Upload:</span>
                <span className="font-bold text-emerald-600">{data?.evidence_sync?.pending ?? 0}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-500">Hash Verification:</span>
                <span className="font-bold text-blue-600">100% SHA-256 Verified</span>
              </div>
            </div>

            <Link
              href="/inspector/dashboard/evidence"
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] text-xs font-bold transition-colors"
            >
              <span>Open Evidence Vault</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
