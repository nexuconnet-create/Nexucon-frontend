"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getInspectorAccreditation,
  getInspectorDashboard,
} from "@/services/inspector";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Layers,
  Eye,
  Scan,
  Activity,
  Box,
  MapPin,
  Lock,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Upload,
  Radio,
  Cpu,
  FolderOpen,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  ExternalLink,
  X,
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
  subItems?: NavItem[];
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
      { name: "Field Inspections", href: "/inspector/dashboard/inspections", icon: ClipboardCheck },
      { name: "Evidence Vault", href: "/inspector/dashboard/evidence", icon: Layers },
    ]
  },
  {
    header: "DIGITAL EYE INTEGRATION",
    items: [
      {
        name: "Digital Eye",
        href: "/inspector/dashboard/digital-eye",
        icon: Eye,
        exact: true,
        badge: "Suite",
        subItems: [
          { name: "T-S1 MVP", href: "/inspector/dashboard/digital-eye/ts-1", icon: Scan, badge: "TS-1" },
          { name: "PUNDIT Ultrasonic NDT", href: "/inspector/dashboard/digital-eye/pundit", icon: Activity, badge: "UPV" },
          { name: "GPR Radargram Analysis", href: "/inspector/dashboard/digital-eye/gpr", icon: Radio },
          { name: "Trimble Connect 3D BIM Viewer", href: "/inspector/dashboard/digital-eye/trimble", icon: Box, live: true },
          { name: "Spatial Evidence Map", href: "/inspector/dashboard/digital-eye/spatial", icon: MapPin },
          { name: "Audit & SHA-256 Vault", href: "/inspector/dashboard/digital-eye/audit-vault", icon: ShieldCheck, badge: "SHA" },
        ]
      },
    ]
  },
  {
    header: "TECHNICAL ANALYSIS",
    items: [
      { name: "Findings & SWOs", href: "/inspector/dashboard/findings", icon: AlertTriangle },
      { name: "Compliance Standards", href: "/inspector/dashboard/compliance", icon: ShieldCheck },
    ]
  },
  {
    header: "SYNC CENTER",
    items: [
      { name: "Sync Status", href: "/inspector/dashboard/sync", icon: RefreshCw, exact: true },
      { name: "Manual Import", href: "/inspector/dashboard/sync/import", icon: Upload },
      { name: "Telemetry Status", href: "/inspector/dashboard/sync/telemetry", icon: Radio },
      { name: "Instruments", href: "/inspector/dashboard/sync/devices", icon: Cpu },
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

  // The nav badges used to be fixed strings — "4" on Field Inspections and
  // "12" on Findings & SWOs — printed identically for every inspector on every
  // page, whatever their actual workload. They are now the real counts, and
  // they are omitted rather than defaulted when the server has not been read.
  const [badges, setBadges] = useState<Record<string, string> | null>(null);
  const [accreditationLine, setAccreditationLine] = useState<string | null>(null);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    "/inspector/dashboard/digital-eye": true,
  });

  // Keep Digital Eye submenu open whenever the current path is inside digital-eye
  useEffect(() => {
    if (pathname.startsWith("/inspector/dashboard/digital-eye")) {
      setOpenSubmenus((prev) => ({ ...prev, "/inspector/dashboard/digital-eye": true }));
    }
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    getInspectorDashboard()
      .then((dashboard) => {
        if (cancelled) return;
        const kpis = dashboard.kpis;
        setBadges({
          "/inspector/dashboard/findings": String(kpis.open_findings),
          "/inspector/dashboard/inspections": String(kpis.upcoming_inspections),
        });
        const profile = dashboard.profile;
        // Agency and directorate as recorded, or a plain statement that
        // neither is. "LASBCA • Ikeja North" was a literal.
        const agency = profile?.agency;
        const district = profile?.district;
        setAccreditationLine(
          agency || district
            ? [agency, district].filter(Boolean).join(" • ")
            : "Agency not recorded"
        );
      })
      .catch(() => {
        if (!cancelled) setAccreditationLine("Agency not read");
      });
    getInspectorAccreditation()
      .then((result) => {
        if (cancelled) return;
        if (result.accredited) {
          setAccreditationLine((prev) =>
            prev && prev !== "Agency not recorded"
              ? prev
              : result.accreditation.directorate || "Directorate not recorded"
          );
        }
      })
      .catch(() => {
        /* the dashboard call already covers the not-read case */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout("/inspector/login");
  };

  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Inspector"
    : "Inspector";

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
              const hasSub = !!(item.subItems && item.subItems.length > 0);
              const isSubOpen = !!openSubmenus[item.href];
              const isChildActive = hasSub && item.subItems!.some((sub) =>
                pathname === sub.href || pathname.startsWith(sub.href + "/")
              );
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center gap-1 w-full">
                    <Link
                      href={item.href}
                      title={isCollapsed && !isMobile ? item.name : undefined}
                      className={`flex-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative group select-none ${
                        isActive && !isChildActive
                          ? "bg-white text-[#022C4F] font-bold shadow-md"
                          : isChildActive
                          ? "bg-white/10 text-white font-bold"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      } ${isCollapsed && !isMobile ? "justify-center px-0 w-full" : ""}`}
                    >
                      <item.icon
                        size={19}
                        className={`shrink-0 transition-transform ${
                          isActive && !isChildActive
                            ? "text-[#022C4F] scale-105"
                            : isChildActive
                            ? "text-cyan-400"
                            : "text-white/70 group-hover:text-white"
                        }`}
                      />

                      {(!isCollapsed || isMobile) && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.name}</span>

                          <div className="flex items-center gap-1.5 ml-2">
                            {item.live && (
                              <span className="flex items-center gap-1 text-[9px] font-mono font-extrabold text-emerald-300 bg-emerald-950/60 border border-emerald-400/40 px-1.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                3D
                              </span>
                            )}

                            {item.badge && !item.live && (
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  isActive && !isChildActive
                                    ? "bg-[#022C4F] text-white"
                                    : "bg-white/15 text-white"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}

                            {!item.badge && !item.live && badges?.[item.href] && (
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  isActive && !isChildActive
                                    ? "bg-[#022C4F] text-white"
                                    : "bg-white/15 text-white"
                                }`}
                              >
                                {badges[item.href]}
                              </span>
                            )}

                            {hasSub && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenSubmenus((prev) => ({
                                    ...prev,
                                    [item.href]: !prev[item.href],
                                  }));
                                }}
                                className="p-1 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                                aria-label="Toggle submenu"
                              >
                                <ChevronDown
                                  size={14}
                                  className={`transition-transform duration-200 ${
                                    isSubOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* Expanded Sub-items (Desktop expanded or Mobile) */}
                  {hasSub && isSubOpen && (!isCollapsed || isMobile) && (
                    <div className="ml-4 pl-3 border-l border-white/20 space-y-1 py-1">
                      {item.subItems!.map((sub) => {
                        const isSubActive =
                          pathname === sub.href || pathname.startsWith(sub.href + "/");

                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => {
                              if (isMobile) onCloseMobile?.();
                            }}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative group select-none ${
                              isSubActive
                                ? "bg-white text-[#022C4F] font-bold shadow-md"
                                : "text-white/75 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <sub.icon
                              size={16}
                              className={`shrink-0 transition-transform ${
                                isSubActive
                                  ? "text-[#022C4F] scale-105"
                                  : "text-white/60 group-hover:text-white"
                              }`}
                            />
                            <span className="flex-1 truncate">{sub.name}</span>

                            {sub.live && (
                              <span className="flex items-center gap-1 text-[8px] font-mono font-extrabold text-emerald-300 bg-emerald-950/60 border border-emerald-400/40 px-1 py-0.2 rounded-full">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                3D
                              </span>
                            )}

                            {sub.badge && !sub.live && (
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                                  isSubActive
                                    ? "bg-[#022C4F] text-white"
                                    : "bg-white/15 text-white/90"
                                }`}
                              >
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Collapsed Mode Sub-item Quick Icons */}
                  {hasSub && isCollapsed && !isMobile && (
                    <div className="flex flex-col items-center gap-1 py-1 border-t border-b border-white/10 my-1 w-full">
                      {item.subItems!.map((sub) => {
                        const isSubActive =
                          pathname === sub.href || pathname.startsWith(sub.href + "/");
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            title={sub.name}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                              isSubActive
                                ? "bg-white text-[#022C4F] font-bold shadow-md"
                                : "text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <sub.icon size={16} />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer: Directorate Link & Inspector Profile */}
      <div className={`p-4 border-t border-white/15 space-y-2 shrink-0 ${isCollapsed && !isMobile ? "px-2 text-center" : ""}`}>
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
              <p className="text-[10px] font-mono text-white/60 truncate">
                {accreditationLine || "Agency not read"}
              </p>
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
