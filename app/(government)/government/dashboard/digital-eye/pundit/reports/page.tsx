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
import { Eye } from "lucide-react";

// Leaflet touches `window` at import time — client-only, same pattern as the
// fleet map on the Digital Eye overview page.
const ReportLocationMap = dynamic(
  () => import("@/components/dashboard/digital-eye/ReportLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500">
        Loading map…
      </div>
    ),
  }
);

export default function PunditReportsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  // Bumped after an archive so the dossier registry remounts and re-lists
  // the real server rows.
  const [registryVersion, setRegistryVersion] = useState(0);
  // Set when the preview's "Edit in CMS" exits preview mode: scroll to the
  // CMS panel once it has actually rendered again.
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
            message:
              "⚠️ Select a project to preview its official NDT report.",
            type: "error",
          },
        })
      );
      return;
    }
    setPreviewOpen(true);
  };

  // Preview-before-generate (REFINED EXECUTIVE SUMMARY §2.1): while open,
  // the page IS the wireframe's REPORT PREVIEW view — Back to Edit returns
  // to the editing stack exactly as it was left (nothing was committed).
  const previewing = previewOpen && !!selectedProjectId;

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: Ultrasonic Pulse Velocity Reports"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
      />

      {/* The Nexucon Link navigation layer (client's "castle-like" structure). */}
      <div className="px-6 mt-6">
        <NexuconLinkNav subtitle="Reports" />
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
        <>
          {/* Preview-before-generate (REFINED EXECUTIVE SUMMARY §2.1): the
              exact certified PDF, rendered without archiving. */}
          <div className="px-6 mt-6">
            <button
              type="button"
              onClick={openPreview}
              className="inline-flex items-center gap-2 rounded-lg border border-[#0A3D2E]/30 bg-[#0A3D2E]/5 px-4 py-2 text-sm font-medium text-[#0A3D2E] hover:bg-[#0A3D2E]/10"
            >
              <Eye className="w-4 h-4" />
              Preview Report
            </button>
          </div>

          <DeviceReportingSection
            key={registryVersion}
            deviceType="pundit"
            projectId={selectedProjectId}
            elementId={selectedElementId}
            title="PUNDIT Ultrasonic UPV Official Deliverables"
            subtitle="Generate BS 1881-203 certified concrete homogeneity certificates, in-situ compressive strength (fcu MPa) curve assessments, and core extraction notices."
            onPreviewNdt={openPreview}
          />

          {/* Interactive test-point location map (§2.4): real recorded GPS
              coordinates, colour-coded by strength band. */}
          <div className="px-6 mt-6">
            <ReportLocationMap projectId={selectedProjectId || undefined} />
          </div>

          {/* Recorded measurements (§A5): the reporting browser — filter the
              real readings, read them point by point, export that exact view.
              Collapsed by default, per the client's "not everything in open
              book" direction. */}
          <div className="px-6 mt-6">
            <MeasurementBrowserSection projectId={selectedProjectId || undefined} />
          </div>

          {/* Report branding (§2.3): per-project logo / watermark on the
              certified dossier. */}
          <div className="px-6 mt-6">
            <ReportBrandingPanel projectId={selectedProjectId || undefined} />
          </div>

          {/* Approving-engineer COREN credentials (C11, 4 Sep): printed as ruled
              credential lines beside the report's signature block. */}
          <div className="px-6 mt-6">
            <ReportSignOffPanel projectId={selectedProjectId || undefined} />
          </div>

          {/* Document Editor (§2.5): the project's report structure — order,
              inclusions, custom sections — plus the password-protected
              wording editors. Anchor for the preview view's "Edit in CMS"
              action. */}
          <div id="report-cms-panel" className="mt-6 scroll-mt-6">
            <ReportCmsPanel
              projectId={selectedProjectId || undefined}
              onPreview={openPreview}
            />
          </div>
        </>
      )}
    </div>
  );
}
