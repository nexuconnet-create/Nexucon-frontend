import api from './api';

// ----------------------------------------------------
// 1. AGENCY PROFILE
// ----------------------------------------------------
export interface AgencyProfile {
  id?: string;
  agency_name: string;
  agency_code: string;
  logo_url?: string | null;
  description: string;
  government_level: string;
  jurisdiction: string;
  official_email: string;
  phone: string;
  website: string;
  office_address: string;
  country: string;
  state: string;
  lga: string;
  timezone: string;
  default_language: string;
  status: string;
  updated_at?: string;
}

export async function getAgencyProfile(): Promise<AgencyProfile> {
  const res: any = await api.get('/settings/profile/');
  return res?.data || res || {};
}

export async function updateAgencyProfile(data: Partial<AgencyProfile>): Promise<AgencyProfile> {
  const res: any = await api.post('/settings/profile/', data);
  return res?.data || res || {};
}

// ----------------------------------------------------
// 2. REPORT PRESENTATION TEMPLATES & VISUALS
// ----------------------------------------------------
export interface FooterConfig {
  show_client_name?: boolean;
  show_project_name?: boolean;
  show_lga_zone?: boolean;
  show_officer_sig?: boolean;
  disclaimer?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  theme_style: string;
  cover_page_style: string;
  header_color: string;
  accent_color: string;
  footer_config: FooterConfig;
  building_code_citations: string[];
  preview_thumbnail_url?: string;
  is_active_default: boolean;
  created_at?: string;
}

export async function getReportTemplates(): Promise<ReportTemplate[]> {
  const res: any = await api.get('/settings/report-templates/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function getActiveReportTemplate(): Promise<ReportTemplate> {
  const res: any = await api.get('/settings/report-templates/active/');
  return res?.data || res || {};
}

export async function setActiveReportTemplate(templateId: string): Promise<ReportTemplate> {
  const res: any = await api.post(`/settings/report-templates/${templateId}/set-default/`);
  return res?.data || res || {};
}

// ----------------------------------------------------
// 3. USER MANAGEMENT & STAFF
// ----------------------------------------------------
export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  phone_number?: string;
  status: string;
  lastLogin: string;
  invited_at?: string;
}

export async function getStaffUsers(params?: { search?: string; department?: string; role?: string }): Promise<StaffUser[]> {
  const res: any = await api.get('/settings/users/', { params });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function inviteStaffUser(data: {
  name: string;
  email: string;
  role: string;
  department: string;
}): Promise<any> {
  const res: any = await api.post('/settings/users/', data);
  return res?.data || res;
}

export async function toggleStaffUserStatus(userId: string): Promise<any> {
  const res: any = await api.post(`/settings/users/${userId}/toggle-status/`);
  return res?.data || res;
}

// ----------------------------------------------------
// 4. ROLES & PERMISSIONS MATRIX
// ----------------------------------------------------
export interface RolePermission {
  id: string;
  module: string;
  permission_name: string;
  is_granted: boolean;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  role_type: string;
  is_system_default: boolean;
  active_users_count: number;
  permissions?: RolePermission[];
}

export interface RoleMatrixModule {
  name: string;
  module?: string;
  permissions: {
    name: string;
    description: string;
    roles: Record<string, boolean>;
    [key: string]: any;
  }[];
}

export interface RolesMatrixResponse {
  roles: string[];
  permission_modules: RoleMatrixModule[];
}

export async function getCustomRoles(): Promise<CustomRole[]> {
  const res: any = await api.get('/settings/roles/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function createCustomRole(data: { name: string; description?: string }): Promise<CustomRole> {
  const res: any = await api.post('/settings/roles/', data);
  return res?.data || res;
}

export async function getRolesMatrix(): Promise<RolesMatrixResponse> {
  const res: any = await api.get('/settings/roles/matrix/');
  return res?.data || res || { roles: [], permission_modules: [] };
}

export async function updateRolesMatrix(updates: {
  role_name: string;
  module: string;
  permission_name: string;
  is_granted: boolean;
}[]): Promise<any> {
  const res: any = await api.post('/settings/roles/matrix/', { updates });
  return res?.data || res;
}

// ----------------------------------------------------
// 5. APPROVAL WORKFLOWS
// ----------------------------------------------------
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
  created_at?: string;
}

export async function getApprovalWorkflows(): Promise<ApprovalWorkflow[]> {
  const res: any = await api.get('/settings/workflows/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function createApprovalWorkflow(data: {
  name: string;
  description?: string;
  steps: { title: string; role: string; icon?: string }[];
}): Promise<ApprovalWorkflow> {
  const res: any = await api.post('/settings/workflows/', data);
  return res?.data || res;
}

// ----------------------------------------------------
// 6. INSPECTION TEMPLATES & CHECKLISTS
// ----------------------------------------------------
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
  created_at?: string;
}

