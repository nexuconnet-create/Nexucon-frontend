"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Search, Filter, Download, UserCheck, ShieldAlert, 
  CheckCircle2, ChevronRight, Map, HardHat, Calendar, 
  RefreshCw, Plus, MapPin 
} from "lucide-react";
import { Inspector, StakeholderStats, getInspectors, getStakeholderStats } from "@/services/stakeholders";
import ReassignZoneModal from "@/components/dashboard/ReassignZoneModal";
import CreateStakeholderModal from "@/components/dashboard/CreateStakeholderModal";
import PaginationBar from "@/components/dashboard/PaginationBar";

export default function InspectorsWorkload() {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [stats, setStats] = useState<StakeholderStats | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInspector, setSelectedInspector] = useState<Inspector | null>(null);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    setCurrentPage(1);
  }, [fetchInspectors]);

  const paginatedInspectors = inspectors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <UserCheck className="text-emerald-500" />
            Field Inspectors &amp; Officers Workload
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Manage government and approved third-party inspectors, track workloads, and reassign zones.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchInspectors}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold cursor-pointer"
          >
            <Plus size={14} />
            <span>Register Inspector</span>
          </button>
          
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search inspectors..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
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
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedInspectors.map((inspector, idx) => (
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
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                      <MapPin size={13} className="text-emerald-600 shrink-0" />
                      <span>{inspector.assigned_zone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100">
                      {inspector.active_inspections} Ongoing
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-emerald-600">
                    {inspector.pass_rate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-bold text-red-600">
                    {inspector.ncrs_issued}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        setSelectedInspector(inspector);
                        setIsReassignOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#022C4F] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Map size={12} />
                      <span>Reassign Zone</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {inspectors.length === 0 && !isLoading && (
          <div className="p-12 text-center text-gray-500 text-sm">
            No inspectors found matching criteria.
          </div>
        )}

        {/* Pagination Bar */}
        {inspectors.length > 0 && (
          <PaginationBar
            currentPage={currentPage}
            totalItems={inspectors.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}
      </motion.div>

      {/* Reassign Zone Modal */}
      <ReassignZoneModal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        onSuccess={fetchInspectors}
        inspector={selectedInspector}
      />

      {/* Create Inspector Modal */}
      <CreateStakeholderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchInspectors}
        initialCategory="inspector"
      />
    </div>
  );
}
