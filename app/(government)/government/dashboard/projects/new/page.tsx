"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, uploadProjectDocument, Project, ProjectProfessional } from '@/services/projects';
import { 
  ArrowLeft, Save, ChevronRight, ChevronLeft, Check, Upload, Plus, Trash2, 
  Building2, Users, MapPin, FileCheck, ClipboardList, HardHat, FileText, Settings, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { id: 1, title: 'Project Info', icon: Building2 },
  { id: 2, title: 'Developer', icon: Users },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'Professionals', icon: HardHat },
  { id: 5, title: 'Regulatory', icon: FileCheck },
  { id: 6, title: 'Development', icon: ClipboardList },
  { id: 7, title: 'Documents', icon: FileText },
  { id: 8, title: 'Gov Assignment', icon: ShieldCheck },
  { id: 9, title: 'Review & Register', icon: Settings }
];

export default function RegisterProjectWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, File>>({});

  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    project_type: '',
    description: '',
    status: 'DRAFT',
    development_category: '',
    estimated_project_value: '',
    number_of_floors: undefined,
    start_date: null,
    estimated_completion: null,
    
    developer_name: '',
    developer_organization: '',
    developer_reg_number: '',
    developer_email: '',
    developer_phone: '',
    developer_address: '',
    developer_contact_person: '',

    site_address: '',
    state: '',
    lga: '',
    ward_area: '',
    plot_number: '',
    block_number: '',
    land_title_reference: '',

    permit_number: '',
    permit_status: '',
    planning_approval_reference: '',
    building_control_reference: '',
    environmental_approval_reference: '',
    existing_applications: '',
    applicable_regulations: '',
    regulatory_authority: '',
    approval_date: undefined,
    permit_expiry_date: undefined,

    primary_use: '',
    proposed_use: '',
    site_area: '',
    gross_floor_area: '',
    building_height: '',
    number_of_units: undefined,
    construction_method: '',
    structural_system: '',
    special_requirements: '',

    assigned_department: '',
    assigned_officer: '',
    assigned_inspector: '',
    technical_reviewer: '',
    compliance_officer: '',
    project_priority: 'Normal',
    monitoring_category: '',
    inspection_frequency: '',
    internal_notes: '',

    enable_site_monitoring: true,
    enable_gnss: true,
    enable_bim: false,
    inspection_required: true,
    compliance_monitoring_required: true,
    progress_reporting_required: true,
    site_verification_required: true,
  });

  const [professionals, setProfessionals] = useState<ProjectProfessional[]>([]);
  
  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    }
  };

  const handleDocumentChange = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({ ...prev, [docType]: e.target.files![0] }));
      setValidationError(null);
    }
  };

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1:
        if (!formData.name) return 'Project Name is required';
        break;
      case 2:
        if (!formData.developer_organization) return 'Organization / Company Name is required';
        if (!formData.developer_name) return 'Developer / Owner Name is required';
        break;
      case 3:
        if (!formData.state) return 'State is required';
        if (!formData.lga) return 'LGA / District is required';
        break;
      case 4:
        for (const prof of professionals) {
          if (!prof.name || !prof.role) return 'All professionals must have a Role and Full Name';
        }
        break;
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(currentStep);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    if (currentStep < 9) setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddProfessional = () => {
    setProfessionals([...professionals, { name: '', role: 'Architect', organization: '', email: '', phone: '', license_number: '' }]);
  };

  const handleProfessionalChange = (index: number, field: keyof ProjectProfessional, value: string) => {
    const updated = [...professionals];
    updated[index] = { ...updated[index], [field]: value };
    setProfessionals(updated);
  };

  const handleRemoveProfessional = (index: number) => {
    setProfessionals(professionals.filter((_, i) => i !== index));
  };

  const handleRegister = async (statusOverride: string = 'PLANNING') => {
    setError(null);
    setValidationError(null);
    
    const err = validateStep(currentStep);
    if (err) {
      setValidationError(err);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        status: statusOverride,
        professionals: professionals.filter(p => p.name.trim() !== ''),
      };
      
      const createdProject = await createProject(payload);
      
      for (const [docType, file] of Object.entries(documents)) {
        await uploadProjectDocument(createdProject.id, file, docType);
      }
      
      router.push('/government/dashboard/command-center');
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || 'Failed to create project. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Render Helpers
  const renderInput = (label: string, name: keyof Project, type: string = "text", placeholder: string = "", required: boolean = false) => (
    <div>
      <label className="block text-sm font-bold text-[#022C4F] mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        name={name as string}
        required={required}
        value={formData[name]?.toString() || ''}
        onChange={handleChange}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent text-sm transition-all"
        placeholder={placeholder}
      />
    </div>
  );

  const renderSelect = (label: string, name: keyof Project, options: {value: string, label: string}[]) => (
    <div>
      <label className="block text-sm font-bold text-[#022C4F] mb-1.5">{label}</label>
      <select
        name={name as string}
        value={formData[name]?.toString() || ''}
        onChange={handleChange}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent text-sm transition-all"
      >
        <option value="">Select...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  const renderCheckbox = (label: string, name: keyof Project) => (
    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
      <input
        type="checkbox"
        name={name as string}
        checked={!!formData[name]}
        onChange={handleChange}
        className="w-5 h-5 rounded border-slate-300 text-[#022C4F] focus:ring-[#022C4F]"
      />
      <span className="text-sm font-bold text-[#022C4F]">{label}</span>
    </label>
  );

  // Step Renders
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Project Name', 'name', 'text', 'e.g. National Theater Renovation', true)}
        {renderSelect('Project Type', 'project_type', [
          { value: 'Residential', label: 'Residential' },
          { value: 'Commercial', label: 'Commercial' },
          { value: 'Industrial', label: 'Industrial' },
          { value: 'Infrastructure', label: 'Infrastructure' },
          { value: 'Mixed-Use', label: 'Mixed-Use' },
          { value: 'Institutional', label: 'Institutional' },
        ])}
        {renderSelect('Development Category', 'development_category', [
          { value: 'Category A (High Rise)', label: 'Category A (High Rise)' },
          { value: 'Category B (Medium Density)', label: 'Category B (Medium Density)' },
          { value: 'Category C (Low Density)', label: 'Category C (Low Density)' },
        ])}
        {renderInput('Estimated Value (₦)', 'estimated_project_value', 'number', 'e.g. 5000000000')}
        {renderInput('Number of Floors/Structures', 'number_of_floors', 'number', 'e.g. 15')}
      </div>
      <div>
        <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Project Description</label>
        <textarea
          name="description"
          rows={4}
          value={formData.description || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent text-sm resize-none"
          placeholder="Brief description of the proposed development and scope of work..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Estimated Start Date', 'start_date', 'date')}
        {renderInput('Expected Completion Date', 'estimated_completion', 'date')}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Organization / Company Name', 'developer_organization', 'text', 'e.g. Julius Berger PLC')}
        {renderInput('Developer / Owner Name', 'developer_name', 'text', 'e.g. Lagos State Government')}
        {renderInput('Registration Number', 'developer_reg_number', 'text', 'RC-123456')}
        {renderInput('Primary Contact Person', 'developer_contact_person', 'text', 'e.g. John Doe')}
        {renderInput('Email Address', 'developer_email', 'email', 'contact@developer.com')}
        {renderInput('Phone Number', 'developer_phone', 'tel', '+234 800 000 0000')}
      </div>
      <div>
        <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Registered Address</label>
        <textarea
          name="developer_address"
          rows={3}
          value={formData.developer_address || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent text-sm resize-none"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Site Address</label>
        <textarea
          name="site_address"
          rows={2}
          value={formData.site_address || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent text-sm resize-none"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderInput('State', 'state', 'text', 'e.g. Lagos')}
        {renderInput('LGA / District', 'lga', 'text', 'e.g. Eti-Osa')}
        {renderInput('Ward / Area', 'ward_area', 'text', 'e.g. Victoria Island')}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderInput('Plot Number', 'plot_number')}
        {renderInput('Block / Parcel', 'block_number')}
        {renderInput('Land Title Reference', 'land_title_reference', 'text', 'e.g. C of O No. 1234')}
      </div>
      
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mt-4">
        <h4 className="text-sm font-bold text-blue-900 mb-2">GNSS Coordinates</h4>
        <p className="text-xs text-blue-700 mb-4">Provide accurate geospatial coordinates for map integration and boundary tracking.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-blue-900 mb-1">Latitude</label>
            <input type="text" className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm" placeholder="e.g. 6.4281" />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-900 mb-1">Longitude</label>
            <input type="text" className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm" placeholder="e.g. 3.4219" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-[#022C4F]">Project Professionals</h3>
          <p className="text-xs text-slate-500 mt-1">Add certified professionals responsible for the development.</p>
        </div>
        <button 
          onClick={handleAddProfessional}
          type="button"
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 flex items-center gap-2 transition-colors"
        >
          <Plus size={16} /> Add Professional
        </button>
      </div>

      {professionals.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
          <HardHat size={32} className="text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-600">No professionals added yet</p>
          <p className="text-xs text-slate-400 mt-1">Click the button above to add architects, engineers, etc.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {professionals.map((prof, idx) => (
            <div key={idx} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 relative group">
              <button 
                onClick={() => handleRemoveProfessional(idx)}
                type="button"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">Role *</label>
                  <select 
                    value={prof.role} 
                    onChange={(e) => handleProfessionalChange(idx, 'role', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="Architect">Architect</option>
                    <option value="Civil/Structural Engineer">Civil/Structural Engineer</option>
                    <option value="Mechanical Engineer">Mechanical Engineer</option>
                    <option value="Electrical Engineer">Electrical Engineer</option>
                    <option value="Builder">Builder</option>
                    <option value="Town Planner">Town Planner</option>
                    <option value="Quantity Surveyor">Quantity Surveyor</option>
                    <option value="Project Manager">Project Manager</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={prof.name}
                    onChange={(e) => handleProfessionalChange(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" 
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">Organization</label>
                  <input 
                    type="text" 
                    value={prof.organization || ''}
                    onChange={(e) => handleProfessionalChange(idx, 'organization', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">License No.</label>
                  <input 
                    type="text" 
                    value={prof.license_number || ''}
                    onChange={(e) => handleProfessionalChange(idx, 'license_number', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">Email</label>
                  <input 
                    type="email" 
                    value={prof.email || ''}
                    onChange={(e) => handleProfessionalChange(idx, 'email', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={prof.phone || ''}
                    onChange={(e) => handleProfessionalChange(idx, 'phone', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSelect('Regulatory Authority', 'regulatory_authority', [
          { value: 'LASBCA', label: 'Lagos State Building Control Agency (LASBCA)' },
          { value: 'LASPPPA', label: 'Lagos State Physical Planning Permit Authority (LASPPPA)' },
          { value: 'FCDA', label: 'Federal Capital Development Authority (FCDA)' },
          { value: 'Other', label: 'Other State Agency' },
        ])}
        {renderInput('Planning Approval Reference', 'planning_approval_reference', 'text', 'e.g. PLA/2026/001')}
        {renderInput('Building Control / Permit Number', 'permit_number', 'text', 'e.g. BLD/2026/089')}
        {renderSelect('Permit Status', 'permit_status', [
          { value: 'Pending', label: 'Pending Approval' },
          { value: 'Approved', label: 'Approved (Valid)' },
          { value: 'Conditional', label: 'Approved (Conditional)' },
          { value: 'Expired', label: 'Expired' },
        ])}
        {renderInput('Environmental Approval Ref', 'environmental_approval_reference', 'text', 'e.g. ENV/2026/012')}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Approval Date', 'approval_date', 'date')}
        {renderInput('Permit Expiry Date', 'permit_expiry_date', 'date')}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Primary Use', 'primary_use', 'text', 'e.g. Residential Apartments')}
        {renderInput('Structural System', 'structural_system', 'text', 'e.g. Reinforced Concrete Frame')}
        {renderInput('Site Area (sqm)', 'site_area', 'number')}
        {renderInput('Gross Floor Area (sqm)', 'gross_floor_area', 'number')}
        {renderInput('Building Height (meters)', 'building_height', 'number')}
        {renderInput('Total Number of Units', 'number_of_units', 'number')}
      </div>
      <div>
        <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Special Project Requirements / Constraints</label>
        <textarea
          name="special_requirements"
          rows={3}
          value={formData.special_requirements || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent text-sm resize-none"
        />
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <p className="text-sm text-slate-500 mb-4">Upload all required statutory and technical documentation for this project. Note: Max file size is 50MB per document.</p>
      
      <div className="grid grid-cols-1 gap-4">
        {['Land Ownership/Title Document', 'Approved Architectural Drawings', 'Structural Drawings', 'Survey Plan', 'Environmental Impact Assessment'].map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#022C4F]">{doc}</p>
                <p className="text-xs text-slate-500">{documents[doc] ? documents[doc].name : 'Required'}</p>
              </div>
            </div>
            <label className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-[#022C4F] hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer">
              <Upload size={14} /> {documents[doc] ? 'Change' : 'Upload'}
              <input type="file" className="hidden" onChange={(e) => handleDocumentChange(doc, e)} />
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Responsible Department', 'assigned_department', 'text', 'e.g. Inspectorate Dept.')}
        {renderSelect('Project Priority', 'project_priority', [
          { value: 'Low', label: 'Low' },
          { value: 'Normal', label: 'Normal' },
          { value: 'High', label: 'High' },
          { value: 'Critical', label: 'Critical' },
        ])}
        {renderInput('Assigned Regulatory Officer', 'assigned_officer', 'text')}
        {renderInput('Assigned Project Inspector', 'assigned_inspector', 'text')}
        {renderSelect('Inspection Frequency', 'inspection_frequency', [
          { value: 'Weekly', label: 'Weekly' },
          { value: 'Bi-Weekly', label: 'Bi-Weekly' },
          { value: 'Monthly', label: 'Monthly' },
          { value: 'Milestone Based', label: 'Milestone Based' },
        ])}
      </div>
      <div>
        <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Internal Agency Notes (Not visible to developers)</label>
        <textarea
          name="internal_notes"
          rows={3}
          value={formData.internal_notes || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm resize-none"
        />
      </div>
    </div>
  );

  const renderStep9 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
        <h3 className="text-lg font-bold text-[#022C4F] mb-4">Project Monitoring Configuration</h3>
        <p className="text-sm text-slate-500 mb-6">Select which automated monitoring modules should be enabled for this project workflow.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderCheckbox('Enable Site Monitoring', 'enable_site_monitoring')}
          {renderCheckbox('Require Scheduled Inspections', 'inspection_required')}
          {renderCheckbox('Enable GNSS / Survey Tracking', 'enable_gnss')}
          {renderCheckbox('Strict Compliance Monitoring', 'compliance_monitoring_required')}
          {renderCheckbox('BIM Model Integration', 'enable_bim')}
          {renderCheckbox('Mandatory Progress Reporting', 'progress_reporting_required')}
        </div>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
        <h3 className="text-lg font-bold text-[#022C4F] mb-4">Review & Confirmation</h3>
        
        <div className="space-y-3 text-sm text-[#022C4F]">
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <p><strong>Project Name:</strong> {formData.name || 'Not provided'}</p>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <p><strong>Developer:</strong> {formData.developer_organization || 'Not provided'}</p>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <p><strong>Location:</strong> {formData.lga || 'Not provided'} LGA</p>
          </div>
          <div className="flex items-start gap-2">
            <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <p><strong>Professionals Listed:</strong> {professionals.length}</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-xl border border-blue-200 text-xs text-blue-800 flex gap-3 items-start">
          <ShieldCheck size={20} className="shrink-0 text-blue-600" />
          <p>By registering this project, it will become an active record in the Nexucon Government Command Center. Automated reference numbers will be generated upon successful creation.</p>
        </div>
      </div>

    </div>
  );

  return (
    <div className="h-full flex flex-col pt-2 max-w-5xl mx-auto w-full pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/government/dashboard/command-center"
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#022C4F]">Register New Project</h1>
          <p className="text-sm text-slate-500 mt-1">Establish the official project record and regulatory workflow</p>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar Stepper */}
        <div className="w-64 hidden lg:block shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm sticky top-6">
            <nav className="space-y-1">
              {STEPS.map((step, idx) => {
                const isActive = currentStep === step.id;
                const isPast = currentStep > step.id;
                const Icon = step.icon;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all text-left
                      ${isActive ? 'bg-[#022C4F] text-white shadow-md' : 'hover:bg-slate-50 text-slate-500'}
                    `}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : (isPast ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100')}`}>
                      {isPast ? <Check size={12} /> : <Icon size={12} />}
                    </div>
                    <span>{String(step.id).padStart(2, '0')} {step.title}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2">
              {error}
            </div>
          )}
          
          {validationError && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              {validationError}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <div className="mb-8 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-[#022C4F] mb-1">
                {React.createElement(STEPS[currentStep-1].icon, { size: 24 })}
                <h2 className="text-xl font-bold">Step {currentStep}: {STEPS[currentStep-1].title}</h2>
              </div>
            </div>

            <form className="min-h-[400px]">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
              {currentStep === 6 && renderStep6()}
              {currentStep === 7 && renderStep7()}
              {currentStep === 8 && renderStep8()}
              {currentStep === 9 && renderStep9()}
            </form>

            <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
                className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 bg-white shadow-sm"
              >
                <ChevronLeft size={16} /> Previous Step
              </button>
              
              <div className="flex items-center gap-3">
                {currentStep < 9 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-[#022C4F] text-white text-sm font-bold rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-md"
                  >
                    Next Step <ChevronRight size={16} />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRegister('DRAFT')}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-white text-slate-700 border border-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRegister('ACTIVE')}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-[#022C4F] text-white text-sm font-bold rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? 'Registering...' : <><Save size={16} /> Register Project</>}
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
