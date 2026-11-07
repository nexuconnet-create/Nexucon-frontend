"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SurveyBoundaryMapPreview = dynamic(
  () => import('@/components/dashboard/SurveyBoundaryMapPreview'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#022C4F]" /> Loading high-precision survey boundary map...
      </div>
    ),
  }
);

import {
  createProject,
  convertCoordinatesApi,
  Project,
  ProjectProfessional
} from '@/services/projects';
import { getDistricts, District } from '@/services/settings';
import { CustomSelect } from '@/components/CustomSelect';
import { getStateOptions, getAreaOptions } from '@/lib/nigeriaGeoData';
import {
  CoordinateSystem,
  CornerInput,
  ConversionResult,
  convertCorners
} from '@/lib/coordinateUtils';
import {
  ArrowLeft,
  Save,
  Check,
  Plus,
  Trash2,
  Building2,
  Users,
  MapPin,
  ClipboardList,
  Loader2,
  Compass,
  Calculator,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldAlert
} from 'lucide-react';

const DEVELOPMENT_CATEGORY_OPTIONS = [
  { value: 'Highrise', label: 'Highrise (Category A - Multi-Storey Towers & High-Impact Developments)' },
  { value: 'Medium Density', label: 'Medium Density (Category B - 3 to 10 Storeys & Commercial Blocks)' },
  { value: 'Low Density', label: 'Low Density (Category C - Residential Estates, Villas & Bungalows)' },
  { value: 'Special Engineering', label: 'Special Engineering (Bridges, Heavy Industrial, Maritime & Infrastructure)' },
  { value: 'Others', label: 'Others (Custom Development Category / Specialization)' },
];

const FLOOR_NUMBER_OPTIONS = [
  { value: '1', label: '1 Storey (Ground Floor / Bungalow)' },
  { value: '2', label: '2 Storeys (Duplex / Low-Rise)' },
  { value: '3', label: '3 Storeys' },
  { value: '4', label: '4 Storeys' },
  { value: '5', label: '5 Storeys' },
  { value: '6-10', label: '6 - 10 Storeys (Mid-Rise)' },
  { value: '11-20', label: '11 - 20 Storeys (High-Rise)' },
  { value: '21-30', label: '21 - 30 Storeys (Major Tower)' },
  { value: '31+', label: '31+ Storeys (Skyscraper)' },
  { value: 'Others', label: 'Others (Custom Storey / Basement Specification)' },
];

const COORDINATE_SYSTEM_OPTIONS = [
  { value: 'WGS84_DD', label: 'WGS84 Decimal Degrees (DD - Standard GPS)' },
  { value: 'DMS', label: 'Degrees, Minutes, Seconds (DMS)' },
  { value: 'UTM_31N_WGS84', label: 'UTM Zone 31N - WGS84 (Lagos / SW Nigeria)' },
  { value: 'UTM_31N_MINNA', label: 'UTM Zone 31N - Minna Datum (Nigerian Cadastral)' },
  { value: 'UTM_32N_WGS84', label: 'UTM Zone 32N - WGS84 (SE & Central Nigeria)' },
  { value: 'UTM_32N_MINNA', label: 'UTM Zone 32N - Minna Datum (Nigerian Survey)' },
];

const DEFAULT_CORNERS: CornerInput[] = [
  { id: 1, pointNumber: '1', label: 'Corner 1 (NW)', lat: '', lng: '', easting: '', northing: '', latDeg: '', latMin: '', latSec: '', latDir: 'N', lngDeg: '', lngMin: '', lngSec: '', lngDir: 'E' },
  { id: 2, pointNumber: '2', label: 'Corner 2 (NE)', lat: '', lng: '', easting: '', northing: '', latDeg: '', latMin: '', latSec: '', latDir: 'N', lngDeg: '', lngMin: '', lngSec: '', lngDir: 'E' },
  { id: 3, pointNumber: '3', label: 'Corner 3 (SE)', lat: '', lng: '', easting: '', northing: '', latDeg: '', latMin: '', latSec: '', latDir: 'N', lngDeg: '', lngMin: '', lngSec: '', lngDir: 'E' },
  { id: 4, pointNumber: '4', label: 'Corner 4 (SW)', lat: '', lng: '', easting: '', northing: '', latDeg: '', latMin: '', latSec: '', latDir: 'N', lngDeg: '', lngMin: '', lngSec: '', lngDir: 'E' },
];

