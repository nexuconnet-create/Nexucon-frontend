"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Box, 
  FileText, 
  Radio, 
  Sparkles, 
  Share2, 
  ArrowRight, 
  Clock, 
  Calendar,
  User,
  ShieldAlert,
  Send,
  Download
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DigitalEyeFinding, escalateFindingToNCR } from "@/services/digitalEye";

interface FindingDetailDrawerProps {
  finding: DigitalEyeFinding | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function FindingDetailDrawer({
  finding,
  isOpen,
  onClose,
  onRefresh
}: FindingDetailDrawerProps) {
  const { hasPermission } = useAuth();
  const [isEscalating, setIsEscalating] = useState(false);
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [isSubmittingNCR, setIsSubmittingNCR] = useState(false);

  if (!isOpen || !finding) return null;

  const handleEscalateNCR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctiveAction.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Please provide recommended corrective actions for the NCR.", type: "error" }
      }));
      return;
    }

    setIsSubmittingNCR(true);
    try {
      const res = await escalateFindingToNCR(finding.id, {
        corrective_action: correctiveAction,
        deadline_days: 14
      });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Escalated to Statutory Non-Conformance Report (${res.ncr_reference})!`, type: "success" }
      }));
      setIsEscalating(false);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Failed to escalate finding to NCR", type: "error" }
      }));
    } finally {
      setIsSubmittingNCR(false);
    }
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case "CRITICAL": return "bg-rose-100 text-rose-800 border-rose-200";
      case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 bg-[#022C4F] text-white flex items-center justify-between border-b border-blue-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-300 border border-rose-400/30">
                <AlertTriangle size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                  Technical Defect Record
                </span>
                <h2 className="text-lg font-bold">{finding.finding_reference}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Title & Severity Badge */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getSeverityStyle(finding.severity)}`}>
                  {finding.severity} Severity
                </span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  AI Confidence: {finding.confidence_score}%
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                  {finding.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-snug">{finding.title}</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{finding.description}</p>
            </div>

            {/* Anchored BIM & Structural Element Context */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Box size={14} className="text-[#022C4F]" />
                Structural BIM Anchor
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Project:</span>
                  <span className="font-semibold text-gray-800">{finding.project_name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Element:</span>
                  <span className="font-semibold text-gray-800">{finding.structural_element_name || "Unassigned"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block">IFC GUID:</span>
                  <span className="font-mono text-gray-700">{finding.structural_element_guid || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Photographic Evidence */}
            {finding.evidence_photos && finding.evidence_photos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Photographic Evidence
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {finding.evidence_photos.map((url, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-video bg-gray-100 relative group">
                      <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Escalation to Statutory NCR Form */}
            {isEscalating ? (
              <form onSubmit={handleEscalateNCR} className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-rose-600" />
                  Escalate to Formal Non-Conformance Report (NCR)
                </h4>
                <p className="text-xs text-rose-700">
                  This will generate a formal regulatory NCR ticket, notifying the developer, structural consultant, and lead inspector.
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Prescribed Corrective Action / Remediations:
                  </label>
                  <textarea
                    rows={3}
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                    placeholder="e.g. Core compression re-test, structural consultant load recalculation, or epoxy injection grouting."
                    className="w-full p-3 bg-white border border-rose-300 rounded-xl text-xs text-gray-800 outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEscalating(false)}
                    className="px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNCR}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{isSubmittingNCR ? "Issuing..." : "Issue Statutory NCR"}</span>
                  </button>
                </div>
              </form>
            ) : null}
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Exported BCF Issue XML topic for ${finding.finding_reference}`, type: "success" } }))}
              className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Share2 size={15} />
              <span>Export Trimble BCF</span>
            </button>

            {finding.status !== "CONVERTED_TO_NCR" && !isEscalating && hasPermission("inspections.create") && (
              <button
                onClick={() => setIsEscalating(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-900/20 transition-all cursor-pointer"
              >
                <ShieldAlert size={15} />
                <span>Escalate to NCR</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
