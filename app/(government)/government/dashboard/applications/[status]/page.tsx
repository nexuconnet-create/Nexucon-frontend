"use client";

import React, { useState } from 'react';
import {
  ClipboardList, Search, Filter, ArrowUpRight, Activity, Clock, CheckCircle, AlertTriangle, 
  MapPin, Calendar, FileText, User, LayoutGrid, List, MoreVertical, ShieldCheck, Box, Eye,
  Check, FolderOpen, AlertCircle, FileSearch, FileCheck, History, FileWarning, Briefcase, ClipboardCheck
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import TopRightControls from "@/components/dashboard/TopRightControls";

const TABS = [
  { id: 'permits', label: 'Permit Applications', icon: ClipboardList },
  { id: 'submitted', label: 'Submitted Applications', icon: FileCheck },
  { id: 'review', label: 'Under Review', icon: FileSearch },
  { id: 'conditional', label: 'Conditional Approvals', icon: ClipboardCheck },
  { id: 'approved', label: 'Approved', icon: CheckCircle },
  { id: 'rejected', label: 'Rejected', icon: AlertTriangle },
  { id: 'expired', label: 'Expired / Renewals', icon: History },
];

// Mock data for the table/cards
const MOCK_APPLICATIONS = [
  { id: 'APP-2026-001', project: 'Victoria Heights', applicant: 'Rovengates Properties', type: 'Building Permit', status: 'Under Review', date: 'Oct 12, 2026', priority: 'High' },
  { id: 'APP-2026-002', project: 'Lekki Plaza', applicant: 'Lekki Concession Co.', type: 'Renovation Permit', status: 'Submitted', date: 'Oct 15, 2026', priority: 'Medium' },
  { id: 'APP-2026-003', project: 'Ikeja Mixed-Use', applicant: 'Mainland Builders', type: 'Planning Approval', status: 'Approved', date: 'Sep 20, 2026', priority: 'Low' },
  { id: 'APP-2026-004', project: 'Harmony Complex', applicant: 'Harmony Group', type: 'Demolition Permit', status: 'Rejected', date: 'Oct 05, 2026', priority: 'Medium' },
  { id: 'APP-2026-005', project: 'Green Valley', applicant: 'Green Valley Devs', type: 'Building Permit', status: 'Expired', date: 'Jan 10, 2025', priority: 'High' },
  { id: 'APP-2026-006', project: 'Eko Atlantic Tower', applicant: 'Eko Devs', type: 'Structural Approval', status: 'Conditional Approval', date: 'Oct 16, 2026', priority: 'High' },
];

export default function ApplicationsDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const currentStatus = (params.status as string) || 'permits';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Define content mapping based on the prompt requirements
  const pageContent = {
    permits: {
      title: "Regulatory Applications",
      subtitle: "Central workspace for managing all permit applications submitted to the agency.",
      overview: [
        { label: "Total Applications", value: "342", icon: ClipboardList, color: "blue" },
        { label: "Pending Review", value: "56", icon: Clock, color: "amber" },
        { label: "Approved This Month", value: "120", icon: CheckCircle, color: "emerald" },
        { label: "Rejected", value: "15", icon: AlertTriangle, color: "red" },
      ],
      actions: ["➕ New Permit Application", "🔍 Review Application", "📑 Request Documents", "👷 Assign Reviewer", "📅 Schedule Inspection"]
    },
    submitted: {
      title: "Submitted Applications",
      subtitle: "View newly submitted applications that are awaiting initial screening and assignment.",
      overview: [
        { label: "New Submissions", value: "24", icon: FileCheck, color: "blue" },
        { label: "Awaiting Assignment", value: "18", icon: User, color: "indigo" },
        { label: "Missing Documents", value: "5", icon: FileWarning, color: "orange" },
        { label: "High Priority", value: "8", icon: AlertCircle, color: "red" },
      ],
      actions: ["Review Submission", "Verify Documents", "Assign Reviewer", "Accept for Review", "Return for Correction"]
    },
    review: {
      title: "Under Review",
      subtitle: "Manage applications currently undergoing technical, regulatory, environmental, planning, or compliance review.",
      overview: [
        { label: "Technical Review", value: "15", icon: Briefcase, color: "blue" },
        { label: "Site Inspection", value: "12", icon: MapPin, color: "purple" },
        { label: "Awaiting Revisions", value: "8", icon: History, color: "amber" },
        { label: "Final Assessment", value: "10", icon: ShieldCheck, color: "emerald" },
      ],
      actions: ["Continue Review", "Add Review Comment", "Request Clarification", "Assign Specialist", "Schedule Inspection", "✅ Process Decision"]
    },
    conditional: {
      title: "Conditional Approvals",
      subtitle: "Applications approved subject to specific conditions (e.g., structural calculations, EIA submission) that must be met before full permit issuance.",
      overview: [
        { label: "Awaiting Verification", value: "18", icon: Clock, color: "amber" },
        { label: "Conditions Satisfied", value: "5", icon: CheckCircle, color: "emerald" },
        { label: "Overdue Submissions", value: "3", icon: AlertTriangle, color: "red" },
        { label: "Pending Issuance", value: "8", icon: FileText, color: "blue" },
      ],
      actions: ["Verify Conditions", "View Required Docs", "Remind Applicant", "✅ Issue Final Permit"]
    },
    approved: {
      title: "Approved Permits",
      subtitle: "Registry of permits and applications that have successfully completed the regulatory approval process.",
      overview: [
        { label: "Total Approved", value: "850", icon: CheckCircle, color: "emerald" },
        { label: "Active Permits", value: "620", icon: Activity, color: "blue" },
        { label: "Issued This Week", value: "45", icon: FileText, color: "indigo" },
        { label: "Compliance Rate", value: "98%", icon: ShieldCheck, color: "emerald" },
      ],
      actions: ["View Permit", "Download Permit", "View Conditions", "Review Approval History", "Initiate Renewal"]
    },
    rejected: {
      title: "Rejected Applications",
      subtitle: "Record of applications that were rejected, including decision reasons, regulatory findings, and available next steps.",
      overview: [
        { label: "Total Rejected", value: "145", icon: AlertTriangle, color: "red" },
        { label: "Resubmitted", value: "30", icon: History, color: "blue" },
        { label: "Appealed", value: "12", icon: AlertCircle, color: "orange" },
        { label: "Closed", value: "103", icon: Box, color: "slate" },
      ],
      actions: ["View Decision", "Review Findings", "Request Resubmission", "View Applicant Response", "Reopen Review"]
    },
    expired: {
      title: "Expired / Renewals",
      subtitle: "Manage permits approaching expiration, expired permits, and renewal applications.",
      overview: [
        { label: "Expiring Soon", value: "45", icon: Clock, color: "amber" },
        { label: "Expired", value: "120", icon: History, color: "red" },
        { label: "Pending Renewal", value: "35", icon: FileSearch, color: "blue" },
        { label: "Overdue", value: "18", icon: AlertTriangle, color: "orange" },
      ],
      actions: ["View Permit", "Start Renewal Review", "Request Updated Documents", "Verify Site Status", "🔄 Process Renewal"]
    }
  };

  const content = pageContent[currentStatus as keyof typeof pageContent] || pageContent.permits;

  // Filter applications based on tab (simple mock logic)
  const displayedApplications = MOCK_APPLICATIONS.filter(a => {
    if (currentStatus === 'submitted') return a.status === 'Submitted';
    if (currentStatus === 'review') return a.status === 'Under Review';
    if (currentStatus === 'conditional') return a.status === 'Conditional Approval';
    if (currentStatus === 'approved') return a.status === 'Approved';
    if (currentStatus === 'rejected') return a.status === 'Rejected';
    if (currentStatus === 'expired') return a.status === 'Expired';
    return true; // permits (all)
  });

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {TABS.map((tab) => {
          const isActive = currentStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(`/government/dashboard/applications/${tab.id}`)}
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
                placeholder="Search applications..." 
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
              {displayedApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#022C4F]/20 hover:shadow-md transition-all group bg-white">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">{application.project}</h4>
                      <p className="text-xs text-slate-500">{application.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-1/4">
                    <User size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{application.applicant}</span>
                  </div>

                  <div className="flex items-center gap-2 w-1/4">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{application.date}</span>
                  </div>

                  <div className="flex items-center gap-6 w-1/4 justify-end">
                    <div className="flex flex-col items-end">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1
                        ${application.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${application.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}
                        ${application.status === 'Under Review' ? 'bg-amber-100 text-amber-700' : ''}
                        ${application.status === 'Submitted' ? 'bg-blue-100 text-blue-700' : ''}
                        ${application.status === 'Expired' ? 'bg-slate-100 text-slate-700' : ''}
                        ${application.status === 'Conditional Approval' ? 'bg-teal-100 text-teal-700' : ''}
                      `}>
                        {application.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{application.type}</span>
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
              {displayedApplications.map((application) => (
                <div key={application.id} className="p-5 rounded-2xl border border-slate-100 hover:border-[#022C4F]/20 hover:shadow-lg transition-all group bg-white flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${application.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${application.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}
                        ${application.status === 'Under Review' ? 'bg-amber-100 text-amber-700' : ''}
                        ${application.status === 'Submitted' ? 'bg-blue-100 text-blue-700' : ''}
                        ${application.status === 'Expired' ? 'bg-slate-100 text-slate-700' : ''}
                        ${application.status === 'Conditional Approval' ? 'bg-teal-100 text-teal-700' : ''}
                      `}>
                        {application.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors mb-1">{application.project}</h4>
                  <p className="text-xs text-slate-500 mb-4">{application.id}</p>
                  
                  <div className="flex flex-col gap-2 mt-auto mb-4">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-600 line-clamp-1">{application.applicant}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-600 line-clamp-1">{application.date}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">{application.type}</span>
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
