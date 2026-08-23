"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, Filter, ArrowUpRight, Activity, Clock, CheckCircle, AlertTriangle, 
  MapPin, Calendar, FileText, User, LayoutGrid, List, MoreVertical, ShieldCheck, Box, Eye,
  Check, FolderOpen, AlertCircle, FileSearch, FileCheck, History, FileWarning, Briefcase,
  MonitorPlay, Plus, RefreshCw, Compass, AlertOctagon, Camera, Navigation, Gavel,
  Layers, ChevronRight, BarChart2, GitCommit, Lock
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import TopRightControls from "@/components/dashboard/TopRightControls";
import {
  getDailySiteUpdates, getFieldObservations, getSiteIssues,
  getMilestones, getSiteVerifications, getMonitoringStats,
  DailySiteUpdate, FieldObservation, SiteIssue,
  ConstructionMilestone, SiteVerification, MonitoringStats
} from '@/services/monitoring';
import CreateDailyUpdateDrawer from '@/components/dashboard/CreateDailyUpdateDrawer';
import CreateObservationModal from '@/components/dashboard/CreateObservationModal';
import ReportIssueModal from '@/components/dashboard/ReportIssueModal';
import VerifyMilestoneModal from '@/components/dashboard/VerifyMilestoneModal';
import CreateMilestoneModal from '@/components/dashboard/CreateMilestoneModal';
import UpdateMilestoneProgressModal from '@/components/dashboard/UpdateMilestoneProgressModal';
import FlagMilestoneDelayModal from '@/components/dashboard/FlagMilestoneDelayModal';
import MilestoneDetailDrawer from '@/components/dashboard/MilestoneDetailDrawer';
import SiteVerificationDrawer from '@/components/dashboard/SiteVerificationDrawer';
import DailyPhotosGalleryModal from '@/components/dashboard/DailyPhotosGalleryModal';
import SiteProgressDetailModal from '@/components/dashboard/SiteProgressDetailModal';
import MonitoringDetailSideDrawer, { MonitoringDetailItem } from '@/components/dashboard/MonitoringDetailSideDrawer';
import IssueStopWorkModal from '@/components/dashboard/IssueStopWorkModal';
import ReviewCriticalDefectsDrawer from '@/components/dashboard/ReviewCriticalDefectsDrawer';
import EscalateToDirectorateModal from '@/components/dashboard/EscalateToDirectorateModal';

const TABS = [
  { id: 'live', label: 'Live Site View', icon: Eye },
  { id: 'progress', label: 'Site Progress', icon: Activity },
  { id: 'observations', label: 'Field Observations', icon: Eye },
  { id: 'issues', label: 'Site Issues', icon: AlertTriangle },
  { id: 'milestones', label: 'Construction Milestones', icon: CheckCircle },
  { id: 'verification', label: 'Site Verification', icon: ShieldCheck },
];

const PHASE_FILTERS = [
  { id: 'ALL', label: 'All Phases' },
  { id: 'SUBSTRUCTURE', label: 'Substructure' },
  { id: 'STRUCTURAL_FRAME', label: 'Structural Frame' },
  { id: 'SUPERSTRUCTURE', label: 'Superstructure' },
  { id: 'MEP_ROUGHIN', label: 'MEP Rough-in' },
  { id: 'FACADE_ENVELOPE', label: 'Facade & Cladding' },
  { id: 'FINISHES', label: 'Finishes' },
  { id: 'COMMISSIONING', label: 'Commissioning' },
];

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'DUE_THIS_WEEK', label: 'Due This Week' },
  { id: 'PENDING_VERIFICATION', label: 'Pending Verification' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'VERIFIED', label: 'Verified' },
  { id: 'DELAYED', label: 'Delayed' },
  { id: 'BLOCKED', label: 'Blocked' },
  { id: 'PLANNED', label: 'Planned' },
];

