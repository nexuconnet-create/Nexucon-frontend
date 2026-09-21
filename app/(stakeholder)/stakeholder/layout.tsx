"use client";

import React, { useState } from "react";
import StakeholderSidebar from "@/components/dashboard/StakeholderSidebar";
import Toast from "@/components/Toast";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, Bell, HelpCircle, X, ShieldCheck, Calendar, CreditCard, Building2 } from "lucide-react";

export default function StakeholderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#DFDFDF] flex text-[#0F181F] p-0 sm:p-2 lg:p-4">
      {/* Desktop Sidebar */}
      <StakeholderSidebar 
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
              className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[60] lg:hidden"
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#022C4F] text-white shadow-2xl z-[70] flex flex-col lg:hidden overflow-hidden"
            >
              <StakeholderSidebar 
                isMobile={true} 
                onCloseMobile={() => setIsMobileMenuOpen(false)} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 bg-[#FAFAFA] lg:rounded-[30px] shadow-sm transition-all duration-300 min-h-screen lg:min-h-0 lg:h-[calc(100vh-32px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isSidebarCollapsed ? "lg:ml-[106px]" : "lg:ml-[306px]"
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <Link href="/stakeholder" className="flex items-center">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={120}
              height={32}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.dispatchEvent(new Event('open-notifications'))}
              className="relative w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors"
              aria-label="Open Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-[#022C4F] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto min-w-0">
          {children}
        </main>
      </div>

      <Toast />

      {/* Floating Contextual Help Button */}
      <button 
        onClick={() => setIsHelpModalOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#022C4F] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 group cursor-pointer"
        aria-label="Stakeholder Portal Help"
      >
        <HelpCircle size={22} />
        <span className="absolute right-14 bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Stakeholder Help
        </span>
      </button>

      {/* Contextual Help Modal */}
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
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <HelpCircle size={18} /> Stakeholder Portal Guide
                </h3>
                <button onClick={() => setIsHelpModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <p className="text-xs sm:text-sm text-gray-600">
                  Welcome to <strong className="text-[#022C4F]">stakeholder.nexucon.net</strong>. This workspace allows Clients, Developers, Contractors, and Licensed Professionals to coordinate regulatory activities.
                </p>
                
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Core Capabilities</h4>
                <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                  <div className="flex gap-2.5 items-start">
                    <Building2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Building Inspection Desk:</strong> Request stage inspections (Foundation, Superstructure, MEP), monitor inspector ETA, and upload contractor NCR remediation proof.
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <Calendar size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Project Timeline & Stage-Gates:</strong> View Critical Path Gantt charts with mandatory government approval hold-points.
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <CreditCard size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Financial Activities:</strong> Settle building plan levies, view downloadable tax invoices (`INV-2026-XXXX`), and release contractor escrow upon inspection passes.
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHelpModalOpen(false)} 
                  className="w-full mt-3 py-2.5 bg-gray-100 text-[#022C4F] rounded-xl font-bold hover:bg-gray-200 transition-colors text-xs cursor-pointer"
                >
                  Close Help
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
