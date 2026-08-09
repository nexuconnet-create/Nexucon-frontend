"use client";

import React from 'react';
import {
  ArrowUpRight,
  FileText,
  AlertCircle,
  CheckCircle,
  Building2,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import TopRightControls from "@/components/dashboard/TopRightControls";

export default function GovernmentDashboard() {
  const agencyName = 'Lagos State Building Control Agency';
  
  return (
    <div className="h-full flex flex-col pt-2">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-[40px] font-bold text-[#022C4F] leading-tight mb-4">
            Welcome Back, {agencyName}
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Monitor design projects, review pre-construction drawings, collaborate with consultants, and issue regulatory approvals.
          </p>
        </div>
        <TopRightControls />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: "Active Pre-Con Projects", value: "12" },
            { title: "Submissions Under Review", value: "14" },
            { title: "EIA Pending Approval", value: "8" },
            { title: "Ready for Permits", value: "3" }
          ].map((metric, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[#022C4F]/20 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-[15px] font-semibold text-[#022C4F]">{metric.title}</h3>
                <div className="w-8 h-8 rounded-full border border-[#022C4F]/20 flex items-center justify-center text-[#022C4F]">
                  <ArrowUpRight size={16} />
                </div>
              </div>
              <p className="text-[40px] font-bold text-[#022C4F] leading-none">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Recent Submissions & Issues */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#022C4F]">Recent Submissions & Issues</h2>
              <Link href="#" className="text-sm font-medium text-[#022C4F] hover:underline">View All</Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-[#022C4F]/20 p-6 shadow-sm flex flex-col gap-4">
              
              {/* Issue Item */}
              <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-extrabold uppercase rounded-full">Urgent</span>
                    <span className="text-[11px] font-semibold text-slate-500">Due Tomorrow</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#022C4F]">Structural Design Compliance</h4>
                  <p className="text-xs text-slate-600 mt-1">Submitted by: Engr. Okonlawo (Structural) • Lekki Commercial Plaza</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 py-2 border border-[#022C4F]/20 rounded-lg text-xs font-semibold text-[#022C4F] hover:bg-white transition-colors">View Document</button>
                  <button className="flex-1 py-2 bg-[#022C4F] rounded-lg text-xs font-semibold text-white hover:bg-[#033b6a] transition-colors">Review</button>
                </div>
              </div>

              {/* Standard Submission Item */}
              <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase rounded-full">New Submission</span>
                    <span className="text-[11px] font-semibold text-slate-500">Submitted 2h ago</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#022C4F]">Zoning & Setback Verification</h4>
                  <p className="text-xs text-slate-600 mt-1">Submitted by: David Johnson (Architect) • Harmony Business Complex</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 py-2 border border-[#022C4F]/20 rounded-lg text-xs font-semibold text-[#022C4F] hover:bg-white transition-colors">View Document</button>
                  <button className="flex-1 py-2 bg-[#022C4F] rounded-lg text-xs font-semibold text-white hover:bg-[#033b6a] transition-colors">Review</button>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Execution-Ready Projects */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#022C4F]">Permit-Ready Projects</h2>
              <Link href="#" className="text-sm font-medium text-[#022C4F] hover:underline">View All Projects</Link>
            </div>

            <div className="bg-white rounded-2xl border border-[#022C4F]/20 p-6 shadow-sm flex flex-col">
              
              <div className="flex flex-col gap-0 divide-y divide-slate-100">
                {/* Project Item */}
                <div className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#022C4F]/10 flex items-center justify-center text-[#022C4F]">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#022C4F]">Lekki Commercial Plaza</h4>
                      <p className="text-xs text-slate-500">Victoria Island, Lagos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="px-2 py-1 bg-[#84CC16]/20 text-[#65A30D] rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">Approved</span>
                      <span className="text-[10px] font-semibold text-slate-500">100% Ready</span>
                    </div>
                    <button className="text-slate-400 hover:text-[#022C4F] p-2">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Project Item */}
                <div className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#022C4F]/10 flex items-center justify-center text-[#022C4F]">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#022C4F]">Green Valley Apartments</h4>
                      <p className="text-xs text-slate-500">Ikeja, Lagos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">In Review</span>
                      <span className="text-[10px] font-semibold text-slate-500">60% Ready</span>
                    </div>
                    <button className="text-slate-400 hover:text-[#022C4F] p-2">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Project Item */}
                <div className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#022C4F]/10 flex items-center justify-center text-[#022C4F]">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#022C4F]">Harmony Business Complex</h4>
                      <p className="text-xs text-slate-500">Port Harcourt, Rivers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="px-2 py-1 bg-[#84CC16]/20 text-[#65A30D] rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">Approved</span>
                      <span className="text-[10px] font-semibold text-slate-500">100% Ready</span>
                    </div>
                    <button className="text-slate-400 hover:text-[#022C4F] p-2">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              <button className="mt-4 w-full py-3 rounded-lg border border-[#022C4F] text-sm font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">
                View Execution Schedule
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
