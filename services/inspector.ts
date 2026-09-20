import api from './api';
import { describeBlobError as readBlobError } from '@/lib/apiErrors';
import { Inspection, InspectionFinding, StopWorkOrder } from './inspections';
import { Project } from './projects';
import { Document } from './documents';

/**
 * The authenticated inspector's identity, as the backend actually holds it.
 *
 * Every one of these is `null` when the platform has no recorded value, and
 * that is deliberate: `GET /government/inspectors/me/dashboard/` returns
 * `null` rather than a plausible-looking default, because a dashboard that
 * shows "LASBCA" to an inspector whose agency was never recorded is asserting
 * a fact the platform does not hold. Render an honest absence; never
 * substitute a literal.
 */
export interface InspectorProfile {
  id: string;
  email: string;
  /** `null` when the account has no recorded full name. */
  name: string | null;
  first_name?: string;
  last_name?: string;
  /**
   * `null` until a Director records an accreditation in
   * `government.Inspector`. This was previously fabricated from a slice of the
   * user's UUID, which made an unaccredited inspector appear to hold a badge.
   */
  badge_number: string | null;
  /**
   * Derived from the accreditation's expiry on every read, so a badge that
   * lapsed overnight reads EXPIRED without anything having written to the row.
   * `null` when no accreditation is recorded.
   */
  accreditation_status?: string | null;
  /** The RBAC role's recorded name. `null` when the profile carries no role. */
  role: string | null;
  agency: string | null;
  district: string | null;
}

export interface InspectorKPIs {
  assigned_projects: number;
  upcoming_inspections: number;
  open_findings: number;
  compliance_issues: number;
  /**
   * `null` means "not measured", which is not the same as `0`.
   *
   * This is the depth of this inspector's offline write queue — work captured
   * in the field and not yet promoted into the statutory registries. It is the
   * same figure `GET /api/v1/sync/status/` reports, so the two can never
   * disagree. `null` remains possible (and the UI must say "not measured"
   * rather than render a zero it did not observe) for a backend that does not
   * report the queue at all.
   */
  pending_evidence: number | null;
}

export interface TodayInspectionItem {
  id: string;
  inspection_reference: string;
  project_id: string;
  project_name: string;
  project_reference: string;
  /** `null` when the project records neither a site address nor an LGA/state. */
  location: string | null;
  inspection_type: string;
  status: string;
  priority: string;
  /** `null` when the inspection has not been scheduled yet. */
  scheduled_date: string | null;
  /**
   * True only when a geofenced check-in was performed AND the fix was within
   * the effective radius. A never-checked-in inspection is `false`, which is
   * not the same claim as "checked in and found off-site".
   */
  gps_verified: boolean;
}

export interface AssignedProjectItem {
  id: string;
  name: string;
  reference_number: string;
  location: string | null;
  current_phase: string;
  /**
   * Reported from the project's most recent recorded compliance certificate.
   * `null` when no certificate is recorded — "no open findings" is not the
   * same fact as "certified compliant", and this used to assert COMPLIANT on
   * that basis.
   */
  compliance_status: string | null;
  open_findings: number;
  next_inspection: string | null;
  project_type: string | null;
}

export interface CriticalFindingItem {
  id: string;
  finding_reference: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  project_id: string | null;
  project_name: string | null;
  category: string;
  created_at: string;
  status: string;
}

export interface EvidenceSyncStatus {
  /** Every evidence record in scope, whether or not it came from a sync. */
  uploaded: number;
  /** `null` = not measured. See `InspectorKPIs.pending_evidence`. */
  pending: number | null;
  /**
   * Queued writes the platform could not apply, counted from the queue.
   *
   * `null` = not measured. A `0` here reads as "nothing has ever failed", which
   * is why the backend distinguishes the two: the old implementation hardcoded
   * `0` and the card could not have been wrong because nothing computed it.
   */
  failed: number | null;
  /**
   * `max(synced_at)` across the queue, or `null` when nothing has ever synced.
   * This was previously `now()`, so the indicator always read "synced just
   * now" — even on an account that had never synced anything.
   */
  last_synced_at: string | null;
}

