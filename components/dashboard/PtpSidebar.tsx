"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Building2,
  Search,
  Compass,
  FileCheck2,
  AlertTriangle,
  Send,
  Bookmark,
  Settings,
  ChevronLeft,
  LogOut,
  ShieldCheck,
  Globe,
  X,
  type LucideIcon,
  ExternalLink
} from "lucide-react";

interface PtpSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

type SidebarItem = {
  sectionHeader?: string;
  name: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  badgeColor?: string;
};

const ptpLinks: SidebarItem[] = [
  {
    name: "Overview",
    icon: Home,
    href: "/ptp/dashboard",
  },
  {
    sectionHeader: "Public Registries & Data",
    name: "Project Registry",
    icon: Search,
    href: "/ptp/dashboard/search",
  },
  {
    name: "GIS Safety Map",
    icon: Compass,
    href: "/ptp/dashboard/map",
    badge: "Live",
    badgeColor: "bg-emerald-500",
  },
  {
    name: "Certificate Verify",
    icon: FileCheck2,
    href: "/ptp/dashboard/verify",
  },
  {
    sectionHeader: "Civic Action & Alerts",
    name: "Statutory Bulletins",
    icon: AlertTriangle,
    href: "/ptp/dashboard/notices",
    badge: "LASBCA",
    badgeColor: "bg-amber-500",
  },
  {
    name: "Report Violation",
    icon: Send,
    href: "/ptp/dashboard/report",
    badge: "Tip-off",
    badgeColor: "bg-red-500",
  },
  {
    name: "My Watchlist",
    icon: Bookmark,
    href: "/ptp/dashboard/watchlist",
  },
  {
    sectionHeader: "Preferences",
    name: "Civic Settings",
    icon: Settings,
    href: "/ptp/dashboard/settings",
  },
];

export default function PtpSidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobile = false,
  onCloseMobile,
}: PtpSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/ptp/login');
  };

  const navContent = (
    <>
      {/* Top Area - Logo and Toggle / Close (Matches Government / Stakeholder Sidebar) */}
      <div
        className={`flex items-center shrink-0 ${
          isMobile
            ? "justify-between px-6 pt-6 pb-4"
            : !isMobile && isCollapsed
            ? "justify-center pt-8 pb-12"
            : "justify-between px-8 pt-8 pb-12"
        }`}
      >
        <div
          className={`flex items-center overflow-hidden transition-all duration-300 ${
            !isMobile && isCollapsed ? "w-12 h-12 cursor-pointer" : "w-auto"
          }`}
          onClick={!isMobile && isCollapsed ? onToggleCollapse : undefined}
          title={!isMobile && isCollapsed ? "Expand Sidebar" : undefined}
        >
          <Link href="/ptp/dashboard" className="flex items-center">
            <Image
              src={!isMobile && isCollapsed
                ? "https://res.cloudinary.com/depeqzb6z/image/upload/v1774500774/gaskia_logo-04_112538_1_1_ye9l2c.png"
                : "https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"}
              alt="Nexucon Logo"
              width={!isMobile && isCollapsed ? 48 : 150}
              height={48}
              priority
              className={`transition-all duration-300 brightness-0 invert ${
                !isMobile && isCollapsed ? "h-12 w-12 object-contain" : "h-9 w-auto object-contain"
              }`}
            />
          </Link>
        </div>

        {isMobile ? (
          <button
            onClick={onCloseMobile}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close Navigation Menu"
          >
            <X size={18} />
          </button>
        ) : !isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-full bg-white text-[#022C4F] hover:scale-110 transition-transform shrink-0 shadow-lg cursor-pointer"
            aria-label="Collapse Sidebar"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
        )}
      </div>

      {(!isCollapsed || isMobile) && (
        <div className="px-6 mb-4">
          <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between text-xs font-semibold text-white">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="tracking-wide text-xs">Civic Open Data</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
              PTP
            </span>
          </div>
        </div>
      )}

      {(!isCollapsed || isMobile) && <div className="w-full h-px bg-white/20 mb-4 shrink-0" />}

      {/* Navigation Links */}
      <div
        className={`flex-1 overflow-y-auto pb-6 flex flex-col gap-1 scrollbar-hide hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isMobile ? "px-4" : isCollapsed ? "px-0 items-center" : "px-6"
        }`}
      >
        {ptpLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/ptp/dashboard" && pathname.startsWith(`${link.href}/`));
          const Icon = link.icon;

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

              <Link
                href={link.href}
                onClick={() => {
                  if (isMobile) onCloseMobile?.();
                }}
                className={`flex items-center justify-between rounded-xl transition-all duration-200 group ${
                  !isMobile && isCollapsed
                    ? "justify-center p-3 w-12 h-12 mx-auto"
                    : "px-3.5 py-2.5 sm:px-4 sm:py-3 w-full min-h-[44px]"
                } ${
                  isActive
                    ? "bg-white/15 text-white font-bold shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                title={!isMobile && isCollapsed ? link.name : undefined}
              >
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <Icon
                    size={!isMobile && isCollapsed ? 24 : 18}
                    className={`shrink-0 transition-transform duration-200 ${
                      isActive ? "text-white scale-105" : "text-white/70 group-hover:text-white"
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  {(isMobile || !isCollapsed) && (
                    <span className="tracking-wide text-xs sm:text-[13px] truncate">{link.name}</span>
                  )}
                </div>

                {(isMobile || !isCollapsed) && link.badge && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full text-white ${
                      link.badgeColor || "bg-cyan-500"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            </div>
          );
        })}

        {/* Public Landing Link */}
        {(isMobile || !isCollapsed) && (
          <div className="pt-4 mt-2 border-t border-white/10 px-3">
            <Link
              href="/transparency"
              className="flex items-center justify-between text-xs text-cyan-200/80 hover:text-cyan-100 py-2 rounded-lg px-2 hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Globe size={15} />
                <span className="font-medium">Public Information Page</span>
              </span>
              <ExternalLink size={13} />
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Area - User Profile & Logout (Matches Government design system) */}
      <div
        className={`border-t border-white/10 flex shrink-0 ${
          isMobile
            ? "p-4 bg-black/10 items-center justify-between"
            : isCollapsed
            ? "p-6 flex-col items-center justify-center gap-8"
            : "p-6 items-center justify-between"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <div
            className={`shrink-0 rounded-full bg-white text-[#022C4F] font-extrabold flex items-center justify-center shadow-inner uppercase ${
              isMobile ? "w-10 h-10 text-sm" : "w-12 h-12 text-base"
            }`}
          >
            {user?.first_name?.[0] || 'C'}{user?.last_name?.[0] || 'M'}
          </div>
          {(isMobile || !isCollapsed) && (
            <div className="flex flex-col whitespace-nowrap min-w-0">
              <span className="font-bold text-xs sm:text-sm truncate max-w-[140px] text-white">
                {user ? `${user.first_name} ${user.last_name || ''}`.trim() || user.email : 'Citizen Monitor'}
              </span>
              <span className="text-[10px] sm:text-xs text-white/60 truncate max-w-[140px] flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                <span>Civic Observer</span>
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
          title="Log Out"
          aria-label="Log Out"
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
      className={`fixed top-4 bottom-4 left-4 z-40 bg-[#022C4F] rounded-[30px] text-white flex flex-col hidden lg:flex transition-all duration-300 ${
        isCollapsed ? "w-[100px]" : "w-[300px]"
      }`}
    >
      {navContent}
    </aside>
  );
}
