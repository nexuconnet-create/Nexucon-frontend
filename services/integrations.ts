import api from './api';

export interface TersusDevice {
  id: string;
  device_id: string;
  name: string;
  device_type: string;
  status: 'Active' | 'Offline' | 'Degraded' | 'Syncing';
  battery_level: string;
  ip_address?: string;
  latitude: number;
  longitude: number;
  firmware_version: string;
  last_sync: string;
}

export interface BIMIntegration {
  id: string;
  provider: string;
  status: 'Connected' | 'Disconnected' | 'Syncing' | 'Error';
  client_id?: string;
  synced_models_count: number;
  webhook_url?: string;
  icon_code: string;
  last_sync: string;
}

export interface DocumentSystemIntegration {
  id: string;
  name: string;
  system_type: string;
  status: 'Active' | 'Syncing' | 'Paused' | 'Error';
  bucket_or_drive_name: string;
  endpoint_url: string;
  synced_files_count: number;
  last_sync: string;
}

export interface GovernmentAPIIntegration {
  id: string;
  api_key_identifier: string;
  name: string;
  description?: string;
  endpoint_url: string;
  status: 'connected' | 'degraded' | 'disconnected' | 'syncing';
  data_flow_direction: 'Inbound' | 'Outbound' | 'Bidirectional';
  last_sync: string;
}

export interface APIKeyCredential {
  id: string;
  name: string;
  key_prefix: string;
  raw_key?: string;
  app_type: string;
  volume_tier: string;
  status: 'Healthy' | 'Revoked' | 'Rate Limited';
  last_used_at: string;
  created_at: string;
}

export interface IntegrationLog {
  id: string;
  log_reference: string;
  service_name: string;
  event_name: string;
  status: 'Success' | 'Failed' | 'Warning';
  payload_size: string;
  http_status_code: number;
  details?: string;
  created_at: string;
}

export interface IntegrationStats {
  total_requests_24h: string;
  active_webhooks: number;
  failed_requests_rate: string;
  active_devices_count: number;
  total_devices_count: number;
  connected_bim_count: number;
  active_dms_count: number;
}

// API Functions
export const getTersusDevices = async (params?: Record<string, any>): Promise<TersusDevice[]> => {
  const response = await api.get('/integrations/tersus/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const registerTersusDevice = async (data: Partial<TersusDevice>): Promise<TersusDevice> => {
  const response = await api.post('/integrations/tersus/', data);
  return response.data;
};

export const forceSyncTersusDevice = async (id: string): Promise<TersusDevice> => {
  const response = await api.post(`/integrations/tersus/${id}/force-sync/`);
  return response.data;
};

export const getBimIntegrations = async (): Promise<BIMIntegration[]> => {
  const response = await api.get('/integrations/bim/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const connectBimPlatform = async (data: Partial<BIMIntegration>): Promise<BIMIntegration> => {
  const response = await api.post('/integrations/bim/', data);
  return response.data;
};

export const syncBimPlatform = async (id: string): Promise<BIMIntegration> => {
  const response = await api.post(`/integrations/bim/${id}/sync/`);
  return response.data;
};

export const getDocumentSystems = async (): Promise<DocumentSystemIntegration[]> => {
  const response = await api.get('/integrations/documents/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const connectDocumentSystem = async (data: Partial<DocumentSystemIntegration>): Promise<DocumentSystemIntegration> => {
  const response = await api.post('/integrations/documents/', data);
  return response.data;
};

export const syncDocumentSystem = async (id: string): Promise<DocumentSystemIntegration> => {
  const response = await api.post(`/integrations/documents/${id}/sync/`);
  return response.data;
};

export const getGovernmentApis = async (): Promise<GovernmentAPIIntegration[]> => {
  const response = await api.get('/integrations/government/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const testGovernmentApi = async (id: string): Promise<GovernmentAPIIntegration> => {
  const response = await api.post(`/integrations/government/${id}/test-connection/`);
  return response.data;
};

export const addGovernmentApi = async (data: Partial<GovernmentAPIIntegration>): Promise<GovernmentAPIIntegration> => {
  const response = await api.post('/integrations/government/', data);
  return response.data;
};

export const getApiKeys = async (): Promise<APIKeyCredential[]> => {
  const response = await api.get('/integrations/api-keys/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const generateApiKey = async (data: { name: string; app_type?: string; volume_tier?: string }): Promise<APIKeyCredential> => {
  const response = await api.post('/integrations/api-keys/', data);
  return response.data;
};

export const getIntegrationLogs = async (params?: Record<string, any>): Promise<IntegrationLog[]> => {
  const response = await api.get('/integrations/logs/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getIntegrationStats = async (): Promise<IntegrationStats> => {
  const response = await api.get('/integrations/stats/');
  return response.data;
};
