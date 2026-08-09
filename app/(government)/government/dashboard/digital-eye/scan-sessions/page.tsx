"use client";

import React from "react";
import { 
  Activity,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  MoreVertical,
  Download
} from "lucide-react";
import Link from "next/link";

export default function ScanSessionsIndex() {
  const sessions = [
    { id: "SCN-26-001", project: "Downtown Metro Station", date: "Oct 10, 2026", duration: "45 mins", sensors: ["LiDAR", "RGB"], status: "completed", operator: "John Smith" },
    { id: "SCN-26-002", project: "Riverside Commercial Complex", date: "Oct 10, 2026", duration: "1h 20m", sensors: ["LiDAR", "Thermal"], status: "processing", operator: "Sarah Jenkins" },
    { id: "SCN-26-003", project: "Highway Bridge A4", date: "Oct 09, 2026", duration: "30 mins", sensors: ["RGB", "Multispectral"], status: "completed", operator: "John Smith" },
    { id: "SCN-26-004", project: "City Hospital Annex", date: "Oct 08, 2026", duration: "2h 15m", sensors: ["LiDAR", "RGB", "Thermal"], status: "failed", operator: "David Rossi" },
    { id: "SCN-26-005", project: "Green Valley High School", date: "Oct 07, 2026", duration: "55 mins", sensors: ["LiDAR"], status: "completed", operator: "Michael Chen" },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Scan Sessions</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all active and historical scanning sessions.</p>
        </div>
        <Link 
          href="/government/dashboard/digital-eye/scan-sessions/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} />
          <span className="font-medium">New Scan Session</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">All Sessions</h2>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search sessions..." 
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Session ID</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Project</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Date / Duration</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Sensors</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Operator</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-gray-900">{session.id}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700 font-medium">{session.project}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">{session.date}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Clock size={12}/> {session.duration}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-1 flex-wrap">
                      {session.sensors.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wide">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{session.operator}</td>
                  <td className="py-4 px-6">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      session.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {session.status === 'completed' && <CheckCircle size={12} />}
                      {session.status === 'processing' && <Activity size={12} className="animate-pulse" />}
                      {session.status === 'failed' && <AlertTriangle size={12} />}
                      {session.status}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {session.status === 'completed' && (
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Download Report">
                          <Download size={16} />
                        </button>
                      )}
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
