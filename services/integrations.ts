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

// API Functions
export const getTersusDevices = async (params?: Record<string, any>): Promise<TersusDevice[]> => {
  const response = await api.get('/integrations/tersus/', { params });
  return unwrapList<TersusDevice>(response);
};

export const registerTersusDevice = async (data: Partial<TersusDevice>): Promise<TersusDevice> => {
  const response = await api.post('/integrations/tersus/', data);
  return unwrapItem<TersusDevice>(response);
};

export const forceSyncTersusDevice = async (id: string): Promise<TersusDevice> => {
  const response = await api.post(`/integrations/tersus/${id}/force-sync/`);
  return unwrapItem<TersusDevice>(response);
};

export const getBimIntegrations = async (): Promise<BIMIntegration[]> => {
  const response = await api.get('/integrations/bim/');
  return unwrapList<BIMIntegration>(response);
};

export const connectBimPlatform = async (data: Partial<BIMIntegration>): Promise<BIMIntegration> => {
  const response = await api.post('/integrations/bim/', data);
  return unwrapItem<BIMIntegration>(response);
};

export const syncBimPlatform = async (id: string): Promise<BIMIntegration> => {
  const response = await api.post(`/integrations/bim/${id}/sync/`);
  return unwrapItem<BIMIntegration>(response);
};

export const getDocumentSystems = async (): Promise<DocumentSystemIntegration[]> => {
  const response = await api.get('/integrations/documents/');
  return unwrapList<DocumentSystemIntegration>(response);
};

export const connectDocumentSystem = async (data: Partial<DocumentSystemIntegration>): Promise<DocumentSystemIntegration> => {
  const response = await api.post('/integrations/documents/', data);
  return unwrapItem<DocumentSystemIntegration>(response);
};

export const syncDocumentSystem = async (id: string): Promise<DocumentSystemIntegration> => {
  const response = await api.post(`/integrations/documents/${id}/sync/`);
  return unwrapItem<DocumentSystemIntegration>(response);
};

export const getGovernmentApis = async (): Promise<GovernmentAPIIntegration[]> => {
  const response = await api.get('/integrations/government/');
  return unwrapList<GovernmentAPIIntegration>(response);
};

export const testGovernmentApi = async (id: string): Promise<GovernmentAPIIntegration> => {
  const response = await api.post(`/integrations/government/${id}/test-connection/`);
  return unwrapItem<GovernmentAPIIntegration>(response);
};

export const addGovernmentApi = async (data: Partial<GovernmentAPIIntegration>): Promise<GovernmentAPIIntegration> => {
  const response = await api.post('/integrations/government/', data);
  return unwrapItem<GovernmentAPIIntegration>(response);
};

export const getApiKeys = async (): Promise<APIKeyCredential[]> => {
  const response = await api.get('/integrations/api-keys/');
  return unwrapList<APIKeyCredential>(response);
};

export const generateApiKey = async (data: { name: string; app_type?: string; volume_tier?: string }): Promise<APIKeyCredential> => {
  const response = await api.post('/integrations/api-keys/', data);
  return unwrapItem<APIKeyCredential>(response);
};

export const getIntegrationLogs = async (params?: Record<string, any>): Promise<IntegrationLog[]> => {
  const response = await api.get('/integrations/logs/', { params });
  return unwrapList<IntegrationLog>(response);
};

export const getIntegrationStats = async (): Promise<IntegrationStats> => {
  const response = await api.get('/integrations/stats/');
  return unwrapItem<IntegrationStats>(response);
};
