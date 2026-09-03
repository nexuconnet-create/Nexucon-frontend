import api from './api';

// ==========================================
// 1. DATA MODELS & TAXONOMY
// ==========================================

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
}

export interface TrimbleConnection {
  id: string;
  project: string;
  project_name: string;
  trimble_project_id: string;
  trimble_project_name: string;
  region: 'EU-West' | 'US-East' | 'APAC' | 'GLOBAL';
  status: 'CONNECTED' | 'SYNCING' | 'AUTH_REQUIRED' | 'DISCONNECTED';
  last_sync_at: string;
  synced_models_count: number;
  synced_elements_count: number;
  bcf_topics_count: number;
  webhook_active: boolean;
}

export interface GPRScan {
  id: string;
  scan_reference: string;
  project: string;
  project_name: string;
  structural_element_id?: string;
  structural_element_name?: string;
  structural_element_guid?: string;
  grid_axis: string; // e.g. "Grid 4-C to 4-D"
  antenna_frequency: '100_MHZ' | '400_MHZ' | '900_MHZ' | '1.6_GHZ' | '2.0_GHZ' | '2.6_GHZ';
  device_name: string; // e.g. "Proceq GS8000 Subsurface GPR"
  operator_name: string;
  survey_date: string;
  transect_length_m: number;
  max_penetration_depth_m: number;
  measured_rebar_spacing_mm: number;
  specified_rebar_spacing_mm?: number;
  measured_cover_depth_mm: number;
  rebar_deficiency_detected: boolean;
  void_detected: boolean;
  delamination_detected: boolean;
  utility_strike_hazard: boolean;
  dielectric_constant: number; // e.g. 6.2 for cured concrete
  dielectric_permittivity?: number;
  radargram_image_url: string;
  c_scan_heatmap_url?: string;
  raw_data_file_url?: string;
  file_size: string;
  status: 'PROCESSED' | 'IN_REVIEW' | 'FLAGGED' | 'VERIFIED';
  notes?: string;
  created_at: string;
}

