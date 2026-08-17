import api from './api';

export interface UserSession {
  id: string;
  device_info: string;
  ip_address: string;
  last_activity: string;
  login_time: string;
}

export const getSessions = async (): Promise<UserSession[]> => {
  const response = await api.get('/auth/sessions/');
  return response as unknown as UserSession[]; // Data unwrapped by interceptor
};

export const revokeSession = async (sessionId: string): Promise<void> => {
  await api.post(`/auth/sessions/${sessionId}/revoke/`);
};
