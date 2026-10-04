"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, PenLine, Sparkles, Undo2, MessageSquare, Send, UserCheck } from "lucide-react";
import {
  getPunditAnalysisReview,
  reviewPunditAnalysis,
  withdrawPunditAnalysisReview,
  regenerateJointPunditAnalysis,
  getPunditAnalysisComments,
  addPunditAnalysisComment,
  type PunditAnalysisReview,
  type PunditAnalysisComment,
} from "@/services/digitalEye";

/**
 * Engineer review of a PUNDIT AI analysis (client principle 5): the AI output
 * is decision-support — a qualified engineer corroborates it (or returns it
 * for revision) before it is treated as reviewed. The review is a separate
 * record; the analysis itself stays immutable. No review row means the honest
 * "pending" state — nothing is auto-approved. Directors only (enforced
 * server-side; a refusal is shown verbatim).
 */
export default function PunditAnalysisReviewPanel({
  analysisId,
  onReviewUpdated,
}: {
  analysisId: string;
  onReviewUpdated?: () => void;
}) {
  const [review, setReview] = useState<PunditAnalysisReview | null>(null);
  const [comments, setComments] = useState<PunditAnalysisComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [notes, setNotes] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [regenerateWithAi, setRegenerateWithAi] = useState(true);
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
      const [revData, commentsData] = await Promise.all([
        getPunditAnalysisReview(analysisId),
        getPunditAnalysisComments(analysisId),
      ]);
      setReview(revData);
      setComments(commentsData);
    } catch (err: any) {
      setError(errText(err));
      setReview(null);
      setComments([]);
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
      let activeNotes = newCommentText.trim();
      // If text is in chat input, post it to discussion stream as well
      if (activeNotes) {
        try {
          const added = await addPunditAnalysisComment(analysisId, activeNotes);
          setComments((prev) => [...prev, added]);
          setNewCommentText("");
        } catch {
          // fallback to activeNotes
        }
      } else if (comments.length > 0) {
        // Use latest comment as note if input field is empty
        activeNotes = comments[comments.length - 1].comment;
      }

      const data = await reviewPunditAnalysis(analysisId, {
        decision,
        notes: activeNotes,
        regenerate: regenerateWithAi,
      });
      setReview(data);
      toast(
        decision === "corroborated"
          ? "Analysis corroborated by engineer review (Joint AI Synthesis updated)."
          : "Analysis returned for revision (Joint AI Synthesis updated).",
        "success",
      );
      onReviewUpdated?.();
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim()) return;
    setIsPostingComment(true);
    try {
      const added = await addPunditAnalysisComment(analysisId, newCommentText.trim());
      setComments((prev) => [...prev, added]);
      setNewCommentText("");
      toast("Comment posted to collaborative chat stream.", "success");
      onReviewUpdated?.();
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleRegenerateJoint = async () => {
    setIsRegenerating(true);
    try {
      await regenerateJointPunditAnalysis(analysisId);
      toast("Joint AI Review re-synthesized with Principal Engineer directives and team chat.", "success");
      onReviewUpdated?.();
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const withdraw = async () => {
    if (!window.confirm("Withdraw this review? The analysis returns to pending engineer review.")) return;
    setSaving(true);
    try {
      setReview(await withdrawPunditAnalysisReview(analysisId));
      toast("Review withdrawn — the analysis is pending engineer review again.", "info");
      onReviewUpdated?.();
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerateJoint}
              disabled={saving || isRegenerating}
              className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg px-2.5 py-1 disabled:opacity-50 cursor-pointer shadow-sm transition-all"
              title="Re-run AI synthesis integrating Principal Engineer directives, field notes, and team chat"
            >
              <Sparkles size={12} className={isRegenerating ? "animate-spin text-indigo-600" : "text-indigo-600"} />
              <span>{isRegenerating ? "Synthesizing Joint Review…" : "Regenerate Joint Review with AI"}</span>
            </button>
            <button
              onClick={withdraw}
              disabled={saving || isRegenerating}
              className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 disabled:opacity-50 cursor-pointer"
            >
              <Undo2 size={12} /> Withdraw review
            </button>
          </div>
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

      {(review?.inspector_notes || review?.inspector_verdict) && (
        <div className="p-3 rounded-xl bg-blue-50/90 border border-blue-200 text-blue-900 space-y-1.5 text-xs shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-1.5 font-semibold text-blue-900">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Inspector Review
              </span>
              {review.inspector_verdict && (
                <span className="font-bold text-blue-800 text-[11px]">
                  {review.inspector_verdict_display || review.inspector_verdict}
                </span>
              )}
            </div>
            <span className="font-normal text-[10px] text-slate-500">
              Submitted by <strong>{review.inspector_responded_by || "Field Inspector"}</strong>
              {review.inspector_responded_at && (
                <> on {new Date(review.inspector_responded_at).toLocaleString()}</>
              )}
            </span>
          </div>
          {review.inspector_notes ? (
            <p className="italic bg-white/90 p-2.5 rounded-lg border border-blue-100 text-slate-800 text-[11px] leading-relaxed">
              “{review.inspector_notes}”
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 italic">No field text notes provided.</p>
          )}
        </div>
      )}

      {/* SINGLE COLLABORATIVE CHAT & DECISION INPUT SYSTEM */}
      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
            <MessageSquare size={14} className="text-indigo-600" />
            <span>Government & Inspector Collaborative Chat ({comments.length})</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            AI Joint Review Discussion Thread
          </span>
        </div>

        {comments.length === 0 ? (
          <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60 text-center text-xs text-slate-500 italic">
            No chat comments posted yet. Government officials, engineers, and inspectors discuss here to build a collaborative opinion for AI synthesis.
          </div>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {comments.map((c) => (
              <div key={c.id} className="bg-white/90 rounded-xl p-2.5 border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{c.author_name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {c.author_role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(c.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {c.comment}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* SINGLE INPUT FIELD */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Type your message / directive to discuss with inspectors & government..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 shadow-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleSendComment()}
              disabled={isPostingComment || !newCommentText.trim()}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs cursor-pointer shrink-0"
              title="Post message to collaborative discussion"
            >
              <Send size={12} />
              <span>Send Chat</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={regenerateWithAi}
                onChange={(e) => setRegenerateWithAi(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Synthesize AI Joint Analysis with chat thread</span>
            </label>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => decide("corroborated")}
                disabled={saving || isRegenerating}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs transition-colors"
                title="Corroborate AI analysis using current chat directives"
              >
                <CheckCircle2 size={13} /> Corroborate
              </button>
              <button
                type="button"
                onClick={() => decide("returned")}
                disabled={saving || isRegenerating}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs transition-colors"
                title="Return analysis for revision with directives"
              >
                <PenLine size={13} /> Return for Revision
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