const SAMPLE_LAGOS_CORNERS: Record<CoordinateSystem, Partial<CornerInput>[]> = {
  WGS84_DD: [
    { pointNumber: '1', label: 'Corner 1 (NW)', lat: '6.424359', lng: '3.385914' },
    { pointNumber: '2', label: 'Corner 2 (NE)', lat: '6.424398', lng: '3.386816' },
    { pointNumber: '3', label: 'Corner 3 (SE)', lat: '6.423947', lng: '3.386836' },
    { pointNumber: '4', label: 'Corner 4 (SW)', lat: '6.423908', lng: '3.385934' },
  ],
  DMS: [
    { pointNumber: '1', label: 'Corner 1 (NW)', latDeg: '6', latMin: '25', latSec: '27.69', latDir: 'N', lngDeg: '3', lngMin: '23', lngSec: '9.29', lngDir: 'E' },
    { pointNumber: '2', label: 'Corner 2 (NE)', latDeg: '6', latMin: '25', latSec: '27.83', latDir: 'N', lngDeg: '3', lngMin: '23', lngSec: '12.54', lngDir: 'E' },
    { pointNumber: '3', label: 'Corner 3 (SE)', latDeg: '6', latMin: '25', latSec: '26.21', latDir: 'N', lngDeg: '3', lngMin: '23', lngSec: '12.61', lngDir: 'E' },
    { pointNumber: '4', label: 'Corner 4 (SW)', latDeg: '6', latMin: '25', latSec: '26.07', latDir: 'N', lngDeg: '3', lngMin: '23', lngSec: '9.36', lngDir: 'E' },
  ],
  UTM_31N_WGS84: [
    { pointNumber: '1', label: 'Corner 1 (NW)', easting: '542675.01', northing: '710130.59' },
    { pointNumber: '2', label: 'Corner 2 (NE)', easting: '542774.75', northing: '710134.97' },
    { pointNumber: '3', label: 'Corner 3 (SE)', easting: '542777.00', northing: '710085.12' },
    { pointNumber: '4', label: 'Corner 4 (SW)', easting: '542677.26', northing: '710080.73' },
  ],
  UTM_31N_MINNA: [
    { pointNumber: '1', label: 'Corner 1 (NW)', easting: '542675.01', northing: '710130.59' },
    { pointNumber: '2', label: 'Corner 2 (NE)', easting: '542774.75', northing: '710134.97' },
    { pointNumber: '3', label: 'Corner 3 (SE)', easting: '542777.00', northing: '710085.12' },
    { pointNumber: '4', label: 'Corner 4 (SW)', easting: '542677.26', northing: '710080.73' },
  ],
  UTM_32N_WGS84: [
    { pointNumber: '1', label: 'Corner 1 (NW)', easting: '325400.00', northing: '711200.00' },
    { pointNumber: '2', label: 'Corner 2 (NE)', easting: '325480.00', northing: '711200.00' },
    { pointNumber: '3', label: 'Corner 3 (SE)', easting: '325480.00', northing: '711120.00' },
    { pointNumber: '4', label: 'Corner 4 (SW)', easting: '325400.00', northing: '711120.00' },
  ],
  UTM_32N_MINNA: [
    { pointNumber: '1', label: 'Corner 1 (NW)', easting: '325400.00', northing: '711200.00' },
    { pointNumber: '2', label: 'Corner 2 (NE)', easting: '325480.00', northing: '711200.00' },
    { pointNumber: '3', label: 'Corner 3 (SE)', easting: '325480.00', northing: '711120.00' },
    { pointNumber: '4', label: 'Corner 4 (SW)', easting: '325400.00', northing: '711120.00' },
  ],
};

