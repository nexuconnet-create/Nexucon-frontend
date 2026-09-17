"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Layers,
  MoreHorizontal,
  Eye,
  AlertTriangle,
  ShieldCheck,
  FolderOpen,
  FileText,
  Bell,
  Settings,
  X,
  RefreshCw,
  Inbox,
  Scan,
  Sparkles,
  Radio,
  Box,
  Satellite,
  ChevronRight,
} from "lucide-react";

export default function InspectorMobileNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const PRIMARY_MOBILE_ITEMS = [
    { name: "Home", href: "/inspector/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Projects", href: "/inspector/dashboard/projects", icon: Building2 },
    { name: "Inspect", href: "/inspector/dashboard/inspections", icon: ClipboardCheck },
    { name: "Evidence", href: "/inspector/dashboard/evidence", icon: Layers },
  ];

  const DIGITAL_EYE_DEVICES = [
    { name: "T-S1 MVP (LiDAR SLAM)", href: "/inspector/dashboard/digital-eye/ts-1", icon: Scan, color: "text-cyan-600 bg-cyan-50" },
    { name: "PUNDIT UPV Ultrasonic", href: "/inspector/dashboard/digital-eye/pundit", icon: Sparkles, color: "text-amber-600 bg-amber-50" },
    { name: "GPR Radargram Radar", href: "/inspector/dashboard/digital-eye/gpr", icon: Radio, color: "text-blue-600 bg-blue-50" },
    { name: "Trimble Connect (BIM)", href: "/inspector/dashboard/digital-eye/trimble", icon: Box, color: "text-indigo-600 bg-indigo-50" },
    { name: "GNSS Geodetic RTK", href: "/inspector/dashboard/digital-eye/gnss", icon: Satellite, color: "text-emerald-600 bg-emerald-50" },
    { name: "Audit & SHA-Vault", href: "/inspector/dashboard/digital-eye/audit-vault", icon: ShieldCheck, color: "text-purple-600 bg-purple-50" },
  ];

  const SECONDARY_MODULES = [
    { name: "Findings & SWOs", href: "/inspector/dashboard/findings", icon: AlertTriangle, color: "text-rose-600" },
    { name: "Compliance Standards", href: "/inspector/dashboard/compliance", icon: ShieldCheck, color: "text-blue-600" },
    { name: "Site Documents", href: "/inspector/dashboard/documents", icon: FolderOpen, color: "text-cyan-600" },
    { name: "Inspection Reports", href: "/inspector/dashboard/reports", icon: FileText, color: "text-teal-600" },
    { name: "Sync Status & Queue", href: "/inspector/dashboard/sync", icon: RefreshCw, color: "text-indigo-600" },
    { name: "Manual Data Import", href: "/inspector/dashboard/sync/import", icon: Inbox, color: "text-emerald-600" },
    { name: "Notifications & Alerts", href: "/inspector/dashboard/notifications", icon: Bell, color: "text-violet-600" },
    { name: "Inspector Profile", href: "/inspector/dashboard/settings", icon: Settings, color: "text-slate-600" },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar on Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 shadow-lg z-40 px-2 flex items-center justify-around">
        {PRIMARY_MOBILE_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all select-none ${
                isActive
                  ? "text-[#022C4F] font-extrabold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <item.icon
                size={19}
                className={isActive ? "scale-110 text-[#022C4F]" : "text-slate-400"}
              />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* More Actions Trigger */}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all select-none cursor-pointer ${
            isMoreOpen ? "text-[#022C4F] font-extrabold" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <MoreHorizontal size={19} />
          <span className="text-[10px] tracking-tight">Devices & More</span>
        </button>
      </nav>

      {/* Expanded Modal Bottom Sheet */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-[#0F181F]/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMoreOpen(false)}
          />

          <div className="relative bg-white rounded-t-[28px] border-t border-slate-200 shadow-2xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#022C4F]">Inspector Modules & Devices</h3>
                <p className="text-[11px] text-gray-500">Digital Eye Suite & Field Navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Digital Eye Device Sub-pages */}
            <div className="mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0284C7] block mb-2 px-1">
                Digital Eye Sensor Devices
              </span>
              <div className="grid grid-cols-2 gap-2">
                {DIGITAL_EYE_DEVICES.map((dev) => (
                  <Link
                    key={dev.name}
                    href={dev.href}
                    onClick={() => setIsMoreOpen(false)}
                    className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${dev.color}`}>
                        <dev.icon size={15} />
                      </div>
                      <span className="text-xs font-bold text-[#022C4F] truncate">{dev.name.split(' ')[0]}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate">{dev.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Core Modules */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block mb-2 px-1">
                System & Field Records
              </span>
              <div className="grid grid-cols-1 gap-1">
                {SECONDARY_MODULES.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className={item.color} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
