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

// API Methods
export const getNotifications = async (params?: Record<string, any>): Promise<Notification[]> => {
  const response = await api.get('/notifications/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const createNotification = async (data: Partial<Notification>): Promise<Notification> => {
  const response = await api.post('/notifications/', data);
  return response.data;
};

export const markNotificationRead = async (id: string): Promise<Notification> => {
  const response = await api.post(`/notifications/${id}/read/`);
  return response.data;
};

export const markAllNotificationsRead = async (category?: string): Promise<{ status: string; marked_read_count: number }> => {
  const response = await api.post('/notifications/mark-all-read/', { category });
  return response.data;
};

export const acknowledgeCriticalIncident = async (id: string): Promise<Notification> => {
  const response = await api.post(`/notifications/${id}/acknowledge/`);
  return response.data;
};

export const soundSiteAlarm = async (data: { location: string; reason: string }): Promise<Notification> => {
  const response = await api.post('/notifications/sound-alarm/', data);
  return response.data;
};

export const pingAssignee = async (id: string, method: 'Email' | 'Chat' | 'Bell' = 'Email'): Promise<{ status: string; message: string }> => {
  const response = await api.post(`/notifications/${id}/ping/`, { method });
  return response.data;
};

export const getUnreadNotificationCounts = async (): Promise<UnreadCounts> => {
  const response = await api.get('/notifications/unread-counts/');
  return response.data;
};

export const getNotificationPreferences = async (): Promise<NotificationPreference> => {
  const response = await api.get('/notifications/preferences/');
  return response.data;
};

export const updateNotificationPreferences = async (data: Partial<NotificationPreference>): Promise<NotificationPreference> => {
  const response = await api.patch('/notifications/preferences/', data);
  return response.data;
};
