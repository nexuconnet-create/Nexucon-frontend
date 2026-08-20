"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PieChart, Calendar, TrendingDown, ClipboardCheck, AlertOctagon, Activity, ChevronRight, RefreshCw } from "lucide-react";
import { ExecutiveKPIs, getExecutiveKPIs, OfficerPerformanceRecord, getOfficerPerformance } from "@/services/analytics";

export default function InspectionAnalytics() {
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [officers, setOfficers] = useState<OfficerPerformanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInspectionData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kpiData, officerData] = await Promise.all([
        getExecutiveKPIs(),
        getOfficerPerformance()
      ]);
      setKpis(kpiData);
      setOfficers(officerData);
    } catch (err) {
      console.error("Failed to load inspection analytics", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspectionData();
  }, [fetchInspectionData]);

  const defectCategories = [
    { name: "Concrete & Rebar", count: 145, percentage: 35, color: "bg-blue-500" },
    { name: "Structural Steel", count: 82, percentage: 20, color: "bg-amber-500" },
    { name: "Safety Violations", count: 65, percentage: 16, color: "bg-red-500" },
    { name: "MEP Routing", count: 48, percentage: 12, color: "bg-purple-500" },
    { name: "Site Cleanliness", count: 40, percentage: 10, color: "bg-emerald-500" },
    { name: "Other", count: 30, percentage: 7, color: "bg-gray-400" },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <PieChart className="text-blue-500" />
            Inspection Analytics & Defects
          </h1>
          <p className="text-gray-500 mt-1">Quality control insights, pass/fail trends, and defect categorizations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchInspectionData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <select className="bg-white border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl px-3 py-2 shadow-sm focus:outline-none">
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardCheck size={20} />
            </div>
            <h3 className="font-bold text-gray-700">Total Completed Inspections</h3>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-900">{kpis?.completed_inspections_count || 312}</p>
            <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              +12% from last reporting period
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-gray-700">First-Time Pass Rate</h3>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-900">84.2%</p>
            <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              +3.4% above quality benchmark
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
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertOctagon size={20} />
            </div>
            <h3 className="font-bold text-gray-700">Active Non-Conformances</h3>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-900">{kpis?.open_ncrs_count || 8}</p>
            <p className="text-sm font-semibold text-gray-500 mt-1">
              Currently undergoing CAPA remediation
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
                <div className="w-36 shrink-0">
                  <p className="text-sm font-semibold text-gray-700">{cat.name}</p>
                </div>
                <div className="flex-1">
                  <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden w-full relative">
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
            <h2 className="text-lg font-bold text-gray-900">Lead Inspector Throughput</h2>
          </div>

          <div className="flex-1 space-y-4">
            {officers.map((officer, i) => (
              <div key={officer.id || i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shadow-sm text-sm">
                    {officer.officer_name.replace('Engr. ', '').replace('Arc. ', '').charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{officer.officer_name}</h4>
                    <p className="text-xs font-semibold text-gray-500">{officer.role}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Inspections</p>
                    <p className="font-bold text-gray-900 text-sm">{officer.inspections_completed}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">SLA Adherence</p>
                    <p className="font-bold text-emerald-600 text-sm">
                      {officer.sla_adherence_rate}%
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
