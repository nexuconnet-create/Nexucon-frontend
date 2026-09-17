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
import { getInspectorProjectById } from "@/services/inspector";

export default function InspectorProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || "";

  const [project, setProject] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "inspections" | "evidence" | "findings" | "digital-eye">("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    getInspectorProjectById(projectId)
      .then((data) => setProject(data))
      .catch((err) => console.error("Failed to load project:", err))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const proj = project || {
    id: projectId,
    name: "Lekki Pearl Residences",
    reference_number: "NXC-GOV-2026-9B41",
    site_address: "Plot 14, Block 3, Admiralty Way, Lekki Phase 1, Lagos",
    status: "ACTIVE",
    project_type: "Residential High-Rise",
    developer_name: "Apex Global Properties Ltd",
    permit_number: "LASBCA/2026/LKK/0491",
    number_of_floors: 8,
    estimated_project_value: "1,450,000,000 NGN",
  };

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
                {proj.reference_number}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {proj.status || "ACTIVE"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">
              {proj.name}
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span>{proj.site_address}</span>
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
                  <span className="text-slate-800 font-bold">{proj.permit_number || "LASBCA/2026/0491"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium uppercase">Structure Type</span>
                  <span className="text-slate-800 font-semibold">{proj.project_type || "Commercial Development"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium uppercase">Authorized Developer</span>
                  <span className="text-slate-800 font-semibold">{proj.developer_name || "Lekki Horizon Consortium"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium uppercase">Height & Floors</span>
                  <span className="text-slate-800 font-semibold">{proj.number_of_floors || 6} Storeys</span>
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
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">Foundation Depth & Pile Verification</div>
                    <div className="text-[11px] text-slate-500">Completed & GPS verified</div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Passed</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">Structural Frame & Slab Rebar Cover</div>
                    <div className="text-[11px] text-slate-500">Scheduled for Today</div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Scheduled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                Digital Eye Quick Telemetry
              </h3>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Trimble Connect BIM:</span>
                  <span className="text-emerald-700 font-bold">Linked v2.1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">GPR Radargrams:</span>
                  <span className="text-slate-800 font-bold">14 Profiles</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">UPV Ultrasonic Points:</span>
                  <span className="text-slate-800 font-bold">32 Measured</span>
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
