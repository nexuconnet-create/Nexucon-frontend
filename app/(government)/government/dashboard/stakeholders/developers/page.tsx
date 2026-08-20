"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, ShieldCheck, MapPin, Briefcase, Mail, Phone, ExternalLink, Building2, RefreshCw } from "lucide-react";
import { Developer, getDevelopers } from "@/services/stakeholders";

export default function DevelopersDirectory() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
  }, [fetchDevelopers]);

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Building2 className="text-blue-500" />
            Master Developers Directory
          </h1>
          <p className="text-gray-500 mt-1">Registry of verified property developers and parent sponsor organizations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDevelopers}
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
              placeholder="Search developers..." 
              className="pl-9 pr-4 py-2 w-64 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map((dev, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={dev.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
          >
            {/* Header / Logo Area */}
            <div className="h-24 bg-slate-50 relative border-b border-gray-100">
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                  dev.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {dev.status === 'Verified' && <ShieldCheck size={12} />}
                  {dev.status}
                </span>
              </div>
              
              {/* Logo Badge */}
              <div className={`absolute -bottom-6 left-6 w-16 h-16 rounded-2xl text-white font-bold text-xl flex items-center justify-center shadow-md border-4 border-white ${dev.color_theme || 'bg-blue-600'}`}>
                {dev.name.charAt(0)}{dev.name.split(' ')[1]?.charAt(0)}
              </div>
            </div>

            <div className="pt-10 p-6 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{dev.name}</h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6">
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">{dev.developer_id}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {dev.hq_location}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1 flex items-center gap-1"><Briefcase size={10} /> Active Projects</p>
                  <p className="text-lg font-bold text-gray-900">{dev.active_projects_count}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Portfolio Value</p>
                  <p className="text-lg font-bold text-emerald-600">{dev.portfolio_value}</p>
                </div>
              </div>

              <div className="mt-auto space-y-2 border-t border-gray-100 pt-4">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Primary Contact</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {dev.primary_contact_name.charAt(0)}{dev.primary_contact_name.split(' ')[1]?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{dev.primary_contact_name}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                      <a href={`mailto:${dev.primary_contact_email || 'contact@nexucon.dev'}`} className="hover:text-blue-600 transition-colors flex items-center gap-1"><Mail size={10} /> Email</a>
                      <a href={`tel:${dev.primary_contact_phone || '+15550192034'}`} className="hover:text-blue-600 transition-colors flex items-center gap-1"><Phone size={10} /> Call</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: `Opening developer dossier for ${dev.name}...`, type: 'info' } 
                  }));
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                View Full Portfolio <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        ))}

        {developers.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm col-span-3">
            No property developers found.
          </div>
        )}
      </div>
    </div>
  );
}
