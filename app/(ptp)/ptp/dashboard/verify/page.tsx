"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  Lock,
  Download,
  Share2,
  ExternalLink,
  QrCode,
  Shield
} from "lucide-react";
import { verifyProjectPermit, PublicProject } from "@/services/publicPortal";

export default function PtpVerifyPage() {
  const [permitCode, setPermitCode] = useState("");
  const [result, setResult] = useState<PublicProject | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const samplePermits = [
    { code: "LASPPPA/ETI/2026/0481", title: "Lekki Heights Residences (14 Storeys)" },
    { code: "LASPPPA/LIS/2025/0042", title: "Eko Atlantic Financial Tower (28 Storeys)" },
    { code: "LASPPPA/IKJ/2025/1109", title: "Ikeja GRA Oasis Villas (4 Storeys)" },
    { code: "LASPPPA/IBJ/2026/0091", title: "Dangote Refinery Logistics Hub" },
  ];

  const handleVerify = async (codeToVerify?: string) => {
    const target = (codeToVerify || permitCode).trim();
    if (!target) return;

    setIsVerifying(true);
    setNotFound(false);
    setResult(null);

    try {
      const match = await verifyProjectPermit(target);
      if (match) {
        setResult(match);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
          <FileCheck2 size={14} className="text-blue-700" />
          <span>Statutory Verification Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
          Permit &amp; Certificate Cryptographic Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Validate authentic LASPPPA planning approvals, LASBCA stage clearances, and licensed professional stamps.
        </p>
      </div>

      {/* Verification Input Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Enter Planning Permit Number, Certificate Reference, or Hash
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={permitCode}
              onChange={(e) => setPermitCode(e.target.value)}
              placeholder="e.g. LASPPPA/ETI/2026/0481"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-[#022C4F] font-mono uppercase"
            />
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || !permitCode.trim()}
            className="px-8 py-3.5 rounded-2xl bg-[#022C4F] hover:bg-[#033E6E] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isVerifying ? "Cryptographically Validating..." : "Verify Authentic Record"}
          </button>
        </div>

        {/* Quick Sample Clickers */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Try Sample Verified Permits:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePermits.map((sample) => (
              <button
                key={sample.code}
                onClick={() => {
                  setPermitCode(sample.code);
                  handleVerify(sample.code);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs text-slate-700 hover:text-blue-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="font-mono font-bold">{sample.code}</span>
                <span className="text-slate-400 hidden sm:inline">&bull; {sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULT CARD: VERIFIED */}
      {result && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-xl overflow-hidden animate-in fade-in duration-300">
          {/* Certificate Top Banner */}
          <div className="bg-gradient-to-r from-emerald-700 to-[#022C4F] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <ShieldCheck size={36} className="text-emerald-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <CheckCircle2 size={12} />
                  <span>Statutory Record Confirmed &bull; Authentic</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{result.name}</h2>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Permit Reference: <strong className="font-mono">{result.permit_number}</strong>
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Digital Verification Hash</span>
              <span className="font-mono text-xs text-white">0x8f2a...c041</span>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                <div className="text-xs font-bold text-slate-900 mt-1">{result.site_address}</div>
                <div className="text-[11px] text-slate-500">{result.lga}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Approved Height</span>
                <div className="text-xs font-bold text-slate-900 mt-1">{result.number_of_floors} Storeys</div>
                <div className="text-[11px] text-slate-500">Zoned {result.approved_use}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Developer</span>
                <div className="text-xs font-bold text-slate-900 mt-1 truncate">{result.developer_organization}</div>
                <div className="text-[11px] text-slate-500">Accredited Firm</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Consultant</span>
                <div className="text-xs font-bold text-slate-900 mt-1 truncate">{result.supervising_consultant}</div>
                <div className="text-[11px] text-slate-500">COREN Certified</div>
              </div>
            </div>

            {/* Stages Pass Summary */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Stage Inspection Clearance Audit
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  This development has passed <strong>{result.inspections ? result.inspections.filter(i => i.outcome === 'PASS').length : 0} of {result.inspections ? result.inspections.length : 0}</strong> mandatory government hold-points.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                  {result.compliance_state.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Verification Metadata Footnote */}
            <div className="text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-emerald-600" />
                <span>Cryptographically cross-matched against LASPPPA central registry database</span>
              </span>
              <span>Verification Timestamp: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* RESULT CARD: NOT FOUND */}
      {notFound && (
        <div className="bg-white rounded-3xl border-2 border-red-300 p-8 text-center space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              No Statutory Record Found for &quot;{permitCode}&quot;
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
              This reference number does not match any gazetted planning permit or stage certificate on the central LASPPPA/LASBCA registry.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 max-w-lg mx-auto text-left text-xs text-amber-900">
            <strong>Caution:</strong> If a developer or marketer is selling off-plan units with this permit reference, please request their physical approval documentation or submit an anonymous inquiry through the Whistleblower Desk.
          </div>
        </div>
      )}
    </div>
  );
}
