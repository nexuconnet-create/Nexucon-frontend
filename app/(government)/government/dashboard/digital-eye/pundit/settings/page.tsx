"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Settings,
  ShieldCheck,
  BookOpen,
  Info,
  RefreshCw,
  Save,
  AlertTriangle,
  LineChart,
  CheckCircle2,
  Lock,
} from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import NexuconLinkNav from "@/components/dashboard/digital-eye/NexuconLinkNav";
import {
  ActiveCurveResponse,
  CurveType,
  NexuconLinkSettings,
  SEAnalysis,
  StandardEntry,
  getActiveCurve,
  getNexuconLinkSettings,
  getSEAnalysis,
  getStandards,
  updateNexuconLinkSettings,
} from "@/services/digitalEye";

/**
 * Nexucon Link — System Settings (wireframe layer 4).
 *
 * The platform defaults the whole Nexucon Link workflow reads from:
 *   * the preferred curve type — EXPONENTIAL, per the 15 Sep 2026 direction
 *     that concrete behaviour is non-linear, so the calibration workflow
 *     pre-selects and recommends it;
 *   * the reference standard new curves are recorded against;
 *   * the display units;
 *   * the active curve for the selected project, with its live statistics.
 *
 * It also carries the two documents the client asked for at that review: the
 * STANDARDS REGISTRY (which document governs the measurement and which
 * governs turning it into a strength) and the plain-English definitions of
 * R², standard error and AIC — served from the backend so every surface says
 * the same thing.
 *
 * Honest states throughout: no project curve shows the platform default with
 * its provenance; a statistic that does not exist reads "—" with the reason,
 * never a placeholder number.
 */

const CURVE_TYPE_LABEL: Record<CurveType, string> = {
  linear: "Linear",
  polynomial: "Polynomial (deg 2)",
  exponential: "Exponential",
  sonreb: "SonReb (UPV + Rebound)",
  lookup: "Lookup table",
};

/**
 * Display names for the backend's statistic definitions. Any key not listed
 * here falls back to its own humanised name rather than being mislabelled —
 * the backend owns the definitions, so a new one must never be presented
 * under another statistic's heading.
 */
const DEFINITION_LABELS: Record<string, string> = {
  r2_score: "R² (coefficient of determination)",
  standard_error: "Standard error",
  mean_residual: "Mean residual",
  aic: "AIC (Akaike Information Criterion)",
  point_count: "Points averaged (the n in s/√n)",
  velocity_step: "Where the error is applied — the velocity step",
  margin_scope: "What the margin covers — and what it does not",
};

const errText = (err: any): string => {
  const data = err?.response?.data;
  if (data?.errors) {
    const parts: string[] = [];
    for (const [key, val] of Object.entries<any>(data.errors)) {
      const v = Array.isArray(val) ? val.join(", ") : String(val);
      parts.push(key === "detail" || key === "non_field_errors" ? v : `${key}: ${v}`);
    }
    return parts.join(" · ") || "Request failed.";
  }
  if (data?.detail) return String(data.detail);
  return err?.message || "Request failed.";
};

const toast = (message: string, type: "success" | "error" | "info") =>
  window.dispatchEvent(new CustomEvent("show-toast", { detail: { message, type } }));

/** A statistic that may legitimately not exist yet. "—" plus the reason,
 *  never a fabricated number. */
function Stat({
  label,
  value,
  unit,
  hint,
  unavailable,
}: {
  label: string;
  value: number | null | undefined;
  unit?: string;
  hint?: string;
  unavailable?: string | null;
}) {
  const has = value != null && Number.isFinite(value);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
        {has ? `${value}${unit ? ` ${unit}` : ""}` : "—"}
      </div>
      {has && hint ? (
        <p className="mt-1 text-[11px] leading-snug text-slate-500">{hint}</p>
      ) : null}
      {!has && unavailable ? (
        <p className="mt-1 text-[11px] leading-snug text-slate-500">{unavailable}</p>
      ) : null}
    </div>
  );
}

