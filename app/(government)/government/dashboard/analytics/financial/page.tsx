"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, TrendingUp, Wallet, Receipt, CreditCard, RefreshCw } from "lucide-react";
import { FinancialSummary, getFinancialSummary } from "@/services/analytics";

export default function FinancialOverview() {
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinancials = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFinancialSummary();
      setFinancials(data);
    } catch (err) {
      console.error("Failed to load financial summary", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  const budgetCategories = [
    { name: "Site Prep & Foundation", budget: 15.2, actual: 15.5, status: "over" },
    { name: "Structural (Steel/Concrete)", budget: 35.0, actual: 32.1, status: "under" },
    { name: "MEP Systems", budget: 28.5, actual: 12.0, status: "under" },
    { name: "Façade & Enclosure", budget: 22.0, actual: 5.0, status: "under" },
    { name: "Permitting & Compliance", budget: 5.5, actual: 4.8, status: "under" },
  ];

  const formatMoney = (val: number) => `₦${val.toFixed(1)}M`;

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            Financial & Revenue Overview
          </h1>
          <p className="text-gray-500 mt-1">High-level oversight of regulatory fee collections, project budgets, and revenue.</p>
        </div>
        <button 
          onClick={fetchFinancials}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors self-start md:self-auto"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <h3 className="font-semibold text-sm text-gray-500">Total Revenue Collected</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{financials?.total_revenue || "₦428.5M"}</p>
          <div className="mt-3 text-xs font-semibold text-gray-400">All permits & regulatory fees</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <h3 className="font-semibold text-sm text-gray-500">Permit Fees Collected</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{financials?.permit_fees || "₦394.3M"}</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded-lg">
            <TrendingDown size={14} /> Collection Rate: {financials?.collection_efficiency || "96.4%"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <h3 className="font-semibold text-sm text-gray-500">Enforcement Penalties</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{financials?.enforcement_penalties || "₦34.2M"}</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 w-max px-2 py-1 rounded-lg">
            Outstanding: {financials?.outstanding_dues || "₦18.4M"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#022C4F] rounded-2xl shadow-md p-6 relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h3 className="font-semibold text-sm text-blue-200 mb-4">Contingency Balance</h3>
            <p className="text-3xl font-bold text-white">₦12.5M</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-blue-200 font-semibold mb-1">
                <span>Drawdown Rate</span>
                <span>15% used</span>
              </div>
              <div className="w-full h-1.5 bg-blue-900 rounded-full">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Budget vs. Actuals by Category</h2>
          </div>

          <div className="space-y-6">
            {budgetCategories.map((cat, i) => {
              const percentage = Math.min((cat.actual / cat.budget) * 100, 100);
              return (
                <div key={i}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-sm text-gray-700">{cat.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{formatMoney(cat.actual)}</span>
                      <span className="text-xs text-gray-400 font-semibold mx-1">/</span>
                      <span className="text-xs text-gray-500 font-semibold">{formatMoney(cat.budget)}</span>
                    </div>
                  </div>
                  <div className="relative h-3.5 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        cat.status === 'over' ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {cat.status === 'over' && (
                    <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                      <TrendingUp size={12} /> Over budget by {formatMoney(cat.actual - cat.budget)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Monthly Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Revenue Stream (2026)</h2>

          <div className="flex-1 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 relative overflow-hidden flex items-end p-6 gap-3 min-h-[300px]">
            {(financials?.monthly_breakdown || [
              { month: "May", revenue: 68000000 },
              { month: "Jun", revenue: 82000000 },
              { month: "Jul", revenue: 95000000 },
              { month: "Aug", revenue: 110000000 },
              { month: "Sep", revenue: 73500000 }
            ]).map((item, idx) => {
              const heightPct = Math.round((item.revenue / 120000000) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 mb-1 transition-opacity">
                    ₦{(item.revenue / 1000000).toFixed(1)}M
                  </div>
                  <div 
                    className="w-full bg-blue-600 rounded-t-lg group-hover:bg-blue-500 transition-colors"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <span className="text-xs font-bold text-gray-500 mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
