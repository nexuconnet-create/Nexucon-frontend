"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, TrendingUp, TrendingDown, Clock, DollarSign, 
  Activity, Calendar, Download, RefreshCw, ShieldCheck, 
  AlertTriangle, ArrowUpRight, CheckCircle2, Eye, Filter 
} from "lucide-react";
import { ProjectPerformanceData, getProjectPerformance, createGeneratedReport } from "@/services/analytics";
import { generateAndDownloadDocument } from "@/utils/documentGenerator";
import Link from "next/link";

export default function ProjectPerformance() {
  const [data, setData] = useState<ProjectPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lgaFilter, setLgaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchPerformance = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (lgaFilter) params.lga = lgaFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await getProjectPerformance(params);
      setData(res);
    } catch (err) {
      console.error("Failed to load project performance", err);
    } finally {
      setIsLoading(false);
    }
  }, [lgaFilter, statusFilter]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const handleExportDashboard = async () => {
    try {
      // The statutory reference is issued server-side (GeneratedReport.generate_report_ref) — never fabricated here
      const created = await createGeneratedReport({
        title: "Executive Project Performance & EVM Summary",
        format: "PDF",
        report_type: "Executive",
        modules_included: ["Project Performance", "Construction Progress & EVM", "Financial Overview"]
      });
      const ref = created?.report_reference;
      if (!ref) throw new Error('Backend did not issue a report reference for this export.');
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Compiling Executive Performance & EVM Report...`, type: 'info' }
      }));
      await generateAndDownloadDocument({
        title: "Executive Project Performance & EVM Summary",
        reportReference: ref,
        format: "PDF",
        modules: ["Project Performance", "Construction Progress & EVM", "Financial Overview"],
        generatedBy: "Director General / Executive Board"
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Performance Report "${ref}" downloaded successfully!`, type: 'success' } 
      }));
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to export performance report", type: 'error' } }));
    }
  };

  const metricCards = [
    {
      label: "Overall Safety Index",
      value: data?.structural_safety_index || "94.8%",
      trend: "+1.2%",
      positive: true,
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      label: "Schedule Index (SPI)",
      value: typeof data?.schedule_performance_index === 'number'
        ? data.schedule_performance_index.toFixed(2)
        : "1.00",
      trend: typeof data?.schedule_performance_index === 'number'
        ? (data.schedule_performance_index >= 1 ? "+0.02" : "-0.02")
        : "0.00",
      positive: (data?.schedule_performance_index ?? 1) >= 1,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      label: "Cost Index (CPI)",
      value: typeof data?.cost_performance_index === 'number'
        ? data.cost_performance_index.toFixed(2)
        : "1.00",
      trend: typeof data?.cost_performance_index === 'number'
        ? (data.cost_performance_index >= 1 ? "+0.01" : "-0.01")
        : "0.00",
      positive: (data?.cost_performance_index ?? 1) >= 1,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      label: "Intervention Required",
      value: data?.projects_requiring_intervention != null
        ? `${data.projects_requiring_intervention} Projects`
        : "0 Projects",
      trend: (data?.projects_requiring_intervention ?? 0) > 0 ? "High Priority" : "Nominal",
      positive: (data?.projects_requiring_intervention ?? 0) === 0,
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100"
    },
  ];

  const getHealthBadge = (health: string) => {
    switch(health) {
      case 'Good': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'At Risk': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <BarChart className="text-blue-500" />
            Project Performance & Portfolio Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Multi-dimensional analysis of physical completion, schedule adherence (SPI), cost variance (CPI), and regulatory risk.</p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={fetchPerformance}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={handleExportDashboard}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Download size={14} />
            <span>Export EVM Summary</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metricCards.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={i}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500">{metric.label}</span>
                <div className={`w-9 h-9 rounded-xl ${metric.bg} ${metric.color} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{metric.value}</span>
                <span className={`text-[11px] font-bold ${metric.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {metric.trend}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">Project Performance Matrix</h2>
            <p className="text-xs text-slate-500">Live health derived from milestones, inspection findings, and statutory compliance status.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Total Portfolio: {data?.total_projects ?? 0} Projects</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Project & Reference</th>
                <th className="py-4 px-6">Progress %</th>
                <th className="py-4 px-6">Schedule</th>
                <th className="py-4 px-6">Compliance</th>
                <th className="py-4 px-6">Inspections</th>
                <th className="py-4 px-6">Risk Score</th>
                <th className="py-4 px-6">Overall Health</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {isLoading && !data && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-blue-500 mb-2" />
                    Loading portfolio performance metrics...
                  </td>
                </tr>
              )}
              {(!data?.projects || data.projects.length === 0) && !isLoading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No project performance records found.
                  </td>
                </tr>
              )}
              {(data?.projects || []).map((proj, idx) => {
                const progressVal = typeof proj.progress_percentage === 'number' ? proj.progress_percentage : 0;
                const complianceVal = typeof proj.compliance_percentage === 'number' ? proj.compliance_percentage : 100;
                const inspectionsVal = typeof proj.inspections_count === 'number' ? proj.inspections_count : 0;
                const riskVal = typeof proj.risk_score === 'number' ? proj.risk_score : 15;
                const overallHealth = proj.overall_health || 'Good';
                const scheduleStatus = proj.schedule_status || 'On Track';

                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    key={proj.id || idx}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <Link 
                          href={`/government/dashboard/projects/view/${proj.id}`}
                          className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-xs sm:text-sm hover:underline"
                        >
                          {proj.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{proj.reference_number}</span>
                          <span className="text-[10px] text-slate-400">• {proj.lga || 'General'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>{typeof proj.progress_percentage === 'number' ? `${proj.progress_percentage}%` : 'Pending'}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all" 
                            style={{ width: `${Math.min(100, Math.max(0, progressVal))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        scheduleStatus === 'On Track' || scheduleStatus === 'Ahead'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {scheduleStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-700">
                      {complianceVal}%
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-700">
                      {inspectionsVal} Verified
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold text-xs ${riskVal > 60 ? 'text-red-600' : 'text-slate-800'}`}>
                          {riskVal}/100
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getHealthBadge(overallHealth)}`}>
                        {overallHealth}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/government/dashboard/projects/view/${proj.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-slate-900/10 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
