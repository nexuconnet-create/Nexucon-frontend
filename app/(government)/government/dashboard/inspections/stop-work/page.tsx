"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertOctagon, FileWarning, Search, Filter, Plus, FileText, 
  CheckCircle, Clock, RefreshCw, ArrowUpRight, ShieldAlert, Check
} from "lucide-react";
import { getStopWorkOrders, getStopWorkOrderStats, StopWorkOrder, StopWorkOrderStats } from "@/services/inspections";
import LiftStopWorkModal from "@/components/dashboard/LiftStopWorkModal";
import IssueStopWorkModal from "@/components/dashboard/IssueStopWorkModal";
import TopRightControls from "@/components/dashboard/TopRightControls";
import { useRouter } from "next/navigation";

export default function StopWorkOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<StopWorkOrder[]>([]);
  const [stats, setStats] = useState<StopWorkOrderStats>({
    active: 0,
    pending_appeals: 0,
    lifted_30d: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LIFTED'>('ALL');

  // Modal States
  const [selectedSWOForLift, setSelectedSWOForLift] = useState<StopWorkOrder | null>(null);
  const [isLiftModalOpen, setIsLiftModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const fetchSWOData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        getStopWorkOrders({ search: searchQuery }),
        getStopWorkOrderStats()
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load SWOs", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchSWOData();
  }, [fetchSWOData]);

  const displayedOrders = orders.filter(o => {
    if (statusFilter === 'ACTIVE') return o.status === 'ACTIVE';
    if (statusFilter === 'LIFTED') return o.status === 'LIFTED';
    return true;
  });

  return (
    <div className="w-full min-h-screen pb-16 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <AlertOctagon size={20} />
            </div>
            <h1 className="text-[32px] font-bold text-[#022C4F] leading-tight">Stop-Work Orders Registry</h1>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed ml-[52px]">Enforce regulatory compliance by tracking site suspensions, violations, and official order liftings.</p>
        </div>
        <TopRightControls />
      </div>

      {/* Action Button Above KPI */}
      <div className="flex items-center justify-end shrink-0 mb-6">
        <button 
          onClick={() => setIsIssueModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
        >
          <AlertOctagon size={16} />
          <span>Issue Stop-Work Order</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => setStatusFilter('ACTIVE')}
          className={`bg-white p-6 rounded-3xl shadow-sm border flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'ACTIVE' ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-100 hover:shadow-md'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active SWOs</p>
            <h2 className="text-3xl font-black text-rose-600 mt-1">{stats.active}</h2>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Suspended Construction Sites</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 p-3">
            <AlertOctagon size={26}/>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Appeals</p>
            <h2 className="text-3xl font-black text-amber-600 mt-1">{stats.pending_appeals}</h2>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Awaiting Directorate Tribunal</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 p-3">
            <FileWarning size={26}/>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('LIFTED')}
          className={`bg-white p-6 rounded-3xl shadow-sm border flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'LIFTED' ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-slate-100 hover:shadow-md'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders Lifted (30d)</p>
            <h2 className="text-3xl font-black text-emerald-600 mt-1">{stats.lifted_30d}</h2>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Sites Fully Reinstated</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 p-3">
            <CheckCircle size={26}/>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search orders by number, project, reason..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs w-full focus:ring-2 focus:ring-rose-500 focus:outline-none" 
              />
            </div>
            <button 
              onClick={fetchSWOData}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'ACTIVE', label: 'Active Suspensions' },
              { id: 'LIFTED', label: 'Lifted Orders' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id 
                    ? 'bg-[#022C4F] text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-semibold">Loading stop-work orders...</p>
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <CheckCircle size={48} className="text-emerald-300 mb-4"/>
              <p className="text-sm font-bold text-slate-700">No stop-work orders matching current filter.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">Order Number</th>
                  <th className="py-3.5 px-6">Target Project</th>
                  <th className="py-3.5 px-6">Violation Justification</th>
                  <th className="py-3.5 px-6">Date Issued</th>
                  <th className="py-3.5 px-6">Enforcement Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayedOrders.map((swo) => (
                  <tr key={swo.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {swo.order_number}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#022C4F]">
                      {swo.project_name}
                    </td>
                    <td className="py-4 px-6 text-rose-600 font-medium max-w-xs truncate">
                      {swo.reason}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <Clock size={13} className="inline mr-1 mb-0.5 text-slate-400"/>
                      {new Date(swo.issued_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        swo.status === 'ACTIVE' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {swo.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {swo.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              setSelectedSWOForLift(swo);
                              setIsLiftModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                          >
                            <Check size={13} /> Lift Order
                          </button>
                        )}
                        <button 
                          onClick={() => router.push(`/government/dashboard/projects/view/${swo.project}/monitoring`)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 p-1.5"
                        >
                          <FileText size={14}/> Project <ArrowUpRight size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <LiftStopWorkModal
        isOpen={isLiftModalOpen}
        onClose={() => setIsLiftModalOpen(false)}
        swo={selectedSWOForLift}
        onSuccess={fetchSWOData}
      />

      <IssueStopWorkModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={(newSWO) => {
          if (newSWO) {
            setOrders(prev => [newSWO, ...prev]);
            setStats(prev => ({
              ...prev,
              active: prev.active + 1,
              total: prev.total + 1
            }));
          }
          fetchSWOData();
        }}
      />
    </div>
  );
}
