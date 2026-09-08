import api from './api';

// ==========================================
// 1. DATA MODELS & TAXONOMY
// ==========================================

/**
 * Pulse velocity in m/s for display — client unit standard (7 Sep 2026):
 * two decimals, decimal points, NEVER thousands separators (4285.71, not
 * "4,285.71"). Null renders as an em dash.
 */
export function formatVelocityMs(velocityMs: number | null | undefined): string {
  return velocityMs == null || Number.isNaN(velocityMs)
    ? '—'
    : velocityMs.toFixed(2);
}

export type StructuralDiscipline = 'Structural' | 'Civil' | 'MEP' | 'Geotechnical' | 'Architecture';

export type StructuralCategory =
  | 'COLUMN'
  | 'BEAM'
  | 'SLAB'
  | 'FOUNDATION_PILE'
  | 'PILE_CAP'
  | 'RETAINING_WALL'
  | 'CORE_WALL'
  | 'TRANSFER_PLATE';

export type ClearanceStatus = 'VERIFIED' | 'PENDING' | 'ANOMALY_DETECTED' | 'NOT_APPLICABLE';

export interface BIMStructuralElement {
  id: string;
  element_guid: string;
  name: string;
  category: StructuralCategory;
  discipline: StructuralDiscipline;
  project: string;
  project_name?: string;
  model_id?: string;
  model_name?: string;
  grid_location: string;
  level: string;
  elevation_level_m?: number;
  coordinates_3d: { x: number; y: number; z: number };
  bounding_box?: { min: number[]; max: number[] };
  designed_concrete_grade: string; // e.g. "C35/45"
  concrete_grade_specified?: string;
  designed_rebar_spacing_mm: number; // e.g. 150
  designed_cover_depth_mm: number; // e.g. 40
  gpr_clearance_status: ClearanceStatus;
  pundit_clearance_status: ClearanceStatus;
  ai_anomaly_count: number;
  open_findings_count: number;
  last_inspected_at?: string;
  /** The mapping row's origin — 'ifc_upload' | 'trimble' | 'manual'. */
  mapping_source?: string;
  mapping_source_display?: string;
  /** Every IFC property-set value the import actually recorded for this
   *  element, flat `{ 'Pset_Name.Key': value }` — rendered verbatim by the
   *  element-properties panel, never summarised or invented. */
  raw_properties?: Record<string, unknown>;
}

// Mirrors the backend TrimbleConnectionSerializer (apps/digital_eye).
export interface TrimbleConnection {
  id: string;
  name: string;
  status: 'CONNECTED' | 'AUTH_REQUIRED' | 'DISCONNECTED' | 'ERROR';
  status_display: string;
  scope: string;
  trimble_user_id: string;
  trimble_user_name: string;
  last_health_check_at: string | null;
  last_health_status: string;
  last_error: string;
}

/** A detected subsurface feature on a GPR survey (real GPRAnomaly row). */
export interface GPRAnomalyRecord {
  id: string;
  survey: string;
  anomaly_type: 'void' | 'utility' | 'rebar' | 'delamination' | 'moisture' | 'burial' | 'other';
  anomaly_type_display: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severity_display: string;
  depth_m: number | null;
  estimated_size_m: number | null;
  rebar_cover_mm: number | null;
  coordinates: { x?: number; y?: number; latitude?: number; longitude?: number } | null;
  description: string;
  confidence: number | null;
  detected_by: string;
  created_at: string;
}

/** A real GPR survey row (GET /digital-eye/gpr-surveys/). Derived values the
 *  backend does not record (rebar spacing, dielectric, transect length) are
 *  honestly absent — never fabricated. */
export interface GPRScan {
  id: string;
  survey_reference: string;
  project: string;
  project_name: string;
  title: string;
  survey_area: string;
  structural_element: string;
  antenna_frequency_mhz: number | null;
  depth_range_m: number | null;
  grid_spacing_m: number | null;
  operator_name: string;
  status: 'draft' | 'in_progress' | 'processing' | 'completed' | 'failed';
  status_display: string;
  notes: string;
  anomaly_count: number;
  anomalies: GPRAnomalyRecord[];
  // URLs of attached SensorDataFile artifacts (radargrams, raw datasets).
  raw_file_urls: string[];
  created_at: string;
}

/** One operator-typed test point (A/B/C…) on an element. Which measurement it
 *  carries depends on the parent test's type: transit time (pulse velocity),
 *  cracked + uncracked transit times (crack depth) or the observed surface
 *  condition (surface quality). Velocity / E.C.S / crack depth are computed
 *  server-side. */
export interface PunditReading {
  id?: string;
  point_label: string;
  path_length_mm: number | null;
  // t for pulse velocity, t_cracked for crack depth; null for surface quality.
  transit_time_us: number | null;
  // Crack-depth method only: the uncracked-path transit time t_0.
  uncracked_transit_time_us: number | null;
  // Surface-quality method only: the condition observed at this point.
  surface_condition: string;
  velocity_km_s: number | null;
  ecs_mpa: number | null;
  crack_depth_mm: number | null;
  notes?: string;
}

export interface PunditTest {
  id: string;
  test_reference: string;
  project: string;
  project_name: string;
  test_type: 'pulse_velocity' | 'crack_depth' | 'surface_quality';
  structural_element_id?: string;
  structural_element_name?: string;
  structural_element_guid?: string;
  test_location: string; // e.g. "Grid D-7 Core Section"
  transducer_type: 'DIRECT' | 'INDIRECT' | 'SEMI_DIRECT' | '';
  transducer_frequency_khz: number; // 25, 54, 150, or 250 kHz
  path_length_mm: number; // e.g. 400 mm
  transit_time_us: number; // e.g. 94.2 microseconds
  // Multi-point readings (A/B/C…) recorded against the element; empty for
  // legacy single-measurement rows.
  readings: PunditReading[];
  // Operator-recorded context for the NDT report (never auto-generated).
  weather_condition: string;
  floor: string;
  // Optional concrete maturity at test time (7 Sep review item 18);
  // null = not recorded.
  concrete_age_days?: number | null;
  // Crack-depth method (BS 1881-203 time difference): 0 when not a crack test.
  crack_path_length_mm: number;
  crack_pulse_time_us: number;
  uncracked_pulse_time_us: number;
  surface_condition: string;
  surface_temperature_c: number | null;
  pulse_velocity_ms: number; // m/s; 0 until the server-side BS 1881-203 analysis has run
  estimated_compressive_strength_mpa: number | null; // E.C.S via the platform calibration curve; null outside its 2.0-5.0 km/s validity
  concrete_quality_rating: 'EXCELLENT' | 'GOOD' | 'DOUBTFUL' | 'POOR' | 'VERY_POOR' | 'PENDING';
  estimated_crack_depth_mm?: number | null;
  operator_name: string;
  test_date: string;
  notes?: string;
  created_at: string;
  file_count: number; // attached SensorDataFile artifacts (photos / raw exports)
}

