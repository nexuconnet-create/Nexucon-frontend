"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  AlertTriangle, CheckCircle, Clock, Plus, Search, Filter, 
  MessageSquare, Paperclip, Box, Layers, ArrowRight, Eye, 
  ExternalLink, Check, AlertCircle, RefreshCw, ShieldAlert, Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BIMClash, BIMModel, getBIMClashes, getBIMModels, convertClashToSiteIssue } from "@/services/bim";
import RunClashMatrixModal from "@/components/dashboard/RunClashMatrixModal";

interface BIMIssueItem {
  id: string;
  title: string;
  discipline: "Structural vs MEP" | "Architectural vs Structural" | "HVAC vs Electrical" | "Scan-to-BIM Deviation" | "Fire Safety";
  modelName: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "converted_to_site_defect";
  assignee: string;
  reportedBy: string;
  date: string;
  commentsCount: number;
  attachmentsCount: number;
  location: string;
  clashDistance?: string;
}

const INITIAL_BIM_ISSUES: BIMIssueItem[] = [
  {
    id: "BIM-ISS-092",
    title: "Clash: Main Chilled Water Return Pipe vs Primary Transfer Girder",
    discipline: "Structural vs MEP",
    modelName: "Eko Atlantic Financial Tower - Level 4 Podium",
    severity: "critical",
    status: "open",
    assignee: "Engr. Sarah Jenkins (BIM Manager)",
    reportedBy: "Automated Navisworks Engine",
    date: "2 hours ago",
    commentsCount: 5,
    attachmentsCount: 3,
    location: "Grid C-4 / Level 04 Core",
    clashDistance: "0.240m Penetration"
  },
  {
    id: "BIM-ISS-093",
    title: "Thermal Anomaly & R-Value Code Variance in HVAC Core Duct",
    discipline: "HVAC vs Electrical",
    modelName: "Victoria Island Luxury Residences",
    severity: "high",
    status: "in_progress",
    assignee: "Robert Chen (Lead Inspector)",
    reportedBy: "Digital Eye AI Scan",
    date: "5 hours ago",
    commentsCount: 3,
    attachmentsCount: 2,
    location: "Shaft MEP-02 / Level 07",
    clashDistance: "Thermal Delta +4.2°C"
  },
  {
    id: "BIM-ISS-094",
    title: "Scan-to-BIM Deviation: Column C12 Cast Out of Plumb by 28mm",
    discipline: "Scan-to-BIM Deviation",
    modelName: "Ikoyi Imperial Heights",
    severity: "critical",
    status: "open",
    assignee: "David Rossi (Structural Lead)",
    reportedBy: "Tersus Rover RTK + PointCloud",
    date: "1 day ago",
    commentsCount: 8,
    attachmentsCount: 4,
    location: "Grid F-8 / Ground Floor",
    clashDistance: "+0.028m Out of Tolerance"
  },
  {
    id: "BIM-ISS-095",
    title: "Curtain Wall Bracket Anchor Clearance Clash with Pre-stressed Tendons",
    discipline: "Architectural vs Structural",
    modelName: "Lekki Free Trade Zone Warehouse Complex",
    severity: "medium",
    status: "in_progress",
    assignee: "Adeola Balogun (Façade Consultant)",
    reportedBy: "Revit Cloud Worksharing",
    date: "2 days ago",
    commentsCount: 2,
    attachmentsCount: 1,
    location: "Perimeter Beam B-102",
    clashDistance: "0.045m Soft Clash"
  },
  {
    id: "BIM-ISS-096",
    title: "Fire Sprinkler Main Branch vs Emergency Lighting Conduit",
    discipline: "Fire Safety",
    modelName: "Eko Atlantic Financial Tower",
    severity: "low",
    status: "resolved",
    assignee: "Fire Safety Directorate",
    reportedBy: "Statutory Model Auditor",
    date: "3 days ago",
    commentsCount: 4,
    attachmentsCount: 2,
    location: "Corridor 3B Ceiling Void",
    clashDistance: "Resolved via Rerouting"
  }
];

