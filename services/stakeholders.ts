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
}

export interface ProjectStakeholderTeam {
  id: string;
  project_reference: string;
  project_name: string;
  location: string;
  status: string;
  team_data: {
    developer?: { name: string; role: string; initials: string };
    contractor?: { name: string; role: string; initials: string };
    architect?: { name: string; role: string; initials: string };
    inspector?: { name: string; role: string; initials: string };
  };
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
  minutes_notes?: string;
  created_at: string;
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
  created_at: string;
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

// API Methods
export const getDevelopers = async (params?: Record<string, any>): Promise<Developer[]> => {
  const response = await api.get('/stakeholders/developers/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const createDeveloper = async (data: Partial<Developer>): Promise<Developer> => {
  const response = await api.post('/stakeholders/developers/', data);
  return response.data;
};

export const getContractors = async (params?: Record<string, any>): Promise<Contractor[]> => {
  const response = await api.get('/stakeholders/contractors/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const validateContractorLicense = async (id: string): Promise<any> => {
  const response = await api.post(`/stakeholders/contractors/${id}/validate-license/`);
  return response.data;
};

export const getConsultants = async (params?: Record<string, any>): Promise<Consultant[]> => {
  const response = await api.get('/stakeholders/consultants/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getInspectors = async (params?: Record<string, any>): Promise<Inspector[]> => {
  const response = await api.get('/stakeholders/inspectors/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const reassignInspectorZone = async (id: string, zone: string): Promise<Inspector> => {
  const response = await api.post(`/stakeholders/inspectors/${id}/reassign-zone/`, { zone });
  return response.data;
};

export const getLicensedProfessionals = async (params?: Record<string, any>): Promise<LicensedProfessional[]> => {
  const response = await api.get('/stakeholders/professionals/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getProjectTeams = async (params?: Record<string, any>): Promise<ProjectStakeholderTeam[]> => {
  const response = await api.get('/stakeholders/teams/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getBlacklistRecords = async (): Promise<BlacklistRecord[]> => {
  const response = await api.get('/stakeholders/blacklist/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const toggleBlacklist = async (data: { entity_type: string; entity_id: string; entity_name: string; reason: string; status?: string }): Promise<BlacklistRecord> => {
  const response = await api.post('/stakeholders/blacklist/toggle/', data);
  return response.data;
};

export const getMeetings = async (): Promise<StakeholderMeeting[]> => {
  const response = await api.get('/stakeholders/meetings/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const scheduleMeeting = async (data: Partial<StakeholderMeeting>): Promise<StakeholderMeeting> => {
  const response = await api.post('/stakeholders/meetings/', data);
  return response.data;
};

export const startMeeting = async (id: string): Promise<any> => {
  const response = await api.post(`/stakeholders/meetings/${id}/start/`);
  return response.data;
};

export const getMessages = async (params?: { channel?: string }): Promise<StakeholderMessage[]> => {
  const response = await api.get('/stakeholders/messages/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const sendMessage = async (data: Partial<StakeholderMessage>): Promise<StakeholderMessage> => {
  const response = await api.post('/stakeholders/messages/', data);
  return response.data;
};

export const getStakeholderStats = async (): Promise<StakeholderStats> => {
  const response = await api.get('/stakeholders/stats/');
  return response.data;
};
