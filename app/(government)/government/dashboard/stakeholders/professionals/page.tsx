"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Briefcase, Search, Filter, Download, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { LicensedProfessional, getLicensedProfessionals } from "@/services/stakeholders";

export default function ProfessionalsRegistry() {
  const [professionals, setProfessionals] = useState<LicensedProfessional[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLicensedProfessionals({ search: search.trim() || undefined });
      setProfessionals(data);
    } catch (err) {
      console.error("Failed to load professionals", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const handleExportCSV = () => {
    if (professionals.length === 0) return;
    const headers = ["License ID", "Name", "Role", "Firm", "Authority", "Status", "Expiry", "Active Projects"];
    const rows = professionals.map(p => [
      p.license_id,
      `"${p.name}"`,
      `"${p.role_title}"`,
      `"${p.firm_name}"`,
      p.license_authority,
      p.license_status,
      `"${p.expiry_date}"`,
      p.active_projects_count
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Licensed_Professionals_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Professionals Roster CSV exported!', type: 'success' } }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Briefcase className="text-purple-500" />
            Licensed Professionals Registry
          </h1>
          <p className="text-gray-500 mt-1">Directory of architects, structural engineers, and certified professionals with active COREN/ARCON licenses.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProfessionals}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, License #, or Firm..." 
              className="pl-9 pr-4 py-2 w-64 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold"
          >
            <Download size={16} />
            Export Roster
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
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
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                        {prof.name.charAt(0)}{prof.name.split(' ')[1]?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">{prof.name}</span>
                        <span className="text-xs text-gray-500 font-semibold">{prof.role_title} • {prof.firm_name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                      {prof.license_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center w-fit gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        prof.license_status === 'Valid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {prof.license_status === 'Valid' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                        {prof.license_status}
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold">Exp: {prof.expiry_date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                      {prof.active_projects_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('show-toast', { 
                          detail: { message: `Opening professional dossier for ${prof.name}...`, type: 'info' } 
                        }));
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm hover:bg-gray-50"
                    >
                      View Dossier <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {professionals.length === 0 && !isLoading && (
          <div className="p-12 text-center text-gray-500 text-sm">
            No registered licensed professionals found.
          </div>
        )}
      </motion.div>
    </div>
  );
}
