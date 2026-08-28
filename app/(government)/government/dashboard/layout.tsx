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
  HelpCircle,
  Layers,
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
      { name: "CENTRALIZED ISSUES", href: "/government/dashboard/issues", icon: FileText },
      { name: "ACTIVE PROJECTS", href: "/government/dashboard/project/schedule", icon: Home },
    ],
  },
  {
    name: "REGULATORY",
    icon: FileText,
    subItems: [
      { name: "APPROVALS", href: "/government/dashboard/regulatory/approvals", icon: FileText },
      { name: "PERMIT DECISIONS", href: "/government/dashboard/approvals/decisions", icon: FileText },
      { name: "COMPLIANCE ISSUES", href: "/government/dashboard/regulatory/issues", icon: FileText },
      { name: "ESCALATION MATRIX", href: "/government/dashboard/regulatory/escalation", icon: FileText },
      { name: "STOP-WORK ORDERS", href: "/government/dashboard/inspections/stop-work", icon: FileText },
      { name: "GOVERNMENT APIs", href: "/government/dashboard/integrations/government", icon: FileText },
    ],
  },
  {
    name: "RISK & AUDIT",
    icon: FileText,
    subItems: [
      { name: "STRUCTURAL RISK INDEX", href: "/government/dashboard/analytics/risk", icon: FileText },
      { name: "AUDIT RECORDS", href: "/government/dashboard/audit/records", icon: FileText },
      { name: "BLACKLIST", href: "/government/dashboard/stakeholders/blacklist", icon: FileText },
      { name: "EXPIRED DOCS", href: "/government/dashboard/applications/expired", icon: FileText },
    ],
  },
  {
    name: "DIGITAL EYE",
    icon: Scan,
    subItems: [
      { name: "SCAN PLANNING", href: "/government/dashboard/digital-eye/scan-planning", icon: Scan },
      { name: "PROCESSING PIPELINE", href: "/government/dashboard/digital-eye/processing-pipeline", icon: Scan },
      { name: "3DGS & LIDAR VIEWER", href: "/government/dashboard/tersus/viewer", icon: Scan },
      { name: "QC DASHBOARD", href: "/government/dashboard/tersus/qc-dashboard", icon: Scan },
    ],
  },
  {
    name: "BIM",
    icon: Layers,
    subItems: [
      { name: "CLASH DETECTION", href: "/government/dashboard/bim/clashes", icon: Layers },
      { name: "PROGRESS VALIDATION", href: "/government/dashboard/bim/progress-validation", icon: Layers },
      { name: "DEVIATION ANALYSIS", href: "/government/dashboard/tersus/bim-comparison", icon: Layers },
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
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#DFDFDF] flex text-[#0F181F] p-0 sm:p-2 lg:p-4">
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
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#022C4F] text-white shadow-2xl z-[70] flex flex-col lg:hidden"
            >
              <div className="h-20 sm:h-24 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={150}
                  height={44}
                  className="h-8 sm:h-9 w-auto object-contain brightness-0 invert"
                />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
                  aria-label="Close Navigation Menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1.5 scrollbar-hide">
                <p className="px-3 text-[11px] font-extrabold text-white/50 uppercase tracking-widest mb-1">
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
                          className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 min-h-[44px] ${isActive
                            ? "bg-white/15 text-white font-bold shadow-sm"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                            }`}
                        >
                          <Icon size={18} className={`shrink-0 ${isActive ? "text-white scale-105" : "text-white/70"}`} strokeWidth={isActive ? 2.5 : 2} />
                          <span className="tracking-wide text-xs sm:text-sm">{link.name}</span>
                        </Link>
                      ) : (
                        <div
                          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-white/80 font-bold text-xs uppercase tracking-wider"
                        >
                          <Icon size={18} className="shrink-0 text-white/60" strokeWidth={2} />
                          <span>{link.name}</span>
                        </div>
                      )}
                      
                      {isParent && (
                        <div className="flex flex-col ml-6 pl-2 border-l border-white/10 mt-1 gap-1">
                          {link.subItems?.map((sub) => {
                            if (!sub.href) return null;
                            const SubIcon = sub.icon;
                            const isSubItemActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all min-h-[38px] text-xs ${
                                  isSubItemActive
                                    ? "bg-white/10 text-white font-bold"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <SubIcon
                                  size={15}
                                  className={`shrink-0 ${isSubItemActive ? "text-blue-400" : "text-white/50"}`}
                                  strokeWidth={isSubItemActive ? 2.5 : 1.5}
                                />
                                <span className="tracking-wide">{sub.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/10 shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-white text-[#022C4F] font-black flex items-center justify-center text-sm shadow-inner">
                    PR
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs truncate">Public Regulator</span>
                    <span className="text-[10px] text-white/60 truncate">Directorate</span>
                  </div>
                </div>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Logged out successfully', type: 'success' } })); }} className="shrink-0 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all" title="Log Out">
                  <LogOut size={20} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col min-w-0 bg-[#FAFAFA] lg:rounded-[30px] shadow-sm transition-all duration-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-32px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isSidebarCollapsed ? "lg:ml-[116px]" : "lg:ml-[316px]"
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <Link href="/government/dashboard/command-center" className="flex items-center">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={120}
              height={32}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => window.dispatchEvent(new Event('open-notifications'))}
              className="relative w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0"
              aria-label="Open Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-[#022C4F] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <main className="flex-1 p-3.5 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto min-w-0">
          {children}
        </main>
      </div>

      <Toast />

      {/* Floating Contextual Help Button */}
      <button 
        onClick={() => setIsHelpModalOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#022C4F] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 group"
      >
        <HelpCircle size={24} />
        <span className="absolute right-14 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Contextual Help</span>
      </button>

      {/* Help Modal */}
      <AnimatePresence>
        {isHelpModalOpen && (
          <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-4 bg-[#022C4F] text-white flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><HelpCircle size={18} /> Contextual Help</h3>
                <button onClick={() => setIsHelpModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <p className="text-sm text-gray-600">You are currently viewing the <strong className="text-[#022C4F]">Government Command Center</strong>.</p>
                
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Key Features</h4>
                <ul className="text-sm text-gray-700 space-y-3">
                  <li className="flex gap-2">
                    <span className="text-blue-500 font-bold">•</span> 
                    <span><strong>Role-Based Views:</strong> Toggle between Agency Head, Director, or Inspector to filter irrelevant data.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500 font-bold">•</span> 
                    <span><strong>Critical Alerts:</strong> Color-coded alerts help you prioritize urgent structural or compliance issues.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500 font-bold">•</span> 
                    <span><strong>Offline Mode:</strong> Field inspectors can continue using the dashboard without internet connectivity. Data syncs automatically.</span>
                  </li>
                </ul>
                <button onClick={() => setIsHelpModalOpen(false)} className="w-full mt-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Close Help</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
