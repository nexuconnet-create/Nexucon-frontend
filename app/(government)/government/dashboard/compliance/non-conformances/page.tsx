"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, Search, Filter, Plus, Calendar, User, ArrowRight, 
  Eye, ShieldAlert, AlertOctagon, Gavel, RefreshCw, CheckCircle 
} from "lucide-react";
import { NonConformanceReport, getNCRs } from "@/services/compliance";
import LogNCRDrawer from "@/components/dashboard/LogNCRDrawer";
import EscalateNCRModal from "@/components/dashboard/EscalateNCRModal";
import VerifyCloseNCRModal from "@/components/dashboard/VerifyCloseNCRModal";

export default function NonConformances() {
  const [ncrs, setNcrs] = useState<NonConformanceReport[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [selectedNcr, setSelectedNcr] = useState<NonConformanceReport | null>(null);
  const [isVerifyCloseModalOpen, setIsVerifyCloseModalOpen] = useState(false);
  const [selectedNcrForClose, setSelectedNcrForClose] = useState<NonConformanceReport | null>(null);

  const fetchNCRs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (selectedSeverity !== 'All') params.severity = selectedSeverity;
      if (searchQuery) params.search = searchQuery;

      const data = await getNCRs(params);
      setNcrs(data);
    } catch (err) {
      console.error("Failed to load NCRs", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSeverity, searchQuery]);

  useEffect(() => {
    fetchNCRs();
  }, [fetchNCRs]);

  const handleCloseNCR = (ncr: NonConformanceReport) => {
    setSelectedNcrForClose(ncr);
    setIsVerifyCloseModalOpen(true);
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'Major': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Minor': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch(status) {
      case 'Open': return <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>;
      case 'In Progress': return <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"></div>;
      case 'Closed': return <div className="w-2 h-2 rounded-full bg-emerald-500"></div>;
      default: return null;
    }
  };

  const getEscalationStatus = (daysOpen: number, status: string, level: number) => {
    if (status === 'Closed') return { level: 'Resolved', action: 'None', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', manual: false };
    if (level === 1) return { level: 'Level 1', action: 'Reminder Sent (Auto)', color: 'bg-blue-50 text-blue-700 border-blue-200', manual: false };
    if (level === 2) return { level: 'Level 2', action: 'Warning Letter (Auto)', color: 'bg-amber-50 text-amber-700 border-amber-200', manual: false };
    if (level === 3) return { level: 'Level 3', action: 'Escalate to Sr. Officer', color: 'bg-orange-100 text-orange-700 border-orange-200', manual: true };
    if (level === 4) return { level: 'Level 4', action: 'Escalate to Director', color: 'bg-red-100 text-red-700 border-red-200', manual: true };
    return { level: 'Level 5 (Critical)', action: 'Initiate Legal Proceedings', color: 'bg-red-600 text-white border-red-700', manual: true, critical: true };
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <AlertTriangle className="text-amber-500" />
            Non-Conformance Reports (NCR) Registry
          </h1>
          <p className="text-gray-500 mt-1">Log, track, escalate, and resolve deviations from statutory building and safety standards.</p>
        </div>
        
        <button 
          onClick={() => setIsLogDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold"
        >
          <Plus size={16} />
          Log New NCR
        </button>
      </div>

      {/* Escalation Matrix Legend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2">
          <AlertOctagon size={18} className="text-red-500" />
          5-Stage Regulatory Escalation Matrix
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-[10px] font-bold text-blue-500 uppercase">Stage 1 (0-7d)</p>
            <p className="text-sm font-bold text-blue-900 mt-1">Reminder Sent</p>
            <p className="text-xs text-blue-600 mt-0.5">Automated Notice</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-[10px] font-bold text-amber-500 uppercase">Stage 2 (7-14d)</p>
            <p className="text-sm font-bold text-amber-900 mt-1">Warning Letter</p>
            <p className="text-xs text-amber-600 mt-0.5">Automated Citation</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
            <p className="text-[10px] font-bold text-orange-500 uppercase">Stage 3 (14-21d)</p>
            <p className="text-sm font-bold text-orange-900 mt-1">Sr. Officer Action</p>
            <p className="text-xs text-orange-600 mt-0.5">Enforcement Trigger</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-[10px] font-bold text-red-500 uppercase">Stage 4 (21-28d)</p>
            <p className="text-sm font-bold text-red-900 mt-1">Director Order</p>
            <p className="text-xs text-red-600 mt-0.5">Stop-Work Review</p>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-[10px] font-bold text-red-400 uppercase">Stage 5 (28+d)</p>
            <p className="text-sm font-bold text-white mt-1">Legal Action</p>
            <p className="text-xs text-slate-400 mt-0.5">Site Suspension</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by NCR reference, title, or assignee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={fetchNCRs}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {['All', 'Critical', 'Major', 'Minor'].map(sev => (
            <button 
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                selectedSeverity === sev 
                  ? 'bg-[#022C4F] text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading Non-Conformance Reports...</div>
        ) : ncrs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 p-8">
            <ShieldAlert size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Non-Conformance Reports found.</p>
            <button onClick={() => setIsLogDrawerOpen(true)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
              Log First NCR
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-xs text-gray-500">NCR Details</th>
                <th className="py-4 px-6 font-semibold text-xs text-gray-500">Severity</th>
                <th className="py-4 px-6 font-semibold text-xs text-gray-500">Reporter / Date</th>
                <th className="py-4 px-6 font-semibold text-xs text-gray-500">Status & CAPA</th>
                <th className="py-4 px-6 font-semibold text-xs text-gray-500">Escalation Stage</th>
                <th className="py-4 px-6 font-semibold text-xs text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ncrs.map((ncr, idx) => {
                const esc = getEscalationStatus(ncr.days_open, ncr.status, ncr.escalation_level);
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    key={ncr.id} 
                    className="hover:bg-amber-50/20 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                          ncr.severity === 'Critical' ? 'bg-red-50 border-red-100 text-red-500' :
                          ncr.severity === 'Major' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                          'bg-blue-50 border-blue-100 text-blue-500'
                        }`}>
                          <ShieldAlert size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{ncr.title}</h4>
                          <p className="text-xs font-mono font-bold text-gray-500 mt-0.5">{ncr.ncr_reference} • {ncr.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getSeverityStyle(ncr.severity)}`}>
                        {ncr.severity}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <User size={14} className="text-gray-400" /> {ncr.reported_by_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar size={14} className="text-gray-400" /> {new Date(ncr.date_logged).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          {getStatusIndicator(ncr.status)}
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            ncr.status === 'Open' ? 'text-red-600' : 
                            ncr.status === 'In Progress' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {ncr.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-max">
                          CAPA: {ncr.linked_capa_ref || 'Active'} <ArrowRight size={10} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-500">{ncr.status !== 'Closed' ? `${ncr.days_open} Days Open` : 'Resolved'}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${esc.color}`}>
                          {esc.action}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ncr.status !== 'Closed' && (
                          <button 
                            onClick={() => { setSelectedNcr(ncr); setIsEscalateModalOpen(true); }}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                              esc.critical 
                              ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20' 
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            {esc.critical ? <Gavel size={14} /> : <AlertOctagon size={14} />}
                            Escalate
                          </button>
                        )}
                        {ncr.status !== 'Closed' ? (
                          <button 
                            onClick={() => handleCloseNCR(ncr)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                          >
                            <CheckCircle size={14} /> Close
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600">Verified</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <LogNCRDrawer
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
        onSuccess={fetchNCRs}
      />

      <EscalateNCRModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        ncr={selectedNcr}
        onSuccess={fetchNCRs}
      />

      <VerifyCloseNCRModal
        isOpen={isVerifyCloseModalOpen}
        onClose={() => setIsVerifyCloseModalOpen(false)}
        ncr={selectedNcrForClose}
        onSuccess={fetchNCRs}
      />
    </div>
  );
}