export default function NexuconLinkSettingsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [settings, setSettings] = useState<NexuconLinkSettings | null>(null);
  const [standards, setStandards] = useState<StandardEntry[]>([]);
  const [active, setActive] = useState<ActiveCurveResponse | null>(null);
  const [analysis, setAnalysis] = useState<SEAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // The editable draft. Null means "nothing staged" — the form then mirrors
  // the server row, so a failed save can never leave a stale local value
  // masquerading as saved.
  const [draft, setDraft] = useState<Partial<NexuconLinkSettings> | null>(null);

  const load = useCallback(async (projectId: string) => {
    setLoading(true);
    const [settingsRes, standardsRes] = await Promise.allSettled([
      getNexuconLinkSettings(),
      getStandards(),
    ]);
    if (settingsRes.status === "fulfilled") {
      setSettings(settingsRes.value);
      setDraft(null);
    } else {
      setSettings(null);
      toast(`⚠️ ${errText(settingsRes.reason)}`, "error");
    }
    // The standards registry is static platform reference data. A failure
    // here is a real error, so it surfaces rather than silently emptying.
    if (standardsRes.status === "fulfilled") {
      setStandards(standardsRes.value);
    } else {
      setStandards([]);
      toast(`⚠️ Standards registry unavailable — ${errText(standardsRes.reason)}`, "error");
    }

    if (!projectId) {
      setActive(null);
      setAnalysis(null);
      setLoading(false);
      return;
    }
    const [activeRes, seRes] = await Promise.allSettled([
      getActiveCurve(projectId),
      getSEAnalysis(projectId),
    ]);
    setActive(activeRes.status === "fulfilled" ? activeRes.value : null);
    setAnalysis(seRes.status === "fulfilled" ? seRes.value.analysis : null);
    if (activeRes.status === "rejected") {
      toast(`⚠️ ${errText(activeRes.reason)}`, "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(selectedProjectId);
  }, [load, selectedProjectId]);

  const effective = useMemo(
    () => ({ ...(settings || {}), ...(draft || {}) }) as Partial<NexuconLinkSettings>,
    [settings, draft]
  );

  const isDirty = draft != null && Object.keys(draft).length > 0;

  const setField = <K extends keyof NexuconLinkSettings>(
    key: K,
    value: NexuconLinkSettings[K]
  ) => {
    if (!settings) return;
    // Staging a value equal to the server's clears the field from the draft,
    // so the Save button reflects a genuine change rather than a click.
    if (settings[key] === value) {
      setDraft((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        delete next[key];
        return Object.keys(next).length ? next : null;
      });
      return;
    }
    setDraft((prev) => ({ ...(prev || {}), [key]: value }));
  };

  const save = async () => {
    if (!draft || !isDirty) return;
    setSaving(true);
    try {
      const updated = await updateNexuconLinkSettings(draft);
      setSettings(updated);
      setDraft(null);
      toast("✅ Nexucon Link system settings saved.", "success");
    } catch (err) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const curve = active?.curve || null;
  const snapshot = active?.curve_snapshot || null;
  const isPlatformDefault = !!curve?.is_default;
  const definitions = analysis?.definitions || {};
  // Where each statistic comes from, and the registry entry to name it in
  // full — so the source reads as a document rather than a bare code.
  const references = analysis?.references || {};
  const standardsByCode = useMemo(
    () => new Map(standards.map((s) => [s.code, s])),
    [standards]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <DigitalEyeHeader
        activePillar="PUNDIT: Nexucon Link — System Settings"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <NexuconLinkNav subtitle="System Settings" />

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Settings className="h-6 w-6 text-slate-400" />
              System Settings
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              The defaults every Nexucon Link calculation reads from. Changing the
              preferred curve type or the reference standard is a Director-level,
              audited action — it changes what the whole calibration workflow
              pre-selects.
            </p>
          </div>
          <button
            type="button"
            onClick={() => load(selectedProjectId)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Platform defaults                                                */}
        {/* ---------------------------------------------------------------- */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              Platform defaults
            </h2>
            {isDirty && (
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save changes"}
              </button>
            )}
          </div>

          {loading && !settings ? (
            <p className="px-4 py-6 text-sm text-slate-500">Loading settings…</p>
          ) : !settings ? (
            <p className="flex items-start gap-2 px-4 py-6 text-sm text-slate-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              Platform settings could not be read. Nothing is being shown in their
              place — retry with Refresh.
            </p>
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="preferred-curve-type"
                  className="block text-sm font-medium text-slate-700"
                >
                  Preferred curve type
                </label>
                <p className="mt-0.5 text-xs text-slate-500">
                  What the calibration workflow pre-selects and recommends. Concrete
                  behaviour is non-linear, so the platform default is exponential.
                  This activates nothing by itself — a project still reports through
                  its own active curve.
                </p>
                <select
                  id="preferred-curve-type"
                  value={(effective.preferred_curve_type as CurveType) || "exponential"}
                  onChange={(e) =>
                    setField("preferred_curve_type", e.target.value as CurveType)
                  }
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none sm:max-w-md"
                >
                  {(Object.keys(CURVE_TYPE_LABEL) as CurveType[]).map((t) => (
                    <option key={t} value={t}>
                      {CURVE_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
                {effective.preferred_curve_type === "exponential" && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Matches the client direction from the 15 Sep 2026 review.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="default-standard"
                  className="block text-sm font-medium text-slate-700"
                >
                  Default reference standard
                </label>
                <p className="mt-0.5 text-xs text-slate-500">
                  Recorded against a new curve unless the operator names another.
                </p>
                <input
                  id="default-standard"
                  type="text"
                  value={effective.default_standard ?? ""}
                  onChange={(e) => setField("default_standard", e.target.value)}
                  placeholder="e.g. BS 1881-203:1986"
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                />
                {standards.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) setField("default_standard", e.target.value);
                    }}
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
                  >
                    <option value="">Choose from the registry…</option>
                    {standards.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} — {s.role_label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="velocity-unit"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Velocity unit
                  </label>
                  <input
                    id="velocity-unit"
                    type="text"
                    value={effective.velocity_unit ?? ""}
                    onChange={(e) => setField("velocity_unit", e.target.value)}
                    placeholder="e.g. m/s"
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="strength-unit"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Strength unit
                  </label>
                  <input
                    id="strength-unit"
                    type="text"
                    value={effective.strength_unit ?? ""}
                    onChange={(e) => setField("strength_unit", e.target.value)}
                    placeholder="e.g. MPa"
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {settings.updated_by_name || settings.updated_at ? (
                <p className="text-xs text-slate-500 md:col-span-2">
                  Last changed by {settings.updated_by_name || "an unrecorded user"}
                  {settings.updated_at
                    ? ` on ${new Date(settings.updated_at).toLocaleString()}`
                    : ""}
                  .
                </p>
              ) : null}
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Active curve for the selected project                            */}
        {/* ---------------------------------------------------------------- */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <LineChart className="h-4 w-4 text-slate-400" />
              Active curve
            </h2>
          </div>

          {!selectedProjectId ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              Select a project to see the curve its strength calculations currently
              flow through.
            </p>
          ) : !active ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              {loading ? "Loading active curve…" : "No active curve could be read."}
            </p>
          ) : (
            <div className="space-y-4 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">
                  {curve ? curve.name : snapshot?.name || "Built-in laboratory curve"}
                </span>
                {curve?.curve_type && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {CURVE_TYPE_LABEL[curve.curve_type]}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isPlatformDefault
                      ? "bg-amber-50 text-amber-800"
                      : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {isPlatformDefault
                    ? "Platform default — no project curve activated"
                    : "Project calibration"}
                </span>
              </div>

              <div className="rounded-md bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">
                {snapshot?.formula || "—"}
              </div>

              {isPlatformDefault && (
                <p className="flex items-start gap-2 text-xs text-slate-600">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  This project has no calibration curve of its own, so the documented
                  laboratory correlation applies. It has no regression and therefore no
                  standard error — calibrate from real core/cube pairs in the Curve
                  Manager to obtain one.
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  label="R²"
                  value={analysis?.r2_score ?? curve?.r2_score ?? null}
                  hint={definitions.r2_score}
                  unavailable={analysis?.unavailable_reason}
                />
                <Stat
                  label="Standard error"
                  value={analysis?.standard_error_mpa ?? curve?.standard_error ?? null}
                  unit="N/mm²"
                  hint={definitions.standard_error}
                  unavailable={analysis?.unavailable_reason}
                />
                <Stat
                  label="Mean residual"
                  value={analysis?.mean_residual_mpa ?? null}
                  unit="N/mm²"
                  hint={definitions.mean_residual}
                  unavailable={analysis?.unavailable_reason}
                />
                <Stat
                  label="AIC"
                  value={analysis?.aic ?? curve?.aic ?? null}
                  hint={definitions.aic}
                  unavailable={analysis?.unavailable_reason}
                />
              </div>

              <div className="grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 p-3">
                  <div className="font-medium text-slate-700">Calibration pairs</div>
                  <div className="mt-1">
                    {analysis ? `${analysis.n_pairs} recorded` : "—"}
                    {analysis && analysis.n_pairs < analysis.min_pairs_required ? (
                      <span className="text-slate-500">
                        {" "}
                        — at least {analysis.min_pairs_required} are needed before a
                        standard error is meaningful.
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <div className="font-medium text-slate-700">Valid velocity range</div>
                  <div className="mt-1">
                    {snapshot?.valid_range_ms
                      ? `${snapshot.valid_range_ms[0].toLocaleString()} – ${snapshot.valid_range_ms[1].toLocaleString()} m/s`
                      : "Not recorded"}
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Standard-error policy on this curve
                </div>
                <p className="mt-1 text-slate-600">
                  {analysis
                    ? `${
                        curve?.se_adjustment_method_display ||
                        (curve?.se_adjustment_method === "none"
                          ? "No adjustment"
                          : curve?.se_adjustment_method || "No adjustment")
                      }. ${
                        analysis.adjustment_available
                          ? "This curve's data can support an adjustment."
                          : analysis.unavailable_reason || ""
                      }`
                    : "Not recorded."}
                </p>
                {analysis?.recommendation && (
                  <p className="mt-1 text-slate-600">{analysis.recommendation}</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Standards registry — the "document the standards" action item     */}
        {/* ---------------------------------------------------------------- */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BookOpen className="h-4 w-4 text-slate-400" />
              Standards registry
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Which document governs each part of the number this platform reports: the
              measurement itself, and the correlation that turns it into a strength.
            </p>
          </div>

          {standards.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              The standards registry could not be read.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {standards.map((s) => (
                <div key={s.code} className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {s.code}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        s.role === "measurement"
                          ? "bg-blue-50 text-blue-800"
                          : s.role === "statistics"
                            ? "bg-teal-50 text-teal-800"
                            : "bg-purple-50 text-purple-800"
                      }`}
                    >
                      {s.role_label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{s.title}</p>
                  <dl className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                    <div>
                      <dt className="font-medium text-slate-700">Scope</dt>
                      <dd className="mt-0.5 leading-relaxed">{s.scope}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700">
                        How this platform uses it
                      </dt>
                      <dd className="mt-0.5 leading-relaxed">{s.platform_use}</dd>
                    </div>
                  </dl>
                  {s.note && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-900">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {s.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Statistics reference — the "self-explanatory document" item       */}
        {/* ---------------------------------------------------------------- */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Info className="h-4 w-4 text-slate-400" />
              What the statistics mean
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Plain-English definitions of every figure shown above, so the same numbers
              can be presented without further explanation.
            </p>
          </div>
          {Object.keys(definitions).length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              Select a project to load the statistic definitions.
            </p>
          ) : (
            <dl className="divide-y divide-slate-100">
              {Object.entries(definitions).map(([key, text]) => (
                <div key={key} className="px-4 py-3">
                  <dt className="text-sm font-medium text-slate-800">
                    {DEFINITION_LABELS[key] ?? key.replace(/_/g, " ")}
                  </dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-slate-600">
                    {text}
                  </dd>
                  {/* The definition alone was not the whole ask on 15 Sep
                      2026 — the client wanted the source too. Served by the
                      backend with the definition so the two pages cannot
                      cite different documents for the same statistic. */}
                  {references[key]?.length ? (
                    <dd className="mt-1 text-xs text-slate-500">
                      <span className="font-medium text-slate-600">Source:</span>{" "}
                      {references[key]
                        .map((code) =>
                          standardsByCode.get(code)
                            ? `${code} — ${standardsByCode.get(code)!.title}`
                            : code
                        )
                        .join(" · ")}
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>
    </div>
  );
}
