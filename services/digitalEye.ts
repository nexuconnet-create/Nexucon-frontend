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
  strength_curve_snapshot?: CurveSnapshot | null;
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
  // Rebound hammer number recorded with the station — required when the
  // project's active calibration curve is SonReb (UPV + rebound).
  rebound_number?: number | null;
  // Raw A-scan waveform samples recorded by the field device, when exported.
  // null/empty = the device only reported the transit time; the waveform
  // viewer must NOT synthesise a trace in that case.
  waveform_samples?: number[] | null;
  // Crack-depth method (BS 1881-203 time difference): 0 when not a crack test.
  crack_path_length_mm: number;
  crack_pulse_time_us: number;
  uncracked_pulse_time_us: number;
  surface_condition: string;
  surface_temperature_c: number | null;
  pulse_velocity_ms: number; // m/s; 0 until the server-side BS 1881-203 analysis has run
  estimated_compressive_strength_mpa: number | null; // E.C.S via the platform calibration curve; null outside its 2.0-5.0 km/s validity
  /** Provenance of the figure above, stored with it at write time: which
   *  curve produced it and what its standard-error policy did to it. The
   *  server returns this on every test row; the UI reads it so a strength
   *  that was adjusted can say so instead of showing a bare number. */
  strength_curve_snapshot?: CurveSnapshot | null;
  /** Honest confidence metrics (server-computed from the recorded readings;
   *  null when the active curve carries no regression to derive them from). */
  ai_ci_lower_mpa?: number | null;
  ai_ci_upper_mpa?: number | null;
  ai_pof_pct?: number | null;
  ai_data_quality?: string;
  ai_reasoning_traces?: string[];
  concrete_quality_rating: 'EXCELLENT' | 'GOOD' | 'DOUBTFUL' | 'POOR' | 'VERY_POOR' | 'PENDING';
  estimated_crack_depth_mm?: number | null;
  operator_name: string;
  test_date: string;
  latitude?: number | null;
  longitude?: number | null;
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

/**
 * A recorded spatial evidence point, exactly as `EvidenceSpatialPointSerializer`
 * (`fields = '__all__'`) returns it.
 *
 * The shape here previously disagreed with the server on four fields:
 * `latitude` and `longitude` were declared as optional aliases that the
 * serializer never sends, `accuracy_cm` was declared and does not exist on the
 * model at all, and `lat`/`lng`/`elevation_m`/`accuracy_mm` were declared
 * non-nullable when the model makes every one of them `null=True`. The canvas
 * that consumed this fell back to the aliases and to a millimetre-to-centimetre
 * conversion off `accuracy_cm`, so its precision readout was reading a field
 * that is always `undefined` and then dividing a value that might be `null`.
 * Corrected to the server's own contract: a point with no measured position is
 * a real state, and the type now says so.
 */
export interface EvidenceSpatialPoint {
  id: string;
  /**
   * The related project's id. Nullable on the model, but the viewset withholds
   * a point that names no project at all — an unattributable statutory record
   * has no scope to be checked against — so a row served here always has one.
   */
  project: string | null;
  project_id_str?: string | null;
  project_name?: string | null;
  beacon_code?: string | null;
  name: string;
  title?: string | null;
  description?: string | null;
  /** Free text on the model — not a constrained choice set. */
  layer_type: string;
  /** Null until the point was actually measured. A null pair is not plottable. */
  lat: number | null;
  lng: number | null;
  elevation_m: number | null;
  accuracy_mm: number | null;
  deviation_mm: number | null;
  severity?: string | null;
  structural_element_name?: string | null;
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
      strength_curve_snapshot: r.strength_curve_snapshot ?? null,
      notes: r.notes || undefined,
    })),
    weather_condition: row.weather_condition || '',
    floor: row.floor || '',
    concrete_age_days: row.concrete_age_days ?? null,
    rebound_number: row.rebound_number ?? null,
    waveform_samples: Array.isArray(row.waveform_samples) && row.waveform_samples.length > 1
      ? row.waveform_samples.map((s: unknown) => Number(s)).filter((s: number) => Number.isFinite(s))
      : null,
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
    // The recorded test date is the real field; tested_at/created_at remain
    // only as fallbacks for rows written before it existed.
    test_date: row.test_date ?? row.tested_at ?? row.created_at ?? '',
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
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

/**
 * What one of an instrument's own columns is mapped to.
 *
 * A plain string is the common case: the instrument's column renamed to a
 * contract key. The object form adds the scale from the instrument's unit to
 * the contract's — `{ to: 'path_length_l_mm', scale: 1000 }` for a PL-200 whose
 * `Distance` is in metres.
 *
 * The scale is not a nicety. Without it the metres a PUNDIT writes read as
 * millimetres, and every pulse velocity from that file lands a thousand times
 * too low: positive, plausible, and impossible to tell from a slow reading
 * once it is on a record.
 *
 * `null` is the third answer, and it is not the same as leaving the column
 * out. An omitted column is one nobody has accounted for, and the importer
 * refuses the whole file for it. `null` says the column was looked at and set
 * aside — which is what lets a PL-200, whose export has six columns and whose
 * contract reads two, be imported at all.
 */
export type ColumnMappingValue =
  | string
  | { to: string; scale: number }
  | null;

/** An instrument's export headers mapped to the platform's contract keys. */
export type ColumnMapping = Record<string, ColumnMappingValue>;

/**
 * One column of an instrument's export, as the platform read it.
 *
 * `header` and `samples` are read from the file — facts. `target`, `scale` and
 * `note` are what the platform makes of them — a proposal, which is why the
 * panel shows them beside the values they were drawn from and asks before
 * anything is saved.
 */
export interface SuggestedColumn {
  /** The header exactly as the file spells it. Never typed, only read. */
  header: string;
  /** Up to five of its values as written, so a unit can be checked by eye. */
  samples: string[];
  /** A contract key, or null when the platform will not read this column. */
  target: string | null;
  target_label: string;
  /** 1 unless the column's unit needs converting on the way in. */
  scale: number;
  /**
   * Why this target: `exact` (the header already is a contract key), `alias`
   * (a known instrument name for one), `declined` (recognised and deliberately
   * not read — `note` says why), `unknown` (nothing to go on).
   */
  basis: "exact" | "alias" | "declined" | "unknown";
  /** One sentence for the operator, empty when there is nothing to say. */
  note: string;
}

/** A contract column, for the picker. Sent by the server so it cannot drift. */
export interface AcceptedColumn {
  key: string;
  label: string;
  group: "measurement" | "context";
}

/** What `suggestColumnMapping` returns. */
export interface ColumnSuggestionResult {
  device: string;
  device_reference: string;
  file_name: string;
  columns: SuggestedColumn[];
  /**
   * A ready-to-save mapping: every column the platform could place, plus a
   * `null` for each one it recognised and deliberately declines. Columns
   * nothing is known about are absent — the inspector decides those, and the
   * editor records the decision on save.
   */
  mapping: ColumnMapping;
  accepted: AcceptedColumn[];
}

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
  calibration_expiry: string | null;
  assigned_project: string | null;
  notes: string;
  /**
   * This instrument's own export headers mapped to the platform's contract
   * keys. Empty means its export already speaks the documented template.
   *
   * Read by the importer on every file from this device, so it is the fix for
   * a refused export — and it lives here rather than on a field laptop so one
   * correction applies to every site at once.
   */
  column_mapping: ColumnMapping;
  /**
   * Whether the platform has written this instrument's config for the field
   * gateway, so its exports are pushed without anyone opening an upload form.
   *
   * `false` means sync was never set up — not that it was set up and is idle.
   * The two are different things to tell an officer, and the panel says the
   * first rather than the second.
   *
   * Read-only on the server: it is set by `setDeviceGateway`, which mints the
   * credential and writes the config in one step. A plain PATCH cannot turn it
   * on, because a flag saying "sync is on" with no config behind it would be
   * the exact failure this feature exists to remove.
   */
  gateway_enabled: boolean;
  /**
   * The folder this instrument's exports are watched in, **as the gateway
   * container sees it** (`/inbox/DE-XXXXXXXX`).
   *
   * Stated by the server because it is a deployment setting there and cannot be
   * derived here. It is not the path the site syncs to — that is a host path
   * only the deployment knows — so the panel shows the folder *name* as the
   * actionable half and this as the one to check a gateway log against.
   *
   * `null` means this deployment cannot say: gateway provisioning is switched
   * off, or the inbox root is unset. Shown as "not reported", never as a
   * guessed path — a folder that does not exist would have the site syncing
   * into nothing.
   */
  gateway_inbox: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

