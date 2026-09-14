"use client";

import React, { useState, useEffect } from "react";
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
import { getProjects, Project } from "@/services/projects";
import { getDocumentStats, DocumentStats } from "@/services/documents";
import { Search, Bell, FileText, MessageSquare, Plus, Clipboard, Wallet, UploadCloud, Users, Briefcase, AlertTriangle, CheckCircle, Circle, PlayCircle } from "lucide-react";
import ProfilePill from "@/components/ui/ProfilePill";
import { useAuth } from "@/context/AuthContext";

interface ProjectRisk {
  projectId: string;
  projectName: string;
  title: string;
  severity: "critical" | "high";
  detail: string;
}

const getProgress = (project: Project): number | null => {
  if (typeof project.progress === "number") return project.progress;
  const raw = (project as any).progress_percentage;
  return typeof raw === "number" ? raw : null;
};

const isPastDate = (value?: string | null): boolean => {
  if (!value) return false;
  const date = new Date(value);
  if (isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
};

// Derive risks strictly from real project fields — nothing is invented here.
const deriveRisks = (projects: Project[]): ProjectRisk[] => {
  const risks: ProjectRisk[] = [];

  projects.forEach((project) => {
    const permitStatus = (project.permit_status || "").trim();
    const permitLower = permitStatus.toLowerCase();

    // Expired permit: explicit expired status or a past permit expiry date.
    if (
      (permitLower.includes("expire") && !permitLower.includes("not")) ||
      (isPastDate(project.permit_expiry_date) && permitStatus !== "")
    ) {
      risks.push({
        projectId: project.id,
        projectName: project.name,
        title: "Expired Permit",
        severity: "critical",
        detail: project.permit_expiry_date
          ? `Permit expired ${new Date(project.permit_expiry_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. Status: ${permitStatus}.`
          : `Permit status: ${permitStatus}.`
      });
    }

    // No permit recorded on the project.
    if (!permitStatus) {
      risks.push({
        projectId: project.id,
        projectName: project.name,
        title: "No Permit Recorded",
        severity: "high",
        detail: `Project status: ${project.status}. No permit status has been recorded for this project yet.`
      });
    }

    // Past estimated completion date without a completed status.
    if (isPastDate(project.estimated_completion) && project.status !== "COMPLETED") {
      risks.push({
        projectId: project.id,
        projectName: project.name,
        title: "Past Estimated Completion",
        severity: "high",
        detail: `Estimated completion was ${new Date(project.estimated_completion as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. Current status: ${project.status}.`
      });
    }
  });

  return risks;
};

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [isFinalApprovalDrawerOpen, setIsFinalApprovalDrawerOpen] = useState(false);
  const [isApprovalSuccessModalOpen, setIsApprovalSuccessModalOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [docStats, setDocStats] = useState<DocumentStats | null>(null);
  const [isLoadingDocStats, setIsLoadingDocStats] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProjects()
      .then((data) => {
        if (!cancelled) setProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProjects(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getDocumentStats()
      .then((stats) => {
        if (!cancelled) setDocStats(stats);
      })
      .catch(() => {
        if (!cancelled) setDocStats(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDocStats(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsNotificationOpen(true);
    window.addEventListener('open-notifications', handleOpen);
    return () => {
      window.removeEventListener('open-notifications', handleOpen);
    };
  }, []);

  // Metrics — all derived from real project / document data only.
  const activeProjects = projects.filter(
    (p) => p.status !== "COMPLETED" && p.status !== "ABANDONED"
  ).length;
  const readyForExecution = projects.filter(
    (p) => p.status === "COMPLETED" || getProgress(p) === 100
  ).length;

  const risks = deriveRisks(projects);

  // Getting Started steps — computed honestly from the signed-in user and
  // their real projects. Step 3 (guided tour) has no completion signal in the
  // backend, so it is only ever shown as complete when we can verify it.
  const profileComplete = Boolean(user && `${user.first_name}`.trim() && user.email);
  const hasProject = projects.length > 0;
  const completedSteps = [profileComplete, hasProject, false].filter(Boolean).length;

  return (
    <div className="space-y-6 relative pb-12">

      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">

        {/* Welcome Text */}
        <div>
          <h1 className="text-3xl font-extrabold text-[#022C4F] mb-1">Welcome Back</h1>
          <h2 className="text-xl font-bold text-[#0F181F] mb-2">Good morning, {user ? `${user.first_name}`.trim() || user.email : 'Loading...'} <span className="inline-block animate-wave">👋</span></h2>
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
        {isLoadingProjects ? (
          <div className="bg-white border border-[#022C4F] rounded-2xl p-5 text-[11px] font-semibold text-gray-400 animate-pulse">
            Checking your projects for risks…
          </div>
        ) : risks.length === 0 ? (
          <div className="bg-white border border-[#022C4F] rounded-2xl p-5 text-[11px] font-medium text-gray-500">
            No active risks recorded
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((risk) => (
              risk.severity === "critical" ? (
                <div key={`${risk.projectId}-${risk.title}`} className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-1">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-bold text-red-900">{risk.title}</span>
                      <span className="text-[10px] font-bold bg-red-200 text-red-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Critical</span>
                    </div>
                    <p className="text-[11px] text-red-700 mb-2 font-medium">{risk.projectName}</p>
                    <p className="text-[12px] text-red-800 leading-relaxed bg-white/50 p-2 rounded-lg border border-red-100 font-medium">
                      {risk.detail}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={`${risk.projectId}-${risk.title}`} className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-1">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-bold text-orange-900">{risk.title}</span>
                      <span className="text-[10px] font-bold bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full uppercase tracking-wider">High</span>
                    </div>
                    <p className="text-[11px] text-orange-700 mb-2 font-medium">{risk.projectName}</p>
                    <p className="text-[12px] text-orange-800 leading-relaxed bg-white/50 p-2 rounded-lg border border-orange-100 font-medium">
                      {risk.detail}
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Getting Started Module */}
      <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 ease-out fill-mode-both">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-[20px] font-extrabold text-[#022C4F] mb-1">Getting Started with Nexucon</h3>
            <p className="text-[13px] text-gray-500 font-medium">Complete these steps to set up your workspace and kick off your first project.</p>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#0F181F]">{completedSteps} of 3 Completed</span>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#4CAF50] rounded-full transition-all" style={{ width: `${(completedSteps / 3) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className={`rounded-[20px] p-5 flex gap-4 transition-colors ${profileComplete ? "border-2 border-[#8BC34A] bg-[#8BC34A]/5" : "border border-gray-200 hover:border-[#022C4F] shadow-sm cursor-pointer group"}`}>
            <div className="mt-0.5">
              {profileComplete
                ? <CheckCircle size={20} className="text-[#8BC34A]" />
                : <Circle size={20} className="text-gray-300 group-hover:text-[#022C4F] transition-colors" />}
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#0F181F] mb-1">Complete your profile</h4>
              <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">Add your company details, billing info, and preferences.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`rounded-[20px] p-5 flex gap-4 transition-colors ${hasProject ? "border-2 border-[#8BC34A] bg-[#8BC34A]/5" : "border border-gray-200 hover:border-[#022C4F] cursor-pointer group shadow-sm"}`}>
            <div className="mt-0.5">
              {hasProject
                ? <CheckCircle size={20} className="text-[#8BC34A]" />
                : <Circle size={20} className="text-gray-300 group-hover:text-[#022C4F] transition-colors" />}
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#0F181F] mb-1 group-hover:text-[#022C4F] transition-colors">Upload first project brief</h4>
              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">Upload your site survey or conceptual requirements.</p>
              {!hasProject && (
                <Link href="/client/new-project" className="text-[11px] font-bold text-[#022C4F] bg-[#022C4F]/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#022C4F] hover:text-white transition-colors w-fit">
                  <UploadCloud size={12} /> Upload Brief
                </Link>
              )}
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
        <MetricCard title="Active Projects" value={isLoadingProjects ? "…" : activeProjects} />
        <MetricCard title="Pending Review Documents" value={isLoadingDocStats ? "…" : (docStats?.pending_count ?? 0)} />
        <MetricCard title="Total Documents" value={isLoadingDocStats ? "…" : (docStats?.total_documents ?? 0)} />
        <MetricCard title="Ready for Execution" value={isLoadingProjects ? "…" : readyForExecution} />
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