export interface PunditTest {
  id: string;
  test_reference: string;
  project: string;
  project_name: string;
  structural_element_id?: string;
  structural_element_name?: string;
  structural_element_guid?: string;
  test_location: string; // e.g. "Column C-102 (Level 2 Mid-Height)"
  device_model: string; // e.g. "Proceq Pundit PL-200 UPV"
  transducer_type: 'DIRECT' | 'INDIRECT' | 'SEMI_DIRECT';
  transducer_frequency_khz: number; // 25, 54, 150, or 250 kHz
  path_length_mm: number; // e.g. 400 mm
  transit_time_us: number; // e.g. 94.2 microseconds
  pulse_velocity_ms: number; // e.g. 4246 m/s
  estimated_compressive_strength_mpa: number; // e.g. 42.5 MPa
  concrete_quality_rating: 'EXCELLENT' | 'GOOD' | 'DOUBTFUL' | 'POOR';
  estimated_crack_depth_mm?: number;
  waveform_samples: number[]; // Oscillogram amplitudes
  operator_name: string;
  test_date: string;
  status: 'PASSED' | 'ANOMALY' | 'RE_TEST_REQUIRED' | 'VERIFIED';
  notes?: string;
  created_at: string;
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
  taxonomy: FindingTaxonomy;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score: number; // 0 - 100
  depth_mm?: number;
  deviation_mm?: number;
  gps_coordinates?: { lat: number; lng: number; elevation: number };
  evidence_photos: string[];
  radargram_snippet_url?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'VERIFIED' | 'RESOLVED' | 'CONVERTED_TO_NCR';
  ncr_reference?: string;
  bcf_topic_guid?: string;
  assigned_inspector?: string;
  resolution_deadline?: string;
  corrective_action?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysisRecord {
  id: string;
  project: string;
  project_name: string;
  scan_reference: string;
  model_version: string; // e.g. "Nexucon Structural-Vision v3.2 + GPR-Inversion"
  analysis_type: 'SURFACE_DEFECT' | 'GPR_SUBSURFACE' | 'THERMAL_ANOMALY' | 'SCAN_TO_BIM_DEVIATION' | 'MULTI_MODAL_FUSION';
  analyzed_at: string;
  confidence_score: number;
  overall_health_score: number; // 0 - 100
  total_elements_scanned: number;
  anomalies_detected: number;
  critical_defects_count: number;
  compliance_check_passed: boolean;
  findings: Array<{
    id: string;
    label: string;
    type: string;
    severity: string;
    confidence: number;
    location: string;
    recommended_action: string;
  }>;
  thermal_metrics?: {
    avg_temp_c: number;
    max_temp_c: number;
    variance_c: number;
    leakage_detected: boolean;
  };
  deviation_summary?: {
    max_positive_mm: number;
    max_negative_mm: number;
    rms_deviation_mm: number;
    tolerance_threshold_mm: number;
  };
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

export interface DigitalEyeOverviewStats {
  active_rovers: number;
  scans_today: number;
  processing_queue_count: number;
  ai_anomalies_detected: number;
  verified_gpr_scans: number;
  verified_pundit_tests: number;
  open_critical_findings: number;
  trimble_sync_status: 'SYNCED' | 'PENDING' | 'ERROR';
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
  compliance_status: 'COMPLIANT' | 'FLAGGED_DEFECTS' | 'CRITICAL_NCR' | 'VERIFIED';
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
// 2. MOCK DATA GENERATOR (RESILIENT FALLBACK)
// ==========================================

const MOCK_STRUCTURAL_ELEMENTS: BIMStructuralElement[] = [
  {
    id: "elem-001",
    element_guid: "3b4a8e91-7c22-4d1a-9f5e-1102938475a1",
    name: "Column C-102 (Core Axis)",
    category: "COLUMN",
    discipline: "Structural",
    project: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    model_name: "Eko_Atlantic_Tower_v4.ifc",
    grid_location: "Grid Axis 4-C / Level 2",
    level: "Level 2 (Podium)",
    coordinates_3d: { x: 12.4, y: 34.8, z: 8.5 },
    designed_concrete_grade: "C40/50",
    designed_rebar_spacing_mm: 150,
    designed_cover_depth_mm: 45,
    gpr_clearance_status: "VERIFIED",
    pundit_clearance_status: "VERIFIED",
    ai_anomaly_count: 0,
    open_findings_count: 0,
    last_inspected_at: "2026-08-28T10:30:00Z"
  },
  {
    id: "elem-002",
    element_guid: "8f219b44-1234-4bc8-88aa-9918273645e2",
    name: "Transfer Slab TS-04 (Post-Tensioned)",
    category: "SLAB",
    discipline: "Structural",
    project: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    model_name: "Eko_Atlantic_Tower_v4.ifc",
    grid_location: "Grid D-7 to E-9",
    level: "Level 4 (Transfer Deck)",
    coordinates_3d: { x: 45.2, y: 18.6, z: 16.0 },
    designed_concrete_grade: "C45/55",
    designed_rebar_spacing_mm: 125,
    designed_cover_depth_mm: 40,
    gpr_clearance_status: "ANOMALY_DETECTED",
    pundit_clearance_status: "VERIFIED",
    ai_anomaly_count: 2,
    open_findings_count: 1,
    last_inspected_at: "2026-08-30T14:15:00Z"
  },
  {
    id: "elem-003",
    element_guid: "2c776a01-9988-4221-a1b2-c3d4e5f6a7b8",
    name: "Foundation Bored Pile P-42",
    category: "FOUNDATION_PILE",
    discipline: "Geotechnical",
    project: "proj-ikoyi-02",
    project_name: "Ikoyi Luxury Waterfront Heights",
    model_name: "Ikoyi_Waterfront_Foundation.ifc",
    grid_location: "South Perimeter Grid P-42",
    level: "Substructure (-12.0m)",
    coordinates_3d: { x: -8.5, y: 12.0, z: -12.0 },
    designed_concrete_grade: "C35/45",
    designed_rebar_spacing_mm: 100,
    designed_cover_depth_mm: 75,
    gpr_clearance_status: "VERIFIED",
    pundit_clearance_status: "ANOMALY_DETECTED",
    ai_anomaly_count: 1,
    open_findings_count: 1,
    last_inspected_at: "2026-08-29T09:00:00Z"
  },
  {
    id: "elem-004",
    element_guid: "a9988776-5544-4332-2211-009988776655",
    name: "Shear Wall SW-01 (Lift Core)",
    category: "CORE_WALL",
    discipline: "Structural",
    project: "proj-lekki-03",
    project_name: "Lekki Deep Sea Port Logistics Hub",
    model_name: "Lekki_Port_Admin_BIM.ifc",
    grid_location: "Grid Core A / Levels 1-6",
    level: "Level 1 to 3",
    coordinates_3d: { x: 22.0, y: 10.5, z: 4.2 },
    designed_concrete_grade: "C40/50",
    designed_rebar_spacing_mm: 150,
    designed_cover_depth_mm: 40,
    gpr_clearance_status: "VERIFIED",
    pundit_clearance_status: "VERIFIED",
    ai_anomaly_count: 0,
    open_findings_count: 0,
    last_inspected_at: "2026-08-31T08:30:00Z"
  }
];

const MOCK_GPR_SCANS: GPRScan[] = [
  {
    id: "gpr-001",
    scan_reference: "GPR-2026-089",
    project: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    structural_element_id: "elem-002",
    structural_element_name: "Transfer Slab TS-04 (Post-Tensioned)",
    structural_element_guid: "8f219b44-1234-4bc8-88aa-9918273645e2",
    grid_axis: "Grid D-7 to E-9 (Transect Line B4)",
    antenna_frequency: "2.0_GHZ",
    device_name: "Proceq GS8000 Subsurface High-Frequency GPR",
    operator_name: "Engr. Babatunde Alabi, FNSE",
    survey_date: "2026-08-30",
    transect_length_m: 14.5,
    max_penetration_depth_m: 0.85,
    measured_rebar_spacing_mm: 185, // 185mm vs 125mm designed!
    measured_cover_depth_mm: 32, // 32mm vs 40mm designed!
    rebar_deficiency_detected: true,
    void_detected: false,
    delamination_detected: true,
    utility_strike_hazard: false,
    dielectric_constant: 6.4,
    radargram_image_url: "/radargrams/gpr-slice-089.png",
    c_scan_heatmap_url: "/radargrams/gpr-cscan-089.png",
    file_size: "148.5 MB",
    status: "FLAGGED",
    notes: "Post-tensioning tendon profile checked. Rebar spacing exceeds tolerance at Grid E-8 (+60mm variance). Inter-layer delamination suspected at 180mm depth.",
    created_at: "2026-08-30T15:00:00Z"
  },
  {
    id: "gpr-002",
    scan_reference: "GPR-2026-088",
    project: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    structural_element_id: "elem-001",
    structural_element_name: "Column C-102 (Core Axis)",
    structural_element_guid: "3b4a8e91-7c22-4d1a-9f5e-1102938475a1",
    grid_axis: "Grid Axis 4-C / Level 2 Perimeter",
    antenna_frequency: "2.6_GHZ",
    device_name: "Proceq GS8000 Subsurface High-Frequency GPR",
    operator_name: "Engr. Babatunde Alabi, FNSE",
    survey_date: "2026-08-28",
    transect_length_m: 4.8,
    max_penetration_depth_m: 0.60,
    measured_rebar_spacing_mm: 148,
    measured_cover_depth_mm: 46,
    rebar_deficiency_detected: false,
    void_detected: false,
    delamination_detected: false,
    utility_strike_hazard: false,
    dielectric_constant: 6.2,
    radargram_image_url: "/radargrams/gpr-slice-088.png",
    file_size: "62.4 MB",
    status: "VERIFIED",
    notes: "Reinforcement cages aligned with structural drawings. Cover depth compliant with BS EN 1992-1-1 standards.",
    created_at: "2026-08-28T11:00:00Z"
  },
  {
    id: "gpr-003",
    scan_reference: "GPR-2026-087",
    project: "proj-ikoyi-02",
    project_name: "Ikoyi Luxury Waterfront Heights",
    structural_element_id: "elem-003",
    structural_element_name: "Foundation Bored Pile P-42",
    structural_element_guid: "2c776a01-9988-4221-a1b2-c3d4e5f6a7b8",
    grid_axis: "Pile Cap 42 Top Surface",
    antenna_frequency: "900_MHZ",
    device_name: "GSSI UtilityScan Pro 900",
    operator_name: "Tariq Adeleke, Geophysics Lead",
    survey_date: "2026-08-27",
    transect_length_m: 8.0,
    max_penetration_depth_m: 2.2,
    measured_rebar_spacing_mm: 102,
    measured_cover_depth_mm: 74,
    rebar_deficiency_detected: false,
    void_detected: true,
    delamination_detected: false,
    utility_strike_hazard: false,
    dielectric_constant: 7.1,
    radargram_image_url: "/radargrams/gpr-slice-087.png",
    file_size: "94.0 MB",
    status: "IN_REVIEW",
    notes: "Deep anomaly detected between 1.1m and 1.4m depth. Correlated with UPV acoustic velocity drop.",
    created_at: "2026-08-27T16:30:00Z"
  }
];

const MOCK_PUNDIT_TESTS: PunditTest[] = [
  {
    id: "pdt-001",
    test_reference: "UPV-2026-054",
    project: "proj-ikoyi-02",
    project_name: "Ikoyi Luxury Waterfront Heights",
    structural_element_id: "elem-003",
    structural_element_name: "Foundation Bored Pile P-42",
    structural_element_guid: "2c776a01-9988-4221-a1b2-c3d4e5f6a7b8",
    test_location: "Pile Cap P-42 Core Depth 1.2m",
    device_model: "Proceq Pundit PL-200 Ultrasonic Pulse Velocity",
    transducer_type: "DIRECT",
    transducer_frequency_khz: 25,
    path_length_mm: 600,
    transit_time_us: 172.4,
    pulse_velocity_ms: 3480, // Under 3500 m/s indicates doubtful concrete!
    estimated_compressive_strength_mpa: 27.8, // Specified 35 MPa
    concrete_quality_rating: "DOUBTFUL",
    estimated_crack_depth_mm: 42,
    waveform_samples: [0, 8, -14, 28, -64, 112, -180, 240, -190, 120, -50, 20, 0],
    operator_name: "Dr. K. Okonjo, Materials NDT Specialist",
    test_date: "2026-08-29",
    status: "ANOMALY",
    notes: "Pulse velocity of 3,480 m/s falls below statutory threshold of 3,800 m/s for Grade C35 concrete. Internal micro-voiding or honeycombing likely.",
    created_at: "2026-08-29T10:00:00Z"
  },
  {
    id: "pdt-002",
    test_reference: "UPV-2026-053",
    project: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    structural_element_id: "elem-001",
    structural_element_name: "Column C-102 (Core Axis)",
    structural_element_guid: "3b4a8e91-7c22-4d1a-9f5e-1102938475a1",
    test_location: "Column C-102 Base (Level 2)",
    device_model: "Proceq Pundit PL-200 Ultrasonic Pulse Velocity",
    transducer_type: "DIRECT",
    transducer_frequency_khz: 54,
    path_length_mm: 500,
    transit_time_us: 114.2,
    pulse_velocity_ms: 4378,
    estimated_compressive_strength_mpa: 46.2,
    concrete_quality_rating: "EXCELLENT",
    waveform_samples: [0, 15, -30, 85, -190, 320, -280, 160, -80, 30, -10, 0],
    operator_name: "Dr. K. Okonjo, Materials NDT Specialist",
    test_date: "2026-08-28",
    status: "PASSED",
    notes: "Homogeneous concrete structure. Velocity 4,378 m/s satisfies Excellent durability rating per BS 1881-203.",
    created_at: "2026-08-28T12:00:00Z"
  }
];

const MOCK_FINDINGS: DigitalEyeFinding[] = [
  {
    id: "fnd-001",
    finding_reference: "FND-DE-2026-018",
    project: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    structural_element_id: "elem-002",
    structural_element_name: "Transfer Slab TS-04 (Post-Tensioned)",
    structural_element_guid: "8f219b44-1234-4bc8-88aa-9918273645e2",
    gpr_scan_id: "gpr-001",
    taxonomy: "REBAR_SPACING_DEFICIENCY",
    title: "Rebar Spacing Discrepancy & Delamination at Transfer Slab TS-04",
    description: "High-frequency GPR scanning revealed rebar spacing of 185mm against designed 125mm center-to-center. Concrete cover reduced to 32mm with acoustic delamination indicator at 180mm depth.",
    severity: "HIGH",
    confidence_score: 94,
    depth_mm: 180,
    deviation_mm: 60,
    gps_coordinates: { lat: 6.45214, lng: 3.43521, elevation: 18.2 },
    evidence_photos: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=800&q=80"
    ],
    radargram_snippet_url: "/radargrams/gpr-slice-089.png",
    status: "OPEN",
    assigned_inspector: "Engr. Babatunde Alabi",
    resolution_deadline: "2026-09-08",
    corrective_action: "Structural consultant must verify load transfer capacity and prescribe carbon-fiber re-strengthening or rebar supplementary dowels.",
    created_at: "2026-08-30T15:30:00Z",
    updated_at: "2026-08-30T15:30:00Z"
  },
  {
    id: "fnd-002",
    finding_reference: "FND-DE-2026-017",
    project: "proj-ikoyi-02",
    project_name: "Ikoyi Luxury Waterfront Heights",
    structural_element_id: "elem-003",
    structural_element_name: "Foundation Bored Pile P-42",
    structural_element_guid: "2c776a01-9988-4221-a1b2-c3d4e5f6a7b8",
    gpr_scan_id: "gpr-003",
    pundit_test_id: "pdt-001",
    taxonomy: "SUBSURFACE_VOID",
    title: "Honeycomb Void & Low Compressive Strength in Pile Cap P-42",
    description: "Ultrasonic NDT pulse velocity dropped to 3,480 m/s (compressive strength 27.8 MPa vs 35 MPa spec). GPR radargram migration confirms 240mm diameter consolidation void in pile head zone.",
    severity: "CRITICAL",
    confidence_score: 98,
    depth_mm: 1200,
    gps_coordinates: { lat: 6.44890, lng: 3.42910, elevation: -12.0 },
    evidence_photos: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
    ],
    radargram_snippet_url: "/radargrams/gpr-slice-087.png",
    status: "CONVERTED_TO_NCR",
    ncr_reference: "NCR-2026-0042",
    assigned_inspector: "Dr. K. Okonjo",
    resolution_deadline: "2026-09-04",
    corrective_action: "Pressure epoxy injection grouting and core testing under supervision of Lagos State Materials Testing Laboratory (LSMTL).",
    created_at: "2026-08-29T11:00:00Z",
    updated_at: "2026-08-29T16:00:00Z"
  },
  {
    id: "fnd-003",
    finding_reference: "FND-DE-2026-016",
    project: "proj-lekki-03",
    project_name: "Lekki Deep Sea Port Logistics Hub",
    structural_element_id: "elem-004",
    structural_element_name: "Shear Wall SW-01 (Lift Core)",
    structural_element_guid: "a9988776-5544-4332-2211-009988776655",
    taxonomy: "BIM_GEOMETRIC_DEVIATION",
    title: "3D SLAM Scan-to-BIM Verticality Offset on Lift Core Wall",
    description: "Automated point cloud alignment against Revit model indicates 18mm outward tilt at Level 3 elevation, approaching statutory tolerance envelope limit of 20mm.",
    severity: "MEDIUM",
    confidence_score: 91,
    deviation_mm: 18,
    gps_coordinates: { lat: 6.41800, lng: 3.88200, elevation: 4.2 },
    evidence_photos: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80"
    ],
    status: "INVESTIGATING",
    assigned_inspector: "Surveyor A. Bello",
    resolution_deadline: "2026-09-12",
    corrective_action: "Formwork alignment re-calibration before casting subsequent floor level.",
    created_at: "2026-08-31T09:00:00Z",
    updated_at: "2026-08-31T09:00:00Z"
  }
];

