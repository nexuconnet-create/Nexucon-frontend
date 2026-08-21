import api from './api';

export interface DocumentVersion {
  id: string;
  document: string;
  document_title?: string;
  version_number: number;
  version_label: string;
  changes_summary: string;
  author_name: string;
  author_role: string;
  file_url: string;
  file_size: string;
  status: 'Current' | 'Superseded';
  uploaded_at: string;
}

export interface DocumentApproval {
  id: string;
  approval_reference: string;
  document: string;
  document_title?: string;
  document_reference?: string;
  version?: string;
  category: string;
  approved_by_name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  signature_hash?: string;
  reviewed_at: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: 'PERMIT' | 'INSPECTION' | 'ENFORCEMENT' | 'COMPLIANCE' | 'LEGAL';
  description: string;
  file_format: string;
  file_url: string;
  file_size: string;
  usage_count: number;
  created_at: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  project?: string;
  files_count: number;
  total_size: string;
  is_shared: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  document_reference: string;
  project: string;
  project_name?: string;
  project_reference?: string;
  folder: string;
  title: string;
  document_type: 'DRAWING' | 'CONTRACT' | 'INSPECTION_REPORT' | 'COMPLIANCE_CERTIFICATE' | 'SITE_PHOTO' | 'REPORT' | 'PERMIT_ATTACHMENT';
  discipline: 'Architecture' | 'Structural' | 'MEP' | 'Planning' | 'Legal' | 'Environmental' | 'General';
  status: 'DRAFT' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'EXPIRING_SOON';
  current_version: string;
  file_url: string;
  file_size: string;
  file_format: string;
  pages_count: number;
  is_starred: boolean;
  is_shared: boolean;
  expiry_date?: string;
  expiry_status?: 'valid' | 'expiring_soon' | 'expired';
  uploader_name: string;
  is_digitally_stamped: boolean;
  stamped_by_name?: string;
  stamped_at?: string;
  stamp_reference?: string;
  signature_hash?: string;
  created_at: string;
  updated_at: string;
  versions_count?: number;
  versions?: DocumentVersion[];
  approvals?: DocumentApproval[];
}

export interface DocumentStats {
  total_documents: number;
  folders_count: number;
  drawings_count: number;
  approved_count: number;
  stamped_approvals_count: number;
  expired_count: number;
  expiring_soon_count: number;
  templates_count: number;
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
export const getDocuments = async (params?: Record<string, any>): Promise<Document[]> => {
  const response = await api.get('/documents/documents/', { params });
  return unwrapList<Document>(response);
};

export const getDocumentById = async (id: string): Promise<Document> => {
  const response = await api.get(`/documents/documents/${id}/`);
  return unwrapItem<Document>(response);
};

export const createDocument = async (data: Partial<Document>): Promise<Document> => {
  const response = await api.post('/documents/documents/', data);
  return unwrapItem<Document>(response);
};

export const toggleStarDocument = async (id: string): Promise<Document> => {
  const response = await api.post(`/documents/documents/${id}/star/`);
  return unwrapItem<Document>(response);
};

export const applyDocumentStamp = async (id: string, data?: { comments?: string }): Promise<DocumentApproval> => {
  const response = await api.post(`/documents/documents/${id}/stamp/`, data || {});
  return unwrapItem<DocumentApproval>(response);
};

export const reviewDocument = async (id: string, data: { status: 'APPROVED' | 'REJECTED'; comments?: string }): Promise<DocumentApproval> => {
  const response = await api.post(`/documents/documents/${id}/review/`, data);
  return unwrapItem<DocumentApproval>(response);
};

export const createDocumentVersion = async (id: string, data: Partial<DocumentVersion>): Promise<DocumentVersion> => {
  const response = await api.post(`/documents/documents/${id}/create-version/`, data);
  return unwrapItem<DocumentVersion>(response);
};

export const getDocumentVersions = async (params?: Record<string, any>): Promise<DocumentVersion[]> => {
  const response = await api.get('/documents/versions/', { params });
  return unwrapList<DocumentVersion>(response);
};

export const getDocumentApprovals = async (params?: Record<string, any>): Promise<DocumentApproval[]> => {
  const response = await api.get('/documents/approvals/', { params });
  return unwrapList<DocumentApproval>(response);
};

export const getDocumentTemplates = async (params?: Record<string, any>): Promise<DocumentTemplate[]> => {
  const response = await api.get('/documents/templates/', { params });
  return unwrapList<DocumentTemplate>(response);
};

export const createDocumentTemplate = async (data: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
  const response = await api.post('/documents/templates/', data);
  return unwrapItem<DocumentTemplate>(response);
};

export const getDocumentFolders = async (params?: Record<string, any>): Promise<DocumentFolder[]> => {
  const response = await api.get('/documents/folders/', { params });
  return unwrapList<DocumentFolder>(response);
};

export const createDocumentFolder = async (data: Partial<DocumentFolder>): Promise<DocumentFolder> => {
  const response = await api.post('/documents/folders/', data);
  return unwrapItem<DocumentFolder>(response);
};

export const getDocumentStats = async (): Promise<DocumentStats> => {
  const response = await api.get('/documents/stats/overview/');
  return unwrapItem<DocumentStats>(response);
};
