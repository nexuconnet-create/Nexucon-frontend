"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, Filter, ArrowUpRight, Activity, Clock, CheckCircle, AlertTriangle, 
  MapPin, Calendar, FileText, User, LayoutGrid, List, MoreVertical, ShieldCheck, Box, Eye,
  Check, FolderOpen, AlertCircle, FileSearch, FileCheck, History, FileWarning, Briefcase,
  MonitorPlay, Plus, RefreshCw, Compass, AlertOctagon, Camera, Navigation
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
import SiteVerificationDrawer from '@/components/dashboard/SiteVerificationDrawer';
import DailyPhotosGalleryModal from '@/components/dashboard/DailyPhotosGalleryModal';
import SiteProgressDetailModal from '@/components/dashboard/SiteProgressDetailModal';
import MonitoringDetailSideDrawer, { MonitoringDetailItem } from '@/components/dashboard/MonitoringDetailSideDrawer';

const TABS = [
  { id: 'live', label: 'Live Site View', icon: Eye },
  { id: 'progress', label: 'Site Progress', icon: Activity },
  { id: 'observations', label: 'Field Observations', icon: Eye },
  { id: 'issues', label: 'Site Issues', icon: AlertTriangle },
  { id: 'milestones', label: 'Construction Milestones', icon: CheckCircle },
  { id: 'verification', label: 'Site Verification', icon: ShieldCheck },
];

