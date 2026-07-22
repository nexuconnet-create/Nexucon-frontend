"use client";

import React, { useState } from "react";
import { X, MapPin, Compass, Navigation, Plus, Target, CheckCircle2, Save } from "lucide-react";

interface CalibrateModelSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalibrateModelSideDrawer({
  isOpen,
  onClose,
}: CalibrateModelSideDrawerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [controlPoints, setControlPoints] = useState([
    { id: 1, name: "CP-01", lat: "51.5074", lng: "-0.1278", elev: "15.2m" },
    { id: 2, name: "CP-02", lat: "51.5075", lng: "-0.1275", elev: "15.4m" },
  ]);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 1500);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-[100] backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#022C4F]/10 flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#022C4F]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#022C4F] leading-tight">Calibrate Model</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Align BIM coordinates with site</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          {/* Global Coordinates */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#022C4F]" />
              <h3 className="text-sm font-extrabold text-[#022C4F]">Global Coordinates</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Latitude</label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="51.5074° N"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] font-medium text-[#0F181F] focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F]" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Longitude</label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="0.1278° W"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] font-medium text-[#0F181F] focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F]" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Orientation & Elevation */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-[#022C4F]" />
              <h3 className="text-sm font-extrabold text-[#022C4F]">Orientation & Elevation</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">True North Rotation</label>
                <div className="relative">
                  <input 
                    type="number" 
                    defaultValue={14.5}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-8 text-[13px] font-medium text-[#0F181F] focus:outline-none focus:border-[#022C4F]" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] font-medium">deg</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Base Elevation</label>
                <div className="relative">
                  <input 
                    type="number" 
                    defaultValue={15.2}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-8 text-[13px] font-medium text-[#0F181F] focus:outline-none focus:border-[#022C4F]" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] font-medium">m</span>
                </div>
              </div>
            </div>

            {/* Visual Compass Mock */}
            <div className="mt-2 bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex items-center justify-center">
              <div className="relative w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center">
                <div className="absolute top-1 text-[10px] font-bold text-gray-400">N</div>
                <div className="absolute bottom-1 text-[10px] font-bold text-gray-400">S</div>
                <div className="absolute left-1 text-[10px] font-bold text-gray-400">W</div>
                <div className="absolute right-1 text-[10px] font-bold text-gray-400">E</div>
                <div className="w-1 h-16 bg-[#022C4F] rounded-full transform rotate-[14.5deg]"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full absolute"></div>
              </div>
            </div>
          </section>

          {/* Control Points */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[#022C4F]" />
                <h3 className="text-sm font-extrabold text-[#022C4F]">Control Points</h3>
              </div>
              <button className="text-[11px] font-bold text-[#022C4F] hover:text-[#033A6B] flex items-center gap-1 bg-[#022C4F]/5 px-3 py-1.5 rounded-full transition-colors">
                <Plus size={12} /> Add Point
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {controlPoints.map(cp => (
                <div key={cp.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#022C4F]/30 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-extrabold text-[#0F181F]">{cp.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium mt-0.5">{cp.lat}, {cp.lng} • Elev: {cp.elev}</span>
                  </div>
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2 leading-relaxed">
              Align model with survey markers imported from total station data for mm-level precision.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#022C4F] hover:bg-[#033A6B] disabled:opacity-70 text-white py-3.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-[13px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Calibration...
              </span>
            ) : (
              <>
                <Save size={16} /> Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
