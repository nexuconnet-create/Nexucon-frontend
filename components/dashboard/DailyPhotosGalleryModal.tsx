"use client";

import React, { useState } from 'react';
import { 
  X, Camera, Download, ExternalLink, Calendar, MapPin, 
  User, Eye, ChevronLeft, ChevronRight, Maximize2, 
  Activity, CloudSun, Plus, Filter, Sparkles, Building2
} from 'lucide-react';
import { DailySiteUpdate } from '@/services/monitoring';
import { Project } from '@/services/projects';

interface DailyPhotosGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  updates: DailySiteUpdate[];
  projects?: Project[];
  onUploadNew?: () => void;
}

export default function DailyPhotosGalleryModal({
  isOpen,
  onClose,
  updates = [],
  projects = [],
  onUploadNew
}: DailyPhotosGalleryModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // Flatten all photos with their update context
  interface GalleryItem {
    photoUrl: string;
    photoIndex: number;
    totalPhotos: number;
    updateId: string;
    updateRef: string;
    updateType: string;
    projectId: string;
    projectName: string;
    projectLocation?: string;
    workSummary: string;
    progressPercentage: number;
    reportedByName: string;
    weatherCondition: string;
    workforceCount: number;
    createdAt: string;
    gpsCoordinates?: { lat?: number; lng?: number };
  }

  const allItems: GalleryItem[] = [];
  updates.forEach(u => {
    const photoList = u.photos && u.photos.length > 0 
      ? u.photos 
      : ['https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?auto=format&fit=crop&w=1200&q=80'];
    
    photoList.forEach((url, pIdx) => {
      allItems.push({
        photoUrl: url,
        photoIndex: pIdx + 1,
        totalPhotos: photoList.length,
        updateId: u.id,
        updateRef: u.update_reference,
        updateType: u.update_type,
        projectId: u.project,
        projectName: u.project_name,
        projectLocation: u.project_location,
        workSummary: u.work_summary,
        progressPercentage: u.progress_percentage,
        reportedByName: u.reported_by_name,
        weatherCondition: u.weather_condition,
        workforceCount: u.workforce_count,
        createdAt: u.created_at,
        gpsCoordinates: u.gps_coordinates
      });
    });
  });

  const filteredItems = allItems.filter(item => {
    if (selectedProjectId !== 'ALL' && item.projectId !== selectedProjectId && item.projectName !== selectedProjectId) return false;
    if (selectedCategory !== 'ALL' && item.updateType !== selectedCategory) return false;
    return true;
  });

  const activePhoto = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((activeLightboxIndex + 1) % filteredItems.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((activeLightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  // Unique projects list for filter tabs
  const projectFilters = [
    { id: 'ALL', name: 'All Construction Sites' },
    ...Array.from(new Set(updates.map(u => u.project_name))).map(name => {
      const match = updates.find(u => u.project_name === name);
      return { id: match?.project || name, name };
    })
  ];

  return (
    <div className="fixed inset-0 bg-[#0F181F]/70 backdrop-blur-md z-[120] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Camera size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  Site Evidence Feed
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {filteredItems.length} Photo{filteredItems.length === 1 ? '' : 's'} Available
                </span>
              </div>
              <h3 className="text-xl font-black text-[#022C4F] mt-0.5">
                Daily Site Progress & Aerial Photo Gallery
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {onUploadNew && (
              <button 
                onClick={() => {
                  onClose();
                  onUploadNew();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Plus size={15} /> Upload Daily Photo
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white shrink-0">
          {/* Project Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {projectFilters.map(proj => (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedProjectId === proj.id 
                    ? 'bg-[#022C4F] text-white shadow-sm' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {proj.name}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                selectedCategory === 'ALL' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedCategory('DAILY_PHOTO')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                selectedCategory === 'DAILY_PHOTO' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daily Photos
            </button>
            <button
              onClick={() => setSelectedCategory('DRONE_SURVEY')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                selectedCategory === 'DRONE_SURVEY' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Drone Surveys
            </button>
          </div>
        </div>

        {/* Gallery Grid Area */}
        <div className="p-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Camera size={48} className="mx-auto mb-3 text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">No site photographs found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No photo updates match the current project or filter selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredItems.map((item, index) => (
                <div 
                  key={`${item.updateId}-${index}`}
                  onClick={() => setActiveLightboxIndex(index)}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  {/* Photo Container */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img 
                      src={item.photoUrl} 
                      alt={item.projectName} 
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    {/* Badges Top */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-white/95 text-[#022C4F] backdrop-blur-sm shadow-sm">
                        {item.updateType.replace('_', ' ')}
                      </span>
                      {item.totalPhotos > 1 && (
                        <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-bold bg-black/60 text-white backdrop-blur-sm">
                          {item.photoIndex}/{item.totalPhotos}
                        </span>
                      )}
                    </div>

                    {/* Progress Pill Top Right */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-500 text-white shadow-sm">
                        {item.progressPercentage}% Progress
                      </span>
                    </div>

                    {/* Project Title Bottom */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <h4 className="text-xs font-extrabold line-clamp-1 drop-shadow-sm">{item.projectName}</h4>
                      <p className="text-[10px] text-white/80 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {item.projectLocation || 'Lagos, Nigeria'}
                      </p>
                    </div>

                    {/* Hover Zoom Overlay Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Maximize2 size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {item.workSummary}
                    </p>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <div className="flex items-center gap-1 text-slate-600">
                        <User size={11} className="text-slate-400" />
                        <span className="truncate max-w-[100px]">{item.reportedByName.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Activity size={14} className="text-emerald-600" />
            <span>Click on any photograph to launch high-resolution inspector & telemetric details.</span>
          </div>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Gallery
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[130] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxIndex(null)}
        >
          {/* Lightbox Controls */}
          <button 
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <X size={20} />
          </button>

          {/* Previous / Next Buttons */}
          <button 
            onClick={handlePrevPhoto}
            className="absolute left-4 sm:left-8 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={handleNextPhoto}
            className="absolute right-4 sm:right-8 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <ChevronRight size={24} />
          </button>

          {/* Lightbox Main Container */}
          <div 
            className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Preview */}
            <div className="flex-1 bg-black flex items-center justify-center p-2 min-h-[300px]">
              <img 
                src={activePhoto.photoUrl} 
                alt={activePhoto.projectName} 
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Photo Metadata Sidebar */}
            <div className="w-full md:w-80 bg-slate-900 p-6 flex flex-col justify-between text-white border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500 text-white uppercase">
                      {activePhoto.updateType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      {activeLightboxIndex! + 1} of {filteredItems.length}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">{activePhoto.projectName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-blue-400" /> {activePhoto.projectLocation || 'Lagos, Nigeria'}
                  </p>
                </div>

                {/* Progress */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span>Reported Site Progress</span>
                    <span className="text-emerald-400 font-extrabold">{activePhoto.progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activePhoto.progressPercentage}%` }} />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Daily Progress Summary
                  </label>
                  <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    {activePhoto.workSummary}
                  </p>
                </div>

                {/* Site Conditions */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-bold">Weather</span>
                    <span className="font-semibold text-slate-200 text-[11px]">{activePhoto.weatherCondition}</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-bold">Workforce</span>
                    <span className="font-semibold text-slate-200 text-[11px]">{activePhoto.workforceCount} Workers</span>
                  </div>
                </div>

                {/* Supervisor & Timestamp */}
                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-white/10">
                  <p className="flex items-center gap-2">
                    <User size={13} className="text-blue-400 shrink-0" />
                    <span className="truncate">{activePhoto.reportedByName}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar size={13} className="text-blue-400 shrink-0" />
                    <span>{new Date(activePhoto.createdAt).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-2">
                <a
                  href={activePhoto.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} /> View Full Resolution
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
