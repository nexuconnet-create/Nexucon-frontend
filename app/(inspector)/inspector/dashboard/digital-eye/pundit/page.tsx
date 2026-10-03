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
  Radio,
  Wifi,
  Bluetooth,
  Trash2,
  CheckCircle2,
  Clock,
  PenLine,
  Download,
  Building2,
  MessageSquare,
  Send,
  Camera,
  Users,
} from "lucide-react";
import {
  PunditTest,
  PunditReading,
  getPunditTests,
  createPunditTest,
  clearProjectPunditTests,
  getFieldDevices,
  uploadSensorFile,
  FieldDeviceRecord,
  createDigitalEyeFinding,
  formatVelocityMs,
  getPunditAIAnalyses,
  getPunditAnalysisReview,
  PunditAnalysisReview,
  downloadNdtReport,
  submitInspectorPunditCollaboration,
  regenerateJointPunditAnalysis,
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
import DeviceConnectPanel from "@/components/inspector/DeviceConnectPanel";
import VisualObservationsPanel from "@/components/dashboard/digital-eye/VisualObservationsPanel";
import SiteAttendanceLogPanel from "@/components/dashboard/digital-eye/SiteAttendanceLogPanel";
import FieldPhotoCaptureModal from "@/components/inspector/FieldPhotoCaptureModal";

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

// Concrete quality rating evaluation per BS 1881-203 / ASTM C597 (Valid Range: 2,000 – 5,000 m/s)
function getConcreteQuality(velocityMs: number): {
  rating: PunditTest["concrete_quality_rating"];
  label: string;
  color: string;
  badgeClass: string;
  description: string;
} {
  if (velocityMs > 5000) {
    return {
      rating: "UNVERIFIED" as any,
      label: "ABOVE RANGE (> 5,000 m/s)",
      color: "#8B5CF6",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      description: "Velocity exceeds the 5,000 m/s upper valid concrete boundary (probable rebar hit or wave reflection anomaly).",
    };
  }
  if (velocityMs >= 4500) {
    return {
      rating: "EXCELLENT",
      label: "EXCELLENT (4,500 – 5,000 m/s)",
      color: "#10B981",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Dense, void-free, high-durability structural concrete (BS 1881-203).",
    };
  }
  if (velocityMs >= 3500) {
    return {
      rating: "GOOD",
      label: "GOOD (3,500 – 4,500 m/s)",
      color: "#059669",
      badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
      description: "Sound, well-compacted concrete meeting required structural specification.",
    };
  }
  if (velocityMs >= 3000) {
    return {
      rating: "GOOD",
      label: "MEDIUM (FAIR) (3,000 – 3,500 m/s)",
      color: "#D97706",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Acceptable quality; minor micro-cracking or surface porosity observed.",
    };
  }
  if (velocityMs >= 2000) {
    return {
      rating: "DOUBTFUL",
      label: "DOUBTFUL (2,000 – 3,000 m/s)",
      color: "#DC2626",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-300 font-bold",
      description: "Lower boundary of project valid range (2,000 – 5,000 m/s). Substandard compaction, internal voiding, or honeycomb defect suspected.",
    };
  }
  return {
    rating: "VERY_POOR",
    label: "BELOW RANGE (< 2,000 m/s)",
    color: "#991B1B",
    badgeClass: "bg-rose-100 text-rose-900 border-rose-400 font-extrabold",
    description: "Below the 2,000 m/s minimum valid range. Severe voiding, major structural discontinuity, or failed matrix integrity.",
  };
}

/** Non-linear exponential default model: f_cu = 1.20 * exp(0.85 * V_km/s) per review meeting */
function estimateCompressiveStrength(velocityMs: number): number | null {
  if (velocityMs < 2000 || velocityMs > 5000) return null;
  const vKmS = velocityMs / 1000;
  const strength = 1.2 * Math.exp(0.85 * vKmS);
  return Math.round(Math.min(75, Math.max(10, strength)) * 10) / 10;
}

function PunditWorkspaceInner() {
  const searchParams = useSearchParams();
  const [punditMode, setPunditMode] = useState<"live" | "manual" | "batch" | "device" | "observations" | "attendance">("live");

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setPunditMode("manual");
    }
  }, [searchParams]);

  const [punditTests, setPunditTests] = useState<PunditTest[] | null>(null);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [activePunditTest, setActivePunditTest] = useState<PunditTest | null>(null);
  const [isReloading, setIsReloading] = useState(false);
  const [activePunditReview, setActivePunditReview] = useState<PunditAnalysisReview | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [inspectorVerdict, setInspectorVerdict] = useState("verified");
  const [inspectorCollabText, setInspectorCollabText] = useState("");
  const [isSubmittingCollab, setIsSubmittingCollab] = useState(false);
  const [isRegeneratingJoint, setIsRegeneratingJoint] = useState(false);
  const [collabRegenAi, setCollabRegenAi] = useState(true);
  const [showCollabInput, setShowCollabInput] = useState(false);

  useEffect(() => {
    if (!activePunditTest?.project) {
      setActivePunditReview(null);
      return;
    }
    let cancelled = false;
    setIsLoadingReview(true);
    getPunditAIAnalyses({ project: activePunditTest.project })
      .then(async (analyses) => {
        if (cancelled) return;
        if (!analyses || analyses.length === 0) {
          setActivePunditReview(null);
          return;
        }
        const latest = analyses[0];
        try {
          const rev = await getPunditAnalysisReview(latest.id);
          if (!cancelled) {
            setActivePunditReview({ ...rev, analysis_id: latest.id });
            if (rev.inspector_verdict) setInspectorVerdict(rev.inspector_verdict);
            if (rev.inspector_notes) setInspectorCollabText(rev.inspector_notes);
          }
        } catch {
          if (!cancelled) setActivePunditReview(null);
        }
      })
      .catch(() => {
        if (!cancelled) setActivePunditReview(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingReview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activePunditTest?.project]);

  // Projects assignable to inspector
  const [projects, setProjects] = useState<{ id: string; name: string; reference?: string }[]>([]);

  // Pundit Devices
  const [punditDevices, setPunditDevices] = useState<FieldDeviceRecord[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [activeWorkspaceProjectId, setActiveWorkspaceProjectId] = useState<string>("");

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
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);

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

      const devices = await getFieldDevices({ device_type: "pundit" });
      const devRows = Array.isArray(devices) ? devices : [];
      setPunditDevices(devRows);
      if (devRows.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(devRows[0].id);
      }
    } catch (err: any) {
      setPunditTests(null);
      setRecordsError(
        err?.response?.data?.detail || err?.message || "The UPV test register could not be read."
      );
    }
  };

  const [clearingProject, setClearingProject] = useState<{ name: string; id: string; count: number } | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearProject = (projectName: string, rows: PunditTest[]) => {
    const projId = rows[0]?.project;
    if (!projId) return;
    setClearingProject({ name: projectName, id: projId, count: rows.length });
  };

  const confirmClearProject = async () => {
    if (!clearingProject) return;
    setIsClearing(true);
    try {
      const res = await clearProjectPunditTests(clearingProject.id);
      showToast(`Cleared ${res.deleted_count} tests from ${clearingProject.name}`);
      setClearingProject(null);
      await loadRecords();
    } catch (err: any) {
      showToast(`Failed to clear folder: ${err?.response?.data?.detail || err?.message || 'Error'}`);
    } finally {
      setIsClearing(false);
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
        if (shaped.length > 0) {
          setActiveWorkspaceProjectId((prev) => prev || shaped[0].id);
          setManualForm((prev) => ({ ...prev, projectId: prev.projectId || shaped[0].id }));
        }
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
    const primaryLabel = t.test_location || t.test_reference || "Unreferenced test";
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
          <span className="text-xs font-bold text-[#022C4F] truncate" title={primaryLabel}>
            {primaryLabel}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
              quality
                ? quality.badgeClass
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {quality ? quality.label : "UNRATED"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
          <span className="truncate">{orDash(t.structural_element_name, "Element not recorded")}</span>
          {t.test_reference && (
            <span className="text-[10px] font-mono text-slate-400 font-normal shrink-0">
              {t.test_reference}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 truncate mb-3">
          {t.test_location ? t.test_location : orDash(t.test_location, "Location not recorded")}
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

      {/* Clear Folder Confirmation Modal */}
      {clearingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-rose-700 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-white" />
                <h3 className="font-bold text-sm">Clear Folder Confirmation</h3>
              </div>
              <button
                onClick={() => setClearingProject(null)}
                className="text-white/80 hover:text-white transition-colors"
                disabled={isClearing}
              >
                &times;
              </button>
            </div>
            
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently clear all <strong className="text-rose-700">{clearingProject.count} tests</strong> in folder <strong className="text-slate-800">{clearingProject.name}</strong>?
              </p>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-[11px] text-rose-800">
                This will delete all test records, readings, and waveforms associated with this folder. This action cannot be undone.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setClearingProject(null)}
                disabled={isClearing}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearProject}
                disabled={isClearing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                {isClearing ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Clearing Folder...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Clear All Tests</span>
                  </>
                )}
              </button>
            </div>
          </div>
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
          {projects.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Testing Site:</span>
              <select
                value={activeWorkspaceProjectId}
                onChange={(e) => {
                  const pid = e.target.value;
                  setActiveWorkspaceProjectId(pid);
                  setManualForm((prev) => ({ ...prev, projectId: pid }));
                }}
                className="text-xs font-bold bg-transparent text-[#022C4F] focus:outline-none max-w-[190px] truncate cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCaptureModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Camera size={14} />
            <span>Take Photo Evidence</span>
          </button>
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

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "live", label: "Recorded Tests", icon: Zap },
            { id: "manual", label: "Manual Station Entry", icon: Sliders },
            { id: "batch", label: "Session File Upload", icon: FileSpreadsheet },
            { id: "device", label: "Live Device Connect", icon: Radio },
            { id: "observations", label: "Visual Observations", icon: Camera },
            { id: "attendance", label: "Site Attendance Log", icon: Users },
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

                {/* Principal Engineer Peer Review & Joint Review Card */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Principal Engineer Review & Collaboration
                    </span>
                    {isLoadingReview && (
                      <span className="text-[10px] text-slate-400 font-mono animate-pulse">Syncing…</span>
                    )}
                  </div>

                  {/* Linked Project & Element Scope Banner */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
                        <Building2 size={13} className="text-slate-500 shrink-0" />
                        <span className="truncate">{activePunditReview?.project_name || activePunditTest.project_name || "Assigned Project"}</span>
                      </div>
                      {(activePunditReview?.project_reference || activePunditTest.project) && (
                        <span className="font-mono text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5 shrink-0">
                          {activePunditReview?.project_reference || activePunditTest.project}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>Target: <strong className="text-slate-700">{activePunditTest.structural_element_name || activePunditTest.test_location || "Element"}</strong></span>
                      <span>•</span>
                      <span>Scan: <strong className="text-slate-700">{activePunditTest.test_reference}</strong></span>
                      {activePunditTest.floor && (
                        <>
                          <span>•</span>
                          <span>Level: <strong className="text-slate-700">{activePunditTest.floor}</strong></span>
                        </>
                      )}
                    </div>
                    {activePunditReview?.analysis_reference && (
                      <div className="text-[10px] font-mono text-indigo-700 bg-indigo-50/60 border border-indigo-100 rounded px-2 py-0.5 flex items-center justify-between">
                        <span>Analysis: {activePunditReview.analysis_reference}</span>
                        {activePunditReview.requires_human_review && (
                          <span className="text-[9px] font-sans font-bold text-amber-700 uppercase">Review Pending</span>
                        )}
                      </div>
                    )}
                  </div>

                  {activePunditReview ? (
                    <div className={`p-3.5 rounded-xl border space-y-2 text-xs transition-all ${
                      activePunditReview.review_status === "corroborated"
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                        : activePunditReview.review_status === "returned"
                        ? "bg-rose-50/70 border-rose-200 text-rose-900"
                        : "bg-amber-50/70 border-amber-200 text-amber-900"
                    }`}>
                      <div className="flex items-center gap-1.5">
                        {activePunditReview.review_status === "corroborated" ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : activePunditReview.review_status === "returned" ? (
                          <PenLine size={16} className="text-rose-600 shrink-0" />
                        ) : (
                          <Clock size={16} className="text-amber-600 shrink-0" />
                        )}
                        <span className={`font-bold uppercase tracking-wider text-[11px] ${
                          activePunditReview.review_status === "corroborated"
                            ? "text-emerald-800"
                            : activePunditReview.review_status === "returned"
                            ? "text-rose-800"
                            : "text-amber-800"
                        }`}>
                          {activePunditReview.review_status === "corroborated"
                            ? "Corroborated by Engineer"
                            : activePunditReview.review_status === "returned"
                            ? "Returned for Revision"
                            : "Awaiting Engineer Review"}
                        </span>
                      </div>

                      {activePunditReview.reviewed_by && (
                        <p className="text-[11px] text-slate-600">
                          Reviewed by <strong>{activePunditReview.reviewed_by}</strong>
                          {activePunditReview.reviewed_at && (
                            <> on {new Date(activePunditReview.reviewed_at).toLocaleString()}</>
                          )}
                        </p>
                      )}

                      {activePunditReview.notes ? (
                        <div className="bg-white/90 border border-slate-200 rounded-lg p-2.5 text-[11px] italic text-slate-800 shadow-xs leading-relaxed">
                          “{activePunditReview.notes}”
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No review notes recorded yet by reviewing engineer.</p>
                      )}

                      {activePunditReview.review_status === "returned" && (
                        <p className="text-[10px] text-rose-700 font-semibold bg-rose-100/70 p-2 rounded-lg border border-rose-200">
                          ⚠️ Action required by field inspector: address the reviewing engineer's directives above.
                        </p>
                      )}

                      {/* Display Recorded Inspector Review */}
                      {(activePunditReview.inspector_notes || activePunditReview.inspector_verdict) && (
                        <div className="p-2.5 rounded-lg bg-blue-50/90 border border-blue-200 text-blue-900 space-y-1.5 mt-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-blue-800">
                            <span className="flex items-center gap-1.5">
                              <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">
                                Inspector Review
                              </span>
                              {activePunditReview.inspector_verdict && (
                                <span className="font-semibold text-blue-900">
                                  {activePunditReview.inspector_verdict_display || activePunditReview.inspector_verdict}
                                </span>
                              )}
                            </span>
                            <span className="font-normal text-[9px] text-slate-500">
                              {activePunditReview.inspector_responded_at
                                ? new Date(activePunditReview.inspector_responded_at).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          {activePunditReview.inspector_notes && (
                            <p className="text-[11px] italic bg-white/90 p-2 rounded border border-blue-100 text-slate-800 leading-relaxed">
                              “{activePunditReview.inspector_notes}”
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-500">
                      No engineer review recorded for this project yet.
                    </div>
                  )}

                  {/* Inspector Review Form & Joint AI Analysis */}
                  {activePunditReview?.analysis_id && (
                    <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <MessageSquare size={13} className="text-indigo-600" />
                          Field Inspector Review
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCollabInput(!showCollabInput)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                          {showCollabInput
                            ? "Close"
                            : (activePunditReview.inspector_notes || activePunditReview.inspector_verdict)
                            ? "Update Review"
                            : "+ Enter My Review"}
                        </button>
                      </div>

                      {showCollabInput && (
                        <div className="space-y-2.5 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Inspector Assessment Verdict
                            </label>
                            <select
                              value={inspectorVerdict}
                              onChange={(e) => setInspectorVerdict(e.target.value)}
                              className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 text-slate-800 outline-none focus:border-indigo-500"
                            >
                              <option value="verified">Verified — field readings consistent & sound</option>
                              <option value="coupling_rechecked">Transducer coupling verified on site</option>
                              <option value="requires_coring">Secondary coring recommended</option>
                              <option value="retest_recommended">Further station testing / revision required</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Field Review Observations & Remarks
                            </label>
                            <textarea
                              value={inspectorCollabText}
                              onChange={(e) => setInspectorCollabText(e.target.value)}
                              placeholder="Enter your field review observations, coupling notes, or physical condition of tested elements..."
                              rows={2}
                              maxLength={4000}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs outline-none focus:border-indigo-500 focus:bg-white resize-y"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-1.5 text-[10px] text-slate-600 select-none cursor-pointer">
                              <input
                                type="checkbox"
                                checked={collabRegenAi}
                                onChange={(e) => setCollabRegenAi(e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>Synthesize with AI</span>
                            </label>
                            <button
                              type="button"
                              disabled={isSubmittingCollab}
                              onClick={async () => {
                                if (!activePunditReview?.analysis_id) return;
                                setIsSubmittingCollab(true);
                                try {
                                  const updated = await submitInspectorPunditCollaboration(
                                    activePunditReview.analysis_id,
                                    {
                                      inspectorVerdict,
                                      inspectorNotes: inspectorCollabText.trim(),
                                      regenerate: collabRegenAi,
                                    }
                                  );
                                  setActivePunditReview(updated);
                                  setShowCollabInput(false);
                                  showToast("Inspector review recorded! Visible to Directorate/Governor.");
                                } catch (err: any) {
                                  showToast(`Submission failed: ${err?.message || "Error"}`);
                                } finally {
                                  setIsSubmittingCollab(false);
                                }
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <Send size={11} />
                              <span>{isSubmittingCollab ? "Saving…" : "Save Review"}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Joint AI Re-synthesis Action */}
                      <button
                        type="button"
                        disabled={isRegeneratingJoint}
                        onClick={async () => {
                          if (!activePunditReview?.analysis_id) return;
                          setIsRegeneratingJoint(true);
                          try {
                            await regenerateJointPunditAnalysis(activePunditReview.analysis_id);
                            showToast("Joint AI Analysis successfully re-synthesized with both reviews!");
                            const refreshed = await getPunditAnalysisReview(activePunditReview.analysis_id);
                            setActivePunditReview({ ...refreshed, analysis_id: activePunditReview.analysis_id });
                          } catch (err: any) {
                            showToast(`AI generation failed: ${err?.message || "Error"}`);
                          } finally {
                            setIsRegeneratingJoint(false);
                          }
                        }}
                        className="w-full py-2 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                        title="Re-run the platform's multi-model AI synthesis incorporating both Principal Engineer and Inspector reviews"
                      >
                        <Sparkles size={12} className={isRegeneratingJoint ? "animate-spin text-indigo-600" : "text-indigo-600"} />
                        <span>{isRegeneratingJoint ? "Synthesizing Joint AI Analysis…" : "Run Joint AI Analysis (Engineer + Inspector)"}</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!activePunditTest?.project) return;
                      showToast("Generating official BS 1881-203 NDT Report PDF…");
                      downloadNdtReport(activePunditTest.project, activePunditTest.operator_name || undefined)
                        .then((filename) => showToast(`Downloaded ${filename}`))
                        .catch((err: any) => showToast(`Download failed: ${err?.message || 'Error'}`));
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#022C4F] hover:bg-[#033c6c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Download the official BS 1881-203 NDT Report including Section 5.3 Joint Review and Section 5.4 Observations"
                  >
                    <Download size={13} />
                    <span>Download Official NDT Report (PDF)</span>
                  </button>
                </div>
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
                  onClearProject={handleClearProject}
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
                        <td className="p-2.5 font-mono">
                          {estimateCompressiveStrength(pt.velMs) != null ? (
                            <span className="text-emerald-700 font-semibold">~{estimateCompressiveStrength(pt.velMs)} MPa</span>
                          ) : (
                            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                              Outside valid range (2,000–5,000 m/s)
                            </span>
                          )}
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

      {/* MODE 4: LIVE DEVICE CONNECT */}
      {punditMode === "device" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-[#022C4F]">
              Live Instrument Connection
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect to Screening Eagle / Proceq instruments directly over Wi-Fi or Bluetooth.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Pundit Instrument
              </label>
              {punditDevices.length > 0 ? (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                >
                  <option value="" disabled>-- Select a registered device --</option>
                  {punditDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.device_id} ({d.model || d.device_type_display})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>No Pundit devices are registered or assigned to you.</span>
                  </div>
                  <Link
                    href="/inspector/dashboard/sync/devices"
                    className="font-bold underline text-amber-900 hover:text-amber-950 shrink-0"
                  >
                    Register Device &rarr;
                  </Link>
                </div>
              )}
            </div>

            {selectedDeviceId && (
              <DeviceConnectPanel 
                device={punditDevices.find(d => d.id === selectedDeviceId)!} 
              />
            )}
          </div>
        </div>
      )}

      {/* MODE 5: VISUAL FIELD OBSERVATIONS & DEFECT PHOTOS */}
      {punditMode === "observations" && (
        <VisualObservationsPanel
          projectId={activeWorkspaceProjectId || manualForm.projectId || (projects[0]?.id ?? "")}
        />
      )}

      {/* MODE 6: CLIENT & SITE ATTENDANCE REGISTER */}
      {punditMode === "attendance" && (
        <SiteAttendanceLogPanel
          projectId={activeWorkspaceProjectId || manualForm.projectId || (projects[0]?.id ?? "")}
        />
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

      {/* Field Photo Capture Modal */}
      <FieldPhotoCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        projectId={activeWorkspaceProjectId || manualForm.projectId || (projects[0]?.id ?? "")}
        projectName={projects.find((p) => p.id === (activeWorkspaceProjectId || manualForm.projectId || projects[0]?.id))?.name}
        structuralElementId={manualForm.elementName || activePunditTest?.structural_element_name || ""}
        onEvidenceCreated={() => {
          showToast("Photo evidence sealed with SHA-256 and sent to Government Dashboard.");
          loadRecords();
        }}
      />
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