export async function getInspectionTemplates(): Promise<InspectionTemplate[]> {
  const res: any = await api.get('/settings/templates/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function createInspectionTemplate(data: {
  name: string;
  department: string;
  items: { title: string; field_type: string; is_required: boolean }[];
}): Promise<InspectionTemplate> {
  const res: any = await api.post('/settings/templates/', data);
  return res?.data || res;
}

export async function deleteInspectionTemplate(templateId: string): Promise<void> {
  await api.delete(`/settings/templates/${templateId}/`);
}

export async function addChecklistItem(templateId: string, item: {
  title: string;
  field_type: string;
  is_required: boolean;
}): Promise<ChecklistItem> {
  const res: any = await api.post(`/settings/templates/${templateId}/items/`, item);
  return res?.data || res;
}

// ----------------------------------------------------
// 7. COMPLIANCE STANDARDS & STATUTES
// ----------------------------------------------------
export interface ComplianceStandard {
  id: string;
  category: string;
  key: string;
  label: string;
  num_value: number;
  unit?: string;
  alert_level: 'Info' | 'Warning' | 'Critical';
  description?: string;
}

export interface StatutoryDocument {
  id: string;
  code: string;
  name: string;
  connected_features: string[];
  document_url?: string;
}

export async function getComplianceStandards(): Promise<ComplianceStandard[]> {
  const res: any = await api.get('/settings/standards/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function updateComplianceStandards(thresholds: Record<string, number>): Promise<ComplianceStandard[]> {
  const res: any = await api.post('/settings/standards/update-thresholds/', { thresholds });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function getStatutoryDocuments(): Promise<StatutoryDocument[]> {
  const res: any = await api.get('/settings/statutes/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function createStatutoryDocument(data: {
  code: string;
  name: string;
  connected_features: string[];
  document_url?: string;
}): Promise<StatutoryDocument> {
  const res: any = await api.post('/settings/statutes/', data);
  return res?.data || res;
}

// ----------------------------------------------------
// 8. NOTIFICATION PREFERENCES & ROUTING RULES
// ----------------------------------------------------
export interface NotificationPreferenceCategoryItem {
  id: string;
  event_label: string;
  in_app: boolean;
  email: boolean;
  sms: boolean;
  is_locked: boolean;
}

export interface NotificationPreferenceGroup {
  category: string;
  items: NotificationPreferenceCategoryItem[];
}

export type NotificationCategoryGroup = NotificationPreferenceGroup;

export interface NotificationRoutingRule {
  id: string;
  trigger_event: string;
  primary_recipient: string;
  sla_timeline: string;
  escalation_target: string;
  is_active: boolean;
}

export async function getNotificationPreferences(): Promise<NotificationPreferenceGroup[]> {
  const res: any = await api.get('/settings/notifications/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function updateNotificationPreference(data: {
  category: string;
  event_label: string;
  channel: 'in_app' | 'email' | 'sms';
  enabled: boolean;
}): Promise<any> {
  const res: any = await api.post('/settings/notifications/update-preference/', data);
  return res?.data || res;
}

export async function getNotificationRoutingRules(): Promise<NotificationRoutingRule[]> {
  const res: any = await api.get('/settings/routing-rules/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function createNotificationRoutingRule(data: {
  trigger_event: string;
  primary_recipient: string;
  sla_timeline: string;
  escalation_target: string;
}): Promise<NotificationRoutingRule> {
  const res: any = await api.post('/settings/routing-rules/', data);
  return res?.data || res;
}

export async function deleteNotificationRoutingRule(id: string): Promise<void> {
  await api.delete(`/settings/routing-rules/${id}/`);
}

// ----------------------------------------------------
// 9. WEBHOOK SUBSCRIPTIONS
// ----------------------------------------------------
export interface WebhookSubscription {
  id: string;
  name: string;
  target_url: string;
  events: string[];
  status: 'Active' | 'Paused' | 'Failing';
  secret_token?: string;
  created_at?: string;
}

export async function getWebhookSubscriptions(): Promise<WebhookSubscription[]> {
  const res: any = await api.get('/settings/webhooks/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

export async function createWebhookSubscription(data: {
  name: string;
  target_url: string;
  events: string[];
}): Promise<WebhookSubscription> {
  const res: any = await api.post('/settings/webhooks/', data);
  return res?.data || res;
}

export async function deleteWebhookSubscription(id: string): Promise<void> {
  await api.delete(`/settings/webhooks/${id}/`);
}

// ----------------------------------------------------
// BACKWARDS COMPATIBILITY ALIASES
// ----------------------------------------------------
export const addRoutingRule = createNotificationRoutingRule;
export const addStatutoryDocument = createStatutoryDocument;
export const createWebhook = createWebhookSubscription;
export const createWorkflow = createApprovalWorkflow;
export const getWorkflows = getApprovalWorkflows;
export const getWebhooks = getWebhookSubscriptions;
export const deleteRoutingRule = deleteNotificationRoutingRule;
export const deleteWebhook = deleteWebhookSubscription;
export const getRoutingRules = getNotificationRoutingRules;
