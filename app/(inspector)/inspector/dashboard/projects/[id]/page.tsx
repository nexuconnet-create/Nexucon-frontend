"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  ClipboardCheck,
  AlertTriangle,
  FolderOpen,
  ArrowLeft,
  Eye,
  CheckCircle2,
  FileText,
  ShieldAlert,
} from "lucide-react";
import {
  getInspectorProjectById,
  getInspectorInspections,
  getInspectorEvidence,
} from "@/services/inspector";
import { dateOr, orDash } from "@/lib/display";
import { Inspection } from "@/services/inspections";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "text-emerald-700 bg-emerald-50 border-emerald-200",
  IN_PROGRESS: "text-amber-700 bg-amber-50 border-amber-200",
  SCHEDULED: "text-blue-700 bg-blue-50 border-blue-200",
  REQUESTED: "text-slate-700 bg-slate-100 border-slate-200",
  RE_INSPECTION_REQUIRED: "text-amber-700 bg-amber-50 border-amber-200",
  FAILED: "text-rose-700 bg-rose-50 border-rose-200",
  CANCELLED: "text-slate-500 bg-slate-100 border-slate-200",
};

export default function InspectorProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || "";

  const [project, setProject] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "inspections" | "evidence" | "findings" | "digital-eye">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // The site's own inspections and evidence, instead of the invented ones this
  // overview used to print: a "Foundation Depth & Pile Verification — Passed"
  // and a "Structural Frame & Slab Rebar Cover — Scheduled for Today" that
  // existed for no project, plus a telemetry summary reading "Linked v2.1",
  // "14 Profiles", "32 Measured".
  //
  // `null` means "could not be read", which is deliberately distinct from an
  // empty array ("none recorded").
  const [siteInspections, setSiteInspections] = useState<Inspection[] | null>([]);
  const [evidenceCounts, setEvidenceCounts] = useState<{
    gpr: number;
    pundit: number;
    bim: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getInspectorProjectById(projectId)
      .then((data) => {
        if (!cancelled) setProject(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err?.response?.data?.detail ||
              err?.message ||
              "Could not read this project from the server."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    getInspectorInspections({ project: projectId })
      .then((rows) => {
        if (!cancelled) setSiteInspections(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setSiteInspections(null);
      });

    getInspectorEvidence({ project: projectId })
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        setEvidenceCounts({
          gpr: list.filter((r: any) => r.source_type === "gpr").length,
          pundit: list.filter((r: any) => r.source_type === "pundit").length,
          bim: list.filter((r: any) => r.source_type === "bim_element").length,
          total: list.length,
        });
      })
      .catch(() => {
        if (!cancelled) setEvidenceCounts(null);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#022C4F] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </button>
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h2 className="text-sm font-bold text-amber-900 mb-1">
            This project could not be loaded
          </h2>
          <p className="text-xs text-amber-800">
            {loadError || "The server returned no record for this project."}
          </p>
          <p className="text-xs text-amber-700 mt-2">
            Nothing is shown because nothing could be read. This is not a site
            with no details.
          </p>
        </div>
      </div>
    );
  }

  const proj = project;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#022C4F] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/inspector/dashboard/inspections"
            className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm"
          >
            Launch Inspection
          </Link>
        </div>
      </div>

      {/* Project Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {orDash(proj.reference_number, "No reference recorded")}
              </span>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {orDash(proj.status, "Status not recorded")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">
              {orDash(proj.name, "Project name not recorded")}
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span>{orDash(proj.site_address || proj.lga, "Site address not recorded")}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto pb-1">
          {[
            { id: "overview", label: "Overview", icon: Building2 },
            { id: "inspections", label: "Inspections", icon: ClipboardCheck },
            { id: "evidence", label: "Evidence Gallery", icon: Layers },
            { id: "findings", label: "Defects & Findings", icon: AlertTriangle },
            { id: "digital-eye", label: "Digital Eye (BIM / GPR)", icon: Eye },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shrink-0 shadow-sm ${
                activeTab === tab.id
                  ? "bg-[#022C4F] text-white font-bold"
                  : "bg-white text-slate-600 hover:text-[#022C4F] hover:bg-slate-50 border border-slate-200/80 font-medium"
              }`}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                Project Regulatory Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium uppercase">Building Permit #</span>
                  <span className="text-slate-800 font-bold">{orDash(proj.permit_number, "Not recorded")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium uppercase">Structure Type</span>
                  <span className="text-slate-800 font-semibold">{orDash(proj.project_type, "Not recorded")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium uppercase">Authorized Developer</span>
                  <span className="text-slate-800 font-semibold">{orDash(proj.developer_name, "Not recorded")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium uppercase">Height &amp; Floors</span>
                  <span className="text-slate-800 font-semibold">
                    {typeof proj.number_of_floors === "number"
                      ? `${proj.number_of_floors} Storeys`
                      : "Not recorded"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h2 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Field Inspection Schedule
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Statutory inspections mandatory under the Lagos State Urban and Regional Planning and Development Law.
              </p>
              <div className="space-y-2.5">
                {/* The two inspections listed here used to be literals, one
                    already "Passed" and one "Scheduled for Today", on a page
                    reachable from any project in the register. */}
                {siteInspections === null ? (
                  <p className="text-xs text-amber-700">
                    This site&rsquo;s inspections could not be read, so none are
                    listed. This is not an empty schedule.
                  </p>
                ) : siteInspections.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No inspections have been recorded for this site yet.
                  </p>
                ) : (
                  siteInspections.slice(0, 6).map((insp) => (
                    <Link
                      key={insp.id}
                      href={`/inspector/dashboard/inspections/${insp.id}`}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          {orDash(insp.inspection_type, "Inspection type not recorded")}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {insp.scheduled_date
                            ? `Scheduled ${dateOr(insp.scheduled_date)}`
                            : "Not scheduled"}
                          {insp.checkin_time ? ` • Checked in ${dateOr(insp.checkin_time)}` : ""}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                          STATUS_STYLES[insp.status] || "text-slate-600 bg-slate-100 border-slate-200"
                        }`}
                      >
                        {orDash(insp.status, "Unknown")}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                Digital Eye Quick Telemetry
              </h3>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                {/* Real counts, from this project's own evidence records. The
                    card previously reported a BIM link "v2.1", "14 Profiles"
                    and "32 Measured" regardless of what had been captured. */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">BIM element records:</span>
                  <span className="text-slate-800 font-bold">
                    {evidenceCounts === null ? "Not read" : evidenceCounts.bim}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">GPR radargram records:</span>
                  <span className="text-slate-800 font-bold">
                    {evidenceCounts === null ? "Not read" : evidenceCounts.gpr}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">PUNDIT UPV records:</span>
                  <span className="text-slate-800 font-bold">
                    {evidenceCounts === null ? "Not read" : evidenceCounts.pundit}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                  <span className="text-slate-600">All evidence records:</span>
                  <span className="text-slate-800 font-bold">
                    {evidenceCounts === null ? "Not read" : evidenceCounts.total}
                  </span>
                </div>
              </div>

              <Link
                href="/inspector/dashboard/digital-eye/ts-1"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#022C4F] border border-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={14} className="text-emerald-600" />
                <span>Launch Digital Eye Workspace</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "inspections" && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center space-y-4 shadow-sm">
          <ClipboardCheck size={36} className="text-[#022C4F] mx-auto" />
          <h3 className="text-base font-bold text-[#022C4F]">Inspections for this Site</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Review completed inspection reports, sign-off logs, and scheduled field verification tasks.
          </p>
          <Link
            href="/inspector/dashboard/inspections"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold shadow-sm"
          >
            Go to Full Inspection Manager &rarr;
          </Link>
        </div>
      )}

      {activeTab === "evidence" && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center space-y-4 shadow-sm">
          <Layers size={36} className="text-cyan-600 mx-auto" />
          <h3 className="text-base font-bold text-[#022C4F]">Evidence Records</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Review geofenced photos, radargram profiles, UPV waveforms, and SHA-256 tamper-evident hashes.
          </p>
          <Link
            href="/inspector/dashboard/evidence"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold shadow-sm"
          >
            Open Evidence Registry &rarr;
          </Link>
        </div>
      )}

      {activeTab === "findings" && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center space-y-4 shadow-sm">
          <AlertTriangle size={36} className="text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-[#022C4F]">Non-Conformance & Findings</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Track structural deviations, HSE violations, and follow-up remediation deadlines for this project.
          </p>
          <Link
            href="/inspector/dashboard/findings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold shadow-sm"
          >
            Manage Defect Findings &rarr;
          </Link>
        </div>
      )}

      {activeTab === "digital-eye" && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center space-y-4 shadow-sm">
          <Eye size={36} className="text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-[#022C4F]">Digital Eye Workspace</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Interact with 3D Trimble BIM IFC geometry, GPR B-scan radargrams, and PUNDIT UPV measurements.
          </p>
          <Link
            href="/inspector/dashboard/digital-eye/ts-1"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold shadow-sm"
          >
            Launch 3D & NDT Console &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
