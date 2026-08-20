import api from './api';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  role_type: string;
  is_system_default: boolean;
  active_users_count: number;
}

export interface PermissionRow {
  name: string;
  admin: boolean;
  planner: boolean;
  inspector: boolean;
  reviewer: boolean;
}

export interface PermissionModule {
  module: string;
  permissions: PermissionRow[];
}

export interface RolesMatrixResponse {
  roles: { name: string; users: number; type: string }[];
  permission_modules: PermissionModule[];
}

export interface WorkflowStep {
  id?: string;
  step_order: number;
  title: string;
  role: string;
  icon_name?: string;
  is_system_enforced?: boolean;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  status: 'Active' | 'System Enforced' | 'Draft' | 'Archived';
  steps: WorkflowStep[];
}

export interface ChecklistItem {
  id?: string;
  item_order: number;
  title: string;
  field_type: 'Number Input' | 'Pass/Fail Toggle' | 'Photo Upload' | 'Text Input';
  is_required: boolean;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  department: string;
  status: 'Active' | 'Draft' | 'Archived';
  version: string;
  items: ChecklistItem[];
}

export interface ComplianceStandard {
  id: string;
  category: string;
  key: string;
  label: string;
  num_value: number;
  unit?: string;
  alert_level: string;
  description?: string;
}

export interface StatutoryDocument {
  id?: string;
  code: string;
  name: string;
  connected_features: string[];
  document_url?: string;
}

export interface NotificationSettingItem {
  label: string;
  in_app: boolean;
  email: boolean;
  sms: boolean;
  locked: boolean;
}

export interface NotificationCategoryGroup {
  title: string;
  description: string;
  color: string;
  settings: NotificationSettingItem[];
}

export interface NotificationRoutingRule {
  id: string;
  trigger_event: string;
  primary_recipient: string;
  sla_timeline: string;
  escalation_target: string;
  is_active: boolean;
}

export interface WebhookSubscription {
  id: string;
  name: string;
  target_url: string;
  events: string[];
  status: 'Active' | 'Paused' | 'Failing';
  secret_token?: string;
  created_at: string;
}

// API Methods
export const getStaffUsers = async (params?: { search?: string; department?: string; role?: string }): Promise<StaffUser[]> => {
  const response = await api.get('/settings/users/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const inviteStaffUser = async (data: { name: string; email: string; role: string; department: string }) => {
  const response = await api.post('/settings/users/', data);
  return response.data;
};

export const toggleStaffUserStatus = async (userId: string) => {
  const response = await api.post(`/settings/users/${userId}/toggle-status/`);
  return response.data;
};

export const getCustomRoles = async (): Promise<CustomRole[]> => {
  const response = await api.get('/settings/roles/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const createCustomRole = async (data: { name: string; description?: string }): Promise<CustomRole> => {
  const response = await api.post('/settings/roles/', data);
  return response.data;
};

export const getRolesMatrix = async (): Promise<RolesMatrixResponse> => {
  const response = await api.get('/settings/roles/matrix/');
  return response.data;
};

export const updateRolesMatrix = async (updates: { role_name: string; module: string; permission_name: string; is_granted: boolean }[]) => {
  const response = await api.post('/settings/roles/matrix/', { updates });
  return response.data;
};

export const getWorkflows = async (): Promise<ApprovalWorkflow[]> => {
  const response = await api.get('/settings/workflows/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const createWorkflow = async (data: { name: string; description?: string; steps: { title: string; role: string; icon?: string }[] }): Promise<ApprovalWorkflow> => {
  const response = await api.post('/settings/workflows/', data);
  return response.data;
};

export const getInspectionTemplates = async (): Promise<InspectionTemplate[]> => {
  const response = await api.get('/settings/templates/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const createInspectionTemplate = async (data: { name: string; department: string; items?: Partial<ChecklistItem>[] }): Promise<InspectionTemplate> => {
  const response = await api.post('/settings/templates/', data);
  return response.data;
};

export const addChecklistItem = async (templateId: string, data: { title: string; field_type: string; is_required: boolean }): Promise<ChecklistItem> => {
  const response = await api.post(`/settings/templates/${templateId}/items/`, data);
  return response.data;
};

export const deleteInspectionTemplate = async (templateId: string) => {
  const response = await api.delete(`/settings/templates/${templateId}/`);
  return response.data;
};

export const getComplianceStandards = async (): Promise<ComplianceStandard[]> => {
  const response = await api.get('/settings/standards/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const updateComplianceStandards = async (thresholds: Record<string, number>): Promise<ComplianceStandard[]> => {
  const response = await api.post('/settings/standards/update-thresholds/', { thresholds });
  return response.data;
};

export const getStatutoryDocuments = async (): Promise<StatutoryDocument[]> => {
  const response = await api.get('/settings/statutes/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const addStatutoryDocument = async (data: StatutoryDocument): Promise<StatutoryDocument> => {
  const response = await api.post('/settings/statutes/', data);
  return response.data;
};

export const getNotificationPreferences = async (): Promise<NotificationCategoryGroup[]> => {
  const response = await api.get('/settings/notifications/');
  return response.data;
};

export const updateNotificationPreference = async (data: { category: string; event_label: string; channel: string; enabled: boolean }) => {
  const response = await api.post('/settings/notifications/update-preference/', data);
  return response.data;
};

export const getRoutingRules = async (): Promise<NotificationRoutingRule[]> => {
  const response = await api.get('/settings/routing-rules/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const addRoutingRule = async (data: { trigger_event: string; primary_recipient: string; sla_timeline: string; escalation_target: string }): Promise<NotificationRoutingRule> => {
  const response = await api.post('/settings/routing-rules/', data);
  return response.data;
};

export const deleteRoutingRule = async (ruleId: string) => {
  const response = await api.delete(`/settings/routing-rules/${ruleId}/`);
  return response.data;
};

export const getWebhooks = async (): Promise<WebhookSubscription[]> => {
  const response = await api.get('/settings/webhooks/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const createWebhook = async (data: { name: string; target_url: string; events: string[] }): Promise<WebhookSubscription> => {
  const response = await api.post('/settings/webhooks/', data);
  return response.data;
};

export const deleteWebhook = async (webhookId: string) => {
  const response = await api.delete(`/settings/webhooks/${webhookId}/`);
  return response.data;
};
