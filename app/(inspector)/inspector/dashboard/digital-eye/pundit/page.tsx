"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  Zap,
  Sliders,
  FileSpreadsheet,
  RefreshCw,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Upload,
  ChevronRight,
  Eye,
  FileText,
  X,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  PunditTest,
  PunditReading,
  getPunditTests,
  createPunditTest,
  getFieldDevices,
  uploadSensorFile,
  FieldDeviceRecord,
  createDigitalEyeFinding,
  formatVelocityMs,
} from "@/services/digitalEye";
import { orDash, dateOr } from "@/lib/display";
import {
  FolderViewToggle,
  ProjectFloorStationTreeBody,
  useProjectFloorStationFolders,
  punditProjectOf,
  punditFloorOf,
  punditStationOf,
  punditStationSummary,
} from "@/components/dashboard/digital-eye/PunditFolderTree";
import { getAssignableProjects } from "@/services/inspector";

/** "SEMI_DIRECT" → "Semi direct", for a recorded enum shown to a reader. */
function humaniseTransducer(value?: string | null): string | null {
  if (!value) return null;
  return value.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

// Dynamically import heavy waveform oscillogram viewer
const PunditWaveformViewer = dynamic(
  () => import("@/components/dashboard/digital-eye/PunditWaveformViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center text-xs text-slate-400 font-mono">
        Loading Ultrasonic Pulse Velocity Engine...
      </div>
    ),
  }
);

// Concrete quality rating evaluation per BS 1881-203 / ASTM C597
function getConcreteQuality(velocityMs: number): {
  rating: PunditTest["concrete_quality_rating"];
  label: string;
  color: string;
  badgeClass: string;
  description: string;
} {
  if (velocityMs >= 4500) {
    return {
      rating: "EXCELLENT",
      label: "EXCELLENT",
      color: "#10B981",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Dense, void-free, high-durability structural concrete (BS 1881-203).",
    };
  }
  if (velocityMs >= 3500) {
    return {
      rating: "GOOD",
      label: "GOOD",
      color: "#059669",
      badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
      description: "Sound, well-compacted concrete meeting required structural specification.",
    };
  }
  if (velocityMs >= 3000) {
    return {
      rating: "GOOD",
      label: "MEDIUM (FAIR)",
      color: "#D97706",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Acceptable quality; minor micro-cracking or surface porosity observed.",
    };
  }
  if (velocityMs >= 2000) {
    return {
      rating: "DOUBTFUL",
      label: "DOUBTFUL",
      color: "#DC2626",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-300 font-bold",
      description: "Substandard compaction, internal voiding, or honeycomb defect suspected. Corroboration required.",
    };
  }
  return {
    rating: "VERY_POOR",
    label: "VERY POOR",
    color: "#991B1B",
    badgeClass: "bg-rose-100 text-rose-900 border-rose-400 font-extrabold",
    description: "Severe voiding, major structural discontinuity, or failed matrix integrity.",
  };
}

function estimateCompressiveStrength(velocityMs: number): number {
  if (velocityMs <= 0) return 0;
  const vKmS = velocityMs / 1000;
  const strength = 1.15 * Math.pow(vKmS, 2.45);
  return Math.round(Math.min(75, Math.max(10, strength)) * 10) / 10;
}

