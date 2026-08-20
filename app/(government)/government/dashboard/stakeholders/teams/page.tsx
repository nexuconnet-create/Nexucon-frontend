"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Network, Search, Filter, Building2, HardHat, Briefcase, ChevronRight, User, RefreshCw } from "lucide-react";
import { ProjectStakeholderTeam, getProjectTeams } from "@/services/stakeholders";
import Link from "next/link";

export default function ProjectTeamsMatrix() {
  const [teams, setTeams] = useState<ProjectStakeholderTeam[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProjectTeams({ search: search.trim() || undefined });
      setTeams(data);
    } catch (err) {
      console.error("Failed to load project teams", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Network className="text-blue-500" />
            Cross-Functional Project Teams Matrix
          </h1>
          <p className="text-gray-500 mt-1">Unified view of all stakeholders, developers, contractors, and inspectors assigned to building projects.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTeams}
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
              placeholder="Search by project or team..." 
              className="pl-9 pr-4 py-2 w-72 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-6xl">
        {teams.map((proj, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={proj.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Project Header */}
            <div className="bg-slate-50 p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-bold text-gray-900">{proj.project_name}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                    proj.status === 'Active Construction' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-blue-700 bg-blue-50 border-blue-200'
                  }`}>
                    {proj.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{proj.project_reference}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{proj.location}</span>
                </div>
              </div>
              
              <Link 
                href="/government/dashboard/projects/all"
                className="flex items-center justify-center gap-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors text-xs"
              >
                View Project Dashboard <ChevronRight size={14} />
              </Link>
            </div>

            {/* Team Matrix Grid */}
            <div className="p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Assigned Stakeholders</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Developer */}
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    {proj.team_data?.developer?.initials || 'NM'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wider mb-0.5 flex items-center gap-1">
                      <Building2 size={10} /> {proj.team_data?.developer?.role || 'Master Developer'}
                    </p>
                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                      {proj.team_data?.developer?.name || 'Nexucon Master Dev'}
                    </p>
                  </div>
                </div>

                {/* Contractor */}
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    {proj.team_data?.contractor?.initials || 'AC'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-amber-600 tracking-wider mb-0.5 flex items-center gap-1">
                      <HardHat size={10} /> {proj.team_data?.contractor?.role || 'General Contractor'}
                    </p>
                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                      {proj.team_data?.contractor?.name || 'Apex Construction'}
                    </p>
                  </div>
                </div>

                {/* Architect */}
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    {proj.team_data?.architect?.initials || 'SV'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-purple-600 tracking-wider mb-0.5 flex items-center gap-1">
                      <Briefcase size={10} /> {proj.team_data?.architect?.role || 'Lead Architect'}
                    </p>
                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                      {proj.team_data?.architect?.name || 'Studio V Design'}
                    </p>
                  </div>
                </div>

                {/* Inspector */}
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    {proj.team_data?.inspector?.initials || 'MC'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider mb-0.5 flex items-center gap-1">
                      <User size={10} /> {proj.team_data?.inspector?.role || 'Lead Inspector'}
                    </p>
                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                      {proj.team_data?.inspector?.name || 'Marcus Chen'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        ))}

        {teams.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm">
            No project stakeholder teams found.
          </div>
        )}
      </div>
    </div>
  );
}
