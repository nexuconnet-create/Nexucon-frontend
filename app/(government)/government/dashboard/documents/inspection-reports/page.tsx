"use client";

import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, Search, Filter, AlertTriangle, CheckCircle2, Calendar, FileText, User } from "lucide-react";

export default function InspectionReports() {
  const inspections = [
    { id: "INSP-504", title: "Monthly Health & Safety Walkthrough", inspector: "J. Doe (HSE)", date: "Oct 10, 2026", type: "Safety", status: "Passed", issues: 0 },
    { id: "INSP-503", title: "Structural Steel Welding QA/QC", inspector: "T. Vance (QA)", date: "Oct 08, 2026", type: "Quality", status: "Action Required", issues: 3 },
    { id: "INSP-502", title: "HVAC Installation Phase 1", inspector: "M. Chen (MEP)", date: "Oct 05, 2026", type: "Quality", status: "Failed", issues: 1 },
    { id: "INSP-501", title: "Pre-Pour Concrete Inspection", inspector: "A. Rivera (Str)", date: "Sep 28, 2026", type: "Quality", status: "Passed", issues: 0 },
    { id: "INSP-500", title: "Environmental Dust Control", inspector: "EPA Auditor", date: "Sep 15, 2026", type: "Environmental", status: "Action Required", issues: 2 },
  ];

  const getStatusDisplay = (status: string, issues: number) => {
    if (status === 'Passed') {
      return (
        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 w-max">
          <CheckCircle2 size={14} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Passed</span>
        </div>
      );
    }
    if (status === 'Failed') {
      return (
        <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100 w-max">
          <AlertTriangle size={14} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Failed ({issues} critical)</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 w-max">
        <AlertTriangle size={14} />
        <span className="text-[11px] font-bold uppercase tracking-wider">{issues} Issues Found</span>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ClipboardList className="text-blue-500" />
            Inspection Reports
          </h1>
          <p className="text-gray-500 mt-1">Review on-site audit findings, safety walkthroughs, and QA/QC inspections.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by inspector or title..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {['All', 'Safety', 'Quality', 'Environmental'].map(filter => (
            <button key={filter} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 rounded-md transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inspections.map((insp, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={insp.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
          >
            <div className={`p-5 border-b ${
              insp.status === 'Passed' ? 'border-emerald-100 bg-emerald-50/30' :
              insp.status === 'Failed' ? 'border-red-100 bg-red-50/30' : 'border-amber-100 bg-amber-50/30'
            }`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-bold text-gray-900 leading-snug flex-1">{insp.title}</h3>
                <span className="text-xs font-mono font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm shrink-0">{insp.id}</span>
              </div>
              {getStatusDisplay(insp.status, insp.issues)}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium">{insp.inspector}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="font-medium">{insp.date}</span>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{insp.type} Audit</span>
                <button className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  <FileText size={16} /> View Report
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
