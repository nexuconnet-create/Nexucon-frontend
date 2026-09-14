"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function InspectorCompliancePage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
            Statutory Compliance & Orders
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
            Monitor building regulations compliance, corrective action deadlines, and statutory Stop-Work notices.
          </p>
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 border-l-4 border-l-emerald-500 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#022C4F]">92.4%</div>
              <div className="text-xs text-slate-500">Jurisdiction Compliance Score</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#022C4F]">05</div>
              <div className="text-xs text-slate-500">Active Remediation Plans</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 border-l-4 border-l-rose-500 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#022C4F]">01</div>
              <div className="text-xs text-slate-500">Stop-Work Notice Enforced</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Stop-Work Notice Banner */}
      <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            SWO-2026-0014 &bull; Active Enforcement
          </span>
          <span className="text-xs text-slate-500 font-medium">Issued 3 Days Ago</span>
        </div>
        <h2 className="text-base font-bold text-rose-900">
          🛑 Stop-Work Order: Eko Atlantic Tower D - Sector 4 Transfer Slab
        </h2>
        <p className="text-xs text-rose-800 leading-relaxed max-w-3xl">
          All concrete placement suspended pending re-test of 28-day cylinder compressive strength and non-destructive ultrasonic verification by the state materials testing laboratory.
        </p>
      </div>
    </div>
  );
}
