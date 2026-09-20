"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Ban,
  CloudUpload,
  Copy,
  Cpu,
  Download,
  Info,
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import {
  createFieldDevice,
  getFieldDevices,
  setDeviceGateway,
  suggestColumnMapping,
  updateFieldDevice,
  type AcceptedColumn,
  type FieldDeviceInput,
  type FieldDeviceRecord,
} from "@/services/digitalEye";
import ColumnMappingEditor, {
  mappingSummary,
  rowsFromMapping,
  rowsFromSuggestion,
  rowsToMapping,
  type MappingRow,
} from "@/components/inspector/ColumnMappingEditor";
import {
  getDeviceTokens,
  getTelemetryDevices,
  issueDeviceToken,
  revokeDeviceToken,
  type IssuedTelemetryDeviceToken,
  type TelemetryDeviceToken,
} from "@/services/telemetry";
import { getAssignableProjects } from "@/services/inspector";
import { dateOr, dateTimeOr, orDash } from "@/lib/display";

/**
 * Mirrors `FieldDevice.DEVICE_TYPES` in the backend's `digital_eye` app.
 *
 * The server sends a `device_type_display` for every row it returns, so this
 * list is only ever needed to *choose* a type — a device whose type is missing
 * from here still lists correctly. Adding a type server-side means adding it
 * here too, or it cannot be selected when registering.
 */
const DEVICE_TYPES: { value: string; label: string }[] = [
  { value: "pundit", label: "PUNDIT Ultrasonic NDT" },
  { value: "gpr", label: "Ground Penetrating Radar" },
  { value: "tersus_gnss", label: "Tersus GNSS (MVP SI)" },
  { value: "scanner", label: "3D Laser Scanner" },
  { value: "slam", label: "SLAM Handheld Scanner" },
  { value: "thermal", label: "Thermal Imaging Camera" },
  { value: "other", label: "Other Sensor" },
];

function errorOf(err: any, fallback: string): string {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

/** Flatten DRF field errors into a readable list, naming the field at fault. */
function fieldErrors(err: any): string[] {
  const data = err?.response?.data;
  if (!data || typeof data !== "object") return [];
  return Object.entries(data).flatMap(([field, messages]) => {
    const list = Array.isArray(messages) ? messages : [messages];
    return list.map((m) => `${field}: ${String(m)}`);
  });
}

function notify(message: string, type: "success" | "error" = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("show-toast", { detail: { message, type } })
  );
}

const EMPTY_FORM: FieldDeviceInput = {
  device_id: "",
  device_type: "pundit",
  name: "",
  model: "",
  manufacturer: "",
  firmware_version: "",
  assigned_project: "",
  calibration_date: "",
  calibration_expiry: "",
  notes: "",
};

