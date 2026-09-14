"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ArrowUpRight, Filter, Users } from "lucide-react";
import TopRightControls from "@/components/dashboard/TopRightControls";
import InviteTeamMemberSideDrawer from "@/components/dashboard/InviteTeamMemberSideDrawer";
import InviteTeamSuccessModal from "@/components/dashboard/InviteTeamSuccessModal";
import ManageTeamPermissionsDrawer from "@/components/dashboard/ManageTeamPermissionsDrawer";
import { ProjectStakeholderTeam, getProjectTeams } from "@/services/stakeholders";

// A real team member flattened from a project team's team_data mapping.
interface TeamMember {
  key: string;
  name: string;
  role: string;
  initials: string;
  projectName: string;
}

// Derive initials from a real member name when the team record has none.
const getInitials = (name: string): string => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function TeamPage() {
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isManagePermsOpen, setIsManagePermsOpen] = useState(false);

  const [teams, setTeams] = useState<ProjectStakeholderTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    getProjectTeams()
      .then((data) => {
        if (cancelled) return;
        setTeams(data);
      })
      .catch((err) => {
        console.error("Failed to load project teams", err);
        if (!cancelled) setLoadError("Team data could not be loaded. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Flatten every project team's real member mapping into the member grid.
  const teamMembers = useMemo<TeamMember[]>(() => {
    const members: TeamMember[] = [];
    for (const team of teams) {
      for (const [roleKey, member] of Object.entries(team.team_data || {})) {
        members.push({
          key: `${team.id}-${roleKey}`,
          name: member.name,
          role: member.role || roleKey,
          initials: member.initials || getInitials(member.name),
          projectName: team.project_name,
        });
      }
    }
    return members;
  }, [teams]);

  const distinctRoles = useMemo(
    () => new Set(teamMembers.map(m => m.role)).size,
    [teamMembers]
  );

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return teamMembers;
    const q = search.trim().toLowerCase();
    return teamMembers.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.projectName.toLowerCase().includes(q)
    );
  }, [teamMembers, search]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-2xl">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#022C4F] leading-tight">
            Team
          </h1>
          <p className="text-[12px] md:text-[14px] text-gray-600 font-medium leading-relaxed">
            Manage everyone involved in the project from a single workspace. View project members, roles, disciplines, permissions, workloads, and collaboration status while coordinating internal teams, external consultants, and client representatives.
          </p>
        </div>

        <TopRightControls />

      </div>

      <div className="flex items-center justify-end gap-4 shrink-0">
        <button
          onClick={() => setIsInviteDrawerOpen(true)}
          className="bg-white text-[#022C4F] border border-[#022C4F] px-6 py-3 rounded-full font-bold text-[13px] hover:bg-gray-50 transition-colors shadow-sm"
        >
          Invite Team Member
        </button>
        <button
          onClick={() => setIsManagePermsOpen(true)}
          className="bg-[#022C4F] text-white px-6 py-3 rounded-full font-bold text-[13px] hover:bg-[#033A6B] transition-colors shadow-sm"
        >
          Manage Team Permissions
        </button>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#022C4F]/20 p-6 text-[12px] text-gray-400 font-medium">
          Loading team summary...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#022C4F]/20 shadow-sm relative flex flex-col justify-between min-h-[140px]">
            <span className="text-[14px] font-extrabold text-[#022C4F]">Total Members</span>
            <span className="text-[32px] font-extrabold text-[#022C4F]">{teamMembers.length}</span>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#022C4F]/20 flex items-center justify-center text-[#022C4F]">
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#022C4F]/20 shadow-sm relative flex flex-col justify-between min-h-[140px]">
            <span className="text-[14px] font-extrabold text-[#022C4F]">Project Teams</span>
            <span className="text-[32px] font-extrabold text-[#022C4F]">{teams.length}</span>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#022C4F]/20 flex items-center justify-center text-[#022C4F]">
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#022C4F]/20 shadow-sm relative flex flex-col justify-between min-h-[140px]">
            <span className="text-[14px] font-extrabold text-[#022C4F]">Distinct Roles</span>
            <span className="text-[32px] font-extrabold text-[#022C4F]">{distinctRoles}</span>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#022C4F]/20 flex items-center justify-center text-[#022C4F]">
              <ArrowUpRight size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[18px] font-extrabold text-[#022C4F]">Search Team Members</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full max-w-[600px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by member name, role, or project..."
              className="w-full h-12 rounded-full border border-gray-400 bg-white pl-12 pr-6 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] placeholder:text-gray-500 font-medium"
            />
          </div>
          <button className="h-12 px-6 rounded-full border border-[#022C4F] flex items-center gap-3 text-[#022C4F] font-bold text-[12px] hover:bg-gray-50 transition-colors">
            All Members
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col gap-6 mt-4">
        <h2 className="text-[18px] font-extrabold text-[#022C4F]">Project Team</h2>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">

          {/* Member Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
            {isLoading ? (
              <div className="col-span-full bg-white rounded-2xl border border-[#022C4F]/20 p-12 text-center text-[13px] text-gray-400 font-medium">
                Loading team members...
              </div>
            ) : loadError ? (
              <div className="col-span-full bg-white rounded-2xl border border-[#022C4F]/20 p-12 text-center text-[13px] text-red-500 font-medium">
                {loadError}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <Users size={22} />
                </div>
                <p className="text-[13px] font-bold text-gray-600">
                  {teamMembers.length === 0 ? "No team members recorded yet" : "No members match your search"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {teamMembers.length === 0
                    ? "Members assigned to project stakeholder teams will appear here."
                    : "Try a different name, role, or project."}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.key} className="bg-white rounded-2xl border border-[#022C4F]/20 p-8 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#022C4F] text-white flex items-center justify-center text-[28px] font-extrabold">
                    {member.initials}
                  </div>
                  <div className="flex flex-col items-center gap-1 mt-2 text-center">
                    <span className="text-[14px] font-extrabold text-[#0F181F]">{member.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{member.role}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{member.projectName}</span>
                  </div>
                  <button className="w-full mt-4 py-2.5 rounded-lg border border-gray-300 text-[12px] font-bold text-[#0F181F] hover:bg-gray-50 transition-colors">
                    View Profile
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Activity Panel */}
          <div className="bg-white rounded-2xl border border-[#022C4F]/20 p-8 flex flex-col gap-10 shadow-sm">

            <div className="flex flex-col gap-6">
              <h3 className="text-[16px] font-extrabold text-[#022C4F]">Project Team Activity</h3>
              <div className="h-[200px] w-full rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center gap-2 px-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <Users size={18} />
                </div>
                <p className="text-[12px] font-bold text-gray-500">No activity data recorded yet</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Team activity trends will appear here once activity records exist for your projects.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-[16px] font-extrabold text-[#022C4F]">Recent Team Activity</h3>
              <div className="flex flex-col items-center justify-center text-center gap-2 py-6">
                <p className="text-[12px] font-bold text-gray-500">No recent team activity recorded</p>
                <p className="text-[10px] text-gray-400 leading-relaxed max-w-[260px]">
                  Recent actions by team members will be listed here as they are recorded on the platform.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      <InviteTeamMemberSideDrawer
        isOpen={isInviteDrawerOpen}
        onClose={() => setIsInviteDrawerOpen(false)}
        onSuccess={() => setIsSuccessModalOpen(true)}
      />

      <InviteTeamSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onInviteAnother={() => {
          setIsSuccessModalOpen(false);
          setIsInviteDrawerOpen(true);
        }}
      />

      <ManageTeamPermissionsDrawer
        isOpen={isManagePermsOpen}
        onClose={() => setIsManagePermsOpen(false)}
      />

    </div>
  );
}
