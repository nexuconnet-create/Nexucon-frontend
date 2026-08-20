"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, Clock, AlertTriangle, PlayCircle, CheckCircle, RefreshCw } from "lucide-react";
import { BIMProgressValidation, BIMStats, getBIMProgressValidations, getBIMStats, runTimelineSimulation } from "@/services/bim";
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
        getBIMProgressValidations(),
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
    if (!selectedProjectId) return;
    setIsSimulating(true);
    try {
      await runTimelineSimulation(selectedProjectId);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: '4D Scan-to-BIM schedule simulation executed successfully!', type: 'success' } 
      }));
      fetchData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to run timeline simulation', type: 'error' } }));
    } finally {
      setIsSimulating(false);
    }
  };

  const latest = validations.length > 0 ? validations[0] : null;

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Progress Validation (4D)</h1>
          <p className="text-gray-500 mt-1">Compare Scan-to-BIM as-built LiDAR data against planned project schedule.</p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <button 
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20 text-sm font-semibold"
          >
            <PlayCircle size={18} className={isSimulating ? "animate-spin" : ""} />
            <span>{isSimulating ? 'Simulating...' : 'Run Timeline Simulation'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Overall Schedule Status</p>
          <h2 className="text-2xl font-bold text-rose-600 mt-2 flex items-center gap-2">
            <AlertTriangle size={24}/> {latest ? `${Math.abs(latest.days_variance)} Days Behind` : '3 Days Behind'}
          </h2>
          <p className="text-xs text-gray-400 mt-2">Based on latest LiDAR & Drone photogrammetry scan</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Completed Elements</p>
          <h2 className="text-3xl font-bold text-emerald-600 mt-2">
            {latest ? latest.completed_elements_count.toLocaleString() : '4,205'}
          </h2>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[45%]"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Earned Value (EV)</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {latest ? latest.earned_value_usd : '$2.4M'}
          </h2>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 text-emerald-500">
            <TrendingUp size={14}/> 4% above planned baseline
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
        {/* 3D Viewer Side */}
        <div className="lg:w-2/3 bg-slate-900 relative flex flex-col items-center justify-center p-8 border-r border-gray-100">
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-xl text-xs border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> As-Built (LiDAR Scan) vs As-Planned (BIM)
          </div>
          
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 border-4 border-blue-500/30 transform rotate-12 rounded-2xl bg-blue-500/10 transition-transform"></div>
            <div className="absolute inset-0 border-4 border-rose-500/50 transform -rotate-6 rounded-2xl bg-rose-500/10"></div>
          </div>
          <p className="text-slate-300 mt-8 text-sm font-bold">Visualizing Spatial Deviation</p>
          <p className="text-slate-400 text-xs mt-1">Concrete columns on Floor 3 are delayed relative to baseline Gantt.</p>
        </div>

        {/* Timeline/Gantt Side */}
        <div className="lg:w-1/3 bg-slate-50 p-6 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
            <Clock size={18} className="text-blue-500"/> Schedule Variance & Pacing
          </h3>
          
          <div className="flex-1 space-y-6">
            {/* Task 1 */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-800">Foundation Pour</span>
                <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">On Track</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full relative">
                <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full w-full"></div>
              </div>
            </div>

            {/* Task 2 */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-800">Steel Framing (L1-L3)</span>
                <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Completed</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full relative">
                <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full w-full"></div>
              </div>
            </div>
            
            {/* Task 3 */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-800">Concrete Core (L4)</span>
                <span className="text-rose-600 bg-rose-100 px-2 py-0.5 rounded">Delayed - 3 Days</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full relative">
                <div className="absolute top-0 left-0 h-full bg-blue-300 rounded-full w-[80%]"></div>
                <div className="absolute top-0 left-0 h-full bg-rose-500 rounded-full w-[60%]"></div>
              </div>
              <p className="text-[11px] text-gray-500 mt-2 text-right">Planned: 80% • Actual: 60%</p>
            </div>
          </div>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Generating 4D Schedule Variance PDF Report...', type: 'info' } }))}
            className="w-full mt-6 py-2.5 bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Generate Variance Report
          </button>
        </div>
      </div>
    </div>
  );
}
