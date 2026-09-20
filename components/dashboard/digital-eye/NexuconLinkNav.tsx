"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LineChart, FileText, Settings, ChevronRight } from "lucide-react";

/**
 * The NEXUCON LINK navigation layer.
 *
 * The client's "castle-like" structure (15 Sep 2026 review): the workspace is
 * organised in LAYERS — a top-level Digital Eye nav, then this Nexucon Link
 * layer, then the page. The wireframe draws it as a nested bar:
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  NEXUCON LINK                                                │
 *   │  [📊 Measurements] [📈 Curve Mgr] [📄 Reports] [⚙️ Settings] │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Rendered at the top of every Nexucon Link page so the workflow reads as one
 * grouped section rather than a fragmented set of screens. The breadcrumb
 * above the tiles names the layer the operator is currently inside.
 */

export interface NexuconLinkNavItem {
  /** The wireframe's tile label, kept verbatim. */
  label: string;
  /** The fuller name used in the breadcrumb and the accessible title. */
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const NEXUCON_LINK_NAV: NexuconLinkNavItem[] = [
  {
    label: "Measurements",
    title: "Measurements",
    href: "/government/dashboard/digital-eye/pundit/tests",
    icon: Activity,
    description: "The UPV readings recorded in the field, with the curve that produced each strength.",
  },
  {
    label: "Curve Manager",
    title: "Curve Manager",
    href: "/government/dashboard/digital-eye/pundit/neural-link",
    icon: LineChart,
    description: "Calibrate, compare and activate the velocity-to-strength conversion curves.",
  },
  {
    label: "Reports",
    title: "Nexucon Link Reports",
    href: "/government/dashboard/digital-eye/pundit/reports",
    icon: FileText,
    description: "FCU dossiers carrying the calibration disclosure and the standard-error policy applied.",
  },
  {
    label: "Settings",
    title: "System Settings",
    href: "/government/dashboard/digital-eye/pundit/settings",
    icon: Settings,
    description: "Platform defaults: preferred curve type, reference standard, display units and standards registry.",
  },
];

interface NexuconLinkNavProps {
  /** Optional page-specific note shown beside the breadcrumb. */
  subtitle?: string;
  className?: string;
}

export default function NexuconLinkNav({ subtitle, className = "" }: NexuconLinkNavProps) {
  const pathname = usePathname();

  // A tile is active on its own route and anything nested beneath it, so a
  // detail page still reads as part of its parent layer.
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const current = NEXUCON_LINK_NAV.find((item) => isActive(item.href));

  return (
    <nav
      aria-label="Nexucon Link"
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-900">
          Nexucon Link
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
        <span className="text-xs text-slate-500">
          {current ? current.title : "Calibration workspace"}
        </span>
        {subtitle && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
            <span className="text-xs text-slate-500">{subtitle}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        {NEXUCON_LINK_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.description}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`}
              />
              <span className="truncate font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
