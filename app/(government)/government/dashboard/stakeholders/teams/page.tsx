"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Network, Search, Filter, Building2, HardHat, 
  Briefcase, ChevronRight, User, RefreshCw, Plus, 
  Trash2, ShieldCheck, UserCheck 
} from "lucide-react";
import { 
  ProjectStakeholderTeam, getProjectTeams, 
  removeTeamMember 
} from "@/services/stakeholders";
import AddTeamMemberModal from "@/components/dashboard/AddTeamMemberModal";
import PaginationBar from "@/components/dashboard/PaginationBar";
import Link from "next/link";

export default function ProjectTeamsMatrix() {
  const [teams, setTeams] = useState<ProjectStakeholderTeam[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<ProjectStakeholderTeam | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

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
    setCurrentPage(1);
  }, [fetchTeams]);

  const handleRemoveMember = async (teamId: string, roleKey: string) => {
    try {
      await removeTeamMember(teamId, roleKey);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Team member position removed successfully', type: 'success' }
      }));
      fetchTeams();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to remove team member', type: 'error' }
      }));
    }
  };

  const paginatedTeams = teams.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Network className="text-blue-500" />
            Cross-Functional Project Teams Matrix
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Unified view of all stakeholders, developers, contractors, and inspectors assigned to building projects.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchTeams}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by project, ref, or location..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* Teams Matrix Stack */}
      <div className="space-y-6 max-w-6xl">
        {paginatedTeams.map((proj, idx) => {
          const teamMembers = Object.entries(proj.team_data || {});

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={proj.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Project Header */}
              <div className="bg-slate-50 p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">{proj.project_name}</h2>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      proj.status === 'Active Construction' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-blue-700 bg-blue-50 border-blue-200'
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-blue-800">{proj.project_reference}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{proj.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTeam(proj);
                      setIsAddMemberOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Assign Stakeholder</span>
                  </button>

                  <Link 
                    href="/government/dashboard/projects/all"
                    className="flex items-center justify-center gap-1 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors text-xs cursor-pointer"
                  >
                    View Project <ChevronRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Team Matrix Grid */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Assigned Project Team Positions ({teamMembers.length})
                  </h3>
                </div>
                
                {teamMembers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No stakeholder positions assigned yet. Click &quot;Assign Stakeholder&quot; above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {teamMembers.map(([roleKey, member]: [string, any]) => (
                      <div 
                        key={roleKey}
                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group relative"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-[#022C4F] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                            {member.initials || 'ST'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase text-blue-700 tracking-wider mb-0.5 truncate">
                              {member.role || roleKey}
                            </p>
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {member.name}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveMember(proj.id, roleKey)}
                          className="p-1.5 text-slate-300 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer ml-2 opacity-0 group-hover:opacity-100"
                          title="Remove from matrix"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {teams.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm">
            No project stakeholder teams found matching search.
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {teams.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6 max-w-6xl">
          <PaginationBar
            currentPage={currentPage}
            totalItems={teams.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[3, 5, 10, 20]}
          />
        </div>
      )}

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={fetchTeams}
        team={selectedTeam}
      />
    </div>
  );
}
