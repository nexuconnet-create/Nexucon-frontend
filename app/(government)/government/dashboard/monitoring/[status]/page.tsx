"use client";

import React, { useState } from 'react';
import {
  ClipboardList, Search, Filter, ArrowUpRight, Activity, Clock, CheckCircle, AlertTriangle, 
  MapPin, Calendar, FileText, User, LayoutGrid, List, MoreVertical, ShieldCheck, Box, Eye,
  Check, FolderOpen, AlertCircle, FileSearch, FileCheck, History, FileWarning, Briefcase,
  MonitorPlay
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import TopRightControls from "@/components/dashboard/TopRightControls";

const TABS = [
  { id: 'live', label: 'Live Site View', icon: Eye },
  { id: 'progress', label: 'Site Progress', icon: Activity },
  { id: 'observations', label: 'Field Observations', icon: Eye },
  { id: 'issues', label: 'Site Issues', icon: AlertTriangle },
  { id: 'milestones', label: 'Construction Milestones', icon: CheckCircle },
  { id: 'verification', label: 'Site Verification', icon: ShieldCheck },
];

// Mock data for the table/cards
const MOCK_MONITORING = [
  { id: 'MON-2026-001', project: 'Victoria Heights', updatedBy: 'Site Camera 1', type: 'Live Feed', status: 'Active', date: 'Just now', priority: 'High', progress: 65 },
  { id: 'MON-2026-002', project: 'Lekki Plaza', updatedBy: 'John Doe', type: 'Progress Update', status: 'Pending Verification', date: '2 hours ago', priority: 'Medium', progress: 42 },
  { id: 'MON-2026-003', project: 'Ikeja Mixed-Use', updatedBy: 'Inspector Smith', type: 'Observation', status: 'Resolved', date: 'Yesterday', priority: 'Low', progress: 15 },
  { id: 'MON-2026-004', project: 'Harmony Complex', updatedBy: 'Jane Doe', type: 'Issue', status: 'Critical', date: 'Oct 15, 2026', priority: 'High', progress: 90 },
  { id: 'MON-2026-005', project: 'Green Valley', updatedBy: 'Tersus Rover', type: 'Verification', status: 'Variance Detected', date: 'Oct 10, 2026', priority: 'High', progress: 5 },
];

export default function MonitoringDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const currentStatus = (params.status as string) || 'live';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Define content mapping based on the prompt requirements
  const pageContent = {
    live: {
      title: "Live Site View",
      subtitle: "Centralized view of active government-supervised construction sites, providing visibility into current site activity, project location, progress, and field events.",
      overview: [
        { label: "Active Sites", value: "48", icon: Activity, color: "emerald" },
        { label: "Sites Updated Today", value: "31", icon: Clock, color: "blue" },
        { label: "Open Site Issues", value: "18", icon: AlertTriangle, color: "orange" },
        { label: "Active Observations", value: "27", icon: Eye, color: "indigo" },
      ],
      actions: ["📍 Open Live Site View", "View Site Activity", "View Site Photos", "Launch BIM Viewer", "Contact Site Team"]
    },
    progress: {
      title: "Site Progress",
      subtitle: "Monitor physical construction progress against approved project schedules, milestones, and reported progress.",
      overview: [
        { label: "On Schedule", value: "32", icon: CheckCircle, color: "emerald" },
        { label: "Delayed", value: "8", icon: AlertCircle, color: "red" },
        { label: "Milestone Reached", value: "12", icon: Activity, color: "blue" },
        { label: "Progress Reports", value: "45", icon: FileText, color: "slate" },
      ],
      actions: ["📊 Update Site Progress", "View Progress Details", "Compare Planned vs Actual", "Review Progress Report", "View Supporting Evidence", "Flag Delayed Progress"]
    },
    observations: {
      title: "Field Observations",
      subtitle: "Centralized record of observations captured during government site visits, inspections, and monitoring activities.",
      overview: [
        { label: "Active Observations", value: "27", icon: Eye, color: "blue" },
        { label: "Quality Issues", value: "12", icon: ShieldCheck, color: "orange" },
        { label: "Safety Concerns", value: "5", icon: AlertTriangle, color: "red" },
        { label: "Resolved", value: "108", icon: CheckCircle, color: "emerald" },
      ],
      actions: ["📝 Add Field Observation", "View Observation", "Add Comment", "Attach Evidence", "Create Corrective Action", "Assign Officer"]
    },
    issues: {
      title: "Site Issues",
      subtitle: "Track construction issues, regulatory concerns, safety risks, defects, and deviations requiring government attention.",
      overview: [
        { label: "Open Issues", value: "18", icon: FolderOpen, color: "amber" },
        { label: "Critical Severity", value: "3", icon: AlertCircle, color: "red" },
        { label: "Under Review", value: "7", icon: Clock, color: "blue" },
        { label: "Resolved Issues", value: "156", icon: CheckCircle, color: "emerald" },
      ],
      actions: ["⚠️ Report Site Issue", "View Issue", "Assign Action", "Request Evidence", "Escalate Issue", "Close Issue"]
    },
    milestones: {
      title: "Construction Milestones",
      subtitle: "Track major construction milestones against the approved project programme and regulatory requirements.",
      overview: [
        { label: "Due This Week", value: "14", icon: Calendar, color: "amber" },
        { label: "Verified", value: "45", icon: ShieldCheck, color: "emerald" },
        { label: "Delayed", value: "5", icon: AlertTriangle, color: "red" },
        { label: "Upcoming", value: "32", icon: Clock, color: "blue" },
      ],
      actions: ["🏗 Verify Milestone", "View Milestone", "Request Evidence", "Flag Delay", "Add Observation"]
    },
    verification: {
      title: "Site Verification",
      subtitle: "Verify physical site conditions, project coordinates, construction positioning, and reported project information against approved records.",
      overview: [
        { label: "Pending Verification", value: "6", icon: Clock, color: "amber" },
        { label: "Verified", value: "126", icon: CheckCircle, color: "emerald" },
        { label: "Variance Detected", value: "4", icon: AlertTriangle, color: "red" },
        { label: "Active Devices", value: "6", icon: Activity, color: "blue" },
      ],
      actions: ["📐 Start Site Verification", "Connect Tersus Device", "Capture Coordinates", "Calibrate Model Positioning", "Record Variance", "Save Verification Report"]
    }
  };

  const content = pageContent[currentStatus as keyof typeof pageContent] || pageContent.live;

  // Filter monitoring data based on tab (simple mock logic)
  const displayedMonitoring = MOCK_MONITORING.filter(m => {
    if (currentStatus === 'live') return m.status === 'Active';
    if (currentStatus === 'progress') return m.type === 'Progress Update';
    if (currentStatus === 'observations') return m.type === 'Observation';
    if (currentStatus === 'issues') return m.type === 'Issue';
    if (currentStatus === 'verification') return m.type === 'Verification';
    return true; // all
  });

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <MonitorPlay size={20} />
            </div>
            <h1 className="text-[32px] font-bold text-[#022C4F] leading-tight">
              Site Monitoring
            </h1>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed ml-[52px]">
            {content.subtitle}
          </p>
        </div>
        <TopRightControls />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {TABS.map((tab) => {
          const isActive = currentStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(`/government/dashboard/monitoring/${tab.id}`)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-[#022C4F] text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Overview Stats */}
        <div className="xl:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {content.overview.map((stat, idx) => (
            <div key={idx} className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group border-b-4 border-b-${stat.color}-500 flex flex-col justify-between`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                  <stat.icon size={20} />
                </div>
                <span className={`text-2xl font-bold text-[#022C4F]`}>{stat.value}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Action Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2">
            <MonitorPlay size={18} /> Quick Actions
          </h3>
          <div className="flex flex-col gap-2 mt-auto">
            {content.actions.map((action, idx) => (
              <button key={idx} className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-colors text-left flex items-center justify-between group">
                {action}
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Monitoring List/Grid Section */}
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
                placeholder="Search monitoring records..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]/20 transition-all"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={18} />
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
          {viewMode === 'list' ? (
            <div className="flex flex-col gap-3">
              {displayedMonitoring.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#022C4F]/20 hover:shadow-md transition-all group bg-white">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MonitorPlay size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">{record.project}</h4>
                      <p className="text-xs text-slate-500">{record.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-1/4">
                    <User size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{record.updatedBy}</span>
                  </div>

                  <div className="flex items-center gap-2 w-1/4">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{record.date}</span>
                  </div>

                  <div className="flex items-center gap-6 w-1/4 justify-end">
                    <div className="flex flex-col items-end">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1
                        ${record.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${record.status === 'Critical' ? 'bg-red-100 text-red-700' : ''}
                        ${record.status === 'Variance Detected' ? 'bg-orange-100 text-orange-700' : ''}
                        ${record.status === 'Pending Verification' ? 'bg-amber-100 text-amber-700' : ''}
                        ${record.status === 'Active' ? 'bg-blue-100 text-blue-700' : ''}
                      `}>
                        {record.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{record.type}</span>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-[#022C4F] hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedMonitoring.map((record) => (
                <div key={record.id} className="p-5 rounded-2xl border border-slate-100 hover:border-[#022C4F]/20 hover:shadow-lg transition-all group bg-white flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MonitorPlay size={20} />
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${record.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${record.status === 'Critical' ? 'bg-red-100 text-red-700' : ''}
                        ${record.status === 'Variance Detected' ? 'bg-orange-100 text-orange-700' : ''}
                        ${record.status === 'Pending Verification' ? 'bg-amber-100 text-amber-700' : ''}
                        ${record.status === 'Active' ? 'bg-blue-100 text-blue-700' : ''}
                      `}>
                        {record.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors mb-1">{record.project}</h4>
                  <p className="text-xs text-slate-500 mb-4">{record.id}</p>
                  
                  <div className="flex flex-col gap-2 mt-auto mb-4">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-600 line-clamp-1">{record.updatedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-600 line-clamp-1">{record.date}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">{record.type}</span>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      View <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
