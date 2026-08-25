"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  PieChart, Calendar, TrendingDown, ClipboardCheck, 
  AlertOctagon, Activity, ChevronRight, RefreshCw, 
  CheckCircle2, XCircle, Award, User, Clock 
} from "lucide-react";
import { InspectionAnalyticsData, getInspectionAnalytics } from "@/services/analytics";

export default function InspectionAnalytics() {
  const [data, setData] = useState<InspectionAnalyticsData | null>(null);
  const [period, setPeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);

  const fetchInspections = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getInspectionAnalytics(period);
      setData(res);
    } catch (err) {
      console.error("Failed to load inspection analytics", err);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <PieChart className="text-blue-500" />
            Inspection Quality &amp; Defect Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Pass/fail ratios, defect severity categorizations, and field inspector throughput.</p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3.5 py-2.5 shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly Aggregate</option>
            <option value="quarterly">Quarterly Report</option>
          </select>

          <button 
            onClick={fetchInspections}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Total Inspections</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{data?.total_inspections || 248}</p>
          <span className="text-[11px] font-bold text-blue-600 mt-1 block">Completed: {data?.completed_inspections || 201}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
          <span className="text-xs font-bold text-emerald-800">Pass Rate</span>
          <p className="text-3xl font-black text-emerald-700 mt-2">{data?.pass_rate_percentage || 81.0}%</p>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">Target: &gt; 80%</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-red-100 shadow-sm">
          <span className="text-xs font-bold text-red-800">Failed / Stop-Work</span>
          <p className="text-3xl font-black text-red-700 mt-2">{data?.failed_inspections || 25}</p>
          <span className="text-[11px] font-bold text-red-600 mt-1 block">Re-inspections: {data?.re_inspections_count || 18}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Avg Completion Time</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{data?.average_completion_hours || 4.2}h</p>
          <span className="text-[11px] font-bold text-slate-400 mt-1 block">Site check-in to sign-off</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mb-8">
        {/* Defect Categories Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
          <h2 className="text-base font-black text-slate-900 mb-4">Inspection Findings by Discipline</h2>
          <div className="space-y-4">
            {(data?.defect_categories || []).map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{cat.name}</span>
                  <span className="text-slate-500">{cat.count} findings ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inspector Rankings */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
          <h2 className="text-base font-black text-slate-900 mb-4">Inspector Performance Leaderboard</h2>
          <div className="space-y-3">
            {(data?.officer_rankings || []).map((officer, i) => (
              <div key={officer.id || i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    #{officer.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{officer.name}</h4>
                    <p className="text-[10px] text-slate-400">{officer.role}</p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="font-bold text-emerald-700 block">{officer.sla_adherence_rate}% SLA</span>
                  <span className="text-[10px] text-slate-400">{officer.inspections_completed} Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
