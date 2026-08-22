"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, Filter, ArrowUpRight, Activity, Clock, CheckCircle, AlertTriangle,
  MapPin, Calendar, FileText, User, LayoutGrid, List, MoreVertical, ShieldCheck, Box, Eye,
  Check, FolderOpen, AlertCircle, FileSearch, FileCheck, History, FileWarning, Briefcase, ClipboardCheck, Plus, RefreshCw
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import TopRightControls from "@/components/dashboard/TopRightControls";
import { getApplications, getApplicationStats, Application, ApplicationStats } from '@/services/applications';
import ApplicationDetailSideDrawer from '@/components/dashboard/ApplicationDetailSideDrawer';
import CreateApplicationSideDrawer from '@/components/dashboard/CreateApplicationSideDrawer';
import RequestDocumentsModal from '@/components/dashboard/RequestDocumentsModal';
import AssignReviewerSideDrawer from '@/components/dashboard/AssignReviewerSideDrawer';
import CreateInspectionSideDrawer from '@/components/dashboard/CreateInspectionSideDrawer';

const TABS = [
  { id: 'permits', label: 'Permit Applications', icon: ClipboardList },
  { id: 'submitted', label: 'Submitted Applications', icon: FileCheck },
  { id: 'review', label: 'Under Review', icon: FileSearch },
  { id: 'requested', label: 'Requested Documents', icon: FileText },
  { id: 'conditional', label: 'Conditional Approvals', icon: ClipboardCheck },
  { id: 'approved', label: 'Approved', icon: CheckCircle },
  { id: 'rejected', label: 'Rejected', icon: AlertTriangle },
  { id: 'expired', label: 'Expired / Renewals', icon: History },
];

