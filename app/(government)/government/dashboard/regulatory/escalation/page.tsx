"use client";
import React from "react";
import { GitMerge, ArrowRight, ShieldAlert, FileWarning, AlertOctagon, Check } from "lucide-react";

export default function EscalationMatrix() {
  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Regulatory Escalation Matrix</h1>
          <p className="text-gray-500 mt-1">Configure automated compliance enforcement paths.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
        <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
          <GitMerge className="text-blue-500"/> Workflow: Critical Structural Defect
        </h3>
        
        <div className="flex flex-col md:flex-row items-center gap-4 text-center">
          {/* Level 1 */}
          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-6 relative">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2">1</div>
            <FileWarning size={24} className="mx-auto text-blue-600 mb-2"/>
            <h4 className="font-bold text-blue-900">Issue Notice</h4>
            <p className="text-xs text-blue-700 mt-2">To: Contractor<br/>SLA: 48 Hours</p>
          </div>
          
          <ArrowRight className="text-gray-300 hidden md:block shrink-0" size={24}/>
          
          {/* Level 2 */}
          <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-6 relative">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2">2</div>
            <ShieldAlert size={24} className="mx-auto text-amber-600 mb-2"/>
            <h4 className="font-bold text-amber-900">Final Warning</h4>
            <p className="text-xs text-amber-700 mt-2">To: Developer & Contractor<br/>SLA: 24 Hours</p>
          </div>
          
          <ArrowRight className="text-gray-300 hidden md:block shrink-0" size={24}/>
          
          {/* Level 3 */}
          <div className="flex-1 bg-rose-50 border border-rose-200 rounded-xl p-6 relative shadow-sm">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2">3</div>
            <AlertOctagon size={24} className="mx-auto text-rose-600 mb-2"/>
            <h4 className="font-bold text-rose-900">Stop-Work Order</h4>
            <p className="text-xs text-rose-700 mt-2">To: All Stakeholders<br/>Immediate Effect</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-slate-50">
          <h3 className="font-bold text-gray-900">Active Escalation Rules</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { rule: "BIM Clash (Hard) Unresolved > 7 days", action: "Escalate to Developer", active: true },
            { rule: "Failed Concrete Test", action: "Immediate Stop-Work Order", active: true },
            { rule: "Unregistered Worker Detected (LASRRA)", action: "Warning to Contractor", active: true },
          ].map((item, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <h4 className="font-bold text-gray-800">{item.rule}</h4>
                <p className="text-sm text-rose-600 mt-1 font-medium">Action: {item.action}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                  <Check size={14}/> Active
                </span>
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors ml-2">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
