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
    name: "Command & Control",
    icon: Home,
    subItems: [
      { name: "Stakeholder Hub", href: "/stakeholder", icon: Home },
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
      { name: "Inspector Dispatch & ETA", href: "/stakeholder/inspections#dispatch", icon: Activity },
      { name: "NCR Remediation Proof", href: "/stakeholder/inspections#ncrs", icon: ShieldCheck },
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
    "Command & Control",
    "Building Inspection",
    "Project Timeline",
    "Financial Activities",
    "Stakeholder Rosters",
  ]);

  useEffect(() => {
    const activeSection = stakeholderLinks.find(link =>
      (link.href && (pathname === link.href || pathname.startsWith(`${link.href}/`))) ||
      link.subItems?.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`))
    );
    if (activeSection && !openSections.includes(activeSection.name)) {
      setOpenSections(prev => [...prev, activeSection.name]);
    }
  }, [pathname]);

  const toggleSection = (name: string) => {
    setOpenSections(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between bg-[#022C4F] text-white">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/stakeholder" className="flex items-center gap-3">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={140}
            height={36}
            className="h-8 w-auto object-contain brightness-0 invert"
          />
        </Link>
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={18} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* Subdomain Tag */}
      <div className="px-5 py-2.5 bg-blue-950/40 border-b border-white/5 flex items-center justify-between text-[11px]">
        <span className="text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={12} className="text-blue-400" />
          Stakeholder Portal
        </span>
        <span className="text-white/50 text-[10px] font-mono">stakeholder.nexucon.net</span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {stakeholderLinks.map((item, idx) => {
          const isOpen = openSections.includes(item.name);
          const hasActiveSub = item.subItems?.some(
            sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
          );

          return (
            <div key={idx} className="mb-2">
              {item.sectionHeader && !isCollapsed && (
                <div className="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-white/40">
                  {item.sectionHeader}
                </div>
              )}

              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      hasActiveSub
                        ? "bg-blue-600/30 text-white"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className={hasActiveSub ? "text-blue-400" : "text-white/60"} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500 text-white font-bold">
                            {item.badge}
                          </span>
                        )}
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    )}
                  </button>

                  {/* Sub-items */}
                  {isOpen && !isCollapsed && (
                    <div className="ml-5 pl-2 border-l border-white/10 mt-1 space-y-1">
                      {item.subItems.map((sub, sIdx) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sIdx}
                            href={sub.href}
                            onClick={() => isMobile && onCloseMobile && onCloseMobile()}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isSubActive
                                ? "bg-blue-600 text-white font-bold shadow-sm"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                            {sub.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500 text-white font-bold">
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href || "#"}
                  onClick={() => isMobile && onCloseMobile && onCloseMobile()}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    pathname === item.href
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={16} className="text-white/60" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
              {user?.first_name ? user.first_name[0] : "S"}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : "Stakeholder"}
                </div>
                <div className="text-[10px] text-white/60 truncate">
                  {user?.role_name || "Client / Stakeholder"}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => logout && logout("/stakeholder/login")}
            className="p-1.5 text-white/60 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return <div className="h-full w-full">{navContent}</div>;
  }

  return (
    <aside
      className={`hidden lg:flex fixed top-0 bottom-0 left-0 z-40 my-2 ml-2 rounded-[24px] overflow-hidden shadow-2xl transition-all duration-300 ${
        isCollapsed ? "w-[90px]" : "w-[290px]"
      }`}
    >
      {navContent}
    </aside>
  );
}
