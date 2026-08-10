"use client";

import React, { useState } from "react";
import { 
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  ArrowUpRight,
  Search
} from "lucide-react";

export default function ComplianceCheckPage() {
  const [filter, setFilter] = useState("all");

  const complianceChecks = [
    { id: "CHK-001", element: "Rebar Spacing (Zone A)", rule: "Spacing ≤ 200mm", measured: "195mm", status: "pass", confidence: "98%" },
    { id: "CHK-002", element: "Rebar Spacing (Zone B)", rule: "Spacing ≤ 200mm", measured: "215mm", status: "fail", confidence: "95%" },
    { id: "CHK-003", element: "Beam Depth (B2)", rule: "Design ±10mm (450mm)", measured: "458mm", status: "pass", confidence: "92%" },
    { id: "CHK-004", element: "Beam Depth (B4)", rule: "Design ±10mm (450mm)", measured: "435mm", status: "fail", confidence: "96%" },
    { id: "CHK-005", element: "Column Verticality (C4)", rule: "Plumbness ≤ H/500", measured: "+45mm", status: "fail", confidence: "99%" },
    { id: "CHK-006", element: "Slab Thickness (L3)", rule: "Design -5mm, +10mm", measured: "+4mm", status: "pass", confidence: "94%" },
    { id: "CHK-007", element: "Formwork Alignment", rule: "Plane Fit Dev ≤ 10mm", measured: "8mm", status: "pass", confidence: "91%" },
  ];

  const filteredChecks = complianceChecks.filter(c => {
    if (filter === 'pass') return c.status === 'pass';
    if (filter === 'fail') return c.status === 'fail';
    return true;
  });

  const passCount = complianceChecks.filter(c => c.status === 'pass').length;
  const failCount = complianceChecks.filter(c => c.status === 'fail').length;

  return (
    <div className="w-full h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={32} />
            Automated Compliance Check
          </h1>
          <p className="text-gray-500 mt-1">
            Phase 3: AI-driven verification of structural elements against regulatory and design tolerances using fused SLAM+GNSS data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors font-medium flex items-center gap-2 shadow-sm">
            <Download size={18} /> Issue Compliance Certificate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Checks</p>
            <p className="text-2xl font-bold text-[#022C4F]">{complianceChecks.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Passed Tolerances</p>
            <p className="text-2xl font-bold text-emerald-600">{passCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Failed / Non-Compliant</p>
            <p className="text-2xl font-bold text-red-600">{failCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-[#022C4F] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              All Checks
            </button>
            <button 
              onClick={() => setFilter('pass')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              Passed Only
            </button>
            <button 
              onClick={() => setFilter('fail')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'fail' ? 'bg-red-100 text-red-700' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              Failed Only
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search elements..." 
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]/20 transition-all"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Element / ID</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tolerance Rule</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Measured Value</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Confidence</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChecks.map((check) => (
                <tr key={check.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-bold text-[#022C4F]">{check.element}</div>
                    <div className="text-xs text-slate-500">{check.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{check.rule}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-bold ${check.status === 'fail' ? 'text-red-600' : 'text-[#022C4F]'}`}>
                      {check.measured}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {check.status === 'pass' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle size={14} /> Pass
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                        <XCircle size={14} /> Fail
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-slate-500">{check.confidence}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 justify-end w-full">
                      View Scan <ArrowUpRight size={14} />
                    </button>
                    {check.status === 'fail' && (
                      <button className="text-red-600 hover:text-red-800 text-xs font-bold mt-1 text-right w-full">
                        Flag for Stop-Work
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
