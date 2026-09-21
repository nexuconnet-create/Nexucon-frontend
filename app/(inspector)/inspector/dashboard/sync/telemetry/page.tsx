"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Radar,
  Radio,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Info,
  RefreshCw,
  Play,
  Square,
  Link2,
  Link2Off,
  MapPin,
  Upload,
  Wrench,
} from "lucide-react";
import {
  appendTelemetryPacket,
  endTelemetrySession,
  getTelemetryDevices,
  getTelemetrySessionStatus,
  getTelemetrySessions,
  importTelemetryExport,
  startTelemetrySession,
  type TelemetryDevice,
  type TelemetryPromotion,
  type TelemetrySession,
  type TelemetrySessionStatus,
} from "@/services/telemetry";
import { getInspectorProjects } from "@/services/inspector";
import {
  suggestColumnMapping,
  updateFieldDevice,
  type AcceptedColumn,
} from "@/services/digitalEye";
import ColumnMappingEditor, {
  mappingSummary,
  rowsFromSuggestion,
  rowsToMapping,
  type MappingRow,
} from "@/components/inspector/ColumnMappingEditor";
import { dateTimeOr, orDash } from "@/lib/display";

/**
 * The four capture types a session can carry.
 *
 * Labels come from the server's own display values at read time; this list
 * exists only to populate the start form, and names the same four values the
 * server accepts. A mismatch is a 400 naming the choices, not a silent
 * default.
 */
const DATA_TYPES = [
  { value: "gpr", label: "Ground Penetrating Radar" },
  { value: "pundit", label: "PUNDIT Ultrasonic NDT" },
  { value: "gnss", label: "GNSS / RTK Survey" },
  { value: "scan", label: "3D Scan / SLAM" },
] as const;

const CAPTURE_STATUS: Record<string, string> = {
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ENDED: "bg-slate-100 text-slate-700 border-slate-200",
  ABORTED: "bg-rose-50 text-rose-700 border-rose-200",
};

const SYNC_STATUS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  SYNCED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

/**
 * The test types a PUNDIT reading can come from.
 *
 * A file usually carries a TEST TYPE column; these exist for the bare
 * measurement exports that do not. The values are the ones the platform's
 * column contract already accepts, so the app and a file column are validated
 * by the same rule rather than by two.
 */
const PUNDIT_TEST_TYPES = [
  { value: "", label: "The file supplies it" },
  { value: "pulse velocity", label: "Pulse velocity" },
  { value: "crack depth", label: "Crack depth" },
  { value: "surface quality", label: "Surface quality" },
] as const;

/**
 * How a capture reached the platform, in the words the code stands for.
 *
 * Keyed off the code the server recorded, never off the device's `status`: a
 * device being active says nothing about how its readings travelled. An empty
 * code renders as "Transport not recorded", because a session captured before
 * the platform asked the question has no transport, and naming one would be a
 * claim about provenance that nobody made.
 */
const TRANSPORT_LABEL: Record<string, string> = {
  BLE: "Bluetooth",
  WIFI: "Wi-Fi",
  CLOUD: "Cloud",
  FILE: "Export file",
  MANUAL: "Manual entry",
};

const TRANSPORT_STYLE: Record<string, string> = {
  BLE: "bg-indigo-50 text-indigo-700 border-indigo-200",
  WIFI: "bg-sky-50 text-sky-700 border-sky-200",
  CLOUD: "bg-violet-50 text-violet-700 border-violet-200",
  FILE: "bg-teal-50 text-teal-700 border-teal-200",
  MANUAL: "bg-slate-100 text-slate-700 border-slate-200",
};

function TransportBadge({
  transport,
  display,
}: {
  transport: string;
  display: string | null;
}) {
  if (!transport) {
    return (
      <span className="px-2 py-0.5 rounded-md border border-dashed bg-white text-slate-500 border-slate-300 text-[10px] font-semibold">
        Transport not recorded
      </span>
    );
  }
  return (
    <span
      className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${
        TRANSPORT_STYLE[transport] ||
        "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {/* The server's own wording for a code this build does not know, so a
          transport added server-side still reads as something true rather
          than as a raw constant. */}
      {TRANSPORT_LABEL[transport] ?? display ?? transport}
    </span>
  );
}

