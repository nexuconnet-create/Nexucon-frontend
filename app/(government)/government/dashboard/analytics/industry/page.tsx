"use client";

import React from "react";
import { 
  BarChart, Activity, Map, Building2, TrendingUp, AlertTriangle, 
  MapPin, Users, Target, Search, Download
} from "lucide-react";

export default function IndustryPerformancePage() {
  return (
    <div className="w-full h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#022C4F] flex items-center gap-3">
            <BarChart className="text-blue-600" size={32} />
            Industry Performance Dashboard
          </h1>
          <p className="text-gray-500 mt-1 max-w-3xl">
            High-level view for government leadership: Industry compliance trends, geographic hotspots, infrastructure needs, and resource utilization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-[#022C4F] rounded-xl hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 shadow-sm">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Active Projects</p>
              <h3 className="text-3xl font-bold text-[#022C4F]">12,450</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Building2 size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center text-emerald-600 font-medium">
              <TrendingUp size={14} className="mr-1" /> +15%
            </span>
            <span className="text-slate-400">vs last year</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Compliance Rate</p>
              <h3 className="text-3xl font-bold text-[#022C4F]">84.2%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Target size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center text-emerald-600 font-medium">
              <TrendingUp size={14} className="mr-1" /> +2.4%
            </span>
            <span className="text-slate-400">vs last quarter</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Critical Violations</p>
              <h3 className="text-3xl font-bold text-[#022C4F]">342</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center text-red-600 font-medium">
              <TrendingUp size={14} className="mr-1" /> +12%
            </span>
            <span className="text-slate-400">vs last quarter</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Inspector Utilization</p>
              <h3 className="text-3xl font-bold text-[#022C4F]">92%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center text-amber-600 font-medium">
              <AlertTriangle size={14} className="mr-1" /> Overloaded
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Compliance Trends Chart (Simulated) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              Industry Compliance Trends (YTD)
            </h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 outline-none">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {/* Simulated Line/Bar Chart */}
            {[45, 52, 48, 61, 59, 68, 75, 71, 82, 85, 81, 89].map((val, idx) => (
              <div key={idx} className="w-full relative group flex flex-col justify-end h-full">
                <div 
                  className="w-full bg-blue-500/20 hover:bg-blue-500 rounded-t-sm transition-all duration-300 relative"
                  style={{ height: `${val}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#022C4F] text-white text-xs py-1 px-2 rounded shadow-lg transition-opacity whitespace-nowrap z-10">
                    {val}% Compliant
                  </div>
                </div>
                <div className="text-center mt-2 text-xs font-medium text-slate-400">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Hotspots */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
              <Map size={18} className="text-red-500" />
              Violation Hotspots (LGA)
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { lga: 'Eti-Osa', violations: 142, trend: '+12%' },
              { lga: 'Ikeja', violations: 98, trend: '+5%' },
              { lga: 'Surulere', violations: 87, trend: '-2%' },
              { lga: 'Lagos Island', violations: 76, trend: '+15%' },
              { lga: 'Alimosho', violations: 54, trend: '-8%' },
              { lga: 'Kosofe', violations: 41, trend: '0%' },
            ].map((area, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">{area.lga}</h4>
                    <p className="text-xs text-slate-500">{area.violations} critical violations</p>
                  </div>
                </div>
                <div className={`text-xs font-bold ${area.trend.startsWith('+') ? 'text-red-500' : 'text-emerald-500'}`}>
                  {area.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
