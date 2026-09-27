"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Building2,
  MapPin,
  FileCheck2,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import {
  getPublicProjects,
  PublicProject
} from "@/services/publicPortal";
import { ProjectCard } from "@/components/transparency/ProjectCard";
import { ProjectFilterBar } from "@/components/transparency/ProjectFilterBar";
import { ProjectStatusBadge, ComplianceBadge } from "@/components/transparency/ProjectStatusBadge";
import { VerificationBadge } from "@/components/transparency/VerificationBadge";
import { InspectionTimeline } from "@/components/transparency/InspectionTimeline";
import { PublicDocumentList } from "@/components/transparency/PublicDocumentList";
import { PublicFindingCard } from "@/components/transparency/PublicFindingCard";

function SearchRegistryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  const initialProjectId = searchParams?.get("project") || "";

  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PublicProject | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedLga, setSelectedLga] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("NAME_ASC");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const data = await getPublicProjects({
          query: searchQuery,
          lga: selectedLga,
          status: selectedStatus,
          category: selectedCategory,
        });
        setProjects(data);

        if (initialProjectId && !selectedProject) {
          const match = data.find((p) => p.id === initialProjectId);
          if (match) setSelectedProject(match);
        }
      } catch (err) {
        // Handled by service fallbacks
      } finally {
        setLoading(false);
      }
    }
    fetchFiltered();
  }, [searchQuery, selectedLga, selectedStatus, selectedCategory, initialProjectId]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedLga("ALL");
    setSelectedStatus("ALL");
    setSelectedCategory("ALL");
    setSortBy("NAME_ASC");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Search size={14} className="text-blue-700" />
            <span>Statutory Project Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
            Lagos State Construction Project Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Search, filter, and inspect verified planning approvals and stage audit records across 20 LGAs.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            Showing <strong className="text-slate-900">{projects.length}</strong> Verified Records
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <ProjectFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLga={selectedLga}
        onLgaChange={setSelectedLga}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleReset}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={projects.length}
      />

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 bg-white rounded-3xl border border-slate-200 animate-pulse p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Building2 size={48} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing LGA filters to find matching developments.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-[#022C4F] text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      )}

      {/* PROJECT DOSSIER MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#0F181F]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#022C4F] text-white flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <ProjectStatusBadge status={selectedProject.status} />
                  <ComplianceBadge state={selectedProject.compliance_state} />
                  <span className="text-xs font-mono bg-white/10 text-cyan-200 px-2 py-0.5 rounded">
                    {selectedProject.permit_number}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {selectedProject.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-cyan-200/90 mt-1">
                  <MapPin size={14} className="text-cyan-400" />
                  <span>{selectedProject.site_address}, {selectedProject.lga}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-8 divide-y divide-slate-100">
              {/* Overview Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Developer</span>
                  <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                    {selectedProject.developer_organization}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Supervising Firm</span>
                  <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                    {selectedProject.supervising_consultant}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Approved Storeys</span>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {selectedProject.number_of_floors} Floors
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Approved Use</span>
                  <div className="text-xs font-bold text-emerald-600 mt-1">
                    {selectedProject.approved_use}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Project Details
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Permit Reference: <strong className="font-mono text-slate-900">{selectedProject.permit_number}</strong> issued by {selectedProject.issuing_authority}.
                  Estimated completion: {selectedProject.estimated_completion}. Gross floor area: {selectedProject.gross_floor_area_sqm.toLocaleString()} sqm.
                </p>
              </div>

              {/* Stage Inspections Timeline */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#022C4F]">
                    Stage Inspection Audit Trail
                  </h3>
                  <span className="text-xs text-slate-500">
                    {selectedProject.inspections.filter(i => i.outcome === 'PASS').length} of {selectedProject.inspections.length} Stages Passed
                  </span>
                </div>
                <InspectionTimeline
                  inspections={selectedProject.inspections || []}
                />
              </div>

              {/* Public Documents */}
              {selectedProject.documents && selectedProject.documents.length > 0 && (
                <div className="pt-6">
                  <h3 className="text-sm font-bold text-[#022C4F] mb-3">
                    Statutory Documents &amp; Certificates
                  </h3>
                  <PublicDocumentList documents={selectedProject.documents} />
                </div>
              )}

              {/* Public Findings */}
              {selectedProject.findings && selectedProject.findings.length > 0 && (
                <div className="pt-6">
                  <h3 className="text-sm font-bold text-[#022C4F] mb-3">
                    Public Safety Observations &amp; Rectification Proof
                  </h3>
                  <div className="space-y-3">
                    {selectedProject.findings.map((finding) => (
                      <PublicFindingCard key={finding.id} finding={finding} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Official LASBCA/LASPPPA statutory data record
              </span>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2.5 rounded-xl bg-[#022C4F] text-white font-bold text-xs hover:bg-[#033E6E] cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PtpSearchRegistryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 font-semibold">
          Loading Statutory Project Registry...
        </div>
      }
    >
      <SearchRegistryContent />
    </Suspense>
  );
}

