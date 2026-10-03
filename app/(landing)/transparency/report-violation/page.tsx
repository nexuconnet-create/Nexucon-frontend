"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ShieldCheck,
  Send,
  MapPin,
  Camera,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Loader2,
  FileCheck
} from 'lucide-react';
import { submitCitizenViolationReport, ViolationReportResponse } from '@/services/publicPortal';
import { usePtpRoute } from '@/components/transparency/PublicHeader';

export default function ReportViolationPage() {
  const [violationType, setViolationType] = useState('UNPERMITTED_CONSTRUCTION');
  const [address, setAddress] = useState('');
  const [lga, setLga] = useState('Ikeja');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ViolationReportResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const { getRoute } = usePtpRoute();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !description.trim()) {
      setErrorMsg('Please specify the site address and provide a description of the observed violation.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await submitCitizenViolationReport({
        violation_type: violationType,
        address: `${address}, ${lga}, Lagos`,
        lga,
        description,
        reporter_name: reporterName || undefined,
        reporter_contact: reporterContact || undefined,
        evidence_url: evidenceFileName ? `https://storage.nexucon.net/evidence/${evidenceFileName}` : undefined,
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setAddress('');
    setDescription('');
    setReporterName('');
    setReporterContact('');
    setEvidenceFileName('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <Link
          href={getRoute('/transparency')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#022C4F] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Portal Home</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          <span>Citizen Regulatory Whistleblower & Tipoff Channel</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#022C4F]">
          Report Suspected Building Violation
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
          Help protect our communities from building collapse and unauthorized developments. Submit confidential reports directly to the Lagos State Building Control Agency (LASBCA) Zonal Enforcement Taskforce.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-md">
        {result ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[#022C4F]">
              Violation Report Dispatched Successfully
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your report has been assigned an official regulatory tracking reference. A Zonal Field Inspector has been notified to conduct a physical verification of the site.
            </p>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left max-w-sm mx-auto space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tracking Reference:</span>
                <span className="font-mono font-bold text-[#022C4F] text-sm">{result.tracking_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Regulatory Status:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Queued for Site Audit
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Timestamp:</span>
                <span className="text-slate-700">{new Date(result.reported_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                Submit Another Report
              </button>
              <Link
                href={getRoute('/transparency')}
                className="px-6 py-2.5 rounded-xl bg-[#022C4F] hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Return to Portal
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs text-slate-700">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Observed Violation Type <span className="text-red-500">*</span>
              </label>
              <select
                value={violationType}
                onChange={(e) => setViolationType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 text-sm focus:outline-none focus:border-red-600"
              >
                <option value="UNPERMITTED_CONSTRUCTION">Construction Without Approved Building Planning Permit</option>
                <option value="STRUCTURAL_DEFECTS">Severe Structural Distress, Cracking, Tilting, or Subsidence</option>
                <option value="ADDITIONAL_VERTICAL_FLOORS">Adding Unapproved Additional Floors Beyond Approved Heights</option>
                <option value="ENCROACHMENT_DRAINAGE">Encroachment on Drainage Canals or Public Road Setbacks</option>
                <option value="WORKING_UNDER_STOP_WORK">Defying an Active LASBCA Stop-Work Order</option>
                <option value="UNSAFE_SCAFFOLDING">Unsafe Scaffolding / Fall Hazard to Neighboring Homes</option>
              </select>
            </div>

            {/* Address & LGA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Site Street Address / Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot 15, Admiralty Way, beside First Bank"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Local Government Area (LGA) <span className="text-red-500">*</span>
                </label>
                <select
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm focus:outline-none focus:border-red-600"
                >
                  <option value="Ikeja">Ikeja</option>
                  <option value="Eti-Osa">Eti-Osa (VI / Lekki / Ikoyi)</option>
                  <option value="Lagos Mainland">Lagos Mainland (Yaba / Ebute Metta)</option>
                  <option value="Surulere">Surulere</option>
                  <option value="Lagos Island">Lagos Island</option>
                  <option value="Ibeju-Lekki">Ibeju-Lekki</option>
                  <option value="Alimosho">Alimosho</option>
                  <option value="Kosofe">Kosofe</option>
                  <option value="Apapa">Apapa</option>
                  <option value="Badagry">Badagry</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Detailed Description of Concern <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you noticed (e.g. casting columns without LASBCA yellow board, deep cracks appearing in adjacent compound fence, construction ongoing past midnight)..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Evidence Photo Upload */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Attach Supporting Photo / Document (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors">
                  <Camera className="w-4 h-4 text-slate-600" />
                  <span>Upload Site Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEvidenceFileName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
                {evidenceFileName && (
                  <span className="text-xs text-emerald-700 font-semibold truncate">
                    ✓ Attached: {evidenceFileName}
                  </span>
                )}
              </div>
            </div>

            {/* Confidential Reporter Details */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-slate-600 text-xs">
                  Reporter Contact Information (Optional)
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> 100% Confidential
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Under the Lagos State Public Safety Protection Protocol, citizen identities are never disclosed to site owners or contractors.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Your Full Name (Optional)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm"
                />
                <input
                  type="text"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="Phone Number or Email (Optional)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold tracking-wide transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting to LASBCA Enforcement...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Anonymous Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
