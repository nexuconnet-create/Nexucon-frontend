import api from './api';

export interface DailySiteUpdate {
  id: string;
  update_reference: string;
  project: string;
  project_name: string;
  project_reference: string;
  project_location?: string;
  update_type: 'DAILY_PHOTO' | 'DRONE_SURVEY' | 'PROGRESS_REPORT' | 'SITE_LOG';
  reported_by?: string;
  reported_by_name: string;
  progress_percentage: number;
  work_summary: string;
  photos?: string[];
  drone_survey_data?: any;
  weather_condition?: string;
  site_weather?: string;
  workforce_count?: number;
  active_workers_count?: number;
  gps_coordinates?: { lat?: number; lng?: number };
  status: 'Active' | 'Pending Verification' | 'Approved' | 'Flagged';
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface FieldObservation {
  id: string;
  observation_reference: string;
  project: string;
  project_name: string;
  project_reference: string;
  project_location?: string;
  category: 'QUALITY' | 'SAFETY' | 'PROGRESS' | 'ENVIRONMENTAL' | 'GENERAL';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'RESOLVED' | 'CLOSED';
  assigned_officer?: string;
  assigned_officer_name?: string;
  observed_by_name: string;
  gps_coordinates?: { lat?: number; lng?: number };
  evidence_photos?: string[];
  corrective_action?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteIssue {
  id: string;
  issue_reference: string;
  project: string;
  project_name: string;
  project_reference: string;
  project_location?: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  assigned_to_name: string;
  reported_by_name: string;
  due_date?: string;
  resolution_evidence?: string[];
  resolution_notes?: string;
  is_escalated: boolean;
  created_at: string;
  updated_at: string;
}

export interface MilestoneDocument {
  name: string;
  url: string;
  file_type?: string;
  size?: string;
  category?: string;
  verified?: boolean;
}

export interface MilestoneDependency {
  id?: string;
  predecessor_id?: string;
  code?: string;
  name?: string;
  milestone_name?: string;
  status?: string;
  is_blocking?: boolean;
}

export interface MilestoneInspectionLink {
  id?: string;
  ref?: string;
  type: string;
  status: string;
  outcome?: string;
  date?: string;
}

export interface MilestoneIssueLink {
  id?: string;
  ref?: string;
  title: string;
  severity: string;
  status: string;
}

export interface MilestoneGateCheck {
  key: string;
  title: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  required: boolean;
  details?: string;
}

export interface MilestoneGateEvaluation {
  all_gates_passed: boolean;
  is_blocked: boolean;
  gates: MilestoneGateCheck[];
  blockers: string[];
  summary?: string;
}

export interface MilestoneVerificationSignoff {
  certificate_reference?: string;
  digital_cert_ref?: string;
  signature_hash?: string;
  verified_by_name?: string;
  verified_by_role?: string;
  verified_at?: string;
  signed_at?: string;
  signer_name?: string;
  signer_role?: string;
  notes?: string;
  override_applied?: boolean;
  gate_evaluation_summary?: string;
}

export interface MilestoneAuditEvent {
  id: string;
  audit_reference?: string;
  action: string;
  user_name: string;
  user_role?: string;
  timestamp: string;
  severity?: string;
  signature_hash?: string;
  previous_state?: any;
  new_state?: any;
}

export interface ConstructionMilestone {
  id: string;
  milestone_code: string;
  project: string;
  project_name: string;
  project_reference: string;
  project_location?: string;
  project_status?: string;
  name: string;
  phase: 'SUBSTRUCTURE' | 'STRUCTURAL_FRAME' | 'SUPERSTRUCTURE' | 'MEP_ROUGHIN' | 'FACADE_ENVELOPE' | 'FINISHES' | 'COMMISSIONING' | string;
  description?: string;
  sequence_order: number;
  critical_path: boolean;
  planned_start_date?: string;
  target_date: string;
  actual_start_date?: string;
  actual_completion_date?: string;
  baseline_start_date?: string;
  baseline_end_date?: string;
  duration_days: number;
  variance_days: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'DUE_THIS_WEEK' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'COMPLETED' | 'DELAYED' | 'BLOCKED' | 'ON_HOLD' | 'UPCOMING';
  progress_percentage: number;
  physical_progress_notes?: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_factors?: string[];
  dependencies?: MilestoneDependency[];
  linked_inspection_ids?: MilestoneInspectionLink[];
  linked_issue_ids?: MilestoneIssueLink[];
  linked_bim_model_id?: string;
  bim_deviation_mm?: number;
  bim_tolerance_max_mm?: number;
  survey_variance_meters?: number;
  digital_eye_verified?: boolean;
  evidence_documents?: (MilestoneDocument | any)[];
  evidence_photos?: string[];
  verification_requirements?: Record<string, boolean>;
  verification_signoff?: MilestoneVerificationSignoff;
  gate_evaluation?: MilestoneGateEvaluation;
  verified_by_name?: string;
  verified_at?: string;
  is_delayed?: boolean;
  delay_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteVerificationTelemetry {
  satellites_tracked?: number;
  constellations?: string[];
  hdop?: number;
  vdop?: number;
  rtk_fix_status?: string;
  correction_latency_sec?: number;
  base_station_ref?: string;
}

export interface SiteVerification {
  id: string;
  verification_reference: string;
  project: string;
  project_name: string;
  project_reference: string;
  project_location?: string;
  project_status?: string;
  method: 'GNSS_RTK_SURVEY' | 'TERSU_ROVER' | 'DRONE_PHOTOGRAMMETRY' | 'GPR_SCAN' | 'TOTAL_STATION' | 'SETBACK_AUDIT' | 'LEVEL_ELEVATION' | string;
  device_identifier: string;
  cadastral_beacon_numbers?: string[];
  boundary_coordinates?: { point: string; lat: number; lng: number; elevation?: number }[];
  captured_coordinates?: { lat?: number; lng?: number; elevation?: number; accuracy_horizontal_mm?: number };
  approved_coordinates?: { lat?: number; lng?: number; elevation?: number };
  variance_meters: number;
  elevation_variance_meters?: number;
  tolerance_limit_meters?: number;
  variance_detected: boolean;
  encroachment_detected?: boolean;
  encroachment_details?: string;
  is_within_tolerance?: boolean;
  tolerance_status?: 'COMPLIANT' | 'EXCEEDS_TOLERANCE' | 'ENCROACHMENT_DETECTED' | string;
  telemetry_data?: SiteVerificationTelemetry;
  evidence_documents?: (MilestoneDocument | any)[];
  evidence_photos?: string[];
  digital_cert_ref?: string;
  signature_hash?: string;
  status: 'PENDING_VERIFICATION' | 'IN_PROGRESS' | 'VERIFIED' | 'VARIANCE_DETECTED' | 'FLAGGED' | 'RESOLVED' | string;
  verified_by_name?: string;
  verified_by_role?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MonitoringStats {
  live: {
    active_sites: number;
    daily_photos: number;
    drone_surveys: number;
    active_observations: number;
  };
  progress: {
    on_schedule: number;
    delayed: number;
    milestone_reached: number;
    progress_reports: number;
  };
  observations: {
    active: number;
    quality: number;
    safety: number;
    resolved: number;
  };
  issues: {
    open: number;
    critical: number;
    under_review: number;
    resolved: number;
  };
  milestones: {
    total?: number;
    due_this_week: number;
    verified: number;
    delayed: number;
    upcoming: number;
    pending_verification?: number;
    blocked?: number;
  };
  verification: {
    pending: number;
    verified: number;
    variance_detected: number;
    active_devices: number;
  };
}

// Daily Site Updates
export const getDailySiteUpdates = async (params?: {
  project?: string;
  type?: string;
  status?: string;
  search?: string;
}): Promise<DailySiteUpdate[]> => {
  try {
    const res: any = await api.get('/monitoring/updates/', { params });
    return Array.isArray(res) ? res : (res?.results || res?.data || []);
  } catch (err) {
    console.warn('getDailySiteUpdates fallback notice:', err);
    return [];
  }
};

export const createDailySiteUpdate = async (payload: {
  project: string;
  update_type: string;
  progress_percentage?: number;
  work_summary: string;
  photos?: string[];
  weather_condition?: string;
  workforce_count?: number;
  gps_coordinates?: any;
}): Promise<DailySiteUpdate> => {
  const res: any = await api.post('/monitoring/updates/', payload);
  return res.data || res;
};

// Field Observations
export const getFieldObservations = async (params?: {
  project?: string;
  category?: string;
  severity?: string;
  status?: string;
  search?: string;
}): Promise<FieldObservation[]> => {
  try {
    const res: any = await api.get('/monitoring/observations/', { params });
    return Array.isArray(res) ? res : (res?.results || res?.data || []);
  } catch (err) {
    console.warn('getFieldObservations fallback notice:', err);
    return [];
  }
};

export const createFieldObservation = async (payload: {
  project: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  corrective_action?: string;
  evidence_photos?: string[];
  gps_coordinates?: any;
}): Promise<FieldObservation> => {
  const res: any = await api.post('/monitoring/observations/', payload);
  return res.data || res;
};

export const resolveFieldObservation = async (
  id: string,
  payload: { notes?: string }
): Promise<FieldObservation> => {
  const res: any = await api.post(`/monitoring/observations/${id}/resolve/`, payload);
  return res.data || res;
};

// Site Issues
export const getSiteIssues = async (params?: {
  project?: string;
  severity?: string;
  status?: string;
  search?: string;
}): Promise<SiteIssue[]> => {
  try {
    const res: any = await api.get('/monitoring/issues/', { params });
    return Array.isArray(res) ? res : (res?.results || res?.data || []);
  } catch (err) {
    console.warn('getSiteIssues fallback notice:', err);
    return [];
  }
};

export const createSiteIssue = async (payload: {
  project: string;
  title: string;
  description: string;
  severity: string;
  assigned_to_name?: string;
  due_date?: string;
}): Promise<SiteIssue> => {
  const res: any = await api.post('/monitoring/issues/', payload);
  return res.data || res;
};

export const escalateSiteIssue = async (
  id: string,
  payload?: { director_name?: string; notes?: string; target_level?: string }
): Promise<SiteIssue> => {
  const res: any = await api.post(`/monitoring/issues/${id}/escalate/`, payload || {});
  return res.data || res;
};

export const resolveSiteIssue = async (
  id: string,
  payload: { notes?: string; evidence?: string[] }
): Promise<SiteIssue> => {
  const res: any = await api.post(`/monitoring/issues/${id}/resolve/`, payload);
  return res.data || res;
};

// ==========================================
// Construction Milestones - Database API
// ==========================================

export const getMilestones = async (params?: {
  project?: string;
  phase?: string;
  status?: string;
  risk?: string;
  critical_path?: boolean;
  search?: string;
}): Promise<ConstructionMilestone[]> => {
  try {
    const res: any = await api.get('/monitoring/milestones/', { params });
    const list: ConstructionMilestone[] = Array.isArray(res) ? res : (res?.results || res?.data || []);
    return list;
  } catch (err) {
    console.error('Failed to fetch milestones from backend database:', err);
    return [];
  }
};

export const getMilestoneById = async (id: string): Promise<ConstructionMilestone> => {
  const res: any = await api.get(`/monitoring/milestones/${id}/`);
  return res.data || res;
};

export const createMilestone = async (payload: Partial<ConstructionMilestone>): Promise<ConstructionMilestone> => {
  const res: any = await api.post('/monitoring/milestones/', payload);
  return res.data || res;
};

export const updateMilestoneProgress = async (
  id: string,
  payload: {
    progress_percentage: number;
    physical_progress_notes?: string;
    evidence_documents?: MilestoneDocument[];
    evidence_photos?: string[];
  }
): Promise<ConstructionMilestone> => {
  const res: any = await api.post(`/monitoring/milestones/${id}/update-progress/`, payload);
  return res.data || res;
};

export const attachMilestoneEvidence = async (
  id: string,
  payload: {
    documents?: MilestoneDocument[];
    photos?: string[];
  }
): Promise<ConstructionMilestone> => {
  const res: any = await api.post(`/monitoring/milestones/${id}/attach-evidence/`, payload);
  return res.data || res;
};

export const submitMilestoneForVerification = async (
  id: string,
  payload?: { physical_progress_notes?: string }
): Promise<ConstructionMilestone> => {
  const res: any = await api.post(`/monitoring/milestones/${id}/submit-verification/`, payload || {});
  return res.data || res;
};

export const verifyMilestone = async (
  id: string,
  payload?: { notes?: string; override_gate?: boolean }
): Promise<ConstructionMilestone> => {
  const res: any = await api.post(`/monitoring/milestones/${id}/verify/`, payload || {});
  return res.data || res;
};

export const flagMilestoneDelay = async (
  id: string,
  payload: { reason: string; revised_target_date?: string }
): Promise<ConstructionMilestone> => {
  const res: any = await api.post(`/monitoring/milestones/${id}/flag-delay/`, payload);
  return res.data || res;
};

export const getMilestoneGateStatus = async (id: string): Promise<MilestoneGateEvaluation> => {
  const res: any = await api.get(`/monitoring/milestones/${id}/gate-status/`);
  return res.data || res;
};

export const getMilestoneAuditTrail = async (id: string): Promise<MilestoneAuditEvent[]> => {
  const res: any = await api.get(`/monitoring/milestones/${id}/audit-trail/`);
  return Array.isArray(res) ? res : (res?.data || []);
};

// ==========================================
// Site Verifications - Database API
// ==========================================

export const getSiteVerifications = async (params?: {
  project?: string;
  method?: string;
  status?: string;
  variance_detected?: boolean;
  encroachment_detected?: boolean;
  search?: string;
}): Promise<SiteVerification[]> => {
  try {
    const res: any = await api.get('/monitoring/verifications/', { params });
    return Array.isArray(res) ? res : (res?.results || res?.data || []);
  } catch (err) {
    console.error('Failed to fetch site verifications from backend:', err);
    return [];
  }
};

export const getSiteVerificationById = async (id: string): Promise<SiteVerification> => {
  const res: any = await api.get(`/monitoring/verifications/${id}/`);
  return res.data || res;
};

export const createSiteVerification = async (payload: Partial<SiteVerification>): Promise<SiteVerification> => {
  const res: any = await api.post('/monitoring/verifications/', payload);
  return res.data || res;
};

export const certifySiteVerification = async (
  id: string,
  payload?: {
    notes?: string;
    override_tolerance?: boolean;
    verified_by_name?: string;
    verified_by_role?: string;
  }
): Promise<SiteVerification> => {
  const res: any = await api.post(`/monitoring/verifications/${id}/certify/`, payload || {});
  return res.data || res;
};

export const flagSiteEncroachment = async (
  id: string,
  payload: {
    reason: string;
    details?: string;
  }
): Promise<SiteVerification> => {
  const res: any = await api.post(`/monitoring/verifications/${id}/flag-encroachment/`, payload);
  return res.data || res;
};

export const attachSiteVerificationEvidence = async (
  id: string,
  payload: {
    documents?: any[];
    photos?: string[];
  }
): Promise<SiteVerification> => {
  const res: any = await api.post(`/monitoring/verifications/${id}/attach-evidence/`, payload);
  return res.data || res;
};

export const getSiteVerificationTelemetry = async (id: string): Promise<SiteVerificationTelemetry> => {
  const res: any = await api.get(`/monitoring/verifications/${id}/telemetry/`);
  return res.data || res;
};

export const getSiteVerificationAuditTrail = async (id: string): Promise<MilestoneAuditEvent[]> => {
  const res: any = await api.get(`/monitoring/verifications/${id}/audit-trail/`);
  return Array.isArray(res) ? res : (res?.data || []);
};

export interface LocationTelemetryResponse {
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  altitude_meters: number;
  distance_to_centroid_meters: number;
  laser_distance_meters: number;
  setback_measured_meters: number;
  setback_target_meters: number;
  setback_status: 'PASS' | 'FAIL';
  google_maps_url: string;
  source: string;
  address: string;
  cors_station_ref: string;
  rtk_fix_status: string;
  satellites_tracked: number;
  cloudflare_r2_sync: boolean;
  timestamp: string;
}

export const calculateLocationTelemetry = async (payload: {
  latitude: number;
  longitude: number;
  project_id?: string;
}): Promise<LocationTelemetryResponse> => {
  const res: any = await api.post('/monitoring/daily-updates/calculate-location/', payload);
  return res.data || res;
};

export const getDailyUpdateTelemetry = async (id: string): Promise<LocationTelemetryResponse> => {
  const res: any = await api.get(`/monitoring/daily-updates/${id}/telemetry/`);
  return res.data || res;
};

export const syncDailyUpdateTelemetry = async (id: string, payload: any): Promise<LocationTelemetryResponse> => {
  const res: any = await api.post(`/monitoring/daily-updates/${id}/telemetry/`, payload);
  return res.data || res;
};

// Statistics Overview
export const getMonitoringStats = async (): Promise<MonitoringStats> => {
  try {
    const res: any = await api.get('/monitoring/stats/overview/');
    return res.data || res;
  } catch (err) {
    console.warn('getMonitoringStats notice:', err);
    return {
      live: { active_sites: 0, daily_photos: 0, drone_surveys: 0, active_observations: 0 },
      progress: { on_schedule: 0, delayed: 0, milestone_reached: 0, progress_reports: 0 },
      observations: { active: 0, quality: 0, safety: 0, resolved: 0 },
      issues: { open: 0, critical: 0, under_review: 0, resolved: 0 },
      milestones: { due_this_week: 0, verified: 0, delayed: 0, upcoming: 0 },
      verification: { pending: 0, verified: 0, variance_detected: 0, active_devices: 0 }
    };
  }
};

export interface ProgrammePhase {
  name: string;
  progress: number;
  status: string;
  color: string;
}

export interface ProjectProgressDetails {
  project_id: string;
  project_name: string;
  reference_number: string;
  project_type: string;
  site_address: string;
  status: string;
  verified_progress: number;
  schedule_status: 'ON_SCHEDULE' | 'AHEAD' | 'MINOR_DELAY' | 'CRITICAL_DELAY';
  schedule_label: string;
  workforce_on_site: number;
  weather_condition: string;
  total_photos_count: number;
  photos: {
    url: string;
    update_ref: string;
    update_type: string;
    date: string;
    work_summary: string;
    reported_by: string;
  }[];
  milestones_total: number;
  milestones_verified: number;
  milestones_delayed: number;
  milestones: {
    id: string;
    name: string;
    target_date: string;
    status: string;
    progress_percentage: number;
    is_delayed: boolean;
  }[];
  phases: ProgrammePhase[];
  latest_update?: {
    reference: string;
    work_summary: string;
    reported_by: string;
    date: string;
  };
  progress_history: {
    date: string;
    progress: number;
    summary: string;
    reported_by: string;
  }[];
}

// Project Progress Endpoints
export const getProjectProgress = async (projectId?: string): Promise<ProjectProgressDetails | ProjectProgressDetails[]> => {
  try {
    const params = projectId ? { project: projectId } : undefined;
    const res: any = await api.get('/monitoring/progress/', { params });
    return res.data || res;
  } catch (err) {
    console.warn('getProjectProgress fallback notice:', err);
    return [];
  }
};

export const updateProjectProgress = async (payload: {
  project: string;
  progress_percentage: number;
  work_summary?: string;
  photos?: string[];
}): Promise<ProjectProgressDetails> => {
  const res: any = await api.post('/monitoring/progress/update/', payload);
  return res.data || res;
};

export const flagProjectDelay = async (payload: {
  project: string;
  reason: string;
  severity?: string;
}): Promise<any> => {
  const res: any = await api.post('/monitoring/progress/flag-delay/', payload);
  return res.data || res;
};