export default function InspectorInstrumentsPage() {
  const [devices, setDevices] = useState<FieldDeviceRecord[]>([]);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  /**
   * Which of the registered instruments this caller can actually act on.
   *
   * The registry endpoint returns every instrument on the platform, while the
   * credential endpoints are scoped to the ones this caller has a relationship
   * with. A screen that trusted the registry alone would offer a "Credentials"
   * button that always answers 404. `null` means the scoped list could not be
   * read — the panel is then offered rather than hidden, because hiding a
   * capability on a failed read would state something untrue about the device.
   */
  const [scopedIds, setScopedIds] = useState<Set<string> | null>(null);

  //: True when the scoped list above could not be read. The panels are still
  //: offered — see the note on `scopedIds` — but the reader is told that the
  //: offer is a fallback rather than a permission, so a refusal from the
  //: platform reads as the answer it is instead of a broken button.
  const [scopeUnknown, setScopeUnknown] = useState(false);

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  //: Distinct from `projects.length === 0`. An empty list is a real answer —
  //: this account has no project in scope — but it is also what the state
  //: holds before the read has finished, and saying "you have no projects"
  //: during that window would be a claim about the officer's jurisdiction
  //: made on no evidence.
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  // Register
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState<FieldDeviceInput>(EMPTY_FORM);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<string[]>([]);

  // Credentials, per device
  const [openDevice, setOpenDevice] = useState<string | null>(null);
  const [tokens, setTokens] = useState<
    Record<string, TelemetryDeviceToken[] | "error">
  >({});
  const [tokensNote, setTokensNote] = useState<Record<string, string>>({});
  const [loadingTokens, setLoadingTokens] = useState<string | null>(null);
  const [mintLabel, setMintLabel] = useState("");
  const [mintExpiry, setMintExpiry] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [busyToken, setBusyToken] = useState<string | null>(null);

  //: The one shape that ever carries the secret. Held in memory only — the
  //: server keeps a digest, so a token lost on reload is replaced, not
  //: recovered, and nothing here writes it to storage.
  const [issued, setIssued] = useState<
    (IssuedTelemetryDeviceToken & { device: string }) | null
  >(null);

  // Column mapping
  const [editingMapping, setEditingMapping] = useState<string | null>(null);
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([]);
  const [mappingAccepted, setMappingAccepted] = useState<AcceptedColumn[]>([]);
  const [mappingFileName, setMappingFileName] = useState<string | null>(null);
  const [isReadingMapping, setIsReadingMapping] = useState(false);
  const [mappingError, setMappingError] = useState<string | null>(null);
  const [isSavingMapping, setIsSavingMapping] = useState(false);

  // The assigned project. Registration was the only place it could be chosen,
  // which left an instrument registered without one invisible to every
  // project-scoped screen: absent from the import picker, absent from Devices,
  // unable to open a session. The API has always accepted the field; only this
  // control was missing.
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [projectDraft, setProjectDraft] = useState("");
  const [projectError, setProjectError] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Gateway sync, per device
  /**
   * Which instrument's confirmation is open, and which way it would go.
   *
   * Turning sync on mints a credential and writes the gateway's config, and
   * turning it off revokes that credential — neither is a thing to do because
   * a button happened to be where a finger landed. So it is a two-step control
   * like the column mapping, and what the second step says depends on the
   * direction, which is why the direction is part of the state rather than
   * inferred from the device at render time.
   */
  const [armedGateway, setArmedGateway] = useState<{
    device: string;
    enabled: boolean;
  } | null>(null);
  const [gatewayNote, setGatewayNote] = useState<Record<string, string>>({});
  const [busyGateway, setBusyGateway] = useState<string | null>(null);

  const readDevices = useCallback(async () => {
    setIsLoading(true);
    setDevicesError(null);
    try {
      const [registry, scoped] = await Promise.all([
        getFieldDevices(),
        // Failure here is not failure of the registry read: the list still
        // renders, with the credentials panel offered rather than withheld.
        getTelemetryDevices().catch(() => null),
      ]);
      setDevices(registry);
      setScopedIds(scoped === null ? null : new Set(scoped.map((d) => d.id)));
      setScopeUnknown(scoped === null);
    } catch (err) {
      setDevices([]);
      setScopedIds(null);
      setScopeUnknown(false);
      setDevicesError(
        errorOf(err, "The instrument registry could not be read.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const readProjects = useCallback(async () => {
    setProjectsError(null);
    try {
      // The *assignable* list, not the registry browse. `/projects/` is
      // unscoped by design and lists every project on the platform, while
      // saving a project onto a device is validated through
      // `scoped_projects(user)`. Filling this picker from the browse list
      // therefore offered choices the server answered with "Invalid pk …
      // does not exist" — a true statement about a set the officer was never
      // shown, which reads as the platform being broken.
      const rows = await getAssignableProjects();
      setProjects(
        (Array.isArray(rows) ? rows : []).map((p: any) => ({
          id: p.id,
          name: p.name,
        }))
      );
    } catch (err) {
      setProjects([]);
      setProjectsError(
        errorOf(err, "Your projects could not be read, so none can be assigned.")
      );
    } finally {
      setProjectsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void readDevices();
    void readProjects();
  }, [readDevices, readProjects]);

  const readTokens = useCallback(async (deviceId: string) => {
    setLoadingTokens(deviceId);
    setTokensNote((prev) => {
      const next = { ...prev };
      delete next[deviceId];
      return next;
    });
    try {
      const rows = await getDeviceTokens({ device: deviceId });
      setTokens((prev) => ({ ...prev, [deviceId]: rows }));
    } catch (err) {
      setTokens((prev) => ({ ...prev, [deviceId]: "error" }));
      setTokensNote((prev) => ({
        ...prev,
        [deviceId]: errorOf(
          err,
          "This instrument's credentials could not be read."
        ),
      }));
    } finally {
      setLoadingTokens(null);
    }
  }, []);

  const toggleDevice = (deviceId: string) => {
    setIssued((prev) => (prev && prev.device === deviceId ? null : prev));
    setMintError(null);
    setMintLabel("");
    setMintExpiry("");
    if (openDevice === deviceId) {
      setOpenDevice(null);
      return;
    }
    setOpenDevice(deviceId);
    void readTokens(deviceId);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterErrors([]);
    try {
      const payload: FieldDeviceInput = { ...form };
      // Blank means "not recorded", which is what the server stores as empty.
      // Sending "" for a date would be rejected; null is the absence.
      if (!payload.calibration_date) payload.calibration_date = null;
      if (!payload.calibration_expiry) payload.calibration_expiry = null;
      if (!payload.assigned_project) payload.assigned_project = null;

      const device = await createFieldDevice(payload);
      setForm(EMPTY_FORM);
      setShowRegister(false);
      await readDevices();
      notify(`${device.name || device.device_id} registered.`);
    } catch (err: any) {
      const named = fieldErrors(err);
      setRegisterErrors(
        named.length
          ? named
          : [errorOf(err, "The instrument could not be registered.")]
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleMint = async (e: React.FormEvent, deviceId: string) => {
    e.preventDefault();
    setIsMinting(true);
    setMintError(null);
    try {
      const created = await issueDeviceToken({
        device: deviceId,
        label: mintLabel.trim(),
        expiresAt: mintExpiry ? new Date(mintExpiry).toISOString() : null,
      });
      setIssued({ ...created, device: deviceId });
      setMintLabel("");
      setMintExpiry("");
      await readTokens(deviceId);
    } catch (err: any) {
      const named = fieldErrors(err);
      setMintError(
        named.length
          ? named.join(" ")
          : errorOf(err, "The credential could not be issued.")
      );
    } finally {
      setIsMinting(false);
    }
  };

  const handleRevoke = async (deviceId: string, token: TelemetryDeviceToken) => {
    setBusyToken(token.id);
    try {
      await revokeDeviceToken(token.id);
      await readTokens(deviceId);
      notify(`Credential ${token.key_prefix}… revoked.`);
    } catch (err) {
      setTokensNote((prev) => ({
        ...prev,
        [deviceId]: errorOf(err, "The credential could not be revoked."),
      }));
    } finally {
      setBusyToken(null);
    }
  };

  /**
   * Open the mapping editor on what is already recorded.
   *
   * The contract comes from the server rather than from a list kept here, so
   * the picker can never offer a column the platform has stopped accepting.
   * Asking for it without a file is a read of the contract alone.
   */
  const startMappingEdit = async (device: FieldDeviceRecord) => {
    setEditingMapping(device.id);
    setMappingError(null);
    setMappingFileName(null);
    setMappingRows(rowsFromMapping(device.column_mapping || {}));
    setMappingAccepted([]);
    setIsReadingMapping(true);
    try {
      const result = await suggestColumnMapping(device.id);
      setMappingAccepted(result.accepted);
    } catch (err) {
      setMappingError(
        errorOf(err, "The platform's column list could not be loaded.")
      );
    } finally {
      setIsReadingMapping(false);
    }
  };

  /**
   * Read one of this instrument's own exports and propose a mapping from it.
   *
   * Nothing is saved here. The server reads the file's header row and says what
   * each column appears to be; the inspector sees the proposal, fixes whatever
   * the platform got wrong, and saves it. That order matters — a column mapping
   * is indistinguishable from a correct one once rows have been written from
   * it, so the reading and the recording cannot be the same request.
   */
  const handleReadMappingFile = async (
    device: FieldDeviceRecord,
    file: File
  ) => {
    setEditingMapping(device.id);
    setMappingError(null);
    setIsReadingMapping(true);
    try {
      const result = await suggestColumnMapping(device.id, file);
      setMappingRows(rowsFromSuggestion(result));
      setMappingAccepted(result.accepted);
      setMappingFileName(result.file_name);
    } catch (err) {
      setMappingError(errorOf(err, "That file could not be read."));
    } finally {
      setIsReadingMapping(false);
    }
  };

  const handleSaveMapping = async (device: FieldDeviceRecord) => {
    setMappingError(null);
    // A column left as "not imported" is simply absent from the mapping — the
    // importer only consults it for headers it finds, so an omitted one is
    // exactly the honest way to say "do not read this".
    const parsed = rowsToMapping(mappingRows);

    setIsSavingMapping(true);
    try {
      await updateFieldDevice(device.id, { column_mapping: parsed });
      setEditingMapping(null);
      setMappingFileName(null);
      await readDevices();
      notify(
        Object.keys(parsed).length
          ? "Column mapping saved."
          : "Column mapping cleared."
      );
    } catch (err: any) {
      const named = fieldErrors(err);
      setMappingError(
        named.length
          ? named.join(" ")
          : errorOf(err, "The mapping could not be saved.")
      );
    } finally {
      setIsSavingMapping(false);
    }
  };

  const startProjectEdit = (device: FieldDeviceRecord) => {
    setEditingProject(device.id);
    setProjectError(null);
    setProjectDraft(device.assigned_project || "");
  };

  const handleSaveProject = async (device: FieldDeviceRecord) => {
    setProjectError(null);
    // Empty means "no project", and the API takes that as null rather than as
    // an empty string — the field is a foreign key, so "" is not a value it
    // could store even if it wanted to.
    const next = projectDraft || null;

    // Nothing to do, and doing it anyway would be a request that can only be
    // refused: an instrument already on a project outside this officer's scope
    // cannot be re-saved to that same project, because `assigned_project` is
    // validated against their scope. Closing the editor is the honest outcome.
    if (next === (device.assigned_project ?? null)) {
      setEditingProject(null);
      return;
    }

    setIsSavingProject(true);
    try {
      await updateFieldDevice(device.id, { assigned_project: next });
      setEditingProject(null);
      await readDevices();
      notify(
        next
          ? "Project assigned. This instrument now appears on your project's screens."
          : "Project removed. This instrument is no longer attributed to one."
      );
    } catch (err: any) {
      const named = fieldErrors(err);
      const raw = named.length ? named.join(" ") : errorOf(err, "");
      // The API answers an out-of-scope project with DRF's own wording —
      // `Invalid pk "…" - object does not exist` — which names a UUID at an
      // officer and explains nothing. It should no longer be reachable now
      // that the picker only offers assignable projects; if it is, the
      // useful thing to say is what they can do about it.
      setProjectError(
        /invalid pk|does not exist/i.test(raw)
          ? "That project is not one you can assign instruments to. Reload the page to see the projects available to you."
          : raw || "The project could not be saved."
      );
    } finally {
      setIsSavingProject(false);
    }
  };

  const clearGatewayNote = (deviceId: string) =>
    setGatewayNote((prev) => {
      const next = { ...prev };
      delete next[deviceId];
      return next;
    });

  /**
   * Turn automatic sending on or off for one instrument.
   *
   * The credential this mints is deliberately not in the response — the server
   * writes it straight into the gateway's config. So there is nothing here to
   * show, store or copy, and the panel's job after a success is only to say
   * what changed and where the files will come from.
   */
  const handleGateway = async (
    device: FieldDeviceRecord,
    enabled: boolean
  ) => {
    setBusyGateway(device.id);
    clearGatewayNote(device.id);
    try {
      await setDeviceGateway(device.id, enabled);
      setArmedGateway(null);
      await readDevices();
      notify(
        enabled
          ? `Automatic sending is on for ${device.name || device.device_id}.`
          : `Automatic sending is off for ${device.name || device.device_id}.`
      );
    } catch (err: any) {
      const named = fieldErrors(err);
      setGatewayNote((prev) => ({
        ...prev,
        [device.id]: named.length
          ? named.join(" ")
          : errorOf(err, "Automatic sending could not be changed."),
      }));
    } finally {
      setBusyGateway(null);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    notify("Credential copied.");
  };

  const downloadGatewayJson = (token: string, deviceId: string) => {
    const config = {
      api_url: process.env.NEXT_PUBLIC_API_URL || "https://api.nexucon.net",
      device_token: token,
      device: deviceId,
      watch_dir: "E:\\"
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gateway.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify("gateway.json downloaded.");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#022C4F]">Instruments</h1>
          <p className="text-xs text-slate-500 mt-1">
            The instruments registered to this platform, and the credentials
            they send with.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowRegister((v) => !v);
              setRegisterErrors([]);
            }}
            className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {showRegister ? <X size={14} /> : <Plus size={14} />}
            <span>{showRegister ? "Cancel" : "Register an instrument"}</span>
          </button>
          <button
            type="button"
            onClick={() => void readDevices()}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            title="Re-read the registry"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Register */}
      {showRegister && (
        <form
          onSubmit={handleRegister}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4"
        >
          <h2 className="text-sm font-bold text-[#022C4F]">
            Register an instrument
          </h2>

          {registerErrors.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle size={14} />
                The instrument was not registered
              </div>
              {registerErrors.map((message) => (
                <div key={message}>{message}</div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="device-serial"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Serial or asset tag
              </label>
              <input
                id="device-serial"
                value={form.device_id}
                onChange={(e) => setForm({ ...form, device_id: e.target.value })}
                required
                maxLength={100}
                placeholder="e.g. PL-200 18420041"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                The number printed on the unit. It is stamped on every reading
                the instrument produces, so it must be the real one and it
                cannot be reused by another device.
              </p>
            </div>

            <div>
              <label
                htmlFor="device-type"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Type
              </label>
              <select
                id="device-type"
                value={form.device_type}
                onChange={(e) =>
                  setForm({ ...form, device_type: e.target.value })
                }
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              >
                {DEVICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="device-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Name
              </label>
              <input
                id="device-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={150}
                placeholder="e.g. Pundit — Lagos depot"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>

            <div>
              <label
                htmlFor="device-manufacturer"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Manufacturer
              </label>
              <input
                id="device-manufacturer"
                value={form.manufacturer}
                onChange={(e) =>
                  setForm({ ...form, manufacturer: e.target.value })
                }
                maxLength={100}
                placeholder="e.g. Proceq"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>

            <div>
              <label
                htmlFor="device-model"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Model
              </label>
              <input
                id="device-model"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                maxLength={100}
                placeholder="e.g. Pundit PL-200"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>

            <div>
              <label
                htmlFor="device-project"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Assigned project
              </label>
              <select
                id="device-project"
                value={form.assigned_project || ""}
                onChange={(e) =>
                  setForm({ ...form, assigned_project: e.target.value })
                }
                disabled={projects.length === 0}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F] disabled:opacity-60"
              >
                <option value="">Not assigned</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {projectsError
                  ? projectsError
                  : "Optional. A device can be registered before it is assigned."}
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="device-notes"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="device-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>
              Calibration dates and export column names are set on the
              instrument after it is registered — they need the certificate and
              the first real export in front of you.
            </span>
          </p>

          <button
            type="submit"
            disabled={isRegistering || !form.device_id}
            className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isRegistering ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            <span>{isRegistering ? "Registering…" : "Register"}</span>
          </button>
        </form>
      )}

      {/* The once-only credential reveal */}
      {issued && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm space-y-3">
          <div className="flex items-start gap-2">
            <KeyRound size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Credential issued — copy it now
              </h2>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                This is the only time Nexucon will show it. The platform keeps
                a digest, not the credential, so if it is lost it is replaced
                rather than recovered.
              </p>
              <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
                You do not need a credential by hand for an instrument with{" "}
                <span className="font-semibold">Gateway sync</span> set up on its
                card below: the platform mints one and writes it into the
                gateway&apos;s config itself, so nothing has to be carried
                between screens. Mint one here only when a machine sends for an
                instrument that is not provisioned that way — and then read it
                to no one.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              readOnly
              value={issued.token}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 p-2.5 bg-white border border-amber-300 rounded-xl text-[11px] font-mono text-amber-900 focus:outline-none min-w-0"
            />
            <button
              type="button"
              onClick={() => copyToken(issued.token)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Copy size={14} /> Copy
            </button>
            <button
              type="button"
              onClick={() => downloadGatewayJson(issued.token, issued.device)}
              className="px-4 py-2.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download size={14} /> Download Config
            </button>
            <button
              type="button"
              onClick={() => setIssued(null)}
              className="px-4 py-2.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
            >
              Done
            </button>
          </div>
          <p className="text-[11px] text-amber-800">
            For{" "}
            <strong>
              {issued.device_reference}
              {issued.device_id ? ` · ${issued.device_id}` : ""}
            </strong>
            , labelled <strong>{issued.label}</strong>. It may only ever push
            as this instrument — the platform refuses it for any other.
          </p>
        </div>
      )}

      {devicesError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {devicesError} Nothing is listed because nothing could be read — this
          is not an empty registry.
        </div>
      )}

      {scopeUnknown && !devicesError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          Your own list of instruments could not be read, so this screen cannot
          tell which of these are yours. Every instrument below therefore offers
          its credentials panel; if one is not yours, the platform will refuse
          and say so. Nothing here is guessed.
        </div>
      )}

      {/* The registry */}
      {isLoading && devices.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <RefreshCw
            size={20}
            className="animate-spin text-slate-400 mx-auto mb-2"
          />
          <p className="text-xs text-slate-500">Reading the registry…</p>
        </div>
      ) : devices.length === 0 ? (
        !devicesError && (
          <div className="p-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
            <Cpu size={22} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              No instrument has been registered
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Nothing can send telemetry until one is — a capture has to be
              attributable to the instrument that produced it. Register the
              first one above, then issue it a credential.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {devices.map((device) => {
            const isOpen = openDevice === device.id;
            const deviceTokens = tokens[device.id];
            const mappingEntries = rowsFromMapping(device.column_mapping || {});
            // A column recorded as "not imported" is a decision, not a mapping,
            // so it is counted separately — saying "3 of this instrument's
            // column names are mapped" when one of the three is a refusal to
            // read it would be the panel lying about its own contents.
            const mappedCount = mappingEntries.filter((row) => row.target).length;
            const declinedCount = mappingEntries.length - mappedCount;
            const isRetired = device.status === "retired" || !device.is_active;
            const canManage = scopedIds === null || scopedIds.has(device.id);
            const gatewayArmed =
              armedGateway && armedGateway.device === device.id
                ? armedGateway
                : null;

            return (
              <div
                key={device.id}
                className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-[#022C4F]/10 text-[#022C4F] border border-[#022C4F]/20 shrink-0">
                        <Cpu size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-bold text-[#022C4F] break-all">
                            {device.name || device.device_id}
                          </h2>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                            {device.status_display}
                          </span>
                          {isRetired && (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                              {device.is_active ? "Retired" : "Inactive"}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 break-all">
                          {device.device_reference} · {device.device_id}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {device.device_type_display}
                          {device.manufacturer || device.model
                            ? ` · ${[device.manufacturer, device.model]
                                .filter(Boolean)
                                .join(" ")}`
                            : ""}
                          {device.firmware_version
                            ? ` · firmware ${device.firmware_version}`
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] text-slate-500">
                        Calibrated
                      </div>
                      <div className="text-xs font-semibold text-slate-800">
                        {device.calibration_date
                          ? dateOr(
                              device.calibration_date,
                              "date not recorded"
                            )
                          : "Not recorded"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {device.calibration_expiry
                          ? `Expires ${dateOr(
                              device.calibration_expiry,
                              "date not recorded"
                            )}`
                          : "No expiry recorded"}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] text-slate-500">
                        Last seen
                      </div>
                      <div className="text-xs font-semibold text-slate-800">
                        {device.last_seen
                          ? dateTimeOr(
                              device.last_seen,
                              "at an unrecorded time"
                            )
                          : "Not recorded"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {device.battery_level === null
                          ? "Battery not reported"
                          : `Battery ${device.battery_level}%`}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] text-slate-500">Project</div>
                      <div className="text-xs font-semibold text-slate-800">
                        {device.assigned_project
                          ? orDash(
                              projects.find(
                                (p) => p.id === device.assigned_project
                              )?.name,
                              "Assigned to a project outside your scope"
                            )
                          : "Not assigned"}
                      </div>
                    </div>
                  </div>

                  {/*
                    Assigned project — chosen at registration, and changeable
                    here.

                    The registration form asks for it, so an instrument
                    registered today arrives already attached. One registered
                    before its project existed did not, and an instrument with
                    no project reaches nothing: the scoping that decides what
                    an officer can see is project-shaped, so it drops out of
                    the import picker, out of Devices, and cannot open a
                    session — while still looking perfectly healthy on this
                    page. The API has always accepted this field; only the
                    control was missing.

                    Deliberately NOT gated on `canManage`, unlike every other
                    panel on this card. That flag is derived from the telemetry
                    device list, which matches on three relationships — the
                    project, a session on it, or who registered it — and those
                    are precisely what assigning a project here creates. Gating
                    this control on it would be circular: the button could only
                    appear for an instrument that already had the one thing the
                    button exists to give it, which is the exact case this
                    panel was added for. `assigned_project` is itself the
                    guard — the serializer will only accept a project already
                    inside the caller's scope, so this cannot attach an
                    instrument to somebody else's project, and the server stays
                    the authority on whether the change is allowed at all.
                  */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">
                          Assigned project
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {device.assigned_project
                            ? `Captures from this instrument are attributed to ${
                                projects.find(
                                  (p) => p.id === device.assigned_project
                                )?.name ||
                                "a project outside your scope"
                              }.`
                            : "Not assigned — this instrument is absent from the import form, absent from Devices, and no session can be opened for it."}
                        </p>
                        {!canManage && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            This instrument is not one of yours yet. Putting it
                            on one of your projects is what makes it yours — the
                            other panels on this card stay locked until it is.
                          </p>
                        )}
                      </div>
                      {editingProject !== device.id &&
                        (projectsLoaded &&
                        !projectsError &&
                        projects.length === 0 ? (
                          /*
                            Nothing to offer, so nothing is offered. The picker
                            used to be filled from the unscoped registry browse,
                            which meant this officer saw every project on the
                            platform and every choice was refused — the empty
                            state is the same information, told before they
                            click rather than after.
                          */
                          <p className="text-[11px] text-slate-500 shrink-0 sm:max-w-[15rem] leading-relaxed">
                            No project is in your scope, so there is nothing this
                            instrument can be assigned to.
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startProjectEdit(device)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                          >
                            <Pencil size={12} />
                            {device.assigned_project ? "Change" : "Assign"}
                          </button>
                        ))}
                    </div>

                    {editingProject === device.id && (
                      <div className="space-y-2">
                        {projectError && (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                            {projectError}
                          </div>
                        )}
                        <select
                          value={projectDraft}
                          onChange={(e) => setProjectDraft(e.target.value)}
                          aria-label="Assigned project"
                          disabled={projects.length === 0}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F] disabled:opacity-60"
                        >
                          <option value="">Not assigned</option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {projectsError
                            ? projectsError
                            : projects.length === 0
                              ? "No project is in your scope. An instrument can only be attached to a project you have standing on, so there is nothing to choose here yet."
                              : "A capture reaches the registry through its project. An instrument with none cannot be imported, cannot open a session, and does not appear under Devices."}
                        </p>
                        {device.assigned_project &&
                          !projects.some(
                            (p) => p.id === device.assigned_project
                          ) && (
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              This instrument currently belongs to a project
                              outside your scope, so it is not in the list above.
                              Choosing <b>Not assigned</b> and saving detaches it.
                            </p>
                          )}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleSaveProject(device)}
                            disabled={isSavingProject}
                            className="px-3 py-1.5 rounded-lg bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            {isSavingProject ? "Saving…" : "Save project"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProject(null)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Export columns — the fix for a refused export. */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">
                          Export columns
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {mappingEntries.length > 0
                            ? `${mappedCount} of this instrument's own column name${
                                mappedCount === 1 ? " is" : "s are"
                              } mapped${
                                declinedCount
                                  ? `, and ${declinedCount} recorded as not imported`
                                  : ""
                              }.`
                            : canManage
                            ? "None recorded — this instrument's export must already use the platform's column names. If a file is refused for a column the platform does not recognise, read that export here and the platform will work out the rest."
                            : "None recorded — this instrument's export must already use the platform's column names."}
                        </p>
                      </div>
                      {canManage && editingMapping !== device.id && (
                        <button
                          type="button"
                          onClick={() => void startMappingEdit(device)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                        >
                          <Pencil size={12} />
                          {mappingEntries.length === 0 ? "Record" : "Edit"}
                        </button>
                      )}
                    </div>

                    {mappingEntries.length > 0 && editingMapping !== device.id && (
                      /*
                        Read through the same function the editor writes through,
                        so a value carrying a scale is shown as the conversion it
                        is, and a column set aside reads as set aside, rather
                        than either appearing as a shape nobody recognises.
                      */
                      <div className="rounded-xl border border-slate-200/70 bg-white divide-y divide-slate-200/70 overflow-hidden">
                        {mappingEntries.map((row) => (
                          <div
                            key={row.header}
                            className="px-3 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                          >
                            <span className="text-[11px] font-mono text-slate-700 break-all">
                              {row.header}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 break-all">
                              {row.target
                                ? `→ ${row.target}${
                                    row.scale !== 1 ? ` ×${row.scale}` : ""
                                  }`
                                : "not imported"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {editingMapping === device.id && (
                      <div className="space-y-2">
                        {mappingError && (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                            {mappingError}
                          </div>
                        )}

                        <input
                          type="file"
                          accept=".csv,.json,.txt"
                          aria-label="Read one of this instrument's exports"
                          disabled={isReadingMapping || isSavingMapping}
                          onChange={(e) => {
                            const picked = e.target.files?.[0];
                            // Cleared so that choosing the same file twice in a
                            // row still counts as a choice.
                            e.target.value = "";
                            if (picked) {
                              void handleReadMappingFile(device, picked);
                            }
                          }}
                          className="block w-full text-[11px] text-slate-600 file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-slate-200 file:bg-white file:text-[11px] file:font-semibold file:text-[#022C4F] file:cursor-pointer hover:file:bg-slate-50 file:transition-colors cursor-pointer disabled:opacity-50"
                        />
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {isReadingMapping
                            ? "Reading…"
                            : mappingFileName
                            ? `Read from ${mappingFileName}. Nothing is saved until you save — check each column below first.`
                            : mappingRows.length > 0
                            ? "What is recorded for this instrument. Read an export to have its own column names listed instead."
                            : "Read one of this instrument's exports. Its own column names are listed below — never typed — beside what the platform makes of each."}
                        </p>

                        <ColumnMappingEditor
                          rows={mappingRows}
                          accepted={mappingAccepted}
                          onChange={setMappingRows}
                          disabled={isReadingMapping || isSavingMapping}
                        />

                        {mappingRows.length > 0 && (
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {mappingSummary(mappingRows)}
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleSaveMapping(device)}
                            disabled={isSavingMapping || isReadingMapping}
                            className="px-3 py-1.5 rounded-lg bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            {isSavingMapping ? "Saving…" : "Save mapping"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMapping(null);
                              setMappingFileName(null);
                              setMappingError(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/*
                    Gateway sync — the platform mints the credential and writes
                    the field gateway's config itself, which is the whole point:
                    a secret read out of one screen and typed into another is
                    the step that gets skipped, done wrong, or leaked.
                  */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <CloudUpload
                            size={12}
                            className="text-[#022C4F] shrink-0"
                          />
                          Gateway sync
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {device.gateway_enabled
                            ? "On — exports synced into this instrument's folder are sent to the platform on the gateway's next sweep."
                            : "Not configured — nothing is sent from this instrument automatically, so every capture has to be uploaded by hand."}
                        </p>
                      </div>
                      {canManage && !gatewayArmed && (
                        <button
                          type="button"
                          onClick={() => {
                            clearGatewayNote(device.id);
                            setArmedGateway({
                              device: device.id,
                              enabled: !device.gateway_enabled,
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                        >
                          <Pencil size={12} />
                          {device.gateway_enabled ? "Turn off" : "Set up"}
                        </button>
                      )}
                    </div>

                    {device.gateway_enabled && !gatewayArmed && (
                      <div className="rounded-xl border border-slate-200/70 bg-white px-3 py-2 space-y-1.5">
                        <div>
                          <div className="text-[11px] text-slate-500">
                            Sync exports into
                          </div>
                          <div className="text-[11px] font-mono text-slate-800 break-all">
                            {device.device_reference}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            A folder of that exact name, inside the directory the
                            gateway host watches. The name matters: the gateway
                            serves each instrument from its own folder, and a
                            file that lands in another one is pushed as that
                            other instrument.
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500">
                            The gateway reads it as
                          </div>
                          <div className="text-[11px] font-mono text-slate-800 break-all">
                            {device.gateway_inbox ||
                              "not reported by this deployment"}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          A file that arrives still lands as an unreviewed
                          import. Promoting a capture into the statutory record
                          stays a person&apos;s decision.
                        </p>
                      </div>
                    )}

                    {gatewayNote[device.id] && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 leading-relaxed">
                        {gatewayNote[device.id]}
                      </div>
                    )}

                    {gatewayArmed && (
                      <div className="rounded-xl border border-slate-200/70 bg-white p-3 space-y-2">
                        {gatewayArmed.enabled ? (
                          <>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Nexucon will mint a credential for this instrument
                              and write the field gateway&apos;s config for it. The
                              credential is never shown — not here, not
                              anywhere. It goes straight from the mint into the
                              config the gateway reads.
                            </p>
                            <div className="space-y-1.5">
                              <div>
                                <div className="text-[11px] text-slate-500">
                                  Have the site sync exports into a folder named
                                </div>
                                <div className="text-[11px] font-mono text-slate-800 break-all">
                                  {device.device_reference}
                                </div>
                              </div>
                              <div>
                                <div className="text-[11px] text-slate-500">
                                  The gateway reads it as
                                </div>
                                <div className="text-[11px] font-mono text-slate-800 break-all">
                                  {device.gateway_inbox ||
                                    "not reported by this deployment"}
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Files that appear there are sent on the
                              gateway&apos;s next sweep and arrive as unreviewed
                              imports, exactly as an upload would.
                            </p>
                          </>
                        ) : (
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            This revokes this instrument&apos;s gateway
                            credential and removes its config from the gateway,
                            so nothing further is sent from its folder. Captures
                            already received are untouched.
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleGateway(device, gatewayArmed.enabled)
                            }
                            disabled={busyGateway === device.id}
                            className="px-3 py-1.5 rounded-lg bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            {busyGateway === device.id
                              ? "Working…"
                              : gatewayArmed.enabled
                              ? "Turn on automatic sending"
                              : "Turn off automatic sending"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setArmedGateway(null);
                              clearGatewayNote(device.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => toggleDevice(device.id)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <KeyRound size={12} />
                      {isOpen ? "Hide credentials" : "Credentials"}
                    </button>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
                      <Info size={12} className="shrink-0 mt-0.5" />
                      <span>
                        This instrument is not one of yours — it is neither
                        assigned to a project you can see, has never captured a
                        session on one, nor was it registered by you. Its
                        credentials are issued by whoever holds it.
                      </span>
                    </p>
                  )}
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 pt-4 border-t border-slate-200/70 bg-slate-50/60 space-y-4">
                    {tokensNote[device.id] && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                        {tokensNote[device.id]}
                      </div>
                    )}

                    {loadingTokens === device.id &&
                    deviceTokens === undefined ? (
                      <p className="text-[11px] text-slate-500">
                        Reading this instrument&apos;s credentials…
                      </p>
                    ) : deviceTokens === "error" ? null : !deviceTokens ||
                      deviceTokens.length === 0 ? (
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        No credential has been issued for this instrument.
                        Nothing can send as it until one is — a gateway, a field
                        laptop, or the file import on the telemetry page.
                      </p>
                    ) : (
                      <div className="rounded-xl border border-slate-200/70 bg-white divide-y divide-slate-200/70 overflow-hidden">
                        {deviceTokens.map((token) => {
                          const dead =
                            token.revoked_at !== null || !token.is_active;
                          return (
                            <div
                              key={token.id}
                              className="px-3 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-800 flex flex-wrap items-center gap-2">
                                  <span className="break-all">
                                    {token.label}
                                  </span>
                                  <span className="font-mono text-[11px] text-slate-500">
                                    {token.key_prefix}…
                                  </span>
                                  {dead && (
                                    <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                                      {token.revoked_at ? "Revoked" : "Inactive"}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Issued{" "}
                                  {dateTimeOr(
                                    token.issued_at,
                                    "at an unrecorded time"
                                  )}
                                  {token.last_used_at
                                    ? ` · last used ${dateTimeOr(
                                        token.last_used_at,
                                        "at an unrecorded time"
                                      )}`
                                    : " · never used"}
                                  {token.expires_at
                                    ? ` · expires ${dateTimeOr(
                                        token.expires_at,
                                        "at an unrecorded time"
                                      )}`
                                    : " · no expiry recorded"}
                                </div>
                              </div>
                              {!dead && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleRevoke(device.id, token)
                                  }
                                  disabled={busyToken === token.id}
                                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                                  title="Stop this credential working. It takes effect on its next call."
                                >
                                  <Ban size={12} />
                                  {busyToken === token.id
                                    ? "Revoking…"
                                    : "Revoke"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <form
                      onSubmit={(e) => void handleMint(e, device.id)}
                      className="space-y-2"
                    >
                      <div className="text-xs font-bold text-slate-800">
                        Issue a credential
                      </div>

                      {mintError && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                          {mintError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor={`mint-label-${device.id}`}
                            className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
                          >
                            What it is for
                          </label>
                          <input
                            id={`mint-label-${device.id}`}
                            value={mintLabel}
                            onChange={(e) => setMintLabel(e.target.value)}
                            required
                            maxLength={100}
                            placeholder="e.g. site laptop gateway"
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`mint-expiry-${device.id}`}
                            className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
                          >
                            Expires
                          </label>
                          <input
                            id={`mint-expiry-${device.id}`}
                            type="datetime-local"
                            value={mintExpiry}
                            onChange={(e) => setMintExpiry(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        A label is how you will recognise it later — the
                        platform can tell you a credential exists and when it
                        was last used, but not what it was for unless it was
                        named. Leave the expiry empty for a credential with no
                        expiry recorded, which is not the same as one that never
                        expires.
                      </p>

                      <button
                        type="submit"
                        disabled={isMinting || !mintLabel.trim()}
                        className="px-3 py-1.5 rounded-lg bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isMinting ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <KeyRound size={12} />
                        )}
                        <span>{isMinting ? "Issuing…" : "Issue credential"}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* What a credential is, and what it is not. */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
        <h2 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Info size={14} />
          How credentials work
        </h2>
        <ul className="text-[11px] text-slate-600 leading-relaxed space-y-1.5 list-disc pl-4">
          <li>
            A credential authenticates as the instrument it was issued for, and
            as nothing else. The platform refuses one that tries to push as a
            different device rather than silently correcting it — an instrument
            quietly filing its readings under another is the failure this check
            exists to catch.
          </li>
          <li>
            The secret is shown once. The platform stores a digest it cannot
            reverse, so a lost credential is replaced, not recovered — revoke
            it and issue another.
          </li>
          <li>
            Revoking takes effect on the credential&apos;s next call. A field
            machine already running keeps working until it next sends.
          </li>
          <li>
            A credential can push captures but cannot read anything, promote
            anything into the registries, or reach any other instrument&apos;s
            data.
          </li>
        </ul>
      </div>
    </div>
  );
}