export type FindingTaxonomy =
  | 'REBAR_SPACING_DEFICIENCY'
  | 'INSUFFICIENT_CONCRETE_COVER'
  | 'SUBSURFACE_VOID'
  | 'INTER_LAYER_DELAMINATION'
  | 'UNMAPPED_UTILITY_CONDUIT'
  | 'CONCRETE_HONEYCOMBING'
  | 'LOW_PULSE_VELOCITY_ZONE'
  | 'CRACK_DEPTH_ANOMALY'
  | 'THERMAL_VARIANCE_ANOMALY'
  | 'BIM_GEOMETRIC_DEVIATION';

export interface DigitalEyeFinding {
  id: string;
  finding_reference: string;
  project: string;
  project_name: string;
  structural_element_id?: string;
  structural_element_name?: string;
  structural_element_guid?: string;
  gpr_scan_id?: string;
  pundit_test_id?: string;
  taxonomy?: FindingTaxonomy;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score: number; // 0 - 100; 0 = not assessed (no number invented)
  logged_manually?: boolean;
  depth_mm?: number;
  deviation_mm?: number;
  gps_coordinates?: { lat: number; lng: number; elevation: number };
  evidence_photos: string[];
  radargram_snippet_url?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'VERIFIED' | 'RESOLVED' | 'CONVERTED_TO_NCR';
  ncr_reference?: string;
  linked_ncr_id?: string;
  reasoning?: string;
  evidence_references?: string[];
  bcf_topic_guid?: string;
  assigned_inspector?: string;
  resolution_deadline?: string;
  corrective_action?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessingQueueJob {
  id: string;
  job_reference: string;
  project: string;
  project_name: string;
  device_id: string;
  source_type: 'TERSU_S1_ROVER' | 'DRONE_LIDAR' | 'GPR_RADAR_GS8000' | 'PUNDIT_PL200' | 'MANUAL_PACKAGE';
  stage:
  | 'QUEUED'
  | 'RAW_INGESTION'
  | 'SLAM_REGISTRATION'
  | 'GPR_MIGRATION'
  | 'UPV_TOMOGRAPHY'
  | 'BIM_ALIGNMENT'
  | 'AI_INFERENCE'
  | 'COMPLETED'
  | 'FAILED';
  progress_percentage: number;
  node_type: 'CLOUD_GPU_CLUSTER' | 'EDGE_FIELD_ROVER';
  started_at?: string;
  completed_at?: string;
  file_count: number;
  total_bytes: string;
  error_message?: string;
  logs: string[];
}

export interface EvidenceSpatialPoint {
  id: string;
  project: string;
  project_name?: string;
  beacon_code?: string;
  name: string;
  title?: string;
  description?: string;
  layer_type: 'GNSS_RTK_BEACON' | 'GPR_TRANSECT' | 'PUNDIT_STATION' | 'AI_ANOMALY' | 'BIM_ANCHOR' | 'DRONE_POINT';
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  elevation_m: number;
  accuracy_mm: number;
  accuracy_cm?: number;
  deviation_mm?: number;
  severity?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  structural_element_name?: string;
  timestamp: string;
}

export interface DeviceReportRecord {
  id: string;
  report_reference: string;
  title: string;
  device_type: 'GPR' | 'PUNDIT' | 'TRIMBLE' | 'LIDAR' | 'THERMAL';
  project_id: string;
  project_name: string;
  element_id?: string;
  element_name?: string;
  report_type: string;
  standards_cited: string[];
  compliance_status: 'COMPLIANT' | 'FLAGGED_DEFECTS' | 'CRITICAL_NCR' | 'VERIFIED' | 'NOT_ASSESSED';
  executive_summary: string;
  metrics: {
    scans_or_tests_count?: number;
    pass_rate_pct?: number;
    avg_rebar_spacing_mm?: number;
    min_cover_depth_mm?: number;
    mean_pulse_velocity_ms?: number;
    est_compressive_strength_mpa?: number;
    bcf_open_issues?: number;
    max_tolerance_deviation_mm?: number;
    [key: string]: any;
  };
  generated_by: string;
  certified_engineer: string;
  stamped_at: string;
  file_size: string;
  download_url?: string;
}

// ==========================================
// 2. MOCK DATA — REMOVED.
//    Every Digital Eye module (GPR, PUNDIT, Trimble) now renders only real
//    API rows; empty/error states are honest (no fabricated fallback data).
// ==========================================



// ==========================================
// 3. API SERVICE METHODS
// ==========================================

const unwrap = <T>(res: any, fallback: T): T => {
  if (!res) return fallback;
  if (Array.isArray(res)) return res as unknown as T;
  if (res.data !== undefined && res.data !== null) {
    if (Array.isArray(res.data) || typeof res.data === 'object') return res.data as T;
  }
  if (res.results !== undefined && Array.isArray(res.results)) {
    return res.results as unknown as T;
  }
  return res as T;
};

// ==========================================
// 3a. BACKEND ROW -> UI MODEL MAPPERS (PUNDIT)
// Every PUNDIT / BIM / finding value rendered by the dashboard comes from a
// real API row through these mappers — never from fabricated fallback data.
// ==========================================

const GRADE_TO_RATING: Record<string, PunditTest['concrete_quality_rating']> = {
  excellent: 'EXCELLENT',
  good: 'GOOD',
  questionable: 'DOUBTFUL',
  poor: 'POOR',
  very_poor: 'VERY_POOR',
  pending: 'PENDING',
};

const TRANSDUCER_DISPLAY: Record<string, PunditTest['transducer_type']> = {
  direct: 'DIRECT',
  semi_direct: 'SEMI_DIRECT',
  indirect: 'INDIRECT',
  '': '',
};

/** Map a PUNDITTest API row to the PunditTest shape the UI renders. */
function mapPunditTest(row: any): PunditTest {
  return {
    id: String(row.id),
    test_reference: row.test_reference ?? '',
    project: String(row.project ?? ''),
    project_name: row.project_name ?? '',
    test_type: row.test_type ?? 'pulse_velocity',
    structural_element_name: row.structural_element || undefined,
    test_location: row.test_location || '',
    transducer_type: TRANSDUCER_DISPLAY[row.transducer_type] ?? '',
    transducer_frequency_khz: row.transducer_frequency_khz ?? 0,
    path_length_mm: row.path_length_mm ?? 0,
    transit_time_us: row.pulse_time_us ?? 0,
    readings: (Array.isArray(row.readings) ? row.readings : []).map((r: any) => ({
      id: r.id != null ? String(r.id) : undefined,
      point_label: r.point_label ?? '',
      path_length_mm: r.path_length_mm ?? null,
      transit_time_us: r.transit_time_us ?? null,
      uncracked_transit_time_us: r.uncracked_transit_time_us ?? null,
      surface_condition: r.surface_condition || '',
      velocity_km_s: r.velocity_km_s ?? null,
      ecs_mpa: r.ecs_mpa ?? null,
      crack_depth_mm: r.crack_depth_mm ?? null,
      notes: r.notes || undefined,
    })),
    weather_condition: row.weather_condition || '',
    floor: row.floor || '',
    concrete_age_days: row.concrete_age_days ?? null,
    crack_path_length_mm: row.crack_path_length_mm ?? 0,
    crack_pulse_time_us: row.crack_pulse_time_us ?? 0,
    uncracked_pulse_time_us: row.uncracked_pulse_time_us ?? 0,
    surface_condition: row.surface_condition || '',
    surface_temperature_c: row.surface_temperature_c ?? null,
    pulse_velocity_ms: row.velocity_km_s != null ? Math.round(row.velocity_km_s * 1000) : 0,
    estimated_compressive_strength_mpa: row.estimated_compressive_strength_mpa ?? null,
    concrete_quality_rating: GRADE_TO_RATING[row.quality_grade] ?? 'PENDING',
    estimated_crack_depth_mm: row.crack_depth_mm ?? null,
    operator_name: row.operator_name ?? '',
    test_date: row.tested_at ?? row.created_at ?? '',
    notes: row.notes || undefined,
    created_at: row.created_at ?? '',
    file_count: Array.isArray(row.files) ? row.files.length : 0,
  };
}

/** Map a BIMElementMapping API row to the BIMStructuralElement shape the UI renders. */
function mapBimElement(row: any): BIMStructuralElement {
  const coords = row.coordinates || {};
  const props = row.properties || {};
  const name = row.element_name || row.element_id || 'Unnamed Element';
  return {
    id: String(row.id),
    element_guid: row.bim_guid || '',
    name,
    category: (row.element_type || 'UNKNOWN') as StructuralCategory,
    discipline: (row.discipline || 'Structural') as StructuralDiscipline,
    project: String(row.project ?? ''),
    // Designation / grid reference shown next to the name. IFC imports key
    // element_id by NAME, so falling back to it printed
    // "Floor:200THK RC SLAB (Floor:200THK RC SLAB)" in every element
    // selector — only use it when it differs from the name, else the level.
    grid_location: (row.element_id && row.element_id !== name)
      ? row.element_id
      : (row.level || ''),
    level: row.level || '',
    coordinates_3d: {
      x: Number(coords.x ?? 0),
      y: Number(coords.y ?? 0),
      z: Number(coords.z ?? 0),
    },
    designed_concrete_grade: props.concrete_grade || props.grade || '',
    concrete_grade_specified: props.concrete_grade_specified
      ? String(props.concrete_grade_specified)
      : '',
    designed_rebar_spacing_mm: Number(props.rebar_spacing_mm ?? 0),
    designed_cover_depth_mm: Number(props.cover_depth_mm ?? 0),
    mapping_source: row.source || '',
    mapping_source_display: row.source_display || '',
    raw_properties: props,
    // No clearance verdicts exist until scans/tests are correlated — never
    // fabricated as VERIFIED.
    gpr_clearance_status: 'PENDING',
    pundit_clearance_status: 'PENDING',
    ai_anomaly_count: 0,
    open_findings_count: 0,
  };
}

const FINDING_SEVERITY: Record<string, DigitalEyeFinding['severity']> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
  info: 'LOW',
};

