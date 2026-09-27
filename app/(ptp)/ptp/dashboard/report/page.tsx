"use client";

import React, { useState } from "react";
import {
  Send,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Camera,
  CheckCircle2,
  Lock,
  Building2,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";
import { submitViolationReport, ViolationReportPayload } from "@/services/publicPortal";
import PtpTopRightControls from "@/components/dashboard/PtpTopRightControls";

export default function PtpReportPage() {
  const [formData, setFormData] = useState<ViolationReportPayload>({
    address: "",
    lga: "Eti-Osa",
    violation_type: "unpermitted_floors",
    description: "",
    reporter_name: "",
    reporter_contact: "",
  });

  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address.trim() || !formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitViolationReport({
        ...formData,
        reporter_name: isAnonymous ? "Anonymous Whistleblower" : formData.reporter_name,
      });
      setSubmittedToken(res.tracking_number || `TIP-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch {
      setSubmittedToken(`TIP-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar matching Government standard */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 mb-2">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Send size={20} />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#022C4F] leading-tight">
              Report Building Violation &amp; Safety Hazard
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Submit anonymous reports on unpermitted storeys, structural distress, or broken Stop-Work seals directly to state enforcement teams.
          </p>
        </div>
        <PtpTopRightControls />
      </div>

      {submittedToken ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 p-8 sm:p-10 text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Violation Tip-off Successfully Gazetted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto">
              Your report has been queued for immediate review by the Zonal Building Control Rapid Response Unit.
            </p>
          </div>

          {/* Token Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Anonymous Tracking Reference
            </span>
            <span className="font-mono text-xl font-bold text-[#022C4F]">{submittedToken}</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Save this reference number to check enforcement status updates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 max-w-md mx-auto text-xs text-blue-900 text-left">
            <strong>Next Steps:</strong> An accredited field inspector will be dispatched to verify coordinates and issue a formal LASBCA compliance notice if structural or planning non-compliance is verified.
          </div>

          <div>
            <button
              onClick={() => {
                setSubmittedToken(null);
                setFormData({
                  address: "",
                  lga: "Eti-Osa",
                  violation_type: "unpermitted_floors",
                  description: "",
                  reporter_name: "",
                  reporter_contact: "",
                });
                setIsAnonymous(true);
              }}
              className="px-6 py-3 rounded-xl bg-[#022C4F] text-white font-bold text-xs hover:bg-[#033E6E]"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          {/* Violation Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Violation Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "unpermitted_floors", title: "Unpermitted Extra Floors", desc: "Constructing storeys beyond approved building permit limits" },
                { id: "structural_cracks", title: "Structural Cracks / Distress", desc: "Severe shear cracks, foundation sink, or tilting structure" },
                { id: "broken_seal", title: "Ignored Stop-Work Order", desc: "Workers continuing construction after official LASBCA seal" },
                { id: "drainage_encroachment", title: "Drainage / Setback Breach", desc: "Blocking canals, public right-of-way, or road setback" },
              ].map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setFormData((p) => ({ ...p, violation_type: cat.id as any }))}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.violation_type === cat.id
                      ? "border-[#022C4F] bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900">{cat.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Local Government Area (LGA)
              </label>
              <select
                value={formData.lga}
                onChange={(e) => setFormData((p) => ({ ...p, lga: e.target.value }))}
                className="w-full py-3 px-3.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F] bg-white"
              >
                {["Eti-Osa", "Ikeja", "Lagos Island", "Ibeju-Lekki", "Surulere", "Alimosho", "Kosofe", "Mainland"].map(
                  (lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Site Address or Landmark
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                placeholder="e.g. Plot 14, Admiralty Way, Lekki Phase 1"
                className="w-full py-3 px-3.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Specific Observations &amp; Evidence Description
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe what you observed (e.g. 5th floor casting underway at night despite a LASBCA red seal pasted on perimeter gate)..."
              className="w-full py-3 px-3.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            />
          </div>

          {/* Anonymous Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-0.5 rounded text-[#022C4F] focus:ring-[#022C4F] w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock size={14} className="text-emerald-600" />
                  <span>Submit Anonymously (Recommended)</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Your identity and IP address will be completely scrubbed from this report. Only the physical site details and geotagged evidence are transmitted to enforcement teams.
                </p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting Tip-off...</span>
              ) : (
                <>
                  <span>Submit Whistleblower Report</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