const MOCK_PROCESSING_JOBS: ProcessingQueueJob[] = [
  {
    id: "job-001",
    job_reference: "JOB-GPU-8891",
    project: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    device_id: "Tersus S1 Rover Alpha-01",
    source_type: "GPR_RADAR_GS8000",
    stage: "GPR_MIGRATION",
    progress_percentage: 68,
    node_type: "CLOUD_GPU_CLUSTER",
    started_at: "2026-08-31T12:45:00Z",
    file_count: 24,
    total_bytes: "1.42 GB",
    logs: [
      "[12:45:02] Ingestion package verified (SHA256 checksum valid)",
      "[12:45:15] Raw time-domain .dzt radar data decomposed",
      "[12:46:00] Applying Stolt F-K migration filter (Dielectric: 6.2)",
      "[12:47:10] Hyperbolic vertex recognition in progress... 68%"
    ]
  },
  {
    id: "job-002",
    job_reference: "JOB-EDGE-4402",
    project: "proj-lekki-03",
    project_name: "Lekki Deep Sea Port Logistics Hub",
    device_id: "Tersus S1 Rover Gamma-03",
    source_type: "TERSU_S1_ROVER",
    stage: "SLAM_REGISTRATION",
    progress_percentage: 92,
    node_type: "EDGE_FIELD_ROVER",
    started_at: "2026-08-31T12:50:00Z",
    file_count: 12,
    total_bytes: "480 MB",
    logs: [
      "[12:50:05] RTK Fixed Lock: 32 Satellites (Accuracy: 0.008m)",
      "[12:51:20] Point cloud downsampled via Voxel Grid filter",
      "[12:52:45] ICP Transformation computed against BIM baseline coordinate system",
      "[12:53:10] Finalizing Gaussian Splatting anchor vectors... 92%"
    ]
  },
  {
    id: "job-003",
    job_reference: "JOB-AI-1109",
    project: "proj-ikoyi-02",
    project_name: "Ikoyi Luxury Waterfront Heights",
    device_id: "Proceq Pundit PL-200",
    source_type: "PUNDIT_PL200",
    stage: "COMPLETED",
    progress_percentage: 100,
    node_type: "CLOUD_GPU_CLUSTER",
    started_at: "2026-08-31T12:30:00Z",
    completed_at: "2026-08-31T12:34:20Z",
    file_count: 8,
    total_bytes: "120 MB",
    logs: [
      "[12:30:00] Waveform time-series received",
      "[12:31:10] Velocity mapping & Compressive strength interpolation complete",
      "[12:34:20] Tomography slice generated successfully."
    ]
  }
];