const SAMPLE_PRESETS: Record<number, Partial<CornerInput>[]> = {
  4: [
    { pointNumber: '1', label: 'Corner 1 (NW)', lat: '6.424359', lng: '3.385914', easting: '542675.01', northing: '710130.59' },
    { pointNumber: '2', label: 'Corner 2 (NE)', lat: '6.424398', lng: '3.386816', easting: '542774.75', northing: '710134.97' },
    { pointNumber: '3', label: 'Corner 3 (SE)', lat: '6.423947', lng: '3.386836', easting: '542777.00', northing: '710085.12' },
    { pointNumber: '4', label: 'Corner 4 (SW)', lat: '6.423908', lng: '3.385934', easting: '542677.26', northing: '710080.73' },
  ],
  6: [
    { pointNumber: '1', label: 'Boundary Pt 1 (NW)', lat: '6.424359', lng: '3.385914', easting: '542675.01', northing: '710130.59' },
    { pointNumber: '2', label: 'Boundary Pt 2 (N-Apex)', lat: '6.424650', lng: '3.386350', easting: '542723.40', northing: '710162.80' },
    { pointNumber: '3', label: 'Boundary Pt 3 (NE)', lat: '6.424398', lng: '3.386816', easting: '542774.75', northing: '710134.97' },
    { pointNumber: '4', label: 'Boundary Pt 4 (SE)', lat: '6.423947', lng: '3.386836', easting: '542777.00', northing: '710085.12' },
    { pointNumber: '5', label: 'Boundary Pt 5 (S-Apex)', lat: '6.423750', lng: '3.386370', easting: '542725.60', northing: '710063.20' },
    { pointNumber: '6', label: 'Boundary Pt 6 (SW)', lat: '6.423908', lng: '3.385934', easting: '542677.26', northing: '710080.73' },
  ],
  8: [
    { pointNumber: '1', label: 'Pt 1 (NW)', lat: '6.424359', lng: '3.385914', easting: '542675.01', northing: '710130.59' },
    { pointNumber: '2', label: 'Pt 2 (N1)', lat: '6.424550', lng: '3.386200', easting: '542706.70', northing: '710151.70' },
    { pointNumber: '3', label: 'Pt 3 (N2)', lat: '6.424580', lng: '3.386550', easting: '542745.40', northing: '710155.10' },
    { pointNumber: '4', label: 'Pt 4 (NE)', lat: '6.424398', lng: '3.386816', easting: '542774.75', northing: '710134.97' },
    { pointNumber: '5', label: 'Pt 5 (SE)', lat: '6.423947', lng: '3.386836', easting: '542777.00', northing: '710085.12' },
    { pointNumber: '6', label: 'Pt 6 (S1)', lat: '6.423800', lng: '3.386520', easting: '542742.10', northing: '710068.80' },
    { pointNumber: '7', label: 'Pt 7 (S2)', lat: '6.423780', lng: '3.386150', easting: '542701.20', northing: '710066.50' },
    { pointNumber: '8', label: 'Pt 8 (SW)', lat: '6.423908', lng: '3.385934', easting: '542677.26', northing: '710080.73' },
  ],
};

