"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Phone,
  ShieldCheck,
  UploadCloud,
  X,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Activity,
  ArrowRight
} from "lucide-react";

export default function StakeholderInspectionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isNcrModalOpen, setIsNcrModalOpen] = useState(false);
  const [selectedNcr, setSelectedNcr] = useState<any>(null);

  // Form state for requesting an inspection
  const [requestForm, setRequestForm] = useState({
    projectName: "Eko Atlantic Horizon Towers",
    stage: "Foundation Pour & Rebar Cover",
    preferredDate: "",
    timeSlot: "Morning (09:00 - 12:00)",
    contractorOnSite: "Julius Berger Nigeria Plc",
    notes: "",
  });

  const inspections = [
    {
      id: "INS-STG-2026-041",
      project: "Eko Atlantic Horizon Towers",
      stage: "Foundation Pour & Rebar Cover",
      inspector: {
        name: "Engr. Olufemi Adebayo",
        role: "Senior Building Inspector",
        phone: "+234 802 345 6789",
        agency: "LASBCA HQ Directorate",
        eta: "14:00 Today (En Route)",
        badgeId: "INS-904",
      },
      date: "20 Sep 2026",
      status: "Scheduled",
      hasNcr: false,
    },
    {
      id: "INS-STG-2026-039",
      project: "Victoria Island Central Commercial Hub",
      stage: "Level 4 Floor Slab Concrete Pour",
      inspector: {
        name: "Arc. Chioma Nwosu",
        role: "Zonal Review Officer",
        phone: "+234 803 987 6543",
        agency: "LASPPPA Zonal Office",
        eta: "Completed",
        badgeId: "INS-712",
      },
      date: "19 Sep 2026",
      status: "Passed with Conditions",
      hasNcr: false,
    },
    {
      id: "INS-STG-2026-038",
      project: "Lekki Phase 1 Residential Estate",
      stage: "Substructure Drainage & Soil Compaction",
      inspector: {
        name: "Engr. Musa Bello",
        role: "Field Audit Officer",
        phone: "+234 805 111 2233",
        agency: "LASBCA Zonal Office",
        eta: "Audit Closed",
        badgeId: "INS-553",
      },
      date: "18 Sep 2026",
      status: "NCR Issued",
      hasNcr: true,
      ncrDetails: {
        ncrNumber: "NCR-2026-088",
        description: "Rebar cover depth on Grid 4 measured at 25mm instead of statutory 40mm design specification.",
        deadline: "24 Sep 2026",
        remediationStatus: "Awaiting Remediation Proof",
      },
    },
    {
      id: "INS-STG-2026-035",
      project: "Ikoyi Waterfront Luxury Condos",
      stage: "Superstructure Steel Framing Inspection",
      inspector: {
        name: "Engr. Olufemi Adebayo",
        role: "Senior Building Inspector",
        phone: "+234 802 345 6789",
        agency: "LASBCA HQ Directorate",
        eta: "Completed",
        badgeId: "INS-904",
      },
      date: "15 Sep 2026",
      status: "Passed",
      hasNcr: false,
    },
  ];

  // Hash watcher for #ncrs and #dispatch
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === "#ncrs") {
        setStatusFilter("NCR");
        const el = document.getElementById("ncrs");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else if (hash === "#dispatch") {
        const el = document.getElementById("dispatch");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const filtered = inspections.filter((ins) => {
    const matchesSearch =
      ins.project.toLowerCase().includes(search.toLowerCase()) ||
      ins.id.toLowerCase().includes(search.toLowerCase()) ||
      ins.stage.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || ins.status.toUpperCase().includes(statusFilter.toUpperCase());
    return matchesSearch && matchesStatus;
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestModalOpen(false);
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { message: "Stage inspection request submitted to Government Agency!", type: "success" },
      })
    );
  };

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider mb-2">
            <FileSearch size={14} />
            Pillar 1 &bull; Building Inspection Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
            Building Inspection Orchestration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Request statutory stage inspections, monitor inspector arrival ETA, and coordinate contractor remediation proof.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Request Stage Inspection</span>
        </button>
      </div>

      {/* Pillar Nav Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => {
            setStatusFilter("ALL");
            window.location.hash = "";
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            statusFilter !== "NCR" && typeof window !== "undefined" && window.location.hash !== "#ncrs"
              ? "bg-[#022C4F] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileSearch size={14} />
          <span>All Stage Inspections</span>
        </button>

        <a
          href="#dispatch"
          className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-[#022C4F]"
        >
          <Activity size={14} />
          <span>Inspector Dispatch & ETA</span>
        </a>

        <Link
          href="/stakeholder/inspections/ncrs"
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            statusFilter === "NCR"
              ? "bg-rose-700 text-white shadow-sm"
              : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
          }`}
        >
          <AlertOctagon size={14} />
          <span>NCR Remediation Desk &rarr;</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project, ID, or stage..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "SCHEDULED", "PASSED", "NCR"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                if (s === "NCR") window.location.hash = "#ncrs";
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === s
                  ? "bg-[#022C4F] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((ins, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-gray-400">{ins.id}</span>
                  <h3 className="text-base font-bold text-[#022C4F] mt-0.5">{ins.project}</h3>
                  <div className="text-xs font-semibold text-blue-600 mt-0.5">{ins.stage}</div>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                    ins.status === "Scheduled"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : ins.status.includes("Passed")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {ins.status}
                </span>
              </div>

              {/* Inspector Dispatch Box */}
              <div id="dispatch" className="scroll-mt-10 p-3.5 rounded-xl bg-gray-50 border border-gray-100 my-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck size={14} className="text-[#022C4F]" />
                    Assigned Field Inspector
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">Badge: {ins.inspector.badgeId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#022C4F]">{ins.inspector.name}</div>
                    <div className="text-[11px] text-gray-500">{ins.inspector.role} &bull; {ins.inspector.agency}</div>
                  </div>
                  <a
                    href={`tel:${ins.inspector.phone}`}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-[#022C4F] hover:bg-gray-100 transition-colors"
                    title="Call Inspector"
                  >
                    <Phone size={14} />
                  </a>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Live Status / ETA:</span>
                  <span className="font-bold text-blue-700">{ins.inspector.eta}</span>
                </div>
              </div>

              {/* NCR Warning if active */}
              {ins.hasNcr && ins.ncrDetails && (
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 my-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                      <AlertOctagon size={14} />
                      {ins.ncrDetails.ncrNumber}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                      Remediation Required
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">{ins.ncrDetails.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-rose-500">Deadline: {ins.ncrDetails.deadline}</span>
                    <button
                      onClick={() => {
                        setSelectedNcr(ins.ncrDetails);
                        setIsNcrModalOpen(true);
                      }}
                      className="text-xs font-bold text-rose-800 hover:underline cursor-pointer"
                    >
                      Upload Proof &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400">Scheduled Date: {ins.date}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("show-toast", {
                        detail: { message: `Opening detailed audit report for ${ins.id}`, type: "info" },
                      })
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 font-bold text-[#022C4F] transition-colors cursor-pointer"
                >
                  Inspection Log
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Anchor Section for #ncrs */}
      <section id="ncrs" className="scroll-mt-10 pt-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-[#022C4F] to-rose-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                <AlertOctagon size={20} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-300">
                Non-Conformance Reports (NCR) Hub
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Regulatory Remediation Proof & Audit Vault
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Access the dedicated NCR registry to review issuing agency citations, upload certified NDT tests or photo evidence, and clear statutory stop-work hold points.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/stakeholder/inspections/ncrs"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-rose-900 font-extrabold text-xs shadow-md hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
            >
              <span>Open Full NCR Desk</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Modal: Request Stage Inspection */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-5 bg-[#022C4F] text-white flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <FileSearch size={18} /> Request Regulatory Stage Inspection
                </h3>
                <button
                  onClick={() => setIsRequestModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#022C4F]">Select Project</label>
                  <select
                    value={requestForm.projectName}
                    onChange={(e) => setRequestForm({ ...requestForm, projectName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#022C4F]"
                  >
                    <option value="Eko Atlantic Horizon Towers">Eko Atlantic Horizon Towers</option>
                    <option value="Victoria Island Central Commercial Hub">Victoria Island Central Commercial Hub</option>
                    <option value="Lekki Phase 1 Residential Estate">Lekki Phase 1 Residential Estate</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#022C4F]">Statutory Construction Stage</label>
                  <select
                    value={requestForm.stage}
                    onChange={(e) => setRequestForm({ ...requestForm, stage: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#022C4F]"
                  >
                    <option value="Site Excavation & Soil Compaction">Site Excavation & Soil Compaction</option>
                    <option value="Foundation Pour & Rebar Cover">Foundation Pour & Rebar Cover</option>
                    <option value="Level 1 Floor Slab Concrete Pour">Level 1 Floor Slab Concrete Pour</option>
                    <option value="Superstructure Steel / RC Framing">Superstructure Steel / RC Framing</option>
                    <option value="MEP Rough-In & Fire Life Safety">MEP Rough-In & Fire Life Safety</option>
                    <option value="Pre-Occupancy Final Inspection">Pre-Occupancy Final Inspection</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#022C4F]">Preferred Inspection Date</label>
                    <input
                      type="date"
                      value={requestForm.preferredDate}
                      onChange={(e) => setRequestForm({ ...requestForm, preferredDate: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#022C4F]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#022C4F]">Time Slot</label>
                    <select
                      value={requestForm.timeSlot}
                      onChange={(e) => setRequestForm({ ...requestForm, timeSlot: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#022C4F]"
                    >
                      <option value="Morning (09:00 - 12:00)">Morning (09:00 - 12:00)</option>
                      <option value="Afternoon (13:00 - 16:00)">Afternoon (13:00 - 16:00)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#022C4F]">Contractor Project Lead on Site</label>
                  <input
                    type="text"
                    value={requestForm.contractorOnSite}
                    onChange={(e) => setRequestForm({ ...requestForm, contractorOnSite: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#022C4F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#022C4F]">Site Readiness Notes & Access Instructions</label>
                  <textarea
                    rows={2}
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                    placeholder="PPE mandatory, gate pass code at security..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#022C4F]"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="w-1/3 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Submit Inspection Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: NCR Remediation Proof Upload */}
      <AnimatePresence>
        {isNcrModalOpen && selectedNcr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-5 bg-rose-700 text-white flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <AlertOctagon size={18} /> Upload NCR Remediation Proof
                </h3>
                <button
                  onClick={() => setIsNcrModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-xs font-bold text-rose-900">{selectedNcr.ncrNumber}</div>
                  <p className="text-xs text-rose-700 mt-1">{selectedNcr.description}</p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <UploadCloud size={32} className="text-gray-400 mb-2" />
                  <div className="text-xs font-bold text-[#022C4F]">Click to upload photographic evidence or test results</div>
                  <div className="text-[11px] text-gray-400 mt-1">Geotagged site photos, concrete crush test certificates (PDF, JPG, PNG)</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#022C4F]">Remediation Action Statement</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the corrective action executed by the contractor..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#022C4F]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNcrModalOpen(false)}
                    className="w-1/3 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNcrModalOpen(false);
                      window.dispatchEvent(
                        new CustomEvent("show-toast", {
                          detail: {
                            message: "Remediation proof submitted to Government Inspector for verification!",
                            type: "success",
                          },
                        })
                      );
                    }}
                    className="w-2/3 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Submit Proof for Closure
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
