"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Activity, CalendarDays, CheckCircle2, Circle, ArrowRight, 
  Flag, Calendar, Target, MoveRight, RefreshCw, ShieldCheck, 
  AlertTriangle, Clock, Layers, Download 
} from "lucide-react";
import { ProgressAnalyticsData, getProgressAnalytics } from "@/services/analytics";
import { generateAndDownloadDocument } from "@/utils/documentGenerator";

export default function ConstructionProgress() {
  const [data, setData] = useState<ProgressAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProgressAnalytics();
      setData(res);
    } catch (err) {
      console.error("Failed to load construction progress", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleExportProgress = async () => {
    try {
      const ref = `REP-EVM-${Math.floor(100 + Math.random() * 900)}`;
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Compiling Construction Progress & EVM Report...`, type: 'info' } 
      }));
      await generateAndDownloadDocument({
        title: "Construction Milestone Verification & Earned Value Report",
        reportReference: ref,
        format: "PDF",
        modules: ["Construction Progress & EVM", "Project Performance"],
        generatedBy: "Chief Project Verification Engineer"
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Progress Report "${ref}" downloaded successfully!`, type: 'success' } 
      }));
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to export progress report", type: 'error' } }));
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Activity className="text-blue-500" />
            Construction Progress &amp; EVM Verification
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track reported contractor progress versus government-verified milestone completions, schedule variances, and EVM metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={fetchProgress}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleExportProgress}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Progress Report</span>
          </button>
        </div>
      </div>

      {/* Progress Verification Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Planned Baseline Progress</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{data?.planned_progress_percentage || 76.5}%</span>
            <span className="text-xs font-bold text-blue-600">Approved Schedule</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-400 rounded-full" style={{ width: `${data?.planned_progress_percentage || 76.5}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contractor Reported Progress</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-blue-700">{data?.actual_progress_percentage || 68.2}%</span>
            <span className="text-xs font-bold text-amber-600">Lag: {data?.schedule_variance_percentage || -8.3}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${data?.actual_progress_percentage || 68.2}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-200/90 shadow-sm space-y-3">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Government Verified Progress</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-700">{data?.verified_progress_percentage || 65.0}%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck size={14} /> Official Inspection
            </span>
          </div>
          <div className="w-full h-2.5 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${data?.verified_progress_percentage || 65.0}%` }} />
          </div>
        </div>
      </div>

      {/* EVM Overview Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 mb-8">
        <h2 className="text-base font-black text-slate-900 mb-5">Earned Value Management (EVM) Financials</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400">Planned Value (PV)</span>
            <p className="text-xl font-black text-slate-900 mt-1">{data?.evm.planned_value || '₦4.52B'}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400">Earned Value (EV)</span>
            <p className="text-xl font-black text-emerald-700 mt-1">{data?.evm.earned_value || '₦4.12B'}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400">Actual Cost (AC)</span>
            <p className="text-xl font-black text-blue-700 mt-1">{data?.evm.actual_cost || '₦3.95B'}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400">Estimate at Completion</span>
            <p className="text-xl font-black text-slate-900 mt-1">{data?.evm.estimate_at_completion || '₦11.85B'}</p>
          </div>
        </div>
      </div>

      {/* Milestone Verification Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
        <h2 className="text-base font-black text-slate-900 mb-5">Statutory Construction Milestones Timeline</h2>

        <div className="space-y-4">
          {(data?.timeline || []).map((ms, i) => (
            <div key={ms.id || i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                ms.status === 'completed' 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : (ms.status === 'in-progress' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400')
              }`}>
                {ms.status === 'completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{ms.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    ms.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ms.verified ? 'Government Verified' : 'In Verification'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Target: {ms.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
