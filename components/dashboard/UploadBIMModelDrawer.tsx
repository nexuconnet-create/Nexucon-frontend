"use client";

import React, { useState, useEffect } from 'react';
import { X, Box, UploadCloud, Layers, Compass, CheckCircle } from 'lucide-react';
import { createBIMModel } from '@/services/bim';
import { getProjects, Project } from '@/services/projects';

interface UploadBIMModelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadBIMModelDrawer({
  isOpen,
  onClose,
  onSuccess
}: UploadBIMModelDrawerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState<'Architecture' | 'MEP' | 'Structural' | 'Multi-Disciplinary' | 'Civil/Infrastructure'>('Architecture');
  const [format, setFormat] = useState('IFC4');
  const [lod, setLod] = useState('LOD 300');
  const [fileSize, setFileSize] = useState('345 MB');
  const [elementCount, setElementCount] = useState(12450);
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
      await createBIMModel({
        project: selectedProjectId,
        name: name || `${discipline} Master Model`,
        discipline,
        format,
        lod,
        file_size: fileSize,
        element_count: elementCount,
        file_url: 'https://assets.nexucon.com/bim/sample_model.ifc'
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'BIM model uploaded and registered successfully!', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to upload BIM model';
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
              <Box className="text-blue-600" size={22} /> Upload Building Information Model
            </h2>
            <p className="text-xs text-slate-500 mt-1">Register 3D/4D IFC or Revit model into government repository.</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Model Title</label>
            <input
              type="text"
              placeholder="e.g. Downtown Metro Station - Architecture"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Discipline</label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as any)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Architecture">Architecture</option>
                <option value="MEP">MEP (Mechanical/Electrical/Plumbing)</option>
                <option value="Structural">Structural</option>
                <option value="Multi-Disciplinary">Multi-Disciplinary / Federated</option>
                <option value="Civil/Infrastructure">Civil / Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="IFC4">IFC4 (ISO 16739)</option>
                <option value="IFC2x3">IFC 2x3 Coordination View</option>
                <option value="Revit">Autodesk Revit (.rvt)</option>
                <option value="glTF">glTF / 3D Tiles</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Level of Development (LOD)</label>
              <select
                value={lod}
                onChange={(e) => setLod(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="LOD 200">LOD 200 (Generic)</option>
                <option value="LOD 300">LOD 300 (Specific Geometry)</option>
                <option value="LOD 350">LOD 350 (Coordination & Interfaces)</option>
                <option value="LOD 400">LOD 400 (Fabrication & Assembly)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Element Count</label>
              <input
                type="number"
                value={elementCount}
                onChange={(e) => setElementCount(parseInt(e.target.value) || 0)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Drag and Drop Box */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 bg-slate-50/50 transition-colors">
            <UploadCloud className="mx-auto text-blue-600 mb-2" size={32} />
            <p className="text-xs font-bold text-slate-700">Drop IFC or RVT file here or browse</p>
            <p className="text-[11px] text-slate-400 mt-1">Supports IFC4, IFC2x3, Revit up to 2GB</p>
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
              <UploadCloud size={16} /> {isSubmitting ? 'Uploading...' : 'Upload & Register Model'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