function errorOf(err: any, fallback: string): string {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

/** A battery reading, or an honest absence — never a drawn-full icon. */
function Battery({ level }: { level: number | null }) {
  if (level === null || !Number.isFinite(level)) {
    return (
      <span className="text-[11px] text-slate-500">Battery not reported</span>
    );
  }
  const Icon = level <= 20 ? BatteryLow : level <= 60 ? BatteryMedium : BatteryFull;
  return (
    <span className="text-[11px] text-slate-600 flex items-center gap-1">
      <Icon size={13} className={level <= 20 ? "text-rose-600" : "text-slate-500"} />
      {level}%
    </span>
  );
}

export default function InspectorTelemetryPage() {
  const [devices, setDevices] = useState<TelemetryDevice[]>([]);
  const [sessions, setSessions] = useState<TelemetrySession[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<TelemetrySessionStatus | null>(null);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);

  const [packetJson, setPacketJson] = useState("");
  const [promotion, setPromotion] = useState<TelemetryPromotion | null>(null);

  const [startDevice, setStartDevice] = useState("");
  const [startDataType, setStartDataType] = useState("pundit");
  const [startProject, setStartProject] = useState("");
  const [startConfig, setStartConfig] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const [importDevice, setImportDevice] = useState("");
  const [importProject, setImportProject] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importTestType, setImportTestType] = useState("");
  const [importElement, setImportElement] = useState("");
  const [importFloor, setImportFloor] = useState("");
  const [importLocation, setImportLocation] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  // The file input is uncontrolled by nature — a chosen file cannot be cleared
  // by setting state — so it is remounted after a successful import.
  const [fileInputKey, setFileInputKey] = useState(0);

  /*
    The mapping offer, shown only when an import is refused for a column the
    platform does not recognise. The file that was refused is still held, so
    the proposal is read from the very bytes that failed rather than from a
    second upload the inspector has to go and find.
  */
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([]);
  const [mappingAccepted, setMappingAccepted] = useState<AcceptedColumn[]>([]);
  const [mappingDeviceLabel, setMappingDeviceLabel] = useState("");
  const [mappingOffered, setMappingOffered] = useState(false);
  const [isReadingMapping, setIsReadingMapping] = useState(false);
  const [isSavingMapping, setIsSavingMapping] = useState(false);
  const [mappingError, setMappingError] = useState<string | null>(null);

  const readAll = useCallback(async () => {
    const [deviceRows, sessionRows] = await Promise.all([
      getTelemetryDevices(),
      getTelemetrySessions(),
    ]);
    setDevices(deviceRows);
    setSessions(sessionRows);
    return sessionRows;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    Promise.all([getTelemetryDevices(), getTelemetrySessions(), getInspectorProjects()])
      .then(([deviceRows, sessionRows, projectRows]) => {
        if (cancelled) return;
        setDevices(deviceRows);
        setSessions(sessionRows);
        setProjects(projectRows);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          errorOf(err, "The telemetry service could not be read from the server.")
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const readSelected = useCallback(async (sessionId: string) => {
    setIsLoadingSelected(true);
    try {
      setSelected(await getTelemetrySessionStatus(sessionId));
    } catch {
      // The row is still on screen with its own recorded values. Clearing it
      // would read as "this session vanished"; the failure is contained to
      // the chain-validity line, which needs the status endpoint.
      setSelected(null);
    } finally {
      setIsLoadingSelected(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }
    void readSelected(selectedId);
  }, [selectedId, readSelected]);

  const openSessions = useMemo(
    () => sessions.filter((s) => s.status === "OPEN"),
    [sessions]
  );

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDevice) return;
    setIsStarting(true);
    setActionError(null);
    setNotice(null);
    setPromotion(null);

    let config: Record<string, unknown> = {};
    if (startConfig.trim()) {
      try {
        const parsed = JSON.parse(startConfig);
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("not an object");
        }
        config = parsed;
      } catch {
        setActionError(
          "Session inputs must be a JSON object, or left empty. Nothing was written."
        );
        setIsStarting(false);
        return;
      }
    }

    try {
      const session = await startTelemetrySession({
        device: startDevice,
        dataType: startDataType,
        project: startProject || null,
        sessionConfig: config,
      });
      setNotice(
        `Session ${session.session_reference} is open. It is holding no measurement yet — packets recorded against it are promoted when you end it.`
      );
      setSelectedId(session.id);
      await readAll();
    } catch (err) {
      setActionError(errorOf(err, "The session could not be started."));
    } finally {
      setIsStarting(false);
    }
  };

  /**
   * Import an instrument export as a finished session.
   *
   * The leg the current PUNDIT unit uses: no radio, so the capture leaves the
   * instrument as a file. The server parses it against the documented column
   * contract and returns an ENDED/PENDING session holding one packet per
   * reading — closed, because the instrument finished long before the file
   * arrived, and un-promoted, because nothing reaches the registry until a
   * human has looked at what was parsed.
   */
  const runImport = async () => {
    if (!importDevice || !importFile) return;
    setIsImporting(true);
    setActionError(null);
    setNotice(null);
    setPromotion(null);

    try {
      const session = await importTelemetryExport({
        device: importDevice,
        project: importProject || null,
        file: importFile,
        dataType: "pundit",
        testType: importTestType,
        structuralElement: importElement,
        floor: importFloor,
        testLocation: importLocation,
      });
      const stats = session.import_stats;
      // A resend is answered with the session the first import made, and its
      // figures describe *that* parse — not this upload, from which nothing
      // was read. Reporting "read as N readings" here would claim this file
      // was parsed when the platform never looked at it.
      setNotice(
        stats.duplicate
          ? `These exact bytes are already on the platform as session ${
              session.session_reference
            }, holding ${session.packet_count} packet${
              session.packet_count === 1 ? "" : "s"
            }. Nothing was imported a second time.`
          : `${session.source_file_name} was read as ${stats.readings} reading${
              stats.readings === 1 ? "" : "s"
            } from ${stats.rows} row${stats.rows === 1 ? "" : "s"}${
              stats.skipped ? `, skipping ${stats.skipped} blank` : ""
            }. Session ${session.session_reference} is closed and holds ${
              session.packet_count
            } packet${
              session.packet_count === 1 ? "" : "s"
            }. Nothing is in the registry yet — review it below, then promote it.`
      );
      setSelectedId(session.id);
      setImportFile(null);
      setFileInputKey((key) => key + 1);
      // Whatever was proposed for an earlier, refused file is answered now:
      // the import went through, so there is nothing left to offer.
      setMappingRows([]);
      setMappingAccepted([]);
      setMappingDeviceLabel("");
      setMappingOffered(false);
      setMappingError(null);
      await readAll();
    } catch (err: any) {
      setActionError(errorOf(err, "The export file was not imported."));

      // One refusal is fixable from this screen and the rest are not. A file
      // refused for an unrecognised column is answered by telling the platform
      // what this instrument calls its columns — and the file is still in
      // hand, so the platform can read its header row and propose exactly
      // that. A refusal for any other reason is not answered by a mapping, so
      // the offer is not made.
      if (err?.response?.data?.code === "unknown_columns" && importFile) {
        await proposeMapping(importFile);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    await runImport();
  };

  /**
   * Read the refused file's own header row and propose a mapping from it.
   *
   * Nothing is recorded here. The instrument's column names are read facts —
   * they come off the file — while the platform columns beside them are
   * proposals, and the inspector is the one who accepts them. That order is
   * not ceremony: a column mapping is indistinguishable from a correct one
   * once rows have been written from it, so the reading and the recording
   * cannot be the same request.
   */
  const proposeMapping = async (file: File) => {
    setMappingOffered(true);
    setIsReadingMapping(true);
    setMappingError(null);
    try {
      const result = await suggestColumnMapping(importDevice, file);
      setMappingRows(rowsFromSuggestion(result));
      setMappingAccepted(result.accepted);
      setMappingDeviceLabel(result.device_reference);
    } catch (err) {
      setMappingError(errorOf(err, "That file could not be read."));
    } finally {
      setIsReadingMapping(false);
    }
  };

  /** Record the accepted mapping, then import the file again with it in place. */
  const handleRecordMapping = async () => {
    if (!importDevice || mappingRows.length === 0) return;
    setIsSavingMapping(true);
    setMappingError(null);
    try {
      await updateFieldDevice(importDevice, {
        column_mapping: rowsToMapping(mappingRows),
      });
      setMappingRows([]);
      setMappingAccepted([]);
      setMappingDeviceLabel("");
      setMappingOffered(false);
      // The same file, against an instrument that now knows what its columns
      // mean. This is the whole reason the mapping was recorded.
      await runImport();
    } catch (err) {
      setMappingError(
        errorOf(err, "The mapping could not be recorded on this instrument.")
      );
    } finally {
      setIsSavingMapping(false);
    }
  };

  const handleAppend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    let payload: Record<string, unknown>;
    try {
      const parsed = JSON.parse(packetJson);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("not an object");
      }
      payload = parsed;
    } catch {
      setActionError(
        "A packet is one JSON object, exactly as the instrument reported it. Nothing was appended."
      );
      return;
    }

    setBusyId(selectedId);
    setActionError(null);
    setNotice(null);
    try {
      const ack = await appendTelemetryPacket(selectedId, { payload });
      setPacketJson("");
      setNotice(
        `Packet ${ack.sequence} recorded. The session now holds ${ack.packet_count}. Its chain hash is ${ack.chain_hash.slice(0, 16)}… — the next packet is chained to it.`
      );
      await readAll();
      await readSelected(selectedId);
    } catch (err) {
      setActionError(errorOf(err, "The packet was not accepted."));
    } finally {
      setBusyId(null);
    }
  };

  const handleEnd = async (sessionId: string) => {
    setBusyId(sessionId);
    setActionError(null);
    setNotice(null);
    try {
      const result = await endTelemetrySession(sessionId);
      setPromotion(result);
      setNotice(
        `Session ${result.session_reference} closed. ${result.packet_count} packet${
          result.packet_count === 1 ? "" : "s"
        } promoted into the registry, all of them or none.`
      );
      await readAll();
      if (selectedId === sessionId) await readSelected(sessionId);
    } catch (err) {
      // A refusal here means nothing was written. Said explicitly, because
      // "promotion failed" otherwise leaves the inspector unsure whether some
      // of their readings are now in a statutory registry.
      setActionError(
        `${errorOf(err, "The session could not be promoted.")} No measurement from this session was written to the registry.`
      );
      await readAll();
      if (selectedId === sessionId) await readSelected(sessionId);
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h2 className="text-sm font-bold text-amber-900 mb-1">
            Telemetry Status is unavailable
          </h2>
          <p className="text-xs text-amber-800">{loadError}</p>
          <p className="text-xs text-amber-700 mt-2">
            Device status and session history both come from the server. An
            empty device list is shown nowhere in their place, because "no
            device reported" and "the device list could not be read" are
            different facts and only one of them is worth acting on.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#022C4F]">Telemetry Status</h1>
          <p className="text-xs text-slate-500 mt-1">
            Instrument sessions, and what has reached the registry from them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/inspector/dashboard/sync/devices"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Cpu size={13} />
            <span>Instruments</span>
          </Link>
          <button
            type="button"
            onClick={() => void readAll()}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Re-read</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium">{actionError}</span>
        </div>
      )}

      {notice && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium">{notice}</span>
        </div>
      )}

      {promotion && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#022C4F]">
            {promotion.session_reference} — promotion
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Packets promoted", value: String(promotion.packet_count) },
              { label: "Capture", value: promotion.status },
              { label: "Registry", value: promotion.sync_status },
              {
                label: "Promoted at",
                value: dateTimeOr(promotion.promoted_at, "Not recorded"),
              },
            ].map((tile) => (
              <div
                key={tile.label}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70"
              >
                <div className="text-xs font-bold text-[#022C4F] break-words">
                  {tile.value}
                </div>
                <div className="text-[11px] text-slate-500">{tile.label}</div>
              </div>
            ))}
          </div>
          {promotion.promoted === null ? (
            <p className="text-[11px] text-amber-700">
              Nothing reached the statutory registry for this run. An absent
              promotion result is shown as absent, never as an empty one that
              would read as &ldquo;promoted, nothing found&rdquo;.
            </p>
          ) : (
            <div className="text-[11px] text-slate-600">
              The server reported what it wrote:
              <pre className="mt-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 overflow-x-auto font-mono text-[10px] text-slate-700">
                {JSON.stringify(promotion.promoted, null, 2)}
              </pre>
            </div>
          )}
          {promotion.sha256_hash && (
            <div className="text-[11px] text-slate-500 font-mono break-all">
              Envelope SHA-256 {promotion.sha256_hash}
            </div>
          )}
        </div>
      )}

      {/* Live device status */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#022C4F] flex items-center gap-1.5">
            <Radio size={14} />
            Devices
          </h2>
          <Link
            href="/inspector/dashboard/sync/devices"
            className="text-[11px] font-semibold text-[#022C4F] hover:underline"
          >
            Manage instruments →
          </Link>
        </div>

        {devices.length === 0 ? (
          <p className="text-xs text-slate-500 leading-relaxed">
            No instrument is assigned to your projects, and none has captured a
            session on one.{" "}
            <Link
              href="/inspector/dashboard/sync/devices"
              className="font-semibold text-[#022C4F] hover:underline"
            >
              Register an instrument
            </Link>{" "}
            to give a capture something to be attributed to.
          </p>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
                      <span>{device.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {device.device_id}
                      </span>
                      {device.open_session_reference ? (
                        <span className="px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                          <Link2 size={10} />
                          Streaming · {device.open_session_reference}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-semibold flex items-center gap-1">
                          <Link2Off size={10} />
                          Not streaming
                        </span>
                      )}
                      {!device.is_active && (
                        <span className="px-2 py-0.5 rounded-md border bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-semibold">
                          Retired
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {device.device_type_display} ·{" "}
                      {[device.manufacturer, device.model]
                        .filter(Boolean)
                        .join(" ") || "Make and model not recorded"}
                      {device.firmware_version
                        ? ` · firmware ${device.firmware_version}`
                        : " · firmware not recorded"}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg border bg-white text-slate-700 border-slate-200 text-[11px] font-semibold">
                    {device.status_display}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600">
                  <Battery level={device.battery_level} />
                  <span className="flex items-center gap-1">
                    <Wrench size={12} className="text-slate-400" />
                    Calibrated{" "}
                    {device.calibration_date
                      ? dateTimeOr(device.calibration_date, "date not recorded")
                      : "— no calibration date recorded"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    {device.latitude !== null && device.longitude !== null
                      ? `${device.latitude.toFixed(5)}, ${device.longitude.toFixed(5)}`
                      : "Position not reported"}
                  </span>
                  <span>
                    Last heard from{" "}
                    {device.last_seen
                      ? dateTimeOr(device.last_seen, "at an unrecorded time")
                      : "— never"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
          <Info size={12} className="shrink-0 mt-0.5" />
          <span>
            &ldquo;Not streaming&rdquo; means this device has no open session.
            It does not mean the platform could not find out — an instrument may
            sit idle for days. A device appears here when it is assigned to one
            of your projects or has captured a session on one.
          </span>
        </p>
      </div>

      {/* Sessions */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-[#022C4F] flex items-center gap-1.5">
          <Radar size={14} />
          Sessions
        </h2>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Two separate things are shown per session. The first is what the
          capture is doing; the second is what has reached the registry. A
          session can be closed and still hold nothing in the registry — it is
          promoted when you end it.
        </p>

        {sessions.length === 0 ? (
          <p className="text-xs text-slate-500">
            No telemetry session has been recorded on your projects.
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3.5 rounded-xl border space-y-2 ${
                  selectedId === session.id
                    ? "bg-slate-100/70 border-[#022C4F]/30"
                    : "bg-slate-50 border-slate-200/70"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedId(selectedId === session.id ? null : session.id)
                    }
                    className="min-w-0 text-left cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
                      <span className="font-mono">
                        {session.session_reference}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${
                          CAPTURE_STATUS[session.status] ||
                          "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {session.status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${
                          SYNC_STATUS[session.sync_status] ||
                          "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        Registry: {session.sync_status}
                      </span>
                      <TransportBadge
                        transport={session.transport}
                        display={session.transport_display}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {session.data_type_display} · {session.device_id} ·{" "}
                      {orDash(session.project_name, "project not recorded")} ·{" "}
                      {session.packet_count} packet
                      {session.packet_count === 1 ? "" : "s"}
                    </div>
                    {session.source_file_name && (
                      <div className="text-[11px] text-slate-500 break-all">
                        Imported from{" "}
                        <span className="font-mono">
                          {session.source_file_name}
                        </span>
                        {session.source_file_sha256
                          ? ` · SHA-256 ${session.source_file_sha256.slice(0, 16)}…`
                          : ""}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500">
                      Started{" "}
                      {session.session_start
                        ? dateTimeOr(session.session_start, "at an unrecorded time")
                        : session.transport === "FILE"
                          ? "— an imported file carries no start time"
                          : "— the instrument reported no start time"}
                      {" · "}
                      {/* For an imported file the recorded end is when the
                          import closed the session, not when the instrument
                          stopped capturing — those are different moments, and
                          the file path is the one where saying "ended" would
                          put the wrong one on screen. */}
                      {session.transport === "FILE" && session.session_end
                        ? `imported ${dateTimeOr(session.session_end, "at an unrecorded time")}`
                        : session.session_end
                          ? `ended ${dateTimeOr(session.session_end, "at an unrecorded time")}`
                          : "not ended"}
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    {session.status === "OPEN" && (
                      <button
                        type="button"
                        onClick={() => void handleEnd(session.id)}
                        disabled={busyId === session.id}
                        className="px-3 py-1.5 rounded-lg bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-[11px] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Square size={11} />
                        <span>End and promote</span>
                      </button>
                    )}
                    {/* A session that arrived as a file is already closed, so
                        the only step left is the one a human owns: reading
                        what was parsed and putting it in the registry. */}
                    {session.status === "ENDED" &&
                      session.sync_status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => void handleEnd(session.id)}
                          disabled={busyId === session.id}
                          className="px-3 py-1.5 rounded-lg bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-[11px] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={11} />
                          <span>
                            {busyId === session.id
                              ? "Promoting…"
                              : "Promote to registry"}
                          </span>
                        </button>
                      )}
                    {session.status === "ENDED" &&
                      session.sync_status === "FAILED" && (
                        <button
                          type="button"
                          onClick={() => void handleEnd(session.id)}
                          disabled={busyId === session.id}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-[11px] font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {busyId === session.id ? "Retrying…" : "Retry promotion"}
                        </button>
                      )}
                  </div>
                </div>

                {session.sync_status === "FAILED" && session.sync_error && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                    <span className="font-bold">Promotion refused: </span>
                    {session.sync_error}
                    <div className="mt-1 text-rose-700">
                      Nothing from this session is in the registry. Retrying is
                      the same operation as promoting it the first time — the
                      packets are still held, so nothing needs re-capturing.
                    </div>
                  </div>
                )}

                {selectedId === session.id && (
                  <div className="pt-2 border-t border-slate-200/70 space-y-3">
                    {isLoadingSelected ? (
                      <div className="py-3 flex items-center gap-2 text-[11px] text-slate-500">
                        <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Reading this session&apos;s chain…
                      </div>
                    ) : selected ? (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200/70">
                            <div className="text-[11px] font-bold text-[#022C4F]">
                              {selected.chain_valid === null
                                ? "Nothing to check"
                                : selected.chain_valid
                                  ? "Chain intact"
                                  : "Chain broken"}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {selected.chain_valid === null
                                ? "An empty chain proves nothing"
                                : "Re-hashed from the stored packets"}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200/70">
                            <div className="text-[11px] font-bold text-[#022C4F]">
                              {orDash(selected.promoted_at, "Not promoted")}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Promoted at
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200/70">
                            <div className="text-[11px] font-bold text-[#022C4F]">
                              {selected.promoted
                                ? String(selected.promoted.packets)
                                : "—"}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Packets in the promoted envelope
                            </div>
                          </div>
                        </div>

                        {selected.sha256_hash && (
                          <div className="text-[10px] text-slate-500 font-mono break-all">
                            Envelope SHA-256 {selected.sha256_hash}
                          </div>
                        )}

                        {selected.status === "OPEN" ? (
                          <form onSubmit={handleAppend} className="space-y-2">
                            <label
                              htmlFor="telemetry-packet"
                              className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700"
                            >
                              Record a reading
                            </label>
                            <textarea
                              id="telemetry-packet"
                              value={packetJson}
                              onChange={(e) => setPacketJson(e.target.value)}
                              rows={5}
                              spellCheck={false}
                              placeholder={'{\n  "field": "value"\n}'}
                              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                            />
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              One packet is one reading, exactly as the
                              instrument reported it. It is stored unmodified
                              and not interpreted here — the registry&apos;s own
                              serializer for{" "}
                              <span className="font-semibold">
                                {selected.data_type}
                              </span>{" "}
                              is what decides whether it is valid, and it runs
                              when you end the session. A packet it refuses
                              names its sequence number and writes nothing.
                            </p>
                            <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
                              <Info size={12} className="shrink-0 mt-0.5" />
                              <span>
                                This form is the manual entry path, for an
                                instrument with no live link. A logger posting to
                                this session&apos;s <span className="font-mono">data/</span>{" "}
                                endpoint is recorded identically.
                              </span>
                            </p>
                            <button
                              type="submit"
                              disabled={!packetJson.trim() || busyId === session.id}
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-xs font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <Play size={12} />
                              <span>Append packet</span>
                            </button>
                          </form>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            This session is {selected.status} and accepts no
                            further packets. The packet log is append-only, so
                            a closed capture is final.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-[11px] text-amber-700">
                        This session&apos;s chain could not be read from the
                        server, so whether the packets still hash to the
                        recorded chain is unknown here. The row above still
                        shows the values the server recorded for it.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import an instrument export */}
      <form
        onSubmit={handleImport}
        className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4"
      >
        <div>
          <h2 className="text-sm font-bold text-[#022C4F] flex items-center gap-1.5">
            <Upload size={14} />
            Import an instrument export
          </h2>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
            For an instrument that has no radio: the capture leaves the unit as
            a file, and this reads it into a session. The file is kept and
            hashed, and the session it produces is closed and{" "}
            <span className="font-semibold">holds nothing in the registry</span>{" "}
            until you promote it below — nothing is written automatically,
            because a parse nobody checked should not become a statutory
            reading.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="import-device"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Instrument
            </label>
            <select
              id="import-device"
              value={importDevice}
              onChange={(e) => setImportDevice(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            >
              <option value="">Select the instrument that produced it</option>
              {devices
                .filter((d) => d.is_active)
                .map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.device_id})
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              The serial on the file is the provenance of every reading in it,
              so the instrument is recorded on the session, not inferred.
              Retired instruments are not listed — the platform refuses a
              capture recorded against one.
            </p>
          </div>

          <div>
            <label
              htmlFor="import-project"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Project
            </label>
            <select
              id="import-project"
              value={importProject}
              onChange={(e) => setImportProject(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            >
              <option value="">Use the instrument&apos;s assigned project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              A session reaches the registry through its project, so one of
              yours is required — named here or already assigned to the
              instrument.
            </p>
          </div>

          <div>
            <label
              htmlFor="import-test-type"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Test type
            </label>
            <select
              id="import-test-type"
              value={importTestType}
              onChange={(e) => setImportTestType(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            >
              {PUNDIT_TEST_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              A pulse-velocity reading and a crack-depth reading are different
              measurements of the same concrete, so the platform will not assume
              one. Leave this if the file has a TEST TYPE column.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="import-element"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Structural element
            </label>
            <input
              id="import-element"
              type="text"
              value={importElement}
              onChange={(e) => setImportElement(e.target.value)}
              placeholder="Column C2, shear wall…"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Leave blank if the file carries its own — the file&apos;s value
              wins, and a blank cell is silence rather than a value.
            </p>
          </div>

          <div>
            <label
              htmlFor="import-floor"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Floor
            </label>
            <input
              id="import-floor"
              type="text"
              value={importFloor}
              onChange={(e) => setImportFloor(e.target.value)}
              placeholder="Ground, First…"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            />
          </div>

          <div>
            <label
              htmlFor="import-location"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Test location
            </label>
            <input
              id="import-location"
              type="text"
              value={importLocation}
              onChange={(e) => setImportLocation(e.target.value)}
              placeholder="Grid reference, room…"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="import-file"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Export file
          </label>
          <input
            key={fileInputKey}
            id="import-file"
            type="file"
            accept=".csv,.json,.txt,text/csv,application/json,text/plain"
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            required
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F] file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-slate-200 file:bg-white file:text-[11px] file:font-semibold file:text-[#022C4F] file:cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Read as <span className="font-semibold">PUNDIT Ultrasonic NDT</span>{" "}
            — the only capture type with a file contract that describes a whole
            session. GPR exports are survey headers and belong in the
            data-import wizard; GNSS and SLAM have no agreed column layout yet.
            Columns are matched by their documented names (
            <span className="font-mono text-[10px]">
              PATH LENGTH L (MM)
            </span>
            ,{" "}
            <span className="font-mono text-[10px]">TRANSIT TIME T (US)</span>
            …). A file with columns this platform does not recognise is refused
            with the list it does accept, rather than guessed at.
          </p>
        </div>

        {mappingOffered && (
          /*
            The fix for that refusal. It sits inside the form because it is not
            a separate errand — the file that was just refused is the file being
            read, and recording the mapping imports it again straight away.
          */
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div>
              <div className="text-xs font-bold text-slate-800">
                Teach the platform this instrument&apos;s column names
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                {isReadingMapping
                  ? "Reading the file's own header row…"
                  : `These are the column names ${
                      mappingDeviceLabel || "this instrument"
                    } actually writes, read out of the file you just chose —
                    none of them were typed. Beside each is what the platform
                    would read it as. Nothing is recorded until you record it,
                    and then every future export from this instrument is read
                    without asking again.`}
              </p>
            </div>

            {mappingError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                {mappingError}
              </div>
            )}

            {!isReadingMapping && mappingRows.length > 0 && (
              <>
                <ColumnMappingEditor
                  rows={mappingRows}
                  accepted={mappingAccepted}
                  onChange={setMappingRows}
                  disabled={isSavingMapping}
                />

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {mappingSummary(mappingRows)}
                </p>

                <button
                  type="button"
                  onClick={() => void handleRecordMapping()}
                  disabled={isSavingMapping}
                  className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingMapping ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Wrench size={13} />
                  )}
                  <span>
                    {isSavingMapping
                      ? "Recording…"
                      : `Record on ${
                          mappingDeviceLabel || "this instrument"
                        } and import again`}
                  </span>
                </button>
              </>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!importDevice || !importFile || isImporting}
          className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isImporting ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={13} />
          )}
          <span>{isImporting ? "Reading the file…" : "Import export"}</span>
        </button>
      </form>

      {/* Start a session */}
      <form
        onSubmit={handleStart}
        className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-bold text-[#022C4F]">Start a session</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="telemetry-device"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Instrument
            </label>
            <select
              id="telemetry-device"
              value={startDevice}
              onChange={(e) => setStartDevice(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            >
              <option value="">Select an instrument</option>
              {devices
                .filter((d) => d.is_active)
                .map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.device_id})
                    {device.open_session_reference
                      ? ` — already streaming`
                      : ""}
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {devices.filter((d) => d.is_active).length === 0
                ? "No active instrument is available to you, so no session can be opened."
                : "Retired instruments are not listed."}
            </p>
          </div>

          <div>
            <label
              htmlFor="telemetry-data-type"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              What it is capturing
            </label>
            <select
              id="telemetry-data-type"
              value={startDataType}
              onChange={(e) => setStartDataType(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            >
              {DATA_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              This chooses which registry the packets are promoted into. It
              cannot be changed after the first packet.
            </p>
          </div>

          <div>
            <label
              htmlFor="telemetry-project"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Project
            </label>
            <select
              id="telemetry-project"
              value={startProject}
              onChange={(e) => setStartProject(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            >
              <option value="">
                {devices.length > 0
                  ? "Use the instrument's assigned project"
                  : "Select a project"}
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              A session is visible to you through its project, so one of your
              projects is required — either named here or already assigned to
              the instrument.
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="telemetry-config"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Session inputs (optional)
          </label>
          <textarea
            id="telemetry-config"
            value={startConfig}
            onChange={(e) => setStartConfig(e.target.value)}
            rows={3}
            spellCheck={false}
            placeholder={'{\n  "title": "…"\n}'}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Values that describe the whole capture — a survey title, a
            structural element. They are written onto the record the packets
            are promoted into. Leave it empty if the instrument sends them.
          </p>
        </div>

        <button
          type="submit"
          disabled={!startDevice || isStarting}
          className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isStarting ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play size={13} />
          )}
          <span>{isStarting ? "Opening…" : "Open session"}</span>
        </button>

        {openSessions.length > 0 && (
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {openSessions.length} session
            {openSessions.length === 1 ? " is" : "s are"} currently open on your
            projects. An instrument can only hold one open session at a time —
            its serial number is the provenance of every reading, so it cannot
            be in two places at once.
          </p>
        )}
      </form>
    </div>
  );
}
