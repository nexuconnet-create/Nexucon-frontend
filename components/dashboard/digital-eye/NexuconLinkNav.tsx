"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, TrendingUp, FileText, Settings, ChevronRight, ShieldCheck, Cpu } from "lucide-react";

export interface NexuconLinkNavItem {
  label: string;
  title: string;
  href: string;
  aliases?: string[];
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
  badge?: string;
}

export const NEXUCON_LINK_NAV: NexuconLinkNavItem[] = [
  {
    label: "Measurement",
    title: "UPV Test Measurements",
    href: "/government/dashboard/digital-eye/pundit/neural-link/measurement",
    aliases: ["/government/dashboard/digital-eye/pundit/tests"],
    icon: Activity,
    description: "The UPV readings recorded in the field, with the curve that produced each strength.",
    badge: "Field Data",
  },
  {
    label: "Curve Manager",
    title: "Strength Curve Manager",
    href: "/government/dashboard/digital-eye/pundit/neural-link",
    aliases: ["/government/dashboard/digital-eye/pundit/neural-link/curve-manager"],
    icon: TrendingUp,
    description: "Calibrate, compare and activate the velocity-to-strength conversion curves.",
    badge: "Regression Engine",
  },
  {
    label: "Report",
    title: "Official NDT Dossier",
    href: "/government/dashboard/digital-eye/pundit/neural-link/report",
    aliases: ["/government/dashboard/digital-eye/pundit/reports"],
    icon: FileText,
    description: "FCU dossiers carrying the calibration disclosure and the standard-error policy applied.",
    badge: "Statutory PDF",
  },
  {
    label: "Settings",
    title: "System & Standard Settings",
    href: "/government/dashboard/digital-eye/pundit/neural-link/settings",
    aliases: ["/government/dashboard/digital-eye/pundit/settings"],
    icon: Settings,
    description: "Platform defaults: preferred curve type, reference standard, display units and standards registry.",
    badge: "BS 1881-203",
  },
];

interface NexuconLinkNavProps {
  subtitle?: string;
  className?: string;
}

export default function NexuconLinkNav({ subtitle, className = "" }: NexuconLinkNavProps) {
  const pathname = usePathname();

  const isItemActive = (item: NexuconLinkNavItem) => {
    if (item.href === "/government/dashboard/digital-eye/pundit/neural-link") {
      if (
        pathname === "/government/dashboard/digital-eye/pundit/neural-link" ||
        pathname === "/government/dashboard/digital-eye/pundit/neural-link/curve-manager"
      ) {
        return true;
      }
      return false;
    }
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
    if (item.aliases?.some((alias) => pathname === alias || pathname.startsWith(`${alias}/`))) {
      return true;
    }
    return false;
  };

  const current = NEXUCON_LINK_NAV.find((item) => isItemActive(item));

  return (
    <nav
      aria-label="Neural Link Navigation"
      className={`rounded-2xl border border-slate-700/60 bg-gradient-to-r from-[#0F172A] via-[#0A192F] to-[#022C4F] p-1.5 shadow-xl shadow-slate-950/20 text-white ${className}`}
    >
      {/* Top Header & Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Cpu size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Neural Link NDT Suite
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck size={11} />
                <span>BS 1881-203 Verified</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <span className="text-cyan-400 font-medium">Workspace</span>
              <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
              <span className="font-semibold text-white">{current ? current.title : "Calibration Console"}</span>
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
            NON-DESTRUCTIVE TESTING (UPV + SONREB)
          </span>
        </div>
      </div>

      {/* 4 Core Sections */}
      <div className="grid grid-cols-2 gap-1.5 p-1.5 sm:grid-cols-4">
        {NEXUCON_LINK_NAV.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.description}
              aria-current={active ? "page" : undefined}
              className={`group relative flex flex-col justify-between rounded-xl px-3.5 py-2.5 transition-all duration-200 ${
                active
                  ? "bg-gradient-to-b from-cyan-600/30 to-blue-600/20 border border-cyan-400/60 shadow-lg shadow-cyan-950/40 text-white"
                  : "bg-slate-800/40 border border-slate-700/40 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${active ? "bg-cyan-500 text-slate-950" : "bg-slate-700/50 text-slate-400 group-hover:text-cyan-400"}`}>
                  <Icon size={16} />
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase ${
                    active ? "bg-cyan-400/20 text-cyan-200 border border-cyan-400/30" : "bg-slate-700/30 text-slate-300"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold block tracking-tight text-white">{item.label}</span>
                <span className="text-[10px] text-slate-300 line-clamp-1 group-hover:text-slate-200">
                  {item.title}
                </span>
              </div>
              {active && (
                <div className="absolute -bottom-1.5 left-4 right-4 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
