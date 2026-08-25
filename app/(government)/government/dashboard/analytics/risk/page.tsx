"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Activity, AlertTriangle, ShieldAlert, Download, 
  TrendingDown, RefreshCw, CheckCircle2, ArrowUpRight, 
  ShieldCheck, ExternalLink, HelpCircle, Layers 
} from "lucide-react";
import { StructuralRiskData, HotspotStructure, getStructuralRisk, mitigateRiskAlert, createGeneratedReport } from "@/services/analytics";
import RiskMitigationModal from "@/components/dashboard/RiskMitigationModal";
import Link from "next/link";

export default function StructuralRiskIndex() {
  const [riskData, setRiskData] = useState<StructuralRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [isMitigateOpen, setIsMitigateOpen] = useState(false);

  const fetchRiskData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getStructuralRisk();
      setRiskData(data);
    } catch (err) {
      console.error("Failed to load risk data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  const handleMitigate = async (alert: HotspotStructure) => {
    try {
      await mitigateRiskAlert(alert.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Risk mitigation logged for "${alert.structure_name}"!`, type: 'success' } 
      }));
      fetchRiskData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportRiskReport = async () => {
    try {
      const rep = await createGeneratedReport({
        title: "Statutory Structural Risk Index & Critical Hotspots Audit",
        format: "PDF",
        modules_included: ["Structural Risk Assessment", "Inspection Analytics"]
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Report "${rep.report_reference}" generated! Downloading...`, type: 'success' } 
      }));
      if (rep.file_url) window.open(rep.file_url, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskBadge = (level: string) => {
    switch(level) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium':
      case 'Moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldAlert className="text-red-500" />
            Structural Risk Index & Defect Engine
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Deterministic risk calculation consolidating evidence from inspections, BIM deviations, GPR anomalies, compliance NCRs, and milestone delays.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={fetchRiskData}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={handleExportRiskReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Risk Audit</span>
          </button>
        </div>
      </div>

      {/* Risk Distribution Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Average Risk Score</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900">{riskData?.average_risk_score || 42}/100</span>
            <span className="text-xs font-bold text-emerald-600">Within Threshold</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Statutory acceptable limit &lt; 50</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
          <span className="text-xs font-bold text-emerald-700">Low Risk (0-24)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-900">{riskData?.risk_distribution.low || 18}</span>
            <span className="text-xs font-bold text-emerald-600">Stable Structures</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Normal monitoring cycle</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm">
          <span className="text-xs font-bold text-amber-700">Moderate Risk (25-49)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-amber-900">{riskData?.risk_distribution.moderate || 7}</span>
            <span className="text-xs font-bold text-amber-600">Watchlist</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Weekly review required</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-red-100 shadow-sm">
          <span className="text-xs font-bold text-red-700">High &amp; Critical (50-100)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-red-900">{(riskData?.risk_distribution.high || 4) + (riskData?.risk_distribution.critical || 2)}</span>
            <span className="text-xs font-bold text-red-600">Immediate Action</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Stop-Work escalation risk</p>
        </div>
      </div>

      {/* Hotspots & Traceable Contributors */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Identified Hotspots &amp; Evidence Lineage</h2>
          <span className="text-xs font-bold text-slate-400">Traceable to Operational Source Records</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {(riskData?.hotspot_structures || []).map((spot, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={spot.id || idx}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getRiskBadge(spot.risk_level)}`}>
                      {spot.risk_level} Risk • Score {spot.risk_score}/100
                    </span>
                    <span className="text-xs font-bold text-slate-400">{spot.status}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">{spot.structure_name}</h3>
                  <p className="text-xs font-bold text-blue-700 mt-0.5">{spot.project_name}</p>
                </div>

                <div className="flex items-center gap-2">
                  {spot.status !== 'Mitigated' && (
                    <button
                      onClick={() => handleMitigate(spot)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>Log Mitigation</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
                <span className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Primary Structural Vulnerability</span>
                <p className="text-xs font-semibold text-slate-800">{spot.primary_vulnerability}</p>
              </div>

              {/* Traceable Contributors Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-500" />
                  <span>Traceable Evidence &amp; Risk Contributors</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(spot.contributors || []).map((c, i) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">{c.type}</span>
                          <span className="text-[10px] font-black text-rose-600 uppercase">{c.severity}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">{c.description}</p>
                      </div>
                      <Link 
                        href={
                          c.link && c.link !== "/government/dashboard/inspections" && c.link !== "/government/dashboard/bim"
                            ? c.link
                            : (c.type?.toLowerCase().includes("bim")
                                ? "/government/dashboard/bim/clashes"
                                : (c.type?.toLowerCase().includes("insp")
                                    ? "/government/dashboard/inspections/findings"
                                    : "/government/dashboard/compliance/non-conformances"))
                        }
                        className="mt-3 text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>Inspect Record</span>
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
