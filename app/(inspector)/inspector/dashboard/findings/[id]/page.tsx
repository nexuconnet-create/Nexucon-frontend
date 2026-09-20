"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Calendar,
  Layers,
  FileText,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function FindingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const findingId = (params?.id as string) || "find-001";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/inspector/dashboard/findings")}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Findings"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[11px] font-mono text-gray-400 font-bold uppercase">
              TECHNICAL ANALYSIS &bull; DEFECT DOSSIER
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#022C4F]">
              FINDING DOSSIER: {findingId.toUpperCase()}
            </h1>
          </div>
        </div>

        <Link
          href={`/inspector/dashboard/findings/${findingId}/swo`}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <AlertOctagon size={15} />
          <span>ISSUE STOP WORK ORDER</span>
        </Link>
      </div>

      {/* Primary Finding Card */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-mono font-black uppercase">
              HIGH SEVERITY
            </span>
            <span className="text-xs font-mono text-gray-400">REF: FND-2026-0042</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            STATUS: ACTIVE / UNRESOLVED
          </span>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Structural Deviation &gt;10mm on Column C4 (Sector 4)
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Laser scan and digital plumb checks indicate Column C4 possesses a 14.2mm lateral displacement over 3.2m height. This exceeds the statutory 10mm tolerance defined under Section 4.2 of the Lagos State Urban and Regional Planning Board Structural Safety Regulations.
          </p>
        </div>

        {/* Evidence & Hash Info */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-gray-500">Project:</span>
            <span className="font-bold text-gray-900">Eko Atlantic Tower - Sector 4</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Location Coordinate:</span>
            <span className="font-bold text-gray-900">6.428100° N, 3.421900° E</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Logged By:</span>
            <span className="font-bold text-gray-900">Inspector Badge #LAG-INS-042</span>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-gray-500 block mb-1">Cryptographic Evidence Checksum:</span>
            <span className="font-bold text-[#022C4F] break-all">
              a3f5b8c2d1e4f7a9b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3
            </span>
          </div>
        </div>

        {/* Escalation Button */}
        <div className="pt-2">
          <Link
            href={`/inspector/dashboard/findings/${findingId}/swo`}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <ShieldAlert size={16} />
            <span>Escalate To Formal Stop-Work Order (SWO)</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