export default function InspectorNewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    project_type: 'Residential',
    description: '',
    status: 'ACTIVE',
    development_category: 'Highrise',
    estimated_project_value: '',
    number_of_floors: undefined,
    start_date: null,
    estimated_completion: null,

    client_name: '',
    client_contact: '',
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
    permit_status: 'Under Review',
    regulatory_authority: 'LASBCA',
    approval_date: undefined,
    permit_expiry_date: undefined,

    primary_use: '',
    proposed_use: '',
    site_area: '',
    gross_floor_area: '',
    building_height: '',
    structural_system: '',
    construction_method: '',
    project_priority: 'Normal',
  });

  // Category state
  const [selectedCategoryType, setSelectedCategoryType] = useState<string>('Highrise');
  const [customCategory, setCustomCategory] = useState<string>('');

  // Estimated Value N/A toggle state
  const [isEstimatedValueNA, setIsEstimatedValueNA] = useState<boolean>(false);

  // Floor Number dropdown state
  const [selectedFloorType, setSelectedFloorType] = useState<string>('1');
  const [customFloorNote, setCustomFloorNote] = useState<string>('');

  // Coordinates & Multi-Point Boundary state
  const [coordinateSystem, setCoordinateSystem] = useState<CoordinateSystem>('WGS84_DD');
  const [corners, setCorners] = useState<CornerInput[]>(DEFAULT_CORNERS);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionFeedback, setConversionFeedback] = useState<string | null>(null);

  // Operational zones
  const [zones, setZones] = useState<District[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDistricts({ active: 'true' })
      .then((data) => {
        if (!cancelled) setZones(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn("Could not load operational zones:", err);
      })
      .finally(() => {
        if (!cancelled) setZonesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        updated.lga = '';
      }
      return updated;
    });
  };

  // Corner Coordinate Handlers
  const handleCornerChange = (index: number, field: keyof CornerInput, value: any) => {
    setCorners(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddCorner = () => {
    setCorners(prev => {
      const nextNum = prev.length + 1;
      return [
        ...prev,
        {
          id: nextNum,
          pointNumber: String(nextNum),
          label: `Boundary Pt ${nextNum}`,
          lat: '',
          lng: '',
          easting: '',
          northing: '',
          latDeg: '',
          latMin: '',
          latSec: '',
          latDir: 'N',
          lngDeg: '',
          lngMin: '',
          lngSec: '',
          lngDir: 'E'
        }
      ];
    });
  };

  const handleRemoveCorner = (index: number) => {
    if (corners.length <= 3) return;
    setCorners(prev => prev.filter((_, i) => i !== index));
  };

  const handleApplyPresetPoints = (count: number) => {
    const sampleSet = SAMPLE_PRESETS[count];
    if (sampleSet && coordinateSystem === 'WGS84_DD') {
      setCorners(sampleSet.map((s, idx) => ({
        id: idx + 1,
        pointNumber: s.pointNumber || String(idx + 1),
        label: s.label || `Point ${idx + 1}`,
        lat: s.lat || '',
        lng: s.lng || '',
        easting: s.easting || '',
        northing: s.northing || '',
        latDeg: '',
        latMin: '',
        latSec: '',
        latDir: 'N',
        lngDeg: '',
        lngMin: '',
        lngSec: '',
        lngDir: 'E',
      })));
      setConversionResult(null);
      setConversionFeedback(`Loaded ${count}-point boundary survey polygon preset.`);
    } else {
      const newPoints: CornerInput[] = [];
      for (let i = 1; i <= count; i++) {
        const existing = corners[i - 1];
        if (existing) {
          newPoints.push(existing);
        } else {
          newPoints.push({
            id: i,
            pointNumber: String(i),
            label: `Boundary Pt ${i}`,
            lat: '',
            lng: '',
            easting: '',
            northing: '',
            latDeg: '',
            latMin: '',
            latSec: '',
            latDir: 'N',
            lngDeg: '',
            lngMin: '',
            lngSec: '',
            lngDir: 'E',
          });
        }
      }
      setCorners(newPoints);
      setConversionResult(null);
      setConversionFeedback(`Configured ${count} allowable boundary survey points.`);
    }
  };

  const handleApplySampleCorners = () => {
    const sampleSet = SAMPLE_LAGOS_CORNERS[coordinateSystem];
    if (sampleSet) {
      setCorners(sampleSet.map((s, idx) => ({
        id: idx + 1,
        pointNumber: s.pointNumber || String(idx + 1),
        label: s.label || `Corner ${idx + 1}`,
        lat: s.lat || '',
        lng: s.lng || '',
        easting: s.easting || '',
        northing: s.northing || '',
        latDeg: s.latDeg || '',
        latMin: s.latMin || '',
        latSec: s.latSec || '',
        latDir: s.latDir || 'N',
        lngDeg: s.lngDeg || '',
        lngMin: s.lngMin || '',
        lngSec: s.lngSec || '',
        lngDir: s.lngDir || 'E',
      })));
      setConversionResult(null);
      setConversionFeedback('Lagos survey boundary sample loaded. Click "Convert & Calculate Building Footprint" to verify.');
    }
  };

  const handleConvertCoordinates = async () => {
    setIsConverting(true);
    setConversionFeedback(null);
    setError(null);

    try {
      let result: ConversionResult;
      try {
        const apiResponse = await convertCoordinatesApi({
          system: coordinateSystem,
          corners: corners
        });
        result = apiResponse;
      } catch (backendErr) {
        result = convertCorners(coordinateSystem, corners);
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

      setConversionFeedback(`Successfully converted ${result.corners.length} boundary coordinates! Centroid at (${result.center.lat.toFixed(6)}, ${result.center.lng.toFixed(6)}) with footprint area of ${result.footprintAreaSqm.toLocaleString()} sqm.`);
    } catch (err: any) {
      console.error('Error during coordinate conversion:', err);
      setConversionFeedback(`Conversion failed: ${err.message || 'Please check coordinate inputs'}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!formData.name?.trim()) {
      setValidationError('Project / Site Name is required');
      return;
    }
    if (!formData.state?.trim()) {
      setValidationError('State is required');
      return;
    }
    if (!formData.lga?.trim()) {
      setValidationError('LGA / LCDA is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryToSubmit = selectedCategoryType === 'Others'
        ? (customCategory.trim() || 'Others')
        : (formData.development_category || selectedCategoryType);

      const payload = {
        ...formData,
        development_category: categoryToSubmit,
        is_estimated_value_na: isEstimatedValueNA,
        estimated_project_value: isEstimatedValueNA ? null : (formData.estimated_project_value || null),
        number_of_floors: selectedFloorType === 'Others'
          ? (parseInt(customFloorNote, 10) || undefined)
          : (formData.number_of_floors || parseInt(selectedFloorType, 10) || undefined),
        floor_number_custom: selectedFloorType === 'Others' ? (customFloorNote.trim() || 'Others') : undefined,
        status: formData.status || 'ACTIVE',
        coordinate_system: coordinateSystem,
        corner_coordinates: conversionResult || formData.corner_coordinates,
      };

      await createProject(payload);
      router.push('/inspector/dashboard/projects');
    } catch (err: any) {
      console.error("Error registering project:", err);
      setError(err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Failed to register project. Please verify inputs.');
      setIsSubmitting(false);
    }
  };

  const stateOptions = getStateOptions();
  const areaOptions = getAreaOptions(formData.state || '');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/inspector/dashboard/projects"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Back to Projects"
            >
              <ArrowLeft size={16} />
            </Link>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Field Inspector Site Registration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight">
            Register New Supervised Construction Site
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log an active development or newly discovered site within your operational zone for statutory field monitoring.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
        </div>
      )}

      {validationError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-amber-700">{validationError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: SITE IDENTITY & DEVELOPMENT CATEGORY */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="text-[#022C4F]" size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#022C4F]">
              Site Identity & Development Classification
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                Site / Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="e.g. Marina Commercial Tower Phase II"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                Project Type
              </label>
              <CustomSelect
                value={formData.project_type || 'Residential'}
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

            {/* Development Category */}
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                Development Category <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={selectedCategoryType}
                onChange={(val) => {
                  setSelectedCategoryType(val);
                  if (val !== 'Others') {
                    handleCustomSelectChange('development_category', val);
                  } else {
                    handleCustomSelectChange('development_category', customCategory || 'Others');
                  }
                }}
                options={DEVELOPMENT_CATEGORY_OPTIONS}
                placeholder="Select Development Category..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              {selectedCategoryType === 'Others' && (
                <div className="mt-2 animate-in fade-in">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      handleCustomSelectChange('development_category', e.target.value.trim() || 'Others');
                    }}
                    placeholder="Specify custom development category e.g. Special Engineering / Deep Foundation Enclave..."
                    className="w-full px-4 py-2 bg-blue-50/60 border border-blue-200 rounded-xl text-xs font-medium text-[#022C4F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                  />
                </div>
              )}
            </div>

            {/* Estimated Value with Not Applicable N/A option */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#022C4F]">
                  Estimated Value (₦)
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-blue-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEstimatedValueNA}
                    onChange={(e) => {
                      const na = e.target.checked;
                      setIsEstimatedValueNA(na);
                      if (na) {
                        setFormData(prev => ({
                          ...prev,
                          estimated_project_value: '',
                          is_estimated_value_na: true
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          is_estimated_value_na: false
                        }));
                      }
                    }}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span>Not Applicable (N/A)</span>
                </label>
              </div>
              {isEstimatedValueNA ? (
                <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 flex items-center justify-between">
                  <span>Not Applicable (N/A)</span>
                  <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">Exempt from numeric figure</span>
                </div>
              ) : (
                <input
                  type="number"
                  name="estimated_project_value"
                  value={formData.estimated_project_value?.toString() || ''}
                  onChange={handleChange}
                  placeholder="e.g. 5000000000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022C4F] text-sm"
                />
              )}
            </div>

            {/* Floor Number Dropdown with Others option */}
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                Number of Floors / Levels
              </label>
              <CustomSelect
                value={selectedFloorType}
                onChange={(val) => {
                  setSelectedFloorType(val);
                  if (val === 'Others') {
                    setFormData(prev => ({
                      ...prev,
                      number_of_floors: parseInt(customFloorNote, 10) || undefined,
                      floor_number_custom: customFloorNote || 'Others'
                    }));
                  } else {
                    const parsed = parseInt(val, 10);
                    setFormData(prev => ({
                      ...prev,
                      number_of_floors: isNaN(parsed) ? undefined : parsed,
                      floor_number_custom: val
                    }));
                  }
                }}
                options={FLOOR_NUMBER_OPTIONS}
                placeholder="Select number of floors..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              {selectedFloorType === 'Others' && (
                <div className="mt-2 animate-in fade-in">
                  <input
                    type="text"
                    value={customFloorNote}
                    onChange={(e) => {
                      setCustomFloorNote(e.target.value);
                      const parsed = parseInt(e.target.value, 10);
                      setFormData(prev => ({
                        ...prev,
                        number_of_floors: isNaN(parsed) ? undefined : parsed,
                        floor_number_custom: e.target.value
                      }));
                    }}
                    placeholder="Specify custom floor count e.g. 2 Basements + 34 Storeys + Helipad"
                    className="w-full px-4 py-2 bg-blue-50/60 border border-blue-200 rounded-xl text-xs font-medium text-[#022C4F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                Regulatory Status
              </label>
              <CustomSelect
                value={formData.status || 'ACTIVE'}
                onChange={(val) => handleCustomSelectChange('status', val)}
                options={[
                  { value: 'ACTIVE', label: 'ACTIVE (Under Construction)' },
                  { value: 'PLANNING', label: 'PLANNING (Site Mobilization)' },
                  { value: 'APPROVED', label: 'APPROVED' },
                  { value: 'SUSPENDED', label: 'SUSPENDED (Stop-Work Order Issued)' },
                ]}
                placeholder="Select Status..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Site / Construction Notes</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Field observations, structural stage reached, piling details, or contractor details observed on site..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none resize-none"
            />
          </div>
        </div>

        {/* SECTION 2: DEVELOPER & OWNER INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Users className="text-[#022C4F]" size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#022C4F]">
              Developer & Ownership Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Developer Company / Organization</label>
              <input
                type="text"
                name="developer_organization"
                value={formData.developer_organization || ''}
                onChange={handleChange}
                placeholder="e.g. Apex Horizon Realty Ltd"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Developer / Site Contact Name</label>
              <input
                type="text"
                name="developer_name"
                value={formData.developer_name || ''}
                onChange={handleChange}
                placeholder="e.g. Engr. B. Adeleke"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Developer Email</label>
              <input
                type="email"
                name="developer_email"
                value={formData.developer_email || ''}
                onChange={handleChange}
                placeholder="site@developer.ng"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Developer Phone Number</label>
              <input
                type="tel"
                name="developer_phone"
                value={formData.developer_phone || ''}
                onChange={handleChange}
                placeholder="+234 803 000 0000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: LOCATION, OPERATIONAL ZONES & MULTI-POINT COORDINATES */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="text-[#022C4F]" size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#022C4F]">
              Physical Location & Survey Coordinates
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Site Physical Address</label>
            <input
              type="text"
              name="site_address"
              value={formData.site_address || ''}
              onChange={handleChange}
              placeholder="e.g. Plot 15, Water Corporation Road, Oniru / Victoria Island, Lagos"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
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
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
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
            </div>

            {/* Operational Zones selection list */}
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                Operational Zone (Government Jurisdiction)
              </label>
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
            </div>
          </div>

          {/* Optional Form Fields: Plot Number, Block, Title Ref */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Plot Number (Optional)</label>
              <input
                type="text"
                name="plot_number"
                value={formData.plot_number || ''}
                onChange={handleChange}
                placeholder="e.g. Plot 12"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Block / Cadastral Parcel (Optional)</label>
              <input
                type="text"
                name="block_number"
                value={formData.block_number || ''}
                onChange={handleChange}
                placeholder="e.g. Block VII"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Land Title Reference (Optional)</label>
              <input
                type="text"
                name="land_title_reference"
                value={formData.land_title_reference || ''}
                onChange={handleChange}
                placeholder="e.g. C of O No. 24/24/2019"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022C4F] outline-none"
              />
            </div>
          </div>

          {/* MULTI-POINT SURVEY BOUNDARY ENGINE */}
          <div className="p-6 bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/50 border border-blue-200 rounded-2xl shadow-sm mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-200/60 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#022C4F]" />
                  <h4 className="text-base font-bold text-[#022C4F]">
                    Multi-Point Boundary Survey Coordinates & Conversion Engine
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {corners.length} Survey Points
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Supports 4, 6, 8, 12, or any number of boundary survey coordinates beyond 4 points. The engine automatically converts coordinates to standard WGS84, calculates the centroid, and computes the exact site footprint area.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Quick Presets */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 px-1.5 uppercase">Presets:</span>
                  {[4, 6, 8, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleApplyPresetPoints(num)}
                      className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                        corners.length === num
                          ? 'bg-[#022C4F] text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {num} Pts
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleApplySampleCorners}
                  className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
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

            {/* Corners Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {corners.map((corner, idx) => (
                <div
                  key={corner.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-[11px] font-bold text-[#022C4F] uppercase tracking-wide whitespace-nowrap">
                        Point / Pillar #:
                      </label>
                      <input
                        type="text"
                        value={corner.label || ''}
                        onChange={(e) => handleCornerChange(idx, 'label', e.target.value)}
                        placeholder={`Corner ${corner.pointNumber || idx + 1}`}
                        className="w-full max-w-[210px] px-2.5 py-1 bg-blue-50/70 border border-blue-200 rounded-lg text-xs font-bold text-[#022C4F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                        Pt #{corner.pointNumber || idx + 1}
                      </span>
                      {corners.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCorner(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Remove this boundary point"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

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

            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={handleAddCorner}
                className="px-3.5 py-1.5 bg-white border border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Plus size={13} />
                Add Boundary Point / Pillar
              </button>
            </div>

            {/* Convert Action */}
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
                    Convert & Calculate Site Footprint
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

            {conversionResult && (
              <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                <SurveyBoundaryMapPreview
                  corners={conversionResult.corners}
                  center={conversionResult.center}
                  footprintAreaSqm={conversionResult.footprintAreaSqm}
                  perimeterMeters={conversionResult.perimeterMeters}
                  coordinateSystem={conversionResult.system}
                  googleMapsUrl={conversionResult.googleMapsUrl}
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Link
            href="/inspector/dashboard/projects"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Registering Site...
              </>
            ) : (
              <>
                <Save size={14} />
                Save &amp; Register Site
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
