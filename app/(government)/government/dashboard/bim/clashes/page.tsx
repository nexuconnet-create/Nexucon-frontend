"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Activity, CheckCircle, ShieldAlert, Zap, Filter, MoreVertical, Eye, Image as ImageIcon } from "lucide-react";

export default function ClashCoordination() {
  const metrics = [
    { title: "Active Clashes", value: "24", trend: "-3 this week", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    { title: "Critical Issues", value: "8", trend: "+1 this week", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
    { title: "Resolved (YTD)", value: "156", trend: "+12 this month", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Coordination Score", value: "89%", trend: "+2% from last model", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  const clashes = [
    { id: "CL-402", title: "HVAC Duct / Structural Beam", type: "Hard Clash", models: "MEP vs Structural", severity: "Critical", location: "Level 2, Grid C-4", status: "Active" },
    { id: "CL-401", title: "Plumbing Pipe / Cable Tray", type: "Hard Clash", models: "Plumbing vs Electrical", severity: "High", location: "Level 1, Grid A-2", status: "Active" },
    { id: "CL-400", title: "Door Swing Clearance", type: "Soft Clash", models: "Architecture vs MEP", severity: "Medium", location: "Level 3, Corridor B", status: "In Review" },
    { id: "CL-399", title: "Fire Sprinkler / Light Fixture", type: "Hard Clash", models: "Fire Safety vs Electrical", severity: "High", location: "Level 2, Room 204", status: "Resolved" },
    { id: "CL-398", title: "Access Panel Blocked", type: "Soft Clash", models: "Architecture vs MEP", severity: "Low", location: "Level 1, Mech Room", status: "Resolved" },
  ];

  const getSeverityStyle = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'text-red-700 bg-red-100/80 border-red-200';
      case 'High': return 'text-orange-700 bg-orange-100/80 border-orange-200';
      case 'Medium': return 'text-amber-700 bg-amber-100/80 border-amber-200';
      case 'Low': return 'text-blue-700 bg-blue-100/80 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Zap className="text-amber-500" />
            Clash & Coordination
          </h1>
          <p className="text-gray-500 mt-1">Automated interference detection and coordination tracking across disciplines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((m, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>
                <m.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">{m.title}</p>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-bold text-gray-900 leading-none">{m.value}</h3>
                <span className="text-xs font-semibold text-gray-400 mb-0.5">{m.trend}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-bold text-gray-800">Detected Interferences</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            <Filter size={16} />
            Filter Clashes
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">ID</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Clash Details</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Disciplines</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Severity</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Location</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clashes.map((clash, idx) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={clash.id} 
                  className={`hover:bg-gray-50/80 transition-colors cursor-pointer group ${clash.status === 'Resolved' ? 'opacity-60' : ''}`}
                >
                  <td className="py-4 px-6 font-mono text-sm font-bold text-gray-600">{clash.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                        <ImageIcon size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{clash.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{clash.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">{clash.models}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getSeverityStyle(clash.severity)}`}>
                      {clash.severity}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                    {clash.location}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View in Model"><Eye size={16} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