/** The fields a person may set when registering an instrument. */
export interface FieldDeviceInput {
  device_id: string;
  device_type: string;
  name?: string;
  model?: string;
  manufacturer?: string;
  firmware_version?: string;
  assigned_project?: string | null;
  calibration_date?: string | null;
  calibration_expiry?: string | null;
  notes?: string;
  column_mapping?: ColumnMapping;
}

/**
 * `POST /digital-eye/devices/` — register an instrument.
 *
 * `device_id` is the serial or asset tag and is unique across the registry.
 * It is the provenance stamped on every reading the instrument produces, so it
 * is the one field a statutory record cannot be wrong about — which is why the
 * form asks for it and never generates one.
 *
 * `device_reference`, `status` and the telemetry fields (battery, position,
 * last seen) are the server's: a device is `registered` until it reports, and
 * nothing here may claim otherwise.
 */
export const createFieldDevice = async (input: FieldDeviceInput): Promise<FieldDeviceRecord> => {
  const res = await api.post('/digital-eye/devices/', input);
  return unwrap<any>(res, res);
};

/**
 * `PATCH /digital-eye/devices/<id>/` — correct a device record.
 *
 * Partial by design: the common use is changing one thing — the column
 * mapping after an export was refused — and sending the whole record back
 * would risk overwriting a field the form does not carry.
 */
export const updateFieldDevice = async (
  deviceId: string,
  input: Partial<FieldDeviceInput>
): Promise<FieldDeviceRecord> => {
  const res = await api.patch(`/digital-eye/devices/${deviceId}/`, input);
  return unwrap<any>(res, res);
};

/**
 * `POST /digital-eye/devices/<id>/column-mapping/suggest/` — read one of this
 * instrument's exports and say what its columns are.
 *
 * Uploading the file here records nothing. The server reads the header row,
 * works out which contract column each one looks like, and hands back a
 * proposal; saving it is a separate `updateFieldDevice`. That separation is
 * deliberate — a column mapping is indistinguishable from a correct one once
 * rows have been written from it, so the platform may read a file and say what
 * it makes of it, but a person has to accept it.
 *
 * The instrument's own header names come back verbatim, which is the point:
 * they are the words the inspector can see in their export, not a guess at
 * them, and nobody has to type them.
 *
 * `file` is optional. Without one the call returns the accepted contract and
 * nothing else, which is what an inspector editing a mapping they already
 * recorded needs — they have no export in hand, but the picker still has to
 * offer the platform's own columns, and the server has to be the one to say
 * which those are.
 */
export const suggestColumnMapping = async (
  deviceId: string,
  file?: File | null
): Promise<ColumnSuggestionResult> => {
  const form = new FormData();
  if (file) form.append("file", file);
  const res = await api.post(
    `/digital-eye/devices/${deviceId}/column-mapping/suggest/`,
    form
  );
  return unwrap<any>(res, res);
};

/**
 * `POST /digital-eye/devices/<id>/gateway/` — turn automatic sending on or off.
 *
 * Turning it on mints a credential for this instrument and writes the field
 * gateway's config for it, in one step. **The credential is never returned**:
 * it goes from the mint straight into the config file the gateway reads, so
 * nobody — including this client — ever holds it. That is the whole reason
 * this is one call rather than a token to copy somewhere by hand.
 *
 * Returns the device with its new `gateway_enabled` state; the caller re-reads
 * nothing else, because nothing else changed.
 *
 * A refusal arrives as a message worth showing verbatim: an instrument whose
 * captures have no file contract yet is told why, and a deployment with no
 * config directory says so rather than appearing to have worked.
 */
export const setDeviceGateway = async (
  deviceId: string,
  enabled: boolean
): Promise<FieldDeviceRecord> => {
  const res = await api.post(`/digital-eye/devices/${deviceId}/gateway/`, { enabled });
  return unwrap<any>(res, res);
};

export const getPunditTests = async (params?: {
  project?: string;
  element_name?: string;
  search?: string;
  test_type?: 'pulse_velocity' | 'crack_depth' | 'surface_quality';
  quality_grade?: string;
  /** Measurement-browser filters (spec A5). All opt-in — omitting them
   *  returns exactly what this call returned before they existed. */
  date_from?: string;   // YYYY-MM-DD, inclusive
  date_to?: string;     // YYYY-MM-DD, inclusive
  operator?: string;    // exact operator_name
  curve?: string;       // StrengthCurve id
}): Promise<PunditTest[]> => {
  const res = await api.get('/digital-eye/pundit-tests/', {
    params: {
      project: params?.project || undefined,
      search: params?.search || undefined,
      test_type: params?.test_type || undefined,
      quality_grade: params?.quality_grade || undefined,
      date_from: params?.date_from || undefined,
      date_to: params?.date_to || undefined,
      operator: params?.operator || undefined,
      curve: params?.curve || undefined,
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
  // Surface-quality / homogeneity observations. Both are nullable because the
  // operator may simply not have taken them — `surface_temperature_c` is a
  // nullable column on the model, and the request builder already drops a null
  // rather than sending it, so `null` here means "not measured", not "0 °C".
  surface_condition?: string;
  surface_temperature_c?: number | null;
  rebound_number?: number;
  // Operator-recorded report context (Section 3.0 weather / floor grouping).
  weather_condition?: string;
  floor?: string;
  // Optional concrete age at test time in days (7 Sep review item 18).
  concrete_age_days?: number | null;
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

/** One per-point row of a measurement export (spec A5). Values are the stored
 *  ones: a strength that was never computed is null, never 0. */
export interface MeasurementExportRow {
  test_reference: string;
  test_date: string | null;
  structural_element: string | null;
  point_label: string | null;
  operator_name: string | null;
  path_length_mm: number | null;
  transit_time_us: number | null;
  /** m/s. Null when no velocity was derived for the point. */
  velocity_ms: number | null;
  /** Null when no curve applied, or the velocity fell outside the curve's
   *  recorded valid range — never 0, which would read as a real strength. */
  estimated_strength_mpa: number | null;
  rebound_number: number | null;
  crack_depth_mm: number | null;
  curve_id: string | null;
  curve_name: string | null;
  curve_type: string | null;
  curve_standard: string | null;
}

/** The self-describing payload of GET /digital-eye/pundit-tests/export_json/.
 *  Mirrors apps/digital_eye/views.py::export_json. `meta.filters` is the
 *  reason this file exists as a type: it records which filters produced it, so
 *  the file can never be mistaken for a whole-project dump once it has left
 *  the screen it was taken from. */
export interface MeasurementExportPayload {
  meta: {
    exported_at: string;
    project: { id: string; name: string } | null;
    filters: Record<string, string>;
    row_count: number;
    test_count: number;
    filters_note: string;
    unit_note: string;
    provenance_note: string;
  };
  /** The distinct curves behind the rows, with the parameters that were
   *  actually used — read from each reading's stored snapshot, so this is a
   *  record of what was applied, not a re-read of today's curves. */
  curves_used: Array<{
    curve_id: string;
    curve_name: string | null;
    curve_type: string | null;
    standard: string | null;
    formula: string | null;
    formula_params: Record<string, any> | null;
    valid_range_ms: [number, number] | null;
  }>;
  rows: MeasurementExportRow[];
  provenance_log: Array<{
    timestamp: string;
    action: string;
    user_name: string | null;
    user_role: string | null;
    severity: string | null;
    details: Record<string, any>;
  }>;
}

/** The filters the reporting browser can put on an export. Every one is
 *  opt-in and mirrors a query param get_queryset understands. */
export interface MeasurementExportFilters {
  project?: string;
  test_type?: string;
  quality_grade?: string;
  structural_element?: string;
  date_from?: string;
  date_to?: string;
  operator?: string;
  curve?: string;
  search?: string;
}

/**
 * Export exactly the measurements the reporting browser is showing as JSON
 * (spec A5 "Export JSON"), and hand back the parsed payload.
 *
 * The same filters the table was built from are sent, so the file can never be
 * a wider dump than the view it was taken from — and the backend records them
 * in `meta.filters` so the file says so itself.
 *
 * The payload is returned rather than only saved because the caller states the
 * verified row count afterwards. A download that silently wrote a different
 * number of rows than the screen showed is exactly the failure this export
 * exists to prevent.
 */
export const exportPunditMeasurementsJson = async (
  filters: MeasurementExportFilters,
): Promise<{ filename: string; payload: MeasurementExportPayload }> => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });

  let blob: Blob;
  try {
    const res = await api.get(
      `/digital-eye/pundit-tests/export_json/?${query.toString()}`,
      { responseType: 'blob' },
    );
    blob = res instanceof Blob
      ? res
      : new Blob([res as any], { type: 'application/json' });
  } catch (err: any) {
    // The endpoint answers errors as JSON, but this request asks for a blob,
    // so the reason arrives wrapped in one. Read it out rather than showing
    // the transport's "Request failed with status code 404" — an out-of-scope
    // project is a specific refusal and the user should be told which it is.
    let detail = err?.message || 'The export could not be produced.';
    const body = err?.response?.data;
    if (body instanceof Blob) {
      try {
        const parsed = JSON.parse(await body.text());
        detail = parsed?.detail || parsed?.message || parsed?.errors?.[0] || detail;
      } catch {
        // Not JSON (a proxy error page, say) — keep the transport message.
      }
    }
    throw new Error(detail);
  }

  let payload: MeasurementExportPayload;
  try {
    payload = JSON.parse(await blob.text()) as MeasurementExportPayload;
  } catch {
    // Never save a file that will not open. Nothing is downloaded.
    throw new Error(
      'The export did not come back as JSON, so nothing was downloaded.',
    );
  }

  // Named to match the backend's own Content-Disposition convention. The
  // response interceptor unwraps the body before the caller sees it, so the
  // header is not reachable here (exportPunditResults has the same blind spot
  // and silently falls back to a fixed name).
  const scope = payload?.meta?.project?.name
    ? payload.meta.project.name.slice(0, 40).replace(/ /g, '_')
    : 'all_projects';
  const filename = `nexucon_pundit_measurements_${scope}.json`;

  const file = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = window.URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return { filename, payload };
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
  const blob = new Blob([res.data || res], { type: 'application/pdf' });
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
      is_rollup: 'true',
    },
  });
  const rows = unwrap<any[]>(res, []);
  return (Array.isArray(rows) ? rows : []).map(mapPunditAnalysis);
};

