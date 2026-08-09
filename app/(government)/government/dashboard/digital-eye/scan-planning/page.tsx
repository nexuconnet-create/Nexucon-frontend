"use client";

import React, { useState } from "react";
import { 
  Calendar,
  MapPin,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus
} from "lucide-react";

export default function ScanPlanning() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'map'>('schedule');

  const upcomingScans = [
    { id: "PLN-2026-042", project: "Downtown Metro Station", date: "Oct 12, 2026", time: "09:00 AM", operator: "John Smith", scanner: "NAVIS-V3-001", status: "confirmed" },
    { id: "PLN-2026-043", project: "Riverside Commercial Complex", date: "Oct 12, 2026", time: "02:00 PM", operator: "Sarah Jenkins", scanner: "NAVIS-V3-002", status: "pending" },
    { id: "PLN-2026-044", project: "Highway Bridge A4", date: "Oct 13, 2026", time: "10:30 AM", operator: "Michael Chen", scanner: "NAVIS-V3-001", status: "confirmed" },
    { id: "PLN-2026-045", project: "City Hospital Annex", date: "Oct 14, 2026", time: "08:15 AM", operator: "David Rossi", scanner: "NAVIS-V3-003", status: "tentative" },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Scan Planning & Scheduling</h1>
          <p className="text-gray-500 mt-1">Coordinate Tersus S1 deployments across project sites.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors shadow-lg shadow-blue-900/20">
          <Plus size={18} />
          <span className="font-medium">Schedule New Scan</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              List View
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Map View
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search plans..." 
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {activeTab === 'schedule' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Plan ID</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Project / Location</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Schedule</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Operator</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Equipment</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{scan.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm text-gray-700 font-medium">{scan.project}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {scan.date}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5"><Clock size={14} className="text-gray-400"/> {scan.time}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                          {scan.operator.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-gray-700">{scan.operator}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{scan.scanner}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        scan.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        scan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Showing 4 of 4 planned scans</p>
              <div className="flex items-center gap-1">
                <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
                <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[600px] w-full bg-slate-50 relative flex items-center justify-center">
            {/* Map Placeholder */}
            <div className="absolute inset-0 z-0 opacity-20 mix-blend-multiply" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }}>
            </div>
            
            <div className="z-10 flex flex-col items-center bg-white/80 backdrop-blur px-6 py-4 rounded-2xl border border-gray-200 shadow-sm text-center">
              <MapPin size={32} className="text-gray-400 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">Map View Mockup</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-1">
                This area will render an interactive geospatial map highlighting scheduled scan zones and boundaries.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
