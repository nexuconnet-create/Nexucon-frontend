'use client';

import React, { use, useState, useEffect } from 'react';
import { Mail, MapPin, Briefcase, ArrowLeft, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProjectTeams, ProjectStakeholderTeam } from '@/services/stakeholders';

export default function TeamMemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [team, setTeam] = useState<ProjectStakeholderTeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProjectTeams()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setTeam(list.find((t) => t.id === resolvedParams.id) || null);
      })
      .catch(() => {
        if (!cancelled) setTeam(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  const members = team
    ? Object.entries(team.team_data || {}).map(([roleKey, member]) => ({
        key: roleKey,
        name: member.name,
        role: member.role || roleKey,
        initials: member.initials,
      }))
    : [];

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#022C4F] font-bold mb-6 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors w-fit"
      >
        <ArrowLeft size={18} />
        Back to Team
      </button>

      {isLoading ? (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm py-24 text-center text-xs font-semibold text-gray-400 animate-pulse">
          Loading team from the server…
        </div>
      ) : !team ? (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm py-24 text-center">
          <p className="text-sm font-bold text-[#0F181F] mb-2">Team not found</p>
          <p className="text-xs text-gray-500 font-medium">This project team does not exist or is no longer available.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col">
          {/* Header Cover */}
          <div className="h-64 bg-[#022C4F] relative shrink-0">
            {/* Abstract architectural pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#022C4F] to-transparent"></div>

            <div className="absolute -bottom-16 left-12 flex items-end gap-8 z-10 w-full pr-16">
              <div className="w-40 h-40 rounded-3xl border-[6px] border-white bg-white shadow-xl shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-2xl bg-[#022C4F]/10 flex items-center justify-center">
                  <span className="text-4xl font-extrabold text-[#022C4F]">
                    {members[0]?.initials || <Users size={40} className="text-[#022C4F]" />}
                  </span>
                </div>
              </div>

              <div className="mb-20 text-white flex-1">
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h2 className="text-[36px] font-extrabold tracking-tight drop-shadow-md">{team.project_name || 'Unnamed Project'}</h2>
                    <p className="text-base font-medium text-blue-200 drop-shadow flex items-center gap-3 mt-1.5">
                      {team.project_reference || 'Reference not recorded'}
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                      <span className="text-white/80">{members.length} member{members.length === 1 ? '' : 's'}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-bold text-white shadow-sm">
                      {team.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-24 px-12 pb-12">
            {/* Action Buttons */}
            <div className="flex gap-4 mb-12 border-b border-gray-100 pb-10">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/client/messages'); }}
                className="py-4 px-8 bg-[#022C4F] text-white rounded-2xl text-[13px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Mail size={18} /> Message Team
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
              <div className="flex flex-col gap-12">
                <div>
                  <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    Project Details
                  </h4>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-4 text-[15px] text-gray-700 font-medium">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <MapPin size={16} className="text-[#022C4F]" />
                      </div>
                      <span>{team.location || 'Location not recorded'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[15px] text-gray-700 font-medium">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Briefcase size={16} className="text-[#022C4F]" />
                      </div>
                      <span>Status: {team.status || 'Not recorded'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-12">
                <div>
                  <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-5">Team Members</h4>
                  {members.length === 0 ? (
                    <p className="text-[14px] text-gray-500 font-medium">No members recorded for this team yet.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {members.map((member) => (
                        <div key={member.key} className="flex items-center gap-4 text-[14px] text-gray-700 font-bold bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                          <div className="w-10 h-10 rounded-full bg-[#022C4F]/10 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-extrabold text-[#022C4F]">{member.initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate">{member.name}</p>
                            <p className="text-[12px] text-gray-500 font-medium">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
