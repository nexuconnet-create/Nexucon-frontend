"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  Box,
  Radio,
  Activity,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Wifi,
  Bluetooth,
  RefreshCw,
  Sliders,
  Download,
  Upload,
  FileSpreadsheet,
  Hash,
  Lock,
  BatteryCharging,
  Cpu,
  Scan,
  Share2,
  X,
  Plus,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  GPRScan,
  PunditTest,
  PunditReading,
  getPunditTests,
  createPunditTest,
  getGPRScans,
  getFieldDevices,
  getEvidenceSpatialPoints,
  getBIMStructuralElements,
  uploadSensorFile,
  FieldDeviceRecord,
  EvidenceSpatialPoint,
  BIMStructuralElement,
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

// Dynamically import heavy 3D and canvas viewers
const RadargramViewer = dynamic(
  () => import("@/components/dashboard/digital-eye/RadargramViewer"),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-xs text-slate-400 font-mono">Loading Radargram Radar Engine...</div> }
);

const PunditWaveformViewer = dynamic(
  () => import("@/components/dashboard/digital-eye/PunditWaveformViewer"),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-xs text-slate-400 font-mono">Loading Ultrasonic Pulse Velocity Engine...</div> }
);

const TrimbleBIMViewer = dynamic(
  () => import("@/components/dashboard/digital-eye/TrimbleBIMViewer"),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-xs text-slate-400 font-mono">Connecting Trimble Connect 3D Viewer...</div> }
);

const EvidenceMapCanvas = dynamic(
  () => import("@/components/dashboard/digital-eye/EvidenceMapCanvas"),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-xs text-slate-400 font-mono">Initializing GNSS Spatial Canvas...</div> }
);