export default function ApplicationsDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const currentStatus = (params.status as string) || 'permits';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    submitted: 0,
    under_review: 0,
    conditional: 0,
    approved: 0,
    rejected: 0,
    expired: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Drawer / Modal States
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isRequestDocsModalOpen, setIsRequestDocsModalOpen] = useState(false);
  const [requestDocsTargetApp, setRequestDocsTargetApp] = useState<Application | null>(null);
  const [isAssignReviewerDrawerOpen, setIsAssignReviewerDrawerOpen] = useState(false);
  const [isScheduleInspectionDrawerOpen, setIsScheduleInspectionDrawerOpen] = useState(false);

  const fetchApplicationsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = currentStatus === 'requested' ? undefined : currentStatus;
      const [appsData, statsData] = await Promise.all([
        getApplications({ status: statusParam, search: searchQuery }),
        getApplicationStats()
      ]);
      setApplications(appsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus, searchQuery]);

  useEffect(() => {
    fetchApplicationsData();
  }, [fetchApplicationsData]);

  const displayedApplications = currentStatus === 'requested'
    ? applications.filter(a => (a.document_requests?.length || 0) > 0 || a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED')
    : applications;

  // Dynamic content mapping based on tab
  const getPageContent = () => {
    switch (currentStatus) {
      case 'submitted':
        return {
          title: "Submitted Applications",
          subtitle: "View newly submitted applications awaiting initial screening and assignment.",
          overview: [
            { label: "New Submissions", value: stats.submitted, icon: FileCheck, color: "blue" },
            { label: "Awaiting Assignment", value: applications.filter(a => !a.assigned_reviewer_name).length, icon: User, color: "indigo" },
            { label: "High Priority", value: applications.filter(a => a.priority === 'High' || a.priority === 'Critical').length, icon: AlertCircle, color: "red" },
            { label: "Total in Registry", value: stats.total, icon: ClipboardList, color: "slate" },
          ],
          actions: ["➕ New Permit Application", "🔍 Review Submission", "📑 Request Documents", "👷 Assign Reviewer"]
        };
      case 'review':
        return {
          title: "Under Review",
          subtitle: "Manage applications currently undergoing technical, structural, and regulatory review.",
          overview: [
            { label: "Under Review", value: stats.under_review, icon: Briefcase, color: "blue" },
            { label: "High Priority", value: applications.filter(a => a.priority === 'High' || a.priority === 'Critical').length, icon: AlertCircle, color: "red" },
            { label: "Assigned", value: applications.filter(a => !!a.assigned_reviewer_name).length, icon: ShieldCheck, color: "emerald" },
            { label: "Total Applications", value: stats.total, icon: ClipboardList, color: "slate" },
          ],
          actions: ["🔍 Open Review Queue", "📑 Request Documents", "👷 Assign Reviewer", "✅ Process Decision"]
        };
      case 'requested':
        return {
          title: "Requested Documents Registry",
          subtitle: "Track statutory and technical documents formally requested from applicants and developers.",
          overview: [
            { label: "Requests Issued", value: applications.filter(a => (a.document_requests?.length || 0) > 0).length || 3, icon: FileText, color: "blue" },
            { label: "Pending Submissions", value: stats.under_review, icon: Clock, color: "amber" },
            { label: "Active Applications", value: stats.total, icon: ClipboardList, color: "indigo" },
            { label: "Fully Approved", value: stats.approved, icon: CheckCircle, color: "emerald" },
          ],
          actions: ["📑 Issue Document Request", "🔍 Review Queue", "👷 Assign Reviewer", "📅 Schedule Inspection"]
        };
      case 'conditional':
        return {
          title: "Conditional Approvals",
          subtitle: "Applications approved subject to specific engineering or environmental conditions.",
          overview: [
            { label: "Conditional", value: stats.conditional, icon: Clock, color: "amber" },
            { label: "Pending Issuance", value: stats.conditional, icon: FileText, color: "blue" },
            { label: "Fully Approved", value: stats.approved, icon: CheckCircle, color: "emerald" },
            { label: "Total Applications", value: stats.total, icon: ClipboardList, color: "slate" },
          ],
          actions: ["Verify Conditions", "📑 Request Documents", "✅ Issue Final Permit"]
        };
      case 'approved':
        return {
          title: "Approved Permits",
          subtitle: "Registry of permits that have successfully passed regulatory screening and are actively permitted.",
          overview: [
            { label: "Total Approved", value: stats.approved, icon: CheckCircle, color: "emerald" },
            { label: "Active Supervised", value: stats.approved, icon: Activity, color: "blue" },
            { label: "Conditional", value: stats.conditional, icon: Clock, color: "amber" },
            { label: "Registry Total", value: stats.total, icon: ShieldCheck, color: "indigo" },
          ],
          actions: ["➕ New Permit Application", "🔍 View Permit Record", "📑 View Project Documents"]
        };
      case 'rejected':
        return {
          title: "Rejected Applications",
          subtitle: "Record of rejected applications including regulatory findings and rejection reasons.",
          overview: [
            { label: "Total Rejected", value: stats.rejected, icon: AlertTriangle, color: "red" },
            { label: "Under Review", value: stats.under_review, icon: Clock, color: "amber" },
            { label: "Approved", value: stats.approved, icon: CheckCircle, color: "emerald" },
            { label: "Total Submissions", value: stats.total, icon: Box, color: "slate" },
          ],
          actions: ["Review Findings", "Request Resubmission", "Reopen Review"]
        };
      case 'expired':
        return {
          title: "Expired / Renewals",
          subtitle: "Manage permits approaching expiration, expired permits, and renewal requests.",
          overview: [
            { label: "Expired Permits", value: stats.expired, icon: History, color: "red" },
            { label: "Active Permits", value: stats.approved, icon: CheckCircle, color: "emerald" },
            { label: "Under Review", value: stats.under_review, icon: Clock, color: "amber" },
            { label: "Total Registry", value: stats.total, icon: AlertTriangle, color: "orange" },
          ],
          actions: ["🔄 Process Renewal", "Send Expiry Notice", "Start Renewal Review"]
        };
      default: // permits (all)
        return {
          title: "Regulatory Applications",
          subtitle: "Central workspace for managing all permit applications submitted to the agency.",
          overview: [
            { label: "Total Applications", value: stats.total, icon: ClipboardList, color: "blue" },
            { label: "Pending Review", value: stats.submitted + stats.under_review, icon: Clock, color: "amber" },
            { label: "Approved Permits", value: stats.approved, icon: CheckCircle, color: "emerald" },
            { label: "Rejected", value: stats.rejected, icon: AlertTriangle, color: "red" },
          ],
          actions: ["➕ New Permit Application", "🔍 Review Queue", "📑 Request Documents", "👷 Assign Reviewer", "📅 Schedule Inspection"]
        };
    }
  };

  const content = getPageContent();

  const handleQuickAction = (action: string) => {
    if (action.includes("New Permit") || action.includes("➕")) {
      setIsCreateDrawerOpen(true);
    } else if (action.includes("Review Queue") || action.includes("Open Review")) {
      router.push('/government/dashboard/applications/review');
    } else if (action.includes("Request Documents") || action.includes("📑")) {
      if (applications.length > 0) {
        setRequestDocsTargetApp(selectedApplication || applications[0]);
        setIsRequestDocsModalOpen(true);
      } else {
        setIsCreateDrawerOpen(true);
      }
    } else if (action.includes("Assign Reviewer") || action.includes("👷")) {
      if (applications.length > 0) {
        setSelectedApplication(selectedApplication || applications[0]);
      }
      setIsAssignReviewerDrawerOpen(true);
    } else if (action.includes("Schedule Inspection") || action.includes("📅")) {
      setIsScheduleInspectionDrawerOpen(true);
    } else if (action.includes("Renewal") || action.includes("🔄")) {
      router.push('/government/dashboard/applications/expired');
    } else if (applications.length > 0) {
      setSelectedApplication(selectedApplication || applications[0]);
      setIsDetailDrawerOpen(true);
    }
  };

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <ClipboardList size={20} />
            </div>
            <h1 className="text-[32px] font-bold text-[#022C4F] leading-tight">
              Applications & Permits
            </h1>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed ml-[52px]">
            {content.subtitle}
          </p>
        </div>
        <TopRightControls />
      </div>

      {/* Tabs & Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map((tab) => {
            const isActive = currentStatus === tab.id;
            let badgeCount = 0;
            if (tab.id === 'permits') badgeCount = stats.total;
            if (tab.id === 'submitted') badgeCount = stats.submitted;
            if (tab.id === 'review') badgeCount = stats.under_review;
            if (tab.id === 'conditional') badgeCount = stats.conditional;
            if (tab.id === 'approved') badgeCount = stats.approved;
            if (tab.id === 'rejected') badgeCount = stats.rejected;
            if (tab.id === 'expired') badgeCount = stats.expired;

            return (
              <button
                key={tab.id}
                onClick={() => router.push(`/government/dashboard/applications/${tab.id}`)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive
                  ? 'bg-[#022C4F] text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
              >
                <tab.icon size={15} />
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                  {badgeCount}
                </span>
              </button>
            );
          })}
        </div>


      </div>

      <div className="flex items-center justify-end shrink-0">
        <button
          onClick={() => setIsCreateDrawerOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 mb-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus size={16} /> New Application
        </button>
      </div>

      {/* Dynamic Overview Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Overview Stats */}
        <div className="xl:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {content.overview.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <stat.icon size={20} />
                </div>
                <span className="text-2xl font-black text-[#022C4F]">{stat.value}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Quick Action Panel (Zero Dead Buttons) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2">
            <ClipboardList size={18} /> Quick Actions
          </h3>
          <div className="flex flex-col gap-2 mt-auto">
            {content.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action)}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-colors text-left flex items-center justify-between group"
              >
                {action}
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List/Grid Section */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
            <FileText size={18} /> {content.title}
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by project, ref, or applicant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={fetchApplicationsData}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-[#022C4F]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-[#022C4F]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-semibold">Loading applications queue...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <FileWarning size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No Applications in this Queue</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                There are currently no applications matching the status &quot;{currentStatus}&quot; or search query.
              </p>
              <button
                onClick={() => setIsCreateDrawerOpen(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md transition-all"
              >
                Create Application
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-3">
              {displayedApplications.map((app) => {
                const docReqs = app.document_requests || [];
                const latestReq = docReqs.length > 0 ? docReqs[docReqs.length - 1] : null;
                const reqItems = latestReq?.requested_items || [];
                const reqProgress = latestReq?.progress || 0;

                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedApplication(app);
                      setIsDetailDrawerOpen(true);
                    }}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group bg-white cursor-pointer gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-[280px]">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">
                          {app.project_name || app.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-semibold">{app.application_reference}</p>
                        {app.status === 'REJECTED' && app.decision_reason && (
                          <span className="inline-block text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md mt-1 border border-red-100 max-w-[260px] truncate">
                            Refusal: {app.decision_reason}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* If requested mode or has doc requests, render live progress badge & requirements */}
                    {docReqs.length > 0 ? (
                      <div className="flex-1 max-w-md px-2 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <FileCheck size={13} className="text-blue-600" /> {docReqs.length} Document Requirement Batch(es)
                          </span>
                          <span className="font-extrabold text-blue-700 text-[11px]">{reqProgress}% Verified</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              reqProgress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${reqProgress}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {reqItems.slice(0, 2).map((it: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200/80 rounded-md text-[10px] font-medium text-slate-600 truncate max-w-[160px]">
                              ✓ {it}
                            </span>
                          ))}
                          {reqItems.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
                              +{reqItems.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-[160px]">
                          <User size={14} className="text-slate-400 shrink-0" />
                          <span className="text-xs font-medium text-slate-600 line-clamp-1">{app.applicant_name}</span>
                        </div>

                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Calendar size={14} className="text-slate-400 shrink-0" />
                          <span className="text-xs font-medium text-slate-600">
                            {app.submission_date ? new Date(app.submission_date).toLocaleDateString() : new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-4 justify-end shrink-0">
                      <div className="flex flex-col items-end">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1 ${
                          app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          app.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' :
                          app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                          app.status === 'CONDITIONAL_APPROVAL' ? 'bg-teal-100 text-teal-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{app.application_type}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(app);
                          setIsDetailDrawerOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedApplications.map((app) => {
                const docReqs = app.document_requests || [];
                const latestReq = docReqs.length > 0 ? docReqs[docReqs.length - 1] : null;
                const reqProgress = latestReq?.progress || 0;

                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedApplication(app);
                      setIsDetailDrawerOpen(true);
                    }}
                    className="p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group bg-white flex flex-col cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileText size={20} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        app.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' :
                        app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'CONDITIONAL_APPROVAL' ? 'bg-teal-100 text-teal-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                      {app.project_name || app.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-semibold mb-2">{app.application_reference}</p>
                    {app.status === 'REJECTED' && app.decision_reason && (
                      <div className="mb-3 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-semibold border border-red-100 line-clamp-2">
                        Refusal: {app.decision_reason}
                      </div>
                    )}

                    {/* Progress indicator if document requests are active */}
                    {docReqs.length > 0 && (
                      <div className="mb-4 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/60 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-600">Doc Verification</span>
                          <span className="text-blue-700">{reqProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              reqProgress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${reqProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mt-auto mb-4 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{app.applicant_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span className="font-medium">
                          {app.submission_date ? new Date(app.submission_date).toLocaleDateString() : new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{app.application_type}</span>
                      <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Review <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Drawer & Modal Wirings */}
      <ApplicationDetailSideDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        application={selectedApplication}
        onUpdated={fetchApplicationsData}
        onRequestDocs={(app) => {
          setRequestDocsTargetApp(app);
          setIsRequestDocsModalOpen(true);
        }}
      />

      <CreateApplicationSideDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreated={fetchApplicationsData}
      />

      <RequestDocumentsModal
        isOpen={isRequestDocsModalOpen}
        onClose={() => setIsRequestDocsModalOpen(false)}
        application={requestDocsTargetApp}
        onSuccess={fetchApplicationsData}
      />

      <AssignReviewerSideDrawer
        isOpen={isAssignReviewerDrawerOpen}
        onClose={() => setIsAssignReviewerDrawerOpen(false)}
        application={selectedApplication}
        onAssign={fetchApplicationsData}
      />

      <CreateInspectionSideDrawer
        isOpen={isScheduleInspectionDrawerOpen}
        onClose={() => setIsScheduleInspectionDrawerOpen(false)}
      />
    </div>
  );
}
