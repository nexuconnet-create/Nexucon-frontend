"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import NexuconLinkNav from "@/components/dashboard/digital-eye/NexuconLinkNav";
import DeviceReportingSection from "@/components/dashboard/digital-eye/DeviceReportingSection";
import ReportCmsPanel from "@/components/dashboard/digital-eye/ReportCmsPanel";
import ReportBrandingPanel from "@/components/dashboard/digital-eye/ReportBrandingPanel";
import ReportSignOffPanel from "@/components/dashboard/digital-eye/ReportSignOffPanel";
import NdtReportPreviewView from "@/components/dashboard/digital-eye/NdtReportPreviewView";
import MeasurementBrowserSection from "@/components/dashboard/digital-eye/MeasurementBrowserSection";
import { FileText, Eye, ShieldCheck, Download, CheckCircle2, AlertTriangle } from "lucide-react";

// Dynamic map import for client-only rendering
const ReportLocationMap = dynamic(
  () => import("@/components/dashboard/digital-eye/ReportLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-semibold">
        Loading GIS station coordinates map…
      </div>
    ),
  }
);

export default function NeuralLinkReportPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [registryVersion, setRegistryVersion] = useState(0);
  const [cmsScrollPending, setCmsScrollPending] = useState(false);

  useEffect(() => {
    if (!previewOpen && cmsScrollPending) {
      setCmsScrollPending(false);
      document
        .getElementById("report-cms-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [previewOpen, cmsScrollPending]);

  const openPreview = () => {
    if (!selectedProjectId) {
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: "⚠️ Select a project to preview its official NDT report.",
            type: "error",
          },
        })
      );
      return;
    }
    setPreviewOpen(true);
  };

  const previewing = previewOpen && !!selectedProjectId;

  return (
    <div className="w-full min-h-screen pb-16 animate-in fade-in duration-300 bg-slate-50/50">
      <DigitalEyeHeader
        activePillar="PUNDIT: Ultrasonic Pulse Velocity Reports"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
      />

      {/* Neural Link Navigation Ribbon */}
      <div className="mb-6">
        <NexuconLinkNav subtitle="Statutory NDT Dossier" />
      </div>

      {previewing ? (
        <NdtReportPreviewView
          projectId={selectedProjectId}
          onBackToEdit={() => setPreviewOpen(false)}
          onGenerated={() => {
            setRegistryVersion((v) => v + 1);
            setPreviewOpen(false);
          }}
          onEditInCms={() => {
            setPreviewOpen(false);
            setCmsScrollPending(true);
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Executive Dossier Banner */}
          <div className="bg-gradient-to-r from-[#022C4F] via-[#0A192F] to-[#0F172A] rounded-2xl p-6 text-white shadow-xl border border-slate-700/60">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 flex items-center gap-1">
                    <FileText size={12} />
                    <span>Statutory Concrete Dossier Engine</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                    BS 1881-203 Compliant
                  </span>
                </div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  Official NDT Dossier & Quality Verification
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generate court-admissible, fully disclosed compressive strength reports incorporating the active
                  calibration curve snapshot, standard error adjustments, and engineer sign-offs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openPreview}
                  disabled={!selectedProjectId}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-950/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Eye size={15} />
                  <span>Preview Official Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Device Reporting Configuration */}
          <DeviceReportingSection
            key={registryVersion}
            deviceType="pundit"
            projectId={selectedProjectId}
            elementId={selectedElementId}
            title="PUNDIT Ultrasonic UPV Official Deliverables"
            subtitle="Generate BS 1881-203 certified concrete homogeneity certificates, in-situ compressive strength (fcu MPa) curve assessments, and core extraction notices."
            onPreviewNdt={openPreview}
          />

          {/* Section 2: CMS Text Sections */}
          <div id="report-cms-panel" className="scroll-mt-6">
            <ReportCmsPanel
              projectId={selectedProjectId || undefined}
              onPreview={openPreview}
            />
          </div>

          {/* Section 3: Branding & Statutory Header */}
          <ReportBrandingPanel projectId={selectedProjectId || undefined} />

          {/* Section 4: Location Map */}
          <ReportLocationMap
            projectId={selectedProjectId || undefined}
          />

          {/* Section 5: Measurement Browser Preview */}
          <MeasurementBrowserSection
            projectId={selectedProjectId || undefined}
          />

          {/* Section 6: Official Sign-off & Stamp */}
          <ReportSignOffPanel
            projectId={selectedProjectId || undefined}
          />
        </div>
      )}
    </div>
  );
}
