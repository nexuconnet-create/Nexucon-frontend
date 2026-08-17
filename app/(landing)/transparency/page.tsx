"use client";

import React from "react";
import { ShieldCheck, FileSearch, Building, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PublicTransparencyPortal() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[40px] font-extrabold text-[#022C4F] leading-tight mb-4">
            Building Trust Through Open Data
          </h2>
          <p className="text-lg text-slate-600">
            Verify building permits, check contractor credentials, and report suspected violations to ensure safety and compliance in your community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Verify Permit */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <FileSearch size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#022C4F] mb-3">Verify a Permit</h3>
            <p className="text-slate-600 text-sm mb-6">
              Enter a permit number or address to verify its authenticity and check the approval status.
            </p>
            <div className="flex gap-2">
              <input type="text" placeholder="e.g., PRM-2026-001" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
              <button className="px-4 py-2 bg-[#022C4F] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">Search</button>
            </div>
          </div>

          {/* Check Credentials */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Building size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#022C4F] mb-3">Contractor Credentials</h3>
            <p className="text-slate-600 text-sm mb-6">
              Search for registered developers, structural engineers, and contractors to ensure they are certified.
            </p>
            <div className="flex gap-2">
              <input type="text" placeholder="Company Name or Reg No." className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Verify</button>
            </div>
          </div>

          {/* Report Violation */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#022C4F] mb-3">Report a Violation</h3>
            <p className="text-slate-600 text-sm mb-6">
              Notice a dangerous construction site or suspected code violation? Report it directly to the agency.
            </p>
            <button className="w-full py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
              Submit an Anonymous Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
