"use client";

import React from "react";
import { 
  BarChart2,
  CheckCircle,
  AlertTriangle,
  Target,
  Crosshair,
  Wifi,
  Download
} from "lucide-react";
import { motion } from "framer-motion";

export default function QAQCInsights() {
  const qcMetrics = [
    { title: "Average Point Density", value: "450 pts/m²", status: "optimal", icon: Target, target: "> 400 pts/m²" },
    { title: "GNSS RTK Fix Rate", value: "99.2%", status: "optimal", icon: Wifi, target: "> 95.0%" },
    { title: "IMU Calibration Drift", value: "0.012°/hr", status: "warning", icon: Crosshair, target: "< 0.010°/hr" },
  ];

  const recentAlerts = [
    { scan: "SCN-26-004", issue: "GNSS Signal Loss", severity: "high", time: "Oct 08 - 14:22" },
    { scan: "SCN-26-002", issue: "Minor IMU Drift Detected", severity: "low", time: "Oct 10 - 11:50" },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">QA/QC Insights</h1>
          <p className="text-gray-500 mt-1">Monitor Tersus S1 hardware telemetry and data capture quality.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} />
          <span className="font-medium text-sm">Export QA Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {qcMetrics.map((metric, idx) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={metric.title}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-5 ${
              metric.status === 'optimal' ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              <metric.icon size={80} />
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${
                metric.status === 'optimal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <metric.icon size={20} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                metric.status === 'optimal' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {metric.status === 'optimal' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                {metric.status}
              </span>
            </div>
            
            <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{metric.value}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">Target: {metric.target}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mock Chart Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">RTK Fix Quality Trend</h3>
            <select className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-600 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
            {/* Simulated Bar Chart */}
            {[99, 98, 100, 99.5, 95, 88, 99.2].map((val, i) => (
              <div key={i} className="w-full relative group flex flex-col items-center justify-end h-full">
                <div 
                  className={`w-full rounded-t-sm transition-all duration-500 ${
                    val >= 95 ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-amber-500 group-hover:bg-amber-600'
                  }`}
                  style={{ height: `${val}%` }}
                ></div>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity pointer-events-none">
                  {val}% Fix Rate
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs font-medium text-gray-400 px-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Alerts & Warnings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Hardware Telemetry Alerts</h3>
          
          <div className="space-y-4">
            {recentAlerts.map((alert, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="shrink-0 mt-1">
                  {alert.severity === 'high' ? (
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                      <AlertTriangle size={16} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <AlertTriangle size={16} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500">{alert.scan}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{alert.time}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">{alert.issue}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.severity === 'high' 
                      ? 'Immediate calibration check required before next deployment.'
                      : 'Self-corrected during scan. Monitor closely.'}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <span className="text-sm text-gray-500">No other recent alerts.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
