import api from './api';

export interface InspectionChecklistItem {
  id: string;
  item: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  notes?: string;
}

export interface InspectionFinding {
  id: string;
  finding_reference: string;
  inspection: string;
  project: string;
  project_name?: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  photos?: string[];
  corrective_action_required?: string;
  resolution_deadline?: string;
  is_resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  requires_reinspection: boolean;
  created_at: string;
}

export interface StopWorkOrder {
  id: string;
  order_number: string;
  project: string;
  project_name: string;
  project_reference: string;
  project_location?: string;
  inspection?: string;
  inspection_reference?: string;
  finding?: string;
  reason: string;
  severity: string;
  issued_by_name: string;
  issued_at: string;
  status: 'ACTIVE' | 'APPEALED' | 'LIFTED' | 'ENFORCED';
  lifted_at?: string;
  lifted_by_name?: string;
  lift_justification?: string;
  created_at: string;
}

export interface StopWorkOrderStats {
  active: number;
  pending_appeals: number;
  lifted_30d: number;
  total: number;
}

export interface Inspection {
  id: string;
  inspection_reference: string;
  project: string;
  project_name: string;
  project_reference: string;
  project_location?: string;
  permit?: string;
  permit_number?: string;
  inspector?: string;
  inspector_name: string;
  inspection_type: string;
  status: 'REQUESTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'RE_INSPECTION_REQUIRED' | 'FAILED' | 'CANCELLED';
  priority: 'Low' | 'Normal' | 'Medium' | 'High' | 'Critical';
  requested_by_name?: string;
  requested_at: string;
  scheduled_date?: string;
  completed_date?: string;
  checkin_time?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  gps_verified: boolean;
  outcome: 'PENDING' | 'PASSED' | 'CONDITIONAL_PASS' | 'FAILED';
  summary_notes?: string;
  checklist_results?: InspectionChecklistItem[];
  photos_and_evidence?: string[];
  findings?: InspectionFinding[];
  findings_count?: number;
  has_active_swo?: boolean;
  parent_inspection?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionStats {
  requests: number;
  schedule: number;
  active: number;
  findings: number;
  stop_work: number;
  re_inspections: number;
  reports: number;
  total: number;
}

export interface CreateInspectionPayload {
  project: string;
  permit?: string;
  inspection_type: string;
  priority?: string;
  scheduled_date?: string;
  summary_notes?: string;
  checklist_results?: any[];
}

export const getInspections = async (params?: {
  status?: string;
  project?: string;
  inspector?: string;
  priority?: string;
  type?: string;
  search?: string;
}): Promise<Inspection[]> => {
  const res: any = await api.get('/inspections/', { params });
  return Array.isArray(res) ? res : (res.results || res.data || []);
};

export const getInspectionById = async (id: string): Promise<Inspection> => {
  const res: any = await api.get(`/inspections/${id}/`);
  return res.data || res;
};

export const getInspectionStats = async (): Promise<InspectionStats> => {
  const res: any = await api.get('/inspections/stats/');
  return res.data || res;
};

export const createInspection = async (payload: CreateInspectionPayload): Promise<Inspection> => {
  const res: any = await api.post('/inspections/', payload);
  return res.data || res;
};

export const assignInspection = async (
  id: string,
  payload: { inspector_id?: string; inspector_name?: string; scheduled_date: string }
): Promise<Inspection> => {
  const res: any = await api.post(`/inspections/${id}/assign/`, payload);
  return res.data || res;
};

export const checkinInspection = async (
  id: string,
  payload: { latitude?: number; longitude?: number }
): Promise<Inspection> => {
  const res: any = await api.post(`/inspections/${id}/checkin/`, payload);
  return res.data || res;
};

export const completeInspection = async (
  id: string,
  payload: { outcome: 'PASSED' | 'CONDITIONAL_PASS' | 'FAILED'; checklist_results?: any[]; summary_notes?: string }
): Promise<Inspection> => {
  const res: any = await api.post(`/inspections/${id}/complete/`, payload);
  return res.data || res;
};

export const logInspectionFinding = async (
  id: string,
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
): Promise<InspectionFinding> => {
  const res: any = await api.post(`/inspections/${id}/log-finding/`, payload);
  return res.data || res;
};

export const issueStopWorkOrder = async (
  id: string,
  payload: { reason: string; severity?: string }
): Promise<StopWorkOrder> => {
  const res: any = await api.post(`/inspections/${id}/issue-stop-work/`, payload);
  return res.data || res;
};

export const createReInspection = async (
  id: string,
  payload?: { scheduled_date?: string }
): Promise<Inspection> => {
  const res: any = await api.post(`/inspections/${id}/create-reinspection/`, payload || {});
  return res.data || res;
};

export const getStopWorkOrders = async (params?: {
  status?: string;
  project?: string;
  search?: string;
}): Promise<StopWorkOrder[]> => {
  const res: any = await api.get('/inspections/stop-work-orders/', { params });
  return Array.isArray(res) ? res : (res.results || res.data || []);
};

export const getStopWorkOrderStats = async (): Promise<StopWorkOrderStats> => {
  const res: any = await api.get('/inspections/stop-work-orders/stats/');
  return res.data || res;
};

export const liftStopWorkOrder = async (
  id: string,
  payload: { justification: string }
): Promise<StopWorkOrder> => {
  const res: any = await api.post(`/inspections/stop-work-orders/${id}/lift/`, payload);
  return res.data || res;
};

export const getFindings = async (params?: {
  severity?: string;
  is_resolved?: boolean;
  project?: string;
}): Promise<InspectionFinding[]> => {
  const res: any = await api.get('/inspections/findings/', { params });
  return Array.isArray(res) ? res : (res.results || res.data || []);
};

export const resolveFinding = async (
  id: string,
  payload: { notes?: string }
): Promise<InspectionFinding> => {
  const res: any = await api.post(`/inspections/findings/${id}/resolve/`, payload);
  return res.data || res;
};
