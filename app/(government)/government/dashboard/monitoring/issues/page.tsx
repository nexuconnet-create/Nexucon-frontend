"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  AlertTriangle, CheckCircle2, Clock, Search, Filter, 
  ArrowUpRight, ShieldAlert, Check, Plus, RefreshCw,
  Building2, MapPin, Calendar, User, AlertOctagon, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  SiteIssue, getSiteIssues, escalateSiteIssue, resolveSiteIssue, createSiteIssue 
} from "@/services/monitoring";
import { getProjects, Project } from "@/services/projects";

export default function MonitoringSiteIssuesPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<SiteIssue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // New Issue Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSeverity, setNewSeverity] = useState("MEDIUM");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [issueList, projectList] = await Promise.all([
        getSiteIssues(),
        getProjects()
      ]);
      setIssues(issueList || []);
      setProjects(projectList || []);
    } catch (err) {
      console.error("Failed to load site issues", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEscalate = async (issueId: string) => {
    try {
      await escalateSiteIssue(issueId, { notes: "Escalated for immediate senior enforcement review." });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Site defect escalated to Enforcement Division.", type: "success" }
      }));
      fetchData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Failed to escalate issue.", type: "error" }
      }));
    }
  };

  const handleResolve = async (issueId: string) => {
    try {
      await resolveSiteIssue(issueId, { notes: "Rectification verified by site inspection officer." });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Site issue marked as resolved.", type: "success" }
      }));
      fetchData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Failed to resolve issue.", type: "error" }
      }));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject || !newTitle.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Project and title are required.", type: "error" }
      }));
      return;
    }
    setIsSubmitting(true);
    try {
      await createSiteIssue({
        project: newProject,
        title: newTitle,
        description: newDesc,
        severity: newSeverity,
        assigned_to_name: newAssignee,
        due_date: newDueDate || undefined
      });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Site defect registered successfully.", type: "success" }
      }));
      setIsModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewAssignee("");
      setNewDueDate("");
      fetchData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Failed to create site issue.", type: "error" }
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      (issue.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.project_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.issue_reference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === "ALL" || issue.severity === severityFilter;
    const matchesStatus = statusFilter === "ALL" || issue.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const openCount = issues.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;
  const resolvedCount = issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-full uppercase tracking-wider">
              Field Site Monitoring
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Live Enforcement Registry</span>
          </div>
          <h1 className="text-2xl font-black text-[#022C4F] mt-1">Field Site Issues & Non-Conformances</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Track, escalate, and verify resolution for physical non-conformances, safety violations, and structural defects discovered during on-site surveillance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/government/dashboard/issues")}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            Consolidated Hub
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} /> Log Site Defect
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Open Issues</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">{openCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">Critical Safety Defects</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{criticalCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertOctagon size={22} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Resolved & Cleared</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{resolvedCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by defect title, project name, or reference code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <button
            onClick={fetchData}
            title="Refresh issues"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-3">
            <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading statutory field site issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-3">
            <ShieldAlert size={32} className="text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No field site defects found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No issues match your current filter settings or search criteria.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                    {issue.issue_reference || "DEF-REC"}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    issue.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    issue.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    issue.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {issue.severity}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    issue.status === 'RESOLVED' || issue.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                    issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {issue.status}
                  </span>
                  {issue.is_escalated && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white uppercase animate-pulse">
                      Escalated to Enforcement
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{issue.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{issue.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Building2 size={13} className="text-blue-600" /> {issue.project_name || "General Development"}
                  </span>
                  {issue.assigned_to_name && (
                    <span className="flex items-center gap-1">
                      <User size={13} className="text-slate-400" /> Assigned: {issue.assigned_to_name}
                    </span>
                  )}
                  {issue.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" /> Rectification Due: {new Date(issue.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {issue.status !== 'RESOLVED' && issue.status !== 'CLOSED' && (
                  <>
                    {!issue.is_escalated && (
                      <button
                        onClick={() => handleEscalate(issue.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                      >
                        Escalate
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(issue.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={13} /> Mark Resolved
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Site Defect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#022C4F]">Log Field Site Non-Conformance</h3>
                <p className="text-xs text-slate-500">Record a statutory defect or physical violation observed on-site</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Target Development Project *</label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="">Select Project</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.reference_number || proj.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Defect Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Inadequate setback clearance on eastern boundary"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                >
                </input>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none"
                  >
                    <option value="CRITICAL">Critical (Stop Work Risk)</option>
                    <option value="HIGH">High (Structural/Safety)</option>
                    <option value="MEDIUM">Medium (Procedural)</option>
                    <option value="LOW">Low (Minor Notice)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Rectification Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Assigned Developer / Contractor</label>
                <input
                  type="text"
                  placeholder="e.g., Lead Site Engineer / Project Manager"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Detailed Description & Evidence Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe the exact statutory violation, measured deviation, or safety hazard..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Registering..." : "Register Site Defect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