const FINDING_STATUS: Record<string, DigitalEyeFinding['status']> = {
  pending_review: 'OPEN',
  accepted: 'VERIFIED',
  rejected: 'RESOLVED',
  modified: 'INVESTIGATING',
  escalated: 'CONVERTED_TO_NCR',
};

/** Map a CorrelationFinding API row to the DigitalEyeFinding shape the UI renders. */
function mapFinding(row: any): DigitalEyeFinding {
  return {
    id: String(row.id),
    finding_reference: row.finding_reference ?? '',
    project: String(row.project ?? ''),
    project_name: row.project_name ?? '',
    structural_element_id: row.structural_element_id || undefined,
    structural_element_name: row.structural_element_id || undefined,
    structural_element_guid: row.bim_guid || undefined,
    taxonomy: (row.group_key as DigitalEyeFinding['taxonomy']) || undefined,
    title: row.title ?? '',
    description: row.description ?? '',
    severity: FINDING_SEVERITY[row.risk_level] ?? 'MEDIUM',
    // Evidence confidence (0.0-1.0 from the linked evidence records) — NOT
    // risk_score: a 0.78 risk was being displayed as "78% confidence"
    // (7 Sep meeting item 6). 0 = no evidence confidence recorded; the UI
    // hides the badge rather than inventing a number.
    confidence_score: row.confidence != null ? Math.round(Number(row.confidence) * 100) : 0,
    logged_manually: row.logged_manually ?? false,
    evidence_photos: [],
    status: FINDING_STATUS[row.status] ?? 'OPEN',
    ncr_reference: row.linked_ncr_reference || undefined,
    linked_ncr_id: row.linked_ncr ? String(row.linked_ncr) : undefined,
    reasoning: row.reasoning || undefined,
    evidence_references: Array.isArray(row.evidence_references) ? row.evidence_references : [],
    corrective_action: undefined,
    created_at: row.created_at ?? '',
    updated_at: row.updated_at ?? '',
  };
}

export const getBIMStructuralElements = async (params?: { project?: string; discipline?: string; search?: string }): Promise<BIMStructuralElement[]> => {
  const res = await api.get('/digital-eye/bim-elements/', {
    params: {
      project: params?.project || undefined,
      search: params?.search || undefined,
    },
  });
  const rows = unwrap<any[]>(res, []);
  let list = (Array.isArray(rows) ? rows : []).map(mapBimElement);
  if (params?.discipline && params.discipline !== 'all') {
    list = list.filter(e => e.discipline.toLowerCase() === params.discipline!.toLowerCase());
  }
  return list;
};

/**
 * Import BIM structural elements from a real design model file — .ifc parsed
 * directly (credential-free GUID mappings), .rvt translated to IFC through
 * Autodesk APS server-side (columns, slabs, walls etc. with levels and
 * coordinates). Backend: POST /digital-eye/bim-elements/import-ifc/
 * (BIMElementImportView).
 */
