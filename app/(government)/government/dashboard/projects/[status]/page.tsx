"use client";

import React, { useState } from 'react';
import {
  Building2, Search, Filter, ArrowUpRight, Activity, Clock, CheckCircle, AlertTriangle, 
  MapPin, Calendar, FileText, User, LayoutGrid, List, MoreVertical, ShieldCheck, Box, Eye,
  ClipboardList, Check, FolderOpen, AlertCircle, FileSearch, AlertOctagon, UserX, Gavel, FileX
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import TopRightControls from "@/components/dashboard/TopRightControls";

const TABS = [
  { id: 'all', label: 'All Projects', icon: Building2 },
  { id: 'active', label: 'Active Projects', icon: Activity },
  { id: 'completed', label: 'Completed Projects', icon: CheckCircle },
  { id: 'pending', label: 'Pending Projects', icon: Clock },
  { id: 'flagged', label: 'Flagged Projects', icon: AlertTriangle },
  { id: 'monitoring', label: 'Project Monitoring', icon: Eye },
  { id: 'blacklist', label: 'Blacklist / Red-Flags', icon: AlertOctagon },
];

const MOCK_OFFENDERS = [
  { id: 'ENT-001', name: 'Rovengates Properties', type: 'Developer', reason: 'Pending Court Case (Structural Failure)', status: 'Suspended', date: 'Oct 2025', icon: Gavel },
  { id: 'ENT-002', name: 'Mainland Builders', type: 'Contractor', reason: 'Previous Building Collapse', status: 'Blacklisted', date: 'Jan 2024', icon: AlertOctagon },
  { id: 'ENT-003', name: 'O&A Consults', type: 'Consultant', reason: 'Revoked License (Falsified Docs)', status: 'Banned', date: 'Mar 2026', icon: FileX },
];

// Mock data for the table/cards
const MOCK_PROJECTS = [
  { id: 'PRJ-2026-001', name: 'Victoria Heights Commercial Development', developer: 'Rovengates Properties', location: 'Victoria Island, Lagos', type: 'Commercial', status: 'Active', progress: 68, compliance: 'Compliant', complianceScore: 92 },
  { id: 'PRJ-2026-002', name: 'Lekki Commercial Plaza', developer: 'Lekki Concession Co.', location: 'Lekki Phase 1, Lagos', type: 'Mixed-Use', status: 'Flagged', progress: 42, compliance: 'Warning', complianceScore: 45 },
  { id: 'PRJ-2026-003', name: 'Ikeja Mixed-Use Development', developer: 'Mainland Builders', location: 'Ikeja, Lagos', type: 'Mixed-Use', status: 'Active', progress: 15, compliance: 'Compliant', complianceScore: 88 },
  { id: 'PRJ-2026-004', name: 'Harmony Business Complex', developer: 'Harmony Group', location: 'Port Harcourt, Rivers', type: 'Commercial', status: 'Completed', progress: 100, compliance: 'Compliant', complianceScore: 100 },
  { id: 'PRJ-2026-005', name: 'Green Valley Apartments', developer: 'Green Valley Devs', location: 'Abuja Phase 2', type: 'Residential', status: 'Pending', progress: 0, compliance: 'Under Review', complianceScore: 60 },
];

export default function ProjectsDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const currentStatus = (params.status as string) || 'all';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Define content mapping based on the prompt requirements
  const pageContent = {
    all: {
      title: "All Projects",
      subtitle: "Central registry of all developments under the agency's jurisdiction.",
      overview: [
        { label: "Total Registered", value: "142", icon: Building2, color: "blue" },
        { label: "Active Sites", value: "48", icon: Activity, color: "emerald" },
        { label: "Completed", value: "64", icon: CheckCircle, color: "indigo" },
        { label: "Flagged", value: "7", icon: AlertTriangle, color: "red" },
      ],
      actions: ["View Project", "Review Documents", "View BIM Model", "View Site Activity", "Open Project Monitoring"]
    },
    active: {
      title: "Active Projects",
      subtitle: "Monitor projects currently under construction or active regulatory supervision.",
      overview: [
        { label: "Active Projects", value: "48", icon: Activity, color: "blue" },
        { label: "On Schedule", value: "35", icon: CheckCircle, color: "emerald" },
        { label: "At Risk", value: "8", icon: AlertCircle, color: "amber" },
        { label: "Open Issues", value: "12", icon: ShieldCheck, color: "orange" },
      ],
      actions: ["Monitor Project", "Schedule Inspection", "Review Progress", "View Site Activity"]
    },
    completed: {
      title: "Completed Projects",
      subtitle: "Archive and review projects that have completed construction and regulatory requirements.",
      overview: [
        { label: "Completed Projects", value: "64", icon: CheckCircle, color: "emerald" },
        { label: "Final Inspections", value: "12", icon: FileSearch, color: "blue" },
        { label: "Approved Reports", value: "58", icon: FileText, color: "indigo" },
        { label: "Compliance Rate", value: "98%", icon: ShieldCheck, color: "emerald" },
      ],
      actions: ["View Project Record", "Review Final Report", "View Approval History", "Download Project Documents"]
    },
    pending: {
      title: "Pending Projects",
      subtitle: "Projects awaiting government review, approval, documentation, inspection, or regulatory action.",
      overview: [
        { label: "Awaiting Initial Review", value: "15", icon: Clock, color: "amber" },
        { label: "Awaiting Documentation", value: "8", icon: FolderOpen, color: "blue" },
        { label: "Awaiting Inspection", value: "12", icon: FileSearch, color: "purple" },
        { label: "Awaiting Approval", value: "6", icon: CheckCircle, color: "emerald" },
      ],
      actions: ["Review Submission", "Request Documents", "Assign Reviewer", "Schedule Inspection", "Approve / Reject"]
    },
    flagged: {
      title: "Flagged Projects",
      subtitle: "Projects requiring immediate government attention due to regulatory concerns.",
      overview: [
        { label: "Critical Compliance", value: "3", icon: AlertTriangle, color: "red" },
        { label: "Safety Concerns", value: "2", icon: ShieldCheck, color: "orange" },
        { label: "Construction Delays", value: "5", icon: Clock, color: "amber" },
        { label: "Inspection Failures", value: "4", icon: FileSearch, color: "red" },
      ],
      actions: ["View Flag Details", "Assign Officer", "Create Corrective Action", "Schedule Re-Inspection", "Escalate Issue"]
    },
    monitoring: {
      title: "Project Monitoring",
      subtitle: "Centralized monitoring workspace for tracking project progress, site activity, and regulatory milestones.",
      overview: [
        { label: "Field Observations", value: "24", icon: Eye, color: "blue" },
        { label: "Site Activity", value: "18", icon: Activity, color: "emerald" },
        { label: "BIM Updates", value: "7", icon: Box, color: "purple" },
        { label: "Tersus Verifications", value: "12", icon: MapPin, color: "indigo" },
      ],
      actions: ["Open Project Monitor", "View Site Map", "Launch BIM Viewer", "Verify Site Coordinates", "Review Activity", "Generate Monitoring Report"]
    },
    blacklist: {
      title: "Recurring Offenders Registry",
      subtitle: "Registry of blacklisted or red-flagged contractors, developers, and consultants.",
      overview: [
        { label: "Total Blacklisted", value: "14", icon: AlertOctagon, color: "red" },
        { label: "Pending Court Cases", value: "5", icon: Gavel, color: "orange" },
        { label: "Revoked Licenses", value: "8", icon: FileX, color: "red" },
        { label: "Suspended Entities", value: "22", icon: UserX, color: "amber" },
      ],
      actions: ["Add to Registry", "Review Case Files", "Generate Tribunal Report", "Escalate to Enforcement"]
    }
  };

  const content = pageContent[currentStatus as keyof typeof pageContent] || pageContent.all;

  // Filter projects based on tab (simple mock logic)
  const displayedProjects = MOCK_PROJECTS.filter(p => {
    if (currentStatus === 'active') return p.status === 'Active';
    if (currentStatus === 'completed') return p.status === 'Completed';
    if (currentStatus === 'pending') return p.status === 'Pending';
    if (currentStatus === 'flagged') return p.status === 'Flagged';
    return true; // all or monitoring
  });

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <Building2 size={20} />
            </div>
            <h1 className="text-[32px] font-bold text-[#022C4F] leading-tight">
              Project Oversight
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
              onClick={() => router.push(`/government/dashboard/projects/${tab.id}`)}
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
            <ClipboardList size={18} /> Quick Actions
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

      {/* Projects List/Grid Section */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
            <Building2 size={18} /> {content.title}
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
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
          {currentStatus === 'blacklist' ? (
            <div className="flex flex-col gap-3">
              {MOCK_OFFENDERS.map((offender) => (
                <div key={offender.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-red-100 hover:border-red-300 hover:shadow-md transition-all group bg-red-50/30">
                  <div className="flex items-center gap-4 w-full sm:w-1/3 mb-4 sm:mb-0">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <offender.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-900 group-hover:text-red-700 transition-colors">{offender.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{offender.id}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{offender.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 w-full sm:w-1/3 mb-4 sm:mb-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason for Flag</span>
                    <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle size={12} /> {offender.reason}
                    </span>
                  </div>

                  <div className="flex items-center sm:justify-end gap-6 w-full sm:w-1/3">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1
                        ${offender.status === 'Blacklisted' ? 'bg-red-600 text-white shadow-sm' : ''}
                        ${offender.status === 'Suspended' ? 'bg-orange-100 text-orange-700' : ''}
                        ${offender.status === 'Banned' ? 'bg-red-900 text-white shadow-sm' : ''}
                      `}>
                        {offender.status}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">Since {offender.date}</span>
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
              {displayedProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#022C4F]/20 hover:shadow-md transition-all group bg-white">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">{project.name}</h4>
                      <p className="text-xs text-slate-500">{project.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-1/4">
                    <User size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{project.developer}</span>
                  </div>

                  <div className="flex items-center gap-2 w-1/4">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{project.location}</span>
                  </div>

                  <div className="flex items-center gap-6 w-1/4 justify-end">
                    <div className="flex flex-col items-end mr-2 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Compliance</span>
                      <span className={`text-xs font-bold ${project.complianceScore >= 80 ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100' : project.complianceScore >= 50 ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100' : 'text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100'}`}>
                        {project.complianceScore}%
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1
                        ${project.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${project.status === 'Flagged' ? 'bg-red-100 text-red-700' : ''}
                        ${project.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ''}
                        ${project.status === 'Completed' ? 'bg-indigo-100 text-indigo-700' : ''}
                      `}>
                        {project.status}
                      </span>
                      {project.status === 'Active' && (
                        <div className="flex items-center gap-2 w-24">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{project.progress}%</span>
                        </div>
                      )}
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
              {displayedProjects.map((project) => (
                <div key={project.id} className="p-5 rounded-2xl border border-slate-100 hover:border-[#022C4F]/20 hover:shadow-lg transition-all group bg-white flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 size={20} />
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${project.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${project.status === 'Flagged' ? 'bg-red-100 text-red-700' : ''}
                        ${project.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ''}
                        ${project.status === 'Completed' ? 'bg-indigo-100 text-indigo-700' : ''}
                      `}>
                        {project.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors mb-1">{project.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">{project.id}</p>
                  
                  <div className="flex flex-col gap-2 mt-auto mb-4">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-600 line-clamp-1">{project.developer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-600 line-clamp-1">{project.location}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Compliance</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${project.complianceScore >= 80 ? 'bg-emerald-500' : project.complianceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-bold ${project.complianceScore >= 80 ? 'text-emerald-700' : project.complianceScore >= 50 ? 'text-amber-700' : 'text-red-700'}`}>{project.complianceScore}%</span>
                      </div>
                    </div>
                    {project.status === 'Active' ? (
                      <div className="flex flex-col w-24">
                         <span className="text-[10px] font-bold text-slate-500 mb-1">Progress: {project.progress}%</span>
                         <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${project.progress}%` }}></div>
                         </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">{project.type}</span>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-end">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      View Project <ArrowUpRight size={12} />
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
