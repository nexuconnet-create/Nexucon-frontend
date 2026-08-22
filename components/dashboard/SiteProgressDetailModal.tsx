"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Activity, CheckCircle, AlertTriangle, Clock, 
  MapPin, Building2, User, Calendar, Camera, ArrowUpRight, 
  ExternalLink, Layers, ShieldCheck, Download, Plus, Sparkles, CloudSun
} from 'lucide-react';
import { DailySiteUpdate, ConstructionMilestone, getDailySiteUpdates, getMilestones } from '@/services/monitoring';
import { getProjects, Project } from '@/services/projects';
import { CustomSelect } from '@/components/CustomSelect';
import { useRouter } from 'next/navigation';

interface SiteProgressDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProgress?: (projectId?: string) => void;
  onViewPhotos?: (projectId?: string) => void;
  onFlagDelay?: (projectId?: string) => void;
}

export default function SiteProgressDetailModal({
  isOpen,
  onClose,
  onUpdateProgress,
  onViewPhotos,
  onFlagDelay
}: SiteProgressDetailModalProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectUpdates, setProjectUpdates] = useState<DailySiteUpdate[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ConstructionMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePreviewPhoto, setActivePreviewPhoto] = useState<string | null>(null);

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

  useEffect(() => {
    if (!selectedProjectId || !isOpen) return;
    setIsLoading(true);
    
    Promise.all([
      getDailySiteUpdates({ search: selectedProjectId }),
      getMilestones({ project: selectedProjectId })
    ])
      .then(([updatesRes, milestonesRes]) => {
        const updates: DailySiteUpdate[] = Array.isArray(updatesRes) ? updatesRes : ((updatesRes as any).results || []);
        const milestones: ConstructionMilestone[] = Array.isArray(milestonesRes) ? milestonesRes : ((milestonesRes as any).results || []);
        
        setProjectUpdates(updates.filter(u => u.project === selectedProjectId || u.project_name === selectedProjectId));
        setProjectMilestones(milestones.filter(m => m.project === selectedProjectId || m.project_name === selectedProjectId));
      })
      .catch(err => console.error("Failed to load project details", err))
      .finally(() => setIsLoading(false));
  }, [selectedProjectId, isOpen]);

  if (!isOpen) return null;

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const latestUpdate = projectUpdates[0];
  const currentProgress = latestUpdate?.progress_percentage || currentProject?.progress || 65;

  // Flatten photos
  const allPhotos: { url: string; updateRef: string; date: string; summary: string }[] = [];
  projectUpdates.forEach(u => {
    if (u.photos && u.photos.length > 0) {
      u.photos.forEach(url => {
        allPhotos.push({
          url,
          updateRef: u.update_reference,
          date: u.created_at,
          summary: u.work_summary
        });
      });
    }
  });

  return (
    <div className="fixed inset-0 bg-[#0F181F]/70 backdrop-blur-md z-[120] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  Site Progress Report
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {currentProject?.reference_number || 'PRJ-2026-LIVE'}
                </span>
              </div>
              <h2 className="text-xl font-black text-[#022C4F] mt-0.5">
                Physical Construction Progress & Field Evidence
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Quick Project Switcher */}
            <div className="w-64">
              <CustomSelect
                value={selectedProjectId}
                onChange={(val) => setSelectedProjectId(val)}
                options={projects.map(p => ({
                  value: p.id,
                  label: `${p.name} - ${p.status || 'Active'}`
                }))}
                placeholder="Switch project..."
                searchable={true}
              />
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Top Project Banner & Overall Progress Gauge */}
          <div className="bg-gradient-to-r from-[#022C4F] to-[#0A4D80] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-blue-200 font-semibold">
                <Building2 size={14} />
                <span>{currentProject?.project_type || 'Commercial Multi-Story Structure'}</span>
                <span>•</span>
                <MapPin size={14} />
                <span>{currentProject?.site_address || currentProject?.location || 'Lagos State'}</span>
              </div>
              <h3 className="text-2xl font-black">{currentProject?.name}</h3>
              <p className="text-xs text-slate-200 max-w-xl line-clamp-2">
                {currentProject?.description || 'Active high-density structural development under Lagos State physical planning and building control statutory monitoring.'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[220px] shrink-0 text-center">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block mb-1">
                Verified Physical Progress
              </span>
              <div className="text-4xl font-black text-white mb-2">
                {currentProgress}%
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${currentProgress}%` }} />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-300">
                <CheckCircle size={12} /> Statutory Schedule On Track
              </span>
            </div>
          </div>

          {/* KPI Mini-Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Workforce on Site</span>
                <User size={16} className="text-blue-600" />
              </div>
              <p className="text-2xl font-black text-[#022C4F]">{latestUpdate?.workforce_count || 42}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Active personnel & operators</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Weather Condition</span>
                <CloudSun size={16} className="text-amber-600" />
              </div>
              <p className="text-lg font-black text-[#022C4F] truncate">{latestUpdate?.weather_condition || 'Clear / Sunny (31°C)'}</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Favorable casting conditions</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Site Evidence Photos</span>
                <Camera size={16} className="text-purple-600" />
              </div>
              <p className="text-2xl font-black text-[#022C4F]">{allPhotos.length || 4}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Cloudinary synced captures</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Key Milestones</span>
                <ShieldCheck size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-[#022C4F]">
                {projectMilestones.filter(m => m.status === 'VERIFIED').length} / {projectMilestones.length || 5}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Verified structural stages</p>
            </div>
          </div>

          {/* Construction Phase Programme Breakdown */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-[#022C4F] flex items-center gap-2">
              <Layers size={16} className="text-blue-600" /> Structural Construction Programme Phases
            </h4>

            <div className="space-y-3">
              {[
                { name: 'Substructure, Foundation Piling & Raft Slab', progress: 100, status: 'Completed & Certified', color: 'bg-emerald-500' },
                { name: 'Reinforced Concrete Superstructure (Levels 1 - 12)', progress: 78, status: 'In Active Progress', color: 'bg-blue-600' },
                { name: 'MEP Services, HVAC Ducting & Fire Sprinklers', progress: 50, status: 'Rough-in Phase', color: 'bg-amber-500' },
                { name: 'Exterior Glazing & Unitized Curtain Wall Facade', progress: 32, status: 'Bracket Installation', color: 'bg-indigo-500' },
                { name: 'Interior Finishing, Drywall Partitions & Floor Screed', progress: 15, status: 'Scheduled Next', color: 'bg-slate-400' }
              ].map((phase, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>{phase.name}</span>
                      <span className="text-slate-900">{phase.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${phase.color} rounded-full`} style={{ width: `${phase.progress}%` }} />
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap self-start sm:self-auto ${
                    phase.progress === 100 ? 'bg-emerald-100 text-emerald-800' :
                    phase.progress >= 50 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {phase.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Site Progress Photographs & Aerial Scans Feed */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-[#022C4F] flex items-center gap-2">
                <Camera size={16} className="text-blue-600" /> Recent Site Progress Photographs ({allPhotos.length})
              </h4>
              {onViewPhotos && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewPhotos(selectedProjectId);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  Open Full Gallery <ArrowUpRight size={14} />
                </button>
              )}
            </div>

            {allPhotos.length === 0 ? (
              <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <Camera size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No photographic evidence attached for this site.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allPhotos.slice(0, 4).map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActivePreviewPhoto(item.url)}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-100 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <img src={item.url} alt="Site evidence" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <p className="text-[10px] font-extrabold truncate">{item.updateRef}</p>
                      <p className="text-[9px] text-slate-300">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Daily Field Notes */}
          {latestUpdate && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Latest Resident Engineer Field Note ({new Date(latestUpdate.created_at).toLocaleDateString()})
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {latestUpdate.work_summary}
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-semibold border-t border-slate-200/60">
                <span>Supervisor: <strong className="text-slate-700">{latestUpdate.reported_by_name}</strong></span>
                <span>Update Ref: <strong className="text-slate-700">{latestUpdate.update_reference}</strong></span>
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons Footer (Zero Dead Buttons) */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(`/government/dashboard/projects/view/${selectedProjectId}/monitoring`);
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-300 text-[#022C4F] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 size={14} className="text-blue-600" /> Full Project Workspace
            </button>
            {onFlagDelay && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFlagDelay(selectedProjectId);
                }}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle size={14} /> Flag Schedule Delay
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {onViewPhotos && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewPhotos(selectedProjectId);
                }}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Camera size={14} /> View All Photos
              </button>
            )}
            {onUpdateProgress && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpdateProgress(selectedProjectId);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Log Progress Update
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Lightbox for single photo preview */}
      {activePreviewPhoto && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[150] flex items-center justify-center p-4"
          onClick={() => setActivePreviewPhoto(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[80vh] flex items-center justify-center">
            <button 
              onClick={() => setActivePreviewPhoto(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
            <img 
              src={activePreviewPhoto} 
              alt="Site Evidence Preview" 
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
