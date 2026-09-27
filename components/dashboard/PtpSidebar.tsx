"use client";

import React, { useState, useEffect } from "react";
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
  ChevronDown,
  LogOut,
  ShieldCheck,
  Shield,
  Activity,
  Globe,
  Bell,
  User,
  X,
  type LucideIcon,
  HelpCircle,
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
      {/* Top Area - Logo and Toggle / Close */}
      <div
        className={`flex items-center shrink-0 ${
          isMobile
            ? "justify-between px-6 pt-6 pb-4"
            : isCollapsed
            ? "justify-center pt-8 pb-8"
            : "justify-between px-6 pt-8 pb-8"
        }`}
      >
        <Link
          href="/ptp/dashboard"
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
        >
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={isCollapsed && !isMobile ? 38 : 130}
            height={38}
            priority
            className={`transition-all duration-300 brightness-0 invert ${
              isCollapsed && !isMobile ? "h-8 w-auto object-contain" : "h-8 w-auto object-contain"
            }`}
          />
        </Link>

        {isMobile ? (
          <button
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close Navigation Menu"
          >
            <X size={16} />
          </button>
        ) : (
          !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-full bg-white text-[#022C4F] hover:scale-110 transition-transform shrink-0 shadow-lg cursor-pointer"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft size={14} strokeWidth={3} />
            </button>
          )
        )}
      </div>

      {(!isCollapsed || isMobile) && (
        <div className="px-6 mb-4">
          <div className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center gap-2 text-[10px] font-bold text-cyan-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="truncate">Public Transparency Portal</span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div
        className={`flex-1 overflow-y-auto pb-6 flex flex-col gap-1 scrollbar-hide hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isMobile ? "px-4" : isCollapsed ? "px-2 items-center" : "px-4"
        }`}
      >
        {ptpLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/ptp/dashboard" && pathname.startsWith(`${link.href}/`));
          const Icon = link.icon;

          return (
            <div key={link.name} className="flex flex-col mb-0.5 w-full">
              {link.sectionHeader && (isMobile || !isCollapsed) && (
                <div className="pt-3 pb-1 px-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300/70 block">
                    {link.sectionHeader}
                  </span>
                </div>
              )}
              {link.sectionHeader && !isMobile && isCollapsed && (
                <div className="w-6 h-px bg-white/10 my-2 mx-auto" />
              )}

              <Link
                href={link.href}
                onClick={() => {
                  if (isMobile) onCloseMobile?.();
                }}
                className={`flex items-center justify-between rounded-xl transition-all duration-200 group ${
                  !isMobile && isCollapsed
                    ? "justify-center p-2.5 w-10 h-10 mx-auto"
                    : "px-3.5 py-2.5 w-full min-h-[40px]"
                } ${
                  isActive
                    ? "bg-white/15 text-white font-bold shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                title={!isMobile && isCollapsed ? link.name : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={!isMobile && isCollapsed ? 20 : 17}
                    className={`shrink-0 transition-transform duration-200 ${
                      isActive ? "text-cyan-300 scale-105" : "text-white/60 group-hover:text-white"
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                  {(isMobile || !isCollapsed) && (
                    <span className="tracking-wide text-xs truncate">{link.name}</span>
                  )}
                </div>

                {(isMobile || !isCollapsed) && link.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${
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
              className="flex items-center justify-between text-xs text-cyan-200/80 hover:text-cyan-100 py-1.5"
            >
              <span className="flex items-center gap-2">
                <Globe size={14} />
                <span>Public Portal Guide</span>
              </span>
              <ExternalLink size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Area - User Profile & Logout */}
      <div
        className={`shrink-0 p-4 border-t border-white/10 ${
          !isMobile && isCollapsed ? "flex flex-col items-center" : ""
        }`}
      >
        <div
          className={`flex items-center gap-3 ${
            !isMobile && isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-cyan-600/40 border border-cyan-400/50 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {user?.first_name ? user.first_name[0].toUpperCase() : "C"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : "Citizen Monitor"}
                </div>
                <div className="text-[10px] text-cyan-200/70 truncate flex items-center gap-1">
                  <ShieldCheck size={10} className="text-emerald-400" />
                  <span>Civic Observer</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return <div className="h-full flex flex-col">{navContent}</div>;
  }

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 bg-[#022C4F] text-white transition-all duration-300 flex flex-col shadow-xl hidden lg:flex ${
        isCollapsed ? "w-[80px]" : "w-[260px]"
      }`}
    >
      {navContent}
    </aside>
  );
}
