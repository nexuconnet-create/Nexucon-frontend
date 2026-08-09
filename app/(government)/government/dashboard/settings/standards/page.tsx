"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Save, Volume2, Droplet, Clock, HardHat, ShieldAlert } from "lucide-react";

export default function ComplianceStandards() {
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
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <Save size={16} />
            Save Thresholds
          </button>
        </div>
      </div>

      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Environmental Limits */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Volume2 size={20} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-900">Environmental Noise Limits</h2>
                  <p className="text-sm text-gray-500">Decibel thresholds for automated sensor alerts.</p>
               </div>
            </div>
            
            <div className="space-y-6 max-w-2xl ml-13 pl-13">
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-sm font-bold text-gray-700">Daytime Max (07:00 - 19:00)</label>
                     <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">85 dB</span>
                  </div>
                  <input type="range" min="60" max="120" defaultValue="85" className="w-full accent-blue-600" />
                  <p className="text-xs text-gray-500 mt-1">Exceeding this triggers a low-priority alert.</p>
               </div>
               
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-sm font-bold text-gray-700">Nighttime Max (19:00 - 07:00)</label>
                     <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded border border-red-100">70 dB</span>
                  </div>
                  <input type="range" min="50" max="100" defaultValue="70" className="w-full accent-red-600" />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                     <ShieldAlert size={12} className="text-red-500" /> Exceeding this triggers an immediate high-priority alert.
                  </p>
               </div>
            </div>
          </div>

          {/* Structural Tolerances */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <HardHat size={20} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-900">Structural Material Tolerances</h2>
                  <p className="text-sm text-gray-500">Auto-reject thresholds for entered field data.</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl ml-13 pl-13">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Concrete Slump (Inches)</label>
                  <input 
                     type="number" 
                     defaultValue="6" 
                     className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">Values entered above this will automatically fail the inspection.</p>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min Curing Temp (°F)</label>
                  <input 
                     type="number" 
                     defaultValue="40" 
                     className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
               </div>
            </div>
          </div>

          {/* SLA Thresholds */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={20} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-900">Overdue SLA Timers</h2>
                  <p className="text-sm text-gray-500">Configure how many days before a pending action is marked Overdue.</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl ml-13 pl-13">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Permit Review SLA (Days)</label>
                  <div className="flex items-center gap-2">
                     <input 
                        type="number" 
                        defaultValue="14" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                     />
                     <span className="text-sm font-bold text-gray-500 shrink-0">Days</span>
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Defect Rectification (Days)</label>
                  <div className="flex items-center gap-2">
                     <input 
                        type="number" 
                        defaultValue="5" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                     />
                     <span className="text-sm font-bold text-gray-500 shrink-0">Days</span>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
