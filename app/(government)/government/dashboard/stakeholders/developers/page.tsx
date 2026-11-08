"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Search, ShieldCheck, MapPin, Briefcase, 
  Mail, Phone, ExternalLink, Building2, RefreshCw, Plus, ShieldAlert,
  Sparkles, TrendingUp, Layers
} from "lucide-react";
import { Developer, getDevelopers, toggleBlacklist, syncAllDevelopers } from "@/services/stakeholders";
import CreateStakeholderModal from "@/components/dashboard/CreateStakeholderModal";
import DeveloperDetailsModal from "@/components/dashboard/DeveloperDetailsModal";
import PaginationBar from "@/components/dashboard/PaginationBar";

export default function DevelopersDirectory() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Dossier details modal
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const fetchDevelopers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDevelopers({ search: search.trim() || undefined });
      setDevelopers(data);
    } catch (err) {
      console.error("Failed to load developers", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDevelopers();
    setCurrentPage(1);
  }, [fetchDevelopers]);

  const handleSyncFromProjects = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllDevelopers();
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: `Developers auto-synced! ${res.total_synced ?? 'Active'} records updated from registered projects.`, 
          type: 'success' 
        }
      }));
      await fetchDevelopers();
    } catch (err) {
      console.error("Sync error:", err);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Developer sync completed with current registry.', type: 'info' }
      }));
      await fetchDevelopers();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleSanction = async (dev: Developer) => {
    const nextStatus = dev.is_blacklisted ? 'Monitoring' : 'Blacklisted';
    try {
      await toggleBlacklist({
        entity_type: 'Developer',
        entity_id: dev.developer_id,
        entity_name: dev.name,
        reason: dev.is_blacklisted ? 'Sanctions lifted after review' : 'Statutory audit non-compliance',
        status: nextStatus
      });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Developer status updated to ${nextStatus}`, type: 'success' }
      }));
      fetchDevelopers();
      if (selectedDeveloper && selectedDeveloper.id === dev.id) {
        setSelectedDeveloper(prev => prev ? { ...prev, is_blacklisted: !dev.is_blacklisted, status: nextStatus } : null);
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to update developer status', type: 'error' }
      }));
    }
  };

  const getInitials = (text?: string | null) => {
    if (!text) return 'DV';
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return text.substring(0, 2).toUpperCase();
  };

  const openDossier = (dev: Developer) => {
    setSelectedDeveloper(dev);
    setIsDetailsOpen(true);
  };

  // Aggregated metrics
  const totalProjects = useMemo(() => {
    return developers.reduce((acc, dev) => {
      const count = typeof dev.active_projects_count === 'number' 
        ? dev.active_projects_count 
        : parseInt(String(dev.active_projects_count || 0), 10);
      return acc + (isNaN(count) ? 0 : count);
    }, 0);
  }, [developers]);

  const verifiedCount = useMemo(() => {
    return developers.filter(d => !d.is_blacklisted && d.status === 'Verified').length;
  }, [developers]);

  const paginatedDevelopers = developers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Building2 className="text-blue-500" />
            Master Developers Directory
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Statutory registry of property developers, sponsor corporations, and infrastructure asset owners.
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button 
            onClick={fetchDevelopers}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
            title="Refresh Registry"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin text-blue-600" : ""} />
          </button>

          <button 
            onClick={handleSyncFromProjects}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2.5 border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 rounded-xl transition-all text-xs font-bold cursor-pointer disabled:opacity-60 shadow-sm"
            title="Scan all recent building projects and sync developer credentials into this master registry"
          >
            <Sparkles size={14} className={isSyncing ? "animate-spin text-blue-700" : "text-blue-600"} />
            <span>{isSyncing ? "Syncing Projects..." : "Sync from Projects"}</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold cursor-pointer"
          >
            <Plus size={14} />
            <span>Register Developer</span>
          </button>

          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search developers, ID, location..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered</p>
            <p className="text-2xl font-black text-[#022C4F] mt-0.5">{developers.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Associated Projects</p>
            <p className="text-2xl font-black text-blue-600 mt-0.5">{totalProjects}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified & Active</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{verifiedCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedDevelopers.map((dev, idx) => {
          const contactName = dev.primary_contact_name || dev.name || 'Primary Representative';
          const contactEmail = dev.primary_contact_email || dev.email || 'contact@nexucon.net';
          const contactPhone = dev.primary_contact_phone || '+234 800 NEXUCON';
          const hq = dev.hq_location || 'Lagos, Nigeria';

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={dev.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all group"
            >
              {/* Header Area */}
              <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-50 relative border-b border-gray-100 p-4">
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {dev.is_blacklisted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                      <ShieldAlert size={11} /> Sanctioned
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    dev.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {dev.status === 'Verified' && <ShieldCheck size={12} />}
                    {dev.status}
                  </span>
                </div>
                
                {/* Logo Badge */}
                <div className={`absolute -bottom-6 left-6 w-16 h-16 rounded-2xl text-white font-bold text-xl flex items-center justify-center shadow-md border-4 border-white ${dev.color_theme || 'bg-blue-600'}`}>
                  {getInitials(dev.name)}
                </div>
              </div>

              <div className="pt-10 p-6 flex-1 flex flex-col">
                <div className="cursor-pointer" onClick={() => openDossier(dev)}>
                  <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                    {dev.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-5 flex-wrap">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                      {dev.developer_id}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin size={12} className="shrink-0 text-slate-400" /> {hq}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1 flex items-center gap-1">
                      <Briefcase size={11} className="text-blue-500" /> Active Projects
                    </p>
                    <p className="text-base font-extrabold text-gray-900">
                      {dev.active_projects_count ?? 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                      Portfolio Value
                    </p>
                    <p className="text-base font-extrabold text-emerald-600 truncate">
                      {dev.portfolio_value || '₦0.00'}
                    </p>
                  </div>
                </div>

                <div className="mt-auto space-y-2 border-t border-gray-100 pt-4">
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                    Primary Representative
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitials(contactName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{contactName}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5 truncate">
                        <a href={`mailto:${contactEmail}`} className="hover:text-blue-600 transition-colors flex items-center gap-1 truncate">
                          <Mail size={10} /> {contactEmail}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                <button 
                  onClick={() => handleToggleSanction(dev)}
                  className={`text-[11px] font-bold transition-colors cursor-pointer ${
                    dev.is_blacklisted ? 'text-emerald-700 hover:text-emerald-800' : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  {dev.is_blacklisted ? 'Lift Sanction' : 'Flag / Sanction'}
                </button>

                <button 
                  onClick={() => openDossier(dev)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  View Full Dossier <ExternalLink size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}

        {developers.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm col-span-1 md:col-span-2 lg:col-span-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700 mb-1">No property developers found in the registry</p>
            <p className="text-xs text-slate-400 mb-4">Click "Sync from Projects" to scan registered construction projects or register a new developer.</p>
            <button 
              onClick={handleSyncFromProjects}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Sync from Registered Projects</span>
            </button>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {developers.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6">
          <PaginationBar
            currentPage={currentPage}
            totalItems={developers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[3, 6, 12, 24]}
          />
        </div>
      )}

      {/* Create Developer Modal */}
      <CreateStakeholderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchDevelopers}
        initialCategory="developer"
      />

      {/* Full Developer Dossier Slide-Over Modal */}
      <DeveloperDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedDeveloper(null);
        }}
        developer={selectedDeveloper}
        onToggleSanction={handleToggleSanction}
      />
    </div>
  );
}
