"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, UserCheck, ShieldAlert, CheckCircle2, ChevronRight, Map, HardHat, Calendar } from "lucide-react";

export default function InspectorsWorkload() {
  const inspectors = [
    {
      id: "INS-001",
      name: "Marcus Chen",
      role: "Structural Inspector",
      type: "Internal (Gov)",
      zone: "Zone A (Downtown)",
      activeInspections: 4,
      passRate: "88%",
      ncrIssued: 12
    },
    {
      id: "INS-042",
      name: "Sarah Jenkins",
      role: "Quality / Materials",
      type: "Third-Party (Approved)",
      zone: "Zone B (Westside)",
      activeInspections: 6,
      passRate: "76%",
      ncrIssued: 24
    },
    {
      id: "INS-018",
      name: "David Rivera",
      role: "Environmental",
      type: "Internal (Gov)",
      zone: "City-Wide",
      activeInspections: 2,
      passRate: "92%",
      ncrIssued: 5
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <UserCheck className="text-emerald-500" />
            Inspectors & Field Officers
          </h1>
          <p className="text-gray-500 mt-1">Manage government and approved third-party inspectors, track workloads, and view pass/fail metrics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter by Zone
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
            <Calendar size={16} />
            Assign Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         {/* Summary Cards */}
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck size={20} />
               </div>
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Inspectors</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">42</p>
         </div>
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <HardHat size={20} />
               </div>
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Inspections</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">128</p>
         </div>
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center lg:col-span-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
             <div className="relative z-10 flex items-center justify-between">
                <div>
                   <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Global Pass Rate (YTD)</h3>
                   <div className="flex items-end gap-2">
                      <p className="text-4xl font-bold text-emerald-600">84.2%</p>
                      <p className="text-sm font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                         +2.1% <ChevronRight size={14} className="rotate-[-45deg]" />
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total NCRs Issued</p>
                   <p className="text-2xl font-bold text-gray-900">1,492</p>
                </div>
             </div>
         </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by Name or ID..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Inspector</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Assignment Zone</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Active Workload</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Pass Rate</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">NCRs Issued</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inspectors.map((inspector, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                        {inspector.name.charAt(0)}{inspector.name.split(' ')[1].charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">{inspector.name}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mt-0.5">
                           <span className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200">{inspector.id}</span>
                           <span>{inspector.role}</span>
                           {inspector.type.includes('Third-Party') && (
                              <span className="text-[9px] uppercase font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">External</span>
                           )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md text-xs font-bold text-gray-700">
                      <Map size={12} className="text-blue-500" /> {inspector.zone}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                       <span className="text-lg font-bold text-gray-900 leading-none">{inspector.activeInspections}</span>
                       <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">Pending</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">
                       {inspector.passRate}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-red-600 flex items-center justify-center gap-1">
                       {inspector.ncrIssued} <ShieldAlert size={12} />
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50">
                      Reassign <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