export interface RecentActivityItem {
  id: string;
  event: string;
  project: string | null;
  timestamp: string;
  actor: string | null;
  severity?: string | null;
  /**
   * An `AuditEvent` is an immutable log record and has no completion state;
   * an inspection-derived entry carries the inspection's status instead.
   */
  status: string | null;
}

export interface InspectorDashboardData {
  profile: InspectorProfile;
  kpis: InspectorKPIs;
  today_schedule: TodayInspectionItem[];
  assigned_projects: AssignedProjectItem[];
  critical_findings: CriticalFindingItem[];
  evidence_sync: EvidenceSyncStatus;
  recent_activity: RecentActivityItem[];
}

export interface InviteValidationResult {
  valid: boolean;
  error_code?: string;
  message?: string;
  id?: string;
  token?: string;
  invite_code?: string;
  email?: string;
  name?: string;
  role?: string;
  department?: string;
  agency_name?: string;
  district_name?: string;
  assigned_projects?: Array<{
    id: string;
    name: string;
    reference_number: string;
    site_address: string;
    status: string;
    project_type: string;
  }>;
  temporary_password?: string;
  expires_at?: string;
}

// ----------------------------------------------------
// 1. INVITATION & AUTHENTICATION SERVICES
// ----------------------------------------------------

export async function validateInspectorInvite(
  token: string,
  code?: string
): Promise<InviteValidationResult> {
  try {
    const res: any = await api.post('/settings/users/validate-invite/', {
      token,
      invite_code: code?.trim() || undefined,
    });
    return res?.data || res;
  } catch (err: any) {
    const data = err?.response?.data;
    if (data && typeof data === 'object') {
      return data;
    }
    return {
      valid: false,
      error_code: 'NETWORK_ERROR',
      message: err?.message || 'Failed to connect to verification server.',
    };
  }
}

export async function acceptInspectorInvite(payload: {
  email: string;
  token?: string;
  password?: string;
  name?: string;
}): Promise<any> {
  const res: any = await api.post('/settings/users/accept-invite/', payload);
  return res?.data || res;
}

// ----------------------------------------------------
// 2. INSPECTOR DASHBOARD SERVICE
// ----------------------------------------------------

/**
 * The inspector's operational dashboard, straight from the backend.
 *
 * This function used to swallow a failed request and return a fully
 * fabricated dashboard — a hardcoded badge number `LAG-INS-042`, an agency,
 * a district, eight assigned projects, twelve open findings, and a schedule
 * naming sites that do not exist. An inspector whose session had expired saw
 * a complete, plausible, entirely invented picture of their own jurisdiction,
 * and nothing in the UI said so.
 *
 * There is no fallback now. If the request fails the promise rejects and the
 * page renders an error state, because an absent dashboard and a fake
 * dashboard must not look the same on a screen a regulator reads.
 */
export async function getInspectorDashboard(): Promise<InspectorDashboardData> {
  const res: any = await api.get('/government/inspectors/me/dashboard/');
  const data = res?.data || res;
  if (!data || typeof data !== 'object' || !data.profile) {
    // services/api.ts only peels `.data` off an envelope that carries one.
    // This view returns its payload as siblings of `success`, so anything
    // landing here without a `profile` is a contract change — and inventing
    // the shape would put a guess in front of a field officer.
    throw new Error(
      'Malformed inspector dashboard response: no profile was returned.'
    );
  }
  return data as InspectorDashboardData;
}

// ----------------------------------------------------
// 2b. INSPECTOR ACCREDITATION
// ----------------------------------------------------

export interface InspectorAccreditation {
  id: string;
  badge_number: string;
  full_name: string;
  directorate: string;
  accreditation_status: string;
  accreditation_expiry: string | null;
  /** Derived from the expiry at read time; 'EXPIRED' outranks the stored value. */
  effective_status?: string;
  issued_by?: string;
  issued_at?: string | null;
  is_suspended?: boolean;
  suspension_reason?: string | null;
}

export type AccreditationResult =
  | { accredited: true; accreditation: InspectorAccreditation }
  | { accredited: false; reason: string; detail: string };

