"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Cloud,
  UploadCloud,
  DownloadCloud,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sparkles,
  Layers,
  Cpu,
  RefreshCw,
  Sliders,
  Database,
  Eye,
  Send,
  Check,
  AlertOctagon,
  FileSpreadsheet,
  Info,
  Box,
  Search,
  X
} from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import PunditWaveformViewer from "@/components/dashboard/digital-eye/PunditWaveformViewer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import {
  PunditTest,
  getPunditTests,
  createPunditTest,
  uploadSensorFile,
  BIMStructuralElement,
  getBIMStructuralElements,
  FieldDeviceRecord,
  getFieldDevices,
  linkPunditTestToElement,
  updatePunditTest,
  importBIMElementsFromIFC,
} from "@/services/digitalEye";

const CRITICAL_STRENGTH_THRESHOLD_MPA = 25.0; // 25 MPa Statutory Concrete Acceptance Rule
// E.C.S calibration curve — identical to the backend engine
// (apps/reports/ndt_reports.py): fcu = 8.961·V − 7.97 N/mm², valid 2.0–5.0 km/s.
const ECS_SLOPE = 8.961;
const ECS_INTERCEPT = -7.97;
const ecsFromVelocityMs = (velocityMs: number): number | null => {
  const vKmS = velocityMs / 1000;
  if (vKmS < 2.0 || vKmS > 5.0) return null;
  return Number((ECS_SLOPE * vKmS + ECS_INTERCEPT).toFixed(1));
};