export const importBIMElementsFromIFC = async (
  projectId: string,
  file: File,
  onUploadProgress?: (percent: number) => void,
): Promise<{
  file: string;
  translated_from_rvt?: boolean;
  elements_extracted: number;
  mappings_created: number;
  mappings_updated: number;
  preview_elements?: number;
  preview_detail?: string;
  stored_file?: string | null;
}> => {
  const form = new FormData();
  form.append('project', projectId);
  form.append('file', file);
  const res = await api.post('/digital-eye/bim-elements/import-ifc/', form, {
    // Upload progress only — once the request body is sent the server is
    // parsing/tessellating, which has no measurable progress (B7).
    onUploadProgress: onUploadProgress
      ? (e) => {
          if (e.total) onUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      : undefined,
  });
  return unwrap<any>(res, null);
};

/**
 * Re-run the BIM import from a model file previously imported and kept on
 * the platform (B6 platform file picker). Backend:
 * POST /digital-eye/bim-elements/import-ifc/ with {project, sensor_file}.
 */
export const importBIMElementsFromStored = async (
  projectId: string,
  sensorFileId: string,
): Promise<{
  file: string;
  translated_from_rvt?: boolean;
  elements_extracted: number;
  mappings_created: number;
  mappings_updated: number;
  preview_elements?: number;
  preview_detail?: string;
  stored_file?: string | null;
}> => {
  const res = await api.post('/digital-eye/bim-elements/import-ifc/', {
    project: projectId,
    sensor_file: sensorFileId,
  });
  return unwrap<any>(res, null);
};

/** A BIM model file kept on the platform for re-import (file_type bim_model). */
export interface StoredBIMModelFile {
  id: string;
  file_name: string;
  file_size_bytes: number | null;
  sha256_checksum: string;
  uploaded_by: string;
  created_at: string;
}

/** What the import card shows: the model currently imported + stored files. */
export interface BIMImportStatus {
  currently_imported: {
    source_file: string;
    translated_from_rvt: boolean;
    element_count: number;
    updated_at: string;
  } | null;
  stored_files: StoredBIMModelFile[];
}

/**
 * Import-card status (B5/B6): GET /digital-eye/bim-elements/import-ifc/
 * ?project=… — the genuine file name of the model currently imported for the
 * project, plus the model files kept on the platform for re-import. Returns
 * null when the project has no import status at all (never fabricated).
 */
export const getBIMImportStatus = async (projectId: string): Promise<BIMImportStatus | null> => {
  if (!projectId) return null;
  const res = await api.get('/digital-eye/bim-elements/import-ifc/', {
    params: { project: projectId },
  });
  return unwrap<any>(res, null);
};

// ==========================================
// 3d. BIM MODEL PREVIEW GEOMETRY (stored tessellation of the imported model)
// ==========================================

/** One tessellated element mesh from the stored BIM model preview. */
export interface BIMModelGeometryElement {
  guid: string;
  name: string;
  type: string;
  /** Flat [x, y, z, x, y, z, …] vertex coordinates (mm-quantised). */
  verts: number[];
  /** Flat [i, j, k, i, j, k, …] triangle indices into verts. */
  faces: number[];
}

/** The stored 3D preview of the project's imported IFC/RVT model. */
export interface BIMModelGeometry {
  project: string;
  source_file: string;
  translated_from_rvt: boolean;
  element_count: number;
  updated_at: string;
  elements: BIMModelGeometryElement[];
}

/**
 * Fetch the tessellated preview meshes for a project's imported BIM model
 * (GET /digital-eye/bim-elements/geometry/?project=…). Returns null when no
 * model has been imported (404) — never a fabricated preview.
 */
export const getBIMModelGeometry = async (projectId: string): Promise<BIMModelGeometry | null> => {
  if (!projectId) return null;
  const res = await api.get('/digital-eye/bim-elements/geometry/', {
    params: { project: projectId },
  });
  return unwrap<any>(res, null);
};

const TRIMBLE_STATUS: Record<string, TrimbleConnection['status']> = {
  connected: 'CONNECTED',
  pending_authorization: 'AUTH_REQUIRED',
  disconnected: 'DISCONNECTED',
  error: 'ERROR',
};

/**
 * Real Trimble Connect connection state. Connections are workspace-global on
 * the backend (not project-scoped) — the most recent one wins. Returns null
 * when no connection exists or the API is unreachable: no fabricated status.
 */
export const getTrimbleConnectionStatus = async (projectId?: string): Promise<TrimbleConnection | null> => {
  const res = await api.get('/digital-eye/trimble/connections/', { params: { project: projectId || undefined } });
  const data = unwrap<any>(res, null);
  // Tolerate both a bare list and a paginated {count, results} envelope.
  const rows = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    name: row.name ?? '',
    status: TRIMBLE_STATUS[row.status] ?? 'DISCONNECTED',
    status_display: row.status_display ?? '',
    scope: row.scope ?? '',
    trimble_user_id: row.trimble_user_id ?? '',
    trimble_user_name: row.trimble_user_name ?? '',
    last_health_check_at: row.last_health_check_at ?? null,
    last_health_status: row.last_health_status ?? '',
    last_error: row.last_error ?? '',
  };
};

export const triggerTrimbleSync = async (connectionId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post(`/digital-eye/trimble/connections/${connectionId}/sync/`);
  const payload = unwrap<any>(res, {});
  const results = Array.isArray(payload?.results) ? payload.results : [];
  return { success: true, message: `Trimble Connect sync completed for ${results.length} project(s).` };
};

// ==========================================
// 4. GPR SURVEYS (real /digital-eye/gpr-surveys/ endpoints)
// ==========================================

/** Map a GPRSurvey API row to the GPRScan shape the UI renders. */
function mapGPRSurvey(row: any): GPRScan {
  return {
    id: String(row.id),
    survey_reference: row.survey_reference ?? '',
    project: String(row.project ?? ''),
    project_name: row.project_name ?? '',
    title: row.title ?? '',
    survey_area: row.survey_area || '',
    structural_element: row.structural_element || '',
    antenna_frequency_mhz: row.antenna_frequency_mhz ?? null,
    depth_range_m: row.depth_range_m ?? null,
    grid_spacing_m: row.grid_spacing_m ?? null,
    operator_name: row.operator_name ?? '',
    status: row.status ?? 'draft',
    status_display: row.status_display ?? '',
    notes: row.notes || '',
    anomaly_count: Array.isArray(row.anomalies) ? row.anomalies.length : (row.anomaly_count ?? 0),
    raw_file_urls: (Array.isArray(row.files) ? row.files : [])
      .map((f: any) => (f?.file ? String(f.file) : ''))
      .filter(Boolean),
    anomalies: (Array.isArray(row.anomalies) ? row.anomalies : []).map((a: any) => ({
      id: String(a.id),
      survey: String(a.survey ?? row.id),
      anomaly_type: a.anomaly_type ?? 'other',
      anomaly_type_display: a.anomaly_type_display ?? '',
      severity: a.severity ?? 'low',
      severity_display: a.severity_display ?? '',
      depth_m: a.depth_m ?? null,
      estimated_size_m: a.estimated_size_m ?? null,
      rebar_cover_mm: a.rebar_cover_mm ?? null,
      coordinates: a.coordinates ?? null,
      description: a.description || '',
      confidence: a.confidence ?? null,
      detected_by: a.detected_by ?? 'manual',
      created_at: a.created_at ?? '',
    })),
    created_at: row.created_at ?? '',
  };
}

export const getGPRScans = async (params?: { project?: string; element_id?: string; search?: string }): Promise<GPRScan[]> => {
  const res = await api.get('/digital-eye/gpr-surveys/', {
    params: {
      project: params?.project || undefined,
      search: params?.search || undefined,
    },
  });
  const rows = unwrap<any[]>(res, []);
  let surveys = (Array.isArray(rows) ? rows : []).map(mapGPRSurvey);
  if (params?.element_id) {
    // Surveys anchor to BIM elements through the structural-element string —
    // resolve the header dropdown's element id to its name, then filter.
    const elements = await getBIMStructuralElements({ project: params.project || undefined });
    const element = elements.find(el => el.id === params.element_id);
    if (element) {
      const q = element.name.toLowerCase();
      surveys = surveys.filter(s => s.structural_element.toLowerCase().includes(q));
    }
  }
  return surveys;
};

