import api from './api';

export interface TechnicalReviewCriteria {
  id: string;
  approval_request: string;
  name: string;
  status: 'pass' | 'fail' | 'pending';
  notes?: string;
  order: number;
}

export interface ApprovalComment {
  id: string;
  approval_request: string;
  author?: string;
  author_name: string;
  comment_type: 'General' | 'RevisionRequest' | 'ConditionVerification' | 'TechnicalFinding';
  content: string;
  attachment_url?: string;
  created_at: string;
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
  assigned_to_name?: string;
  due_date?: string;
  description?: string;
  source_entity_type?: 'PermitApplication' | 'Document' | 'BIMModel' | 'Inspection' | 'Milestone' | 'ComplianceReview' | 'GPRFinding' | 'General';
  source_entity_id?: string;
  source_version_hash?: string;
  compliance_gate_status?: 'Passed' | 'Blocked' | 'Exempt';
  conditions_met?: boolean;
  bottleneck?: string;
  days_overdue: number;
  signatories_required: number;
  signatories_completed: number;
  attached_file_url?: string;
  created_at: string;
  decisions?: ApprovalDecision[];
  criteria?: TechnicalReviewCriteria[];
  comments?: ApprovalComment[];
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

// API Methods
export const getApprovalRequests = async (params?: Record<string, any>): Promise<ApprovalRequest[]> => {
  const response = await api.get('/approvals/requests/', { params });
  return unwrapList<ApprovalRequest>(response);
};

export const getApprovalRequestById = async (id: string): Promise<ApprovalRequest> => {
  const response = await api.get(`/approvals/requests/${id}/`);
  return unwrapItem<ApprovalRequest>(response);
};

export const createApprovalRequest = async (data: Partial<ApprovalRequest>): Promise<ApprovalRequest> => {
  const response = await api.post('/approvals/requests/', data);
  return unwrapItem<ApprovalRequest>(response);
};

export const assignReviewer = async (id: string, data: { reviewer_name: string }): Promise<ApprovalRequest> => {
  const response = await api.post(`/approvals/requests/${id}/assign/`, data);
  return unwrapItem<ApprovalRequest>(response);
};

export const approveRequest = async (id: string, data?: { notes?: string; pin?: string; conditions?: string }): Promise<any> => {
  const response = await api.post(`/approvals/requests/${id}/approve/`, data || {});
  return unwrapItem<any>(response);
};

export const rejectRequest = async (id: string, data: { reason: string }): Promise<any> => {
  const response = await api.post(`/approvals/requests/${id}/reject/`, data);
  return unwrapItem<any>(response);
};

export const requestRevision = async (id: string, data: { revision_notes: string; attachment_url?: string }): Promise<any> => {
  const response = await api.post(`/approvals/requests/${id}/request-revision/`, data);
  return unwrapItem<any>(response);
};

export const requestInfo = async (id: string, data: { query: string }): Promise<any> => {
  const response = await api.post(`/approvals/requests/${id}/request-info/`, data);
  return unwrapItem<any>(response);
};

export const addApprovalComment = async (id: string, data: { content: string; comment_type?: string; attachment_url?: string }): Promise<ApprovalComment> => {
  const response = await api.post(`/approvals/requests/${id}/comments/`, data);
  return unwrapItem<ApprovalComment>(response);
};

export const getApprovalComments = async (id: string): Promise<ApprovalComment[]> => {
  const response = await api.get(`/approvals/requests/${id}/comments/`);
  return unwrapList<ApprovalComment>(response);
};

export const checkComplianceGate = async (id: string): Promise<any> => {
  const response = await api.get(`/approvals/requests/${id}/compliance-gate/`);
  return unwrapItem<any>(response);
};

export const escalateRequest = async (id: string, data?: { reason?: string; target_level?: string }): Promise<any> => {
  const response = await api.post(`/approvals/requests/${id}/escalate/`, data || {});
  return unwrapItem<any>(response);
};

export const signDocument = async (id: string): Promise<ApprovalRequest> => {
  const response = await api.post(`/approvals/requests/${id}/sign/`);
  return unwrapItem<ApprovalRequest>(response);
};

export const evaluateCriterion = async (criterionId: string, data: { status: string; notes?: string }): Promise<TechnicalReviewCriteria> => {
  const response = await api.post(`/approvals/criteria/${criterionId}/evaluate/`, data);
  return unwrapItem<TechnicalReviewCriteria>(response);
};

export const getApprovalDecisions = async (params?: Record<string, any>): Promise<ApprovalDecision[]> => {
  const response = await api.get('/approvals/decisions/', { params });
  return unwrapList<ApprovalDecision>(response);
};

export const getApprovalStats = async (): Promise<ApprovalStats> => {
  const response = await api.get('/approvals/stats/overview/');
  return unwrapItem<ApprovalStats>(response);
};
