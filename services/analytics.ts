import api from './api';

export interface ProjectPerformanceItem {
  id: string;
  name: string;
  reference_number: string;
  progress_percentage: number;
  schedule_status: 'On Track' | 'Delayed' | 'Ahead' | 'Minor Lag';
  compliance_percentage: number;
  inspections_count: number;
  open_ncrs_count: number;
  risk_score: number;
  risk_category: 'Low' | 'Moderate' | 'High' | 'Critical';
  overall_health: 'Good' | 'At Risk' | 'Critical';
  lga: string;
}

export interface ProjectPerformanceData {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  delayed_projects: number;
  at_risk_projects: number;
  average_completion_percentage: number;
  schedule_performance_index: number;
  cost_performance_index: number;
  structural_safety_index: string;
  projects_requiring_intervention: number;
  projects_awaiting_government_action: number;
  projects: ProjectPerformanceItem[];
}

export interface RiskContributor {
  type: string;
  severity: string;
  description: string;
  link: string;
}

export interface HotspotStructure {
  id: string;
  structure_name: string;
  project_name: string;
  risk_score: number;
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low';
  primary_vulnerability: string;
  status: string;
  contributors: RiskContributor[];
}

export interface StructuralRiskData {
  average_risk_score: number;
  risk_distribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  hotspot_structures: HotspotStructure[];
  methodology_notes: string;
}

export interface MilestoneTimelineItem {
  id: number;
  title: string;
  date: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  verified: boolean;
}

export interface ProgressAnalyticsData {
  planned_progress_percentage: number;
  actual_progress_percentage: number;
  verified_progress_percentage: number;
  schedule_variance_percentage: number;
  status: string;
  evm: {
    planned_value: string;
    earned_value: string;
    actual_cost: string;
    estimate_at_completion: string;
    cpi: number;
    spi: number;
  };
  milestone_breakdown: {
    total: number;
    verified: number;
    reported_pending_verification: number;
    in_progress: number;
    delayed_blocked: number;
  };
  timeline: MilestoneTimelineItem[];
}

export interface DefectCategory {
  name: string;
  count: number;
  percentage: number;
  severity: string;
}

export interface OfficerRanking {
  id: string;
  name: string;
  role: string;
  inspections_completed: number;
  sla_adherence_rate: number;
  average_review_days: number;
  rank: number;
}

export interface InspectionAnalyticsData {
  total_inspections: number;
  completed_inspections: number;
  pending_inspections: number;
  failed_inspections: number;
  re_inspections_count: number;
  pass_rate_percentage: number;
  average_completion_hours: number;
  defect_categories: DefectCategory[];
  officer_rankings: OfficerRanking[];
}

export interface ComplianceAnalyticsData {
  total_compliance_cases: number;
  compliant_projects_count: number;
  non_compliant_projects_count: number;
  compliance_rate_percentage: number;
  open_ncrs_count: number;
  critical_ncrs_count: number;
  corrective_actions_total: number;
  corrective_actions_overdue: number;
  compliance_certificates_valid: number;
  compliance_certificates_expiring_soon: number;
  average_resolution_days: number;
  recent_audits: Array<{
    title: string;
    format: string;
    ref: string;
    status: string;
    date: string;
  }>;
}

export interface SectorDistributionItem {
  sector: string;
  projects_count: number;
  share_percentage: number;
  avg_compliance: number;
}

export interface LGADistributionItem {
  lga: string;
  projects_count: number;
  compliance_rate: number;
  risk_level: string;
}

export interface ContractorBenchmarkItem {
  contractor: string;
  projects: number;
  compliance_rating: string;
  rank: number;
}

export interface IndustryAnalyticsData {
  total_active_projects: number;
  sector_distribution: SectorDistributionItem[];
  lga_distribution: LGADistributionItem[];
  contractor_benchmarking: ContractorBenchmarkItem[];
}

export interface BudgetCategoryItem {
  name: string;
  budget: number;
  actual: number;
  status: 'over' | 'under';
}

export interface FinancialAnalyticsData {
  total_portfolio_budget: string;
  committed_value: string;
  reported_expenditure: string;
  remaining_budget: string;
  budget_variance_percentage: number;
  regulatory_revenue_collected: string;
  permit_fees: string;
  enforcement_penalties: string;
  outstanding_dues: string;
  collection_efficiency: string;
  category_breakdown: BudgetCategoryItem[];
}

export interface DepartmentMetricItem {
  id: string;
  name: string;
  turnaround_days: number;
  target_days: number;
  efficiency_percentage: number;
  workload_level: string;
  pending_reviews_count: number;
}

export interface AgencyAnalyticsData {
  permit_review_sla_days: number;
  inspection_completion_rate: number;
  compliance_resolution_rate: number;
  approval_turnaround_days: number;
  active_workload_items: number;
  departments: DepartmentMetricItem[];
}

