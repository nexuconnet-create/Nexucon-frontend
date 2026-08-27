"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Save, Volume2, HardHat, Clock, ShieldAlert, BookOpen, ExternalLink, ArrowRight, RefreshCw, Plus } from "lucide-react";
import { ComplianceStandard, StatutoryDocument, getComplianceStandards, updateComplianceStandards, getStatutoryDocuments } from "@/services/settings";
import AddComplianceStandardDrawer from "@/components/dashboard/AddComplianceStandardDrawer";

export default function ComplianceStandards() {
  const [standards, setStandards] = useState<ComplianceStandard[]>([]);
  const [statutes, setStatutes] = useState<StatutoryDocument[]>([]);
  const [thresholds, setThresholds] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);

  const fetchStandardsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stData, docData] = await Promise.all([
        getComplianceStandards().catch(() => []),
        getStatutoryDocuments().catch(() => [])
      ]);
      const validStandards = Array.isArray(stData) ? stData : [];
      const validStatutes = Array.isArray(docData) ? docData : [];
      setStandards(validStandards);
      setStatutes(validStatutes);

      const threshMap: Record<string, number> = {};
      validStandards.forEach(s => {
        if (s && s.key) threshMap[s.key] = s.num_value;
      });
      setThresholds(threshMap);
    } catch (err) {
      console.error("Failed to load compliance standards", err);
      setStandards([]);
      setStatutes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandardsData();
  }, [fetchStandardsData]);

  const handleSliderChange = (key: string, value: number) => {
    setThresholds(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateComplianceStandards(thresholds);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Compliance thresholds and SLA timers saved!", type: "success" } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to save standards", type: "error" } }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldCheck className="text-blue-500" />
            Compliance Standards
          </h1>
          <p className="text-gray-500 mt-1">Configure automated thresholds and tolerances that trigger system alerts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStandardsData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Thresholds'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Environmental Limits */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Volume2 size={20} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-900">Environmental Noise Limits</h2>
                  <p className="text-xs text-gray-500">Decibel thresholds for automated sensor alerts.</p>
               </div>
            </div>
            
            <div className="space-y-6 max-w-2xl">
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Daytime Max (07:00 - 19:00)</label>
                     <span className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg font-mono">
                       {thresholds['noise_daytime_db'] ?? 85} dB
                     </span>
                  </div>
                  <input 
                    type="range" 
                    min="60" 
                    max="120" 
                    value={thresholds['noise_daytime_db'] ?? 85} 
                    onChange={(e) => handleSliderChange('noise_daytime_db', parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer" 
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Exceeding this triggers a low-priority telemetry warning.</p>
               </div>
               
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Nighttime Max (19:00 - 07:00)</label>
                     <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100 font-mono">
                       {thresholds['noise_nighttime_db'] ?? 70} dB
                     </span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="100" 
                    value={thresholds['noise_nighttime_db'] ?? 70} 
                    onChange={(e) => handleSliderChange('noise_nighttime_db', parseFloat(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer" 
                  />
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                     <ShieldAlert size={12} className="text-red-500" /> Exceeding this triggers an immediate high-priority alert.
                  </p>
               </div>
            </div>
          </div>

          {/* Structural Tolerances */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <HardHat size={20} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-900">Structural Material Tolerances</h2>
                  <p className="text-xs text-gray-500">Auto-reject thresholds for entered field inspection data.</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Concrete Slump (Inches)</label>
                  <input 
                     type="number" 
                     step="0.1"
                     value={thresholds['max_concrete_slump_in'] ?? 6.0} 
                     onChange={(e) => handleSliderChange('max_concrete_slump_in', parseFloat(e.target.value))}
                     className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-xs font-bold"
                  />
                  <p className="text-[11px] text-gray-400 mt-2">Values entered above this will automatically fail the inspection.</p>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min Curing Temp (°F)</label>
                  <input 
                     type="number" 
                     value={thresholds['min_curing_temp_f'] ?? 40} 
                     onChange={(e) => handleSliderChange('min_curing_temp_f', parseFloat(e.target.value))}
                     className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-xs font-bold"
                  />
               </div>
            </div>
          </div>

          {/* SLA Thresholds */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={20} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-900">Overdue SLA Timers</h2>
                  <p className="text-xs text-gray-500">Configure how many days before a pending action is marked Overdue.</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Permit Review SLA (Days)</label>
                  <div className="flex items-center gap-2">
                     <input 
                        type="number" 
                        value={thresholds['permit_review_sla_days'] ?? 14} 
                        onChange={(e) => handleSliderChange('permit_review_sla_days', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-xs font-bold"
                     />
                     <span className="text-xs font-bold text-gray-500 shrink-0">Days</span>
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Defect Rectification (Days)</label>
                  <div className="flex items-center gap-2">
                     <input 
                        type="number" 
                        value={thresholds['defect_rectification_sla_days'] ?? 5} 
                        onChange={(e) => handleSliderChange('defect_rectification_sla_days', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-xs font-bold"
                     />
                     <span className="text-xs font-bold text-gray-500 shrink-0">Days</span>
                  </div>
               </div>
             </div>
           </div>

           {/* Statutory Instrument Reference */}
           <div className="p-8 bg-slate-900 text-white rounded-b-3xl">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                     <BookOpen className="text-blue-400" size={20} /> Statutory Instrument Reference
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Digital library of applicable laws, regulations, and codes connected to system thresholds.</p>
                </div>
                <button 
                  onClick={() => setIsAddDocOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold border border-slate-700 transition-colors shadow-sm"
                >
                  <Plus size={14} /> Add Document
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statutes.map((statute, idx) => (
                  <div key={statute.id || idx} className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl hover:bg-slate-800 transition-colors">
                     <div className="flex items-start justify-between mb-3">
                       <div>
                         <h3 className="font-bold text-sm text-slate-100">{statute.name}</h3>
                         <span className="inline-block px-2 py-0.5 mt-1 bg-slate-900 border border-slate-700 rounded-md text-[10px] font-mono font-bold text-blue-300">
                           {statute.code}
                         </span>
                       </div>
                     </div>
                     <div className="mt-3 pt-3 border-t border-slate-700/50">
                       <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Connected System Features</p>
                       <div className="flex flex-wrap gap-2">
                         {statute.connected_features?.map(f => (
                           <span key={f} className="text-[11px] font-semibold bg-slate-900/50 text-slate-300 px-2 py-1 rounded-lg border border-slate-700/50 flex items-center gap-1">
                             {f} <ArrowRight size={10} className="text-slate-500" />
                           </span>
                         ))}
                       </div>
                     </div>
                  </div>
                ))}
             </div>
           </div>
        </motion.div>
      </div>

      <AddComplianceStandardDrawer
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        onSuccess={fetchStandardsData}
      />
    </div>
  );
}
