"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Download,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { verifyPermit, PublicProject } from '@/services/publicPortal';
import { VerificationBadge } from '@/components/transparency/VerificationBadge';
import { ViolationReportModal } from '@/components/transparency/ViolationReportModal';
import { usePtpRoute } from '@/components/transparency/PublicHeader';

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const initialPermit = searchParams.get('permit') || searchParams.get('ref') || '';

  const [inputRef, setInputRef] = useState(initialPermit);
  const [result, setResult] = useState<{
    verified: boolean;
    project?: PublicProject;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { getRoute } = usePtpRoute();

  const samplePermits = [
    { label: 'Ikeja Commercial', ref: 'LASBCA/PRM/2026/0419' },
    { label: 'Eko Atlantic High-Rise', ref: 'LASBCA/PRM/2025/1102' },
    { label: 'Surulere Civic Hub', ref: 'LASBCA/PRM/2026/0188' },
    { label: 'Yaba Suspended Order', ref: 'LASBCA/PRM/2026/0512' },
  ];

  const handleVerify = async (refToTest?: string) => {
    const target = (refToTest || inputRef).trim();
    if (!target) return;
    setLoading(true);
    setResult(null);

    try {
      const outcome = await verifyPermit(target);
      setResult(outcome);
    } catch (e: any) {
      setResult({
        verified: false,
        message: 'Network verification service timeout. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPermit) {
      handleVerify(initialPermit);
    }
  }, [initialPermit]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Statutory Building Authorization Authenticity Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#022C4F]">
          Verify Building Permit
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Instantly verify the authenticity of planning permits, statutory stage approvals, and certified structural filings in Lagos State.
        </p>
      </div>

      {/* Verification Search Box */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="space-y-4"
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Enter Statutory Permit Number or Project Reference
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <FileCheck className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={inputRef}
                onChange={(e) => setInputRef(e.target.value)}
                placeholder="e.g. LASBCA/PRM/2026/0419 or PRJ-IKJ-2026-004"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F]/20 focus:border-[#022C4F]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#022C4F] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verify Authenticity</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Sample Permits */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Try sample permit:</span>
          {samplePermits.map((item) => (
            <button
              key={item.ref}
              type="button"
              onClick={() => {
                setInputRef(item.ref);
                handleVerify(item.ref);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-mono text-[11px] transition-colors"
            >
              {item.ref}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {result.verified && result.project ? (
            <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              {/* Holographic Top Banner */}
              <VerificationBadge
                permitNumber={result.project.permit_number}
                authority={result.project.issuing_authority}
                variant="banner"
              />

              {/* Verified Project Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Project Name</span>
                  <span className="font-bold text-slate-900 text-sm block">{result.project.name}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Approved Height</span>
                  <span className="font-bold text-slate-900 text-sm block">{result.project.number_of_floors} Floors</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">District / LGA</span>
                  <span className="font-bold text-slate-900 text-sm block">{result.project.lga}, Lagos</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Permit Validity</span>
                  <span className="font-bold text-emerald-700 text-sm block">Valid & Active</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Last statutory site audit: <strong>{result.project.last_inspection_date}</strong>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={getRoute(`/transparency/projects/${result.project.slug}`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>View Comprehensive Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-red-300 rounded-3xl p-6 sm:p-8 shadow-lg space-y-5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="inline-block px-2.5 py-0.5 rounded bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
                    Unverified / Unrecognized Record
                  </div>
                  <h3 className="text-xl font-bold text-[#022C4F]">
                    Reference Not Recognized in Statutory Registry
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {result.message}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-xs text-red-800 space-y-2">
                <p className="font-semibold">
                  Notice to Citizens & Prospective Property Buyers:
                </p>
                <p>
                  Any building undergoing physical construction without an authenticated LASBCA planning permit may be structurally unsafe or in violation of zoning setbacks.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <span className="text-xs text-slate-500">Suspect unauthorized construction?</span>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Report Suspected Unauthorized Site</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Citizen Guidance / FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <h4 className="font-bold text-[#022C4F] text-sm">Where is the Permit Number?</h4>
          <p className="text-slate-600 leading-relaxed">
            Statutory permit numbers are displayed prominently on the official yellow LASBCA signboard posted at the main entrance gate of every approved site.
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <h4 className="font-bold text-[#022C4F] text-sm">Anti-Fraud QR Scanning</h4>
          <p className="text-slate-600 leading-relaxed">
            All authentic signboards feature a secure cryptographic QR code linking directly to this official government verification endpoint.
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <h4 className="font-bold text-[#022C4F] text-sm">Anti-Enumeration Safeguards</h4>
          <p className="text-slate-600 leading-relaxed">
            This verification gateway is protected against bulk scraping and automated brute-force attacks via Cloudflare Turnstile and IP rate limiting.
          </p>
        </div>
      </div>

      {/* Violation Tipoff Modal */}
      <ViolationReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-[#022C4F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading verification portal...</span>
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
