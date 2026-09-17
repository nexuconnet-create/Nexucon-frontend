"use client";

import React, { useState, useEffect } from "react";
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
  ChevronDown,
  LogOut,
  ExternalLink,
  X,
  RefreshCw,
  Inbox,
  Radio,
  Sparkles,
  Box,
  Satellite,
  Scan,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

interface InspectorSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

type SidebarSubItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

type SidebarItem = {
  sectionHeader?: string;
  name: string;
  icon: LucideIcon;
  href?: string;
  badge?: string;
  subItems?: SidebarSubItem[];
};

const INSPECTOR_NAV_ITEMS: SidebarItem[] = [
  {
    sectionHeader: "Oversight & Field",
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/inspector/dashboard",
  },
  {
    name: "Assigned Projects",
    icon: Building2,
    href: "/inspector/dashboard/projects",
  },
  {
    name: "Field Inspections",
    icon: ClipboardCheck,
    href: "/inspector/dashboard/inspections",
    badge: "4",
  },
  {
    name: "Evidence Vault",
    icon: Layers,
    href: "/inspector/dashboard/evidence",
  },
  {
    sectionHeader: "Digital Eye Suite",
    name: "Digital Eye",
    icon: Eye,
    href: "/inspector/dashboard/digital-eye",
    subItems: [
      { name: "T-S1 MVP", href: "/inspector/dashboard/digital-eye/ts-1", icon: Scan },
      { name: "PUNDIT UPV Ultrasonic", href: "/inspector/dashboard/digital-eye/pundit", icon: Sparkles },
      { name: "GPR Radargram Radar", href: "/inspector/dashboard/digital-eye/gpr", icon: Radio },
      { name: "Trimble Connect", href: "/inspector/dashboard/digital-eye/trimble", icon: Box },
      { name: "GNSS", href: "/inspector/dashboard/digital-eye/gnss", icon: Satellite },
      { name: "Audit & SHA-Vault", href: "/inspector/dashboard/digital-eye/audit-vault", icon: ShieldCheck },
    ],
  },
  {
    name: "Findings & SWOs",
    icon: AlertTriangle,
    href: "/inspector/dashboard/findings",
    badge: "12",
  },
  {
    name: "Compliance Standards",
    icon: ShieldCheck,
    href: "/inspector/dashboard/compliance",
  },
  {
    sectionHeader: "Docs & System",
    name: "Site Documents",
    icon: FolderOpen,
    href: "/inspector/dashboard/documents",
  },
  {
    name: "Inspection Reports",
    icon: FileText,
    href: "/inspector/dashboard/reports",
  },
  {
    name: "Alerts & Notices",
    icon: Bell,
    href: "/inspector/dashboard/notifications",
  },
  {
    name: "Inspector Profile",
    icon: Settings,
    href: "/inspector/dashboard/settings",
  },
  {
    sectionHeader: "Sync Center",
    name: "Sync Status & Queue",
    icon: RefreshCw,
    href: "/inspector/dashboard/sync",
    badge: "3",
  },
  {
    name: "Manual Import",
    icon: Inbox,
    href: "/inspector/dashboard/sync/import",
  },
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

  const [openSections, setOpenSections] = useState<string[]>(["Digital Eye"]);

  useEffect(() => {
    const activeSection = INSPECTOR_NAV_ITEMS.find((link) =>
      link.subItems?.some(
        (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
      )
    );
    if (activeSection && !openSections.includes(activeSection.name)) {
      setOpenSections((prev) => [...prev, activeSection.name]);
    }
  }, [pathname, openSections]);

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout("/inspector/login");
  };

  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.email?.split("@")[0]
    : "Field Inspector";

  const navContent = (
    <>
      {/* Top Area - Brand Logo and Toggle / Close button */}
      <div
        className={`flex items-center shrink-0 ${
          isMobile
            ? "justify-between px-6 pt-6 pb-4"
            : isCollapsed
            ? "justify-center pt-8 pb-10"
            : "justify-between px-8 pt-8 pb-10"
        }`}
      >
        <div
          className={`flex items-center overflow-hidden transition-all duration-300 ${
            !isMobile && isCollapsed ? "w-12 h-12 cursor-pointer" : "w-auto"
          }`}
          onClick={!isMobile && isCollapsed ? onToggleCollapse : undefined}
          title={!isMobile && isCollapsed ? "Expand Sidebar" : undefined}
        >
          <Image
            src={
              !isMobile && isCollapsed
                ? "https://res.cloudinary.com/depeqzb6z/image/upload/v1774500774/gaskia_logo-04_112538_1_1_ye9l2c.png"
                : "https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            }
            alt="Nexucon Logo"
            width={!isMobile && isCollapsed ? 48 : 140}
            height={44}
            priority
            className={`transition-all duration-300 brightness-0 invert ${
              !isMobile && isCollapsed
                ? "h-10 w-10 object-contain"
                : "h-9 w-auto object-contain"
            }`}
          />
        </div>

        {isMobile ? (
          <button
            onClick={onCloseMobile}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close Navigation Menu"
          >
            <X size={18} />
          </button>
        ) : (
          !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-full bg-white text-[#022C4F] hover:scale-110 transition-transform shrink-0 shadow-lg cursor-pointer"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft size={16} strokeWidth={3} />
            </button>
          )
        )}
      </div>

      {(!isCollapsed || isMobile) && (
        <div className="w-full h-px bg-white/20 mb-4 shrink-0" />
      )}

      {/* Navigation Links Scroll Area */}
      <div
        className={`flex-1 overflow-y-auto pb-6 flex flex-col gap-1 scrollbar-hide hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isMobile ? "px-4" : isCollapsed ? "px-0 items-center" : "px-6"
        }`}
      >
        {INSPECTOR_NAV_ITEMS.map((link) => {
          const isParent = !!(link.subItems && link.subItems.length > 0);
          const targetHref =
            link.href || (isParent ? link.subItems![0].href : "#");

          const isActive = link.href
            ? link.href === "/inspector/dashboard"
              ? pathname === "/inspector/dashboard"
              : pathname === link.href || pathname.startsWith(`${link.href}/`)
            : false;

          const isSubActive = link.subItems?.some(
            (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
          );

          const isItemActive = isActive || isSubActive;
          const Icon = link.icon;
          const isOpen = openSections.includes(link.name);

          const toggleSection = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenSections((prev) =>
              prev.includes(link.name)
                ? prev.filter((n) => n !== link.name)
                : [...prev, link.name]
            );
          };

          return (
            <div key={link.name} className="flex flex-col mb-1 w-full">
              {link.sectionHeader && (isMobile || !isCollapsed) && (
                <div className="pt-4 pb-1.5 px-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300/80 block">
                    {link.sectionHeader}
                  </span>
                </div>
              )}
              {link.sectionHeader && !isMobile && isCollapsed && (
                <div className="w-8 h-px bg-white/20 my-2 mx-auto" />
              )}

              {/* Main Nav Link */}
              <Link
                href={isParent && (isMobile || !isCollapsed) ? targetHref : targetHref}
                onClick={(e) => {
                  if (isParent) {
                    if (isMobile) {
                      toggleSection(e);
                      return;
                    }
                  }
                  if (isMobile) {
                    onCloseMobile?.();
                  }
                }}
                className={`flex items-center justify-between rounded-xl transition-all duration-200 group ${
                  !isMobile && isCollapsed
                    ? "justify-center p-3 w-12 h-12 mx-auto"
                    : "px-3.5 py-2.5 sm:px-4 sm:py-3 w-full min-h-[44px]"
                } ${
                  isItemActive
                    ? "bg-white/15 text-white font-bold shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                title={!isMobile && isCollapsed ? link.name : undefined}
              >
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <Icon
                    size={!isMobile && isCollapsed ? 22 : 18}
                    className={`shrink-0 transition-transform duration-200 ${
                      isItemActive
                        ? "text-white scale-105"
                        : "text-white/70 group-hover:text-white"
                    }`}
                    strokeWidth={isItemActive ? 2.5 : 1.5}
                  />
                  {(isMobile || !isCollapsed) && (
                    <span className="tracking-wide text-xs sm:text-[13px] truncate">
                      {link.name}
                    </span>
                  )}
                </div>

                {/* Right controls: Badge or Dropdown Chevron */}
                {(isMobile || !isCollapsed) && (
                  <div className="flex items-center gap-2 shrink-0">
                    {link.badge && !isParent && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {link.badge}
                      </span>
                    )}

                    {isParent && (
                      <button
                        onClick={toggleSection}
                        className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label={`Toggle ${link.name} sub-menu`}
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                )}
              </Link>

              {/* Collapsible Sub Items for Digital Eye */}
              {isParent && (isMobile || !isCollapsed) && isOpen && (
                <div className="flex flex-col ml-6 pl-2 border-l border-white/10 mt-1 gap-1">
                  {link.subItems?.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubItemActive =
                      pathname === sub.href || pathname.startsWith(`${sub.href}/`);

                    return (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={() => {
                          if (isMobile) onCloseMobile?.();
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group min-h-[38px] text-xs ${
                          isSubItemActive
                            ? "bg-white/10 text-white font-bold"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <SubIcon
                            size={15}
                            className={`shrink-0 transition-transform duration-200 ${
                              isSubItemActive
                                ? "text-cyan-300 scale-105"
                                : "text-white/50 group-hover:text-white"
                            }`}
                            strokeWidth={isSubItemActive ? 2.5 : 1.5}
                          />
                          <span className="tracking-wide truncate">
                            {sub.name}
                          </span>
                        </div>
                        {sub.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded text-cyan-200">
                            {sub.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Area - User Profile & Logout aligned with Government Dashboard */}
      <div
        className={`border-t border-white/10 flex shrink-0 ${
          isMobile
            ? "p-4 bg-black/10 items-center justify-between"
            : isCollapsed
            ? "p-6 flex-col items-center justify-center gap-6"
            : "p-6 items-center justify-between"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <div
            className={`shrink-0 rounded-full bg-white text-[#022C4F] font-extrabold flex items-center justify-center shadow-inner uppercase ${
              isMobile ? "w-10 h-10 text-sm" : "w-12 h-12 text-base"
            }`}
          >
            {user?.first_name?.[0] || "I"}
            {user?.last_name?.[0] || "N"}
          </div>
          {(isMobile || !isCollapsed) && (
            <div className="flex flex-col whitespace-nowrap min-w-0">
              <span className="font-bold text-xs sm:text-sm truncate max-w-[140px] text-white">
                {userName}
              </span>
              <span className="text-[10px] sm:text-xs text-cyan-200/70 truncate max-w-[140px]">
                Badge #LAG-INS-042
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="w-full h-full bg-[#022C4F] text-white flex flex-col overflow-hidden">
        {navContent}
      </div>
    );
  }

  return (
    <aside
      className={`fixed top-4 bottom-4 left-4 z-40 bg-[#022C4F] rounded-[30px] text-white flex flex-col hidden lg:flex transition-all duration-300 shadow-xl ${
        isCollapsed ? "w-[100px]" : "w-[300px]"
      }`}
    >
      {navContent}
    </aside>
  );
}
