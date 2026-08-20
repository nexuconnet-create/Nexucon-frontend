"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, UserCheck, ShieldAlert, CheckCircle2, ChevronRight, Map, HardHat, Calendar, RefreshCw } from "lucide-react";
import { Inspector, StakeholderStats, getInspectors, getStakeholderStats } from "@/services/stakeholders";
import ReassignZoneModal from "@/components/dashboard/ReassignZoneModal";

export default function InspectorsWorkload() {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [stats, setStats] = useState<StakeholderStats | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInspector, setSelectedInspector] = useState<Inspector | null>(null);
  const [isReassignOpen, setIsReassignOpen] = useState(false);

  const fetchInspectors = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inspData, statsData] = await Promise.all([
        getInspectors({ search: search.trim() || undefined }),
        getStakeholderStats()
      ]);
      setInspectors(inspData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load inspectors", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchInspectors();
  }, [fetchInspectors]);

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <UserCheck className="text-emerald-500" />
            Field Inspectors & Officers Workload
          </h1>
          <p className="text-gray-500 mt-1">Manage government and approved third-party inspectors, track workloads, and reassign zones.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchInspectors}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inspectors..." 
              className="pl-9 pr-4 py-2 w-64 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         {/* Summary Cards */}
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck size={20} />
               </div>
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Inspectors</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.active_inspectors ?? 42}</p>
         </div>
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <HardHat size={20} />
               </div>
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Inspections</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.pending_inspections ?? 128}</p>
         </div>
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center lg:col-span-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
             <div className="relative z-10 flex items-center justify-between">
                <div>
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Global Pass Rate (YTD)</h3>
                   <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold text-emerald-600">{stats?.global_pass_rate ?? '84.2%'}</p>
                      <p className="text-xs font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                         +2.1% <ChevronRight size={14} className="rotate-[-45deg]" />
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total NCRs Issued</p>
                   <p className="text-2xl font-bold text-gray-900">{stats?.total_ncrs_issued ?? 1492}</p>
                </div>
             </div>
         </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
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
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                        {inspector.name.charAt(0)}{inspector.name.split(' ')[1]?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">{inspector.name}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mt-0.5">
                           <span className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200">{inspector.inspector_id}</span>
                           <span>{inspector.role_title}</span>
                           {inspector.inspector_type.includes('Third-Party') && (
                              <span className="text-[9px] uppercase font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">External</span>
                           )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-700">
                      <Map size={12} className="text-blue-500" /> {inspector.assigned_zone}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                       <span className="text-base font-bold text-gray-900 leading-none">{inspector.active_inspections}</span>
                       <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                       {inspector.pass_rate}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-xs font-bold text-red-600 flex items-center justify-center gap-1">
                       {inspector.ncrs_issued} <ShieldAlert size={12} />
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => { setSelectedInspector(inspector); setIsReassignOpen(true); }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm hover:bg-gray-50"
                    >
                      Reassign <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {inspectors.length === 0 && !isLoading && (
          <div className="p-12 text-center text-gray-500 text-sm">
            No inspectors found.
          </div>
        )}
      </motion.div>

      <ReassignZoneModal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        inspector={selectedInspector}
        onSuccess={fetchInspectors}
      />
    </div>
  );
}