export const getGPRScanById = async (id: string): Promise<GPRScan | null> => {
  const res = await api.get(`/digital-eye/gpr-surveys/${id}/`);
  return mapGPRSurvey(unwrap<any>(res, res));
};

/** Create a GPR survey (POST /digital-eye/gpr-surveys/). Raw radargrams are
 *  attached as SensorDataFile uploads passed through file_ids. */
export interface GPRSurveyInput {
  project: string;
  title: string;
  survey_area?: string;
  structural_element?: string;
  antenna_frequency_mhz?: number;
  depth_range_m?: number;
  grid_spacing_m?: number;
  operator_name?: string;
  notes?: string;
  file_ids?: string[];
}

export const createGPRSurvey = async (input: GPRSurveyInput): Promise<GPRScan> => {
  const body: Record<string, unknown> = { project: input.project, title: input.title };
  if (input.survey_area) body.survey_area = input.survey_area;
  if (input.structural_element) body.structural_element = input.structural_element;
  if (input.antenna_frequency_mhz != null) body.antenna_frequency_mhz = input.antenna_frequency_mhz;
  if (input.depth_range_m != null) body.depth_range_m = input.depth_range_m;
  if (input.grid_spacing_m != null) body.grid_spacing_m = input.grid_spacing_m;
  if (input.operator_name) body.operator_name = input.operator_name;
  if (input.notes) body.notes = input.notes;
  if (input.file_ids?.length) body.file_ids = input.file_ids;
  const res = await api.post('/digital-eye/gpr-surveys/', body);
  return mapGPRSurvey(unwrap<any>(res, res));
};

/** Run the deterministic GPR adapter over a survey's recorded anomalies. */
export const analyzeGPRSurvey = async (surveyId: string): Promise<{
  survey: string; risk_level: string; risk_score: number;
  observations: string[]; recommendations: any[];
}> => {
  const res = await api.post(`/digital-eye/gpr-surveys/${surveyId}/analyze/`);
  return unwrap<any>(res, res);
};

/** Anchor a GPR survey to a BIM structural element (real PATCH). */
export const linkGPRSurveyToElement = async (surveyId: string, elementName: string): Promise<GPRScan> => {
  const res = await api.patch(`/digital-eye/gpr-surveys/${surveyId}/`, {
    structural_element: elementName,
  });
  return mapGPRSurvey(unwrap<any>(res, res));
};

/** Registered Digital Eye field hardware (GET /digital-eye/devices/). */
export interface FieldDeviceRecord {
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
  battery_level: number | null;
  last_seen: string | null;
  calibration_date: string | null;
  is_active: boolean;
}

export const getFieldDevices = async (params?: { device_type?: string; project?: string }): Promise<FieldDeviceRecord[]> => {
  const res = await api.get('/digital-eye/devices/', {
    params: {
      device_type: params?.device_type || undefined,
      assigned_project: params?.project || undefined,
    },
  });
  const rows = unwrap<any[]>(res, []);
  return Array.isArray(rows) ? rows : [];
};

export const getPunditTests = async (params?: {
  project?: string;
  element_name?: string;
  search?: string;
  test_type?: 'pulse_velocity' | 'crack_depth' | 'surface_quality';
  quality_grade?: string;
}): Promise<PunditTest[]> => {
  const res = await api.get('/digital-eye/pundit-tests/', {
    params: {
      project: params?.project || undefined,
      search: params?.search || undefined,
      test_type: params?.test_type || undefined,
      quality_grade: params?.quality_grade || undefined,
    },
  });
  const rows = unwrap<any[]>(res, []);
  let tests = (Array.isArray(rows) ? rows : []).map(mapPunditTest);
  if (params?.element_name) {
    // Tests anchor to BIM elements through the structural-element string.
    const q = params.element_name.toLowerCase();
    tests = tests.filter(t => (t.structural_element_name || '').toLowerCase().includes(q));
  }
  return tests;
};

/** Anchor a PUNDIT test to a BIM structural element (real PATCH). */
export const linkPunditTestToElement = async (testId: string, elementName: string): Promise<PunditTest> => {
  const res = await api.patch(`/digital-eye/pundit-tests/${testId}/`, {
    structural_element: elementName,
  });
  return mapPunditTest(unwrap<any>(res, res));
};

/**
 * Edit a PUNDIT test record (real PATCH to /digital-eye/pundit-tests/<id>/).
 * Only the recorded field measurements / observations are editable — the
 * analysis outputs (velocity, grade, E.C.S, crack depth) stay read-only and
 * are re-derived server-side from the corrected inputs.
 */
export const updatePunditTest = async (
  testId: string,
  patch: Partial<PunditTestInput> & {
    operator_name?: string;
    tested_at?: string;
    notes?: string;
    surface_temperature_c?: number | null;
    latitude?: number | null;
    longitude?: number | null;
  }
): Promise<PunditTest> => {
  const res = await api.patch(`/digital-eye/pundit-tests/${testId}/`, patch);
  return mapPunditTest(unwrap<any>(res, res));
};

/** Raw measurement payload accepted by POST /digital-eye/pundit-tests/ */
export interface PunditTestInput {
  project: string;
  test_type?: 'pulse_velocity' | 'crack_depth' | 'surface_quality';
  structural_element?: string;
  transducer_frequency_khz?: number;
  transducer_type?: 'DIRECT' | 'SEMI_DIRECT' | 'INDIRECT';
  test_location?: string;
  path_length_mm?: number;
  pulse_time_us?: number;
  // Crack-depth method (BS 1881-203 time difference) — all three required
  // by the serializer when test_type === 'crack_depth'.
  crack_path_length_mm?: number;
  crack_pulse_time_us?: number;
  uncracked_pulse_time_us?: number;
  // Surface-quality / homogeneity observations.
  surface_condition?: string;
  surface_temperature_c?: number;
  // Operator-recorded report context (Section 3.0 weather / floor grouping).
  weather_condition?: string;
  floor?: string;
  // Optional concrete age at test time in days (7 Sep review item 18).
  concrete_age_days?: number;
  // Multi-point readings (A/B/C…): the operator types the raw field
  // measurements only — transit times (pulse velocity), cracked/uncracked
  // times (crack depth) or surface conditions (surface quality). Velocity /
  // E.C.S / crack depths / element means are computed server-side.
  readings?: Array<{
    point_label?: string; // omitted -> auto-assigned A, B, C…
    path_length_mm?: number;
    transit_time_us?: number;
    uncracked_transit_time_us?: number;
    surface_condition?: string;
    notes?: string;
  }>;
  operator_name?: string;
  notes?: string;
  device?: string;
  latitude?: number;
  longitude?: number;
  // SensorDataFile ids (photos / raw device exports) attached on creation.
  file_ids?: string[];
}

