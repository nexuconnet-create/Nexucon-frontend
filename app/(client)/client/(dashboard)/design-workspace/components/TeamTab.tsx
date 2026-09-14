import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import DeliverablesDrawer from "@/components/dashboard/DeliverablesDrawer";
import AssignTaskDrawer from "@/components/dashboard/AssignTaskDrawer";
import { getDocuments, Document } from "@/services/documents";
import { getProjectTeams, ProjectStakeholderTeam } from "@/services/stakeholders";
import { getProjects, Project, ProjectProfessional } from "@/services/projects";

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  teamId?: string;
  organization?: string;
  email?: string;
  phone?: string;
}

const initialsFromName = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const withProfessionalDetails = (
  member: TeamMember,
  professional: ProjectProfessional
): TeamMember => ({
  ...member,
  role: member.role || professional.role,
  organization: member.organization || professional.organization,
  email: member.email || professional.email,
  phone: member.phone || professional.phone,
});

export default function TeamTab() {
  const router = useRouter();
  const [activeDrawer, setActiveDrawer] = useState<any>(null);

  const [activeTaskAssign, setActiveTaskAssign] = useState<any>(null);

  // Real records only — documents (per-member deliverables come from the
  // uploader recorded on each document), project teams and the latest
  // project's professionals. Nothing here is fabricated.
  const [documents, setDocuments] = useState<Document[]>([]);
  const [teams, setTeams] = useState<ProjectStakeholderTeam[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getDocuments().catch(() => [] as Document[]),
      getProjectTeams().catch(() => [] as ProjectStakeholderTeam[]),
      getProjects().catch(() => [] as Project[]),
    ]).then(([docs, teamList, projects]) => {
      if (cancelled) return;
      setDocuments(Array.isArray(docs) ? docs : []);
      setTeams(Array.isArray(teamList) ? teamList : []);
      const latest = [...(projects || [])].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      )[0] ?? null;
      setProject(latest);
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Real project team members (from team records) merged with the latest
  // project's recorded professionals — deduplicated by name.
  const members: TeamMember[] = useMemo(() => {
    const byName = new Map<string, TeamMember>();
    teams.forEach((team) => {
      Object.entries(team.team_data || {}).forEach(([roleKey, member]) => {
        if (!member?.name) return;
        const key = member.name.toLowerCase();
        if (!byName.has(key)) {
          byName.set(key, {
            name: member.name,
            role: member.role || roleKey,
            initials: member.initials || initialsFromName(member.name),
            teamId: team.id,
          });
        }
      });
    });
    (project?.professionals || []).forEach((professional) => {
      if (!professional?.name) return;
      const key = professional.name.toLowerCase();
      const existing = byName.get(key);
      if (existing) {
        byName.set(key, withProfessionalDetails(existing, professional));
      } else {
        byName.set(key, {
          name: professional.name,
          role: professional.role,
          initials: initialsFromName(professional.name),
          organization: professional.organization,
          email: professional.email,
          phone: professional.phone,
        });
      }
    });
    return Array.from(byName.values());
  }, [teams, project]);

  // Real deliverables recorded against each member's uploader name.
  const docsForMember = (name: string): Document[] =>
    documents
      .filter((doc) => doc.uploader_name === name)
      .sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      );

  const handleOpenProfile = (e: React.MouseEvent, member: TeamMember) => {
    e.preventDefault(); e.stopPropagation();
    router.push(member.teamId ? `/client/team/${member.teamId}` : '/client/team');
  };

  const handleOpenAssignTask = (e: React.MouseEvent, name: string, role: string) => {
    e.preventDefault(); e.stopPropagation();
    setActiveTaskAssign({ memberName: name, role: role });
  };

  const handleOpenDeliverables = (e: React.MouseEvent, name: string, role: string) => {
    e.preventDefault(); e.stopPropagation();
    const memberDocs = documents.filter(doc => doc.uploader_name === name);
    setActiveDrawer({
      memberName: name,
      role: role,
      deliverables: memberDocs.map(doc => ({
        id: doc.id,
        name: doc.title,
        status: doc.status === 'APPROVED'
          ? 'Approved' as const
          : (doc.status === 'DRAFT' ? 'In Progress' as const : 'Under Review' as const),
        date: doc.created_at
          ? new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—',
        size: doc.file_size || '—',
      })),
    });
  };

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
      <div className="mb-10">
        <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-3">Project Team & Collaborators</h3>
        <p className="text-[11px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
          Manage architects, engineers, consultants, reviewers, client representatives, and project stakeholders collaborating on the design and pre-construction phase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full border border-gray-200 rounded-[32px] py-16 text-center text-xs font-semibold text-gray-400 animate-pulse">
            Loading project team…
          </div>
        ) : members.length === 0 ? (
          <div className="col-span-full border border-gray-200 rounded-[32px] py-16 text-center text-xs font-medium text-gray-500">
            No team members recorded yet. Members assigned to your project team will appear here.
          </div>
        ) : (
          members.map((member, index) => {
            const memberDocs = docsForMember(member.name);
            const latestDoc = memberDocs[0];
            return (
              <div key={`${member.name}-${index}`} className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm min-h-[280px]">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[16px] font-bold text-[#022C4F] mb-2">{member.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#0F181F]">Role:</span>
                      <span className="text-[11px] font-medium text-gray-600">{member.role || '—'}</span>
                    </div>
                    {member.organization ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#0F181F]">Organization:</span>
                        <span className="text-[11px] font-medium text-gray-600">{member.organization}</span>
                      </div>
                    ) : null}
                    {member.email ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#0F181F]">Email:</span>
                        <span className="text-[11px] font-medium text-gray-600">{member.email}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[11px] font-bold text-[#0F181F]">Current Deliverable:</span>
                      <span className="text-[11px] font-medium text-gray-600">{latestDoc ? latestDoc.title : 'No deliverables yet'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-bold text-[#0F181F]">Deliverables:</span>
                      <span className="text-[11px] font-medium text-gray-600">{memberDocs.length > 0 ? `${memberDocs.length} uploaded` : 'None yet'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    {/* Initials avatar — no stock photos */}
                    <div className="w-14 h-14 rounded-full bg-[#022C4F]/10 flex items-center justify-center shadow-sm">
                      <span className="text-[15px] font-extrabold text-[#022C4F]">{member.initials || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button onClick={(e) => handleOpenProfile(e, member)} className="py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">View Profile</button>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/client/messages'); }} className="py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">Message</button>
                  <button onClick={(e) => handleOpenAssignTask(e, member.name, member.role)} className="py-3 border border-[#0F181F] rounded-xl text-[11px] font-bold text-[#0F181F] hover:bg-gray-50 transition-colors shadow-sm">Assign Task</button>
                  <button onClick={(e) => handleOpenDeliverables(e, member.name, member.role)} className="py-3 bg-[#0F181F] text-white rounded-xl text-[11px] font-bold hover:bg-black transition-colors shadow-sm">View Deliverables</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Team Availability */}
      <div className="mt-12">
        <h4 className="text-[18px] font-bold text-[#022C4F] mb-6">Team Availability Overview</h4>
        <div className="border border-gray-100 bg-white rounded-[32px] p-8 shadow-sm">
          <p className="text-center text-xs font-medium text-gray-500 py-8">
            No team availability data recorded yet.
          </p>
        </div>
      </div>

      <DeliverablesDrawer
        isOpen={!!activeDrawer}
        onClose={() => setActiveDrawer(null)}
        memberName={activeDrawer?.memberName || ""}
        role={activeDrawer?.role || ""}
        deliverables={activeDrawer?.deliverables || []}
      />

      <AssignTaskDrawer
        isOpen={!!activeTaskAssign}
        onClose={() => setActiveTaskAssign(null)}
        {...activeTaskAssign}
      />
    </div>
  );
}
