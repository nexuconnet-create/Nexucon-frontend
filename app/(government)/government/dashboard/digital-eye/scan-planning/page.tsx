"use client";
import React, { useState } from "react";
import { Calendar, MapPin, Search, Filter, ChevronLeft, ChevronRight, Clock, Plus, X, Check, Layers, Cpu, Radio, ShieldAlert } from "lucide-react";

export default function ScanPlanning() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'map'>('schedule');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);

  const upcomingScans = [
    { id: "PLN-2026-042", project: "Downtown Metro Station", date: "Oct 12, 2026", time: "09:00 AM", operator: "John Smith", scanner: "NAVIS-V3-001", status: "confirmed" },
    { id: "PLN-2026-043", project: "Riverside Commercial Complex", date: "Oct 12, 2026", time: "02:00 PM", operator: "Sarah Jenkins", scanner: "NAVIS-V3-002", status: "pending" },
  ];

  const sensors = [
    { id: "lidar", name: "High-Res LiDAR", icon: <Layers size={20} />, desc: "Millimeter accuracy point clouds" },
    { id: "rgb", name: "Photogrammetry (RGB)", icon: <Cpu size={20} />, desc: "Colorization and 3D Gaussian Splatting" },
    { id: "thermal", name: "Thermal Imaging", icon: <ShieldAlert size={20} />, desc: "Heat anomaly detection" },
    { id: "rtk", name: "RTK GNSS", icon: <Radio size={20} />, desc: "Real-time kinematic positioning" }
  ];

  const toggleSensor = (id: string) => {
    setSelectedSensors(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="w-full min-h-screen relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Scan Planning & Scheduling</h1>
          <p className="text-gray-500 mt-1">Coordinate guided scan deployments across project sites.</p>
        </div>
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} />
          <span className="font-medium">Guided Planning Wizard</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              List View
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Map View
            </button>
          </div>
        </div>

        {activeTab === 'schedule' ? (
          <div className="p-6 text-gray-500">
            {upcomingScans.map((scan) => (
              <div key={scan.id} className="p-4 border border-gray-100 rounded-xl mb-3 flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer">
                <div>
                  <h3 className="font-bold text-gray-900">{scan.project} <span className="text-sm font-normal text-gray-400 ml-2">{scan.id}</span></h3>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {scan.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {scan.time}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${scan.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {scan.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[600px] w-full bg-slate-50 relative flex items-center justify-center overflow-hidden">
            {/* Map Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-20 mix-blend-multiply" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }}>
            </div>
            
            {/* Mock Map Polygons */}
            <div className="absolute z-10 w-64 h-64 border-4 border-blue-500/50 bg-blue-500/10 rounded-lg transform -translate-x-32 -translate-y-16 animate-pulse flex items-center justify-center">
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Zone A (Downtown)</span>
            </div>
            <div className="absolute z-10 w-48 h-32 border-4 border-emerald-500/50 bg-emerald-500/10 rounded-lg transform translate-x-48 translate-y-32 flex items-center justify-center">
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Zone B (Riverside)</span>
            </div>
            
            <div className="absolute top-4 right-4 z-20 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-72">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> Scan Boundaries</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg cursor-pointer border border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-sm font-medium text-blue-900">Downtown Metro</span>
                  </div>
                  <span className="text-xs text-blue-500 font-bold">09:00 AM</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-gray-700">Riverside Complex</span>
                  </div>
                  <span className="text-xs text-gray-400">02:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-[#022C4F]">Guided Scan Planning Wizard</h2>
              <button onClick={() => setIsWizardOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              {wizardStep === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-lg font-semibold mb-4">Step 1: Define Sensor Fusion Requirements</h3>
                  <p className="text-sm text-gray-500 mb-6">Select the data capture modalities required for this scan session. This will configure the edge-device pipeline.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sensors.map((sensor) => (
                      <div 
                        key={sensor.id} 
                        onClick={() => toggleSensor(sensor.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedSensors.includes(sensor.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className={`p-2 rounded-lg ${selectedSensors.includes(sensor.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {sensor.icon}
                          </div>
                          {selectedSensors.includes(sensor.id) && <Check size={18} className="text-blue-500"/>}
                        </div>
                        <h4 className="font-bold text-gray-900 mt-3">{sensor.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{sensor.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {wizardStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-lg font-semibold mb-4">Step 2: Coverage & Boundary Definition</h3>
                  <div className="h-64 bg-slate-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 mb-4">
                    Interactive Map: Draw Polygon Boundary
                  </div>
                  <p className="text-sm text-gray-500">The Tersus Rover will be guided to capture the highlighted zone to generate a dense 3D Gaussian Splatting asset.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-between bg-white">
              <button 
                onClick={() => setWizardStep(1)} 
                disabled={wizardStep === 1}
                className="px-6 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => {
                  if(wizardStep === 1) setWizardStep(2);
                  else setIsWizardOpen(false);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
              >
                {wizardStep === 1 ? 'Next Step' : 'Schedule Scan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