export const createPunditTest = async (input: PunditTestInput): Promise<PunditTest> => {
  const body: Record<string, unknown> = {
    project: input.project,
    test_type: input.test_type || 'pulse_velocity',
  };
  if (input.structural_element) body.structural_element = input.structural_element;
  if (input.transducer_frequency_khz != null) body.transducer_frequency_khz = input.transducer_frequency_khz;
  if (input.transducer_type) body.transducer_type = input.transducer_type.toLowerCase();
  if (input.test_location) body.test_location = input.test_location;
  if (input.path_length_mm != null) body.path_length_mm = input.path_length_mm;
  if (input.pulse_time_us != null) body.pulse_time_us = input.pulse_time_us;
  if (input.crack_path_length_mm != null) body.crack_path_length_mm = input.crack_path_length_mm;
  if (input.crack_pulse_time_us != null) body.crack_pulse_time_us = input.crack_pulse_time_us;
  if (input.uncracked_pulse_time_us != null) body.uncracked_pulse_time_us = input.uncracked_pulse_time_us;
  if (input.surface_condition) body.surface_condition = input.surface_condition;
  if (input.surface_temperature_c != null) body.surface_temperature_c = input.surface_temperature_c;
  if (input.weather_condition) body.weather_condition = input.weather_condition;
  if (input.floor) body.floor = input.floor;
  if (input.concrete_age_days != null) body.concrete_age_days = input.concrete_age_days;
  if (input.readings?.length) {
    // Keep any point that carries a real field measurement — a transit time
    // (pulse velocity), a t_c/t_0 pair (crack depth) or an observed surface
    // condition. Blank rows are simply not taken.
    body.readings = input.readings
      .filter(r => (r.transit_time_us != null && r.transit_time_us > 0)
        || (r.uncracked_transit_time_us != null && r.uncracked_transit_time_us > 0)
        || (r.surface_condition != null && r.surface_condition.trim().length > 0))
      .map((r, idx) => ({
        point_label: r.point_label?.trim() || String.fromCharCode(65 + (idx % 26)),
        ...(r.path_length_mm != null ? { path_length_mm: r.path_length_mm } : {}),
        ...(r.transit_time_us != null && r.transit_time_us > 0
          ? { transit_time_us: r.transit_time_us } : {}),
        ...(r.uncracked_transit_time_us != null && r.uncracked_transit_time_us > 0
          ? { uncracked_transit_time_us: r.uncracked_transit_time_us } : {}),
        ...(r.surface_condition?.trim() ? { surface_condition: r.surface_condition.trim() } : {}),
        ...(r.notes ? { notes: r.notes } : {}),
      }));
  }
  if (input.operator_name) body.operator_name = input.operator_name;
  if (input.notes) body.notes = input.notes;
  if (input.device) body.device = input.device;
  if (input.latitude != null) body.latitude = input.latitude;
  if (input.longitude != null) body.longitude = input.longitude;
  if (input.file_ids?.length) body.file_ids = input.file_ids;

  const res = await api.post('/digital-eye/pundit-tests/', body);
  const created = mapPunditTest(unwrap<any>(res, res));

  // Velocity, quality grade, E.C.S and crack depth are computed by the
  // server-side BS 1881-203 engine on the analyze endpoint — run it so the
  // registry row is complete, then return the persisted record. Failures
  // surface the honest pending row instead of an invented result.
  const needsAnalysis = created.pulse_velocity_ms === 0
    || ((created.test_type === 'crack_depth') && created.estimated_crack_depth_mm == null);
  if (needsAnalysis) {
    try {
      await api.post(`/digital-eye/pundit-tests/${created.id}/analyze/`);
      const refreshed = await api.get(`/digital-eye/pundit-tests/${created.id}/`);
      return mapPunditTest(unwrap<any>(refreshed, refreshed));
    } catch {
      return created;
    }
  }
  return created;
};

// ==========================================
// 3f. PUNDIT batch import from the Excel template (A2)
// ==========================================

/** A rejected row / block from the batch import (all-or-nothing). */
export interface PunditImportError {
  /** 1-based READINGS-sheet row of the rejected row (0 for file-level errors). */
  row?: number;
  /** Row range of a rejected element block, e.g. "3-5". */
  rows?: string;
  message: string;
}

/** One created test from a successful batch import. */
export interface PunditImportedTest {
  test_reference: string;
  structural_element: string;
  /** True when the element name matched the project's imported BIM model and
   *  the test carries its GUID; false means a free-text element (not linked). */
  bim_linked?: boolean;
  test_type: 'pulse_velocity' | 'crack_depth' | 'surface_quality';
  floor: string;
  points: number;
  velocity_km_s: number | null;
  quality_grade: string;
}

/** Result of POST /digital-eye/pundit-tests/import_readings/ */
export interface PunditImportResult {
  file: string;
  tests_created: number;
  points_imported: number;
  tests: PunditImportedTest[];
}

/** Row-level error detail carried by a rejected import, or null. */
export const punditImportErrors = (err: any): PunditImportError[] => {
  const data = err?.response?.data;
  return Array.isArray(data?.errors) ? data.errors : [];
};

/**
 * Batch upload of PUNDIT readings from the platform's .xlsx template (A2):
 * one row per test point; an element's consecutive rows form one test with
 * points A, B, C... All-or-nothing — a rejected row rejects the whole file
 * with row-level reasons and nothing is written.
 */
export const importPunditReadings = async (
  projectId: string,
  file: File,
): Promise<PunditImportResult> => {
  const form = new FormData();
  form.append('project', projectId);
  form.append('file', file);
  const res = await api.post('/digital-eye/pundit-tests/import_readings/', form);
  return unwrap<any>(res, null);
};

/**
 * Download the .xlsx template for the batch import (GET
 * /digital-eye/pundit-tests/import_template/). Passing the selected project
 * scopes the sample rows to that project's real BIM element names, so an
 * upload-as-is of the untouched template comes out linked to actual members.
 */
