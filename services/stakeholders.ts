import api from './api';

export interface Developer {
  id: string;
  developer_id: string;
  name: string;
  status: string;
  active_projects_count: number;
  portfolio_value: string;
  hq_location: string;
  primary_contact_name: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  color_theme: string;
  is_active: boolean;
  is_blacklisted: boolean;
  created_at?: string;
}

export interface Contractor {
  id: string;
  contractor_id: string;
  name: string;
  contractor_type: string;
  status: string;
  license_status: string;
  license_number?: string;
  compliance_score: number;
  active_permits: number;
  specialties: string[];
  color_theme: string;
  is_blacklisted: boolean;
  created_at?: string;
}

export interface Consultant {
  id: string;
  consultant_id: string;
  name: string;
  specialty: string;
  status: string;
  active_roles_count: number;
  hq_location: string;
  description?: string;
  color_theme: string;
  created_at?: string;
}

export interface Inspector {
  id: string;
  inspector_id: string;
  name: string;
  role_title: string;
  inspector_type: string;
  assigned_zone: string;
  active_inspections: number;
  pass_rate: string;
  ncrs_issued: number;
  created_at?: string;
}

export interface LicensedProfessional {
  id: string;
  license_id: string;
  name: string;
  role_title: string;
  firm_name: string;
  license_authority: string;
  license_status: string;
  expiry_date: string;
  active_projects_count: number;
  is_verified: boolean;
  created_at?: string;
}

export interface ProjectStakeholderTeam {
  id: string;
  project_reference: string;
  project_name: string;
  location: string;
  status: string;
  team_data: Record<string, { name: string; role: string; initials: string }>;
  created_at?: string;
}

export interface BlacklistRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  reason: string;
  incident_count: number;
  status: 'Blacklisted' | 'Monitoring' | 'Suspended';
  blacklisted_at: string;
}

export interface MeetingActionItem {
  id: string;
  title: string;
  assignee_name: string;
  due_date: string;
  is_completed: boolean;
  created_at?: string;
}

export interface StakeholderMeeting {
  id: string;
  meeting_reference: string;
  title: string;
  agenda: string;
  project_name: string;
  date: string;
  time_slot: string;
  meeting_type: 'Video Call' | 'Audio Call' | 'In-Person Council';
  initiator_name: string;
  initiator_role: string;
  room_id: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  participants: Array<{ name: string; role: string; status: string }>;
  action_items?: MeetingActionItem[];
  minutes_notes?: string;
  created_at?: string;
}

export interface MessageTranslation {
  id?: string;
  message_id: string;
  target_language: string;
  language_name: string;
  translated_content: string;
  original_content: string;
  provider: string;
  is_cached: boolean;
}

export interface StakeholderMessage {
  id: string;
  sender_name: string;
  sender_role: string;
  channel_name: string;
  project_name: string;
  message_text: string;
  attachment_url?: string;
  attachment_name?: string;
  is_urgent: boolean;
  translations?: MessageTranslation[];
  created_at?: string;
}

