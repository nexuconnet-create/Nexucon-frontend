"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Cpu, Box, AlertTriangle, Sparkles, ChevronRight, ShieldCheck, Activity } from "lucide-react";

export interface PunditAiNavItem {
  label: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
  badge?: string;
}

export const PUNDIT_AI_NAV: PunditAiNavItem[] = [
  {
    label: "Tomography & Inversion",
    title: "Acoustic Tomography & Inversion",
    href: "/government/dashboard/digital-eye/pundit/ai-analysis",
    icon: Cpu,
    description: "Multi-station acoustic pulse inversion, interactive tomographic heatmaps and first-break peak detection.",
    badge: "Tomography Hub",
  },
  {
    label: "Element Verdicts",
    title: "Structural Element Verdicts",
    href: "/government/dashboard/digital-eye/pundit/ai-analysis/verdicts",
    icon: Box,
    description: "Element-by-element mean velocities, fcu distributions, and pass/fail quality grades across project floors.",
    badge: "Element Means",
  },
  {
    label: "Defect Detection",
    title: "Acoustic Defect & Anomaly Radar",
    href: "/government/dashboard/digital-eye/pundit/ai-analysis/defects",
    icon: AlertTriangle,
    description: "Automated identification of internal honeycombs, deep micro-cracks, and doubtful strength pockets.",
    badge: "Defect Radar",
  },
  {
    label: "Reasoning Log",
    title: "AI Model Reasoning & Peer Review",
    href: "/government/dashboard/digital-eye/pundit/ai-analysis/reasoning",
    icon: Sparkles,
    description: "Deterministic BS 1881-203 mathematical trace, temperature adjustments, AIC model ranking, and engineer sign-off.",
    badge: "Model Trace",
  },
];

interface PunditAiNavProps {
  subtitle?: string;
  className?: string;
}

export default function PunditAiNav({ subtitle, className = "" }: PunditAiNavProps) {
  const pathname = usePathname();

  const isItemActive = (item: PunditAiNavItem) => {
    if (item.href === "/government/dashboard/digital-eye/pundit/ai-analysis") {
      return pathname === "/government/dashboard/digital-eye/pundit/ai-analysis";
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const current = PUNDIT_AI_NAV.find((item) => isItemActive(item));

  return (
    <nav
      aria-label="AI Analysis Navigation"
      className={`rounded-2xl border border-slate-700/60 bg-gradient-to-r from-[#0F172A] via-[#0A192F] to-[#022C4F] p-1.5 shadow-xl shadow-slate-950/20 text-white ${className}`}
    >
      {/* Top Header & Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BrainCircuit size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                PUNDIT AI Acoustic Engine
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck size={11} />
                <span>BS 1881-203 Grounded</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <span className="text-cyan-400 font-medium">Neural Inference</span>
              <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
              <span className="font-semibold text-white">{current ? current.title : "AI Analysis Suite"}</span>
              {subtitle && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                  <span className="text-amber-400 font-medium">{subtitle}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-white/10 text-slate-200 border border-white/15">
            ACOUSTIC TOMOGRAPHY &amp; INVERSION
          </span>
        </div>
      </div>

      {/* Navigation Ribbon Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 p-1.5">
        {PUNDIT_AI_NAV.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-all duration-200 ${
                active
                  ? "bg-white/15 text-white shadow-md border border-cyan-400/40 ring-1 ring-cyan-400/20 font-bold"
                  : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    active
                      ? "bg-cyan-400 text-slate-950 font-bold shadow-xs"
                      : "bg-slate-800/80 text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-800"
                  }`}
                >
                  <Icon size={14} />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span
                    className={`block text-[10px] truncate ${
                      active ? "text-cyan-200" : "text-slate-400 group-hover:text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>

              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
