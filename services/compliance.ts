import api from './api';

export interface CorrectiveActionPlan {
  id: string;
  capa_reference: string;
  ncr?: string;
  ncr_reference?: string;
  project: string;
  project_name?: string;
  title: string;
  action_plan?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'todo' | 'in-progress' | 'review' | 'closed';
  assignee_name: string;
  due_date?: string;
  comments_count: number;
  attachments_count: number;
  verification_notes?: string;
  closed_at?: string;
  created_at: string;
}

export interface NonConformanceReport {
  id: string;
  ncr_reference: string;
  project: string;
  project_name?: string;
  project_reference?: string;
  title: string;
  description: string;
  severity: 'Critical' | 'Major' | 'Minor';
  category: 'Environmental' | 'Safety' | 'Quality' | 'Structural' | 'General';
  status: 'Open' | 'In Progress' | 'Closed';
  reported_by_name: string;
  assignee_name: string;
  source: string;
  source_reference?: string;
  escalation_level: number;
  escalation_action_text?: string;
  date_logged: string;
  days_open: number;
  resolved_at?: string;
  resolution_notes?: string;
  linked_capa_ref?: string;
  capas?: CorrectiveActionPlan[];
}

export interface RegulatoryRequirement {
  id: string;
  requirement_reference: string;
  category: 'Environmental' | 'Safety & Health' | 'Building Codes' | 'Legal & Planning';
  title: string;
  description?: string;
  authority: string;
  status: 'Compliant' | 'At Risk' | 'Non-Compliant';
  last_checked: string;
  created_at: string;
}

export interface ComplianceReview {
  id: string;
  review_reference: string;
  project: string;
  project_name?: string;
  title: string;
  review_type: 'Safety' | 'Building Code' | 'Environmental' | 'Quality';
  auditor_name: string;
  stage: 'Initiation' | 'Audit in Progress' | 'Reporting' | 'Final Review' | 'Completed';
  progress: number;
  start_date: string;
  due_date?: string;
  findings_summary?: string;
  created_at: string;
}

export interface ComplianceCertificate {
  id: string;
  certificate_reference: string;
  project: string;
  project_name?: string;
  title: string;
  category: 'Environmental' | 'Safety' | 'Quality' | 'Building Code';
  authority: string;
  issue_date: string;
  expiry_date: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Revoked';
  qr_verification_hash?: string;
  certificate_file_url?: string;
  created_at: string;
}

export interface ComplianceStats {
  overall_score: string;
  open_ncrs_count: number;
  critical_ncrs_count: number;
  pending_capas_count: number;
  valid_certificates_count: number;
  expiring_soon_certificates_count: number;
  expired_certificates_count: number;
  reviews_count: number;
}

// API Methods
export const getNCRs = async (params?: Record<string, any>): Promise<NonConformanceReport[]> => {
  const response = await api.get('/compliance/ncrs/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getNCRById = async (id: string): Promise<NonConformanceReport> => {
  const response = await api.get(`/compliance/ncrs/${id}/`);
  return response.data;
};

export const createNCR = async (data: Partial<NonConformanceReport>): Promise<NonConformanceReport> => {
  const response = await api.post('/compliance/ncrs/', data);
  return response.data;
};

export const escalateNCR = async (id: string, data?: { escalation_level?: number }): Promise<NonConformanceReport> => {
  const response = await api.post(`/compliance/ncrs/${id}/escalate/`, data || {});
  return response.data;
};

export const closeNCR = async (id: string, data?: { resolution_notes?: string }): Promise<NonConformanceReport> => {
  const response = await api.post(`/compliance/ncrs/${id}/close/`, data || {});
  return response.data;
};

export const getCAPAs = async (params?: Record<string, any>): Promise<CorrectiveActionPlan[]> => {
  const response = await api.get('/compliance/capas/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const createCAPA = async (data: Partial<CorrectiveActionPlan>): Promise<CorrectiveActionPlan> => {
  const response = await api.post('/compliance/capas/', data);
  return response.data;
};

export const transitionCAPA = async (id: string, data: { status: string; verification_notes?: string }): Promise<CorrectiveActionPlan> => {
  const response = await api.post(`/compliance/capas/${id}/transition/`, data);
  return response.data;
};

export const getRequirements = async (params?: Record<string, any>): Promise<RegulatoryRequirement[]> => {
  const response = await api.get('/compliance/requirements/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const updateRequirementStatus = async (id: string, data: { status: string }): Promise<RegulatoryRequirement> => {
  const response = await api.post(`/compliance/requirements/${id}/update-status/`, data);
  return response.data;
};

export const getComplianceReviews = async (params?: Record<string, any>): Promise<ComplianceReview[]> => {
  const response = await api.get('/compliance/reviews/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const createComplianceReview = async (data: Partial<ComplianceReview>): Promise<ComplianceReview> => {
  const response = await api.post('/compliance/reviews/', data);
  return response.data;
};

export const getComplianceCertificates = async (params?: Record<string, any>): Promise<ComplianceCertificate[]> => {
  const response = await api.get('/compliance/certificates/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const issueComplianceCertificate = async (data: Partial<ComplianceCertificate>): Promise<ComplianceCertificate> => {
  const response = await api.post('/compliance/certificates/', data);
  return response.data;
};

export const verifyCertificateAuthenticity = async (id: string): Promise<any> => {
  const response = await api.get(`/compliance/certificates/${id}/verify/`);
  return response.data;
};

export const getComplianceStats = async (): Promise<ComplianceStats> => {
  const response = await api.get('/compliance/stats/overview/');
  return response.data;
};
