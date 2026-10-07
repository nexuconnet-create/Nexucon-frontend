"use client";

import React, { useState, useEffect } from 'react';
import {
  X, Save, Building2, MapPin, Wrench, Shield, FileCheck, Users,
  AlertTriangle, RefreshCw, Plus, Trash2, CheckCircle2, Compass, ExternalLink
} from 'lucide-react';
import { Project, ProjectProfessional, updateProject } from '@/services/projects';
import { District, getDistricts } from '@/services/settings';
import { NIGERIA_STATES, getAreaOptions } from '@/lib/nigeriaGeoData';
import {
  CoordinateSystem, CornerInput, convertCorners,
  ConversionResult
} from '@/lib/coordinateUtils';

interface EditGovernmentProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave: (updatedProject: Project) => void;
}

export default function EditGovernmentProjectModal({
  isOpen,
  onClose,
  project,
  onSave
}: EditGovernmentProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'technical' | 'permits' | 'professionals' | 'governance'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [zones, setZones] = useState<District[]>([]);

  // Form state initialized from project
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [professionals, setProfessionals] = useState<ProjectProfessional[]>([]);

  // Boundary coordinates state
  const [coordSystem, setCoordSystem] = useState<CoordinateSystem>('WGS84_DD');
  const [corners, setCorners] = useState<CornerInput[]>([
    { id: 1, label: 'Corner 1 (NW)', lat: '', lng: '', easting: '', northing: '' },
    { id: 2, label: 'Corner 2 (NE)', lat: '', lng: '', easting: '', northing: '' },
    { id: 3, label: 'Corner 3 (SE)', lat: '', lng: '', easting: '', northing: '' },
    { id: 4, label: 'Corner 4 (SW)', lat: '', lng: '', easting: '', northing: '' }
  ]);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // Load operational zones
  useEffect(() => {
    getDistricts({ active: 'all' })
      .then((data) => setZones(Array.isArray(data) ? data : []))
      .catch(() => console.error("Could not load districts"));
  }, []);

  // Sync form state when project changes or modal opens
  useEffect(() => {
    if (!isOpen || !project) return;
    setFormData({
      name: project.name || '',
      reference_number: project.reference_number || '',
      status: project.status || 'ACTIVE',
      project_type: project.project_type || 'Commercial',
      development_category: project.development_category || 'Category B (Medium Density)',
      project_priority: project.project_priority || 'Normal',
      description: project.description || '',

      // Developer
      developer_name: project.developer_name || '',
      developer_organization: project.developer_organization || '',
      developer_reg_number: project.developer_reg_number || '',
      developer_contact_person: project.developer_contact_person || '',
      developer_email: project.developer_email || '',
      developer_phone: project.developer_phone || '',
      developer_address: project.developer_address || '',

      // Location
      site_address: project.site_address || project.location || '',
      state: project.state || 'Lagos',
      lga: project.lga || '',
      ward_area: project.ward_area || '',
      district: project.district || null,
      latitude: project.latitude ?? '',
      longitude: project.longitude ?? '',
      coordinate_system: project.coordinate_system || 'WGS84_DD',

      // Technical
      primary_use: project.primary_use || '',
      proposed_use: project.proposed_use || '',
      number_of_floors: project.number_of_floors ?? undefined,
      building_height: project.building_height || '',
      gross_floor_area: project.gross_floor_area || '',
      site_area: project.site_area || '',
      number_of_units: project.number_of_units ?? undefined,
      structural_system: project.structural_system || '',
      construction_method: project.construction_method || '',
      estimated_project_value: project.estimated_project_value || '',
      start_date: project.start_date || '',
      estimated_completion: project.estimated_completion || '',

      // Permits
      permit_number: project.permit_number || '',
      permit_status: project.permit_status || 'Approved',
      regulatory_authority: project.regulatory_authority || 'LASBCA',
      approval_date: project.approval_date || '',
      permit_expiry_date: project.permit_expiry_date || '',
      land_title_reference: project.land_title_reference || '',
      planning_approval_reference: project.planning_approval_reference || '',
      environmental_approval_reference: project.environmental_approval_reference || '',
      plot_number: project.plot_number || '',
      block_number: project.block_number || '',
      special_requirements: project.special_requirements || '',

      // Governance
      assigned_department: project.assigned_department || '',
      assigned_officer: project.assigned_officer || '',
      assigned_inspector: project.assigned_inspector || '',
      technical_reviewer: project.technical_reviewer || '',
      compliance_officer: project.compliance_officer || '',
      inspection_frequency: project.inspection_frequency || 'Milestone Based',
      internal_notes: project.internal_notes || '',
    });

    // Populate professionals
    if (project.professionals && Array.isArray(project.professionals)) {
      setProfessionals(project.professionals.map(p => ({ ...p })));
    } else {
      setProfessionals([]);
    }

    // Populate corner coordinates if existing
    const existingCorners = project.corner_coordinates;
    if (existingCorners && typeof existingCorners === 'object') {
      if (existingCorners.corners && Array.isArray(existingCorners.corners)) {
        setConversionResult(existingCorners as ConversionResult);
        setCoordSystem((existingCorners.system as CoordinateSystem) || 'WGS84_DD');
        setCorners(existingCorners.corners.map((c: any, idx: number) => ({
          id: idx + 1,
          label: c.label || `Corner ${idx + 1}`,
          lat: c.lat ?? '',
          lng: c.lng ?? '',
          easting: c.easting ?? '',
          northing: c.northing ?? ''
        })));
      }
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof Project, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCornerChange = (index: number, field: keyof CornerInput, value: string) => {
    const updated = [...corners];
    updated[index] = { ...updated[index], [field]: value };
    setCorners(updated);

    // Auto recalculate if all corners have values
    try {
      const res = convertCorners(coordSystem, updated);
      setConversionResult(res);
      if (res && res.center) {
        setFormData((prev) => ({
          ...prev,
          latitude: res.center.lat,
          longitude: res.center.lng,
          site_area: res.footprintAreaSqm > 0 ? res.footprintAreaSqm.toString() : prev.site_area
        }));
      }
    } catch {
      // Keep going while typing
    }
  };

  const handleSystemChange = (sys: CoordinateSystem) => {
    setCoordSystem(sys);
    try {
      const res = convertCorners(sys, corners);
      setConversionResult(res);
    } catch {
      // Ignored
    }
  };

  const handleAddProfessional = () => {
    setProfessionals([
      ...professionals,
      {
        name: '',
        role: 'Civil/Structural Engineer',
        organization: '',
        license_number: '',
        email: '',
        phone: ''
      }
    ]);
  };

  const handleUpdateProfessional = (index: number, field: keyof ProjectProfessional, value: string) => {
    const updated = [...professionals];
    updated[index] = { ...updated[index], [field]: value };
    setProfessionals(updated);
  };

  const handleRemoveProfessional = (index: number) => {
    setProfessionals(professionals.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (!formData.name?.trim()) {
        throw new Error("Project Name is required.");
      }

      const payload: any = {
        ...formData,
        coordinate_system: coordSystem,
        professionals: professionals.filter(p => p.name.trim() !== '')
      };

      if (conversionResult) {
        payload.corner_coordinates = conversionResult;
      }

      // Convert numeric fields appropriately
      if (payload.number_of_floors !== undefined && payload.number_of_floors !== '') {
        payload.number_of_floors = Number(payload.number_of_floors);
      }
      if (payload.number_of_units !== undefined && payload.number_of_units !== '') {
        payload.number_of_units = Number(payload.number_of_units);
      }
      if (payload.latitude !== undefined && payload.latitude !== '') {
        payload.latitude = Number(payload.latitude);
      }
      if (payload.longitude !== undefined && payload.longitude !== '') {
        payload.longitude = Number(payload.longitude);
      }

      const updated = await updateProject(project.id, payload);
      onSave(updated);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Project "${updated.name}" details updated successfully.`, type: 'success' }
      }));
      onClose();
    } catch (err: any) {
      console.error("Failed to update project", err);
      setErrorMsg(err?.response?.data?.detail || err?.response?.data?.message || err.message || "Failed to save project changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Identity & Developer', icon: Building2 },
    { id: 'location', label: 'Location & Boundaries', icon: MapPin },
    { id: 'technical', label: 'Technical Specs', icon: Wrench },
    { id: 'permits', label: 'Permits & Approvals', icon: FileCheck },
    { id: 'professionals', label: 'Appointed Professionals', icon: Users },
    { id: 'governance', label: 'Governance & Assignment', icon: Shield }
  ];

  const areaOptions = getAreaOptions(formData.state || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                Government Officer Editor
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Ref: {project.reference_number}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#022C4F] mt-1">
              Edit Project Details & Verification Records
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto whitespace-nowrap scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon size={15} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* TAB 1: BASIC & DEVELOPER */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#022C4F] flex items-center gap-2">
                  <Building2 size={15} /> Project Identification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Project Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Regulatory Status</label>
                    <select
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE (Under Construction)</option>
                      <option value="PLANNING">PLANNING (Proposed)</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="SUSPENDED">SUSPENDED (Stop-Work Order)</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="ABANDONED">ABANDONED</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Project Type</label>
                    <select
                      value={formData.project_type || 'Commercial'}
                      onChange={(e) => handleInputChange('project_type', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none cursor-pointer"
                    >
                      <option value="Commercial">Commercial</option>
                      <option value="Residential">Residential</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Mixed-Use">Mixed-Use</option>
                      <option value="Institutional">Institutional</option>
                      <option value="Renovation">Renovation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Development Category</label>
                    <select
                      value={formData.development_category || 'Category B (Medium Density)'}
                      onChange={(e) => handleInputChange('development_category', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none cursor-pointer"
                    >
                      <option value="Category A (High-Rise / High Impact)">Category A (High-Rise / High Impact)</option>
                      <option value="Category B (Medium Density)">Category B (Medium Density)</option>
                      <option value="Category C (Low Density Residential)">Category C (Low Density Residential)</option>
                      <option value="Category D (Public Infrastructure)">Category D (Public Infrastructure)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Priority Classification</label>
                    <select
                      value={formData.project_priority || 'Normal'}
                      onChange={(e) => handleInputChange('project_priority', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Project Scope Description</label>
                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#022C4F] flex items-center gap-2">
                  <Users size={15} /> Developer & Ownership Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Developer / Owner Name</label>
                    <input
                      type="text"
                      value={formData.developer_name || ''}
                      onChange={(e) => handleInputChange('developer_name', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Company / Organization</label>
                    <input
                      type="text"
                      value={formData.developer_organization || ''}
                      onChange={(e) => handleInputChange('developer_organization', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">CAC / Reg Number</label>
                    <input
                      type="text"
                      value={formData.developer_reg_number || ''}
                      onChange={(e) => handleInputChange('developer_reg_number', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Contact Person</label>
                    <input
                      type="text"
                      value={formData.developer_contact_person || ''}
                      onChange={(e) => handleInputChange('developer_contact_person', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Developer Email</label>
                    <input
                      type="email"
                      value={formData.developer_email || ''}
                      onChange={(e) => handleInputChange('developer_email', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Developer Phone</label>
                    <input
                      type="tel"
                      value={formData.developer_phone || ''}
                      onChange={(e) => handleInputChange('developer_phone', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Developer Registered Address</label>
                    <input
                      type="text"
                      value={formData.developer_address || ''}
                      onChange={(e) => handleInputChange('developer_address', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCATION & BOUNDARIES */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#022C4F] flex items-center gap-2">
                  <MapPin size={15} /> Physical Location & Jurisdiction
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Site Address *</label>
                    <input
                      type="text"
                      value={formData.site_address || ''}
                      onChange={(e) => handleInputChange('site_address', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">State *</label>
                    <select
                      value={formData.state || ''}
                      onChange={(e) => {
                        handleInputChange('state', e.target.value);
                        handleInputChange('lga', '');
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none cursor-pointer"
                    >
                      <option value="">Select State...</option>
                      {NIGERIA_STATES.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">LGA / LCDA *</label>
                    <select
                      value={formData.lga || ''}
                      onChange={(e) => handleInputChange('lga', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none cursor-pointer"
                    >
                      <option value="">Select LGA / LCDA...</option>
                      {areaOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Operational Zone (District)</label>
                    <select
                      value={formData.district || ''}
                      onChange={(e) => handleInputChange('district', e.target.value === '' ? null : e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none cursor-pointer"
                    >
                      <option value="">No Zone Assigned</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>{z.name} ({z.code || 'Zone'})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Center Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude ?? ''}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Center Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude ?? ''}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Coordinate System</label>
                    <select
                      value={coordSystem}
                      onChange={(e) => handleSystemChange(e.target.value as CoordinateSystem)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none cursor-pointer"
                    >
                      <option value="WGS84_DD">WGS84 (Decimal Degrees)</option>
                      <option value="DMS">WGS84 (Degrees Minutes Seconds)</option>
                      <option value="UTM_31N_WGS84">UTM Zone 31N (WGS84)</option>
                      <option value="UTM_31N_MINNA">Minna / UTM Zone 31N (Nigeria West)</option>
                      <option value="UTM_32N_WGS84">UTM Zone 32N (WGS84)</option>
                      <option value="UTM_32N_MINNA">Minna / UTM Zone 32N (Nigeria East)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4-Corner Boundary Coordinates Editor */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#022C4F] flex items-center gap-2">
                    <Compass size={15} /> 4-Corner Boundary Mapping & Conversion
                  </h4>
                  {conversionResult && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Calculated: {conversionResult.footprintAreaSqm.toLocaleString()} sqm footprint
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {corners.map((c, idx) => (
                    <div key={c.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                      <span className="text-xs font-bold text-blue-700 block">{c.label}</span>
                      
                      {coordSystem.startsWith('UTM') ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Easting (m)</label>
                            <input
                              type="number"
                              step="any"
                              value={c.easting ?? ''}
                              onChange={(e) => handleCornerChange(idx, 'easting', e.target.value)}
                              placeholder="e.g. 542560"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Northing (m)</label>
                            <input
                              type="number"
                              step="any"
                              value={c.northing ?? ''}
                              onChange={(e) => handleCornerChange(idx, 'northing', e.target.value)}
                              placeholder="e.g. 710240"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Latitude (°N)</label>
                            <input
                              type="number"
                              step="any"
                              value={c.lat ?? ''}
                              onChange={(e) => handleCornerChange(idx, 'lat', e.target.value)}
                              placeholder="e.g. 6.428"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Longitude (°E)</label>
                            <input
                              type="number"
                              step="any"
                              value={c.lng ?? ''}
                              onChange={(e) => handleCornerChange(idx, 'lng', e.target.value)}
                              placeholder="e.g. 3.389"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TECHNICAL PARAMETERS */}
          {activeTab === 'technical' && (
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#022C4F] flex items-center gap-2">
                <Wrench size={15} /> Technical Specifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Primary Use</label>
                  <input
                    type="text"
                    value={formData.primary_use || ''}
                    onChange={(e) => handleInputChange('primary_use', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Number of Floors</label>
                  <input
                    type="number"
                    value={formData.number_of_floors ?? ''}
                    onChange={(e) => handleInputChange('number_of_floors', e.target.value === '' ? undefined : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Building Height (m)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.building_height || ''}
                    onChange={(e) => handleInputChange('building_height', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Gross Floor Area (sqm)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.gross_floor_area || ''}
                    onChange={(e) => handleInputChange('gross_floor_area', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Site Area (sqm)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.site_area || ''}
                    onChange={(e) => handleInputChange('site_area', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Structural System</label>
                  <input
                    type="text"
                    value={formData.structural_system || ''}
                    onChange={(e) => handleInputChange('structural_system', e.target.value)}
                    placeholder="e.g. Reinforced Concrete, Steel"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Estimated Value (₦)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.estimated_project_value || ''}
                    onChange={(e) => handleInputChange('estimated_project_value', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Estimated Completion</label>
                  <input
                    type="date"
                    value={formData.estimated_completion || ''}
                    onChange={(e) => handleInputChange('estimated_completion', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PERMITS & APPROVALS */}
          {activeTab === 'permits' && (
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#022C4F] flex items-center gap-2">
                <FileCheck size={15} /> Statutory Permits & Legal References
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Permit Number</label>
                  <input
                    type="text"
                    value={formData.permit_number || ''}
                    onChange={(e) => handleInputChange('permit_number', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Permit Status</label>
                  <select
                    value={formData.permit_status || 'Approved'}
                    onChange={(e) => handleInputChange('permit_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none cursor-pointer"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Conditional Approval">Conditional Approval</option>
                    <option value="Expired">Expired</option>
                    <option value="Revoked">Revoked</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Regulatory Authority</label>
                  <input
                    type="text"
                    value={formData.regulatory_authority || ''}
                    onChange={(e) => handleInputChange('regulatory_authority', e.target.value)}
                    placeholder="e.g. LASBCA, LASEPA"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Land Title Document Ref</label>
                  <input
                    type="text"
                    value={formData.land_title_reference || ''}
                    onChange={(e) => handleInputChange('land_title_reference', e.target.value)}
                    placeholder="e.g. C of O No. 123/2022"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Planning Approval Ref</label>
                  <input
                    type="text"
                    value={formData.planning_approval_reference || ''}
                    onChange={(e) => handleInputChange('planning_approval_reference', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">EIA Approval Ref</label>
                  <input
                    type="text"
                    value={formData.environmental_approval_reference || ''}
                    onChange={(e) => handleInputChange('environmental_approval_reference', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Plot / Block Number</label>
                  <input
                    type="text"
                    value={formData.plot_number ? `${formData.plot_number}${formData.block_number ? ` / ${formData.block_number}` : ''}` : ''}
                    onChange={(e) => handleInputChange('plot_number', e.target.value)}
                    placeholder="e.g. Plot 12, Block 4"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Permit Approval Date</label>
                  <input
                    type="date"
                    value={formData.approval_date || ''}
                    onChange={(e) => handleInputChange('approval_date', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Permit Expiry Date</label>
                  <input
                    type="date"
                    value={formData.permit_expiry_date || ''}
                    onChange={(e) => handleInputChange('permit_expiry_date', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Special Regulatory Conditions</label>
                  <textarea
                    rows={2}
                    value={formData.special_requirements || ''}
                    onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                    placeholder="e.g. Traffic management clearance, barge movement log, dewatering monitoring"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: APPOINTED PROFESSIONALS */}
          {activeTab === 'professionals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#022C4F]">
                    Appointed Registered Professionals
                  </h4>
                  <p className="text-xs text-slate-500">
                    Engineers, architects, project managers, and licensed builders appointed to this site.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddProfessional}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add Professional
                </button>
              </div>

              {professionals.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Users size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Appointed Professionals Recorded</p>
                  <p className="text-xs text-slate-400 mt-1">Click above to add registered engineers or architects.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {professionals.map((prof, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 relative group space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#022C4F]">Professional #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProfessional(idx)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove professional"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Full Name *</label>
                          <input
                            type="text"
                            value={prof.name}
                            onChange={(e) => handleUpdateProfessional(idx, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            placeholder="e.g. Engr. Onike AbdulWahab"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Professional Role</label>
                          <select
                            value={prof.role}
                            onChange={(e) => handleUpdateProfessional(idx, 'role', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer"
                          >
                            <option value="Civil/Structural Engineer">Civil/Structural Engineer</option>
                            <option value="Architect">Architect</option>
                            <option value="Project Manager">Project Manager</option>
                            <option value="Electrical Engineer">Electrical Engineer</option>
                            <option value="Mechanical Engineer">Mechanical Engineer</option>
                            <option value="Builder / Contractor">Builder / Contractor</option>
                            <option value="Quantity Surveyor">Quantity Surveyor</option>
                            <option value="Geotechnical Engineer">Geotechnical Engineer</option>
                            <option value="Health & Safety Specialist">Health & Safety Specialist</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-0.5">License / Reg Number</label>
                          <input
                            type="text"
                            value={prof.license_number || ''}
                            onChange={(e) => handleUpdateProfessional(idx, 'license_number', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            placeholder="e.g. COREN R39405"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Company / Firm</label>
                          <input
                            type="text"
                            value={prof.organization || ''}
                            onChange={(e) => handleUpdateProfessional(idx, 'organization', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            placeholder="e.g. Kibtech Ltd"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Email</label>
                          <input
                            type="email"
                            value={prof.email || ''}
                            onChange={(e) => handleUpdateProfessional(idx, 'email', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Phone</label>
                          <input
                            type="tel"
                            value={prof.phone || ''}
                            onChange={(e) => handleUpdateProfessional(idx, 'phone', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: GOVERNANCE & ASSIGNMENT */}
          {activeTab === 'governance' && (
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#022C4F] flex items-center gap-2">
                <Shield size={15} /> Regulatory Governance & Agency Assignment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Assigned Site Inspector</label>
                  <input
                    type="text"
                    value={formData.assigned_inspector || ''}
                    onChange={(e) => handleInputChange('assigned_inspector', e.target.value)}
                    placeholder="e.g. Engr Faraday"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Compliance Officer</label>
                  <input
                    type="text"
                    value={formData.compliance_officer || ''}
                    onChange={(e) => handleInputChange('compliance_officer', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Inspection Frequency</label>
                  <select
                    value={formData.inspection_frequency || 'Milestone Based'}
                    onChange={(e) => handleInputChange('inspection_frequency', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none cursor-pointer"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Milestone Based">Milestone Based</option>
                    <option value="Stage-gate Verification">Stage-gate Verification</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Assigned Department</label>
                  <input
                    type="text"
                    value={formData.assigned_department || ''}
                    onChange={(e) => handleInputChange('assigned_department', e.target.value)}
                    placeholder="e.g. Material Testing Lab"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Assigned Officer</label>
                  <input
                    type="text"
                    value={formData.assigned_officer || ''}
                    onChange={(e) => handleInputChange('assigned_officer', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Technical Reviewer</label>
                  <input
                    type="text"
                    value={formData.technical_reviewer || ''}
                    onChange={(e) => handleInputChange('technical_reviewer', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Internal Regulatory Notes</label>
                  <textarea
                    rows={3}
                    value={formData.internal_notes || ''}
                    onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                    placeholder="Internal confidential oversight notes..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Changes take effect immediately across all agency dashboards.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={15} /> Save Verified Project Details
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
