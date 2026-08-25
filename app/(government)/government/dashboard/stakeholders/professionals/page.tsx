"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, Search, Filter, Download, CheckCircle2, 
  AlertTriangle, ExternalLink, RefreshCw, Plus, ShieldCheck 
} from "lucide-react";
import { 
  LicensedProfessional, getLicensedProfessionals, 
  verifyLicensedProfessional 
} from "@/services/stakeholders";
import CreateStakeholderModal from "@/components/dashboard/CreateStakeholderModal";
import PaginationBar from "@/components/dashboard/PaginationBar";

export default function ProfessionalsRegistry() {
  const [professionals, setProfessionals] = useState<LicensedProfessional[]>([]);
  const [activeAuthority, setActiveAuthority] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (activeAuthority !== "ALL") params.authority = activeAuthority;
      if (search.trim()) params.search = search.trim();
      const data = await getLicensedProfessionals(params);
      setProfessionals(data);
    } catch (err) {
      console.error("Failed to load professionals", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeAuthority, search]);

  useEffect(() => {
    fetchProfessionals();
    setCurrentPage(1);
  }, [fetchProfessionals]);

  const handleVerifyCredentials = async (prof: LicensedProfessional) => {
    try {
      await verifyLicensedProfessional(prof.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Credentials for ${prof.name} successfully verified against ${prof.license_authority}!`, type: 'success' } 
      }));
      fetchProfessionals();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Credential verification error', type: 'error' } }));
    }
  };

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

  const authorities = ["ALL", "COREN", "ARCON", "CORBON", "QSRBN", "TOPREC", "SURCON"];
  const paginatedProfessionals = professionals.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Briefcase className="text-purple-500" />
            Licensed Professionals Registry
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Statutory directory of certified architects, structural engineers, and regulated technical professionals.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchProfessionals}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold cursor-pointer"
          >
            <Plus size={14} />
            <span>Register Professional</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-xs font-bold cursor-pointer"
          >
            <Download size={14} />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {authorities.map((auth) => (
              <button
                key={auth}
                onClick={() => {
                  setActiveAuthority(auth);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeAuthority === auth
                    ? 'bg-[#022C4F] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {auth}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Name, License #, or Firm..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Professional</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">License Number</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Authority &amp; Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Active Projects</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedProfessionals.map((prof, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
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
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                          {prof.license_authority}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          prof.is_verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {prof.is_verified ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
                          {prof.is_verified ? 'Verified' : prof.license_status}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">Exp: {prof.expiry_date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-gray-100 font-bold text-gray-800 text-xs">
                      {prof.active_projects_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleVerifyCredentials(prof)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm ${
                        prof.is_verified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-[#022C4F] text-white hover:bg-[#033c6c]'
                      }`}
                    >
                      <ShieldCheck size={12} />
                      <span>{prof.is_verified ? 'Re-Verify' : 'Verify Credentials'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {professionals.length === 0 && !isLoading && (
          <div className="p-12 text-center text-gray-500 text-sm">
            No licensed professionals found.
          </div>
        )}

        {/* Pagination Bar */}
        {professionals.length > 0 && (
          <PaginationBar
            currentPage={currentPage}
            totalItems={professionals.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}
      </motion.div>

      {/* Create Professional Modal */}
      <CreateStakeholderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchProfessionals}
        initialCategory="professional"
      />
    </div>
  );
}
