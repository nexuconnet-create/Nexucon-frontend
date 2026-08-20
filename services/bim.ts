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

// API Functions
export const getBIMModels = async (params?: Record<string, any>): Promise<BIMModel[]> => {
  const response = await api.get('/bim/models/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getBIMModelById = async (id: string): Promise<BIMModel> => {
  const response = await api.get(`/bim/models/${id}/`);
  return response.data;
};

export const createBIMModel = async (data: Partial<BIMModel>): Promise<BIMModel> => {
  const response = await api.post('/bim/models/', data);
  return response.data;
};

export const certifyBIMModel = async (id: string, data?: { hash_signature?: string }): Promise<BIMModel> => {
  const response = await api.post(`/bim/models/${id}/certify/`, data || {});
  return response.data;
};

export const requestBIMChanges = async (id: string, data: { reason: string }): Promise<BIMModel> => {
  const response = await api.post(`/bim/models/${id}/request-changes/`, data);
  return response.data;
};

export const createBIMVersion = async (id: string, data: Partial<BIMModelVersion>): Promise<BIMModelVersion> => {
  const response = await api.post(`/bim/models/${id}/create-version/`, data);
  return response.data;
};

export const getBIMVersions = async (params?: Record<string, any>): Promise<BIMModelVersion[]> => {
  const response = await api.get('/bim/versions/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const compareBIMVersions = async (versionA: string, versionB: string): Promise<any> => {
  const response = await api.post('/bim/versions/compare/', { version_a: versionA, version_b: versionB });
  return response.data;
};

export const getBIMClashes = async (params?: Record<string, any>): Promise<BIMClash[]> => {
  const response = await api.get('/bim/clashes/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const runClashMatrix = async (data: { project: string; primary_model: string; secondary_model?: string }): Promise<BIMClash> => {
  const response = await api.post('/bim/clashes/run-matrix/', data);
  return response.data;
};

export const convertClashToSiteIssue = async (id: string): Promise<any> => {
  const response = await api.post(`/bim/clashes/${id}/convert-to-issue/`);
  return response.data;
};

export const resolveBIMClash = async (id: string, data?: { resolution_notes?: string }): Promise<BIMClash> => {
  const response = await api.post(`/bim/clashes/${id}/resolve/`, data || {});
  return response.data;
};

export const getBIMAnnotations = async (params?: Record<string, any>): Promise<BIMAnnotation[]> => {
  const response = await api.get('/bim/annotations/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const createBIMAnnotation = async (data: Partial<BIMAnnotation>): Promise<BIMAnnotation> => {
  const response = await api.post('/bim/annotations/', data);
  return response.data;
};

export const resolveBIMAnnotation = async (id: string, data?: { notes?: string }): Promise<BIMAnnotation> => {
  const response = await api.post(`/bim/annotations/${id}/resolve/`, data || {});
  return response.data;
};

export const getBIMProgressValidations = async (params?: Record<string, any>): Promise<BIMProgressValidation[]> => {
  const response = await api.get('/bim/progress-validation/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const runTimelineSimulation = async (projectId: string): Promise<BIMProgressValidation> => {
  const response = await api.post('/bim/progress-validation/simulate/', { project: projectId });
  return response.data;
};

export const getBIMStats = async (): Promise<BIMStats> => {
  const response = await api.get('/bim/stats/overview/');
  return response.data;
};
