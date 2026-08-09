"use client";

import React, { useState } from "react";
import GovernmentSidebar from "@/components/dashboard/GovernmentSidebar";
import Toast from "@/components/Toast";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Scan,
  Settings,
  LogOut,
  X,
  Menu,
  Search,
  Bell,
  type LucideIcon,
} from "lucide-react";

type SidebarItem = {
  name: string;
  icon: LucideIcon;
  href?: string;
  subItems?: SidebarItem[];
};

const sidebarLinks: SidebarItem[] = [
  {
    name: "DASHBOARD",
    icon: Home,
    subItems: [
      { name: "LIVE SITE VIEW", href: "/government/dashboard/live-site-view", icon: Home },
      { name: "COMPLIANCE DASHBOARD", href: "/government/dashboard/project/overview", icon: Home },
      { name: "INSPECTION REPORTS", href: "/government/dashboard/documents/reports", icon: Home },
      { name: "ACTIVE PROJECTS", href: "/government/dashboard/project/schedule", icon: Home },
    ],
  },
  {
    name: "REGULATORY",
    icon: FileText,
    subItems: [
      { name: "APPROVALS", href: "/government/dashboard/regulatory/approvals", icon: FileText },
      { name: "COMPLIANCE ISSUES", href: "/government/dashboard/regulatory/issues", icon: FileText },
      { name: "COMPLIANCE ANALYTICS", href: "/government/dashboard/regulatory/analytics", icon: FileText },
    ],
  },
  {
    name: "T-S1 SCANNER",
    icon: Scan,
    subItems: [
      { name: "SCAN INGESTION LOGS", href: "/government/dashboard/tersus/ingestion-logs", icon: Scan },
      { name: "3DGS & LIDAR VIEWER", href: "/government/dashboard/tersus/viewer", icon: Scan },
      { name: "BIM DEVIATION ANALYSIS", href: "/government/dashboard/tersus/bim-comparison", icon: Scan },
      { name: "QC DASHBOARD", href: "/government/dashboard/tersus/qc-dashboard", icon: Scan },
    ],
  },
  {
    name: "DOCUMENTS",
    icon: FileText,
    subItems: [
      { name: "APPROVED PLANS", href: "/government/dashboard/documents/drawings", icon: FileText },
      { name: "INSPECTION REPORTS", href: "/government/dashboard/documents/reports", icon: FileText },
      { name: "REGULATORY ARCHIVE", href: "/government/dashboard/documents/all", icon: FileText },
    ],
  },
  {
    name: "SETTINGS",
    icon: Settings,
    subItems: [
      { name: "AGENCY PROFILE", href: "/government/dashboard/settings/profile", icon: Settings },
      { name: "NOTIFICATION PREFERENCES", href: "/government/dashboard/settings/notifications", icon: Settings },
      { name: "SECURITY", href: "/government/dashboard/settings/security", icon: Settings },
    ],
  },
];

export default function GovernmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#DFDFDF] flex text-[#0F181F] p-4">
      {/* Desktop Sidebar */}
      <GovernmentSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-[#022C4F] text-white shadow-2xl z-[70] flex flex-col lg:hidden"
            >
              <div className="h-28 flex items-center justify-between px-6 border-b border-white/10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={160}
                  height={48}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-white text-[#022C4F] hover:scale-110 transition-transform shrink-0 shadow-lg"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 scrollbar-hide">
                <p className="px-4 text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                  Menu
                </p>
                {sidebarLinks.map((link) => {
                  const isActive = link.href ? (pathname === link.href || pathname.startsWith(`${link.href}/`)) : false;
                  const Icon = link.icon;
                  const isParent = !!link.subItems;

                  return (
                    <div key={link.name} className="flex flex-col">
                      {link.href ? (
                        <Link
                          href={link.href}
                          onClick={(e) => {
                            if (link.name === "Notifications") {
                              e.preventDefault();
                              window.dispatchEvent(new Event('open-notifications'));
                            }
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                            ? "bg-white/10 text-white font-semibold"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                            }`}
                        >
                          <Icon size={20} className={`shrink-0 transition-transform duration-300 ${isActive ? "text-white scale-110" : "text-white/70 group-hover:text-white"}`} strokeWidth={isActive ? 2.5 : 2} />
                          <span className="tracking-wide text-sm whitespace-nowrap">{link.name}</span>
                        </Link>
                      ) : (
                        <div
                          className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group text-white/70"
                        >
                          <Icon size={20} className="shrink-0 transition-transform duration-300 text-white/70" strokeWidth={1.5} />
                          <span className="tracking-wide text-sm whitespace-nowrap">{link.name}</span>
                        </div>
                      )}
                      
                      {isParent && (
                        <div className="flex flex-col ml-8 mt-1 gap-1">
                          {link.subItems?.map((sub) => {
                            if (!sub.href) return null;
                            const SubIcon = sub.icon;
                            const isSubItemActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                                  isSubItemActive
                                    ? "text-white font-semibold"
                                    : "text-white/60 hover:text-white"
                                }`}
                              >
                                <SubIcon
                                  size={16}
                                  className={`shrink-0 transition-transform duration-300 ${isSubItemActive ? "text-white" : "text-white/60 group-hover:text-white"}`}
                                  strokeWidth={isSubItemActive ? 2.5 : 1.5}
                                />
                                <span className="tracking-wide text-xs">{sub.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-white text-[#022C4F] font-extrabold flex items-center justify-center text-lg shadow-inner">
                    PR
                  </div>
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="font-bold text-sm">Jane Doe</span>
                    <span className="text-[10px] text-white/60 uppercase tracking-wider">Government Agency</span>
                  </div>
                </div>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Logged out successfully', type: 'success' } })); }} className="shrink-0 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all" title="Log Out">
                  <LogOut size={22} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col min-w-0 bg-[#FAFAFA] lg:rounded-[30px] shadow-sm transition-all duration-300 h-screen lg:h-[calc(100vh-32px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isSidebarCollapsed ? "lg:ml-[116px]" : "lg:ml-[316px]"
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={140}
            height={40}
            className="h-7 w-auto object-contain"
          />
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center">
              <input 
                type="text" 
                placeholder="Search..."
                className="w-48 h-8 pl-8 pr-3 rounded-full border border-[#022C4F] text-[11px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm transition-all bg-white"
              />
              <div className="absolute left-2.5 text-gray-400">
                <Search size={12} />
              </div>
            </div>
            <button 
              onClick={() => window.dispatchEvent(new Event('open-notifications'))}
              className="relative w-8 h-8 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0"
            >
              <Bell size={14} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#022C4F] rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              PR
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-[#022C4F] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      <Toast />
    </div>
  );
}
