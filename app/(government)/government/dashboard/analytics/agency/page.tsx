"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart, Clock, Users, Building, Activity, TrendingDown, CheckCircle2, MoreHorizontal } from "lucide-react";

export default function AgencyPerformance() {
  const departments = [
    { name: "Environmental Dept.", turnaround: 12, target: 14, efficiency: 94, workload: "High", color: "text-emerald-600", bg: "bg-emerald-50", fill: "bg-emerald-500" },
    { name: "Structural Engineering", turnaround: 8, target: 10, efficiency: 98, workload: "Medium", color: "text-blue-600", bg: "bg-blue-50", fill: "bg-blue-500" },
    { name: "Fire & Safety Board", turnaround: 18, target: 10, efficiency: 72, workload: "Critical", color: "text-red-600", bg: "bg-red-50", fill: "bg-red-500" },
    { name: "City Planning Comm.", turnaround: 14, target: 15, efficiency: 88, workload: "High", color: "text-purple-600", bg: "bg-purple-50", fill: "bg-purple-500" },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Building className="text-blue-500" />
            Agency & Reviewer Performance
          </h1>
          <p className="text-gray-500 mt-1">Track approval SLAs, review turnaround times, and departmental workload.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-gray-700">Average Turnaround</h3>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-900">13.5 <span className="text-lg text-gray-500 font-semibold">Days</span></p>
            <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingDown size={14} /> 1.2 days faster than Q2
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-bold text-gray-700">SLA Compliance</h3>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-900">88.2%</p>
            <p className="text-sm font-semibold text-gray-500 mt-1">
              Target: 90.0%
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-gray-700">Reviewer Workload</h3>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-900">High</p>
            <p className="text-sm font-semibold text-amber-600 mt-1">
              42 reviews currently pending
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Department Performance</h2>
            <button className="text-gray-400 hover:text-gray-700 transition-colors"><MoreHorizontal size={20} /></button>
          </div>

          <div className="space-y-6">
            {departments.map((dept, i) => (
              <div key={i}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${dept.bg} ${dept.color} border-${dept.fill.replace('bg-', '')}/20`}>
                      <Activity size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{dept.name}</h4>
                      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Target: {dept.target} Days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${dept.turnaround > dept.target ? 'text-red-600' : 'text-gray-900'}`}>{dept.turnaround} Days Avg</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block mt-1 ${
                      dept.workload === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                      dept.workload === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {dept.workload} Load
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${dept.fill} rounded-full`} style={{ width: `${dept.efficiency}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-8">{dept.efficiency}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottleneck Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Workflow Bottleneck Analysis</h2>
          
          <div className="flex-1 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-6 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-gray-700 mb-4 text-center">Average Time Spent in Stage (Days)</h4>
            
            {/* Horizontal Funnel/Bar representation */}
            <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                   <span>1. Initial Submission & Triage</span>
                   <span>1.5 Days</span>
                 </div>
                 <div className="w-full h-4 bg-gray-200 rounded-r-full flex">
                   <div className="h-full bg-blue-300 rounded-r-full" style={{ width: '15%' }}></div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                   <span>2. Technical Review</span>
                   <span className="text-red-600">8.2 Days</span>
                 </div>
                 <div className="w-[85%] h-4 bg-gray-200 rounded-r-full flex">
                   <div className="h-full bg-red-400 rounded-r-full" style={{ width: '82%' }}></div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                   <span>3. Cross-Department Sync</span>
                   <span>3.4 Days</span>
                 </div>
                 <div className="w-[60%] h-4 bg-gray-200 rounded-r-full flex">
                   <div className="h-full bg-amber-400 rounded-r-full" style={{ width: '34%' }}></div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                   <span>4. Final Sign-off / Execution</span>
                   <span>0.4 Days</span>
                 </div>
                 <div className="w-[30%] h-4 bg-gray-200 rounded-r-full flex">
                   <div className="h-full bg-emerald-400 rounded-r-full" style={{ width: '4%' }}></div>
                 </div>
               </div>
            </div>
            
            <p className="text-xs text-center text-gray-500 mt-6 font-medium">
              Technical review phase accounts for <span className="font-bold text-gray-700">60%</span> of total processing time.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
