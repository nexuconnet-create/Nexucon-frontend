"use client";

import React, { useState, useEffect } from 'react';
import { 
  Flag, Box, Layers, ShieldCheck, CheckCircle2, AlertTriangle, 
  Activity, RefreshCw, Plus, Search, Filter, Calendar, MapPin, 
  ChevronRight, Lock, ExternalLink
} from 'lucide-react';
import { 
  BIMConstructionMilestone, 
  getBIMMilestones 
} from '@/services/bim';
import { getProjects, Project } from '@/services/projects';
import CreateBIMMilestoneModal from '@/components/dashboard/CreateBIMMilestoneModal';
import VerifyBIMMilestoneModal from '@/components/dashboard/VerifyBIMMilestoneModal';
import FlagBIMDeviationModal from '@/components/dashboard/FlagBIMDeviationModal';
import BIMMilestoneDetailDrawer from '@/components/dashboard/BIMMilestoneDetailDrawer';

export default function BIMConstructionMilestonesPage() {
  const [milestones, setMilestones] = useState<BIMConstructionMilestone[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Drawer State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<BIMConstructionMilestone | null>(null);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (selectedProjectId !== 'all') params.project = selectedProjectId;
      if (selectedPhase !== 'all') params.phase = selectedPhase;
      if (selectedStatus !== 'all') params.verification_status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const data = await getBIMMilestones(params);
      setMilestones(data);
    } catch (err) {
      console.error("Failed to load BIM milestones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
      })
      .catch(err => console.error("Failed to load projects", err));
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [selectedProjectId, selectedPhase, selectedStatus, searchQuery]);

  // Statistics
  const totalCount = milestones.length;
  const verifiedCount = milestones.filter(m => m.verification_status === 'VERIFIED' || m.verification_status === 'COMPLETED').length;
  const flaggedCount = milestones.filter(m => m.verification_status === 'DEVIATION_FLAGGED').length;
  const pendingCount = milestones.filter(m => m.verification_status === 'PENDING_REVIEW' || m.verification_status === 'UNVERIFIED').length;
  const reVerifCount = milestones.filter(m => m.verification_status === 'RE_VERIFICATION_REQUIRED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'VERIFIED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 size={13} /> Verified & Stamped
          </span>
        );
      case 'DEVIATION_FLAGGED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5 shadow-sm">
            <AlertTriangle size={13} /> Deviation Flagged
          </span>
        );
      case 'RE_VERIFICATION_REQUIRED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-sm">
            <RefreshCw size={13} /> Re-Verification Required
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5 shadow-sm">
            <Activity size={13} /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="w-full min-h-screen pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase tracking-wider">
              BIM & Model Review Subsystem
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight">
            BIM Construction Milestones & Verification Gates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Validate physical construction progress against certified 3D/4D BIM models, LiDAR tolerances, and statutory inspection gates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} />
            <span>Register BIM Milestone</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total BIM Milestones</p>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Flag size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#022C4F] mt-2">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active regulatory stages</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified & Stamped</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{verifiedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Digital seals applied</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deviations Flagged</p>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{flaggedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Out of spatial tolerance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Re-Verification / Review</p>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RefreshCw size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingCount + reVerifCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting directorate action</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
          
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, stage, or model..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select 
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Phases</option>
            <option value="SUBSTRUCTURE">Substructure & Piling</option>
            <option value="STRUCTURAL_FRAME">Structural Superstructure Frame</option>
            <option value="SUPERSTRUCTURE">Superstructure & Slabs</option>
            <option value="MEP_ROUGHIN">MEP Rough-ins</option>
            <option value="FACADE_ENVELOPE">Facade & Building Envelope</option>
            <option value="FINISHES">Architectural Finishes</option>
            <option value="COMMISSIONING">Testing & Commissioning</option>
          </select>

          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Verification Statuses</option>
            <option value="VERIFIED">Verified & Stamped</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="DEVIATION_FLAGGED">Deviation Flagged</option>
            <option value="RE_VERIFICATION_REQUIRED">Re-Verification Required</option>
          </select>

        </div>

        <button 
          onClick={fetchMilestones}
          className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors ml-auto"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Milestones List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Loading BIM construction milestones...</p>
        </div>
      ) : milestones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Flag size={24} />
          </div>
          <h3 className="text-base font-bold text-[#022C4F]">No BIM Milestones Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No milestones match your current filters. Click "Register BIM Milestone" to link construction stages with approved models.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((ms) => {
            const isToleranceExceeded = ms.bim_deviation_mm > ms.tolerance_max_mm;
            const summary = ms.gate_checks_summary;

            return (
              <div 
                key={ms.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  
                  {/* Title & Stage Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-wider">{ms.milestone_code}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-bold text-slate-600">{ms.project_name || 'Project'}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">
                        Phase: {ms.phase.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-[#022C4F]">{ms.name}</h3>
                    {ms.description && (
                      <p className="text-xs text-slate-500 max-w-3xl line-clamp-1">{ms.description}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    {getStatusBadge(ms.verification_status)}
                  </div>

                </div>

                {/* Grid info: Model, Elements, Tolerances, Gate Checks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  
                  {/* Model & Version Link */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Box size={12} className="text-blue-600" /> Approved BIM Model
                    </p>
                    <p className="text-xs font-bold text-slate-800 truncate">{ms.bim_model_name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Release: <strong>{ms.model_version_label || 'Current'}</strong></span>
                      <span>•</span>
                      <span className={ms.bim_model_certified ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {ms.bim_model_certified ? 'Certified' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Spatial Tolerance & LiDAR Metrics */}
                  <div className={`p-3.5 border rounded-xl space-y-1.5 ${
                    isToleranceExceeded ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50/70 border-slate-200/80'
                  }`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Activity size={12} className="text-indigo-600" /> Scan-to-BIM Deviation
                    </p>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${isToleranceExceeded ? 'text-rose-700' : 'text-slate-800'}`}>
                        Measured: {ms.bim_deviation_mm} mm
                      </p>
                      <span className="text-[11px] text-slate-500">Max: {ms.tolerance_max_mm} mm</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      GNSS RTK Variance: {ms.gnss_survey_variance_mm}mm • GPR: {ms.gpr_clearance_status}
                    </p>
                  </div>

                  {/* Gate Checks Status Matrix */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-600" /> Verification Gates
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        summary?.model_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        Model Certified
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        summary?.zero_critical_clashes ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        0 Clashes
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        summary?.tolerance_compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        Tolerance OK
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        summary?.inspections_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        Inspection OK
                      </span>
                    </div>
                  </div>

                </div>

                {/* Footer Controls & Direct Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      Target: <strong>{ms.target_date}</strong>
                    </span>
                    {ms.digital_stamp_reference && (
                      <span className="flex items-center gap-1 text-emerald-700 font-mono text-[11px]">
                        <Lock size={12} /> Stamped: {ms.digital_stamp_reference.slice(0, 10)}...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setActiveMilestone(ms);
                        setIsFlagModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
                    >
                      Flag Deviation
                    </button>
                    
                    {ms.verification_status !== 'COMPLETED' && (
                      <button 
                        onClick={() => {
                          setActiveMilestone(ms);
                          setIsVerifyModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1"
                      >
                        <ShieldCheck size={13} />
                        <span>Assess & Verify Gate</span>
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        setActiveMilestone(ms);
                        setIsDetailDrawerOpen(true);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>Evidence & Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modals & Drawer */}
      <CreateBIMMilestoneModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchMilestones}
      />

      <VerifyBIMMilestoneModal 
        isOpen={isVerifyModalOpen}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setActiveMilestone(null);
        }}
        milestone={activeMilestone}
        onSuccess={fetchMilestones}
      />

      <FlagBIMDeviationModal 
        isOpen={isFlagModalOpen}
        onClose={() => {
          setIsFlagModalOpen(false);
          setActiveMilestone(null);
        }}
        milestone={activeMilestone}
        onSuccess={fetchMilestones}
      />

      <BIMMilestoneDetailDrawer 
        isOpen={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setActiveMilestone(null);
        }}
        milestone={activeMilestone}
        onVerifyClick={() => {
          setIsDetailDrawerOpen(false);
          setIsVerifyModalOpen(true);
        }}
        onFlagDeviationClick={() => {
          setIsDetailDrawerOpen(false);
          setIsFlagModalOpen(true);
        }}
        onRefresh={fetchMilestones}
      />

    </div>
  );
}
