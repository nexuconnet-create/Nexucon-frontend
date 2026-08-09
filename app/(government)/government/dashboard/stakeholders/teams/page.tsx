"use client";

import React from "react";
import { motion } from "framer-motion";
import { Network, Search, Filter, Building2, HardHat, Briefcase, ChevronRight, User } from "lucide-react";

export default function ProjectTeamsMatrix() {
  const projects = [
    {
      id: "PRJ-992",
      name: "Nexus Tower (Phase 1)",
      location: "Downtown Core",
      status: "Active Construction",
      team: {
        developer: { name: "Nexucon Master Dev", role: "Master Developer", initials: "NM" },
        contractor: { name: "Apex Construction", role: "General Contractor", initials: "AC" },
        architect: { name: "Studio V Design", role: "Lead Architect", initials: "SV" },
        inspector: { name: "Marcus Chen", role: "City Lead Inspector", initials: "MC" }
      }
    },
    {
      id: "PRJ-881",
      name: "Westside Transit Hub",
      location: "Zone B (Westside)",
      status: "Permitting",
      team: {
        developer: { name: "Civic Transit Auth", role: "Gov Developer", initials: "CT" },
        contractor: { name: "Bidding Phase", role: "General Contractor", initials: "BP" },
        architect: { name: "Thorne & Associates", role: "Lead Engineering", initials: "TA" },
        inspector: { name: "Sarah Jenkins", role: "Oversight", initials: "SJ" }
      }
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Network className="text-blue-500" />
            Project Teams Matrix
          </h1>
          <p className="text-gray-500 mt-1">Cross-functional view of all stakeholders assigned to specific building projects.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative hidden md:block">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input 
               type="text" 
               placeholder="Search by project or team member..." 
               className="pl-9 pr-4 py-2 w-72 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
             />
           </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter Status
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {projects.map((proj, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={proj.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Project Header */}
            <div className="bg-slate-50 p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{proj.name}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
                    proj.status === 'Active Construction' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-blue-700 bg-blue-50 border-blue-200'
                  }`}>
                    {proj.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{proj.id}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{proj.location}</span>
                </div>
              </div>
              
              <button className="flex items-center justify-center gap-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm">
                View Project Dashboard <ChevronRight size={14} />
              </button>
            </div>

            {/* Team Matrix Grid */}
            <div className="p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Assigned Stakeholders</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Developer Node */}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    {proj.team.developer.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wider mb-0.5 flex items-center gap-1">
                      <Building2 size={10} /> {proj.team.developer.role}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{proj.team.developer.name}</p>
                  </div>
                </div>

                {/* Contractor Node */}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    {proj.team.contractor.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-amber-600 tracking-wider mb-0.5 flex items-center gap-1">
                      <HardHat size={10} /> {proj.team.contractor.role}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-amber-700 transition-colors">{proj.team.contractor.name}</p>
                  </div>
                </div>

                {/* Architect Node */}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    {proj.team.architect.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-purple-600 tracking-wider mb-0.5 flex items-center gap-1">
                      <Briefcase size={10} /> {proj.team.architect.role}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">{proj.team.architect.name}</p>
                  </div>
                </div>

                {/* Inspector Node */}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    {proj.team.inspector.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider mb-0.5 flex items-center gap-1">
                      <User size={10} /> {proj.team.inspector.role}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{proj.team.inspector.name}</p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
