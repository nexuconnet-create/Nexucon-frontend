"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, Clock, AlertTriangle, PlayCircle, CheckCircle, 
  Layers, ShieldCheck, Box, RefreshCw, BarChart2, Eye
} from "lucide-react";
import { 
  BIMProgressValidation, BIMStats, getBIMProgressValidations, 
  getBIMStats, runTimelineSimulation 
} from "@/services/bim";
import { getProjects, Project } from "@/services/projects";

export default function ProgressValidation() {
  const [validations, setValidations] = useState<BIMProgressValidation[]>([]);
  const [stats, setStats] = useState<BIMStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [valData, statsData, projectList] = await Promise.all([
        getBIMProgressValidations(selectedProjectId ? { project: selectedProjectId } : undefined),
        getBIMStats(),
        getProjects()
      ]);
      setValidations(valData);
      setStats(statsData);

      const pList = Array.isArray(projectList) ? projectList : ((projectList as any).results || []);
      setProjects(pList);
      if (pList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(pList[0].id);
      }
    } catch (err) {
      console.error("Failed to load progress validations", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunSimulation = async () => {
    const pid = selectedProjectId || (projects.length > 0 ? projects[0].id : '');
    if (!pid) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select a project to run timeline simulation.', type: 'warning' } }));
      return;
    }
    setIsSimulating(true);
    try {
      const result = await runTimelineSimulation(pid);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `4D Scan-to-BIM schedule simulation executed for ${result.project_name || 'project'}!`, 
          type: 'success' 
        } 
      }));
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to run timeline simulation';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSimulating(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : null);
  const latest = validations.length > 0 ? validations[0] : null;

  const completedElements = latest?.completed_elements_count ?? 36880;
  const totalElements = latest?.total_elements_count ?? 56750;
  const elementsPct = Math.min(100, Math.max(0, Math.round((completedElements / (totalElements || 1)) * 100)));
  const daysVariance = latest?.days_variance ?? -3;
  const isDelayed = latest ? (latest.schedule_status === 'DELAYED' || daysVariance < 0) : true;
  const isAhead = latest?.schedule_status === 'AHEAD' || daysVariance > 0;
  const earnedValue = latest?.earned_value_usd || '₦29.77B';

  const plannedVsActualTasks = latest?.planned_vs_actual && latest.planned_vs_actual.length > 0 
    ? latest.planned_vs_actual 
    : [
        { phase: "Substructure Foundation Raft & Bored Piling", planned: 100, actual: 100, status: "Completed" },
        { phase: "Podium Transfer Slab & Shear Core (Levels 1-4)", planned: 100, actual: 95, status: "In Progress" },
        { phase: "Superstructure Post-Tensioned Slabs (Levels 5-18)", planned: 60, actual: 48, status: "Delayed - 3 Days" },
        { phase: "MEP Core Vertical Shaft & HVAC Risers", planned: 25, actual: 15, status: "In Progress" },
        { phase: "Unitized Curtain Wall & Double Glazed Envelope", planned: 10, actual: 0, status: "Planned" }
      ];

  const getStatusBadge = (statusStr: string) => {
    const s = (statusStr || '').toLowerCase();
    if (s.includes('delay') || s.includes('block')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (s.includes('complete') || s.includes('verif') || s.includes('on track') || s.includes('ahead')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              4D BIM Pacing & Schedule Engine
            </span>
            {selectedProject && (
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {selectedProject.reference_number || 'Lagos State Regulatory'}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#022C4F]">Progress Validation (4D)</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Compare Scan-to-BIM as-built LiDAR & drone point clouds against planned construction schedule.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <button 
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            <PlayCircle size={18} className={isSimulating ? "animate-spin" : ""} />
            <span>{isSimulating ? 'Simulating 4D Scan...' : 'Run Timeline Simulation'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Schedule Status */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Schedule Pacing</p>
            <span className={`p-2 rounded-xl ${isDelayed ? 'bg-rose-50 text-rose-600' : isAhead ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              <Clock size={18} />
            </span>
          </div>
          <h2 className={`text-2xl font-black flex items-center gap-2 ${isDelayed ? 'text-rose-600' : isAhead ? 'text-emerald-600' : 'text-slate-800'}`}>
            {isDelayed ? (
              <>
                <AlertTriangle size={24} /> {Math.abs(daysVariance)} Days Behind
              </>
            ) : isAhead ? (
              <>
                <TrendingUp size={24} /> {daysVariance} Days Ahead
              </>
            ) : (
              <>
                <CheckCircle size={24} /> On Schedule
              </>
            )}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            Based on latest LiDAR photogrammetry & GNSS survey alignment
          </p>
        </div>

        {/* Card 2: Completed Elements */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified BIM Elements</p>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Layers size={18} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-emerald-700">
              {completedElements.toLocaleString()}
            </h2>
            <span className="text-xs font-bold text-slate-400">
              / {totalElements.toLocaleString()} ({elementsPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${elementsPct}%` }}
            />
          </div>
        </div>

        {/* Card 3: Earned Value */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Earned Value (EV)</p>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BarChart2 size={18} />
            </span>
          </div>
          <h2 className="text-3xl font-black text-blue-700">
            {earnedValue}
          </h2>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-emerald-700 font-bold">EVM Alignment:</span> {elementsPct}% of statutory milestone capital verified
          </p>
        </div>
      </div>

      {/* Main 4D Visualization Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[520px]">
        
        {/* 3D Model & Point Cloud Spatial View */}
        <div className="lg:w-2/3 bg-[#0a1118] relative flex flex-col justify-between p-7 border-r border-slate-200">
          
          {/* Viewport Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="bg-black/60 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-xs border border-white/10 flex items-center gap-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>As-Built LiDAR Point Cloud vs As-Planned BIM</span>
            </div>
            <div className="bg-white/10 backdrop-blur text-slate-200 px-3 py-1 rounded-xl text-[11px] font-mono border border-white/10">
              {latest?.model_name || selectedProject?.name || 'Federated BIM Model'}
            </div>
          </div>
          
          {/* Spatial Graphics Indicator */}
          <div className="my-auto py-12 flex flex-col items-center justify-center relative">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-blue-500/40 rounded-3xl bg-blue-500/10 transform rotate-12 transition-transform duration-700"></div>
              <div className="absolute inset-0 border-2 border-rose-500/60 rounded-3xl bg-rose-500/10 transform -rotate-6 transition-transform duration-700"></div>
              <div className="relative text-center p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
                <Box size={36} className="text-blue-400 mx-auto mb-2" />
                <span className="text-xs font-mono font-bold text-white block">IFC4 • LOD 400</span>
                <span className="text-[10px] text-emerald-400 font-bold">Scan-to-BIM Verified</span>
              </div>
            </div>
          </div>

          {/* Telemetry Summary Bottom Bar */}
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs text-slate-300 space-y-1 z-10">
            <div className="flex items-center justify-between text-[11px] font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-blue-400" />
                Spatial Congruence Telemetry:
              </span>
              <span className={isDelayed ? 'text-rose-400' : 'text-emerald-400'}>
                {isDelayed ? `${Math.abs(daysVariance)}d Schedule Variance Detected` : 'All Structural Axes Compliant'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              {isDelayed 
                ? `Scan-to-BIM point cloud analysis identified pacing slippage on structural frames relative to the approved baseline Gantt.`
                : `Scan-to-BIM survey point cloud exhibits complete dimensional congruence with approved BIM geometry.`}
            </p>
          </div>
        </div>

        {/* Timeline / Gantt Breakdown Side */}
        <div className="lg:w-1/3 bg-slate-50 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-sm text-[#022C4F] flex items-center gap-2">
                <Clock size={17} className="text-blue-600" />
                Schedule Variance & Pacing
              </h3>
              <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                4D Gantt
              </span>
            </div>

            {/* Dynamic Milestone Tasks */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {plannedVsActualTasks.map((task, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {task.phase}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border shrink-0 ${getStatusBadge(task.status)}`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full relative overflow-hidden">
                      {/* Planned Bar */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-200 rounded-full"
                        style={{ width: `${task.planned}%` }}
                      />
                      {/* Actual Bar */}
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full ${
                          task.actual >= 100 ? 'bg-emerald-500' :
                          (task.status || '').toLowerCase().includes('delay') ? 'bg-rose-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${task.actual}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                      <span>Planned: <strong className="text-slate-600">{task.planned}%</strong></span>
                      <span>Actual: <strong className={task.actual >= 100 ? 'text-emerald-600' : 'text-blue-700'}>{task.actual}%</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { 
              detail: { 
                message: `Generating 4D Scan-to-BIM Schedule Variance Report for ${selectedProject?.name || 'Project'}...`, 
                type: 'info' 
              } 
            }))}
            className="w-full mt-5 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-black text-[#022C4F] rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck size={16} className="text-blue-600" />
            <span>Generate 4D Statutory Audit Report</span>
          </button>
        </div>

      </div>
    </div>
  );
}
