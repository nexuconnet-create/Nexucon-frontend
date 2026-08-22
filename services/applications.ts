import api from './api';

export interface ApplicationReviewItem {
  id: string;
  name: string;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  notes?: string;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: string;
  url?: string;
  uploaded_at?: string;
}

export interface Application {
  id: string;
  application_reference: string;
  title: string;
  project: string;
  project_name: string;
  project_reference: string;
  project_location?: string;
  applicant: string | number;
  applicant_name: string;
  applicant_email?: string;
  application_type: string;
  jurisdiction?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEW_COMPLETED' | 'APPROVAL_REQUESTED' | 'CONDITIONAL_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'RENEWED';
  priority: 'Low' | 'Normal' | 'Medium' | 'High' | 'Critical';
  fee_amount?: number | string;
  fee_status?: 'UNPAID' | 'PAID' | 'WAIVED' | 'REFUNDED';
  created_by_name?: string;
  assigned_reviewer?: string | number;
  assigned_reviewer_name?: string;
  submission_date?: string;
  review_deadline?: string;
  decision_date?: string;
  decision_reason?: string;
  conditions?: string;
  required_action?: string;
  review_items?: ApplicationReviewItem[];
  attached_documents?: ApplicationDocument[];
  document_requests?: any[];
  permit_number?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStats {
  total: number;
  submitted: number;
  under_review: number;
  conditional: number;
  approved: number;
  rejected: number;
  expired: number;
}

export interface CreateApplicationPayload {
  project: string;
  title: string;
  application_type: string;
  jurisdiction?: string;
  priority?: string;
  fee_amount?: number;
  review_deadline?: string;
  required_action?: string;
  attached_documents?: any[];
}

export const getApplications = async (params?: {
  status?: string;
  project?: string;
  priority?: string;
  type?: string;
  search?: string;
}): Promise<Application[]> => {
  const res: any = await api.get('/applications/', { params });
  return Array.isArray(res) ? res : (res.results || res.data || []);
};

export const getApplicationById = async (id: string): Promise<Application> => {
  const res: any = await api.get(`/applications/${id}/`);
  return res.data || res;
};

export const getApplicationStats = async (): Promise<ApplicationStats> => {
  const res: any = await api.get('/applications/stats/');
  return res.data || res;
};

export const createApplication = async (payload: CreateApplicationPayload): Promise<Application> => {
  const res: any = await api.post('/applications/', payload);
  return res.data || res;
};

export const transitionApplication = async (
  id: string,
  payload: { status: string; reason?: string; conditions?: string }
): Promise<Application> => {
  const res: any = await api.post(`/applications/${id}/transition/`, payload);
  return res.data || res;
};

export const assignApplicationReviewer = async (
  id: string,
  payload: { reviewer_id?: string | number; reviewer_name?: string; review_deadline?: string }
): Promise<Application> => {
  const res: any = await api.post(`/applications/${id}/assign-reviewer/`, payload);
  return res.data || res;
};

export const requestApplicationDocs = async (
  id: string,
  payload: { document_items: string[]; instructions?: string; deadline?: string }
): Promise<Application> => {
  const res: any = await api.post(`/applications/${id}/request-docs/`, payload);
  return res.data || res;
};

export const updateDocRequestProgress = async (
  id: string,
  payload: {
    request_id: string;
    item_name?: string;
    item_status?: string;
    note?: string;
    overall_status?: string;
  }
): Promise<Application> => {
  const res: any = await api.post(`/applications/${id}/update-doc-request/`, payload);
  return res.data || res;
};

export const updateApplicationReviewItem = async (
  id: string,
  payload: { item_id: string; status: 'PASSED' | 'FAILED' | 'PENDING'; notes?: string }
): Promise<Application> => {
  const res: any = await api.post(`/applications/${id}/update-review-item/`, payload);
  return res.data || res;
};

export const getReviewQueue = async (): Promise<Application[]> => {
  const res: any = await api.get('/applications/review-queue/');
  return Array.isArray(res) ? res : (res.results || res.data || []);
};
