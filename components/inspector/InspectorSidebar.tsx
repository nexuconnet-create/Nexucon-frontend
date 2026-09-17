"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Layers,
  Eye,
  AlertTriangle,
  ShieldCheck,
  FolderOpen,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  X,
  RefreshCw,
  Inbox,
  Wifi,
  HardDrive,
} from "lucide-react";

interface InspectorSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  exact?: boolean;
  live?: boolean;
  badge?: string;
}

interface NavSection {
  header: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    header: "OVERSIGHT & FIELD",
    items: [
      { name: "Command Center", href: "/inspector/dashboard", icon: LayoutDashboard, exact: true },
      { name: "Assigned Projects", href: "/inspector/dashboard/projects", icon: Building2 },
      { name: "Field Inspections", href: "/inspector/dashboard/inspections", icon: ClipboardCheck, badge: "4" },
      { name: "Evidence Vault", href: "/inspector/dashboard/evidence", icon: Layers },
    ]
  },
  {
    header: "TECHNICAL ANALYSIS",
    items: [
      { name: "Digital Eye (GPR/BIM)", href: "/inspector/dashboard/digital-eye", icon: Eye, live: true },
      { name: "Findings & SWOs", href: "/inspector/dashboard/findings", icon: AlertTriangle, badge: "12" },
      { name: "Compliance Standards", href: "/inspector/dashboard/compliance", icon: ShieldCheck },
    ]
  },
  {
    header: "DOCS & SYSTEM",
    items: [
      { name: "Site Documents", href: "/inspector/dashboard/documents", icon: FolderOpen },
      { name: "Inspection Reports", href: "/inspector/dashboard/reports", icon: FileText },
      { name: "Alerts & Notices", href: "/inspector/dashboard/notifications", icon: Bell },
      { name: "Inspector Profile", href: "/inspector/dashboard/settings", icon: Settings },
    ]
  },
  {
    header: "SYNC CENTER",
    items: [
      { name: "Sync Status", href: "/inspector/dashboard/sync", icon: RefreshCw, badge: "3" },
      { name: "Manual Import", href: "/inspector/dashboard/sync/import", icon: Inbox },
    ]
  }
];

export default function InspectorSidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobile = false,
  onCloseMobile,
}: InspectorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout("/inspector/login");
  };

  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email?.split("@")[0]
    : "Field Inspector";

  return (
    <aside
      className={`${
        isMobile
          ? "w-full h-full flex flex-col bg-[#022C4F] text-white p-4"
          : `hidden lg:flex flex-col fixed top-0 bottom-0 left-0 lg:top-4 lg:bottom-4 lg:left-4 z-50 bg-[#022C4F] text-white shadow-2xl transition-all duration-300 rounded-none lg:rounded-[24px] ${
              isCollapsed ? "w-[100px]" : "w-[300px]"
            }`
      }`}
    >
      {/* Brand & Collapse Header */}
      <div className="flex items-center justify-between p-5 pb-4 shrink-0">
        <Link
          href="/inspector/dashboard"
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
        >
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={isCollapsed && !isMobile ? 38 : 130}
            height={36}
            priority
            className="h-8 w-auto object-contain brightness-0 invert transition-all duration-300"
          />
          {(!isCollapsed || isMobile) && (
            <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#0284C7] bg-white/10 px-2 py-0.5 rounded-full shrink-0">
              Inspector
            </span>
          )}
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close Navigation"
          >
            <X size={18} />
          </button>
        ) : onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-full bg-white text-[#022C4F] hover:scale-110 transition-transform shrink-0 shadow-lg cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
          </button>
        ) : null}
      </div>

      {(!isCollapsed || isMobile) && (
        <div className="w-full h-px bg-white/15 mx-auto mb-2 shrink-0" />
      )}

      {/* Navigation List */}
      <nav className={`flex-1 overflow-y-auto space-y-4 py-2 scrollbar-hide hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
        isMobile ? "px-2" : isCollapsed ? "px-2 items-center" : "px-4"
      }`}>
        {SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {(!isCollapsed || isMobile) && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-white/50 tracking-wider uppercase font-mono">
                {section.header}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed && !isMobile ? item.name : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative group select-none ${
                    isActive
                      ? "bg-white text-[#022C4F] font-bold shadow-md"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  } ${isCollapsed && !isMobile ? "justify-center px-0" : ""}`}
                >
                  <item.icon
                    size={19}
                    className={`shrink-0 transition-transform ${
                      isActive ? "text-[#022C4F] scale-105" : "text-white/70 group-hover:text-white"
                    }`}
                  />

                  {(!isCollapsed || isMobile) && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.name}</span>

                      {item.live && (
                        <span className="flex items-center gap-1 text-[9px] font-mono font-extrabold text-emerald-300 bg-emerald-950/60 border border-emerald-400/40 px-1.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          3D
                        </span>
                      )}

                      {item.badge && !item.live && (
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-[#022C4F] text-white"
                              : "bg-white/15 text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer: Directorate Link & Inspector Profile */}
      <div className={`p-4 border-t border-white/15 space-y-2 shrink-0 ${isCollapsed && !isMobile ? "px-2 text-center" : ""}`}>
        {/* Sync Status Badges */}
        {(!isCollapsed || isMobile) ? (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync Active
            </span>
            <span className="text-amber-300/90 font-medium">
              Offline Cache
            </span>
          </div>
        ) : (
          <div className="flex justify-center p-1.5" title="Live Sync Active 🟢 • Offline Cache">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        {/* Link to Agency Directorate */}
        <a
          href="https://nexucon.net/government/login"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-colors ${
            isCollapsed && !isMobile ? "justify-center px-0" : ""
          }`}
          title="Go to Government Agency Directorate (nexucon.net/government/login)"
        >
          <ExternalLink size={14} className="shrink-0 text-[#0284C7]" />
          {(!isCollapsed || isMobile) && <span className="truncate">Agency Directorate</span>}
        </a>

        {/* User Card */}
        {(!isCollapsed || isMobile) ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] font-mono text-white/60 truncate">LASBCA &bull; Ikeja North</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
