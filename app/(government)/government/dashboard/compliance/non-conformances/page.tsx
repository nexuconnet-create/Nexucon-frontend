"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Filter, Plus, Calendar, User, ArrowRight, Eye, ShieldAlert } from "lucide-react";

export default function NonConformances() {
  const ncrs = [
    { 
      id: "NCR-104", 
      title: "Improper Scaffold Tie-offs at Sector 4", 
      severity: "Major", 
      dateLogged: "Oct 12, 2026", 
      reportedBy: "J. Doe (Safety)", 
      status: "Open",
      linkedCapa: "CAPA-092"
    },
    { 
      id: "NCR-103", 
      title: "Concrete Slump Test Failed (Batch B)", 
      severity: "Critical", 
      dateLogged: "Oct 10, 2026", 
      reportedBy: "QA Lab", 
      status: "In Progress",
      linkedCapa: "CAPA-091"
    },
    { 
      id: "NCR-102", 
      title: "Missing Warning Signage - Loading Bay", 
      severity: "Minor", 
      dateLogged: "Oct 08, 2026", 
      reportedBy: "HSE Auditor", 
      status: "Closed",
      linkedCapa: "CAPA-090"
    },
    { 
      id: "NCR-101", 
      title: "Unapproved Subcontractor on Site", 
      severity: "Major", 
      dateLogged: "Oct 01, 2026", 
      reportedBy: "Site Admin", 
      status: "Open",
      linkedCapa: "CAPA-088"
    }
  ];

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

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <AlertTriangle className="text-amber-500" />
            Non-Conformance Reports (NCR)
          </h1>
          <p className="text-gray-500 mt-1">Log, track, and resolve deviations from compliance standards.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold">
          <Plus size={16} />
          Log New NCR
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by NCR ID, Title, or Assignee..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Advanced Filter
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-gray-500">Severity:</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-bold border border-red-200">Critical</span>
            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-bold border border-amber-200">Major</span>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-200">Minor</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">NCR Details</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Severity</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Reported By / Date</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Status & CAPA</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ncrs.map((ncr, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={ncr.id} 
                className="hover:bg-amber-50/20 transition-colors group cursor-pointer"
              >
                <td className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                      ncr.severity === 'Critical' ? 'bg-red-50 border-red-100 text-red-500' :
                      ncr.severity === 'Major' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                      'bg-blue-50 border-blue-100 text-blue-500'
                    }`}>
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{ncr.title}</h4>
                      <p className="text-xs font-mono font-bold text-gray-500 mt-1">{ncr.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${getSeverityStyle(ncr.severity)}`}>
                    {ncr.severity}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <User size={14} className="text-gray-400" /> {ncr.reportedBy}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar size={14} className="text-gray-400" /> {ncr.dateLogged}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-2">
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
                      CAPA Link: {ncr.linkedCapa} <ArrowRight size={10} />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors">
                      <Eye size={14} /> Review
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
