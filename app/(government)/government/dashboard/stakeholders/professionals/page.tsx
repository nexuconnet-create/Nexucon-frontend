"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Search, Filter, Download, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

export default function ProfessionalsRegistry() {
  const professionals = [
    {
      id: "LIC-A-8991",
      name: "Maria Gonzalez",
      role: "Lead Architect",
      firm: "Studio V Design",
      licenseStatus: "Valid",
      expiry: "Dec 31, 2027",
      activeProjects: 3
    },
    {
      id: "LIC-E-4421",
      name: "James Thorne",
      role: "Structural Engineer",
      firm: "Thorne & Associates",
      licenseStatus: "Valid",
      expiry: "Nov 15, 2026",
      activeProjects: 5
    },
    {
      id: "LIC-M-1092",
      name: "Robert Chen",
      role: "MEP Engineer",
      firm: "Vertex MEP Solutions",
      licenseStatus: "Expiring Soon",
      expiry: "Oct 30, 2026",
      activeProjects: 2
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Briefcase className="text-purple-500" />
            Licensed Professionals Registry
          </h1>
          <p className="text-gray-500 mt-1">Directory of architects, engineers, and certified professionals with active licenses.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
            <Download size={16} />
            Export Roster
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by Name, License #, or Firm..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Professional</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">License Number</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">License Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Active Projects</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {professionals.map((prof, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                        {prof.name.charAt(0)}{prof.name.split(' ')[1].charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">{prof.name}</span>
                        <span className="text-xs text-gray-500 font-semibold">{prof.role} • {prof.firm}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {prof.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center w-fit gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        prof.licenseStatus === 'Valid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {prof.licenseStatus === 'Valid' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                        {prof.licenseStatus}
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold">Exp: {prof.expiry}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                      {prof.activeProjects}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50">
                      View Dossier <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm">
          <span className="text-gray-500 font-semibold">Showing 1 to 3 of 412 registered professionals</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 bg-white font-semibold shadow-sm disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 bg-white font-semibold shadow-sm">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