// There used to be a `sampleGprScan` and an `initialPunditTest` here: a
// complete GPR survey ("GPR-2026-LKK-0014", Grid A1-D4 basement, 8 rebar layers
// and one air void) and a complete PUNDIT test with two readings, a
// "UPV-2026-0042" reference, an operator name and a 41.2 MPa strength. Both
// were literals, and both were rendered as this inspector's live work. They are
// gone: the panels below now read the records the platform actually holds, and
// say so when it holds none.
//
// Concrete quality rating evaluation per BS 1881-203 / ASTM C597.
function getConcreteQuality(velocityMs: number): {
  rating: PunditTest['concrete_quality_rating'];
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

/**
 * A provisional strength from a velocity, for the MANUAL ENTRY PREVIEW ONLY.
 *
 * This is not the platform's figure. The registered strength is computed
 * server-side from the project's active calibration curve and stored on the
 * test with a provenance snapshot; `PunditTest.estimated_compressive_strength_mpa`
 * is that value, and it is what every recorded measurement on this page
 * displays. This helper exists so an inspector typing raw readings can see an
 * indicative number before committing — it must never be shown for a stored
 * test, because it can disagree with the sealed one.
 */
function estimateCompressiveStrength(velocityMs: number): number {
  if (velocityMs <= 0) return 0;
  // Standard regression for 20-30 MPa nominal mixes in West Africa:
  // f_ck = a * (V_km_s)^b with calibration offset
  const vKmS = velocityMs / 1000;
  const strength = 1.15 * Math.pow(vKmS, 2.45);
  return Math.round(Math.min(75, Math.max(10, strength)) * 10) / 10;
}

/**
 * The digest of a payload, as bytes → hex.
 *
 * This used to fall back to `"0x" + Math.random().toString(16)…` on failure, so
 * a browser without `crypto.subtle` — or any thrown error at all — produced a
 * string that looked exactly like a SHA-256 seal and was printed in the audit
 * panel as one. A fabricated seal on a tamper-evidence control is worse than no
 * seal: it certifies nothing while appearing to certify everything. It now
 * throws, and every caller reports that the digest could not be computed.
 */
async function computeSha256(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function InspectorDigitalEyeWorkspace() {
  // Navigation tabs
  const [activeSubmodule, setActiveSubmodule] = useState<
    "pundit" | "gpr" | "bim" | "spatial" | "sessions"
  >("pundit");

  // PUNDIT ingestion mode
  const [punditMode, setPunditMode] = useState<"live" | "manual" | "batch">("live");

  /**
   * Honour the deep link the Command Center's "New UPV Test" button sends.
   *
   * That link has always been `/digital-eye?tab=pundit&action=new`, and this
   * page read neither parameter: the button landed on the default tab in
   * "Recorded Tests" mode, which lists tests already recorded rather than
   * offering a new one. A control that names an action and performs a different
   * one is worse than a control that does nothing, because the inspector
   * believes the form is open.
   *
   * Only the two parameters this application emits are read, and an
   * unrecognised value is ignored rather than coerced — a `tab` naming a
   * submodule that does not exist must not silently select some other one.
   */
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "pundit" || tab === "gpr" || tab === "bim" || tab === "spatial" || tab === "sessions") {
      setActiveSubmodule(tab);
    }
    // "new" opens the manual station entry form, which is where a single
    // ultrasonic test is typed in by hand. The other two modes read records the
    // platform already holds, so neither can start a new test.
    if (searchParams.get("action") === "new") {
      setPunditMode("manual");
    }
  }, [searchParams]);

  // Device telemetry state.
  //
  // This was four hand-written device objects — a "Screening Eagle Pundit Live"
  // with serial PL-54K-99214, 88% battery, RSSI -58 and "12 days calibration
  // left", plus a Proceq GPR, a Tersus rover and a Trimble scanner — each
  // rendered with a live-looking status pill. None came from the platform, and
  // `getFieldDevices()` was imported by this file and never called. The cards
  // now show the devices the platform actually has registered.
  const [devices, setDevices] = useState<FieldDeviceRecord[]>([]);
  const [devicesError, setDevicesError] = useState<string | null>(null);

  const [isPairModalOpen, setIsPairModalOpen] = useState(false);

  // The inspector's recorded PUNDIT tests and GPR surveys. `null` distinguishes
  // "could not be read" from an empty list ("none recorded"), which the panels
  // report differently.
  const [punditTests, setPunditTests] = useState<PunditTest[] | null>(null);
  const [gprScans, setGprScans] = useState<GPRScan[] | null>(null);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  const [activePunditTest, setActivePunditTest] = useState<PunditTest | null>(null);
  const [activeGprScan, setActiveGprScan] = useState<GPRScan | null>(null);

  // The recorded spatial evidence points for the projects in this inspector's
  // scope. `null` is "the register could not be read", distinct from `[]`
  // ("nothing recorded"), which the map panel reports differently. The panel
  // used to render `<EvidenceMapCanvas points={[]} />` — a literal empty array
  // on every project — under a header reading "Accuracy: ±14mm • 18 Satellites
  // Fix" and an "RTK Fixed" badge, neither of which came from any record.
  const [spatialPoints, setSpatialPoints] = useState<EvidenceSpatialPoint[] | null>(null);
  const [spatialError, setSpatialError] = useState<string | null>(null);

  // The BIM tab's project and its imported structural elements.
  //
  // The viewer below used to be mounted as
  // `<TrimbleBIMViewer projectId="prj-1" elements={[]} />` — a literal project
  // id belonging to no project on the platform, and a literal empty element
  // list — under a badge reading "LOD 350" and a subtitle promising "NDT
  // inspection station markers". `TrimbleBIMViewer` is honest: given a project
  // it fetches that project's real tessellated geometry and reports `no-model`
  // when there is none. It was simply never given one, so the panel reported
  // "no model" for a project that does not exist, and the inspector could not
  // tell that from their own site having no model imported.
  //
  // `null` elements is "could not be read", distinct from `[]`.
  const [bimProjectId, setBimProjectId] = useState("");
  const [bimElements, setBimElements] = useState<BIMStructuralElement[] | null>(null);
  const [bimError, setBimError] = useState<string | null>(null);

  // Manual Station Entry Form state.
  //
  // Every field here used to be pre-filled with a fabricated measurement —
  // element "COL-C24", location "Grid D-7 Core Section Column C-24 Level 3",
  // 400 mm, 95.0 µs, 29.5 °C, operator "Engr. A. Adeleke" — and three
  // pre-computed reading points. An inspector who opened this form and pressed
  // "Commit & Transmit to Pipeline" without typing anything filed a complete
  // ultrasonic test that no instrument had performed, against an element that
  // may not exist, under another engineer's name. The form now starts empty.
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

  // The projects the inspector can record against. A measurement is only
  // meaningful against a project — the calibration curve that turns a transit
  // time into a strength belongs to one — so the server requires it and the
  // form cannot leave it blank. There is no default: guessing which project a
  // reading belongs to would file a real measurement against the wrong
  // structure.
  const [projects, setProjects] = useState<
    { id: string; name: string; reference?: string }[]
  >([]);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Batch session file state. There were three fabricated rows here plus a
  // `batchRows` preview of six invented stations ("ST-01/COL-C24/94.2 µs" …)
  // shown for *any* file the inspector dropped in, followed by a toast claiming
  // six stations had been ingested with a seal. Nothing was ever uploaded.
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchSha256, setBatchSha256] = useState<string | null>(null);
  const [batchHashError, setBatchHashError] = useState<string | null>(null);
  const [uploadedFileRef, setUploadedFileRef] = useState<string | null>(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);

  // Stop Work Order (SWO) Defect Escalation modal state. `swoData` used to be
  // pre-seeded with a "COL-C24 / 2450 m/s / 19.2 MPa / DOUBTFUL" reading, so
  // opening the modal before any measurement showed a defect that had not been
  // found. It is now only ever populated from a measurement the inspector is
  // looking at, or from a value they type in themselves.
  const [swoModalOpen, setSwoModalOpen] = useState(false);
  const [swoData, setSwoData] = useState<{
    element: string;
    velocityMs: number | null;
    strengthMpa: number | null;
    rating: string;
    recommendation: string;
    /**
     * Where these figures came from, because the finding's wording depends on
     * it. A regression raised from a saved test can cite the server's own
     * numbers. One raised from the manual-entry form is citing entries that
     * have never been stored and have had no calibration curve applied, so the
     * statutory record must describe them as the inspector's own entries rather
     * than as a measurement the platform recorded.
     */
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

  // Toast / feedback message
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isReloadingRegisters, setIsReloadingRegisters] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadRecords = async () => {
    setRecordsError(null);
    setSpatialError(null);

    const [tests, scans, deviceRows, spatialRows] = await Promise.allSettled([
      getPunditTests(),
      getGPRScans(),
      getFieldDevices(),
      // No `project` filter: the viewset scopes this to the projects in the
      // inspector's own scope, so an unfiltered read is the inspector's whole
      // spatial register rather than every point on the platform.
      getEvidenceSpatialPoints(),
    ]);

    if (tests.status === "fulfilled") {
      const rows = Array.isArray(tests.value) ? tests.value : [];
      setPunditTests(rows);
      setActivePunditTest((prev) => {
        if (prev && rows.some((r) => r.id === prev.id)) return prev;
        return rows[0] ?? null;
      });
    } else {
      setPunditTests(null);
      setRecordsError(
        tests.reason?.response?.data?.detail ||
          tests.reason?.message ||
          "The UPV test register could not be read."
      );
    }

    if (scans.status === "fulfilled") {
      const rows = Array.isArray(scans.value) ? scans.value : [];
      setGprScans(rows);
      setActiveGprScan((prev) => {
        if (prev && rows.some((r) => r.id === prev.id)) return prev;
        return rows[0] ?? null;
      });
    } else {
      setGprScans(null);
    }

    if (deviceRows.status === "fulfilled") {
      setDevices(Array.isArray(deviceRows.value) ? deviceRows.value : []);
    } else {
      setDevices([]);
      setDevicesError(
        deviceRows.reason?.response?.data?.detail ||
          deviceRows.reason?.message ||
          "The device registry could not be read."
      );
    }

    if (spatialRows.status === "fulfilled") {
      const rows = Array.isArray(spatialRows.value) ? spatialRows.value : [];
      setSpatialPoints(rows);
    } else {
      setSpatialPoints(null);
      setSpatialError(
        spatialRows.reason?.response?.data?.detail ||
          spatialRows.reason?.message ||
          "The spatial evidence register could not be read."
      );
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  /**
   * Read the imported BIM elements for the project the BIM tab is showing.
   *
   * Nothing is requested until a project is chosen, because the alternative —
   * guessing one — is what put `prj-1` on this screen. A failed read leaves
   * `bimElements` null so the tab can say the register could not be read, which
   * is a different statement from a project whose model has no elements.
   */
  useEffect(() => {
    if (!bimProjectId) {
      setBimElements(null);
      setBimError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await getBIMStructuralElements({ project: bimProjectId });
        if (cancelled) return;
        setBimElements(Array.isArray(rows) ? rows : []);
        setBimError(null);
      } catch (err: any) {
        if (cancelled) return;
        setBimElements(null);
        setBimError(
          err?.response?.data?.detail ||
            err?.message ||
            "The BIM element register could not be read."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bimProjectId]);

  /**
   * Re-read the three registers.
   *
   * The button this replaced showed the toast "Hardware telemetry synced with
   * cloud pipeline." and issued no request at all: nothing was read, nothing was
   * synced, and the sentence named a cloud pipeline this application does not
   * talk to. A refresh control reports what it actually did, and a read that
   * fails is reported by the error panels `loadRecords` sets rather than by a
   * success message here.
   */
  const handleReloadRegisters = async () => {
    setIsReloadingRegisters(true);
    await loadRecords();
    setIsReloadingRegisters(false);
    showToast("Registers re-read from the server.");
  };

  // Load the projects a measurement can be recorded against.
  //
  // The *assignable* list, not the registry browse: recording a measurement
  // resolves its project through `scoped_projects(user)` server-side, so a
  // picker filled from the unscoped browse would offer projects the write
  // then refuses.
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
        setProjectsError(null);
      } catch (err: any) {
        if (cancelled) return;
        setProjects([]);
        setProjectsError(
          err?.response?.data?.detail ||
            err?.message ||
            "The project list could not be read."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // The registered devices, shaped for the fleet cards.
  //
  // Every field below is a recorded one. Where the registry holds nothing —
  // `battery_level` is nullable, and a device may never have been calibrated —
  // the card says so rather than filling in a plausible number.
  const deviceCards = devices.map((d) => {
    const statusLabel = d.status_display || d.status || "";
    const online = /connect|active|online|fixed|ready/i.test(statusLabel) && d.is_active;
    return {
      id: d.id,
      name: d.name || d.model || d.device_id || "Unnamed device",
      type: d.device_type_display || d.device_type || "",
      serial: d.device_reference || d.device_id || "",
      interface: [d.manufacturer, d.model].filter(Boolean).join(" ") || "Make and model not recorded",
      firmware: d.firmware_version || null,
      battery: d.battery_level,
      lastSeen: d.last_seen,
      calibrationDate: d.calibration_date,
      status: statusLabel || "Status not recorded",
      badge: online
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-slate-100 text-slate-600 border-slate-200",
      online,
    };
  });

  const onlineDeviceCount = deviceCards.filter((d) => d.online).length;

  // The values shown in the readout panel, taken from the record on screen.
  //
  // There is no live device stream in this application: the "Live BLE
  // Streaming" panel used to synthesise one, adding `Math.random()` jitter to a
  // transit time on a 650 ms timer and sealing the result with a SHA-256 hash
  // of the made-up payload. The panel is now a readout of the selected recorded
  // test — the same numbers the report and the audit trail carry.
  const livePulseTransitUs = activePunditTest?.transit_time_us ?? null;
  const livePathLengthMm = activePunditTest?.path_length_mm ?? null;
  const liveVelocityMs =
    activePunditTest && activePunditTest.pulse_velocity_ms > 0
      ? activePunditTest.pulse_velocity_ms
      : null;
  const liveQuality = liveVelocityMs !== null ? getConcreteQuality(liveVelocityMs) : null;
  // The platform computes the strength from the project's active calibration
  // curve and stores it with a provenance snapshot. The figure below is that
  // stored value — never a client-side recomputation, which could disagree with
  // the number the sealed report carries.
  const liveStrengthMpa = activePunditTest?.estimated_compressive_strength_mpa ?? null;

  // Pre-fill the escalation dialog from a recorded measurement.
  const handleOpenEscalation = (
    element: string,
    velocity: number | null,
    strength: number | null,
    rating: string,
    source: "recorded_test" | "manual_entry" = "recorded_test"
  ) => {
    // The band itself is a real classification (below 3000 m/s is the
    // Doubtful/Poor band in the standard UPV scale). What differs is what the
    // figure is attached to: a stored measurement, or figures the inspector has
    // typed and not yet saved.
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

  // Submit Regulatory Finding / SWO.
  //
  // The catch here used to say "Regulatory finding registered locally and
  // queued for audit sync" — a claim that something was stored and would be
  // sent later. Nothing was stored and nothing was queued; the finding was
  // simply lost, and the inspector was told the opposite.
  //
  // The description is assembled from what was actually on screen. It used to
  // interpolate the velocity unconditionally, so a finding raised from a
  // survey that carries no velocity read "measured a pulse velocity of null
  // m/s" as if a measurement had been taken.
  const handleSubmitSwo = async () => {
    setIsSubmittingSwo(true);
    setSwoError(null);
    try {
      // The description is assembled from what was actually on screen, and from
      // where it came from. Two separate false claims used to be possible here:
      // it interpolated the velocity unconditionally, so a finding raised from a
      // survey with no velocity read "measured a pulse velocity of null m/s" as
      // if a measurement had been taken; and it cited a strength as
      // "platform-estimated" when the figure had come from a client-side
      // approximation applied to entries the server had never seen.
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

  // Manual Form: Add reading point
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

  // Manual Form: Submit test to API
  //
  // The catch here used to build a `mockSaved` record — a fabricated reference,
  // the project name "Lekki Pearl Residences", "Dry / 29.5°C", "Level 3" — push
  // it into the visible history, and announce it as "saved to local offline
  // store". No offline store exists. A failed ultrasonic test appeared as a
  // completed one, and the inspector had no way to know it had not been saved.
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
      // `structural_element` and `pulse_time_us` are the names the serializer
      // reads. This payload used to send `structural_element_name` and
      // `transit_time_us`, which the create path does not accept at the top
      // level: TypeScript did not catch it because excess-property checking
      // does not apply to a variable, so the element name and the scalar
      // transit time were silently dropped and the row was written without
      // them.
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

  // Batch Session File Upload.
  //
  // This used to "parse" nothing at all: it hashed the file locally and then
  // set a hardcoded array of six plausible-looking stations, which the preview
  // table rendered as "All 6 Records Validated"; the commit button then waited
  // 800 ms and announced six stations ingested. The file never left the browser.
  // It now uploads the file to the server, which returns the digest it computed
  // over the stored bytes.
  const handleBatchFileUpload = async (file: File) => {
    setBatchFile(file);
    setBatchSha256(null);
    setBatchHashError(null);
    setUploadedFileRef(null);
    setIsBatchUploading(true);

    try {
      const record = await uploadSensorFile(file, "pundit_raw", "PUNDIT session export");
      setUploadedFileRef(record.id);
      setBatchSha256(record.sha256_checksum || null);
      if (!record.sha256_checksum) {
        setBatchHashError(
          "The server stored the file but returned no digest for it."
        );
      }
      showToast(`${file.name} uploaded and stored by the server.`);
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

  const handleClearBatch = () => {
    setBatchFile(null);
    setBatchSha256(null);
    setBatchHashError(null);
    setUploadedFileRef(null);
  };

  /**
   * What the spatial register actually says, for the map panel's subtitle.
   *
   * This header used to read "Accuracy: ±14mm • 18 Satellites Fix" with an
   * "RTK Fixed" badge, on every project, for every inspector, whether or not a
   * receiver had ever been on site. Both are measurements — a positional
   * precision and a satellite count — and neither was recorded anywhere the
   * platform could read. The subtitle now reports the count of points held and
   * the best precision among those that recorded one, and the badge reports the
   * layer mix rather than claiming a fix.
   */
  const spatialAccuracies = (spatialPoints ?? [])
    .map((p) => p.accuracy_mm)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0);
  const spatialBestAccuracyMm =
    spatialAccuracies.length > 0 ? Math.min(...spatialAccuracies) : null;

  /**
   * Folder state for the Recorded UPV Tests register.
   *
   * This page's register is deliberately cross-project — `getPunditTests()` is
   * called with no project filter so the viewset returns every project in the
   * inspector's scope — so it gets the three-level Project → Floor → Station
   * tree. A Floor-first tree would fold several projects' tests under one
   * "Floor:200THK RC SLAB" heading, which is a merged structure the records do
   * not support. Called unconditionally: `punditTests` is null until the fetch
   * resolves, and a hook may not be skipped on that.
   */
  const testFolders = useProjectFloorStationFolders(
    punditTests ?? [],
    punditProjectOf,
    punditFloorOf,
    punditStationOf
  );

  /** One recorded test card — shared by the flat grid and the folder tree's
   *  station body, so the two views can never drift apart. */
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
            ? "border-[#022C4F] bg-blue-50/40 ring-2 ring-[#022C4F]/10 shadow-sm"
            : "border-slate-200/70 bg-white hover:bg-slate-50/50"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
            {orDash(t.test_reference, "No reference")}
          </span>
          {quality ? (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${quality.badgeClass}`}>
              {quality.rating}
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">
              {orDash(t.concrete_quality_rating, "Unanalysed")}
            </span>
          )}
        </div>

        <h4 className="text-xs font-bold text-slate-900 truncate mb-1">
          {orDash(t.structural_element_name, "Element not recorded")}
        </h4>
        <p className="text-[11px] text-slate-500 truncate mb-1">
          {orDash(t.test_location, "Location not recorded")}
        </p>
        <p className="text-[11px] text-slate-400 truncate mb-3">
          {orDash(t.project_name, "Project not recorded")} &bull;{" "}
          {dateOr(t.test_date, "Date not recorded")}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono font-bold text-[#022C4F]">
          <span>
            {analysed
              ? `${t.pulse_velocity_ms} m/s`
              : "Not yet analysed"}
          </span>
          <span className="text-slate-500 text-[11px] font-normal">
            {t.estimated_compressive_strength_mpa !== null
              ? `${t.estimated_compressive_strength_mpa} MPa`
              : "Strength not reported"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#022C4F] text-white shadow-2xl border border-cyan-400/40 text-xs font-semibold animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Scan size={20} className="text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
                  TS-1 (MVP) Device & NDT Hub
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100/70 border border-cyan-300 px-2 py-0.5 rounded-md">
                  TS-1 MVP
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Field hardware ingestion suite for Screening Eagle PUNDIT Live UPV, Proceq GPR radar, and GNSS rovers with automated BS 1881-203 concrete quality verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 sm:ml-[52px] sm:self-center">
          <button
            type="button"
            onClick={() => setIsPairModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-[#022C4F] text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Bluetooth size={14} className="text-blue-600" />
            <span>Hardware Telemetry ({onlineDeviceCount}/{deviceCards.length})</span>
          </button>
          <button
            type="button"
            onClick={handleReloadRegisters}
            disabled={isReloadingRegisters}
            className="p-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            title="Re-read the device, UPV and GPR registers from the server"
          >
            <RefreshCw
              size={15}
              className={isReloadingRegisters ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Hardware Telemetry Fleet Status Bar */}
      {devicesError ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 mb-1">
            The device registry could not be read
          </h3>
          <p className="text-xs text-amber-800">{devicesError}</p>
        </div>
      ) : deviceCards.length === 0 ? (
        <div className="p-5 rounded-2xl bg-white border border-dashed border-slate-300">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            No field devices registered
          </h3>
          <p className="text-xs text-slate-500">
            No instruments are registered to your scope, so none are listed.
            Device registration is done from the Directorate console, not from
            this workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {deviceCards.map((dev) => (
            <div
              key={dev.id}
              onClick={() => setIsPairModalOpen(true)}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase truncate">
                    {dev.type || "Type not recorded"}
                  </span>
                  <h3 className="text-xs font-bold text-[#022C4F] group-hover:text-cyan-700 transition-colors truncate">
                    {dev.name}
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${dev.badge}`}>
                  {dev.status}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                {dev.interface}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <BatteryCharging size={12} className="text-emerald-600" />
                  <span>
                    {dev.battery === null ? "Battery not reported" : `${dev.battery}%`}
                  </span>
                </span>
                <span className="text-slate-400 font-mono truncate max-w-[90px]">
                  {dev.serial || "No reference"}
                </span>
                <span className={dev.calibrationDate ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                  {dev.calibrationDate
                    ? `Calibrated ${dateOr(dev.calibrationDate)}`
                    : "No calibration recorded"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-Modal Submodule Navigation Tabs */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto">
        {[
          { id: "pundit", label: "PUNDIT UPV Ultrasonic", icon: Activity, desc: "Pulse Velocity (TS-1 MVP)", badge: "Primary MVP" },
          { id: "gpr", label: "GPR Radargram Radar", icon: Radio, desc: "Rebar & Void Profile" },
          { id: "bim", label: "3D BIM IFC Geometry", icon: Box, desc: "Trimble Connect" },
          // "GNSS RTK Telemetry" named a receiver and a correction service as
          // the source of these points. The register holds whatever was
          // recorded against the project, and the platform has no GNSS feed —
          // see the tab's own panel, which reports what each point carries.
          { id: "spatial", label: "Spatial Evidence Map", icon: MapPin, desc: "Recorded Survey Points" },
          { id: "sessions", label: "Audit & SHA-256 Vault", icon: ShieldCheck, desc: "Cryptographic Seals" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubmodule(tab.id as any)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 shadow-sm ${
              activeSubmodule === tab.id
                ? "bg-[#022C4F] text-white font-bold"
                : "bg-white text-slate-600 hover:text-[#022C4F] hover:bg-slate-50 border border-slate-200/80 font-medium"
            }`}
          >
            <tab.icon size={16} />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] bg-cyan-400/30 text-cyan-200 border border-cyan-300/40 px-1.5 py-0.2 rounded-full font-bold uppercase">
                    {tab.badge}
                  </span>
                )}
              </div>
              <div className="text-[10px] font-normal opacity-80">{tab.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* SUBMODULE 1: PUNDIT ULTRASONIC UPV (PRIMARY MVP WORKSPACE) */}
      {activeSubmodule === "pundit" && (
        <div className="space-y-6">
          {/* Ingestion Mode Switcher */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                <span>PUNDIT Live Ultrasonic Ingestion Modes</span>
                <span className="text-[10px] font-normal text-slate-500">(BS 1881-203 / ASTM C597)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Choose ingestion method for ultrasonic transit time and pulse velocity testing.
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

          {/* MODE 1: RECORDED TEST READOUT
              This panel was a simulated BLE stream. It added `Math.random()`
              jitter to a transit time on a timer, recomputed a strength with a
              client-side formula, sealed the invented payload with a real
              SHA-256 hash and displayed that hash as an audit seal — all while
              presenting itself as a live instrument feed. There is no BLE bridge
              in this application. What the panel shows now is the selected
              recorded test, with the server's own velocity and strength. */}
          {punditMode === "live" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Recorded Measurement Panel */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                      Recorded Ultrasonic Measurement
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                    {activePunditTest
                      ? activePunditTest.test_reference || "No reference"
                      : "NO TEST SELECTED"}
                  </span>
                </div>

                {activePunditTest === null ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-700">
                      No UPV test is selected
                    </div>
                    <p className="leading-relaxed">
                      {punditTests === null
                        ? "The test register could not be read, so no measurement is shown."
                        : "No ultrasonic test has been recorded for you yet. Record one from Manual Station Entry, or upload an instrument session file."}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Target Element Context */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <div className="flex justify-between gap-3 text-xs">
                        <span className="text-slate-500 shrink-0">Target Element:</span>
                        <strong className="text-[#022C4F] text-right">
                          {orDash(activePunditTest.structural_element_name, "Element name not recorded")}
                        </strong>
                      </div>
                      <div className="flex justify-between gap-3 text-xs">
                        <span className="text-slate-500 shrink-0">Test Location:</span>
                        <span className="font-semibold text-slate-700 text-right">
                          {orDash(activePunditTest.test_location, "Location not recorded")}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 text-xs">
                        <span className="text-slate-500 shrink-0">Transmission:</span>
                        <span className="font-semibold text-slate-700 text-right">
                          {orDash(humaniseTransducer(activePunditTest.transducer_type), "Not recorded")}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 text-xs">
                        <span className="text-slate-500 shrink-0">Operator:</span>
                        <span className="font-semibold text-slate-700 text-right">
                          {orDash(activePunditTest.operator_name, "Not recorded")}
                        </span>
                      </div>
                    </div>

                    {/* Measurement Readouts */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col justify-between">
                        <span className="text-[10px] text-cyan-300 font-mono uppercase">Transit Time (t)</span>
                        <div className="text-2xl font-bold font-mono tracking-tight text-white mt-1">
                          {livePulseTransitUs} <span className="text-xs font-normal text-slate-400">&mu;s</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col justify-between">
                        <span className="text-[10px] text-cyan-300 font-mono uppercase">Path Length (L)</span>
                        <div className="text-2xl font-bold font-mono tracking-tight text-white mt-1">
                          {livePathLengthMm} <span className="text-xs font-normal text-slate-400">mm</span>
                        </div>
                      </div>
                    </div>

                    {/* Velocity & Quality Grade */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">Pulse Velocity (V = L/t):</span>
                        <span className="text-lg font-extrabold text-[#022C4F] font-mono">
                          {liveVelocityMs === null ? (
                            <span className="text-xs font-semibold text-amber-700">
                              Not yet analysed
                            </span>
                          ) : (
                            `${liveVelocityMs} m/s`
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">BS 1881-203 Rating:</span>
                        {liveQuality === null ? (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">
                            Not rated
                          </span>
                        ) : (
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${liveQuality.badgeClass}`}>
                            {liveQuality.rating}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">Est. Compressive (f_ck):</span>
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {liveStrengthMpa === null
                            ? "Not reported by the platform"
                            : `${liveStrengthMpa} MPa`}
                        </span>
                      </div>

                      {liveQuality !== null && (
                        <p className="text-[11px] text-slate-500 leading-snug pt-1 border-t border-slate-200">
                          {liveQuality.description}
                        </p>
                      )}
                      {liveVelocityMs === null && (
                        <p className="text-[11px] text-amber-700 leading-snug pt-1 border-t border-slate-200">
                          The server has not yet computed a pulse velocity for this
                          record, so no velocity, rating or strength is shown. A
                          value will not be estimated here.
                        </p>
                      )}
                    </div>

                    {/* Escalation */}
                    {liveVelocityMs !== null && liveVelocityMs < 3000 && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                          <span>Substandard Velocity Recorded</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          The recorded velocity for this element is below
                          3,000 m/s, the lower bound of the BS 1881-203
                          &ldquo;Doubtful&rdquo; band. Corroboration by core
                          extraction is normally required before a regulatory
                          decision.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEscalation(
                              activePunditTest.structural_element_name || "",
                              liveVelocityMs,
                              liveStrengthMpa,
                              liveQuality?.rating || ""
                            )
                          }
                          className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Record a defect finding
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right 2 Columns: Oscillogram Waveform Canvas Viewer */}
              <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-[#022C4F]">
                      A-Scan Waveform Oscillogram
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activePunditTest
                        ? `Waveform recorded for ${activePunditTest.test_reference || "this test"}`
                        : "No test selected"}
                    </p>
                  </div>
                  {activePunditTest && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                        {activePunditTest.waveform_samples &&
                        activePunditTest.waveform_samples.length > 0
                          ? "Trace recorded by device"
                          : "No trace recorded"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-h-[420px] bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden flex-1">
                  {activePunditTest ? (
                    <PunditWaveformViewer
                      test={activePunditTest}
                      onEscalateNCR={() =>
                        handleOpenEscalation(
                          activePunditTest.structural_element_name || "",
                          liveVelocityMs,
                          liveStrengthMpa,
                          liveQuality?.rating || ""
                        )
                      }
                    />
                  ) : (
                    <div className="h-full min-h-[400px] flex items-center justify-center text-xs text-slate-400 font-mono text-center px-6">
                      Select a recorded test to view its waveform. No trace is
                      drawn when the device did not export one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: MANUAL FIELD STATION ENTRY FORM */}
          {punditMode === "manual" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-[#022C4F]">
                    Manual Station Testing Entry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Input field station path lengths and transit times with automated velocity &amp; quality computation.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg">
                  BS 1881-203 Compliance
                </span>
              </div>

              {/*
                These two were a `<select>` fixed to five invented elements —
                COL-C24, COL-C25, BEAM-B12, SLAB-S04, PILE-CAP-01 — and no input
                at all for the test location, which the API requires. The element
                a UPV test is taken on is a property of the structure being
                inspected, not of this screen, and the platform holds no list of
                them scoped to a single inspector; offering five hardcoded names
                would let a real measurement be filed against an element that
                does not exist on the site. Both are freetext, as the API stores
                them.
              */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Project */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Project</label>
                  <select
                    value={manualForm.projectId}
                    onChange={(e) => setManualForm({ ...manualForm, projectId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value="">
                      {projectsError
                        ? "Project list unavailable"
                        : projects.length === 0
                        ? "No projects in your scope"
                        : "Select the project…"}
                    </option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || "Unnamed project"}
                        {p.reference ? ` (${p.reference})` : ""}
                      </option>
                    ))}
                  </select>
                  {projectsError && (
                    <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                      {projectsError} A test cannot be recorded without one.
                    </p>
                  )}
                </div>

                {/* Structural Element */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Structural Element</label>
                  <input
                    type="text"
                    value={manualForm.elementName}
                    onChange={(e) => setManualForm({ ...manualForm, elementName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                    placeholder="Element as marked on the drawing"
                  />
                </div>

                {/* Test Location */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Test Location</label>
                  <input
                    type="text"
                    value={manualForm.elementLocation}
                    onChange={(e) => setManualForm({ ...manualForm, elementLocation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                    placeholder="Grid reference, level and face"
                  />
                </div>

                {/* Transmission Method */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Transmission Mode</label>
                  <select
                    value={manualForm.method}
                    onChange={(e) => setManualForm({ ...manualForm, method: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value="DIRECT">Direct (Opposite Faces - 180°)</option>
                    <option value="SEMI_DIRECT">Semi-Direct (Adjacent Faces - 90°)</option>
                    <option value="INDIRECT">Indirect / Surface Transmission</option>
                  </select>
                </div>

                {/* Transducer Frequency */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Transducer Frequency</label>
                  <select
                    value={manualForm.frequencyKhz}
                    onChange={(e) => setManualForm({ ...manualForm, frequencyKhz: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value={54}>54 kHz (Standard Concrete Aggregate &le; 32mm)</option>
                    <option value={24}>24 kHz (Coarse Aggregate &gt; 32mm)</option>
                    <option value={150}>150 kHz (Small Mortar Mortar / Cylinders)</option>
                  </select>
                </div>

                {/* Path Length L */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Path Length L (mm)</label>
                  <input
                    type="number"
                    value={manualForm.pathLengthMm}
                    onChange={(e) => setManualForm({ ...manualForm, pathLengthMm: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 font-semibold"
                    placeholder="e.g. 400"
                  />
                </div>

                {/* Transit Time t */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Transit Time t (&mu;s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualForm.transitTimeUs}
                    onChange={(e) => setManualForm({ ...manualForm, transitTimeUs: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 font-semibold"
                    placeholder="e.g. 94.2"
                  />
                </div>

                {/* Concrete Age & Temp */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Surface Temp &amp; Age</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={manualForm.surfaceTempC}
                      onChange={(e) => setManualForm({ ...manualForm, surfaceTempC: e.target.value })}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono"
                      placeholder="Temp °C"
                    />
                    <input
                      type="number"
                      value={manualForm.concreteAgeDays}
                      onChange={(e) => setManualForm({ ...manualForm, concreteAgeDays: e.target.value })}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono"
                      placeholder="Days"
                    />
                  </div>
                </div>

                {/* Surface Condition */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Surface Condition</label>
                  <input
                    type="text"
                    value={manualForm.surfaceCondition}
                    onChange={(e) => setManualForm({ ...manualForm, surfaceCondition: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                    placeholder="Dry, damp, rendered, honeycombed…"
                  />
                </div>

                {/* Operator */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Operator</label>
                  <input
                    type="text"
                    value={manualForm.operatorName}
                    onChange={(e) => setManualForm({ ...manualForm, operatorName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                    placeholder="Name of the person who took the reading"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-3">
                  <label className="block text-slate-600 font-bold mb-1">Notes</label>
                  <input
                    type="text"
                    value={manualForm.notes}
                    onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                    placeholder="Anything about the reading the record should carry"
                  />
                </div>
              </div>

              {/* Multi-point Station Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                    Element Station Readings ({manualForm.points.length} Points Recorded)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddManualPoint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#022C4F] text-white text-xs font-semibold hover:bg-[#022C4F]/90 cursor-pointer shadow-sm"
                  >
                    <Plus size={13} />
                    <span>Add Point</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                        <th className="p-3">Point Label</th>
                        <th className="p-3">Path Length (mm)</th>
                        <th className="p-3">Transit Time (&mu;s)</th>
                        <th className="p-3">Calculated Velocity</th>
                        <th className="p-3">Preview Strength (MPa)</th>
                        <th className="p-3">Quality Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {manualForm.points.map((pt, idx) => {
                        const qual = getConcreteQuality(pt.velMs);
                        const str = estimateCompressiveStrength(pt.velMs);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/60 font-mono">
                            <td className="p-3 font-bold text-slate-800 font-sans">{pt.label}</td>
                            <td className="p-3 text-slate-600">{pt.pathMm} mm</td>
                            <td className="p-3 text-slate-600">{pt.timeUs} &mu;s</td>
                            <td className="p-3 font-bold text-[#022C4F]">{pt.velMs} m/s</td>
                            <td className="p-3 text-slate-700">{str} MPa</td>
                            <td className="p-3 font-sans">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${qual.badgeClass}`}>
                                {qual.rating}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/*
                  The strength column above is a local preview so the operator
                  can sanity-check a reading as they type it. It is NOT the
                  recorded strength: on save the platform recomputes it from the
                  project's active calibration curve and stores the curve it used
                  as a provenance snapshot. The two can legitimately differ, so
                  the preview says so here rather than being mistaken for the
                  sealed figure in the registry below.
                */}
                {manualForm.points.length > 0 && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Preview strength is indicative only. The platform recomputes
                    the recorded value from the project&apos;s active calibration
                    curve on save, and stores the curve it used.
                  </p>
                )}
              </div>

              {/* Submit & Commit Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <span>Inspector Operator: </span>
                  <strong className="text-slate-800">
                    {manualForm.operatorName.trim() || "Not entered"}
                  </strong>
                  <span className="mx-2">&bull;</span>
                  <span>
                    Saved against your account. No seal is claimed for a
                    manual entry beyond the record the server stores.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // A mean over unsaved form entries, and nothing more.
                      //
                      // This button used to assert "Element passes compliance
                      // velocity threshold." for any mean >= 3000 m/s: a
                      // compliance verdict on data the server had never seen,
                      // resting on a hardcoded client-side constant. It also
                      // reduced an empty list to 0 and then took the `< 3000`
                      // branch, so pressing it with no points entered opened an
                      // escalation citing a pulse velocity of 0 m/s.
                      if (manualForm.points.length === 0) {
                        showToast(
                          "Add at least one reading point before checking SWO risk."
                        );
                        return;
                      }
                      const meanVel = Math.round(
                        manualForm.points.reduce((acc, p) => acc + p.velMs, 0) /
                          manualForm.points.length
                      );
                      if (meanVel < 3000) {
                        // `null` strength, deliberately: the platform has not
                        // analysed these entries, so there is no estimate to
                        // cite in an enforcement notice.
                        handleOpenEscalation(
                          manualForm.elementName,
                          meanVel,
                          null,
                          "DOUBTFUL",
                          "manual_entry"
                        );
                      } else {
                        showToast(
                          `Mean of ${manualForm.points.length} entered point${
                            manualForm.points.length === 1 ? "" : "s"
                          }: ${meanVel} m/s. These entries are not saved, so no compliance verdict has been recorded.`
                        );
                      }
                    }}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                  >
                    Check SWO Risk
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveManualTest}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <CheckCircle2 size={15} className="text-cyan-400" />
                    <span>Commit &amp; Transmit to Pipeline</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: BATCH SESSION IMPORT */}
          {punditMode === "batch" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-[#022C4F]">
                    Batch Session File Parser (.CSV / .JSON / .PDT)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Drag and drop raw exports from Screening Eagle Pundit Live or Proceq PL-200 SD card.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Stored &amp; Hashed On Upload
                </span>
              </div>

              {/* Drag-and-drop file target */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleBatchFileUpload(e.dataTransfer.files[0]);
                }}
                className="p-8 border-2 border-dashed border-slate-300 hover:border-[#022C4F] rounded-2xl bg-slate-50/60 hover:bg-slate-50 text-center space-y-3 transition-colors cursor-pointer"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".csv,.json,.pdt,.txt";
                  input.onchange = (e: any) => {
                    if (e.target.files?.[0]) handleBatchFileUpload(e.target.files[0]);
                  };
                  input.click();
                }}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-[#022C4F] flex items-center justify-center mx-auto shadow-sm">
                  <Upload size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {batchFile ? batchFile.name : "Click to select or drag & drop PUNDIT session export file"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supported formats: .CSV, .JSON, .PDT (Pundit binary dump)
                  </p>
                </div>
              </div>

              {/* SHA-256 Checksum Display */}
              {batchSha256 && (
                <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Hash size={15} className="text-cyan-400 shrink-0" />
                    <span className="text-slate-300">File SHA-256 Cryptographic Digest:</span>
                  </div>
                  <span className="font-mono text-cyan-300 font-bold break-all">
                    {batchSha256}
                  </span>
                </div>
              )}

              {/* Upload / digest state */}
              {isBatchUploading && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
                  <RefreshCw size={14} className="animate-spin shrink-0" />
                  <span>Uploading {batchFile?.name} to the platform…</span>
                </div>
              )}

              {batchHashError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-800">
                    <div className="font-bold mb-0.5">The file was not stored</div>
                    <p className="leading-relaxed">{batchHashError}</p>
                  </div>
                </div>
              )}

              {/* SHA-256 checksum computed by the server over the stored bytes */}
              {batchSha256 && (
                <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Hash size={15} className="text-cyan-400 shrink-0" />
                    <span className="text-slate-300">
                      SHA-256 of the stored file, computed by the server:
                    </span>
                  </div>
                  <span className="font-mono text-cyan-300 font-bold break-all">
                    {batchSha256}
                  </span>
                </div>
              )}

              {/*
                What this panel used to show: a table of six parsed stations
                ("ST-01 / COL-C24 / 400 mm / 94.2 µs"), an "All 6 Records
                Validated" badge, and a button reading "Batch Ingest All 6
                Stations" that waited 800 ms, then claimed the stations had been
                ingested under a seal. Nothing was parsed and nothing was
                ingested — the file never left the browser.

                The platform stores the upload and attests its bytes. It does not
                yet have an agreed column contract for a PUNDIT session export,
                so no row can honestly be presented as parsed. The panel says
                that instead of inventing six.
              */}
              {batchFile && !isBatchUploading && !batchHashError && uploadedFileRef && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="font-bold text-slate-800">
                    File stored as a sensor file record
                  </div>
                  <p className="leading-relaxed">
                    The platform has stored {batchFile.name} against your account
                    and computed the digest above from the bytes it holds. It has
                    not interpreted the file&apos;s contents. A PUNDIT session
                    export needs a column contract agreed before its rows can be
                    turned into test records, and until that exists nothing here
                    will guess at one.
                  </p>
                  <p className="leading-relaxed">
                    To record these measurements now, enter them under Manual
                    Station Entry.
                  </p>
                </div>
              )}

              {batchFile && (
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClearBatch}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    Clear File
                  </button>
                </div>
              )}
            </div>
          )}

          {/*
            This registry used to render `testHistory`, a constant array of six
            invented tests — "UPV-2026-0418 / COL-C24 / Level 3 Core Column",
            each with a velocity and a strength — under the fixed heading
            "Project: Lekki Pearl Residences". It listed them whether or not the
            inspector had ever taken a reading, and `getPunditTests()` was
            imported by this file and never called. It now lists what the
            platform holds. A velocity of 0 is the server's PENDING state before
            its BS 1881-203 analysis has run, so it is shown as unanalysed rather
            than defaulted to a passing value.

            The register folds into Project → Floor → Station, the same folder
            structure the Government PUNDIT registry uses, one level deeper
            because this register is cross-project: an inspector's scope spans
            several projects, so `Floor:200THK RC SLAB` recurs and must not
            merge. A record naming no project groups under "Project not
            recorded" rather than into a neighbour's folder. Flat list restores
            the previous grid.
          */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#022C4F] uppercase tracking-wider">
                  Recorded UPV Tests{punditTests ? ` (${punditTests.length})` : ""}
                </h3>
                <p className="text-xs text-slate-500">
                  Tests the platform holds against the projects in your scope. Select one to read its recorded values.
                </p>
              </div>
              {punditTests && punditTests.length > 0 && (
                <FolderViewToggle
                  viewMode={testFolders.viewMode}
                  onChange={testFolders.setViewMode}
                />
              )}
            </div>

            {punditTests === null ? (
              recordsError ? (
                <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-900 mb-1">
                    Recorded tests could not be read
                  </h4>
                  <p className="text-xs text-amber-800">{recordsError}</p>
                  <p className="text-xs text-amber-700 mt-1.5">
                    No test is listed because none could be read. This is not a
                    statement that you have recorded none.
                  </p>
                </div>
              ) : (
                <div className="py-10 flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
                </div>
              )
            ) : punditTests.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/60 border border-slate-200/70 rounded-xl p-6">
                <Radio size={28} className="text-slate-400 mx-auto mb-2.5" />
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  No UPV Tests Recorded
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No ultrasonic test has been recorded against the projects in
                  your scope. Measurements are recorded from the Manual Station
                  Entry or Live Streaming panels above.
                </p>
              </div>
            ) : testFolders.viewMode === "flat" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {punditTests.map((t) => renderTestCard(t))}
              </div>
            ) : (
              <div className="border border-slate-200/70 rounded-xl overflow-hidden">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                      {rows.map((t) => renderTestCard(t))}
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMODULE 2: GPR RADARGRAM RADAR */}
      {activeSubmodule === "gpr" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#022C4F]">GPR Radargram Analysis</h2>
              <p className="text-xs text-slate-500">
                {activeGprScan
                  ? `Survey ${orDash(activeGprScan.survey_reference, "with no reference recorded")}` +
                    ` • ${orDash(activeGprScan.project_name, "project not recorded")}` +
                    ` • ${orDash(activeGprScan.structural_element, "element not recorded")}`
                  : "No survey selected."}
              </p>
            </div>
            {activeGprScan && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {orDash(activeGprScan.status_display, "Status not recorded")}
                </span>
                <span className="text-[11px] font-semibold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  {activeGprScan.anomaly_count}{" "}
                  {activeGprScan.anomaly_count === 1 ? "anomaly" : "anomalies"}
                </span>
              </div>
            )}
          </div>

          {/*
            The radargram used to be drawn from `sampleGprScan`: a constant
            "GPR-2026-88A1" survey on "Basement Grid A1-D4" with an "0.8m" depth
            range badge, and an escalation handler wired to a fixed
            ("FND-PILE-CAP-04", 2400 m/s, 18 MPa) defect. Every one of those
            numbers was a literal, so the panel rendered a complete radar
            interpretation over a project that had never been surveyed. It now
            shows a survey the platform holds, or says there is none.
          */}
          {activeGprScan ? (
            <>
              <div className="min-h-[380px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                <RadargramViewer
                  scan={activeGprScan}
                  onEscalateNCR={() =>
                    handleOpenEscalation(
                      activeGprScan.structural_element ||
                        activeGprScan.survey_reference ||
                        "Unnamed GPR survey",
                      null,
                      null,
                      orDash(activeGprScan.status_display, "Not recorded")
                    )
                  }
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Depth range, permittivity and gain are operator controls on the
                viewer, not properties of the stored survey. A GPR radargram
                carries no pulse velocity, so raising a defect finding from this
                screen records the survey it came from and no velocity.
              </p>
            </>
          ) : (
            <div className="text-center py-16 bg-slate-50/60 border border-slate-200/70 rounded-xl p-8">
              <Radio size={28} className="text-slate-400 mx-auto mb-2.5" />
              <h4 className="text-xs font-bold text-slate-800 mb-1">
                No GPR Survey Selected
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a survey from the Recorded GPR Surveys list below. A
                radargram is drawn from the stored survey record, so there is
                nothing to display until one is chosen.
              </p>
            </div>
          )}

          {/* Recorded GPR surveys held by the platform */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
              Recorded GPR Surveys{gprScans ? ` (${gprScans.length})` : ""}
            </h3>

            {gprScans === null ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <h4 className="text-xs font-bold text-amber-900 mb-1">
                  GPR surveys could not be read
                </h4>
                <p className="text-xs text-amber-800">
                  {recordsError || "The survey register could not be reached."}
                </p>
                <p className="text-xs text-amber-700 mt-1.5">
                  No survey is listed because none could be read. This is not a
                  statement that none has been recorded.
                </p>
              </div>
            ) : gprScans.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/60 border border-slate-200/70 rounded-xl p-6">
                <Radio size={24} className="text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  No GPR Surveys Recorded
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No ground-penetrating radar survey has been recorded against
                  the projects in your scope.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {gprScans.map((s) => {
                  const isSelected = activeGprScan?.id === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setActiveGprScan(s)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#022C4F] bg-blue-50/40 ring-2 ring-[#022C4F]/10 shadow-sm"
                          : "border-slate-200/70 bg-white hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          {orDash(s.survey_reference, "No reference")}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 shrink-0">
                          {orDash(s.status_display, "Status not recorded")}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mb-1">
                        {orDash(s.title, "Survey title not recorded")}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mb-2">
                        {orDash(s.structural_element, "Element not recorded")} &bull;{" "}
                        {orDash(s.survey_area, "area not recorded")}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>{dateOr(s.created_at, "Date not recorded")}</span>
                        <span className="font-mono">
                          {s.anomaly_count}{" "}
                          {s.anomaly_count === 1 ? "anomaly" : "anomalies"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMODULE 3: 3D BIM IFC GEOMETRY */}
      {activeSubmodule === "bim" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#022C4F]">Trimble Connect 3D BIM Viewer</h2>
              {/*
                The subtitle used to promise "Federated architectural &amp;
                structural IFC model with NDT inspection station markers". The
                viewer draws tessellated IFC geometry for one project and
                nothing else — it places no test stations on the model. The
                station positions the platform actually holds are the recorded
                survey points, and those are drawn on the Spatial Evidence Map
                tab. Saying so is cheaper than an inspector hunting a marker
                layer that was never rendered.
              */}
              <p className="text-xs text-slate-500">
                The IFC model imported against one project, drawn from its stored
                geometry. Recorded test and survey positions are plotted on the
                Spatial Evidence Map tab.
              </p>
            </div>
            {bimProjectId && bimElements !== null && !bimError && (
              <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {bimElements.length === 0
                  ? "No elements imported"
                  : `${bimElements.length} structural element${bimElements.length === 1 ? "" : "s"}`}
              </span>
            )}
          </div>

          {/* Which model to open. Nothing is requested until this is set. */}
          <div className="max-w-md">
            <label className="block text-slate-600 font-bold mb-1 text-xs">Project</label>
            <select
              value={bimProjectId}
              onChange={(e) => setBimProjectId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 text-xs"
            >
              <option value="">
                {projectsError
                  ? "Project list unavailable"
                  : projects.length === 0
                  ? "No projects in your scope"
                  : "Select the project…"}
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || "Unnamed project"}
                  {p.reference ? ` (${p.reference})` : ""}
                </option>
              ))}
            </select>
            {projectsError && (
              <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                {projectsError} A model cannot be opened without a project.
              </p>
            )}
          </div>

          {!bimProjectId ? (
            <div className="min-h-[420px] flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center px-6">
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Select a project above to open its imported IFC model. No project
                is opened by default — a model belongs to a site, and guessing
                one would show you someone else&apos;s building.
              </p>
            </div>
          ) : bimError ? (
            <div className="min-h-[420px] flex items-center justify-center rounded-xl border border-amber-300 bg-amber-50 text-center px-6">
              <p className="text-xs text-amber-900 max-w-sm leading-relaxed">
                {bimError} The imported element register for this project could
                not be read, so no model is shown.
              </p>
            </div>
          ) : bimElements === null ? (
            <div className="min-h-[420px] flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400 font-mono">
              Reading the imported element register…
            </div>
          ) : (
            <div className="min-h-[420px] bg-slate-950 rounded-xl border border-slate-800 p-2">
              {/*
                `TrimbleBIMViewer` fetches the project's tessellated geometry
                itself and reports "no model" when the project has none
                imported; `elements` is the structural register it labels that
                geometry with. It is given the project the inspector chose, not
                the literal `prj-1` that used to sit here — an id belonging to
                no project on the platform, under which the panel reported "no
                model" whether or not the inspector's own site had one.
              */}
              <TrimbleBIMViewer projectId={bimProjectId} elements={bimElements} />
            </div>
          )}
        </div>
      )}

      {/* SUBMODULE 4: SPATIAL EVIDENCE MAP */}
      {activeSubmodule === "spatial" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#022C4F]">Spatial Evidence Map</h2>
              <p className="text-xs text-slate-500">
                {spatialPoints === null
                  ? "The spatial evidence register could not be read."
                  : spatialPoints.length === 0
                    ? "No spatial evidence point is recorded against the projects in your scope."
                    : `${spatialPoints.length} recorded point${spatialPoints.length === 1 ? "" : "s"} in your scope` +
                      (spatialBestAccuracyMm === null
                        ? " • no positional precision recorded"
                        : ` • best recorded precision ±${spatialBestAccuracyMm} mm`)}
              </p>
            </div>
            {spatialPoints !== null && spatialPoints.length > 0 && (
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0">
                {new Set(spatialPoints.map((p) => p.layer_type || "unclassified")).size}{" "}
                layer{new Set(spatialPoints.map((p) => p.layer_type || "unclassified")).size === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {spatialPoints === null ? (
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
              <h4 className="text-xs font-bold text-amber-900 mb-1">
                The spatial register could not be read
              </h4>
              <p className="text-xs text-amber-800">
                {spatialError || "The spatial evidence register could not be reached."}
              </p>
              <p className="text-xs text-amber-700 mt-1.5">
                Nothing is plotted because nothing could be read. This is not an
                empty register, and it is not a site with no survey.
              </p>
            </div>
          ) : (
            <div className="min-h-[420px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden p-2">
              <EvidenceMapCanvas points={spatialPoints} />
            </div>
          )}
        </div>
      )}

      {/* SUBMODULE 5: AUDIT & SHA-256 VAULT */}
      {activeSubmodule === "sessions" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          {/*
            This panel was titled "TS-1 Cryptographic Audit Vault", carried a
            "100% Tamper-Proof Audit" badge, and gave every row a "SHA-256 Seal
            Hash" built by string-concatenating a real SHA-256 constant with the
            row index, next to a green "Verified" pill. A PUNDIT test record
            carries no digest, so there was nothing to verify and nothing that
            had been verified — the panel certified its own invention on the
            screen whose whole purpose is to be trustworthy. It now reports the
            digest that does exist: the one the server computes over an uploaded
            sensor file, and for tests, the files the platform holds against
            them.
          */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#022C4F]">
                Recorded NDT Register
              </h2>
              <p className="text-xs text-slate-500">
                The ultrasonic tests and radar surveys the platform holds for the
                projects in your scope.
              </p>
            </div>
            {punditTests && gprScans && (
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                {punditTests.length} UPV &bull; {gprScans.length} GPR
              </span>
            )}
          </div>

          {punditTests === null ? (
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
              <h4 className="text-xs font-bold text-amber-900 mb-1">
                The NDT register could not be read
              </h4>
              <p className="text-xs text-amber-800">
                {recordsError || "The test register could not be reached."}
              </p>
              <p className="text-xs text-amber-700 mt-1.5">
                Nothing is listed because nothing could be read. This is not an
                empty register.
              </p>
            </div>
          ) : punditTests.length === 0 ? (
            <div className="text-center py-14 bg-slate-50/60 border border-slate-200/70 rounded-xl p-6">
              <ShieldCheck size={28} className="text-slate-400 mx-auto mb-2.5" />
              <h4 className="text-xs font-bold text-slate-800 mb-1">
                No NDT Records Held
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No ultrasonic test has been recorded against the projects in your
                scope yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                    <th className="p-3">Reference</th>
                    <th className="p-3">Element</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Velocity (m/s)</th>
                    <th className="p-3">Strength (MPa)</th>
                    <th className="p-3">Attached Files</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {punditTests.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-[#022C4F]">
                        {orDash(t.test_reference, "No reference")}
                      </td>
                      <td className="p-3 font-sans text-slate-700">
                        {orDash(t.structural_element_name, "Not recorded")}
                      </td>
                      <td className="p-3 font-sans text-slate-600">
                        {orDash(t.project_name, "Not recorded")}
                      </td>
                      <td className="p-3 text-slate-500">
                        {dateOr(t.test_date, "Not recorded")}
                      </td>
                      <td className="p-3 font-bold">
                        {t.pulse_velocity_ms > 0
                          ? `${t.pulse_velocity_ms} m/s`
                          : "Not yet analysed"}
                      </td>
                      <td className="p-3 text-slate-600">
                        {t.estimated_compressive_strength_mpa !== null
                          ? `${t.estimated_compressive_strength_mpa} MPa`
                          : "Not reported"}
                      </td>
                      <td className="p-3 text-slate-500">
                        {t.file_count === 0
                          ? "None attached"
                          : `${t.file_count} file${t.file_count === 1 ? "" : "s"}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[11px] text-slate-500 leading-relaxed">
            A digest is computed by the server over the bytes of a file it
            stores — the Session File Upload panel shows the one returned for a
            file you upload. The platform does not hold a per-test seal, so this
            register reports the recorded values and the files attached to them,
            and claims nothing further about their integrity.
          </p>
        </div>
      )}

      {/*
        This banner used to read "Pulse Velocity Confidence: 94%", "54 kHz
        Direct Mode", "4,190 m/s (±32 m/s)" and "Column COL-C24 concrete density
        satisfies BS 1881-203 structural standards for Class C35/45 mix" — a
        passing verdict on a named column, with a confidence figure and a
        tolerance, none of which came from any measurement. A false pass on a
        concrete compliance screen is the single most dangerous thing this page
        could say, so the panel now reports only what the selected test holds,
        and says plainly when there is nothing to report.
      */}
      {activePunditTest && (
        <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#022C4F]" />
              <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                Recorded Diagnostic — {orDash(activePunditTest.test_reference, "no reference")}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
              {orDash(activePunditTest.concrete_quality_rating, "Not yet rated by the platform")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm">
              <span className="text-slate-500 text-[11px] block font-medium">Transducer</span>
              <span className="text-slate-800 font-bold">
                {activePunditTest.transducer_frequency_khz
                  ? `${activePunditTest.transducer_frequency_khz} kHz`
                  : "Frequency not recorded"}
                {activePunditTest.transducer_type
                  ? ` • ${humaniseTransducer(activePunditTest.transducer_type)}`
                  : ""}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm">
              <span className="text-slate-500 text-[11px] block font-medium">Pulse Velocity</span>
              <span className="text-slate-800 font-bold">
                {liveVelocityMs !== null
                  ? `${formatVelocityMs(liveVelocityMs)} m/s`
                  : "Not yet analysed"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm">
              <span className="text-slate-500 text-[11px] block font-medium">
                Platform Confidence Interval
              </span>
              <span className="text-slate-800 font-bold">
                {activePunditTest.ai_ci_lower_mpa !== null &&
                activePunditTest.ai_ci_upper_mpa !== undefined &&
                activePunditTest.ai_ci_lower_mpa !== undefined
                  ? `${activePunditTest.ai_ci_lower_mpa}–${activePunditTest.ai_ci_upper_mpa} MPa`
                  : "Not reported"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm">
              <span className="text-slate-500 text-[11px] block font-medium">Strength</span>
              <span className="text-slate-800 font-bold">
                {activePunditTest.estimated_compressive_strength_mpa !== null
                  ? `${activePunditTest.estimated_compressive_strength_mpa} MPa`
                  : "Not reported by the platform"}
              </span>
            </div>
          </div>

          {activePunditTest.ai_reasoning_traces &&
          activePunditTest.ai_reasoning_traces.length > 0 ? (
            <ul className="text-xs text-slate-700 leading-relaxed space-y-1 list-disc pl-4">
              {activePunditTest.ai_reasoning_traces.map((trace, idx) => (
                <li key={idx}>{trace}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The platform has recorded no diagnostic reasoning for this test. It
              is not restated here as a compliance verdict.
            </p>
          )}
        </div>
      )}

      {/* HARDWARE PAIRING & TELEMETRY MODAL */}
      {isPairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0F181F]/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsPairModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bluetooth size={18} className="text-blue-600" />
                <h3 className="text-base font-bold text-[#022C4F]">
                  TS-1 Hardware Fleet Manager
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPairModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/*
              The Connect / Disconnect button here used to flip a string on a
              hand-written array — `setDevices(...)` over four constants — so it
              reported "Toggled connection for Screening Eagle Pundit Live"
              against a device that was never contacted. There is no BLE or
              Wi-Fi bridge in this application, so no control on this screen can
              open a link to a field device. The list reports the devices the
              platform has registered and their recorded state.
            */}
            <p className="text-xs text-slate-500 leading-relaxed">
              These are the field devices the platform has registered against
              your scope, with the state each was last reported in. This
              application holds no Bluetooth or direct Wi-Fi link to field
              hardware, so a device cannot be paired or its state changed from
              this screen.
            </p>

            <div className="space-y-3">
              {devicesError ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-900 mb-1">
                    The device registry could not be read
                  </h4>
                  <p className="text-xs text-amber-800">{devicesError}</p>
                </div>
              ) : deviceCards.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Cpu size={24} className="text-slate-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-800 mb-1">
                    No Field Devices Registered
                  </h4>
                  <p className="text-xs text-slate-500">
                    No device has been registered against the projects in your
                    scope.
                  </p>
                </div>
              ) : (
                deviceCards.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <strong className="text-slate-900">{dev.name}</strong>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full border ${dev.badge}`}>
                          {dev.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                        <span>{dev.interface}</span>
                        <span>&bull;</span>
                        <span>
                          {dev.battery === null
                            ? "Battery not reported"
                            : `Battery: ${dev.battery}%`}
                        </span>
                        <span>&bull;</span>
                        <span>
                          {dev.calibrationDate
                            ? `Calibrated ${dateOr(dev.calibrationDate)}`
                            : "No calibration recorded"}
                        </span>
                        {dev.serial && (
                          <>
                            <span>&bull;</span>
                            <span className="font-mono">{dev.serial}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={loadRecords}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Reload Registry</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPairModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#022C4F] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STOP WORK ORDER / DEFECT ESCALATION MODAL */}
      {swoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0F181F]/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSwoModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl border border-rose-200 shadow-2xl p-6 w-full max-w-lg space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold">
                  Raise Concrete Defect Finding
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSwoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/*
              The three values below used to be printed with fixed annotations —
              "(DOUBTFUL)" after the velocity whatever it was, "(< 25 MPa
              required)" after the strength, and "BS 1881-203 & LASBCA Code"
              under "Standard Violated". The last of those asserts a specific
              clause was breached, and nothing on this screen knows which clause
              applies: the acceptance band depends on the element, the mix and
              the standard the project is being built to. Each row now shows the
              recorded value or says it was not measured, and the standard is
              left for the inspector to state.
            */}
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-rose-700 font-semibold shrink-0">Element:</span>
                <strong className="text-slate-900 text-right">
                  {swoData.element || "Not recorded"}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-rose-700 font-semibold shrink-0">Recorded Pulse Velocity:</span>
                <strong className="text-rose-800 font-mono text-right">
                  {swoData.velocityMs !== null
                    ? `${formatVelocityMs(swoData.velocityMs)} m/s`
                    : "Not measured"}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-rose-700 font-semibold shrink-0">Est. Compressive Strength:</span>
                <strong className="text-rose-800 font-mono text-right">
                  {swoData.strengthMpa !== null
                    ? `${swoData.strengthMpa} MPa`
                    : "Not reported by the platform"}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-rose-700 font-semibold shrink-0">Recorded Rating:</span>
                <span className="font-semibold text-slate-800 text-right">
                  {swoData.rating || "Not rated"}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-700 font-bold">
                Inspector Regulatory Decision
              </label>
              <textarea
                rows={4}
                value={swoRecommendation}
                onChange={(e) => setSwoRecommendation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed"
              />
            </div>

            {swoError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <div className="font-bold mb-0.5">The finding was not recorded</div>
                <p className="leading-relaxed">{swoError}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSwoModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitSwo}
                disabled={isSubmittingSwo}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmittingSwo && <RefreshCw size={13} className="animate-spin" />}
                <span>{isSubmittingSwo ? "Recording…" : "Record Defect Finding"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * `useSearchParams()` suspends during a static render, so the workspace above
 * is wrapped the same way the inspector login page wraps its own — the default
 * export is the boundary, and the fallback names what is being loaded rather
 * than showing a blank frame.
 */
export default function InspectorDigitalEyePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[420px] flex items-center justify-center text-xs text-slate-400 font-mono">
          Opening the TS-1 workspace…
        </div>
      }
    >
      <InspectorDigitalEyeWorkspace />
    </Suspense>
  );
}
