"use client";
import React from "react";
import { CheckCircle, AlertTriangle, ShieldCheck, FileText, ChevronRight, Check, X } from "lucide-react";

export default function PermitDecisions() {
  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Permit Decisions & Delegation</h1>
          <p className="text-gray-500 mt-1">Review pending permits with DoA thresholds and conditional requirements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Project 1 - Conditional Approval */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Building Permit</span>
              <h3 className="font-bold text-xl text-gray-900">Riverside Commercial Complex</h3>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Standard Value (₦15M)</div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2"><AlertTriangle size={16}/> Subject To Conditions</h4>
            <p className="text-sm text-amber-800 mb-3">The structural engineer must submit the revised load-bearing calculations for Floor 3 before construction begins.</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-sm font-bold transition-colors">Issue Conditional Approval</button>
              <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-bold transition-colors">Reject</button>
            </div>
          </div>
        </div>

        {/* Project 2 - DoA Escalation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Mega-Project Permit</span>
              <h3 className="font-bold text-xl text-gray-900">Downtown Metro Station</h3>
            </div>
            <div className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold border border-rose-200 flex items-center gap-1">
              <ShieldCheck size={12}/> High Value (₦250M)
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">Delegation of Authority (DoA) Limit Exceeded</h4>
            <p className="text-sm text-slate-600 mb-3">This project exceeds the standard ₦50M threshold. It requires Director-level sign-off before the permit can be issued.</p>
            <button className="w-full bg-[#022C4F] hover:bg-[#033c6c] text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-lg">
              Escalate to Director
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
