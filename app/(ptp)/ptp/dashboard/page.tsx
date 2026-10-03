"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  Building2,
  Compass,
  FileCheck2,
  AlertTriangle,
  Send,
  ArrowRight,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles,
  Layers,
  ChevronRight,
  BellRing,
  Download
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MetricCard from "@/components/dashboard/MetricCard";
import PtpTopRightControls from "@/components/dashboard/PtpTopRightControls";
import {
  getPublicProjects,
  getPublicStats,
  getPublicNotices,
  PublicProject,
  PublicStats,
  PublicNotice,
  CURATED_PUBLIC_STATS,
} from "@/services/publicPortal";
import { ProjectStatusBadge, ComplianceBadge } from "@/components/transparency/ProjectStatusBadge";

export default function PtpDashboardOverview() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats, setStats] = useState<PublicStats>(CURATED_PUBLIC_STATS);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [notices, setNotices] = useState<PublicNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, projectsData, noticesData] = await Promise.all([
          getPublicStats(),
          getPublicProjects(),
          getPublicNotices(),
        ]);
        setStats(statsData);
        setProjects(projectsData);
        setNotices(noticesData);
      } catch (err) {
        // Handled by service fallbacks
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/ptp/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/ptp/dashboard/search");
    }
  };

  const userName = user?.first_name ? `${user.first_name} ${user.last_name || ''}` : "Citizen Monitor";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar matching Government Command Center */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 mb-2">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Building2 size={20} />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#022C4F] leading-tight">
              Public Transparency Command Center
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Official open-access civic monitoring dashboard for verified building approvals, stage-gate inspections, and real-time statutory enforcement notices across Lagos State.
          </p>
        </div>
        <PtpTopRightControls />
      </div>

      {/* KPI METRIC CARDS matching Nexucon standard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Verified Building Permits"
          value={stats.verified_permits.toLocaleString()}
        />
        <MetricCard
          title="Completed Stage Audits"
          value={stats.completed_inspections.toLocaleString()}
        />
        <MetricCard
          title="Active Stop-Work Seals"
          value={stats.open_notices}
        />
        <MetricCard
          title="Citizen Tips Resolved"
          value={`${stats.citizens_reports_resolved}%`}
        />
      </div>

      {/* QUICK ACTIONS & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl p-5 border border-[#022C4F]/20 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Permit ID (e.g. LASPPPA/ETI/2026/0481), Developer, or Street..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-[#022C4F] bg-gray-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#033E6E] text-white font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Find Project
          </button>
        </form>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Link
            href="/ptp/dashboard/verify"
            className="px-3 sm:px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-center"
          >
            <FileCheck2 size={16} className="shrink-0" />
            <span className="truncate">Verify QR</span>
          </Link>
          <Link
            href="/ptp/dashboard/report"
            className="px-3 sm:px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs text-center"
          >
            <Send size={16} className="shrink-0" />
            <span className="truncate">Report Hazard</span>
          </Link>
        </div>
      </div>

      {/* PRIORITY STATUTORY BULLETIN STRIP */}
      {notices.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
                <span>Active Statutory Notice: {notices[0].notice_type.replace('_', ' ')}</span>
                <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded font-mono">{notices[0].reference_number}</span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5 line-clamp-1">
                {notices[0].title} &bull; {notices[0].target_lga}
              </p>
            </div>
          </div>
          <Link
            href="/ptp/dashboard/notices"
            className="text-xs font-bold text-amber-900 hover:text-amber-950 underline shrink-0 inline-flex items-center gap-1"
          >
            <span>View All Notices</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* RECENT DEVELOPMENTS REGISTRY */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recently Monitored Developments</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified construction sites with active statutory audit records in Lagos State.
            </p>
          </div>

          <Link
            href="/ptp/dashboard/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            <span>View Full Registry</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {projects.slice(0, 5).map((project) => {
            const passedCount = project.inspections ? project.inspections.filter((i) => i.outcome === 'PASS').length : 0;
            const totalCount = project.inspections ? project.inspections.length : 0;

            return (
              <div
                key={project.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <ProjectStatusBadge status={project.status} size="sm" />
                    <ComplianceBadge state={project.compliance_state} size="sm" />
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {project.permit_number}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {project.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      <span>{project.site_address}, {project.lga}</span>
                    </span>
                    <span>&bull;</span>
                    <span>Developer: <strong className="text-slate-700">{project.developer_organization}</strong></span>
                    <span>&bull;</span>
                    <span>Approved: <strong className="text-slate-700">{project.number_of_floors} Floors</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Stage Progress</div>
                    <div className="text-xs font-bold text-emerald-700">
                      {passedCount} of {totalCount} Audits Passed
                    </div>
                  </div>

                  <Link
                    href={`/ptp/dashboard/search?project=${project.id}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#022C4F] hover:text-white text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Inspect Dossier</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK WORKSPACE TOOLS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/ptp/dashboard/map"
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-cyan-500 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Compass size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">GIS Safety Map</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore interactive map pins for construction sites, Stop-Work seals, and coastal zoning setbacks.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-bold text-cyan-700 flex items-center gap-1">
            <span>Open Spatial Map</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/ptp/dashboard/verify"
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileCheck2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Certificate Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Input QR codes and cryptographic hashes to validate authentic LASPPPA and LASBCA certifications.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-bold text-blue-700 flex items-center gap-1">
            <span>Launch Verify Desk</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/ptp/dashboard/report"
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-red-500 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Send size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Whistleblower Tip-off</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Report structural cracks, extra storeys, or ignored stop-work seals. Submissions get an anonymous tracking code.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-bold text-red-700 flex items-center gap-1">
            <span>Submit Safety Report</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
