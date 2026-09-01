"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Calendar,
  MapPin,
  Search,
  Clock,
  Plus,
  Loader2,
  X,
  Check,
  Layers,
  Cpu,
  Radio,
  ShieldAlert,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair
} from "lucide-react";
import api from "@/lib/api";
import { getProjects } from "@/services/projects";

const ScanPlanMap = dynamic(
  () => import('@/components/dashboard/digital-eye/ScanPlanMap'),
  { ssr: false, loading: () => <div className="h-[600px] w-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div> }
);

const LocationPickerMap = dynamic(
  () => import('@/components/dashboard/digital-eye/LocationPickerMap'),
  { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200"><Loader2 className="animate-spin text-blue-500 w-6 h-6" /></div> }
);

const PLANS_PER_PAGE = 8;

export default function ScanPlanning() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'map'>('schedule');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [targetArea, setTargetArea] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [targetLatitude, setTargetLatitude] = useState<number | null>(null);
  const [targetLongitude, setTargetLongitude] = useState<number | null>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  const sensors = [
    { id: "lidar", name: "High-Res LiDAR", icon: <Layers size={20} />, desc: "Millimeter accuracy point clouds" },
    { id: "rgb", name: "Photogrammetry (RGB)", icon: <Cpu size={20} />, desc: "Colorization and 3D Gaussian Splatting" },
    { id: "thermal", name: "Thermal Imaging", icon: <ShieldAlert size={20} />, desc: "Heat anomaly detection" },
    { id: "rtk", name: "RTK GNSS", icon: <Radio size={20} />, desc: "Real-time kinematic positioning" }
  ];

  const toggleSensor = (id: string) => {
    setSelectedSensors(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  // Compact labels for the Equipment column; full names are long and would
  // blow out the table width.
  const SENSOR_SHORT: Record<string, string> = {
    lidar: "LiDAR",
    rgb: "RGB",
    thermal: "Thermal",
    rtk: "RTK GNSS"
  };
  const sensorShortName = (id: string) =>
    SENSOR_SHORT[id] || sensors.find(s => s.id === id)?.name || id;

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scans/plans/');
      // Mapping backend ScanPlan to frontend format
      const formattedPlans = res.data.map((plan: any) => {
        const dateObj = new Date(plan.created_at);
        return {
          id: plan.id,
          displayId: plan.title || `PLN-${plan.id.substring(0, 8).toUpperCase()}`,
          project: plan.project_name || plan.target_area || "—",
          date: dateObj.toLocaleDateString(),
          time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          operator: plan.operator || "—",
          scanner: plan.scanner_device_id || plan.scanner || "—",
          // Equipment column shows the capture modalities chosen in the wizard
          sensors: Array.isArray(plan.sensors_used) ? plan.sensors_used : [],
          status: plan.status || "pending",
          latitude: plan.latitude ?? null,
          longitude: plan.longitude ?? null
        };
      });
      setPlans(formattedPlans);
    } catch (error) {
      console.error("Failed to fetch scan plans", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchProjects();
  }, []);

  const filteredPlans = useMemo(() => {
    let list = plans;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.displayId.toLowerCase().includes(q) ||
        p.project.toLowerCase().includes(q) ||
        p.operator.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter(p => p.status === statusFilter);
    }
    return list;
  }, [plans, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / PLANS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedPlans = filteredPlans.slice((safePage - 1) * PLANS_PER_PAGE, safePage * PLANS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const handleUpdateStatus = async (planId: string, newStatus: string) => {
    try {
      await api.patch(`/scans/plans/${planId}/`, { status: newStatus });
      fetchPlans();
      setSelectedPlan(null);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update plan status.");
    }
  };

  const handleScheduleScan = async () => {
    try {
      if (!selectedProjectId) {
        alert("Please select a project.");
        return;
      }
      if (!operatorName.trim()) {
        alert("Please enter the assigned operator.");
        return;
      }

      // Create the Scan Plan
      await api.post('/scans/plans/', {
        project: selectedProjectId,
        title: `Scan Plan - ${new Date().toLocaleDateString()}`,
        target_area: targetArea.trim(),
        operator: operatorName.trim(),
        sensors_used: selectedSensors,
        status: 'pending',
        ...(targetLatitude != null && targetLongitude != null
          ? { latitude: targetLatitude, longitude: targetLongitude }
          : {})
      });

      setIsWizardOpen(false);
      setWizardStep(1);
      setSelectedSensors([]);
      setTargetArea('');
      setOperatorName('');
      setTargetLatitude(null);
      setTargetLongitude(null);
      fetchPlans();
    } catch (error) {
      console.error("Failed to schedule scan plan", error);
      alert("Failed to schedule scan plan.");
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Scan Planning & Scheduling</h1>
          <p className="text-gray-500 mt-1">Coordinate Tersus S1 deployments across project sites.</p>
        </div>
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} />
          <span className="font-medium">Schedule New Scan</span>
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
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plans..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors ${statusFilter !== 'all' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                title="Filter by status"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">{statusFilter === 'all' ? 'All Statuses' : statusFilter.replace('_', ' ')}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                    {['all', 'pending', 'in_progress', 'completed'].map(s => (
                      <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 capitalize ${statusFilter === s ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                      >
                        {s === 'all' ? 'All Statuses' : s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'schedule' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Plan ID</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Project / Location</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Schedule</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Operator</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Equipment</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : pagedPlans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No scan plans found{statusFilter !== 'all' || searchQuery ? ' matching your filters' : ''}.
                    </td>
                  </tr>
                ) : (
                  pagedPlans.map((scan) => (
                    <tr key={scan.id} onClick={() => setSelectedPlan(scan)} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{scan.displayId}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-sm text-gray-700 font-medium">{scan.project}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {scan.date}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5"><Clock size={14} className="text-gray-400"/> {scan.time}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                            {scan.operator.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span className="text-sm text-gray-700">{scan.operator}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {scan.sensors.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {scan.sensors.map((id: string) => (
                              <span
                                key={id}
                                title={sensors.find(s => s.id === id)?.name || id}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold"
                              >
                                {sensorShortName(id)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">{scan.scanner}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          scan.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          scan.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {scan.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {filteredPlans.length === 0 ? 0 : (safePage - 1) * PLANS_PER_PAGE + 1}–{Math.min(safePage * PLANS_PER_PAGE, filteredPlans.length)} of {filteredPlans.length} planned scans
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-gray-600 px-2 font-medium">Page {safePage} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ScanPlanMap plans={filteredPlans} onMarkerClick={setSelectedPlan} />
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
                  <h3 className="text-lg font-semibold mb-4">Step 1: Project & Sensor Requirements</h3>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                    <select 
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">-- Choose a project --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">Select the data capture modalities required for this scan session.</p>
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
                  <h3 className="text-lg font-semibold mb-4">Step 2: Coverage & Assignment</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Area (e.g. Floor 3, Zone A)</label>
                    <input 
                      type="text" 
                      value={targetArea}
                      onChange={(e) => setTargetArea(e.target.value)}
                      placeholder="Enter target zone..." 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Operator</label>
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      placeholder="Operator Name (required)"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                      <Crosshair size={14} className="text-gray-400" />
                      Survey Target Location (optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Click the map to drop the target position for this survey — it pins the plan on the Map View.
                      {targetLatitude != null && (
                        <span className="ml-1 text-blue-600 font-medium">
                          Selected: {targetLatitude.toFixed(5)}, {targetLongitude?.toFixed(5)}
                        </span>
                      )}
                    </p>
                    <LocationPickerMap
                      latitude={targetLatitude}
                      longitude={targetLongitude}
                      onChange={(lat, lng) => { setTargetLatitude(lat); setTargetLongitude(lng); }}
                      initialCenter={
                        (() => {
                          const proj = projects.find(p => p.id === selectedProjectId);
                          return proj && proj.latitude != null && proj.longitude != null
                            ? [proj.latitude, proj.longitude] as [number, number]
                            : undefined;
                        })()
                      }
                    />
                    {targetLatitude != null && (
                      <button
                        type="button"
                        onClick={() => { setTargetLatitude(null); setTargetLongitude(null); }}
                        className="mt-2 text-xs text-gray-500 hover:text-red-600 transition-colors"
                      >
                        Clear selected location
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-6">The Tersus Rover will be guided to capture the target zone to generate a dense 3D Gaussian Splatting asset.</p>
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
                  if (wizardStep === 1 && selectedSensors.length === 0) {
                    alert("Please select at least one data capture modality.");
                    return;
                  }
                  if(wizardStep === 1) setWizardStep(2);
                  else handleScheduleScan();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
              >
                {wizardStep === 1 ? 'Next Step' : 'Schedule Scan'}
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-[#022C4F]">Scan Plan Details</h2>
              <button onClick={() => setSelectedPlan(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Plan ID</label>
                <p className="text-sm font-medium text-gray-900">{selectedPlan.displayId}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Project / Target</label>
                <p className="text-sm text-gray-900">{selectedPlan.project}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Date</label>
                  <p className="text-sm text-gray-900">{selectedPlan.date} {selectedPlan.time}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Operator</label>
                  <p className="text-sm text-gray-900">{selectedPlan.operator}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Equipment</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedPlan.sensors?.length > 0 ? (
                    selectedPlan.sensors.map((id: string) => (
                      <span
                        key={id}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold"
                      >
                        {sensorShortName(id)}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-900">{selectedPlan.scanner}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Update Status</label>
                <select 
                  value={selectedPlan.status}
                  onChange={(e) => handleUpdateStatus(selectedPlan.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setSelectedPlan(null)} className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
