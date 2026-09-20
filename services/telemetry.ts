import api from './api';

/**
 * Telemetry: instrument sessions, their packet log, and device status.
 *
 * A session is an *envelope*, not a second registry. Starting one writes no
 * measurement; packets accumulate chained to one another; ending it replays
 * every packet through the same serializer the manual entry form uses and
 * writes the real statutory rows in one transaction. Two consequences the UI
 * has to carry, because a caller that does not know them will misread the
 * screen:
 *
 *  - `status` and `sync_status` are two independent axes. A session can be
 *    `ENDED` + `PENDING` (capture closed, nothing promoted yet) or `ENDED` +
 *    `FAILED` (promotion refused). Rendering one as the other would tell an
 *    inspector their measurements are in the registry when they are not.
 *  - Promotion is all-or-nothing. One malformed packet fails the whole
 *    session and writes nothing, so a `FAILED` session is retried in place
 *    rather than re-captured.
 *
 * A third axis, `transport`, says *how the capture reached the platform*: a
 * device pushing over site Wi-Fi and the same device's export file uploaded
 * three days later are different claims about one measurement. `''`/`null`
 * means the transport was not recorded — render that as "Not recorded", never
 * as a plausible guess, and never infer it from the device's `status`.
 */

export interface TelemetryDevice {
  id: string;
  device_reference: string;
  device_id: string;
  name: string;
  device_type: string;
  device_type_display: string;
  model: string;
  manufacturer: string;
  firmware_version: string;
  status: string;
  status_display: string;
  /** `null` when the device is registered but assigned to no project. */
  assigned_project: string | null;
  battery_level: number | null;
  latitude: number | null;
  longitude: number | null;
  /** `null` when the platform has never heard from this device. */
  last_seen: string | null;
  calibration_date: string | null;
  calibration_certificate_url: string;
  is_active: boolean;
  /**
   * The reference of this device's open session, or `null`.
   *
   * `null` means the device is not streaming. It does not mean the platform
   * could not find out — a device may legitimately be idle for days.
   */
  open_session_reference: string | null;
}

