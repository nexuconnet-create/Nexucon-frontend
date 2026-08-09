"use client";

import React from "react";
import { 
  FileText,
  Download,
  Share2,
  Calendar,
  FileCheck,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

export default function Reports() {
  const reports = [
    { id: "RPT-101", title: "Downtown Metro - Weekly Progress", type: "Progress Report", date: "Oct 10, 2026", size: "2.4 MB" },
    { id: "RPT-102", title: "Highway Bridge A4 - Structural Deviation", type: "Deviation Analysis", date: "Oct 09, 2026", size: "4.1 MB" },
    { id: "RPT-103", title: "Riverside Complex - Volume Calculation", type: "Earthworks", date: "Oct 05, 2026", size: "1.8 MB" },
    { id: "RPT-104", title: "City Hospital Annex - QA/QC Summary", type: "Quality Control", date: "Oct 01, 2026", size: "1.1 MB" },
  ];

  const templates = [
    { name: "Progress Report", desc: "Standard weekly site progression summary with before/after views." },
    { name: "Deviation Analysis", desc: "Detailed breakdown of As-Built vs BIM anomalies." },
    { name: "QA/QC Summary", desc: "Tersus S1 hardware calibration and data quality metrics." },
    { name: "Earthworks Volume", desc: "Cut/fill calculations from topographic scans." },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Reports & Deliverables</h1>
          <p className="text-gray-500 mt-1">Generate, manage, and share standardized reports derived from scan data.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors shadow-lg shadow-blue-900/20">
          <Plus size={18} />
          <span className="font-medium">Generate New Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Generated Reports</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {reports.map((report, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={report.id} 
                  className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{report.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                          {report.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {report.date}
                        </span>
                        <span>•</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors">
                      <Share2 size={14} /> Share
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors">
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Templates */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileCheck size={20} className="text-emerald-500" />
              Report Templates
            </h3>
            
            <div className="space-y-4">
              {templates.map((tpl, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group">
                  <h4 className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{tpl.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
