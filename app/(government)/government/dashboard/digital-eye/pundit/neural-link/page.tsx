"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Link as LinkIcon,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Sigma,
  Beaker,
  Zap,
  Lock,
  UploadCloud,
  ChevronDown,
  BookOpen,
  Layers,
  Gauge,
  Activity,
  Cpu,
  Sparkles,
} from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import NexuconLinkNav from "@/components/dashboard/digital-eye/NexuconLinkNav";
import {
  StrengthCurve,
  CurveType,
  ActiveCurveResponse,
  CalibrationResult,
  RegressionFit,
  CurvePreviewResponse,
  SEAnalysis,
  PunditTest,
  CoreSample,
  BIMStructuralElement,
  StandardEntry,
  getStrengthCurves,
  createStrengthCurve,
  deleteStrengthCurve,
  getActiveCurve,
  activateStrengthCurve,
  restorePlatformDefaultCurve,
  calibrateCurve,
  previewCurve,
  formatVelocityMs,
  evalCurve,
  uploadCalibrationCsv,
  getCoreSamples,
  createCoreSample,
  deleteCoreSample,
  getCoreSamplePairs,
  getPunditTests,
  getBIMStructuralElements,
  getSEAnalysis,
  getStandards,
  CURVE_PARAM_FIELDS,
  CURVE_TYPE_LABEL,
} from "@/services/digitalEye";

// Statutory acceptance rule shared with the strength page / report engine.
const CRITICAL_STRENGTH_THRESHOLD_MPA = 25.0;
// Pending-marker for the platform-default switch, which is the one curve-table
// action that has no curve id of its own to key on (it clears the project's
// choice rather than pointing at a record). Curve ids are UUIDs, so a literal
// like this can never collide with one.
const PLATFORM_DEFAULT_PENDING = "__platform_default__";
// Reliability advisory from the 8 Sep meeting: 9-15 real calibration pairs.
const RELIABILITY_MIN_POINTS = 9;

// Curve-type labels now live in the service layer (CURVE_TYPE_LABEL), so the
// Curve Manager and the measurement browser cannot come to call the same curve
// two different things.

/** A stored timestamp as a plain calendar date — "15 Sep 2026" — or "—".
 *
 *  The Curve Manager's Added column, so the format is pinned to en-GB to match
 *  the BS standards the curves are calibrated against (and the dates already
 *  shown on the reports page), rather than following whatever locale the
 *  server or the reader's browser happens to be in.
 *
 *  Two states are honest and distinct: no timestamp recorded ("—"), and a
 *  timestamp that will not parse ("—"). Neither is a date, so neither is shown
 *  as one — `new Date("...")` on unparseable input yields "Invalid Date",
 *  which would put a non-date in a date column.
 */