/**
 * The caller's own accreditation.
 *
 * `GET /government/inspectors/me/` answers **404** when no accreditation is
 * recorded. That is not a failure to be retried or swallowed — it is the
 * endpoint's honest way of saying "nobody has issued this person a badge",
 * and it is what stops an empty badge rendering as a real one. So a 404 is
 * converted into a discriminated `{accredited: false}` result rather than
 * thrown; every other error still rejects.
 */
export async function getInspectorAccreditation(): Promise<AccreditationResult> {
  try {
    const res: any = await api.get('/government/inspectors/me/');
    const data = res?.data || res;
    if (!data || typeof data !== 'object' || !data.badge_number) {
      return {
        accredited: false,
        reason: 'NOT_ACCREDITED',
        detail: 'No inspector accreditation is recorded for your account.',
      };
    }
    return { accredited: true, accreditation: data as InspectorAccreditation };
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const body = err.response?.data;
      return {
        accredited: false,
        reason: body?.reason || 'NOT_ACCREDITED',
        detail:
          body?.detail ||
          'No inspector accreditation is recorded for your account.',
      };
    }
    throw err;
  }
}

// ----------------------------------------------------
// 3. PROJECT & INSPECTION OPERATIONAL METHODS
// ----------------------------------------------------

/**
 * Every read below deliberately lets its error propagate.
 *
 * Each of these previously caught, logged to the console, and returned `[]`.
 * A field app that answers "no projects" when the server said "your session
 * expired" is worse than one that shows an error: an empty jurisdiction looks
 * exactly like a quiet one, so the inspector concludes they have no work
 * rather than that the app is broken. Callers render an error state.
 */