export default function DataCollectionPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'CLOUD_RECEIVER' | 'MANUAL_IMPORT' | 'PRESETS'>('CLOUD_RECEIVER');
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [devices, setDevices] = useState<FieldDeviceRecord[]>([]);
  const [activeTest, setActiveTest] = useState<PunditTest | null>(null);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState<boolean>(true);
  const [registryError, setRegistryError] = useState<string | null>(null);
  const [isSyncingDevice, setIsSyncingDevice] = useState<boolean>(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState<boolean>(false);
  const [isCreateFindingOpen, setIsCreateFindingOpen] = useState<boolean>(false);

  // BIM model import (real structural elements from the project's IFC file)
  const [ifcFile, setIfcFile] = useState<File | null>(null);
  const [isImportingIfc, setIsImportingIfc] = useState<boolean>(false);

  // Anchor for scrolling the waveform viewer into view when a registry row's
  // "Oscillogram" button is clicked (the viewer sits above the table).
  const viewerSectionRef = useRef<HTMLDivElement>(null);

  // Manual Form States (Raw inputs only; outputs are engine-locked)
  const [formStationRef, setFormStationRef] = useState<string>("");
  const [formElementName, setFormElementName] = useState<string>("");
  const [formLocation, setFormLocation] = useState<string>("");
  const [formTransducerType, setFormTransducerType] = useState<'DIRECT' | 'SEMI_DIRECT' | 'INDIRECT'>('DIRECT');
  const [formTransducerFreq, setFormTransducerFreq] = useState<number>(54);
  // Measurements start EMPTY — never prefilled. A preset default here would be
  // a fabricated reading ingested into the statutory registry.
  const [formPathLengthMm, setFormPathLengthMm] = useState<number>(0);
  const [formTransitTimeUs, setFormTransitTimeUs] = useState<number>(0);
  const [formOperator, setFormOperator] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  // Test-type-specific inputs (backend PUNDITTest.TEST_TYPES).
  const [formTestType, setFormTestType] = useState<'pulse_velocity' | 'crack_depth' | 'surface_quality'>('pulse_velocity');
  const [formCrackPathLengthMm, setFormCrackPathLengthMm] = useState<number>(0);
  const [formCrackPulseTimeUs, setFormCrackPulseTimeUs] = useState<number>(0);
  const [formUncrackedPulseTimeUs, setFormUncrackedPulseTimeUs] = useState<number>(0);
  const [formSurfaceCondition, setFormSurfaceCondition] = useState<string>("");
  const [formSurfaceTemperatureC, setFormSurfaceTemperatureC] = useState<number>(0);
  // Photo / raw-export attachments uploaded with the manual record.
  const [formAttachments, setFormAttachments] = useState<File[]>([]);
  // Registry search & filters (server-side ?search= / ?test_type= / ?quality_grade=).
  const [registrySearch, setRegistrySearch] = useState<string>("");
  const [registryTypeFilter, setRegistryTypeFilter] = useState<string>("");
  const [registryGradeFilter, setRegistryGradeFilter] = useState<string>("");

  // ---- Record correction (edit) modal state ----
  // Editing re-sends the recorded field measurements via PATCH; the analysis
  // outputs (velocity, grade, E.C.S, crack depth) stay read-only and are
  // re-derived server-side from the corrected inputs.
  const [editingTest, setEditingTest] = useState<PunditTest | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<{
    structural_element: string;
    test_location: string;
    path_length_mm: string;
    pulse_time_us: string;
    crack_path_length_mm: string;
    crack_pulse_time_us: string;
    uncracked_pulse_time_us: string;
    surface_condition: string;
    surface_temperature_c: string;
    transducer_frequency_khz: string;
    transducer_type: 'DIRECT' | 'SEMI_DIRECT' | 'INDIRECT' | '';
    operator_name: string;
    notes: string;
  }>({
    structural_element: '',
    test_location: '',
    path_length_mm: '',
    pulse_time_us: '',
    crack_path_length_mm: '',
    crack_pulse_time_us: '',
    uncracked_pulse_time_us: '',
    surface_condition: '',
    surface_temperature_c: '',
    transducer_frequency_khz: '',
    transducer_type: '',
    operator_name: '',
    notes: '',
  });

  const openEditModal = (t: PunditTest) => {
    setEditingTest(t);
    setEditForm({
      structural_element: t.structural_element_name || '',
      test_location: t.test_location || '',
      path_length_mm: t.path_length_mm ? String(t.path_length_mm) : '',
      pulse_time_us: t.transit_time_us ? String(t.transit_time_us) : '',
      crack_path_length_mm: t.crack_path_length_mm ? String(t.crack_path_length_mm) : '',
      crack_pulse_time_us: t.crack_pulse_time_us ? String(t.crack_pulse_time_us) : '',
      uncracked_pulse_time_us: t.uncracked_pulse_time_us ? String(t.uncracked_pulse_time_us) : '',
      surface_condition: t.surface_condition || '',
      surface_temperature_c: t.surface_temperature_c != null ? String(t.surface_temperature_c) : '',
      transducer_frequency_khz: t.transducer_frequency_khz ? String(t.transducer_frequency_khz) : '',
      transducer_type: t.transducer_type || '',
      operator_name: t.operator_name || '',
      notes: t.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTest) return;
    setIsSavingEdit(true);
    try {
      // Send only numeric fields that were actually entered — an empty input
      // must not be coerced to 0 (that would fabricate a measurement).
      const num = (v: string): number | undefined => {
        const trimmed = v.trim();
        if (trimmed === '') return undefined;
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : undefined;
      };
      const patch: Record<string, unknown> = {
        structural_element: editForm.structural_element.trim() || undefined,
        test_location: editForm.test_location.trim() || undefined,
        transducer_type: editForm.transducer_type || undefined,
        transducer_frequency_khz: num(editForm.transducer_frequency_khz),
        path_length_mm: num(editForm.path_length_mm),
        pulse_time_us: num(editForm.pulse_time_us),
        crack_path_length_mm: num(editForm.crack_path_length_mm),
        crack_pulse_time_us: num(editForm.crack_pulse_time_us),
        uncracked_pulse_time_us: num(editForm.uncracked_pulse_time_us),
        surface_condition: editForm.surface_condition.trim() || undefined,
        surface_temperature_c: num(editForm.surface_temperature_c),
        operator_name: editForm.operator_name.trim() || undefined,
        notes: editForm.notes.trim() || undefined,
      };
      Object.keys(patch).forEach(k => patch[k] === undefined && delete patch[k]);
      const updated = await updatePunditTest(editingTest.id, patch as any);
      setTests(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      if (activeTest?.id === updated.id) setActiveTest(updated);
      setEditingTest(null);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Corrected ${updated.test_reference} — analysis outputs re-derived server-side.`, type: "success" }
      }));
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `⚠️ ${err?.response?.data?.detail || err?.message || 'Could not save the correction.'}`, type: "error" }
      }));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;
  const registeredDevice = devices.find(d => d.is_active) || devices[0] || null;

  // Presets: member-type starting points for the instrument configuration and
  // a typical path-length range ONLY. The transit time is a MEASUREMENT — it is
  // never preset, and the test location must be entered by the operator.
  const applyPreset = (type: 'THIN_PLATE' | 'ROBUST_BRIDGE' | 'MASS_FOUNDATION') => {
    if (type === 'THIN_PLATE') {
      setFormPathLengthMm(250); // 200 - 300 mm
      setFormTransducerFreq(54);
      setFormTransducerType('DIRECT');
    } else if (type === 'ROBUST_BRIDGE') {
      setFormPathLengthMm(220); // 150 - 230 mm
      setFormTransducerFreq(54);
      setFormTransducerType('DIRECT');
    } else {
      setFormPathLengthMm(600); // Heavy mass concrete
      setFormTransducerFreq(25); // 25 kHz transducer for mass foundation
      setFormTransducerType('DIRECT');
    }
    setFormTransitTimeUs(0); // Operator MUST enter the measured transit time.
  };

  // Locked Server-Engine Computed Physics (V = L / t; E.C.S via the platform calibration curve)
  const computedVelocity = formTransitTimeUs > 0 ? Math.round(formPathLengthMm / (formTransitTimeUs / 1000)) : 0; // m/s
  const computedFcu = ecsFromVelocityMs(computedVelocity);
  const isStrengthCompliant = computedFcu != null && computedFcu >= CRITICAL_STRENGTH_THRESHOLD_MPA;

  // Crack-depth preview (BS 1881-203 time-difference method) — mirrors the
  // server's PUNDITAdapter.compute_crack_depth_mm exactly:
  // d = L/2 · sqrt((t_cracked / t_uncracked)² − 1). Null until all three
  // measurements are entered; a cracked reading not slower than the uncracked
  // one honestly yields no measurable depth.
  const computedCrackDepthMm =
    formCrackPathLengthMm > 0 && formCrackPulseTimeUs > 0 && formUncrackedPulseTimeUs > 0
      ? (formCrackPulseTimeUs > formUncrackedPulseTimeUs
          ? Math.round((formCrackPathLengthMm / 2) * Math.sqrt((formCrackPulseTimeUs / formUncrackedPulseTimeUs) ** 2 - 1) * 10) / 10
          : 0)
      : null;

  const refreshRegistry = async () => {
    setIsLoadingRegistry(true);
    setRegistryError(null);
    try {
      const [fetchedTests, fetchedElements, fetchedDevices] = await Promise.all([
        getPunditTests({
          project: selectedProjectId || undefined,
          search: registrySearch || undefined,
          test_type: (registryTypeFilter || undefined) as any,
          quality_grade: registryGradeFilter || undefined,
        }),
        getBIMStructuralElements({ project: selectedProjectId || undefined }),
        getFieldDevices({ device_type: 'pundit', project: selectedProjectId || undefined }),
      ]);
      setTests(fetchedTests);
      setElements(fetchedElements);
      setDevices(fetchedDevices);
      setActiveTest(prev => prev && fetchedTests.some(t => t.id === prev.id)
        ? fetchedTests.find(t => t.id === prev.id)! : (fetchedTests[0] || null));
    } catch (err: any) {
      setTests([]);
      setRegistryError(err?.response?.data?.detail || err?.message || 'Failed to load the telemetry registry from the server.');
    } finally {
      setIsLoadingRegistry(false);
    }
  };

  useEffect(() => {
    refreshRegistry();
  }, [selectedProjectId, selectedElementId, registrySearch, registryTypeFilter, registryGradeFilter]);

  const reportCreateError = (err: any) => {
    const detail = err?.response?.data?.errors
      ? Object.entries(err.response.data.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' • ')
      : (err?.response?.data?.detail || err?.message || 'The server rejected this record.');
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `⚠️ Record rejected: ${detail}`, type: "error" }
    }));
  };

  // Import real structural elements (IFC GUIDs, levels, coordinates) from the
  // project's design model into the BIM element registry (dropdown source).
  const handleIfcImport = () => {
    if (!ifcFile) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: '⚠️ Choose the project .ifc or .rvt model file first.', type: "error" }
      }));
      return;
    }
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: '⚠️ Select a project before importing its BIM model.', type: "error" }
      }));
      return;
    }
    setIsImportingIfc(true);
    importBIMElementsFromIFC(selectedProjectId, ifcFile)
      .then((res) => {
        const summary = res
          ? `${res.mappings_created} new element(s) imported${res.mappings_updated ? `, ${res.mappings_updated} updated` : ''} (of ${res.elements_extracted} extracted from ${res.file}${res.translated_from_rvt ? ', translated from Revit via Autodesk' : ''}).`
          : 'Import completed.';
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            message: (!res || res.elements_extracted === 0)
              ? `⚠️ No structural elements (columns, slabs, walls…) were found in ${ifcFile.name}. Check that this is the structural IFC model.`
              : `🏗️ BIM import complete: ${summary}`,
            type: (!res || res.elements_extracted === 0) ? "error" : "success"
          }
        }));
        setFormElementName(''); // Element options just changed — re-select from the real list.
        refreshRegistry();
      })
      .catch((err: any) => window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `⚠️ IFC import failed: ${err?.response?.data?.detail || err?.message || 'The server could not process this model.'}`, type: "error" }
      })))
      .finally(() => {
        setIsImportingIfc(false);
        setIfcFile(null);
      });
  };

  // Cloud Telemetry Ingestion — logs the entered measurements straight into the
  // regulatory registry through the real PUNDIT tests endpoint.
  const handleCloudStreamSync = () => {
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: '⚠️ Select a project before ingesting telemetry.', type: "error" }
      }));
      return;
    }
    if (formPathLengthMm <= 0 || formTransitTimeUs <= 0) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: '⚠️ Enter the measured Acoustic Path (L) and Transit Time (t) — measurements cannot be blank or zero.', type: "error" }
      }));
      return;
    }
    setIsSyncingDevice(true);
    createPunditTest({
      project: selectedProjectId,
      test_type: 'pulse_velocity',
      structural_element: formElementName || selectedElement?.name || undefined,
      transducer_frequency_khz: formTransducerFreq,
      transducer_type: formTransducerType,
      path_length_mm: formPathLengthMm,
      pulse_time_us: formTransitTimeUs,
      notes: 'Ingested via PUNDIT Cloud Telemetry Receiver.',
      ...(registeredDevice ? { device: registeredDevice.id } : {}),
    }).then((created) => {
      setTests(prev => [created, ...prev]);
      setActiveTest(created);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: `☁️ Cloud Receiver: Ingested ${created.test_reference}${created.pulse_velocity_ms ? ` (${created.pulse_velocity_ms.toLocaleString()} m/s${created.estimated_compressive_strength_mpa != null ? `, ${created.estimated_compressive_strength_mpa.toFixed(1)} MPa` : ''})` : ''}.`,
          type: "success"
        }
      }));
    }).catch(reportCreateError).finally(() => setIsSyncingDevice(false));
  };

  // Manual Offline Import Submission (Anti-Doctoring Protected)
  const handleManualImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: '⚠️ Select a project before submitting a manual record.', type: "error" }
      }));
      return;
    }
    if (formTestType === 'crack_depth') {
      if (formCrackPathLengthMm <= 0 || formCrackPulseTimeUs <= 0 || formUncrackedPulseTimeUs <= 0) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: '⚠️ Enter all three crack-depth measurements — transducer spacing L, cracked transit time t_c and uncracked transit time t_0.', type: "error" }
        }));
        return;
      }
    } else if (formPathLengthMm <= 0 || formTransitTimeUs <= 0) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: '⚠️ Enter the measured Path Length (L) and Transit Time (t) — measurements cannot be blank or zero.', type: "error" }
      }));
      return;
    }
    setIsSubmittingManual(true);

    try {
      // Attachments first: upload each artifact through the checksummed
      // sensor-file endpoint, then link the ids to the new test record.
      let fileIds: string[] = [];
      if (formAttachments.length > 0) {
        const uploadedIds = await Promise.all(formAttachments.map(f =>
          uploadSensorFile(f, f.type.startsWith('image/') ? 'photo' : 'pundit_raw', `Field attachment for ${formStationRef || 'manual PUNDIT record'}`)
        ));
        fileIds = uploadedIds.map(u => u.id);
      }

      const created = await createPunditTest({
        project: selectedProjectId,
        test_type: formTestType,
        structural_element: formElementName || selectedElement?.name || undefined,
        transducer_frequency_khz: formTransducerFreq,
        transducer_type: formTransducerType,
        test_location: formLocation || undefined,
        ...(formTestType === 'crack_depth' ? {
          crack_path_length_mm: formCrackPathLengthMm,
          crack_pulse_time_us: formCrackPulseTimeUs,
          uncracked_pulse_time_us: formUncrackedPulseTimeUs,
        } : {
          path_length_mm: formPathLengthMm,
          pulse_time_us: formTransitTimeUs,
        }),
        ...(formTestType === 'surface_quality' ? {
          surface_condition: formSurfaceCondition || undefined,
          surface_temperature_c: formSurfaceTemperatureC > 0 ? formSurfaceTemperatureC : undefined,
        } : {}),
        operator_name: formOperator || undefined,
        notes: `[MANUAL_FIELD_ENTRY${formStationRef ? ` — Station ${formStationRef}` : ''}] ${formNotes}`,
        ...(registeredDevice ? { device: registeredDevice.id } : {}),
        ...(fileIds.length > 0 ? { file_ids: fileIds } : {}),
      });

      setTests(prev => [created, ...prev]);
      setActiveTest(created);
      setFormStationRef("");
      setFormAttachments([]);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: formTestType === 'crack_depth'
            ? `📝 Record ${created.test_reference} registered. Server-computed crack depth: ${created.estimated_crack_depth_mm != null ? `${created.estimated_crack_depth_mm.toFixed(1)} mm` : 'analysis pending'}.`
            : `📝 Record ${created.test_reference} registered. Server-computed: ${created.pulse_velocity_ms ? `${created.pulse_velocity_ms.toLocaleString()} m/s` : 'analysis pending'}${created.estimated_compressive_strength_mpa != null ? ` (${created.estimated_compressive_strength_mpa.toFixed(1)} MPa)` : ''}.`,
          type: "success"
        }
      }));
    } catch (err: any) {
      reportCreateError(err);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-16 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: Data Collection & Direct Cloud Receiver Hub"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
        onNewFindingClick={() => setIsCreateFindingOpen(true)}
      />

      {/* Hero Banner: Technical Architecture & Anti-Doctoring Mandate */}
      <div className="bg-gradient-to-r from-[#022C4F] via-[#033E6E] to-[#0A66C2] rounded-2xl p-6 text-white shadow-xl mb-8 border border-blue-400/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-400/20 text-sky-200 border border-sky-400/30 flex items-center gap-1">
                <Cloud size={11} />
                <span>Dual-Pipeline Ingestion Engine</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                <Lock size={11} />
                <span>Anti-Doctoring Calculations Locked</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                25.0 MPa Statutory Benchmark
              </span>
            </div>
            
            <h2 className="text-xl font-black tracking-tight text-white">
              NDT Field Data Collection & Government Telemetry Receiver
            </h2>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              To guarantee absolute data integrity and eliminate human falsification, the platform automatically captures ultrasonic acoustic transit times (t) directly from on-site transducers. In offline field conditions, manual input is restricted so that field inspectors input only raw physical geometry, while calculations and compliance grades remain cryptographically locked server-side.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleCloudStreamSync}
              disabled={isSyncingDevice}
              className="px-5 py-3 bg-white hover:bg-slate-100 text-[#022C4F] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <UploadCloud size={16} className={isSyncingDevice ? "animate-bounce text-blue-600" : "text-blue-600"} />
              <span>{isSyncingDevice ? "Ingesting Stream..." : "Ingest Telemetry from Field Device"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* BIM Model Import: real structural elements (IFC GUIDs) for the element dropdowns */}
      {selectedProjectId && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                <Box size={16} className="text-amber-500" />
                <span>Import Structural Elements from BIM Model (IFC / Revit RVT)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload the project&apos;s IFC design model — or its Revit (.rvt) model, translated to IFC via Autodesk (may take several minutes for large models) — to populate the Target Structural Element dropdown with its real elements (columns, slabs, walls — GUIDs, levels, coordinates).{' '}
                <span className="font-semibold text-gray-700">
                  {elements.length > 0
                    ? `${elements.length} BIM element(s) currently linked to this project.`
                    : 'No BIM elements are linked to this project yet — the element dropdown is empty until a model is imported.'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="cursor-pointer">
                <span className="px-3 py-2 border border-gray-200 hover:bg-slate-100 rounded-lg text-xs font-mono text-gray-700 inline-block truncate max-w-[220px]">
                  {ifcFile ? ifcFile.name : 'Choose .ifc / .rvt file…'}
                </span>
                <input
                  type="file"
                  accept=".ifc,.rvt"
                  className="hidden"
                  onChange={(e) => {
                    setIfcFile(e.target.files?.[0] || null);
                    e.target.value = ''; // allow re-picking the same file
                  }}
                />
              </label>
              <button
                onClick={handleIfcImport}
                disabled={isImportingIfc}
                className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <UploadCloud size={14} className={isImportingIfc ? "animate-bounce" : ""} />
                <span>{isImportingIfc ? "Importing Model…" : "Import Elements"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Structural Thickness & Transit Time Technical Presets Guide */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
              <Sliders size={16} className="text-amber-500" />
              <span>Standard Structural Element Calibration Presets</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Calibrated physical variable ranges for thin plate members vs robust bridge structures
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            Core Variable: Transit Time (t)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Preset 1: Thin Plate Member */}
          <div 
            onClick={() => applyPreset('THIN_PLATE')}
            className="p-4 rounded-xl border-2 border-sky-100 bg-sky-50/30 hover:border-sky-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-sky-900">Standard Thin Plate Members</span>
              <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                Slabs &amp; Walls
              </span>
            </div>
            <div className="text-xs space-y-1 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Thickness (L):</span>
                <strong className="text-sky-700">200 – 300 mm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transit Time (t):</span>
                <strong className="text-sky-700">100 – 120 µs</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transducer:</span>
                <span className="text-gray-900">54 kHz (Direct)</span>
              </div>
            </div>
            <button className="w-full py-1.5 bg-sky-600 group-hover:bg-sky-500 text-white rounded-lg text-xs font-bold mt-2 transition-colors">
              Apply Thin Plate Preset
            </button>
          </div>

          {/* Preset 2: Robust Bridge Structure */}
          <div 
            onClick={() => applyPreset('ROBUST_BRIDGE')}
            className="p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/30 hover:border-indigo-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-900">Robust Infrastructure &amp; Bridges</span>
              <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                Bridges / Girders
              </span>
            </div>
            <div className="text-xs space-y-1 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Thickness (L):</span>
                <strong className="text-indigo-700">150 – 230 mm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transit Time (t):</span>
                <strong className="text-indigo-700">45 – 65 µs</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transducer:</span>
                <span className="text-gray-900">54 / 150 kHz</span>
              </div>
            </div>
            <button className="w-full py-1.5 bg-indigo-600 group-hover:bg-indigo-500 text-white rounded-lg text-xs font-bold mt-2 transition-colors">
              Apply Bridge Preset
            </button>
          </div>

          {/* Preset 3: Deep Foundation / Mass Concrete */}
          <div 
            onClick={() => applyPreset('MASS_FOUNDATION')}
            className="p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/30 hover:border-emerald-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-900">Deep Foundations &amp; Mass Concrete</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Bored Piles
              </span>
            </div>
            <div className="text-xs space-y-1 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Thickness (L):</span>
                <strong className="text-emerald-700">500 – 1200 mm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transit Time (t):</span>
                <strong className="text-emerald-700">120 – 280 µs</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transducer:</span>
                <span className="text-emerald-700 font-bold">25 kHz (Low Attenuation)</span>
              </div>
            </div>
            <button className="w-full py-1.5 bg-emerald-600 group-hover:bg-emerald-500 text-white rounded-lg text-xs font-bold mt-2 transition-colors">
              Apply 25 kHz Foundation Preset
            </button>
          </div>

        </div>
      </div>

      {/* Main Dual Ingestion Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Col (8 Spans): Ingestion Form & Anti-Doctoring Engine */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 bg-gray-50/80 px-6 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('CLOUD_RECEIVER')}
              className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'CLOUD_RECEIVER'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Radio size={14} className={activeTab === 'CLOUD_RECEIVER' ? 'text-blue-600 animate-pulse' : ''} />
              <span>Live Cloud Telemetry Ingestion</span>
            </button>

            <button
              onClick={() => setActiveTab('MANUAL_IMPORT')}
              className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'MANUAL_IMPORT'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileSpreadsheet size={14} />
              <span>Offline Manual Import (Anti-Doctoring Protected)</span>
            </button>
          </div>

          {/* Tab 1: Cloud Receiver Live Hardware Listener */}
          {activeTab === 'CLOUD_RECEIVER' && (
            <div className="p-6 space-y-6">
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-3 w-3 rounded-full ${registeredDevice?.status === 'online' ? 'bg-emerald-400 animate-ping' : registeredDevice ? 'bg-amber-400' : 'bg-slate-500'}`}></span>
                    <span className={`font-mono text-xs font-bold ${registeredDevice?.status === 'online' ? 'text-emerald-300' : registeredDevice ? 'text-amber-300' : 'text-slate-300'}`}>
                      {registeredDevice?.status === 'online'
                        ? 'ON-SITE HARDWARE GATEWAY LISTENER ACTIVE'
                        : registeredDevice
                          ? `REGISTERED DEVICE: ${registeredDevice.status_display.toUpperCase()}`
                          : 'NO PUNDIT DEVICE REGISTERED FOR THIS PROJECT'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Device ID: {registeredDevice ? registeredDevice.device_id : '—'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-slate-800 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Model:</span>
                    <span className="text-sky-400 font-bold">{registeredDevice ? (registeredDevice.model || registeredDevice.name || '—') : '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Battery:</span>
                    <span className={`${registeredDevice?.battery_level != null && registeredDevice.battery_level > 20 ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>
                      {registeredDevice?.battery_level != null ? `${registeredDevice.battery_level}%` : 'Not reported'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Last Telemetry:</span>
                    <span className="text-sky-400 font-bold">
                      {registeredDevice?.last_seen ? new Date(registeredDevice.last_seen).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Calibration:</span>
                    <span className={`${registeredDevice?.calibration_date ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>
                      {registeredDevice?.calibration_date || 'Not recorded'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-gray-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#022C4F] flex items-center gap-2">
                  <Cloud size={14} className="text-blue-600" />
                  <span>Stream Incoming Test Station Telemetry</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Target Structural Element</label>
                    {elements.length > 0 ? (
                      <select
                        value={formElementName}
                        onChange={(e) => setFormElementName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                      >
                        <option value="">— Select target element —</option>
                        {elements.map(el => (
                          <option key={el.id} value={el.name}>
                            {el.name}{el.level ? ` — ${el.level}` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. COL-C24 (no BIM elements imported yet)"
                        value={formElementName}
                        onChange={(e) => setFormElementName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Transducer Frequency</label>
                    <select
                      value={formTransducerFreq}
                      onChange={(e) => setFormTransducerFreq(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                    >
                      <option value={25}>25 kHz (Mass Concrete / Deep Foundations / Long Paths)</option>
                      <option value={54}>54 kHz (Standard Structural Concrete)</option>
                      <option value={150}>150 kHz (High Precision Mortar / Core)</option>
                      <option value={250}>250 kHz (Micro-Crack Depth Measurement)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Transducer Arrangement (BS 1881-203)</label>
                    <select
                      value={formTransducerType}
                      onChange={(e) => setFormTransducerType(e.target.value as 'DIRECT' | 'SEMI_DIRECT' | 'INDIRECT')}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                    >
                      <option value="DIRECT">Direct Transmission (Face-to-Face)</option>
                      <option value="SEMI_DIRECT">Semi-Direct Transmission</option>
                      <option value="INDIRECT">Indirect (Surface) Transmission</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Acoustic Path Length L (mm)</label>
                    <input
                      type="number"
                      value={formPathLengthMm || ''}
                      onChange={(e) => setFormPathLengthMm(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Measured Transit Time t (µs) [Variable]</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formTransitTimeUs || ''}
                      onChange={(e) => setFormTransitTimeUs(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCloudStreamSync}
                  disabled={isSyncingDevice}
                  className="w-full py-3 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud size={15} className={isSyncingDevice ? "animate-bounce" : ""} />
                  <span>{isSyncingDevice ? "Streaming Telemetry to Government Dashboard..." : "Ingest & Log Direct to Regulatory Registry"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Manual Offline Field Entry Form (Anti-Doctoring Protected) */}
          {activeTab === 'MANUAL_IMPORT' && (
            <form onSubmit={handleManualImportSubmit} className="p-6 space-y-6">
              
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <Lock size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Anti-Doctoring Compliance Lock Active:</span>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Field inspectors are restricted to entering verified physical test measurements only. Calculated Pulse Velocity (V), Characteristic Compressive Strength (fcu), and Statutory Pass/Fail classification are computed server-side and cannot be manually altered.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Station Reference Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UPV-FLD-2026-091"
                    value={formStationRef}
                    onChange={(e) => setFormStationRef(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Target Structural Element</label>
                  {elements.length > 0 ? (
                    <select
                      value={formElementName}
                      onChange={(e) => setFormElementName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                    >
                      <option value="">— Select target element —</option>
                      {elements.map(el => (
                        <option key={el.id} value={el.name}>
                          {el.name}{el.level ? ` — ${el.level}` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. COL-C24 (no BIM elements imported for this project yet)"
                      value={formElementName}
                      onChange={(e) => setFormElementName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Test type — drives which measurements the record carries
                  (backend PUNDITTest.TEST_TYPES). */}
              <div className="text-xs">
                <label className="block text-gray-700 font-semibold mb-1.5">Test Type (BS 1881-203 / ASTM C597)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {([
                    { value: 'pulse_velocity', label: 'Pulse Velocity', hint: 'Concrete QA — direct UPV' },
                    { value: 'crack_depth', label: 'Crack Depth', hint: 'Time-difference method' },
                    { value: 'surface_quality', label: 'Surface Quality', hint: 'Homogeneity survey' },
                  ] as const).map(tt => (
                    <button
                      key={tt.value}
                      type="button"
                      onClick={() => setFormTestType(tt.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        formTestType === tt.value
                          ? 'bg-[#022C4F] border-[#022C4F] text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-[#022C4F]/40'
                      }`}
                    >
                      <span className="block font-bold text-[11px]">{tt.label}</span>
                      <span className={`block text-[10px] ${formTestType === tt.value ? 'text-slate-300' : 'text-gray-400'}`}>{tt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Transducer Frequency</label>
                  <select
                    value={formTransducerFreq}
                    onChange={(e) => setFormTransducerFreq(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                  >
                    <option value={25}>25 kHz (Mass Concrete)</option>
                    <option value={54}>54 kHz (Standard Concrete)</option>
                    <option value={150}>150 kHz (High Precision Mortar)</option>
                    <option value={250}>250 kHz (Micro-Crack Depth)</option>
                  </select>
                </div>

                {formTestType === 'crack_depth' ? (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Transducer Spacing L (mm)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 300"
                        value={formCrackPathLengthMm || ''}
                        onChange={(e) => setFormCrackPathLengthMm(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Cracked Transit Time t_c (µs)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="e.g. 70.0"
                        value={formCrackPulseTimeUs || ''}
                        onChange={(e) => setFormCrackPulseTimeUs(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Uncracked Transit Time t_0 (µs)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="e.g. 62.5"
                        value={formUncrackedPulseTimeUs || ''}
                        onChange={(e) => setFormUncrackedPulseTimeUs(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Path Length L (mm)</label>
                      <input
                        type="number"
                        required
                        value={formPathLengthMm || ''}
                        onChange={(e) => setFormPathLengthMm(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Transit Time t (µs)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formTransitTimeUs || ''}
                        onChange={(e) => setFormTransitTimeUs(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Transducer Arrangement</label>
                  <select
                    value={formTransducerType}
                    onChange={(e) => setFormTransducerType(e.target.value as 'DIRECT' | 'SEMI_DIRECT' | 'INDIRECT')}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                  >
                    <option value="DIRECT">Direct Transmission (Face-to-Face)</option>
                    <option value="SEMI_DIRECT">Semi-Direct Transmission</option>
                    <option value="INDIRECT">Indirect (Surface) Transmission</option>
                  </select>
                </div>
              </div>

              {formTestType === 'surface_quality' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Surface Condition Observed</label>
                    <input
                      type="text"
                      placeholder="e.g. Smooth finished, no visible cracking"
                      value={formSurfaceCondition}
                      onChange={(e) => setFormSurfaceCondition(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Surface Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formSurfaceTemperatureC || ''}
                      onChange={(e) => setFormSurfaceTemperatureC(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-mono text-xs text-gray-800 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Test Location On-Site</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Inspecting Engineer (COREN Reg.)</label>
                  <input
                    type="text"
                    required
                    value={formOperator}
                    onChange={(e) => setFormOperator(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Field Observation Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Field Evidence Attachments (photos / raw device export)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.csv,.txt,.dat,.json,.pdf"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files || []);
                    setFormAttachments(prev => [...prev, ...picked]);
                    e.target.value = ''; // allow re-picking the same file
                  }}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#022C4F] file:text-white file:text-[10px] file:font-bold file:cursor-pointer"
                />
                <p className="text-[10px] text-gray-500 mt-1 font-semibold">
                  Accepted file types: <span className="font-mono">.jpg / .png / .heic (photos) · .csv · .txt · .dat · .json · .pdf</span> — max 512 MB each, as many files as you need.
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Uploaded through the checksummed (SHA-256) sensor-file vault and linked to the record — feeds the NDT report appendix.
                </p>
                {formAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formAttachments.map((f, i) => (
                      <span key={`${f.name}-${i}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-gray-200 rounded-full text-[10px] font-mono text-gray-700">
                        <FileText size={10} />
                        {f.name} ({(f.size / 1024).toFixed(0)} KB)
                        <button
                          type="button"
                          onClick={() => setFormAttachments(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-gray-400 hover:text-rose-600 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingManual}
                className="w-full py-3 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send size={15} />
                <span>{isSubmittingManual ? "Submitting to Audit Queue..." : "Submit Verified Manual Record to Government Registry"}</span>
              </button>
            </form>
          )}

        </div>

        {/* Right Col (4 Spans): Engine-Locked Real-Time Calculations Card */}
        <div className="lg:col-span-4 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Lock size={14} className="text-amber-400" />
                <span>Locked Output Engine</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Server-Computed
              </span>
            </div>

            {/* Path Length (L) Display */}
            <div className="flex justify-between items-center text-xs font-mono p-2.5 bg-slate-800/80 rounded-xl">
              <span className="text-slate-400">{formTestType === 'crack_depth' ? 'Transducer Spacing (L):' : 'Acoustic Path (L):'}</span>
              <span className="text-emerald-300 font-bold">
                {(activeTab === 'MANUAL_IMPORT' && formTestType === 'crack_depth')
                  ? (formCrackPathLengthMm > 0 ? `${formCrackPathLengthMm} mm` : '—')
                  : (formPathLengthMm > 0 ? `${formPathLengthMm} mm` : '—')}
              </span>
            </div>

            {/* Transit Time (t) Display */}
            {activeTab === 'MANUAL_IMPORT' && formTestType === 'crack_depth' ? (
              <>
                <div className="flex justify-between items-center text-xs font-mono p-2.5 bg-slate-800/80 rounded-xl">
                  <span className="text-slate-400">Cracked Transit (t_c):</span>
                  <span className="text-sky-300 font-bold">{formCrackPulseTimeUs > 0 ? `${formCrackPulseTimeUs.toFixed(1)} µs` : '—'}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono p-2.5 bg-slate-800/80 rounded-xl">
                  <span className="text-slate-400">Uncracked Transit (t_0):</span>
                  <span className="text-sky-300 font-bold">{formUncrackedPulseTimeUs > 0 ? `${formUncrackedPulseTimeUs.toFixed(1)} µs` : '—'}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-xs font-mono p-2.5 bg-slate-800/80 rounded-xl">
                <span className="text-slate-400">Transit Time (t):</span>
                <span className="text-sky-300 font-bold">{formTransitTimeUs > 0 ? `${formTransitTimeUs.toFixed(1)} µs` : '—'}</span>
              </div>
            )}

            {/* Crack-depth tests show the time-difference depth output instead
                of velocity / E.C.S — same math as the server adapter. */}
            {activeTab === 'MANUAL_IMPORT' && formTestType === 'crack_depth' ? (
              <>
              <div className={`p-4 rounded-xl border ${
                computedCrackDepthMm == null || computedCrackDepthMm === 0
                  ? 'bg-slate-950/40 border-slate-700/60 text-slate-300'
                  : computedCrackDepthMm > 25
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Crack Depth (d):</span>
                  <span className={`text-2xl font-black font-mono ${
                    computedCrackDepthMm == null || computedCrackDepthMm === 0 ? 'text-slate-400'
                      : computedCrackDepthMm > 25 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {computedCrackDepthMm != null && computedCrackDepthMm > 0 ? `${computedCrackDepthMm.toFixed(1)} mm` : '—'}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-xs font-bold">
                  {computedCrackDepthMm == null ? (
                    <>
                      <AlertTriangle size={15} className="text-slate-400" />
                      <span>AWAITING MEASUREMENTS — ENTER L, t_c AND t_0</span>
                    </>
                  ) : computedCrackDepthMm === 0 ? (
                    <>
                      <AlertTriangle size={15} className="text-amber-400" />
                      <span>t_c ≤ t_0 — NO MEASURABLE CRACK DEPTH AT THIS STATION</span>
                    </>
                  ) : computedCrackDepthMm > 25 ? (
                    <>
                      <AlertTriangle size={15} className="text-rose-400" />
                      <span>EXCEEDS 25 MM — STRUCTURAL REVIEW REQUIRED</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span>WITHIN 25 MM MONITORING LIMIT</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                Time-difference method: d = (L/2)·√((t_c/t_0)² − 1). No measurable depth when t_c ≤ t_0. Depths over 25 mm are referred for structural review.
              </p>
            </>
            ) : (
              <>
            {/* Pulse Velocity (V) Display */}
            <div className="flex justify-between items-center text-xs font-mono p-2.5 bg-slate-800/80 rounded-xl">
              <span className="text-slate-400">Pulse Velocity (V):</span>
              <span className="text-amber-300 font-bold">{computedVelocity > 0 ? `${computedVelocity.toLocaleString()} m/s` : '—'}</span>
            </div>

            {/* Characteristic Compressive Strength (fcu) Display */}
            <div className={`p-4 rounded-xl border ${
              isStrengthCompliant
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Est. Strength (fcu):</span>
                <span className={`text-2xl font-black font-mono ${isStrengthCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {computedFcu != null ? `${computedFcu} MPa` : '—'}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-xs font-bold">
                {computedVelocity <= 0 ? (
                  <>
                    <AlertTriangle size={15} className="text-slate-400" />
                    <span>AWAITING MEASUREMENT — ENTER THE MEASURED TRANSIT TIME (t)</span>
                  </>
                ) : computedFcu == null ? (
                  <>
                    <AlertTriangle size={15} className="text-amber-400" />
                    <span>VELOCITY OUTSIDE E.C.S CALIBRATION RANGE (2.0–5.0 KM/S)</span>
                  </>
                ) : isStrengthCompliant ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>GREEN PASSED (≥ 25.0 MPa THRESHOLD)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={15} className="text-rose-400" />
                    <span>DEFICIENT (&lt; 25.0 MPa NON-COMPLIANT)</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Formula: V = L / t; fcu ≈ 8.961·V − 7.97 N/mm² (E.C.S calibration curve, valid 2.0–5.0 km/s). Evaluated under BS 1881-203.
            </p>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: {
                    message: `Validated: V = ${computedVelocity.toLocaleString()} m/s, fcu = ${computedFcu != null ? `${computedFcu} MPa` : 'outside calibration range'}. Submit the record through the ingestion form to enter the statutory registry.`,
                    type: computedFcu != null && isStrengthCompliant ? "success" : "error"
                  }
                }));
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldCheck size={14} />
              <span>Validate &amp; Queue for Government Signoff</span>
            </button>
          </div>
        </div>

      </div>

      {/* Selected Test Waveform Visualizer */}
      {activeTest && (
        <div ref={viewerSectionRef} className="mb-8 scroll-mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>Telemetry Waveform Oscillogram ({activeTest.test_reference})</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              Frequency: {activeTest.transducer_frequency_khz} kHz | L = {activeTest.path_length_mm} mm
            </span>
          </div>

          <PunditWaveformViewer
            test={activeTest}
            onLinkToBIM={() => {
              if (!selectedElement) {
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '⚠️ Select a BIM element in the header before linking.', type: "error" } }));
                return;
              }
              linkPunditTestToElement(activeTest.id, selectedElement.name)
                .then((updated) => {
                  setTests(prev => prev.map(t => (t.id === updated.id ? updated : t)));
                  setActiveTest(updated);
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Linked ${updated.test_reference} to BIM element ${selectedElement.name}.`, type: "success" } }));
                })
                .catch(reportCreateError);
            }}
            onEscalateNCR={() => setIsCreateFindingOpen(true)}
          />
        </div>
      )}

      {/* Recent Field Telemetry Intake Registry Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#022C4F]">Live Ingested Telemetry Registry</h2>
              <p className="text-xs text-gray-500">Real-time audit log of automated cloud streams and anti-doctoring manual entries</p>
            </div>
            <span className="text-xs text-gray-500 font-mono">{tests.length} Records Ingested</span>
          </div>

          {/* Server-side search + filters — hits the ?search= / ?test_type= / ?quality_grade= params on /digital-eye/pundit-tests/ */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
              <input
                type="text"
                placeholder="Search ref, element, operator, notes…"
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#022C4F]"
              />
              {registrySearch && (
                <button
                  onClick={() => setRegistrySearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              value={registryTypeFilter}
              onChange={(e) => setRegistryTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="">All Test Types</option>
              <option value="pulse_velocity">Pulse Velocity</option>
              <option value="crack_depth">Crack Depth</option>
              <option value="surface_quality">Surface Quality</option>
            </select>

            <select
              value={registryGradeFilter}
              onChange={(e) => setRegistryGradeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="">All Grades</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="questionable">Questionable</option>
              <option value="poor">Poor</option>
              <option value="very_poor">Very Poor</option>
              <option value="pending">Pending</option>
            </select>

            {(registrySearch || registryTypeFilter || registryGradeFilter) && (
              <button
                onClick={() => { setRegistrySearch(""); setRegistryTypeFilter(""); setRegistryGradeFilter(""); }}
                className="px-3 py-1.5 border border-gray-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoadingRegistry ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-400 animate-pulse">
              Loading telemetry registry from server…
            </div>
          ) : registryError ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs font-bold text-rose-600">{registryError}</p>
              <button
                onClick={refreshRegistry}
                className="px-4 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : tests.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No PUNDIT telemetry ingested for this project yet. Records will appear here once ingested above.
            </div>
          ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                <th className="py-3 px-5">Station Ref</th>
                <th className="py-3 px-5">Target Element</th>
                <th className="py-3 px-5">Transducer</th>
                <th className="py-3 px-5">Path (L)</th>
                <th className="py-3 px-5">Transit (t)</th>
                <th className="py-3 px-5">Velocity (V)</th>
                <th className="py-3 px-5">Strength (fcu)</th>
                <th className="py-3 px-5">25 MPa Rule</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tests.map((t) => {
                const fcu = t.estimated_compressive_strength_mpa;
                const isPassed = fcu != null && fcu >= CRITICAL_STRENGTH_THRESHOLD_MPA;
                const isAssessed = fcu != null;
                const isCrack = t.test_type === 'crack_depth';
                const isSurface = t.test_type === 'surface_quality';
                const crackDepth = t.estimated_crack_depth_mm;
                return (
                  <tr
                    key={t.id}
                    onClick={() => {
                      setActiveTest(t);
                      setTimeout(() => viewerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                    }}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${activeTest?.id === t.id ? 'bg-amber-50/40' : ''}`}
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-gray-900">
                      <span className="flex items-center gap-1.5">
                        {t.test_reference}
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isCrack ? 'bg-orange-100 text-orange-800' : isSurface ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isCrack ? 'CRACK' : isSurface ? 'SURFACE' : 'PV'}
                        </span>
                        {t.file_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500 inline-flex items-center gap-0.5">
                            <FileText size={9} />{t.file_count}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-700">
                      {t.structural_element_name || t.test_location || '—'}
                      {isSurface && (t.surface_condition || t.surface_temperature_c != null) && (
                        <span className="block text-[10px] text-gray-400 mt-0.5">
                          {t.surface_condition || 'Condition not recorded'}{t.surface_temperature_c != null ? ` · ${t.surface_temperature_c}°C` : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-gray-600">{t.transducer_type ? `${t.transducer_type} (${t.transducer_frequency_khz || '—'}kHz)` : `${t.transducer_frequency_khz || '—'} kHz`}</td>
                    <td className="py-3.5 px-5 font-mono text-gray-600">
                      {isCrack
                        ? (t.crack_path_length_mm > 0 ? `${t.crack_path_length_mm} mm` : '—')
                        : `${t.path_length_mm} mm`}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-gray-600">
                      {isCrack
                        ? (t.crack_pulse_time_us > 0 && t.uncracked_pulse_time_us > 0
                            ? `${t.crack_pulse_time_us}/${t.uncracked_pulse_time_us} µs`
                            : '—')
                        : isSurface ? '—' : `${t.transit_time_us} µs`}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-amber-700">
                      {isCrack || isSurface ? '—' : t.pulse_velocity_ms ? `${t.pulse_velocity_ms.toLocaleString()} m/s` : 'Pending'}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-black">
                      <span className={isPassed ? 'text-emerald-600' : isAssessed ? 'text-rose-600' : 'text-gray-400'}>
                        {isCrack || isSurface ? '—' : fcu != null ? `${fcu.toFixed(1)} MPa` : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {isCrack ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          crackDepth == null
                            ? 'bg-gray-100 text-gray-500 border border-gray-200'
                            : crackDepth > 25
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {crackDepth == null ? <Info size={11} /> : crackDepth > 25 ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                          <span>{crackDepth == null ? 'NOT ASSESSED' : `d=${crackDepth.toFixed(1)}mm ${crackDepth > 25 ? '· REVIEW' : '· WITHIN LIMIT'}`}</span>
                        </span>
                      ) : isSurface ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-cyan-50 text-cyan-800 border border-cyan-200">
                          <Eye size={11} />
                          <span>VISUAL RECORD</span>
                        </span>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          !isAssessed
                            ? 'bg-gray-100 text-gray-500 border border-gray-200'
                            : isPassed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                        }`}>
                          {!isAssessed ? <Info size={11} /> : isPassed ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                          <span>{!isAssessed ? 'NOT ASSESSED' : isPassed ? 'GREEN PASS (≥25)' : 'DEFICIENT (<25)'}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTest(t);
                          // The viewer renders/updates above the table — bring it
                          // into view so the click visibly does something.
                          setTimeout(() => viewerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                        }}
                        className="px-2.5 py-1 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold"
                      >
                        Oscillogram
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(t);
                        }}
                        className="px-2.5 py-1 bg-white border border-gray-200 hover:border-amber-400 text-amber-700 rounded-lg text-xs font-bold"
                        title="Correct the recorded field measurements"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* RECORD CORRECTION MODAL — edit the recorded field measurements.
          Analysis outputs (velocity, grade, E.C.S, crack depth) are engine
          locked: they are re-derived server-side from the corrected inputs. */}
      {editingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h3 className="font-bold text-sm text-[#022C4F]">Correct Record — {editingTest.test_reference}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {editingTest.test_type === 'crack_depth' ? 'Crack-depth (BS 1881-203 t_c/t_0 method)'
                    : editingTest.test_type === 'surface_quality' ? 'Surface quality / visual record'
                    : 'Pulse velocity (UPV)'}
                </p>
              </div>
              <button
                onClick={() => setEditingTest(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-3">
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100 flex gap-2 text-[10px] text-amber-800 leading-relaxed">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>
                  If an official NDT dossier has already been generated for this project, this correction
                  changes the report content — the next generation will be archived as a <strong>new dossier
                  version</strong> (previous versions stay on record). Outputs (velocity, grade, fcu, crack
                  depth) are re-derived server-side; you cannot type them in.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-gray-500">Structural element</span>
                  <input
                    value={editForm.structural_element}
                    onChange={(e) => setEditForm(f => ({ ...f, structural_element: e.target.value }))}
                    className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-gray-500">Test location</span>
                  <input
                    value={editForm.test_location}
                    onChange={(e) => setEditForm(f => ({ ...f, test_location: e.target.value }))}
                    className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </label>
              </div>

              {editingTest.test_type === 'pulse_velocity' && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Path length L (mm)</span>
                    <input
                      type="number" step="any" min="0"
                      value={editForm.path_length_mm}
                      onChange={(e) => setEditForm(f => ({ ...f, path_length_mm: e.target.value }))}
                      className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Transit time t (µs)</span>
                    <input
                      type="number" step="any" min="0"
                      value={editForm.pulse_time_us}
                      onChange={(e) => setEditForm(f => ({ ...f, pulse_time_us: e.target.value }))}
                      className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Transducer freq (kHz)</span>
                    <input
                      type="number" step="any" min="0"
                      value={editForm.transducer_frequency_khz}
                      onChange={(e) => setEditForm(f => ({ ...f, transducer_frequency_khz: e.target.value }))}
                      className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Transducer mode</span>
                    <select
                      value={editForm.transducer_type}
                      onChange={(e) => setEditForm(f => ({ ...f, transducer_type: e.target.value as any }))}
                      className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                    >
                      <option value="">—</option>
                      <option value="DIRECT">DIRECT</option>
                      <option value="SEMI_DIRECT">SEMI DIRECT</option>
                      <option value="INDIRECT">INDIRECT</option>
                    </select>
                  </label>
                </div>
              )}

              {editingTest.test_type === 'crack_depth' && (
                <div className="grid grid-cols-3 gap-3">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Path L (mm)</span>
                    <input
                      type="number" step="any" min="0"
                      value={editForm.crack_path_length_mm}
                      onChange={(e) => setEditForm(f => ({ ...f, crack_path_length_mm: e.target.value }))}
                      className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-gray-500">t_cracked (µs)</span>
                    <input
                      type="number" step="any" min="0"
                      value={editForm.crack_pulse_time_us}
                      onChange={(e) => setEditForm(f => ({ ...f, crack_pulse_time_us: e.target.value }))}
                      className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-gray-500">t_uncracked (µs)</span>
                    <input
                      type="number" step="any" min="0"
                      value={editForm.uncracked_pulse_time_us}
                      onChange={(e) => setEditForm(f => ({ ...f, uncracked_pulse_time_us: e.target.value }))}
                      className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </label>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {editingTest.test_type === 'surface_quality' && (
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Surface condition</span>
                    <input
                      value={editForm.surface_condition}
                      onChange={(e) => setEditForm(f => ({ ...f, surface_condition: e.target.value }))}
                      className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-gray-500">Surface temp (°C)</span>
                  <input
                    type="number" step="any"
                    value={editForm.surface_temperature_c}
                    onChange={(e) => setEditForm(f => ({ ...f, surface_temperature_c: e.target.value }))}
                    className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-gray-500">Operator</span>
                  <input
                    value={editForm.operator_name}
                    onChange={(e) => setEditForm(f => ({ ...f, operator_name: e.target.value }))}
                    className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] font-bold uppercase text-gray-500">Notes</span>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  className="mt-1 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setEditingTest(null)}
                className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-4 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] disabled:opacity-50 text-white rounded-lg text-xs font-bold"
              >
                {isSavingEdit ? 'Saving…' : 'Save Correction'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateFindingModal
        isOpen={isCreateFindingOpen}
        onClose={() => setIsCreateFindingOpen(false)}
        defaultProjectId={selectedProjectId}
        defaultElementId={selectedElementId}
      />
    </div>
  );
}