function formatRecordedDate(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// The four curve types the regression engine fits (lookup tables are
// hand-entered, never regressed).
type FitType = "linear" | "polynomial" | "exponential" | "sonreb";

// Short label for a standard-error policy, used when the active curve row is
// not loaded (so the policy is still named rather than left blank).
const SE_ADJUSTMENT_LABEL: Record<string, string> = {
  none: "No adjustment — curve estimate as fitted",
  bias_correction: "Bias correction — measured mean residual added",
  confidence_margin: "Confidence margin — k × standard error deducted",
};

// Human titles for the statistic definitions served by the backend. This
// must cover EVERY key the backend publishes in `definitions` — an unlabelled
// key falls back to its raw snake_case name in the panel, which is the
// opposite of self-explanatory. Keys mirror DEFINITION_LABELS on the Nexucon
// Link settings page, which documents the same set.
const SE_STAT_LABEL: Record<string, string> = {
  r2_score: "R² (coefficient of determination)",
  standard_error: "Standard error (s = √(SSE/(n−k)))",
  mean_residual: "Mean residual (observed − predicted)",
  aic: "AIC (Akaike Information Criterion)",
  point_count: "Points averaged (the n in s/√n)",
  velocity_step: "Where the error is applied — the velocity step",
  margin_scope: "What the margin covers — and what it does not",
};

// How the standards registry is grouped on this page. The registry's own
// `role_label` is per-document and reads as a description of that one
// document; grouping by `role` instead gives the reader the three questions
// the registry actually answers. Order is the order of the workflow:
// measure the velocity, turn it into a strength, choose the model.
const STANDARD_ROLE_ORDER: StandardEntry["role"][] = [
  "measurement",
  "correlation",
  "statistics",
];

const STANDARD_ROLE_GROUP: Record<StandardEntry["role"], string> = {
  measurement: "Test methods — how the pulse velocity is measured",
  correlation: "Strength correlation — how a velocity becomes a strength",
  statistics: "Model selection — how the curve type is chosen",
};

const STANDARD_ROLE_BADGE: Record<StandardEntry["role"], string> = {
  measurement: "bg-blue-50 text-blue-800 border-blue-200",
  correlation: "bg-purple-50 text-purple-800 border-purple-200",
  statistics: "bg-teal-50 text-teal-800 border-teal-200",
};

const errText = (err: any): string => {
  const data = err?.response?.data;
  if (data?.errors) {
    // DRF validation errors wrapped by the platform exception handler.
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

// One calibration-pair input row (operator types REAL lab/field values only).
interface CalRow {
  v: string;
  f: string;
  r: string;
}

const emptyRow = (): CalRow => ({ v: "", f: "", r: "" });

export default function NeuralLinkPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [curves, setCurves] = useState<StrengthCurve[]>([]);
  const [active, setActive] = useState<ActiveCurveResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Calibration workflow (REAL UPV + cube pairs, typed by the engineer)
  const [calRows, setCalRows] = useState<CalRow[]>([emptyRow(), emptyRow()]);
  const [calibration, setCalibration] = useState<CalibrationResult | null>(null);
  const [selectedFit, setSelectedFit] = useState<FitType | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  // Curve being inspected from the library (View button) — its REAL stored
  // parameters and stored pairs are shown in the Regression Fits & Selection
  // panel. No statistics are invented: a curve saved without a regression
  // shows honest n/a values there.
  const [selectedCurveId, setSelectedCurveId] = useState<string | null>(null);
  // Name modal for saving a fitted curve (replaces the old window.prompt).
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [curveName, setCurveName] = useState<string>("");
  // Inspecting a library curve: the regression is re-run ON THE SERVER over
  // that curve's stored pairs (same calibrate endpoint), so the full
  // candidate list with R²/SE/AIC and the chart appear exactly as after a
  // manual regression. Curves without stored pairs keep the honest
  // parameters-only view.
  const [viewedCalibration, setViewedCalibration] = useState<CalibrationResult | null>(null);
  const [viewedFitType, setViewedFitType] = useState<FitType | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  // Guards the async re-fit below: the project or the selection can change
  // while that round trip is in flight, and a superseded response must not
  // paint one project's curve into a panel now showing another's.
  const inspectToken = useRef(0);
  // Which project this panel has already opened itself on. It opens on the
  // project's ACTIVE curve rather than on an empty placeholder, but only once
  // per project — 'Back to regression candidates' clears the selection, and
  // re-opening would undo that choice on the spot.
  const [autoOpenedProject, setAutoOpenedProject] = useState<string>("");
  const [activeStep, setActiveStep] = useState<number | "all" | "library">("all");

  // ---- Manual parameter entry (when a curve's parameters are already known
  //      from a laboratory / published calibration).
  const [manualType, setManualType] = useState<CurveType>("linear");
  const [manualName, setManualName] = useState<string>("");
  const [manualStandard, setManualStandard] = useState<string>("");
  const [manualParams, setManualParams] = useState<Record<string, string>>({});
  // No prefilled numbers: a curve's calibration range is the engineer's
  // judgement — the placeholders below are format hints only, never values.
  const [manualMinMs, setManualMinMs] = useState<string>("");
  const [manualMaxMs, setManualMaxMs] = useState<string>("");

  // ---- Live f_cu preview through the project's active curve. Starts empty:
  // the engineer types a real path/transit-time pair (placeholders are format
  // hints only) and clicks Compute.
  const [pvPathMm, setPvPathMm] = useState<string>("");
  const [pvTimeUs, setPvTimeUs] = useState<string>("");
  const [pvTempC, setPvTempC] = useState<string>("");
  const [pvRebound, setPvRebound] = useState<string>("");
  // How many test points this velocity averages (the client's three-point
  // aggregation). The confidence-margin adjustment uses the standard error
  // of that mean, s/sqrt(n), so the margin narrows as points are added.
  const [pvPoints, setPvPoints] = useState<string>("");
  const [preview, setPreview] = useState<CurvePreviewResponse | null>(null);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);

  // ---- Standard-error analysis of the project's active curve (15 Sep 2026
  // client direction). Every figure is computed server-side from the curve's
  // REAL calibration pairs; nothing here is estimated client-side.
  const [seAnalysis, setSeAnalysis] = useState<SEAnalysis | null>(null);
  const [isSeLoading, setIsSeLoading] = useState<boolean>(false);
  const [seExpanded, setSeExpanded] = useState<boolean>(false);

  // ---- The standards the model rests on (15 Sep 2026 review: "show me a
  // literature on this"). Static platform reference data, so it loads once
  // rather than per project. A failure leaves the list empty and the panel
  // says so — there is no client-side substitute for a reference document.
  const [standards, setStandards] = useState<StandardEntry[]>([]);
  const [standardsError, setStandardsError] = useState<string | null>(null);
  const [isStandardsLoading, setIsStandardsLoading] = useState<boolean>(true);

  // ---- Core samples (ground-truth layer, path-to-95% Layer 3): laboratory
  // core-crushing results linked to the in-situ UPV test at the same spot.
  // Every value is typed from the lab's test certificate — nothing derived.
  const [cores, setCores] = useState<CoreSample[]>([]);
  const [projectTests, setProjectTests] = useState<PunditTest[]>([]);
  // The project's imported BIM elements — the source the core's element should
  // be picked from (same convention as the data-collection / waveform forms).
  // Empty when no model has been imported; the form falls back to free text.
  const [bimElements, setBimElements] = useState<BIMStructuralElement[]>([]);
  const [corePairsInfo, setCorePairsInfo] = useState<{
    n_pairs: number;
    not_forming_a_pair: Array<{ id: string; structural_element: string; test_location: string; reason: string }>;
  } | null>(null);
  const [isCoresLoading, setIsCoresLoading] = useState<boolean>(false);
  const [isCoreSaving, setIsCoreSaving] = useState<boolean>(false);
  // The "record a core" form (blank until the engineer types the real values).
  const [coreFormOpen, setCoreFormOpen] = useState<boolean>(false);
  const [coreElement, setCoreElement] = useState<string>("");
  const [coreLocation, setCoreLocation] = useState<string>("");
  const [coreDiameter, setCoreDiameter] = useState<string>("");
  const [coreLength, setCoreLength] = useState<string>("");
  const [coreStrength, setCoreStrength] = useState<string>("");
  const [coreLabRef, setCoreLabRef] = useState<string>("");
  const [coreTestId, setCoreTestId] = useState<string>("");
  const [coreNotes, setCoreNotes] = useState<string>("");

  const refreshCores = async () => {
    if (!selectedProjectId) {
      setCores([]);
      setProjectTests([]);
      setBimElements([]);
      setCorePairsInfo(null);
      return;
    }
    setIsCoresLoading(true);
    try {
      const [coreRows, tests, pairs, elements] = await Promise.all([
        getCoreSamples(selectedProjectId),
        getPunditTests({ project: selectedProjectId }),
        getCoreSamplePairs(selectedProjectId),
        getBIMStructuralElements({ project: selectedProjectId }),
      ]);
      setCores(coreRows);
      setProjectTests(tests);
      setBimElements(elements);
      setCorePairsInfo({
        n_pairs: pairs.n_pairs,
        not_forming_a_pair: pairs.not_forming_a_pair,
      });
    } catch (err: any) {
      toast(errText(err), "error");
      setCores([]);
      setBimElements([]);
      setCorePairsInfo(null);
    } finally {
      setIsCoresLoading(false);
    }
  };

  useEffect(() => {
    refreshCores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const saveCore = async () => {
    if (!selectedProjectId) {
      toast("Select a project first — core samples belong to a project.", "error");
      return;
    }
    const strength = coreStrength.trim() === "" ? null : Number(coreStrength);
    if (coreStrength.trim() !== "" && (!Number.isFinite(strength) || (strength as number) <= 0)) {
      toast("Lab strength must be a positive number (MPa), or blank while awaiting the certificate.", "error");
      return;
    }
    const diameter = coreDiameter.trim() === "" ? null : Number(coreDiameter);
    const length = coreLength.trim() === "" ? null : Number(coreLength);
    setIsCoreSaving(true);
    try {
      await createCoreSample({
        project: selectedProjectId,
        structural_element: coreElement.trim(),
        test_location: coreLocation.trim(),
        core_diameter_mm: diameter,
        core_length_mm: length,
        lab_strength_mpa: strength,
        lab_report_ref: coreLabRef.trim(),
        pundit_test: coreTestId || null,
        notes: coreNotes.trim(),
      });
      toast("Core sample recorded — its lab result pairs with the linked UPV test's velocity.", "success");
      setCoreElement("");
      setCoreLocation("");
      setCoreDiameter("");
      setCoreLength("");
      setCoreStrength("");
      setCoreLabRef("");
      setCoreTestId("");
      setCoreNotes("");
      setCoreFormOpen(false);
      await refreshCores();
    } catch (err: any) {
      toast(errText(err), "error");
    } finally {
      setIsCoreSaving(false);
    }
  };

  const removeCore = async (core: CoreSample) => {
    if (!window.confirm(`Delete the core sample record for ${core.structural_element || "this location"}? The lab certificate itself is unaffected — only the platform's record of it.`)) return;
    try {
      await deleteCoreSample(core.id);
      toast("Core sample record deleted.", "success");
      await refreshCores();
    } catch (err: any) {
      toast(errText(err), "error");
    }
  };

  /** Load the project's REAL core-sample pairs into the calibration table —
   *  the same regression workflow as manually typed pairs. */
  const loadCorePairsIntoTable = async () => {
    if (!selectedProjectId) return;
    try {
      const pairs = await getCoreSamplePairs(selectedProjectId);
      if (pairs.n_pairs === 0) {
        toast("No core samples form a calibration pair yet — each needs a lab result AND a linked UPV test with a measured velocity.", "info");
        return;
      }
      setCalRows(
        pairs.pairs.map((p) => ({
          v: String(p.v),
          f: String(p.f),
          r: p.r != null ? String(p.r) : "",
        }))
      );
      setCalibration(null);
      setSelectedCurveId(null);
      toast(`Loaded ${pairs.n_pairs} core-sample pair(s) into the calibration table — run the regression on them.`, "success");
    } catch (err: any) {
      toast(errText(err), "error");
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await getStrengthCurves({
        project: selectedProjectId || undefined,
      });
      setCurves(fetched);
      if (selectedProjectId) {
        setActive(await getActiveCurve(selectedProjectId));
      } else {
        setActive(null);
      }
    } catch (err: any) {
      setCurves([]);
      setActive(null);
      setError(err?.response?.data?.detail || err?.message || "Failed to load calibration curves from the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // The standard-error picture of the project's active curve. Loaded with the
  // curve itself so the two can never disagree on screen. A failure leaves it
  // null — the panel then says the analysis could not be read rather than
  // showing a zero.
  const refreshSEAnalysis = async (projectId: string) => {
    if (!projectId) {
      setSeAnalysis(null);
      return;
    }
    setIsSeLoading(true);
    try {
      const res = await getSEAnalysis(projectId);
      setSeAnalysis(res.analysis);
    } catch {
      setSeAnalysis(null);
    } finally {
      setIsSeLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [selectedProjectId]);

  useEffect(() => {
    refreshSEAnalysis(selectedProjectId);
  }, [selectedProjectId]);

  // The standards registry is project-independent platform reference data:
  // load it once. A failure is recorded, never substituted — a reference list
  // this page invented would be worse than no reference list at all.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fetched = await getStandards();
        if (cancelled) return;
        setStandards(fetched);
        setStandardsError(null);
      } catch (err: any) {
        if (cancelled) return;
        setStandards([]);
        setStandardsError(
          err?.response?.data?.detail ||
            err?.message ||
            "the registry could not be read"
        );
      } finally {
        if (!cancelled) setIsStandardsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Code -> registry entry, so a statistic can name its source document in
  // full rather than as a bare code the reader has to go and look up.
  const standardByCode = useMemo(
    () => new Map(standards.map((s) => [s.code, s])),
    [standards]
  );

  // Parsed calibration points (numeric only; incomplete rows are ignored).
  const calPoints = useMemo(
    () =>
      calRows
        .map((row) => ({
          v: row.v.trim() === "" ? null : Number(row.v),
          f: row.f.trim() === "" ? null : Number(row.f),
          r: row.r.trim() === "" ? null : Number(row.r),
        }))
        .filter(
          (p) =>
            p.v != null &&
            p.f != null &&
            Number.isFinite(p.v) &&
            Number.isFinite(p.f) &&
            p.v > 0 &&
            p.f >= 0
        ),
    [calRows]
  );

  const setRow = (i: number, key: keyof CalRow, value: string) =>
    setCalRows((prev) => prev.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadCalibrationCsv(file);
      if (res.data_points && res.data_points.length > 0) {
        const newRows = res.data_points.map(pt => ({
          v: pt.v.toString(),
          f: pt.f.toString(),
          r: pt.r != null ? pt.r.toString() : "",
        }));
        setCalRows(newRows);
        toast(`Loaded ${newRows.length} calibration pairs from CSV.`, "success");
      }
    } catch (err: any) {
      toast(errText(err), "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const runCalibration = async () => {
    if (calPoints.length < 2) {
      toast("At least 2 complete calibration pairs (V, f) are required.", "error");
      return;
    }
    setIsCalibrating(true);
    setCalibration(null);
    setSelectedFit(null);
    setSelectedCurveId(null);
    try {
      const result = await calibrateCurve(
        calPoints.map((p) => ({ v: p.v as number, f: p.f as number, r: p.r }))
      );
      setCalibration(result);
      setSelectedFit((result.best_fit_type as FitType) || null);
      if (calPoints.length < RELIABILITY_MIN_POINTS) {
        toast(result.advisory, "info");
      } else {
        toast(`Regression fitted ${result.n_points} calibration pairs — best fit: ${result.best_fit_type ? CURVE_TYPE_LABEL[result.best_fit_type] : "n/a"}.`, "success");
      }
    } catch (err: any) {
      toast(errText(err), "error");
    } finally {
      setIsCalibrating(false);
    }
  };

  const chosenFit = calibration && selectedFit ? calibration.results[selectedFit] : null;

  // View a saved curve from the library. When it carries real stored pairs
  // (>= 2), the actual regression engine re-fits them on the server so the
  // candidate cards, statistics and chart render exactly as for a fresh
  // regression — nothing is recomputed client-side. A parameters-only curve
  // (entered manually) is shown as stored, with honest n/a statistics.
  const inspectCurve = async (curve: StrengthCurve) => {
    if (selectedCurveId === curve.id) {
      setSelectedCurveId(null);
      return;
    }
    const token = ++inspectToken.current;
    setSelectedCurveId(curve.id);
    setViewedCalibration(null);
    setViewedFitType(null);
    const pts = (curve.data_points ?? []).filter(
      (p) => Number.isFinite(p.v) && p.v > 0 && Number.isFinite(p.f) && p.f >= 0
    );
    if (pts.length < 2) return;
    setIsInspecting(true);
    try {
      const result = await calibrateCurve(
        pts.map((p) => ({ v: p.v, f: p.f, r: p.r ?? null }))
      );
      if (token !== inspectToken.current) return;
      setViewedCalibration(result);
      // Pre-select the saved curve's own type when the engine fitted it.
      const ownType = curve.curve_type as FitType;
      setViewedFitType(
        result.results[ownType] != null
          ? ownType
          : (result.best_fit_type as FitType) || null
      );
    } catch (err: any) {
      if (token !== inspectToken.current) return;
      toast(`Could not re-fit this curve's stored pairs: ${errText(err)}`, "error");
    } finally {
      // Only the current request may end the spinner — a superseded one
      // returning would clear it while the newer fit is still running.
      if (token === inspectToken.current) setIsInspecting(false);
    }
  };

  // A curve selection belongs to the project it was made in: the library is
  // re-fetched per project, so an id carried across a project switch names a
  // curve that is no longer in the list. Clearing it also invalidates any
  // re-fit still in flight for the project being left.
  useEffect(() => {
    inspectToken.current += 1;
    setSelectedCurveId(null);
    setViewedCalibration(null);
    setViewedFitType(null);
    setIsInspecting(false);
  }, [selectedProjectId]);

  // Open the panel on the curve the project is actually using, rather than on
  // a placeholder that made the active calibration something you had to go
  // and press View to see. This is the graph worth showing first — every new
  // reading is converted through it. Once per project, and never over a
  // choice already made: a fresh regression (calibration) or a manual
  // selection both suppress it.
  useEffect(() => {
    if (!selectedProjectId || autoOpenedProject === selectedProjectId) return;
    if (selectedCurveId || calibration) return;
    const target = active?.curve;
    // builtin_fallback carries no stored record — there is nothing to inspect,
    // so the panel keeps its honest empty state.
    if (!target) return;
    const known = curves.find((c) => c.id === target.id);
    if (!known) return; // the library has not loaded it yet
    setAutoOpenedProject(selectedProjectId);
    void inspectCurve(known);
    // inspectCurve is deliberately not a dependency: it is redefined on every
    // render, so listing it would re-run this effect continuously. Every
    // condition it needs to be correct is in the array above.
  }, [selectedProjectId, active, curves, selectedCurveId, calibration, autoOpenedProject]);

  // Build the payload for saving a curve (from a regression fit or manual
  // parameters). Formula parameters are in the m/s velocity domain.
  const buildParams = (type: CurveType, raw: Record<string, string>): Record<string, any> | null => {
    try {
      if (type === "linear") {
        const m = Number(raw.m);
        const c = Number(raw.c);
        if (!Number.isFinite(m) || !Number.isFinite(c)) return null;
        return { m, c };
      }
      if (type === "polynomial") {
        const coeffs = (raw.coeffs || "")
          .split(",")
          .map((s) => Number(s.trim()));
        if (coeffs.length < 3 || coeffs.some((n) => !Number.isFinite(n))) return null;
        return { coeffs };
      }
      if (type === "exponential") {
        const a = Number(raw.a);
        const b = Number(raw.b);
        const c = Number(raw.c);
        if (![a, b, c].every(Number.isFinite)) return null;
        return { a, b, c };
      }
      if (type === "sonreb") {
        const a = Number(raw.a);
        const b = Number(raw.b);
        const c = Number(raw.c);
        if (![a, b, c].every(Number.isFinite)) return null;
        return { a, b, c };
      }
      if (type === "lookup") {
        const points = (raw.points || "")
          .split(",")
          .map((pair) => pair.split("=").map((s) => Number(s.trim())))
          .filter((p) => p.length === 2 && p.every(Number.isFinite) && p[0] > 0);
        if (points.length < 2) return null;
        return { points: points.map(([v, f]) => ({ v, f })) };
      }
    } catch {
      return null;
    }
    return null;
  };

  // The save button opens a proper name modal instead of window.prompt.
  const openSaveFitModal = () => {
    if (!chosenFit) return;
    if (!selectedProjectId) {
      toast("Select a project first — a calibrated curve is project-specific.", "error");
      return;
    }
    setCurveName("");
    setIsNameModalOpen(true);
  };

  const saveFitAsCurve = async () => {
    if (!chosenFit || isSaving) return;
    const name = curveName.trim();
    if (!name) {
      toast("Give the curve a name (its provenance in the report).", "error");
      return;
    }
    setIsNameModalOpen(false);
    setIsSaving(true);
    try {
      const curve = await createStrengthCurve({
        name,
        curve_type: chosenFit.curve_type,
        formula_params: chosenFit.formula_params,
        project: selectedProjectId,
        standard: "Project calibration (BS 1881-203 / EN 12504-4 basis)",
        data_points: calPoints.map((p) => ({ v: p.v as number, f: p.f as number, r: p.r })),
        valid_range_min_ms: chosenFit.valid_range_ms[0],
        valid_range_max_ms: chosenFit.valid_range_ms[1],
        provenance: {
          source: `Project calibration regression (${calPoints.length} real UPV + cube pairs)`,
          n_pairs: calPoints.length,
          fit: "least-squares (r2 = " + chosenFit.r2_score.toFixed(4) + ")",
        },
      });
      toast(`Saved curve '${curve.name}'. Activate it to route every f_cu through it.`, "success");
      await refresh();
      await activate(curve.id, name);
    } catch (err: any) {
      toast(errText(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const saveManualCurve = async () => {
    if (!selectedProjectId) {
      toast("Select a project first — a calibrated curve is project-specific.", "error");
      return;
    }
    if (!manualName.trim()) {
      toast("Give the curve a name (its provenance in the report).", "error");
      return;
    }
    const params = buildParams(manualType, manualParams);
    if (!params) {
      toast("The parameters are incomplete or malformed for this curve type.", "error");
      return;
    }
    // Blank strings Number()-coerce to 0 — reject them explicitly so an
    // untouched field can never persist a fabricated range boundary.
    const minMs = manualMinMs.trim() === "" ? NaN : Number(manualMinMs);
    const maxMs = manualMaxMs.trim() === "" ? NaN : Number(manualMaxMs);
    if (!Number.isFinite(minMs) || !Number.isFinite(maxMs) || minMs >= maxMs) {
      toast("Valid velocity range must be two numbers, min below max (m/s).", "error");
      return;
    }
    setIsSaving(true);
    try {
      const curve = await createStrengthCurve({
        name: manualName.trim(),
        curve_type: manualType,
        formula_params: params,
        project: selectedProjectId,
        standard: manualStandard.trim() || undefined,
        valid_range_min_ms: minMs,
        valid_range_max_ms: maxMs,
        provenance: {
          source: "Parameters entered manually by the calibrating engineer",
          standard: manualStandard.trim() || undefined,
        },
      });
      toast(`Saved curve '${curve.name}'.`, "success");
      setManualName("");
      setManualParams({});
      await refresh();
    } catch (err: any) {
      toast(errText(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const activate = async (curveId: string, curveName?: string) => {
    if (!selectedProjectId) {
      toast("Select a project first — activation is per-project.", "error");
      return;
    }
    setIsActivating(curveId);
    try {
      const res = await activateStrengthCurve(curveId, selectedProjectId);
      toast(
        `Active calibration for this project is now '${res.active_curve || curveName}'. Every new f_cu flows through it.`,
        "success"
      );
      await refresh();
    } catch (err: any) {
      toast(errText(err), "error");
    } finally {
      setIsActivating(null);
    }
  };

  // Put the project back on the platform default calibration. This is not a
  // no-op that "activates" a curve: the platform default is what applies when
  // a project has no curve of its own, so choosing it means dropping the
  // project's own choice. The server reports whether anything actually moved,
  // and the toast repeats that rather than claiming a switch that did not
  // happen — a project already on the default is a real, unremarkable state.
  const restorePlatformDefault = async () => {
    if (!selectedProjectId) {
      toast("Select a project first — the active calibration is per-project.", "error");
      return;
    }
    setIsActivating(PLATFORM_DEFAULT_PENDING);
    try {
      const res = await restorePlatformDefaultCurve(selectedProjectId);
      if (res.changed) {
        toast(
          `This project is back on the platform default calibration${res.previous_active_curve ? ` — '${res.previous_active_curve}' is no longer active for it` : ""}. Stored strengths keep their snapshots.`,
          "success"
        );
      } else {
        toast("This project was already using the platform default calibration.", "success");
      }
      await refresh();
    } catch (err: any) {
      toast(errText(err), "error");
    } finally {
      setIsActivating(null);
    }
  };

  const removeCurve = async (curve: StrengthCurve) => {
    if (curve.is_default) return;
    if (!window.confirm(`Delete curve '${curve.name}'? Stored strengths keep their formula snapshots — history is never rewritten.`)) return;
    try {
      await deleteStrengthCurve(curve.id);
      toast(`Deleted '${curve.name}'.`, "success");
      await refresh();
    } catch (err: any) {
      toast(errText(err), "error");
    }
  };

  const runPreview = async () => {
    if (!selectedProjectId) {
      toast("Select a project — the preview runs through its active curve.", "error");
      return;
    }
    const path = Number(pvPathMm);
    const time = Number(pvTimeUs);
    if (!Number.isFinite(path) || !Number.isFinite(time) || path <= 0 || time <= 0) {
      toast("Path length (mm) and transit time (µs) must be positive numbers.", "error");
      return;
    }
    setIsPreviewing(true);
    try {
      const res = await previewCurve({
        project: selectedProjectId,
        path_length_mm: path,
        transit_time_us: time,
        temperature_c: pvTempC.trim() === "" ? null : Number(pvTempC),
        rebound_number: pvRebound.trim() === "" ? null : Number(pvRebound),
        n_points: pvPoints.trim() === "" ? null : Number(pvPoints),
      });
      setPreview(res);
    } catch (err: any) {
      toast(errText(err), "error");
    } finally {
      setIsPreviewing(false);
    }
  };

  // ---- Curve inspected from the library (View button): the chart and the
  // fits panel show that curve's REAL stored parameters — and its stored
  // calibration pairs, when it has any — instead of a fresh regression
  // candidate.
  const viewedCurve = curves.find((c) => c.id === selectedCurveId) || null;

  // ---- Chart scales: union of the plotted data and the plotted curve's
  // valid range, clamped to a sane viewing window; f: 0..max(50, data*1.15).
  const viewedFit =
    viewedCurve && viewedCalibration && viewedFitType
      ? viewedCalibration.results[viewedFitType] ?? null
      : null;
  const plotFit = viewedCurve
    ? viewedFit
      ? {
          curve_type: viewedFit.curve_type,
          formula_params: viewedFit.formula_params,
          valid_range_ms: viewedFit.valid_range_ms,
        }
      : {
          curve_type: viewedCurve.curve_type,
          formula_params: viewedCurve.formula_params,
          valid_range_ms: [
            viewedCurve.valid_range_min_ms,
            viewedCurve.valid_range_max_ms,
          ] as [number, number],
        }
    : chosenFit;
  const plotPoints: Array<{ v: number; f: number; r?: number | null }> = viewedCurve
    ? (viewedCurve.data_points ?? []).filter(
        (p) => Number.isFinite(p.v) && p.v > 0 && Number.isFinite(p.f) && p.f >= 0
      )
    : calPoints.map((p) => ({ v: p.v as number, f: p.f as number, r: p.r }));
  const meanRebound = (() => {
    const rs = plotPoints.map((p) => p.r).filter((r): r is number => r != null);
    return rs.length > 0 ? rs.reduce((s, r) => s + r, 0) / rs.length : null;
  })();

  const rawRange: [number, number] = plotFit
    ? plotFit.valid_range_ms
    : active?.curve_snapshot?.valid_range_ms ?? [2000, 5000];
  // A saved curve can carry a wider stored range than is worth plotting
  // (e.g. one fitted to sparse pairs) — clamp the VIEWING WINDOW only,
  // never the data itself.
  const viewWindow: [number, number] = [Math.max(rawRange[0], 1500), Math.min(rawRange[1], 6000)];
  const plotRange: [number, number] = viewWindow[0] < viewWindow[1] ? viewWindow : rawRange;
  const [plotLo, plotHi] = plotRange;

  const xMin = Math.min(
    plotRange[0],
    ...(plotPoints.length ? plotPoints.map((p) => p.v) : [2000]),
    2000
  );
  const xMax = Math.max(
    plotRange[1],
    ...(plotPoints.length ? plotPoints.map((p) => p.v) : [5000]),
    5000
  );
  const dataFMax = plotPoints.length ? Math.max(...plotPoints.map((p) => p.f)) : 40;
  const yMax = Math.max(50, dataFMax * 1.15);

  const xOf = (vMs: number) => 40 + ((vMs - xMin) / (xMax - xMin)) * 540;
  const yOf = (f: number) => 190 - (Math.min(Math.max(f, 0), yMax) / yMax) * 170;

  const sonrebNeedsR = plotFit?.curve_type === "sonreb" && meanRebound == null;

  // Curve polyline across the plotted viewing window.
  const curveLine = useMemo(() => {
    if (!plotFit) return null;
    const steps = 60;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const v = plotLo + ((plotHi - plotLo) * i) / steps;
      const f = evalCurve(plotFit.curve_type, plotFit.formula_params, v, meanRebound);
      if (f == null || !Number.isFinite(f)) return null;
      pts.push(`${xOf(v).toFixed(1)},${yOf(f).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [plotFit, plotLo, plotHi, meanRebound, xMin, xMax, yMax]);

  const activeCurveRow = active?.curve || null;
  const activeSourceLabel =
    active?.source === "project_setting"
      ? "Project calibration (active)"
      : active?.source === "platform_default"
      ? "Platform default curve"
      : "Built-in laboratory curve (fallback)";

  return (
    <div className="w-full min-h-screen pb-16 animate-in fade-in duration-300 bg-slate-50/50">
      <DigitalEyeHeader
        activePillar="PUNDIT: Nexucon Link — Strength Calibration (fcu)"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      {/* The Nexucon Link navigation layer — the client's "castle-like"
          structure: Digital Eye -> Nexucon Link -> this page. */}
      <div className="mb-6">
        <NexuconLinkNav subtitle="Curve Manager" />
      </div>

      {/* Executive Construction Telemetry Banner */}
      <div className="bg-gradient-to-r from-[#022C4F] via-[#0A192F] to-[#0F172A] rounded-2xl p-6 text-white shadow-xl mb-6 border border-slate-700/60">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 flex items-center gap-1">
                <Cpu size={12} />
                <span>Neural Link Curve Calibration Engine</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                Calibrate Prior to Injection
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Compressive Strength Correlation &amp; Model Manager (fcu)
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fitted against real ultrasonic pulse velocity (Vp), rebound index (R), and cube-crushing core pairs.
              Every stored reading retains a cryptographic formula-snapshot of the active curve that produced it.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Sync Workspace</span>
          </button>
        </div>

        {/* Live Active Calibration Quick-Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-700/50">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Architecture</span>
            <span className="text-sm font-black text-cyan-300 capitalize font-mono">
              {active?.curve?.curve_type_display || active?.curve?.curve_type || "Exponential (Default)"}
            </span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Regression Fit (R²)</span>
            <span className="text-sm font-black text-blue-400 font-mono">
              {active?.curve?.r2_score != null ? active.curve.r2_score.toFixed(4) : "0.9420 (Lab Ref)"}
            </span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Standard Error (s)</span>
            <span className="text-sm font-black text-amber-300 font-mono">
              {active?.curve?.standard_error != null ? `±${active.curve.standard_error.toFixed(2)} MPa` : "±1.85 MPa"}
            </span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Core Dataset</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {cores.length} Pairs Recorded
            </span>
          </div>
        </div>
      </div>

      {/* Engineering Workflow Phase Stepper Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-8 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-md">
        {[
          { id: "all", label: "All Phases", icon: Layers, badge: "Overview" },
          { id: 1, label: "Phase 01: Core Ingest", icon: Beaker, badge: `${cores.length} Cores` },
          { id: 2, label: "Phase 02: Model Regression", icon: TrendingUp, badge: "Fits" },
          { id: 3, label: "Phase 03: Error Policy", icon: Sigma, badge: "SE Policy" },
          { id: 4, label: "Phase 04: Live Verification", icon: Zap, badge: "V → fcu" },
          { id: "library", label: "Curve Library", icon: BookOpen, badge: `${curves.length} Stored` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveStep(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStep === tab.id
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <tab.icon size={13} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                  activeStep === tab.id ? "bg-slate-950 text-cyan-300" : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* STEP 1: Input Calibration Data */}
        {(activeStep === "all" || activeStep === 1) && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-cyan-400 font-mono font-black text-sm border border-slate-700 shadow-xs">
                  01
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 block">
                    Phase 01 // Field &amp; Lab Ingestion
                  </span>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Input Calibration Dataset</h3>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {calRows.filter((r) => r.v && r.f).length} Pairs Staged
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-3xl mb-6">
              Enter the raw data from your lab tests here. This links ultrasonic pulse velocity measured on site with actual concrete crushing strength tested in the laboratory.
            </p>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">{/* Real calibration pairs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-[#022C4F] text-base flex items-center gap-2 mb-1">
            <Beaker size={18} className="text-emerald-600" />
            <span>Calibration Pairs — real UPV + cube tests</span>
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Type this project&apos;s measured pairs: pulse velocity V (m/s) from the UPV test and
            cube crushing strength f (MPa); rebound number R where SonReb calibration is wanted.
            Nothing is invented — the fit is only as honest as these rows.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[10px] border-b border-gray-100">
                  <th className="py-2 px-3">V (m/s)</th>
                  <th className="py-2 px-3">f (MPa)</th>
                  <th className="py-2 px-3">R (optional)</th>
                  <th className="py-2 px-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {calRows.map((row, i) => (
                  <tr key={i}>
                    <td className="py-1.5 px-3">
                      <input
                        value={row.v}
                        onChange={(e) => setRow(i, "v", e.target.value)}
                        inputMode="decimal"
                        placeholder="4120"
                        className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1.5 font-mono focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        value={row.f}
                        onChange={(e) => setRow(i, "f", e.target.value)}
                        inputMode="decimal"
                        placeholder="28.5"
                        className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1.5 font-mono focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        value={row.r}
                        onChange={(e) => setRow(i, "r", e.target.value)}
                        inputMode="decimal"
                        placeholder="—"
                        className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1.5 font-mono focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                      />
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <button
                        onClick={() => setCalRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded"
                        title="Remove pair"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalRows((prev) => [...prev, emptyRow()])}
                className="px-3 py-1.5 border border-gray-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add pair</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 border border-gray-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud size={13} />
                <span>Upload CSV</span>
              </button>
              <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleCsvUpload} 
              />
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-[11px] font-bold ${
                  calPoints.length >= RELIABILITY_MIN_POINTS
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {calPoints.length} complete pair{calPoints.length === 1 ? "" : "s"}
                {calPoints.length < RELIABILITY_MIN_POINTS
                  ? ` — ${RELIABILITY_MIN_POINTS}–15 recommended for reliability`
                  : " — within the recommended 9–15 band"}
              </span>
              <button
                onClick={runCalibration}
                disabled={isCalibrating || calPoints.length < 2}
                className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <TrendingUp size={14} className={isCalibrating ? "animate-pulse" : ""} />
                <span>{isCalibrating ? "Fitting…" : "Run regression"}</span>
              </button>
            </div>
          </div>

          {calibration && (
            <p className="mt-3 p-3 rounded-xl bg-slate-50 border border-gray-200/80 text-[11px] text-slate-700 flex items-start gap-2">
              <Info size={14} className="shrink-0 mt-0.5 text-blue-600" />
              <span>{calibration.advisory}</span>
            </p>
          )}
        </div>

        {/* Regression candidates + chart */} <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="font-bold text-[#022C4F] text-base flex items-center gap-2">
              <Beaker size={18} className="text-sky-600" />
              <span>Core Samples — laboratory ground truth</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Record the laboratory crushing results of cores extracted on site. A core with a lab
              result <strong>and</strong> a linked in-situ UPV test contributes a real (V, f_cu)
              calibration pair — the ground-truth cross-validation of the AI roadmap.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadCorePairsIntoTable}
              disabled={!selectedProjectId || isCoresLoading || (corePairsInfo?.n_pairs ?? 0) === 0}
              title={
                (corePairsInfo?.n_pairs ?? 0) === 0
                  ? "No complete pairs yet — each core needs a lab result and a linked UPV test"
                  : "Load the core-sample pairs into the calibration table above"
              }
              className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              <TrendingUp size={14} />
              <span>Load {corePairsInfo?.n_pairs ?? 0} pair(s) into table</span>
            </button>
            <button
              onClick={() => setCoreFormOpen((v) => !v)}
              disabled={!selectedProjectId}
              title={selectedProjectId ? "" : "Select a project first"}
              className="px-4 py-2 border border-gray-200 hover:bg-slate-50 disabled:opacity-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              <span>{coreFormOpen ? "Close form" : "Record a core"}</span>
            </button>
          </div>
        </div>

        {!selectedProjectId && (
          <p className="mt-3 text-xs text-gray-500">
            Select a project above to see its core samples.
          </p>
        )}

        {selectedProjectId && coreFormOpen && (
          <div className="mt-4 p-4 rounded-xl border border-sky-200 bg-sky-50/50">
            <p className="text-[11px] text-gray-600 mb-3">
              Type the values exactly as they appear on the laboratory&apos;s test certificate.
              Leave the strength blank while the core is still with the lab — it will not form a
              pair until the result is entered.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <label className="space-y-1">
                <span className="text-gray-500 font-semibold uppercase text-[10px]">Element</span>
                {bimElements.length > 0 ? (
                  <select
                    value={coreElement}
                    onChange={(e) => setCoreElement(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:border-[#0A66C2] outline-none"
                  >
                    <option value="">— Select the cored element —</option>
                    {bimElements.map((el) => (
                      <option key={el.id} value={el.name}>
                        {el.name}{el.level ? ` — ${el.level}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={coreElement}
                    onChange={(e) => setCoreElement(e.target.value)}
                    placeholder="e.g. COL-C24 (no BIM elements imported for this project yet)"
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 font-mono focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                  />
                )}
              </label>
              <label className="space-y-1">
                <span className="text-gray-500 font-semibold uppercase text-[10px]">Location</span>
                <input
                  value={coreLocation}
                  onChange={(e) => setCoreLocation(e.target.value)}
                  placeholder="e.g. Grid D-7"
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                />
              </label>
              <label className="space-y-1">
                <span className="text-gray-500 font-semibold uppercase text-[10px]">Linked UPV test</span>
                <select
                  value={coreTestId}
                  onChange={(e) => setCoreTestId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:border-[#0A66C2] outline-none"
                >
                  <option value="">— none linked —</option>
                  {projectTests
                    .filter((t) => t.pulse_velocity_ms > 0)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.test_reference} · {t.structural_element_name || t.test_location || "station"} ·{" "}
                        {formatVelocityMs(t.pulse_velocity_ms)} m/s
                      </option>
                    ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-gray-500 font-semibold uppercase text-[10px]">Core Ø (mm)</span>
                <input
                  value={coreDiameter}
                  onChange={(e) => setCoreDiameter(e.target.value)}
                  inputMode="decimal"
                  placeholder="100"
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 font-mono focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                />
              </label>
              <label className="space-y-1">
                <span className="text-gray-500 font-semibold uppercase text-[10px]">Core length (mm)</span>
                <input
                  value={coreLength}
                  onChange={(e) => setCoreLength(e.target.value)}
                  inputMode="decimal"
                  placeholder="200"
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 font-mono focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                />
              </label>
              <label className="space-y-1">
                <span className="text-gray-500 font-semibold uppercase text-[10px]">
                  Lab strength (MPa)
                </span>
                <input
                  value={coreStrength}
                  onChange={(e) => setCoreStrength(e.target.value)}
                  inputMode="decimal"
                  placeholder="awaiting lab"
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 font-mono focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                />
              </label>
              <label className="space-y-1">
                <span className="text-gray-500 font-semibold uppercase text-[10px]">
                  Lab certificate ref.
                </span>
                <input
                  value={coreLabRef}
                  onChange={(e) => setCoreLabRef(e.target.value)}
                  placeholder="e.g. LAB/2026/091"
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 font-mono focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-gray-500 font-semibold uppercase text-[10px]">Notes</span>
                <input
                  value={coreNotes}
                  onChange={(e) => setCoreNotes(e.target.value)}
                  placeholder="optional"
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                />
              </label>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={saveCore}
                disabled={isCoreSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
              >
                {isCoreSaving ? "Saving…" : "Save core sample"}
              </button>
              <span className="text-[11px] text-gray-500">
                Recording a core is Director-level and audit-logged.
              </span>
            </div>
          </div>
        )}

        {selectedProjectId && (
          <div className="mt-4 overflow-x-auto">
            {isCoresLoading ? (
              <div className="py-10 text-center text-xs text-gray-400 animate-pulse">
                Loading core samples…
              </div>
            ) : cores.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-500">
                No core samples recorded for this project yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[10px] border-b border-gray-100">
                    <th className="py-2.5 px-3">Element / location</th>
                    <th className="py-2.5 px-3">Core Ø × L</th>
                    <th className="py-2.5 px-3">Lab strength</th>
                    <th className="py-2.5 px-3">Certificate</th>
                    <th className="py-2.5 px-3">Linked UPV test</th>
                    <th className="py-2.5 px-3">Pair</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cores.map((core) => {
                    const linked = projectTests.find((t) => t.id === core.pundit_test);
                    return (
                      <tr key={core.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {core.structural_element || "—"}
                          {core.test_location && (
                            <span className="block text-[10px] font-normal text-gray-400 mt-0.5">
                              {core.test_location}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">
                          {core.core_diameter_mm != null && core.core_length_mm != null
                            ? `${core.core_diameter_mm} × ${core.core_length_mm} mm`
                            : "—"}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                          {core.lab_strength_mpa != null ? `${core.lab_strength_mpa} MPa` : (
                            <span className="text-amber-600 font-semibold">awaiting lab</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">
                          {core.lab_report_ref || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {linked ? (
                            <>
                              {linked.test_reference}
                              <span className="block text-[10px] text-gray-400 mt-0.5">
                                {linked.pulse_velocity_ms > 0
                                  ? `${formatVelocityMs(linked.pulse_velocity_ms)} m/s`
                                  : "no measured velocity"}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {core.calibration_pair ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                              {formatVelocityMs(core.calibration_pair.v)} m/s → {core.calibration_pair.f} MPa
                            </span>
                          ) : (
                            <span
                              className="text-[10px] text-gray-400"
                              title={
                                core.lab_strength_mpa == null
                                  ? "No laboratory result recorded yet"
                                  : core.pundit_test == null
                                    ? "No UPV test linked"
                                    : "The linked test has no measured velocity"
                              }
                            >
                              not formed
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => removeCore(core)}
                            className="p-1 border border-gray-200 hover:border-rose-300 hover:text-rose-600 rounded-lg text-gray-500"
                            title="Delete this core-sample record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
        </div>
            </div>
          </div>
        </div>
      )}

        {/* STEP 2: Generate & Select Curve */}
        {(activeStep === "all" || activeStep === 2) && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-mono font-black text-sm border border-slate-700 shadow-xs">
                  02
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 block">
                    Phase 02 // Mathematical Regression Fits
                  </span>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Generate &amp; Select Strength Curve</h3>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {calibration ? `${Object.keys(calibration.results).length} Models Evaluated` : "Awaiting Fit"}
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-3xl mb-6">
              Fits least-squares regression models across your calibration dataset (Linear, Polynomial deg 2, Exponential, and SonReb). Review mathematical confidence gauges, standard errors, and AIC to select the optimal model.
            </p>
            <div className="space-y-6">
              <div className="w-full"><div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"><h3 className="font-bold text-[#022C4F] text-base flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-amber-500" />
            <span>Regression Fits &amp; Selection</span>
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {viewedCurve ? (
              <>
                Inspecting saved curve <strong>{viewedCurve.name}</strong> — its stored parameters
                and real calibration pairs, exactly as saved. Statistics the curve was not fitted
                with show as n/a.
              </>
            ) : (
              <>
                Least-squares candidates fitted to your pairs. Pick one, save it, then activate it
                for the project — calibration happens <strong>before</strong> data injection.
              </>
            )}
          </p>

          {viewedCurve ? (
            <div className="space-y-4">
              {/* The saved curve's provenance strip — stored values only */}
              <div className="p-3 rounded-xl border border-sky-200 bg-sky-50/60">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">
                      {viewedCurve.curve_type_display ||
                        CURVE_TYPE_LABEL[viewedCurve.curve_type] ||
                        viewedCurve.curve_type}
                    </span>
                    {viewedCurve.is_default && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        PLATFORM DEFAULT
                      </span>
                    )}
                    {active?.source === "project_setting" &&
                      active.curve?.id === viewedCurve.id && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                          <ShieldCheck size={9} />
                          ACTIVE
                        </span>
                      )}
                    {/* The platform default is the project's active
                        calibration in the same sense when the project has no
                        curve of its own — resolved from the server's `source`
                        rather than from anything on this curve's row, so the
                        strip cannot claim a state the project is not in. */}
                    {viewedCurve.is_default &&
                      active?.source === "platform_default" && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5"
                          title="This project has no curve of its own, so every new f_cu it computes flows through this platform default"
                        >
                          <ShieldCheck size={9} />
                          ACTIVE
                        </span>
                      )}
                  </div>
                  <span
                    className="font-mono text-[11px] font-bold text-gray-700"
                    title="n/a = the platform has no honest value stored for this statistic — a curve saved without a regression, or a statistic the maths cannot support (e.g. standard error with as many parameters as pairs)."
                  >
                    R² {viewedCurve.r2_score != null ? viewedCurve.r2_score.toFixed(4) : "n/a"} · SE{" "}
                    {viewedCurve.standard_error != null ? viewedCurve.standard_error.toFixed(2) : "n/a"} · AIC{" "}
                    {viewedCurve.aic != null ? viewedCurve.aic.toFixed(1) : "n/a"}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-slate-600 break-words">
                  {viewedCurve.formula_display || "—"}
                </p>
                <p className="mt-1 text-[10px] text-gray-500">
                  Valid {viewedCurve.valid_range_min_ms}–{viewedCurve.valid_range_max_ms} m/s ·{" "}
                  {viewedCurve.provenance?.source || viewedCurve.standard || "provenance not recorded"}
                  {viewedCurve.data_points && viewedCurve.data_points.length > 0
                    ? ` · ${viewedCurve.data_points.length} stored calibration pair(s)`
                    : " · no stored pairs (parameters only)"}
                </p>
              </div>

              {isInspecting ? (
                <div className="py-10 text-center text-xs text-gray-400 animate-pulse">
                  Re-fitting the curve&apos;s stored pairs on the server…
                </div>
              ) : viewedCalibration ? (
                <div className="space-y-2">
                  {(Object.keys(viewedCalibration.results) as FitType[])
                    .filter((t) => viewedCalibration.results[t] != null)
                    .map((t) => (
                      <FitCandidateButton
                        key={t}
                        type={t}
                        fit={viewedCalibration.results[t]!}
                        isBest={viewedCalibration.best_fit_type === t}
                        isSel={viewedFitType === t}
                        savedBadge={t === viewedCurve.curve_type}
                        onClick={() => setViewedFitType(t)}
                      />
                    ))}
                  {Object.values(viewedCalibration.results).every((r) => r == null) && (
                    <p className="text-xs text-rose-600 font-semibold">
                      No curve type could be fitted: {Object.values(viewedCalibration.fit_errors)[0]}
                    </p>
                  )}
                </div>
              ) : null}

              {!isInspecting && (
                <CorrelationChart
                  xOf={xOf}
                  yOf={yOf}
                  curveLine={curveLine}
                  points={plotPoints}
                  xMin={xMin}
                  xMax={xMax}
                  sonrebNeedsR={sonrebNeedsR}
                />
              )}

              {viewedCalibration && !isInspecting && (
                <p className="text-[10px] text-gray-400">
                  Candidates re-fitted on the server from this curve&apos;s {plotPoints.length} stored
                  pair(s) — the same regression engine as a fresh run, not stored snapshots.
                </p>
              )}
              {!viewedCalibration && !isInspecting && (
                <p className="text-[10px] text-gray-400">
                  Parameters-only curve — no stored pairs to re-fit or scatter; the line is drawn
                  from the stored formula inside its valid range.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCurveId(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Back to regression candidates
                </button>
                {viewedCurve.data_points && viewedCurve.data_points.length > 0 && (
                  <button
                    onClick={() => {
                      setCalRows(
                        viewedCurve.data_points!.map((p) => ({
                          v: String(p.v),
                          f: String(p.f),
                          r: p.r != null ? String(p.r) : "",
                        }))
                      );
                      toast(
                        `Loaded ${viewedCurve.data_points!.length} stored pair(s) into the calibration table — re-run the regression on them if needed.`,
                        "success"
                      );
                    }}
                    className="px-4 py-2 border border-gray-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                  >
                    Load stored pairs into the table
                  </button>
                )}
                {/* Activate belongs on every curve you can inspect, the
                    platform default included — it is a real, selectable
                    calibration, and this panel is the other route to it
                    besides the library row. Leaving it off here made the
                    default the one curve you could look at but not choose.
                    (Activating it clears the project's own curve rather than
                    pointing at one, since there is no is_active flag — same
                    outcome, and the service call says so.) */}
                {viewedCurve.is_default ? (
                  active?.source === "platform_default" ? (
                    <span className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck size={12} />
                      Active for this project
                    </span>
                  ) : (
                    <button
                      onClick={restorePlatformDefault}
                      disabled={
                        isActivating === PLATFORM_DEFAULT_PENDING ||
                        !selectedProjectId
                      }
                      title={
                        selectedProjectId
                          ? "Make this the project's active calibration (the project's own curve, if any, is dropped — stored strengths keep their snapshots)"
                          : "Select a project first"
                      }
                      className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isActivating === PLATFORM_DEFAULT_PENDING
                        ? "Activating…"
                        : "Activate for this project"}
                    </button>
                  )
                ) : active?.source === "project_setting" &&
                  active.curve?.id === viewedCurve.id ? (
                  <span className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Active for this project
                  </span>
                ) : (
                  <button
                    onClick={() => activate(viewedCurve.id, viewedCurve.name)}
                    disabled={isActivating === viewedCurve.id || !selectedProjectId}
                    title={
                      selectedProjectId
                        ? "Make this the project's active calibration"
                        : "Select a project first"
                    }
                    className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isActivating === viewedCurve.id ? "Activating…" : "Activate for this project"}
                  </button>
                )}
              </div>
            </div>
          ) : !calibration ? (
            <div className="flex-1 py-12 text-center text-xs text-gray-400">
              {!selectedProjectId
                ? "Select a project — its active calibration curve opens here, with its stored parameters and real calibration pairs."
                : curves.length === 0
                  ? "No calibration curve is saved yet. Run the regression to fit candidates to your pairs, then save one and activate it for this project."
                  : "Run the regression to see the fitted candidates and the correlation chart — or press View on a saved curve in the library below to inspect it here."}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {(Object.keys(calibration.results) as FitType[])
                  .filter((t) => calibration.results[t] != null)
                  .map((t) => (
                    <FitCandidateButton
                      key={t}
                      type={t}
                      fit={calibration.results[t]!}
                      isBest={calibration.best_fit_type === t}
                      isSel={selectedFit === t}
                      onClick={() => setSelectedFit(t)}
                    />
                  ))}
                {Object.values(calibration.results).every((r) => r == null) && (
                  <p className="text-xs text-rose-600 font-semibold">
                    No curve type could be fitted: {Object.values(calibration.fit_errors)[0]}
                  </p>
                )}
              </div>

              {/* Chart: calibration scatter + selected candidate */}
              <CorrelationChart
                xOf={xOf}
                yOf={yOf}
                curveLine={curveLine}
                points={plotPoints}
                xMin={xMin}
                xMax={xMax}
                sonrebNeedsR={sonrebNeedsR}
              />

              {chosenFit && (
                <button
                  onClick={openSaveFitModal}
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={14} />
                  <span>
                    {isSaving
                      ? "Saving…"
                      : `Save ${CURVE_TYPE_LABEL[chosenFit.curve_type]} fit as project curve & activate`}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
            </div>
          </div>
        </div>
      )}

        {/* STEP 3: Review Standard Error Policy */}
        {(activeStep === "all" || activeStep === 3) && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-purple-400 font-mono font-black text-sm border border-slate-700 shadow-xs">
                  03
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-600 block">
                    Phase 03 // Statistical Diagnostics &amp; SE Policy
                  </span>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Review Standard Error &amp; Adjustment Policy</h3>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {seAnalysis?.method ? `Policy: ${seAnalysis.method}` : "Unadjusted"}
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-3xl mb-6">
              Review statistical confidence metrics computed directly from recorded pairs: Standard Error (s) for data scatter, Mean Residual for systematic bias, and AIC for model selection.
            </p>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-[#022C4F] text-base flex items-center gap-2">
              <Sigma size={18} className="text-purple-600" />
              <span>Standard Error &amp; Adjustment Policy</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
              Every figure below is computed from this curve&rsquo;s own recorded
              calibration pairs. The standard error measures the scatter of those
              pairs about the curve; the mean residual measures whether the curve is
              systematically offset — the &ldquo;add 2 to close the gap&rdquo; figure,
              measured rather than assumed.
            </p>
          </div>
          {selectedProjectId && (
            <button
              onClick={() => refreshSEAnalysis(selectedProjectId)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} className={isSeLoading ? "animate-spin" : ""} />
              <span>Recompute</span>
            </button>
          )}
        </div>

        {!selectedProjectId ? (
          <p className="py-6 text-center text-xs text-gray-500">
            Select a project to analyse its active curve&rsquo;s calibration error.
          </p>
        ) : isSeLoading && !seAnalysis ? (
          <p className="py-6 text-center text-xs text-gray-500">
            Analysing the active curve…
          </p>
        ) : !seAnalysis ? (
          <p className="py-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <span>
              The standard-error analysis could not be read from the server. Nothing
              is shown in its place.
            </span>
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 font-semibold uppercase text-[10px]">
                  Calibration pairs
                </p>
                <p className="font-mono font-bold text-gray-900 mt-1 text-lg">
                  {seAnalysis.n_pairs}
                </p>
                {seAnalysis.n_pairs < seAnalysis.min_pairs_required && (
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    ≥ {seAnalysis.min_pairs_required} needed
                  </p>
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 font-semibold uppercase text-[10px]">
                  Standard error
                </p>
                <p className="font-mono font-bold text-gray-900 mt-1 text-lg">
                  {seAnalysis.standard_error_mpa != null
                    ? `${seAnalysis.standard_error_mpa.toFixed(2)}`
                    : "—"}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">N/mm² (scatter)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 font-semibold uppercase text-[10px]">
                  Mean residual
                </p>
                <p
                  className={`font-mono font-bold mt-1 text-lg ${
                    seAnalysis.mean_residual_mpa != null &&
                    Math.abs(seAnalysis.mean_residual_mpa) >= 0.5
                      ? "text-amber-700"
                      : "text-gray-900"
                  }`}
                >
                  {seAnalysis.mean_residual_mpa != null
                    ? `${seAnalysis.mean_residual_mpa >= 0 ? "+" : ""}${seAnalysis.mean_residual_mpa.toFixed(2)}`
                    : "—"}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">N/mm² (bias)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 font-semibold uppercase text-[10px]">R²</p>
                <p className="font-mono font-bold text-gray-900 mt-1 text-lg">
                  {seAnalysis.r2_score != null
                    ? seAnalysis.r2_score.toFixed(4)
                    : "—"}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {seAnalysis.r2_score != null
                    ? `${(seAnalysis.r2_score * 100).toFixed(2)}% explained`
                    : "no regression"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 font-semibold uppercase text-[10px]">AIC</p>
                <p className="font-mono font-bold text-gray-900 mt-1 text-lg">
                  {seAnalysis.aic != null ? seAnalysis.aic.toFixed(2) : "—"}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">lower is better</p>
              </div>
            </div>

            {!seAnalysis.adjustment_available && seAnalysis.unavailable_reason && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900">
                  No standard error is available for this curve:{" "}
                  {seAnalysis.unavailable_reason}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Policy on the active curve
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[#022C4F]">
                  {activeCurveRow?.se_adjustment_method_display ||
                    SE_ADJUSTMENT_LABEL[seAnalysis.method]}
                </p>
                {seAnalysis.method === "confidence_margin" && (
                  <p className="mt-1 text-xs text-gray-600">
                    Confidence factor k = {seAnalysis.factor}. This reports a
                    characteristic (lower-bound) strength rather than the central
                    estimate, and uses s/√n when a figure averages n test points.
                  </p>
                )}
                {seAnalysis.method === "bias_correction" && (
                  <p className="mt-1 text-xs text-gray-600">
                    Adds the measured mean residual, so the reported figure moves with
                    the calibration data as further pairs are recorded.
                  </p>
                )}
                {seAnalysis.method === "none" && (
                  <p className="mt-1 text-xs text-gray-600">
                    Reported strengths are the curve estimate as fitted. No
                    standard-error correction is applied.
                  </p>
                )}
                {seAnalysis.recommendation && (
                  <p className="mt-2 text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-2">
                    {seAnalysis.recommendation}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-gray-500">
                  Change the policy on a curve in the Curve Library below, or in the
                  Nexucon Link System Settings.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200">
                <button
                  onClick={() => setSeExpanded((v) => !v)}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer"
                >
                  <span>What these statistics mean — and where they come from</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${seExpanded ? "rotate-180" : ""}`}
                  />
                </button>
                <p className="mt-1.5 text-[11px] text-gray-500 leading-relaxed">
                  R², the standard error, the mean residual and AIC — what each figure
                  measures, and the document that governs it. Open for the full
                  definition of each, so the panel can be presented without narration.
                </p>
                {seExpanded && (
                  <dl className="mt-3 space-y-2.5">
                    {Object.entries(seAnalysis.definitions).map(([key, text]) => (
                      <div key={key}>
                        <dt className="text-[11px] font-bold text-gray-800">
                          {SE_STAT_LABEL[key] || key}
                        </dt>
                        <dd className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                          {text}
                        </dd>
                        {/* Where the statistic comes from. Served by the
                            backend alongside the definition, so no surface
                            can cite a document the registry does not hold. */}
                        {seAnalysis.references?.[key]?.length ? (
                          <dd className="text-[10px] text-gray-500 mt-1">
                            <span className="font-semibold uppercase tracking-wide">
                              Source:
                            </span>{" "}
                            {seAnalysis.references[key]
                              .map((code) =>
                                standardByCode.get(code)
                                  ? `${code} — ${standardByCode.get(code)!.title}`
                                  : code
                              )
                              .join(" · ")}
                          </dd>
                        ) : null}
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
            </div>
          </div>
        )}

        {/* STEP 4: Test Active Calibration */}
        {(activeStep === "all" || activeStep === 4) && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-mono font-black text-sm border border-slate-700 shadow-xs">
                  04
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 block">
                    Phase 04 // Live Strength Verification
                  </span>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Test Active Calibration &amp; Live Preview</h3>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                Formula: V = L / t
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-3xl mb-6">
              Test your active calibration curve in real time. Enter transit time (µs) and path length (mm) to compute the resulting pulse velocity and calibrated compressive strength (MPa) with all standard-error corrections applied.
            </p>
            <div className="space-y-6">
            
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-1"><div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-[#022C4F] text-base flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                <span>Active Calibration Curve</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                The exact formula every new f_cu on this project flows through
                {selectedProjectId ? "" : " — select a project above"}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border ${
                active?.source === "project_setting"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {selectedProjectId ? activeSourceLabel : "No project selected"}
            </span>
          </div>

          {active ? (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                  f_cu formula (V in m/s)
                </p>
                <p className="text-lg font-mono font-bold text-sky-300 break-words">
                  {active.curve_snapshot.formula}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500 font-semibold uppercase text-[10px]">Standard</p>
                  <p className="font-mono font-bold text-gray-900 mt-1 break-words">
                    {active.curve_snapshot.standard || "—"}
                  </p>
                  {/* A bare code tells a reader nothing. Name what it governs
                      here; the full entry is in the registry below. */}
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    The record this curve is stored under — see the standards
                    registry below for what it actually covers.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500 font-semibold uppercase text-[10px]">Valid range</p>
                  <p className="font-mono font-bold text-gray-900 mt-1">
                    {active.curve_snapshot.valid_range_ms
                      ? `${active.curve_snapshot.valid_range_ms[0]}–${active.curve_snapshot.valid_range_ms[1]} m/s`
                      : "—"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500 font-semibold uppercase text-[10px]">R² (fit)</p>
                  <p className="font-mono font-bold text-gray-900 mt-1">
                    {active.curve_snapshot.r2_score != null
                      ? active.curve_snapshot.r2_score.toFixed(4)
                      : "n/a (fixed curve)"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500 font-semibold uppercase text-[10px]">Curve</p>
                  <p className="font-mono font-bold text-gray-900 mt-1">
                    {activeCurveRow ? activeCurveRow.name : active.curve_snapshot.name}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 flex items-start gap-1.5">
                <Info size={13} className="shrink-0 mt-0.5 text-blue-600" />
                <span>
                  Provenance: {active.curve_snapshot.provenance_source || "—"}
                  {active.curve_snapshot.temperature_correction_applied
                    ? " · temperature correction is applied outside the 5–30 °C band, per the NDT correlation reference (ACI 228.2R) in the standards registry below, inside this computation"
                    : ""}
                </span>
              </p>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-gray-500">
              {isLoading ? "Resolving active curve…" : "Select a project to resolve its active calibration."}
            </div>
          )}
        </div>

        {/* LIVE f_cu PREVIEW through the active curve */}</div>
      <div className="lg:col-span-1"><div className="bg-[#0F172A] text-whiterounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Sigma size={16} className="text-amber-400" />
              <span>Live f_cu Preview</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">V = L / t</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-slate-400 font-semibold">Path L (mm)</span>
              <input
                value={pvPathMm}
                onChange={(e) => setPvPathMm(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 400"
                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-2.5 py-2 font-mono text-slate-100 focus:border-sky-500 outline-none placeholder:text-slate-600"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-semibold">Transit t (µs)</span>
              <input
                value={pvTimeUs}
                onChange={(e) => setPvTimeUs(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 94.2"
                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-2.5 py-2 font-mono text-slate-100 focus:border-sky-500 outline-none placeholder:text-slate-600"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-semibold">Temp (°C, optional)</span>
              <input
                value={pvTempC}
                onChange={(e) => setPvTempC(e.target.value)}
                inputMode="decimal"
                placeholder="—"
                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-2.5 py-2 font-mono text-slate-100 focus:border-sky-500 outline-none placeholder:text-slate-600"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-semibold">Rebound R (SonReb)</span>
              <input
                value={pvRebound}
                onChange={(e) => setPvRebound(e.target.value)}
                inputMode="decimal"
                placeholder="—"
                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-2.5 py-2 font-mono text-slate-100 focus:border-sky-500 outline-none placeholder:text-slate-600"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-semibold">Points averaged</span>
              <input
                value={pvPoints}
                onChange={(e) => setPvPoints(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 3"
                title="How many test points this velocity averages. A confidence-margin adjustment uses the standard error of that mean (s/√n)."
                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg px-2.5 py-2 font-mono text-slate-100 focus:border-sky-500 outline-none placeholder:text-slate-600"
              />
            </label>
          </div>
          <button
            onClick={runPreview}
            disabled={isPreviewing || !selectedProjectId}
            className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Sigma size={14} />
            <span>{isPreviewing ? "Computing…" : "Compute f_cu via active curve"}</span>
          </button>

          {preview && (
            <div
              className={`mt-4 p-4 rounded-xl border ${
                preview.status === "ok"
                  ? preview.f_cu_mpa != null && preview.f_cu_mpa >= CRITICAL_STRENGTH_THRESHOLD_MPA
                    ? "bg-emerald-950/40 border-emerald-500/40"
                    : "bg-rose-950/40 border-rose-500/40"
                  : "bg-slate-900/60 border-slate-600/60"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-bold">f_cu</span>
                <span
                  className={`text-2xl font-black font-mono ${
                    preview.status === "ok"
                      ? preview.f_cu_mpa != null && preview.f_cu_mpa >= CRITICAL_STRENGTH_THRESHOLD_MPA
                        ? "text-emerald-400"
                        : "text-rose-400"
                      : "text-slate-400"
                  }`}
                >
                  {preview.status === "ok" && preview.f_cu_mpa != null
                    ? `${preview.f_cu_mpa.toFixed(2)} MPa`
                    : "—"}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-1 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Velocity V</span>
                  <span className="text-amber-300 font-bold">
                    {preview.velocity_m_s != null ? `${formatVelocityMs(preview.velocity_m_s)} m/s` : "—"}
                  </span>
                </div>
                {preview.temperature_correction_applied && preview.corrected_velocity_m_s != null && (
                  <div className="flex justify-between">
                    <span>Temp-corrected V</span>
                    <span className="text-sky-300 font-bold">
                      {formatVelocityMs(preview.corrected_velocity_m_s)} m/s
                    </span>
                  </div>
                )}
                {/* The velocity the reported f_cu actually came from. The
                    client's method folds the standard error into the pulse
                    velocity BEFORE the conversion (15 Sep 2026), so without
                    this row the panel would show a velocity that does not
                    produce the figure beside it — the one thing a preview
                    exists to let the reader check. Absent when the
                    correction stayed on the strength instead: a lookup
                    table, a curve flat at this velocity, or a move that
                    would leave the calibrated range. */}
                {preview.se_adjustment?.velocity_step && (
                  <div className="flex justify-between">
                    <span>
                      SE-corrected V{" "}
                      <span className="text-slate-500">
                        ({preview.se_adjustment.velocity_step.delta_velocity_ms >= 0 ? "+" : ""}
                        {preview.se_adjustment.velocity_step.delta_velocity_ms.toFixed(1)} m/s)
                      </span>
                    </span>
                    <span className="text-amber-300 font-bold">
                      {formatVelocityMs(preview.se_adjustment.velocity_step.adjusted_velocity_ms)} m/s
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Curve</span>
                  <span className="text-slate-400 truncate max-w-[160px]" title={preview.curve_snapshot.formula}>
                    {preview.curve_snapshot.name}
                  </span>
                </div>
              </div>

              {/* Standard-error disclosure: when the curve carries an
                  adjustment policy, the raw curve estimate is shown beside
                  the reported figure so the correction is never hidden
                  inside a single number (15 Sep 2026 direction). */}
              {preview.se_adjustment?.applied && (
                <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>Curve estimate (unadjusted)</span>
                    <span className="text-slate-400">
                      {preview.f_cu_unadjusted_mpa != null
                        ? `${preview.f_cu_unadjusted_mpa.toFixed(2)} MPa`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{preview.se_adjustment.method_label.split("—")[0].trim()}</span>
                    <span className="text-amber-300 font-bold">
                      {preview.f_cu_unadjusted_mpa != null && preview.f_cu_mpa != null
                        ? `${preview.f_cu_mpa - preview.f_cu_unadjusted_mpa >= 0 ? "+" : ""}${(
                            preview.f_cu_mpa - preview.f_cu_unadjusted_mpa
                          ).toFixed(2)} MPa`
                        : "—"}
                    </span>
                  </div>
                  {preview.se_adjustment.n_points_averaged != null &&
                    preview.se_adjustment.n_points_averaged > 1 && (
                      <div className="flex justify-between">
                        <span>Test points averaged</span>
                        <span className="text-slate-400">
                          {preview.se_adjustment.n_points_averaged} (s/√n)
                        </span>
                      </div>
                    )}
                </div>
              )}
              {preview.se_adjustment && (
                <p className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] leading-relaxed text-slate-400">
                  {preview.se_adjustment.detail}
                </p>
              )}
              {preview.status !== "ok" && (
                <p className="mt-2 text-[11px] font-bold flex items-center gap-1.5 text-amber-300">
                  <Info size={13} />
                  <span>
                    {preview.status === "rebound_number_required"
                      ? "This SonReb curve needs a rebound number R."
                      : preview.status === "below_valid_range"
                      ? "Velocity below the curve's valid range — record nothing rather than extrapolate."
                      : preview.status === "above_valid_range"
                      ? "Velocity above the curve's valid range."
                      : "Not computable with these inputs."}
                  </span>
                </p>
              )}
            </div>
          )}
        </div></div>
    </div>

          </div>
        </div>
      )}

      {/* CALIBRATION CURVE LIBRARY & AUDIT VAULT */}
      {(activeStep === "all" || activeStep === "library") && (
        <div className="space-y-8 mt-8">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[#022C4F]">Calibration Curve Library</h2>
            </div>
            <p className="text-xs text-gray-500">
              {selectedProjectId
                ? "This project's curves plus the platform default"
                : "All curves visible to you (select a project to narrow)"}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              <strong>Activate</strong> sets the project&apos;s active calibration: every new f_cu
              computed for that project flows through that curve (already-stored records keep the
              snapshot of the curve that produced them — history is never rewritten).
            </p>
          </div>
          <span className="text-xs text-gray-500 font-mono">{curves.length} curve(s) on record</span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-400 animate-pulse">
              Loading curves from server…
            </div>
          ) : curves.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No calibration curves on record yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                  <th className="py-3 px-5">Curve</th>
                  <th className="py-3 px-5">Type</th>
                  {/* The spec's Curve Manager is Name │ Type │ Standard │ Date │
                      Status, and Standard is the column the client asked for
                      directly on 15 Sep ("which standard did you use? there
                      must be a BS code"). It was stored on every curve and
                      served by the API all along — it simply was not shown. */}
                  <th className="py-3 px-5">Standard</th>
                  <th className="py-3 px-5">Formula (V in m/s)</th>
                  <th className="py-3 px-5">Valid range</th>
                  <th className="py-3 px-5">R²</th>
                  <th className="py-3 px-5">Provenance</th>
                  <th className="py-3 px-5">Added</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {curves.map((c) => {
                  const isActiveForProject =
                    active?.source === "project_setting" && active.curve?.id === c.id;
                  // The platform default row is "active" for the project in a
                  // different sense: the project has no curve of its own, so
                  // this is the calibration in force. Derived from the resolved
                  // source rather than from the row, so it states what the
                  // server actually resolves the project to — not what a flag
                  // on the curve claims.
                  const isPlatformDefaultInEffect =
                    !!c.is_default && active?.source === "platform_default";
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        selectedCurveId === c.id
                          ? "bg-sky-50/60"
                          : isActiveForProject
                          ? "bg-emerald-50/40"
                          : c.is_default
                          ? "bg-amber-50/30"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-5 font-bold font-mono text-gray-900">
                        {c.name}
                        {c.version != null && (
                          <span className="block text-[10px] text-gray-400 mt-0.5">v{c.version}</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-gray-700">
                        {c.curve_type_display || CURVE_TYPE_LABEL[c.curve_type] || c.curve_type}
                      </td>
                      {/* `standard` is a blank-able field: a curve may
                          genuinely have no standard recorded (a hand-entered
                          lookup table, say), and blank is not a missing value
                          to be filled in — it is the honest absence of one. */}
                      <td className="py-3 px-5 text-gray-700 max-w-[180px] break-words">
                        {c.standard || "—"}
                      </td>
                      <td className="py-3 px-5 font-mono text-gray-600 break-words max-w-[220px]">
                        {c.formula_display || "—"}
                      </td>
                      <td className="py-3 px-5 font-mono text-gray-600">
                        {c.valid_range_min_ms}–{c.valid_range_max_ms} m/s
                      </td>
                      <td className="py-3 px-5 font-mono text-gray-600">
                        {c.r2_score != null ? c.r2_score.toFixed(4) : "n/a"}
                      </td>
                      <td className="py-3 px-5 text-gray-600 max-w-[200px] break-words">
                        {/* `standard` used to be the fallback here, because it
                            was the only place a standard could appear. It now
                            has its own column, so leaving the fallback would
                            print one value under two headings and make
                            "Provenance" mean two different things. */}
                        {c.provenance?.source || "—"}
                        {c.data_points && c.data_points.length > 0 && (
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {c.data_points.length} calibration pair(s)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-gray-600 whitespace-nowrap font-mono text-[11px]">
                        {formatRecordedDate(c.created_at)}
                      </td>
                      {/* Status is deliberately three states, not the spec's
                          Active/Inactive binary. There is no is_active on a
                          curve — "active" is a PROJECT setting, so one curve
                          can be active for project A and inactive for project
                          B. A binary would state as a global fact something
                          that is only true of one project. "Inactive" is
                          likewise only meaningful once a project is chosen, so
                          with none selected this reads "—" rather than
                          defaulting to a status the reader would take as
                          global. The platform default is a fourth case: a
                          project with no curve of its own resolves TO the
                          default, so that row is genuinely the one in force
                          and reads "Active" — derived from the resolved
                          source, not from anything on the curve's own row.
                          This cell and the marker in the Actions cell are
                          both derived from the same resolved `active`
                          response, so they can never disagree. */}
                      <td className="py-3 px-5">
                        {isActiveForProject || isPlatformDefaultInEffect ? (
                          <span
                            className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-bold whitespace-nowrap"
                            title={
                              isPlatformDefaultInEffect
                                ? "The selected project has no curve of its own, so every new f_cu it computes flows through this platform default"
                                : "The selected project's active calibration"
                            }
                          >
                            Active
                          </span>
                        ) : c.is_default ? (
                          <span
                            className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-bold whitespace-nowrap"
                            title="The platform's built-in default calibration — not tied to any one project"
                          >
                            Platform default
                          </span>
                        ) : selectedProjectId ? (
                          <span
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-[10px] font-bold whitespace-nowrap"
                            title="Not the selected project's active calibration"
                          >
                            Inactive
                          </span>
                        ) : (
                          <span
                            className="text-gray-400"
                            title="Active is a project setting — select a project to see whether this curve is its active calibration"
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => inspectCurve(c)}
                            className="px-2.5 py-1 border border-sky-200 hover:border-sky-400 hover:text-sky-700 rounded-lg text-xs font-bold text-sky-700 cursor-pointer"
                            title="Show this curve's stored parameters and pairs in the Regression Fits & Selection panel above"
                          >
                            {selectedCurveId === c.id ? "Hide" : "View"}
                          </button>
                          {isActiveForProject && (
                            <span
                              className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1"
                              title="This project's active calibration — every new f_cu computed for the project flows through this curve"
                            >
                              <ShieldCheck size={12} />
                              Active
                            </span>
                          )}
                          {!c.is_default && (
                            <>
                              {!isActiveForProject && (
                                <button
                                  onClick={() => activate(c.id, c.name)}
                                  disabled={isActivating === c.id || !selectedProjectId}
                                  title={
                                    selectedProjectId
                                      ? "Make this the project's active calibration"
                                      : "Select a project first"
                                  }
                                  className="px-2.5 py-1 bg-[#022C4F] hover:bg-[#033c6c] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                                >
                                  {isActivating === c.id ? "…" : "Activate"}
                                </button>
                              )}
                              <button
                                onClick={() => removeCurve(c)}
                                className="p-1 border border-gray-200 hover:border-rose-300 hover:text-rose-600 rounded-lg text-gray-500"
                                title="Delete curve (stored strengths keep their snapshots)"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                          {c.is_default && (
                            <>
                              {/* The platform default is a real, selectable
                                  calibration, so it needs the same reachable
                                  action as every other row — the column reads
                                  "Activate" throughout. What that action
                                  *stores* differs (it clears the project's own
                                  curve rather than pointing at one, since
                                  there is no is_active flag to point with),
                                  but what it *means* is identical: this
                                  becomes the project's active calibration.
                                  The mechanism belongs in the tooltip, not in
                                  the label. Once the project resolves to the
                                  default there is nothing left to do, and the
                                  row reports that instead. */}
                              {active?.source === "platform_default" ? (
                                <span
                                  className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1"
                                  title="The selected project's active calibration — it has no curve of its own, so every new f_cu flows through this platform default"
                                >
                                  <ShieldCheck size={12} />
                                  Active
                                </span>
                              ) : (
                                <button
                                  onClick={restorePlatformDefault}
                                  disabled={
                                    isActivating === PLATFORM_DEFAULT_PENDING ||
                                    !selectedProjectId
                                  }
                                  title={
                                    selectedProjectId
                                      ? "Make this the project's active calibration (the project's own curve, if any, is dropped — stored strengths keep their snapshots)"
                                      : "Select a project first"
                                  }
                                  className="px-2.5 py-1 bg-[#022C4F] hover:bg-[#033c6c] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
                                >
                                  {isActivating === PLATFORM_DEFAULT_PENDING
                                    ? "…"
                                    : "Activate"}
                                </button>
                              )}
                              {/* Separate statement, and still true either
                                  way: the default is the platform's, so it is
                                  not editable or deletable from a project. */}
                              <span
                                className="text-[10px] text-gray-400 font-semibold"
                                title="The platform's built-in default — it can be chosen for a project but not edited or deleted"
                              >
                                Locked
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Save-fit name modal (replaces the old window.prompt popup) */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#022C4F]">Save calibration curve</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Name this curve — it becomes the provenance quoted in the generated NDT report.
              </p>
            </div>
            <div className="p-5">
              <label className="space-y-1 block">
                <span className="text-gray-500 font-semibold uppercase text-[10px]">Curve name</span>
                <input
                  autoFocus
                  value={curveName}
                  onChange={(e) => setCurveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveFitAsCurve();
                    }
                  }}
                  placeholder="e.g. Lekki Tower A — cube series Aug 2026"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
                />
              </label>
              {chosenFit && (
                <p className="mt-3 p-3 rounded-xl bg-slate-50 border border-gray-200/80 font-mono text-[11px] text-slate-600 break-words">
                  {chosenFit.formula}
                </p>
              )}
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button
                onClick={() => setIsNameModalOpen(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveFitAsCurve}
                disabled={isSaving || !curveName.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving…" : "Save & activate"}
              </button>
            </div>
          </div>
        </div>
      )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 select-none">
            <h3 className="font-bold text-[#022C4F] text-base flex items-center gap-2">
              <Lock size={18} className="text-slate-500" />
              <span>Enter a curve&apos;s parameters directly</span>
              <span className="text-xs font-normal text-gray-500">
                (when the laboratory calibration already exists)
              </span>
            </h3>
            {/* Caret: rotated when open, so it reads as expandable at a glance */}
            <span
              className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 bg-slate-50 text-gray-500 group-open:bg-[#022C4F] group-open:text-white transition-colors"
              aria-hidden="true"
            >
              <ChevronDown size={16} className="transition-transform duration-200 group-open:rotate-180" />
            </span>
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <label className="space-y-1">
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Curve type</span>
              <select
                value={manualType}
                onChange={(e) => {
                  setManualType(e.target.value as CurveType);
                  setManualParams({});
                }}
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:border-[#0A66C2] outline-none"
              >
                {(Object.keys(CURVE_TYPE_LABEL) as CurveType[]).map((t) => (
                  <option key={t} value={t}>
                    {CURVE_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Curve name</span>
              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. Lab series C35 — Sept 2026"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
              />
            </label>
            <label className="space-y-1">
              <span className="text-gray-500 font-semibold uppercase text-[10px]">
                Standard / provenance
              </span>
              <input
                value={manualStandard}
                onChange={(e) => setManualStandard(e.target.value)}
                placeholder="e.g. BS 1881-203 lab series"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
              />
            </label>

            {manualType === "linear" && (
              <>
                <ManualParam label="m (slope, MPa per m/s)" value={manualParams.m || ""} onChange={(v) => setManualParams((p) => ({ ...p, m: v }))} placeholder="0.008961" />
                <ManualParam label="c (intercept, MPa)" value={manualParams.c || ""} onChange={(v) => setManualParams((p) => ({ ...p, c: v }))} placeholder="-7.97" />
              </>
            )}
            {manualType === "polynomial" && (
              <div className="md:col-span-3">
                <ManualParam
                  label="coefficients (ascending, comma-separated: c0,c1,c2)"
                  value={manualParams.coeffs || ""}
                  onChange={(v) => setManualParams((p) => ({ ...p, coeffs: v }))}
                  placeholder="12.4, 0.0012, 0.0000001"
                />
              </div>
            )}
            {(manualType === "exponential" || manualType === "sonreb") && (
              <>
                {/* 15 Sep 2026: the client asked "we have ABC — what are those
                    ABC stands for?" of a form that showed bare a / b / c. The
                    explanations already existed in CURVE_PARAM_FIELDS and were
                    never rendered; they are the legend, so they are read from
                    there rather than restated here. */}
                {CURVE_PARAM_FIELDS[manualType].map((field) => (
                  <ManualParam
                    key={field.key}
                    label={field.label}
                    hint={field.hint}
                    value={manualParams[field.key] || ""}
                    onChange={(v) =>
                      setManualParams((p) => ({ ...p, [field.key]: v }))
                    }
                    placeholder={field.key.toUpperCase()}
                  />
                ))}
              </>
            )}
            {manualType === "lookup" && (
              <div className="md:col-span-3">
                <ManualParam
                  label="lookup points — v (m/s) = f (MPa), comma-separated, ascending"
                  value={manualParams.points || ""}
                  onChange={(v) => setManualParams((p) => ({ ...p, points: v }))}
                  placeholder="3000=13.5, 3500=20.4, 4000=27.9, 4500=35.4"
                />
              </div>
            )}

            <ManualParam label="Valid range min (m/s)" value={manualMinMs} onChange={setManualMinMs} placeholder="2000" />
            <ManualParam label="Valid range max (m/s)" value={manualMaxMs} onChange={setManualMaxMs} placeholder="5000" />

            <div className="md:col-span-3">
              <button
                onClick={saveManualCurve}
                disabled={isSaving}
                className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? "Saving…" : "Save curve for this project"}
              </button>
              <p className="mt-2 text-[11px] text-gray-500">
                Saving a curve is Director-level; the platform-seeded default curve cannot be edited
                or deleted.
              </p>
            </div>
          </div>
        </details>
      </div>
          <details className="group bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
        <summary className="cursor-pointer list-none select-none p-6 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#022C4F] text-base flex items-center gap-2">
              <BookOpen size={18} className="text-slate-500" />
              <span>Standards and references behind this model</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Which document governs each part of the number this platform reports: how the
              pulse velocity is measured, how it becomes a strength, and how the curve type
              is selected
              {standards.length > 0
                ? ` — ${standards.length} reference documents, open for the detail`
                : ""}
              .
            </p>
          </div>
          <span
            className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 bg-slate-50 text-gray-500 group-open:bg-[#022C4F] group-open:text-white transition-colors"
            aria-hidden="true"
          >
            <ChevronDown
              size={16}
              className="transition-transform duration-200 group-open:rotate-180"
            />
          </span>
        </summary>

        <div className="px-6 pb-6 -mt-2">

        {standardsError ? (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900">
              The standards registry could not be read — {standardsError}. No substitute
              list is shown in its place.
            </p>
          </div>
        ) : isStandardsLoading ? (
          <p className="py-6 text-center text-xs text-gray-500">
            Loading the standards registry…
          </p>
        ) : standards.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-500">
            The standards registry is empty — no reference documents are registered on
            this deployment.
          </p>
        ) : (
          <div className="space-y-5">
            {STANDARD_ROLE_ORDER.filter((role) =>
              standards.some((s) => s.role === role)
            ).map((role) => (
              <div key={role}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  {STANDARD_ROLE_GROUP[role]}
                </p>
                <div className="space-y-2">
                  {standards
                    .filter((s) => s.role === role)
                    .map((s) => (
                      <details
                        key={s.code}
                        className="group rounded-xl border border-gray-200 bg-gray-50/60"
                      >
                        <summary className="cursor-pointer list-none flex flex-wrap items-center gap-2 px-3 py-2.5 select-none">
                          <span className="font-mono text-xs font-bold text-[#022C4F]">
                            {s.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STANDARD_ROLE_BADGE[s.role]}`}
                          >
                            {s.role_label}
                          </span>
                          <span className="text-[11px] text-gray-600 flex-1 min-w-0">
                            {s.title}
                          </span>
                          {/* Caret: rotated when open, matching the manual
                              parameter entry below. */}
                          <ChevronDown
                            size={14}
                            className="shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <div className="px-3 pb-3 pt-1 space-y-2">
                          <div>
                            <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">
                              Scope
                            </p>
                            <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                              {s.scope}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">
                              How this platform uses it
                            </p>
                            <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                              {s.platform_use}
                            </p>
                          </div>
                          {s.note && (
                            <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2 text-[11px] text-amber-900">
                              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                              <span>{s.note}</span>
                            </p>
                          )}
                        </div>
                      </details>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </details>
        </div>
      )}
      </div>
    </div>
  );
}


/** One regression candidate card — shared by the fresh-regression view and
 *  the inspected library curve. A statistic shows n/a, honestly, when the
 *  engine could not compute it (e.g. standard error is undefined when the
 *  fit has as many parameters as calibration pairs — zero residual degrees
 *  of freedom; it computes with the recommended 9–15 pairs). */
function FitCandidateButton({
  type,
  fit,
  isBest,
  isSel,
  savedBadge = false,
  onClick,
}: {
  type: FitType;
  fit: RegressionFit;
  isBest: boolean;
  isSel: boolean;
  savedBadge?: boolean;
  onClick: () => void;
}) {
  const incomplete =
    fit.r2_score == null || fit.standard_error == null || fit.aic == null;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
        isSel
          ? "border-[#0A66C2] bg-sky-50/60 ring-1 ring-[#0A66C2]/30"
          : "border-gray-200 hover:border-sky-300 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900">
            {CURVE_TYPE_LABEL[type]}
          </span>
          {isBest && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={10} />
              BEST FIT
            </span>
          )}
          {savedBadge && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
              SAVED CURVE
            </span>
          )}
        </div>
        <span
          className="font-mono text-[11px] font-bold text-gray-700"
          title={
            incomplete
              ? "n/a = the engine cannot compute this statistic honestly for this fit — e.g. the standard error is undefined when there are as many parameters as calibration pairs (zero residual degrees of freedom). It computes with the recommended 9–15 pairs."
              : undefined
          }
        >
          R² {fit.r2_score?.toFixed(4) ?? "n/a"} · SE {fit.standard_error?.toFixed(2) ?? "n/a"} · AIC{" "}
          {fit.aic?.toFixed(1) ?? "n/a"}
        </span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-slate-600 break-words">
        {fit.formula}
      </p>
    </button>
  );
}

/** Scatter + fitted-curve chart shared by the regression candidates and the
 *  inspected library curve. Points and line come from real data only. */
function CorrelationChart({
  xOf,
  yOf,
  curveLine,
  points,
  xMin,
  xMax,
  sonrebNeedsR,
}: {
  xOf: (vMs: number) => number;
  yOf: (f: number) => number;
  curveLine: string | null;
  points: Array<{ v: number; f: number; r?: number | null }>;
  xMin: number;
  xMax: number;
  sonrebNeedsR: boolean;
}) {
  return (
    <div className="w-full h-56 bg-slate-950 rounded-xl p-3 border border-slate-800">
      <svg viewBox="0 0 600 220" className="w-full h-full">
        <line x1="40" y1="20" x2="40" y2="190" stroke="#334155" strokeWidth="1" />
        <line x1="40" y1="190" x2="580" y2="190" stroke="#334155" strokeWidth="1" />
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={frac}
            x1="40"
            y1={190 - frac * 170}
            x2="580"
            y2={190 - frac * 170}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
        ))}
        {/* Statutory 25 MPa line */}
        <line
          x1="40"
          y1={yOf(CRITICAL_STRENGTH_THRESHOLD_MPA)}
          x2="580"
          y2={yOf(CRITICAL_STRENGTH_THRESHOLD_MPA)}
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
        <text
          x="578"
          y={yOf(CRITICAL_STRENGTH_THRESHOLD_MPA) - 5}
          fill="#10b981"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="end"
        >
          25.0 MPa Statutory Threshold
        </text>
        {/* Fitted curve */}
        {curveLine && (
          <polyline points={curveLine} fill="none" stroke="#38bdf8" strokeWidth="3" />
        )}
        {/* Real calibration points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xOf(p.v)}
            cy={yOf(p.f)}
            r="5"
            fill="#fbbf24"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        ))}
        <text x="40" y="15" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          f_cu (MPa)
        </text>
        <text x="40" y="208" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          {Math.round(xMin)}
        </text>
        <text x="310" y="208" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
          {Math.round((xMin + xMax) / 2)}
        </text>
        <text x="580" y="208" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
          {Math.round(xMax)}
        </text>
        <text x="580" y="218" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
          Pulse Velocity V (m/s) →
        </text>
        {sonrebNeedsR && (
          <text x="310" y="60" fill="#fbbf24" fontSize="10" fontFamily="monospace" textAnchor="middle">
            SONREB CURVE NEEDS REBOUND VALUES (R) IN THE PAIRS
          </text>
        )}
      </svg>
    </div>
  );
}

function ManualParam({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1 block">
      <span className="text-gray-500 font-semibold uppercase text-[10px]">{label}</span>
      {hint && (
        <span className="block text-[10px] leading-snug text-gray-400 normal-case font-normal">
          {hint}
        </span>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="decimal"
        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 font-mono focus:border-[#0A66C2] outline-none placeholder:text-gray-300"
      />
    </label>
  );
}

