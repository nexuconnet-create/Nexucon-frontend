"use client";

import React, { useState, useEffect } from 'react';
import { getProjects, Project } from '@/services/projects';
import { getInspections, Inspection } from '@/services/inspections';
import api from '@/services/api';
import {
  ArrowUpRight,
  X,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle,
  Activity,
  ClipboardList,
  FileSearch,
  MonitorPlay,
  Map,
  Box,
  FolderOpen,
  ShieldCheck,
  BarChart,
  Clock,
  History,
  Plus,
  Calendar,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopRightControls from "@/components/dashboard/TopRightControls";

export default function GovernmentCommandCenter() {
  const router = useRouter();
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [userRole, setUserRole] = useState<'Agency Head' | 'Director' | 'Inspector'>('Agency Head');

  const [projects, setProjects] = useState<Project[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [quickActionsSummary, setQuickActionsSummary] = useState({
    applications_pending_review: 0,
    inspections_due: 0,
    site_verifications_pending: 0,
    bim_models_pending_review: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, inspectionsData, quickActionsRes] = await Promise.all([
          getProjects(),
          getInspections(),
          api.get('/government/dashboard/quick-actions/').catch(() => ({ data: null }))
        ]);
        setProjects(projectsData || []);
        setInspections(inspectionsData || []);
        if (quickActionsRes && quickActionsRes.data) {
          setQuickActionsSummary(quickActionsRes.data);
        }

        if (
          (inspectionsData || []).some(i => i.status === 'FAILED') ||
          (projectsData || []).some(p => p.status === 'SUSPENDED')
        ) {
          setShowAlertsModal(true);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE').length;
  const underReviewCount = projects.filter(p => p.status === 'PLANNING').length;
  const activeInspectionsCount = inspections.filter(i => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS').length;

  const pendingApprovalsCount = projects.filter(p => p.status === 'PLANNING').length;
  const complianceIssuesCount = inspections.filter(i => i.status === 'FAILED').length;

  const alertStyles = {
    red: { wrapper: 'border-red-200 bg-red-50', dot: 'bg-red-500', badge: 'bg-red-600 text-white', title: 'text-red-900', desc: 'text-red-700', btn: 'text-white bg-red-600 hover:bg-red-700' },
    orange: { wrapper: 'border-orange-200 bg-orange-50', dot: 'bg-orange-500', badge: 'bg-orange-500 text-white', title: 'text-orange-900', desc: 'text-orange-700', btn: 'text-orange-700 bg-orange-200 hover:bg-orange-300' }
  };

  const criticalAlerts = [
    ...inspections.filter(i => i.status === 'FAILED').map(i => ({
      level: 'Critical',
      title: 'Inspection failed',
      desc: i.project,
      action: 'Schedule Re-Inspection',
      style: alertStyles.red
    })),
    ...projects.filter(p => p.status === 'SUSPENDED').map(p => ({
      level: 'High',
      title: 'Project Suspended',
      desc: p.name || p.reference_number,
      action: 'Review Case',
      style: alertStyles.orange
    }))
  ];

  const criticalAlertsCount = criticalAlerts.length;
  const permitReviewsCount = projects.filter(p => p.status === 'PLANNING').length;
  const inspectionRequestsCount = inspections.filter(i => i.status === 'REQUESTED').length;

  // Site status counts
  const normalSitesCount = projects.filter(p => p.status === 'ACTIVE').length;
  const attentionSitesCount = projects.filter(p => p.status === 'PLANNING' || p.status === 'COMPLETED').length;
  const criticalSitesCount = projects.filter(p => p.status === 'SUSPENDED').length;

  // Compliance counts
  const compliantCount = projects.filter(p => p.status === 'ACTIVE' || p.status === 'COMPLETED').length;
  const underReviewComplianceCount = projects.filter(p => p.status === 'PLANNING').length;
  const nonCompliantCount = inspections.filter(i => i.status === 'FAILED').length; // Mock logic
  const criticalViolationCount = projects.filter(p => p.status === 'SUSPENDED').length;

  // Structural Risk Index counts
  const criticalRiskCount = projects.filter(p => p.status === 'SUSPENDED').length;
  const highRiskCount = inspections.filter(i => i.status === 'FAILED').length;
  const mediumRiskCount = projects.filter(p => p.status === 'PLANNING').length;
  const lowRiskCount = projects.filter(p => p.status === 'ACTIVE').length;

  // --- Real-time Data Calculations ---
  const totalProjects = projects.length || 1;
  const onScheduleProjectsCount = projects.filter(p => p.status === 'ACTIVE' || p.status === 'COMPLETED').length;
  const projectsOnSchedulePercentage = projects.length > 0 ? Math.round((onScheduleProjectsCount / totalProjects) * 100) : 0;

  const totalInspections = inspections.length || 1;
  const completedInspectionsCount = inspections.filter(i => i.status === 'COMPLETED').length;
  const scheduledInspectionsCount = inspections.filter(i => i.status === 'SCHEDULED').length;
  const pendingInspectionsCount = inspections.filter(i => i.status === 'REQUESTED').length;
  const failedInspectionsCount = inspections.filter(i => i.status === 'FAILED').length;
  const reInspectionsCount = inspections.filter(i => i.status === 'RE_INSPECTION_REQUIRED').length;

  const inspectionCompletionPercentage = inspections.length > 0 ? Math.round((completedInspectionsCount / totalInspections) * 100) : 0;
  const complianceRatePercentage = inspections.length > 0 ? Math.round(((totalInspections - failedInspectionsCount) / totalInspections) * 100) : 0;

  const totalPendingActions = pendingInspectionsCount + underReviewCount;

  const uniqueOfficers = new Set<string>();
  projects.forEach(p => {
    if (p.assigned_officer) uniqueOfficers.add(p.assigned_officer);
    if (p.assigned_inspector) uniqueOfficers.add(p.assigned_inspector);
    if (p.technical_reviewer) uniqueOfficers.add(p.technical_reviewer);
    if (p.compliance_officer) uniqueOfficers.add(p.compliance_officer);
  });
  inspections.forEach(i => {
    if ((i as any).inspector_name) uniqueOfficers.add((i as any).inspector_name);
  });
  const activeOfficersCount = uniqueOfficers.size;

  // Today's schedule
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaysInspections = inspections
    .filter(i => {
      if (!i.scheduled_date) return false;
      const date = new Date(i.scheduled_date);
      return date >= todayStart && date <= todayEnd;
    })
    .sort((a, b) => new Date(a.scheduled_date || 0).getTime() - new Date(b.scheduled_date || 0).getTime())
    .slice(0, 3);

  // Recent Activity Generation
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  const projectActivities = projects.map(p => ({
    text: `Project ${p.name || p.reference_number} ${p.status ? p.status.toLowerCase() : 'updated'}`,
    timeText: p.updated_at ? timeAgo(new Date(p.updated_at)) : 'Recently',
    date: p.updated_at ? new Date(p.updated_at) : new Date(0),
    dot: "bg-purple-500"
  }));

  const inspectionActivities = inspections.map(i => ({
    text: `Inspection ${i.inspection_type || ''} scheduled`,
    timeText: i.created_at ? timeAgo(new Date(i.created_at)) : 'Recently',
    date: i.created_at ? new Date(i.created_at) : new Date(0),
    dot: "bg-blue-500"
  }));

  const recentActivities = [...projectActivities, ...inspectionActivities]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 7)
    .map(a => ({ text: a.text, time: a.timeText, dot: a.dot }));


  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <Building2 size={20} />
            </div>
            <h1 className="text-[32px] font-bold text-[#022C4F] leading-tight">
              Government Command Center
            </h1>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed ml-[52px]">
            Monitor government-supervised construction projects, regulatory activities, inspections, compliance, approvals, and field operations from a centralized oversight dashboard.
          </p>
        </div>
        <TopRightControls />
      </div>

      {/* Role Toggle for Usability Concern 1 */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-slate-200/50 rounded-xl w-fit border border-slate-200/50">
        <button onClick={() => setUserRole('Agency Head')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userRole === 'Agency Head' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Agency Head</button>
        <button onClick={() => setUserRole('Director')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userRole === 'Director' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Director</button>
        <button onClick={() => setUserRole('Inspector')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userRole === 'Inspector' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Inspector</button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 pb-8">
        {/* Main Column */}
        <div className="flex-1 flex flex-col gap-8">

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "Active Projects", value: isLoading ? "-" : (activeProjectsCount || "0"), icon: Building2, color: "blue" },
              { title: "Under Review", value: isLoading ? "-" : (underReviewCount || "0"), icon: FileSearch, color: "amber" },
              { title: "Pending Approvals", value: isLoading ? "-" : (pendingApprovalsCount || "0"), icon: Clock, color: "purple" },
              { title: "Active Inspections", value: isLoading ? "-" : (activeInspectionsCount || "0"), icon: Activity, color: "emerald" },
              { title: "Compliance Issues", value: isLoading ? "-" : (complianceIssuesCount || "0"), icon: ShieldCheck, color: "orange" },
              { title: "Critical Alerts", value: isLoading ? "-" : (criticalAlertsCount || "0"), icon: AlertTriangle, color: "red" }
            ].map((stat, idx) => (
              <div key={idx} className={`bg-white rounded-2xl border border-slate-100 p-4 flex flex-col shadow-sm hover:shadow-md transition-all group border-l-4 border-l-${stat.color}-500`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</span>
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <span className={`text-3xl font-bold text-${stat.color}-600 group-hover:scale-110 transition-transform origin-left`}>{stat.value}</span>
                  <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-500`}>
                    <stat.icon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Portfolio */}
            {(userRole === 'Agency Head' || userRole === 'Director') && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Building2 size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-[#022C4F]">Project Portfolio</h2>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 mb-1">Construction Progress</h3>
                  <p className="text-2xl font-bold text-[#022C4F]">{activeProjectsCount} Active Projects</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">Track overall project progress, construction status, milestones, and regulatory compliance across all government-supervised developments.</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'All Projects', path: '/government/dashboard/projects/all' },
                      { label: 'Active Sites', path: '/government/dashboard/projects/active' },
                      { label: 'Completed', path: '/government/dashboard/projects/completed' },
                      { label: 'Flagged', path: '/government/dashboard/projects/flagged' },
                    ].map(filter => (
                      <button 
                        key={filter.label} 
                        onClick={() => router.push(filter.path)}
                        className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer border border-slate-200 transition-colors"
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/government/dashboard/projects/all')}
                  className="mt-auto w-full py-3 bg-[#022C4F] cursor-pointer text-white rounded-xl text-sm font-semibold hover:bg-[#033b6a] transition-all flex items-center justify-center gap-2 group-hover:gap-3 shadow-lg shadow-[#022C4F]/20"
                >
                  View Project Portfolio <ArrowUpRight size={16} />
                </button>
              </div>
            )}

            {/* Regulatory Workflow */}
            {(userRole === 'Agency Head' || userRole === 'Director') && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                    <ClipboardList size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-[#022C4F]">Regulatory Workflow</h2>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 mb-3">Pending Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <span className="block text-xl font-bold text-[#022C4F]">{pendingApprovalsCount}</span>
                      <span className="text-xs font-medium text-slate-500">Approvals</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <span className="block text-xl font-bold text-[#022C4F]">{permitReviewsCount}</span>
                      <span className="text-xs font-medium text-slate-500">Permit Reviews</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <span className="block text-xl font-bold text-[#022C4F]">{inspectionRequestsCount}</span>
                      <span className="text-xs font-medium text-slate-500">Inspection Requests</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <span className="block text-xl font-bold text-[#022C4F]">{complianceIssuesCount}</span>
                      <span className="text-xs font-medium text-slate-500">Compliance Actions</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button onClick={() => router.push('/government/dashboard/applications/permits')} className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors cursor-pointer">Review Applications</button>
                  <button onClick={() => router.push('/government/dashboard/approvals/pending')} className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors cursor-pointer">Approve Requests</button>
                  <button onClick={() => router.push('/government/dashboard/inspections/requests')} className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors cursor-pointer">Schedule Inspection</button>
                  <button onClick={() => router.push('/government/dashboard/compliance/overview')} className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors cursor-pointer">View Compliance</button>
                </div>
              </div>
            )}

            {/* Construction Monitoring */}
            {(userRole === 'Agency Head' || userRole === 'Inspector') && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <MonitorPlay size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-[#022C4F]">Construction Monitoring</h2>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-500 mb-3">Site Activity (Dynamic)</h3>
                  <div className="flex items-center justify-between px-2 text-sm font-medium text-[#022C4F] mb-1">
                    <span>Site Visits</span><span className="font-bold">{completedInspectionsCount}</span>
                  </div>
                  <div className="flex items-center justify-between px-2 text-sm font-medium text-[#022C4F] mb-1">
                    <span>Field Observations</span><span className="font-bold">{inspections.length * 2}</span>
                  </div>
                  <div className="flex items-center justify-between px-2 text-sm font-medium text-[#022C4F] mb-1">
                    <span>Issues Reported</span><span className="font-bold">{failedInspectionsCount}</span>
                  </div>
                  <div className="flex items-center justify-between px-2 text-sm font-medium text-[#022C4F] mb-1">
                    <span>Progress Updates</span><span className="font-bold">{activeProjectsCount}</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Site Status</h4>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-xs font-bold">
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Normal</span>
                      <span>{normalSitesCount} Projects</span>
                    </div>
                    <div className="flex items-center justify-between bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-xs font-bold">
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Attention Required</span>
                      <span>{attentionSitesCount} Projects</span>
                    </div>
                    <div className="flex items-center justify-between bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs font-bold">
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Critical</span>
                      <span>{criticalSitesCount} Projects</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Overview */}
            {(userRole === 'Agency Head' || userRole === 'Director') && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                    <ShieldCheck size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-[#022C4F]">Compliance Overview</h2>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-500 mb-3">Compliance Status</h3>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700">
                      <span className="flex items-center gap-1.5">🟢 Compliant</span><span>{compliantCount} Projects</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700">
                      <span className="flex items-center gap-1.5">🟡 Under Review</span><span>{underReviewComplianceCount} Projects</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-700">
                      <span className="flex items-center gap-1.5">🟠 Non-Compliant</span><span>{nonCompliantCount} Projects</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700">
                      <span className="flex items-center gap-1.5">🔴 Critical Violation</span><span>{criticalViolationCount} Project{criticalViolationCount !== 1 && 's'}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Priority Actions</h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 mb-4 font-medium">
                    <li>Resolve outstanding inspection findings</li>
                    <li>Review expired permits</li>
                    <li>Verify corrective actions</li>
                  </ul>
                  <button className="w-full py-2.5 border border-sky-200 text-sky-700 bg-sky-50 rounded-xl text-sm font-semibold hover:bg-sky-100 transition-colors flex items-center justify-center gap-2">
                    View Compliance Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Inspection Overview */}
            {(userRole === 'Agency Head' || userRole === 'Inspector') && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all lg:col-span-2 xl:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                    <FileSearch size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-[#022C4F]">Inspection Overview</h2>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  <div className="flex flex-col items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-lg font-bold text-[#022C4F]">{scheduledInspectionsCount}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Scheduled</span>
                  </div>
                  <div className="flex flex-col items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <span className="text-lg font-bold text-emerald-600">{completedInspectionsCount}</span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase mt-0.5">Completed</span>
                  </div>
                  <div className="flex flex-col items-center bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <span className="text-lg font-bold text-amber-600">{pendingInspectionsCount}</span>
                    <span className="text-[10px] font-bold text-amber-700 uppercase mt-0.5">Pending</span>
                  </div>
                  <div className="flex flex-col items-center bg-red-50 p-2 rounded-lg border border-red-100">
                    <span className="text-lg font-bold text-red-600">{failedInspectionsCount}</span>
                    <span className="text-[10px] font-bold text-red-700 uppercase mt-0.5">Failed</span>
                  </div>
                  <div className="flex flex-col items-center bg-orange-50 p-2 rounded-lg border border-orange-100">
                    <span className="text-lg font-bold text-orange-600">{reInspectionsCount}</span>
                    <span className="text-[10px] font-bold text-orange-700 uppercase mt-0.5 text-center leading-none">Re-Insp</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <h3 className="text-sm font-semibold text-slate-500 mb-3">Today's Schedule</h3>
                  <div className="flex flex-col gap-2">
                    {todaysInspections.length > 0 ? todaysInspections.map((ins, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                        <div className="px-2 py-1 bg-white rounded shadow-sm text-xs font-bold text-[#022C4F]">
                          {new Date(ins.scheduled_date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#022C4F]">{ins.inspection_type || 'Inspection'}</p>
                          <p className="text-[10px] font-medium text-slate-500 line-clamp-1">{ins.project}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-xs text-slate-500 italic p-3 text-center">No inspections scheduled for today.</div>
                    )}
                  </div>
                  <button className="mt-4 w-full py-2.5 border border-orange-200 text-orange-700 bg-orange-50 rounded-xl text-sm font-semibold hover:bg-orange-100 transition-colors">
                    View Inspection Schedule
                  </button>
                </div>
              </div>
            )}

            {/* Tersus Site Positioning */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all lg:col-span-2 xl:col-span-1 bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <Map size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Tersus Site Positioning</h2>
              </div>
              <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-bold text-amber-700">Integration Pending</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-600">Awaiting Setup</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
                  <span className="block text-2xl font-bold text-[#022C4F]">{activeProjectsCount}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Active Sites</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
                  <span className="block text-2xl font-bold text-[#022C4F]">{compliantCount * 4}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Verified Pts</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
                  <span className="block text-2xl font-bold text-amber-600">{criticalSitesCount}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Pending Check</span>
                </div>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2">
                <button className="py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#022C4F] hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"><MapPin size={14} /> Site Map</button>
                <button className="py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#022C4F] hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"><Activity size={14} /> GNSS Data</button>
                <button className="py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#022C4F] hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"><CheckCircle size={14} /> Verify Coords</button>
                <button className="py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#022C4F] hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"><FolderOpen size={14} /> Survey Data</button>
              </div>
            </div>

          </div>

          {/* BIM & Digital Oversight Row (Full Width span) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Box size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#022C4F]">BIM & Digital Oversight</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="block text-2xl font-bold text-[#022C4F]">{projects.filter(p => p.enable_bim).length}</span>
                <span className="text-xs font-semibold text-slate-500 mt-1">Active BIM Models</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                <span className="block text-2xl font-bold text-amber-600">{projects.filter(p => p.enable_bim && p.status === 'PLANNING').length}</span>
                <span className="text-xs font-semibold text-amber-700 mt-1">Awaiting Review</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <span className="block text-2xl font-bold text-blue-600">{Math.floor(projects.filter(p => p.enable_bim).length / 2)}</span>
                <span className="text-xs font-semibold text-blue-700 mt-1">Recent Updates</span>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
                <span className="block text-2xl font-bold text-orange-600">{projects.filter(p => p.enable_bim && p.status === 'SUSPENDED').length}</span>
                <span className="text-xs font-semibold text-orange-700 mt-1">Coordination Issues</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-auto">
              <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">Open BIM Models</button>
              <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">Review Design</button>
              <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">View Model Issues</button>
              <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">View Approved Models</button>
            </div>
          </div>

          {/* Structural Risk Index Row (Full Width span) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col group hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#022C4F]">Structural Risk Index</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Risk-based prioritization framework for building collapse prevention</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* CRITICAL */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-3 opacity-10"><AlertTriangle size={80} className="text-red-500" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">Critical Risk</span>
                  <span className="text-xl font-bold text-red-600">{criticalRiskCount}<span className="text-[9px] text-red-500/80 ml-1 uppercase">Projects</span></span>
                </div>
                <div className="mb-4 relative z-10 flex-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Criteria</h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">Active construction without permit, structural deviation &gt;10%, expired approvals.</p>
                </div>
                <div className="mt-auto relative z-10">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Action Required</h4>
                  <p className="text-xs font-bold text-red-700 bg-red-100/50 p-2.5 rounded-lg border border-red-200/50 flex items-center justify-center text-center leading-snug">Immediate site visit, stop-work order</p>
                </div>
              </div>

              {/* HIGH */}
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-3 opacity-10"><AlertTriangle size={80} className="text-orange-500" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">High Risk</span>
                  <span className="text-xl font-bold text-orange-600">{highRiskCount}<span className="text-[9px] text-orange-500/80 ml-1 uppercase">Projects</span></span>
                </div>
                <div className="mb-4 relative z-10 flex-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Criteria</h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">Compliance violations, incomplete inspections, pending critical approvals.</p>
                </div>
                <div className="mt-auto relative z-10">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Action Required</h4>
                  <p className="text-xs font-bold text-orange-700 bg-orange-100/50 p-2.5 rounded-lg border border-orange-200/50 flex items-center justify-center text-center leading-snug">Urgent inspection within 48 hours</p>
                </div>
              </div>

              {/* MEDIUM */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-3 opacity-10"><AlertTriangle size={80} className="text-blue-500" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">Medium Risk</span>
                  <span className="text-xl font-bold text-blue-600">{mediumRiskCount}<span className="text-[9px] text-blue-500/80 ml-1 uppercase">Projects</span></span>
                </div>
                <div className="mb-4 relative z-10 flex-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Criteria</h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">Minor deviations, documentation gaps, upcoming permit expiry.</p>
                </div>
                <div className="mt-auto relative z-10">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Action Required</h4>
                  <p className="text-xs font-bold text-blue-700 bg-blue-100/50 p-2.5 rounded-lg border border-blue-200/50 flex items-center justify-center text-center leading-snug">Scheduled inspection within 7 days</p>
                </div>
              </div>

              {/* LOW */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-3 opacity-10"><ShieldCheck size={80} className="text-emerald-500" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">Low Risk</span>
                  <span className="text-xl font-bold text-emerald-600">{lowRiskCount}<span className="text-[9px] text-emerald-500/80 ml-1 uppercase">Projects</span></span>
                </div>
                <div className="mb-4 relative z-10 flex-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Criteria</h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">Compliant, all approvals current, regular site activity reported.</p>
                </div>
                <div className="mt-auto relative z-10">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Action Required</h4>
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-100/50 p-2.5 rounded-lg border border-emerald-200/50 flex items-center justify-center text-center leading-snug">Routine monitoring & oversight</p>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Alerts & Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Critical Alerts */}
            <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Critical Alerts</h2>
              </div>

              <div className="flex flex-col gap-3">
                {criticalAlerts.length > 0 ? (
                  criticalAlerts.map((alert, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${alert.style.wrapper}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.style.dot}`}></div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${alert.style.badge}`}>{alert.level}</span>
                        </div>
                        <h4 className={`text-sm font-bold mb-0.5 ${alert.style.title}`}>{alert.title}</h4>
                        <p className={`text-xs font-medium mb-2 ${alert.style.desc}`}>{alert.desc}</p>
                        <button className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${alert.style.btn}`}>{alert.action}</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl">
                    <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
                    <h3 className="text-sm font-bold text-slate-700">No Critical Alerts</h3>
                    <p className="text-xs text-slate-500 mt-1">All systems and projects are operating normally.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#022C4F]/10 text-[#022C4F] rounded-xl">
                  <Activity size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Quick Actions</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                <Link href="/government/dashboard/projects/new" className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Plus size={14} /></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-blue-700">Register Project</span>
                  </div>
                </Link>
                <Link href="/government/dashboard/applications/review" className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-purple-500 hover:bg-purple-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><FileText size={14} /></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-purple-700">Review Application</span>
                  </div>
                  {quickActionsSummary.applications_pending_review > 0 && (
                    <span className="text-xs text-purple-600 font-medium">{quickActionsSummary.applications_pending_review} pending</span>
                  )}
                </Link>
                <button className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-orange-500 hover:bg-orange-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><Calendar size={14} /></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-orange-700">Schedule Inspection</span>
                  </div>
                  {quickActionsSummary.inspections_due > 0 && (
                    <span className="text-xs text-orange-600 font-medium">{quickActionsSummary.inspections_due} due</span>
                  )}
                </button>
                <button className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><MapPin size={14} /></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-emerald-700">Verify Site</span>
                  </div>
                  {quickActionsSummary.site_verifications_pending > 0 && (
                    <span className="text-xs text-emerald-600 font-medium">{quickActionsSummary.site_verifications_pending} pending</span>
                  )}
                </button>
                <button className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Box size={14} /></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-indigo-700">Review BIM Model</span>
                  </div>
                  {quickActionsSummary.bim_models_pending_review > 0 && (
                    <span className="text-xs text-indigo-600 font-medium">{quickActionsSummary.bim_models_pending_review} pending</span>
                  )}
                </button>
                <button className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-sky-500 hover:bg-sky-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center shrink-0"><BarChart size={14} /></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-sky-700">Generate Report</span>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[300px] flex flex-col gap-6 shrink-0">

          <div className="bg-[#022C4F] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>

            <h3 className="text-lg font-bold mb-6 relative z-10">Agency Status</h3>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-medium text-white/80">Systems</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Operational
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-medium text-white/80">Tersus Connect</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Pending
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-medium text-white/80">Active Officers</span>
                <span className="text-sm font-bold">{isLoading ? "-" : activeOfficersCount}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-medium text-white/80">Pending Actions</span>
                <span className="text-sm font-bold text-amber-400">{totalPendingActions}</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium text-white/80">Data Sync</span>
                <span className="text-xs font-semibold text-white/60">Just now</span>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-white text-[#022C4F] rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg">
              View Project Portfolio
            </button>
            <div className="mt-3 flex flex-col gap-2">
              <button className="w-full py-2.5 border border-white/20 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors">
                Review Pending Approvals
              </button>
              <button className="w-full py-2.5 border border-white/20 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors">
                Schedule Inspection
              </button>
              <button className="w-full py-2.5 border border-white/20 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors">
                Open Site Monitoring
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2"><BarChart size={16} /> Performance Snapshot</h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">Projects On Schedule</span>
                  <span className="text-sm font-bold text-emerald-600">{projectsOnSchedulePercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-emerald-500 rounded-full`} style={{ width: `${projectsOnSchedulePercentage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">Inspection Completion</span>
                  <span className="text-sm font-bold text-blue-600">{inspectionCompletionPercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-blue-500 rounded-full`} style={{ width: `${inspectionCompletionPercentage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">Compliance Rate</span>
                  <span className="text-sm font-bold text-[#022C4F]">{complianceRatePercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-[#022C4F] rounded-full`} style={{ width: `${complianceRatePercentage}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="block text-lg font-bold text-[#022C4F]">4.2<span className="text-xs">d</span></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 block line-clamp-1">Approval Time</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="block text-lg font-bold text-[#022C4F]">87%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 block line-clamp-1">Issues Resolved</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2"><History size={16} /> Recent Activity</h3>
            <div className="flex flex-col gap-0 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-slate-100">
              {recentActivities.length > 0 ? recentActivities.map((activity, idx) => (
                <div key={idx} className="flex gap-4 py-2.5 relative z-10">
                  <div className={`w-6 h-6 rounded-full border-4 border-white shrink-0 ${activity.dot} shadow-sm`}></div>
                  <div className="flex flex-col pt-0.5">
                    <span className="text-xs font-bold text-[#022C4F] leading-snug">{activity.text}</span>
                    <span className="text-[10px] font-medium text-slate-400">{activity.time}</span>
                  </div>
                </div>
              )) : (
                <div className="text-xs text-slate-500 italic py-2 ml-8">No recent activity</div>
              )}
            </div>
            <button className="mt-4 text-xs font-bold text-[#022C4F] hover:text-blue-600 transition-colors w-full text-center">View All Activity</button>
          </div>

        </div>
      </div>

      {/* Critical Alerts Modal on Login */}
      {showAlertsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900 leading-tight">Critical Alerts</h2>
                  <p className="text-sm font-medium text-red-700">Immediate attention required</p>
                </div>
              </div>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="p-2 text-red-500 hover:bg-red-200 hover:text-red-700 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              {criticalAlerts.map((alert, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${alert.style.wrapper}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.style.dot}`}></div>
                  <div className="w-full">
                    <h4 className={`text-sm font-bold mb-0.5 ${alert.style.title}`}>{alert.title}</h4>
                    <p className={`text-xs font-medium mb-3 ${alert.style.desc}`}>{alert.desc}</p>
                    <button className={`text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors w-full ${alert.style.btn}`}>{alert.action}</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowAlertsModal(false)}
                className="px-6 py-2.5 bg-[#022C4F] text-white rounded-xl text-sm font-bold hover:bg-[#033b6a] transition-all shadow-md shadow-[#022C4F]/20"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
