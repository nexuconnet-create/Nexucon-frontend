"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  downloadArchivedReportOriginal,
  verifyArchivedReport,
  type ReportVerification,
} from "@/services/digitalEye";
import {
  createDocumentAccessRequest,
  checkDocumentAccessStatus,
} from "@/services/documents";
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  FileText,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  Search,
  Sparkles,
  ExternalLink,
  Shield,
  HelpCircle
} from "lucide-react";

/**
 * PUBLIC report verification page with Statutory Access Control.
 *
 * Scanned QR codes resolve here. The page verifies cryptographic authenticity
 * (reference, content digest, checksum, test counts, compliance grade).
 *
 * Under statutory records policy, direct download of certified PDF dossiers
 * is gated on an official Access Request approved by the supervising government agency.
 */
function VerifyReportContent() {
  const params = useSearchParams();
  const ref = (params.get("ref") || "").trim();
  const digest = (params.get("digest") || "").trim();
  const queryToken = (params.get("token") || "").trim();

  const [result, setResult] = useState<ReportVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Access Request & Governance State
  const [activeAccessTab, setActiveAccessTab] = useState<"request" | "check">("request");
  const [approvedToken, setApprovedToken] = useState<string | null>(queryToken || null);
  const [hasApprovedAccess, setHasApprovedAccess] = useState(false);
  const [approvalInfo, setApprovalInfo] = useState<{
    requesterName?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    notes?: string;
  } | null>(null);

  // Request form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    role: "Structural Engineer / Consultant",
    purpose: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);

  // Status check query state
  const [statusCheckInput, setStatusCheckInput] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusCheckMessage, setStatusCheckMessage] = useState<{ type: "success" | "pending" | "rejected" | "error"; text: string } | null>(null);

  const run = useCallback(async () => {
    if (!ref || !digest) {
      setResult({
        verified: false,
        detail:
          "This link is missing the report reference or content digest encoded in the report's QR code.",
      });
      setLoading(false);
      return;
    }
    try {
      const data = await verifyArchivedReport(ref, digest);
      setResult(data);

      // If query token was passed, check status immediately
      if (queryToken) {
        try {
          const statusRes = await checkDocumentAccessStatus({ token: queryToken, digest });
          if (statusRes.is_approved) {
            setHasApprovedAccess(true);
            setApprovedToken(queryToken);
            setApprovalInfo({
              requesterName: statusRes.requester_name,
              reviewedAt: statusRes.reviewed_at,
              notes: statusRes.review_notes,
            });
          }
        } catch (e) {
          console.warn("Could not verify initial token", e);
        }
      }
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        (err as Error)?.message ||
        "Verification could not be completed.";
      setResult({ verified: false, detail });
    } finally {
      setLoading(false);
    }
  }, [ref, digest, queryToken]);

  useEffect(() => {
    run();
  }, [run]);

  const complianceBadge = (status?: string) => {
    switch (status) {
      case "COMPLIANT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "FLAGGED_DEFECTS":
        return "bg-red-50 text-red-700 border-red-200";
      case "NOT_ASSESSED":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  /** Handle official access request submission */
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.organization.trim()) {
      alert("Please fill in your name, email, and organization.");
      return;
    }

    setIsSubmitting(true);
    setDownloadError(null);
    try {
      const req = await createDocumentAccessRequest({
        report_reference: ref,
        report_digest: digest,
        document_title: result?.title || "Statutory NDT Report",
        requester_name: formData.name.trim(),
        requester_email: formData.email.trim(),
        requester_phone: formData.phone.trim(),
        requester_organization: formData.organization.trim(),
        requester_role: formData.role,
        purpose: formData.purpose.trim() || "Statutory compliance and technical verification.",
      });

      setSubmissionSuccess(req);
      if (req.status === "APPROVED") {
        setHasApprovedAccess(true);
        setApprovedToken(req.access_token);
      }
    } catch (err: any) {
      console.error("Access request failed", err);
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Failed to submit access request.";
      setDownloadError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Handle manual status lookup by email or token */
  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusCheckInput.trim()) return;

    setIsCheckingStatus(true);
    setStatusCheckMessage(null);
    try {
      const query = statusCheckInput.trim();
      const isEmail = query.includes("@");
      const res = await checkDocumentAccessStatus(
        isEmail ? { email: query, digest } : { token: query, digest }
      );

      if (!res.found) {
        setStatusCheckMessage({
          type: "error",
          text: "No access request found for this record. Please check the email or submit a new request.",
        });
      } else if (res.status === "APPROVED") {
        setHasApprovedAccess(true);
        setApprovedToken(res.access_token || null);
        setApprovalInfo({
          requesterName: res.requester_name,
          reviewedAt: res.reviewed_at,
          notes: res.review_notes,
        });
        setStatusCheckMessage({
          type: "success",
          text: "Access Granted! Your request has been approved by the supervising authority.",
        });
      } else if (res.status === "REJECTED") {
        setStatusCheckMessage({
          type: "rejected",
          text: `Access Request Rejected: ${res.review_notes || "Under statutory document governance, this request was not authorized."}`,
        });
      } else {
        setStatusCheckMessage({
          type: "pending",
          text: "Your access request is currently PENDING review by the supervising government agency.",
        });
      }
    } catch (err: any) {
      setStatusCheckMessage({
        type: "error",
        text: err?.response?.data?.detail || "Could not check request status.",
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  /** Fetch the authentic archived original using approved token */
  const handleDownload = useCallback(async () => {
    if (!ref || !digest) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await downloadArchivedReportOriginal(ref, digest, approvedToken || undefined);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ndt_report_${(ref || "archived").replace(/[\\/:*?"<>|]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const respData = (err as any)?.response?.data;
      const detail =
        respData?.detail ||
        respData?.error ||
        (err as Error)?.message ||
        "The archived original could not be downloaded.";
      setDownloadError(detail);
    } finally {
      setDownloading(false);
    }
  }, [ref, digest, approvedToken]);

  return (
    <main className="w-full min-h-[75vh] py-12 px-4 sm:px-6 bg-slate-50/60">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#022C4F] text-white shadow-md shadow-[#022C4F]/20 mb-4" aria-hidden="true">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#022C4F] tracking-tight">
            Official Report Verification
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Cryptographic document authenticity validation for Lagos State Materials Testing Laboratory (LSMTL) statutory integrity dossiers.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm" role="status">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-[#022C4F]" aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-slate-600">Verifying cryptographic hash in statutory archive…</p>
          </div>
        )}

        {!loading && result?.verified && (
          <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm overflow-hidden" role="status">
            {/* Verified Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="font-black text-base tracking-wide flex items-center gap-2">
                    AUTHENTIC PLATFORM RECORD
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800">
                      VERIFIED
                    </span>
                  </h2>
                  <p className="text-xs text-emerald-50 mt-0.5">
                    This document strictly matches an archived Nexucon record — cryptographic integrity intact and unaltered.
                  </p>
                </div>
              </div>
            </div>

            {/* Facts Grid */}
            <dl className="px-6 py-6 space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100">
                <dt className="text-slate-500 font-medium shrink-0">Report Reference</dt>
                <dd className="font-mono font-bold text-slate-900 text-right">{result.report_reference}</dd>
              </div>

              <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100">
                <dt className="text-slate-500 font-medium shrink-0">Standard Specification</dt>
                <dd className="font-bold text-slate-800 text-right">{result.title}</dd>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-slate-100">
                <dt className="text-slate-500 font-medium">Content Digest (Underlying Test Rows)</dt>
                <dd className="font-mono text-[11px] text-slate-700 break-all bg-slate-50 rounded-xl p-2.5 border border-slate-200 select-all">
                  {result.content_digest}
                </dd>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-slate-100">
                <dt className="text-slate-500 font-medium">SHA-256 Checksum (Sealed Dossier File)</dt>
                <dd className="font-mono text-[11px] text-slate-700 break-all bg-slate-50 rounded-xl p-2.5 border border-slate-200 select-all">
                  {result.sha256_checksum}
                </dd>
              </div>

              <div className="grid grid-cols-3 gap-3 py-2 bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-center">
                <div>
                  <dt className="text-[11px] text-slate-500">Test Points</dt>
                  <dd className="text-base font-black text-[#022C4F]">{result.test_count}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">Assessed</dt>
                  <dd className="text-base font-black text-[#022C4F]">{result.assessed_count}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">Passed 25 N/mm²</dt>
                  <dd className="text-base font-black text-emerald-600">{result.passed_count}</dd>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <dt className="text-slate-500 font-medium">Compliance Verdict</dt>
                <dd>
                  <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold ${complianceBadge(result.compliance_status)}`}>
                    {result.compliance_status?.replace(/_/g, " ") || "COMPLIANT"}
                  </span>
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Sealed Archive Date</dt>
                <dd className="font-medium text-slate-800">{fmtDate(result.archived_at)}</dd>
              </div>
            </dl>

            {/* --- STATUTORY ACCESS CONTROL & REQUEST SECTION --- */}
            <div className="border-t border-slate-200 bg-slate-50/70 p-6">
              {hasApprovedAccess ? (
                /* UNLOCKED: Approved Access State */
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Unlock size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-emerald-950">
                        Official Access Granted
                      </h3>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        {approvalInfo?.notes || "Your authorization has been verified by the supervising government authority."}
                      </p>
                      {approvalInfo?.reviewedAt && (
                        <p className="text-[10px] text-emerald-700/80 mt-1">
                          Approved on {new Date(approvalInfo.reviewedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Download size={16} />
                    {downloading ? "Retrieving Certified PDF Dossier…" : "Download Authentic Original PDF"}
                  </button>

                  {downloadError && (
                    <p className="text-xs text-rose-600 text-center font-medium">{downloadError}</p>
                  )}
                </div>
              ) : submissionSuccess ? (
                /* PENDING: Successfully submitted access request */
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Clock size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-amber-950 flex items-center gap-2 flex-wrap">
                        Access Request Submitted
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                          PENDING GOV APPROVAL
                        </span>
                      </h3>
                      <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                        Your request has been forwarded to the <strong>Lagos State Materials Testing Laboratory</strong> and supervising Government Agency dashboard.
                      </p>
                      <div className="mt-2 text-xs text-amber-800 font-mono bg-amber-100/60 p-2 rounded-lg">
                        Reference: #{submissionSuccess.id?.slice(0, 8).toUpperCase()} • Requester: {submissionSuccess.requester_name}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-amber-800">
                      Once an official approves it on the dashboard, click below to unlock:
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCheckStatus({ preventDefault: () => {} } as any)}
                      disabled={isCheckingStatus}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      {isCheckingStatus ? "Checking…" : "Check If Approved"}
                    </button>
                  </div>
                </div>
              ) : (
                /* RESTRICTED: Must request access before download */
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#022C4F] text-white flex items-center justify-center shrink-0">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#022C4F]">
                        Statutory Document Governance & Access Restriction
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        In accordance with statutory building records policy, direct download of certified engineering dossiers requires identity verification and approval by the supervising government agency.
                      </p>
                    </div>
                  </div>

                  {/* Switch between Request and Check Status */}
                  <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveAccessTab("request")}
                      className={`pb-2 transition-colors cursor-pointer ${
                        activeAccessTab === "request"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Submit Access Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAccessTab("check")}
                      className={`pb-2 transition-colors cursor-pointer ${
                        activeAccessTab === "check"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Already Requested? Check Approval
                    </button>
                  </div>

                  {activeAccessTab === "request" ? (
                    <form onSubmit={handleRequestSubmit} className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Engr. Babatunde Sanwo"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Official Email <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="you@organization.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="+234..."
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Organization / Firm <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Apex Civil Consult"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Stakeholder Capacity
                          </label>
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value="Structural Engineer / Consultant">Structural Engineer / Consultant</option>
                            <option value="Property Owner / Buyer">Property Owner / Buyer</option>
                            <option value="Financial / Lending Institution">Financial / Lending Institution</option>
                            <option value="Legal Counsel / Notary">Legal Counsel / Notary</option>
                            <option value="Contractor / Builder">Contractor / Builder</option>
                            <option value="Government / Regulatory Body">Government / Regulatory Body</option>
                            <option value="Public Auditor / Other">Public Auditor / Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Purpose of Access
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Due diligence, building audit"
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 py-3 px-4 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md shadow-[#022C4F]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Transmitting Request to Government Authority…
                          </>
                        ) : (
                          <>
                            <ArrowRight size={14} /> Request Document Access from Authority
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Check Status Form */
                    <form onSubmit={handleCheckStatus} className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Enter your Email Address or Access Token
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="you@domain.com or token"
                            value={statusCheckInput}
                            onChange={(e) => setStatusCheckInput(e.target.value)}
                            className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                          <button
                            type="submit"
                            disabled={isCheckingStatus}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                          >
                            {isCheckingStatus ? "Checking…" : "Lookup"}
                          </button>
                        </div>
                      </div>

                      {statusCheckMessage && (
                        <div className={`p-3 rounded-xl text-xs font-medium border ${
                          statusCheckMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          statusCheckMessage.type === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          statusCheckMessage.type === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {statusCheckMessage.text}
                        </div>
                      )}
                    </form>
                  )}

                  {downloadError && (
                    <p className="mt-2 text-xs text-red-600 font-medium" role="alert">
                      {downloadError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && result && !result.verified && (
          <div className="rounded-2xl border border-red-200 bg-white overflow-hidden shadow-sm" role="alert">
            <div className="bg-red-500 px-6 py-5 flex items-center gap-3 text-white">
              <AlertTriangle size={24} />
              <div>
                <h2 className="font-black text-base">NOT VERIFIED</h2>
                <p className="text-xs text-red-100">{result.detail || "No archived report matches this reference and digest."}</p>
              </div>
            </div>
            <div className="px-6 py-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              The document may have been altered after generation, or it was never produced by this platform. If you believe this is an error, contact the Lagos State Materials Testing Laboratory.
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          Statutory Verification Service • Lagos State Materials Testing Laboratory & Nexucon Integrity Network
        </p>
      </div>
    </main>
  );
}

/** useSearchParams requires a Suspense boundary for static prerendering. */
export default function VerifyReportPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-[70vh] py-16 px-4">
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 text-center" role="status">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-[#022C4F]" aria-hidden="true" />
            <p className="mt-4 text-xs font-semibold text-slate-500">Loading statutory verification…</p>
          </div>
        </main>
      }
    >
      <VerifyReportContent />
    </Suspense>
  );
}
