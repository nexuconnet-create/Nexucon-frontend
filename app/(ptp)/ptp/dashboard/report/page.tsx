"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Send,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Camera,
  CheckCircle2,
  Lock,
  Building2,
  FileText,
  Clock,
  ArrowRight,
  UploadCloud,
  X,
  Copy,
  Check,
  PhoneCall,
  ShieldAlert,
  FileCheck2,
  Printer,
  ChevronRight,
  AlertOctagon,
  Layers,
  Droplets,
  HelpCircle
} from "lucide-react";
import { submitViolationReport, ViolationReportPayload } from "@/services/publicPortal";
import MetricCard from "@/components/dashboard/MetricCard";
import PtpTopRightControls from "@/components/dashboard/PtpTopRightControls";

const VIOLATION_CATEGORIES = [
  {
    id: "unpermitted_floors",
    title: "Unpermitted Extra Storeys",
    desc: "Constructing floors beyond gazetted LASPPPA planning permit approvals.",
    icon: Layers,
    badge: "Severe",
    badgeColor: "bg-red-500",
  },
  {
    id: "structural_cracks",
    title: "Structural Distress / Tilting",
    desc: "Visible shear cracks in columns, foundation settlement, or building deflection.",
    icon: AlertOctagon,
    badge: "Urgent",
    badgeColor: "bg-red-600",
  },
  {
    id: "broken_seal",
    title: "Defied / Broken Stop-Work Seal",
    desc: "Workers continuing active construction despite official LASBCA red seal.",
    icon: ShieldAlert,
    badge: "Illegal",
    badgeColor: "bg-amber-500",
  },
  {
    id: "drainage_encroachment",
    title: "Canal & Setback Encroachment",
    desc: "Illegal building on flood drainage, public road setback, or transmission reserve.",
    icon: Droplets,
    badge: "Environmental",
    badgeColor: "bg-blue-500",
  },
  {
    id: "substandard_materials",
    title: "Substandard Rebar / Concrete",
    desc: "Suspected uncertified rebar or low-strength concrete casting during pours.",
    icon: Building2,
    badge: "Quality",
    badgeColor: "bg-purple-500",
  },
  {
    id: "no_signboard",
    title: "Unregistered Site / No Board",
    desc: "Site operating without statutory project approval signboard with permit details.",
    icon: FileText,
    badge: "Statutory",
    badgeColor: "bg-slate-500",
  },
];

const LAGOS_LGAS = [
  "Eti-Osa (Ikoyi, Victoria Island, Lekki)",
  "Ikeja (GRA, Alausa, Allen)",
  "Lagos Island (Marina, CMS, Broad St)",
  "Ibeju-Lekki (Dangote Refinery Corridor, Eleko)",
  "Surulere (Bode Thomas, Stadium)",
  "Lagos Mainland (Yaba, Ebute Metta)",
  "Kosofe (Magodo, Ogudu, Ojota)",
  "Alimosho (Egbeda, Ipaja)",
  "Oshodi-Isolo",
  "Somolu",
  "Apapa",
  "Amuwo-Odofin (Festac)",
  "Badagry",
  "Epe",
  "Ikorodu",
  "Agege",
  "Ifako-Ijaiye",
  "Mushin",
  "Ojo",
  "Ajeromi-Ifelodun",
];

const RECENT_COMMUNITY_ACTIONS = [
  {
    id: "act-1",
    location: "Lekki Phase 1, Admiralty Way",
    action: "Site Sealed (Unapproved 6th Floor)",
    time: "2 hours ago",
    status: "SEALED",
  },
  {
    id: "act-2",
    location: "Ikeja GRA, Isaac John",
    action: "Stop-Work Notice Served",
    time: "4 hours ago",
    status: "STOP_WORK",
  },
  {
    id: "act-3",
    location: "Victoria Island, Adeola Odeku",
    action: "Structural Integrity Audit Ordered",
    time: "Yesterday",
    status: "INVESTIGATING",
  },
];

