import api from './api';

export interface ProjectProfessional {
  name: string;
  organization?: string;
  license_number?: string;
  email?: string;
  phone?: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  reference_number: string;
  project_type?: string;
  description?: string;
  status: string;
  development_category?: string;
  estimated_project_value?: string;
  number_of_floors?: number;
  
  developer_name?: string;
  developer_organization?: string;
  developer_reg_number?: string;
  developer_email?: string;
  developer_phone?: string;
  developer_address?: string;
  developer_contact_person?: string;

  site_address?: string;
  state?: string;
  lga?: string;
  ward_area?: string;
  plot_number?: string;
  block_number?: string;
  land_title_reference?: string;

  permit_number?: string;
  permit_status?: string;
  planning_approval_reference?: string;
  building_control_reference?: string;
  environmental_approval_reference?: string;
  existing_applications?: string;
  applicable_regulations?: string;
  regulatory_authority?: string;
  approval_date?: string;
  permit_expiry_date?: string;

  primary_use?: string;
  proposed_use?: string;
  site_area?: string;
  gross_floor_area?: string;
  building_height?: string;
  number_of_units?: number;
  construction_method?: string;
  structural_system?: string;
  special_requirements?: string;

  assigned_department?: string;
  assigned_officer?: string;
  assigned_inspector?: string;
  technical_reviewer?: string;
  compliance_officer?: string;
  project_priority?: string;
  monitoring_category?: string;
  inspection_frequency?: string;
  internal_notes?: string;

  enable_site_monitoring?: boolean;
  enable_gnss?: boolean;
  enable_bim?: boolean;
  inspection_required?: boolean;
  compliance_monitoring_required?: boolean;
  progress_reporting_required?: boolean;
  site_verification_required?: boolean;

  start_date: string | null;
  estimated_completion: string | null;
  created_at: string;
  updated_at?: string;

  professionals?: ProjectProfessional[];
}

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects/projects/');
  return response as unknown as Project[]; // Data unwrapped by interceptor
};

export const getProjectById = async (id: string): Promise<Project> => {
  const response = await api.get(`/projects/projects/${id}/`);
  return response as unknown as Project;
};

export const createProject = async (data: Partial<Project>): Promise<Project> => {
  const response = await api.post('/projects/projects/', data);
  return response as unknown as Project;
};

export const uploadProjectDocument = async (projectId: string, file: File, documentType: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  formData.append('name', file.name);

  const response = await api.post(`/projects/projects/${projectId}/upload-document/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};