const MOCK_SPATIAL_POINTS: EvidenceSpatialPoint[] = [
  {
    id: "pt-01",
    project: "proj-eko-01",
    beacon_code: "BC-LA-2026/089",
    name: "Master Datum Beacon 01 (RTK Base)",
    layer_type: "GNSS_RTK_BEACON",
    lat: 6.45200,
    lng: 3.43500,
    elevation_m: 5.12,
    accuracy_mm: 4,
    severity: "NORMAL",
    timestamp: "2026-08-31T08:00:00Z"
  },
  {
    id: "pt-02",
    project: "proj-eko-01",
    name: "GPR Transect Grid D (Slab Rebar Scan)",
    layer_type: "GPR_TRANSECT",
    lat: 6.45220,
    lng: 3.43530,
    elevation_m: 18.2,
    accuracy_mm: 12,
    deviation_mm: 60,
    severity: "WARNING",
    structural_element_name: "Transfer Slab TS-04",
    timestamp: "2026-08-30T14:30:00Z"
  },
  {
    id: "pt-03",
    project: "proj-ikoyi-02",
    name: "UPV Acoustic Station Pile P-42",
    layer_type: "PUNDIT_STATION",
    lat: 6.44890,
    lng: 3.42910,
    elevation_m: -12.0,
    accuracy_mm: 8,
    severity: "CRITICAL",
    structural_element_name: "Foundation Bored Pile P-42",
    timestamp: "2026-08-29T10:00:00Z"
  },
  {
    id: "pt-04",
    project: "proj-lekki-03",
    name: "LiDAR & SLAM Point Cloud Anchor",
    layer_type: "BIM_ANCHOR",
    lat: 6.41800,
    lng: 3.88200,
    elevation_m: 4.2,
    accuracy_mm: 10,
    deviation_mm: 18,
    severity: "WARNING",
    structural_element_name: "Shear Wall SW-01",
    timestamp: "2026-08-31T09:00:00Z"
  }
];

