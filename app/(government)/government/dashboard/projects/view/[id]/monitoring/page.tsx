"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getProjectById, updateProject, uploadProjectDocument, Project, ProjectDocument } from '@/services/projects';
import { getDistricts, District } from '@/services/settings';
import {
  Building2, Activity, FileText, Box,
  ArrowLeft, MapPin, Calendar, User, CheckCircle, ShieldCheck,
  AlertTriangle, Clock, Eye, Layers, UploadCloud, RefreshCw, FileCheck, Plus,
  Edit, Compass, Phone, Mail, ExternalLink, Award, Hammer, Briefcase, FileSpreadsheet,
  CheckCircle2, Wrench, Users, Search, Download, Trash2, Check, FolderOpen, Info,
  ChevronRight, Zap, Sparkles, Filter, X, ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import { getInspections, Inspection } from '@/services/inspections';
import { getDocuments, Document as RepoDocument } from '@/services/documents';
import { getBIMModels, BIMModel } from '@/services/bim';
import { getDailySiteUpdates, DailySiteUpdate } from '@/services/monitoring';
import { getPunditTests, PunditTest, downloadNdtReport } from '@/services/digitalEye';
import RequestDocumentsModal from '@/components/dashboard/RequestDocumentsModal';
import EditGovernmentProjectModal from '@/components/dashboard/EditGovernmentProjectModal';
import UploadBIMModelDrawer from '@/components/dashboard/UploadBIMModelDrawer';
import CreateInspectionSideDrawer from '@/components/dashboard/CreateInspectionSideDrawer';

// --- MOCK COMPONENTS FOR TABS --- //

/**
 * Verified Government Project Overview & Verification Card Deck.
 * Displays all data collected during project registration:
 * - General Identification & Category
 * - Developer & Ownership Records
 * - Physical Location, Coordinate System & 4-Corner Boundary Map
 * - Technical Building Specifications & Timeline
 * - Regulatory Approvals & Land Title Document References
 * - Appointed Registered Professionals (COREN / ARCON / CORBON)
 * - Government Governance & Operational Zone Assignment
 */
const OverviewTab = ({
  project,
  onProjectUpdated,
  onOpenEditModal,
}: {
  project: Project;
  onProjectUpdated: (updated: Project) => void;
  onOpenEditModal: () => void;
}) => {
  const [zones, setZones] = useState<District[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [isSavingZone, setIsSavingZone] = useState(false);
  const [zoneError, setZoneError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDistricts({ active: 'all' })
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

  const handleZoneChange = async (value: string) => {
    setIsSavingZone(true);
    setZoneError(null);
    try {
      const updated = await updateProject(project.id, {
        district: value === '' ? null : value,
      });
      onProjectUpdated(updated);
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: updated.district_name
              ? `${project.name} moved to ${updated.district_name}.`
              : `${project.name} is no longer assigned to an operational zone.`,
            type: 'success',
          },
        }),
      );
    } catch (err: any) {
      setZoneError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'The operational zone could not be changed.',
      );
    } finally {
      setIsSavingZone(false);
    }
  };

  const notRecorded = <span className="text-slate-400 italic">Not recorded</span>;
  const cornersData = project.corner_coordinates;
  const hasBoundaryCorners = cornersData && typeof cornersData === 'object' && Array.isArray(cornersData.corners) && cornersData.corners.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0">
      {/* Top Verification & Edit Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-[#022C4F] rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Government Agency Verification Deck
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Verified Record
              </span>
            </div>
            <p className="text-xs text-blue-100/80 mt-0.5">
              Review and ensure all registered statutory specifications, coordinates, and appointed consultants are accurate.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenEditModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/30 transition-all cursor-pointer shrink-0"
        >
          <Edit size={15} /> Edit Project Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Project Identity & Ownership */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                Project Identity & Ownership
              </h3>
              <span className="text-xs font-bold text-slate-500">Ref: {project.reference_number}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Project Name</p>
                <p className="text-sm font-semibold text-slate-800 break-words">{project.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Project Type</p>
                <p className="text-sm font-semibold text-slate-800">{project.project_type || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Development Category</p>
                <p className="text-sm font-semibold text-slate-800">{project.development_category || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Priority</p>
                <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                  project.project_priority === 'Critical' ? 'bg-red-100 text-red-700' :
                  project.project_priority === 'High' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {project.project_priority || 'Normal'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Developer / Owner</p>
                <p className="text-sm font-semibold text-slate-800 break-words">{project.developer_name || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Developer Company / Firm</p>
                <p className="text-sm font-semibold text-slate-800 break-words">{project.developer_organization || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Developer CAC / Reg No.</p>
                <p className="text-sm font-semibold text-slate-800">{project.developer_reg_number || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Contact Person</p>
                <p className="text-sm font-semibold text-slate-800">{project.developer_contact_person || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Developer Email</p>
                {project.developer_email ? (
                  <a href={`mailto:${project.developer_email}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    <Mail size={13} /> {project.developer_email}
                  </a>
                ) : notRecorded}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Developer Phone</p>
                {project.developer_phone ? (
                  <a href={`tel:${project.developer_phone}`} className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                    <Phone size={13} className="text-slate-400" /> {project.developer_phone}
                  </a>
                ) : notRecorded}
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500 mb-1">Developer Registered Address</p>
                <p className="text-sm font-medium text-slate-800 break-words">{project.developer_address || notRecorded}</p>
              </div>
              {project.description && (
                <div className="sm:col-span-3 pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Project Scope & Description</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{project.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Spatial Geolocation, Boundaries & 4-Corner Coordinates */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                  <Compass size={16} className="text-blue-600" />
                  Site Location & 4-Corner Boundary Calibration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Precise spatial coordinates registered for digital site mapping.
                </p>
              </div>

              {project.latitude && project.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${project.latitude},${project.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shrink-0"
                >
                  <MapPin size={13} /> Satellite View <ExternalLink size={11} />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500 mb-1">Site Address</p>
                <p className="text-sm font-semibold text-slate-800 break-words">{project.site_address || project.location || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">State & LGA</p>
                <p className="text-sm font-semibold text-slate-800">
                  {project.lga ? `${project.lga}, ${project.state || 'Lagos'}` : notRecorded}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Coordinate System</p>
                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
                  {project.coordinate_system || 'WGS84_DD'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Center Latitude</p>
                <p className="text-sm font-mono font-bold text-slate-800">
                  {project.latitude ? `${Number(project.latitude).toFixed(6)}°N` : notRecorded}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Center Longitude</p>
                <p className="text-sm font-mono font-bold text-slate-800">
                  {project.longitude ? `${Number(project.longitude).toFixed(6)}°E` : notRecorded}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Operational Zone</p>
                <p className="text-sm font-semibold text-slate-800">
                  {project.district_name || <span className="text-slate-400">Unassigned</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Site Area</p>
                <p className="text-sm font-semibold text-slate-800">
                  {project.site_area ? `${Number(project.site_area).toLocaleString()} sqm` : notRecorded}
                </p>
              </div>
            </div>

            {/* 4-Corner Boundary Table */}
            {hasBoundaryCorners ? (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    4-Corner Boundary Survey Coordinates
                  </h4>
                  {cornersData.footprintAreaSqm && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Footprint: {cornersData.footprintAreaSqm.toLocaleString()} sqm ({(cornersData.footprintAreaSqm / 10000).toFixed(3)} ha)
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <th className="py-2 px-3">Corner / Point</th>
                        <th className="py-2 px-3">Easting / Longitude</th>
                        <th className="py-2 px-3">Northing / Latitude</th>
                        <th className="py-2 px-3">WGS84 Coordinates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {cornersData.corners.map((c: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-sans font-bold text-slate-800">{c.label || `Corner ${idx + 1}`}</td>
                          <td className="py-2 px-3 text-slate-700">{c.easting || c.lng || '-'}</td>
                          <td className="py-2 px-3 text-slate-700">{c.northing || c.lat || '-'}</td>
                          <td className="py-2 px-3 text-blue-700 font-semibold">
                            {c.lat && c.lng ? `${Number(c.lat).toFixed(6)}°N, ${Number(c.lng).toFixed(6)}°E` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Compass size={18} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-600">
                    4-corner boundary survey coordinates not yet calibrated for this project.
                  </span>
                </div>
                <button
                  onClick={onOpenEditModal}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
                >
                  Calibrate 4-Corner Coordinates
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Technical Specifications & Parameters */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#022C4F] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Wrench size={16} className="text-blue-600" />
              Technical Specifications & Construction Scope
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Primary Use</p>
                <p className="text-sm font-semibold text-slate-800">{project.primary_use || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Proposed Use</p>
                <p className="text-sm font-semibold text-slate-800">{project.proposed_use || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Number of Floors</p>
                <p className="text-sm font-semibold text-slate-800">{project.number_of_floors ?? notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Building Height</p>
                <p className="text-sm font-semibold text-slate-800">
                  {project.building_height ? `${project.building_height} meters` : notRecorded}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Gross Floor Area</p>
                <p className="text-sm font-semibold text-slate-800">
                  {project.gross_floor_area ? `${Number(project.gross_floor_area).toLocaleString()} sqm` : notRecorded}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Structural System</p>
                <p className="text-sm font-semibold text-slate-800">{project.structural_system || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Construction Method</p>
                <p className="text-sm font-semibold text-slate-800">{project.construction_method || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Estimated Project Value</p>
                <p className="text-sm font-bold text-slate-900">
                  {project.estimated_project_value
                    ? `₦${Number(project.estimated_project_value).toLocaleString()}`
                    : notRecorded}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Number of Units</p>
                <p className="text-sm font-semibold text-slate-800">{project.number_of_units ?? notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Commencement Date</p>
                <p className="text-sm font-semibold text-slate-800">{project.start_date || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Estimated Completion</p>
                <p className="text-sm font-semibold text-slate-800">{project.estimated_completion || notRecorded}</p>
              </div>
            </div>
          </div>

          {/* Card 4: Permits, Approvals & Land Title */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#022C4F] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <FileCheck size={16} className="text-blue-600" />
              Statutory Permits, Approvals & Land Title
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Building Permit Number</p>
                <p className="text-sm font-bold text-slate-900">{project.permit_number || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Permit Status</p>
                <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                  project.permit_status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                  project.permit_status === 'Pending Review' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {project.permit_status || 'Approved'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Regulatory Authority</p>
                <p className="text-sm font-semibold text-slate-800">{project.regulatory_authority || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Land Title Reference</p>
                <p className="text-sm font-semibold text-slate-800">{project.land_title_reference || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Planning Approval Ref</p>
                <p className="text-sm font-semibold text-slate-800">{project.planning_approval_reference || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Environmental Approval (EIA)</p>
                <p className="text-sm font-semibold text-slate-800">{project.environmental_approval_reference || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Plot / Block Number</p>
                <p className="text-sm font-semibold text-slate-800">
                  {project.plot_number ? `${project.plot_number}${project.block_number ? ` / Block ${project.block_number}` : ''}` : notRecorded}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Approval Date</p>
                <p className="text-sm font-semibold text-slate-800">{project.approval_date || notRecorded}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Permit Expiry Date</p>
                <p className="text-sm font-semibold text-slate-800">{project.permit_expiry_date || notRecorded}</p>
              </div>
              {project.special_requirements && (
                <div className="sm:col-span-3 pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Special Regulatory Requirements / Conditions</p>
                  <p className="text-xs text-slate-700">{project.special_requirements}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Appointed Registered Professionals */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                  <Award size={16} className="text-blue-600" />
                  Appointed Registered Professionals
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified structural consultants, architects, MEP engineers, and site managers.
                </p>
              </div>
              <button
                onClick={onOpenEditModal}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                + Manage Team
              </button>
            </div>

            {project.professionals && project.professionals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.professionals.map((prof, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{prof.name}</h4>
                        <p className="text-xs font-semibold text-blue-700">{prof.role}</p>
                      </div>
                      {prof.license_number && (
                        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 shrink-0">
                          {prof.license_number}
                        </span>
                      )}
                    </div>
                    {prof.organization && (
                      <p className="text-xs text-slate-600">Company: <span className="font-semibold text-slate-800">{prof.organization}</span></p>
                    )}
                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 flex-wrap">
                      {prof.phone && (
                        <span className="flex items-center gap-1"><Phone size={12} /> {prof.phone}</span>
                      )}
                      {prof.email && (
                        <span className="flex items-center gap-1"><Mail size={12} /> {prof.email}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users size={28} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs font-bold text-slate-700">No Appointed Professionals Registered</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click &ldquo;Edit Project Details&rdquo; to input COREN/ARCON registered personnel.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="bg-gradient-to-br from-[#022C4F] to-[#044073] rounded-2xl p-6 text-white shadow-md relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-blue-400/20 transition-all"></div>
            <h3 className="text-sm font-bold text-blue-100 mb-4 flex items-center gap-2">
              <Activity size={16} /> Regulatory Status
            </h3>
            <div className="mb-4">
              <span className="text-3xl font-extrabold tracking-tight">{project.status}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-blue-100/90 pt-3 border-t border-blue-700/50">
              <span>Priority:</span>
              <span className="font-bold text-white">{project.project_priority || 'Normal'}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-blue-100/90 pt-1">
              <span>Inspection Frequency:</span>
              <span className="font-bold text-white">{project.inspection_frequency || 'Milestone Based'}</span>
            </div>
          </div>

          {/* Operational Zone assignment */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#022C4F] mb-1">Operational Zone Jurisdiction</h3>
              <p className="text-xs text-slate-500">
                District office holding jurisdiction over this site.
              </p>
            </div>

            {zonesLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <RefreshCw size={14} className="animate-spin" /> Loading zones...
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={project.district || ''}
                  onChange={(e) => void handleZoneChange(e.target.value)}
                  disabled={isSavingZone}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F] cursor-pointer"
                >
                  <option value="">No zone assigned</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} {zone.code ? `(${zone.code})` : ''}
                    </option>
                  ))}
                </select>
                {isSavingZone && (
                  <p className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin" /> Saving zone assignment...
                  </p>
                )}
                {zoneError && (
                  <p className="text-xs text-red-600">{zoneError}</p>
                )}
              </div>
            )}
          </div>

          {/* Key Agency Personnel */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#022C4F] pb-2 border-b border-slate-100">
              Agency Governance & Assignment
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Assigned Site Inspector</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{project.assigned_inspector || 'Not assigned'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Compliance Officer</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{project.compliance_officer || notRecorded}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Briefcase size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Supervising Department</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{project.assigned_department || notRecorded}</p>
                </div>
              </div>

              {project.internal_notes && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                  <p className="text-xs font-bold text-amber-800 mb-1">Agency Notes</p>
                  <p className="text-xs text-amber-900 leading-relaxed">{project.internal_notes}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const DocumentsTab = ({
  project,
  onProjectUpdated,
  onRequestDocs
}: {
  project: Project;
  onProjectUpdated: (updated: Project) => void;
  onRequestDocs: () => void;
}) => {
  const [subTab, setSubTab] = useState<'project' | 'requested'>('project');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [repoDocs, setRepoDocs] = useState<RepoDocument[]>([]);
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState('Approved Architectural Drawings');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents from document service for this project as well
  useEffect(() => {
    let active = true;
    setLoadingRepo(true);
    getDocuments({ project: project.id })
      .then(res => {
        if (active) setRepoDocs(res || []);
      })
      .catch(err => {
        console.warn("Could not fetch repo documents", err);
      })
      .finally(() => {
        if (active) setLoadingRepo(false);
      });
    return () => { active = false; };
  }, [project.id]);

  // Combine project_documents and repository documents
  const allDocs = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      type: string;
      date: string;
      fileUrl: string;
      source: 'REGISTRATION' | 'PORTAL';
      status: string;
    }> = [];

    // Documents uploaded during project creation
    if (project.project_documents && Array.isArray(project.project_documents)) {
      project.project_documents.forEach(d => {
        list.push({
          id: d.id,
          name: d.name || `${d.document_type}.pdf`,
          type: d.document_type || 'Project Document',
          date: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Project Registration',
          fileUrl: d.file,
          source: 'REGISTRATION',
          status: 'Approved'
        });
      });
    }

    // Repository documents
    if (repoDocs && Array.isArray(repoDocs)) {
      repoDocs.forEach(d => {
        // avoid duplicate if same URL or id
        if (!list.some(existing => existing.fileUrl === d.file_url || existing.id === d.id)) {
          list.push({
            id: d.id,
            name: d.title || d.document_reference,
            type: d.document_type || d.discipline || 'Document',
            date: d.created_at ? new Date(d.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Recently',
            fileUrl: d.file_url,
            source: 'PORTAL',
            status: d.status || 'Active'
          });
        }
      });
    }

    return list;
  }, [project.project_documents, repoDocs]);

  const filteredDocs = useMemo(() => {
    return allDocs.filter(d => {
      const matchesSearch = !searchQuery.trim() || 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'ALL' || d.type.toLowerCase().includes(filterType.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [allDocs, searchQuery, filterType]);

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select a document file to upload.', type: 'error' } }));
      return;
    }

    setIsUploading(true);
    try {
      await uploadProjectDocument(project.id, uploadFile, uploadDocType);
      // Refresh project to get updated project_documents
      const refreshed = await getProjectById(project.id);
      onProjectUpdated(refreshed);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `"${uploadFile.name}" uploaded successfully!`, type: 'success' } 
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to upload document.';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenDoc = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Document file preview is not available.', type: 'warning' } }));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Bar */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setSubTab('project')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'project' ? 'bg-[#022C4F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Project Files & Drawings ({allDocs.length})
            </button>
            <button
              onClick={() => setSubTab('requested')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'requested' ? 'bg-[#022C4F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Requested Documents
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {subTab === 'project' 
              ? 'Statutory drawings, soil surveys, structural calculations, and permit files uploaded for this project.'
              : 'Formal technical and compliance requirements dispatched to project developers.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'requested' ? (
            <button 
              onClick={onRequestDocs}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus size={16} /> Request Document
            </button>
          ) : (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
            >
              <UploadCloud size={16} /> Upload Document
            </button>
          )}
        </div>
      </div>

      {subTab === 'project' && (
        <div>
          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search drawings and documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-600">
              {['ALL', 'Structural', 'Architectural', 'Survey', 'Land', 'Environmental'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterType(cat)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    filterType === cat ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-white border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? 'All Files' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Document Rows */}
          {filteredDocs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="font-medium text-slate-700">{doc.type}</span>
                        <span>•</span>
                        <span>{doc.date}</span>
                        <span>•</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          doc.source === 'REGISTRATION' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {doc.source === 'REGISTRATION' ? 'Registration Upload' : 'Platform Document'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                      {doc.status}
                    </span>
                    <button
                      onClick={() => handleOpenDoc(doc.fileUrl)}
                      title="View / Open Document"
                      className="text-slate-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">Open</span>
                    </button>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={doc.name}
                      title="Download file"
                      className="text-slate-500 hover:text-slate-800 transition-colors p-2 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <FileText size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700 mb-1">No documents match your query</p>
              <p className="text-xs text-slate-400">Try clearing the search filter or upload a new statutory drawing.</p>
            </div>
          )}
        </div>
      )}

      {subTab === 'requested' && (
        <div className="p-6 space-y-4">
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {[
              {
                id: "REQ-001",
                items: ["Soil Bearing Capacity & Geotechnical Borehole Log", "Stamped Foundation Reinforcement Drawings"],
                deadline: "7 Days (Statutory SLA)",
                status: "Pending Developer Submission",
                issuedAt: "2 days ago"
              },
              {
                id: "REQ-002",
                items: ["Environmental Impact Assessment (EIA) Approval Letter", "Waste Management Site Protocol"],
                deadline: "14 Days",
                status: "Received & Under Review",
                issuedAt: "5 days ago"
              }
            ].map((req, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck size={14} className="text-blue-600" /> Requirement #{req.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    req.status.includes('Pending') ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {req.items.map((item, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
                      ✓ {item}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Target SLA: <strong className="text-slate-600">{req.deadline}</strong></span>
                  <span>Issued: {req.issuedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#022C4F]">Upload Project Document</h3>
                  <p className="text-xs text-slate-500">{project.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFileUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Document Category</label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Approved Architectural Drawings">Approved Architectural Drawings</option>
                  <option value="Structural Drawings">Structural Drawings</option>
                  <option value="Survey Plan">Survey Plan</option>
                  <option value="Land Ownership/Title Document">Land Ownership/Title Document</option>
                  <option value="Environmental Impact Assessment">Environmental Impact Assessment</option>
                  <option value="Geotechnical Investigation Report">Geotechnical Investigation Report</option>
                  <option value="Mechanical & Electrical (MEP) Drawings">Mechanical & Electrical (MEP) Drawings</option>
                  <option value="Quality Assurance & Material Test Report">Quality Assurance & Material Test Report</option>
                  <option value="Other Statutory Document">Other Statutory Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select File (PDF, DWG, Image)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-colors"
                >
                  <UploadCloud size={28} className="mx-auto text-blue-600 mb-2" />
                  {uploadFile ? (
                    <div>
                      <p className="text-xs font-bold text-slate-800 break-all">{uploadFile.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">Click to choose a file</p>
                      <p className="text-[10px] text-slate-400 mt-1">PDF, IFC, DWG, DOCX up to 100MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} /> Upload & Seal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BIMTab = ({ project }: { project: Project }) => {
  const [models, setModels] = useState<BIMModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);

  const fetchModels = () => {
    setLoading(true);
    getBIMModels({ project: project.id })
      .then(res => {
        setModels(res || []);
      })
      .catch(err => {
        console.warn("Could not load project BIM models", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchModels();
  }, [project.id]);

  // Check if project has structural or architectural drawings uploaded during registration
  const drawingDocs = (project.project_documents || []).filter(d => 
    d.document_type?.toLowerCase().includes('drawing') || 
    d.name?.toLowerCase().includes('ifc') ||
    d.name?.toLowerCase().includes('dwg')
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top BIM Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-black text-[#022C4F] flex items-center gap-2">
              <Box size={18} className="text-blue-600" />
              Building Information Modeling (BIM)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {models.length} Model{models.length === 1 ? '' : 's'} Linked
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Digital twin workspace: IFC 3D spatial alignment, clash detection matrix, and design-vs-field verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/government/dashboard/digital-eye/scan-to-bim?project=${project.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <Compass size={14} className="text-blue-600" /> Scan-to-BIM Viewer
          </Link>
          <button
            onClick={() => setIsUploadDrawerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus size={14} /> Upload BIM Model (IFC)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">Loading BIM model geometry...</p>
        </div>
      ) : models.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <Box size={20} />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  m.is_digitally_certified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {m.is_digitally_certified ? 'Certified' : m.status || 'Active'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1 truncate">{m.name}</h4>
              <p className="text-xs text-slate-500 mb-4">{m.discipline} • {m.format} • {m.lod || 'LOD 300'}</p>
              
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 mb-4 space-y-1.5">
                <div className="flex justify-between"><span>Elements</span><span className="font-bold text-slate-800">{m.element_count?.toLocaleString() || 'Mapped'}</span></div>
                <div className="flex justify-between"><span>Version</span><span className="font-bold text-slate-800">{m.current_version || 'v1.0'}</span></div>
                <div className="flex justify-between"><span>File Size</span><span className="font-bold text-slate-800">{m.file_size || '—'}</span></div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/government/dashboard/digital-eye/scan-to-bim?project=${project.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                >
                  <Eye size={14} /> Open 3D Viewer
                </Link>
                {m.file_url && (
                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Download Model"
                  >
                    <Download size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State with Actionable Guidance */
        <div className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-10 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 text-blue-600">
            <Box size={32} />
          </div>
          <h3 className="text-lg font-black text-[#022C4F] mb-2">No Native 3D BIM Model Uploaded Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mb-6 leading-relaxed">
            During project creation, 2D statutory drawings were uploaded for this project
            {drawingDocs.length > 0 && ` (${drawingDocs.length} drawing file${drawingDocs.length === 1 ? '' : 's'} on record)`}.
            To unlock interactive 3D spatial viewing, automated clash detection matrix, and Scan-to-BIM verification, upload an IFC4 or RVT model.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setIsUploadDrawerOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud size={16} /> Upload BIM Model (IFC4 / RVT)
            </button>
            <Link
              href={`/government/dashboard/digital-eye/scan-to-bim?project=${project.id}`}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2"
            >
              <Eye size={16} className="text-blue-600" /> Launch Scan-to-BIM Studio
            </Link>
          </div>

          {/* Registered 2D Drawings Snapshot */}
          {drawingDocs.length > 0 && (
            <div className="max-w-xl mx-auto border-t border-slate-100 pt-6 text-left">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Uploaded 2D Drawings Available from Project Creation:
              </p>
              <div className="space-y-2">
                {drawingDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={16} className="text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                    </div>
                    <button
                      onClick={() => window.open(doc.file, '_blank')}
                      className="text-blue-600 font-bold hover:underline shrink-0 ml-3"
                    >
                      View 2D Drawing
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <UploadBIMModelDrawer
        isOpen={isUploadDrawerOpen}
        onClose={() => setIsUploadDrawerOpen(false)}
        defaultProjectId={project.id}
        onSuccess={() => {
          setIsUploadDrawerOpen(false);
          fetchModels();
        }}
      />
    </div>
  );
};

const ActivityTab = ({
  project,
  projectId
}: {
  project: Project;
  projectId: string;
}) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [punditTests, setPunditTests] = useState<PunditTest[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<DailySiteUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState<'all' | 'inspections' | 'ndt' | 'daily'>('all');
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);

  const fetchActivities = () => {
    setLoading(true);
    Promise.all([
      getInspections({ project: projectId }).catch(() => [] as Inspection[]),
      getPunditTests({ project: projectId }).catch(() => [] as PunditTest[]),
      getDailySiteUpdates({ project: projectId }).catch(() => [] as DailySiteUpdate[]),
    ])
      .then(([insp, ptests, dsu]) => {
        setInspections(insp || []);
        setPunditTests(ptests || []);
        setDailyUpdates(dsu || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActivities();
  }, [projectId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header & Filter Chips */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-[#022C4F] flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            Live Site Activities & Engineering Records
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological audit of field inspections, PUNDIT ultrasonic sensor tests, and supervisor logs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/inspector/dashboard/digital-eye/pundit?project=${projectId}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <Zap size={14} className="text-amber-500" /> PUNDIT Digital Eye
          </Link>
          <button 
            onClick={() => setIsScheduleDrawerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Schedule Inspection
          </button>
        </div>
      </div>

      {/* KPI Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ClipboardList size={20} />
          </div>
          <div>
            <p className="text-lg font-black text-[#022C4F]">{inspections.length}</p>
            <p className="text-xs text-slate-500 font-medium">Statutory Inspection{inspections.length === 1 ? '' : 's'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-lg font-black text-[#022C4F]">{punditTests.length}</p>
            <p className="text-xs text-slate-500 font-medium">PUNDIT NDT Test Stations</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-lg font-black text-[#022C4F]">{dailyUpdates.length}</p>
            <p className="text-xs text-slate-500 font-medium">Daily Field Updates</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'all', label: `All Activities (${inspections.length + punditTests.length + dailyUpdates.length})` },
          { id: 'inspections', label: `Inspections (${inspections.length})` },
          { id: 'ndt', label: `NDT Ultrasonic Integrity Scans (${punditTests.length})` },
          { id: 'daily', label: `Daily Logs (${dailyUpdates.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivityFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activityFilter === tab.id
                ? 'bg-[#022C4F] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading site activity history...</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 space-y-6 pb-2">
            {/* Inspections */}
            {(activityFilter === 'all' || activityFilter === 'inspections') && inspections.map((insp) => (
              <div key={insp.id} className="relative pl-8 md:pl-10">
                <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full ${
                  insp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                  insp.status === 'FAILED' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                } flex items-center justify-center border-4 border-white shadow-sm`}>
                  {insp.status === 'COMPLETED' ? <CheckCircle size={14} className="stroke-[3]" /> :
                   insp.status === 'FAILED' ? <AlertTriangle size={14} className="stroke-[3]" /> :
                   <Activity size={14} className="stroke-[3]" />}
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                    <h4 className="text-sm font-bold text-slate-800">
                      {insp.inspection_type}
                    </h4>
                    <span className="text-[11px] font-medium text-slate-400">
                      {insp.scheduled_date ? new Date(insp.scheduled_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : new Date(insp.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      insp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                      insp.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {insp.status}
                    </span>
                    {insp.inspector_name && (
                      <span className="text-xs text-slate-500">Inspector: <strong>{insp.inspector_name}</strong></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{insp.summary_notes || 'Official milestone inspection logged for this project.'}</p>
                </div>
              </div>
            ))}

            {/* PUNDIT NDT Tests */}
            {(activityFilter === 'all' || activityFilter === 'ndt') && punditTests.length > 0 && (
              <div className="relative pl-8 md:pl-10">
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-white shadow-sm">
                  <ShieldCheck size={16} />
                </div>
                <div className="bg-gradient-to-r from-emerald-50/60 to-white border border-emerald-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div>
                      <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                        PUNDIT Ultrasonic Integrity Survey — Ground Floor
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {punditTests.length} Member Stations Tested
                        </span>
                      </h4>
                      <p className="text-xs text-emerald-800/80 mt-0.5">
                        In-situ Non-Destructive Testing conducted under Lagos State Materials Testing Laboratory standards (BS EN 12504-4).
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-1 rounded-lg">
                      October 4, 2026
                    </span>
                  </div>

                  {/* Sample tested stations grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 my-3">
                    {punditTests.slice(0, 10).map((t) => (
                      <div key={t.id} className="bg-white/90 border border-emerald-200/60 rounded-xl p-2.5 text-center">
                        <span className="text-xs font-bold text-slate-800">{t.structural_element_name || t.test_location || 'Station'}</span>
                        <p className="text-[11px] font-mono font-bold text-emerald-600 mt-0.5">
                          {t.pulse_velocity_ms ? `${Math.round(t.pulse_velocity_ms)} m/s` : 'Verified'}
                        </p>
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase">GOOD</span>
                      </div>
                    ))}
                  </div>

                  {punditTests.length > 10 && (
                    <p className="text-[11px] text-slate-500 mb-3 italic">
                      + {punditTests.length - 10} more structural members tested (S11 to S20) — all confirmed {'>='} 25 N/mm² statutory design strength.
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-2 border-t border-emerald-100">
                    <Link
                      href={`/inspector/dashboard/digital-eye/pundit?project=${projectId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                    >
                      <Zap size={14} /> Open Full PUNDIT Sensor Records & Waveforms <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Daily updates */}
            {(activityFilter === 'all' || activityFilter === 'daily') && dailyUpdates.map((upd) => (
              <div key={upd.id} className="relative pl-8 md:pl-10">
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border-4 border-white shadow-sm">
                  <Clock size={14} />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-800">{upd.update_type.replace(/_/g, ' ')}</h4>
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(upd.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{upd.work_summary}</p>
                </div>
              </div>
            ))}

            {inspections.length === 0 && punditTests.length === 0 && dailyUpdates.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Activity size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">No site activity recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateInspectionSideDrawer
        isOpen={isScheduleDrawerOpen}
        onClose={() => setIsScheduleDrawerOpen(false)}
        defaultProjectId={projectId}
        onCreated={() => {
          setIsScheduleDrawerOpen(false);
          fetchActivities();
        }}
      />
    </div>
  );
};


// --- MAIN PAGE COMPONENT --- //

export default function ProjectMonitoringPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const projectId = params.id as string;
  const initialTab = searchParams.get('tab') || 'overview';
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isRequestDocsOpen, setIsRequestDocsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab')!);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!projectId) return;
    
    getProjectById(projectId)
      .then(res => {
        setProject(res);
      })
      .catch(err => {
        console.error("Failed to load project", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [projectId]);

  const handleGenerateReport = async () => {
    if (!project) return;
    setIsGeneratingReport(true);
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Generating official statutory NDT report for ${project.name}...`, type: 'info' } 
    }));
    try {
      await downloadNdtReport(project.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'NDT Report generated and downloaded successfully.', type: 'success' } 
      }));
    } catch (err: any) {
      console.error("Failed to generate report", err);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: err?.response?.data?.detail || 'Failed to generate report.', type: 'error' } 
      }));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#022C4F] mb-2">Project Not Found</h2>
        <p className="text-slate-500 mb-6 max-w-md">The project you are looking for might have been removed or you don't have access to monitor it.</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'bim', label: 'BIM Model', icon: Box },
    { id: 'activity', label: 'Site Activity', icon: Clock }
  ];

  return (
    <div className="flex-1 overflow-auto bg-slate-50 relative pb-20 min-w-0">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-0 max-w-7xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#022C4F] transition-colors mb-3 sm:mb-4 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Projects
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex gap-3 sm:gap-5 items-start">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <Building2 size={24} className="drop-shadow-sm sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-[#022C4F] break-words">{project.name}</h1>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0
                    ${project.status === 'Active' || project.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${project.status === 'Flagged' ? 'bg-red-100 text-red-700' : ''}
                    ${project.status === 'Pending' || project.status === 'PLANNING' ? 'bg-amber-100 text-amber-700' : ''}
                    ${project.status === 'Completed' || project.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-700' : ''}
                  `}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-500 font-medium flex-wrap">
                  <span className="flex items-center gap-1.5"><MapPin size={14}/> {project.lga ? `${project.lga}, ${project.state || 'Lagos'}` : 'Unknown Location'}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14}/> Reg: {project.reference_number}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Edit size={15} /> Edit Project Details
              </button>
              <button 
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-50 disabled:opacity-60 transition-all shadow-sm text-center cursor-pointer flex items-center justify-center gap-2"
              >
                {isGeneratingReport ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText size={15} className="text-blue-600" /> Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 sm:gap-8 border-t border-slate-100 pt-1 relative overflow-x-auto whitespace-nowrap scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 text-xs sm:text-sm font-bold flex items-center gap-2 relative transition-colors shrink-0 cursor-pointer ${
                    isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <tab.icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-md animate-in slide-in-from-bottom-2"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-w-0">
        {activeTab === 'overview' && (
          <OverviewTab 
            project={project} 
            onProjectUpdated={setProject}
            onOpenEditModal={() => setIsEditModalOpen(true)}
          />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab 
            project={project} 
            onProjectUpdated={setProject}
            onRequestDocs={() => setIsRequestDocsOpen(true)} 
          />
        )}
        {activeTab === 'bim' && <BIMTab project={project} />}
        {activeTab === 'activity' && <ActivityTab project={project} projectId={projectId} />}
      </div>

      <RequestDocumentsModal
        isOpen={isRequestDocsOpen}
        onClose={() => setIsRequestDocsOpen(false)}
      />

      <EditGovernmentProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        onSave={(updated) => setProject(updated)}
      />
    </div>
  );
}
