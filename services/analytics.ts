import api from './api';

export interface GeneratedReport {
  id: string;
  report_reference: string;
  title: string;
  report_type: 'Executive' | 'Project' | 'Inspection' | 'Compliance' | 'Financial' | 'Performance' | 'Custom';
  format: 'PDF' | 'CSV' | 'JSON';
  modules_included: string[];
  period_start?: string;
  period_end?: string;
  status: 'Pending' | 'Generating' | 'Ready' | 'Failed';
  file_url?: string;
  file_size?: string;
  generated_by_name: string;
  created_at: string;
}

export interface DepartmentPerformanceMetric {
  id: string;
  department_name: string;
  turnaround_days: number;
  target_days: number;
  efficiency_percentage: number;
  workload_level: 'Low' | 'Medium' | 'High' | 'Critical';
  pending_reviews_count: number;
}

export interface OfficerPerformanceRecord {
  id: string;
  officer_name: string;
  role: string;
  inspections_completed: number;
  sla_adherence_rate: number;
  average_review_days: number;
  rank: number;
}

export interface RiskAssessmentAlert {
  id: string;
  project?: string;
  project_name?: string;
  structure_name: string;
  risk_score: number;
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low';
  primary_vulnerability: string;
  status: 'Active Alert' | 'Under Monitoring' | 'Mitigated';
  created_at: string;
}

export interface ExecutiveKPIs {
  active_projects_count: number;
  issued_permits_count: number;
  completed_inspections_count: number;
  open_ncrs_count: number;
  valid_certificates_count: number;
  pending_approvals_count: number;
  average_turnaround_days: number;
  sla_compliance_rate: number;
  total_revenue_collected: string;
  enforcement_penalties: string;
  structural_safety_index: string;
}

export interface FinancialSummary {
  total_revenue: string;
  permit_fees: string;
  enforcement_penalties: string;
  outstanding_dues: string;
  collection_efficiency: string;
  monthly_breakdown: Array<{ month: string; revenue: number }>;
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
export const getGeneratedReports = async (params?: Record<string, any>): Promise<GeneratedReport[]> => {
  const response = await api.get('/analytics/reports/', { params });
  return unwrapList<GeneratedReport>(response);
};

export const createGeneratedReport = async (data: Partial<GeneratedReport>): Promise<GeneratedReport> => {
  const response = await api.post('/analytics/reports/', data);
  return unwrapItem<GeneratedReport>(response);
};

export const getDepartmentPerformance = async (): Promise<DepartmentPerformanceMetric[]> => {
  const response = await api.get('/analytics/departments/');
  return unwrapList<DepartmentPerformanceMetric>(response);
};

export const getOfficerPerformance = async (): Promise<OfficerPerformanceRecord[]> => {
  const response = await api.get('/analytics/officers/');
  return unwrapList<OfficerPerformanceRecord>(response);
};

export const getRiskAssessments = async (params?: Record<string, any>): Promise<RiskAssessmentAlert[]> => {
  const response = await api.get('/analytics/risk/', { params });
  return unwrapList<RiskAssessmentAlert>(response);
};

export const mitigateRiskAlert = async (id: string): Promise<RiskAssessmentAlert> => {
  const response = await api.post(`/analytics/risk/${id}/mitigate/`);
  return unwrapItem<RiskAssessmentAlert>(response);
};

export const getExecutiveKPIs = async (): Promise<ExecutiveKPIs> => {
  const response = await api.get('/analytics/overview/executive-kpis/');
  return unwrapItem<ExecutiveKPIs>(response);
};

export const getFinancialSummary = async (): Promise<FinancialSummary> => {
  const response = await api.get('/analytics/overview/financial-summary/');
  return unwrapItem<FinancialSummary>(response);
};
