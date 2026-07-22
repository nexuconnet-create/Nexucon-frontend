"use client";

import React, { useState } from "react";
import { Search, Bell, ArrowUpRight, Filter, Settings, Asterisk } from "lucide-react";
import Image from "next/image";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TopRightControls from "@/components/dashboard/TopRightControls";
import InviteTeamMemberSideDrawer from "@/components/dashboard/InviteTeamMemberSideDrawer";
import InviteTeamSuccessModal from "@/components/dashboard/InviteTeamSuccessModal";
import ManageTeamPermissionsDrawer from "@/components/dashboard/ManageTeamPermissionsDrawer";

// Mock Data
const teamMembers = [
  { id: 1, name: "Olivia Thompson", role: "Lead Architect", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784556246/5_nn193g.png" },
  { id: 2, name: "Michael Adeyemi", role: "Structural Engineer", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784556246/2Mask_group_rrpgdg.png" },
  { id: 3, name: "Daniel Okoro", role: "Mechanical Engineer", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784556246/1Mask_group1_ehvtjh.png" },
  { id: 4, name: "Sarah Williams", role: "Design Coordinator", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784556246/4Mask_group_v4mbix.png" },
];

const activityData = [
  { name: 'Mon', line1: 33, line2: 25 },
  { name: 'Tue', line1: 52, line2: 30 },
  { name: 'Wed', line1: 22, line2: 41 },
  { name: 'Thu', line1: 38, line2: 22 },
  { name: 'Fri', line1: 58, line2: 12 },
  { name: 'Sat', line1: 78, line2: 63 },
  { name: 'Sun', line1: 25, line2: 42 },
];

const recentActivity = [
  "New Structural Engineer joined the project",
  "Lead Architect completed drawing revisions",
  "BIM Coordinator published Model V4.0",
  "Client Representative approved design package",
  "External reviewer submitted technical comments"
];

export default function TeamPage() {
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isManagePermsOpen, setIsManagePermsOpen] = useState(false);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#022C4F]/20 shadow-sm relative flex flex-col justify-between min-h-[140px]">
          <span className="text-[14px] font-extrabold text-[#022C4F]">Total Members</span>
          <span className="text-[32px] font-extrabold text-[#022C4F]">28</span>
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#022C4F]/20 flex items-center justify-center text-[#022C4F]">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#022C4F]/20 shadow-sm relative flex flex-col justify-between min-h-[140px]">
          <span className="text-[14px] font-extrabold text-[#022C4F]">Internal Team</span>
          <span className="text-[32px] font-extrabold text-[#022C4F]">14</span>
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#022C4F]/20 flex items-center justify-center text-[#022C4F]">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#022C4F]/20 shadow-sm relative flex flex-col justify-between min-h-[140px]">
          <span className="text-[14px] font-extrabold text-[#022C4F]">External Consultants</span>
          <span className="text-[32px] font-extrabold text-[#022C4F]">8</span>
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#022C4F]/20 flex items-center justify-center text-[#022C4F]">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#022C4F]/20 shadow-sm relative flex flex-col justify-between min-h-[140px]">
          <span className="text-[14px] font-extrabold text-[#022C4F]">Overdue</span>
          <span className="text-[32px] font-extrabold text-[#022C4F]">5</span>
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#022C4F]/20 flex items-center justify-center text-[#022C4F]">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[18px] font-extrabold text-[#022C4F]">Search Team Members</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full max-w-[600px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by task name, assignee, discipline, milestone, or keyword..."
              className="w-full h-12 rounded-full border border-gray-400 bg-white pl-12 pr-6 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] placeholder:text-gray-500 font-medium"
            />
          </div>
          <button className="h-12 px-6 rounded-full border border-[#022C4F] flex items-center gap-3 text-[#022C4F] font-bold text-[12px] hover:bg-gray-50 transition-colors">
            All Tasks
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
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl border border-[#022C4F]/20 p-8 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col items-center gap-1 mt-2 text-center">
                  <span className="text-[14px] font-extrabold text-[#0F181F]">{member.name}</span>
                  <span className="text-[10px] text-gray-500 font-medium">{member.role}</span>
                </div>
                <button className="w-full mt-4 py-2.5 rounded-lg border border-gray-300 text-[12px] font-bold text-[#0F181F] hover:bg-gray-50 transition-colors">
                  View Profile
                </button>
              </div>
            ))}
          </div>

          {/* Activity Panel */}
          <div className="bg-white rounded-2xl border border-[#022C4F]/20 p-8 flex flex-col gap-10 shadow-sm">

            <div className="flex flex-col gap-6">
              <h3 className="text-[16px] font-extrabold text-[#022C4F]">Project Team Activity</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
                      ticks={[0, 30, 60, 90]}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ fontSize: '10px', color: '#6B7280' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="line1"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="line2"
                      stroke="#FF8A65"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-[16px] font-extrabold text-[#022C4F]">Recent Team Activity</h3>
              <div className="flex flex-col gap-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Asterisk size={12} className="text-[#0F181F] mt-1 shrink-0" strokeWidth={3} />
                    <span className="text-[10px] md:text-[11px] text-[#0F181F] font-medium leading-relaxed">
                      {activity}
                    </span>
                  </div>
                ))}
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
