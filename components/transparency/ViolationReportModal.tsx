"use client";

import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, MapPin, Camera, CheckCircle2, X, Loader2, Send } from 'lucide-react';
import { submitCitizenViolationReport, ViolationReportResponse } from '@/services/publicPortal';

interface ViolationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAddress?: string;
  defaultLga?: string;
}

export const ViolationReportModal: React.FC<ViolationReportModalProps> = ({
  isOpen,
  onClose,
  defaultAddress = '',
  defaultLga = 'Ikeja',
}) => {
  const [violationType, setViolationType] = useState('UNPERMITTED_CONSTRUCTION');
  const [address, setAddress] = useState(defaultAddress);
  const [lga, setLga] = useState(defaultLga);
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<ViolationReportResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !description.trim()) {
      setErrorMsg('Please specify the site address and describe the observed violation.');
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
      setSubmittedData(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setAddress('');
    setDescription('');
    setReporterName('');
    setReporterContact('');
    setEvidenceFileName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Report Suspected Building Violation
              </h4>
              <p className="text-xs text-red-100">
                Official Regulatory Taskforce Tipoff Channel &bull; Anonymous by Default
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-red-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {submittedData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#022C4F]">
                Violation Report Registered
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for contributing to public safety. Your report has been dispatched to the Zonal Regulatory Enforcement Directorate.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tracking Reference:</span>
                  <span className="font-mono font-bold text-[#022C4F]">{submittedData.tracking_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Queued for Site Visit
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Logged:</span>
                  <span className="text-slate-700">{new Date(submittedData.reported_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-[#022C4F] hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Violation Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-red-600"
                >
                  <option value="UNPERMITTED_CONSTRUCTION">Construction Without Approved Planning Permit</option>
                  <option value="STRUCTURAL_DEFECTS">Severe Structural Cracks, Tilting, or Subsidence</option>
                  <option value="ADDITIONAL_VERTICAL_FLOORS">Building Additional Floors Beyond Approved Drawings</option>
                  <option value="ENCROACHMENT_DRAINAGE">Encroachment on Drainage Channel or Public Road Setback</option>
                  <option value="WORKING_UNDER_STOP_WORK">Defying an Active LASBCA Stop-Work Order</option>
                  <option value="UNSAFE_SCAFFOLDING">Dangerous Scaffolding / Fall Hazard to Public</option>
                </select>
              </div>

              {/* Address & LGA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Site Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 12, Adeola Odeku St"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Local Government Area (LGA) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:border-red-600"
                  >
                    <option value="Ikeja">Ikeja</option>
                    <option value="Eti-Osa">Eti-Osa (Victoria Island / Lekki)</option>
                    <option value="Lagos Mainland">Lagos Mainland (Yaba / Ebute Metta)</option>
                    <option value="Surulere">Surulere</option>
                    <option value="Lagos Island">Lagos Island</option>
                    <option value="Ibeju-Lekki">Ibeju-Lekki</option>
                    <option value="Alimosho">Alimosho</option>
                    <option value="Kosofe">Kosofe</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description of Hazard / Violation <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you observed (e.g. building vibrating, worker casting 5th floor without signboard, no rebar cover, night concrete pouring without supervision)..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Simulated Photo Upload */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Attach Photo Evidence (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors">
                    <Camera className="w-4 h-4 text-slate-600" />
                    <span>Choose Photo / Snapshot</span>
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
                    <span className="text-xs text-emerald-700 font-medium truncate">
                      ✓ {evidenceFileName}
                    </span>
                  )}
                </div>
              </div>

              {/* Optional Confidential Contact Info */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Reporter Identity (Optional & 100% Confidential)
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Anonymous by Default
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                  />
                  <input
                    type="text"
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    placeholder="Phone or Email (Optional)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to Taskforce...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Violation Tipoff</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
