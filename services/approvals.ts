import api from './api';

export interface TechnicalReviewCriteria {
  id: string;
  approval_request: string;
  name: string;
  status: 'pass' | 'fail' | 'pending';
  notes?: string;
  order: number;
}

export interface ApprovalDecision {
  id: string;
  decision_reference: string;
  approval_request: string;
  request_reference?: string;
  request_title?: string;
  project_name?: string;
  decider_name: string;
  decider_role: string;
  outcome: 'Approved' | 'Rejected' | 'Conditional' | 'Returned For Info' | 'Escalated';
  decision_notes?: string;
  conditions?: string;
  digital_pin_verified: boolean;
  signature_hash?: string;
  timestamp: string;
}

export interface ApprovalRequest {
  id: string;
  request_reference: string;
  project: string;
  project_name?: string;
  project_reference?: string;
  title: string;
  request_type: 'Document' | 'Technical' | 'Permit' | 'Escalated' | 'General';
  discipline: 'MEP' | 'Structural' | 'Architecture' | 'Legal' | 'Finance' | 'Safety' | 'Procurement' | 'General';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Conditional' | 'In Review' | 'Awaiting Fix' | 'Escalated';
  value_amount: number;
  doa_level_required: string;
  submitted_by_name: string;
  due_date?: string;
  description?: string;
  bottleneck?: string;
  days_overdue: number;
  signatories_required: number;
  signatories_completed: number;
  attached_file_url?: string;
  created_at: string;
  decisions?: ApprovalDecision[];
  criteria?: TechnicalReviewCriteria[];
}

export interface ApprovalStats {
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  escalated_count: number;
  technical_count: number;
  documents_count: number;
  total_decisions: number;
}

// API Methods
export const getApprovalRequests = async (params?: Record<string, any>): Promise<ApprovalRequest[]> => {
  const response = await api.get('/approvals/requests/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getApprovalRequestById = async (id: string): Promise<ApprovalRequest> => {
  const response = await api.get(`/approvals/requests/${id}/`);
  return response.data;
};

export const createApprovalRequest = async (data: Partial<ApprovalRequest>): Promise<ApprovalRequest> => {
  const response = await api.post('/approvals/requests/', data);
  return response.data;
};

export const approveRequest = async (id: string, data?: { notes?: string; pin?: string; conditions?: string }): Promise<any> => {
  const response = await api.post(`/approvals/requests/${id}/approve/`, data || {});
  return response.data;
};

export const rejectRequest = async (id: string, data: { reason: string }): Promise<any> => {
  const response = await api.post(`/approvals/requests/${id}/reject/`, data);
  return response.data;
};

export const requestInfo = async (id: string, data: { query: string }): Promise<any> => {
  const response = await api.post(`/approvals/requests/${id}/request-info/`, data);
  return response.data;
};

export const escalateRequest = async (id: string, data?: { reason?: string; target_level?: string }): Promise<any> => {
  const response = await api.post(`/approvals/requests/${id}/escalate/`, data || {});
  return response.data;
};

export const signDocument = async (id: string): Promise<ApprovalRequest> => {
  const response = await api.post(`/approvals/requests/${id}/sign/`);
  return response.data;
};

export const evaluateCriterion = async (criterionId: string, data: { status: string; notes?: string }): Promise<TechnicalReviewCriteria> => {
  const response = await api.post(`/approvals/criteria/${criterionId}/evaluate/`, data);
  return response.data;
};

export const getApprovalDecisions = async (params?: Record<string, any>): Promise<ApprovalDecision[]> => {
  const response = await api.get('/approvals/decisions/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getApprovalStats = async (): Promise<ApprovalStats> => {
  const response = await api.get('/approvals/stats/overview/');
  return response.data;
};
