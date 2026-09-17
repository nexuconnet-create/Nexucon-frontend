"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertOctagon,
  ShieldAlert,
  Send,
  CheckCircle2,
  FileText,
  Lock,
  Download,
} from "lucide-react";
import { enqueueSyncItem, computeSHA256 } from "@/lib/offline-sync";

export default function IssueStopWorkOrderPage() {
  const params = useParams();
  const router = useRouter();
  const findingId = (params?.id as string) || "find-001";

  const [orderNumber] = useState(`SWO-2026-0042`);
  const [siteZone, setSiteZone] = useState("Sector 4: Columns C1 - C8 Grid");
  const [legalBasis] = useState("Section 4.2 of the Urban and Regional Planning Safety Law of Lagos State");
  const [inspectorNotes, setInspectorNotes] = useState("Work is hereby ordered halted immediately on all structural casting and vertical loads for Sector 4 until independent non-destructive core testing certifies structural stability.");
  const [isSealing, setIsSealing] = useState(false);
  const [isIssued, setIsIssued] = useState(false);
  const [digitalSealHash, setDigitalSealHash] = useState<string | null>(null);

  const handleIssueOrder = async () => {
    setIsSealing(true);
    const hash = await computeSHA256(`SWO_${orderNumber}_${Date.now()}`);

    enqueueSyncItem({
      type: "SWO",
      title: `STOP-WORK ORDER ${orderNumber} - Eko Atlantic Tower`,
      payload: { findingId, siteZone, legalBasis, inspectorNotes },
      hash: hash,
      timestamp: new Date().toISOString(),
      sizeBytes: 16800,
      source: "FIELD_TERMINAL",
    });

    setTimeout(() => {
      setIsSealing(false);
      setIsIssued(true);
      setDigitalSealHash(hash);
    }, 700);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/inspector/dashboard/findings/${findingId}`)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Finding"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[11px] font-mono text-rose-600 font-bold uppercase">
              STATUTORY ENFORCEMENT ACTION
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#022C4F]">
              ISSUE STOP-WORK ORDER
            </h1>
          </div>
        </div>
      </div>

      {/* SWO Form Terminal */}
      <div className="bg-white rounded-2xl border border-rose-300 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <AlertOctagon size={20} className="text-rose-600" />
            <span className="text-sm font-black text-rose-900 uppercase">
              ORDER REF: {orderNumber}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-rose-600 text-white text-[11px] font-mono font-bold">
            LEGAL ENFORCEMENT
          </span>
        </div>

        <div className="space-y-3.5 text-xs font-mono">
          <div>
            <label className="text-gray-500 block mb-1 font-bold">AFFECTED PROJECT SITE:</label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-gray-900">
              Eko Atlantic Tower - Lekki Phase 1, Lagos
            </div>
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-bold">AFFECTED SITE ZONE / STRUCTURAL SCOPE:</label>
            <input
              type="text"
              value={siteZone}
              onChange={(e) => setSiteZone(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-bold">STATUTORY LEGAL BASIS:</label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-gray-800">
              {legalBasis}
            </div>
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-bold">INSPECTOR FORMAL DIRECTIVE:</label>
            <textarea
              rows={4}
              value={inspectorNotes}
              onChange={(e) => setInspectorNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-gray-900 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Inspector Digital Signature Seal Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Authorized Officer:</span>
              <span className="font-bold text-gray-900">Field Inspector #LAG-INS-042</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Jurisdiction:</span>
              <span className="font-bold text-gray-900">Ikeja North Directorate</span>
            </div>
            {digitalSealHash && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-gray-500 block mb-1">Digital Tamper-Proof Seal:</span>
                <span className="text-[#022C4F] font-bold text-[11px] break-all">
                  {digitalSealHash}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isIssued ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>STOP WORK ORDER ENFORCED &amp; DISPATCHED TO DASHBOARD ✅</span>
              </div>
              <button
                type="button"
                onClick={() => alert("Statutory Stop-Work Notice PDF downloaded.")}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-mono text-[11px] flex items-center gap-1"
              >
                <Download size={13} />
                <span>PDF Notice</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleIssueOrder}
              disabled={isSealing}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock size={15} />
              <span>{isSealing ? "Applying Cryptographic Signature..." : "DISPATCH STATUTORY STOP-WORK ORDER"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
