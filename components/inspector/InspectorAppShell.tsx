"use client";

import React, { useState } from "react";
import InspectorHeader from "./InspectorHeader";
import InspectorSidebar from "./InspectorSidebar";
import InspectorMobileNav from "./InspectorMobileNav";
import { AnimatePresence, motion } from "framer-motion";

interface InspectorAppShellProps {
  children: React.ReactNode;
}

export default function InspectorAppShell({ children }: InspectorAppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#DFDFDF] flex text-[#0F181F] p-0 sm:p-2 lg:p-4 font-sans">
      {/* Desktop Sidebar */}
      <InspectorSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Mobile Drawer */}
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
              <InspectorSidebar
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
          isSidebarCollapsed ? "lg:ml-[116px]" : "lg:ml-[316px]"
        }`}
      >
        {/* Light Header */}
        <InspectorHeader onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto min-w-0 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Touch Bottom Navigation */}
      <InspectorMobileNav />
    </div>
  );
}
