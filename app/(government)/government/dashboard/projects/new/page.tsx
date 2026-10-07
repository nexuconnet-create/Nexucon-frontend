"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createProject,
  uploadProjectDocument,
  convertCoordinatesApi,
  Project,
  ProjectProfessional
} from '@/services/projects';
import { getDistricts, District } from '@/services/settings';
import { CustomSelect } from '@/components/CustomSelect';
import {
  getStateOptions,
  getAreaOptions
} from '@/lib/nigeriaGeoData';
import {
  CoordinateSystem,
  CornerInput,
  ConversionResult,
  convertFourCorners
} from '@/lib/coordinateUtils';
import {
  ArrowLeft,
  Save,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  Plus,
  Trash2,
  Building2,
  Users,
  MapPin,
  FileCheck,
  ClipboardList,
  HardHat,
  FileText,
  Settings,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Compass,
  Layers,
  Globe,
  ExternalLink,
  Calculator,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Project Info', icon: Building2 },
  { id: 2, title: 'Developer', icon: Users },
  { id: 3, title: 'Location & Coordinates', icon: MapPin },
  { id: 4, title: 'Professionals', icon: HardHat },
  { id: 5, title: 'Regulatory', icon: FileCheck },
  { id: 6, title: 'Development', icon: ClipboardList },
  { id: 7, title: 'Documents', icon: FileText },
  { id: 8, title: 'Gov Assignment', icon: ShieldCheck },
  { id: 9, title: 'Review & Register', icon: Settings }
];

const STANDARD_PROFESSIONAL_ROLES = [
  { value: 'Architect', label: 'Architect' },
  { value: 'Civil/Structural Engineer', label: 'Civil / Structural Engineer' },
  { value: 'Mechanical Engineer', label: 'Mechanical Engineer' },
  { value: 'Electrical Engineer', label: 'Electrical Engineer' },
  { value: 'Builder', label: 'Registered Builder' },
  { value: 'Town Planner', label: 'Town Planner (Urban Planning)' },
  { value: 'Quantity Surveyor', label: 'Quantity Surveyor (QS)' },
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Geotechnical Engineer', label: 'Geotechnical / Soils Engineer' },
  { value: 'Land Surveyor', label: 'Licensed Land Surveyor' },
  { value: 'Environmental Consultant', label: 'Environmental Consultant' },
  { value: 'Health & Safety Officer', label: 'Health & Safety (HSE) Officer' },
  { value: 'Others', label: 'Others (Custom Role / Specialization)' },
];

const COORDINATE_SYSTEM_OPTIONS = [
  { value: 'WGS84_DD', label: 'WGS84 Decimal Degrees (DD - Standard GPS)' },
  { value: 'DMS', label: 'Degrees, Minutes, Seconds (DMS)' },
  { value: 'UTM_31N_WGS84', label: 'UTM Zone 31N - WGS84 (Lagos / SW Nigeria)' },
  { value: 'UTM_31N_MINNA', label: 'UTM Zone 31N - Minna Datum (Nigerian Cadastral)' },
  { value: 'UTM_32N_WGS84', label: 'UTM Zone 32N - WGS84 (SE & Central Nigeria)' },
  { value: 'UTM_32N_MINNA', label: 'UTM Zone 32N - Minna Datum (Nigerian Survey)' },
];

interface ExtendedProfessional extends ProjectProfessional {
  selectedRoleType: string;
  customRole: string;
}

const DEFAULT_CORNERS: CornerInput[] = [
  { id: 1, label: 'Corner 1 (North-West)', lat: '', lng: '', easting: '', northing: '', latDeg: '', latMin: '', latSec: '', latDir: 'N', lngDeg: '', lngMin: '', lngSec: '', lngDir: 'E' },
  { id: 2, label: 'Corner 2 (North-East)', lat: '', lng: '', easting: '', northing: '', latDeg: '', latMin: '', latSec: '', latDir: 'N', lngDeg: '', lngMin: '', lngSec: '', lngDir: 'E' },
  { id: 3, label: 'Corner 3 (South-East)', lat: '', lng: '', easting: '', northing: '', latDeg: '', latMin: '', latSec: '', latDir: 'N', lngDeg: '', lngMin: '', lngSec: '', lngDir: 'E' },
  { id: 4, label: 'Corner 4 (South-West)', lat: '', lng: '', easting: '', northing: '', latDeg: '', latMin: '', latSec: '', latDir: 'N', lngDeg: '', lngMin: '', lngSec: '', lngDir: 'E' },
];