export default function MonitoringDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const currentStatus = (params.status as string) || 'live';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [milestoneLayout, setMilestoneLayout] = useState<'list' | 'grid' | 'timeline'>('list');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [dailyUpdates, setDailyUpdates] = useState<DailySiteUpdate[]>([]);
  const [observations, setObservations] = useState<FieldObservation[]>([]);
  const [issues, setIssues] = useState<SiteIssue[]>([]);
  const [milestones, setMilestones] = useState<ConstructionMilestone[]>([]);
  const [verifications, setVerifications] = useState<SiteVerification[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);

  // Modals & Drawers
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);
  const [isPhotosGalleryOpen, setIsPhotosGalleryOpen] = useState(false);
  const [isProgressDetailModalOpen, setIsProgressDetailModalOpen] = useState(false);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  
  // Milestone Modals & Drawers
  const [isCreateMilestoneModalOpen, setIsCreateMilestoneModalOpen] = useState(false);
  const [isUpdateProgressModalOpen, setIsUpdateProgressModalOpen] = useState(false);
  const [isFlagDelayModalOpen, setIsFlagDelayModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isMilestoneDetailDrawerOpen, setIsMilestoneDetailDrawerOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ConstructionMilestone | null>(null);

  const [isVerificationDrawerOpen, setIsVerificationDrawerOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MonitoringDetailItem | null>(null);
  const [isStopWorkModalOpen, setIsStopWorkModalOpen] = useState(false);
  const [selectedProjectForStopWork, setSelectedProjectForStopWork] = useState<any>(null);
  const [isCriticalDefectsDrawerOpen, setIsCriticalDefectsDrawerOpen] = useState(false);
  const [isEscalateDirectorateModalOpen, setIsEscalateDirectorateModalOpen] = useState(false);
  const [selectedIssueForEscalation, setSelectedIssueForEscalation] = useState<SiteIssue | null>(null);

  const fetchMonitoringData = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsRes = await getMonitoringStats();
      setStats(statsRes);

      if (currentStatus === 'live' || currentStatus === 'progress') {
        const data = await getDailySiteUpdates({ search: searchQuery });
        setDailyUpdates(data);
      } else if (currentStatus === 'observations') {
        const data = await getFieldObservations({ search: searchQuery });
        setObservations(data);
      } else if (currentStatus === 'issues') {
        const data = await getSiteIssues({ search: searchQuery });
        setIssues(data);
      } else if (currentStatus === 'milestones') {
        const data = await getMilestones({ 
          search: searchQuery,
          phase: selectedPhaseFilter !== 'ALL' ? selectedPhaseFilter : undefined,
          status: selectedStatusFilter !== 'ALL' ? selectedStatusFilter : undefined
        });
        setMilestones(data);
      } else if (currentStatus === 'verification') {
        const data = await getSiteVerifications({ search: searchQuery });
        setVerifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch monitoring data", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus, searchQuery, selectedPhaseFilter, selectedStatusFilter]);

  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  // Page content definition based on current tab
  const getPageContent = () => {
    switch (currentStatus) {
      case 'progress':
        return {
          title: "Site Progress & Programme",
          subtitle: "Monitor physical construction progress against approved project schedules and reported milestone completion.",
          overview: [
            { label: "On Schedule Sites", value: stats?.progress?.on_schedule ?? 0, icon: CheckCircle, color: "emerald" },
            { label: "Delayed Milestones", value: stats?.progress?.delayed ?? 0, icon: AlertCircle, color: "red" },
            { label: "Milestones Reached", value: stats?.progress?.milestone_reached ?? 0, icon: Activity, color: "blue" },
            { label: "Progress Reports", value: stats?.progress?.progress_reports ?? dailyUpdates.length, icon: FileText, color: "slate" },
          ],
          actions: ["📊 Update Site Progress", "View Progress Details", "Flag Delayed Progress", "Review Progress Report"]
        };
      case 'observations':
        return {
          title: "Field Observations",
          subtitle: "Centralized record of observations captured during government site visits, audits, and monitoring activities.",
          overview: [
            { label: "Active Observations", value: stats?.observations?.active ?? observations.length, icon: Eye, color: "blue" },
            { label: "Quality Points", value: stats?.observations?.quality ?? 0, icon: ShieldCheck, color: "orange" },
            { label: "Safety Concerns", value: stats?.observations?.safety ?? 0, icon: AlertTriangle, color: "red" },
            { label: "Resolved", value: stats?.observations?.resolved ?? 0, icon: CheckCircle, color: "emerald" },
          ],
          actions: ["📝 Add Field Observation", "Create Corrective Action", "Review Open Findings"]
        };
      case 'issues':
        return {
          title: "Site Issues & Regulatory Defects",
          subtitle: "Track construction defects, safety risks, non-conformances, and deviations requiring government resolution.",
          overview: [
            { label: "Open Issues", value: stats?.issues?.open ?? issues.length, icon: FolderOpen, color: "amber" },
            { label: "Critical Severity", value: stats?.issues?.critical ?? 0, icon: AlertCircle, color: "red" },
            { label: "Under Review", value: stats?.issues?.under_review ?? 0, icon: Clock, color: "blue" },
            { label: "Resolved Issues", value: stats?.issues?.resolved ?? 0, icon: CheckCircle, color: "emerald" },
          ],
          actions: ["⚠️ Report Site Issue", "Review Critical Defects", "Escalate to Directorate"]
        };
      case 'milestones':
        return {
          title: "Construction Milestones Programme",
          subtitle: "Statutory construction milestone schedule, verification gate enforcement, test evidence audit, and BIM tolerance tracking.",
          overview: [
            { label: "Total Milestones", value: stats?.milestones?.total ?? milestones.length, icon: Layers, color: "slate" },
            { label: "Due This Week", value: stats?.milestones?.due_this_week ?? 0, icon: Calendar, color: "amber" },
            { label: "Pending Verification", value: stats?.milestones?.pending_verification ?? 0, icon: ShieldCheck, color: "purple" },
            { label: "Statutory Verified", value: stats?.milestones?.verified ?? 0, icon: CheckCircle, color: "emerald" },
            { label: "Delayed / Blocked", value: (stats?.milestones?.delayed ?? 0) + (stats?.milestones?.blocked ?? 0), icon: AlertTriangle, color: "red" },
          ],
          actions: [
            "➕ Add Construction Milestone", 
            "🏗 Verify Milestone", 
            "📊 Update Milestone Progress", 
            "🚩 Flag Milestone Delay",
            "Review Critical Defects"
          ]
        };
      case 'verification':
        return {
          title: "Site Verification & GNSS Boundary",
          subtitle: "Verify physical site conditions, project coordinates, and construction boundaries with GNSS RTK rover telemetry.",
          overview: [
            { label: "Pending Verification", value: stats?.verification?.pending ?? 0, icon: Clock, color: "amber" },
            { label: "Verified Coordinates", value: stats?.verification?.verified ?? 0, icon: CheckCircle, color: "emerald" },
            { label: "Variance Detected", value: stats?.verification?.variance_detected ?? 0, icon: AlertTriangle, color: "red" },
            { label: "Active Rovers", value: stats?.verification?.active_devices ?? 0, icon: Activity, color: "blue" },
          ],
          actions: ["📐 Start Site Verification", "Capture Coordinates", "Calibrate Rover Positioning"]
        };
      default: // live
        return {
          title: "Live Site View (Daily Updates)",
          subtitle: "Monitor daily photo updates from site supervisors and scheduled comprehensive drone and Trimble surveys.",
          overview: [
            { label: "Active Sites", value: stats?.live?.active_sites ?? 0, icon: Activity, color: "emerald" },
            { label: "Daily Photos Uploaded", value: stats?.live?.daily_photos ?? dailyUpdates.length, icon: Clock, color: "blue" },
            { label: "Drone Surveys", value: stats?.live?.drone_surveys ?? 0, icon: MapPin, color: "purple" },
            { label: "Active Observations", value: stats?.live?.active_observations ?? 0, icon: Eye, color: "indigo" },
          ],
          actions: ["📍 View Latest Daily Photos", "Upload Daily Site Update", "Add Field Observation", "Report Site Issue"]
        };
    }
  };

  const content = getPageContent();

  const handleQuickAction = (action: string) => {
    if (action.includes("Add Construction Milestone") || action.includes("Schedule Milestone")) {
      setIsCreateMilestoneModalOpen(true);
    } else if (action.includes("Update Milestone Progress")) {
      const candidate = milestones.find(m => m.status !== 'VERIFIED') || milestones[0];
      if (candidate) {
        setSelectedMilestone(candidate);
        setIsUpdateProgressModalOpen(true);
      } else {
        setIsCreateMilestoneModalOpen(true);
      }
    } else if (action.includes("Flag Milestone Delay")) {
      const candidate = milestones.find(m => m.status !== 'VERIFIED') || milestones[0];
      if (candidate) {
        setSelectedMilestone(candidate);
        setIsFlagDelayModalOpen(true);
      } else {
        setIsCreateMilestoneModalOpen(true);
      }
    } else if (action.includes("Verify Milestone") || (currentStatus === 'milestones' && action.includes("Verify"))) {
      const candidate = milestones.find(m => m.status === 'PENDING_VERIFICATION' || m.status === 'DUE_THIS_WEEK' || m.status === 'IN_PROGRESS') || milestones[0];
      if (candidate) {
        setSelectedMilestone(candidate);
        setIsMilestoneModalOpen(true);
      } else {
        setIsCreateMilestoneModalOpen(true);
      }
    } else if (action.includes("Review Critical Defects") || action.includes("Critical Defects")) {
      setIsCriticalDefectsDrawerOpen(true);
    } else if (action.includes("Escalate to Directorate") || action.includes("Directorate")) {
      setSelectedIssueForEscalation(null);
      setIsEscalateDirectorateModalOpen(true);
    } else if (action.includes("View Progress Details") || action.includes("Review Progress Report") || action.includes("Progress Details")) {
      setIsProgressDetailModalOpen(true);
    } else if (action.includes("Flag Delayed Progress")) {
      setIsIssueModalOpen(true);
    } else if (action.includes("View Latest Daily Photos") || action.includes("View Latest Daily") || action.includes("Latest Daily") || action.includes("Photos")) {
      setIsPhotosGalleryOpen(true);
    } else if (action.includes("Daily Photo") || action.includes("Update Site Progress") || action.includes("Upload Daily")) {
      setIsUpdateDrawerOpen(true);
    } else if (action.includes("Field Observation")) {
      setIsObservationModalOpen(true);
    } else if (action.includes("Report Site Issue")) {
      setIsIssueModalOpen(true);
    } else if (action.includes("Site Verification") || action.includes("Coordinates") || action.includes("Rover")) {
      setIsVerificationDrawerOpen(true);
    }
  };

  const getMilestoneStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING_VERIFICATION':
        return 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse';
      case 'DUE_THIS_WEEK':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELAYED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'BLOCKED':
        return 'bg-red-600 text-white border-red-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <MonitorPlay size={20} />
            </div>
            <h1 className="text-[32px] font-bold text-[#022C4F] leading-tight">
              Site Monitoring Workspace
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
            return (
              <button
                key={tab.id}
                onClick={() => router.push(`/government/dashboard/monitoring/${tab.id}`)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#022C4F] text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentStatus === 'milestones' && (
            <button
              onClick={() => {
                const candidate = milestones.find(m => m.status === 'PENDING_VERIFICATION' || m.status === 'DUE_THIS_WEEK' || m.status === 'IN_PROGRESS') || milestones[0];
                if (candidate) {
                  setSelectedMilestone(candidate);
                  setIsMilestoneModalOpen(true);
                } else {
                  setIsCreateMilestoneModalOpen(true);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <ShieldCheck size={16} /> 
              Verify Milestone
            </button>
          )}

          <button
            onClick={() => {
              if (currentStatus === 'milestones') setIsCreateMilestoneModalOpen(true);
              else if (currentStatus === 'observations') setIsObservationModalOpen(true);
              else if (currentStatus === 'issues') setIsIssueModalOpen(true);
              else if (currentStatus === 'verification') setIsVerificationDrawerOpen(true);
              else setIsUpdateDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus size={16} /> 
            {currentStatus === 'milestones' ? 'Schedule Milestone' :
             currentStatus === 'observations' ? 'Add Observation' :
             currentStatus === 'issues' ? 'Report Issue' :
             currentStatus === 'verification' ? 'Start Verification' : 'Publish Daily Update'}
          </button>
        </div>
      </div>

      {/* Dynamic Content Grid */}
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

        {/* Action Panel (Zero Dead Buttons) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2">
            <MonitorPlay size={18} /> Quick Actions
          </h3>
          <div className="flex flex-col gap-2 mt-auto">
            {content.actions.map((action, idx) => (
              <button 
                key={idx} 
                onClick={() => handleQuickAction(action)}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-colors text-left flex items-center justify-between group cursor-pointer"
              >
                {action}
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Monitoring List / Grid Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
            <Activity size={18} /> {content.title}
          </h2>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records..."
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
              />
            </div>

            {/* Layout Toggles for Milestones */}
            {currentStatus === 'milestones' ? (
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
                <button
                  onClick={() => setMilestoneLayout('list')}
                  title="Audit Register (Table)"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    milestoneLayout === 'list' ? 'bg-slate-100 text-[#022C4F] font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => setMilestoneLayout('grid')}
                  title="Interactive Cards (Grid)"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    milestoneLayout === 'grid' ? 'bg-slate-100 text-[#022C4F] font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setMilestoneLayout('timeline')}
                  title="Gantt Stage Sequencer"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    milestoneLayout === 'timeline' ? 'bg-slate-100 text-[#022C4F] font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <GitCommit size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-slate-100 text-[#022C4F]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-slate-100 text-[#022C4F]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            )}

            <button
              onClick={() => fetchMonitoringData()}
              title="Refresh Records"
              className="p-2 text-slate-500 hover:text-[#022C4F] hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Construction Milestones Filter Bar */}
        {currentStatus === 'milestones' && (
          <div className="p-3 border-b border-slate-100 bg-white space-y-2">
            {/* Phase Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Phase:</span>
              {PHASE_FILTERS.map(ph => (
                <button
                  key={ph.id}
                  onClick={() => setSelectedPhaseFilter(ph.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedPhaseFilter === ph.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ph.label}
                </button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Status:</span>
              {STATUS_FILTERS.map(st => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStatusFilter === st.id
                      ? 'bg-[#022C4F] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Render Area */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="animate-spin text-blue-600" size={32} />
              <p className="text-sm font-semibold">Loading live monitoring telemetry...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Live Site View */}
              {currentStatus === 'live' && (
                dailyUpdates.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Camera size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No daily site updates recorded yet.</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                    {dailyUpdates.map(update => (
                      <div 
                        key={update.id} 
                        onClick={() => setSelectedDetailItem({ type: 'update', data: update })}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 w-1/3">
                          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            {update.update_type === 'DRONE_SURVEY' ? <MapPin size={20} /> : <Camera size={20} />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">{update.project_name}</h4>
                            <p className="text-xs text-slate-400 font-semibold">{update.site_weather} • {update.active_workers_count} Workers</p>
                          </div>
                        </div>

                        <div className="w-1/4">
                          <p className="text-xs text-slate-600 font-medium line-clamp-1">{update.work_summary || 'Daily progress logged'}</p>
                        </div>

                        <div className="flex items-center gap-2 w-1/5 text-xs text-slate-500">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{new Date(update.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {update.update_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab 2: Site Progress */}
              {currentStatus === 'progress' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="text-blue-600" size={20} />
                      <div>
                        <h4 className="text-xs font-bold text-[#022C4F]">Programme Progress vs Statutory Milestones</h4>
                        <p className="text-[11px] text-slate-500">Track real-time stage completion across active high-rise and residential developments.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsUpdateDrawerOpen(true)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Update Site Progress
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {milestones.map(m => (
                      <div 
                        key={m.id}
                        onClick={() => {
                          setSelectedMilestone(m);
                          setIsMilestoneDetailDrawerOpen(true);
                        }}
                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all space-y-3 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-blue-700 font-mono">
                              {m.milestone_code || `MS-${(m.id || '').substring(0, 4).toUpperCase() || '01'}`}
                            </span>
                            <h4 className="text-sm font-black text-[#022C4F] group-hover:text-blue-600 transition-colors">{m.name}</h4>
                            <p className="text-xs text-slate-500 font-semibold">{m.project_name}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getMilestoneStatusBadge(m.status || 'PLANNED')}`}>
                            {(m.status || 'PLANNED').replace('_', ' ')}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Progress</span>
                            <span className="text-blue-700 font-black">{m.progress_percentage}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                m.status === 'VERIFIED' ? 'bg-emerald-500' :
                                m.status === 'DELAYED' ? 'bg-rose-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${m.progress_percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            <span>Target: {new Date(m.target_date).toLocaleDateString()}</span>
                          </div>
                          <span className="text-[11px] font-bold text-blue-600 group-hover:underline">
                            Inspect Gate & Telemetry →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Field Observations */}
              {currentStatus === 'observations' && (
                observations.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Eye size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No field observations captured yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {observations.map(obs => (
                      <div 
                        key={obs.id} 
                        onClick={() => setSelectedDetailItem({ type: 'observation', data: obs })}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all bg-white flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 w-1/3">
                          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                            <Eye size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-orange-600 transition-colors">{obs.title}</h4>
                            <p className="text-xs text-slate-400 font-semibold">{obs.observation_reference} • {obs.project_name}</p>
                          </div>
                        </div>

                        <div className="w-1/4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            obs.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                            obs.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            obs.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {obs.severity} Severity
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-1/5 text-xs text-slate-500">
                          <Clock size={13} className="text-slate-400" />
                          <span>{new Date(obs.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {obs.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab 4: Site Issues */}
              {currentStatus === 'issues' && (
                issues.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <AlertTriangle size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No site issues reported.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {issues.map(iss => (
                      <div 
                        key={iss.id} 
                        onClick={() => setSelectedDetailItem({ type: 'issue', data: iss })}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-red-200 hover:shadow-md transition-all bg-white flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 w-1/3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            iss.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-red-50 text-red-600'
                          }`}>
                            <AlertTriangle size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-red-600 transition-colors">{iss.title}</h4>
                              {iss.is_escalated && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-0.5">
                                  <Gavel size={9} /> Escalated
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-semibold">{iss.issue_reference} • {iss.project_name}</p>
                          </div>
                        </div>

                        <div className="w-1/5">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            iss.severity === 'CRITICAL' ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30' : 
                            iss.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {iss.severity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-1/5 text-xs text-slate-500">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{iss.assigned_to_name || 'Site Engineer'}</span>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            iss.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {iss.status}
                          </span>

                          {!iss.is_escalated && iss.status !== 'RESOLVED' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIssueForEscalation(iss);
                                setIsEscalateDirectorateModalOpen(true);
                              }}
                              title="Escalate to Directorate"
                              className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                            >
                              <Gavel size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProjectForStopWork({
                                id: iss.project,
                                name: iss.project_name
                              });
                              setIsStopWorkModalOpen(true);
                            }}
                            title="Issue Stop-Work Order"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                          >
                            <AlertOctagon size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab 5: Construction Milestones */}
              {currentStatus === 'milestones' && (
                milestones.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <CheckCircle size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No milestones match selected filter criteria.</p>
                    <button
                      onClick={() => setIsCreateMilestoneModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      ➕ Schedule New Milestone
                    </button>
                  </div>
                ) : (
                  <>
                    {/* LAYOUT 1: Audit Register Table */}
                    {milestoneLayout === 'list' && (
                      <div className="flex flex-col gap-3">
                        {milestones.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => {
                              setSelectedMilestone(m);
                              setIsMilestoneDetailDrawerOpen(true);
                            }}
                            className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer"
                          >
                            {/* Col 1: Code & Name */}
                            <div className="flex items-center gap-3.5 md:w-1/3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                                m.status === 'VERIFIED' ? 'bg-emerald-600 shadow-emerald-600/20' :
                                m.status === 'DELAYED' ? 'bg-rose-600 shadow-rose-600/20' :
                                m.status === 'BLOCKED' ? 'bg-red-700 shadow-red-700/20' : 'bg-[#022C4F]'
                              }`}>
                                {m.status === 'VERIFIED' ? <ShieldCheck size={20} /> :
                                 m.status === 'DELAYED' ? <AlertTriangle size={20} /> : <Layers size={20} />}
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                                    {m.milestone_code || `MS-${(m.id || '').substring(0, 4).toUpperCase() || '01'}`}
                                  </span>
                                  {m.critical_path && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                                      Critical Path
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-black text-[#022C4F] group-hover:text-blue-600 transition-colors truncate mt-0.5">
                                  {m.name}
                                </h4>
                                <p className="text-xs text-slate-400 font-semibold truncate">{m.project_name}</p>
                              </div>
                            </div>

                            {/* Col 2: Phase & Dates */}
                            <div className="md:w-1/4 space-y-1 text-xs">
                              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                                <Layers size={13} className="text-slate-400" />
                                <span>{m.phase || 'SUPERSTRUCTURE'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                <Calendar size={13} className="text-slate-400" />
                                <span>Target: {new Date(m.target_date).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Col 3: Progress Bar */}
                            <div className="md:w-1/4 space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500">Progress</span>
                                <span className="text-blue-700 font-black">{m.progress_percentage}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    m.status === 'VERIFIED' ? 'bg-emerald-500' :
                                    m.status === 'DELAYED' ? 'bg-rose-500' :
                                    m.status === 'BLOCKED' ? 'bg-red-600' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${m.progress_percentage}%` }}
                                />
                              </div>
                            </div>

                            {/* Col 4: Status & Actions */}
                            <div className="md:w-1/4 flex items-center justify-between md:justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${getMilestoneStatusBadge(m.status || 'PLANNED')}`}>
                                {(m.status || 'PLANNED').replace('_', ' ')}
                              </span>

                              <div className="flex items-center gap-1">
                                {m.status !== 'VERIFIED' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedMilestone(m);
                                      setIsMilestoneModalOpen(true);
                                    }}
                                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                    title="Verify Milestone"
                                  >
                                    <ShieldCheck size={16} />
                                  </button>
                                ) : (
                                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700" title="Verified & Certified">
                                    <CheckCircle size={16} />
                                  </span>
                                )}

                                <button
                                  onClick={() => {
                                    setSelectedMilestone(m);
                                    setIsMilestoneDetailDrawerOpen(true);
                                  }}
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                  title="View Details"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* LAYOUT 2: Interactive Grid Cards */}
                    {milestoneLayout === 'grid' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {milestones.map(m => (
                          <div 
                            key={m.id}
                            onClick={() => {
                              setSelectedMilestone(m);
                              setIsMilestoneDetailDrawerOpen(true);
                            }}
                            className="p-5 rounded-3xl border border-slate-200/90 bg-white hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                  {m.milestone_code || `MS-${(m.id || '').substring(0, 4).toUpperCase() || '01'}`}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getMilestoneStatusBadge(m.status || 'PLANNED')}`}>
                                  {(m.status || 'PLANNED').replace('_', ' ')}
                                </span>
                              </div>

                              <div>
                                <h4 className="text-sm font-black text-[#022C4F] group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {m.name}
                                </h4>
                                <p className="text-xs text-slate-400 font-semibold line-clamp-1 mt-0.5">
                                  {m.project_name}
                                </p>
                              </div>

                              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                  <span>Physical Progress</span>
                                  <span className="text-blue-700 font-black">{m.progress_percentage}%</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      m.status === 'VERIFIED' ? 'bg-emerald-500' :
                                      m.status === 'DELAYED' ? 'bg-rose-500' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${m.progress_percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 space-y-3">
                              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>Target: <strong>{new Date(m.target_date).toLocaleDateString()}</strong></span>
                                <span className="text-[10px] font-black uppercase text-slate-400">{m.phase}</span>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setSelectedMilestone(m);
                                    setIsMilestoneDetailDrawerOpen(true);
                                  }}
                                  className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors text-center"
                                >
                                  View Details
                                </button>
                                {m.status !== 'VERIFIED' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedMilestone(m);
                                      setIsMilestoneModalOpen(true);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-all"
                                  >
                                    <ShieldCheck size={14} /> Verify
                                  </button>
                                ) : (
                                  <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                                    <CheckCircle size={13} /> Certified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* LAYOUT 3: Timeline Stage Sequencer */}
                    {milestoneLayout === 'timeline' && (
                      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 my-4 ml-4">
                        {milestones.map((m, idx) => (
                          <div 
                            key={m.id}
                            onClick={() => {
                              setSelectedMilestone(m);
                              setIsMilestoneDetailDrawerOpen(true);
                            }}
                            className="relative group cursor-pointer"
                          >
                            {/* Dot indicator */}
                            <div className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${
                              m.status === 'VERIFIED' ? 'bg-emerald-600 ring-4 ring-emerald-100' :
                              m.status === 'DELAYED' ? 'bg-rose-600 ring-4 ring-rose-100' :
                              m.status === 'BLOCKED' ? 'bg-red-700 ring-4 ring-red-100' : 'bg-blue-600 ring-4 ring-blue-100'
                            }`}>
                              {idx + 1}
                            </div>

                            <div className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                      {m.milestone_code || `MS-${(m.id || '').substring(0, 4).toUpperCase() || '01'}`}
                                    </span>
                                    <span className="text-xs font-black text-slate-400 uppercase">{m.phase || 'SUPERSTRUCTURE'}</span>
                                    {m.critical_path && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800">
                                        Critical Path
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-base font-black text-[#022C4F] group-hover:text-blue-600 transition-colors mt-1">
                                    {m.name}
                                  </h4>
                                </div>

                                <span className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase border self-start ${getMilestoneStatusBadge(m.status || 'PLANNED')}`}>
                                  {(m.status || 'PLANNED').replace('_', ' ')}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {m.description || m.physical_progress_notes || 'Statutory construction phase.'}
                              </p>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Date</span>
                                  <span className="font-bold text-slate-800">{new Date(m.target_date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Progress</span>
                                  <span className="font-bold text-blue-700">{m.progress_percentage}%</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Risk Level</span>
                                  <span className="font-bold text-slate-800">{m.risk_level}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Evidence Docs</span>
                                  <span className="font-bold text-slate-800">{(m.evidence_documents || []).length} Attached</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )
              )}

              {/* Tab 6: Site Verification */}
              {currentStatus === 'verification' && (
                verifications.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Compass size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No site verifications recorded yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {verifications.map(vrf => (
                      <div 
                        key={vrf.id} 
                        onClick={() => setSelectedDetailItem({ type: 'verification', data: vrf })}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 w-1/3">
                          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Compass size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">{vrf.project_name}</h4>
                            <p className="text-xs text-slate-400 font-semibold">{vrf.verification_reference} • {vrf.method}</p>
                          </div>
                        </div>

                        <div className="w-1/4">
                          <p className="text-[11px] font-bold text-slate-700">
                            Variance: <span className={vrf.variance_detected ? 'text-rose-600' : 'text-emerald-600'}>{vrf.variance_meters}m</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">{vrf.device_identifier}</p>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            vrf.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                            vrf.status === 'VARIANCE_DETECTED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {vrf.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal & Drawer Components */}
      <CreateMilestoneModal
        isOpen={isCreateMilestoneModalOpen}
        onClose={() => setIsCreateMilestoneModalOpen(false)}
        onSuccess={() => fetchMonitoringData()}
      />

      <UpdateMilestoneProgressModal
        isOpen={isUpdateProgressModalOpen}
        onClose={() => setIsUpdateProgressModalOpen(false)}
        milestone={selectedMilestone}
        onSuccess={() => fetchMonitoringData()}
      />

      <FlagMilestoneDelayModal
        isOpen={isFlagDelayModalOpen}
        onClose={() => setIsFlagDelayModalOpen(false)}
        milestone={selectedMilestone}
        onSuccess={() => fetchMonitoringData()}
      />

      <MilestoneDetailDrawer
        isOpen={isMilestoneDetailDrawerOpen}
        onClose={() => setIsMilestoneDetailDrawerOpen(false)}
        milestone={selectedMilestone}
        onVerify={(m) => {
          setSelectedMilestone(m);
          setIsMilestoneModalOpen(true);
        }}
        onUpdateProgress={(m) => {
          setSelectedMilestone(m);
          setIsUpdateProgressModalOpen(true);
        }}
        onFlagDelay={(m) => {
          setSelectedMilestone(m);
          setIsFlagDelayModalOpen(true);
        }}
      />

      <CreateDailyUpdateDrawer
        isOpen={isUpdateDrawerOpen}
        onClose={() => setIsUpdateDrawerOpen(false)}
        onSuccess={(newUpdate) => {
          if (newUpdate) {
            setDailyUpdates(prev => [newUpdate, ...prev]);
            setStats(prev => prev ? ({
              ...prev,
              live: {
                ...prev.live,
                daily_photos: prev.live.daily_photos + (newUpdate.photos?.length || 1),
                drone_surveys: newUpdate.update_type === 'DRONE_SURVEY' ? prev.live.drone_surveys + 1 : prev.live.drone_surveys
              },
              progress: {
                ...prev.progress,
                progress_reports: prev.progress.progress_reports + 1
              }
            }) : prev);
          }
          fetchMonitoringData();
        }}
      />

      <CreateObservationModal
        isOpen={isObservationModalOpen}
        onClose={() => setIsObservationModalOpen(false)}
        onSuccess={(newObs) => {
          if (newObs) {
            setObservations(prev => [newObs, ...prev]);
            setStats(prev => prev ? ({
              ...prev,
              live: {
                ...prev.live,
                active_observations: prev.live.active_observations + 1
              },
              observations: {
                ...prev.observations,
                active: prev.observations.active + 1,
                quality: newObs.category === 'QUALITY' ? prev.observations.quality + 1 : prev.observations.quality,
                safety: newObs.category === 'SAFETY' ? prev.observations.safety + 1 : prev.observations.safety
              }
            }) : prev);
          }
          fetchMonitoringData();
        }}
      />

      <ReportIssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={(newIssue) => {
          if (newIssue) {
            setIssues(prev => [newIssue, ...prev]);
            setStats(prev => prev ? ({
              ...prev,
              issues: {
                ...prev.issues,
                open: prev.issues.open + 1,
                critical: newIssue.severity === 'CRITICAL' ? prev.issues.critical + 1 : prev.issues.critical
              }
            }) : prev);
          }
          fetchMonitoringData();
        }}
      />

      <VerifyMilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        milestone={selectedMilestone}
        onSuccess={fetchMonitoringData}
      />

      <SiteVerificationDrawer
        isOpen={isVerificationDrawerOpen}
        onClose={() => setIsVerificationDrawerOpen(false)}
        onSuccess={fetchMonitoringData}
      />

      <DailyPhotosGalleryModal
        isOpen={isPhotosGalleryOpen}
        onClose={() => setIsPhotosGalleryOpen(false)}
        updates={dailyUpdates}
        onUploadNew={() => setIsUpdateDrawerOpen(true)}
      />

      <SiteProgressDetailModal
        isOpen={isProgressDetailModalOpen}
        onClose={() => setIsProgressDetailModalOpen(false)}
        onUpdateProgress={() => setIsUpdateDrawerOpen(true)}
        onViewPhotos={() => setIsPhotosGalleryOpen(true)}
        onFlagDelay={() => setIsIssueModalOpen(true)}
      />

      <MonitoringDetailSideDrawer
        isOpen={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        item={selectedDetailItem}
        onAction={(action, payload) => {
          if (action === 'VIEW_PHOTOS') {
            setIsPhotosGalleryOpen(true);
          } else if (action === 'VERIFY_MILESTONE') {
            setSelectedMilestone(payload);
            setIsMilestoneModalOpen(true);
          } else if (action === 'ISSUE_STOP_WORK') {
            setSelectedProjectForStopWork({
              id: payload.project,
              name: payload.project_name
            });
            setIsStopWorkModalOpen(true);
          } else if (action === 'ESCALATE_DIRECTORATE') {
            setSelectedIssueForEscalation(payload);
            setIsEscalateDirectorateModalOpen(true);
          } else if (action === 'REVIEW_CRITICAL') {
            setIsCriticalDefectsDrawerOpen(true);
          }
        }}
      />

      <IssueStopWorkModal
        isOpen={isStopWorkModalOpen}
        onClose={() => setIsStopWorkModalOpen(false)}
        project={selectedProjectForStopWork}
        onSuccess={() => {
          fetchMonitoringData();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Stop-Work Order enforced. Site suspended & registered in Stop-Work Registry!', type: 'success' }
          }));
        }}
      />

      <ReviewCriticalDefectsDrawer
        isOpen={isCriticalDefectsDrawerOpen}
        onClose={() => setIsCriticalDefectsDrawerOpen(false)}
        issues={issues}
        onEscalateIssue={(iss) => {
          setSelectedIssueForEscalation(iss);
          setIsEscalateDirectorateModalOpen(true);
        }}
        onStopWorkOrder={(iss) => {
          setSelectedProjectForStopWork({
            id: iss.project,
            name: iss.project_name
          });
          setIsStopWorkModalOpen(true);
        }}
        onRefresh={fetchMonitoringData}
      />

      <EscalateToDirectorateModal
        isOpen={isEscalateDirectorateModalOpen}
        onClose={() => {
          setIsEscalateDirectorateModalOpen(false);
          setSelectedIssueForEscalation(null);
        }}
        issue={selectedIssueForEscalation}
        issuesList={issues}
        onSuccess={() => {
          fetchMonitoringData();
        }}
      />
    </div>
  );
}