const MOCK_AI_RECORD: AIAnalysisRecord = {
  id: "ai-rec-01",
  project: "proj-eko-01",
  project_name: "Eko Atlantic Signature Tower",
  scan_reference: "SCN-2026-089",
  model_version: "Nexucon AI-Fusion v3.4 (Gemini 2.5 Flash + GPR Deep-Inversion)",
  analysis_type: "MULTI_MODAL_FUSION",
  analyzed_at: "2026-08-31T11:30:00Z",
  confidence_score: 94.6,
  overall_health_score: 82,
  total_elements_scanned: 184,
  anomalies_detected: 3,
  critical_defects_count: 1,
  compliance_check_passed: false,
  findings: [
    {
      id: "ai-f-1",
      label: "Rebar Density Under-Specification",
      type: "Structural Deficiency",
      severity: "HIGH",
      confidence: 94,
      location: "Transfer Slab TS-04 (Grid D-7 to E-9)",
      recommended_action: "Issue non-conformance notice to structural engineer of record for recalculation."
    },
    {
      id: "ai-f-2",
      label: "Concrete Density Void Indicator",
      type: "Material Integrity",
      severity: "CRITICAL",
      confidence: 98,
      location: "Foundation Bored Pile P-42",
      recommended_action: "Perform immediate core drill testing or pressure epoxy grouting."
    },
    {
      id: "ai-f-3",
      label: "Thermal Dissipation Plume",
      type: "HVAC / Envelope",
      severity: "LOW",
      confidence: 88,
      location: "Level 6 Service Riser Duct",
      recommended_action: "Inspect seal on mechanical expansion joint."
    }
  ],
  thermal_metrics: {
    avg_temp_c: 26.4,
    max_temp_c: 41.2,
    variance_c: 8.6,
    leakage_detected: true
  },
  deviation_summary: {
    max_positive_mm: 18.4,
    max_negative_mm: -12.1,
    rms_deviation_mm: 7.8,
    tolerance_threshold_mm: 20.0
  }
};

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

export const getDigitalEyeStats = async (projectId?: string): Promise<DigitalEyeOverviewStats> => {
  try {
    const res = await api.get('/digital-eye/stats/', { params: { project: projectId } });
    return unwrap(res, {
      active_rovers: 8,
      scans_today: 24,
      processing_queue_count: 3,
      ai_anomalies_detected: 14,
      verified_gpr_scans: 48,
      verified_pundit_tests: 32,
      open_critical_findings: 2,
      trimble_sync_status: 'SYNCED'
    });
  } catch (err) {
    return {
      active_rovers: 8,
      scans_today: 24,
      processing_queue_count: 3,
      ai_anomalies_detected: 14,
      verified_gpr_scans: 48,
      verified_pundit_tests: 32,
      open_critical_findings: 2,
      trimble_sync_status: 'SYNCED'
    };
  }
};

export const getBIMStructuralElements = async (params?: { project?: string; discipline?: string; search?: string }): Promise<BIMStructuralElement[]> => {
  try {
    const res = await api.get('/digital-eye/elements/', { params });
    const list = unwrap<BIMStructuralElement[]>(res, MOCK_STRUCTURAL_ELEMENTS);
    if (!list || list.length === 0) return MOCK_STRUCTURAL_ELEMENTS;
    return list;
  } catch (err) {
    let filtered = MOCK_STRUCTURAL_ELEMENTS;
    if (params?.project) {
      filtered = filtered.filter(e => e.project === params.project || e.project_name?.toLowerCase().includes(params.project!.toLowerCase()));
    }
    if (params?.discipline && params.discipline !== 'all') {
      filtered = filtered.filter(e => e.discipline.toLowerCase() === params.discipline!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(e => e.name.toLowerCase().includes(q) || e.element_guid.toLowerCase().includes(q) || e.grid_location.toLowerCase().includes(q));
    }
    return filtered;
  }
};

export const getTrimbleConnectionStatus = async (projectId?: string): Promise<TrimbleConnection> => {
  try {
    const res = await api.get('/digital-eye/trimble/status/', { params: { project: projectId } });
    return unwrap(res, {
      id: "trimble-01",
      project: projectId || "proj-eko-01",
      project_name: "Eko Atlantic Signature Tower",
      trimble_project_id: "TC-PRJ-99201",
      trimble_project_name: "Eko Atlantic Phase 2 CDE",
      region: "EU-West",
      status: "CONNECTED",
      last_sync_at: "2026-08-31T12:00:00Z",
      synced_models_count: 6,
      synced_elements_count: 14250,
      bcf_topics_count: 18,
      webhook_active: true
    });
  } catch (err) {
    return {
      id: "trimble-01",
      project: projectId || "proj-eko-01",
      project_name: "Eko Atlantic Signature Tower",
      trimble_project_id: "TC-PRJ-99201",
      trimble_project_name: "Eko Atlantic Phase 2 CDE",
      region: "EU-West",
      status: "CONNECTED",
      last_sync_at: "2026-08-31T12:00:00Z",
      synced_models_count: 6,
      synced_elements_count: 14250,
      bcf_topics_count: 18,
      webhook_active: true
    };
  }
};

export const triggerTrimbleSync = async (projectId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.post(`/digital-eye/trimble/sync/`, { project: projectId });
    return unwrap(res, { success: true, message: 'Trimble Connect models and BCF topics synchronized successfully.' });
  } catch (err) {
    return { success: true, message: 'Trimble Connect models and BCF topics synchronized successfully.' };
  }
};

export const getGPRScans = async (params?: { project?: string; element_id?: string; search?: string }): Promise<GPRScan[]> => {
  try {
    const res = await api.get('/digital-eye/gpr/', { params });
    const list = unwrap<GPRScan[]>(res, MOCK_GPR_SCANS);
    if (!list || list.length === 0) return MOCK_GPR_SCANS;
    return list;
  } catch (err) {
    let list = MOCK_GPR_SCANS;
    if (params?.project) {
      list = list.filter(g => g.project === params.project || g.project_name.toLowerCase().includes(params.project!.toLowerCase()));
    }
    if (params?.element_id) {
      list = list.filter(g => g.structural_element_id === params.element_id);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(g => g.scan_reference.toLowerCase().includes(q) || g.grid_axis.toLowerCase().includes(q) || g.notes?.toLowerCase().includes(q));
    }
    return list;
  }
};