export default function MonitoringDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const currentStatus = (params.status as string) || 'live';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
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
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ConstructionMilestone | null>(null);
  const [isVerificationDrawerOpen, setIsVerificationDrawerOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MonitoringDetailItem | null>(null);

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
        const data = await getMilestones({ search: searchQuery });
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
  }, [currentStatus, searchQuery]);

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
          title: "Construction Milestones Schedule",
          subtitle: "Track major construction programme milestones against approved structural milestones and building code phases.",
          overview: [
            { label: "Due This Week", value: stats?.milestones?.due_this_week ?? 0, icon: Calendar, color: "amber" },
            { label: "Verified Milestones", value: stats?.milestones?.verified ?? 0, icon: ShieldCheck, color: "emerald" },
            { label: "Delayed Milestones", value: stats?.milestones?.delayed ?? 0, icon: AlertTriangle, color: "red" },
            { label: "Upcoming Phases", value: stats?.milestones?.upcoming ?? 0, icon: Clock, color: "blue" },
          ],
          actions: ["🏗 Verify Milestone", "Flag Milestone Delay", "Add Construction Milestone"]
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
    if (action.includes("View Progress Details") || action.includes("Review Progress Report") || action.includes("Progress Details")) {
      setIsProgressDetailModalOpen(true);
    } else if (action.includes("Flag Delayed Progress")) {
      setIsIssueModalOpen(true);
    } else if (action.includes("View Latest Daily Photos") || action.includes("View Latest Daily") || action.includes("Latest Daily") || action.includes("Photos")) {
      setIsPhotosGalleryOpen(true);
    } else if (action.includes("Daily Photo") || action.includes("Update Site Progress") || action.includes("Upload Daily")) {
      setIsUpdateDrawerOpen(true);
    } else if (action.includes("Field Observation")) {
      setIsObservationModalOpen(true);
    } else if (action.includes("Report Site Issue") || action.includes("Review Critical Defects")) {
      setIsIssueModalOpen(true);
    } else if (action.includes("Verify Milestone") || action.includes("Milestone")) {
      if (milestones.length > 0) {
        setSelectedMilestone(milestones[0]);
        setIsMilestoneModalOpen(true);
      } else {
        setIsUpdateDrawerOpen(true);
      }
    } else if (action.includes("Site Verification") || action.includes("Coordinates") || action.includes("Rover")) {
      setIsVerificationDrawerOpen(true);
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
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

        <div className="flex items-center justify-end shrink-0">
          <button
            onClick={() => {
              if (currentStatus === 'observations') setIsObservationModalOpen(true);
              else if (currentStatus === 'issues') setIsIssueModalOpen(true);
              else if (currentStatus === 'verification') setIsVerificationDrawerOpen(true);
              else setIsUpdateDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus size={16} /> 
            {currentStatus === 'observations' ? 'Add Observation' :
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
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-colors text-left flex items-center justify-between group"
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
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search records by project, title, ref..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button 
              onClick={fetchMonitoringData}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh"
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
              <p className="text-xs font-semibold">Loading monitoring records...</p>
            </div>
          ) : (
            <>
              {/* Tab 1 & 2: Daily Updates / Progress */}
              {(currentStatus === 'live' || currentStatus === 'progress') && (
                dailyUpdates.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Camera size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No site updates logged yet.</p>
                    <button onClick={() => setIsUpdateDrawerOpen(true)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer">
                      Publish First Update
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {dailyUpdates.map(update => (
                      <div 
                        key={update.id} 
                        onClick={() => setSelectedDetailItem({ type: 'update', data: update })}
                        className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group cursor-pointer"
                      >
                        {/* Site Photo Header */}
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          {update.photos && update.photos.length > 0 ? (
                            <img 
                              src={update.photos[0]} 
                              alt={update.project_name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                              <Camera size={32} className="mb-1 text-slate-300" />
                              <span className="text-xs font-bold">No Photos Attached</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-white/90 text-[#022C4F] backdrop-blur-sm shadow-sm">
                              {update.update_type.replace('_', ' ')}
                            </span>
                            {update.photos && update.photos.length > 1 && (
                              <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                                <Camera size={11} /> +{update.photos.length - 1}
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <h4 className="text-sm font-extrabold line-clamp-1 drop-shadow-sm">{update.project_name}</h4>
                            <p className="text-[11px] text-white/80 font-medium flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {update.project_location || 'Lagos, Nigeria'}
                            </p>
                          </div>
                        </div>

                        {/* Body Details */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {update.work_summary || 'Daily site operations and structural progress recorded.'}
                          </p>

                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                              <span>Verified Progress</span>
                              <span className="text-emerald-600 font-extrabold">{update.progress_percentage}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${update.progress_percentage}%` }} />
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <div className="flex items-center gap-1.5 font-medium">
                              <User size={12} className="text-slate-400" />
                              <span className="truncate max-w-[120px]">{update.reported_by_name?.split(' ')[0] || 'Site Lead'}</span>
                            </div>
                            <div className="flex items-center gap-1 font-semibold text-slate-400">
                              <Clock size={12} />
                              <span>{new Date(update.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {dailyUpdates.map(update => (
                      <div 
                        key={update.id} 
                        onClick={() => setSelectedDetailItem({ type: 'update', data: update })}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 w-1/3">
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPhotosGalleryOpen(true);
                            }}
                            className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                          >
                            {update.photos && update.photos.length > 0 ? (
                              <img src={update.photos[0]} alt={update.project_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-blue-600 bg-blue-50">
                                <Camera size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">
                              {update.project_name}
                            </h4>
                            <p className="text-xs text-slate-400 font-semibold">{update.update_reference} • {update.update_type.replace('_', ' ')}</p>
                          </div>
                        </div>

                        <div className="w-1/4">
                          <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                            <span>Site Progress</span>
                            <span className="text-emerald-600 font-extrabold">{update.progress_percentage}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${update.progress_percentage}%` }}></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-1/5 text-xs text-slate-500">
                          <Clock size={13} className="text-slate-400" />
                          <span>{new Date(update.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                            {update.status}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/government/dashboard/projects/view/${update.project}/monitoring`);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <ArrowUpRight size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab 3: Field Observations */}
              {currentStatus === 'observations' && (
                observations.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Eye size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No field observations recorded.</p>
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
                          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-red-600 transition-colors">{iss.title}</h4>
                            <p className="text-xs text-slate-400 font-semibold">{iss.issue_reference} • {iss.project_name}</p>
                          </div>
                        </div>

                        <div className="w-1/4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            iss.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {iss.severity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-1/5 text-xs text-slate-500">
                          <User size={13} className="text-slate-400" />
                          <span>{iss.assigned_to_name}</span>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-50 text-amber-800">
                            {iss.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab 5: Milestones */}
              {currentStatus === 'milestones' && (
                milestones.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <CheckCircle size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No milestones scheduled.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {milestones.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => setSelectedDetailItem({ type: 'milestone', data: m })}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all bg-white flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 w-1/3">
                          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-emerald-600 transition-colors">{m.name}</h4>
                            <p className="text-xs text-slate-400 font-semibold">{m.project_name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-1/4 text-xs text-slate-500">
                          <Calendar size={13} className="text-slate-400" />
                          <span>Target: {new Date(m.target_date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            m.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                            m.status === 'DELAYED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.status}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMilestone(m);
                              setIsMilestoneModalOpen(true);
                            }}
                            className="px-3 py-1 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                          >
                            Audit & Sign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
          }
        }}
      />
    </div>
  );
}

