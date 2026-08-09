"use client";

import React from "react";
import { 
  Activity, 
  Map, 
  Scan, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  BarChart,
  ArrowRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DigitalEyeOverview() {
  const metrics = [
    { label: "Active Tersus S1 Scanners", value: "8", icon: Scan, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Scans Today", value: "24", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "In Processing Queue", value: "5", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "AI Anomalies Detected", value: "12", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  const recentScans = [
    { id: "SCN-26-001", location: "Downtown Metro Station", time: "10:30 AM", status: "completed", issues: 0 },
    { id: "SCN-26-002", location: "Riverside Commercial Complex", time: "11:45 AM", status: "processing", issues: 0 },
    { id: "SCN-26-003", location: "Highway Bridge A4", time: "01:15 PM", status: "completed", issues: 3 },
    { id: "SCN-26-004", location: "City Hospital Annex", time: "02:20 PM", status: "failed", issues: 0 },
  ];

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Digital Eye (T-S1 MVP) Overview</h1>
          <p className="text-gray-500 mt-1">Command center for Tersus S1 fleet operations and digital twin generation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/government/dashboard/digital-eye/scan-sessions/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus size={18} />
            <span className="font-medium">New Scan Session</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={metric.label}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5"
            >
              <div className={`w-14 h-14 rounded-full ${metric.bg} flex items-center justify-center shrink-0`}>
                <Icon size={24} className={metric.color} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metric.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Map Mockup */}
          <div className="bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative overflow-hidden group h-[400px]">
            <div className="absolute inset-0 bg-slate-100/80 z-0"></div>
            {/* Simulated Map Background */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply" 
                 style={{ 
                   backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)', 
                   backgroundSize: '24px 24px' 
                 }}>
            </div>
            
            {/* UI overlay */}
            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-gray-200 pointer-events-auto">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Map size={16} className="text-blue-600" />
                    Fleet Coverage Map
                  </h3>
                </div>
                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-xs font-medium text-emerald-600 flex items-center gap-2 pointer-events-auto">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Live Tracking Active
                </div>
              </div>
            </div>

            {/* Map Points Simulation */}
            <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse z-10">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
            </div>
            <div className="absolute bottom-1/3 right-1/3 w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center animate-pulse z-10" style={{ animationDelay: '1s' }}>
              <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
            </div>
            <div className="absolute top-1/2 left-2/3 w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center animate-pulse z-10" style={{ animationDelay: '0.5s' }}>
              <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-lg"></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "View Scan Library", href: "/government/dashboard/digital-eye/scan-library", icon: Scan, desc: "Access raw and processed data." },
                { name: "Processing Pipeline", href: "/government/dashboard/digital-eye/processing-pipeline", icon: Activity, desc: "Monitor data ingestion status." },
                { name: "QA/QC Insights", href: "/government/dashboard/digital-eye/qa-qc-insights", icon: BarChart, desc: "Check sensor calibration metrics." }
              ].map((action, i) => (
                <Link key={i} href={action.href} className="group block p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                    <action.icon size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">{action.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{action.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Scans</h3>
              <Link href="/government/dashboard/digital-eye/scan-sessions" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentScans.map((scan, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500">{scan.id}</span>
                    {scan.status === 'completed' && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider"><CheckCircle size={10} /> Done</span>}
                    {scan.status === 'processing' && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full uppercase tracking-wider"><Activity size={10} className="animate-pulse" /> Active</span>}
                    {scan.status === 'failed' && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full uppercase tracking-wider"><AlertTriangle size={10} /> Error</span>}
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{scan.location}</h4>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} /> {scan.time}
                    </div>
                    {scan.issues > 0 && (
                      <span className="text-xs font-medium text-red-500 flex items-center gap-1">
                        <AlertTriangle size={12} /> {scan.issues} Issues
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#022C4F] to-[#044c8c] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Scan size={100} />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">Tersus S1 Integration</h3>
            <p className="text-sm text-blue-100 mb-6 relative z-10 leading-relaxed">
              Your fleet is connected. Real-time kinematic data and LiDAR point clouds are streaming directly to the Nexucon processing engine.
            </p>
            <Link 
              href="/government/dashboard/digital-eye/integration-settings"
              className="inline-flex items-center justify-center w-full py-2.5 bg-white text-[#022C4F] font-semibold text-sm rounded-lg hover:bg-blue-50 transition-colors relative z-10"
            >
              Manage Connection Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
