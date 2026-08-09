"use client";

import React from "react";
import { motion } from "framer-motion";
import { PieChart, Calendar, TrendingDown, ClipboardCheck, AlertOctagon, Activity, ChevronRight } from "lucide-react";

export default function InspectionAnalytics() {
  const defectCategories = [
    { name: "Concrete & Rebar", count: 145, percentage: 35, color: "bg-blue-500" },
    { name: "Structural Steel", count: 82, percentage: 20, color: "bg-amber-500" },
    { name: "Safety Violations", count: 65, percentage: 16, color: "bg-red-500" },
    { name: "MEP Routing", count: 48, percentage: 12, color: "bg-purple-500" },
    { name: "Site Cleanliness", count: 40, percentage: 10, color: "bg-emerald-500" },
    { name: "Other", count: 30, percentage: 7, color: "bg-gray-400" },
  ];

  const inspectors = [
    { name: "Sarah Jenkins", role: "Lead Safety", inspections: 142, passRate: 85 },
    { name: "Marcus Chen", role: "MEP Specialist", inspections: 98, passRate: 92 },
    { name: "David Rivera", role: "Structural Eng", inspections: 115, passRate: 78 },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <PieChart className="text-blue-500" />
            Inspection Analytics
          </h1>
          <p className="text-gray-500 mt-1">Quality control insights, pass/fail trends, and defect categorizations.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg px-3 py-2 shadow-sm focus:outline-none">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardCheck size={20} />
            </div>
            <h3 className="font-bold text-gray-700">Total Inspections</h3>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-900">410</p>
            <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              +12% from last period
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-gray-700">First-Time Pass Rate</h3>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-900">78.5%</p>
            <p className="text-sm font-semibold text-amber-600 flex items-center gap-1 mt-1">
              <TrendingDown size={14} /> -2.1% from last period
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertOctagon size={20} />
            </div>
            <h3 className="font-bold text-gray-700">Active Non-Conformances</h3>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-900">24</p>
            <p className="text-sm font-semibold text-gray-500 mt-1">
              Requires immediate CAPA action
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defect Categories */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Defects by Category</h2>
          
          <div className="space-y-4">
            {defectCategories.map((cat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-semibold text-gray-700">{cat.name}</p>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden w-full relative">
                    {/* Tooltip triggers could go here */}
                    <div 
                      className={`h-full ${cat.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{cat.count}</p>
                  <p className="text-[10px] text-gray-500 font-semibold">{cat.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Inspector Workload & Performance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Inspector Performance</h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-4">
            {inspectors.map((inspector, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shadow-sm">
                    {inspector.name.charAt(0)}{inspector.name.split(' ')[1].charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{inspector.name}</h4>
                    <p className="text-xs font-semibold text-gray-500">{inspector.role}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Inspections</p>
                    <p className="font-bold text-gray-900">{inspector.inspections}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Pass Rate</p>
                    <p className={`font-bold ${inspector.passRate > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {inspector.passRate}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
