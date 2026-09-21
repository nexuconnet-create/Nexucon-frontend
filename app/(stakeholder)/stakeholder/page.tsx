"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Calendar,
  CreditCard,
  FileSearch,
  Users,
  Briefcase,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function StakeholderHub() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !authLoading) {
      const token = localStorage.getItem("nexucon_access_token");
      const localUser = localStorage.getItem("nexucon_auth_user");
      if (!token && !localUser && !user) {
        router.replace("/stakeholder/login");
      } else if (user && user.is_onboarded === false) {
        const cleanEmail = user.email?.toLowerCase();
        const localOnboarded = localStorage.getItem(`nexucon_onboarding_completed_${cleanEmail}`);
        if (!localOnboarded) {
          router.replace("/stakeholder/onboarding");
        }
      }
    }
  }, [user, authLoading, router]);

  // Mock KPI data for initial presentation
  const stats = {
    activeInspections: 14,
    inspectionPassRate: "94.2%",
    pendingNcrs: 3,
    timelineStatus: "On Track",
    activeMilestones: 8,
    statutoryHoldPoints: 2,
    totalLeviesSettled: "₦42,500,000",
    pendingInvoicesAmount: "₦3,850,000",
    dueInvoicesCount: 2,
    prequalifiedContractors: 38,
    verifiedProfessionals: 64,
  };

  const recentInspections = [
    {
      id: "INS-STG-2026-041",
      project: "Eko Atlantic Horizon Towers",
      stage: "Foundation Pour & Rebar Cover",
      inspector: "Engr. Olufemi Adebayo (Senior Building Inspector)",
      date: "Today &bull; 14:00",
      status: "Scheduled",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "INS-STG-2026-039",
      project: "Victoria Island Central Commercial Hub",
      stage: "Level 4 Floor Slab Concrete Pour",
      inspector: "Arc. Chioma Nwosu (Zonal Review Officer)",
      date: "Yesterday",
      status: "Passed with Conditions",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "INS-STG-2026-038",
      project: "Lekki Phase 1 Residential Estate",
      stage: "Substructure Drainage & Soil Compaction",
      inspector: "Engr. Musa Bello (Field Audit Officer)",
      date: "18 Sep 2026",
      status: "NCR Issued",
      statusColor: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  const pendingInvoices = [
    {
      invoiceNumber: "INV-2026-0054",
      project: "Eko Atlantic Horizon Towers",
      feeType: "Stage 3 Structural Audit Levy",
      amount: "₦2,400,000",
      dueDate: "25 Sep 2026",
      status: "DUE",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      invoiceNumber: "INV-2026-0052",
      project: "Victoria Island Central Commercial Hub",
      feeType: "EIA Environmental Impact Assessment Tariff",
      amount: "₦1,450,000",
      dueDate: "28 Sep 2026",
      status: "DUE",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  const timelineMilestones = [
    {
      name: "3rd Floor Structural Slab Pour",
      project: "Eko Atlantic Horizon Towers",
      dueDate: "26 Sep 2026",
      isHoldPoint: true,
      progress: 85,
      status: "Statutory Gate - Pending Pass",
    },
    {
      name: "Subsurface GPR Concrete Cover Verification",
      project: "Victoria Island Central Commercial Hub",
      dueDate: "30 Sep 2026",
      isHoldPoint: false,
      progress: 60,
      status: "In Progress",
    },
    {
      name: "BS 1881-203 Ultrasonic Pulse Velocity Test",
      project: "Lekki Phase 1 Residential Estate",
      dueDate: "02 Oct 2026",
      isHoldPoint: true,
      progress: 40,
      status: "Scheduled NDT",
    },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#022C4F] via-[#033C6C] to-[#0A4F82] p-6 sm:p-8 text-white mb-8 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-300/30 text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">
              <Sparkles size={13} />
              stakeholder.nexucon.net &bull; Client & Stakeholder Ecosystem
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome, {user?.first_name || "Project Leader"}
            </h1>
            <p className="text-white/80 mt-2 text-xs sm:text-sm leading-relaxed">
              Orchestrate statutory building inspections, govern project stage-gate timelines, and settle regulatory financial levies in real-time collaboration with government agencies.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/stakeholder/inspections"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md transition-all text-xs font-bold"
            >
              <Plus size={15} />
              <span>Request Inspection</span>
            </Link>
            <Link
              href="/stakeholder/financials"
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#022C4F] hover:bg-white/90 rounded-xl shadow-md transition-all text-xs font-bold"
            >
              <CreditCard size={15} />
              <span>Settle Levies</span>
            </Link>
          </div>
        </div>
      </div>

      {/* The 3 Client Control Pillars (KPI Summary) */}
      <div id="client-control" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#022C4F] flex items-center gap-2">
              <Activity className="text-blue-500" size={20} />
              Client Control Center
            </h2>
            <p className="text-xs text-gray-500">Core operational levers governing regulatory collaboration.</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
            3 Active Pillars
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: Building Inspection */}
          <Link
            href="/stakeholder/inspections"
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                  <FileSearch size={22} />
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                  Pillar 1
                </span>
              </div>
              <h3 className="text-base font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">
                Building Inspection
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Stage inspection dispatch, inspector arrival ETA, and Non-Conformance Report (NCR) remediation proof.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xl font-extrabold text-[#022C4F]">{stats.activeInspections} Active</div>
                <div className="text-[11px] text-emerald-600 font-semibold">{stats.inspectionPassRate} Pass Rate</div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 2: Project Timeline */}
          <Link
            href="/stakeholder/timeline"
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                  <Calendar size={22} />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  Pillar 2
                </span>
              </div>
              <h3 className="text-base font-bold text-[#022C4F] group-hover:text-emerald-600 transition-colors">
                Project Timeline & Gantt
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Critical Path schedule with mandatory government approval hold-points and multi-party calendar sync.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xl font-extrabold text-[#022C4F]">{stats.activeMilestones} Milestones</div>
                <div className="text-[11px] text-amber-600 font-semibold">{stats.statutoryHoldPoints} Hold-Points Pending</div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 3: Financial Activities */}
          <Link
            href="/stakeholder/financials"
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                  <CreditCard size={22} />
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                  Pillar 3
                </span>
              </div>
              <h3 className="text-base font-bold text-[#022C4F] group-hover:text-amber-600 transition-colors">
                Financial Activities
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Settlement of statutory levies, official tax invoices (`INV-2026-XXXX`), and contractor milestone escrow.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xl font-extrabold text-[#022C4F]">{stats.totalLeviesSettled}</div>
                <div className="text-[11px] text-amber-600 font-semibold">{stats.pendingInvoicesAmount} Due ({stats.dueInvoicesCount} invoices)</div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Live Inspections & Timeline Hold-Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Live Stage Inspections */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
                <Building2 size={18} className="text-blue-500" />
                Live Building Stage Inspections
              </h3>
              <p className="text-xs text-gray-400">Scheduled regulatory audits and active site findings.</p>
            </div>
            <Link
              href="/stakeholder/inspections"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentInspections.map((ins, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-gray-500">{ins.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ins.statusColor}`}>
                      {ins.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#022C4F]">{ins.project}</h4>
                  <div className="text-xs text-gray-600 mt-0.5 font-medium">{ins.stage}</div>
                  <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                    <span>{ins.inspector}</span>
                    <span>&bull;</span>
                    <span dangerouslySetInnerHTML={{ __html: ins.date }} />
                  </div>
                </div>

                <Link
                  href={`/stakeholder/inspections`}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#022C4F] hover:bg-gray-100 transition-colors text-center shrink-0 self-start sm:self-auto"
                >
                  Audit Details
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Timeline Hold-Points */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
                  <Layers size={18} className="text-emerald-500" />
                  Timeline Hold-Points
                </h3>
                <p className="text-xs text-gray-400">Critical regulatory gates.</p>
              </div>
              <Link href="/stakeholder/timeline" className="text-xs font-bold text-blue-600 hover:underline">
                Gantt View
              </Link>
            </div>

            <div className="space-y-4">
              {timelineMilestones.map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h5 className="text-xs font-bold text-[#022C4F] leading-tight">{m.name}</h5>
                    {m.isHoldPoint && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">
                        Hold-Point
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 mb-2 truncate">{m.project}</div>
                  
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full ${m.isHoldPoint ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                    <span>Due: {m.dueDate}</span>
                    <span className="font-bold text-[#022C4F]">{m.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link
              href="/stakeholder/timeline"
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-[#022C4F] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore Critical Path</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Statutory Invoices & Stakeholder Registries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
                <CreditCard size={18} className="text-amber-500" />
                Statutory Invoices Due
              </h3>
              <p className="text-xs text-gray-400">Official government payment requests.</p>
            </div>
            <Link href="/stakeholder/financials" className="text-xs font-bold text-blue-600 hover:underline">
              All Invoices
            </Link>
          </div>

          <div className="space-y-3">
            {pendingInvoices.map((inv, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-100">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono font-bold text-[#022C4F]">{inv.invoiceNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${inv.statusColor}`}>
                    {inv.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#022C4F]">{inv.project}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{inv.feeType}</div>
                <div className="mt-3 flex justify-between items-center pt-2 border-t border-amber-100/60">
                  <div className="text-sm font-extrabold text-[#022C4F]">{inv.amount}</div>
                  <Link
                    href="/stakeholder/financials"
                    className="px-3 py-1 bg-[#022C4F] text-white text-xs font-bold rounded-lg hover:bg-[#033c6c] transition-colors"
                  >
                    Pay Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Directory Directory Access */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                Stakeholder Directories & Registers
              </h3>
              <p className="text-xs text-gray-400">Verified participants across the built environment.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link
              href="/stakeholder/developers"
              className="p-3.5 rounded-xl bg-gray-50 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 transition-all group"
            >
              <Building2 className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-xs font-bold text-[#022C4F]">Developers</div>
              <div className="text-[11px] text-gray-400">Master property sponsors</div>
            </Link>

            <Link
              href="/stakeholder/contractors"
              className="p-3.5 rounded-xl bg-gray-50 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 transition-all group"
            >
              <Users className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-xs font-bold text-[#022C4F]">Contractors</div>
              <div className="text-[11px] text-gray-400">Prequalified & licensed</div>
            </Link>

            <Link
              href="/stakeholder/professionals"
              className="p-3.5 rounded-xl bg-gray-50 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 transition-all group"
            >
              <Briefcase className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-xs font-bold text-[#022C4F]">Professionals</div>
              <div className="text-[11px] text-gray-400">COREN/ARCON/CORBON</div>
            </Link>

            <Link
              href="/stakeholder/consultants"
              className="p-3.5 rounded-xl bg-gray-50 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 transition-all group"
            >
              <Users className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-xs font-bold text-[#022C4F]">Consultants</div>
              <div className="text-[11px] text-gray-400">Geotechnical & EIA</div>
            </Link>

            <Link
              href="/stakeholder/inspectors"
              className="p-3.5 rounded-xl bg-gray-50 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 transition-all group"
            >
              <FileSearch className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-xs font-bold text-[#022C4F]">Inspectors</div>
              <div className="text-[11px] text-gray-400">Field audit workload</div>
            </Link>

            <Link
              href="/stakeholder/blacklist"
              className="p-3.5 rounded-xl bg-rose-50/40 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition-all group"
            >
              <AlertOctagon className="text-rose-600 mb-2 group-hover:scale-110 transition-transform" size={20} />
              <div className="text-xs font-bold text-rose-900">Blacklist</div>
              <div className="text-[11px] text-rose-600">Regulatory sanctions</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
