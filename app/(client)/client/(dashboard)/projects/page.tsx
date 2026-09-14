"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import ReviewDrawingDrawer from "@/components/dashboard/ReviewDrawingDrawer";
import FinalApprovalDrawer from "@/components/dashboard/FinalApprovalDrawer";
import ApprovalSuccessModal from "@/components/dashboard/ApprovalSuccessModal";
import Button from "@/components/ui/Button"
import ProfilePill from "@/components/ui/ProfilePill";
import { getProjects, Project } from "@/services/projects";
import { getDocuments, getDocumentApprovals } from "@/services/documents";
import { getBIMMilestones, BIMConstructionMilestone } from "@/services/bim";

export default function MyProjectsPage() {
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [isFinalApprovalDrawerOpen, setIsFinalApprovalDrawerOpen] = useState(false);
  const [isApprovalSuccessModalOpen, setIsApprovalSuccessModalOpen] = useState(false);

  // Real data — projects, their documents/approvals and BIM milestones. No
  // fabricated rows: every cell below comes from the backend or renders an
  // honest "—" when the platform has no value for it yet.
  const [projects, setProjects] = useState<Project[]>([]);
  const [docCountByProject, setDocCountByProject] = useState<Record<string, number>>({});
  const [pendingReviewsByProject, setPendingReviewsByProject] = useState<Record<string, number>>({});
  const [nextMilestoneByProject, setNextMilestoneByProject] = useState<Record<string, string>>({});
  const [drawingsUnderReview, setDrawingsUnderReview] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [projectList, documents, approvals, milestones] = await Promise.all([
          getProjects(),
          getDocuments().catch(() => []),
          getDocumentApprovals().catch(() => []),
          getBIMMilestones().catch(() => [] as BIMConstructionMilestone[]),
        ]);
        if (cancelled) return;

        setProjects(projectList);

        // Per-project document counts (all documents) and pending reviews.
        const docCounts: Record<string, number> = {};
        const reviewCounts: Record<string, number> = {};
        let underReview = 0;
        documents.forEach((d) => {
          if (!d.project) return;
          docCounts[d.project] = (docCounts[d.project] ?? 0) + 1;
          if (d.status === 'PENDING_REVIEW' || d.status === 'UNDER_REVIEW') {
            reviewCounts[d.project] = (reviewCounts[d.project] ?? 0) + 1;
            underReview += 1;
          }
        });
        setDocCountByProject(docCounts);
        setPendingReviewsByProject(reviewCounts);
        setDrawingsUnderReview(underReview);
        setPendingApprovals(approvals.filter((a) => a.status === 'PENDING').length);

        // Next milestone per project: the earliest milestone in sequence that
        // has not been verified yet.
        const nextMilestones: Record<string, string> = {};
        const byProject: Record<string, BIMConstructionMilestone[]> = {};
        milestones.forEach((m) => {
          if (!m.project) return;
          (byProject[m.project] ??= []).push(m);
        });
        Object.entries(byProject).forEach(([projectId, ms]) => {
          const next = [...ms]
            .sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0))
            .find((m) => !m.actual_verified_date);
          if (next) nextMilestones[projectId] = next.name;
        });
        setNextMilestoneByProject(nextMilestones);

        setLoadError(null);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load projects.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const readyForExecution = projects.filter(
    (p) => p.status === 'COMPLETED' || (typeof p.progress === 'number' && p.progress >= 100)
  ).length;

  const metrics = [
    { label: "Total Projects", value: String(projects.length) },
    { label: "Drawings Under Review", value: String(drawingsUnderReview) },
    { label: "Pending Approvals", value: String(pendingApprovals) },
    { label: "Ready for Execution", value: String(readyForExecution) }
  ];

  const locationOf = (p: Project): string =>
    p.location || p.site_address || [p.lga, p.state].filter(Boolean).join(', ') || '—';

  return (
    <div className="space-y-10 relative pb-12 w-full animate-in fade-in duration-500">

      {/* Invisible Overlay for click outside */}
      {openDropdown !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#022C4F] mb-3">My Projects</h1>
          <p className="text-[13px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
            Manage all your design, review, and execution-ready projects from one centralized workspace.<br />
            Track progress, monitor reviews, collaborate with professionals, and prepare projects for successful construction delivery.
          </p>
        </div>

        <div className="flex flex-col items-end gap-6 w-full lg:w-auto">
          {/* Top Right Utilities */}
          <div className="hidden lg:flex items-center gap-4">
            <button className="w-11 h-11 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0">
              <Search size={18} />
            </button>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="w-11 h-11 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0 relative"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-[#022C4F] rounded-full"></span>
            </button>

            {/* Profile Pill */}
            <ProfilePill />
          </div>

          <Button
            onClick={() => router.push('/client/design-workspace')}
            variant="primary"
            className="mt-10"
          >
            Go to Design Workspace
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white border border-[#022C4F] rounded-[16px] p-6 flex flex-col justify-between h-[150px] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-[13px] font-bold text-[#022C4F]">{metric.label}</span>
              <div className="w-8 h-8 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] shrink-0">
                <ArrowUpRight size={16} />
              </div>
            </div>
            <span className="text-[40px] font-extrabold text-[#0F181F]">{loading ? '—' : metric.value}</span>
          </div>
        ))}
      </div>

      {/* Active Projects Table Section */}
      <div className="bg-white rounded-[32px] border border-[#022C4F] p-8 mt-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[18px] font-extrabold text-[#022C4F]">
            {loading ? 'Projects' : `My Projects (${projects.length})`}
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[12px] font-medium text-gray-500">
            Loading your projects…
          </div>
        ) : loadError ? (
          <div className="py-16 text-center text-[12px] font-medium text-red-600">
            {loadError}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] font-bold text-[#022C4F] mb-1">No projects yet</p>
            <p className="text-[11px] text-gray-500">
              Projects you create will appear here with their live progress, documents and milestones.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-[#022C4F] text-white">
                  <th className="py-4 px-4 text-left text-[9px] font-bold rounded-l-[16px] capitalize tracking-widest">Name</th>
                  <th className="py-4 px-4 text-left text-[9px] font-bold  capitalize tracking-widest">Location</th>
                  <th className="py-4 px-4 text-left text-[9px] font-bold capitalize tracking-widest">Current Stage</th>
                  <th className="py-4 px-4 text-left text-[9px] font-bold capitalize tracking-widest">Progress</th>
                  <th className="py-4 px-4 text-left text-[9px] font-bold capitalize tracking-widest">Drawings</th>
                  <th className="py-4 px-4 text-center text-[9px] font-bold capitalize tracking-widest">Pending Reviews</th>
                  <th className="py-4 px-4 text-left text-[9px] font-bold capitalize tracking-widest">Next Milestone</th>
                  <th className="py-4 px-4 text-center text-[9px] font-bold rounded-r-[16px] capitalize tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const progress = typeof project.progress === 'number' ? project.progress : null;
                  const docCount = docCountByProject[project.id];
                  const pendingReviews = pendingReviewsByProject[project.id];
                  return (
                    <tr key={project.id} className="border-b border-[#022C4F]/20 hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F] break-words">{project.name}</td>
                      <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F] break-words">{locationOf(project)}</td>
                      <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F] break-words">{project.status || '—'}</td>
                      <td className="py-5 px-4 min-w-[120px] max-w-[140px]">
                        {progress != null ? (
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center text-[8px] font-bold text-[#8FA4B5]">
                              <span>{project.status || 'In Progress'}</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${progress >= 100 ? 'bg-[#7DA627]' : progress < 50 ? 'bg-[#FF3B30]' : 'bg-[#7DA627]'}`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-400">Not assessed</span>
                        )}
                      </td>
                      <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F]">
                        {docCount != null ? `${docCount} Document${docCount === 1 ? '' : 's'}` : '—'}
                      </td>
                      <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F] text-center">
                        {pendingReviews != null ? String(pendingReviews) : '—'}
                      </td>
                      <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F] break-words">
                        {nextMilestoneByProject[project.id] || '—'}
                      </td>
                      <td className="py-5 px-4 text-center relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
                          className="text-[#022C4F] hover:bg-gray-100 rounded transition-colors p-1"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openDropdown === project.id && (
                          <div className="absolute right-6 top-10 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            <button
                              onClick={() => { setOpenDropdown(null); router.push('/client/design-workspace'); }}
                              className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-[#0F181F] hover:bg-gray-50 transition-colors"
                            >
                              Go to Project Workspace
                            </button>
                            <button
                              onClick={() => { setOpenDropdown(null); setIsReviewDrawerOpen(true); }}
                              className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-[#0F181F] hover:bg-gray-50 transition-colors"
                            >
                              Review Drawings
                            </button>
                            <button
                              onClick={() => { setOpenDropdown(null); setIsFinalApprovalDrawerOpen(true); }}
                              className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-[#0F181F] hover:bg-gray-50 transition-colors"
                            >
                              Approve Final Design
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReviewDrawingDrawer
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
      />

      <FinalApprovalDrawer
        isOpen={isFinalApprovalDrawerOpen}
        onClose={() => setIsFinalApprovalDrawerOpen(false)}
        onApprove={() => {
          setIsFinalApprovalDrawerOpen(false);
          setIsApprovalSuccessModalOpen(true);
        }}
      />

      <ApprovalSuccessModal
        isOpen={isApprovalSuccessModalOpen}
        onClose={() => setIsApprovalSuccessModalOpen(false)}
      />

      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