export interface TelemetrySession {
  id: string;
  session_reference: string;
  device: string;
  device_id: string;
  device_reference: string;
  project: string | null;
  project_name: string | null;
  operator: string | null;
  operator_name: string;
  data_type: string;
  data_type_display: string;
  /** OPEN / ENDED / ABORTED — what the capture is doing. */
  status: string;
  /** PENDING / SYNCED / FAILED — what has reached the registry. */
  sync_status: string;
  /** BLE / WIFI / CLOUD / FILE / MANUAL, or `''` when not recorded. */
  transport: string;
  /** The transport in words, or `null` when it was not recorded. */
  transport_display: string | null;
  /**
   * When the instrument says it started. `null` for a device with no clock —
   * deliberately not back-filled from `created_at`, which is when the server
   * first heard of the session and is a different fact.
   */
  session_start: string | null;
  session_end: string | null;
  packet_count: number;
  session_config: Record<string, unknown>;
  /** Set only for a capture that arrived as a file; `''` otherwise. */
  source_file_name: string;
  source_file_sha256: string;
  /** Set at promotion: the digest over the normalised envelope. */
  sha256_hash: string | null;
  sync_error: string;
  promoted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TelemetrySessionStatus {
  id: string;
  session_reference: string;
  device_id: string;
  project: string | null;
  data_type: string;
  status: string;
  sync_status: string;
  transport: string;
  packet_count: number;
  source_file_name: string;
  source_file_sha256: string;
  session_start: string | null;
  session_end: string | null;
  sync_error: string;
  sha256_hash: string | null;
  promoted_at: string | null;
  /**
   * `null` — never `true` — for a session with no packets. An empty chain
   * proves nothing, and reporting it as intact would be a claim about content
   * that does not exist.
   */
  chain_valid: boolean | null;
  promoted: {
    data_type: string;
    packets: number;
    sha256_hash: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface TelemetryPacketAck {
  session_reference: string;
  sequence: number;
  chain_hash: string;
  packet_count: number;
}

export interface TelemetryPromotion {
  session_reference: string;
  status: string;
  sync_status: string;
  packet_count: number;
  sha256_hash: string | null;
  promoted_at: string | null;
  /**
   * What reached the statutory registry, or `null` when nothing did.
   *
   * Never an empty object: that would read as "promoted, nothing found",
   * which is a different claim from "not promoted".
   */
  promoted: Record<string, unknown> | null;
}

/**
 * `GET telemetry/devices/` — a read-only projection over the existing device
 * registry in `digital_eye`, not a second one.
 *
 * A device appears here when it is assigned to a project in scope, or when it
 * has actually captured a session on one. Both are real relationships; neither
 * invents an assignment.
 */
export async function getTelemetryDevices(params?: {
  device_type?: string;
}): Promise<TelemetryDevice[]> {
  const res: any = await api.get('/telemetry/devices/', { params });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

/** `GET telemetry/sessions/` — the caller's sessions, newest first. */
export async function getTelemetrySessions(params?: {
  device?: string;
  project?: string;
  data_type?: string;
  status?: string;
  sync_status?: string;
  transport?: string;
}): Promise<TelemetrySession[]> {
  const res: any = await api.get('/telemetry/sessions/', { params });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

/** `GET telemetry/session/<id>/status/` — the polling shape the PWA uses. */
export async function getTelemetrySessionStatus(
  sessionId: string
): Promise<TelemetrySessionStatus> {
  const res: any = await api.get(`/telemetry/session/${sessionId}/status/`);
  return (res?.data || res) as TelemetrySessionStatus;
}

/**
 * `POST telemetry/session/start/` — open a session.
 *
 * Writes no measurement. A second open session for the same device is a 409:
 * the device serial is the provenance of a reading, and it can only be in one
 * place at a time.
 *
 * `sessionStart` is the instrument's own start time and is optional. Omit it
 * for a device with no clock rather than sending `now()` — the server will
 * record an absent start rather than a fabricated one.
 */
export async function startTelemetrySession(params: {
  device: string;
  dataType: string;
  project?: string | null;
  sessionConfig?: Record<string, unknown>;
  sessionStart?: string | null;
  /**
   * How this client reached the platform — BLE, WIFI or CLOUD. Omit it when
   * the client does not know; the server records an absent transport rather
   * than a plausible one. `FILE` and `MANUAL` are refused here: the server
   * decides those from which endpoint was called.
   */
  transport?: 'BLE' | 'WIFI' | 'CLOUD' | '';
}): Promise<TelemetrySession> {
  const res: any = await api.post('/telemetry/session/start/', {
    device: params.device,
    data_type: params.dataType,
    ...(params.project ? { project: params.project } : {}),
    session_config: params.sessionConfig || {},
    ...(params.sessionStart ? { session_start: params.sessionStart } : {}),
    ...(params.transport ? { transport: params.transport } : {}),
  });
  return (res?.data || res) as TelemetrySession;
}

/**
 * `POST telemetry/session/<id>/data/` — append one reading.
 *
 * The payload is stored exactly as the device sent it and is not validated
 * here. The registry serializer that owns that shape runs at `/end`, and
 * validating loosely here as well would create a second, weaker opinion about
 * the same row — one that could pass a payload the promotion later refuses.
 *
 * The returned `chain_hash` is what the next packet names as its predecessor,
 * so a client that loses this response must re-read `status/` rather than
 * guess a sequence number.
 */
export async function appendTelemetryPacket(
  sessionId: string,
  params: {
    payload: Record<string, unknown>;
    sequence?: number | null;
    recordedAt?: string | null;
  }
): Promise<TelemetryPacketAck> {
  const res: any = await api.post(`/telemetry/session/${sessionId}/data/`, {
    payload: params.payload,
    ...(params.sequence ? { sequence: params.sequence } : {}),
    ...(params.recordedAt ? { recorded_at: params.recordedAt } : {}),
  });
  return (res?.data || res) as TelemetryPacketAck;
}

/**
 * `POST telemetry/session/<id>/end/` — promote the session.
 *
 * All-or-nothing. One malformed packet fails the session with `sync_status`
 * FAILED and writes nothing into the statutory registry; the session is then
 * re-runnable in place, because the alternative would be to re-capture
 * measurements the instrument has already sent. A session that is already
 * SYNCED is refused with 409 — promoting twice would duplicate every row.
 *
 * A session that received no packets is a 400: there is nothing to promote.
 */
export async function endTelemetrySession(
  sessionId: string
): Promise<TelemetryPromotion> {
  const res: any = await api.post(`/telemetry/session/${sessionId}/end/`);
  return (res?.data || res) as TelemetryPromotion;
}

export interface TelemetryExportImport extends TelemetrySession {
  import_stats: {
    /** Rows read from the file. */
    rows: number;
    /** Blank lines the reader skipped. */
    skipped: number;
    /** Readings parsed into packets. */
    readings: number;
    /**
     * The platform already held these exact bytes, so nothing was read this
     * time and the session below is the one the first import created. The
     * other three figures describe that earlier parse, not this upload —
     * rendering them as if this upload produced them would be a lie.
     */
    duplicate?: boolean;
  };
}

/**
 * `POST telemetry/session/from-file/` — import an instrument export.
 *
 * The leg for a unit with no radio: the capture leaves the instrument as a
 * file, and this uploads it. The file is retained and hashed, its rows are
 * parsed against the platform's documented PUNDIT column contract, and the
 * result is an ordinary `ENDED` + `PENDING` session — reviewed and promoted
 * like any other capture, through the same all-or-nothing `/end`.
 *
 * **Context the file cannot carry is passed here.** A bare measurement export
 * holds path lengths and transit times and no notion of a structural element
 * or a test type, because those are the inspector's judgements. Supply them
 * with the upload; where the file states its own, the file wins.
 *
 * A file whose columns the platform does not recognise is refused with the
 * accepted column list. Nothing is guessed: mapping `DISTANCE (MM)` onto a
 * path length would put a number nobody measured into a statutory registry.
 */
export async function importTelemetryExport(params: {
  device: string;
  project?: string | null;
  file: File;
  dataType?: 'pundit' | 'gpr' | 'gnss' | 'scan';
  testType?: string;
  structuralElement?: string;
  floor?: string;
  testLocation?: string;
  weatherCondition?: string;
  transducerType?: string;
  transducerFrequencyKhz?: number | null;
}): Promise<TelemetryExportImport> {
  const form = new FormData();
  form.append('device', params.device);
  if (params.project) form.append('project', params.project);
  form.append('file', params.file);
  if (params.dataType) form.append('data_type', params.dataType);
  // Only non-empty context is sent: an empty string would be a claim that the
  // element is blank rather than that the app did not supply one.
  const context: Array<[string, string | number | null | undefined]> = [
    ['test_type', params.testType],
    ['structural_element', params.structuralElement],
    ['floor', params.floor],
    ['test_location', params.testLocation],
    ['weather_condition', params.weatherCondition],
    ['transducer_type', params.transducerType],
    ['transducer_frequency_khz', params.transducerFrequencyKhz],
  ];
  for (const [key, value] of context) {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, String(value));
    }
  }

  const res: any = await api.post('/telemetry/session/from-file/', form);
  return (res?.data || res) as TelemetryExportImport;
}

export interface TelemetryDeviceToken {
  id: string;
  device: string;
  device_id: string;
  device_reference: string;
  label: string;
  /** `nxdev_` plus a few characters — enough to recognise, not enough to use. */
  key_prefix: string;
  is_active: boolean;
  issued_at: string;
  last_used_at: string | null;
  /** `null` means no expiry was set — not that it never expires. */
  expires_at: string | null;
  revoked_at: string | null;
}

/** The one shape that carries the secret, and only ever on issue. */
export interface IssuedTelemetryDeviceToken extends TelemetryDeviceToken {
  token: string;
}

/** `GET telemetry/device-tokens/` — credentials for the caller's devices. */
export async function getDeviceTokens(params?: {
  device?: string;
  active?: boolean;
}): Promise<TelemetryDeviceToken[]> {
  const res: any = await api.get('/telemetry/device-tokens/', {
    params: {
      ...(params?.device ? { device: params.device } : {}),
      ...(params?.active ? { active: 'true' } : {}),
    },
  });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

/**
 * `POST telemetry/device-tokens/` — mint a credential for one instrument.
 *
 * The returned `token` is the only time the secret exists outside the client:
 * the server keeps a digest, so a credential that is lost is replaced, not
 * recovered. It authenticates as `Authorization: Device <token>` and may only
 * push as the device it was issued for.
 */
export async function issueDeviceToken(params: {
  device: string;
  label: string;
  expiresAt?: string | null;
}): Promise<IssuedTelemetryDeviceToken> {
  const res: any = await api.post('/telemetry/device-tokens/', {
    device: params.device,
    label: params.label,
    ...(params.expiresAt ? { expires_at: params.expiresAt } : {}),
  });
  return (res?.data || res) as IssuedTelemetryDeviceToken;
}

/** `POST telemetry/device-tokens/<id>/revoke/` — effective on the next call. */
export async function revokeDeviceToken(
  tokenId: string
): Promise<TelemetryDeviceToken> {
  const res: any = await api.post(`/telemetry/device-tokens/${tokenId}/revoke/`);
  return (res?.data || res) as TelemetryDeviceToken;
}
