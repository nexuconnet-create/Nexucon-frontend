"use client";

import React from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, TrendingUp, Wallet, Receipt, CreditCard, ChevronRight } from "lucide-react";

export default function FinancialOverview() {
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
            Financial Overview
          </h1>
          <p className="text-gray-500 mt-1">High-level oversight of project budget, cash flow, and actuals.</p>
        </div>
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
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <h3 className="font-semibold text-sm text-gray-500">Total Approved Budget</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">₦125.0M</p>
          <div className="mt-3 text-xs font-semibold text-gray-400">Baseline established Jan 2026</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <h3 className="font-semibold text-sm text-gray-500">Actual Cost (ACWP)</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">₦69.4M</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded">
            <TrendingDown size={14} /> 4.2% Under Budget
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <h3 className="font-semibold text-sm text-gray-500">Estimate at Completion</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">₦122.8M</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded">
            Projected Savings: ₦2.2M
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
            <h3 className="font-semibold text-sm text-blue-200 mb-4">Contingency Fund</h3>
            <p className="text-3xl font-bold text-white">₦8.5M</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-blue-200 font-semibold mb-1">
                <span>Burn Rate</span>
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
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${cat.status === 'over' ? 'bg-red-500' : 'bg-emerald-500'
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

        {/* Cash Flow Forecast Chart (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Cash Flow Forecast (Cumulative)</h2>

          <div className="flex-1 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 relative overflow-hidden flex items-end p-6 min-h-[300px]">
            {/* S-Curve CSS Representation */}
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Grid */}
              <path d="M0,20 L100,20 M0,40 L100,40 M0,60 L100,60 M0,80 L100,80" stroke="#F3F4F6" strokeWidth="0.5" fill="none" />
              {/* Forecast */}
              <path d="M0,95 Q20,90 50,40 T100,5" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
              {/* Actual */}
              <path d="M0,95 Q20,92 45,55" fill="none" stroke="#10B981" strokeWidth="3" />
            </svg>

            {/* Chart legend/overlay */}
            <div className="absolute top-4 left-4 flex gap-4 bg-white/80 p-2 rounded backdrop-blur-sm border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <span className="w-3 border-t-2 border-dashed border-gray-400"></span> Forecast
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <span className="w-3 border-t-2 border-solid border-emerald-500"></span> Actual Drawdown
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
