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
  AlertCircle,
} from "lucide-react";
import { getInspectorDashboard, InspectorDashboardData } from "@/services/inspector";
import { getErrorMessage, notify } from "@/lib/api";
import { ABSENT, countOr, orDash, timeOr, dateTimeOr } from "@/lib/display";

export default function InspectorDashboardPage() {
  const [data, setData] = useState<InspectorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await getInspectorDashboard();
      setData(res);
      setLoadError(null);
    } catch (err) {
      // Previously this logged to the console and left the fabricated
      // fallback dashboard on screen, so a failed load was indistinguishable
      // from a successful one. Now the failure owns the page.
      const message = getErrorMessage(
        err,
        'Could not load your dashboard from the server.'
      );
      setLoadError(message);
      setData(null);
      notify(`⚠️ ${message}`, 'error');
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

  if (loadError || !data) {
    // An honest dead end. The alternative — rendering the shell with blank
    // stats — reads as "your jurisdiction is empty", which is a different and
    // false statement.
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] px-4">
        <div className="max-w-lg w-full rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center">
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={22} />
          </div>
          <h2 className="text-sm font-bold text-rose-900 mb-1">
            Dashboard unavailable
          </h2>
          <p className="text-xs text-rose-800 leading-relaxed mb-4">
            {loadError || 'The server returned no dashboard data for your account.'}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Try again</span>
          </button>
        </div>
      </div>
    );
  }

  const profile = data.profile;
  const kpis = data.kpis;

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
            {/* `profile.name` is `user.get_full_name()` and is None when the
                account has no name recorded. The fallback here used to be the
                literal "Inspector", which put a job title in the position a
                name occupies and read as though the platform knew who was
                signed in. Where no name is recorded the sentence simply does
                not name anyone, which is what the record supports. */}
            Welcome back
            {profile.name ? (
              <>
                , <strong className="text-gray-800">{profile.name}</strong>
              </>
            ) : null}{' '}
            {profile.badge_number ? (
              <>(Badge #{profile.badge_number})</>
            ) : (
              <span className="text-amber-700 font-semibold">
                (no badge number recorded)
              </span>
            )}
            .{' '}
            {profile.district ? (
              <>
                Real-time field oversight for active construction sites in{' '}
                <strong className="text-gray-800">{profile.district}</strong>.
              </>
            ) : (
              <>
                Territorial scope:{' '}
                <span className="text-amber-700 font-semibold">
                  no district recorded
                </span>
                .
              </>
            )}
            {profile.accreditation_status &&
              profile.accreditation_status !== 'ACTIVE' && (
                <>
                  {' '}
                  Accreditation status:{' '}
                  <strong className="text-rose-700">
                    {profile.accreditation_status}
                  </strong>
                  .
                </>
              )}
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

      {/* Overview Stat Cards.
          Each figure is the recorded count, or an explicit absence. The
          previous version defaulted every one of them with `?? <number>`, so a
          brand-new inspector with no projects saw "8 Assigned Sites" and
          "12 Open Findings" before the request had even returned. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          {
            title: "Assigned Sites",
            value: countOr(kpis.assigned_projects, ABSENT),
            note: undefined as string | undefined,
            icon: Building2,
            border: "border-l-blue-600",
            textColor: "text-blue-600",
            href: "/inspector/dashboard/projects",
          },
          {
            title: "Upcoming Tasks",
            value: countOr(kpis.upcoming_inspections, ABSENT),
            note: undefined as string | undefined,
            icon: ClipboardCheck,
            border: "border-l-amber-500",
            textColor: "text-amber-600",
            href: "/inspector/dashboard/inspections",
          },
          {
            title: "Open Findings",
            value: countOr(kpis.open_findings, ABSENT),
            note: undefined as string | undefined,
            icon: AlertTriangle,
            border: "border-l-rose-500",
            textColor: "text-rose-600",
            href: "/inspector/dashboard/findings",
          },
          {
            title: "Non-Compliances",
            value: countOr(kpis.compliance_issues, ABSENT),
            note: undefined as string | undefined,
            icon: ShieldCheck,
            border: "border-l-purple-600",
            textColor: "text-purple-600",
            href: "/inspector/dashboard/compliance",
          },
          {
            // `null` here means the platform has nothing to measure it with
            // yet, so the tile says so instead of showing a zero.
            title: "Pending Sync",
            value:
              kpis.pending_evidence === null
                ? ABSENT
                : String(kpis.pending_evidence),
            note: kpis.pending_evidence === null ? "Not measured" : undefined,
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
            {stat.note && (
              <span className="mt-1 text-[10px] font-semibold text-gray-400">
                {stat.note}
              </span>
            )}
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
                          {timeOr(item.scheduled_date)}
                        </span>
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {item.project_name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">
                          {orDash(item.location, "Location not recorded")}
                        </span>
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
                        : p.compliance_status
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {/* Compliance is reported from a recorded certificate.
                          When none exists this says so — it used to fall back
                          to the project phase, so an uncertified site read as
                          "ACTIVE" inside a compliance chip. */}
                      {p.compliance_status || "No compliance certificate"}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#022C4F] transition-colors truncate mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mb-3">
                    {orDash(p.location, "Location not recorded")}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
                    <span>{p.open_findings} findings open</span>
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
          {/* TS-1 (MVP) Field Hardware Hub & NDT Banner Card */}
          <div className="bg-gradient-to-br from-[#022C4F] via-[#01223D] to-[#011C33] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-blue-900/40">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                <Scan size={14} className="text-cyan-400 animate-pulse" />
                <span>TS-1 (MVP) HARDWARE HUB</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1.5 leading-snug">
              Multi-Modal Sensor Ingestion & UPV NDT
            </h3>
            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Direct ingestion for Screening Eagle PUNDIT UPV 54 kHz, Proceq GPR Live radar, and Tersus GNSS rovers with SHA-256 cryptographic audit seals.
            </p>

            {/* The four "live" readings that used to sit here — a PUNDIT at
                54 kHz / 88% BLE, a GPR Live at 1.6 GHz / 94% Wi-Fi, an RTK fix
                at ±14 mm and a Trimble X7 "on standby" — were hardcoded
                strings with pulsing status dots. Nothing read them from a
                device or from the server, so they presented invented hardware
                telemetry as live. Device and session state is served by the
                ingestion API and surfaced in the TS-1 workspace, not here. */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm mb-5 text-[11px] text-slate-300 leading-relaxed">
              Live device status is not reported on this screen. Recorded
              sessions and registered devices are listed in the TS-1 workspace.
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/inspector/dashboard/digital-eye"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#022C4F] font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span>Launch TS-1 Workspace</span>
                <ArrowUpRight size={14} />
              </Link>
              <Link
                href="/inspector/dashboard/digital-eye?tab=pundit&action=new"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 font-bold text-xs transition-colors"
              >
                <Zap size={13} className="text-cyan-400" />
                <span>New UPV Test</span>
              </Link>
            </div>
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
                All ({kpis.open_findings})
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
                      {orDash(f.project_name, "Project not recorded")}
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

            {/* These four figures are read from the dashboard payload. The
                "Hash Verification: 100% SHA-256 Verified" row that used to sit
                at the bottom of this card was a literal string — no hash on
                this screen had been verified, and the number could not have
                been wrong because nothing computed it. */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-gray-500">Evidence Records:</span>
                <span className="font-bold text-gray-800">
                  {data.evidence_sync.uploaded}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                {/* The queue carries findings, inspections, stop-work orders
                    and telemetry as well as evidence, so this is labelled for
                    what it counts. "Pending Upload" named a file transfer that
                    this figure does not measure. */}
                <span className="text-gray-500">Queued for sync:</span>
                <span className="font-bold text-emerald-600">
                  {countOr(data.evidence_sync.pending)}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-500">Failed Syncs:</span>
                <span className="font-bold text-gray-800">
                  {countOr(data.evidence_sync.failed)}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-500">Last Synced:</span>
                <span className="font-bold text-gray-800">
                  {dateTimeOr(data.evidence_sync.last_synced_at, "Never")}
                </span>
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
