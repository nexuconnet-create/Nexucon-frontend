"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, PenLine, Undo2 } from "lucide-react";
import {
  getPunditAnalysisReview,
  reviewPunditAnalysis,
  withdrawPunditAnalysisReview,
  type PunditAnalysisReview,
} from "@/services/digitalEye";

/**
 * Engineer review of a PUNDIT AI analysis (client principle 5): the AI output
 * is decision-support — a qualified engineer corroborates it (or returns it
 * for revision) before it is treated as reviewed. The review is a separate
 * record; the analysis itself stays immutable. No review row means the honest
 * "pending" state — nothing is auto-approved. Directors only (enforced
 * server-side; a refusal is shown verbatim).
 */
export default function PunditAnalysisReviewPanel({ analysisId }: { analysisId: string }) {
  const [review, setReview] = useState<PunditAnalysisReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const errText = useCallback((err: any): string => {
    return (
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "The request failed."
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReview(await getPunditAnalysisReview(analysisId));
    } catch (err: any) {
      setError(errText(err));
      setReview(null);
    } finally {
      setLoading(false);
    }
  }, [analysisId, errText]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // When switching to another analysis, drop any half-typed notes.
    setNotes("");
  }, [analysisId]);

  const toast = (message: string, type: "success" | "error" | "info") => {
    window.dispatchEvent(
      new CustomEvent("show-toast", { detail: { message, type } }),
    );
  };

  const decide = async (decision: "corroborated" | "returned") => {
    setSaving(true);
    try {
      const data = await reviewPunditAnalysis(analysisId, {
        decision,
        notes: notes.trim(),
      });
      setReview(data);
      setNotes("");
      toast(
        decision === "corroborated"
          ? "Analysis corroborated by engineer review."
          : "Analysis returned for revision.",
        "success",
      );
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const withdraw = async () => {
    if (!window.confirm("Withdraw this review? The analysis returns to pending engineer review.")) return;
    setSaving(true);
    try {
      setReview(await withdrawPunditAnalysisReview(analysisId));
      setNotes("");
      toast("Review withdrawn — the analysis is pending engineer review again.", "info");
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 flex items-center gap-2" role="status">
        <Clock size={13} className="animate-pulse" /> Loading review state…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center justify-between gap-3" role="alert">
        <span>{error}</span>
        <button onClick={load} className="shrink-0 font-bold underline underline-offset-2 cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  const pending = !review || review.review_status === "pending";

  return (
    <div className={`rounded-xl border px-4 py-3 space-y-3 ${
      pending
        ? "border-amber-200 bg-amber-50/60"
        : review?.review_status === "corroborated"
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-rose-200 bg-rose-50/60"
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {pending ? (
            <Clock size={15} className="text-amber-600" />
          ) : review?.review_status === "corroborated" ? (
            <CheckCircle2 size={15} className="text-emerald-600" />
          ) : (
            <PenLine size={15} className="text-rose-600" />
          )}
          <span className={`text-xs font-bold uppercase tracking-wide ${
            pending ? "text-amber-800"
              : review?.review_status === "corroborated" ? "text-emerald-800"
                : "text-rose-800"
          }`}>
            {pending
              ? "Awaiting engineer review"
              : review?.review_status === "corroborated"
                ? "Corroborated by engineer"
                : "Returned for revision"}
          </span>
          {review?.requires_human_review && (
            <span className="text-[10px] font-mono text-slate-500 bg-white/70 border border-slate-200 rounded px-1.5 py-0.5">
              AI OUTPUT = DECISION-SUPPORT ONLY
            </span>
          )}
        </div>
        {!pending && (
          <button
            onClick={withdraw}
            disabled={saving}
            className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 disabled:opacity-50 cursor-pointer"
          >
            <Undo2 size={12} /> Withdraw review
          </button>
        )}
      </div>

      {!pending && review && (
        <div className="text-[11px] text-slate-600 space-y-1">
          <p>
            Reviewed by <strong>{review.reviewed_by || "—"}</strong>
            {review.reviewed_at && <> on {new Date(review.reviewed_at).toLocaleString()}</>}
          </p>
          {review.notes && (
            <p className="italic text-slate-700 bg-white/70 border border-slate-200 rounded-lg px-3 py-2">
              “{review.notes}”
            </p>
          )}
        </div>
      )}

      {pending ? (
        <p className="text-[11px] text-slate-600">
          A qualified engineer must corroborate or return this analysis before it is
          treated as reviewed. Directors only — the server enforces the role.
        </p>
      ) : (
        <p className="text-[11px] text-slate-500">
          Recording a new decision below replaces the current review.
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={4000}
          rows={2}
          placeholder="Review notes (optional, max 4000 characters) — typed by the reviewing engineer, never auto-filled."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400 resize-y"
        />
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => decide("corroborated")}
            disabled={saving}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 size={13} /> Corroborate
          </button>
          <button
            onClick={() => decide("returned")}
            disabled={saving}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <PenLine size={13} /> Return for revision
          </button>
        </div>
      </div>
    </div>
  );
}