function PunditWorkspaceInner() {
  const searchParams = useSearchParams();
  const [punditMode, setPunditMode] = useState<"live" | "manual" | "batch">("live");

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setPunditMode("manual");
    }
  }, [searchParams]);

  const [punditTests, setPunditTests] = useState<PunditTest[] | null>(null);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [activePunditTest, setActivePunditTest] = useState<PunditTest | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  // Projects assignable to inspector
  const [projects, setProjects] = useState<{ id: string; name: string; reference?: string }[]>([]);

  // Manual Form
  const [manualForm, setManualForm] = useState<{
    projectId: string;
    elementName: string;
    elementLocation: string;
    method: "DIRECT" | "SEMI_DIRECT" | "INDIRECT";
    frequencyKhz: number;
    pathLengthMm: string;
    transitTimeUs: string;
    surfaceTempC: string;
    concreteAgeDays: string;
    surfaceCondition: string;
    operatorName: string;
    notes: string;
    points: { label: string; pathMm: number; timeUs: number; velMs: number }[];
  }>({
    projectId: "",
    elementName: "",
    elementLocation: "",
    method: "DIRECT",
    frequencyKhz: 54,
    pathLengthMm: "",
    transitTimeUs: "",
    surfaceTempC: "",
    concreteAgeDays: "",
    surfaceCondition: "",
    operatorName: "",
    notes: "",
    points: [],
  });

  // Batch Session File Upload
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchSha256, setBatchSha256] = useState<string | null>(null);
  const [batchHashError, setBatchHashError] = useState<string | null>(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);

  // SWO Defect Finding Escalation Modal
  const [swoModalOpen, setSwoModalOpen] = useState(false);
  const [swoData, setSwoData] = useState<{
    element: string;
    velocityMs: number | null;
    strengthMpa: number | null;
    rating: string;
    recommendation: string;
    source: "recorded_test" | "manual_entry";
  }>({
    element: "",
    velocityMs: null,
    strengthMpa: null,
    rating: "",
    recommendation: "",
    source: "recorded_test",
  });
  const [swoRecommendation, setSwoRecommendation] = useState("");
  const [isSubmittingSwo, setIsSubmittingSwo] = useState(false);
  const [swoError, setSwoError] = useState<string | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadRecords = async () => {
    setRecordsError(null);
    try {
      const tests = await getPunditTests();
      const rows = Array.isArray(tests) ? tests : [];
      setPunditTests(rows);
      setActivePunditTest((prev) => {
        if (prev && rows.some((r) => r.id === prev.id)) return prev;
        return rows[0] ?? null;
      });
    } catch (err: any) {
      setPunditTests(null);
      setRecordsError(
        err?.response?.data?.detail || err?.message || "The UPV test register could not be read."
      );
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await getAssignableProjects();
        if (cancelled) return;
        const shaped = (Array.isArray(rows) ? rows : [])
          .map((p: any) => ({
            id: String(p?.id ?? ""),
            name: p?.name || p?.project_name || "",
            reference: p?.project_reference || p?.reference || undefined,
          }))
          .filter((p) => p.id);
        setProjects(shaped);
      } catch {
        if (!cancelled) setProjects([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleReload = async () => {
    setIsReloading(true);
    await loadRecords();
    setIsReloading(false);
    showToast("UPV Test register refreshed from server.");
  };

  const liveVelocityMs =
    activePunditTest && activePunditTest.pulse_velocity_ms > 0
      ? activePunditTest.pulse_velocity_ms
      : null;
  const liveQuality = liveVelocityMs !== null ? getConcreteQuality(liveVelocityMs) : null;
  const liveStrengthMpa = activePunditTest?.estimated_compressive_strength_mpa ?? null;

  const handleOpenEscalation = (
    element: string,
    velocity: number | null,
    strength: number | null,
    rating: string,
    source: "recorded_test" | "manual_entry" = "recorded_test"
  ) => {
    const subject =
      source === "manual_entry"
        ? "the figures entered on this form (not yet saved)"
        : "the transmission path recorded";
    const recommendation =
      velocity !== null && velocity < 3000
        ? `CRITICAL: pulse velocity falls in the Doubtful/Poor band (< 3000 m/s) for ${subject}. Recommend core extraction to corroborate before any Stop Work decision.`
        : `Marginal pulse velocity recorded for ${subject}. Recommend extended scanning before any regulatory decision.`;
    setSwoData({ element, velocityMs: velocity, strengthMpa: strength, rating, recommendation, source });
    setSwoRecommendation(recommendation);
    setSwoError(null);
    setSwoModalOpen(true);
  };

  const handleSubmitSwo = async () => {
    setIsSubmittingSwo(true);
    setSwoError(null);
    try {
      const measured =
        swoData.velocityMs !== null
          ? swoData.source === "manual_entry"
            ? `Inspector's manual UPV entries average a pulse velocity of ${formatVelocityMs(
                swoData.velocityMs
              )} m/s. These entries are unsaved, and no calibration curve has been applied, so no platform strength estimate exists for them`
            : `Ultrasonic UPV inspection recorded a pulse velocity of ${formatVelocityMs(
                swoData.velocityMs
              )} m/s` +
              (swoData.strengthMpa !== null
                ? ` (platform-estimated strength ${swoData.strengthMpa} MPa)`
                : "")
          : "No pulse velocity was measured for this record";

      const rating = swoData.rating ? ` Rating on record: ${swoData.rating}.` : "";

      await createDigitalEyeFinding({
        title: `Concrete defect finding: ${swoData.element}`,
        structural_element_name: swoData.element,
        severity: "CRITICAL",
        status: "OPEN",
        description:
          `${measured} for element ${swoData.element}.${rating} ` +
          `Inspector's regulatory decision: ${swoRecommendation}`,
      });
      setSwoModalOpen(false);
      showToast("Defect finding logged and returned by the server with a reference.");
    } catch (err: any) {
      setSwoError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "The finding was not accepted by the server. Nothing has been recorded."
      );
    } finally {
      setIsSubmittingSwo(false);
    }
  };

  const handleAddManualPoint = () => {
    const pathMm = Number(manualForm.pathLengthMm);
    const timeUs = Number(manualForm.transitTimeUs);
    if (!Number.isFinite(pathMm) || !Number.isFinite(timeUs) || pathMm <= 0 || timeUs <= 0) {
      showToast("Enter a path length and a transit time before adding a point.");
      return;
    }
    const nextChar = String.fromCharCode(65 + manualForm.points.length);
    const vel = Math.round((pathMm / timeUs) * 1000);
    setManualForm({
      ...manualForm,
      points: [...manualForm.points, { label: `Point ${nextChar}`, pathMm, timeUs, velMs: vel }],
    });
  };

  const handleSaveManualTest = async () => {
    if (!manualForm.projectId) {
      showToast("Select the project this measurement was taken against.");
      return;
    }
    if (!manualForm.elementName.trim()) {
      showToast("Record the structural element before committing this test.");
      return;
    }
    if (manualForm.points.length === 0) {
      showToast("Add at least one reading point before committing this test.");
      return;
    }

    const payload = {
      project: manualForm.projectId,
      test_type: "pulse_velocity" as const,
      structural_element: manualForm.elementName.trim(),
      test_location: manualForm.elementLocation.trim(),
      transducer_type: manualForm.method,
      transducer_frequency_khz: manualForm.frequencyKhz,
      path_length_mm: manualForm.points[0].pathMm,
      pulse_time_us: manualForm.points[0].timeUs,
      surface_condition: manualForm.surfaceCondition.trim(),
      surface_temperature_c: manualForm.surfaceTempC === "" ? null : Number(manualForm.surfaceTempC),
      concrete_age_days: manualForm.concreteAgeDays === "" ? null : Number(manualForm.concreteAgeDays),
      operator_name: manualForm.operatorName.trim(),
      notes: manualForm.notes.trim(),
      readings: manualForm.points.map((p) => ({
        point_label: p.label,
        path_length_mm: p.pathMm,
        transit_time_us: p.timeUs,
        surface_condition: manualForm.surfaceCondition.trim(),
      })),
    };

    try {
      const saved = await createPunditTest(payload);
      setPunditTests((prev) => (prev ? [saved, ...prev] : [saved]));
      setActivePunditTest(saved);
      setManualForm((prev) => ({ ...prev, points: [] }));
      setPunditMode("live");
      showToast(`UPV test ${saved.test_reference} recorded by the server.`);
    } catch (err: any) {
      showToast(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "The test was not saved. Check your connection and commit again."
      );
    }
  };

  const handleBatchFileUpload = async (file: File) => {
    setBatchFile(file);
    setBatchSha256(null);
    setBatchHashError(null);
    setIsBatchUploading(true);

    try {
      const record = await uploadSensorFile(file, "pundit_raw", "PUNDIT session export");
      setBatchSha256(record.sha256_checksum || null);
      if (!record.sha256_checksum) {
        setBatchHashError("The server stored the file but returned no digest for it.");
      }
      showToast(`${file.name} uploaded and stored by the server.`);
      await loadRecords();
    } catch (err: any) {
      setBatchHashError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "The file could not be uploaded."
      );
    } finally {
      setIsBatchUploading(false);
    }
  };

  const testFolders = useProjectFloorStationFolders(
    punditTests ?? [],
    punditProjectOf,
    punditFloorOf,
    punditStationOf
  );

  const renderTestCard = (t: PunditTest) => {
    const isSelected = activePunditTest?.id === t.id;
    const analysed = t.pulse_velocity_ms > 0;
    const quality = analysed ? getConcreteQuality(t.pulse_velocity_ms) : null;
    return (
      <div
        key={t.id}
        onClick={() => {
          setActivePunditTest(t);
          setPunditMode("live");
        }}
        className={`p-4 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? "bg-slate-50 border-[#022C4F] ring-1 ring-[#022C4F] shadow-sm"
            : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-mono font-bold text-[#022C4F]">
            {t.test_reference || "Unreferenced test"}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              quality
                ? quality.badgeClass
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {quality ? quality.label : "UNRATED"}
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-800 truncate mb-1">
          {orDash(t.structural_element_name, "Element not recorded")}
        </div>
        <div className="text-[11px] text-slate-500 truncate mb-3">
          {orDash(t.test_location, "Location not recorded")}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>{dateOr(t.test_date || t.created_at)}</span>
          <span className="font-mono font-bold text-slate-700">
            {formatVelocityMs(t.pulse_velocity_ms)} m/s
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#022C4F] text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in duration-200">
          <Activity size={15} className="text-cyan-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-2">
            <Link href="/inspector/dashboard/digital-eye" className="hover:underline">
              Digital Eye
            </Link>
            <ChevronRight size={13} />
            <span>PUNDIT Ultrasonic NDT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight flex items-center gap-3">
            <Activity className="text-emerald-600" />
            PUNDIT Ultrasonic Pulse Velocity (UPV)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Non-destructive concrete homogeneity, elasticity modulus, and compressive strength evaluation per BS 1881-203.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReload}
            disabled={isReloading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={isReloading ? "animate-spin" : ""} />
            <span>Refresh Registry</span>
          </button>
          <button
            type="button"
            onClick={() => setPunditMode("manual")}
            className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#033B6B] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>New Station Entry</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
            <span>Ingestion & Analysis Workspace</span>
            <span className="text-[10px] font-normal text-slate-500">(BS 1881-203 / ASTM C597)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Switch between recorded ultrasonic telemetry, manual station testing, and bulk session file upload.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "live", label: "Recorded Tests", icon: Zap },
            { id: "manual", label: "Manual Station Entry", icon: Sliders },
            { id: "batch", label: "Session File Upload", icon: FileSpreadsheet },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setPunditMode(mode.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                punditMode === mode.id
                  ? "bg-white text-[#022C4F] shadow-sm font-bold"
                  : "text-slate-600 hover:text-[#022C4F]"
              }`}
            >
              <mode.icon size={13} />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MODE 1: RECORDED TESTS WORKSPACE */}
      {punditMode === "live" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Test Readout & Verification */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                  Selected Measurement
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                {activePunditTest ? activePunditTest.test_reference || "No ref" : "NO TEST SELECTED"}
              </span>
            </div>

            {activePunditTest === null ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-700">No UPV test selected</div>
                <p className="leading-relaxed">
                  {punditTests === null
                    ? "The test register could not be read."
                    : "Select a test from the registry on the right, or create a new test using Manual Station Entry."}
                </p>
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-slate-500 shrink-0">Target Element:</span>
                    <strong className="text-[#022C4F] text-right truncate">
                      {orDash(activePunditTest.structural_element_name, "Element not recorded")}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-slate-500 shrink-0">Test Location:</span>
                    <span className="font-semibold text-slate-700 text-right truncate">
                      {orDash(activePunditTest.test_location, "Location not recorded")}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-slate-500 shrink-0">Transmission:</span>
                    <span className="font-semibold text-slate-700">
                      {humaniseTransducer(activePunditTest.transducer_type) || "Not recorded"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Transit Time</div>
                    <div className="text-lg font-mono font-extrabold text-[#022C4F]">
                      {activePunditTest.transit_time_us ? `${activePunditTest.transit_time_us.toFixed(1)} µs` : "—"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Path Length</div>
                    <div className="text-lg font-mono font-extrabold text-[#022C4F]">
                      {activePunditTest.path_length_mm ? `${activePunditTest.path_length_mm} mm` : "—"}
                    </div>
                  </div>
                </div>

                {/* Pulse Velocity & Strength */}
                <div className="p-4 rounded-xl bg-[#022C4F] text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cyan-200 uppercase tracking-wider font-bold">
                      Calculated Pulse Velocity
                    </span>
                    {liveQuality && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${liveQuality.badgeClass}`}>
                        {liveQuality.label}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-mono font-extrabold text-white">
                    {liveVelocityMs ? `${formatVelocityMs(liveVelocityMs)} m/s` : "—"}
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-300">Est. Compressive Strength:</span>
                    <span className="font-mono font-extrabold text-cyan-300 text-sm">
                      {liveStrengthMpa !== null ? `${liveStrengthMpa} MPa` : "—"}
                    </span>
                  </div>
                </div>

                {/* Finding Action Button */}
                <button
                  type="button"
                  onClick={() =>
                    handleOpenEscalation(
                      activePunditTest.structural_element_name || "Element on record",
                      liveVelocityMs,
                      liveStrengthMpa,
                      liveQuality?.label || ""
                    )
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle size={14} className="text-rose-600" />
                  <span>Raise Concrete Defect Finding</span>
                </button>
              </>
            )}
          </div>

          {/* Right 2 Columns: Waveform Oscillogram & Tests Registry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waveform Oscillogram */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-emerald-600" />
                  <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                    Ultrasonic Waveform Oscillogram
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Transducer: 54 kHz PZT
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 min-h-[300px]">
                {activePunditTest ? (
                  <PunditWaveformViewer test={activePunditTest} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-mono">
                    Select a UPV test below to view its ultrasonic waveform oscillogram.
                  </div>
                )}
              </div>
            </div>

            {/* UPV Test Registry & Folders */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                    UPV Test Registry
                  </h3>
                  <p className="text-xs text-slate-500">
                    All ultrasonic pulse velocity tests recorded across your scoped projects.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <FolderViewToggle
                    viewMode={testFolders.viewMode}
                    onChange={testFolders.setViewMode}
                  />
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                    {punditTests ? punditTests.length : 0} tests
                  </span>
                </div>
              </div>

              {recordsError ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  {recordsError}
                </div>
              ) : punditTests === null ? (
                <div className="py-12 text-center text-xs text-slate-400 font-mono">
                  Loading UPV test register...
                </div>
              ) : punditTests.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-mono">
                  No UPV tests have been recorded yet.
                </div>
              ) : testFolders.viewMode === "grouped" ? (
                <ProjectFloorStationTreeBody
                  groups={testFolders.groups}
                  openProjects={testFolders.openProjects}
                  openFloors={testFolders.openFloors}
                  openStations={testFolders.openStations}
                  toggleProject={testFolders.toggleProject}
                  toggleFloor={testFolders.toggleFloor}
                  toggleStation={testFolders.toggleStation}
                  stationSummary={punditStationSummary}
                  renderStationBody={(rows) => (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50">
                      {(rows as PunditTest[]).map(renderTestCard)}
                    </div>
                  )}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
                  {punditTests.map(renderTestCard)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: MANUAL STATION ENTRY FORM */}
      {punditMode === "manual" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#022C4F]">
              Record Manual UPV Measurement Station
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter field readings per BS 1881-203. Values are verified and submitted with an authentic SHA-256 seal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Project <span className="text-rose-500">*</span>
              </label>
              <select
                value={manualForm.projectId}
                onChange={(e) => setManualForm({ ...manualForm, projectId: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-[#022C4F]"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.reference ? `(${p.reference})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Structural Element <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Column C3 (Axis B-4)"
                value={manualForm.elementName}
                onChange={(e) => setManualForm({ ...manualForm, elementName: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Location Details
              </label>
              <input
                type="text"
                placeholder="e.g. Level 3 Core Wall"
                value={manualForm.elementLocation}
                onChange={(e) => setManualForm({ ...manualForm, elementLocation: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>
          </div>

          {/* Reading Input Row */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Add Transmission Points
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Path Length (mm)
                </label>
                <input
                  type="number"
                  placeholder="300"
                  value={manualForm.pathLengthMm}
                  onChange={(e) => setManualForm({ ...manualForm, pathLengthMm: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Transit Time (µs)
                </label>
                <input
                  type="number"
                  placeholder="68.4"
                  value={manualForm.transitTimeUs}
                  onChange={(e) => setManualForm({ ...manualForm, transitTimeUs: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Surface Temp (°C)
                </label>
                <input
                  type="number"
                  placeholder="29.5"
                  value={manualForm.surfaceTempC}
                  onChange={(e) => setManualForm({ ...manualForm, surfaceTempC: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddManualPoint}
                  className="w-full py-2 px-3 bg-[#022C4F] hover:bg-[#033B6B] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add Point</span>
                </button>
              </div>
            </div>

            {/* Reading Points Table */}
            {manualForm.points.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-slate-200 mt-3">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Point</th>
                      <th className="p-2.5 font-mono">Path Length</th>
                      <th className="p-2.5 font-mono">Transit Time</th>
                      <th className="p-2.5 font-mono">Calculated Velocity</th>
                      <th className="p-2.5">Indicative Strength</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {manualForm.points.map((pt, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-slate-800">{pt.label}</td>
                        <td className="p-2.5 font-mono text-slate-600">{pt.pathMm} mm</td>
                        <td className="p-2.5 font-mono text-slate-600">{pt.timeUs} µs</td>
                        <td className="p-2.5 font-mono font-bold text-[#022C4F]">{pt.velMs} m/s</td>
                        <td className="p-2.5 font-mono text-emerald-700 font-semibold">
                          ~{estimateCompressiveStrength(pt.velMs)} MPa
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setManualForm({
                                ...manualForm,
                                points: manualForm.points.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPunditMode("live")}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveManualTest}
              className="px-6 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#033B6B] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck size={15} />
              <span>Commit & Transmit to Pipeline</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: SESSION FILE BATCH UPLOAD */}
      {punditMode === "batch" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#022C4F]">
              Upload PUNDIT Instrument Session File
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Import export files directly from Screening Eagle / Proceq Pundit instruments (.csv, .xlsx, .dat).
            </p>
          </div>

          <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/60 text-center flex flex-col items-center justify-center">
            <FileSpreadsheet size={40} className="text-slate-400 mb-3" />
            <div className="text-sm font-bold text-slate-700 mb-1">
              Select or drop your instrument export file
            </div>
            <p className="text-xs text-slate-500 mb-4 max-w-sm">
              The server will compute the authentic cryptographic SHA-256 seal upon ingestion.
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#022C4F] text-white text-xs font-bold hover:bg-[#033B6B] transition-all cursor-pointer shadow-sm">
              <Upload size={14} />
              <span>Choose File</span>
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls,.dat,.pundit"
                disabled={isBatchUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBatchFileUpload(file);
                }}
              />
            </label>
          </div>

          {isBatchUploading && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-mono text-center">
              Uploading file and computing cryptographic SHA-256 digest...
            </div>
          )}

          {batchSha256 && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <ShieldCheck size={16} />
                <span>Sensor File Stored & Certified</span>
              </div>
              <div className="text-xs font-mono text-emerald-950 break-all bg-white p-2.5 rounded-lg border border-emerald-300">
                SHA-256: {batchSha256}
              </div>
            </div>
          )}

          {batchHashError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-mono">
              {batchHashError}
            </div>
          )}
        </div>
      )}

      {/* SWO Defect Finding Escalation Modal */}
      {swoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F181F]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle size={18} />
                <span>Raise Concrete Defect Regulatory Finding</span>
              </h3>
              <button
                type="button"
                onClick={() => setSwoModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5 text-rose-900">
              <div><strong>Target Element:</strong> {swoData.element}</div>
              {swoData.velocityMs && (
                <div><strong>Measured Velocity:</strong> {formatVelocityMs(swoData.velocityMs)} m/s</div>
              )}
              {swoData.strengthMpa && (
                <div><strong>Est. Strength:</strong> {swoData.strengthMpa} MPa</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Inspector Recommendation / Action
              </label>
              <textarea
                rows={3}
                value={swoRecommendation}
                onChange={(e) => setSwoRecommendation(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
              />
            </div>

            {swoError && (
              <div className="p-3 rounded-lg bg-rose-100 text-rose-800 text-xs font-mono">
                {swoError}
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSwoModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingSwo}
                onClick={handleSubmitSwo}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {isSubmittingSwo ? "Submitting..." : "Log Regulatory Finding"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PunditUpvPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-mono">Loading PUNDIT Workspace...</div>}>
      <PunditWorkspaceInner />
    </Suspense>
  );
}
