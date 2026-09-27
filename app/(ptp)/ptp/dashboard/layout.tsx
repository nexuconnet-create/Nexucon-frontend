"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  Bell,
  HelpCircle,
  X,
  ShieldCheck,
  Compass,
  FileCheck2,
  AlertTriangle,
  Send,
  Building2,
  Globe
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PtpSidebar from "@/components/dashboard/PtpSidebar";
import Toast from "@/components/Toast";
import { LanguageProvider } from "@/components/transparency/LanguageContext";

export default function PtpDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Authentication & Onboarding Guard
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Allow fallback user if local session credentials exist
        const hasLocalUser = typeof window !== "undefined" && localStorage.getItem("nexucon_auth_user");
        if (!hasLocalUser) {
          router.replace("/ptp/login");
          return;
        }
      }

      // Check onboarding
      if (user?.email) {
        const cleanEmail = user.email.toLowerCase();
        const localOnboarded = typeof window !== "undefined"
          ? localStorage.getItem(`nexucon_onboarding_completed_${cleanEmail}`)
          : null;

        if (!user.is_onboarded && !localOnboarded) {
          router.replace("/ptp/onboarding");
        }
      }
    }
  }, [user, isLoading, router]);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#DFDFDF] flex text-[#0F181F] p-0 sm:p-2 lg:p-4 font-sans">
        {/* Desktop Sidebar */}
        <PtpSidebar
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
                <PtpSidebar
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
            isSidebarCollapsed ? "lg:ml-[96px]" : "lg:ml-[276px]"
          }`}
        >
          {/* Mobile Top Header */}
          <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
            <Link href="/ptp/dashboard" className="flex items-center gap-2">
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                alt="Nexucon Logo"
                width={110}
                height={30}
                className="h-6 w-auto object-contain"
              />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 uppercase">
                PTP
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/ptp/dashboard/report"
                className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Send size={12} />
                <span>Tip-off</span>
              </Link>

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
          aria-label="Civic Monitor Help & Hotlines"
        >
          <HelpCircle size={22} />
          <span className="absolute right-14 bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Civic Guide &amp; Hotlines
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
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
              >
                <div className="p-5 bg-[#022C4F] text-white flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <HelpCircle size={18} className="text-cyan-400" />
                    <span>Public Transparency Portal Guide</span>
                  </h3>
                  <button
                    onClick={() => setIsHelpModalOpen(false)}
                    className="hover:bg-white/20 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Welcome to the <strong>Public Transparency Portal (PTP)</strong>. As an accredited civic monitor or resident, you can inspect verified building records and report safety hazards directly to state authorities.
                  </p>

                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                    Core Dashboard Capabilities
                  </h4>

                  <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                    <div className="flex gap-2.5 items-start">
                      <FileCheck2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Cryptographic Verification:</strong> Input any LASPPPA permit or stage clearance hash to confirm the permit is genuine and unmodified.
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <Compass size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>GIS Safety Map:</strong> Explore zoned sites, coastal setbacks, and live Stop-Work enforcement orders.
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Whistleblower Desk:</strong> Report unpermitted extra storeys or ignored seals anonymously. Submissions get an investigation token.
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="text-xs font-bold text-blue-900">Emergency LASBCA Hotline</div>
                    <div className="text-xs text-blue-700 mt-0.5 font-mono">0800-LASBCA-TIP / +234 1 222 3456</div>
                  </div>

                  <button
                    onClick={() => setIsHelpModalOpen(false)}
                    className="w-full mt-2 py-2.5 bg-gray-100 text-[#022C4F] rounded-xl font-bold hover:bg-gray-200 transition-colors text-xs cursor-pointer"
                  >
                    Close Guide
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </LanguageProvider>
  );
}
