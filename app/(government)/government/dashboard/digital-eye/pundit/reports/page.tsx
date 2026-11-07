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
// import MeasurementBrowserSection from "@/components/dashboard/digital-eye/MeasurementBrowserSection";
// import SiteWeatherLogPanel from "@/components/dashboard/digital-eye/SiteWeatherLogPanel";
import { Eye, Building2, Layers, Building, CheckCircle2, ChevronRight } from "lucide-react";
import { getPunditTests, getProjectNdtBuildings, type NdtBuildingSummary } from "@/services/digitalEye";

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
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [operators, setOperators] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [availableBuildings, setAvailableBuildings] = useState<NdtBuildingSummary[]>([]);
  const [totalEstateScans, setTotalEstateScans] = useState<number>(0);
  const [buildingsLoading, setBuildingsLoading] = useState(false);
  // The structural elements the project's recorded tests actually name
  // (e.g. 'S1'). Only these can scope a report: the workspace header's
  // element selector carries IFC model GUIDs, which match no recorded test,
  // and sending one used to quietly strip Section 5.0's summaries and every
  // appendix photograph out of the generated PDF.
  const [recordedElements, setRecordedElements] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  // Bumped after an archive so the dossier registry remounts and re-lists
  // the real server rows.
  const [registryVersion, setRegistryVersion] = useState(0);
  // Set when the preview's "Edit in CMS" exits preview mode: scroll to the
  // CMS panel once it has actually rendered again.
  const [cmsScrollPending, setCmsScrollPending] = useState(false);

  useEffect(() => {
    if (!selectedProjectId) {
      setOperators([]);
      setSelectedOperator("");
      setRecordedElements([]);
      setAvailableBuildings([]);
      setSelectedBuilding("");
      setTotalEstateScans(0);
      return;
    }

    setBuildingsLoading(true);
    getProjectNdtBuildings(selectedProjectId)
      .then((data) => {
        setAvailableBuildings(data.buildings || []);
        setTotalEstateScans(data.total_scans || 0);
      })
      .catch((err) => {
        console.error("Failed to load project buildings", err);
        setAvailableBuildings([]);
        setTotalEstateScans(0);
      })
      .finally(() => {
        setBuildingsLoading(false);
      });

    getPunditTests({ project: selectedProjectId })
      .then((tests) => {
        const set = new Set<string>();
        const elementSet = new Set<string>();
        tests.forEach((t) => {
          const op = (t.operator_name || '').trim();
          if (op) set.add(op);
          const el = (t.structural_element_name || '').trim();
          if (el) elementSet.add(el);
        });
        const ops = Array.from(set).sort();
        setOperators(ops);
        setRecordedElements(Array.from(elementSet).sort());
        if (ops.length > 0 && (!selectedOperator || !ops.includes(selectedOperator))) {
          setSelectedOperator(ops[0]);
        }
      })
      .catch(() => {
        setOperators([]);
        setRecordedElements([]);
      });
  }, [selectedProjectId]);

  // The scope the report endpoints may be given: only an element the
  // project's tests actually recorded. Anything else reports as the whole
  // project rather than silently narrowing the document.
  const reportElementId = recordedElements.includes(selectedElementId)
    ? selectedElementId
    : "";

  useEffect(() => {
    if (!previewOpen && cmsScrollPending) {
      setCmsScrollPending(false);
      document
        .getElementById("report-cms-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [previewOpen, cmsScrollPending]);

  const openPreview = (overrideBuilding?: string) => {
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
    if (overrideBuilding !== undefined) {
      setSelectedBuilding(overrideBuilding);
    }
    setPreviewOpen(true);
  };

  // Preview-before-generate (REFINED EXECUTIVE SUMMARY §2.1): while open,
  // the page IS the wireframe's REPORT PREVIEW view — Back to Edit returns
  // to the editing stack exactly as it was left (nothing was committed).
  const previewing = previewOpen && !!selectedProjectId;

  const handleProjectChange = (id: string) => {
    setSelectedProjectId(id);
    setSelectedElementId("");
    setSelectedOperator("");
    setSelectedBuilding("");
    setPreviewOpen(false);
  };

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: Ultrasonic Pulse Velocity Reports"
        selectedProjectId={selectedProjectId}
        onProjectChange={handleProjectChange}
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
          operator={selectedOperator || undefined}
          elementId={reportElementId || undefined}
          building={selectedBuilding || undefined}
          availableBuildings={availableBuildings}
          onBuildingChange={setSelectedBuilding}
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
          {/* Multi-Building Scope & Preview Toolbar */}
          <div className="px-6 mt-6 space-y-3">
            {/* Estate Buildings Selection Bar (when scan covers multi-building or estate) */}
            {availableBuildings.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#022C4F]" />
                    <span className="text-xs font-bold text-gray-900 tracking-wide uppercase">
                      Estate Building Selection &amp; Scope
                    </span>
                    <span className="text-[11px] font-medium text-gray-500">
                      ({availableBuildings.length} {availableBuildings.length === 1 ? 'building' : 'buildings'} detected in field scans)
                    </span>
                  </div>
                  {selectedBuilding && (
                    <button
                      type="button"
                      onClick={() => setSelectedBuilding("")}
                      className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                    >
                      Reset to Combined Estate Report
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Option: Combined Estate Report */}
                  <button
                    type="button"
                    onClick={() => setSelectedBuilding("")}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      !selectedBuilding
                        ? "bg-[#022C4F] text-white shadow-sm ring-2 ring-[#022C4F]/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Combined Estate Report</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      !selectedBuilding ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
                    }`}>
                      All {totalEstateScans || availableBuildings.reduce((acc, b) => acc + b.scan_count, 0)} Scans
                    </span>
                  </button>

                  {/* Option: Individual Buildings */}
                  {availableBuildings.map((bld) => {
                    const isSelected = selectedBuilding.toLowerCase() === bld.building.toLowerCase();
                    return (
                      <button
                        key={bld.building}
                        type="button"
                        onClick={() => setSelectedBuilding(bld.building)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-700/20"
                            : "bg-white text-gray-800 hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-300"
                        }`}
                      >
                        <Building className="w-3.5 h-3.5 text-current" />
                        <span>{bld.building}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}>
                          {bld.scan_count} tests
                        </span>
                        <span className={`text-[10px] font-bold ${
                          isSelected ? "text-emerald-100" : bld.compliance_rate >= 90 ? "text-emerald-700" : "text-amber-700"
                        }`}>
                          {bld.compliance_rate}% pass
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedBuilding && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium text-slate-700">
                      Scope Active: Generating dedicated statutory PDF report for{" "}
                      <strong className="text-emerald-800 font-bold">{selectedBuilding}</strong> only (with dedicated element tables, graphs, and findings).
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Floors: {availableBuildings.find(b => b.building.toLowerCase() === selectedBuilding.toLowerCase())?.floors.join(", ") || "All Floors"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Preview-before-generate action toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openPreview()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#0A3D2E]/30 bg-[#0A3D2E]/5 px-4 py-2 text-sm font-semibold text-[#0A3D2E] hover:bg-[#0A3D2E]/10 cursor-pointer shadow-2xs"
              >
                <Eye className="w-4 h-4" />
                <span>
                  {selectedBuilding
                    ? `Preview Report (${selectedBuilding})`
                    : availableBuildings.length > 1
                    ? `Preview Combined Estate Report (All ${availableBuildings.length} Buildings)`
                    : reportElementId
                    ? `Preview Report (Element: ${reportElementId.toUpperCase()})`
                    : selectedOperator
                    ? `Preview Report (${selectedOperator})`
                    : "Preview Report"}
                </span>
              </button>
              {operators.length > 0 && (
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  aria-label="Filter report preview by inspector"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm cursor-pointer"
                >
                  <option value="">All Field Inspectors</option>
                  {operators.map((op) => (
                    <option key={op} value={op}>
                      Inspector: {op}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <DeviceReportingSection
            key={`${registryVersion}_${selectedBuilding}`}
            deviceType="pundit"
            projectId={selectedProjectId}
            elementId={selectedElementId}
            selectedBuilding={selectedBuilding}
            availableBuildings={availableBuildings}
            onBuildingChange={setSelectedBuilding}
            title="PUNDIT Ultrasonic UPV Official Deliverables"
            subtitle="Generate BS 1881-203 certified concrete homogeneity certificates, in-situ compressive strength (fcu MPa) curve assessments, and core extraction notices."
            onPreviewNdt={(targetOp, targetBld) => {
              if (targetBld !== undefined) setSelectedBuilding(targetBld);
              if (targetOp) setSelectedOperator(targetOp);
              openPreview(targetBld);
            }}
          />

          {/* Interactive test-point location map (§2.4) */}
          <div className="px-6 mt-6 space-y-6">
            <ReportLocationMap projectId={selectedProjectId || undefined} />
            {/* Site Activities & Weather Telemetry (§3.1) commented out for the meantime (inspector-only telemetry input) */}
            {/* <SiteWeatherLogPanel projectId={selectedProjectId || undefined} /> */}
          </div>

          {/* Recorded measurements (§A5) commented out for the meantime (inspector-only telemetry browser) */}
          {/* <div className="px-6 mt-6">
            <MeasurementBrowserSection projectId={selectedProjectId || undefined} />
          </div> */}

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
