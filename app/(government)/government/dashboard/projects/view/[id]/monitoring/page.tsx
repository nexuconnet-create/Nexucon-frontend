"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getProjectById, updateProject, Project } from '@/services/projects';
import { getDistricts, District } from '@/services/settings';
import {
  Building2, Activity, FileText, Box,
  ArrowLeft, MapPin, Calendar, User, CheckCircle, ShieldCheck,
  AlertTriangle, Clock, Eye, Layers, UploadCloud, RefreshCw, FileCheck, Plus,
  Edit, Compass, Phone, Mail, ExternalLink, Award, Hammer, Briefcase, FileSpreadsheet,
  CheckCircle2, Wrench, Users
} from 'lucide-react';
import Link from 'next/link';
import { getInspections, Inspection } from '@/services/inspections';
import RequestDocumentsModal from '@/components/dashboard/RequestDocumentsModal';
import EditGovernmentProjectModal from '@/components/dashboard/EditGovernmentProjectModal';

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

const DocumentsTab = ({ project, onRequestDocs }: { project: Project; onRequestDocs: () => void }) => {
  const [subTab, setSubTab] = useState<'project' | 'requested'>('project');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setSubTab('project')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTab === 'project' ? 'bg-[#022C4F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Project Files & Drawings
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
              ? 'Review architectural drawings, permits, and structural engineering files.'
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
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors cursor-pointer">
              <UploadCloud size={16} /> Upload Document
            </button>
          )}
        </div>
      </div>

      {subTab === 'project' && (
        <div className="divide-y divide-slate-100">
          {[
            { name: "Architectural_Drawings_v2.pdf", type: "Design", date: "Oct 24, 2026", status: "Approved" },
            { name: "Structural_Calculation_Report.pdf", type: "Engineering", date: "Oct 25, 2026", status: "Pending Review" },
            { name: "Environmental_Impact_Assessment.pdf", type: "Compliance", date: "Oct 28, 2026", status: "Approved" },
            { name: "Site_Survey_Data.dwg", type: "Survey", date: "Nov 02, 2026", status: "Needs Revision" },
          ].map((doc, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{doc.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                  ${doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : ''}
                  ${doc.status === 'Pending Review' ? 'bg-amber-100 text-amber-700' : ''}
                  ${doc.status === 'Needs Revision' ? 'bg-red-100 text-red-700' : ''}
                `}>
                  {doc.status}
                </span>
                <button className="text-slate-400 hover:text-[#022C4F] transition-colors p-2 hover:bg-slate-200 rounded-lg cursor-pointer">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
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
    </div>
  );
};

const BIMTab = () => (
  <div className="h-[600px] bg-slate-900 rounded-2xl relative overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 group flex items-center justify-center border border-slate-800">
    {/* Placeholder for actual 3D WebGL viewer like Autodesk Forge or Three.js */}
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
    
    <div className="relative z-10 text-center">
      <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-blue-500/30">
        <Box size={40} className="text-blue-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">BIM Model Viewer</h3>
      <p className="text-slate-400 max-w-md mx-auto mb-8">
        Interactive 3D structural and architectural model viewer. 
        Currently loading lightweight mesh representation.
      </p>
      <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto">
        <RefreshCw size={18} className="animate-spin-slow" /> Load Full High-Res Model
      </button>
    </div>

    {/* Overlay UI elements to simulate a real BIM viewer interface */}
    <div className="absolute left-6 top-6 bg-slate-800/80 backdrop-blur-md rounded-xl p-3 border border-slate-700/50 flex flex-col gap-2 shadow-xl">
      <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg cursor-pointer hover:bg-blue-500/40"><Layers size={18} /></div>
      <div className="p-2 bg-slate-700 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-600"><Eye size={18} /></div>
      <div className="p-2 bg-slate-700 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-600"><Box size={18} /></div>
    </div>
    
    <div className="absolute right-6 bottom-6 bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-xl min-w-[200px]">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Model Properties</p>
      <div className="space-y-2 text-sm text-slate-300">
        <div className="flex justify-between"><span>Elements</span><span className="text-white font-medium">12,450</span></div>
        <div className="flex justify-between"><span>LOD</span><span className="text-white font-medium">300</span></div>
        <div className="flex justify-between"><span>Format</span><span className="text-white font-medium">IFC4</span></div>
      </div>
    </div>
  </div>
);

const ActivityTab = ({ projectId }: { projectId: string }) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInspections({ project: projectId }).then(res => {
      setInspections(res || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [projectId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#022C4F]">Site Activity & Inspections</h3>
        <button 
          onClick={() => window.location.href = `/government/dashboard/inspections/requests`}
          className="px-4 py-2 bg-[#022C4F] text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors shadow-md"
        >
          Schedule Inspection
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 space-y-8 pb-4">
          
          {inspections.length > 0 ? (
            inspections.map((insp) => (
              <div key={insp.id} className="relative pl-8 md:pl-10">
                <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full ${
                  insp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                  insp.status === 'FAILED' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                } flex items-center justify-center border-4 border-white shadow-sm`}>
                  {insp.status === 'COMPLETED' ? <CheckCircle size={14} className="stroke-[3]" /> :
                   insp.status === 'FAILED' ? <AlertTriangle size={14} className="stroke-[3]" /> :
                   <Activity size={14} className="stroke-[3]" />}
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-slate-800">{insp.inspection_type} ({insp.status})</h4>
                    <span className="text-[11px] font-medium text-slate-400">
                      {insp.scheduled_date ? new Date(insp.scheduled_date).toLocaleDateString() : new Date(insp.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{insp.summary_notes || 'Field verification conducted on site.'}</p>
                </div>
              </div>
            ))
          ) : (
            [
              { title: "Foundation Inspection Passed", date: "Recent", type: "Success", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100", border: "border-emerald-200", desc: "Inspector verified piling depth and concrete mix strength." },
              { title: "Site Warning Issued", date: "Recent", type: "Warning", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-200", desc: "Missing safety netting on the East wing scaffolding." },
              { title: "Document Approved", date: "Recent", type: "Info", icon: FileCheck, color: "text-blue-500", bg: "bg-blue-100", border: "border-blue-200", desc: "Structural revisions for Phase 2 approved by engineering desk." }
            ].map((item, idx) => (
              <div key={idx} className="relative pl-8 md:pl-10">
                <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center border-4 border-white shadow-sm`}>
                  <item.icon size={14} className="stroke-[3]" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                    <span className="text-[11px] font-medium text-slate-400">{item.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))
          )}

        </div>
      </div>
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
              <button className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-50 transition-all shadow-sm text-center cursor-pointer">
                Generate Report
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
            onRequestDocs={() => setIsRequestDocsOpen(true)} 
          />
        )}
        {activeTab === 'bim' && <BIMTab />}
        {activeTab === 'activity' && <ActivityTab projectId={projectId} />}
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
