"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Folder,
  Network,
  PenTool,
  Award,
  FileText,
  Users,
  Calendar,
  Handshake,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck
} from "lucide-react";

interface ClientSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const sidebarLinks = [
  { name: "Home", href: "/client/dashboard", icon: Home },
  { name: "My Projects", href: "/client/projects", icon: Folder },
  { name: "Design Workspace", href: "/client/design-workspace", icon: Network },
  { name: "Drawings & Plans", href: "/client/drawings", icon: PenTool },
  { name: "Peer Reviews", href: "/client/peer-reviews", icon: Award },
  { name: "Documents", href: "/client/documents", icon: FileText },
  { name: "Reports", href: "/client/reports", icon: ClipboardCheck },
  { name: "Team & Collaborators", href: "/client/team", icon: Users },
  { name: "Review Calendar", href: "/client/calendar", icon: Calendar },
  { name: "Live Collaboration", href: "/client/review-session", icon: Handshake },
  { name: "Construction Handoff", href: "/client/construction-handoff", icon: ClipboardCheck },
];

export default function ClientSidebar({ isCollapsed, onToggleCollapse }: ClientSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={`fixed top-4 bottom-4 left-4 z-40 bg-[#022C4F] text-white flex flex-col hidden lg:flex rounded-[30px] shadow-2xl transition-all duration-300 ${isCollapsed ? "w-24" : "w-[280px]"
        }`}
    >
      {/* Top Area - Logo and Collapse Toggle */}
      <div className={`flex items-center ${isCollapsed ? "justify-center h-28 border-b border-white/10" : "justify-between px-6 h-28 border-b border-white/10"}`}>
        <div
          className={`flex items-center overflow-hidden transition-all duration-300 ${isCollapsed ? "w-8 h-8 cursor-pointer" : "w-auto"}`}
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
            className={`transition-all duration-300 brightness-0 invert ${isCollapsed ? "h-10 w-10 object-contain" : "h-10 w-auto object-contain"}`}
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

      {/* Navigation Links */}
      <div className={`flex-1 overflow-y-auto py-8 flex flex-col gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? "px-2 items-center" : "px-4"}`}>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center rounded-xl transition-all duration-300 group ${isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3.5"
                } ${isActive
                  ? "bg-white/10 text-white font-semibold"
                  : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              title={isCollapsed ? link.name : undefined}
            >
              <Icon
                size={20}
                className={`shrink-0 transition-transform duration-300 ${isActive ? "text-white scale-110" : "text-white/70 group-hover:text-white"}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!isCollapsed && (
                <span className="tracking-wide text-sm whitespace-nowrap">{link.name}</span>
              )}
            </Link>
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
              <span className="text-xs text-white/60">Client Dashboard</span>
            </div>
          )}
        </div>
        <button
          onClick={() => router.push('/client/login')}
          className="shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          title="Log Out"
        >
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
}
