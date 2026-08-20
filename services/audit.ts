import api from './api';

export interface AuditEvent {
  id: string;
  audit_reference: string;
  user?: string;
  user_name: string;
  user_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  project_name: string;
  ip_address?: string;
  timestamp: string;
  previous_state?: Record<string, any>;
  new_state?: Record<string, any>;
  severity: 'Normal' | 'Warning' | 'High' | 'Critical';
  signature_hash: string;
  is_verified: boolean;
}

export interface AuditDiff {
  audit_reference: string;
  action: string;
  resource_type: string;
  resource_id: string;
  user_name: string;
  timestamp: string;
  changes_count: number;
  changes: Array<{ field: string; previous: any; current: any }>;
}

export interface HashChainVerification {
  status: string;
  chain_integrity: string;
  total_blocks_checked: number;
  tampered_blocks_detected: number;
  root_hash: string;
  latest_block_hash: string;
  verified_at: string;
}

export interface AuditSummary {
  total_records: number;
  today_events: number;
  critical_alerts: number;
  chain_status: string;
  active_sessions: number;
  two_factor_coverage: string;
  failed_logins_24h: number;
}

// API Methods
export const getAuditEvents = async (params?: Record<string, any>): Promise<AuditEvent[]> => {
  const response = await api.get('/audit/events/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getAuditEventDetail = async (id: string): Promise<AuditEvent> => {
  const response = await api.get(`/audit/events/${id}/`);
  return response.data;
};

export const getAuditEventDiff = async (id: string): Promise<AuditDiff> => {
  const response = await api.get(`/audit/events/${id}/diff/`);
  return response.data;
};

export const verifyAuditHashChain = async (): Promise<HashChainVerification> => {
  const response = await api.post('/audit/events/verify-chain/');
  return response.data;
};

export const getAuditSummary = async (): Promise<AuditSummary> => {
  const response = await api.get('/audit/events/summary/');
  return response.data;
};
