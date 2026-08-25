"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Building, Clock, Users, Activity, TrendingDown, 
  CheckCircle2, MoreHorizontal, RefreshCw, ShieldCheck 
} from "lucide-react";
import { AgencyAnalyticsData, getAgencyPerformance } from "@/services/analytics";

export default function AgencyPerformance() {
  const [data, setData] = useState<AgencyAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgencyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAgencyPerformance();
      setData(res);
    } catch (err) {
      console.error("Failed to load agency performance", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencyData();
  }, [fetchAgencyData]);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Building className="text-blue-500" />
            Agency Operational SLAs &amp; Reviewer Performance
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track statutory permit turnaround, inspection completion rates, and departmental workload distribution.
          </p>
        </div>

        <button 
          onClick={fetchAgencyData}
          className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors self-start md:self-auto cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Permit Review SLA</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{data?.permit_review_sla_days || 4.2} Days</p>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">Target: &lt; 5.0 Days</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
          <span className="text-xs font-bold text-emerald-800">Inspection Completion</span>
          <p className="text-3xl font-black text-emerald-700 mt-2">{data?.inspection_completion_rate || 92.4}%</p>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">SLA Adherence</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Approval Turnaround</span>
          <p className="text-3xl font-black text-blue-700 mt-2">{data?.approval_turnaround_days || 3.8} Days</p>
          <span className="text-[11px] font-bold text-blue-600 mt-1 block">Directorate Sign-off</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Active Workload</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{data?.active_workload_items || 56}</p>
          <span className="text-[11px] font-bold text-slate-400 mt-1 block">Assigned Items in Queue</span>
        </div>
      </div>

      {/* Department Workload Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">Departmental Turnaround &amp; Efficiency Breakdown</h2>
        </div>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">Department Name</th>
              <th className="py-4 px-6">Avg Turnaround</th>
              <th className="py-4 px-6">Target SLA</th>
              <th className="py-4 px-6">Efficiency %</th>
              <th className="py-4 px-6 text-right">Active Queue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {(data?.departments || []).map((dept, i) => (
              <tr key={dept.id || i} className="hover:bg-blue-50/30 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900">{dept.name}</td>
                <td className="py-4 px-6 font-bold text-slate-700">{dept.turnaround_days} Days</td>
                <td className="py-4 px-6 font-medium text-slate-400">{dept.target_days} Days</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-700">{dept.efficiency_percentage}%</span>
                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${dept.efficiency_percentage}%` }} />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {dept.pending_reviews_count} Pending
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
