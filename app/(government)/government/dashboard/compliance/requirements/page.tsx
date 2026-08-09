"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListTodo, Search, Filter, CheckCircle, AlertTriangle, XCircle, ChevronDown, BookOpen } from "lucide-react";

export default function ComplianceRequirements() {
  const [expandedSection, setExpandedSection] = useState<string | null>("Environmental");

  const requirements = [
    {
      category: "Environmental",
      items: [
        { id: "ENV-001", title: "Air Quality Control Plan", status: "Compliant", authority: "EPA", lastChecked: "Oct 12, 2026" },
        { id: "ENV-002", title: "Waste Water Disposal Permit", status: "At Risk", authority: "State Water Board", lastChecked: "Oct 05, 2026" },
        { id: "ENV-003", title: "Noise Pollution Limits (Night)", status: "Compliant", authority: "City Council", lastChecked: "Oct 10, 2026" },
      ]
    },
    {
      category: "Safety & Health",
      items: [
        { id: "SAF-101", title: "OSHA Site Safety Plan", status: "Compliant", authority: "OSHA", lastChecked: "Oct 01, 2026" },
        { id: "SAF-102", title: "Scaffolding Inspection Certs", status: "Non-Compliant", authority: "Dept of Labor", lastChecked: "Sep 28, 2026" },
        { id: "SAF-103", title: "Worker Protective Gear Audit", status: "Compliant", authority: "Internal HSE", lastChecked: "Oct 12, 2026" },
      ]
    },
    {
      category: "Building Codes",
      items: [
        { id: "BLD-201", title: "Structural Steel Load Ratings", status: "Compliant", authority: "Bldg Dept", lastChecked: "Sep 15, 2026" },
        { id: "BLD-202", title: "Fire Safety Systems Design", status: "Compliant", authority: "Fire Marshall", lastChecked: "Sep 10, 2026" },
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Compliant': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'At Risk': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'Non-Compliant': return <XCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Compliant': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'At Risk': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Non-Compliant': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ListTodo className="text-blue-500" />
            Statutory & Regulatory Requirements
          </h1>
          <p className="text-gray-500 mt-1">Track specific clauses and standards required for project compliance.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID, title, or authority..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Compliant (6)
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> At Risk (1)
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Non-Compliant (1)
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {requirements.map((category, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={category.category}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setExpandedSection(expandedSection === category.category ? null : category.category)}
              className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <div className="text-left">
                  <h2 className="font-bold text-gray-900">{category.category} Requirements</h2>
                  <p className="text-xs text-gray-500 font-medium">{category.items.length} Tracking Items</p>
                </div>
              </div>
              <ChevronDown 
                size={20} 
                className={`text-gray-400 transition-transform duration-300 ${expandedSection === category.category ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {expandedSection === category.category && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="border-t border-gray-100">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-white border-b border-gray-100">
                          <th className="py-3 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider w-24">Req ID</th>
                          <th className="py-3 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">Title / Description</th>
                          <th className="py-3 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">Authority</th>
                          <th className="py-3 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">Last Checked</th>
                          <th className="py-3 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {category.items.map(item => (
                          <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="py-3 px-5">
                              <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                {item.id}
                              </span>
                            </td>
                            <td className="py-3 px-5 font-semibold text-sm text-gray-800">{item.title}</td>
                            <td className="py-3 px-5 text-sm text-gray-600">{item.authority}</td>
                            <td className="py-3 px-5 text-sm text-gray-500">{item.lastChecked}</td>
                            <td className="py-3 px-5 text-right">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${getStatusBadge(item.status)}`}>
                                {getStatusIcon(item.status)}
                                {item.status}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
