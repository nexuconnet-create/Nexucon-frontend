"use client";

import React, { useState } from 'react';
import {
  ClipboardList, Search, Filter, ArrowUpRight, Activity, Clock, CheckCircle, AlertTriangle, 
  MapPin, Calendar, FileText, User, LayoutGrid, List, MoreVertical, ShieldCheck, Box, Eye,
  Check, FolderOpen, AlertCircle, FileSearch, FileCheck, History, FileWarning, Briefcase, AlertOctagon, Octagon, Wifi
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import TopRightControls from "@/components/dashboard/TopRightControls";

const TABS = [
  { id: 'requests', label: 'Inspection Requests', icon: FileSearch },
  { id: 'schedule', label: 'Inspection Schedule', icon: Calendar },
  { id: 'active', label: 'Active Inspections', icon: Activity },
  { id: 'findings', label: 'Inspection Findings', icon: AlertTriangle },
  { id: 'stop-work', label: 'Stop-Work Orders', icon: AlertOctagon },
  { id: 're-inspections', label: 'Re-Inspections', icon: History },
  { id: 'reports', label: 'Inspection Reports', icon: FileText },
];

// Mock data for the table/cards
const MOCK_INSPECTIONS = [
  { id: 'INS-2026-001', project: 'Victoria Heights', inspector: 'John Doe', type: 'Foundation Inspection', status: 'Active', date: 'Oct 16, 2026', priority: 'High', findings: 2 },
  { id: 'INS-2026-002', project: 'Lekki Plaza', inspector: 'Unassigned', type: 'Structural Review', status: 'Pending Request', date: 'Oct 18, 2026', priority: 'Medium', findings: 0 },
  { id: 'INS-2026-003', project: 'Ikeja Mixed-Use', inspector: 'Jane Smith', type: 'Site Verification', status: 'Scheduled', date: 'Oct 17, 2026', priority: 'Low', findings: 0 },
  { id: 'INS-2026-004', project: 'Harmony Complex', inspector: 'Mike Ross', type: 'Safety Audit', status: 'Failed', date: 'Oct 15, 2026', priority: 'High', findings: 4 },
  { id: 'INS-2026-005', project: 'Green Valley', inspector: 'Sarah Connor', type: 'Final Clearance', status: 'Completed', date: 'Oct 10, 2026', priority: 'Medium', findings: 0 },
  { id: 'SWO-2026-001', project: 'Eko Atlantic Tower', inspector: 'James Bond', type: 'Stop-Work Order', status: 'Halted', date: 'Oct 16, 2026', priority: 'Critical', findings: 1, reason: 'Severe Structural Deviation (Column Misalignment)' },
];

export default function InspectionsDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const currentStatus = (params.status as string) || 'requests';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Define content mapping based on the prompt requirements
  const pageContent = {
    requests: {
      title: "Inspection Requests",
      subtitle: "Centralized queue for inspection requests submitted by developers, contractors, project teams, or internal government officers.",
      overview: [
        { label: "Pending Requests", value: "7", icon: Clock, color: "amber" },
        { label: "High Priority", value: "3", icon: AlertCircle, color: "red" },
        { label: "Scheduled Today", value: "16", icon: Calendar, color: "blue" },
        { label: "Unassigned", value: "5", icon: User, color: "slate" },
      ],
      actions: ["🔍 Create Inspection Request", "Review Request", "Assign Inspector", "Approve Request", "Schedule Inspection", "Decline Request"]
    },
    schedule: {
      title: "Inspection Schedule",
      subtitle: "Manage upcoming government inspections across all supervised projects.",
      overview: [
        { label: "Today", value: "16", icon: Calendar, color: "blue" },
        { label: "This Week", value: "45", icon: Clock, color: "indigo" },
        { label: "Upcoming", value: "120", icon: FileSearch, color: "purple" },
        { label: "Overdue", value: "4", icon: AlertTriangle, color: "red" },
      ],
      actions: ["📅 Schedule Inspection", "Reassign Inspector", "Reschedule", "View Project", "Open Site Location"]
    },
    active: {
      title: "Active Inspections",
      subtitle: "Monitor inspections currently being conducted in the field.",
      overview: [
        { label: "Active Inspections", value: "9", icon: Activity, color: "emerald" },
        { label: "GPS Verified", value: "8", icon: MapPin, color: "blue" },
        { label: "Issue Identified", value: "3", icon: AlertTriangle, color: "amber" },
        { label: "Completed Today", value: "12", icon: CheckCircle, color: "indigo" },
      ],
      actions: ["📍 Start Field Inspection", "View Inspection", "Track Inspector", "Open Site Map", "Launch BIM Viewer", "Contact Inspector"]
    },
    findings: {
      title: "Inspection Findings",
      subtitle: "Review observations, defects, violations, and compliance issues identified during inspections.",
      overview: [
        { label: "Open Findings", value: "18", icon: FolderOpen, color: "amber" },
        { label: "Critical Severity", value: "2", icon: AlertTriangle, color: "red" },
        { label: "Safety Violations", value: "4", icon: ShieldCheck, color: "orange" },
        { label: "Resolved", value: "45", icon: CheckCircle, color: "emerald" },
      ],
      actions: ["⚠️ Record Finding", "View Finding", "⚡ Auto-Generate Corrective Tasks", "Notify Project Team", "Request Evidence", "Escalate Finding"]
    },
    'stop-work': {
      title: "Stop-Work Orders",
      subtitle: "Critical enforcement registry for projects with halted construction due to severe regulatory violations.",
      overview: [
        { label: "Active Stop-Work", value: "3", icon: AlertOctagon, color: "red" },
        { label: "Pending Corrective Plan", value: "2", icon: FileWarning, color: "orange" },
        { label: "Awaiting Re-Inspection", value: "1", icon: Clock, color: "amber" },
        { label: "Resolved This Month", value: "5", icon: CheckCircle, color: "emerald" },
      ],
      actions: ["⚠️ Issue Stop-Work Order", "Review Corrective Plan", "Schedule Re-Inspection", "✅ Lift Stop-Work Order"]
    },
    're-inspections': {
      title: "Re-Inspections",
      subtitle: "Manage follow-up inspections required to verify that previously identified issues have been corrected.",
      overview: [
        { label: "Required", value: "4", icon: AlertCircle, color: "red" },
        { label: "Scheduled", value: "2", icon: Calendar, color: "blue" },
        { label: "Overdue", value: "1", icon: Clock, color: "orange" },
        { label: "Closed", value: "12", icon: CheckCircle, color: "emerald" },
      ],
      actions: ["🔄 Schedule Re-Inspection", "Review Previous Findings", "Verify Correction", "Add New Finding", "Close Finding", "Escalate"]
    },
    reports: {
      title: "Inspection Reports",
      subtitle: "Central repository for completed inspection reports and official inspection records.",
      overview: [
        { label: "Total Reports", value: "1250", icon: FileText, color: "blue" },
        { label: "Approved", value: "1100", icon: CheckCircle, color: "emerald" },
        { label: "Pending Review", value: "15", icon: Clock, color: "amber" },
        { label: "Failed Inspections", value: "2", icon: AlertTriangle, color: "red" },
      ],
      actions: ["📄 Generate Inspection Report", "View Report", "Download Report", "Export PDF", "Share Report", "View Inspection History"]
    }
  };

  const content = pageContent[currentStatus as keyof typeof pageContent] || pageContent.requests;

  // Filter inspections based on tab (simple mock logic)
  const displayedInspections = MOCK_INSPECTIONS.filter(i => {
    if (currentStatus === 'schedule') return i.status === 'Scheduled';
    if (currentStatus === 'active') return i.status === 'Active';
    if (currentStatus === 'findings') return i.findings > 0 && i.type !== 'Stop-Work Order';
    if (currentStatus === 'stop-work') return i.type === 'Stop-Work Order';
    if (currentStatus === 're-inspections') return i.status === 'Failed';
    if (currentStatus === 'reports') return i.status === 'Completed' || i.status === 'Failed';
    return i.type !== 'Stop-Work Order'; // requests (all pending/general)
  });

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <FileSearch size={20} />
            </div>
            <h1 className="text-[32px] font-bold text-[#022C4F] leading-tight">
              Inspection Management
            </h1>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md shadow-sm ml-2">
               <Wifi size={14} />
               <span className="text-[10px] font-bold uppercase tracking-wider">Field Mode: Offline Ready</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></div>
            </div>
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
              onClick={() => router.push(`/government/dashboard/inspections/${tab.id}`)}
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
            <Activity size={18} /> Quick Actions
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

      {/* Inspections List/Grid Section */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
            <FileSearch size={18} /> {content.title}
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search inspections..." 
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
          {currentStatus === 'stop-work' ? (
            <div className="flex flex-col gap-3">
              {displayedInspections.map((inspection) => (
                <div key={inspection.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-red-100 hover:border-red-300 hover:shadow-md transition-all group bg-red-50/30">
                  <div className="flex items-center gap-4 w-full sm:w-1/3 mb-4 sm:mb-0">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <AlertOctagon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-900 group-hover:text-red-700 transition-colors">{inspection.project}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{inspection.id}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Issued by: {inspection.inspector}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 w-full sm:w-1/3 mb-4 sm:mb-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason for Stoppage</span>
                    <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle size={12} /> {(inspection as any).reason || 'Severe Violation'}
                    </span>
                  </div>

                  <div className="flex items-center sm:justify-end gap-6 w-full sm:w-1/3">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1 bg-red-600 text-white shadow-sm">
                        {inspection.status}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">Since {inspection.date}</span>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors ml-auto sm:ml-0">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-3">
              {displayedInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#022C4F]/20 hover:shadow-md transition-all group bg-white">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileSearch size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">{inspection.project}</h4>
                      <p className="text-xs text-slate-500">{inspection.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-1/4">
                    <User size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{inspection.inspector}</span>
                  </div>

                  <div className="flex items-center gap-2 w-1/4">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{inspection.date}</span>
                  </div>

                  <div className="flex items-center gap-6 w-1/4 justify-end">
                    <div className="flex flex-col items-end">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1
                        ${inspection.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${inspection.status === 'Failed' ? 'bg-red-100 text-red-700' : ''}
                        ${inspection.status === 'Pending Request' ? 'bg-amber-100 text-amber-700' : ''}
                        ${inspection.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : ''}
                        ${inspection.status === 'Active' ? 'bg-indigo-100 text-indigo-700' : ''}
                      `}>
                        {inspection.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{inspection.type}</span>
                    </div>
                    {currentStatus === 'findings' && (
                      <button className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-blue-200 hover:border-blue-600 shadow-sm whitespace-nowrap">
                        ⚡ Auto-Gen Tasks
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-[#022C4F] hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedInspections.map((inspection) => (
                <div key={inspection.id} className="p-5 rounded-2xl border border-slate-100 hover:border-[#022C4F]/20 hover:shadow-lg transition-all group bg-white flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileSearch size={20} />
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${inspection.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${inspection.status === 'Failed' ? 'bg-red-100 text-red-700' : ''}
                        ${inspection.status === 'Pending Request' ? 'bg-amber-100 text-amber-700' : ''}
                        ${inspection.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : ''}
                        ${inspection.status === 'Active' ? 'bg-indigo-100 text-indigo-700' : ''}
                      `}>
                        {inspection.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors mb-1">{inspection.project}</h4>
                  <p className="text-xs text-slate-500 mb-4">{inspection.id}</p>
                  
                  <div className="flex flex-col gap-2 mt-auto mb-4">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-600 line-clamp-1">{inspection.inspector}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-600 line-clamp-1">{inspection.date}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">{(inspection as any).priority || 'Normal'} Priority</span>
                    {currentStatus === 'findings' ? (
                      <button className="text-[10px] font-bold text-blue-700 hover:text-white hover:bg-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1">
                        ⚡ Auto-Gen Tasks
                      </button>
                    ) : (
                      <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        View <ArrowUpRight size={12} />
                      </button>
                    )}
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
