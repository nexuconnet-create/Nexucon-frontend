"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, AlertTriangle, ArrowRight, CheckCircle2, Clock, 
  Search, Filter, ShieldAlert, AlertOctagon, Check, Plus, 
  RefreshCw, Building2, Layers, ExternalLink, HardHat
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  SiteIssue, getSiteIssues, escalateSiteIssue, resolveSiteIssue 
} from "@/services/monitoring";
import { 
  BIMClash, getBIMClashes, convertClashToSiteIssue 
} from "@/services/bim";

export default function ConsolidatedIssuesHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "SITE" | "BIM">("ALL");
  const [siteIssues, setSiteIssues] = useState<SiteIssue[]>([]);
  const [bimClashes, setBimClashes] = useState<BIMClash[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [issues, clashes] = await Promise.all([
        getSiteIssues(),
        getBIMClashes()
      ]);
      setSiteIssues(issues || []);
      setBimClashes(clashes || []);
    } catch (err) {
      console.error("Failed to fetch consolidated issues", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEscalateSiteIssue = async (id: string) => {
    try {
      await escalateSiteIssue(id);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Site defect escalated to Enforcement Division.", type: "success" }
      }));
      fetchData();
    } catch {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Failed to escalate issue.", type: "error" }
      }));
    }
  };

  const handleResolveSiteIssue = async (id: string) => {
    try {
      await resolveSiteIssue(id, { notes: "Verified resolved during statutory surveillance." });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Site issue marked as resolved.", type: "success" }
      }));
      fetchData();
    } catch {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Failed to resolve issue.", type: "error" }
      }));
    }
  };

  const handleConvertClash = async (clashId: string) => {
    try {
      const res = await convertClashToSiteIssue(clashId);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: res.message || "Clash escalated to active site monitoring defect.", type: "success" }
      }));
      fetchData();
    } catch {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Failed to convert clash to site defect.", type: "error" }
      }));
    }
  };

  // Filter calculations
  const totalSiteOpen = siteIssues.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const totalBimOpen = bimClashes.filter(c => c.status !== 'RESOLVED').length;
  const criticalSiteCount = siteIssues.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const criticalBimCount = bimClashes.filter(c => c.severity === 'CRITICAL' && c.status !== 'RESOLVED').length;
  const totalCritical = criticalSiteCount + criticalBimCount;
  const totalOpen = totalSiteOpen + totalBimOpen;

  const filteredSiteIssues = siteIssues.filter(i => {
    const matchesSearch = 
      (i.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.project_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.issue_reference || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = severityFilter === "ALL" || i.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  const filteredBimClashes = bimClashes.filter(c => {
    const matchesSearch = 
      (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.project_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.primary_model_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.secondary_model_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.clash_reference || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = severityFilter === "ALL" || c.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-[11px] font-bold rounded-full uppercase tracking-wider">
              Statutory Oversight & Enforcement
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Multi-Domain Register</span>
          </div>
          <h1 className="text-2xl font-black text-[#022C4F] mt-1">Issues & Non-Conformances Hub</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Unified command interface consolidating <strong>BIM 3D Design Clashes</strong> and <strong>Field Site Physical Deficiencies</strong> across all regulated developments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push("/government/dashboard/monitoring/issues")}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HardHat size={14} className="text-amber-600" /> Site Defect Desk
          </button>
          <button
            onClick={() => router.push("/government/dashboard/bim/issues")}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Box size={14} className="text-blue-600" /> BIM Clash Desk
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Active Issues</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalOpen}</span>
            <span className="text-[11px] text-slate-400 font-semibold">Across BIM & Field surveillance</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">Critical Deficiencies</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{totalCritical}</span>
            <span className="text-[11px] text-rose-400 font-semibold">{criticalSiteCount} field, {criticalBimCount} BIM</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertOctagon size={22} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Field Site Defects</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{totalSiteOpen}</span>
            <span className="text-[11px] text-amber-500 font-semibold">Physical site inspections</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <HardHat size={22} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">BIM Design Clashes</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">{totalBimOpen}</span>
            <span className="text-[11px] text-blue-400 font-semibold">Digital model reviews</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Box size={22} />
          </div>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Registered ({totalOpen})
          </button>
          <button
            onClick={() => setActiveTab("SITE")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "SITE" ? "bg-white text-amber-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <HardHat size={13} className="text-amber-500" /> Field Site ({totalSiteOpen})
          </button>
          <button
            onClick={() => setActiveTab("BIM")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "BIM" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Box size={13} className="text-blue-500" /> BIM Clashes ({totalBimOpen})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search issues, projects, elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={fetchData}
            title="Refresh"
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-3">
          <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400">Loading statutory issue records...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Field Site Defects Section */}
          {(activeTab === "ALL" || activeTab === "SITE") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <h2 className="text-sm font-black text-[#022C4F] uppercase tracking-wider">
                    Physical Field Site Defects & Violations ({filteredSiteIssues.length})
                  </h2>
                </div>
                <button
                  onClick={() => router.push("/government/dashboard/monitoring/issues")}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Open Field Desk <ArrowRight size={13} />
                </button>
              </div>

              {filteredSiteIssues.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
                  No field site issues match the current filter.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredSiteIssues.slice(0, activeTab === "SITE" ? undefined : 5).map((issue) => (
                    <div
                      key={issue.id}
                      className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 uppercase">
                            Field Site
                          </span>
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
                        </div>

                        <h3 className="text-xs font-bold text-slate-900">{issue.title}</h3>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{issue.description}</p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Building2 size={12} className="text-blue-600" /> {issue.project_name || "General Development"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {issue.status !== 'RESOLVED' && issue.status !== 'CLOSED' && (
                          <>
                            {!issue.is_escalated && (
                              <button
                                onClick={() => handleEscalateSiteIssue(issue.id)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                              >
                                Escalate
                              </button>
                            )}
                            <button
                              onClick={() => handleResolveSiteIssue(issue.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={12} /> Resolve
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BIM Clashes Section */}
          {(activeTab === "ALL" || activeTab === "BIM") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <h2 className="text-sm font-black text-[#022C4F] uppercase tracking-wider">
                    Digital BIM Model Clashes & Deviations ({filteredBimClashes.length})
                  </h2>
                </div>
                <button
                  onClick={() => router.push("/government/dashboard/bim/issues")}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Open BIM Clash Desk <ArrowRight size={13} />
                </button>
              </div>

              {filteredBimClashes.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
                  No BIM clashes match the current filter.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredBimClashes.slice(0, activeTab === "BIM" ? undefined : 5).map((clash) => (
                    <div
                      key={clash.id}
                      className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 uppercase">
                            BIM Model
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {clash.clash_type || "HARD_CLASH"}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            clash.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                            clash.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            clash.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {clash.severity}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            clash.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {clash.status}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-900">{clash.title}</h3>
                        <p className="text-[11px] text-slate-500">
                          {clash.description || `Spatial collision between ${clash.primary_model_name || 'Primary Model'} and ${clash.secondary_model_name || 'Secondary System'}`}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Building2 size={12} className="text-blue-600" /> {clash.project_name || "BIM Development"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {clash.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleConvertClash(clash.id)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <HardHat size={12} /> Escalate to Field
                          </button>
                        )}
                        <button
                          onClick={() => router.push("/government/dashboard/bim/issues")}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Review in 3D
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
