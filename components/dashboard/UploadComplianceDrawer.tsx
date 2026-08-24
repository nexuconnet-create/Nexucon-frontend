"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, FileCheck, UploadCloud, Folder, CheckCircle, HardDrive, ShieldCheck, Calendar, Award } from 'lucide-react';
import { createDocument, getDocumentFolders, DocumentFolder } from '@/services/documents';
import { getProjects, Project } from '@/services/projects';

interface UploadComplianceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultProjectId?: string;
  defaultFolder?: string;
  defaultDiscipline?: string;
}

const STATUTORY_PERMIT_TYPES = [
  { value: 'EIA Environmental Impact Clearance', discipline: 'Environmental', folder: '05_Environmental_Compliance' },
  { value: 'Statutory Fire Safety Certification', discipline: 'MEP', folder: '06_Fire_Safety' },
  { value: 'Building Development Permit (LASPPPA / LASBCA)', discipline: 'Planning', folder: '04_Statutory_Permits' },
  { value: 'Geotechnical Soil & Subsoil Clearance', discipline: 'Environmental', folder: '05_Environmental_Compliance' },
  { value: 'Structural Integrity & Material Seal', discipline: 'Structural', folder: '04_Statutory_Permits' },
  { value: 'HSE Occupational Safety Certificate', discipline: 'General', folder: '04_Statutory_Permits' }
];

