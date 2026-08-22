"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, Filter, ArrowUpRight, Activity, Clock, CheckCircle, AlertTriangle,
  MapPin, Calendar, FileText, User, LayoutGrid, List, MoreVertical, ShieldCheck, Box, Eye,
  Check, FolderOpen, AlertCircle, FileSearch, FileCheck, History, FileWarning, Briefcase, AlertOctagon, Octagon, Wifi, Plus, RefreshCw, Navigation
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import TopRightControls from "@/components/dashboard/TopRightControls";
import { getInspections, getInspectionStats, Inspection, InspectionStats } from '@/services/inspections';
import InspectionDetailSideDrawer from '@/components/dashboard/InspectionDetailSideDrawer';
import CreateInspectionSideDrawer from '@/components/dashboard/CreateInspectionSideDrawer';
import LogFindingModal from '@/components/dashboard/LogFindingModal';
import IssueStopWorkModal from '@/components/dashboard/IssueStopWorkModal';
import RequestDocumentsModal from '@/components/dashboard/RequestDocumentsModal';

const TABS = [
  { id: 'requests', label: 'Inspection Requests', icon: FileSearch },
  { id: 'schedule', label: 'Inspection Schedule', icon: Calendar },
  { id: 'active', label: 'Active Inspections', icon: Activity },
  { id: 'findings', label: 'Inspection Findings', icon: AlertTriangle },
  { id: 'stop-work', label: 'Stop-Work Orders', icon: AlertOctagon },
  { id: 're-inspections', label: 'Re-Inspections', icon: History },
  { id: 'reports', label: 'Inspection Reports', icon: FileText },
];