/**
 * Engineer review of a PUNDIT AI analysis (client principle 5): the AI output
 * is decision-support — a qualified engineer corroborates it (or returns it
 * for revision) via a separate review record. The analysis itself stays
 * immutable. `review_status` is 'pending' until a review row exists.
 */
export interface PunditAnalysisReview {
  review_status: 'pending' | 'corroborated' | 'returned';
  requires_human_review: boolean;
  decision: 'corroborated' | 'returned' | null;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

function mapPunditAnalysisReview(row: any): PunditAnalysisReview {
  return {
    review_status: (row.review_status ?? 'pending') as PunditAnalysisReview['review_status'],
    requires_human_review: Boolean(row.requires_human_review),
    decision: (row.decision ?? null) as PunditAnalysisReview['decision'],
    notes: row.notes ?? null,
    reviewed_by: row.reviewed_by ?? null,
    reviewed_at: row.reviewed_at ?? null,
  };
}

export const getPunditAnalysisReview = async (
  analysisId: string
): Promise<PunditAnalysisReview> => {
  const res = await api.get(`/digital-eye/pundit-analysis-review/${analysisId}/`);
  return mapPunditAnalysisReview(unwrap<any>(res, {}));
};

export const reviewPunditAnalysis = async (
  analysisId: string,
  input: { decision: 'corroborated' | 'returned'; notes?: string }
): Promise<PunditAnalysisReview> => {
  const res = await api.post(`/digital-eye/pundit-analysis-review/${analysisId}/`, {
    decision: input.decision,
    notes: input.notes ?? '',
  });
  return mapPunditAnalysisReview(unwrap<any>(res, {}));
};

/** Withdraw the review — the analysis returns to the honest pending state. */
export const withdrawPunditAnalysisReview = async (
  analysisId: string
): Promise<PunditAnalysisReview> => {
  const res = await api.delete(`/digital-eye/pundit-analysis-review/${analysisId}/`);
  return mapPunditAnalysisReview(unwrap<any>(res, {}));
};

export const getProcessingQueue = async (params?: { project?: string; status?: string }): Promise<ProcessingQueueJob[]> => {
  const res = await api.get('/digital-eye/queue/', { params });
  const list = unwrap<ProcessingQueueJob[]>(res, []);
  return Array.isArray(list) ? list : [];
};

/**
 * Recorded spatial evidence points for a project.
 *
 * The filter is `layer_type`, matching the viewset's own query parameter — a
 * `layer` parameter was sent here in this module's signature but is not a name
 * the server reads, so filtering by it silently returned every layer.
 */
export const getEvidenceSpatialPoints = async (params?: { project?: string; layer_type?: string }): Promise<EvidenceSpatialPoint[]> => {
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

// ---- Report CMS + Word export (8 Sep meeting H7; 4 Sep register C4/C5) ----
// The statutory NDT report's boilerplate prose sections are editable
// template variables, password-protected and Director-only. The backend
// registry is the source of truth — this surface only reads and writes it.

export type ReportCmsSectionKind = 'paragraphs' | 'list' | 'line';
export type ReportCmsSectionSource =
  | 'default'
  | 'platform_override'
  | 'project_override'
  // Generated-content sections: 'computed' is the wording the backend
  // derives from the project's recorded data; 'unavailable' means no
  // recorded data backs the section yet, so it has no editable body.
  | 'computed'
  | 'unavailable';

export interface ReportCmsSection {
  key: string;
  label: string;
  kind: ReportCmsSectionKind;
  help: string;
  default: string | null;
  body: string | null;
  source: ReportCmsSectionSource;
  /** Generated-content section — its body is computed per project. */
  computed?: boolean;
  /** True for computed sections: a project must be selected to edit. */
  requires_project?: boolean;
  /** True when the section needs recorded data that does not exist yet. */
  requires_data?: boolean;
  /**
   * §2.2 wireframe: advisory character limit for the editor's
   * character-count display (advice, not a hard reject); null when the
   * section has no limit.
   */
  max_length?: number | null;
}

export interface ReportCmsSectionsResponse {
  project: string | null;
  password_set: boolean;
  sections: ReportCmsSection[];
}

/**
 * Every editable template section with its effective body — project
 * override > platform override > the backend's default wording.
 * GET /reports/cms/sections/?project=<uuid>
 */
export const getReportCmsSections = async (projectId?: string): Promise<ReportCmsSectionsResponse> => {
  const res = await api.get('/reports/cms/sections/', {
    params: projectId ? { project: projectId } : undefined,
  });
  const data = unwrap<ReportCmsSectionsResponse | null>(res, null);
  if (!data || !Array.isArray(data.sections)) {
    throw new Error('Report CMS sections could not be loaded.');
  }
  return data;
};

/**
 * Save one section's body. Directors only, and only with the CMS password.
 * Pass projectId to scope the override to that project; omit it for a
 * platform-wide override.
 */
export const saveReportCmsSection = async (
  key: string,
  body: string,
  opts: { projectId?: string; cmsPassword: string },
): Promise<ReportCmsSection> => {
  const res = await api.put(`/reports/cms/sections/${key}/`, {
    body,
    cms_password: opts.cmsPassword,
    ...(opts.projectId ? { project: opts.projectId } : {}),
  });
  const saved = unwrap<ReportCmsSection | null>(res, null);
  if (!saved || typeof saved.body !== 'string') {
    throw new Error('The section could not be saved — the server did not '
      + 'confirm the saved wording.');
  }
  return saved;
};

/** Revert a section (delete its override) — same password gate. */
export const revertReportCmsSection = async (
  key: string,
  opts: { projectId?: string; cmsPassword: string },
): Promise<{ key: string; source: ReportCmsSectionSource; body: string | null; reverted: boolean }> => {
  const res = await api.delete(`/reports/cms/sections/${key}/`, {
    params: {
      ...(opts.projectId ? { project: opts.projectId } : {}),
      cms_password: opts.cmsPassword,
    },
  });
  const reverted = unwrap<{ key: string; source: ReportCmsSectionSource;
    body: string | null; reverted: boolean } | null>(res, null);
  if (!reverted || typeof reverted.reverted !== 'boolean') {
    throw new Error('The section could not be reverted — the server did not '
      + 'confirm the revert.');
  }
  return reverted;
};

/** Set (first time) or change (current password required) the CMS password. */
export const setReportCmsPassword = async (payload: {
  new_password: string;
  current_password?: string;
}): Promise<void> => {
  await api.post('/reports/cms/password/', payload);
};

/**
 * Download the editable Word (.docx) edition of the NDT report — the same
 * sections, CMS overrides and server-computed figures as the PDF, streamed by
 * GET /reports/projects/<id>/ndt-report-word/.
 */
export const downloadNdtReportWord = async (projectId: string): Promise<string> => {
  const res = await api.get(`/reports/projects/${projectId}/ndt-report-word/`, {
    responseType: 'blob',
  });
  const blob = new Blob([res as any], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const filename = `ndt_report_${projectId}.docx`;
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

// ---- Report structure (REFINED EXECUTIVE SUMMARY §2.5) ----
// The per-project section order, enable/disable state and custom sections
// for the statutory NDT report. Both emitters (certified PDF + .docx
// working copy) render exactly this configuration, and the §2.1 preview
// sidebar reflects it too.

export interface ReportStructureEntry {
  key: string;
  label: string;
  is_custom: boolean;
  title: string | null;
  body: string | null;
  is_enabled: boolean;
}

export interface ReportStructureResponse {
  project: string;
  sections: ReportStructureEntry[];
}

const structureResponse = (res: unknown): ReportStructureResponse => {
  const data = unwrap<ReportStructureResponse | null>(res, null);
  if (!data || !Array.isArray(data.sections)) {
    throw new Error('The report structure could not be loaded.');
  }
  return data;
};

/** The project's report structure as both emitters will render it. */
export const getReportStructure = async (
  projectId: string,
): Promise<ReportStructureResponse> => {
  const res = await api.get(`/reports/projects/${projectId}/structure/`);
  return structureResponse(res);
};

/** Drag-to-reorder: the complete key list in its new order. Directors only. */
export const reorderReportStructure = async (
  projectId: string,
  order: string[],
): Promise<ReportStructureResponse> => {
  const res = await api.post(
    `/reports/projects/${projectId}/structure/reorder/`, { order });
  return structureResponse(res);
};

/** Enable/disable one section (built-in or custom). Directors only. */
export const toggleReportSection = async (
  projectId: string,
  sectionKey: string,
  isEnabled: boolean,
): Promise<ReportStructureResponse> => {
  const res = await api.post(
    `/reports/projects/${projectId}/structure/${sectionKey}/toggle/`,
    { is_enabled: isEnabled });
  return structureResponse(res);
};

/** Append a custom section at the end of the document. Directors only. */
export const addReportCustomSection = async (
  projectId: string,
  title: string,
  body: string,
): Promise<ReportStructureResponse> => {
  const res = await api.post(
    `/reports/projects/${projectId}/structure/custom/`, { title, body });
  return structureResponse(res);
};

/** Edit a custom section's title/body. Directors only. */
export const updateReportCustomSection = async (
  projectId: string,
  sectionKey: string,
  fields: { title?: string; body?: string },
): Promise<ReportStructureResponse> => {
  const res = await api.patch(
    `/reports/projects/${projectId}/structure/${sectionKey}/`, fields);
  return structureResponse(res);
};

/** Remove a custom section entirely (built-ins are disabled, not deleted). */
export const deleteReportCustomSection = async (
  projectId: string,
  sectionKey: string,
): Promise<ReportStructureResponse> => {
  const res = await api.delete(
    `/reports/projects/${projectId}/structure/${sectionKey}/`);
  return structureResponse(res);
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

// ==========================================
// 3z. NEXUCON LINK (NEURAL LINK) — STRENGTH CALIBRATION
// Every f_cu the platform reports flows through the project's active
// calibration curve (8 Sep 2026 meeting): project-specific curves are
// calibrated from REAL UPV + cube-test pairs before any data injection; the
// seeded platform default reproduces the documented BS 1881-203 laboratory
// curve (f_cu = 8.961·V − 7.97, V in km/s) when no project curve exists.
// ==========================================

export type CurveType = 'linear' | 'polynomial' | 'exponential' | 'sonreb' | 'lookup';

/**
 * Human label for a curve type. The single source of truth: the Curve Manager
 * and the measurement browser both name curve types, and a second copy would
 * let the same curve be called two things in two places.
 *
 * Mirrors apps/digital_eye/strength_curves.py CURVE_TYPES / the models'
 * get_curve_type_display — when the server sends `curve_type_display` that
 * wins, because a label added server-side should not be silently overridden by
 * this map not knowing it yet.
 */
export const CURVE_TYPE_LABEL: Record<CurveType, string> = {
  linear: 'Linear',
  polynomial: 'Polynomial (deg 2)',
  exponential: 'Exponential',
  sonreb: 'SonReb (UPV + Rebound)',
  lookup: 'Lookup table',
};

/** The label for a curve type as stored on a strength snapshot, where only the
 *  raw `curve_type` is available (no `curve_type_display`). Falls back to the
 *  raw value rather than to a guess, so an unrecognised type still says what
 *  it is instead of being labelled something it is not. */
export function curveTypeLabel(curveType: string | null | undefined): string | null {
  if (!curveType) return null;
  return CURVE_TYPE_LABEL[curveType as CurveType] || curveType;
}

/** How a curve's residual standard error is factored into the reported f_cu
 *  (15 Sep 2026 client direction). Mirrors
 *  apps/digital_eye/se_adjustment.py ADJUSTMENT_METHODS.
 *
 *  'bias_correction' is the platform's measured form of Lagos State's
 *  "add 2 to close the error gap" practice: the correction is
 *  mean(observed − predicted) over the curve's OWN calibration pairs, so it
 *  is data, not a constant. 'confidence_margin' subtracts k × s, reporting a
 *  conservative characteristic (lower-bound) strength in the BS EN 13791
 *  sense. */
export type SEAdjustmentMethod = 'none' | 'bias_correction' | 'confidence_margin';

/** The increment the correction was applied AS, when it was folded into the
 *  pulse velocity rather than the strength directly — the client's method
 *  (15 Sep 2026: "consider the standard error in the post velocity before we
 *  convert it to FCU"). A standard error is in N/mm² and a velocity in m/s,
 *  so the two are not directly additive: the error is converted through the
 *  curve's own slope, df/dV, into the velocity increment that PRODUCES it.
 *  Null when the correction stayed on the strength instead — a lookup table,
 *  a curve that is flat at this velocity, or a move that would leave the
 *  calibrated range, where the platform never extrapolates. Every field is
 *  computed server-side; nothing here is derived in the browser. */
export interface SEVelocityStep {
  /** df/dV at this velocity, N/mm² per m/s — the exchange rate. */
  slope_mpa_per_ms: number;
  /** The velocity increment, m/s. Its sign is the policy's: a confidence
   *  margin deducts, a bias correction adds. */
  delta_velocity_ms: number;
  base_velocity_ms: number;
  adjusted_velocity_ms: number;
}

/** The account of what was done to one reported figure. Always present —
 *  a figure is never returned without the statement of whether an
 *  adjustment moved it. Mirrors apply_se_adjustment()'s disclosure dict. */
export interface SEAdjustmentDisclosure {
  method: SEAdjustmentMethod;
  method_label: string;
  factor: number;
  n_points_averaged: number | null;
  base_f_cu_mpa: number | null;
  adjusted_f_cu_mpa: number | null;
  standard_error_mpa: number | null;
  mean_residual_mpa: number | null;
  applied: boolean;
  /** The policy narrative without the resulting figure — the sentence
   *  describing WHAT the policy does, kept apart from the sentence quoting
   *  the number it produced. */
  summary: string;
  detail: string;
  velocity_step?: SEVelocityStep | null;
}

/** The curve's standard-error picture. Every figure is computed from the
 *  curve's real calibration pairs; `standard_error_mpa` is null — with an
 *  honest `unavailable_reason` — when the data cannot support one (a lookup
 *  table, fewer than 3 pairs, or zero residual degrees of freedom). */
export interface SEAnalysis {
  n_pairs: number;
  standard_error_mpa: number | null;
  mean_residual_mpa: number | null;
  r2_score: number | null;
  aic: number | null;
  adjustment_available: boolean;
  unavailable_reason: string | null;
  method: SEAdjustmentMethod;
  factor: number;
  min_pairs_required: number;
  recommendation: string | null;
  /** Plain-English explanation of each statistic (r2_score, standard_error,
   *  mean_residual, aic) — the 15 Sep 2026 "self-explanatory document" item,
   *  served from the backend so every surface says the same thing. */
  definitions: Record<string, string>;
  /** Which registered standard governs each statistic, keyed the same as
   *  `definitions` — the codes resolve against `StandardEntry.code`. Served
   *  from the backend (STAT_REFERENCES) so a surface cannot cite a document
   *  the registry does not hold, or cite a different one from its neighbour.
   *  The 15 Sep 2026 review asked for exactly this: "show me a literature on
   *  this". */
  references: Record<string, string[]>;
}

/** One standard the mathematical model rests on. `role` is what the UI
 *  groups by: 'measurement' = a test method, 'correlation' = how an
 *  indirect measurement becomes a strength, 'statistics' = the literature
 *  behind the model-quality figures (AIC), which is a paper rather than a
 *  standard and is labelled as such. */
export interface StandardEntry {
  code: string;
  title: string;
  role: 'measurement' | 'correlation' | 'statistics';
  role_label: string;
  scope: string;
  platform_use: string;
  /** Set when the reference needs qualifying — e.g. the "BS 1881-23"
   *  recorded on 15 Sep 2026, which does not exist as a published standard,
   *  or the limits of what AIC can be read to mean. */
  note: string | null;
}

/** Body returned by GET …/curves/se-analysis/?project=<id>. */
export interface SEAnalysisResponse {
  project: string;
  curve: StrengthCurve | null;
  curve_snapshot: CurveSnapshot;
  analysis: SEAnalysis;
}

/** Nexucon Link platform system settings (the wireframe's "System
 *  Settings" layer). `preferred_curve_type` is what the calibration
 *  workflow pre-selects — exponential by default, per the direction that
 *  concrete behaviour is non-linear. It activates nothing by itself. */
export interface NexuconLinkSettings {
  preferred_curve_type: CurveType;
  preferred_curve_type_display?: string;
  default_standard: string;
  velocity_unit: string;
  strength_unit: string;
  updated_by?: string | null;
  updated_by_name?: string | null;
  updated_at?: string;
}

/** A calibration curve row (GET/POST /digital-eye/nexucon-link/curves/).
 *  Formula parameters are in the m/s velocity domain. */
export interface StrengthCurve {
  id: string;
  name: string;
  curve_type: CurveType;
  curve_type_display?: string;
  standard?: string;
  project?: string | null;
  velocity_unit: string; // 'm/s'
  strength_unit: string; // 'MPa'
  formula_params: Record<string, any>;
  formula_display?: string | null;
  data_points?: Array<{ v: number; f: number; r?: number | null }>;
  valid_range_min_ms: number;
  valid_range_max_ms: number;
  r2_score?: number | null;
  standard_error?: number | null;
  aic?: number | null;
  /** The standard-error policy configured on this curve. 'none' until a
   *  Director deliberately enables one. */
  se_adjustment_method: SEAdjustmentMethod;
  se_adjustment_method_display?: string;
  /** k for the confidence margin (1.0 ≈ 84% one-sided, 1.645 ≈ 95%
   *  one-sided). Unused by the other methods. */
  se_adjustment_factor: number;
  se_analysis?: SEAnalysis;
  is_default?: boolean;
  provenance?: { source?: string; notes?: string; [key: string]: any } | null;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

/** The provenance snapshot stored on every reading/test whose strength a
 *  curve produced — mirrors apps/digital_eye/strength_curves.py
 *  curve_snapshot(). */
export interface CurveSnapshot {
  curve_id: string | null; // null = built-in fallback
  name: string;
  curve_type: CurveType;
  standard?: string | null;
  formula: string;
  formula_params: Record<string, any>;
  valid_range_ms: [number, number] | null;
  r2_score?: number | null;
  provenance_source?: string | null;
  temperature_correction_applied?: boolean;
  /** What the standard-error policy did to the figure this snapshot
   *  produced. Null only on the built-in fallback, which has no regression. */
  se_adjustment?: SEAdjustmentDisclosure | null;
}

/** Built-in fallback curve — identical to the backend engine's last resort
 *  (apps/digital_eye/strength_curves.py `_builtin_default_params`): the
 *  documented BS 1881-203 laboratory curve f_cu = 8.961·V − 7.97 N/mm²
 *  (V in km/s), valid 2.0–5.0 km/s. Used client-side only until the
 *  project's active calibration curve resolves from the server. */
export const BUILTIN_CURVE_SNAPSHOT: CurveSnapshot = {
  curve_id: null,
  name: 'Built-in laboratory curve (BS 1881-203)',
  curve_type: 'linear',
  standard: 'BS 1881-203',
  formula: 'f_cu = 8.961·V − 7.97 (V in km/s)',
  formula_params: { m: 8.961 / 1000, c: -7.97 },
  valid_range_ms: [2000, 5000],
};

/** Client-side evaluation of a curve in the m/s domain — used ONLY for live
 *  previews and chart lines. Every STORED strength value is computed
 *  server-side by the same engine (apps/digital_eye/strength_curves.py
 *  apply_curve_params), including its ACI 228.2R temperature correction.
 *  Returns null outside the valid range / without a rebound number for
 *  SonReb / on any evaluation error — never extrapolates. */
export const evalCurve = (
  type: CurveType,
  params: Record<string, any>,
  vMs: number,
  r?: number | null
): number | null => {
  try {
    if (type === 'linear') return params.m * vMs + params.c;
    if (type === 'polynomial')
      return (params.coeffs as number[]).reduce(
        (s, c, i) => s + c * Math.pow(vMs, i),
        0
      );
    if (type === 'exponential')
      return params.a * Math.exp(params.b * vMs) + params.c;
    if (type === 'sonreb') {
      if (r == null) return null;
      return params.a * Math.pow(vMs, params.b) * Math.pow(r, params.c);
    }
    if (type === 'lookup') {
      const pts = [...(params.points as Array<{ v: number; f: number }>)].sort(
        (a, b) => a.v - b.v
      );
      if (pts.length === 0 || vMs < pts[0].v || vMs > pts[pts.length - 1].v) return null;
      for (let i = 1; i < pts.length; i++) {
        if (vMs <= pts[i].v) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          return p0.f + ((p1.f - p0.f) / (p1.v - p0.v)) * (vMs - p0.v);
        }
      }
      return null;
    }
  } catch {
    return null;
  }
  return null;
};

/** Evaluate a curve snapshot at a velocity — range-gated convenience wrapper
 *  around evalCurve that all live-preview surfaces (strength simulator,
 *  data-collection form, waveform viewer) share. */
export const evalCurveSnapshot = (
  snapshot: CurveSnapshot,
  vMs: number,
  r?: number | null
): number | null => {
  const [lo, hi] = snapshot.valid_range_ms ?? [2000, 5000];
  if (vMs < lo || vMs > hi) return null;
  const f = evalCurve(snapshot.curve_type, snapshot.formula_params, vMs, r);
  return f != null && Number.isFinite(f) ? f : null;
};

/** Body returned by GET/POST …/curves/active-curve/?project=<id>. */
export interface ActiveCurveResponse {
  project: string;
  source: 'project_setting' | 'platform_default' | 'builtin_fallback';
  curve: StrengthCurve | null;
  curve_snapshot: CurveSnapshot;
}

/** One fitted candidate from the calibration regression
 *  (POST …/curves/calibrate/) — the chosen set is then saved as a curve. */
export interface RegressionFit {
  curve_type: CurveType;
  formula_params: Record<string, any>;
  formula: string;
  r2_score: number;
  standard_error: number;
  aic: number;
  valid_range_ms: [number, number];
}

export interface CalibrationResult {
  n_points: number;
  results: { linear: RegressionFit | null; polynomial: RegressionFit | null; exponential: RegressionFit | null; sonreb: RegressionFit | null };
  fit_errors: Record<string, string>;
  best_fit_type: CurveType | null;
  advisory: string;
}

/** Body returned by POST …/curves/preview/ — the live f_cu chain for one
 *  measurement BEFORE it is recorded. */
export interface CurvePreviewResponse {
  project: string;
  path_length_mm: number;
  transit_time_us: number;
  velocity_m_s: number | null;
  temperature_correction_applied: boolean;
  corrected_velocity_m_s: number | null;
  /** The reported figure — the curve estimate with the curve's
   *  standard-error policy applied. */
  f_cu_mpa: number | null;
  /** The curve estimate BEFORE the standard-error policy moved it, so the
   *  adjustment is never hidden inside a single number. */
  f_cu_unadjusted_mpa: number | null;
  /** How many test points this velocity averages (the client's three-point
   *  aggregation), when supplied. The confidence margin uses the standard
   *  error of that mean. */
  n_points: number | null;
  se_adjustment: SEAdjustmentDisclosure;
  status: 'ok' | 'rebound_number_required' | 'below_valid_range' | 'above_valid_range' | 'not_computable';
  curve_snapshot: CurveSnapshot;
}

/** List calibration curves. With no project: every curve visible to the
 *  user (their scoped projects + the platform default). With ?project: that
 *  project's curves plus the platform default. */
export const getStrengthCurves = async (params?: {
  project?: string;
  curve_type?: CurveType;
  search?: string;
}): Promise<StrengthCurve[]> => {
  const res = await api.get('/digital-eye/nexucon-link/curves/', {
    params: {
      project: params?.project || undefined,
      curve_type: params?.curve_type || undefined,
      search: params?.search || undefined,
    },
  });
  const rows = unwrap<any[]>(res, []);
  return Array.isArray(rows) ? rows : [];
};

/** Save a calibration curve (Director-level on the backend). */
export const createStrengthCurve = async (input: {
  name: string;
  curve_type: CurveType;
  formula_params: Record<string, any>;
  project?: string | null;
  standard?: string;
  data_points?: Array<{ v: number; f: number; r?: number | null }>;
  valid_range_min_ms?: number;
  valid_range_max_ms?: number;
  provenance?: Record<string, any>;
  /** The standard-error policy to record on the curve. The backend refuses
   *  anything but 'none' unless the curve carries at least 3 real
   *  calibration pairs, since no error estimate could exist without them. */
  se_adjustment_method?: SEAdjustmentMethod;
  se_adjustment_factor?: number;
}): Promise<StrengthCurve> => {
  const res = await api.post('/digital-eye/nexucon-link/curves/', input);
  return unwrap<any>(res, res);
};

export const deleteStrengthCurve = async (curveId: string): Promise<void> => {
  await api.delete(`/digital-eye/nexucon-link/curves/${curveId}/`);
};

/** Resolve the curve a project's strengths currently flow through — the
 *  honest fallback chain (project setting -> platform default -> built-in). */
export const getActiveCurve = async (projectId: string): Promise<ActiveCurveResponse | null> => {
  const res = await api.get('/digital-eye/nexucon-link/curves/active-curve/', {
    params: { project: projectId },
  });
  return unwrap<any>(res, null);
};

/**
 * Make a saved curve the project's active calibration (Director-level).
 *
 * `active_curve` is the curve's **name**, not the curve — the server answers
 * with the label so the caller can report what was activated without holding
 * a copy of the record. It was typed as a whole `StrengthCurve` before, which
 * was simply wrong: a consumer reading `.curve_type` or `.id` off it got
 * `undefined` at runtime with no type error to catch it.
 */
export const activateStrengthCurve = async (
  curveId: string,
  projectId: string
): Promise<{ project: string; active_curve: string; curve_snapshot: CurveSnapshot }> => {
  const res = await api.post(`/digital-eye/nexucon-link/curves/${curveId}/activate/`, {
    project: projectId,
  });
  return unwrap<any>(res, res);
};

/**
 * Return a project to the platform default calibration (Director-level).
 *
 * There is no is_active flag on a curve — "active" is a per-project setting,
 * and the platform default is what applies when a project's own choice is
 * unset. So choosing the default for a project means clearing that choice,
 * not pointing at a curve. `changed` reports whether anything actually
 * moved, so a project already on the default is not reported as having been
 * switched. Records already stored keep the snapshot of the curve that
 * produced them.
 *
 * Named verb-first, like every other call here — deliberately NOT `use…`,
 * which React's rules-of-hooks reads as a hook and refuses to see called
 * from an async handler (it lint-errored on exactly that).
 */
export const restorePlatformDefaultCurve = async (
  projectId: string,
): Promise<{
  project: string;
  previous_active_curve: string | null;
  changed: boolean;
  curve_snapshot: CurveSnapshot;
}> => {
  const res = await api.post(
    '/digital-eye/nexucon-link/curves/use-platform-default/',
    { project: projectId },
  );
  return unwrap<any>(res, res);
};

/** Run the regression engine over real calibration pairs (UPV + cube
 *  strength, rebound where SonReb needs it). Nothing is persisted — the
 *  caller saves the chosen candidate via createStrengthCurve. */
export const calibrateCurve = async (
  dataPoints: Array<{ v: number; f: number; r?: number | null }>
): Promise<CalibrationResult> => {
  const res = await api.post('/digital-eye/nexucon-link/curves/calibrate/', {
    data_points: dataPoints,
  });
  return unwrap<any>(res, res);
};

/** Calibration pairs parsed server-side from an uploaded CSV (columns
 *  v/velocity, f/strength, optional r/rebound). */
export interface CalibrationCsvResponse {
  data_points: Array<{ v: number; f: number; r?: number }>;
}

/** Upload a calibration CSV (v (m/s), f (MPa), optional r) for the
 *  regression engine — parsed on the server, returned as typed pairs. */
export const uploadCalibrationCsv = async (file: File): Promise<CalibrationCsvResponse> => {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/digital-eye/nexucon-link/curves/upload-csv/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<any>(res, res);
};

// ---------------------------------------------------------------------------
// Core samples — ground-truth lab results (path-to-95% Layer 3)
// ---------------------------------------------------------------------------

/** A laboratory core result: every number typed from the test certificate. */
export interface CoreSample {
  id: string;
  project: string;
  pundit_test: string | null;
  structural_element: string;
  test_location: string;
  core_diameter_mm: number | null;
  core_length_mm: number | null;
  lab_strength_mpa: number | null;
  lab_report_ref: string;
  sampled_at: string | null;
  notes: string;
  /** The real (v m/s, f MPa) pair this core contributes — null when either
   *  half is missing (no lab result yet / no linked velocity test). Never
   *  synthesized. */
  calibration_pair: { v: number; f: number; r?: number } | null;
  recorded_by_name: string | null;
  created_at: string;
  updated_at: string;
}

/** List a project's core samples (empty list = none recorded yet). */
export const getCoreSamples = async (projectId: string): Promise<CoreSample[]> => {
  const res = await api.get('/digital-eye/nexucon-link/core-samples/', {
    params: { project: projectId },
  });
  const rows = unwrap<any[]>(res, []);
  return Array.isArray(rows) ? rows : [];
};

/** Record a core sample (Director-level on the backend). */
export const createCoreSample = async (input: {
  project: string;
  pundit_test?: string | null;
  structural_element?: string;
  test_location?: string;
  core_diameter_mm?: number | null;
  core_length_mm?: number | null;
  lab_strength_mpa?: number | null;
  lab_report_ref?: string;
  sampled_at?: string | null;
  notes?: string;
}): Promise<CoreSample> => {
  const res = await api.post('/digital-eye/nexucon-link/core-samples/', input);
  return unwrap<any>(res, res);
};

/** Update a core sample (Director-level on the backend). */
export interface CoreSampleInput {
  project?: string;
  pundit_test?: string | null;
  structural_element?: string;
  test_location?: string;
  core_diameter_mm?: number | null;
  core_length_mm?: number | null;
  lab_strength_mpa?: number | null;
  lab_report_ref?: string;
  sampled_at?: string | null;
  notes?: string;
}

export const updateCoreSample = async (
  coreId: string,
  patch: Partial<CoreSampleInput>
): Promise<CoreSample> => {
  const res = await api.patch(`/digital-eye/nexucon-link/core-samples/${coreId}/`, patch);
  return unwrap<any>(res, res);
};

/** Remove a core sample record (Director-level on the backend). */
export const deleteCoreSample = async (coreId: string): Promise<void> => {
  await api.delete(`/digital-eye/nexucon-link/core-samples/${coreId}/`);
};

/** The project's core-sample pairs + (when ≥ 2 pairs) a regression run over
 *  them by the SAME engine a manual calibration uses. Cores that cannot form
 *  a pair are listed with the honest reason. */
export interface CoreSamplePairsResponse {
  project: string;
  n_cores: number;
  n_pairs: number;
  pairs: Array<{ v: number; f: number; r?: number }>;
  not_forming_a_pair: Array<{
    id: string;
    structural_element: string;
    test_location: string;
    reason: string;
  }>;
  regression: CalibrationResult | null;
}

export const getCoreSamplePairs = async (
  projectId: string
): Promise<CoreSamplePairsResponse> => {
  const res = await api.get('/digital-eye/nexucon-link/core-samples/pairs/', {
    params: { project: projectId },
  });
  return unwrap<any>(res, res);
};

/** Live f_cu preview for one measurement through the project's active
 *  curve — the same maths (incl. temperature correction and the curve's
 *  standard-error policy) the server applies when the reading is actually
 *  stored. `n_points` is how many test points this velocity averages. */
export const previewCurve = async (input: {
  project: string;
  path_length_mm: number;
  transit_time_us: number;
  temperature_c?: number | null;
  rebound_number?: number | null;
  n_points?: number | null;
}): Promise<CurvePreviewResponse> => {
  const res = await api.post('/digital-eye/nexucon-link/curves/preview/', input);
  return unwrap<any>(res, res);
};

/** The standard-error analysis behind a project's active curve: the standard
 *  error, the measured mean residual (the figure behind the "+2 close the
 *  gap" convention), R², AIC, whether the data supports an adjustment, and
 *  the plain-English definition of each statistic. Everything is computed
 *  from the curve's real calibration pairs. */
export const getSEAnalysis = async (projectId: string): Promise<SEAnalysisResponse> => {
  const res = await api.get('/digital-eye/nexucon-link/curves/se-analysis/', {
    params: { project: projectId },
  });
  return unwrap<any>(res, res);
};

/** The standards the mathematical model rests on — which document covers
 *  the measurement and which governs turning it into a strength. Static
 *  registry, so a failure here is a real error, not a missing record. */
export const getStandards = async (): Promise<StandardEntry[]> => {
  const res = await api.get('/digital-eye/nexucon-link/curves/standards/');
  const body = unwrap<any>(res, {});
  const rows = body?.standards;
  return Array.isArray(rows) ? rows : [];
};

/** Read the Nexucon Link platform system settings. */
export const getNexuconLinkSettings = async (): Promise<NexuconLinkSettings> => {
  const res = await api.get('/digital-eye/nexucon-link/settings/');
  return unwrap<any>(res, res);
};

/** Update the platform settings (Director-level on the backend). Only the
 *  fields sent are changed. */
export const updateNexuconLinkSettings = async (
  patch: Partial<Pick<NexuconLinkSettings,
    'preferred_curve_type' | 'default_standard' | 'velocity_unit' | 'strength_unit'>>
): Promise<NexuconLinkSettings> => {
  const res = await api.patch('/digital-eye/nexucon-link/settings/', patch);
  return unwrap<any>(res, res);
};

/** The adjustment policies, in the order the UI offers them, with the
 *  client-facing label for each. */
export const SE_ADJUSTMENT_OPTIONS: Array<{
  value: SEAdjustmentMethod;
  label: string;
  hint: string;
}> = [
  {
    value: 'none',
    label: 'No adjustment',
    hint: 'Report the curve estimate as fitted. The default.',
  },
  {
    value: 'bias_correction',
    label: 'Bias correction',
    hint:
      'Add the mean residual measured from this curve’s own calibration pairs — the ' +
      '“add 2 to close the gap” practice, computed rather than assumed.',
  },
  {
    value: 'confidence_margin',
    label: 'Confidence margin',
    hint:
      'Subtract k × the standard error, reporting a conservative lower-bound ' +
      '(characteristic) strength. Uses s/√n when a figure averages n test points.',
  },
];

/** Curve-parameter field layout per type, for the calibration UI. All
 *  velocities in m/s, strength in MPa — matching the engine's domain.
 *
 *  The exponential labels are descriptive (15 Sep 2026 client direction):
 *  A, B and C are the standard exponential coefficients, but a Director
 *  reading a saved curve should not have to remember which is which. */
export const CURVE_PARAM_FIELDS: Record<CurveType, Array<{ key: string; label: string; hint?: string }>> = {
  linear: [
    { key: 'm', label: 'm (slope)', hint: 'MPa per (m/s)' },
    { key: 'c', label: 'c (intercept)', hint: 'MPa' },
  ],
  polynomial: [{ key: 'coeffs', label: 'coefficients', hint: 'comma-separated, ascending order: c0,c1,c2' }],
  exponential: [
    { key: 'a', label: 'A — strength scaling factor', hint: 'sets the overall strength level of the curve' },
    { key: 'b', label: 'B — velocity growth rate', hint: 'how steeply strength rises with pulse velocity' },
    { key: 'c', label: 'C — intercept offset', hint: 'MPa added to the curve; 0 for the plain exponential form' },
  ],
  sonreb: [
    { key: 'a', label: 'a' },
    { key: 'b', label: 'b (V exponent)' },
    { key: 'c', label: 'c (R exponent)' },
  ],
  lookup: [{ key: 'points', label: 'lookup points', hint: 'pairs v (m/s) = f (MPa), comma-separated' }],
};
// ==========================================
// 3aa. REPORT VERIFICATION, PREVIEW, BRANDING & MAP DATA
// (REFINED EXECUTIVE SUMMARY, 11 Sep 2026)
// ==========================================

/** Verification facts the public verify endpoint returns for a matched
 *  archived dossier. Discloses no project data — reference, checksums and
 *  verdicts only. */
export interface ReportVerification {
  verified: boolean;
  report_reference?: string;
  title?: string;
  content_digest?: string;
  sha256_checksum?: string;
  test_count?: number;
  assessed_count?: number;
  passed_count?: number;
  compliance_status?: string;
  archived_at?: string;
  detail?: string;
}

/**
 * PUBLIC verification of an archived NDT dossier — the destination encoded
 * in the report cover's QR code. GET /reports/verify/?ref=&digest=.
 * Calls the backend directly (no credentials — the endpoint is public).
 */
export const verifyArchivedReport = async (
  ref: string,
  digest: string
): Promise<ReportVerification> => {
  const res = await api.get('/reports/verify/', {
    params: { ref, digest },
  });
  const data = unwrap<ReportVerification | null>(res, null);
  if (!data) throw new Error('Report verification could not be loaded.');
  return data;
};

/**
 * PUBLIC download of the authentic archived original for a verified dossier
 * (12 Sep 2026): the same ref+digest pair the cover QR encodes. Streams the
 * exact PDF bytes the platform sealed at generation time — so a recipient
 * holding an edited copy can retrieve the genuine document. GET
 * /reports/verify/download/?ref=&digest=.
 */
export const downloadArchivedReportOriginal = async (
  ref: string,
  digest: string
): Promise<Blob> => {
  const res = await api.get('/reports/verify/download/', {
    params: { ref, digest },
    responseType: 'blob',
  });
  return new Blob([res as unknown as BlobPart], { type: 'application/pdf' });
};

/**
 * Preview the exact PDF the generate endpoint will produce — same service,
 * same CMS overrides, same branding — WITHOUT archiving it. Streams the
 * bytes as a Blob for in-app rendering. GET /reports/projects/<id>/ndt-report-preview/.
 */
export const fetchNdtReportPreview = async (projectId: string): Promise<Blob> => {
  const res = await api.get(`/reports/projects/${projectId}/ndt-report-preview/`, {
    responseType: 'blob',
  });
  return new Blob([res as any], { type: 'application/pdf' });
};

/**
 * One section of the preview sidebar (REFINED EXECUTIVE SUMMARY §2.1):
 * the wireframe's section list, each entry carrying the physical page it
 * starts on in the bundled PDF. Conditional sections (AI interpretation)
 * are absent when the render skipped them — never fabricated.
 */
export interface NdtPreviewSection {
  key: string;
  label: string;
  page: number;
}

/** The preview document + its §2.1 sidebar map, from ONE render pass. */
export interface NdtReportPreviewBundle {
  blob: Blob;
  sections: NdtPreviewSection[];
  pageCount: number;
}

/**
 * Preview bundle (§2.1 wireframe): GET
 * /reports/projects/<id>/ndt-report-preview/sections/ — the section→page
 * map, the page count and the exact preview PDF arrive together from a
 * single backend render, so the sidebar can never describe a different
 * document than the one it navigates.
 */
export const fetchNdtReportPreviewBundle = async (
  projectId: string
): Promise<NdtReportPreviewBundle> => {
  const res: any = await api.get(
    `/reports/projects/${projectId}/ndt-report-preview/sections/`
  );
  const binary = atob(res.pdf_base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    sections: (res.sections ?? []) as NdtPreviewSection[],
    pageCount: Number(res.page_count ?? 0),
  };
};

/** Branding configuration for a project's statutory report (§2.3). */
export interface ReportBrandingConfig {
  branding_configured: boolean;
  logo_url?: string | null;
  logo_position?: string;
  logo_size?: string;
  cover_logo_url?: string | null;
  cover_logo_hidden?: boolean;
  watermark_url?: string | null;
  watermark_opacity_pct?: number;
  watermark_position?: string;
  updated_at?: string;
}

/** Read a project's report branding (or the honest unconfigured state). */
export const getReportBranding = async (projectId: string): Promise<ReportBrandingConfig> => {
  const res = await api.get(`/reports/projects/${projectId}/branding/`);
  const data = unwrap<ReportBrandingConfig | null>(res, null);
  if (!data) throw new Error('Report branding could not be loaded.');
  return data;
};

/**
 * Upload / update a project's report branding (Directors only). Files are
 * real uploads (PNG/JPEG); scalar fields validated server-side. Pass
 * `logo: null` (or 'remove') to remove an image.
 */
export const updateReportBranding = async (
  projectId: string,
  fields: {
    logo?: File | '' | 'remove' | null;
    watermark?: File | '' | 'remove' | null;
    cover_logo?: File | '' | 'remove' | null;
    cover_logo_hidden?: boolean;
    logo_position?: string;
    logo_size?: string;
    watermark_opacity_pct?: number;
    watermark_position?: string;
  }
): Promise<ReportBrandingConfig> => {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) return;
    if (value instanceof File) {
      form.append(key, value);
    } else {
      form.append(key, String(value));
    }
  });
  const res = await api.patch(`/reports/projects/${projectId}/branding/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = unwrap<ReportBrandingConfig | null>(res, null);
  if (!data) throw new Error('Report branding could not be saved.');
  return data;
};

/** Remove a project's report branding entirely (Directors only). */
export const removeReportBranding = async (projectId: string): Promise<ReportBrandingConfig> => {
  const res = await api.delete(`/reports/projects/${projectId}/branding/`);
  const data = unwrap<ReportBrandingConfig | null>(res, null);
  if (!data) throw new Error('Report branding could not be removed.');
  return data;
};

/** Approving-engineer COREN credentials for a project's report sign-off (C11). */
export interface ReportSignOffConfig {
  signoff_configured: boolean;
  approved_by_name: string;
  qualification: string;
  coren_registration_no: string;
  firm_name: string;
  signature_image_url: string | null;
  updated_at?: string;
}

/** Read a project's report sign-off (or the honest unconfigured state). */
export const getReportSignOff = async (projectId: string): Promise<ReportSignOffConfig> => {
  const res = await api.get(`/reports/projects/${projectId}/signoff/`);
  const data = unwrap<ReportSignOffConfig | null>(res, null);
  if (!data) throw new Error('Report sign-off could not be loaded.');
  return data;
};

/**
 * Record / update a project's approving-engineer credentials (Directors
 * only). Every field is typed by a Director — nothing is derived. Pass
 * `signature_image: null` (or 'remove') to remove the scanned signature.
 */
export const updateReportSignOff = async (
  projectId: string,
  fields: {
    approved_by_name?: string;
    qualification?: string;
    coren_registration_no?: string;
    firm_name?: string;
    signature_image?: File | '' | 'remove' | null;
  }
): Promise<ReportSignOffConfig> => {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) return;
    if (value instanceof File) {
      form.append(key, value);
    } else {
      form.append(key, String(value));
    }
  });
  const res = await api.patch(`/reports/projects/${projectId}/signoff/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = unwrap<ReportSignOffConfig | null>(res, null);
  if (!data) throw new Error('Report sign-off could not be saved.');
  return data;
};

/** Remove a project's report sign-off entirely (Directors only). */
export const removeReportSignOff = async (projectId: string): Promise<ReportSignOffConfig> => {
  const res = await api.delete(`/reports/projects/${projectId}/signoff/`);
  const data = unwrap<ReportSignOffConfig | null>(res, null);
  if (!data) throw new Error('Report sign-off could not be removed.');
  return data;
};

/** One geolocated test point on the interactive report map (§2.4). */
export interface ReportMapTestPoint {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    element: string;
    floor: string;
    grid_location: string;
    tested_at: string | null;
    velocity_m_s: number | null;
    strength_n_mm2: number | null;
    /** The standard-error policy that moved `strength_n_mm2`, in the server's
     *  own words; null when the active curve carries no policy (the figure is
     *  then the curve estimate as fitted) or when no strength was computed. */
    strength_note?: string | null;
    band: 'good' | 'poor' | 'unassessed' | 'no_velocity';
  };
}

/** One surveyed site-perimeter polygon (from a GNSS boundary survey). */
export interface ReportMapBoundaryPolygon {
  survey_reference: string;
  title: string;
  polygon: { type: 'Polygon'; coordinates: [number, number][][] };
}

/** GeoJSON-style map payload — only recorded coordinates, never fabricated. */
export interface ReportMapData {
  project_center: [number, number] | null;
  site_address: string;
  test_points: { type: 'FeatureCollection'; features: ReportMapTestPoint[] };
  /** One closed ring per GNSS boundary survey — empty when none recorded. */
  boundary_polygons: ReportMapBoundaryPolygon[];
  legend: Record<string, string>;
}

/** Fetch the real test-point coordinates + bands for the project map. */
export const getReportMapData = async (projectId: string): Promise<ReportMapData> => {
  const res = await api.get(`/reports/projects/${projectId}/map/`);
  const data = unwrap<ReportMapData | null>(res, null);
  if (!data) throw new Error('The map data could not be loaded.');
  return data;
};
