"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  FileText, ShieldCheck, Leaf, AlertTriangle, Download, 
  Filter, TrendingUp, CalendarDays, RefreshCw, ArrowUpRight, 
  CheckCircle2, XCircle, Clock, ShieldAlert 
} from "lucide-react";
import { ComplianceAnalyticsData, getComplianceAnalytics, createGeneratedReport } from "@/services/analytics";
import Link from "next/link";

export default function ComplianceReportsAnalytics() {
  const [data, setData] = useState<ComplianceAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompliance = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getComplianceAnalytics();
      setData(res);
    } catch (err) {
      console.error("Failed to load compliance analytics", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  const handleExportComplianceReport = async () => {
    try {
      const rep = await createGeneratedReport({
        title: "Statutory Compliance & Regulatory Enforcement Report",
        format: "PDF",
        modules_included: ["Compliance & Regulatory", "Inspection Analytics"]
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Report "${rep.report_reference}" generated! Downloading...`, type: 'success' } 
      }));
      if (rep.file_url) window.open(rep.file_url, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldCheck className="text-emerald-500" />
            Compliance &amp; Regulatory Enforcement Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track portfolio statutory compliance adherence, open non-conformance reports (NCRs), and expiring fitness certificates.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={fetchCompliance}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleExportComplianceReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Compliance Report</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
          <span className="text-xs font-bold text-emerald-800">Compliance Rate</span>
          <p className="text-3xl font-black text-emerald-700 mt-2">{data?.compliance_rate_percentage || 83.3}%</p>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
            Compliant: {data?.compliant_projects_count || 20} Projects
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-red-100 shadow-sm">
          <span className="text-xs font-bold text-red-800">Critical Open NCRs</span>
          <p className="text-3xl font-black text-red-700 mt-2">{data?.critical_ncrs_count || 3}</p>
          <span className="text-[11px] font-bold text-red-600 mt-1 block">
            Total Open: {data?.open_ncrs_count || 8} NCRs
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm">
          <span className="text-xs font-bold text-amber-800">Overdue CAPAs</span>
          <p className="text-3xl font-black text-amber-700 mt-2">{data?.corrective_actions_overdue || 4}</p>
          <span className="text-[11px] font-bold text-amber-600 mt-1 block">
            Total Action Tasks: {data?.corrective_actions_total || 18}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Expiring Certificates</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{data?.compliance_certificates_expiring_soon || 6}</p>
          <span className="text-[11px] font-bold text-slate-400 mt-1 block">
            Valid Vault: {data?.compliance_certificates_valid || 142} Active
          </span>
        </div>
      </div>

      {/* Operational Drill-Down Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-slate-900">Non-Conformance Reports (NCR) Queue</h2>
              <span className="px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-bold">
                {data?.open_ncrs_count || 8} Active Deviations
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Investigate specific structural, safety, or environmental deviations flagged during inspections and site monitoring.
            </p>
          </div>
          <Link
            href="/government/dashboard/compliance/non-conformances"
            className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Open NCR Management Console</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-slate-900">Corrective Actions (CAPA) Kanban</h2>
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-bold">
                {data?.corrective_actions_total || 18} Tracked Tasks
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Track task workflows and statutory corrective actions to close compliance deviations through drag-and-drop Kanban.
            </p>
          </div>
          <Link
            href="/government/dashboard/compliance/corrective-actions"
            className="w-full py-3 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Open CAPA Kanban Board</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
