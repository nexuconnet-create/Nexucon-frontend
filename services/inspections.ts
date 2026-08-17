import api from './api';

export interface Inspection {
  id: string;
  project: string;
  inspector: string;
  inspection_type: string;
  scheduled_date: string;
  status: string;
  created_at: string;
}

export const getInspections = async (): Promise<Inspection[]> => {
  const response = await api.get('/inspections/');
  return response as unknown as Inspection[]; // Data unwrapped by interceptor
};

export const getInspectionById = async (id: string): Promise<Inspection> => {
  const response = await api.get(`/inspections/${id}/`);
  return response as unknown as Inspection;
};
