import api from './api';

export interface BIMModelVersion {
  id: string;
  model: string;
  model_name?: string;
  version_label: string;
  commit_hash: string;
  changes_summary: string;
  author_name: string;
  author_role: string;
  stats_added: number;
  stats_modified: number;
  stats_removed: number;
  file_url: string;
  file_size: string;
  is_current: boolean;
  created_at: string;
}

export interface BIMModel {
  id: string;
  model_reference: string;
  project: string;
  project_name?: string;
  project_reference?: string;
  name: string;
  discipline: 'Architecture' | 'MEP' | 'Structural' | 'Multi-Disciplinary' | 'Civil/Infrastructure' | 'Landscape';
  format: string;
  file_url: string;
  file_size: string;
  current_version: string;
  status: 'Active' | 'Under Review' | 'Approved' | 'Changes Requested' | 'Archived';
  is_digitally_certified: boolean;
  certified_by_name?: string;
  certified_at?: string;
  hash_signature?: string;
  lod: string;
  element_count: number;
  coordinate_system?: Record<string, any>;
  uploaded_by_name: string;
  created_at: string;
  updated_at: string;
  versions_count?: number;
  clashes_count?: number;
  annotations_count?: number;
  versions?: BIMModelVersion[];
}

export interface BIMClash {
  id: string;
  clash_reference: string;
  project: string;
  project_name?: string;
  primary_model: string;
  primary_model_name?: string;
  secondary_model?: string;
  secondary_model_name?: string;
  clash_type: 'HARD_CLASH' | 'SOFT_CLASH' | 'CLEARANCE' | 'DUPLICATE';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ASSIGNED' | 'IN_REVIEW' | 'RESOLVED' | 'CONVERTED_TO_ISSUE';
  assigned_to_name: string;
  assigned_discipline: string;
  coordinates_3d?: Record<string, any>;
  converted_site_issue?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface BIMAnnotation {
  id: string;
  annotation_reference: string;
  model: string;
  model_name?: string;
  project: string;
  project_name?: string;
  author_name: string;
  author_role: string;
  text: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  viewpoint_camera?: Record<string, any>;
  element_ids?: string[];
  comments_count: number;
  attachments?: any[];
  created_at: string;
  updated_at: string;
}

export interface BIMProgressValidation {
  id: string;
  project: string;
  project_name?: string;
  model?: string;
  model_name?: string;
  schedule_status: 'ON_TRACK' | 'DELAYED' | 'AHEAD';
  days_variance: number;
  completed_elements_count: number;
  total_elements_count: number;
  earned_value_usd: string;
  planned_vs_actual?: Array<{ phase: string; planned: number; actual: number; status: string }>;
  simulation_date: string;
  created_at: string;
}

export interface BIMStats {
  models: {
    total: number;
    active: number;
    under_review: number;
    certified: number;
  };
  clashes: {
    active: number;
    critical: number;
    hard_clash: number;
  };
  annotations: {
    open: number;
    in_progress: number;
    resolved: number;
    total: number;
  };
  progress_4d: {
    schedule_status: string;
    days_variance: number;
    completed_elements: number;
    earned_value: string;
  };
}

const unwrapList = <T>(res: any): T[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.results)) return res.results;
  return [];
};

const unwrapItem = <T>(res: any): T => {
  if (res && res.data !== undefined && res.data !== null) return res.data;
  return res as T;
};

// API Functions
export const getBIMModels = async (params?: Record<string, any>): Promise<BIMModel[]> => {
  const response = await api.get('/bim/models/', { params });
  return unwrapList<BIMModel>(response);
};

export const getBIMModelById = async (id: string): Promise<BIMModel> => {
  const response = await api.get(`/bim/models/${id}/`);
  return unwrapItem<BIMModel>(response);
};

export const createBIMModel = async (data: Partial<BIMModel>): Promise<BIMModel> => {
  const response = await api.post('/bim/models/', data);
  return unwrapItem<BIMModel>(response);
};

