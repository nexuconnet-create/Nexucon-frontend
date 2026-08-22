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
  weather_condition: string;
  workforce_count: number;
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

export interface ConstructionMilestone {
  id: string;
  project: string;
  project_name: string;
  project_reference: string;
  name: string;
  target_date: string;
  actual_completion_date?: string;
  status: 'UPCOMING' | 'DUE_THIS_WEEK' | 'VERIFIED' | 'DELAYED' | 'COMPLETED';
  progress_percentage: number;
  verified_by_name?: string;
  verified_at?: string;
  evidence_documents?: string[];
  is_delayed: boolean;
  delay_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteVerification {
  id: string;
  verification_reference: string;
  project: string;
  project_name: string;
  project_reference: string;
  project_location?: string;
  method: 'GNSS_RTK_SURVEY' | 'TERSU_ROVER' | 'GPR_SCAN' | 'DRONE_PHOTOGRAMMETRY' | 'TOTAL_STATION';
  device_identifier: string;
  boundary_coordinates?: any[];
  captured_coordinates?: { lat?: number; lng?: number; elevation?: number };
  approved_coordinates?: { lat?: number; lng?: number; elevation?: number };
  variance_meters: number;
  variance_detected: boolean;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'VARIANCE_DETECTED' | 'FLAGGED';
  verified_by_name?: string;
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
    due_this_week: number;
    verified: number;
    delayed: number;
    upcoming: number;
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

export const escalateSiteIssue = async (id: string): Promise<SiteIssue> => {
  const res: any = await api.post(`/monitoring/issues/${id}/escalate/`);
  return res.data || res;
};

export const resolveSiteIssue = async (
  id: string,
  payload: { notes?: string; evidence?: string[] }
): Promise<SiteIssue> => {
  const res: any = await api.post(`/monitoring/issues/${id}/resolve/`, payload);
  return res.data || res;
};

// Construction Milestones
export const getMilestones = async (params?: {
  project?: string;
  status?: string;
  search?: string;
}): Promise<ConstructionMilestone[]> => {
  try {
    const res: any = await api.get('/monitoring/milestones/', { params });
    return Array.isArray(res) ? res : (res?.results || res?.data || []);
  } catch (err) {
    console.warn('getMilestones fallback notice:', err);
    return [];
  }
};

export const createMilestone = async (payload: {
  project: string;
  name: string;
  target_date: string;
  progress_percentage?: number;
}): Promise<ConstructionMilestone> => {
  const res: any = await api.post('/monitoring/milestones/', payload);
  return res.data || res;
};

export const verifyMilestone = async (id: string): Promise<ConstructionMilestone> => {
  const res: any = await api.post(`/monitoring/milestones/${id}/verify/`);
  return res.data || res;
};

export const flagMilestoneDelay = async (
  id: string,
  payload: { reason: string }
): Promise<ConstructionMilestone> => {
  const res: any = await api.post(`/monitoring/milestones/${id}/flag-delay/`, payload);
  return res.data || res;
};

// Site Verifications
export const getSiteVerifications = async (params?: {
  project?: string;
  method?: string;
  status?: string;
  search?: string;
}): Promise<SiteVerification[]> => {
  try {
    const res: any = await api.get('/monitoring/verifications/', { params });
    return Array.isArray(res) ? res : (res?.results || res?.data || []);
  } catch (err) {
    console.warn('getSiteVerifications fallback notice:', err);
    return [];
  }
};

export const createSiteVerification = async (payload: {
  project: string;
  method: string;
  device_identifier?: string;
  captured_coordinates?: { lat: number; lng: number };
  approved_coordinates?: { lat: number; lng: number };
  variance_meters?: number;
  notes?: string;
}): Promise<SiteVerification> => {
  const res: any = await api.post('/monitoring/verifications/', payload);
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

