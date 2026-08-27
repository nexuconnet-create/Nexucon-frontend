"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Plus, ArrowRight, GitMerge, FileText, CheckCircle2, User, HardHat, Search, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { ApprovalWorkflow, getApprovalWorkflows } from "@/services/settings";
import CreateWorkflowDrawer from "@/components/dashboard/CreateWorkflowDrawer";

export default function ApprovalWorkflows() {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getApprovalWorkflows();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load workflows", err);
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const getStepIcon = (iconName?: string) => {
    if (!iconName) return ShieldCheck;
    const lower = iconName.toLowerCase();
    if (lower.includes('shield')) return ShieldCheck;
    if (lower.includes('hard') || lower.includes('hat') || lower.includes('engineer')) return HardHat;
    if (lower.includes('search') || lower.includes('engine')) return Search;
    if (lower.includes('alert') || lower.includes('triangle')) return AlertTriangle;
    if (lower.includes('check') || lower.includes('circle')) return CheckCircle2;
    if (lower.includes('file') || lower.includes('doc')) return FileText;
    if (lower.includes('user')) return User;
    return ShieldCheck;
  };

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
          <button 
            onClick={fetchWorkflows}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold"
          >
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
            key={wf.id || idx}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex flex-wrap items-center gap-3">
                  {wf.name}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                    wf.status === 'System Enforced' 
                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {wf.status}
                  </span>
                </h2>
                <span className="text-xs font-mono text-gray-400 mt-1 block">ID: {wf.id}</span>
              </div>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: `Workflow ${wf.name} chain is active and routing applications.`, type: 'info' } 
                  }));
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm hover:bg-gray-50"
              >
                <Settings size={14} /> Edit Chain
              </button>
            </div>

            <div className="p-8">
               <div className="flex flex-col md:flex-row items-center gap-4 relative">
                  {/* Background Line */}
                  <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>

                  {wf.steps?.map((step, sIdx) => {
                     const StepIcon = getStepIcon(step.icon_name);

                     return (
                       <React.Fragment key={step.id || sIdx}>
                          {/* Step Node */}
                          <div className="relative z-10 flex flex-col items-center flex-1">
                             <div className={`w-12 h-12 rounded-2xl bg-white border-4 shadow-sm flex items-center justify-center mb-3 z-10 relative ${
                               wf.status === 'System Enforced' ? 'border-purple-50 text-purple-600' : 'border-blue-50 text-blue-600'
                             }`}>
                                <StepIcon size={20} />
                             </div>
                             <h3 className="text-xs md:text-sm font-bold text-gray-900 text-center mb-1">{step.title}</h3>
                             <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
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
                     );
                  })}
               </div>
            </div>
          </motion.div>
        ))}

        {workflows.length === 0 && !isLoading && (
          <div className="p-12 text-center text-gray-400 text-xs bg-white rounded-3xl border border-gray-100">
            No approval workflows configured.
          </div>
        )}
      </div>

      <CreateWorkflowDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchWorkflows}
      />
    </div>
  );
}
