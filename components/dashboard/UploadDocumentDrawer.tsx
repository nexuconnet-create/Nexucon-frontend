"use client";

import React, { useState, useEffect } from 'react';
import { X, FileText, UploadCloud, Folder, CheckCircle } from 'lucide-react';
import { createDocument } from '@/services/documents';
import { getProjects, Project } from '@/services/projects';

interface UploadDocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadDocumentDrawer({
  isOpen,
  onClose,
  onSuccess
}: UploadDocumentDrawerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('01_Architectural');
  const [documentType, setDocumentType] = useState('DRAWING');
  const [discipline, setDiscipline] = useState('Architecture');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [fileSize, setFileSize] = useState('12.4 MB');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].id);
      })
      .catch(err => console.error("Failed to load projects", err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Project is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createDocument({
        project: selectedProjectId,
        title: title || 'Project Document',
        folder,
        document_type: documentType as any,
        discipline: discipline as any,
        file_format: fileFormat,
        file_size: fileSize,
        expiry_date: expiryDate || undefined,
        file_url: 'https://ba64cd9c51c2da4db93a1886397fd7b3.r2.cloudflarestorage.com/nexucondocument/sample.pdf'
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Document uploaded and registered in repository!', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to upload document';
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
            <p className="text-xs text-slate-500 mt-1">Upload technical drawings, reports, or contracts to Cloudflare R2 storage.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
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
                <option key={p.id} value={p.id}>{p.name} ({p.reference_number})</option>
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Destination Folder</label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="01_Architectural">01_Architectural</option>
                <option value="02_Structural">02_Structural</option>
                <option value="03_MEP_Systems">03_MEP_Systems</option>
                <option value="04_Site_Photos">04_Site_Photos</option>
                <option value="Contracts_&_Legal">Contracts_&_Legal</option>
                <option value="Compliance">Compliance</option>
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
                <option value="DRAWING">2D Drawing (PDF/DWG)</option>
                <option value="CONTRACT">Contract & Agreement</option>
                <option value="INSPECTION_REPORT">Inspection Report</option>
                <option value="COMPLIANCE_CERTIFICATE">Compliance Certificate</option>
                <option value="REPORT">Technical Report</option>
                <option value="SITE_PHOTO">Site Photograph</option>
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
          <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center hover:border-blue-400 bg-blue-50/30 transition-colors">
            <UploadCloud className="mx-auto text-blue-600 mb-2" size={32} />
            <p className="text-xs font-bold text-slate-700">Drop files to upload to Cloudflare R2</p>
            <p className="text-[11px] text-slate-400 mt-1">Bucket: nexucondocument • Supports PDF, DWG, DOCX, XLSX</p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <UploadCloud size={16} /> {isSubmitting ? 'Uploading to R2...' : 'Upload Document'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
