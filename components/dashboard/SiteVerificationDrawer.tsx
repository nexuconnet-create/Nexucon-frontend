"use client";

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin, Compass, CheckCircle, AlertTriangle, Plus, Navigation } from 'lucide-react';
import { createSiteVerification } from '@/services/monitoring';
import { getProjects, Project } from '@/services/projects';

interface SiteVerificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SiteVerificationDrawer({
  isOpen,
  onClose,
  onSuccess
}: SiteVerificationDrawerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [method, setMethod] = useState('GNSS_RTK_SURVEY');
  const [deviceIdentifier, setDeviceIdentifier] = useState('Tersus Oscar GNSS RTK #042');
  const [lat, setLat] = useState('6.428100');
  const [lng, setLng] = useState('3.421900');
  const [appLat, setAppLat] = useState('6.428105');
  const [appLng, setAppLng] = useState('3.421904');
  const [notes, setNotes] = useState('');
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
      await createSiteVerification({
        project: selectedProjectId,
        method,
        device_identifier: deviceIdentifier,
        captured_coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
        approved_coordinates: { lat: parseFloat(appLat), lng: parseFloat(appLng) },
        notes
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Site verification recorded & spatial variance computed!', type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to record site verification';
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
              <Compass className="text-blue-600" size={22} /> Site Boundary & GNSS Verification
            </h2>
            <p className="text-xs text-slate-500 mt-1">Calibrate coordinates against approved layout and measure physical variance.</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Construction Site</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Survey Methodology</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="GNSS_RTK_SURVEY">Tersus Oscar GNSS RTK Rover</option>
                <option value="TERSU_ROVER">Tersus Rover Calibration</option>
                <option value="GPR_SCAN">GPR Subsurface Scan</option>
                <option value="DRONE_PHOTOGRAMMETRY">Drone Photogrammetry</option>
                <option value="TOTAL_STATION">Total Station Survey</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Device Identifier</label>
              <input
                type="text"
                value={deviceIdentifier}
                onChange={(e) => setDeviceIdentifier(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-1.5">
              <Navigation size={14} className="text-blue-600" /> Measured Field Coordinates (GNSS)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Measured Latitude</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Measured Longitude</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-500" /> Approved CAD/GIS Baseline Coordinates
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Approved Latitude</label>
                <input
                  type="text"
                  value={appLat}
                  onChange={(e) => setAppLat(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Approved Longitude</label>
                <input
                  type="text"
                  value={appLng}
                  onChange={(e) => setAppLng(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Surveyor Field Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Peg benchmark verified at South-West boundary corner..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
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
              <Compass size={16} /> {isSubmitting ? 'Calculating...' : 'Record & Verify Coordinates'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
