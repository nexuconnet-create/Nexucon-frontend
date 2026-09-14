"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  downloadArchivedReportOriginal,
  verifyArchivedReport,
  type ReportVerification,
} from "@/services/digitalEye";

/**
 * PUBLIC report verification page (REFINED EXECUTIVE SUMMARY, PART B item 2).
 *
 * The QR code printed on every certified NDT dossier cover resolves here.
 * The page asks the backend whether an archived report matching the
 * reference + content digest exists, shows the verification facts —
 * reference, SHA-256 checksum, test counts and the compliance verdict —
 * and offers the authentic archived original for download, so a recipient
 * holding an edited copy can retrieve the genuine document. No project
 * data is ever displayed: the endpoint discloses none, and this page
 * renders only what it returns.
 */
function VerifyReportContent() {
  const params = useSearchParams();
  const ref = (params.get("ref") || "").trim();
  const digest = (params.get("digest") || "").trim();

  const [result, setResult] = useState<ReportVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

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
  }, [ref, digest]);

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

  /** Fetch the authentic archived original and hand it to the browser as a
   *  file download. The same ref+digest pair gates it server-side. */
  const handleDownload = useCallback(async () => {
    if (!ref || !digest) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await downloadArchivedReportOriginal(ref, digest);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ndt_report_${(ref || "archived").replace(/[\\/:*?"<>|]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        (err as Error)?.message ||
        "The archived original could not be downloaded.";
      setDownloadError(detail);
    } finally {
      setDownloading(false);
    }
  }, [ref, digest]);

  return (
    <main className="w-full min-h-[70vh] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0A3D2E]/5 mb-5" aria-hidden="true">
            <svg className="w-8 h-8 text-[#0A3D2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-[#0F181F] tracking-tight">
            Report Verification
          </h1>
          <p className="mt-3 text-[#4B5B66] leading-relaxed">
            Nexucon archives every certified NDT dossier with a cryptographic
            content digest. Scan the QR code on the report cover, or open the
            link it encodes, to confirm the document is a genuine,
            unaltered platform record.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center" role="status">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-[#0A3D2E]" aria-hidden="true" />
            <p className="mt-4 text-sm text-[#4B5B66]">Checking the archive…</p>
          </div>
        )}

        {!loading && result?.verified && (
          <div className="rounded-xl border border-emerald-200 bg-white overflow-hidden" role="status">
            <div className="bg-emerald-50 px-6 py-5 flex items-center gap-3">
              <svg className="w-7 h-7 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h2 className="font-semibold text-emerald-900">Verified</h2>
                <p className="text-sm text-emerald-800">
                  This document matches an archived Nexucon report — the content
                  is intact and unaltered.
                </p>
              </div>
            </div>
            <dl className="px-6 py-5 space-y-4 text-sm">
              <div>
                <dt className="text-[#6B7A85]">Report reference</dt>
                <dd className="font-mono font-medium text-[#0F181F] break-all">{result.report_reference}</dd>
              </div>
              <div>
                <dt className="text-[#6B7A85]">Report type</dt>
                <dd className="text-[#0F181F]">{result.title}</dd>
              </div>
              <div>
                <dt className="text-[#6B7A85]">SHA-256 checksum (archived file)</dt>
                <dd className="font-mono text-xs text-[#0F181F] break-all bg-slate-50 rounded-md p-2 border border-slate-100">
                  {result.sha256_checksum}
                </dd>
              </div>
              <div>
                <dt className="text-[#6B7A85]">Content digest (underlying records)</dt>
                <dd className="font-mono text-xs text-[#0F181F] break-all bg-slate-50 rounded-md p-2 border border-slate-100">
                  {result.content_digest}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <dt className="text-[#6B7A85]">Tests recorded</dt>
                  <dd className="text-lg font-semibold text-[#0F181F]">{result.test_count}</dd>
                </div>
                <div>
                  <dt className="text-[#6B7A85]">Strength-assessed</dt>
                  <dd className="text-lg font-semibold text-[#0F181F]">{result.assessed_count}</dd>
                </div>
                <div>
                  <dt className="text-[#6B7A85]">Passed 25 N/mm²</dt>
                  <dd className="text-lg font-semibold text-[#0F181F]">{result.passed_count}</dd>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <dt className="text-[#6B7A85]">Compliance status</dt>
                <dd>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${complianceBadge(result.compliance_status)}`}>
                    {result.compliance_status?.replace(/_/g, " ") || "—"}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#6B7A85]">Archived</dt>
                <dd className="text-[#0F181F]">{fmtDate(result.archived_at)}</dd>
              </div>
            </dl>
            <div className="border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A3D2E] px-4 py-3 text-sm font-medium text-white hover:bg-[#0A3D2E]/90 disabled:opacity-60"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {downloading
                  ? "Retrieving the archived original…"
                  : "Download the authentic original (PDF)"}
              </button>
              {downloadError && (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {downloadError}
                </p>
              )}
              <p className="mt-3 text-xs text-[#6B7A85] leading-relaxed">
                This is the exact PDF the platform sealed when the report was
                generated — use it to compare against the copy you hold. If
                anything was edited after generation, the original differs
                from the copy and the checksum above proves which one is
                genuine.
              </p>
            </div>
          </div>
        )}

        {!loading && result && !result.verified && (
          <div className="rounded-xl border border-red-200 bg-white overflow-hidden" role="alert">
            <div className="bg-red-50 px-6 py-5 flex items-center gap-3">
              <svg className="w-7 h-7 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <h2 className="font-semibold text-red-900">Not verified</h2>
                <p className="text-sm text-red-800">{result.detail || "No archived report matches this reference and digest."}</p>
              </div>
            </div>
            <div className="px-6 py-5 text-sm text-[#4B5B66] leading-relaxed">
              The document may have been altered after generation, or it was
              never produced by this platform. If you believe this is an
              error, contact the laboratory that issued the report.
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-[#8A97A0]">
          This check confirms the document matches a platform-archived record.
          It discloses only verification facts — no project, client or site
          data is exposed.
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
          <div className="max-w-2xl mx-auto rounded-xl border border-slate-200 bg-white p-8 text-center" role="status">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-[#0A3D2E]" aria-hidden="true" />
            <p className="mt-4 text-sm text-[#4B5B66]">Loading verification…</p>
          </div>
        </main>
      }
    >
      <VerifyReportContent />
    </Suspense>
  );
}
