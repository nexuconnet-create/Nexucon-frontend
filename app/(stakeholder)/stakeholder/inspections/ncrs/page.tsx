"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertOctagon,
  ShieldCheck,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Building2,
  Calendar,
  ChevronRight,
  UserCheck,
  ChevronLeft,
  X,
  FileCheck,
  Phone,
  Eye,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Camera,
  Layers
} from "lucide-react";

interface NcrItem {
  id: string;
  ncrNumber: string;
  projectName: string;
  location: string;
  stage: string;
  issuingAgency: string;
  inspectorName: string;
  inspectorRole: string;
  dateIssued: string;
  deadline: string;
  severity: "Critical" | "Major" | "Moderate";
  status: "Awaiting Proof" | "Under Review" | "Approved & Closed";
  description: string;
  statutoryCode: string;
  beforePhotoUrl?: string;
  remedialProofUrl?: string;
  remediationStatement?: string;
  daysRemaining: number;
}

const mockNcrs: NcrItem[] = [
  {
    id: "ncr-1",
    ncrNumber: "NCR-2026-088",
    projectName: "Eko Atlantic Horizon Towers",
    location: "Block B, Grid 4 (North Elevation)",
    stage: "Foundation Pour & Rebar Cover",
    issuingAgency: "LASBCA HQ Directorate",
    inspectorName: "Engr. Olufemi Adebayo",
    inspectorRole: "Senior Building Inspector",
    dateIssued: "18 Sep 2026",
    deadline: "24 Sep 2026",
    severity: "Critical",
    status: "Awaiting Proof",
    description: "Rebar cover depth on Grid 4 measured at 25mm instead of statutory 40mm design specification. Risk of premature carbonation and chloride ingress in marine environment.",
    statutoryCode: "BS 8110-1:1997 §3.3 & Lagos State Building Regulations 2021",
    beforePhotoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=800&auto=format&fit=crop",
    daysRemaining: 3,
  },
  {
    id: "ncr-2",
    ncrNumber: "NCR-2026-092",
    projectName: "Victoria Island Central Commercial Hub",
    location: "Core Shear Wall SW-02, Level 3",
    stage: "Level 4 Floor Slab Concrete Pour",
    issuingAgency: "Lagos State Materials Testing Laboratory (LSMTL)",
    inspectorName: "Engr. Musa Bello",
    inspectorRole: "Materials Quality Auditor",
    dateIssued: "14 Sep 2026",
    deadline: "22 Sep 2026",
    severity: "Major",
    status: "Under Review",
    description: "7-day concrete compressive test cube failed minimum threshold (18.5 N/mm² achieved vs 25 N/mm² specified). NDT ultrasonic pulse velocity (UPV) verification requested.",
    statutoryCode: "BS 1881-203:1986 & NIS 156:2018",
    beforePhotoUrl: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?q=80&w=800&auto=format&fit=crop",
    remedialProofUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    remediationStatement: "Ultrasonic NDT test carried out by accredited laboratory on 19 Sep 2026 confirmed estimated 28-day target strength meets C30/37 design criteria. Rebound hammer calibration appended.",
    daysRemaining: 1,
  },
  {
    id: "ncr-3",
    ncrNumber: "NCR-2026-079",
    projectName: "Lekki Phase 1 Residential Estate",
    location: "Basement Drainage Trench 03",
    stage: "Substructure Drainage & Soil Compaction",
    issuingAgency: "LASBCA Zonal Office",
    inspectorName: "Arc. Chioma Nwosu",
    inspectorRole: "Zonal Review Officer",
    dateIssued: "08 Sep 2026",
    deadline: "16 Sep 2026",
    severity: "Moderate",
    status: "Approved & Closed",
    description: "Subbase compaction degree measured at 91% MDD against required 95% Modified AASHTO specification prior to blinding layer pour.",
    statutoryCode: "ASTM D1557-12 / Federal Highway Specs",
    beforePhotoUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop",
    remedialProofUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop",
    remediationStatement: "Trench re-excavated, moisture conditioned to OMC, and re-compacted with 3-ton vibratory roller. Nuclear density gauge test confirmed 97.2% compaction.",
    daysRemaining: 0,
  },
];