export default function BIMIssuesPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<BIMIssueItem[]>(INITIAL_BIM_ISSUES);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isClashMatrixModalOpen, setIsClashMatrixModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConvertToSiteDefect = (issueId: string) => {
    setIssues(prev => prev.map(iss => {
      if (iss.id === issueId) {
        return { ...iss, status: "converted_to_site_defect" };
      }
      return iss;
    }));

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: {
        message: `Issue ${issueId} escalated and converted into active statutory site defect in Site Monitoring!`,
        type: 'success'
      }
    }));
  };

  const filteredIssues = issues.filter(iss => {
    const matchesSearch = 
      iss.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === "ALL" || iss.severity.toUpperCase() === severityFilter.toUpperCase();
    const matchesStatus = statusFilter === "ALL" || iss.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const totalCritical = issues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const totalOpen = issues.filter(i => i.status === 'open').length;
  const totalConverted = issues.filter(i => i.status === 'converted_to_site_defect').length;
  const totalResolved = issues.filter(i => i.status === 'resolved').length;

  return (
    <div className="w-full min-h-screen pb-16 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 tracking-wider">
              BIM Model & Clash Management
            </span>
            <span className="text-xs text-slate-400 font-bold">Lagos State BIM Coordination</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#022C4F] mt-1">
            BIM Model Issues & Clash Detection
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Centralized coordination hub for 3D BIM model clashes, multi-disciplinary spatial interferences, Scan-to-BIM deviations, and direct conversion into physical site defect notices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/government/dashboard/monitoring/issues')}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle size={14} className="text-amber-500" /> Go to Site Monitoring Issues
          </button>
          
          <button 
            onClick={() => setIsClashMatrixModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-900/20 cursor-pointer"
          >
            <Sparkles size={16} className="text-blue-300" />
            <span>Run Clash Matrix</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open BIM Clashes</p>
            <h2 className="text-3xl font-black text-[#022C4F] mt-1">{totalOpen}</h2>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Pending multi-trade resolution</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Box size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Hard Clashes</p>
            <h2 className="text-3xl font-black text-rose-600 mt-1">{totalCritical}</h2>
            <p className="text-[11px] text-rose-500 font-semibold mt-0.5">Structural & MEP penetration</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldAlert size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Converted to Site Defect</p>
            <h2 className="text-3xl font-black text-amber-600 mt-1">{totalConverted}</h2>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Linked to Site Monitoring</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved & Cleared</p>
            <h2 className="text-3xl font-black text-emerald-600 mt-1">{totalResolved}</h2>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Statutory code compliant</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by clash ID, model, location or grid..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 bg-white" 
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (Hard Clash)</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low / Soft Clash</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CONVERTED_TO_SITE_DEFECT">Converted to Site Defect</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Issue Cards List */}
        <div className="divide-y divide-slate-100">
          {filteredIssues.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Box size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No BIM model issues match the selected filters.</p>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <div key={issue.id} className="p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex items-start gap-4 flex-1">
                  <div className="shrink-0 mt-0.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      issue.severity === 'critical' ? 'bg-rose-100 text-rose-600' :
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                      issue.severity === 'medium' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <AlertTriangle size={22}/>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-black text-[#022C4F]">{issue.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                        {issue.discipline}
                      </span>
                      {issue.clashDistance && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-100">
                          {issue.clashDistance}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-[#022C4F] group-hover:text-blue-600 transition-colors text-base leading-snug">
                      {issue.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Box size={13} className="text-blue-600" /> {issue.modelName}
                      </span>
                      <span>•</span>
                      <span>Location: <strong className="text-slate-700">{issue.location}</strong></span>
                      <span>•</span>
                      <span>Assigned to: <strong className="text-slate-700">{issue.assignee}</strong></span>
                      <span>•</span>
                      <span className="text-slate-400 flex items-center gap-1"><Clock size={12}/> {issue.date}</span>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                        issue.status === 'open' ? 'bg-rose-100 text-rose-700' :
                        issue.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                        issue.status === 'converted_to_site_defect' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {issue.status.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                        <MessageSquare size={13}/> {issue.commentsCount} comments
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                        <Paperclip size={13}/> {issue.attachmentsCount} BCF attachments
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Center */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => router.push('/government/dashboard/bim/models')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Box size={14} className="text-blue-600" /> View in 3D BIM
                  </button>

                  {issue.status !== 'converted_to_site_defect' && issue.status !== 'resolved' && (
                    <button
                      onClick={() => handleConvertToSiteDefect(issue.id)}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertTriangle size={14} className="text-amber-600" /> Convert to Site Defect
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clash Matrix Runner Modal */}
      <RunClashMatrixModal
        isOpen={isClashMatrixModalOpen}
        onClose={() => setIsClashMatrixModalOpen(false)}
        onSuccess={() => {
          setIsClashMatrixModalOpen(false);
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'BIM Clash Matrix executed successfully across all active models!', type: 'success' }
          }));
        }}
      />
    </div>
  );
}