export default function InspectionsDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const currentStatus = (params.status as string) || 'requests';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [stats, setStats] = useState<InspectionStats>({
    requests: 0,
    schedule: 0,
    active: 0,
    findings: 0,
    stop_work: 0,
    re_inspections: 0,
    reports: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Drawer / Modal States
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
  const [isStopWorkModalOpen, setIsStopWorkModalOpen] = useState(false);
  const [isRequestDocsModalOpen, setIsRequestDocsModalOpen] = useState(false);

  const fetchInspectionsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inspData, statsData] = await Promise.all([
        getInspections({ status: currentStatus, search: searchQuery }),
        getInspectionStats()
      ]);
      setInspections(inspData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load inspections", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus, searchQuery]);

  useEffect(() => {
    fetchInspectionsData();
  }, [fetchInspectionsData]);

  const getPageContent = () => {
    switch (currentStatus) {
      case 'schedule':
        return {
          title: "Inspection Schedule",
          subtitle: "Manage scheduled government inspections across all supervised projects.",
          overview: [
            { label: "Scheduled Inspections", value: stats.schedule, icon: Calendar, color: "blue" },
            { label: "Active Today", value: stats.active, icon: Activity, color: "indigo" },
            { label: "Re-Inspections", value: stats.re_inspections, icon: History, color: "purple" },
            { label: "Total in Registry", value: stats.total, icon: ClipboardList, color: "slate" },
          ],
          actions: ["📅 Schedule Inspection", "📑 Request Documents", "👷 Assign Inspector", "⚠️ Log Defect Finding", "🛑 Issue Stop-Work Order"]
        };
      case 'active':
        return {
          title: "Active Field Inspections",
          subtitle: "Monitor inspections currently being conducted in the field with GPS telemetry.",
          overview: [
            { label: "Active in Field", value: stats.active, icon: Activity, color: "emerald" },
            { label: "GPS Verified", value: inspections.filter(i => i.gps_verified).length, icon: MapPin, color: "blue" },
            { label: "Defects Logged", value: stats.findings, icon: AlertTriangle, color: "amber" },
            { label: "Completed Reports", value: stats.reports, icon: CheckCircle, color: "indigo" },
          ],
          actions: ["📅 Schedule Inspection", "📑 Request Documents", "⚠️ Log Defect Finding", "🛑 Issue Stop-Work Order"]
        };
      case 'findings':
        return {
          title: "Inspection Findings & Defects",
          subtitle: "Track non-conformances, safety violations, and structural findings requiring corrective action.",
          overview: [
            { label: "Open Findings", value: stats.findings, icon: AlertTriangle, color: "amber" },
            { label: "Stop-Work Active", value: stats.stop_work, icon: AlertOctagon, color: "red" },
            { label: "Re-Inspections Req.", value: stats.re_inspections, icon: History, color: "blue" },
            { label: "Completed Audits", value: stats.reports, icon: CheckCircle, color: "emerald" },
          ],
          actions: ["⚠️ Log Defect Finding", "📑 Request Documents", "🛑 Issue Stop-Work Order", "🔄 Schedule Re-Inspection"]
        };
      case 'stop-work':
        return {
          title: "Stop-Work Orders Registry",
          subtitle: "Active regulatory enforcement suspensions issued for critical building code violations.",
          overview: [
            { label: "Active Stop-Work", value: stats.stop_work, icon: AlertOctagon, color: "red" },
            { label: "Open Findings", value: stats.findings, icon: AlertTriangle, color: "amber" },
            { label: "Active Sites", value: stats.active, icon: Activity, color: "blue" },
            { label: "Total Registry", value: stats.total, icon: ClipboardList, color: "slate" },
          ],
          actions: ["🛑 Issue Stop-Work Order", "📑 Request Documents", "🔄 Schedule Re-Inspection"]
        };
      case 're-inspections':
        return {
          title: "Re-Inspections Queue",
          subtitle: "Verification visits scheduled to audit rectifications of previously failed inspections.",
          overview: [
            { label: "Pending Re-Inspections", value: stats.re_inspections, icon: History, color: "blue" },
            { label: "Open Findings", value: stats.findings, icon: AlertTriangle, color: "amber" },
            { label: "Completed Audits", value: stats.reports, icon: CheckCircle, color: "emerald" },
            { label: "Total Registry", value: stats.total, icon: ClipboardList, color: "slate" },
          ],
          actions: ["🔄 Schedule Re-Inspection", "📑 Request Documents", "👷 Assign Inspector"]
        };
      case 'reports':
        return {
          title: "Inspection Reports",
          subtitle: "Historical repository of completed field audits, compliance ratings, and sign-offs.",
          overview: [
            { label: "Completed Audits", value: stats.reports, icon: CheckCircle, color: "emerald" },
            { label: "Re-Inspected", value: stats.re_inspections, icon: History, color: "blue" },
            { label: "Active Inspections", value: stats.active, icon: Activity, color: "indigo" },
            { label: "Total Conducted", value: stats.total, icon: ClipboardList, color: "slate" },
          ],
          actions: ["📅 Schedule Inspection", "📑 Request Documents", "📊 Export Registry CSV"]
        };
      default: // requests
        return {
          title: "Inspection Requests",
          subtitle: "Centralized queue for inspection requests submitted by contractors, developers, or internal officers.",
          overview: [
            { label: "Pending Requests", value: stats.requests, icon: Clock, color: "amber" },
            { label: "Scheduled", value: stats.schedule, icon: Calendar, color: "blue" },
            { label: "Active in Field", value: stats.active, icon: Activity, color: "emerald" },
            { label: "Total Requests", value: stats.total, icon: ClipboardList, color: "slate" },
          ],
          actions: ["📅 Schedule Inspection", "📑 Request Documents", "👷 Assign Inspector", "⚠️ Log Defect Finding", "🛑 Issue Stop-Work Order"]
        };
    }
  };

  const content = getPageContent();

  const handleQuickAction = (action: string) => {
    if (action.includes("Request Document") || action.includes("📑")) {
      setIsRequestDocsModalOpen(true);
    } else if (action.includes("Schedule Inspection") || action.includes("Create Inspection") || action.includes("📅") || action.includes("➕")) {
      setIsCreateDrawerOpen(true);
    } else if (action.includes("Schedule Re-Inspection") || action.includes("🔄")) {
      setIsCreateDrawerOpen(true);
    } else if (action.includes("Stop-Work") || action.includes("🛑")) {
      if (currentStatus === 'stop-work') {
        router.push('/government/dashboard/inspections/stop-work');
      } else if (inspections.length > 0) {
        setSelectedInspection(selectedInspection || inspections[0]);
        setIsStopWorkModalOpen(true);
      } else {
        router.push('/government/dashboard/inspections/stop-work');
      }
    } else if (action.includes("Log Defect") || action.includes("Log Finding") || action.includes("⚠️")) {
      if (inspections.length > 0) {
        setSelectedInspection(selectedInspection || inspections[0]);
        setIsFindingModalOpen(true);
      } else {
        setIsCreateDrawerOpen(true);
      }
    } else if (action.includes("Assign Inspector") || action.includes("👷")) {
      if (inspections.length > 0) {
        setSelectedInspection(selectedInspection || inspections[0]);
        setIsDetailDrawerOpen(true);
      } else {
        setIsCreateDrawerOpen(true);
      }
    } else if (action.includes("Export") || action.includes("📊")) {
      const csvContent = "data:text/csv;charset=utf-8," + [
        ["ID", "Project", "Type", "Status", "Date", "Inspector"].join(","),
        ...inspections.map(i => [i.id, `"${i.project_name || ''}"`, i.inspection_type, i.status, i.scheduled_date || '', `"${i.inspector_name || ''}"`].join(","))
      ].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Inspections_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Inspections exported to CSV', type: 'success' } }));
    } else if (inspections.length > 0) {
      setSelectedInspection(selectedInspection || inspections[0]);
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
              Inspections Workspace
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
            if (tab.id === 'requests') badgeCount = stats.requests;
            if (tab.id === 'schedule') badgeCount = stats.schedule;
            if (tab.id === 'active') badgeCount = stats.active;
            if (tab.id === 'findings') badgeCount = stats.findings;
            if (tab.id === 'stop-work') badgeCount = stats.stop_work;
            if (tab.id === 're-inspections') badgeCount = stats.re_inspections;
            if (tab.id === 'reports') badgeCount = stats.reports;

            return (
              <button
                key={tab.id}
                onClick={() => router.push(`/government/dashboard/inspections/${tab.id}`)}
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
          <Plus size={16} /> Request Inspection
        </button>
      </div>

      {/* Dynamic Overview Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
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

      {/* Main Inspections List / Grid Container */}
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
                placeholder="Search by project, ref, or inspector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={fetchInspectionsData}
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
              <p className="text-xs font-semibold">Loading inspections...</p>
            </div>
          ) : inspections.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <FileWarning size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No Inspections Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                There are currently no inspection records matching &quot;{currentStatus}&quot;.
              </p>
              <button
                onClick={() => setIsCreateDrawerOpen(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md transition-all"
              >
                Request New Inspection
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-3">
              {inspections.map((insp) => (
                <div
                  key={insp.id}
                  onClick={() => {
                    setSelectedInspection(insp);
                    setIsDetailDrawerOpen(true);
                  }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group bg-white cursor-pointer"
                >
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">
                        {insp.project_name}
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold">{insp.inspection_reference} • {insp.inspection_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-1/4">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{insp.inspector_name || 'Unassigned'}</span>
                  </div>

                  <div className="flex items-center gap-2 w-1/5">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-600">
                      {insp.scheduled_date ? new Date(insp.scheduled_date).toLocaleDateString() : new Date(insp.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 justify-end">
                    <div className="flex flex-col items-end">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1 ${insp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          insp.status === 'FAILED' ? 'bg-rose-100 text-rose-700' :
                            insp.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              insp.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-700' :
                                'bg-slate-100 text-slate-700'
                        }`}>
                        {insp.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{insp.findings_count || 0} Findings</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInspection(insp);
                        setIsDetailDrawerOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {inspections.map((insp) => (
                <div
                  key={insp.id}
                  onClick={() => {
                    setSelectedInspection(insp);
                    setIsDetailDrawerOpen(true);
                  }}
                  className="p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group bg-white flex flex-col cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Activity size={20} />
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${insp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        insp.status === 'FAILED' ? 'bg-rose-100 text-rose-700' :
                          insp.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            insp.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-slate-100 text-slate-700'
                      }`}>
                      {insp.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                    {insp.project_name}
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold mb-4">{insp.inspection_reference} • {insp.inspection_type}</p>

                  <div className="flex flex-col gap-2 mt-auto mb-4 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{insp.inspector_name || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <span className="font-medium">
                        {insp.scheduled_date ? new Date(insp.scheduled_date).toLocaleDateString() : new Date(insp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{insp.findings_count || 0} Defects</span>
                    <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Audit <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer & Modal Wirings */}
      <InspectionDetailSideDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        inspection={selectedInspection}
        onUpdated={fetchInspectionsData}
        onLogFinding={(insp) => {
          setSelectedInspection(insp);
          setIsFindingModalOpen(true);
        }}
        onIssueStopWork={(insp) => {
          setSelectedInspection(insp);
          setIsStopWorkModalOpen(true);
        }}
      />

      <CreateInspectionSideDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreated={fetchInspectionsData}
      />

      <LogFindingModal
        isOpen={isFindingModalOpen}
        onClose={() => setIsFindingModalOpen(false)}
        inspection={selectedInspection}
        onSuccess={fetchInspectionsData}
      />

      <IssueStopWorkModal
        isOpen={isStopWorkModalOpen}
        onClose={() => setIsStopWorkModalOpen(false)}
        inspection={selectedInspection}
        onSuccess={fetchInspectionsData}
      />

      <RequestDocumentsModal
        isOpen={isRequestDocsModalOpen}
        onClose={() => setIsRequestDocsModalOpen(false)}
      />
    </div>
  );
}
