import api from './api';

export interface AuditEvent {
  id: string;
  audit_reference: string;
  user?: string;
  user_name: string;
  user_role: string;
  user_email?: string;
  action: string;
  event_type?: string;
  resource_type: string;
  resource_id: string;
  project_name: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  previous_state?: Record<string, any>;
  new_state?: Record<string, any>;
  metadata?: Record<string, any>;
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
  user_role: string;
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
export const getAuditEvents = async (params?: Record<string, any>): Promise<AuditEvent[]> => {
  const response = await api.get('/audit/events/', { params });
  return unwrapList<AuditEvent>(response);
};

export const getAuditEventDetail = async (id: string): Promise<AuditEvent> => {
  const response = await api.get(`/audit/events/${id}/`);
  return unwrapItem<AuditEvent>(response);
};

export const getAuditEventDiff = async (id: string): Promise<AuditDiff> => {
  const response = await api.get(`/audit/events/${id}/diff/`);
  return unwrapItem<AuditDiff>(response);
};

export const verifyAuditHashChain = async (): Promise<HashChainVerification> => {
  const response = await api.post('/audit/events/verify-chain/');
  return unwrapItem<HashChainVerification>(response);
};

export const getAuditSummary = async (): Promise<AuditSummary> => {
  const response = await api.get('/audit/events/summary/');
  return unwrapItem<AuditSummary>(response);
};

export const exportAuditLedger = async (filters?: Record<string, any>): Promise<Blob> => {
  const response = await api.post('/audit/events/export/', filters || {}, {
    responseType: 'blob'
  });
  return response.data || response;
};