export const certifyBIMModel = async (id: string, data?: { hash_signature?: string }): Promise<BIMModel> => {
  const response = await api.post(`/bim/models/${id}/certify/`, data || {});
  return unwrapItem<BIMModel>(response);
};

export const requestBIMChanges = async (id: string, data: { reason: string }): Promise<BIMModel> => {
  const response = await api.post(`/bim/models/${id}/request-changes/`, data);
  return unwrapItem<BIMModel>(response);
};

export const createBIMVersion = async (id: string, data: Partial<BIMModelVersion>): Promise<BIMModelVersion> => {
  const response = await api.post(`/bim/models/${id}/create-version/`, data);
  return unwrapItem<BIMModelVersion>(response);
};

export const getBIMVersions = async (params?: Record<string, any>): Promise<BIMModelVersion[]> => {
  const response = await api.get('/bim/versions/', { params });
  return unwrapList<BIMModelVersion>(response);
};

export const compareBIMVersions = async (versionA: string, versionB: string): Promise<any> => {
  const response = await api.post('/bim/versions/compare/', { version_a: versionA, version_b: versionB });
  return unwrapItem<any>(response);
};

export const getBIMClashes = async (params?: Record<string, any>): Promise<BIMClash[]> => {
  const response = await api.get('/bim/clashes/', { params });
  return unwrapList<BIMClash>(response);
};

export const runClashMatrix = async (data: { project: string; primary_model: string; secondary_model?: string }): Promise<BIMClash> => {
  const response = await api.post('/bim/clashes/run-matrix/', data);
  return unwrapItem<BIMClash>(response);
};

export const convertClashToSiteIssue = async (id: string): Promise<any> => {
  const response = await api.post(`/bim/clashes/${id}/convert-to-issue/`);
  return unwrapItem<any>(response);
};

export const resolveBIMClash = async (id: string, data?: { resolution_notes?: string }): Promise<BIMClash> => {
  const response = await api.post(`/bim/clashes/${id}/resolve/`, data || {});
  return unwrapItem<BIMClash>(response);
};

export const getBIMAnnotations = async (params?: Record<string, any>): Promise<BIMAnnotation[]> => {
  const response = await api.get('/bim/annotations/', { params });
  return unwrapList<BIMAnnotation>(response);
};

export const createBIMAnnotation = async (data: Partial<BIMAnnotation>): Promise<BIMAnnotation> => {
  const response = await api.post('/bim/annotations/', data);
  return unwrapItem<BIMAnnotation>(response);
};

export const resolveBIMAnnotation = async (id: string, data?: { notes?: string }): Promise<BIMAnnotation> => {
  const response = await api.post(`/bim/annotations/${id}/resolve/`, data || {});
  return unwrapItem<BIMAnnotation>(response);
};

export const getBIMProgressValidations = async (params?: Record<string, any>): Promise<BIMProgressValidation[]> => {
  const response = await api.get('/bim/progress-validation/', { params });
  return unwrapList<BIMProgressValidation>(response);
};

export const runTimelineSimulation = async (projectId: string): Promise<BIMProgressValidation> => {
  const response = await api.post('/bim/progress-validation/simulate/', { project: projectId });
  return unwrapItem<BIMProgressValidation>(response);
};