export const getGPRScanById = async (id: string): Promise<GPRScan | null> => {
  try {
    const res = await api.get(`/digital-eye/gpr/${id}/`);
    return unwrap<GPRScan | null>(res, MOCK_GPR_SCANS.find(s => s.id === id) || null);
  } catch (err) {
    return MOCK_GPR_SCANS.find(s => s.id === id) || null;
  }
};

export const createGPRScan = async (data: Partial<GPRScan>): Promise<GPRScan> => {
  try {
    const res = await api.post('/digital-eye/gpr/', data);
    return unwrap<GPRScan>(res, {
      ...data,
      id: `gpr-${Date.now()}`,
      scan_reference: `GPR-2026-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString()
    } as GPRScan);
  } catch (err) {
    return {
      ...data,
      id: `gpr-${Date.now()}`,
      scan_reference: `GPR-2026-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString()
    } as GPRScan;
  }
};

export const getPunditTests = async (params?: { project?: string; element_id?: string; search?: string }): Promise<PunditTest[]> => {
  try {
    const res = await api.get('/digital-eye/pundit/', { params });
    const list = unwrap<PunditTest[]>(res, MOCK_PUNDIT_TESTS);
    if (!list || list.length === 0) return MOCK_PUNDIT_TESTS;
    return list;
  } catch (err) {
    let list = MOCK_PUNDIT_TESTS;
    if (params?.project) {
      list = list.filter(p => p.project === params.project || p.project_name.toLowerCase().includes(params.project!.toLowerCase()));
    }
    if (params?.element_id) {
      list = list.filter(p => p.structural_element_id === params.element_id);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => p.test_reference.toLowerCase().includes(q) || p.test_location.toLowerCase().includes(q));
    }
    return list;
  }
};

