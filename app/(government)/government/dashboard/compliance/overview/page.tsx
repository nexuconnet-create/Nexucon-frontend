"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Activity, FileCheck, ArrowUpRight, ArrowDownRight, Clock, ChevronRight } from "lucide-react";

export default function ComplianceOverview() {
  const metrics = [
    { label: "Overall Score", value: "92%", trend: "+2.4%", trendUp: true, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Open NCRs", value: "8", trend: "-3", trendUp: true, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Pending CAPAs", value: "12", trend: "+4", trendUp: false, icon: Activity, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Valid Certificates", value: "145", trend: "+12", trendUp: true, icon: FileCheck, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ];

  const recentActivities = [
    { id: 1, title: "Environmental Audit Passed", time: "2 hours ago", type: "positive" },
    { id: 2, title: "NCR-104 Logged (Minor)", time: "5 hours ago", type: "warning" },
    { id: 3, title: "CAPA-089 Closed", time: "1 day ago", type: "positive" },
    { id: 4, title: "Fire Safety Certificate Expiring", time: "2 days ago", type: "critical" },
  ];

  const upcomingDeadlines = [
    { id: 1, title: "Q4 Safety Inspection", date: "Oct 25, 2026", daysLeft: 5 },
    { id: 2, title: "Submit Emissions Report", date: "Oct 28, 2026", daysLeft: 8 },
    { id: 3, title: "Renew Scaffold Permits", date: "Nov 02, 2026", daysLeft: 13 },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldCheck className="text-blue-500" />
            Compliance Overview
          </h1>
          <p className="text-gray-500 mt-1">Monitor project health, regulatory adherence, and outstanding actions.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold">
          <FileCheck size={16} />
          Generate Compliance Report
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className={`bg-white rounded-2xl border ${metric.border} shadow-sm p-6 relative overflow-hidden group`}
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${metric.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.bg} ${metric.color}`}>
                  <metric.icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  metric.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {metric.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {metric.trend}
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-1">{metric.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{metric.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area (Placeholder) */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full min-h-[400px] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Compliance Trend (Last 6 Months)</h2>
              <select className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:border-blue-500">
                <option>All Disciplines</option>
                <option>Safety</option>
                <option>Environmental</option>
                <option>Quality</option>
              </select>
            </div>
            
            <div className="flex-1 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden">
               {/* Decorative Chart Representation */}
               <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-emerald-100/50 to-transparent"></div>
               <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                 <path d="M0,80 L20,60 L40,75 L60,40 L80,50 L100,20 L100,100 L0,100 Z" fill="rgba(16, 185, 129, 0.1)" />
                 <path d="M0,80 L20,60 L40,75 L60,40 L80,50 L100,20" fill="none" stroke="#10B981" strokeWidth="2" />
               </svg>
               <div className="z-10 text-center">
                 <Activity size={32} className="mx-auto text-emerald-500 mb-2 opacity-50" />
                 <p className="text-sm font-semibold text-gray-500">Positive Compliance Growth</p>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar - Activities & Deadlines */}
        <div className="lg:col-span-1 space-y-8">
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Deadlines</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">View All</button>
            </div>
            
            <div className="space-y-4">
              {upcomingDeadlines.map(deadline => (
                <div key={deadline.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold uppercase">Oct</span>
                    <span className="text-lg font-bold leading-none">{deadline.date.split(' ')[1].replace(',', '')}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{deadline.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {deadline.daysLeft} days left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            </div>
            
            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {recentActivities.map(activity => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 bg-white z-10 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                    activity.type === 'positive' ? 'border-emerald-500' :
                    activity.type === 'warning' ? 'border-amber-500' : 'border-red-500'
                  }`}></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-gray-100 bg-white shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-400">{activity.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{activity.title}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1">
              View Activity Log <ChevronRight size={16} />
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