export interface StakeholderStats {
  active_inspectors: number;
  total_contractors: number;
  active_developers: number;
  scheduled_meetings: number;
  pending_inspections: number;
  global_pass_rate: string;
  total_ncrs_issued: number;
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
export const getDevelopers = async (params?: Record<string, any>): Promise<Developer[]> => {
  const response = await api.get('/stakeholders/developers/', { params });
  return unwrapList<Developer>(response);
};

export const createDeveloper = async (data: Partial<Developer>): Promise<Developer> => {
  const response = await api.post('/stakeholders/developers/', data);
  return unwrapItem<Developer>(response);
};

export const getContractors = async (params?: Record<string, any>): Promise<Contractor[]> => {
  const response = await api.get('/stakeholders/contractors/', { params });
  return unwrapList<Contractor>(response);
};

export const createContractor = async (data: Partial<Contractor>): Promise<Contractor> => {
  const response = await api.post('/stakeholders/contractors/', data);
  return unwrapItem<Contractor>(response);
};

export const validateContractorLicense = async (id: string): Promise<any> => {
  const response = await api.post(`/stakeholders/contractors/${id}/validate-license/`);
  return unwrapItem<any>(response);
};

export const getConsultants = async (params?: Record<string, any>): Promise<Consultant[]> => {
  const response = await api.get('/stakeholders/consultants/', { params });
  return unwrapList<Consultant>(response);
};

export const createConsultant = async (data: Partial<Consultant>): Promise<Consultant> => {
  const response = await api.post('/stakeholders/consultants/', data);
  return unwrapItem<Consultant>(response);
};

export const getInspectors = async (params?: Record<string, any>): Promise<Inspector[]> => {
  const response = await api.get('/stakeholders/inspectors/', { params });
  return unwrapList<Inspector>(response);
};

export const createInspector = async (data: Partial<Inspector>): Promise<Inspector> => {
  const response = await api.post('/stakeholders/inspectors/', data);
  return unwrapItem<Inspector>(response);
};

export const reassignInspectorZone = async (id: string, zone: string): Promise<Inspector> => {
  const response = await api.post(`/stakeholders/inspectors/${id}/reassign-zone/`, { zone });
  return unwrapItem<Inspector>(response);
};

export const getLicensedProfessionals = async (params?: Record<string, any>): Promise<LicensedProfessional[]> => {
  const response = await api.get('/stakeholders/professionals/', { params });
  return unwrapList<LicensedProfessional>(response);
};

export const createLicensedProfessional = async (data: Partial<LicensedProfessional>): Promise<LicensedProfessional> => {
  const response = await api.post('/stakeholders/professionals/', data);
  return unwrapItem<LicensedProfessional>(response);
};

export const verifyLicensedProfessional = async (id: string): Promise<LicensedProfessional> => {
  const response = await api.post(`/stakeholders/professionals/${id}/verify-license/`);
  return unwrapItem<LicensedProfessional>(response);
};

export const getProjectTeams = async (params?: Record<string, any>): Promise<ProjectStakeholderTeam[]> => {
  const response = await api.get('/stakeholders/teams/', { params });
  return unwrapList<ProjectStakeholderTeam>(response);
};

export const addTeamMember = async (teamId: string, roleKey: string, memberData: { name: string; role: string; initials: string }): Promise<ProjectStakeholderTeam> => {
  const response = await api.post(`/stakeholders/teams/${teamId}/add-member/`, {
    role_key: roleKey,
    member_data: memberData
  });
  return unwrapItem<ProjectStakeholderTeam>(response);
};

export const removeTeamMember = async (teamId: string, roleKey: string): Promise<ProjectStakeholderTeam> => {
  const response = await api.post(`/stakeholders/teams/${teamId}/remove-member/`, {
    role_key: roleKey
  });
  return unwrapItem<ProjectStakeholderTeam>(response);
};

export const getBlacklistRecords = async (): Promise<BlacklistRecord[]> => {
  const response = await api.get('/stakeholders/blacklist/');
  return unwrapList<BlacklistRecord>(response);
};

export const toggleBlacklist = async (data: { entity_type: string; entity_id: string; entity_name: string; reason: string; status?: string }): Promise<BlacklistRecord> => {
  const response = await api.post('/stakeholders/blacklist/toggle/', data);
  return unwrapItem<BlacklistRecord>(response);
};

export const getMeetings = async (): Promise<StakeholderMeeting[]> => {
  const response = await api.get('/stakeholders/meetings/');
  return unwrapList<StakeholderMeeting>(response);
};

export const scheduleMeeting = async (data: Partial<StakeholderMeeting> & { bypass_agency_head_check?: boolean }): Promise<StakeholderMeeting> => {
  const response = await api.post('/stakeholders/meetings/', data);
  return unwrapItem<StakeholderMeeting>(response);
};

export const startMeeting = async (id: string): Promise<any> => {
  const response = await api.post(`/stakeholders/meetings/${id}/start/`);
  return unwrapItem<any>(response);
};

export const addMeetingActionItem = async (meetingId: string, itemData: { title: string; assignee_name?: string; due_date?: string }): Promise<MeetingActionItem> => {
  const response = await api.post(`/stakeholders/meetings/${meetingId}/add-action-item/`, itemData);
  return unwrapItem<MeetingActionItem>(response);
};

export const getMessages = async (params?: { channel?: string }): Promise<StakeholderMessage[]> => {
  const response = await api.get('/stakeholders/messages/', { params });
  return unwrapList<StakeholderMessage>(response);
};

export const sendMessage = async (data: Partial<StakeholderMessage>): Promise<StakeholderMessage> => {
  const response = await api.post('/stakeholders/messages/', data);
  return unwrapItem<StakeholderMessage>(response);
};

export const translateMessage = async (messageId: string, targetLanguage: 'yo' | 'ig' | 'ha' | 'en'): Promise<MessageTranslation> => {
  const response = await api.post(`/stakeholders/messages/${messageId}/translate/`, {
    target_language: targetLanguage
  });
  return unwrapItem<MessageTranslation>(response);
};

export const getStakeholderStats = async (): Promise<StakeholderStats> => {
  const response = await api.get('/stakeholders/stats/');
  return unwrapItem<StakeholderStats>(response);
};
