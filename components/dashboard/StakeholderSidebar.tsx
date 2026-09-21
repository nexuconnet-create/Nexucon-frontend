"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Building2,
  Calendar,
  CreditCard,
  FileSearch,
  Users,
  Briefcase,
  AlertOctagon,
  MessageSquare,
  ChevronLeft,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Settings,
  Bell,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

interface StakeholderSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

type SidebarItem = {
  sectionHeader?: string;
  name: string;
  icon: LucideIcon;
  href?: string;
  badge?: string;
  subItems?: {
    name: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
  }[];
};

const stakeholderLinks: SidebarItem[] = [
  {
    name: "Dashboard",
    icon: Home,
    subItems: [
      { name: "Stakeholder Command Center", href: "/stakeholder", icon: Home },
      { name: "Client Control Center", href: "/stakeholder#client-control", icon: Activity },
    ],
  },
  {
    sectionHeader: "Client Control Pillars",
    name: "Building Inspection",
    icon: FileSearch,
    badge: "Live",
    subItems: [
      { name: "Stage Inspections", href: "/stakeholder/inspections", icon: FileSearch },
      { name: "Inspector Dispatch & ETA", href: "/stakeholder/inspections/dispatch", icon: Activity },
      { name: "NCR Remediation Proof", href: "/stakeholder/inspections/ncrs", icon: ShieldCheck },
    ],
  },
  {
    name: "Project Timeline",
    icon: Calendar,
    subItems: [
      { name: "Critical Path & Gantt", href: "/stakeholder/timeline", icon: Calendar },
      { name: "Stage-Gate Hold Points", href: "/stakeholder/timeline#gates", icon: Layers },
    ],
  },
  {
    name: "Financial Activities",
    icon: CreditCard,
    badge: "Invoicing",
    subItems: [
      { name: "Levies & Invoices", href: "/stakeholder/financials", icon: CreditCard },
      { name: "Contractor Escrow", href: "/stakeholder/financials#escrow", icon: ShieldCheck },
    ],
  },
  {
    sectionHeader: "Directories & Registries",
    name: "Stakeholder Rosters",
    icon: Users,
    subItems: [
      { name: "Developers Directory", href: "/stakeholder/developers", icon: Building2 },
      { name: "Contractors Roster", href: "/stakeholder/contractors", icon: Users },
      { name: "Licensed Professionals", href: "/stakeholder/professionals", icon: Briefcase },
      { name: "Advisory Consultants", href: "/stakeholder/consultants", icon: Users },
      { name: "Field Inspectors", href: "/stakeholder/inspectors", icon: FileSearch },
      { name: "Project Team Matrix", href: "/stakeholder/teams", icon: Users },
      { name: "Blacklist & Sanctions", href: "/stakeholder/blacklist", icon: AlertOctagon },
    ],
  },
  {
    sectionHeader: "Communications",
    name: "Collaboration",
    icon: MessageSquare,
    subItems: [
      { name: "Council Meetings & Calls", href: "/stakeholder/meetings", icon: Calendar },
      { name: "Messages & Channels", href: "/stakeholder/messages", icon: MessageSquare },
    ],
  },
  {
    sectionHeader: "Account & Settings",
    name: "Corporate Profile",
    icon: User,
    href: "/stakeholder/profile",
    subItems: [
      { name: "Statutory Enterprise Profile", href: "/stakeholder/profile", icon: User },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    subItems: [
      { name: "Operational Preferences", href: "/stakeholder/settings", icon: Settings },
      { name: "Notification Preferences", href: "/stakeholder/settings/notifications", icon: Bell },
      { name: "Security & Access", href: "/stakeholder/settings/security", icon: ShieldCheck },
    ],
  },
];

export default function StakeholderSidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobile = false,
  onCloseMobile,
}: StakeholderSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [openSections, setOpenSections] = useState<string[]>([
    "Dashboard",
    "Building Inspection",
    "Project Timeline",
    "Financial Activities",
    "Stakeholder Rosters",
  ]);

  useEffect(() => {
    const activeSection = stakeholderLinks.find(
      (link) =>
        (link.href && (pathname === link.href || pathname.startsWith(`${link.href}/`))) ||
        link.subItems?.some((sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`))
    );
    if (activeSection && !openSections.includes(activeSection.name)) {
      setOpenSections((prev) => [...prev, activeSection.name]);
    }
  }, [pathname]);

  const toggleSection = (name: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const navContent = (
    <>
      {/* Top Area - Logo and Toggle / Close */}
      <div
        className={`flex items-center shrink-0 ${
          isMobile
            ? "justify-between px-6 pt-6 pb-4"
            : isCollapsed
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
          <Image
            src={
              !isMobile && isCollapsed
                ? "https://res.cloudinary.com/depeqzb6z/image/upload/v1774500774/gaskia_logo-04_112538_1_1_ye9l2c.png"
                : "https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            }
            alt="Nexucon Logo"
            width={!isMobile && isCollapsed ? 48 : 150}
            height={48}
            priority
            className={`transition-all duration-300 brightness-0 invert ${
              !isMobile && isCollapsed ? "h-12 w-12 object-contain" : "h-9 w-auto object-contain"
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

      {(!isCollapsed || isMobile) && <div className="w-full h-px bg-white/20 mb-4 shrink-0"></div>}

      {/* Navigation Links */}
      <div
        className={`flex-1 overflow-y-auto pb-6 flex flex-col gap-1 scrollbar-hide hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isMobile ? "px-4" : isCollapsed ? "px-0 items-center" : "px-6"
        }`}
      >
        {stakeholderLinks.map((link) => {
          const isParent = !!(link.subItems && link.subItems.length > 0);
          const targetHref = link.href || (isParent ? link.subItems![0].href : "#");

          const isActive = link.href ? pathname === link.href || pathname.startsWith(`${link.href}/`) : false;
          const isSubActive = link.subItems?.some(
            (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
          );

          const isItemActive = isActive || isSubActive;
          const Icon = link.icon;
          const isOpen = openSections.includes(link.name);

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

              {/* Main Item */}
              <Link
                href={isParent && isMobile ? "#" : targetHref}
                onClick={(e) => {
                  if (isParent && isMobile) {
                    toggleSection(link.name, e);
                    return;
                  }
                  if (!isParent && isMobile) {
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
                    size={!isMobile && isCollapsed ? 24 : 18}
                    className={`shrink-0 transition-transform duration-200 ${
                      isItemActive ? "text-white scale-105" : "text-white/70 group-hover:text-white"
                    }`}
                    strokeWidth={isItemActive ? 2.5 : 1.5}
                  />
                  {(isMobile || !isCollapsed) && (
                    <span className="tracking-wide text-xs sm:text-[13px] truncate">{link.name}</span>
                  )}
                </div>
                {isParent && (isMobile || !isCollapsed) && (
                  <button
                    onClick={(e) => toggleSection(link.name, e)}
                    className="p-1 rounded hover:bg-white/10 transition-colors ml-2 shrink-0 cursor-pointer"
                    aria-label={`Toggle ${link.name} section`}
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </Link>

              {/* Sub Items */}
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
                        className={`flex items-center gap-3 px-3.5 py-2 rounded-lg transition-all duration-200 group min-h-[38px] text-xs ${
                          isSubItemActive
                            ? "bg-white/10 text-white font-bold"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <SubIcon
                          size={15}
                          className={`shrink-0 transition-transform duration-200 ${
                            isSubItemActive ? "text-blue-400" : "text-white/50 group-hover:text-white"
                          }`}
                          strokeWidth={isSubItemActive ? 2.5 : 1.5}
                        />
                        <span className="tracking-wide truncate">{sub.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Area - User Profile & Logout */}
      <div
        className={`border-t border-white/10 flex shrink-0 ${
          isMobile
            ? "p-4 bg-black/10 items-center justify-between"
            : isCollapsed
            ? "p-6 flex-col items-center justify-center gap-8"
            : "p-6 items-center justify-between"
        }`}
      >
        <Link
          href="/stakeholder/profile"
          onClick={() => isMobile && onCloseMobile?.()}
          className="flex items-center gap-3 overflow-hidden min-w-0 hover:opacity-90 transition-opacity cursor-pointer group"
          title="View Statutory Profile"
        >
          <div
            className={`shrink-0 rounded-full bg-white text-[#022C4F] font-extrabold flex items-center justify-center shadow-inner uppercase ${
              isMobile ? "w-10 h-10 text-sm" : "w-12 h-12 text-base"
            }`}
          >
            {user?.first_name?.[0] || "S"}
            {user?.last_name?.[0] || "T"}
          </div>
          {(isMobile || !isCollapsed) && (
            <div className="flex flex-col whitespace-nowrap min-w-0">
              <span className="font-bold text-xs sm:text-sm truncate max-w-[140px] group-hover:text-cyan-200 transition-colors">
                {user ? `${user.first_name} ${user.last_name || ""}` : "Stakeholder Enterprise"}
              </span>
              <span className="text-[10px] sm:text-xs text-white/60 truncate max-w-[140px]">
                {user?.role_name || "Client / Developer"}
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (isMobile) onCloseMobile?.();
            logout("/stakeholder/login");
          }}
          className="shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
          title="Log Out"
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
