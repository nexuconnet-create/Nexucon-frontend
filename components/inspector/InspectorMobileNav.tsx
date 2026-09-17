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
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function InspectorMobileNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { logout } = useAuth();

  const PRIMARY_MOBILE_ITEMS = [
    { name: "Home", href: "/inspector/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Projects", href: "/inspector/dashboard/projects", icon: Building2 },
    { name: "Inspect", href: "/inspector/dashboard/inspections", icon: ClipboardCheck },
    { name: "Evidence", href: "/inspector/dashboard/evidence", icon: Layers },
  ];

  const SECONDARY_ITEMS = [
    { name: "Digital Eye (GPR/BIM)", href: "/inspector/dashboard/digital-eye", icon: Eye, color: "text-emerald-600" },
    { name: "Findings & SWOs", href: "/inspector/dashboard/findings", icon: AlertTriangle, color: "text-rose-600" },
    { name: "Compliance & Orders", href: "/inspector/dashboard/compliance", icon: ShieldCheck, color: "text-blue-600" },
    { name: "Documents", href: "/inspector/dashboard/documents", icon: FolderOpen, color: "text-cyan-600" },
    { name: "Reports & Certificates", href: "/inspector/dashboard/reports", icon: FileText, color: "text-amber-600" },
    { name: "Sync Status & Queue", href: "/inspector/dashboard/sync", icon: ClipboardCheck, color: "text-indigo-600" },
    { name: "Manual Import (CSV/PDF)", href: "/inspector/dashboard/sync/import", icon: FolderOpen, color: "text-teal-600" },
    { name: "Notifications", href: "/inspector/dashboard/notifications", icon: Bell, color: "text-purple-600" },
    { name: "Inspector Profile", href: "/inspector/dashboard/settings", icon: Settings, color: "text-slate-600" },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar on Mobile & Small Tablets */}
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
                isActive ? "text-[#022C4F] font-extrabold" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <item.icon size={19} className={isActive ? "scale-110 text-[#022C4F]" : "text-slate-400"} />
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
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* Expanded Modal Bottom Sheet */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-[#0F181F]/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMoreOpen(false)}
          />

          <div className="relative bg-white rounded-t-[28px] border-t border-slate-200 shadow-2xl p-5 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#022C4F]">Inspector Modules</h3>
                <p className="text-[11px] text-gray-500">Fast station navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5 py-1">
              {SECONDARY_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
                >
                  <item.icon size={18} className={item.color} />
                  <span>{item.name}</span>
                </Link>
              ))}

              <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    setIsMoreOpen(false);
                    await logout("/inspector/login");
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors text-xs font-bold w-full cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LogOut size={15} />
                    <span>Sign Out of Inspector Terminal</span>
                  </span>
                </button>
                <a
                  href="https://nexucon.net/government/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#022C4F] transition-colors text-xs font-bold"
                >
                  <span>Agency Directorate Portal</span>
                  <ExternalLink size={14} className="text-[#0284C7]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
