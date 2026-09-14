'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Sparkles, ShieldCheck, HardHat, Users, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getProjects, Project } from '@/services/projects';
import { getContractors, getProjectTeams, Contractor, ProjectStakeholderTeam } from '@/services/stakeholders';

export default function ExecutionTeamBuilderPage() {
  // Real data only: the client's latest project, the registered contractor
  // directory, and real stakeholder teams. No fabricated experience stats,
  // satisfaction scores, or stock company logos.
  const [project, setProject] = useState<Project | null>(null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [teams, setTeams] = useState<ProjectStakeholderTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [projects, contractorList, teamList] = await Promise.all([
          getProjects().catch(() => [] as Project[]),
          getContractors().catch(() => [] as Contractor[]),
          getProjectTeams().catch(() => [] as ProjectStakeholderTeam[]),
        ]);
        if (cancelled) return;
        const latest = [...projects].sort(
          (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        )[0] ?? null;
        setProject(latest);
        setContractors(contractorList.filter((c) => !c.is_blacklisted));
        setTeams(teamList);
      } catch (err) {
        if (!cancelled) setError('Team builder data could not be loaded.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const locationText = project
    ? project.location || project.site_address || [project.lga, project.state].filter(Boolean).join(', ') || '—'
    : '—';

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
            Execution Team Builder
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-4xl leading-relaxed">
            Build a verified construction team based on your approved project. Nexucon recommends experienced professionals tailored to your project type, scope, and location, helping you transition confidently from design into execution.
          </p>
        </div>
        <Link href="/client/team/execution-builder/ai-assistant" className="w-full md:w-auto shrink-0">
          <Button variant="outline" className="w-full md:w-auto px-8 py-5 cursor-pointer border-[#022C4F] text-[#022C4F] hover:bg-[#022C4F]/5 h-[44px] flex items-center justify-center gap-2">
            <Sparkles size={16} />
            Smart AI Assistant
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-[32px] p-12 text-center text-[12px] font-medium text-gray-500">
          Loading project and team data…
        </div>
      )}

      {!isLoading && error && (
        <div className="w-full bg-rose-50/60 border border-rose-200 rounded-[32px] p-12 text-center">
          <p className="text-[13px] font-bold text-rose-700">{error}</p>
          <p className="text-[11px] text-gray-500 mt-1">Check your connection and reload the page.</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Banner */}
          <div className="w-full bg-[#022C4F] rounded-[32px] p-8 flex items-center justify-between mb-10 shadow-md">
            <h2 className="text-[24px] font-extrabold text-white">{project?.name || 'No project yet'}</h2>
            <button className="w-10 h-10 rounded-full bg-white text-[#022C4F] flex items-center justify-center hover:bg-gray-100 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Project Overview */}
          <div className="mb-12">
            <h3 className="text-[22px] font-extrabold text-[#022C4F] mb-6">Project Overview</h3>
            <p className="text-[13px] font-bold text-[#0F181F] mb-4">Project Information</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">
              <div>
                <span className="text-[12px] font-bold text-[#0F181F]">Project Status:</span>
                <span className="text-[12px] text-gray-600 font-medium ml-2">{project?.status || '—'}</span>
              </div>
              <div>
                <span className="text-[12px] font-bold text-[#0F181F]">Location:</span>
                <span className="text-[12px] text-gray-600 font-medium ml-2">{locationText}</span>
              </div>
              <div>
                <span className="text-[12px] font-bold text-[#0F181F]">Team Size:</span>
                <span className="text-[12px] text-gray-600 font-medium ml-2">
                  {project?.professionals?.length ? `${project.professionals.length} Professionals` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[12px] font-bold text-[#0F181F]">Estimated Value:</span>
                <span className="text-[12px] text-gray-600 font-medium ml-2">{project?.estimated_project_value || '—'}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-4">
              Construction readiness, duration, and recommended team size will appear here once they are recorded for this project.
            </p>
          </div>

          {/* Registered Contractors */}
          <div className="mb-12">
            <div className="mb-6">
              <h3 className="text-[22px] font-extrabold text-[#022C4F] mb-1">Registered Contractors</h3>
              <p className="text-[11px] text-gray-500 font-medium">Contractors registered on the platform with their recorded compliance score, active permits, and license status.</p>
            </div>

            {contractors.length === 0 ? (
              <div className="border border-gray-200 rounded-[24px] p-12 text-center">
                <HardHat size={32} className="mx-auto mb-3 text-[#022C4F]/40" />
                <p className="text-[13px] font-bold text-[#022C4F]">No contractors registered yet.</p>
                <p className="text-[11px] text-gray-500 mt-1">Registered contractors will be listed here once they are onboarded.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {contractors.map((company) => (
                  <div key={company.id} className="bg-white border border-gray-300 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:border-[#022C4F] transition-all flex flex-col">

                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-200 mb-4 overflow-hidden">
                      <div className="text-[20px] font-extrabold text-[#022C4F] tracking-tighter">{company.name.charAt(0)}</div>
                    </div>

                    <h4 className="text-[15px] font-extrabold text-[#022C4F] mb-1">{company.name}</h4>
                    <p className="text-[11px] text-gray-500 font-medium mb-6">{company.contractor_type || 'Contractor'}</p>

                    <div className="flex flex-col gap-2 mb-5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-[#0F181F]">Compliance Score:</span>
                        <span className="text-[#022C4F] font-bold">{company.compliance_score}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-[#0F181F]">Active Permits:</span>
                        <span className="text-gray-600">{company.active_permits}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-[#0F181F]">Contractor ID:</span>
                        <span className="text-gray-600 font-mono">{company.contractor_id}</span>
                      </div>
                    </div>

                    {company.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {company.specialties.map((s) => (
                          <span key={s} className="text-[9px] font-bold bg-blue-50 text-[#0277BD] border border-blue-100 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Compliance & Operations</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${company.license_status === 'Valid' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                          <ShieldCheck size={12} className="shrink-0" />
                          <span className="text-[9px] font-bold">License: {company.license_status || '—'}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${company.status === 'Active' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                          <HardHat size={12} className="shrink-0" />
                          <span className="text-[9px] font-bold line-clamp-1">{company.status || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-auto">
                      <Button variant="primary" className="flex-1 h-[36px] text-[11px]">
                        View Company
                      </Button>
                      <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stakeholder Teams */}
          <div>
            <div className="mb-6">
              <h3 className="text-[22px] font-extrabold text-[#022C4F] mb-1">Project Stakeholder Teams</h3>
              <p className="text-[11px] text-gray-500 font-medium">Teams assembled on the platform, with their recorded members and roles.</p>
            </div>

            {teams.length === 0 ? (
              <div className="border border-gray-200 rounded-[24px] p-12 text-center">
                <Users size={32} className="mx-auto mb-3 text-[#022C4F]/40" />
                <p className="text-[13px] font-bold text-[#022C4F]">No stakeholder teams recorded yet.</p>
                <p className="text-[11px] text-gray-500 mt-1">Teams will appear here once they are assembled for a project.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {teams.map((team) => {
                  const members = Object.values(team.team_data ?? {});
                  return (
                    <div key={team.id} className="bg-white border border-gray-300 rounded-[20px] p-4 shadow-sm hover:shadow-md hover:border-[#022C4F] transition-all flex flex-col">

                      <div className="w-full aspect-video rounded-xl bg-[#022C4F]/5 border border-[#022C4F]/10 flex items-center justify-center mb-3">
                        <Users size={24} className="text-[#022C4F]/50" />
                      </div>

                      <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-0.5 line-clamp-1">{team.project_name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium mb-4 flex items-center gap-1 line-clamp-1">
                        <MapPin size={10} /> {team.location || '—'}
                      </p>

                      <div className="flex flex-col gap-1.5 mb-4">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-[#0F181F]">Team Size:</span>
                          <span className="text-gray-600">{members.length} Members</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-[#0F181F]">Status:</span>
                          <span className="text-gray-600">{team.status || '—'}</span>
                        </div>
                        {members.slice(0, 2).map((m, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-600 line-clamp-1 text-right ml-auto w-full">{m.name} — {m.role}</span>
                          </div>
                        ))}
                        {members.length > 2 && (
                          <div className="text-[10px] text-gray-400">+ {members.length - 2} more members</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-auto">
                        <Button variant="primary" className="flex-1 h-[32px] text-[10px]">
                          View Team
                        </Button>
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