export async function getInspectorProjects(params?: {
  search?: string;
  phase?: string;
  compliance?: string;
}): Promise<any[]> {
  const res: any = await api.get('/projects/', { params });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function getInspectorProjectById(id: string): Promise<any> {
  const res: any = await api.get(`/projects/${id}/`);
  return res?.data || res;
}

/**
 * Projects this caller may actually name in a *write*.
 *
 * `/projects/` (above) is the registry browse: unscoped by design, so it
 * lists every project on the platform. Writes are validated far more
 * narrowly — the field serializers resolve through `scoped_projects(user)` —
 * so a picker filled from the browse list offers choices the server answers
 * with "Invalid pk … does not exist". Use this wherever the chosen project is
 * going to be saved onto something.
 *
 * An empty result is a real answer, not an error: this account has no project
 * in scope.
 */
export async function getAssignableProjects(): Promise<any[]> {
  const res: any = await api.get('/projects/assignable/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function getInspectorInspections(params?: {
  status?: string;
  project?: string;
  priority?: string;
  search?: string;
}): Promise<Inspection[]> {
  const res: any = await api.get('/inspections/', { params });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function getInspectorInspectionById(id: string): Promise<Inspection> {
  const res: any = await api.get(`/inspections/${id}/`);
  return res?.data || res;
}

/** What the geofence decided about a check-in. */
export interface GeofenceOutcome {
  /** VERIFIED / OUTSIDE / UNVERIFIABLE — or `''` when never evaluated. */
  state: string;
  /** e.g. WITHIN_RADIUS, OUTSIDE_RADIUS, PROJECT_COORDINATES_NOT_RECORDED. */
  reason: string;
  /** Metres from the recorded site point, or `null` when there was no point. */
  distance_m: number | null;
  radius_m: number;
  /**
   * 'project' or 'platform_default'. The platform default is a policy, not
   * something the project recorded, and the UI must not present it as the
   * latter — hence this field rather than a bare radius.
   */
  radius_source: string;
  accuracy_m: number | null;
  /** Present on the execution-state read; `state === ''` means never evaluated. */
  evaluated?: boolean;
}

export interface CheckinResult {
  status: string;
  gps_verified: boolean;
  gps_latitude: number | null;
  gps_longitude: number | null;
  checkin_time: string | null;
  geofence: GeofenceOutcome;
}

/** One row of the mandatory checklist the backend assembles for this inspection. */
export interface ChecklistTemplateItem {
  item_id: string;
  order: number;
  title: string;
  field_type: string;
  required: boolean;
}

export interface ChecklistTemplate {
  template_id: string;
  template_name: string;
  version: string;
  items: ChecklistTemplateItem[];
}

export interface InspectionSubmissionSummary {
  id: string;
  submitted_at: string;
  submission_hash: string;
  items: number;
  evidence_files: number;
  /** Recomputed server-side from stored content — this is a real verification. */
  integrity_verified: boolean;
}

export interface InspectionSignoffSummary {
  signed_by: string;
  signed_at: string;
  signoff_hash: string;
  signature_verified: boolean;
}

/**
 * The execution state of one inspection.
 * `GET /inspections/{id}/execution/`
 *
 * `checklist` is `null` when no active `InspectionTemplate` exists for the
 * inspection's discipline. That is a real configuration state, not an error and
 * not an invitation to substitute a default list of items nobody authored.
 */
export interface InspectionExecutionState {
  inspection: string;
  status: string;
  checklist: ChecklistTemplate | null;
  gps_verified: boolean;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_accuracy_m: number | null;
  checkin_time: string | null;
  check_out_time: string | null;
  checkout_latitude: number | null;
  checkout_longitude: number | null;
  geofence: GeofenceOutcome;
  submission?: InspectionSubmissionSummary;
  signoff?: InspectionSignoffSummary;
}

export async function getInspectorInspectionExecution(
  id: string
): Promise<InspectionExecutionState> {
  const res: any = await api.get(`/inspections/${id}/execution/`);
  return (res?.data || res) as InspectionExecutionState;
}

/**
 * Geofenced check-in. `POST /inspections/{id}/execution/checkin/`
 *
 * `gps_accuracy_m` is the device's own reported horizontal accuracy and is
 * what makes the result *verified* rather than merely recorded: a 50 m
 * geofence cannot be certified by a fix whose error is wider than the fence.
 * Omitting it yields an honest UNVERIFIABLE rather than a pass, so it is
 * passed through whenever the browser reports it.
 *
 * There is no fallback to a legacy `/checkin/` route. The old code did that on
 * any failure, which meant a 403 from the execution endpoint was silently
 * retried against a different one and the caller could not tell which had
 * answered.
 */
export async function checkinInspectorInspection(
  id: string,
  coords: {
    latitude: number;
    longitude: number;
    gps_accuracy_m?: number | null;
    device_time?: string;
  }
): Promise<CheckinResult> {
  const res: any = await api.post(`/inspections/${id}/execution/checkin/`, coords);
  return (res?.data || res) as CheckinResult;
}

export interface CheckoutResult {
  status: string;
  check_out_time: string | null;
  checkout_latitude: number | null;
  checkout_longitude: number | null;
}

/**
 * Check out of a site. `POST /inspections/{id}/execution/checkout/`
 *
 * Position is optional — a device may have no fix when leaving, and the
 * backend records the absence rather than inventing a point. Note this does
 * not change the inspection's status: check-out is a recorded fact, not a
 * workflow transition.
 */
export async function checkoutInspectorInspection(
  id: string,
  coords: {
    latitude?: number;
    longitude?: number;
    gps_accuracy_m?: number | null;
    device_time?: string;
  } = {}
): Promise<CheckoutResult> {
  const res: any = await api.post(`/inspections/${id}/execution/checkout/`, coords);
  return (res?.data || res) as CheckoutResult;
}

/** A checklist row as the submission endpoint seals it. */
export interface ChecklistResultPayload {
  item_id: string;
  title: string;
  /** The backend stores this verbatim; the house convention is PASS / FAIL. */
  result: string | null;
  notes: string;
  evidence_hashes?: string[];
}

export interface EvidenceFilePayload {
  file_name: string;
  sha256: string;
  url: string;
  file_type: string;
}

/**
 * The bytes behind an evidence record, as `EvidenceFileSerializer` reports them.
 *
 * `last_verify_ok` is nullable on purpose: `null` means no verification has ever
 * run, which is a different report from `false`. Rendering the two the same way
 * shows "failed" for "not checked yet".
 */
export interface EvidenceFileRecord {
  id: string;
  file_name: string;
  content_type: string;
  file_size_bytes: number | null;
  sha256_hash: string;
  /** A presigned URL, or null when storage could not produce one. */
  file_url: string | null;
  last_verify_ok: boolean | null;
  last_verified_at: string | null;
  last_verify_note: string;
  uploaded_by: string | null;
  created_at: string;
}

/** An `EvidenceRecord` with its file — what `/evidence/upload/` returns. */
export interface EvidenceRecordWithFile {
  id: string;
  evidence_reference: string;
  project: string;
  project_name: string;
  source_type: string;
  source_type_display: string;
  structural_element_id: string;
  inspection: string | null;
  evidence_hash: string;
  created_at: string;
  /** Null when the record has no file behind it (instrument rows have none). */
  file: EvidenceFileRecord | null;
}

/** The outcome of re-reading the stored bytes and re-hashing them. */
export interface EvidenceVerification {
  evidence_reference: string;
  payload_ok: boolean;
  evidence_hash: string;
  file_present: boolean;
  /** Null — not true, not false — when no file is attached or it is too large. */
  file_bytes_ok: boolean | null;
  file_sha256: string | null;
  file_size_bytes: number | null;
  note: string;
  verified_at: string;
}

/**
 * Store a capture as evidence and attest to it.
 *
 * `POST /evidence/upload/` creates the registry record *and* the file in one
 * request, because an `uploaded_file` record with no file would be a row
 * claiming evidence it does not hold.
 *
 * `sha256` is the client's own digest and is optional. When it is sent it must
 * match what the server computes or the upload is refused naming both values —
 * which is the point: it catches a file corrupted between the device and the
 * server. It is only sent when the browser can actually compute it, since
 * `crypto.subtle` is unavailable outside a secure context; omitting it is not a
 * weaker claim, it is the absence of a claim the client cannot make.
 *
 * `project` is required by the endpoint and is scoped server-side: a project
 * outside the caller's scope is a 404, not a silent no-op.
 */
export async function uploadInspectorEvidence(
  params: {
    project: string;
    inspection?: string | null;
    file: File;
    description?: string;
    sha256?: string;
    structuralElementId?: string;
    capturedAt?: string;
    coordinates?: Record<string, number> | null;
  },
  onProgress?: (fraction: number) => void
): Promise<EvidenceRecordWithFile> {
  const form = new FormData();
  form.append('file', params.file);
  form.append('project', params.project);
  if (params.inspection) form.append('inspection', params.inspection);
  if (params.description) form.append('description', params.description);
  if (params.sha256) form.append('sha256', params.sha256);
  if (params.structuralElementId) {
    form.append('structural_element_id', params.structuralElementId);
  }
  if (params.capturedAt) form.append('captured_at', params.capturedAt);
  if (params.coordinates) {
    form.append('coordinates', JSON.stringify(params.coordinates));
  }

  const res: any = await api.post('/evidence/upload/', form, {
    onUploadProgress: (event: any) => {
      if (!onProgress || !event?.total) return;
      onProgress(Math.min(1, event.loaded / event.total));
    },
  });
  return (res?.data || res) as EvidenceRecordWithFile;
}

/**
 * Re-read the stored bytes and re-hash them. `POST /evidence/<id>/verify/`
 *
 * A POST rather than a GET, and deliberately: it reads the file back and writes
 * the outcome. A mismatch is a 200 carrying `file_bytes_ok: false`, not an
 * error — the file failing verification is the answer to the question asked, so
 * a caller must read the flags rather than rely on the status code.
 */
export async function verifyInspectorEvidence(
  id: string
): Promise<EvidenceVerification> {
  const res: any = await api.post(`/evidence/${id}/verify/`);
  return (res?.data || res) as EvidenceVerification;
}

/**
 * Every evidence record attached to one inspection.
 *
 * `GET /evidence/inspection/<id>/` — a plain filter on the record's inspection
 * FK, so the server decides what belongs to the visit. Throws on failure rather
 * than returning `[]`: "no evidence attached" and "the evidence could not be
 * read" are different statements, and a submission cannot be built on the wrong
 * one.
 */
export async function getInspectorInspectionEvidence(
  inspectionId: string
): Promise<EvidenceRecordWithFile[]> {
  const res: any = await api.get(`/evidence/inspection/${inspectionId}/`);
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

/**
 * The client's own SHA-256 over a file, as lowercase hex.
 *
 * Returns `null` rather than throwing when the browser cannot compute it —
 * `crypto.subtle` is undefined outside a secure context, and the upload
 * endpoint treats the digest as optional. A caller sends it when it has one and
 * omits it otherwise; it must never substitute a stand-in, because a fabricated
 * digest on a tamper-evidence control certifies nothing while appearing to
 * certify everything.
 */
export async function computeFileSha256(file: File): Promise<string | null> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return null;
  try {
    const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return null;
  }
}

export interface SubmissionResult {
  submission_id: string;
  submission_hash: string;
  submitted_at: string;
  evidence_files: number;
  detail: string;
}

/**
 * The tamper-evident execution record. `POST /inspections/{id}/execution/submit/`
 *
 * This endpoint writes the sealed submission — checklist results, evidence
 * checksums, GPS and timestamp hashed together — and sets the inspection
 * COMPLETED. It does **not** sign off, and it does **not** record the
 * inspector's outcome decision: neither `outcome` nor `summary_notes` is part
 * of `InspectionSubmission`, so sending them here would drop them silently.
 * The caller records the outcome separately (see saveInspectorOutcome) and the
 * signature via signOffInspectorSubmission.
 */
export async function submitInspectorExecution(
  id: string,
  payload: {
    latitude: number;
    longitude: number;
    gps_accuracy_m?: number | null;
    checklist_results: ChecklistResultPayload[];
    evidence: EvidenceFilePayload[];
    device_time?: string;
  }
): Promise<SubmissionResult> {
  const res: any = await api.post(`/inspections/${id}/execution/submit/`, payload);
  return (res?.data || res) as SubmissionResult;
}

export interface SignoffResult {
  signed_by: string;
  signed_at: string;
  signoff_hash: string;
}

/**
 * Cryptographic sign-off. `POST /inspections/{id}/execution/sign-off/`
 *
 * The backend's own wording is "Complete the digital sign-off to finalise", so
 * this is a distinct step from submission and the UI must not merge the two
 * into one button claiming both happened.
 */
export async function signOffInspectorSubmission(
  id: string,
  signatureText: string
): Promise<SignoffResult> {
  const res: any = await api.post(`/inspections/${id}/execution/sign-off/`, {
    signature_text: signatureText,
  });
  return (res?.data || res) as SignoffResult;
}

/** Independent integrity re-verification. `GET /inspections/{id}/execution/verify/` */
export async function verifyInspectorExecution(id: string): Promise<{
  submission_hash: string;
  submission_valid: boolean;
  signoff_hash?: string;
  signoff_valid?: boolean;
}> {
  const res: any = await api.get(`/inspections/${id}/execution/verify/`);
  return (res?.data || res);
}

/**
 * Record the statutory outcome and the inspector's field notes.
 * `POST /inspections/{id}/complete/`
 *
 * These two fields live on `Inspection`, not on the sealed submission, which
 * is why they need their own call. They are **outside the hash chain** — the
 * submission hash covers checklist, evidence, GPS and time, not the outcome —
 * so a caller that wants the outcome to be tamper-evident has to read this
 * gap as a real property of the record rather than an implementation detail.
 * Reported to the user; not worked around, because inventing a hash over a
 * field the backend does not seal would be a worse lie than the gap.
 *
 * The call used to be `PATCH /inspections/{id}/` with the two fields. That
 * endpoint is the generic serializer update: it writes the columns and nothing
 * else. `InspectionService.complete_inspection`, which backs `complete/`, does
 * three things the PATCH does not — it validates the outcome against the
 * permitted set, it moves `status` to `FAILED` when the outcome is `FAILED`,
 * and it writes an `INSPECTION_COMPLETED_<outcome>` entry to the audit log.
 * Going through the PATCH meant a failed inspection was recorded as `FAILED`
 * in one column while `status` still read `COMPLETED`, and the audit trail
 * carried the submission but never the verdict the submission was made to
 * support.
 *
 * `checklist_results` is deliberately not sent. The sealed submission already
 * carries them, and `complete/` will not overwrite them when the field is
 * absent — sending a second, unsealed copy from the client would let a value
 * outside the hash chain replace one inside it.
 */
export async function saveInspectorOutcome(
  id: string,
  payload: { outcome: 'PASSED' | 'CONDITIONAL_PASS' | 'FAILED'; summary_notes: string }
): Promise<any> {
  const res: any = await api.post(`/inspections/${id}/complete/`, payload);
  return res?.data || res;
}


export async function logInspectorFinding(
  inspectionId: string,
  payload: {
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category?: string;
    corrective_action_required?: string;
    resolution_deadline?: string;
    requires_reinspection?: boolean;
    photos?: string[];
  }
): Promise<InspectionFinding> {
  const res: any = await api.post(`/inspections/${inspectionId}/log-finding/`, payload);
  return res?.data || res;
}

export async function getInspectorFindings(params?: {
  severity?: string;
  project?: string;
  resolved?: boolean;
}): Promise<InspectionFinding[]> {
  const res: any = await api.get('/inspections/findings/', { params });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function getInspectorEvidence(params?: {
  project?: string;
  source_type?: string;
}): Promise<any[]> {
  const res: any = await api.get('/evidence/records/', { params });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

/**
 * Statutory stop-work orders on the projects within this inspector's scope.
 *
 * `GET /inspections/stop-work-orders/` — `StopWorkOrderViewSet.get_queryset`
 * filters to `scoped_projects(user)`, so the server has already decided which
 * orders this inspector may see. Nothing is filtered client-side.
 *
 * This throws rather than returning `[]` on failure: an enforcement notice is
 * the most serious record on the compliance screen, and an unreachable server
 * must not render as "no orders in force".
 */
export async function getInspectorStopWorkOrders(params?: {
  status?: string;
  project?: string;
  search?: string;
}): Promise<StopWorkOrder[]> {
  const res: any = await api.get('/inspections/stop-work-orders/', { params });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

/**
 * Statutory and project documents on the projects within this inspector's
 * scope.
 *
 * Deliberately does NOT go through `services/documents.ts#getDocuments`, which
 * catches and returns `[]`. That shape is indistinguishable from "this
 * inspector has no documents", so a documents register that failed to load
 * would render as an empty register — the one reading a building-control
 * officer must never be given by accident. This throws, and the page says so.
 *
 * The endpoint is already scoped server-side (`DocumentViewSet.get_queryset`
 * filters to `scoped_projects`), so no client-side scoping is applied here.
 */
export async function getInspectorDocuments(params?: {
  project?: string;
  discipline?: string;
  document_type?: string;
  status?: string;
  search?: string;
}): Promise<Document[]> {
  const res: any = await api.get('/documents/documents/', { params });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

/**
 * The statutory inspection report PDF for one inspection, as bytes.
 *
 * `GET /reports/inspections/{id}/report/` renders the report from the live
 * inspection record — GPS verification, checklist results, findings and the
 * sign-off block — and marks anything the record does not hold as
 * "NOT RECORDED". It is therefore honest for an inspection at any status, not
 * only a completed one, and needs no client-side qualification.
 *
 * Returned as a Blob rather than a URL because the endpoint is authenticated:
 * a plain `<a href>` would arrive without the bearer token and download an
 * error page instead of a report.
 */
export async function downloadInspectorInspectionReport(id: string): Promise<Blob> {
  const res: any = await api.get(`/reports/inspections/${id}/report/`, {
    responseType: 'blob',
  });
  return res instanceof Blob ? res : res?.data;
}

/**
 * A human-readable message from a failed report download.
 *
 * The blob-error reader is shared with the import pipeline and lives in
 * `lib/apiErrors.ts`, so the two cannot drift apart. This wrapper exists only
 * to keep the report's own wording at the call site that downloads reports.
 */
export async function describeBlobError(err: any): Promise<string> {
  return readBlobError(err, "The report could not be generated by the server.");
}
