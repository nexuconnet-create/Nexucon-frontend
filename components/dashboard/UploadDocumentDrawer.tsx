"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, UploadCloud, Folder, CheckCircle, HardDrive } from 'lucide-react';
import { createDocument } from '@/services/documents';
import { getProjects, Project } from '@/services/projects';

interface UploadDocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultProjectId?: string;
  defaultFolder?: string;
}

export default function UploadDocumentDrawer({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId,
  defaultFolder
}: UploadDocumentDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState(defaultFolder || '01_Architectural');
  const [documentType, setDocumentType] = useState('PROJECT_DOCUMENT');
  const [discipline, setDiscipline] = useState('Architecture');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [fileSize, setFileSize] = useState('12.4 MB');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      .catch(err => console.error("Failed to load projects", err));

    if (defaultFolder) setFolder(defaultFolder);
  }, [isOpen, defaultProjectId, defaultFolder]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      if (!title) setTitle(f.name);
      
      const ext = f.name.split('.').pop()?.toUpperCase() || 'PDF';
      setFileFormat(ext);

      const mb = f.size / (1024 * 1024);
      setFileSize(mb >= 1 ? `${mb.toFixed(1)} MB` : `${(f.size / 1024).toFixed(1)} KB`);
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
        formData.append('document_type', documentType);
        formData.append('discipline', discipline);
        formData.append('file_format', fileFormat);
        formData.append('file_size', fileSize);
        if (expiryDate) formData.append('expiry_date', expiryDate);

        await createDocument(formData);
      } else {
        await createDocument({
          project: selectedProjectId,
          title: title || 'Project Document',
          folder,
          document_type: documentType as any,
          discipline: discipline as any,
          file_format: fileFormat,
          file_size: fileSize,
          expiry_date: expiryDate || undefined,
          file_url: `https://ba64cd9c51c2da4db93a1886397fd7b3.r2.cloudflarestorage.com/nexucondocument/projects/${title.replace(/ /g, '_')}.pdf`
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Document uploaded and registered in Cloudflare R2 repository!', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const respData = err.response?.data;
      let msg = 'Failed to upload document';
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

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-[#022C4F] flex items-center gap-2">
              <FileText className="text-blue-600" size={22} /> Upload Project Document
            </h2>
            <p className="text-xs text-slate-500 mt-1">Direct upload to Cloudflare R2 Storage (Bucket: nexucondocument).</p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.reference_number || 'PRJ'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Document Title</label>
            <input
              type="text"
              placeholder="e.g. Ground Floor Plan - Revision Final.pdf"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Destination Sub-Folder</label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="01_Architectural">01_Architectural</option>
                <option value="02_Structural">02_Structural</option>
                <option value="03_MEP_Systems">03_MEP_Systems</option>
                <option value="04_Permits_Legal">04_Permits_Legal</option>
                <option value="05_Geotechnical">05_Geotechnical</option>
                <option value="06_Site_Inspections">06_Site_Inspections</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Discipline</label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Architecture">Architecture</option>
                <option value="Structural">Structural</option>
                <option value="MEP">MEP</option>
                <option value="Planning">Planning</option>
                <option value="Legal">Legal</option>
                <option value="Environmental">Environmental</option>
                <option value="Civil">Civil</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="PROJECT_DOCUMENT">Project Document</option>
                <option value="SUBMITTED_DRAWING">Submitted 2D Drawing</option>
                <option value="TECHNICAL_REPORT">Technical Report</option>
                <option value="COMPLIANCE_DOCUMENT">Compliance Certificate</option>
                <option value="INSPECTION_REPORT">Inspection QA/QC Report</option>
                <option value="APPROVAL_RECORD">Approval Record</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Cloudflare R2 Upload Box */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.dwg,.dxf,.ifc,.docx,.xlsx,.png,.jpg"
          />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-200 rounded-3xl p-6 text-center hover:border-blue-500 bg-blue-50/30 transition-all cursor-pointer group"
          >
            <UploadCloud className="mx-auto text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={36} />
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-800">{selectedFile.name}</p>
                <p className="text-[11px] text-emerald-600 font-bold">{fileSize} • Ready to stream to Cloudflare R2</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-black text-slate-800">Click to Select File for Cloudflare R2 Upload</p>
                <p className="text-[11px] text-slate-400 mt-1">Bucket: nexucondocument • Supports PDF, DWG, DOCX, XLSX</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud size={16} /> {isSubmitting ? 'Uploading to R2...' : 'Upload Document'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
