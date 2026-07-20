'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import InviteTeamDrawer from '@/components/dashboard/InviteTeamDrawer';
import InviteTeamSuccessModal from '@/components/dashboard/InviteTeamSuccessModal';
import StartDiscussionDrawer from '@/components/dashboard/StartDiscussionDrawer';

export default function TeamPage() {
  const [isInviteTeamOpen, setIsInviteTeamOpen] = useState(false);
  const [isInviteSuccessOpen, setIsInviteSuccessOpen] = useState(false);
  const [isStartDiscussionOpen, setIsStartDiscussionOpen] = useState(false);

  const teamMembers = [
    { name: 'Olivia Thompson', role: 'Lead Architect', online: true, image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784556246/1Mask_group1_ehvtjh.png', activeProjects: 3 },
    { name: 'Engr. Michael Adeyemi', role: 'Structural Engineer', online: false, image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784556246/2Mask_group_rrpgdg.png', activeProjects: 2 },
    { name: 'James Ibrahim', role: 'Electrical Design Engineer', online: false, image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784556246/3Mask_group_hdcntt.png', activeProjects: 4 },
    { name: 'Samuel Bello', role: 'Quantity Surveyor', online: true, image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784556246/4Mask_group_v4mbix.png', activeProjects: 1 },
    { name: 'Ahmed Musa', role: 'BIM Coordinator', online: true, image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784556246/7_kdpcfe.png', activeProjects: 5 },
    { name: 'David Johnson', role: 'Project Manager', online: false, image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784556246/5_nn193g.png', activeProjects: 3 },
  ];

  const executionTeamRoles = [
    'Project Manager', 'Structural Engineer',
    'Civil Engineer', 'Electrical Engineer',
    'Mechanical Engineer', 'QA/QC Inspector',
    'Quantity Surveyor', 'Safety Officer'
  ];

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
            Team & Collaborations
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-4xl leading-relaxed">
            Manage project participants, collaborate with internal and external teams, invite specialists, and prepare your execution team for a seamless transition from design to construction.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Button
            variant="outline"
            className="flex-1 md:flex-none border-[#022C4F] text-[#022C4F] hover:bg-[#022C4F]/5 h-[44px]"
            onClick={() => setIsStartDiscussionOpen(true)}
          >
            Start Discussion
          </Button>
          <Button variant="primary" onClick={() => setIsInviteTeamOpen(true)}>
            Invite Team Member
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Team Members', value: '18' },
          { label: 'Internal Team', value: '9' },
          { label: 'External Consultants', value: '5' },
          { label: 'Peer Reviewers', value: '4' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-[#022C4F] rounded-[32px] p-6 flex flex-col justify-between min-h-[140px] shadow-sm relative group hover:shadow-md transition-shadow">
            <h4 className="text-[12px] font-bold text-[#022C4F]">{stat.label}</h4>
            <p className="text-[32px] font-extrabold text-[#0F181F] leading-tight mt-4 pr-10">
              {stat.value}
            </p>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] group-hover:bg-[#022C4F] group-hover:text-white transition-colors cursor-pointer">
              <ArrowUpRight size={16} strokeWidth={3} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left Column: Team Grid */}
        <div className="w-full lg:w-[65%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-[24px] p-6 shadow-sm flex flex-col items-center text-center hover:border-[#022C4F] hover:shadow-md transition-all">

              <div className="relative w-24 h-24 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-100 relative">
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>
                <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${member.online ? 'bg-[#8BC34A]' : 'bg-gray-400'}`}></div>
              </div>

              <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-1">{member.name}</h3>
              <p className="text-[11px] text-gray-500 font-medium mb-3">{member.role}</p>
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 mb-6">
                <span className="text-[10px] font-bold text-[#0F181F]">{member.activeProjects} Active Projects</span>
              </div>

              <div className="flex flex-col w-full gap-2 mt-auto">
                <Button variant="outline" className="!w-full h-[36px] text-[11px]">
                  Message
                </Button>
                <Button variant="primary" className="!w-full h-[36px] text-[11px]">
                  View Profile
                </Button>
              </div>

            </div>
          ))}
        </div>

        {/* Right Column: Execution Team Builder */}
        <div className="w-full lg:w-[35%] flex flex-col">
          <div className="bg-white border border-gray-300 rounded-[32px] overflow-hidden shadow-sm flex flex-col h-full hover:border-[#022C4F] transition-colors">

            {/* Dark Section */}
            <div className="bg-[#022C4F] p-8 flex-1">
              <h3 className="text-[22px] font-extrabold text-white mb-4">Execution Team Builder</h3>
              <p className="text-[12px] text-white/80 font-medium leading-relaxed mb-8">
                Based on your approved design package, project complexity, location, and estimated construction value, Nexucon recommends the following execution team to ensure efficient project delivery.
              </p>

              <div className="flex flex-wrap gap-3">
                {executionTeamRoles.map((role, idx) => (
                  <div key={idx} className="bg-[#0F181F]/40 border border-white/10 text-white text-[11px] font-medium px-4 py-2.5 rounded-full backdrop-blur-sm shadow-inner hover:bg-[#0F181F]/60 transition-colors cursor-pointer">
                    {role}
                  </div>
                ))}
              </div>
            </div>

            {/* Light Footer */}
            <Link href="/client/team/execution-builder">
              <div className="p-6 bg-white flex justify-between items-center cursor-pointer group">
                <span className="text-[16px] font-bold text-gray-700 group-hover:text-[#022C4F] transition-colors">Explore Now</span>
                <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 group-hover:border-[#022C4F] group-hover:text-[#022C4F] group-hover:bg-[#022C4F]/5 transition-all">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </Link>

          </div>
        </div>

      </div>

      <InviteTeamDrawer
        isOpen={isInviteTeamOpen}
        onClose={() => setIsInviteTeamOpen(false)}
        onSuccess={() => setIsInviteSuccessOpen(true)}
      />

      <InviteTeamSuccessModal
        isOpen={isInviteSuccessOpen}
        onClose={() => setIsInviteSuccessOpen(false)}
        onInviteAnother={() => setIsInviteTeamOpen(true)}
      />

      <StartDiscussionDrawer
        isOpen={isStartDiscussionOpen}
        onClose={() => setIsStartDiscussionOpen(false)}
      />
    </div>
  );
}
