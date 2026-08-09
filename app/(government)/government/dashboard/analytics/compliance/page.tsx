"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, Leaf, AlertTriangle, Download, Filter, TrendingUp, CalendarDays } from "lucide-react";

export default function ComplianceReportsAnalytics() {
  const complianceScores = [
    { title: "Safety & Health (OSHA)", score: 94, trend: "+2", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50", fill: "bg-blue-500" },
    { title: "Environmental Protection", score: 88, trend: "-1", icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-50", fill: "bg-emerald-500" },
    { title: "Building Code & Structural", score: 98, trend: "0", icon: AlertTriangle, color: "text-purple-600", bg: "bg-purple-50", fill: "bg-purple-500" },
  ];

  const recentReports = [
    { id: "REP-992", name: "Q3 Full Safety Audit", date: "Oct 01, 2026", type: "Safety", status: "Published" },
    { id: "REP-991", name: "Sept Emissions Log", date: "Sep 30, 2026", type: "Environmental", status: "Published" },
    { id: "REP-990", name: "Structural Code Verification", date: "Sep 15, 2026", type: "Code", status: "Archived" },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Compliance Analytics
          </h1>
          <p className="text-gray-500 mt-1">Aggregate scorecards and historical reports for regulatory adherence.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold">
            <Download size={16} />
            Generate Master Report
          </button>
        </div>
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {complianceScores.map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                <item.icon size={24} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Compliance Score</span>
                <p className="text-3xl font-bold text-gray-900">{item.score}<span className="text-lg text-gray-400">%</span></p>
              </div>
            </div>
            
            <h3 className="font-bold text-gray-700 mb-4">{item.title}</h3>
            
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className={`h-full ${item.fill} rounded-full`} style={{ width: `${item.score}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-400">Target: 95%</span>
              <span className={`flex items-center gap-1 ${item.trend.startsWith('+') ? 'text-emerald-600' : item.trend.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                {item.trend !== "0" && <TrendingUp size={12} className={item.trend.startsWith('-') ? 'rotate-180' : ''} />}
                {item.trend}% this month
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Tracking Chart (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Incident Rate Trends</h2>
            <select className="border border-gray-200 rounded-lg text-sm px-2 py-1 text-gray-600 bg-white focus:outline-none">
              <option>6 Months</option>
              <option>12 Months</option>
            </select>
          </div>
          
          <div className="flex-1 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden min-h-[300px]">
             {/* Decorative Area Chart Representation */}
             <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
               <path d="M0,80 Q25,70 50,85 T100,50 L100,100 L0,100 Z" fill="rgba(239, 68, 68, 0.1)" />
               <path d="M0,80 Q25,70 50,85 T100,50" fill="none" stroke="#EF4444" strokeWidth="2" />
             </svg>
             <div className="z-10 text-center bg-white/80 p-3 rounded-lg backdrop-blur-sm border border-gray-100">
               <p className="text-xs font-bold uppercase text-gray-500">Peak Incidents (July)</p>
               <p className="text-lg font-bold text-red-600">12 Logged</p>
             </div>
          </div>
        </motion.div>

        {/* Recent Generated Reports */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Generated Reports Log</h2>
          
          <div className="space-y-4">
            {recentReports.map(report => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-400 flex items-center justify-center group-hover:text-blue-500 transition-colors">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{report.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="font-mono text-gray-500">{report.id}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-gray-500 flex items-center gap-1"><CalendarDays size={12} /> {report.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${
                    report.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-semibold">
            View Report Archive
          </button>
        </motion.div>
      </div>
    </div>
  );
}