export const downloadPunditImportTemplate = async (projectId?: string): Promise<void> => {
  const res = await api.get(
    projectId
      ? `/digital-eye/pundit-tests/import_template/?project=${encodeURIComponent(projectId)}`
      : '/digital-eye/pundit-tests/import_template/',
    {
      responseType: 'blob',
    },
  );
  // The response interceptor already unwraps to response.data, so for blob
  // responses `res` IS the Blob (audit.ts uses the same `data || response`
  // guard — res.data on a Blob is undefined and would save a corrupt file).
  const blob = res instanceof Blob
    ? res
    : new Blob([res.data || res], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nexucon_pundit_readings_template.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Export the project's PUNDIT results to Excel — the same values the
 * official NDT report's Section 5.0 tables print (velocities in m/s).
 * Mirrors the downloadPunditImportTemplate blob handling above.
 */
export const exportPunditResults = async (projectId: string): Promise<string> => {
  const res = await api.get(
    `/digital-eye/pundit-tests/export_results/?project=${encodeURIComponent(projectId)}`,
    { responseType: 'blob' },
  );
  const blob = res instanceof Blob
    ? res
    : new Blob([res.data || res], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
  const disposition = (res as any)?.headers?.['content-disposition'] || '';
  const match = /filename="?([^";]+)"?/.exec(disposition);
  const filename = match ? match[1] : 'nexucon_pundit_results.xlsx';
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return filename;
};
export interface PunditProjectAnalysis {
  project: string;
  tests_analysed: number;
  analysis_id: string;
  risk_level: string;
  /** Evidence-based analysis confidence (0.0-1.0), or null when nothing
   *  was gradable — never a fabricated number. */
  confidence: number | null;
  observations: string[];
  recommendations: Array<{ priority: string; recommendation: string } | string>;
  reasoning_log: string[];
  model_provider: string;
  model_version: string;
}

/**
 * Run the PUNDIT analysis across a whole project: the deterministic
 * BS 1881-203 pass over every test, then one project-level AI narrative.
 * Nothing is fabricated client-side — every figure comes from the backend.
 */
export const analyzePunditProject = async (
  projectId: string
): Promise<PunditProjectAnalysis> => {
  const res = await api.post('/digital-eye/pundit-tests/analyze_project/', {
    project: projectId,
  });
  return unwrap<PunditProjectAnalysis>(res, {} as PunditProjectAnalysis);
};

/** Upload a raw sensor artifact (photo, PUNDIT raw export, radargram) and
 *  return its server id — pass it as a PunditTestInput.file_ids entry, or
 *  link it to the project directly (e.g. a captured BIM model 3D view used
 *  as the report's site map) via projectId. */
export interface SensorFileRecord {
  id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  sha256_checksum: string;
  description: string;
}

export const uploadSensorFile = async (
  file: File,
  fileType: 'photo' | 'pundit_raw' | 'gpr_radargram' | 'gpr_depth_slice' | 'gpr_raw' | 'gnss_rinex' | 'video' | 'other',
  description?: string,
  projectId?: string,
): Promise<SensorFileRecord> => {
  const form = new FormData();
  form.append('file', file);
  form.append('file_type', fileType);
  if (description) form.append('description', description);
  if (projectId) form.append('project', projectId);
  const res = await api.post('/digital-eye/files/', form);
  const row = unwrap<any>(res, res);
  return {
    id: String(row.id),
    file_name: row.file_name ?? file.name,
    file_type: row.file_type ?? fileType,
    file_size_bytes: row.file_size_bytes ?? file.size,
    sha256_checksum: row.sha256_checksum ?? '',
    description: row.description ?? description ?? '',
  };
};

export const getDigitalEyeFindings = async (params?: { project?: string; severity?: string; element_name?: string; element_id?: string; status?: string }): Promise<DigitalEyeFinding[]> => {
  const res = await api.get('/evidence/findings/', {
    params: {
      project: params?.project || undefined,
      risk_level: params?.severity && params.severity !== 'all' ? params.severity.toLowerCase() : undefined,
    },
  });
  const rows = unwrap<any[]>(res, []);
  let findings = (Array.isArray(rows) ? rows : []).map(mapFinding);
  if (params?.status && params.status !== 'all') {
    findings = findings.filter(f => f.status.toLowerCase() === params.status!.toLowerCase());
  }
  if (params?.element_id) {
    // Findings anchor to BIM elements via the element's GUID (bim_guid).
    findings = findings.filter(f => (f.structural_element_guid || '') === params.element_id);
  }
  if (params?.element_name) {
    const q = params.element_name.toLowerCase();
    findings = findings.filter(f => (f.structural_element_name || '').toLowerCase().includes(q));
  }
  return findings;
};

export const createDigitalEyeFinding = async (data: Partial<DigitalEyeFinding>): Promise<DigitalEyeFinding> => {
  const res = await api.post('/evidence/findings/', {
    project: data.project,
    structural_element_id: data.structural_element_id,
    structural_element_name: data.structural_element_name,
    structural_element_guid: data.structural_element_guid,
    title: data.title,
    description: data.description,
    taxonomy: data.taxonomy,
    severity: data.severity,
    depth_mm: data.depth_mm,
    deviation_mm: data.deviation_mm,
    status: data.status,
  });
  const row = unwrap<any>(res, res);
  return mapFinding(row);
};

export const escalateFindingToNCR = async (
  findingId: string,
  payload: { corrective_action: string; root_cause?: string; deadline_days?: number }
): Promise<{ success: boolean; ncr_reference: string }> => {
  let corrective_due_date: string | undefined;
  if (payload.deadline_days) {
    const due = new Date();
    due.setDate(due.getDate() + payload.deadline_days);
    corrective_due_date = due.toISOString().slice(0, 10);
  }
  const res = await api.post(`/evidence/findings/${findingId}/issue-ncr/`, {
    corrective_action: payload.corrective_action,
    ...(corrective_due_date ? { corrective_due_date } : {}),
  });
  const data = unwrap<any>(res, res);
  if (!data || !data.ncr_reference) {
    throw new Error('The backend did not return an NCR reference for this escalation.');
  }
  return { success: true, ncr_reference: data.ncr_reference };
};

export interface FindingAIDiagnostic {
  finding_id: string;
  finding_reference: string;
  structural_element: string;
  bim_guid?: string;
  severity: string;
  confidence_score: number;
  status: string;
  ncr_reference?: string | null;
  acoustic_inversion: {
    estimated_velocity_km_s: number;
    velocity_ms: number;
    quality_grade: string;
    anomaly_depth_mm?: number;
    spacing_variance_mm?: number;
    inversion_summary: string;
  };
  root_cause_analysis: string;
  standards_compliance: Array<{
    standard: string;
    clause: string;
    status: string;
    note: string;
  }>;
  recommended_corrective_actions: string[];
  ncr_remedial_draft: string;
  correlated_pundit_tests?: Array<{
    reference: string;
    path_length_mm: number;
    pulse_time_us: number;
    velocity_km_s: number | null;
    quality_grade: string;
    ecs_mpa: number | null;
  }>;
}

export const getFindingAIDiagnostic = async (findingId: string): Promise<FindingAIDiagnostic> => {
  const res = await api.post(`/evidence/findings/${findingId}/ai-diagnose/`);
  return unwrap<FindingAIDiagnostic>(res, (res.data || {}) as FindingAIDiagnostic);
};

export const downloadNcrReport = async (ncrId: string, ncrReference?: string): Promise<string> => {
  const res = await api.get(`/reports/ncrs/${ncrId}/report/`, {
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ncr_${ncrReference || ncrId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return url;
};

/** PUNDIT AI analysis records from /evidence/analyses/?analysis_type=pundit */
export interface PunditAIAnalysis {
  id: string;
  analysis_reference: string;
  project: string;
  project_name: string;
  analysis_type: string;
  analysis_type_display: string;
  risk_level: string;
  risk_score: number | null;
  confidence: number | null;
  requires_human_review: boolean;
  observations: string[] | string;
  recommendations: Array<{ priority?: string; recommendation?: string } | string>;
  reasoning_log: string[] | string;
  model_provider: string;
  model_version: string;
  created_at: string;
}

function mapPunditAnalysis(row: any): PunditAIAnalysis {
  return {
    id: String(row.id),
    analysis_reference: row.analysis_reference ?? '',
    project: String(row.project ?? ''),
    project_name: row.project_name ?? '',
    analysis_type: row.analysis_type ?? 'pundit',
    analysis_type_display: row.analysis_type_display ?? 'PUNDIT Ultrasonic NDT Analysis',
    risk_level: row.risk_level ?? 'info',
    risk_score: row.risk_score ?? null,
    confidence: row.confidence ?? null,
    requires_human_review: Boolean(row.requires_human_review),
    observations: Array.isArray(row.observations)
      ? row.observations
      : (typeof row.observations === 'string' ? row.observations : ''),
    recommendations: Array.isArray(row.recommendations)
      ? row.recommendations
      : (typeof row.recommendations === 'string' && row.recommendations ? [row.recommendations] : []),
    reasoning_log: Array.isArray(row.reasoning_log)
      ? row.reasoning_log
      : (typeof row.reasoning_log === 'string' && row.reasoning_log ? [row.reasoning_log] : []),
    model_provider: row.model_provider ?? '',
    model_version: row.model_version ?? '',
    created_at: row.created_at ?? '',
  };
}

export const getPunditAIAnalyses = async (params?: { project?: string }): Promise<PunditAIAnalysis[]> => {
  const res = await api.get('/evidence/analyses/', {
    params: {
      project: params?.project || undefined,
      analysis_type: 'pundit',
    },
  });
  const rows = unwrap<any[]>(res, []);
  return (Array.isArray(rows) ? rows : []).map(mapPunditAnalysis);
};

export const getProcessingQueue = async (params?: { project?: string; status?: string }): Promise<ProcessingQueueJob[]> => {
  const res = await api.get('/digital-eye/queue/', { params });
  const list = unwrap<ProcessingQueueJob[]>(res, []);
  return Array.isArray(list) ? list : [];
};

export const getEvidenceSpatialPoints = async (params?: { project?: string; layer?: string }): Promise<EvidenceSpatialPoint[]> => {
  const res = await api.get('/digital-eye/spatial-map/', { params });
  const list = unwrap<EvidenceSpatialPoint[]>(res, []);
  return Array.isArray(list) ? list : [];
};

// ==========================================
// 4. DEVICE REPORTS REPOSITORY & FUNCTIONS
// ==========================================


const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Backend ArchivedReport row -> DeviceReportRecord. Every field comes from the
// archived dossier record itself (checksum, real counts, real verdict) —
// nothing is invented client-side.
const mapArchivedNdtReport = (row: any): DeviceReportRecord => {
  const assessed = row.assessed_count ?? 0;
  const passed = row.passed_count ?? 0;
  const testCount = row.test_count ?? 0;
  const summary = assessed === 0
    ? `${testCount} field test record(s) in this dossier; no strength-assessed pulse velocity results, so no strength compliance conclusion is drawn.`
    : `${testCount} test record(s) archived — ${assessed} strength-assessed against the 25 MPa threshold, ${passed} passing. Byte-exact archive sealed with SHA-256 checksum.`;
  return {
    id: String(row.id),
    report_reference: row.report_reference,
    title: row.title,
    device_type: 'PUNDIT',
    project_id: String(row.project ?? ''),
    project_name: row.project_name ?? '—',
    report_type: 'NDT / UPV Statutory Dossier (Archived)',
    standards_cited: ['BS 1881-203:1999', 'ASTM C597'],
    compliance_status: row.compliance_status ?? 'NOT_ASSESSED',
    executive_summary: summary,
    metrics: {
      scans_or_tests_count: testCount,
      ...(assessed > 0 ? { pass_rate_pct: Math.round((passed / assessed) * 1000) / 10 } : {}),
    },
    generated_by: row.generated_by_name || '—',
    certified_engineer: row.generated_by_name || '—',
    stamped_at: row.created_at,
    file_size: formatFileSize(row.file_size_bytes ?? 0),
    download_url: `/reports/archived-reports/${row.id}/download/`,
  };
};

export const getDeviceReports = async (params?: { device_type?: string; project_id?: string; element_id?: string }): Promise<DeviceReportRecord[]> => {
  // PUNDIT's registry is the backend's archived-dossier table: every
  // generated MTL-style NDT report is persisted (checksummed) server-side at
  // /reports/projects/<id>/archived-reports/. Only real archived rows are
  // listed — an empty registry means no report has been generated yet.
  if (params?.device_type && params.device_type.toLowerCase() === 'pundit') {
    if (!params.project_id) return []; // no project selected -> nothing to list
    const res = await api.get(`/reports/projects/${params.project_id}/archived-reports/`, {
      params: { kind: 'ndt' },
    });
    const rows = unwrap<any[]>(res, []);
    return (rows || []).map(mapArchivedNdtReport);
  }
  const res = await api.get('/digital-eye/reports/devices/', { params });
  const list = unwrap<DeviceReportRecord[]>(res, []);
  return Array.isArray(list) ? list : [];
};

export const generateDeviceReport = async (payload: Partial<DeviceReportRecord>): Promise<DeviceReportRecord> => {
  // PUNDIT reports are generated by the backend (MTL-style NDT dossier, real
  // data only) — never fabricated client-side.
  if (payload.device_type && payload.device_type.toLowerCase() === 'pundit') {
    throw new Error('PUNDIT reports are generated by the backend — use downloadNdtReport(projectId).');
  }

  // The backend creates and persists the record; everything shown afterwards
  // comes from the response. Failures surface to the caller — no local
  // fabrication, no fake certified dossier.
  const res = await api.post('/digital-eye/reports/devices/', payload);
  const report = unwrap<DeviceReportRecord | null>(res, null);
  if (!report) {
    throw new Error('Report generation failed — no record was returned.');
  }
  return report;
};

/**
 * Download the official MTL-style NDT report (BS 1881-203 PUNDIT dossier)
 * streamed by GET /reports/projects/<id>/ndt-report/ — real database rows only.
 */
export const downloadNdtReport = async (projectId: string): Promise<string> => {
  const res = await api.get(`/reports/projects/${projectId}/ndt-report/`, {
    responseType: 'blob',
  });
  const blob = new Blob([res as any], { type: 'application/pdf' });
  const filename = `ndt_report_${projectId}.pdf`;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return filename;
};

/**
 * Download an archived dossier — the exact bytes the platform generated and
 * sealed (SHA-256 checksummed) at generation time — via
 * GET /reports/archived-reports/<id>/download/.
 */
export const downloadArchivedReport = async (reportId: string, reportReference?: string): Promise<string> => {
  const res = await api.get(`/reports/archived-reports/${reportId}/download/`, {
    responseType: 'blob',
  });
  const blob = new Blob([res as any], { type: 'application/pdf' });
  const safeRef = (reportReference || reportId).replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_');
  const filename = `ndt_report_${safeRef}.pdf`;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return filename;
};

/**
 * Open an archived dossier's exact sealed bytes in the browser's PDF viewer
 * (new tab). If a popup blocker intervenes, fall back to a file download so
 * the real document still reaches the user — never a fabricated re-render.
 */
export const openArchivedReport = async (reportId: string): Promise<void> => {
  const res = await api.get(`/reports/archived-reports/${reportId}/download/`, {
    responseType: 'blob',
  });
  const blob = new Blob([res as any], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const opened = window.open(url, '_blank');
  if (!opened) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `ndt_report_${reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  // Give the viewer time to load before releasing the blob handle.
  window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
};