export default function StakeholderNcrsPage() {
  const [ncrs, setNcrs] = useState<NcrItem[]>(mockNcrs);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedNcr, setSelectedNcr] = useState<NcrItem | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Form state for proof submission
  const [actionStatement, setActionStatement] = useState("");
  const [engineerStamp, setEngineerStamp] = useState("COREN Reg. Engr. B. Adeleke (R.21094)");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = ncrs.filter((ncr) => {
    const matchesSearch =
      ncr.ncrNumber.toLowerCase().includes(search.toLowerCase()) ||
      ncr.projectName.toLowerCase().includes(search.toLowerCase()) ||
      ncr.description.toLowerCase().includes(search.toLowerCase()) ||
      ncr.location.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || ncr.severity.toUpperCase() === severityFilter.toUpperCase();
    const matchesStatus = statusFilter === "ALL" || ncr.status.toUpperCase().includes(statusFilter.toUpperCase());
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleOpenProofModal = (ncr: NcrItem) => {
    setSelectedNcr(ncr);
    setActionStatement(ncr.remediationStatement || "");
    setUploadedFileName(ncr.remedialProofUrl ? "NDT_Verification_Report_Signed.pdf" : null);
    setIsProofModalOpen(true);
  };

  const handleOpenAuditModal = (ncr: NcrItem) => {
    setSelectedNcr(ncr);
    setIsAuditModalOpen(true);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNcr) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setNcrs((prev) =>
        prev.map((item) =>
          item.id === selectedNcr.id
            ? {
                ...item,
                status: "Under Review",
                remediationStatement: actionStatement,
                remedialProofUrl:
                  item.remedialProofUrl ||
                  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
              }
            : item
        )
      );
      setIsSubmitting(false);
      setIsProofModalOpen(false);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: `Remediation proof for ${selectedNcr.ncrNumber} submitted to Government Inspector!`,
            type: "success",
          },
        })
      );
    }, 800);
  };

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/stakeholder/inspections"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#022C4F] transition-colors mb-2"
          >
            <ChevronLeft size={16} />
            Back to Building Inspection Desk
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shadow-sm">
              <AlertOctagon size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
                Non-Conformance Reports (NCR) Desk
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Coordinate remedial actions, upload certified test results, and clear statutory stop-work hold points.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/stakeholder/inspections"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#022C4F] shadow-sm transition-all"
          >
            Stage Inspections
          </Link>
          <button
            onClick={() => {
              const pending = ncrs.find((n) => n.status === "Awaiting Proof") || ncrs[0];
              handleOpenProofModal(pending);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <UploadCloud size={16} />
            <span>Upload Remediation Proof</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total NCRs Logged</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-[#022C4F]">{ncrs.length}</span>
            <span className="text-xs text-slate-500 font-semibold">Across active sites</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Action Required</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-rose-700">
              {ncrs.filter((n) => n.status === "Awaiting Proof").length}
            </span>
            <span className="text-xs text-rose-600 font-semibold">Awaiting Proof</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Under Review</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-amber-800">
              {ncrs.filter((n) => n.status === "Under Review").length}
            </span>
            <span className="text-xs text-amber-700 font-semibold">Inspector Verifying</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Remediated & Closed</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-800">
              {ncrs.filter((n) => n.status === "Approved & Closed").length}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">100% Cleared</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by NCR number, project, defect, or location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden lg:inline">
            Status:
          </span>
          {["ALL", "Awaiting Proof", "Under Review", "Approved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? "bg-[#022C4F] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* NCR Items List */}
      <div className="space-y-5">
        {filtered.map((ncr) => (
          <div
            key={ncr.id}
            className={`bg-white rounded-3xl border transition-all p-6 shadow-sm hover:shadow-md flex flex-col justify-between ${
              ncr.status === "Awaiting Proof"
                ? "border-rose-300 ring-1 ring-rose-200/60"
                : ncr.status === "Under Review"
                ? "border-amber-200"
                : "border-slate-200"
            }`}
          >
            <div>
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#022C4F] text-white font-mono font-bold text-xs">
                    {ncr.ncrNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      ncr.severity === "Critical"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : ncr.severity === "Major"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {ncr.severity} Severity
                  </span>
                  <span className="text-xs font-bold text-slate-400 hidden sm:inline">&bull;</span>
                  <span className="text-xs font-semibold text-slate-500 hidden sm:inline">{ncr.stage}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                      ncr.status === "Awaiting Proof"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : ncr.status === "Under Review"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {ncr.status === "Approved & Closed" ? (
                      <CheckCircle2 size={13} className="text-emerald-600" />
                    ) : (
                      <Clock size={13} className="animate-spin" />
                    )}
                    {ncr.status}
                  </span>
                </div>
              </div>

              {/* Main Content Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-5">
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-lg font-bold text-[#022C4F]">{ncr.projectName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Building2 size={14} className="text-slate-400" />
                    <span>{ncr.location}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Non-Conformance Description
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">{ncr.description}</p>
                    <div className="pt-1.5 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <FileCheck size={12} className="text-blue-600" />
                      <span>Regulatory Standard: {ncr.statutoryCode}</span>
                    </div>
                  </div>

                  {ncr.remediationStatement && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        Remedial Action Statement (Contractor)
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed">{ncr.remediationStatement}</p>
                    </div>
                  )}
                </div>

                {/* Right side: Issuer & Deadlines */}
                <div className="space-y-4 lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                        <UserCheck size={12} className="text-[#022C4F]" />
                        Issuing Government Officer
                      </div>
                      <div className="text-xs font-bold text-[#022C4F]">{ncr.inspectorName}</div>
                      <div className="text-[11px] text-slate-500">
                        {ncr.inspectorRole} &bull; {ncr.issuingAgency}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl border border-slate-100 bg-white">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Issued</span>
                        <span className="font-semibold text-slate-800">{ncr.dateIssued}</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-100 bg-white">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Deadline</span>
                        <span className="font-bold text-rose-700">{ncr.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {ncr.daysRemaining > 0 && ncr.status === "Awaiting Proof" && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                      <span className="text-xs font-bold text-rose-800">
                        {ncr.daysRemaining} days remaining before Stop-Work Notice
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAuditModal(ncr)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileText size={14} className="text-slate-400" />
                  <span>Audit Trail</span>
                </button>
                {ncr.beforePhotoUrl && (
                  <a
                    href={ncr.beforePhotoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <Camera size={14} className="text-slate-400" />
                    <span>Defect Photo</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                {ncr.status === "Awaiting Proof" ? (
                  <button
                    onClick={() => handleOpenProofModal(ncr)}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud size={14} />
                    <span>Upload Remediation Proof</span>
                  </button>
                ) : ncr.status === "Under Review" ? (
                  <button
                    onClick={() => handleOpenProofModal(ncr)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>View Submitted Proof</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck size={16} /> Certified Closed by Agency
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Upload / View Proof */}
      <AnimatePresence>
        {isProofModalOpen && selectedNcr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="p-5 bg-[#022C4F] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-cyan-300" />
                  <div>
                    <h3 className="font-bold text-sm">NCR Remediation Evidence Vault</h3>
                    <span className="text-[10px] text-white/70 font-mono">{selectedNcr.ncrNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsProofModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitProof} className="p-6 space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Defect In Scope
                  </div>
                  <div className="text-xs font-bold text-[#022C4F] mt-0.5">{selectedNcr.projectName}</div>
                  <p className="text-xs text-slate-600 mt-1">{selectedNcr.description}</p>
                </div>

                {/* Upload box */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#022C4F] block">
                    Upload Rectification Evidence / Lab Test Certificate
                  </label>
                  <label
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      uploadedFileName
                        ? "border-emerald-400 bg-emerald-50/40"
                        : "border-slate-300 hover:border-blue-500 bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedFileName(e.target.files[0].name);
                        }
                      }}
                    />
                    {uploadedFileName ? (
                      <>
                        <CheckCircle2 size={32} className="text-emerald-600 mb-2" />
                        <div className="text-xs font-bold text-emerald-900">{uploadedFileName}</div>
                        <div className="text-[11px] text-emerald-700 mt-0.5">Click to replace evidence file</div>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={32} className="text-slate-400 mb-2" />
                        <div className="text-xs font-bold text-[#022C4F]">
                          Click to select photos or laboratory PDF report
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Geotagged site photos, UPV / Schmidt hammer tests, COREN certified reports
                        </div>
                      </>
                    )}
                  </label>
                </div>

                {/* Action statement */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#022C4F] block">
                    Contractor Corrective Action Statement
                  </label>
                  <textarea
                    rows={3}
                    value={actionStatement}
                    onChange={(e) => setActionStatement(e.target.value)}
                    required
                    placeholder="Detail the remedial measures completed on site (e.g. concrete cover re-bar adjustment, structural epoxy injection, compaction re-testing)..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                  />
                </div>

                {/* Professional stamp */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#022C4F] block">
                    Lead Structural Engineer Attestation
                  </label>
                  <input
                    type="text"
                    value={engineerStamp}
                    onChange={(e) => setEngineerStamp(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsProofModalOpen(false)}
                    className="w-1/3 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                    <span>Submit Proof for Inspector Review</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Audit Trail */}
      <AnimatePresence>
        {isAuditModalOpen && selectedNcr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} />
                  <h3 className="font-bold text-sm">Regulatory Audit Timeline</h3>
                </div>
                <button
                  onClick={() => setIsAuditModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-xs font-bold text-slate-700">
                  Audit Records for <span className="font-mono text-blue-600">{selectedNcr.ncrNumber}</span>
                </div>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  <div className="relative pl-8">
                    <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white shadow-sm -translate-x-1/2" />
                    <div className="text-xs font-bold text-slate-800">Non-Conformance Notice Logged</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Issued by {selectedNcr.inspectorName} ({selectedNcr.issuingAgency})
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedNcr.dateIssued} 10:45 WAT</div>
                  </div>

                  {selectedNcr.remediationStatement && (
                    <div className="relative pl-8">
                      <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm -translate-x-1/2" />
                      <div className="text-xs font-bold text-slate-800">Contractor Remediation Proof Uploaded</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Lab test report & structural sign-off submitted for review.
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">19 Sep 2026 16:20 WAT</div>
                    </div>
                  )}

                  {selectedNcr.status === "Approved & Closed" && (
                    <div className="relative pl-8">
                      <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-sm -translate-x-1/2" />
                      <div className="text-xs font-bold text-emerald-800">Remediation Approved & NCR Closed</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Statutory clearance granted. Stage-Gate hold point lifted.
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">20 Sep 2026 11:15 WAT</div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setIsAuditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