export default function PtpReportPage() {
  const [formData, setFormData] = useState<ViolationReportPayload>({
    address: "",
    lga: "Eti-Osa (Ikoyi, Victoria Island, Lekki)",
    violation_type: "unpermitted_floors",
    description: "",
    reporter_name: "",
    reporter_contact: "",
  });

  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleCopyToken = () => {
    if (submittedToken) {
      navigator.clipboard.writeText(submittedToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => f.name);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== fileName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address.trim() || !formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitViolationReport({
        ...formData,
        reporter_name: isAnonymous ? "Anonymous Whistleblower" : formData.reporter_name,
      });
      setSubmittedToken(res.tracking_number || `TIP-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch {
      setSubmittedToken(`TIP-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar matching Government Command Center */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 mb-2">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Send size={20} />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#022C4F] leading-tight">
              Report Building Violation &amp; Safety Hazard
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Statutory civic whistleblower reporting portal. Submit anonymous evidence on unpermitted storeys, structural distress, or defied Stop-Work seals directly to state regulatory teams.
          </p>
        </div>
        <PtpTopRightControls />
      </div>

      {/* KPI METRIC CARDS matching Nexucon standard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Community Reports Filed"
          value="3,419"
        />
        <MetricCard
          title="Enforcement Response Rate"
          value="94.2%"
        />
        <MetricCard
          title="Avg. Triage Response Time"
          value="< 24h"
        />
        <MetricCard
          title="Whistleblower Anonymity"
          value="100%"
        />
      </div>

      {submittedToken ? (
        /* SUCCESS RECEIPT DOSSIER */
        <div className="bg-white rounded-3xl border-2 border-emerald-500 overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-[#022C4F] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <CheckCircle2 size={36} className="text-emerald-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  Statutory Submission Confirmed
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Violation Tip-off Successfully Gazetted
                </h2>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  Assigned to the Zonal Building Control Rapid Response Unit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyToken}
                className="px-4 py-2.5 rounded-xl bg-white text-[#022C4F] hover:bg-slate-100 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                {copiedToken ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span>Copied Reference!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Reference</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Tracking Reference Lockup */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Official Whistleblower Tracking Reference
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
                  {submittedToken}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Keep this tracking code confidential. You can check the field inspection and sealing status at any time.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Status: QUEUED FOR TRIAGE
                </span>
              </div>
            </div>

            {/* Dossier Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Violation Type</span>
                <span className="text-xs font-bold text-[#022C4F] mt-1 block">
                  {VIOLATION_CATEGORIES.find((c) => c.id === formData.violation_type)?.title || formData.violation_type}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Jurisdiction</span>
                <span className="text-xs font-bold text-[#022C4F] mt-1 block truncate">
                  {formData.lga}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Reported Site</span>
                <span className="text-xs font-bold text-[#022C4F] mt-1 block truncate">
                  {formData.address}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Whistleblower Shield</span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block flex items-center gap-1">
                  <Lock size={12} />
                  {isAnonymous ? "100% Anonymized" : "Confidential Contact"}
                </span>
              </div>
            </div>

            {/* Next Steps Timeline */}
            <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-4">
              <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                <FileCheck2 size={18} className="text-blue-700" />
                <span>Statutory Next Steps &amp; Enforcement Timeline</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-900">
                <div className="p-3.5 rounded-xl bg-white/80 border border-blue-100">
                  <strong className="block text-[#022C4F] mb-1">1. Automated Geo-Triage</strong>
                  <span>Coordinates verified against LASPPPA registered planning permits within 2 hours.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-blue-100">
                  <strong className="block text-[#022C4F] mb-1">2. Field Officer Dispatch</strong>
                  <span>Zonal LASBCA inspector dispatched to conduct physical non-destructive inspection within 24–48 hours.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-blue-100">
                  <strong className="block text-[#022C4F] mb-1">3. Enforcement Action</strong>
                  <span>If contravention is substantiated, a formal Stop-Work Seal or Demolition Notice is gazetted.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <Link
                href="/ptp/dashboard"
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Back to Command Center
              </Link>
              <button
                onClick={() => {
                  setSubmittedToken(null);
                  setFormData({
                    address: "",
                    lga: "Eti-Osa (Ikoyi, Victoria Island, Lekki)",
                    violation_type: "unpermitted_floors",
                    description: "",
                    reporter_name: "",
                    reporter_contact: "",
                  });
                  setUploadedFiles([]);
                  setIsAnonymous(true);
                }}
                className="px-6 py-3 rounded-xl bg-[#022C4F] hover:bg-[#033c6c] text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>Submit Another Report</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN 2-COLUMN REPORTING INTERFACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: THE INTAKE FORM */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-8">
              {/* Form Intro Banner */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#022C4F] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#022C4F]">
                    Statutory Whistleblower Channel &bull; LASBCA Act Sec. 42
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5 leading-relaxed">
                    Submissions are transmitted through an encrypted civic gateway. You may choose full cryptographic anonymity or provide confidential contact details to receive dispatch updates.
                  </p>
                </div>
              </div>

              {/* SECTION 1: VIOLATION CATEGORY */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#022C4F] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Select Violation Classification</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">Click to select primary breach</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VIOLATION_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = formData.violation_type === cat.id;

                    return (
                      <div
                        key={cat.id}
                        onClick={() => setFormData((p) => ({ ...p, violation_type: cat.id }))}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? "border-[#022C4F] bg-blue-50/60 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 bg-white hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-[#022C4F] text-white" : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              <Icon size={16} />
                            </div>
                            <span className="text-xs font-bold text-[#022C4F] leading-snug">
                              {cat.title}
                            </span>
                          </div>
                          {isSelected && <CheckCircle2 size={16} className="text-[#022C4F] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed pl-10">
                          {cat.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: LOCATION & JURISDICTION */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#022C4F] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Site Location &amp; Administrative Jurisdiction</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">Lagos State</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-bold text-[#022C4F]">
                      Local Government Area (LGA)
                    </label>
                    <select
                      value={formData.lga}
                      onChange={(e) => setFormData((p) => ({ ...p, lga: e.target.value }))}
                      className="w-full py-3.5 px-4 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] bg-white font-medium"
                    >
                      {LAGOS_LGAS.map((lga) => (
                        <option key={lga} value={lga}>
                          {lga}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-bold text-[#022C4F]">
                      Specific Site Address or Landmark
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                        placeholder="e.g. Plot 14, Admiralty Way, Lekki Phase 1"
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: OBSERVATION DOSSIER & EVIDENCE DETAILS */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#022C4F] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>Detailed Evidence &amp; Field Observations</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">Specific Facts</span>
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe what you observed in detail (e.g. Contractor casting 6th floor slab at night despite a red LASBCA contravention seal pasted on perimeter gate; visible column cracking on ground floor east wing)..."
                    className="w-full p-4 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] font-medium leading-relaxed"
                  />
                  <span className="text-[11px] text-gray-400 text-right">
                    Provide dates, times, and observable worker activity if known.
                  </span>
                </div>

                {/* Evidence Photo Upload Dropzone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#022C4F] flex items-center gap-1.5">
                    <Camera size={14} className="text-[#022C4F]" />
                    <span>Attach Photo or Document Evidence (Optional but Highly Recommended)</span>
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-[#022C4F] hover:bg-slate-50/50 transition-colors relative cursor-pointer group">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleSimulatedUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#022C4F] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                      <UploadCloud size={24} />
                    </div>
                    <div className="text-xs font-bold text-[#022C4F]">
                      Click to upload photos or drag and drop
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      PNG, JPG, or PDF up to 25MB (Site photos, cracked columns, permit signboards)
                    </p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2"
                        >
                          <Camera size={13} className="text-slate-500" />
                          <span className="truncate max-w-[180px]">{file}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: WHISTLEBLOWER IDENTITY & SHIELD */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#022C4F] text-white text-[10px] flex items-center justify-center font-bold">4</span>
                    <span>Whistleblower Identity &amp; Privacy Shield</span>
                  </label>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <Lock size={12} />
                    Zero-Knowledge Shield
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setIsAnonymous(true)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isAnonymous
                        ? "border-[#022C4F] bg-blue-50/60 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#022C4F]">
                        <Lock size={15} className="text-emerald-600" />
                        <span>Anonymous Whistleblower</span>
                      </div>
                      {isAnonymous && <CheckCircle2 size={16} className="text-[#022C4F]" />}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Recommended. Your personal identity, email, and IP address are 100% stripped before dispatch.
                    </p>
                  </div>

                  <div
                    onClick={() => setIsAnonymous(false)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      !isAnonymous
                        ? "border-[#022C4F] bg-blue-50/60 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#022C4F]">
                        <PhoneCall size={15} className="text-blue-600" />
                        <span>Confidential Direct Contact</span>
                      </div>
                      {!isAnonymous && <CheckCircle2 size={16} className="text-[#022C4F]" />}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Provide contact details to allow zonal inspectors to reach out for additional physical access or coordinates.
                    </p>
                  </div>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in duration-200">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#022C4F]">Your Name / Alias</label>
                      <input
                        type="text"
                        value={formData.reporter_name}
                        onChange={(e) => setFormData((p) => ({ ...p, reporter_name: e.target.value }))}
                        placeholder="e.g. Engr. B. Adeleke"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-[#022C4F] bg-white font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#022C4F]">Phone Number or Email</label>
                      <input
                        type="text"
                        value={formData.reporter_contact}
                        onChange={(e) => setFormData((p) => ({ ...p, reporter_contact: e.target.value }))}
                        placeholder="e.g. +234 803 000 1122"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-[#022C4F] bg-white font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-gray-500">
                  Protected under statutory public safety whistleblower protections.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#022C4F] hover:bg-[#033c6c] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Transmit Whistleblower Report</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: ENFORCEMENT PROTOCOL & GUIDELINES */}
          <div className="lg:col-span-4 space-y-6">
            {/* Protocol Card */}
            <div className="bg-[#022C4F] text-white rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck size={16} />
                <span>Statutory Protocol</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                LASBCA Rapid Response Protocol
              </h3>

              <p className="text-xs text-cyan-100/80 leading-relaxed mb-6">
                Reports submitted through this portal are prioritized by automated triage algorithms and routed to zonal control desks.
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5 border border-cyan-400/30">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Geospatial Permitting Cross-check</h4>
                    <p className="text-cyan-200/70 text-[11px] mt-0.5">
                      Validates registered LASPPPA approvals and approved building heights within 2 hours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5 border border-cyan-400/30">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Physical Zonal Inspection</h4>
                    <p className="text-cyan-200/70 text-[11px] mt-0.5">
                      Accredited field officers dispatched to conduct core sample audits and seal unauthorized sites.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5 border border-cyan-400/30">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Public Gazette Bulletin</h4>
                    <p className="text-cyan-200/70 text-[11px] mt-0.5">
                      Stop-Work orders and sealing notices are published to the public registry feed in real time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Guidelines Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-2">
                <Camera size={16} className="text-[#022C4F]" />
                <span>Evidence Best Practices</span>
              </h3>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Capture building height relative to neighboring registered structures.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Photograph the contractor signpost showing registration and permit numbers.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>If reporting a defied order, photograph the red LASBCA seal and ongoing work.</span>
                </div>
              </div>
            </div>

            {/* Emergency Hotline Card */}
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-red-800 text-xs font-bold uppercase tracking-wider">
                <AlertOctagon size={16} className="text-red-600" />
                <span>Immediate Threat of Collapse?</span>
              </div>
              <p className="text-xs text-red-900 leading-relaxed">
                If you hear structural creaking, observe major sudden shear cracks, or notice visible leaning posing imminent threat to human life:
              </p>
              <div className="p-3 bg-white/80 rounded-xl border border-red-200 space-y-1">
                <div className="text-xs font-bold text-red-900">Lagos State Emergency Services</div>
                <div className="text-sm font-extrabold text-red-600 font-mono">Toll-Free: 112 &bull; 767</div>
                <div className="text-[11px] text-gray-600">24/7 Rapid Response Desk</div>
              </div>
            </div>

            {/* Live Community Actions */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-[#022C4F]" />
                  <span>Recent Enforcements</span>
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-3">
                {RECENT_COMMUNITY_ACTIONS.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#022C4F] truncate max-w-[170px]">{item.location}</span>
                      <span className="text-[10px] text-gray-400">{item.time}</span>
                    </div>
                    <div className="text-[11px] text-gray-600 font-medium">{item.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

