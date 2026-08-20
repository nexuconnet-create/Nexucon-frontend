import api from './api';

export interface Permit {
  id: string;
  permit_number: string;
  project: string;
  project_name: string;
  project_reference: string;
  project_location?: string;
  application: string;
  application_reference: string;
  application_type: string;
  applicant_name: string;
  issued_by?: string;
  issue_date: string;
  expiry_date: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED' | 'RENEWED';
  conditions?: string;
  qr_verification_code?: string;
  renewal_count: number;
  last_renewal_date?: string;
  days_until_expiry?: number;
  is_expiring_soon?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermitStats {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
  suspended: number;
}

export const getPermits = async (params?: {
  status?: string;
  project?: string;
  expiring_soon?: boolean;
  search?: string;
}): Promise<Permit[]> => {
  const res: any = await api.get('/permits/', { params });
  return Array.isArray(res) ? res : (res.results || res.data || []);
};

export const getPermitById = async (id: string): Promise<Permit> => {
  const res: any = await api.get(`/permits/${id}/`);
  return res.data || res;
};

export const getPermitStats = async (): Promise<PermitStats> => {
  const res: any = await api.get('/permits/stats/');
  return res.data || res;
};

export const renewPermit = async (
  id: string,
  payload: { extension_months?: number; notes?: string }
): Promise<Permit> => {
  const res: any = await api.post(`/permits/${id}/renew/`, payload);
  return res.data || res;
};

export const sendPermitExpiryNotice = async (id: string): Promise<any> => {
  const res: any = await api.post(`/permits/${id}/send-notice/`);
  return res.data || res;
};

export const suspendPermit = async (
  id: string,
  payload: { reason: string }
): Promise<Permit> => {
  const res: any = await api.post(`/permits/${id}/suspend/`, payload);
  return res.data || res;
};
