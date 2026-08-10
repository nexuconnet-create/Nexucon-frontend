"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Filter, CheckCircle2, Circle, FileType2, Search, ArrowRight, LayoutTemplate } from "lucide-react";

export default function ExportReports() {
  const [selectedModules, setSelectedModules] = useState<string[]>(['Project Performance', 'Compliance']);
  const [format, setFormat] = useState<string>('PDF');

  const availableModules = [
    "Project Performance",
    "Construction Progress & EVM",
    "Inspection Analytics",
    "Compliance & Regulatory",
    "Financial Overview",
    "Agency Performance SLAs",
    "Detailed Approval Logs",
    "BIM Clash Summaries",
    "Structural Risk Assessment",
    "Compliance Dashboard",
    "Inspector Performance",
    "Annual Building Safety Report",
    "Emergency Response Report"
  ];

  const toggleModule = (moduleName: string) => {
    if (selectedModules.includes(moduleName)) {
      setSelectedModules(selectedModules.filter(m => m !== moduleName));
    } else {
      setSelectedModules([...selectedModules, moduleName]);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Report Builder & Export
          </h1>
          <p className="text-gray-500 mt-1">Configure and generate custom PDF or CSV reports for stakeholders.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Configuration Wizard */}
        <div className="lg:w-2/3 space-y-6">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">1</div>
              <h2 className="text-lg font-bold text-gray-900">Select Date Range</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="date" defaultValue="2026-07-01" className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="date" defaultValue="2026-09-30" className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {['Last 7 Days', 'Last 30 Days', 'Q3 2026', 'YTD'].map(preset => (
                <button key={preset} className="px-3 py-1.5 text-xs font-bold bg-gray-50 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                  {preset}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">2</div>
              <h2 className="text-lg font-bold text-gray-900">Include Data Modules</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableModules.map(module => (
                <div 
                  key={module}
                  onClick={() => toggleModule(module)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedModules.includes(module) ? 'bg-blue-50/50 border-blue-200 shadow-sm ring-1 ring-blue-500/10' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    selectedModules.includes(module) ? 'bg-blue-500 text-white' : 'text-gray-300'
                  }`}>
                    {selectedModules.includes(module) ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </div>
                  <span className={`text-sm font-semibold ${selectedModules.includes(module) ? 'text-blue-900' : 'text-gray-600'}`}>{module}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">3</div>
              <h2 className="text-lg font-bold text-gray-900">Export Format</h2>
            </div>
            
            <div className="flex gap-4">
              <div 
                onClick={() => setFormat('PDF')}
                className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  format === 'PDF' ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white hover:border-red-200'
                }`}
              >
                <FileType2 size={32} className={format === 'PDF' ? 'text-red-600' : 'text-gray-400'} />
                <span className={`font-bold mt-2 ${format === 'PDF' ? 'text-red-700' : 'text-gray-600'}`}>PDF Document</span>
                <span className="text-xs text-gray-500 text-center mt-1">Executive summaries & charts</span>
              </div>
              <div 
                onClick={() => setFormat('CSV')}
                className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  format === 'CSV' ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 bg-white hover:border-emerald-200'
                }`}
              >
                <LayoutTemplate size={32} className={format === 'CSV' ? 'text-emerald-600' : 'text-gray-400'} />
                <span className={`font-bold mt-2 ${format === 'CSV' ? 'text-emerald-700' : 'text-gray-600'}`}>CSV Data</span>
                <span className="text-xs text-gray-500 text-center mt-1">Raw table data for Excel</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Summary & Generate */}
        <div className="lg:w-1/3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#022C4F] rounded-2xl shadow-md p-6 text-white sticky top-6"
          >
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-blue-900/50 pb-4">
              <Search className="text-blue-400" size={20} /> Report Summary
            </h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">Time Period</span>
                <p className="text-sm font-semibold">Jul 01, 2026 - Sep 30, 2026</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">Modules Included</span>
                <p className="text-sm font-semibold">{selectedModules.length} selected</p>
                <ul className="mt-2 space-y-1">
                  {selectedModules.map(m => (
                    <li key={m} className="text-xs text-blue-200 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400"></div> {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">Format</span>
                <p className="text-sm font-semibold">{format}</p>
              </div>
            </div>

            <button className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-colors flex items-center justify-center gap-2">
              <Download size={18} />
              Generate & Download
            </button>
            <p className="text-[10px] text-center text-blue-300 mt-3 font-semibold">
              Estimated generation time: ~15 seconds
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
