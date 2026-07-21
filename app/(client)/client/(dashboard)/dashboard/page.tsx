"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MetricCard from "@/components/dashboard/MetricCard";
import ChartOverview from "@/components/dashboard/ChartOverview";
import UrgentNotifications from "@/components/dashboard/UrgentNotifications";
import ProjectList from "@/components/dashboard/ProjectList";
import HireProfessionals from "@/components/dashboard/HireProfessionals";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import ReviewDrawingDrawer from "@/components/dashboard/ReviewDrawingDrawer";
import FinalApprovalDrawer from "@/components/dashboard/FinalApprovalDrawer";
import ApprovalSuccessModal from "@/components/dashboard/ApprovalSuccessModal";
import { Search, Bell, FileText, MessageSquare, Plus, X, User, PenTool, Clipboard, Wallet, UploadCloud, Users, Briefcase, AlertTriangle, CheckCircle, Circle, PlayCircle } from "lucide-react";
import ProfilePill from "@/components/ui/ProfilePill";

export default function ClientDashboardPage() {
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [isFinalApprovalDrawerOpen, setIsFinalApprovalDrawerOpen] = useState(false);
  const [isApprovalSuccessModalOpen, setIsApprovalSuccessModalOpen] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Show risk modal only once per session or if a reminder is due
    const hasSeenRiskModal = sessionStorage.getItem('hasSeenRiskModal');
    const reminderTime = sessionStorage.getItem('riskModalReminderTime');
    const now = Date.now();

    if (!hasSeenRiskModal) {
      setIsRiskModalOpen(true);
    } else if (reminderTime) {
      const timeRemaining = parseInt(reminderTime, 10) - now;
      if (timeRemaining <= 0) {
        // Reminder time has passed while away
        setIsRiskModalOpen(true);
        sessionStorage.removeItem('riskModalReminderTime');
      } else {
        // Set timeout for the remaining time
        timeoutId = setTimeout(() => {
          setIsRiskModalOpen(true);
          sessionStorage.removeItem('riskModalReminderTime');
        }, timeRemaining);
      }
    }

    const handleOpen = () => setIsNotificationOpen(true);
    window.addEventListener('open-notifications', handleOpen);

    return () => {
      window.removeEventListener('open-notifications', handleOpen);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const closeRiskModal = (remindLater: boolean = false) => {
    setIsRiskModalOpen(false);
    sessionStorage.setItem('hasSeenRiskModal', 'true');

    if (remindLater) {
      // Set reminder for 10 minutes from now (10 * 60 * 1000)
      const futureTime = Date.now() + 10 * 60 * 1000;
      sessionStorage.setItem('riskModalReminderTime', futureTime.toString());

      // Also set a local timeout in case they stay on this page
      setTimeout(() => {
        setIsRiskModalOpen(true);
        sessionStorage.removeItem('riskModalReminderTime');
      }, 10 * 60 * 1000);
    } else {
      sessionStorage.removeItem('riskModalReminderTime');
    }
  };

  return (
    <div className="space-y-6 relative pb-12">

      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">

        {/* Welcome Text */}
        <div>
          <h1 className="text-3xl font-extrabold text-[#022C4F] mb-1">Welcome Back</h1>
          <h2 className="text-xl font-bold text-[#0F181F] mb-2">Good morning, John Doe <span className="inline-block animate-wave">👋</span></h2>
          <p className="text-[12px] text-gray-500 font-light max-w-lg">
            Monitor your design projects, review drawings, collaborate with consultants, and prepare projects for successful execution.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-start lg:items-end gap-4 w-full lg:w-auto mt-6 lg:mt-0">
          {/* Icons and Profile Row */}
          <div className="hidden lg:flex items-center justify-end w-auto gap-4">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Search across all projects..."
                className="w-64 h-10 pl-10 pr-4 rounded-full border border-[#022C4F] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm transition-all bg-white"
              />
              <div className="absolute left-3 text-gray-400">
                <Search size={16} />
              </div>
            </div>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="w-10 h-10 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0 relative"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#022C4F] rounded-full"></span>
            </button>

            <ProfilePill />
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full lg:w-auto gap-3 lg:gap-4 mt-4 lg:mt-12">
            <Link href="/client/new-project" className="flex items-center justify-center gap-2 px-8 py-5 rounded-full border border-gray-300 text-[#0F181F] text-xs font-bold hover:border-[#022C4F] hover:bg-[#F4F6F8] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out w-full sm:w-auto">
              <FileText size={14} className="text-[#022C4F]" />
              Start New Design Project
            </Link>
            <Link href="/client/messages" className="flex items-center justify-center gap-2 px-8 py-5 rounded-full bg-[#022C4F] text-white text-xs font-bold shadow-md hover:bg-[#033A6B] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out relative group w-full sm:w-auto">
              <MessageSquare size={14} />
              Messages
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform duration-300"></span>
            </Link>
          </div>
        </div>

      </div>

      {/* Active Risk Alerts */}
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both" style={{ animationDelay: '100ms' }}>
        <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-4">Active Project Risks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-1">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-bold text-red-900">Missing Zoning Permit</span>
                <span className="text-[10px] font-bold bg-red-200 text-red-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Critical</span>
              </div>
              <p className="text-[11px] text-red-700 mb-2 font-medium">Victoria Heights Residential Estate</p>
              <p className="text-[12px] text-red-800 leading-relaxed bg-white/50 p-2 rounded-lg border border-red-100 font-medium">
                <span className="font-bold">Mitigation:</span> Consultant following up with city council. Expedited request filed.
              </p>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-1">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-bold text-orange-900">Delayed Soil Test Results</span>
                <span className="text-[10px] font-bold bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full uppercase tracking-wider">High</span>
              </div>
              <p className="text-[11px] text-orange-700 mb-2 font-medium">Lekki Commercial Plaza</p>
              <p className="text-[12px] text-orange-800 leading-relaxed bg-white/50 p-2 rounded-lg border border-orange-100 font-medium">
                <span className="font-bold">Mitigation:</span> Expedited with external lab. Results expected by Friday.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Module */}
      <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 ease-out fill-mode-both">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-[20px] font-extrabold text-[#022C4F] mb-1">Getting Started with Nexucon</h3>
            <p className="text-[13px] text-gray-500 font-medium">Complete these steps to set up your workspace and kick off your first project.</p>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#0F181F]">1 of 3 Completed</span>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-[#4CAF50] rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="border-2 border-[#8BC34A] bg-[#8BC34A]/5 rounded-[20px] p-5 flex gap-4 transition-colors">
            <div className="mt-0.5">
              <CheckCircle size={20} className="text-[#8BC34A]" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#0F181F] mb-1">Complete your profile</h4>
              <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">Add your company details, billing info, and preferences.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-gray-200 hover:border-[#022C4F] rounded-[20px] p-5 flex gap-4 cursor-pointer group transition-colors shadow-sm">
            <div className="mt-0.5">
              <Circle size={20} className="text-gray-300 group-hover:text-[#022C4F] transition-colors" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#0F181F] mb-1 group-hover:text-[#022C4F] transition-colors">Upload first project brief</h4>
              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">Upload your site survey or conceptual requirements.</p>
              <button className="text-[11px] font-bold text-[#022C4F] bg-[#022C4F]/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#022C4F] hover:text-white transition-colors">
                <UploadCloud size={12} /> Upload Brief
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-gray-200 hover:border-[#022C4F] rounded-[20px] p-5 flex gap-4 cursor-pointer group transition-colors shadow-sm">
            <div className="mt-0.5">
              <Circle size={20} className="text-gray-300 group-hover:text-[#022C4F] transition-colors" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#0F181F] mb-1 group-hover:text-[#022C4F] transition-colors">Take a guided tour</h4>
              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">Learn how to navigate your dashboard and review designs.</p>
              <button className="text-[11px] font-bold text-[#022C4F] bg-[#022C4F]/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#022C4F] hover:text-white transition-colors">
                <PlayCircle size={12} /> Start Tour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 ease-out fill-mode-both">
        <MetricCard title="Active Projects" value={12} />
        <MetricCard title="Drawings Under Review" value={14} />
        <MetricCard title="Days Since Last Client Action" value={12} />
        <MetricCard title="Ready for Execution" value={3} />
      </div>

      {/* Middle Row: Chart & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 ease-out fill-mode-both">
        <div className="lg:col-span-2">
          <ChartOverview />
        </div>
        <div>
          <UrgentNotifications
            onReviewClick={() => setIsReviewDrawerOpen(true)}
            onApproveClick={() => setIsFinalApprovalDrawerOpen(true)}
          />
        </div>
      </div>

      {/* Bottom Row: Project List & Professionals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 ease-out fill-mode-both">
        <div className="lg:col-span-2">
          <ProjectList />
        </div>
        <div>
          <HireProfessionals />
        </div>
      </div>

      {/* Floating Quick Action Button / Speed Dial */}
      <div className="fixed bottom-8 right-8 z-50 animate-in fade-in zoom-in duration-500 delay-700 fill-mode-both">
        {/* Invisible Overlay for click outside */}
        {isSpeedDialOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsSpeedDialOpen(false)}
          />
        )}

        <div className="relative z-50 flex flex-col items-center gap-4">
          <AnimatePresence>
            {isSpeedDialOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                <button className="w-12 h-12 bg-[#022C4F] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform relative group">
                  <Clipboard size={20} />
                  <span className="absolute right-14 bg-white text-[#0F181F] text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    View Contract
                  </span>
                </button>
                <button className="w-12 h-12 bg-[#022C4F] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform relative group">
                  <Wallet size={20} />
                  <span className="absolute right-14 bg-white text-[#0F181F] text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Fund Escrow
                  </span>
                </button>
                <button className="w-12 h-12 bg-[#022C4F] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform relative group">
                  <UploadCloud size={20} />
                  <span className="absolute right-14 bg-white text-[#0F181F] text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Upload Document
                  </span>
                </button>
                <button className="w-12 h-12 bg-[#022C4F] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform relative group">
                  <Users size={20} />
                  <span className="absolute right-14 bg-white text-[#0F181F] text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Find Professionals
                  </span>
                </button>
                <button className="w-12 h-12 bg-[#022C4F] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform relative group">
                  <Briefcase size={20} />
                  <span className="absolute right-14 bg-white text-[#0F181F] text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Post New Project
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
            className="w-14 h-14 bg-[#022C4F] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 hover:shadow-blue-900/20 transition-all z-50"
          >
            <motion.div
              animate={{ rotate: isSpeedDialOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus size={24} />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Risk Modal Overlay */}
      {isRiskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#022C4F]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-[90%] max-w-md shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300 relative px-8 py-10">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={32} className="text-red-600" />
            </div>

            <h2 className="text-[20px] font-extrabold text-[#0F181F] mb-3">Critical Risk Alert</h2>
            <p className="text-[13px] font-medium text-gray-600 leading-relaxed mb-8">
              <span className="text-[#0F181F] font-bold">Lekki Commercial Plaza</span> — Design Review is delayed by <span className="text-red-600 font-bold">5 Days</span>. Your immediate input is required to unblock the team and proceed to the Tender phase.
            </p>

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => {
                  closeRiskModal(false);
                  setIsReviewDrawerOpen(true);
                }}
                className="w-full py-3.5 bg-red-600 text-white text-[13px] font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md"
              >
                Review Now
              </button>
              <button
                onClick={() => closeRiskModal(true)}
                className="w-full py-3.5 bg-gray-100 text-[#0F181F] text-[13px] font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Remind Me Later
              </button>
            </div>
          </div>
        </div>
      )}

      <ReviewDrawingDrawer
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
      />

      <FinalApprovalDrawer
        isOpen={isFinalApprovalDrawerOpen}
        onClose={() => setIsFinalApprovalDrawerOpen(false)}
        onApprove={() => {
          setIsFinalApprovalDrawerOpen(false);
          setIsApprovalSuccessModalOpen(true);
        }}
      />

      <ApprovalSuccessModal
        isOpen={isApprovalSuccessModalOpen}
        onClose={() => setIsApprovalSuccessModalOpen(false)}
      />

      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
