"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  Share2, 
  Calendar, 
  FileCheck, 
  Plus, 
  Radio, 
  Sparkles, 
  Box, 
  Layers, 
  Search, 
  Filter,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Building2,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";

export default function Reports() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const generalReports = [
    { 
      id: "RPT-TS1-101", 
      title: "Eko Atlantic Tower - Weekly LiDAR Scan-to-BIM Deviation Dossier", 
      type: "Spatial Deviation Analysis", 
      date: "Oct 10, 2026", 
      size: "2.4 MB", 
      device: "Tersus S1 LiDAR",
      status: "COMPLIANT",
      passRate: "98.2%",
      standard: "NBC 2020 §14.2 / ASTM E57"
    },
    { 
      id: "RPT-TS1-102", 
      title: "Highway Bridge A4 - Pier 3 Structural Tolerance Verification", 
      type: "Point Cloud Alignment", 
      date: "Oct 09, 2026", 
      size: "4.1 MB", 
      device: "Tersus S1 RTK SLAM",
      status: "FLAGGED DEFECTS",
      passRate: "89.4%",
      standard: "BS EN ISO 19650-2"
    },
    { 
      id: "RPT-TS1-103", 
      title: "Riverside Complex - Foundation Earthworks & Cut/Fill Balance", 
      type: "Topographic Volume Survey", 
      date: "Oct 05, 2026", 
      size: "1.8 MB", 
      device: "Drone Photogrammetry",
      status: "COMPLIANT",
      passRate: "99.1%",
      standard: "Surveyors Council of Nigeria (SURCON)"
    },
    { 
      id: "RPT-TS1-104", 
      title: "Lekki Deep Sea Port - Quay Wall QA/QC Comprehensive Audit", 
      type: "Quality Control Telemetry", 
      date: "Oct 01, 2026", 
      size: "1.1 MB", 
      device: "Tersus S1 Multi-Sensor",
      status: "COMPLIANT",
      passRate: "96.7%",
      standard: "COREN Statutory QA/QC"
    },
  ];

  const templates = [
    { name: "Progress & Point Cloud Report", desc: "Standard weekly site progression summary with before/after 3D mesh overlays.", device: "Tersus S1 LiDAR" },
    { name: "Scan-to-BIM Deviation Matrix", desc: "Detailed breakdown of As-Built vs BIM geometric anomalies against ±20mm tolerance.", device: "Scan-to-BIM" },
    { name: "QA/QC Sensor Telemetry Summary", desc: "Hardware calibration logs, IMU accuracy and point density validation metrics.", device: "Telemetry" },
    { name: "Earthworks & Volumetric Analysis", desc: "Cut/fill calculations from topographic surface registrations.", device: "Photogrammetry" },
  ];

  const filteredReports = generalReports.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="TS-1 (MVP): Spatial Surveys & Point Cloud Reports"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      {/* EXECUTIVE SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <FileText size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              TS-1 Active
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Certified Deliverables</span>
          <p className="text-3xl font-bold text-gray-900 font-mono mt-1">24</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Point cloud & BIM dossiers</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShieldCheck size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Compliance Pass Rate</span>
          <p className="text-3xl font-bold text-emerald-600 font-mono mt-1">96.8%</p>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">NBC 2020 ±20mm Envelope</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <Building2 size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
              Seal Active
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">COREN Accreditation</span>
          <p className="text-base font-bold text-indigo-900 font-mono mt-2">COREN/REG/2026/0914</p>
          <span className="text-[11px] text-indigo-600 mt-1 block">Digital Sign-Off Key Valid</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl">
              <Layers size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full">
              Format
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">Standard Exports</span>
          <p className="text-base font-bold text-cyan-900 font-mono mt-2">PDF • LAS • IFC4 • E57</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Full Geospatial Packages</span>
        </div>
      </div>

      {/* QUICK LINKS TO OTHER DEVICE REPORT PAGES */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200/80 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Layers size={14} className="text-blue-600" />
            Device-Specific Statutory Reports Hubs
          </h3>
          <span className="text-[11px] text-gray-400">Jump directly to individual device report pages</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/government/dashboard/digital-eye/gpr/reports"
            className="p-4 rounded-xl bg-white border border-cyan-200 hover:border-cyan-400 shadow-sm hover:shadow transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-50 text-cyan-700 rounded-lg group-hover:scale-105 transition-transform">
                <Radio size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900 group-hover:text-cyan-700">GPR Subsurface Reports</h4>
                <p className="text-[10px] text-gray-500">ASTM D4748 • Rebar Spacing • Voids</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-cyan-700" />
          </Link>

          <Link
            href="/government/dashboard/digital-eye/pundit/reports"
            className="p-4 rounded-xl bg-white border border-amber-200 hover:border-amber-400 shadow-sm hover:shadow transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg group-hover:scale-105 transition-transform">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900 group-hover:text-amber-700">PUNDIT UPV Reports</h4>
                <p className="text-[10px] text-gray-500">BS 1881-203 • Strength Curve • Homogeneity</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-amber-700" />
          </Link>

          <Link
            href="/government/dashboard/digital-eye/trimble/reports"
            className="p-4 rounded-xl bg-white border border-blue-200 hover:border-blue-400 shadow-sm hover:shadow transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg group-hover:scale-105 transition-transform">
                <Box size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900 group-hover:text-blue-700">Trimble Connect Reports</h4>
                <p className="text-[10px] text-gray-500">NBC 2020 As-Built vs BIM • BCF Topics</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-700" />
          </Link>
        </div>
      </div>

      {/* MAIN TS-1 DELIVERABLES REGISTRY & TEMPLATES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  TS-1 Certified Survey Dossiers & Point Cloud Archives
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Official stamped inspection reports generated by the Tersus S1 MVP pipeline.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search deliverables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none w-48 sm:w-56"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredReports.map((report, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={report.id} 
                  className="p-5 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono font-bold text-xs text-gray-500">{report.id}</span>
                        <span className="text-gray-300">•</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          report.status === 'COMPLIANT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-[10px] font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                          Pass Rate: {report.passRate}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{report.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-700">
                          {report.type}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar size={12} /> {report.date}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] font-mono">{report.size}</span>
                        <span>•</span>
                        <span className="text-[11px] text-gray-400 font-mono">{report.standard}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Downloading ${report.title} (PDF + LAS Package)...`, type: "success" } }));
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-white border border-gray-200 hover:bg-blue-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download size={13} /> Download
                    </button>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#022C4F] hover:bg-[#033c6c] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer size={13} /> View & Print
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* TEMPLATES COLUMN */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-[#022C4F] mb-4 flex items-center gap-2">
              <FileCheck size={18} className="text-emerald-500" />
              Statutory Survey Templates
            </h3>
            
            <div className="space-y-3">
              {templates.map((tpl, i) => (
                <div 
                  key={i} 
                  onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Generating ${tpl.name}...`, type: "info" } }))}
                  className="p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-xs text-gray-800 group-hover:text-blue-600 transition-colors">{tpl.name}</h4>
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{tpl.device}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRINTABLE DOSSIER MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-6 border-b border-gray-200">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-800">
                  Federal Republic of Nigeria • Ministry of Housing & Urban Development
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedReport.title}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 font-mono">
                  <span>Ref: {selectedReport.id}</span>
                  <span>•</span>
                  <span>Standard: {selectedReport.standard}</span>
                  <span>•</span>
                  <span>Date: {selectedReport.date}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-6 space-y-6 text-xs text-gray-700">
              <div className="p-4 bg-slate-50 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-2">Statutory Findings & Evaluation</h4>
                <p className="leading-relaxed">
                  The LiDAR spatial survey and point-to-BIM correlation indicates a statutory compliance rating of <strong>{selectedReport.passRate}</strong>. 
                  All geometric tolerances have been validated against NBC 2020 Part II Chapter 14.2 envelope standards.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Evaluation Metric</th>
                      <th className="py-2.5 px-4">Measured Value</th>
                      <th className="py-2.5 px-4">Statutory Threshold</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-2 px-4 font-medium">Point Cloud Density</td>
                      <td className="py-2 px-4 font-mono">2,450 pts/m²</td>
                      <td className="py-2 px-4 font-mono">&gt; 1,000 pts/m²</td>
                      <td className="py-2 px-4 text-emerald-600 font-bold">PASSED</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">RMS Geometric Deviation</td>
                      <td className="py-2 px-4 font-mono">8.4 mm</td>
                      <td className="py-2 px-4 font-mono">≤ 20.0 mm</td>
                      <td className="py-2 px-4 text-emerald-600 font-bold">PASSED</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">COREN Certified Signature</td>
                      <td className="py-2 px-4 font-mono">VERIFIED</td>
                      <td className="py-2 px-4 font-mono">Enforced</td>
                      <td className="py-2 px-4 text-emerald-600 font-bold">ACTIVE</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-[11px] text-gray-500">
                  Digitally Stamped & Authenticated by <strong>COREN/REG/2026/0914</strong>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-[#022C4F] text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow cursor-pointer"
                  >
                    <Printer size={13} /> Print Statutory Dossier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
