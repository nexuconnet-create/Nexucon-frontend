"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, TrendingDown, TrendingUp, Wallet, 
  Receipt, CreditCard, RefreshCw, Lock, ShieldCheck, Download 
} from "lucide-react";
import { FinancialAnalyticsData, getFinancialAnalytics } from "@/services/analytics";
import { generateAndDownloadDocument } from "@/utils/documentGenerator";

export default function FinancialOverview() {
  const [financials, setFinancials] = useState<FinancialAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchFinancials = useCallback(async () => {
    setIsLoading(true);
    setIsForbidden(false);
    try {
      const data = await getFinancialAnalytics();
      setFinancials(data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsForbidden(true);
      } else {
        console.error("Failed to load financial summary", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  const handleExportFinancial = async () => {
    try {
      const ref = `REP-FIN-${Math.floor(100 + Math.random() * 900)}`;
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Generating Financial & Capex Audit Report...`, type: 'info' } 
      }));
      await generateAndDownloadDocument({
        title: "Statutory Capital Expenditure & Revenue Collection Report",
        reportReference: ref,
        format: "PDF",
        modules: ["Financial Overview", "Project Performance"],
        generatedBy: "Director of Financial Planning & Regulatory Revenue"
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Financial Report "${ref}" downloaded successfully!`, type: 'success' } 
      }));
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to export financial report", type: 'error' } }));
    }
  };

  if (isForbidden) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Restricted Financial Intelligence</h2>
        <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
          Access to Financial &amp; Revenue Analytics requires authorized financial directorate credentials.
        </p>
        <button
          onClick={fetchFinancials}
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
            <DollarSign className="text-emerald-500" />
            Financial &amp; Revenue Overview
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            High-level oversight of regulatory fee collections, project committed budgets, and expenditure.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={fetchFinancials}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleExportFinancial}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Financial Report</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Approved Portfolio Budget</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{financials?.total_portfolio_budget || '₦48.5B'}</p>
          <span className="text-[11px] font-bold text-blue-600 mt-1 block">
            Committed: {financials?.committed_value || '₦41.2B'}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Reported Expenditure</span>
          <p className="text-3xl font-black text-blue-700 mt-2">{financials?.reported_expenditure || '₦37.4B'}</p>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
            Remaining: {financials?.remaining_budget || '₦11.1B'}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
          <span className="text-xs font-bold text-emerald-800">Regulatory Collections</span>
          <p className="text-3xl font-black text-emerald-700 mt-2">{financials?.regulatory_revenue_collected || '₦428.5M'}</p>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
            Efficiency: {financials?.collection_efficiency || '96.4%'}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-red-100 shadow-sm">
          <span className="text-xs font-bold text-red-800">Enforcement Penalties</span>
          <p className="text-3xl font-black text-red-700 mt-2">{financials?.enforcement_penalties || '₦34.2M'}</p>
          <span className="text-[11px] font-bold text-red-600 mt-1 block">
            Outstanding: {financials?.outstanding_dues || '₦18.4M'}
          </span>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">Capital Expenditure by Construction Trade</h2>
        </div>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">Discipline / Phase</th>
              <th className="py-4 px-6">Allocated Budget</th>
              <th className="py-4 px-6">Actual Spend</th>
              <th className="py-4 px-6 text-right">Variance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {(financials?.category_breakdown || []).map((cat, i) => (
              <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900">{cat.name}</td>
                <td className="py-4 px-6 font-bold text-slate-700">₦{cat.budget.toFixed(1)}M</td>
                <td className="py-4 px-6 font-bold text-blue-700">₦{cat.actual.toFixed(1)}M</td>
                <td className="py-4 px-6 text-right">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    cat.status === 'under' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {cat.status === 'under' ? 'Under Budget' : 'Over Budget'}
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
