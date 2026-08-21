import api from './api';

export interface Notification {
  id: string;
  notification_reference: string;
  recipient?: string;
  recipient_name?: string;
  recipient_role: string;
  category: 'CRITICAL' | 'APPLICATIONS' | 'INSPECTIONS' | 'COMPLIANCE' | 'APPROVALS' | 'OVERDUE' | 'GENERAL';
  title: string;
  message: string;
  snippet?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  severity: string;
  location?: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  action_required?: string;
  is_read: boolean;
  read_at?: string;
  is_acknowledged: boolean;
  acknowledged_by_name?: string;
  acknowledged_at?: string;
  email_sent: boolean;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  email_critical_alerts: boolean;
  email_daily_digest: boolean;
  email_approval_requests: boolean;
  email_inspection_updates: boolean;
  email_compliance_ncrs: boolean;
  sms_emergency_alerts: boolean;
  in_app_sound: boolean;
}

export interface UnreadCounts {
  total_unread: number;
  critical: number;
  applications: number;
  inspections: number;
  compliance: number;
  approvals: number;
  overdue: number;
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
export const getNotifications = async (params?: Record<string, any>): Promise<Notification[]> => {
  const response = await api.get('/notifications/', { params });
  return unwrapList<Notification>(response);
};

export const createNotification = async (data: Partial<Notification>): Promise<Notification> => {
  const response = await api.post('/notifications/', data);
  return unwrapItem<Notification>(response);
};

export const markNotificationRead = async (id: string): Promise<Notification> => {
  const response = await api.post(`/notifications/${id}/read/`);
  return unwrapItem<Notification>(response);
};

export const markAllNotificationsRead = async (category?: string): Promise<{ status: string; marked_read_count: number }> => {
  const response = await api.post('/notifications/mark-all-read/', { category });
  return unwrapItem<{ status: string; marked_read_count: number }>(response);
};

export const acknowledgeCriticalIncident = async (id: string): Promise<Notification> => {
  const response = await api.post(`/notifications/${id}/acknowledge/`);
  return unwrapItem<Notification>(response);
};

export const soundSiteAlarm = async (data: { location: string; reason: string }): Promise<Notification> => {
  const response = await api.post('/notifications/sound-alarm/', data);
  return unwrapItem<Notification>(response);
};

export const pingAssignee = async (id: string, method: 'Email' | 'Chat' | 'Bell' = 'Email'): Promise<{ status: string; message: string }> => {
  const response = await api.post(`/notifications/${id}/ping/`, { method });
  return unwrapItem<{ status: string; message: string }>(response);
};

export const getUnreadNotificationCounts = async (): Promise<UnreadCounts> => {
  const response = await api.get('/notifications/unread-counts/');
  return unwrapItem<UnreadCounts>(response);
};

export const getNotificationPreferences = async (): Promise<NotificationPreference> => {
  const response = await api.get('/notifications/preferences/');
  return unwrapItem<NotificationPreference>(response);
};

export const updateNotificationPreferences = async (data: Partial<NotificationPreference>): Promise<NotificationPreference> => {
  const response = await api.patch('/notifications/preferences/', data);
  return unwrapItem<NotificationPreference>(response);
};
