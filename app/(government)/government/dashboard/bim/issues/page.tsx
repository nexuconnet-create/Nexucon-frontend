"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  AlertTriangle, CheckCircle, Clock, Plus, Search, Filter, 
  MessageSquare, Paperclip, Box, Layers, ArrowRight, Eye, 
  ExternalLink, Check, AlertCircle, RefreshCw, ShieldAlert, Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  BIMClash, BIMModel, getBIMClashes, getBIMModels, convertClashToSiteIssue 
} from "@/services/bim";
import RunClashMatrixModal from "@/components/dashboard/RunClashMatrixModal";

export default function BIMIssuesPage() {
  const router = useRouter();
  const [clashes, setClashes] = useState<BIMClash[]>([]);
  const [models, setModels] = useState<BIMModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isClashMatrixModalOpen, setIsClashMatrixModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clashList, modelList] = await Promise.all([
        getBIMClashes(),
        getBIMModels()
      ]);
      setClashes(clashList);
      setModels(modelList);
    } catch (err) {
      console.error("Failed to load BIM clashes & issues", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConvertToSiteDefect = async (clashId: string) => {
    try {
      const res = await convertClashToSiteIssue(clashId);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: res.message || `Clash escalated and converted into active statutory site defect in Site Monitoring!`,
          type: 'success'
        }
      }));
      fetchData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to convert clash into site defect', type: 'error' }
      }));
    }
  };

  const filteredClashes = clashes.filter(clash => {
    const matchesSearch = 
      clash.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (clash.clash_reference && clash.clash_reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (clash.primary_model_name && clash.primary_model_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (clash.description && clash.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (clash.assigned_to_name && clash.assigned_to_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity = severityFilter === "ALL" || clash.severity.toUpperCase() === severityFilter.toUpperCase();
    const matchesStatus = statusFilter === "ALL" || clash.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const totalCritical = clashes.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const totalOpen = clashes.filter(i => i.status === 'OPEN').length;
  const totalConverted = clashes.filter(i => i.status === 'CONVERTED_TO_ISSUE').length;
  const totalResolved = clashes.filter(i => i.status === 'RESOLVED').length;

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
            onClick={fetchData}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

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
              placeholder="Search by clash ID, title, model, or assignee..." 
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
              <option value="IN_REVIEW">In Review</option>
              <option value="CONVERTED_TO_ISSUE">Converted to Site Defect</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Issue Cards List */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-bold">Loading BIM model issues from database...</p>
            </div>
          ) : filteredClashes.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Box size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No BIM model issues match the selected filters.</p>
              <button 
                onClick={() => setIsClashMatrixModalOpen(true)}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
              >
                Run Clash Detection
              </button>
            </div>
          ) : (
            filteredClashes.map(clash => (
              <div key={clash.id} className="p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex items-start gap-4 flex-1">
                  <div className="shrink-0 mt-0.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      clash.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-600' :
                      clash.severity === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                      clash.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <AlertTriangle size={22}/>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-black text-[#022C4F]">{clash.clash_reference || 'CLS-BIM'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                        {clash.assigned_discipline || 'MEP'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                        {clash.clash_type.replace(/_/g, ' ')}
                      </span>
                      {clash.coordinates_3d && Object.keys(clash.coordinates_3d).length > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                          X:{clash.coordinates_3d.x} Y:{clash.coordinates_3d.y} Z:{clash.coordinates_3d.z}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-[#022C4F] group-hover:text-blue-600 transition-colors text-base leading-snug">
                      {clash.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {clash.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 pt-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Box size={13} className="text-blue-600" /> {clash.primary_model_name || 'Primary Model'}
                      </span>
                      {clash.secondary_model_name && (
                        <>
                          <span>vs</span>
                          <span className="font-semibold text-slate-700">{clash.secondary_model_name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Assigned: <strong className="text-slate-700">{clash.assigned_to_name}</strong></span>
                      <span>•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock size={12}/> {new Date(clash.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                        clash.status === 'OPEN' ? 'bg-rose-100 text-rose-700' :
                        clash.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-700' :
                        clash.status === 'CONVERTED_TO_ISSUE' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {clash.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Center */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => router.push('/government/dashboard/bim/review')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Box size={14} className="text-blue-600" /> View in 3D BIM
                  </button>

                  {clash.status !== 'CONVERTED_TO_ISSUE' && clash.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleConvertToSiteDefect(clash.id)}
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
          fetchData();
        }}
      />
    </div>
  );
}
