"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  FileCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Printer,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { getPublicProjectBySlugOrId, PublicProject } from '@/services/publicPortal';
import { ProjectStatusBadge, ComplianceBadge } from '@/components/transparency/ProjectStatusBadge';
import { VerificationBadge } from '@/components/transparency/VerificationBadge';
import { InspectionTimeline } from '@/components/transparency/InspectionTimeline';
import { PublicFindingCard } from '@/components/transparency/PublicFindingCard';
import { PublicDocumentList } from '@/components/transparency/PublicDocumentList';
import { ProjectMapView } from '@/components/transparency/ProjectMapView';
import { usePtpRoute } from '@/components/transparency/PublicHeader';

export default function PublicProjectProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'inspections' | 'compliance' | 'evidence' | 'documents'>('overview');
  const { getRoute } = usePtpRoute();

  useEffect(() => {
    async function loadProject() {
      if (!slug) return;
      try {
        const data = await getPublicProjectBySlugOrId(slug);
        setProject(data);
      } catch (err) {
        // Handled
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <div className="w-10 h-10 border-4 border-[#022C4F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-sm font-semibold text-slate-700">Loading Statutory Project Profile...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#022C4F]">Project Record Not Found</h2>
        <p className="text-sm text-slate-600">
          We could not find an approved public record matching reference "{slug}". It may be pending publication review or undergoing private administrative evaluation.
        </p>
        <Link
          href={getRoute('/transparency/search')}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#022C4F] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Project Registry Search</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link href={getRoute('/transparency')} className="hover:text-blue-700">
          Transparency Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link href={getRoute('/transparency/search')} className="hover:text-blue-700">
          Approved Projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{project.name}</span>
      </nav>

      {/* 2. Header Banner Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {project.public_reference}
              </span>
              <ProjectStatusBadge status={project.status} size="md" />
              <ComplianceBadge state={project.compliance_state} size="md" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#022C4F] leading-tight">
              {project.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                {project.site_address}, {project.lga}, Lagos
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                {project.project_type} &bull; {project.number_of_floors} Floors
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
            <VerificationBadge
              permitNumber={project.permit_number}
              authority={project.issuing_authority}
              variant="full"
            />
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: project.name, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Public verification URL copied to clipboard!');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Project Facts & Overview' },
            { id: 'inspections', label: `Inspection History (${project.inspections.length})` },
            { id: 'compliance', label: `Compliance & Milestones (${project.milestones.length})` },
            { id: 'evidence', label: `Digital Eye NDT Findings (${project.findings.length})` },
            { id: 'documents', label: `Public Documents (${project.documents.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#022C4F] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Project Facts & Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Facts Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Statutory Permit Reference</span>
              <span className="font-mono text-sm font-bold text-emerald-800 block">{project.permit_number}</span>
              <span className="text-[11px] text-slate-500">Issued: {project.permit_issued_date}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Approved Building Use</span>
              <span className="text-sm font-bold text-slate-900 block truncate">{project.approved_use}</span>
              <span className="text-[11px] text-slate-500">{project.project_type}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Approved Height / Floors</span>
              <span className="text-sm font-bold text-slate-900 block">{project.number_of_floors} Floors</span>
              <span className="text-[11px] text-slate-500">Gross Area: {project.gross_floor_area_sqm.toLocaleString()} sqm</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Supervising Consultant</span>
              <span className="text-sm font-bold text-slate-900 block truncate">{project.supervising_consultant}</span>
              <span className="text-[11px] text-emerald-700 font-semibold">✓ Registered Engineering Council</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Developer Organization</span>
              <span className="text-sm font-bold text-slate-900 block truncate">{project.developer_organization}</span>
              <span className="text-[11px] text-slate-500">Licensed Entity</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Issuing Statutory Directorate</span>
              <span className="text-sm font-bold text-slate-900 block truncate">{project.issuing_authority}</span>
              <span className="text-[11px] text-blue-700 font-semibold">Zonal Building Control</span>
            </div>
          </div>

          {/* Location Map Snapshot */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#022C4F]">
                Geospatial Location & Setting Out
              </h3>
              <span className="text-xs text-slate-500">
                Precision Level: <strong className="text-slate-800">{project.location_precision}</strong>
              </span>
            </div>
            <ProjectMapView
              projects={[project]}
              initialSelectedId={project.id}
              heightClassName="h-[380px]"
              showSidebar={false}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Inspection History */}
      {activeTab === 'inspections' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <InspectionTimeline inspections={project.inspections} />
        </div>
      )}

      {/* Tab 3: Compliance & Milestones */}
      {activeTab === 'compliance' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-[#022C4F]">
                Statutory Milestone Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Official regulatory approvals required before proceeding between structural stage gates.
              </p>
            </div>
            <ComplianceBadge state={project.compliance_state} size="md" />
          </div>

          <div className="space-y-3">
            {project.milestones.map((m, idx) => (
              <div
                key={m.id || idx}
                className="flex items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {m.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                  </div>
                  <div>
                    <h5 className={`text-sm font-bold ${m.is_completed ? 'text-slate-900' : 'text-slate-500'}`}>
                      {m.title}
                    </h5>
                    {m.stage_reference && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Gate Ref: {m.stage_reference}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs shrink-0">
                  {m.is_completed ? (
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Approved: {m.completed_date || m.target_date}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">
                      Target: {m.target_date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Digital Eye NDT Findings */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-xs text-blue-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Digital Eye Public Safeguard Policy:</strong> Raw subsurface radar radargrams and gigabytes of ultrasonic waveforms remain classified engineering data. In accordance with Section 10 of the implementation architecture, this public portal exposes only plain-language, certified engineering summaries signed off by accredited COREN engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.findings.map((finding) => (
              <PublicFindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Public Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <PublicDocumentList documents={project.documents} projectName={project.name} />
        </div>
      )}
    </div>
  );
}
