"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings, Save, Plus, ArrowRight, GitMerge, FileText, CheckCircle2, User, HardHat, Search, AlertTriangle, ShieldCheck } from "lucide-react";

export default function ApprovalWorkflows() {
  const workflows = [
    {
      id: "WF-00-MASTER",
      name: "Master Building Collapse Prevention Pipeline",
      status: "System Enforced",
      steps: [
        { title: "Approval & Permit Gate", role: "Agency Approvers", icon: ShieldCheck },
        { title: "Construction Oversight", role: "Inspectors & Digital Eye", icon: HardHat },
        { title: "Deviation Detection", role: "Automated Engine", icon: Search },
        { title: "Action & Stop-Work", role: "System Escalation", icon: AlertTriangle },
        { title: "Corrective Verification", role: "Review Board", icon: CheckCircle2 }
      ]
    },
    {
      id: "WF-01",
      name: "Standard Foundation Permit",
      status: "Active",
      steps: [
        { title: "Initial Submission", role: "Developer/Contractor", icon: FileText },
        { title: "Technical Review", role: "Structural Engineer", icon: HardHat },
        { title: "Final Sign-off", role: "City Planner", icon: CheckCircle2 }
      ]
    },
    {
      id: "WF-02",
      name: "High-Rise Environmental Clearance",
      status: "Active",
      steps: [
        { title: "Acoustic Report", role: "Environmental Consultant", icon: FileText },
        { title: "Public Hearing Review", role: "City Board", icon: User },
        { title: "Final Authorization", role: "Director", icon: CheckCircle2 }
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <GitMerge className="text-blue-500" />
            Approval Workflows
          </h1>
          <p className="text-gray-500 mt-1">Configure automated routing and sign-off chains for permits and documents.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <Plus size={16} />
            Create Workflow
          </button>
        </div>
      </div>

      <div className="space-y-6 max-w-5xl">
        {workflows.map((wf, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={wf.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex flex-wrap items-center gap-3">
                  {wf.name}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    wf.status === 'System Enforced' 
                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {wf.status}
                  </span>
                </h2>
                <span className="text-xs font-mono text-gray-400 mt-1 block">ID: {wf.id}</span>
              </div>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50">
                <Settings size={14} /> Edit Chain
              </button>
            </div>

            <div className="p-8">
               <div className="flex flex-col md:flex-row items-center gap-4 relative">
                  {/* Background Line */}
                  <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>

                  {wf.steps.map((step, sIdx) => (
                     <React.Fragment key={sIdx}>
                        {/* Step Node */}
                        <div className="relative z-10 flex flex-col items-center flex-1">
                           <div className={`w-12 h-12 rounded-full bg-white border-4 shadow-sm flex items-center justify-center mb-3 z-10 relative ${
                             wf.status === 'System Enforced' ? 'border-purple-50 text-purple-600' : 'border-blue-50 text-blue-600'
                           }`}>
                              <step.icon size={20} />
                           </div>
                           <h3 className="text-xs md:text-sm font-bold text-gray-900 text-center mb-1">{step.title}</h3>
                           <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                              {step.role}
                           </p>
                        </div>
                        
                        {/* Connector Arrow (Mobile only) */}
                        {sIdx < wf.steps.length - 1 && (
                           <div className="md:hidden text-gray-300 py-2">
                              <ArrowRight size={20} className="rotate-90" />
                           </div>
                        )}
                     </React.Fragment>
                  ))}
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
