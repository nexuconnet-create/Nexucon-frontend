"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Activity, Map, Building2, TrendingUp, AlertTriangle, 
  MapPin, Users, Target, Download, RefreshCw, Lock, ShieldAlert, Award 
} from "lucide-react";
import { IndustryAnalyticsData, getIndustryAnalytics, createGeneratedReport } from "@/services/analytics";

export default function IndustryPerformancePage() {
  const [data, setData] = useState<IndustryAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchIndustry = useCallback(async () => {
    setIsLoading(true);
    setIsForbidden(false);
    try {
      const res = await getIndustryAnalytics();
      setData(res);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsForbidden(true);
      } else {
        console.error("Failed to load industry analytics", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndustry();
  }, [fetchIndustry]);

  const handleExportIndustryReport = async () => {
    try {
      const rep = await createGeneratedReport({
        title: "Industry Performance & Sector Benchmark Report",
        format: "PDF",
        modules_included: ["Project Performance", "Compliance & Regulatory"]
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Report "${rep.report_reference}" generated! Downloading...`, type: 'success' } 
      }));
      if (rep.file_url) window.open(rep.file_url, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  if (isForbidden) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Restricted Government Intelligence</h2>
        <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
          Access to Industry Performance and Sector Benchmarking requires the <span className="font-mono font-bold text-slate-800">analytics.view_industry</span> permission. Contact your system administrator or directorate lead for access authorization.
        </p>
        <button
          onClick={fetchIndustry}
          className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Retry Authorization Check
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <BarChart className="text-blue-500" />
            Industry Performance &amp; Sector Intelligence
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Macro analysis of construction sectors, LGA geographic hotspots, and tier-1 contractor compliance benchmarking.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={fetchIndustry}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleExportIndustryReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Industry Report</span>
          </button>
        </div>
      </div>

      {/* Sector Distribution Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 mb-8">
        <h2 className="text-base font-black text-slate-900 mb-4">Construction Sector Distribution &amp; Compliance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.sector_distribution || []).map((sec, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">{sec.sector}</span>
                <span className="text-xs font-black text-blue-700">{sec.share_percentage}%</span>
              </div>
              <p className="text-[11px] text-slate-500">{sec.projects_count.toLocaleString()} Active Projects</p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Avg Compliance</span>
                <span className="font-bold text-emerald-700">{sec.avg_compliance}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LGA Hotspots & Contractor Benchmarking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* LGA Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
          <h2 className="text-base font-black text-slate-900 mb-4">Geographic Distribution (Lagos LGAs)</h2>
          <div className="space-y-3">
            {(data?.lga_distribution || []).map((lga, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{lga.lga}</h4>
                  <p className="text-[10px] text-slate-400">{lga.projects_count.toLocaleString()} Projects</p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-emerald-700 block">{lga.compliance_rate}% Compliance</span>
                  <span className={`text-[10px] font-bold ${lga.risk_level === 'High' ? 'text-red-600' : 'text-slate-400'}`}>
                    {lga.risk_level} Risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contractor Benchmarking Leaderboard */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
          <h2 className="text-base font-black text-slate-900 mb-4">Contractor Compliance Leaderboard</h2>
          <div className="space-y-3">
            {(data?.contractor_benchmarking || []).map((cb, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    #{cb.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{cb.contractor}</h4>
                    <p className="text-[10px] text-slate-400">{cb.projects} Monitored Projects</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-emerald-700 block">{cb.compliance_rating}</span>
                  <span className="text-[10px] text-slate-400">Statutory Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
