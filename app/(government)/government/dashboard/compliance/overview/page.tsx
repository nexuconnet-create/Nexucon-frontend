"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Activity, FileCheck, ArrowUpRight, ArrowDownRight, Clock, ChevronRight, RefreshCw } from "lucide-react";
import { ComplianceStats, getComplianceStats, getNCRs, getComplianceCertificates, NonConformanceReport, ComplianceCertificate } from "@/services/compliance";

export default function ComplianceOverview() {
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [ncrs, setNcrs] = useState<NonConformanceReport[]>([]);
  const [certificates, setCertificates] = useState<ComplianceCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, ncrData, certData] = await Promise.all([
        getComplianceStats(),
        getNCRs(),
        getComplianceCertificates()
      ]);
      setStats(statsData);
      setNcrs(ncrData);
      setCertificates(certData);
    } catch (err) {
      console.error("Failed to load compliance stats", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const metrics = [
    { label: "Overall Score", value: stats?.overall_score || "92%", trend: "+2.4%", trendUp: true, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Open NCRs", value: stats?.open_ncrs_count?.toString() || (ncrs.filter(n => n.status !== 'Closed').length.toString()), trend: "-3", trendUp: true, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Pending CAPAs", value: stats?.pending_capas_count?.toString() || "3", trend: "+4", trendUp: false, icon: Activity, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Valid Certificates", value: stats?.valid_certificates_count?.toString() || (certificates.filter(c => c.status === 'Active').length.toString()), trend: "+12", trendUp: true, icon: FileCheck, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ];

  const recentActivities = ncrs.length > 0 ? ncrs.slice(0, 4).map((ncr, idx) => ({
    id: ncr.id,
    title: `${ncr.ncr_reference || `NCR-${idx+101}`}: ${ncr.title}`,
    time: ncr.date_logged ? new Date(ncr.date_logged).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
    type: ncr.severity === 'Critical' ? 'critical' : ncr.severity === 'Major' ? 'warning' : 'positive'
  })) : [
    { id: '1', title: "Environmental Audit Passed", time: "2 hours ago", type: "positive" },
    { id: '2', title: "Stage 2 Structural Certificate Issued", time: "1 day ago", type: "positive" }
  ];

  const upcomingDeadlines = certificates.length > 0 ? certificates.slice(0, 3).map((cert, idx) => ({
    id: cert.id,
    title: cert.title,
    date: cert.expiry_date || 'Oct 28, 2026',
    daysLeft: 30 + idx * 15
  })) : [
    { id: '1', title: "Q4 Safety Inspection Audit", date: "Oct 25, 2026", daysLeft: 5 },
    { id: '2', title: "Submit Emissions & EIA Report", date: "Oct 28, 2026", daysLeft: 8 }
  ];

  const handleGenerateReport = () => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: 'Generating comprehensive regulatory compliance report PDF...', type: 'info' } 
    }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldCheck className="text-blue-500" />
            Compliance Overview
          </h1>
          <p className="text-gray-500 mt-1">Monitor project health, regulatory adherence, and outstanding statutory actions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStats} 
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold"
          >
            <FileCheck size={16} />
            Generate Compliance Report
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
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
        {/* Main Chart Area */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full min-h-[400px] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Compliance Trend (Last 6 Months)</h2>
              <select 
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="border border-gray-200 rounded-xl text-sm px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Disciplines</option>
                <option value="Safety">Safety</option>
                <option value="Environmental">Environmental</option>
                <option value="Quality">Quality</option>
              </select>
            </div>
            
            <div className="flex-1 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden">
               <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-emerald-100/50 to-transparent"></div>
               <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                 <path d="M0,80 L20,60 L40,75 L60,40 L80,50 L100,20 L100,100 L0,100 Z" fill="rgba(16, 185, 129, 0.1)" />
                 <path d="M0,80 L20,60 L40,75 L60,40 L80,50 L100,20" fill="none" stroke="#10B981" strokeWidth="2" />
               </svg>
               <div className="z-10 text-center">
                 <Activity size={32} className="mx-auto text-emerald-500 mb-2 opacity-50" />
                 <p className="text-sm font-semibold text-gray-500">Adherence Rating: {stats?.overall_score || '92%'}</p>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar - Activities & Deadlines */}
        <div className="lg:col-span-1 space-y-8">
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Statutory Deadlines</h2>
            </div>
            
            <div className="space-y-4">
              {upcomingDeadlines.map(deadline => (
                <div key={deadline.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0">
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
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Compliance Log</h2>
            </div>
            
            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {recentActivities.map(activity => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 bg-white z-10 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                    activity.type === 'positive' ? 'border-emerald-500' :
                    activity.type === 'warning' ? 'border-amber-500' : 'border-red-500'
                  }`}></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-400">{activity.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{activity.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