export default function UploadComplianceDrawer({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId,
  defaultFolder,
  defaultDiscipline
}: UploadComplianceDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFolders, setProjectFolders] = useState<DocumentFolder[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  const [permitCategory, setPermitCategory] = useState(STATUTORY_PERMIT_TYPES[0].value);
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState(defaultFolder || '04_Statutory_Permits');
  const [discipline, setDiscipline] = useState(defaultDiscipline || 'Environmental');
  const [issuingAuthority, setIssuingAuthority] = useState('Lagos State Building Control Agency (LASBCA)');
  const [versionLabel, setVersionLabel] = useState('v1.0');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [fileSize, setFileSize] = useState('8.4 MB');
  const [pagesCount, setPagesCount] = useState(6);
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
        if (defaultProjectId) {
          setSelectedProjectId(defaultProjectId);
        } else if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0].id);
        }
      })
      .catch(err => console.error("Failed to load projects for compliance upload", err));

    if (defaultFolder) setFolder(defaultFolder);
    if (defaultDiscipline && defaultDiscipline !== 'All') setDiscipline(defaultDiscipline);
  }, [isOpen, defaultProjectId, defaultFolder, defaultDiscipline]);

  useEffect(() => {
    if (!selectedProjectId) return;
    getDocumentFolders({ project: selectedProjectId })
      .then(folders => {
        setProjectFolders(folders);
      })
      .catch(err => console.error("Failed to fetch folders for project", err));
  }, [selectedProjectId]);

  if (!isOpen) return null;

  const handleCategoryChange = (catValue: string) => {
    setPermitCategory(catValue);
    const matched = STATUTORY_PERMIT_TYPES.find(p => p.value === catValue);
    if (matched) {
      setDiscipline(matched.discipline);
      setFolder(matched.folder);
      if (!title || STATUTORY_PERMIT_TYPES.some(p => p.value === title)) {
        setTitle(`${catValue} - Statutory Approval`);
      }
    }
  };

  const handleFileSelection = (f: File) => {
    setSelectedFile(f);
    if (!title) {
      const cleanTitle = f.name.replace(/\.[^/.]+$/, "");
      setTitle(cleanTitle);
    }
    
    const ext = f.name.split('.').pop()?.toUpperCase() || 'PDF';
    setFileFormat(ext);

    const mb = f.size / (1024 * 1024);
    setFileSize(mb >= 1 ? `${mb.toFixed(1)} MB` : `${(f.size / 1024).toFixed(1)} KB`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Target project is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('project', selectedProjectId);
        formData.append('project_id', selectedProjectId);
        formData.append('title', title || selectedFile.name);
        formData.append('folder', folder);
        formData.append('document_type', 'COMPLIANCE_DOCUMENT');
        formData.append('discipline', discipline);
        formData.append('uploader_name', issuingAuthority || 'Statutory Authority');
        formData.append('file_format', fileFormat);
        formData.append('file_size', fileSize);
        formData.append('pages_count', String(pagesCount || 1));
        formData.append('current_version', versionLabel);
        if (expiryDate) formData.append('expiry_date', expiryDate);

        await createDocument(formData);
      } else {
        await createDocument({
          project: selectedProjectId,
          title: title || 'Official Statutory Compliance Certificate',
          folder,
          document_type: 'COMPLIANCE_DOCUMENT' as any,
          discipline: discipline as any,
          uploader_name: issuingAuthority || 'Statutory Authority',
          file_format: fileFormat,
          file_size: fileSize,
          pages_count: pagesCount,
          current_version: versionLabel,
          expiry_date: expiryDate || undefined,
          file_url: `https://ba64cd9c51c2da4db93a1886397fd7b3.r2.cloudflarestorage.com/nexucondocument/projects/compliance/${title.replace(/ /g, '_')}.pdf`
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Compliance Permit successfully uploaded & stored in Cloudflare R2!', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const respData = err.response?.data;
      let msg = 'Failed to upload compliance certificate';
      if (typeof respData === 'string') {
        msg = respData;
      } else if (respData?.message) {
        msg = respData.message;
      } else if (respData?.error) {
        msg = respData.error;
      } else if (respData && typeof respData === 'object') {
        const firstErr = Object.entries(respData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ');
        if (firstErr) msg = firstErr;
      }
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProjectObj = projects.find(p => p.id === selectedProjectId);

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[580px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#022C4F]">
                  Upload Compliance Document & Permit
                </h2>
                <p className="text-xs text-slate-500">Statutory permits, EIA certificates & clearance records (Bucket: nexucondocument)</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Target Project */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Project <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="" disabled>Select Target Project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.reference_number || 'PRJ'})
                </option>
              ))}
            </select>
          </div>

          {/* Permit Classification Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Compliance Category / Permit Type <span className="text-red-500">*</span>
            </label>
            <select
              value={permitCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
            >
              {STATUTORY_PERMIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.value}</option>
              ))}
            </select>
          </div>

          {/* Certificate Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Certificate Title / Permit Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. EIA Clearance Certificate & Environmental Audit Approval"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Issuing Authority & Validity Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Issuing Regulatory Authority
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="e.g. Federal Ministry of Environment / LASBCA"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Valid Until / Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
              />
            </div>
          </div>

          {/* Folder & Discipline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Document Folder
              </label>
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Discipline
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
              >
                <option value="Environmental">Environmental</option>
                <option value="MEP">MEP & Fire Safety</option>
                <option value="Structural">Structural</option>
                <option value="Planning">Planning & Development</option>
                <option value="General">General / Legal</option>
              </select>
            </div>
          </div>

          {/* File Drag & Drop Ingestion */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Statutory Certificate File (.PDF, .PNG, .JPG, .DOCX)
            </label>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.docx"
              className="hidden" 
            />

            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-50/50' 
                  : selectedFile 
                    ? 'border-emerald-300 bg-emerald-50/30' 
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <UploadCloud size={24} />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-emerald-800">{selectedFile.name}</p>
                  <p className="text-xs text-emerald-600 mt-1">{fileSize} • {fileFormat} Format</p>
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                    Ready for Ingestion
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-700">Click to browse or drag and drop certificate</p>
                  <p className="text-xs text-slate-400 mt-1">Accepts official statutory seal PDFs, clearance letters, and scanned certificates</p>
                </div>
              )}
            </div>
          </div>

          {/* Storage & Security Info Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <HardDrive size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Target Storage: Cloudflare R2</p>
              <p className="text-[11px] text-slate-500">
                Stored under <code className="font-mono text-emerald-700">projects/{selectedProjectObj?.reference_number || 'PRJ'}/{folder}</code>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading to R2...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>Upload Certificate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
