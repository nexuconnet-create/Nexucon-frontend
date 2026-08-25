"use client";

import React, { useState, useEffect } from 'react';
import { X, Award, ShieldCheck, CheckCircle, Upload, FileText } from 'lucide-react';
import { issueComplianceCertificate } from '@/services/compliance';
import { getProjects, Project } from '@/services/projects';

interface IssueCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function IssueCertificateModal({
  isOpen,
  onClose,
  onSuccess
}: IssueCertificateModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Environmental');
  const [authority, setAuthority] = useState('Environmental Protection Agency (EPA)');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProjects().then(res => {
      const list = Array.isArray(res) ? res : ((res as any).results || []);
      setProjects(list);
      if (list.length > 0) setSelectedProjectId(list[0].id);
    });
    
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    setExpiryDate(d.toISOString().split('T')[0]);
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
      const formData = new FormData();
      formData.append('project', selectedProjectId);
      formData.append('title', title || `${category} Clearance Certificate`);
      formData.append('category', category);
      formData.append('authority', authority);
      formData.append('expiry_date', expiryDate || '2028-12-31');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await issueComplianceCertificate(formData);

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Compliance certificate issued and saved to Cloudflare R2!', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to issue certificate';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Award size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Issue Compliance Certificate</h3>
              <p className="text-xs text-slate-500">Official Regulatory Authorization stored on Cloudflare R2</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.reference_number})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Certificate Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Environmental Impact Clearance (EIA)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Environmental">Environmental</option>
                <option value="Safety">Safety</option>
                <option value="Quality">Quality</option>
                <option value="Building Code">Building Code</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Valid Until</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Issuing Authority</label>
            <input
              type="text"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Optional Certificate Document Ingestion (Cloudflare R2) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Stamped Document File (Cloudflare R2)
            </label>
            <div className="p-3 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-2xl bg-slate-50 text-center relative cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                <Upload size={16} className="text-blue-500" />
                <span>{selectedFile ? selectedFile.name : 'Choose or drop official stamped PDF...'}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-600 shrink-0" />
            <span>Generates cryptographic SHA-256 QR seal & stores on Cloudflare R2.</span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Award size={14} /> {isSubmitting ? 'Issuing & Uploading...' : 'Issue Certificate'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
