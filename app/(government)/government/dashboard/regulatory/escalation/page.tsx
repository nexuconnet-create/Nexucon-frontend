"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  GitMerge, ArrowRight, ShieldAlert, FileWarning, AlertOctagon, 
  Check, RefreshCw, AlertTriangle, ShieldCheck, Gavel, User, 
  Clock, ArrowUpRight, CheckCircle2, ChevronRight, Scale
} from "lucide-react";
import { 
  EscalationRule, getEscalationRules, toggleEscalationRule,
  NonConformanceReport, getNCRs, escalateNCR 
} from "@/services/compliance";
import EscalateNCRModal from "@/components/dashboard/EscalateNCRModal";

export default function EscalationMatrix() {
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [ncrs, setNcrs] = useState<NonConformanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNcr, setSelectedNcr] = useState<NonConformanceReport | null>(null);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rulesData, ncrData] = await Promise.all([
        getEscalationRules(),
        getNCRs()
      ]);
      setRules(rulesData);
      setNcrs(ncrData);
    } catch (err) {
      console.error("Failed to load escalation data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleRule = async (rule: EscalationRule) => {
    try {
      const updated = await toggleEscalationRule(rule.id);
      setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Rule "${rule.rule_name}" is now ${updated.is_active ? 'Active' : 'Disabled'}`, type: 'info' } 
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAdvance = async (ncr: NonConformanceReport) => {
    try {
      const nextLvl = Math.min(5, ncr.escalation_level + 1);
      await escalateNCR(ncr.id, { escalation_level: nextLvl });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `${ncr.ncr_reference} escalated to Level ${nextLvl}!`, type: 'success' } 
      }));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEscalateModal = (ncr: NonConformanceReport) => {
    setSelectedNcr(ncr);
    setIsEscalateModalOpen(true);
  };

  const activeEscalatedNcrs = ncrs.filter(n => n.status !== 'Closed');

  const levelsConfig = [
    { lvl: 1, title: "Issue Notice", subtitle: "To: Contractor", sla: "SLA: 48 Hours", icon: FileWarning, bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-600", text: "text-blue-900" },
    { lvl: 2, title: "Final Warning", subtitle: "To: Developer & Contractor", sla: "SLA: 24 Hours", icon: ShieldAlert, bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-500", text: "text-amber-900" },
    { lvl: 3, title: "Senior Officer Review", subtitle: "To: Lead Inspector", sla: "SLA: 24 Hours", icon: User, bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-600", text: "text-orange-900" },
    { lvl: 4, title: "Director Stop-Work", subtitle: "To: Directorate Board", sla: "SLA: 12 Hours", icon: AlertOctagon, bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-600", text: "text-rose-900" },
    { lvl: 5, title: "Legal Enforcement", subtitle: "To: State Ministry", sla: "SLA: Immediate", icon: Scale, bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-700", text: "text-purple-900" },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <GitMerge className="text-blue-500" />
            Regulatory Escalation Matrix & Governance
          </h1>
          <p className="text-gray-500 mt-1">Configure automated compliance enforcement paths, SLA thresholds, and live case escalations.</p>
        </div>
        
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-xs font-bold cursor-pointer self-start md:self-auto"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh Console</span>
        </button>
      </div>

      {/* 5-Level Statutory Stepper Workflow */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-gray-900 text-base sm:text-lg flex items-center gap-2">
            <GitMerge className="text-blue-600" size={20} />
            Statutory Escalation Workflow & Enforcement Matrix
          </h3>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-xl">
            Active Cases: {activeEscalatedNcrs.length}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {levelsConfig.map((lvlItem, idx) => (
            <div key={lvlItem.lvl} className={`rounded-2xl border ${lvlItem.border} ${lvlItem.bg} p-5 relative text-center flex flex-col justify-between`}>
              <div className={`w-7 h-7 rounded-full ${lvlItem.badge} text-white font-bold text-xs flex items-center justify-center absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm`}>
                {lvlItem.lvl}
              </div>
              <div className="pt-2">
                <lvlItem.icon size={22} className={`mx-auto mb-2 ${lvlItem.text}`} />
                <h4 className={`font-black text-xs sm:text-sm ${lvlItem.text}`}>{lvlItem.title}</h4>
                <p className="text-[11px] text-gray-600 font-medium mt-1">{lvlItem.subtitle}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/60">
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-white/80 px-2 py-0.5 rounded-md border border-gray-200">
                  {lvlItem.sla}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Active Escalated Cases Table (2 Cols) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  <ShieldAlert className="text-amber-500" size={18} />
                  Active Non-Conformance Cases in Escalation Queue
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Real-time status of infractions currently being monitored or escalated.</p>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {activeEscalatedNcrs.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-xs font-semibold">
                  <ShieldCheck size={36} className="mx-auto mb-2 text-emerald-400 opacity-60" />
                  No open non-conformance cases pending escalation.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-5">Case / Ref</th>
                      <th className="py-3 px-5">Project</th>
                      <th className="py-3 px-5">Severity</th>
                      <th className="py-3 px-5">Current Level</th>
                      <th className="py-3 px-5 text-right">Escalation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-medium">
                    {activeEscalatedNcrs.map(ncr => (
                      <tr key={ncr.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <span className="font-mono font-bold text-blue-700">{ncr.ncr_reference}</span>
                          <p className="font-bold text-gray-800 text-[11px] truncate max-w-[200px] mt-0.5">{ncr.title}</p>
                        </td>
                        <td className="py-3.5 px-5 text-gray-600 font-semibold">{ncr.project_name || 'General Project'}</td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            ncr.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                            ncr.severity === 'Major' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {ncr.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 bg-[#022C4F] text-white rounded-lg text-[10px] font-bold">
                            Level {ncr.escalation_level}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleQuickAdvance(ncr)}
                              disabled={ncr.escalation_level >= 5}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-40"
                              title="Advance to next escalation tier"
                            >
                              + Level
                            </button>
                            <button
                              onClick={() => openEscalateModal(ncr)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Manage
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
        </div>

        {/* Active Escalation Rules (1 Col) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-slate-50/70">
              <h3 className="font-black text-gray-900 text-sm sm:text-base">Active Escalation Trigger Rules</h3>
              <p className="text-xs text-gray-500 mt-0.5">Automated policy triggers configured for the agency.</p>
            </div>

            <div className="p-5 flex-1 divide-y divide-gray-100 space-y-4">
              {rules.map(rule => (
                <div key={rule.id} className="pt-4 first:pt-0 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {rule.trigger_category} • Level {rule.escalation_level} ({rule.sla_hours}h SLA)
                    </span>
                    <h4 className="font-bold text-gray-800 text-xs mt-1">{rule.rule_name}</h4>
                    <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Action: {rule.action_required}</p>
                  </div>
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                      rule.is_active 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {rule.is_active ? 'Active' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EscalateNCRModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        ncr={selectedNcr}
        onSuccess={fetchData}
      />
    </div>
  );
}
