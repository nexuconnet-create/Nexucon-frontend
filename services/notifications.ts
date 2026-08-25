import api from './api';

export interface Notification {
  id: string;
  notification_reference: string;
  recipient?: string;
  recipient_name?: string;
  recipient_role: string;
  category: 'CRITICAL' | 'APPLICATIONS' | 'INSPECTIONS' | 'COMPLIANCE' | 'APPROVALS' | 'EMERGENCY' | 'OVERDUE' | 'BIM' | 'GPR' | 'DOCUMENTS' | 'MILESTONES' | 'GENERAL';
  event_type?: string;
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
  acknowledged_by?: string;
  acknowledged_by_name?: string;
  acknowledged_at?: string;
  email_sent: boolean;
  email_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface EmailDelivery {
  id: string;
  delivery_reference: string;
  notification?: string;
  recipient_email: string;
  template_key: string;
  subject: string;
  provider: string;
  provider_message_id?: string;
  status: 'QUEUED' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'RETRYING' | 'CANCELLED';
  attempt_count: number;
  last_attempt_at?: string;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  failure_reason?: string;
  idempotency_key?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id?: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  email_applications: boolean;
  email_inspections: boolean;
  email_approvals: boolean;
  email_compliance: boolean;
  email_emergency: boolean;
  email_overdue: boolean;
  email_critical: boolean;
  email_bim: boolean;
  email_gpr: boolean;
  email_documents: boolean;
  email_milestones: boolean;
}

export interface UnreadCounts {
  total_unread: number;
  critical: number;
  applications: number;
  inspections: number;
  compliance: number;
  approvals: number;
  emergency: number;
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

export const getNotification = async (id: string): Promise<Notification> => {
  const response = await api.get(`/notifications/${id}/`);
  return unwrapItem<Notification>(response);
};

export const markNotificationRead = async (id: string): Promise<Notification> => {
  const response = await api.post(`/notifications/${id}/read/`);
  return unwrapItem<Notification>(response);
};

export const markAllNotificationsRead = async (category?: string): Promise<any> => {
  const payload = category ? { category } : {};
  const response = await api.post('/notifications/read-all/', payload);
  return unwrapItem<any>(response);
};

export const acknowledgeNotification = async (id: string): Promise<Notification> => {
  const response = await api.post(`/notifications/${id}/acknowledge/`);
  return unwrapItem<Notification>(response);
};

export const acknowledgeCriticalIncident = acknowledgeNotification;

export const getUnreadCounts = async (): Promise<UnreadCounts> => {
  const response = await api.get('/notifications/unread-counts/');
  return unwrapItem<UnreadCounts>(response);
};

export const getNotificationPreferences = async (): Promise<NotificationPreference> => {
  const response = await api.get('/notifications/preferences/');
  return unwrapItem<NotificationPreference>(response);
};

export const updateNotificationPreferences = async (data: Partial<NotificationPreference>): Promise<NotificationPreference> => {
  const response = await api.put('/notifications/preferences/', data);
  return unwrapItem<NotificationPreference>(response);
};

export const getEmailDeliveries = async (params?: Record<string, any>): Promise<EmailDelivery[]> => {
  const response = await api.get('/notifications/deliveries/', { params });
  return unwrapList<EmailDelivery>(response);
};

export const triggerTestNotification = async (data: Partial<Notification>): Promise<Notification> => {
  const response = await api.post('/notifications/trigger-test/', data);
  return unwrapItem<Notification>(response);
};

export const createNotification = triggerTestNotification;

export const pingAssignee = async (id: string, method: string = 'Email'): Promise<any> => {
  return triggerTestNotification({
    category: 'OVERDUE',
    title: `SLA Ping (${method}): Overdue Action Reminder`,
    message: `Automated statutory officer ping dispatched via ${method} for overdue regulatory action (${id}).`
  });
};

export const soundSiteAlarm = async (data: any): Promise<any> => {
  return triggerTestNotification({
    category: 'EMERGENCY',
    title: `🚨 SITE ALARM SOUNDED: ${data?.incident_type || 'Safety Evacuation'}`,
    message: data?.reason || 'Immediate site alarm activated by government incident controller.',
    priority: 'Critical',
    location: data?.location || 'Monitored Site'
  });
};