export interface BIMConstructionMilestone {
  id: string;
  milestone_code: string;
  project: string;
  project_name?: string;
  project_reference?: string;
  bim_model: string;
  bim_model_name?: string;
  bim_model_discipline?: string;
  bim_model_certified?: boolean;
  bim_model_status?: string;
  model_version?: string;
  model_version_label?: string;
  model_version_hash?: string;
  linked_construction_milestone?: string;
  name: string;
  phase: 'SUBSTRUCTURE' | 'STRUCTURAL_FRAME' | 'SUPERSTRUCTURE' | 'MEP_ROUGHIN' | 'FACADE_ENVELOPE' | 'FINISHES' | 'COMMISSIONING';
  description?: string;
  sequence_order: number;
  target_date: string;
  actual_verified_date?: string;
  bim_elements: Array<{
    id: string;
    name?: string;
    discipline?: string;
    category?: string;
    count?: number;
    lod?: string;
  }>;
  tolerance_max_mm: number;
  bim_deviation_mm: number;
  gnss_survey_variance_mm: number;
  gpr_clearance_status: 'NOT_APPLICABLE' | 'PENDING' | 'VERIFIED' | 'ANOMALY_DETECTED';
  gpr_evidence_notes?: string;
  verification_status: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'DEVIATION_FLAGGED' | 'RE_VERIFICATION_REQUIRED' | 'COMPLETED';
  digital_stamp_reference?: string;
  verified_by?: string;
  verified_by_name?: string;
  verified_at?: string;
  linked_clashes: Array<{
    id?: string;
    ref?: string;
    title?: string;
    severity?: string;
    status?: string;
  }>;
  linked_inspections: Array<{
    id?: string;
    ref?: string;
    type?: string;
    outcome?: string;
    status?: string;
    date?: string;
  }>;
  linked_site_verifications: Array<{
    id?: string;
    code?: string;
    type?: string;
    status?: string;
    variance_mm?: number;
  }>;
  linked_ncrs: Array<{
    id?: string;
    ref?: string;
    title?: string;
    severity?: string;
    status?: string;
  }>;
  evidence_vault: Array<{
    name: string;
    url: string;
    file_type: string;
    category: string;
    timestamp: string;
    deviation_mm?: number;
    reason?: string;
  }>;
  verification_requirements?: Record<string, any>;
  signoff_metadata?: Record<string, any>;
  gate_checks_summary?: {
    model_approved: boolean;
    version_verified: boolean;
    zero_critical_clashes: boolean;
    open_critical_clashes_count: number;
    tolerance_compliant: boolean;
    inspections_passed: boolean;
    gpr_clear: boolean;
    all_gates_passed: boolean;
    is_stamped: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface GateCheckItem {
  key: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface BIMMilestoneGateStatus {
  milestone_id: string;
  milestone_code: string;
  all_gates_passed: boolean;
  gates: GateCheckItem[];
  blockers: string[];
  can_digitally_sign: boolean;
}

export const getBIMStats = async (): Promise<BIMStats> => {
  const response = await api.get('/bim/stats/overview/');
  return unwrapItem<BIMStats>(response);
};

export const getBIMMilestones = async (params?: Record<string, any>): Promise<BIMConstructionMilestone[]> => {
  const response = await api.get('/bim/milestones/', { params });
  return unwrapList<BIMConstructionMilestone>(response);
};

export const getBIMMilestoneById = async (id: string): Promise<BIMConstructionMilestone> => {
  const response = await api.get(`/bim/milestones/${id}/`);
  return unwrapItem<BIMConstructionMilestone>(response);
};

export const createBIMMilestone = async (data: Partial<BIMConstructionMilestone>): Promise<BIMConstructionMilestone> => {
  const response = await api.post('/bim/milestones/', data);
  return unwrapItem<BIMConstructionMilestone>(response);
};

export const getBIMMilestoneGateStatus = async (id: string): Promise<BIMMilestoneGateStatus> => {
  const response = await api.get(`/bim/milestones/${id}/gate-status/`);
  return unwrapItem<BIMMilestoneGateStatus>(response);
};

export const verifyBIMMilestone = async (id: string, data?: { notes?: string }): Promise<BIMConstructionMilestone> => {
  const response = await api.post(`/bim/milestones/${id}/verify/`, data || {});
  return unwrapItem<BIMConstructionMilestone>(response);
};

export const flagBIMMilestoneDeviation = async (
  id: string, 
  data: { deviation_mm: number; reason: string; evidence_name?: string; evidence_url?: string }
): Promise<BIMConstructionMilestone> => {
  const response = await api.post(`/bim/milestones/${id}/flag-deviation/`, data);
  return unwrapItem<BIMConstructionMilestone>(response);
};

export const requestMilestoneReVerification = async (id: string, data?: { reason?: string }): Promise<BIMConstructionMilestone> => {
  const response = await api.post(`/bim/milestones/${id}/request-re-verification/`, data || {});
  return unwrapItem<BIMConstructionMilestone>(response);
};