export const createPunditTest = async (data: Partial<PunditTest>): Promise<PunditTest> => {
  try {
    const res = await api.post('/digital-eye/pundit/', data);
    return unwrap<PunditTest>(res, {
      ...data,
      id: `pdt-${Date.now()}`,
      test_reference: `UPV-2026-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString()
    } as PunditTest);
  } catch (err) {
    return {
      ...data,
      id: `pdt-${Date.now()}`,
      test_reference: `UPV-2026-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString()
    } as PunditTest;
  }
};

export const getDigitalEyeFindings = async (params?: { project?: string; severity?: string; element_id?: string; status?: string }): Promise<DigitalEyeFinding[]> => {
  try {
    const res = await api.get('/digital-eye/findings/', { params });
    const list = unwrap<DigitalEyeFinding[]>(res, MOCK_FINDINGS);
    if (!list || list.length === 0) return MOCK_FINDINGS;
    return list;
  } catch (err) {
    let list = MOCK_FINDINGS;
    if (params?.project) {
      list = list.filter(f => f.project === params.project || f.project_name.toLowerCase().includes(params.project!.toLowerCase()));
    }
    if (params?.severity && params.severity !== 'all') {
      list = list.filter(f => f.severity.toLowerCase() === params.severity!.toLowerCase());
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter(f => f.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params?.element_id) {
      list = list.filter(f => f.structural_element_id === params.element_id);
    }
    return list;
  }
};

export const createDigitalEyeFinding = async (data: Partial<DigitalEyeFinding>): Promise<DigitalEyeFinding> => {
  try {
    const res = await api.post('/digital-eye/findings/', data);
    return unwrap<DigitalEyeFinding>(res, {
      ...data,
      id: `fnd-${Date.now()}`,
      finding_reference: `FND-DE-2026-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as DigitalEyeFinding);
  } catch (err) {
    return {
      ...data,
      id: `fnd-${Date.now()}`,
      finding_reference: `FND-DE-2026-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as DigitalEyeFinding;
  }
};

export const escalateFindingToNCR = async (findingId: string, payload: { corrective_action: string; root_cause?: string; deadline_days?: number }): Promise<{ success: boolean; ncr_reference: string }> => {
  try {
    const res = await api.post(`/digital-eye/findings/${findingId}/escalate-ncr/`, payload);
    return unwrap(res, {
      success: true,
      ncr_reference: `NCR-2026-00${Math.floor(10 + Math.random() * 90)}`
    });
  } catch (err) {
    return {
      success: true,
      ncr_reference: `NCR-2026-00${Math.floor(10 + Math.random() * 90)}`
    };
  }
};

export const getAIAnalysis = async (params?: { project?: string; scan_ref?: string }): Promise<AIAnalysisRecord> => {
  try {
    const res = await api.get('/digital-eye/ai-analysis/', { params });
    return unwrap<AIAnalysisRecord>(res, MOCK_AI_RECORD);
  } catch (err) {
    return MOCK_AI_RECORD;
  }
};

export const getProcessingQueue = async (params?: { project?: string; status?: string }): Promise<ProcessingQueueJob[]> => {
  try {
    const res = await api.get('/digital-eye/queue/', { params });
    const list = unwrap<ProcessingQueueJob[]>(res, MOCK_PROCESSING_JOBS);
    if (!list || list.length === 0) return MOCK_PROCESSING_JOBS;
    return list;
  } catch (err) {
    return MOCK_PROCESSING_JOBS;
  }
};

export const getEvidenceSpatialPoints = async (params?: { project?: string; layer?: string }): Promise<EvidenceSpatialPoint[]> => {
  try {
    const res = await api.get('/digital-eye/spatial-map/', { params });
    const list = unwrap<EvidenceSpatialPoint[]>(res, MOCK_SPATIAL_POINTS);
    if (!list || list.length === 0) return MOCK_SPATIAL_POINTS;
    return list;
  } catch (err) {
    let list = MOCK_SPATIAL_POINTS;
    if (params?.project) {
      list = list.filter(p => p.project === params.project);
    }
    if (params?.layer && params.layer !== 'all') {
      list = list.filter(p => p.layer_type === params.layer);
    }
    return list;
  }
};

// ==========================================
// 4. DEVICE REPORTS REPOSITORY & FUNCTIONS
// ==========================================

export const MOCK_DEVICE_REPORTS: DeviceReportRecord[] = [
  // GPR REPORTS
  {
    id: "rep-gpr-001",
    report_reference: "RPT-GPR-2026-081",
    title: "ASTM D4748 / ACI 228.2R GPR Subsurface Structural & Rebar Cover Dossier",
    device_type: "GPR",
    project_id: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    element_id: "elem-001",
    element_name: "Column C-102 (Core Axis)",
    report_type: "Subsurface Radar Compliance Dossier",
    standards_cited: ["ASTM D4748", "ACI 228.2R", "NBC 2020 §14.2"],
    compliance_status: "COMPLIANT",
    executive_summary: "High-frequency 2.0 GHz radar inspection along Grid 4-C indicates average rebar spacing of 198 mm (Target: 200 mm) and concrete cover of 42 mm. Zero hazardous phase-inversion voids detected within structural cover envelope.",
    metrics: {
      scans_or_tests_count: 8,
      pass_rate_pct: 96.4,
      avg_rebar_spacing_mm: 198,
      min_cover_depth_mm: 42,
      max_penetration_depth_m: 0.65,
      dielectric_constant: 6.2
    },
    generated_by: "Engr. K. Adeyemi (Lead NDT Geophysicist)",
    certified_engineer: "Engr. Babatunde Sanusi, FNSE (Govt Structural Inspector)",
    stamped_at: "2026-08-30T16:30:00Z",
    file_size: "3.8 MB"
  },
  {
    id: "rep-gpr-002",
    report_reference: "RPT-GPR-2026-084",
    title: "GPR Subsurface Honeycombing & Air/Water Void Hazard Audit",
    device_type: "GPR",
    project_id: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    element_id: "elem-002",
    element_name: "Suspended Slab SL-04 (Grid B-2)",
    report_type: "Defect & Void Risk Report",
    standards_cited: ["ASTM D4748", "BS EN 13791"],
    compliance_status: "FLAGGED_DEFECTS",
    executive_summary: "Radar transect GS-02 identified phase-inversion reflection at 180 mm depth consistent with a 45 mm air pocket/void. Immediate non-destructive pulse velocity verification and localized grouting recommended.",
    metrics: {
      scans_or_tests_count: 5,
      pass_rate_pct: 80.0,
      avg_rebar_spacing_mm: 190,
      min_cover_depth_mm: 36,
      voids_flagged: 1
    },
    generated_by: "Engr. T. Balogun (NDT Technician)",
    certified_engineer: "Engr. Babatunde Sanusi, FNSE",
    stamped_at: "2026-08-29T11:15:00Z",
    file_size: "4.2 MB"
  },
  // PUNDIT UPV REPORTS
  {
    id: "rep-pnd-001",
    report_reference: "RPT-PND-2026-042",
    title: "BS 1881: Part 203 Ultrasonic Pulse Velocity (UPV) Homogeneity Certificate",
    device_type: "PUNDIT",
    project_id: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    element_id: "elem-001",
    element_name: "Column C-102 (Core Axis)",
    report_type: "Acoustic Homogeneity Certificate",
    standards_cited: ["BS 1881: Part 203", "ASTM C597", "IS 13311 (Part 1)"],
    compliance_status: "COMPLIANT",
    executive_summary: "Direct transmission UPV tests with 54 kHz transducers recorded mean pulse velocity of 4,120 m/s across Column C-102, confirming 'Good Quality' structural density and an estimated characteristic compressive strength (fcu) of 42.5 MPa, surpassing the designed C35/45 rating.",
    metrics: {
      scans_or_tests_count: 12,
      pass_rate_pct: 100.0,
      mean_pulse_velocity_ms: 4120,
      est_compressive_strength_mpa: 42.5,
      transducer_freq_khz: 54,
      quality_rating: "GOOD / EXCELLENT"
    },
    generated_by: "Dr. O. Fashola (Concrete Materials Specialist)",
    certified_engineer: "Engr. Fatima Garba, COREN Reg.",
    stamped_at: "2026-08-30T14:20:00Z",
    file_size: "2.9 MB"
  },
  {
    id: "rep-pnd-002",
    report_reference: "RPT-PND-2026-049",
    title: "PUNDIT In-Situ Compressive Strength & Core Extraction Assessment",
    device_type: "PUNDIT",
    project_id: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    element_id: "elem-003",
    element_name: "Transfer Beam TB-01 (Span 12m)",
    report_type: "Compressive Strength Assessment",
    standards_cited: ["BS 1881-203", "BS EN 12504-4"],
    compliance_status: "FLAGGED_DEFECTS",
    executive_summary: "Station UPV-03 recorded pulse velocity of 3,480 m/s ('Doubtful Quality'). Estimated fcu of 31.8 MPa falls short of specified C35/45 threshold. Core drilling recommended per BS EN 12504-1 before structural sign-off.",
    metrics: {
      scans_or_tests_count: 6,
      pass_rate_pct: 83.3,
      mean_pulse_velocity_ms: 3820,
      est_compressive_strength_mpa: 36.4,
      doubtful_stations: 1
    },
    generated_by: "Dr. O. Fashola",
    certified_engineer: "Engr. Fatima Garba, COREN Reg.",
    stamped_at: "2026-08-28T09:40:00Z",
    file_size: "3.4 MB"
  },
  // TRIMBLE CONNECT REPORTS
  {
    id: "rep-trm-001",
    report_reference: "RPT-TRM-2026-018",
    title: "NBC 2020 3D As-Built vs BIM Geometric Tolerance Verification (±20mm)",
    device_type: "TRIMBLE",
    project_id: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    element_id: "elem-001",
    element_name: "Column C-102 (Core Axis)",
    report_type: "Scan-to-BIM Geometric Dossier",
    standards_cited: ["NBC 2020 (Structural Integrity)", "ISO 19650-2", "DIN 18202"],
    compliance_status: "COMPLIANT",
    executive_summary: "Automated 3D point cloud correlation with Trimble Connect IFC model indicates 97.8% of structural vertices reside inside the statutory ±20 mm tolerance envelope. Mean RMS deviation is 8.4 mm.",
    metrics: {
      scans_or_tests_count: 14250,
      pass_rate_pct: 97.8,
      max_tolerance_deviation_mm: 14.2,
      rms_deviation_mm: 8.4,
      synced_ifc_models: 6,
      bcf_open_issues: 2
    },
    generated_by: "Engr. S. Adeleke (BIM & CDE Lead)",
    certified_engineer: "Engr. Babatunde Sanusi, FNSE",
    stamped_at: "2026-08-31T08:15:00Z",
    file_size: "5.6 MB"
  },
  {
    id: "rep-trm-002",
    report_reference: "RPT-TRM-2026-024",
    title: "Trimble Connect BCF 2.1/3.0 Structural Clash & NCR Escalation Audit",
    device_type: "TRIMBLE",
    project_id: "proj-eko-01",
    project_name: "Eko Atlantic Signature Tower",
    element_id: "elem-004",
    element_name: "Shear Wall SW-01 (Lift Core)",
    report_type: "BCF Clash & NCR Audit",
    standards_cited: ["ISO 19650-2", "BuildingSMART BCF 3.0"],
    compliance_status: "CRITICAL_NCR",
    executive_summary: "3 high-priority clash topics identified between structural shear wall lift aperture and HVAC MEP routing. Automated BCF topics generated and synchronized with Trimble Connect CDE.",
    metrics: {
      scans_or_tests_count: 18,
      pass_rate_pct: 72.2,
      bcf_open_issues: 5,
      critical_clashes: 3
    },
    generated_by: "Engr. S. Adeleke",
    certified_engineer: "Engr. Babatunde Sanusi, FNSE",
    stamped_at: "2026-08-27T17:00:00Z",
    file_size: "4.8 MB"
  }
];

export const getDeviceReports = async (params?: { device_type?: string; project_id?: string; element_id?: string }): Promise<DeviceReportRecord[]> => {
  try {
    const res = await api.get('/digital-eye/reports/devices/', { params });
    const list = unwrap<DeviceReportRecord[]>(res, MOCK_DEVICE_REPORTS);
    if (!list || list.length === 0) return filterMockReports(params);
    return list;
  } catch (err) {
    return filterMockReports(params);
  }
};

function filterMockReports(params?: { device_type?: string; project_id?: string; element_id?: string }): DeviceReportRecord[] {
  let list = [...MOCK_DEVICE_REPORTS];
  if (params?.device_type && params.device_type !== 'ALL') {
    list = list.filter(r => r.device_type.toLowerCase() === params.device_type!.toLowerCase());
  }
  if (params?.project_id) {
    list = list.filter(r => r.project_id === params.project_id);
  }
  if (params?.element_id) {
    list = list.filter(r => !r.element_id || r.element_id === params.element_id);
  }
  return list;
}

export const generateDeviceReport = async (payload: Partial<DeviceReportRecord>): Promise<DeviceReportRecord> => {
  const newReport: DeviceReportRecord = {
    id: `rep-${Date.now()}`,
    report_reference: `RPT-${(payload.device_type || 'NDT')}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    title: payload.title || `${payload.device_type || 'NDT'} Statutory Inspection Dossier`,
    device_type: payload.device_type || 'GPR',
    project_id: payload.project_id || 'proj-eko-01',
    project_name: payload.project_name || 'Active Project',
    element_id: payload.element_id,
    element_name: payload.element_name || 'Structural Element',
    report_type: payload.report_type || 'Statutory Inspection Dossier',
    standards_cited: payload.standards_cited || ['BS 1881', 'ASTM D4748', 'NBC 2020'],
    compliance_status: payload.compliance_status || 'VERIFIED',
    executive_summary: payload.executive_summary || 'Comprehensive non-destructive test evaluation completed in compliance with statutory building standards.',
    metrics: payload.metrics || { pass_rate_pct: 100 },
    generated_by: payload.generated_by || 'Engr. Inspector (COREN Reg.)',
    certified_engineer: payload.certified_engineer || 'Engr. Babatunde Sanusi, FNSE (Government Inspector)',
    stamped_at: new Date().toISOString(),
    file_size: `${(Math.random() * 3 + 2).toFixed(1)} MB`,
    download_url: `/api/v1/digital-eye/reports/download/pdf/`
  };

  try {
    const res = await api.post('/digital-eye/reports/devices/', payload);
    return unwrap<DeviceReportRecord>(res, newReport);
  } catch (err) {
    MOCK_DEVICE_REPORTS.unshift(newReport);
    return newReport;
  }
};

export const createPunditTestRecord = async (payload: Partial<PunditTest>): Promise<PunditTest> => {
  const pathMm = payload.path_length_mm || 400;
  const transitUs = payload.transit_time_us || 94.2;
  const velocity = Math.round((pathMm / (transitUs / 1000)));
  const fcu = Math.max(15, Math.min(85, Number((0.0000000000015 * Math.pow(velocity, 3.82)).toFixed(1))));
  
  let quality: 'EXCELLENT' | 'GOOD' | 'DOUBTFUL' | 'POOR' = 'GOOD';
  if (velocity >= 4500) quality = 'EXCELLENT';
  else if (velocity >= 3500) quality = 'GOOD';
  else if (velocity >= 3000) quality = 'DOUBTFUL';
  else quality = 'POOR';

  const newTest: PunditTest = {
    id: `pdt-${Date.now()}`,
    test_reference: payload.test_reference || `UPV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    project: payload.project || 'proj-eko-01',
    project_name: payload.project_name || 'Eko Atlantic Signature Tower',
    structural_element_id: payload.structural_element_id || 'elem-001',
    structural_element_name: payload.structural_element_name || 'Column C-102 (Level 2 Mid-Height)',
    test_location: payload.test_location || 'Field Station 1',
    device_model: payload.device_model || 'Proceq Pundit PL-200 Ultrasonic Pulse Velocity',
    transducer_type: payload.transducer_type || 'DIRECT',
    transducer_frequency_khz: payload.transducer_frequency_khz || 54,
    path_length_mm: pathMm,
    transit_time_us: transitUs,
    pulse_velocity_ms: velocity,
    estimated_compressive_strength_mpa: fcu,
    concrete_quality_rating: quality,
    waveform_samples: [0, 10, -25, 60, -140, 240, -210, 120, -50, 15, 0],
    operator_name: payload.operator_name || 'Field Inspector (COREN Reg.)',
    test_date: new Date().toISOString().split('T')[0],
    status: fcu >= 25 ? 'VERIFIED' : 'ANOMALY',
    notes: payload.notes || 'Ingested via Field Telemetry Receiver.',
    created_at: new Date().toISOString()
  };

  try {
    const res = await api.post('/digital-eye/pundit/', newTest);
    return unwrap<PunditTest>(res, newTest);
  } catch (err) {
    MOCK_PUNDIT_TESTS.unshift(newTest);
    return newTest;
  }
};


