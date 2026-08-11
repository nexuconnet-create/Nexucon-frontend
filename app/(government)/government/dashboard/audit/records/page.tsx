"use client";
import React from "react";
import { ShieldCheck, History, Search, FileText, CheckCircle, Lock } from "lucide-react";

export default function AuditRecords() {
  const records = [
    { id: "AUD-991", action: "Stop-Work Order Issued", user: "T. Bakare", project: "Downtown Metro", date: "Oct 10, 2026 14:22", hash: "8f4e2c9...b1a", valid: true },
    { id: "AUD-992", action: "Conditional Permit Approved", user: "SysAdmin", project: "Riverside Complex", date: "Oct 11, 2026 09:15", hash: "3a9c1d5...e7f", valid: true },
    { id: "AUD-993", action: "BIM Model Certified", user: "S. Jenkins", project: "Highway Bridge A4", date: "Oct 12, 2026 11:40", hash: "7c2b4a1...d8c", valid: true },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Tamper-Proof Audit Trail</h1>
          <p className="text-gray-500 mt-1">Cryptographically hashed system logs for evidential compliance.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
          <ShieldCheck size={18} />
          <span className="font-medium">Verify Hash Chain</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 w-64" />
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
              <th className="py-4 px-6 font-semibold">Log ID</th>
              <th className="py-4 px-6 font-semibold">Action</th>
              <th className="py-4 px-6 font-semibold">Actor / Project</th>
              <th className="py-4 px-6 font-semibold">Timestamp</th>
              <th className="py-4 px-6 font-semibold">SHA-256 Hash</th>
              <th className="py-4 px-6 font-semibold text-right">Integrity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50 transition-colors font-mono text-sm">
                <td className="py-4 px-6 text-slate-500">{rec.id}</td>
                <td className="py-4 px-6 font-medium text-slate-900">{rec.action}</td>
                <td className="py-4 px-6 text-slate-600">{rec.user}<br/><span className="text-xs text-slate-400">{rec.project}</span></td>
                <td className="py-4 px-6 text-slate-500">{rec.date}</td>
                <td className="py-4 px-6 text-blue-600 bg-blue-50/50 rounded inline-block mt-3 px-2 py-1">{rec.hash}</td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                    <Lock size={12}/> Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
