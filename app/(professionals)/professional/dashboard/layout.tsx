"use client";

import React, { useState } from "react";
import ProfessionalSidebar from "@/components/dashboard/ProfessionalSidebar";
import Toast from "@/components/Toast";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  X,
  Menu,
  Search,
} from "lucide-react";

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

export default function ProfessionalLayout({
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
      <ProfessionalSidebar 
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
                    <span className="text-[10px] text-white/60 uppercase tracking-wider">Professional</span>
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
