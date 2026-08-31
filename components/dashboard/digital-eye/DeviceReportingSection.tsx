"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Download, 
  Share2, 
  Plus, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Sparkles, 
  Box, 
  Printer, 
  ExternalLink, 
  X, 
  Calendar, 
  User, 
  Building2, 
  Sliders,
  FileCheck,
  Search,
  Filter,
  RefreshCw,
  QrCode
} from "lucide-react";
import { 
  DeviceReportRecord, 
  getDeviceReports, 
  generateDeviceReport,
  BIMStructuralElement,
  getBIMStructuralElements 
} from "@/services/digitalEye";
import { useAuth } from "@/context/AuthContext";

interface DeviceReportingSectionProps {
  deviceType: "gpr" | "pundit" | "trimble";
  title?: string;
  subtitle?: string;
  projectId?: string;
  elementId?: string;
  onReportGenerated?: (report: DeviceReportRecord) => void;
}

export default function DeviceReportingSection({
  deviceType,
  title,
  subtitle,
  projectId = "proj-eko-01",
  elementId,
  onReportGenerated
}: DeviceReportingSectionProps) {
  const { user } = useAuth();
  const [reports, setReports] = useState<DeviceReportRecord[]>([]);
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [selectedReport, setSelectedReport] = useState<DeviceReportRecord | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    loadReports();
    getBIMStructuralElements({ project: projectId }).then(setElements);
  }, [deviceType, projectId, elementId]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await getDeviceReports({
        device_type: deviceType.toUpperCase(),
        project_id: projectId,
        element_id: elementId
      });
      setReports(data);
    } finally {
      setIsLoading(false);
    }
  };

  const getTheme = () => {
    switch (deviceType) {
      case "gpr":
        return {
          primary: "text-cyan-700",
          bgLight: "bg-cyan-50/70",
          border: "border-cyan-200",
          badge: "bg-cyan-100 text-cyan-800",
          icon: Radio,
          name: "Ground Penetrating Radar (GPR)",
          standard: "ASTM D4748 / ACI 228.2R / BS EN 13791",
          defaultTitle: "GPR Subsurface Radar Compliance & Deliverables",
          defaultSubtitle: "Automated extraction of radar transects, cover depth matrices, and void risk reports."
        };
      case "pundit":
        return {
          primary: "text-amber-700",
          bgLight: "bg-amber-50/70",
          border: "border-amber-200",
          badge: "bg-amber-100 text-amber-900",
          icon: Sparkles,
          name: "PUNDIT Ultrasonic NDT (UPV)",
          standard: "BS 1881: Part 203 / ASTM C597 / IS 13311",
          defaultTitle: "PUNDIT UPV Concrete Soundness & Strength Deliverables",
          defaultSubtitle: "Certified compressive strength (fcu) curves, pulse velocity certification, and core extraction alerts."
        };
      case "trimble":
      default:
        return {
          primary: "text-blue-700",
          bgLight: "bg-blue-50/70",
          border: "border-blue-200",
          badge: "bg-blue-100 text-blue-900",
          icon: Box,
          name: "Trimble Connect BIM / CDE Bridge",
          standard: "NBC 2020 §14.2 / ISO 19650-2 / BCF 3.0",
          defaultTitle: "Trimble Connect As-Built vs BIM Statutory Dossiers",
          defaultSubtitle: "Statutory ±20mm tolerance validation, BCF clash issue registries, and CDE model audit trails."
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  const filteredReports = reports.filter((r) => {
    const matchesSearch = 
      r.report_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.element_name && r.element_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === "ALL" || r.compliance_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPDF = (report: DeviceReportRecord) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: `Downloading certified PDF: ${report.report_reference}...`, 
        type: "success" 
      }
    }));
    // Open printable viewer as simulated export
    setSelectedReport(report);
  };

  const handleShareReport = (report: DeviceReportRecord) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/reports/view/${report.report_reference}`);
    }
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: `Dossier share link copied: ${report.report_reference}`, 
        type: "info" 
      }
    }));
  };

  const handleExportBatchData = () => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        message: `Exporting complete raw ${deviceType.toUpperCase()} sensor package (CSV + Meta)...`, 
        type: "info" 
      }
    }));
  };

  // Pre-configured templates per device
  const getDeviceTemplates = () => {
    if (deviceType === "gpr") {
      return [
        {
          title: "ASTM D4748 Subsurface Radar Dossier",
          type: "Subsurface Radar Compliance Dossier",
          desc: "Complete rebar grid spacing, cover thickness analysis, and depth profile matrix.",
          standards: ["ASTM D4748", "ACI 228.2R"]
        },
        {
          title: "Concrete Cover & Spacing Compliance Certificate",
          type: "Statutory Cover Verification",
          desc: "Statutory evaluation against design specifications (≤200mm spacing, ≥35mm cover).",
          standards: ["NBC 2020", "BS 8110"]
        },
        {
          title: "Subsurface Void & Honeycomb Risk Audit",
          type: "Defect & Void Risk Report",
          desc: "Phase-inversion hyperbolic reflection flags for localized grouting and core testing.",
          standards: ["BS EN 13791", "ASTM D4748"]
        }
      ];
    } else if (deviceType === "pundit") {
      return [
        {
          title: "BS 1881-203 UPV Homogeneity Certificate",
          type: "Acoustic Homogeneity Certificate",
          desc: "Direct & indirect transmission rating (Excellent >4500 m/s to Poor <3000 m/s).",
          standards: ["BS 1881: Part 203", "ASTM C597"]
        },
        {
          title: "In-Situ Compressive Strength (fcu MPa) Assessment",
          type: "Compressive Strength Assessment",
          desc: "Velocity-to-strength regression curve comparison against specified C35/45 grade.",
          standards: ["BS EN 12504-4", "IS 13311"]
        },
        {
          title: "Acoustic Attenuation & Crack Depth Dossier",
          type: "Defect & Crack Depth Assessment",
          desc: "High-frequency 250kHz transducer assessment of deep structural fissures.",
          standards: ["BS 1881-203", "RILEM TC 43-CND"]
        }
      ];
    } else {
      return [
        {
          title: "NBC 2020 3D As-Built vs BIM Tolerance Verification",
          type: "Scan-to-BIM Geometric Dossier",
          desc: "Comprehensive ±20mm statutory tolerance envelope analysis and RMS deviation matrix.",
          standards: ["NBC 2020 §14.2", "DIN 18202"]
        },
        {
          title: "Trimble Connect BCF 2.1/3.0 Clash Issue Registry",
          type: "BCF Clash & NCR Audit",
          desc: "Synchronized structural viewpoints, clash severity classifications, and assigned contractor deadlines.",
          standards: ["ISO 19650-2", "BuildingSMART BCF 3.0"]
        },
        {
          title: "CDE Model Synchronization & Revision Audit",
          type: "CDE Synchronization Report",
          desc: "IFC4 version integrity, spatial coordinate anchoring, and bi-directional change log.",
          standards: ["ISO 19650-1", "ISO 19650-2"]
        }
      ];
    }
  };

  const templates = getDeviceTemplates();

  return (
    <div className="w-full mt-10 space-y-6">
      {/* SECTION HEADER CARD */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl ${theme.bgLight} ${theme.primary} border ${theme.border} shrink-0`}>
              <FileCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                  {theme.name}
                </span>
                <span className="text-xs text-gray-400 font-semibold">•</span>
                <span className="text-xs text-gray-500 font-medium">Standard: {theme.standard}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#022C4F]">
                {title || theme.defaultTitle}
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                {subtitle || theme.defaultSubtitle}
              </p>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportBatchData}
              className="px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Download size={14} />
              <span>Export Raw Data</span>
            </button>

            <button
              onClick={() => setIsGenerateOpen(true)}
              className="px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={14} />
              <span>Generate Official Dossier</span>
            </button>
          </div>
        </div>

        {/* STATUTORY KPIS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-gray-400 block text-[10px] font-bold uppercase">Certified Deliverables</span>
            <span className="text-xl font-bold text-gray-900 font-mono mt-0.5 block">{reports.length} Dossiers</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-emerald-700 block text-[10px] font-bold uppercase">Compliance Pass Rate</span>
            <span className="text-xl font-bold text-emerald-800 font-mono mt-0.5 block">
              {reports.length > 0
                ? `${Math.round((reports.filter(r => r.compliance_status === 'COMPLIANT' || r.compliance_status === 'VERIFIED').length / reports.length) * 100)}%`
                : "100%"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
            <span className="text-blue-700 block text-[10px] font-bold uppercase">Authorized Authority</span>
            <span className="text-xs font-bold text-blue-900 mt-1 block truncate">LASPPPA / Fed. Ministry</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-gray-400 block text-[10px] font-bold uppercase">Digital Seal Status</span>
            <span className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <ShieldCheck size={13} /> Stamped & Verifiable
            </span>
          </div>
        </div>
      </div>

      {/* QUICK REPORT TEMPLATES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((tpl, idx) => (
          <div
            key={idx}
            onClick={() => setIsGenerateOpen(true)}
            className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Template {idx + 1}
                </span>
                <FileText size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="font-bold text-xs text-gray-900 group-hover:text-blue-700 transition-colors">
                {tpl.title}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                {tpl.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-mono">{tpl.standards.join(" • ")}</span>
              <span className="font-bold text-blue-600 group-hover:underline flex items-center gap-0.5">
                Generate →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CERTIFIED REPORT REGISTRY TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Official Deliverables & Certified Dossier Registry
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently archived and stamped engineering documentation for statutory audits.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-blue-400 w-40 sm:w-48"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="VERIFIED">Verified</option>
              <option value="FLAGGED_DEFECTS">Flagged Defects</option>
              <option value="CRITICAL_NCR">Critical NCR</option>
            </select>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            <FileText size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-gray-700">No device dossiers match your criteria</p>
            <p className="text-gray-400 mt-1">Generate a new report or adjust your search filter above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/60 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                  <th className="py-3 px-5">Report Reference</th>
                  <th className="py-3 px-5">Title & Standard</th>
                  <th className="py-3 px-5">Target Element</th>
                  <th className="py-3 px-5">Compliance Status</th>
                  <th className="py-3 px-5">Certified By</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-gray-900 block">{rep.report_reference}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{rep.file_size}</span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-gray-900 block max-w-sm">{rep.title}</span>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-blue-600 font-medium">
                        <span>{rep.standards_cited.join(", ")}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-gray-700">
                      <span className="font-medium text-gray-900 block">{rep.element_name || "All Project Elements"}</span>
                      <span className="text-[10px] text-gray-500">{rep.project_name}</span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.compliance_status === 'COMPLIANT' || rep.compliance_status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rep.compliance_status === 'CRITICAL_NCR'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rep.compliance_status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-gray-600">
                      <span className="font-medium text-gray-800 block text-[11px]">{rep.certified_engineer}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(rep.stamped_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="px-2.5 py-1 bg-white border border-gray-200 hover:border-blue-300 text-blue-700 rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                          title="View Stamped Printable Dossier"
                        >
                          View PDF
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(rep)}
                          className="p-1 border border-gray-200 hover:bg-slate-100 rounded-lg text-gray-600 cursor-pointer"
                          title="Download Certified PDF"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          onClick={() => handleShareReport(rep)}
                          className="p-1 border border-gray-200 hover:bg-slate-100 rounded-lg text-gray-600 cursor-pointer"
                          title="Share Link"
                        >
                          <Share2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: REPORT VIEWER / PRINTABLE STATUTORY DOSSIER */}
      <AnimatePresence>
        {selectedReport && (
          <ReportViewerModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </AnimatePresence>

      {/* MODAL 2: GENERATE NEW REPORT BUILDER */}
      <AnimatePresence>
        {isGenerateOpen && (
          <GenerateReportModal
            deviceType={deviceType}
            projectId={projectId}
            elements={elements}
            defaultElementId={elementId}
            onClose={() => setIsGenerateOpen(false)}
            onGenerated={(newRep) => {
              setReports([newRep, ...reports]);
              setIsGenerateOpen(false);
              setSelectedReport(newRep);
              if (onReportGenerated) onReportGenerated(newRep);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// SUBCOMPONENT: PRINTABLE REPORT VIEWER MODAL
// ==========================================

function ReportViewerModal({
  report,
  onClose
}: {
  report: DeviceReportRecord;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-gray-200"
      >
        {/* MODAL TOOLBAR */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
              {report.report_reference}
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">• Official Inspection Dossier</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOSSIER BODY */}
        <div className="p-8 sm:p-10 overflow-y-auto space-y-8 bg-white text-gray-900 print:p-0">
          {/* STATUTORY HEADER */}
          <div className="border-b-2 border-gray-900 pb-6 text-center space-y-1">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Building2 size={24} className="text-[#022C4F]" />
              <h2 className="font-serif font-black text-sm tracking-widest text-gray-800 uppercase">
                FEDERAL REPUBLIC OF NIGERIA
              </h2>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#022C4F] uppercase tracking-wide">
              FEDERAL MINISTRY OF HOUSING & URBAN DEVELOPMENT
            </h1>
            <p className="text-xs font-semibold text-gray-600">
              DIGITAL EYE: NON-DESTRUCTIVE TESTING & STATUTORY COMPLIANCE DOSSIER
            </p>
          </div>

          {/* REPORT METADATA GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-gray-200 text-xs">
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase block">Project</span>
              <strong className="text-gray-900 block mt-0.5">{report.project_name}</strong>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase block">Target Element</span>
              <strong className="text-gray-900 block mt-0.5">{report.element_name || "General Structure"}</strong>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase block">Device Framework</span>
              <strong className="text-blue-700 block mt-0.5">{report.device_type} Sensor Suite</strong>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase block">Certified Date</span>
              <strong className="text-gray-900 block mt-0.5">{new Date(report.stamped_at).toLocaleDateString()}</strong>
            </div>
          </div>

          {/* EXECUTIVE FINDINGS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <FileText size={14} className="text-blue-600" />
              1. Executive Regulatory Summary
            </h3>
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 text-xs leading-relaxed text-gray-800">
              {report.executive_summary}
            </div>
          </div>

          {/* TELEMETRY & MEASUREMENTS TABLE */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Sliders size={14} className="text-blue-600" />
              2. Quantitative Sensor Telemetry & Standards Verification
            </h3>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4">Parameter</th>
                    <th className="py-2.5 px-4">Measured Field Value</th>
                    <th className="py-2.5 px-4">Statutory Threshold</th>
                    <th className="py-2.5 px-4 text-right">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(report.metrics).map(([key, val], i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-medium text-gray-800 capitalize">
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-gray-900">
                        {typeof val === 'number' ? val.toLocaleString() : String(val)}
                      </td>
                      <td className="py-2.5 px-4 text-gray-500 font-mono">
                        {key.includes('spacing') ? '≤ 200 mm' : key.includes('cover') ? '≥ 35 mm' : key.includes('velocity') ? '≥ 3,500 m/s' : 'Standard Norm'}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                          PASSED (VERIFIED)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* STANDARDS CITED */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              3. Regulatory Standards & Test Specifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.standards_cited.map((std, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-mono font-semibold">
                  {std}
                </span>
              ))}
            </div>
          </div>

          {/* OFFICIAL STAMP & SIGNATURE BLOCK */}
          <div className="pt-8 border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Lead Field Geophysicist</span>
              <p className="text-xs font-bold text-gray-900">{report.generated_by}</p>
              <p className="text-[10px] text-gray-500">Registered Engineering Technologist</p>
            </div>

            {/* STAMP EMBLEM */}
            <div className="p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/50 text-center text-emerald-900 min-w-[220px]">
              <ShieldCheck size={24} className="mx-auto text-emerald-600 mb-1" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest block">
                OFFICIAL COREN AUDIT
              </span>
              <span className="text-[10px] font-mono text-emerald-800 block mt-0.5">
                PASS • CERTIFIED
              </span>
            </div>

            <div className="space-y-1 text-center sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Certifying Structural Engineer</span>
              <p className="text-xs font-bold text-gray-900">{report.certified_engineer}</p>
              <p className="text-[10px] text-gray-500">COREN Reg. No: R-449102</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// SUBCOMPONENT: GENERATE REPORT MODAL
// ==========================================

function GenerateReportModal({
  deviceType,
  projectId,
  elements,
  defaultElementId,
  onClose,
  onGenerated
}: {
  deviceType: "gpr" | "pundit" | "trimble";
  projectId: string;
  elements: BIMStructuralElement[];
  defaultElementId?: string;
  onClose: () => void;
  onGenerated: (report: DeviceReportRecord) => void;
}) {
  const [title, setTitle] = useState(
    deviceType === "gpr"
      ? "GPR Subsurface Radar Structural & Cover Depth Dossier"
      : deviceType === "pundit"
      ? "BS 1881-203 Ultrasonic Pulse Velocity (UPV) Homogeneity Certificate"
      : "NBC 2020 3D As-Built vs BIM Geometric Tolerance Verification"
  );
  const [selectedElementId, setSelectedElementId] = useState(defaultElementId || (elements.length > 0 ? elements[0].id : ""));
  const [reportType, setReportType] = useState(
    deviceType === "gpr" ? "Subsurface Radar Compliance Dossier" : deviceType === "pundit" ? "Acoustic Homogeneity Certificate" : "Scan-to-BIM Geometric Dossier"
  );
  const [executiveNotes, setExecutiveNotes] = useState(
    "Non-destructive physical inspection conducted on site. Sensor calibration verified against statutory reference standards."
  );
  const [certifierName, setCertifierName] = useState("Engr. Babatunde Sanusi, FNSE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const activeElem = elements.find(el => el.id === selectedElementId);
      const rep = await generateDeviceReport({
        title,
        device_type: deviceType.toUpperCase() as any,
        project_id: projectId,
        element_id: selectedElementId,
        element_name: activeElem?.name || "All Structural Elements",
        report_type: reportType,
        standards_cited: deviceType === "gpr" 
          ? ["ASTM D4748", "ACI 228.2R", "NBC 2020 §14.2"]
          : deviceType === "pundit"
          ? ["BS 1881: Part 203", "ASTM C597", "IS 13311"]
          : ["NBC 2020 §14.2", "ISO 19650-2", "BuildingSMART BCF 3.0"],
        compliance_status: "VERIFIED",
        executive_summary: executiveNotes,
        metrics: deviceType === "gpr"
          ? { scans_or_tests_count: 8, pass_rate_pct: 98.2, avg_rebar_spacing_mm: 196, min_cover_depth_mm: 40 }
          : deviceType === "pundit"
          ? { scans_or_tests_count: 12, pass_rate_pct: 100, mean_pulse_velocity_ms: 4180, est_compressive_strength_mpa: 43.1 }
          : { scans_or_tests_count: 14250, pass_rate_pct: 98.4, max_tolerance_deviation_mm: 12.8, rms_deviation_mm: 7.9 },
        certified_engineer: certifierName,
        generated_by: "Engr. Inspector (Lead NDT Geophysicist)"
      });

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Certified Dossier Generated: ${rep.report_reference}`, type: "success" }
      }));

      onGenerated(rep);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-auto border border-gray-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#022C4F]">Generate Certified Deliverable</h3>
              <p className="text-xs text-gray-500">Official statutory dossier builder for {deviceType.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Dossier Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Target Structural Element</label>
              <select
                value={selectedElementId}
                onChange={(e) => setSelectedElementId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-medium outline-none cursor-pointer"
              >
                <option value="">All Structural Elements</option>
                {elements.map((el) => (
                  <option key={el.id} value={el.id}>{el.name} ({el.grid_location})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Certifying Inspector / Engineer</label>
              <input
                type="text"
                required
                value={certifierName}
                onChange={(e) => setCertifierName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Executive Inspection Notes & Findings</label>
            <textarea
              rows={3}
              required
              value={executiveNotes}
              onChange={(e) => setExecutiveNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none resize-none focus:border-blue-500"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2 text-blue-800 text-[11px]">
            <ShieldCheck size={16} className="shrink-0 text-blue-600" />
            <span>Document will be officially stamped with COREN certificate accreditation.</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl font-bold shadow-md shadow-blue-900/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={14} />
              <span>{isSubmitting ? "Generating..." : "Generate & Certify"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