export interface GeneratedReport {
  id: string;
  report_reference: string;
  title: string;
  report_type: 'Executive' | 'Project' | 'Inspection' | 'Compliance' | 'Financial' | 'Performance' | 'Custom';
  format: 'PDF' | 'CSV' | 'XLSX' | 'JSON';
  modules_included: string[];
  period_start?: string;
  period_end?: string;
  status: 'Pending' | 'Generating' | 'Ready' | 'Failed';
  file_url?: string;
  file_size?: string;
  generated_by_name: string;
  created_at: string;
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

const unwrapItem = <T>(res: any): T => {
  if (res && res.data !== undefined && res.data !== null) return res.data;
  return res as T;
};

const unwrapList = <T>(res: any): T[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.results)) return res.results;
  return [];
};

// Pure Direct Backend API Methods
export const getProjectPerformance = async (params?: Record<string, any>): Promise<ProjectPerformanceData> => {
  const response = await api.get('/analytics/performance/', { params });
  return unwrapItem<ProjectPerformanceData>(response);
};

export const getStructuralRisk = async (params?: Record<string, any>): Promise<StructuralRiskData> => {
  const response = await api.get('/analytics/risk/', { params });
  return unwrapItem<StructuralRiskData>(response);
};

export const getProgressAnalytics = async (params?: Record<string, any>): Promise<ProgressAnalyticsData> => {
  const response = await api.get('/analytics/progress/', { params });
  return unwrapItem<ProgressAnalyticsData>(response);
};

export const getInspectionAnalytics = async (paramsOrPeriod?: Record<string, any> | string): Promise<InspectionAnalyticsData> => {
  const params = typeof paramsOrPeriod === 'string' ? { period: paramsOrPeriod } : paramsOrPeriod;
  const response = await api.get('/analytics/inspections/', { params });
  return unwrapItem<InspectionAnalyticsData>(response);
};

export const getComplianceAnalytics = async (params?: Record<string, any>): Promise<ComplianceAnalyticsData> => {
  const response = await api.get('/analytics/compliance/', { params });
  return unwrapItem<ComplianceAnalyticsData>(response);
};

export const getIndustryAnalytics = async (): Promise<IndustryAnalyticsData> => {
  const response = await api.get('/analytics/industry/');
  return unwrapItem<IndustryAnalyticsData>(response);
};

export const getFinancialAnalytics = async (): Promise<FinancialAnalyticsData> => {
  const response = await api.get('/analytics/financial/');
  return unwrapItem<FinancialAnalyticsData>(response);
};

export const getAgencyPerformance = async (): Promise<AgencyAnalyticsData> => {
  const response = await api.get('/analytics/agency/');
  return unwrapItem<AgencyAnalyticsData>(response);
};

export const getGeneratedReports = async (params?: Record<string, any>): Promise<GeneratedReport[]> => {
  const response = await api.get('/analytics/reports/', { params });
  return unwrapList<GeneratedReport>(response);
};

export const createGeneratedReport = async (data: Partial<GeneratedReport>): Promise<GeneratedReport> => {
  const response = await api.post('/analytics/reports/', data);
  return unwrapItem<GeneratedReport>(response);
};

export const downloadGeneratedReport = async (id: string): Promise<any> => {
  const response = await api.get(`/analytics/reports/${id}/download/`);
  return unwrapItem<any>(response);
};

export const mitigateRiskAlert = async (id: string): Promise<any> => {
  const response = await api.post(`/analytics/risk/${id}/mitigate/`);
  return unwrapItem<any>(response);
};

// Legacy backwards-compatible aliases
export const getExecutiveKPIs = async (): Promise<any> => {
  const response = await api.get('/analytics/performance/');
  return unwrapItem<any>(response);
};

export const getFinancialSummary = async (): Promise<any> => {
  const response = await api.get('/analytics/financial/');
  return unwrapItem<any>(response);
};

export const getRiskAssessments = async (params?: Record<string, any>): Promise<RiskAssessmentAlert[]> => {
  const data = await getStructuralRisk(params);
  return (data?.hotspot_structures || []).map((h: any) => ({
    id: h.id,
    structure_name: h.structure_name,
    risk_score: h.risk_score,
    risk_level: h.risk_level,
    primary_vulnerability: h.primary_vulnerability,
    status: h.status as any,
    created_at: new Date().toISOString()
  }));
};

export const getDepartmentPerformance = async (): Promise<any[]> => {
  const data = await getAgencyPerformance();
  return data?.departments || [];
};

export const getOfficerPerformance = async (): Promise<any[]> => {
  const data = await getInspectionAnalytics();
  return data?.officer_rankings || [];
};
