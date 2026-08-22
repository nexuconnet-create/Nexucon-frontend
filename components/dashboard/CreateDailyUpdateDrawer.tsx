"use client";

import React, { useState, useEffect } from 'react';
import { X, Camera, Plus, Activity, CloudSun, MapPin, Building2, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { createDailySiteUpdate, DailySiteUpdate } from '@/services/monitoring';
import { getProjects, Project } from '@/services/projects';
import { CustomSelect } from '@/components/CustomSelect';

interface CreateDailyUpdateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (update?: DailySiteUpdate) => void;
}

export default function CreateDailyUpdateDrawer({
  isOpen,
  onClose,
  onSuccess
}: CreateDailyUpdateDrawerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [updateType, setUpdateType] = useState('DAILY_PHOTO');
  const [progressPercentage, setProgressPercentage] = useState(50);
  const [workSummary, setWorkSummary] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('Clear / Sunny');
  const [workforceCount, setWorkforceCount] = useState(30);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          const activeProj = list.find((p: Project) => p.status === 'ACTIVE') || list[0];
          setSelectedProjectId(activeProj.id);
        }
      })
      .catch(err => console.error("Failed to load projects", err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddPhoto = () => {
    if (photoUrl.trim()) {
      setPhotos([...photos, photoUrl.trim()]);
      setPhotoUrl('');
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !workSummary.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Project and work summary are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      const update = await createDailySiteUpdate({
        project: selectedProjectId,
        update_type: updateType,
        progress_percentage: Number(progressPercentage),
        work_summary: workSummary.trim(),
        weather_condition: weatherCondition,
        workforce_count: Number(workforceCount),
        photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?auto=format&fit=crop&w=1200&q=80']
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Daily site update published successfully', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess(update);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit update';
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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[580px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-[#022C4F] flex items-center gap-2">
              <Camera className="text-blue-600" size={22} /> Daily Site & Photo Update
            </h2>
            <p className="text-xs text-slate-500 mt-1">Upload daily progress photographs, workforce counts, and logs.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-5 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Active Construction Project
            </label>
            <CustomSelect
              value={selectedProjectId}
              onChange={(val) => setSelectedProjectId(val)}
              options={projects.map(p => ({
                value: p.id,
                label: `${p.name} (${p.reference_number || p.id.slice(0,8)}) - ${p.status || 'Active'}`
              }))}
              placeholder="Select project..."
              searchable={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Update Category</label>
              <CustomSelect
                value={updateType}
                onChange={(val) => setUpdateType(val)}
                options={[
                  { value: "DAILY_PHOTO", label: "Daily Photo Update" },
                  { value: "DRONE_SURVEY", label: "Drone Photogrammetry Survey" },
                  { value: "PROGRESS_REPORT", label: "Detailed Progress Report" },
                  { value: "SITE_LOG", label: "General Site Log" }
                ]}
                placeholder="Category..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Weather Condition</label>
              <CustomSelect
                value={weatherCondition}
                onChange={(val) => setWeatherCondition(val)}
                options={[
                  { value: "Clear / Sunny", label: "Clear / Sunny (31°C)" },
                  { value: "Partly Cloudy", label: "Partly Cloudy (29°C)" },
                  { value: "Overcast / Wind", label: "Overcast / Wind (27°C)" },
                  { value: "Light Rain", label: "Light Rain (25°C)" },
                  { value: "Heavy Rain / Suspended", label: "Heavy Rain / Operations Paused" }
                ]}
                placeholder="Weather..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Estimated Progress ({progressPercentage}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={(e) => setProgressPercentage(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Workforce on Site</label>
              <input
                type="number"
                min="0"
                value={workforceCount}
                onChange={(e) => setWorkforceCount(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Daily Summary & Key Milestones</label>
            <textarea
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              rows={3}
              required
              placeholder="e.g. Concluded reinforcement fixing on Level 4 slab. 120m3 concrete cast with slump test compliance verified..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Site Photos & Evidence (URLs)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.example.com/site_photo_1.jpg"
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {photos.map((p, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-24">
                    <img src={p} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus size={16} /> {isSubmitting ? 'Uploading...' : 'Publish Update'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