const SAMPLE_LAGOS_CORNERS: Record<CoordinateSystem, Partial<CornerInput>[]> = {
  WGS84_DD: [
    { lat: '6.431200', lng: '3.421500' },
    { lat: '6.431200', lng: '3.422200' },
    { lat: '6.430500', lng: '3.422200' },
    { lat: '6.430500', lng: '3.421500' },
  ],
  DMS: [
    { latDeg: '6', latMin: '25', latSec: '52.32', latDir: 'N', lngDeg: '3', lngMin: '25', lngSec: '17.40', lngDir: 'E' },
    { latDeg: '6', latMin: '25', latSec: '52.32', latDir: 'N', lngDeg: '3', lngMin: '25', lngSec: '19.92', lngDir: 'E' },
    { latDeg: '6', latMin: '25', latSec: '49.80', latDir: 'N', lngDeg: '3', lngMin: '25', lngSec: '19.92', lngDir: 'E' },
    { latDeg: '6', latMin: '25', latSec: '49.80', latDir: 'N', lngDeg: '3', lngMin: '25', lngSec: '17.40', lngDir: 'E' },
  ],
  UTM_31N_WGS84: [
    { easting: '546640.20', northing: '711050.80' },
    { easting: '546717.50', northing: '711050.80' },
    { easting: '546717.50', northing: '710973.40' },
    { easting: '546640.20', northing: '710973.40' },
  ],
  UTM_31N_MINNA: [
    { easting: '546640.20', northing: '711050.80' },
    { easting: '546717.50', northing: '711050.80' },
    { easting: '546717.50', northing: '710973.40' },
    { easting: '546640.20', northing: '710973.40' },
  ],
  UTM_32N_WGS84: [
    { easting: '325400.00', northing: '711200.00' },
    { easting: '325480.00', northing: '711200.00' },
    { easting: '325480.00', northing: '711120.00' },
    { easting: '325400.00', northing: '711120.00' },
  ],
  UTM_32N_MINNA: [
    { easting: '325400.00', northing: '711200.00' },
    { easting: '325480.00', northing: '711200.00' },
    { easting: '325480.00', northing: '711120.00' },
    { easting: '325400.00', northing: '711120.00' },
  ],
};

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
    state: 'Lagos',
    lga: '',
    district: null,
    ward_area: '',
    plot_number: '',
    block_number: '',
    land_title_reference: '',
    latitude: null,
    longitude: null,
    coordinate_system: 'WGS84_DD',
    corner_coordinates: null,

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

  // Professionals state
  const [professionals, setProfessionals] = useState<ExtendedProfessional[]>([]);

  // Coordinates & 4 Building Corners State
  const [coordinateSystem, setCoordinateSystem] = useState<CoordinateSystem>('WGS84_DD');
  const [corners, setCorners] = useState<CornerInput[]>(DEFAULT_CORNERS);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionFeedback, setConversionFeedback] = useState<string | null>(null);

  // Operational zones
  const [zones, setZones] = useState<District[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDistricts({ active: 'true' })
      .then((data) => {
        if (!cancelled) setZones(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setZonesError('The zone register could not be read from the server.');
      })
      .finally(() => {
        if (!cancelled) setZonesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    }
  };

  const handleCustomSelectChange = (name: keyof Project, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value === '' ? null : value };
      if (name === 'state') {
        // Reset LGA when state changes to avoid mismatched state-LGA combinations
        updated.lga = '';
      }
      return updated;
    });
  };

  const handleDocumentChange = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({ ...prev, [docType]: e.target.files![0] }));
      setValidationError(null);
    }
  };

  // Corner Coordinate Handlers
  const handleCornerChange = (index: number, field: keyof CornerInput, value: any) => {
    setCorners(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleApplySampleCorners = () => {
    const sampleSet = SAMPLE_LAGOS_CORNERS[coordinateSystem];
    if (!sampleSet) return;
    setCorners(prev =>
      prev.map((c, idx) => ({
        ...c,
        ...(sampleSet[idx] || {})
      }))
    );
    setConversionFeedback('Lagos test coordinates loaded. Click "Convert & Calculate Building Footprint" below.');
  };

  const handleConvertCoordinates = async () => {
    setIsConverting(true);
    setConversionFeedback(null);
    setError(null);

    try {
      // 1. Try Backend API first for end-to-end integration verification
      let result: ConversionResult;
      try {
        const apiResponse = await convertCoordinatesApi({
          system: coordinateSystem,
          corners: corners
        });
        result = apiResponse;
      } catch (backendErr) {
        console.warn('Backend conversion fallback to client-side mathematical engine:', backendErr);
        // 2. Client-side conversion fallback
        result = convertFourCorners(coordinateSystem, corners);
      }

      setConversionResult(result);
      setFormData(prev => ({
        ...prev,
        latitude: result.center.lat,
        longitude: result.center.lng,
        coordinate_system: coordinateSystem,
        corner_coordinates: result,
        site_area: prev.site_area || (result.footprintAreaSqm ? result.footprintAreaSqm.toString() : '')
      }));

      setConversionFeedback(`Successfully converted 4 corner coordinates! Center point calculated at (${result.center.lat.toFixed(6)}, ${result.center.lng.toFixed(6)}) with building footprint area of ${result.footprintAreaSqm.toLocaleString()} sqm.`);
    } catch (err: any) {
      console.error('Error during coordinate conversion:', err);
      setConversionFeedback(`Conversion failed: ${err.message || 'Please check coordinate inputs'}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Professionals Handlers
  const handleAddProfessional = () => {
    setProfessionals([
      ...professionals,
      {
        name: '',
        role: 'Architect',
        selectedRoleType: 'Architect',
        customRole: '',
        organization: '',
        email: '',
        phone: '',
        license_number: ''
      }
    ]);
  };

  const handleProfessionalRoleSelect = (index: number, selectedRole: string) => {
    setProfessionals(prev => {
      const updated = [...prev];
      const target = updated[index];
      target.selectedRoleType = selectedRole;
      if (selectedRole === 'Others') {
        target.role = target.customRole.trim() || 'Others';
      } else {
        target.role = selectedRole;
      }
      return updated;
    });
  };

  const handleProfessionalCustomRoleChange = (index: number, customValue: string) => {
    setProfessionals(prev => {
      const updated = [...prev];
      const target = updated[index];
      target.customRole = customValue;
      target.role = customValue.trim() || 'Others';
      return updated;
    });
  };

  const handleProfessionalFieldChange = (index: number, field: keyof ProjectProfessional, value: string) => {
    setProfessionals(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveProfessional = (index: number) => {
    setProfessionals(prev => prev.filter((_, i) => i !== index));
  };

  // Step Validation
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
        if (!formData.lga) return 'Local Government Area (LGA / LCDA) is required';
        break;
      case 4:
        for (const prof of professionals) {
          if (!prof.name) return 'All professionals must have a Full Name specified';
          if (prof.selectedRoleType === 'Others' && !prof.customRole.trim()) {
            return `Please specify the custom professional role for "${prof.name}"`;
          }
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
      const sanitizedProfessionals: ProjectProfessional[] = professionals
        .filter(p => p.name.trim() !== '')
        .map(p => ({
          name: p.name.trim(),
          role: p.selectedRoleType === 'Others' ? (p.customRole.trim() || 'Others') : p.role,
          organization: p.organization?.trim() || '',
          email: p.email?.trim() || '',
          phone: p.phone?.trim() || '',
          license_number: p.license_number?.trim() || '',
        }));

      const payload = {
        ...formData,
        status: statusOverride,
        coordinate_system: coordinateSystem,
        corner_coordinates: conversionResult || formData.corner_coordinates,
        professionals: sanitizedProfessionals,
      };

      const createdProject = await createProject(payload);

      for (const [docType, file] of Object.entries(documents)) {
        await uploadProjectDocument(createdProject.id, file, docType);
      }

      router.push('/government/dashboard/command-center');
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || 'Failed to create project. Please verify inputs and try again.');
      setIsSubmitting(false);
    }
  };

  // Render Helpers
  const renderInput = (
    label: string,
    name: keyof Project,
    type: string = "text",
    placeholder: string = "",
    required: boolean = false
  ) => (
    <div>
      <label className="block text-sm font-bold text-[#022C4F] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
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

  // STEP 1: PROJECT INFO
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Project Name', 'name', 'text', 'e.g. Marina Horizon Towers', true)}

        <div>
          <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Project Type</label>
          <CustomSelect
            value={formData.project_type || ''}
            onChange={(val) => handleCustomSelectChange('project_type', val)}
            options={[
              { value: 'Residential', label: 'Residential' },
              { value: 'Commercial', label: 'Commercial' },
              { value: 'Industrial', label: 'Industrial' },
              { value: 'Infrastructure', label: 'Infrastructure' },
              { value: 'Mixed-Use', label: 'Mixed-Use' },
              { value: 'Institutional', label: 'Institutional' },
            ]}
            placeholder="Select Project Type..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Development Category</label>
          <CustomSelect
            value={formData.development_category || ''}
            onChange={(val) => handleCustomSelectChange('development_category', val)}
            options={[
              { value: 'Category A (High Rise)', label: 'Category A (High Rise / Special Engineering)' },
              { value: 'Category B (Medium Density)', label: 'Category B (Medium Density / Multi-Storey)' },
              { value: 'Category C (Low Density)', label: 'Category C (Low Density / Residential)' },
            ]}
            placeholder="Select Development Category..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

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
          placeholder="Brief description of the proposed development, construction scope, and architectural concept..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Estimated Start Date', 'start_date', 'date')}
        {renderInput('Expected Completion Date', 'estimated_completion', 'date')}
      </div>
    </div>
  );

  // STEP 2: DEVELOPER
  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Organization / Company Name', 'developer_organization', 'text', 'e.g. Eko Atlantic Developers Ltd', true)}
        {renderInput('Developer / Owner Name', 'developer_name', 'text', 'e.g. Babatunde Sanwo-Olu & Partners', true)}
        {renderInput('Registration Number (RC)', 'developer_reg_number', 'text', 'RC-894721')}
        {renderInput('Primary Contact Person', 'developer_contact_person', 'text', 'e.g. Chief O. Adeleke')}
        {renderInput('Email Address', 'developer_email', 'email', 'contact@developer.ng')}
        {renderInput('Phone Number', 'developer_phone', 'tel', '+234 803 000 1234')}
      </div>
      <div>
        <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Registered Corporate Address</label>
        <textarea
          name="developer_address"
          rows={3}
          value={formData.developer_address || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent text-sm resize-none"
          placeholder="Plot 10, Commercial Avenue, Victoria Island, Lagos..."
        />
      </div>
    </div>
  );

  // STEP 3: LOCATION & COORDINATES (Local Governments, LCDAs, 4 Corners, Conversions)
  const renderStep3 = () => {
    const stateOptions = getStateOptions();
    const areaOptions = getAreaOptions(formData.state || '');

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div>
          <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Site Physical Address</label>
          <textarea
            name="site_address"
            rows={2}
            value={formData.site_address || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent text-sm resize-none"
            placeholder="Plot 4A, Water Corporation Drive, Oniru / Victoria Island, Lagos..."
          />
        </div>

        {/* State and LGA / LCDA Dropdowns using CustomSelect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#022C4F] mb-1.5">
              State <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={formData.state || ''}
              onChange={(val) => handleCustomSelectChange('state', val)}
              options={stateOptions}
              placeholder="Select State..."
              searchable={true}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">Covers all 36 States + FCT</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#022C4F] mb-1.5">
              LGA / LCDA <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={formData.lga || ''}
              onChange={(val) => handleCustomSelectChange('lga', val)}
              options={areaOptions}
              placeholder={formData.state ? "Select Local Gov / LCDA..." : "Choose state first"}
              searchable={true}
              disabled={!formData.state}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {formData.state?.toLowerCase() === 'lagos'
                ? 'All 20 LGAs & 37 LCDAs (57 total divisions)'
                : `${areaOptions.length} administrative areas available`}
            </p>
          </div>

          <div>
            {renderInput('Ward / Area / Community', 'ward_area', 'text', 'e.g. Victoria Island East')}
          </div>
        </div>

        {/* Operational Zone */}
        <div>
          <label htmlFor="project-zone" className="block text-sm font-bold text-[#022C4F] mb-1.5">
            Operational Zone (Government Jurisdiction)
          </label>
          {zonesLoading ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
              <Loader2 size={14} className="animate-spin" /> Loading the zone register...
            </div>
          ) : zonesError ? (
            <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50">
              <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                {zonesError} The project can still be registered without a zone and assigned later.
              </p>
            </div>
          ) : zones.length === 0 ? (
            <div className="flex items-start gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
              <AlertTriangle size={15} className="text-slate-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-600">
                No operational zone has been created yet.{' '}
                <Link
                  href="/government/dashboard/settings/districts"
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Manage Operational Zones
                </Link>
              </p>
            </div>
          ) : (
            <CustomSelect
              value={formData.district || ''}
              onChange={(val) => handleCustomSelectChange('district', val)}
              options={[
                { value: '', label: 'No zone assigned (General Queue)' },
                ...zones.map((zone) => ({
                  value: zone.id,
                  label: `${zone.name}${zone.code ? ` (${zone.code})` : ''}`
                }))
              ]}
              placeholder="Select Operational Zone..."
              searchable={true}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          )}
          <p className="mt-1 text-xs text-slate-500">
            Scopes which district office and field inspectors hold regulatory oversight over this project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderInput('Plot Number', 'plot_number', 'text', 'e.g. Plot 12')}
          {renderInput('Block / Cadastral Parcel', 'block_number', 'text', 'e.g. Block VII')}
          {renderInput('Land Title Reference', 'land_title_reference', 'text', 'e.g. C of O No. 24/24/2019')}
        </div>

        {/* 4-CORNER BUILDING LOCATION & COORDINATE CONVERSION ENGINE */}
        <div className="p-6 bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/50 border border-blue-200 rounded-2xl shadow-sm mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-200/60 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#022C4F]" />
                <h4 className="text-base font-bold text-[#022C4F]">
                  4-Corner Building Boundary Coordinates & Conversion Engine
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Enter the 4 building corner survey coordinates in your preferred system. The engine automatically converts them to standard WGS84 Latitude & Longitude, projects UTM metrics, and calculates the exact building footprint area.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleApplySampleCorners}
                className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Fill sample Lagos Victoria Island coordinates"
              >
                <Sparkles size={13} className="text-amber-500" />
                Fill Lagos Sample
              </button>
            </div>
          </div>

          {/* Coordinate System Selector */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5 uppercase tracking-wide">
              Coordinate System / Input Format
            </label>
            <div className="max-w-md">
              <CustomSelect
                value={coordinateSystem}
                onChange={(val) => {
                  setCoordinateSystem(val as CoordinateSystem);
                  setConversionResult(null);
                  setConversionFeedback(null);
                }}
                options={COORDINATE_SYSTEM_OPTIONS}
                placeholder="Choose coordinate format..."
                className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm font-medium"
              />
            </div>
          </div>

          {/* 4 Corners Inputs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {corners.map((corner, idx) => (
              <div
                key={corner.id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-[#022C4F] bg-blue-100/70 text-blue-900 px-2 py-0.5 rounded-md">
                    {corner.label}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Corner #{corner.id}</span>
                </div>

                {/* Decimal Degrees Form */}
                {coordinateSystem === 'WGS84_DD' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Latitude (°N)
                      </label>
                      <input
                        type="text"
                        value={corner.lat ?? ''}
                        onChange={(e) => handleCornerChange(idx, 'lat', e.target.value)}
                        placeholder="e.g. 6.431200"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Longitude (°E)
                      </label>
                      <input
                        type="text"
                        value={corner.lng ?? ''}
                        onChange={(e) => handleCornerChange(idx, 'lng', e.target.value)}
                        placeholder="e.g. 3.421500"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                      />
                    </div>
                  </div>
                )}

                {/* Degrees, Minutes, Seconds (DMS) Form */}
                {coordinateSystem === 'DMS' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Latitude (Deg / Min / Sec / Dir)
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <input
                          type="number"
                          value={corner.latDeg ?? ''}
                          onChange={(e) => handleCornerChange(idx, 'latDeg', e.target.value)}
                          placeholder="6°"
                          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                        <input
                          type="number"
                          value={corner.latMin ?? ''}
                          onChange={(e) => handleCornerChange(idx, 'latMin', e.target.value)}
                          placeholder="25'"
                          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={corner.latSec ?? ''}
                          onChange={(e) => handleCornerChange(idx, 'latSec', e.target.value)}
                          placeholder="52.32&quot;"
                          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                        <select
                          value={corner.latDir || 'N'}
                          onChange={(e) => handleCornerChange(idx, 'latDir', e.target.value)}
                          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        >
                          <option value="N">N</option>
                          <option value="S">S</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Longitude (Deg / Min / Sec / Dir)
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <input
                          type="number"
                          value={corner.lngDeg ?? ''}
                          onChange={(e) => handleCornerChange(idx, 'lngDeg', e.target.value)}
                          placeholder="3°"
                          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                        <input
                          type="number"
                          value={corner.lngMin ?? ''}
                          onChange={(e) => handleCornerChange(idx, 'lngMin', e.target.value)}
                          placeholder="25'"
                          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={corner.lngSec ?? ''}
                          onChange={(e) => handleCornerChange(idx, 'lngSec', e.target.value)}
                          placeholder="17.40&quot;"
                          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                        <select
                          value={corner.lngDir || 'E'}
                          onChange={(e) => handleCornerChange(idx, 'lngDir', e.target.value)}
                          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        >
                          <option value="E">E</option>
                          <option value="W">W</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* UTM Form (Easting & Northing) */}
                {coordinateSystem.startsWith('UTM') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Easting X (meters)
                      </label>
                      <input
                        type="text"
                        value={corner.easting ?? ''}
                        onChange={(e) => handleCornerChange(idx, 'easting', e.target.value)}
                        placeholder="e.g. 546640.20"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Northing Y (meters)
                      </label>
                      <input
                        type="text"
                        value={corner.northing ?? ''}
                        onChange={(e) => handleCornerChange(idx, 'northing', e.target.value)}
                        placeholder="e.g. 711050.80"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Button: Convert Coordinates */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleConvertCoordinates}
              disabled={isConverting}
              className="px-5 py-2.5 bg-[#022C4F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isConverting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Converting Coordinates...
                </>
              ) : (
                <>
                  <Calculator size={14} />
                  Convert & Calculate Building Footprint
                </>
              )}
            </button>

            {conversionFeedback && (
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                  conversionFeedback.includes('failed')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {!conversionFeedback.includes('failed') && <CheckCircle2 size={14} className="text-emerald-600" />}
                {conversionFeedback}
              </span>
            )}
          </div>

          {/* CONVERSION RESULTS CARD & GOOGLE SATELLITE PREVIEW */}
          {conversionResult && (
            <div className="mt-6 p-4 bg-white border border-blue-200 rounded-xl shadow-xs animate-in fade-in slide-in-from-bottom-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#022C4F]">
                    Converted Coordinates & Geospatial Analysis
                  </span>
                </div>
                <a
                  href={conversionResult.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                >
                  <Globe size={13} />
                  View Satellite Boundary Map
                  <ExternalLink size={11} />
                </a>
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-semibold">Center Latitude</div>
                  <div className="text-sm font-bold text-[#022C4F] font-mono mt-0.5">
                    {conversionResult.center.lat.toFixed(6)}°
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{conversionResult.center.formattedLatDms}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-semibold">Center Longitude</div>
                  <div className="text-sm font-bold text-[#022C4F] font-mono mt-0.5">
                    {conversionResult.center.lng.toFixed(6)}°
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{conversionResult.center.formattedLngDms}</div>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-100">
                  <div className="text-[11px] text-emerald-700 font-semibold">Footprint Area</div>
                  <div className="text-sm font-bold text-emerald-900 font-mono mt-0.5">
                    {conversionResult.footprintAreaSqm.toLocaleString()} sqm
                  </div>
                  <div className="text-[10px] text-emerald-600">
                    {(conversionResult.footprintAreaSqm / 10000).toFixed(4)} ha
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100">
                  <div className="text-[11px] text-blue-700 font-semibold">Building Perimeter</div>
                  <div className="text-sm font-bold text-blue-900 font-mono mt-0.5">
                    {conversionResult.perimeterMeters.toLocaleString()} m
                  </div>
                  <div className="text-[10px] text-blue-600">Closed Polygon</div>
                </div>
              </div>

              {/* 4 Corners Converted Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Corner</th>
                      <th className="py-2 px-3 font-mono">Latitude (WGS84 DD)</th>
                      <th className="py-2 px-3 font-mono">Longitude (WGS84 DD)</th>
                      <th className="py-2 px-3">DMS Format</th>
                      <th className="py-2 px-3 font-mono">UTM Metric (Easting, Northing)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {conversionResult.corners.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-bold text-[#022C4F]">{c.label}</td>
                        <td className="py-2 px-3 font-mono">{c.lat.toFixed(6)}°</td>
                        <td className="py-2 px-3 font-mono">{c.lng.toFixed(6)}°</td>
                        <td className="py-2 px-3 text-[11px] text-slate-500">
                          {c.formattedLatDms}, {c.formattedLngDms}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px]">
                          E: {c.easting.toLocaleString()} | N: {c.northing.toLocaleString()} ({c.utmZone})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // STEP 4: PROFESSIONALS (Added "Others" Custom Role Option)
  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-[#022C4F]">Project Registered Professionals</h3>
          <p className="text-xs text-slate-500 mt-1">
            Specify certified architects, engineers, builders, and custom specialty consultants responsible for the development.
          </p>
        </div>
        <button
          onClick={handleAddProfessional}
          type="button"
          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 flex items-center gap-2 transition-colors border border-blue-200"
        >
          <Plus size={16} /> Add Professional
        </button>
      </div>

      {professionals.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
          <HardHat size={32} className="text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-600">No professionals added yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Click &quot;Add Professional&quot; to assign certified design and engineering personnel.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {professionals.map((prof, idx) => (
            <div key={idx} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 relative group">
              <button
                onClick={() => handleRemoveProfessional(idx)}
                type="button"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                title="Remove Professional"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Professional Role Dropdown with CustomSelect */}
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">
                    Professional Role <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={prof.selectedRoleType}
                    onChange={(val) => handleProfessionalRoleSelect(idx, val)}
                    options={STANDARD_PROFESSIONAL_ROLES}
                    placeholder="Select Role..."
                    searchable={true}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={prof.name}
                    onChange={(e) => handleProfessionalFieldChange(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                    placeholder="e.g. Engr. Adekunle Johnson, FNSE"
                  />
                </div>
              </div>

              {/* "OTHERS" SPECIFY CUSTOM ROLE INPUT */}
              {prof.selectedRoleType === 'Others' && (
                <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    Specify Custom Professional Role / Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={prof.customRole}
                    onChange={(e) => handleProfessionalCustomRoleChange(idx, e.target.value)}
                    placeholder="e.g. Landscape Architect, Façade Engineer, Acoustics Consultant, Fire Safety Engineer"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm text-slate-800 placeholder:text-amber-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-amber-800/80 mt-1">
                    Provide the specialized category not present in the standard professional list.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">Organization / Firm</label>
                  <input
                    type="text"
                    value={prof.organization || ''}
                    onChange={(e) => handleProfessionalFieldChange(idx, 'organization', e.target.value)}
                    placeholder="e.g. Apex Structural Consultants"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">Registration / License No.</label>
                  <input
                    type="text"
                    value={prof.license_number || ''}
                    onChange={(e) => handleProfessionalFieldChange(idx, 'license_number', e.target.value)}
                    placeholder="e.g. ARCON/2018/1429"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={prof.email || ''}
                    onChange={(e) => handleProfessionalFieldChange(idx, 'email', e.target.value)}
                    placeholder="adekunle@apexconsultants.ng"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={prof.phone || ''}
                    onChange={(e) => handleProfessionalFieldChange(idx, 'phone', e.target.value)}
                    placeholder="+234 802 333 4444"
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

  // STEP 5: REGULATORY (Using CustomSelect)
  const renderStep5 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Regulatory Authority</label>
          <CustomSelect
            value={formData.regulatory_authority || ''}
            onChange={(val) => handleCustomSelectChange('regulatory_authority', val)}
            options={[
              { value: 'LASBCA', label: 'Lagos State Building Control Agency (LASBCA)' },
              { value: 'LASPPPA', label: 'Lagos State Physical Planning Permit Authority (LASPPPA)' },
              { value: 'FCDA', label: 'Federal Capital Development Authority (FCDA)' },
              { value: 'Other', label: 'Other State / Federal Agency' },
            ]}
            placeholder="Select Regulatory Authority..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        {renderInput('Planning Approval Reference', 'planning_approval_reference', 'text', 'e.g. PLA/2026/001')}
        {renderInput('Building Control / Permit Number', 'permit_number', 'text', 'e.g. BLD/2026/089')}

        <div>
          <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Permit Status</label>
          <CustomSelect
            value={formData.permit_status || ''}
            onChange={(val) => handleCustomSelectChange('permit_status', val)}
            options={[
              { value: 'Pending', label: 'Pending Approval' },
              { value: 'Approved', label: 'Approved (Valid & Active)' },
              { value: 'Conditional', label: 'Approved (Conditional)' },
              { value: 'Expired', label: 'Expired' },
            ]}
            placeholder="Select Permit Status..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        {renderInput('Environmental Approval Ref', 'environmental_approval_reference', 'text', 'e.g. ENV/2026/012')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Approval Date', 'approval_date', 'date')}
        {renderInput('Permit Expiry Date', 'permit_expiry_date', 'date')}
      </div>
    </div>
  );

  // STEP 6: DEVELOPMENT
  const renderStep6 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Primary Use', 'primary_use', 'text', 'e.g. Commercial Office Complex & Retail')}
        {renderInput('Structural System', 'structural_system', 'text', 'e.g. Post-Tensioned Reinforced Concrete')}
        {renderInput('Site Area (sqm)', 'site_area', 'number', 'e.g. 5200')}
        {renderInput('Gross Floor Area (sqm)', 'gross_floor_area', 'number', 'e.g. 18400')}
        {renderInput('Building Height (meters)', 'building_height', 'number', 'e.g. 48.5')}
        {renderInput('Total Number of Units', 'number_of_units', 'number', 'e.g. 32')}
      </div>
      <div>
        <label className="block text-sm font-bold text-[#022C4F] mb-1.5">
          Special Project Requirements / Geological Constraints
        </label>
        <textarea
          name="special_requirements"
          rows={3}
          value={formData.special_requirements || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent text-sm resize-none"
          placeholder="Coastal foundation piling requirements, deep basement water-proofing constraints, seismic dampers..."
        />
      </div>
    </div>
  );

  // STEP 7: DOCUMENTS
  const renderStep7 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <p className="text-sm text-slate-500 mb-4">
        Upload statutory and technical documentation for this project. Maximum file size is 50MB per file.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {[
          'Land Ownership/Title Document',
          'Approved Architectural Drawings',
          'Structural Drawings & Calculations',
          'Survey Plan & 4-Corner Coordinates',
          'Environmental Impact Assessment (EIA)'
        ].map((doc, idx) => (
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

  // STEP 8: GOVERNMENT ASSIGNMENT (Using CustomSelect)
  const renderStep8 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput('Responsible Department', 'assigned_department', 'text', 'e.g. Central Inspectorate Directorate')}

        <div>
          <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Project Priority</label>
          <CustomSelect
            value={formData.project_priority || 'Normal'}
            onChange={(val) => handleCustomSelectChange('project_priority', val)}
            options={[
              { value: 'Low', label: 'Low Priority' },
              { value: 'Normal', label: 'Normal Priority' },
              { value: 'High', label: 'High Priority (Expedited Oversight)' },
              { value: 'Critical', label: 'Critical (High-Risk / Strict Surveillance)' },
            ]}
            placeholder="Select Priority..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        {renderInput('Assigned Regulatory Officer', 'assigned_officer', 'text', 'e.g. Engr. K. Balogun')}
        {renderInput('Assigned Field Inspector', 'assigned_inspector', 'text', 'e.g. Arch. T. Williams')}

        <div>
          <label className="block text-sm font-bold text-[#022C4F] mb-1.5">Mandatory Inspection Frequency</label>
          <CustomSelect
            value={formData.inspection_frequency || ''}
            onChange={(val) => handleCustomSelectChange('inspection_frequency', val)}
            options={[
              { value: 'Weekly', label: 'Weekly Inspections' },
              { value: 'Bi-Weekly', label: 'Bi-Weekly Inspections' },
              { value: 'Monthly', label: 'Monthly Inspections' },
              { value: 'Milestone Based', label: 'Milestone Based (Foundation, Slab, Framing, Roof)' },
            ]}
            placeholder="Select Inspection Schedule..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#022C4F] mb-1.5">
          Internal Agency Notes (Classified - Never visible to external developers)
        </label>
        <textarea
          name="internal_notes"
          rows={3}
          value={formData.internal_notes || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm resize-none"
          placeholder="Notes on past site history, compliance conditions, or special monitoring instructions..."
        />
      </div>
    </div>
  );

  // STEP 9: REVIEW & REGISTER
  const renderStep9 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
        <h3 className="text-lg font-bold text-[#022C4F] mb-2">Automated Quality Control & Monitoring Configuration</h3>
        <p className="text-sm text-slate-500 mb-6">
          Toggle smart monitoring modules for autonomous audit scans, GNSS perimeter alerts, and digital twin updates.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderCheckbox('Enable Site Continuous Monitoring', 'enable_site_monitoring')}
          {renderCheckbox('Require Scheduled Stage Inspections', 'inspection_required')}
          {renderCheckbox('Enable GNSS Boundary / Corner Tracking', 'enable_gnss')}
          {renderCheckbox('Strict Structural Code Compliance Checks', 'compliance_monitoring_required')}
          {renderCheckbox('BIM Model 3D Integration & Clash Detection', 'enable_bim')}
          {renderCheckbox('Mandatory Contractor Progress Reporting', 'progress_reporting_required')}
        </div>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
        <h3 className="text-lg font-bold text-[#022C4F] mb-4">Project Registration Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#022C4F]">
          <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-2">
            <div>
              <strong>Project:</strong> {formData.name || 'Not provided'}
            </div>
            <div>
              <strong>Developer:</strong> {formData.developer_organization || 'Not provided'}
            </div>
            <div>
              <strong>Jurisdiction:</strong> {formData.lga ? `${formData.lga}, ${formData.state}` : 'Not provided'}
            </div>
            <div>
              <strong>Operational Zone:</strong>{' '}
              {zones.find((z) => z.id === formData.district)?.name || 'General / Unassigned'}
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-2">
            <div>
              <strong>Coordinates Format:</strong> {coordinateSystem}
            </div>
            <div>
              <strong>Center Point:</strong>{' '}
              {formData.latitude && formData.longitude ? (
                <span className="font-mono font-semibold">
                  {Number(formData.latitude).toFixed(6)}°N, {Number(formData.longitude).toFixed(6)}°E
                </span>
              ) : (
                'Pending corner conversion'
              )}
            </div>
            <div>
              <strong>Calculated Footprint Area:</strong>{' '}
              {conversionResult ? `${conversionResult.footprintAreaSqm.toLocaleString()} sqm` : (formData.site_area ? `${formData.site_area} sqm` : 'Pending calculation')}
            </div>
            <div>
              <strong>Professionals Assigned:</strong> {professionals.length} certified experts
            </div>
          </div>
        </div>

        {/* Professionals List Preview */}
        {professionals.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-blue-100">
            <h5 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
              Registered Professionals
            </h5>
            <div className="divide-y divide-slate-100 text-xs">
              {professionals.map((p, idx) => (
                <div key={idx} className="py-1.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-800">
                    {p.name}{' '}
                    <span className="font-normal text-slate-500">
                      ({p.organization || 'Independent'})
                    </span>
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium text-[11px]">
                    {p.selectedRoleType === 'Others' ? (p.customRole || 'Custom Role') : p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-white rounded-xl border border-blue-200 text-xs text-blue-900 flex gap-3 items-start">
          <ShieldCheck size={20} className="shrink-0 text-blue-600 mt-0.5" />
          <p>
            By confirming registration, this development will officially enter the Nexucon Government Command Center. 
            Automated reference credentials and regulatory review applications will be provisioned in the database.
          </p>
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
          <p className="text-sm text-slate-500 mt-1">
            Establish the official project record, four-corner boundary coordinates, and regulatory oversight workflow
          </p>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Stepper Navigation Sidebar */}
        <div className="w-64 hidden lg:block shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm sticky top-6">
            <nav className="space-y-1">
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isPast = currentStep > step.id;
                const Icon = step.icon;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all text-left ${
                      isActive
                        ? 'bg-[#022C4F] text-white shadow-md'
                        : 'hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-white/20'
                          : isPast
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100'
                      }`}
                    >
                      {isPast ? <Check size={12} /> : <Icon size={12} />}
                    </div>
                    <span>
                      {String(step.id).padStart(2, '0')} {step.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {validationError && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={18} />
              {validationError}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <div className="mb-8 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-[#022C4F] mb-1">
                {React.createElement(STEPS[currentStep - 1].icon, { size: 24 })}
                <h2 className="text-xl font-bold">
                  Step {currentStep}: {STEPS[currentStep - 1].title}
                </h2>
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

            {/* Stepper Footer Controls */}
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
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Registering Project...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Register Project
                        </>
                      )}
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
