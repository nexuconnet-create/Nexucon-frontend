"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart, TrendingUp, TrendingDown, Clock, DollarSign, Activity, Calendar, Download } from "lucide-react";

export default function ProjectPerformance() {
  const kpis = [
    { label: "Overall Health Index", value: "92.4", trend: "+1.2", positive: true, icon: Activity, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Schedule Performance (SPI)", value: "0.95", trend: "-0.02", positive: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Cost Performance (CPI)", value: "1.04", trend: "+0.01", positive: true, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <BarChart className="text-blue-500" />
            Project Performance Analytics
          </h1>
          <p className="text-gray-500 mt-1">High-level executive overview of project health, schedule, and cost.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 shadow-sm">
            <Calendar size={16} className="text-gray-400" />
            <span>Q3 2026</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold">
            <Download size={16} />
            Export Dashboard
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className={`bg-white rounded-2xl border ${kpi.border} shadow-sm p-6 relative overflow-hidden`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${kpi.bg} opacity-50`}></div>
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                kpi.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {kpi.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart (CSS Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Performance Index Trends</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> SPI
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> CPI
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 relative overflow-hidden flex items-end p-4 gap-2">
            {/* Mock Bar Chart */}
            {[40, 60, 45, 80, 55, 90, 75, 85, 60, 95, 80, 85].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  Week {i+1}: {val}%
                </div>
                {/* Data Bars */}
                <div 
                  className="w-full bg-emerald-500/80 rounded-t-sm hover:bg-emerald-400 transition-colors" 
                  style={{ height: `${val}%` }}
                ></div>
                <div 
                  className="w-full bg-blue-500/80 rounded-t-sm hover:bg-blue-400 transition-colors" 
                  style={{ height: `${val > 20 ? val - 15 : val}%` }}
                ></div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Sidebar - Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Phase Completion</h2>
          
          <div className="space-y-6 flex-1">
            {[
              { name: "Design & Engineering", progress: 100, color: "bg-emerald-500" },
              { name: "Procurement", progress: 85, color: "bg-blue-500" },
              { name: "Site Prep & Foundation", progress: 92, color: "bg-blue-500" },
              { name: "Structural Framing", progress: 45, color: "bg-amber-500" },
              { name: "MEP Rough-in", progress: 10, color: "bg-purple-500" },
            ].map((phase, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">{phase.name}</span>
                  <span className="font-bold text-gray-900">{phase.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${phase.color} rounded-full`}
                    style={{ width: `${phase.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-1">
              <TrendingDown size={16} className="text-amber-600" />
              Critical Path Delay
            </h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Structural framing is currently 5% behind schedule due to delayed steel deliveries in Zone 3.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
