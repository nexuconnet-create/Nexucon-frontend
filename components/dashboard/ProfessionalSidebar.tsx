"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Folder,
  Compass,
  FileSearch,
  History,
  FileText,
  Network,
  ListTodo,
  Users,
  Settings,
  FolderCog,
  UserCog,
  MessageSquare,
  ShieldCheck,
  Bell,
  PenTool,
  Tag,
  RefreshCcw,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProfessionalSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const sidebarLinks = [
  {
    name: "Data",
    icon: Folder,
    subItems: [
      { name: "Project Explorer", href: "/professional/dashboard/explorer", icon: Compass },
      { name: "Saved Views", href: "/professional/dashboard/views", icon: FileSearch },
      { name: "Deliverables", href: "/professional/dashboard/deliverables", icon: History },
    ]
  },
  { name: "Activity", href: "/professional/dashboard/activity", icon: FileText },
  { name: "Review Topics", href: "/professional/dashboard/reviews", icon: FileSearch },
  { name: "Shared Design Workspace", href: "/professional/dashboard/workspace", icon: Network },
  { name: "Tasks", href: "/professional/dashboard/tasks", icon: ListTodo },
  { name: "Team", href: "/professional/dashboard/team", icon: Users },
  {
    name: "Project Settings",
    icon: Settings,
    subItems: [
      { name: "Project Settings", href: "/professional/dashboard/settings", icon: FolderCog },
      { name: "Permission Overview", href: "/professional/dashboard/permissions", icon: UserCog },
      { name: "Review Management", href: "/professional/dashboard/review-management", icon: MessageSquare },
    ]
  },
  { name: "Integrations", href: "/professional/dashboard/integrations", icon: ShieldCheck },
  { name: "Notifications", href: "/professional/dashboard/notifications", icon: Bell },
  { name: "Units & Standards", href: "/professional/dashboard/units", icon: PenTool },
  { name: "Tags & Classification", href: "/professional/dashboard/tags", icon: Tag },
  { name: "Synchronization", href: "/professional/dashboard/sync", icon: RefreshCcw },
];

export default function ProfessionalSidebar({ isCollapsed, onToggleCollapse }: ProfessionalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={`fixed top-4 bottom-4 left-4 z-40 bg-[#022C4F] rounded-[30px] text-white flex flex-col hidden lg:flex transition-all duration-300 ${isCollapsed ? "w-[100px]" : "w-[300px]"
        }`}
    >
      {/* Top Area - Logo and Collapse Toggle */}
      <div className={`flex items-center ${isCollapsed ? "justify-center pt-8 pb-12" : "justify-between px-8 pt-8 pb-12"}`}>
        <div
          className={`flex items-center overflow-hidden transition-all duration-300 ${isCollapsed ? "w-12 h-12 cursor-pointer" : "w-auto"}`}
          onClick={isCollapsed ? onToggleCollapse : undefined}
          title={isCollapsed ? "Expand Sidebar" : undefined}
        >
          <Image
            src={isCollapsed
              ? "https://res.cloudinary.com/depeqzb6z/image/upload/v1774500774/gaskia_logo-04_112538_1_1_ye9l2c.png"
              : "https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"}
            alt="Nexucon Logo"
            width={isCollapsed ? 48 : 160}
            height={48}
            priority
            className={`transition-all duration-300 brightness-0 invert ${isCollapsed ? "h-12 w-12 object-contain" : "h-12 w-auto object-contain"}`}
          />
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-full bg-white text-[#022C4F] hover:scale-110 transition-transform shrink-0 shadow-lg"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
        )}
      </div>

      {!isCollapsed && <div className="w-full h-px bg-white/20 mb-6"></div>}

      {/* Navigation Links */}
      <div className={`flex-1 overflow-y-auto pb-8 flex flex-col gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? "px-0 items-center" : "px-6"}`}>
        {sidebarLinks.map((link, idx) => {
          const isActive = link.href ? (pathname === link.href || pathname.startsWith(`${link.href}/`)) : false;
          const Icon = link.icon;
          const isParent = !!link.subItems;

          // Check if any sub-item is active
          const isSubActive = link.subItems?.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`));

          return (
            <div key={link.name} className="flex flex-col mb-1 w-full">
              {/* Main Item */}
              {link.href ? (
                <Link
                  href={link.href}
                  onClick={(e) => {
                    if (link.name === "Notifications") {
                      e.preventDefault();
                      window.dispatchEvent(new Event('open-notifications'));
                    }
                  }}
                  className={`flex items-center rounded-xl transition-all duration-300 group ${isCollapsed ? "justify-center p-3 w-12 h-12 mx-auto" : "gap-4 px-4 py-3 w-full"
                    } ${isActive
                      ? "text-white font-semibold"
                      : "text-white/70 hover:text-white"
                    }`}
                  title={isCollapsed ? link.name : undefined}
                >
                  <Icon
                    size={isCollapsed ? 24 : 18}
                    className={`shrink-0 transition-transform duration-300 ${isActive ? "text-white" : "text-white/70 group-hover:text-white"}`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  {!isCollapsed && (
                    <span className="tracking-wide text-[13px]">{link.name}</span>
                  )}
                </Link>
              ) : (
                <div
                  className={`flex items-center rounded-xl transition-all duration-300 group cursor-default ${isCollapsed ? "justify-center p-3 w-12 h-12 mx-auto" : "gap-4 px-4 py-3 w-full"
                    } ${isSubActive
                      ? "text-white font-semibold"
                      : "text-white/70 hover:text-white"
                    }`}
                  title={isCollapsed ? link.name : undefined}
                >
                  <Icon
                    size={isCollapsed ? 24 : 18}
                    className={`shrink-0 transition-transform duration-300 ${isSubActive ? "text-white" : "text-white/70 group-hover:text-white"}`}
                    strokeWidth={isSubActive ? 2 : 1.5}
                  />
                  {!isCollapsed && (
                    <span className="tracking-wide text-[13px]">{link.name}</span>
                  )}
                </div>
              )}

              {/* Sub Items */}
              {isParent && !isCollapsed && (
                <div className="flex flex-col ml-8 mt-1 gap-1">
                  {link.subItems?.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubItemActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                    return (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 group ${isSubItemActive
                          ? "text-white font-semibold"
                          : "text-white/60 hover:text-white"
                          }`}
                      >
                        <SubIcon
                          size={16}
                          className={`shrink-0 transition-transform duration-300 ${isSubItemActive ? "text-white" : "text-white/60 group-hover:text-white"}`}
                          strokeWidth={isSubItemActive ? 2 : 1.5}
                        />
                        <span className="tracking-wide text-[13px]">{sub.name}</span>
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
      <div className={`p-6 border-t border-white/10 flex ${isCollapsed ? "flex-col items-center justify-center gap-8" : "items-center justify-between"}`}>
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-12 h-12 shrink-0 rounded-full bg-white text-[#022C4F] font-extrabold flex items-center justify-center text-lg shadow-inner">
            JD
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-bold text-sm">Johh Doe</span>
              <span className="text-xs text-white/60">Professional Dashboard</span>
            </div>
          )}
        </div>
        <button
          onClick={() => router.push('/professional/login')}
          className="shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          title="Log Out"
        >
          <LogOut size={22} />
        </button>
      </div>

    </aside>
  );
}
