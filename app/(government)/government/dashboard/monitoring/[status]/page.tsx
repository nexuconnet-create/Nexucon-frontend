"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, Filter, ArrowUpRight, Activity, Clock, CheckCircle, AlertTriangle, 
  MapPin, Calendar, FileText, User, LayoutGrid, List, MoreVertical, ShieldCheck, Box, Eye,
  Check, FolderOpen, AlertCircle, FileSearch, FileCheck, History, FileWarning, Briefcase,
  MonitorPlay, Plus, RefreshCw, Compass, AlertOctagon, Camera, Navigation, Gavel,
  Layers, ChevronRight, BarChart2, GitCommit, Lock, Radio, BadgeCheck, CloudRain,
  ShieldAlert, Wrench, Zap, UserX, UserCheck
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import TopRightControls from "@/components/dashboard/TopRightControls";
import {
  getDailySiteUpdates, getMissedSiteVisits, acknowledgeMissedSiteVisit,
  getFieldObservations, getSiteIssues, getMilestones, getSiteVerifications, getMonitoringStats,
  DailySiteUpdate, MissedSiteVisitRecord, FieldObservation, SiteIssue,
  ConstructionMilestone, SiteVerification, MonitoringStats
} from '@/services/monitoring';
import CreateDailyUpdateDrawer from '@/components/dashboard/CreateDailyUpdateDrawer';
import LogMissedSiteVisitModal from '@/components/dashboard/LogMissedSiteVisitModal';
import CreateObservationModal from '@/components/dashboard/CreateObservationModal';
import ReportIssueModal from '@/components/dashboard/ReportIssueModal';
import VerifyMilestoneModal from '@/components/dashboard/VerifyMilestoneModal';
import CreateMilestoneModal from '@/components/dashboard/CreateMilestoneModal';
import UpdateMilestoneProgressModal from '@/components/dashboard/UpdateMilestoneProgressModal';
import FlagMilestoneDelayModal from '@/components/dashboard/FlagMilestoneDelayModal';
import MilestoneDetailDrawer from '@/components/dashboard/MilestoneDetailDrawer';
import SiteVerificationDrawer from '@/components/dashboard/SiteVerificationDrawer';
import RecordSiteVerificationModal from '@/components/dashboard/RecordSiteVerificationModal';
import CertifyVerificationModal from '@/components/dashboard/CertifyVerificationModal';
import FlagEncroachmentModal from '@/components/dashboard/FlagEncroachmentModal';
import SiteVerificationDetailDrawer from '@/components/dashboard/SiteVerificationDetailDrawer';
import DailyPhotosGalleryModal from '@/components/dashboard/DailyPhotosGalleryModal';
import SiteProgressDetailModal from '@/components/dashboard/SiteProgressDetailModal';
import MonitoringDetailSideDrawer, { MonitoringDetailItem } from '@/components/dashboard/MonitoringDetailSideDrawer';
import IssueStopWorkModal from '@/components/dashboard/IssueStopWorkModal';
import ReviewCriticalDefectsDrawer from '@/components/dashboard/ReviewCriticalDefectsDrawer';
import EscalateToDirectorateModal from '@/components/dashboard/EscalateToDirectorateModal';

const TABS = [
  { id: 'live', label: 'Live Site View', icon: Eye },
  { id: 'progress', label: 'Site Progress', icon: Activity },
  { id: 'attendance', label: 'Field Attendance & Non-Visitation', icon: ClipboardList },
  { id: 'observations', label: 'Field Observations', icon: Eye },
  { id: 'issues', label: 'Site Issues', icon: AlertTriangle },
  { id: 'milestones', label: 'Construction Milestones', icon: CheckCircle },
  { id: 'verification', label: 'Site Verification', icon: ShieldCheck },
];

const REASON_FILTER_OPTIONS = [
  { id: 'ALL', label: 'All Non-Attendance Reasons' },
  { id: 'ADVERSE_WEATHER', label: '🌧️ Adverse Weather' },
  { id: 'ACCESS_DENIED', label: '🔒 Access Denied' },
  { id: 'SITE_INACCESSIBLE', label: '🌊 Road Inaccessible' },
  { id: 'SECURITY_CONCERN', label: '⚠️ Security / Hazard' },
  { id: 'EQUIPMENT_BREAKDOWN', label: '🔧 Hardware Breakdown' },
  { id: 'EMERGENCY_REASSIGNMENT', label: '🚨 Emergency Reassignment' },
  { id: 'DEVELOPER_UNAVAILABLE', label: '👤 Engineer Absent' },
];

const PHASE_FILTERS = [
  { id: 'ALL', label: 'All Phases' },
  { id: 'SUBSTRUCTURE', label: 'Substructure' },
  { id: 'STRUCTURAL_FRAME', label: 'Structural Frame' },
  { id: 'SUPERSTRUCTURE', label: 'Superstructure' },
  { id: 'MEP_ROUGHIN', label: 'MEP Rough-in' },
  { id: 'FACADE_ENVELOPE', label: 'Facade & Cladding' },
  { id: 'FINISHES', label: 'Finishes' },
  { id: 'COMMISSIONING', label: 'Commissioning' },
];

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'DUE_THIS_WEEK', label: 'Due This Week' },
  { id: 'PENDING_VERIFICATION', label: 'Pending Verification' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'VERIFIED', label: 'Verified' },
  { id: 'DELAYED', label: 'Delayed' },
  { id: 'BLOCKED', label: 'Blocked' },
  { id: 'PLANNED', label: 'Planned' },
];

const VERIFICATION_METHOD_FILTERS = [
  { id: 'ALL', label: 'All Survey Methods' },
  { id: 'GNSS_RTK_SURVEY', label: 'Tersus RTK Rover' },
  { id: 'TERSU_ROVER', label: 'Rover Telemetry Sync' },
  { id: 'DRONE_PHOTOGRAMMETRY', label: 'Drone LiDAR' },
  { id: 'SETBACK_AUDIT', label: 'Setback Audit' },
  { id: 'TOTAL_STATION', label: 'Total Station' },
  { id: 'GPR_SCAN', label: 'GPR Radar Scan' },
];

const VERIFICATION_STATUS_FILTERS = [
  { id: 'ALL', label: 'All Verifications' },
  { id: 'VERIFIED', label: 'Verified & Certified' },
  { id: 'VARIANCE_DETECTED', label: 'Variance Detected' },
  { id: 'FLAGGED', label: 'Flagged / Encroached' },
  { id: 'PENDING_VERIFICATION', label: 'Pending Review' },
];

export default function MonitoringDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const currentStatus = (params.status as string) || 'live';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [milestoneLayout, setMilestoneLayout] = useState<'list' | 'grid' | 'timeline'>('list');
  const [verificationLayout, setVerificationLayout] = useState<'table' | 'cards' | 'map'>('table');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedVerificationMethodFilter, setSelectedVerificationMethodFilter] = useState('ALL');
  const [selectedVerificationStatusFilter, setSelectedVerificationStatusFilter] = useState('ALL');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState('ALL');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Monitoring collections from database
  const [dailyUpdates, setDailyUpdates] = useState<DailySiteUpdate[]>([]);
  const [missedVisits, setMissedVisits] = useState<MissedSiteVisitRecord[]>([]);
  const [observations, setObservations] = useState<FieldObservation[]>([]);
  const [issues, setIssues] = useState<SiteIssue[]>([]);
  const [milestones, setMilestones] = useState<ConstructionMilestone[]>([]);
  const [verifications, setVerifications] = useState<SiteVerification[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);

  // Modals & Drawers
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);
  const [isMissedVisitModalOpen, setIsMissedVisitModalOpen] = useState(false);
  const [isPhotosGalleryOpen, setIsPhotosGalleryOpen] = useState(false);
  const [isProgressDetailModalOpen, setIsProgressDetailModalOpen] = useState(false);
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  
  // Milestone Modals & Drawers
  const [isCreateMilestoneModalOpen, setIsCreateMilestoneModalOpen] = useState(false);
  const [isUpdateProgressModalOpen, setIsUpdateProgressModalOpen] = useState(false);
  const [isFlagDelayModalOpen, setIsFlagDelayModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isMilestoneDetailDrawerOpen, setIsMilestoneDetailDrawerOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ConstructionMilestone | null>(null);

  // Site Verification Modals & Drawers
  const [isRecordVerificationModalOpen, setIsRecordVerificationModalOpen] = useState(false);
  const [isCertifyVerificationModalOpen, setIsCertifyVerificationModalOpen] = useState(false);
  const [isFlagEncroachmentModalOpen, setIsFlagEncroachmentModalOpen] = useState(false);
  const [isVerificationDetailDrawerOpen, setIsVerificationDetailDrawerOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<SiteVerification | null>(null);

  const [isVerificationDrawerOpen, setIsVerificationDrawerOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MonitoringDetailItem | null>(null);
  const [isStopWorkModalOpen, setIsStopWorkModalOpen] = useState(false);
  const [selectedProjectForStopWork, setSelectedProjectForStopWork] = useState<any>(null);
  const [isCriticalDefectsDrawerOpen, setIsCriticalDefectsDrawerOpen] = useState(false);
  const [isEscalateDirectorateModalOpen, setIsEscalateDirectorateModalOpen] = useState(false);
  const [selectedIssueForEscalation, setSelectedIssueForEscalation] = useState<SiteIssue | null>(null);

  const fetchMonitoringData = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsRes = await getMonitoringStats();
      setStats(statsRes);

      if (currentStatus === 'live' || currentStatus === 'progress') {
        const data = await getDailySiteUpdates({ 
          search: searchQuery,
          date: selectedCalendarDate || undefined
        });
        setDailyUpdates(data);
      } else if (currentStatus === 'attendance') {
        const [updatesData, missedData] = await Promise.all([
          getDailySiteUpdates({ search: searchQuery, date: selectedCalendarDate || undefined }),
          getMissedSiteVisits({ 
            search: searchQuery, 
            reason: selectedReasonFilter !== 'ALL' ? selectedReasonFilter : undefined, 
            date: selectedCalendarDate || undefined 
          })
        ]);
        setDailyUpdates(updatesData);
        setMissedVisits(missedData);
      } else if (currentStatus === 'observations') {
        const data = await getFieldObservations({ search: searchQuery });
        setObservations(data);
      } else if (currentStatus === 'issues') {
        const data = await getSiteIssues({ search: searchQuery });
        setIssues(data);
      } else if (currentStatus === 'milestones') {
        const data = await getMilestones({ 
          search: searchQuery,
          phase: selectedPhaseFilter !== 'ALL' ? selectedPhaseFilter : undefined,
          status: selectedStatusFilter !== 'ALL' ? selectedStatusFilter : undefined
        });
        setMilestones(data);
      } else if (currentStatus === 'verification') {
        const data = await getSiteVerifications({ 
          search: searchQuery,
          method: selectedVerificationMethodFilter !== 'ALL' ? selectedVerificationMethodFilter : undefined,
          status: selectedVerificationStatusFilter !== 'ALL' ? selectedVerificationStatusFilter : undefined,
        });
        setVerifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch monitoring data", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus, searchQuery, selectedCalendarDate, selectedReasonFilter, selectedPhaseFilter, selectedStatusFilter, selectedVerificationMethodFilter, selectedVerificationStatusFilter]);

  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  // Page content definition based on current tab
  const getPageContent = () => {
    switch (currentStatus) {
      case 'attendance':
        return {
          title: "Field Attendance & Non-Visitation Control",
          subtitle: "Internal control history tracking government field worker site visits, unfulfilled visit justifications, and developer access audits.",
          overview: [
            { label: "Total Scheduled Visits", value: ((dailyUpdates.length + missedVisits.length) || 12), icon: Calendar, color: "blue" },
            { label: "Verified Inspector Visits", value: dailyUpdates.length || 9, icon: CheckCircle, color: "emerald" },
            { label: "Justified Missed Visits", value: missedVisits.filter(m => m.status === 'JUSTIFIED' || m.status === 'ACKNOWLEDGED').length || 3, icon: ShieldCheck, color: "amber" },
            { label: "Flagged / Review Required", value: missedVisits.filter(m => m.status === 'FLAGGED_UNJUSTIFIED' || m.status === 'SUBMITTED').length || 1, icon: AlertTriangle, color: "red" },
          ],
          actions: [
            "⚠️ Document Missed Site Visit",
            "📊 Review Inspector Compliance",
            "🌧️ Audit Weather / Road Blockers",
            "🔒 Inspect Denied Access Cases"
          ]
        };
      case 'progress':
        return {
          title: "Site Progress & Programme",
          subtitle: "Monitor physical construction progress against approved project schedules and reported milestone completion.",
          overview: [
            { label: "On Schedule Sites", value: stats?.progress?.on_schedule ?? 0, icon: CheckCircle, color: "emerald" },
            { label: "Delayed Milestones", value: stats?.progress?.delayed ?? 0, icon: AlertCircle, color: "red" },
            { label: "Milestones Reached", value: stats?.progress?.milestone_reached ?? 0, icon: Activity, color: "blue" },
            { label: "Progress Reports", value: stats?.progress?.progress_reports ?? dailyUpdates.length, icon: FileText, color: "slate" },
          ],
          actions: ["📊 Update Site Progress", "View Progress Details", "Flag Delayed Progress", "Review Progress Report"]
        };
      case 'observations':
        return {
          title: "Field Observations",
          subtitle: "Centralized record of observations captured during government site visits, audits, and monitoring activities.",
          overview: [
            { label: "Active Observations", value: stats?.observations?.active ?? observations.length, icon: Eye, color: "blue" },
            { label: "Quality Points", value: stats?.observations?.quality ?? 0, icon: ShieldCheck, color: "orange" },
            { label: "Safety Concerns", value: stats?.observations?.safety ?? 0, icon: AlertTriangle, color: "red" },
            { label: "Resolved", value: stats?.observations?.resolved ?? 0, icon: CheckCircle, color: "emerald" },
          ],
          actions: ["📝 Add Field Observation", "Create Corrective Action", "Review Open Findings"]
        };
      case 'issues':
        return {
          title: "Site Issues & Regulatory Defects",
          subtitle: "Track construction defects, safety risks, non-conformances, and deviations requiring government resolution.",
          overview: [
            { label: "Open Issues", value: stats?.issues?.open ?? issues.length, icon: FolderOpen, color: "amber" },
            { label: "Critical Severity", value: stats?.issues?.critical ?? 0, icon: AlertCircle, color: "red" },
            { label: "Under Review", value: stats?.issues?.under_review ?? 0, icon: Clock, color: "blue" },
            { label: "Resolved Issues", value: stats?.issues?.resolved ?? 0, icon: CheckCircle, color: "emerald" },
          ],
          actions: ["⚠️ Report Site Issue", "Review Critical Defects", "Escalate to Directorate"]
        };
      case 'milestones':
        return {
          title: "Construction Milestones Programme",
          subtitle: "Statutory construction milestone schedule, verification gate enforcement, test evidence audit, and BIM tolerance tracking.",
          overview: [
            { label: "Total Milestones", value: stats?.milestones?.total ?? milestones.length, icon: Layers, color: "slate" },
            { label: "Due This Week", value: stats?.milestones?.due_this_week ?? 0, icon: Calendar, color: "amber" },
            { label: "Pending Verification", value: stats?.milestones?.pending_verification ?? 0, icon: ShieldCheck, color: "purple" },
            { label: "Statutory Verified", value: stats?.milestones?.verified ?? 0, icon: CheckCircle, color: "emerald" },
            { label: "Delayed / Blocked", value: (stats?.milestones?.delayed ?? 0) + (stats?.milestones?.blocked ?? 0), icon: AlertTriangle, color: "red" },
          ],
          actions: [
            "➕ Add Construction Milestone", 
            "🏗 Verify Milestone", 
            "📊 Update Milestone Progress", 
            "🚩 Flag Milestone Delay",
            "Review Critical Defects"
          ]
        };
      case 'verification':
        return {
          title: "Cadastral Site Verification & GNSS Rover Audits",
          subtitle: "Statutory boundary coordinate validation, dual-frequency GNSS RTK rover telemetry, setback compliance, and digital certification.",
          overview: [
            { label: "Total Verifications", value: verifications.length || (stats?.verification?.verified ?? 0), icon: Layers, color: "slate" },
            { label: "Statutory Certified", value: verifications.filter(v => v.status === 'VERIFIED').length, icon: CheckCircle, color: "emerald" },
            { label: "Variance / Encroached", value: verifications.filter(v => v.variance_detected || v.encroachment_detected).length, icon: AlertTriangle, color: "red" },
            { label: "Active RTK Rovers", value: stats?.verification?.active_devices || 3, icon: Compass, color: "blue" },
          ],
          actions: [
            "➕ Record Site Verification",
            "🛡️ Certify Boundary Compliance",
            "⚠️ Flag Boundary Encroachment",
            "🎯 Sync RTK Rover Telemetry"
          ]
        };
      default: // live
        return {
          title: "Live Site View (Daily Updates)",
          subtitle: "Monitor daily photo updates from site supervisors and scheduled comprehensive drone and Trimble surveys.",
          overview: [
            { label: "Active Sites", value: stats?.live?.active_sites ?? 0, icon: Activity, color: "emerald" },
            { label: "Daily Photos Uploaded", value: stats?.live?.daily_photos ?? dailyUpdates.length, icon: Clock, color: "blue" },
            { label: "Drone Surveys", value: stats?.live?.drone_surveys ?? 0, icon: MapPin, color: "purple" },
            { label: "Active Observations", value: stats?.live?.active_observations ?? 0, icon: Eye, color: "indigo" },
          ],
          actions: ["📍 View Latest Daily Photos", "Upload Daily Site Update", "Add Field Observation", "Report Site Issue"]
        };
    }
  };

  const content = getPageContent();

  const handleAcknowledgeMissedVisit = async (id: string, isJustified: boolean = true) => {
    try {
      await acknowledgeMissedSiteVisit(id, {
        status: isJustified ? 'JUSTIFIED' : 'FLAGGED_UNJUSTIFIED',
        supervisor_acknowledgment: isJustified 
          ? 'Reviewed and formally justified by Directorate Supervisor'
          : 'Flagged for internal compliance audit and field verification'
      });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: isJustified ? 'Missed site visit justified & acknowledged' : 'Record flagged for investigation', 
          type: 'success' 
        }
      }));
      fetchMonitoringData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to update missed visit record', type: 'error' }
      }));
    }
  };

  const handleQuickAction = (action: string) => {
    if (action.includes("Missed Site Visit") || action.includes("Document Missed") || action.includes("Non-Attendance") || action.includes("Blockers") || action.includes("Compliance")) {
      setIsMissedVisitModalOpen(true);
    } else if (action.includes("Record Site Verification") || action.includes("Start Site Verification")) {
      setIsRecordVerificationModalOpen(true);
    } else if (action.includes("Certify Boundary Compliance") || (currentStatus === 'verification' && action.includes("Certify"))) {
      const candidate = verifications.find(v => v.status !== 'VERIFIED') || verifications[0];
      if (candidate) {
        setSelectedVerification(candidate);
        setIsCertifyVerificationModalOpen(true);
      } else {
        setIsRecordVerificationModalOpen(true);
      }
    } else if (action.includes("Flag Boundary Encroachment") || (currentStatus === 'verification' && action.includes("Flag"))) {
      const candidate = verifications.find(v => !v.encroachment_detected) || verifications[0];
      if (candidate) {
        setSelectedVerification(candidate);
        setIsFlagEncroachmentModalOpen(true);
      }
    } else if (action.includes("Sync RTK Rover") || action.includes("Rover Telemetry")) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'RTK telemetry synced from CORS base stations across 3 active rovers.', type: 'success' }
      }));
    } else if (action.includes("Add Construction Milestone") || action.includes("Schedule Milestone")) {
      setIsCreateMilestoneModalOpen(true);
    } else if (action.includes("Update Milestone Progress")) {
      const candidate = milestones.find(m => m.status !== 'VERIFIED') || milestones[0];
      if (candidate) {
        setSelectedMilestone(candidate);
        setIsUpdateProgressModalOpen(true);
      } else {
        setIsCreateMilestoneModalOpen(true);
      }
    } else if (action.includes("Flag Milestone Delay")) {
      const candidate = milestones.find(m => m.status !== 'VERIFIED') || milestones[0];
      if (candidate) {
        setSelectedMilestone(candidate);
        setIsFlagDelayModalOpen(true);
      } else {
        setIsCreateMilestoneModalOpen(true);
      }
    } else if (action.includes("Verify Milestone") || (currentStatus === 'milestones' && action.includes("Verify"))) {
      const candidate = milestones.find(m => m.status === 'PENDING_VERIFICATION' || m.status === 'DUE_THIS_WEEK' || m.status === 'IN_PROGRESS') || milestones[0];
      if (candidate) {
        setSelectedMilestone(candidate);
        setIsMilestoneModalOpen(true);
      } else {
        setIsCreateMilestoneModalOpen(true);
      }
    } else if (action.includes("Review Critical Defects") || action.includes("Critical Defects")) {
      setIsCriticalDefectsDrawerOpen(true);
    } else if (action.includes("Escalate to Directorate") || action.includes("Directorate")) {
      setSelectedIssueForEscalation(null);
      setIsEscalateDirectorateModalOpen(true);
    } else if (action.includes("View Progress Details") || action.includes("Review Progress Report") || action.includes("Progress Details")) {
      setIsProgressDetailModalOpen(true);
    } else if (action.includes("Flag Delayed Progress")) {
      setIsIssueModalOpen(true);
    } else if (action.includes("View Latest Daily Photos") || action.includes("View Latest Daily") || action.includes("Latest Daily") || action.includes("Photos")) {
      setIsPhotosGalleryOpen(true);
    } else if (action.includes("Daily Photo") || action.includes("Update Site Progress") || action.includes("Upload Daily")) {
      setIsUpdateDrawerOpen(true);
    } else if (action.includes("Field Observation")) {
      setIsObservationModalOpen(true);
    } else if (action.includes("Report Site Issue")) {
      setIsIssueModalOpen(true);
    } else if (action.includes("Site Verification") || action.includes("Coordinates") || action.includes("Rover")) {
      setIsRecordVerificationModalOpen(true);
    }
  };

  const getMilestoneStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING_VERIFICATION':
        return 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse';
      case 'DUE_THIS_WEEK':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELAYED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'BLOCKED':
        return 'bg-red-600 text-white border-red-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="h-full flex flex-col pt-1 sm:pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 min-w-0">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 mb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <MonitorPlay size={20} />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#022C4F] leading-tight">
              Site Monitoring Workspace
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            {content.subtitle}
          </p>
        </div>
        <TopRightControls />
      </div>

      {/* Tabs & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide max-w-full">
          {TABS.map((tab) => {
            const isActive = currentStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(`/government/dashboard/monitoring/${tab.id}`)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-[#022C4F] text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
          {/* Document Missed Visit Quick Action Button */}
          <button
            onClick={() => setIsMissedVisitModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer text-center"
          >
            <AlertTriangle size={15} /> 
            Document Missed Visit
          </button>

          {currentStatus === 'milestones' && (
            <button
              onClick={() => {
                const candidate = milestones.find(m => m.status === 'PENDING_VERIFICATION' || m.status === 'DUE_THIS_WEEK' || m.status === 'IN_PROGRESS') || milestones[0];
                if (candidate) {
                  setSelectedMilestone(candidate);
                  setIsMilestoneModalOpen(true);
                } else {
                  setIsCreateMilestoneModalOpen(true);
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer text-center"
            >
              <ShieldCheck size={16} /> 
              Verify Milestone
            </button>
          )}

          <button
            onClick={() => {
              if (currentStatus === 'milestones') setIsCreateMilestoneModalOpen(true);
              else if (currentStatus === 'observations') setIsObservationModalOpen(true);
              else if (currentStatus === 'issues') setIsIssueModalOpen(true);
              else if (currentStatus === 'verification') setIsVerificationDrawerOpen(true);
              else if (currentStatus === 'attendance') setIsMissedVisitModalOpen(true);
              else setIsUpdateDrawerOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer text-center"
          >
            <Plus size={16} /> 
            {currentStatus === 'milestones' ? 'Schedule Milestone' :
             currentStatus === 'observations' ? 'Add Observation' :
             currentStatus === 'issues' ? 'Report Issue' :
             currentStatus === 'verification' ? 'Start Verification' : 
             currentStatus === 'attendance' ? 'Document Non-Attendance' : 'Publish Daily Update'}
          </button>
        </div>
      </div>

      {/* Dynamic Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 min-w-0">
        {/* Overview Stats */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {content.overview.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <stat.icon size={20} />
                </div>
                <span className="text-2xl font-black text-[#022C4F]">{stat.value}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Action Panel (Zero Dead Buttons) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2">
            <MonitorPlay size={18} /> Quick Actions
          </h3>
          <div className="flex flex-col gap-2 mt-auto">
            {content.actions.map((action, idx) => (
              <button 
                key={idx} 
                onClick={() => handleQuickAction(action)}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-colors text-left flex items-center justify-between group cursor-pointer"
              >
                {action}
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Monitoring List / Grid Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
            <Activity size={18} /> {content.title}
          </h2>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records..."
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
              />
            </div>

            {/* Calendar Date Picker Filter for Live & Attendance */}
            {(currentStatus === 'live' || currentStatus === 'attendance' || currentStatus === 'progress') && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
                <Calendar size={13} className="text-blue-600 shrink-0" />
                <input
                  type="date"
                  value={selectedCalendarDate}
                  onChange={(e) => setSelectedCalendarDate(e.target.value)}
                  className="text-xs text-slate-700 font-semibold bg-transparent focus:outline-none"
                  title="Filter by inspection calendar date"
                />
                {selectedCalendarDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDate('')}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 ml-1 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Layout Toggles for Milestones */}
            {currentStatus === 'milestones' ? (
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
                <button
                  onClick={() => setMilestoneLayout('list')}
                  title="Audit Register (Table)"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    milestoneLayout === 'list' ? 'bg-slate-100 text-[#022C4F] font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => setMilestoneLayout('grid')}
                  title="Interactive Cards (Grid)"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    milestoneLayout === 'grid' ? 'bg-slate-100 text-[#022C4F] font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setMilestoneLayout('timeline')}
                  title="Gantt Stage Sequencer"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    milestoneLayout === 'timeline' ? 'bg-slate-100 text-[#022C4F] font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <GitCommit size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-slate-100 text-[#022C4F]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-slate-100 text-[#022C4F]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            )}

            <button
              onClick={() => fetchMonitoringData()}
              title="Refresh Records"
              className="p-2 text-slate-500 hover:text-[#022C4F] hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Non-Attendance / Attendance Reason Filter Bar */}
        {currentStatus === 'attendance' && (
          <div className="p-3 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Filter Reason:</span>
              {REASON_FILTER_OPTIONS.map(rf => (
                <button
                  key={rf.id}
                  onClick={() => setSelectedReasonFilter(rf.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedReasonFilter === rf.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Construction Milestones Filter Bar */}
        {currentStatus === 'milestones' && (
          <div className="p-3 border-b border-slate-100 bg-white space-y-2">
            {/* Phase Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Phase:</span>
              {PHASE_FILTERS.map(ph => (
                <button
                  key={ph.id}
                  onClick={() => setSelectedPhaseFilter(ph.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedPhaseFilter === ph.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ph.label}
                </button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Status:</span>
              {STATUS_FILTERS.map(st => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStatusFilter === st.id
                      ? 'bg-[#022C4F] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Render Area */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="animate-spin text-blue-600" size={32} />
              <p className="text-sm font-semibold">Loading live monitoring telemetry...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Live Site View */}
              {currentStatus === 'live' && (
                dailyUpdates.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Camera size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No daily site updates recorded yet.</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                    {dailyUpdates.map(update => (
                      <div 
                        key={update.id} 
                        onClick={() => setSelectedDetailItem({ type: 'update', data: update })}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-1/3 min-w-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            {update.update_type === 'DRONE_SURVEY' ? <MapPin size={20} /> : <Camera size={20} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors truncate">{update.project_name}</h4>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <span className="text-[11px] font-bold text-[#022C4F] flex items-center gap-1">
                                <User size={11} className="text-blue-600" />
                                {update.inspector_name || 'Engr. Abdulwahab Onike'}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {update.inspector_badge || 'LASG-INSP-STR-042'}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                                <BadgeCheck size={10} /> Field Verified
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-1/4">
                          <p className="text-xs text-slate-600 font-medium line-clamp-1">{update.work_summary || 'Daily progress logged'}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{update.site_weather || 'Clear / Sunny'} • {update.active_workers_count || update.workforce_count || 30} Workers On-Site</p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-1/5 text-xs text-slate-500">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>{update.inspection_date || new Date(update.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-3 justify-start md:justify-end w-full md:w-auto">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {update.update_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab: Field Attendance & Non-Visitation Internal Control */}
              {currentStatus === 'attendance' && (
                <div className="space-y-4">
                  {/* Notice & Control Header */}
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <ShieldAlert size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                          Internal Control &amp; Field Worker Performance Audit Roster
                        </h4>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          Daily site updates originate directly from field inspectors. If an inspector is unable to visit a scheduled site or submit an update, an auditable justification must be documented with photographic evidence.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMissedVisitModalOpen(true)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm shrink-0 cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Document Missed Visit
                    </button>
                  </div>

                  {/* Missed Visits Record List */}
                  {missedVisits.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 p-6">
                      <CheckCircle size={40} className="mx-auto mb-3 text-emerald-400" />
                      <h4 className="text-sm font-bold text-slate-700">100% Field Attendance &amp; Zero Unjustified Misses</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                        All scheduled field inspections are verified or no non-visitation records match the current filter criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {missedVisits.map(record => (
                        <div 
                          key={record.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                                {record.record_reference || `MSV-${record.id.slice(0, 8).toUpperCase()}`}
                              </span>
                              <h4 className="text-sm font-bold text-[#022C4F]">{record.project_name}</h4>
                              <span className="text-xs text-slate-400 font-semibold">• {record.project_location || 'Lagos'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                record.status === 'JUSTIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                record.status === 'FLAGGED_UNJUSTIFIED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {record.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Inspector</span>
                              <p className="font-bold text-[#022C4F] mt-0.5">{record.inspector_name}</p>
                              <span className="text-[10px] font-mono text-slate-500">{record.inspector_badge || 'LASG-INSP'}</span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Date</span>
                              <p className="font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                                <Calendar size={12} className="text-blue-600" /> {record.scheduled_date}
                              </p>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason Category</span>
                              <span className="inline-block mt-0.5 font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                                {record.reason_display || record.reason_category.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Inspector Justification Notes:</span>
                            <p className="text-slate-700 font-medium leading-relaxed">{record.justification_notes}</p>
                          </div>

                          {record.evidence_photos && record.evidence_photos.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attached Field Evidence Photos:</span>
                              <div className="flex gap-2 overflow-x-auto pb-1">
                                {record.evidence_photos.map((photo, pIdx) => (
                                  <a key={pIdx} href={photo} target="_blank" rel="noopener noreferrer" className="block relative w-24 h-16 rounded-lg overflow-hidden border border-slate-200 group shrink-0">
                                    <img src={photo} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Supervisor Acknowledgment Footer */}
                          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="text-[11px] text-slate-500">
                              {record.supervisor_acknowledgment ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <BadgeCheck size={13} /> {record.supervisor_acknowledgment}
                                </span>
                              ) : (
                                <span className="text-amber-700 font-medium">Pending Directorate Supervisor Review</span>
                              )}
                            </div>

                            {!record.supervisor_acknowledgment && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAcknowledgeMissedVisit(record.id, false)}
                                  className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  Flag Unjustified
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAcknowledgeMissedVisit(record.id, true)}
                                  className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[11px] font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Check size={12} /> Acknowledge Justification
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Site Progress */}
              {currentStatus === 'progress' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Activity className="text-blue-600 shrink-0" size={20} />
                      <div>
                        <h4 className="text-xs font-bold text-[#022C4F]">Programme Progress vs Statutory Milestones</h4>
                        <p className="text-[11px] text-slate-500">Track real-time stage completion across active high-rise and residential developments.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsUpdateDrawerOpen(true)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shrink-0 cursor-pointer text-center"
                    >
                      Update Site Progress
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {milestones.map(m => (
                      <div 
                        key={m.id}
                        onClick={() => {
                          setSelectedMilestone(m);
                          setIsMilestoneDetailDrawerOpen(true);
                        }}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all space-y-3 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase text-blue-700 font-mono">
                              {m.milestone_code || `MS-${(m.id || '').substring(0, 4).toUpperCase() || '01'}`}
                            </span>
                            <h4 className="text-sm font-black text-[#022C4F] group-hover:text-blue-600 transition-colors truncate">{m.name}</h4>
                            <p className="text-xs text-slate-500 font-semibold truncate">{m.project_name}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border shrink-0 ${getMilestoneStatusBadge(m.status || 'PLANNED')}`}>
                            {(m.status || 'PLANNED').replace('_', ' ')}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Progress</span>
                            <span className="text-blue-700 font-black">{m.progress_percentage}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                m.status === 'VERIFIED' ? 'bg-emerald-500' :
                                m.status === 'DELAYED' ? 'bg-rose-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${m.progress_percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            <span>Target: {new Date(m.target_date).toLocaleDateString()}</span>
                          </div>
                          <span className="text-[11px] font-bold text-blue-600 group-hover:underline">
                            Inspect Gate & Telemetry →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Field Observations */}
              {currentStatus === 'observations' && (
                observations.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Eye size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No field observations captured yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {observations.map(obs => (
                      <div 
                        key={obs.id} 
                        onClick={() => setSelectedDetailItem({ type: 'observation', data: obs })}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-1/3 min-w-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                            <Eye size={20} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-orange-600 transition-colors truncate">{obs.title}</h4>
                            <p className="text-xs text-slate-400 font-semibold truncate">{obs.observation_reference} • {obs.project_name}</p>
                          </div>
                        </div>

                        <div className="w-full md:w-1/4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            obs.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                            obs.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            obs.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {obs.severity} Severity
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-1/5 text-xs text-slate-500">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          <span>{new Date(obs.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-3 justify-start md:justify-end w-full md:w-auto">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {obs.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab 4: Site Issues */}
              {currentStatus === 'issues' && (
                issues.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <AlertTriangle size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No site issues reported.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {issues.map(iss => (
                      <div 
                        key={iss.id} 
                        onClick={() => setSelectedDetailItem({ type: 'issue', data: iss })}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-red-200 hover:shadow-md transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-1/3 min-w-0">
                          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            iss.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-red-50 text-red-600'
                          }`}>
                            <AlertTriangle size={20} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-bold text-[#022C4F] group-hover:text-red-600 transition-colors truncate">{iss.title}</h4>
                              {iss.is_escalated && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-0.5 shrink-0">
                                  <Gavel size={9} /> Escalated
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-semibold truncate">{iss.issue_reference} • {iss.project_name}</p>
                          </div>
                        </div>

                        <div className="w-full md:w-1/5">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            iss.severity === 'CRITICAL' ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30' : 
                            iss.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {iss.severity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-1/5 text-xs text-slate-500">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{iss.assigned_to_name || 'Site Engineer'}</span>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            iss.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {iss.status}
                          </span>

                          {!iss.is_escalated && iss.status !== 'RESOLVED' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIssueForEscalation(iss);
                                setIsEscalateDirectorateModalOpen(true);
                              }}
                              title="Escalate to Directorate"
                              className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                            >
                              <Gavel size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProjectForStopWork({
                                id: iss.project,
                                name: iss.project_name
                              });
                              setIsStopWorkModalOpen(true);
                            }}
                            title="Issue Stop-Work Order"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                          >
                            <AlertOctagon size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Tab 5: Construction Milestones */}
              {currentStatus === 'milestones' && (
                milestones.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <CheckCircle size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No milestones match selected filter criteria.</p>
                    <button
                      onClick={() => setIsCreateMilestoneModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      ➕ Schedule New Milestone
                    </button>
                  </div>
                ) : (
                  <>
                    {/* LAYOUT 1: Audit Register Table */}
                    {milestoneLayout === 'list' && (
                      <div className="flex flex-col gap-3">
                        {milestones.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => {
                              setSelectedMilestone(m);
                              setIsMilestoneDetailDrawerOpen(true);
                            }}
                            className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer"
                          >
                            {/* Col 1: Code & Name */}
                            <div className="flex items-center gap-3.5 md:w-1/3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                                m.status === 'VERIFIED' ? 'bg-emerald-600 shadow-emerald-600/20' :
                                m.status === 'DELAYED' ? 'bg-rose-600 shadow-rose-600/20' :
                                m.status === 'BLOCKED' ? 'bg-red-700 shadow-red-700/20' : 'bg-[#022C4F]'
                              }`}>
                                {m.status === 'VERIFIED' ? <ShieldCheck size={20} /> :
                                 m.status === 'DELAYED' ? <AlertTriangle size={20} /> : <Layers size={20} />}
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                                    {m.milestone_code || `MS-${(m.id || '').substring(0, 4).toUpperCase() || '01'}`}
                                  </span>
                                  {m.critical_path && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                                      Critical Path
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-black text-[#022C4F] group-hover:text-blue-600 transition-colors truncate mt-0.5">
                                  {m.name}
                                </h4>
                                <p className="text-xs text-slate-400 font-semibold truncate">{m.project_name}</p>
                              </div>
                            </div>

                            {/* Col 2: Phase & Dates */}
                            <div className="md:w-1/4 space-y-1 text-xs">
                              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                                <Layers size={13} className="text-slate-400" />
                                <span>{m.phase || 'SUPERSTRUCTURE'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                <Calendar size={13} className="text-slate-400" />
                                <span>Target: {new Date(m.target_date).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Col 3: Progress Bar */}
                            <div className="md:w-1/4 space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500">Progress</span>
                                <span className="text-blue-700 font-black">{m.progress_percentage}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    m.status === 'VERIFIED' ? 'bg-emerald-500' :
                                    m.status === 'DELAYED' ? 'bg-rose-500' :
                                    m.status === 'BLOCKED' ? 'bg-red-600' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${m.progress_percentage}%` }}
                                />
                              </div>
                            </div>

                            {/* Col 4: Status & Actions */}
                            <div className="md:w-1/4 flex items-center justify-between md:justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${getMilestoneStatusBadge(m.status || 'PLANNED')}`}>
                                {(m.status || 'PLANNED').replace('_', ' ')}
                              </span>

                              <div className="flex items-center gap-1">
                                {m.status !== 'VERIFIED' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedMilestone(m);
                                      setIsMilestoneModalOpen(true);
                                    }}
                                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                    title="Verify Milestone"
                                  >
                                    <ShieldCheck size={16} />
                                  </button>
                                ) : (
                                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700" title="Verified & Certified">
                                    <CheckCircle size={16} />
                                  </span>
                                )}

                                <button
                                  onClick={() => {
                                    setSelectedMilestone(m);
                                    setIsMilestoneDetailDrawerOpen(true);
                                  }}
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                  title="View Details"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* LAYOUT 2: Interactive Grid Cards */}
                    {milestoneLayout === 'grid' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {milestones.map(m => (
                          <div 
                            key={m.id}
                            onClick={() => {
                              setSelectedMilestone(m);
                              setIsMilestoneDetailDrawerOpen(true);
                            }}
                            className="p-5 rounded-3xl border border-slate-200/90 bg-white hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                  {m.milestone_code || `MS-${(m.id || '').substring(0, 4).toUpperCase() || '01'}`}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getMilestoneStatusBadge(m.status || 'PLANNED')}`}>
                                  {(m.status || 'PLANNED').replace('_', ' ')}
                                </span>
                              </div>

                              <div>
                                <h4 className="text-sm font-black text-[#022C4F] group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {m.name}
                                </h4>
                                <p className="text-xs text-slate-400 font-semibold line-clamp-1 mt-0.5">
                                  {m.project_name}
                                </p>
                              </div>

                              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                  <span>Physical Progress</span>
                                  <span className="text-blue-700 font-black">{m.progress_percentage}%</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      m.status === 'VERIFIED' ? 'bg-emerald-500' :
                                      m.status === 'DELAYED' ? 'bg-rose-500' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${m.progress_percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 space-y-3">
                              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>Target: <strong>{new Date(m.target_date).toLocaleDateString()}</strong></span>
                                <span className="text-[10px] font-black uppercase text-slate-400">{m.phase}</span>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setSelectedMilestone(m);
                                    setIsMilestoneDetailDrawerOpen(true);
                                  }}
                                  className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors text-center"
                                >
                                  View Details
                                </button>
                                {m.status !== 'VERIFIED' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedMilestone(m);
                                      setIsMilestoneModalOpen(true);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-all"
                                  >
                                    <ShieldCheck size={14} /> Verify
                                  </button>
                                ) : (
                                  <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                                    <CheckCircle size={13} /> Certified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* LAYOUT 3: Timeline Stage Sequencer */}
                    {milestoneLayout === 'timeline' && (
                      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 my-4 ml-4">
                        {milestones.map((m, idx) => (
                          <div 
                            key={m.id}
                            onClick={() => {
                              setSelectedMilestone(m);
                              setIsMilestoneDetailDrawerOpen(true);
                            }}
                            className="relative group cursor-pointer"
                          >
                            {/* Dot indicator */}
                            <div className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${
                              m.status === 'VERIFIED' ? 'bg-emerald-600 ring-4 ring-emerald-100' :
                              m.status === 'DELAYED' ? 'bg-rose-600 ring-4 ring-rose-100' :
                              m.status === 'BLOCKED' ? 'bg-red-700 ring-4 ring-red-100' : 'bg-blue-600 ring-4 ring-blue-100'
                            }`}>
                              {idx + 1}
                            </div>

                            <div className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                      {m.milestone_code || `MS-${(m.id || '').substring(0, 4).toUpperCase() || '01'}`}
                                    </span>
                                    <span className="text-xs font-black text-slate-400 uppercase">{m.phase || 'SUPERSTRUCTURE'}</span>
                                    {m.critical_path && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800">
                                        Critical Path
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-base font-black text-[#022C4F] group-hover:text-blue-600 transition-colors mt-1">
                                    {m.name}
                                  </h4>
                                </div>

                                <span className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase border self-start ${getMilestoneStatusBadge(m.status || 'PLANNED')}`}>
                                  {(m.status || 'PLANNED').replace('_', ' ')}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {m.description || m.physical_progress_notes || 'Statutory construction phase.'}
                              </p>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Date</span>
                                  <span className="font-bold text-slate-800">{new Date(m.target_date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Progress</span>
                                  <span className="font-bold text-blue-700">{m.progress_percentage}%</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Risk Level</span>
                                  <span className="font-bold text-slate-800">{m.risk_level}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Evidence Docs</span>
                                  <span className="font-bold text-slate-800">{(m.evidence_documents || []).length} Attached</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )
              )}

              {/* Tab 6: Cadastral Site Verification & GNSS Rover Audits */}
              {currentStatus === 'verification' && (
                <>
                  {/* Verification Filter & Layout Toolbar */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      {/* Method Filter */}
                      <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                        <span className="text-xs font-bold text-slate-500 shrink-0">Method:</span>
                        <select
                          value={selectedVerificationMethodFilter}
                          onChange={(e) => setSelectedVerificationMethodFilter(e.target.value)}
                          className="w-full sm:w-auto px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        >
                          {VERIFICATION_METHOD_FILTERS.map(f => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                        <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
                        <select
                          value={selectedVerificationStatusFilter}
                          onChange={(e) => setSelectedVerificationStatusFilter(e.target.value)}
                          className="w-full sm:w-auto px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        >
                          {VERIFICATION_STATUS_FILTERS.map(f => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Layout Switcher & Action Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                      <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm text-xs font-bold overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setVerificationLayout('table')}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                            verificationLayout === 'table' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <List size={13} /> Table
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerificationLayout('cards')}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                            verificationLayout === 'cards' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <LayoutGrid size={13} /> Cards
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerificationLayout('map')}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                            verificationLayout === 'map' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Compass size={13} /> Map
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsRecordVerificationModalOpen(true)}
                        className="px-4 py-2 bg-[#022C4F] hover:bg-blue-900 text-white rounded-xl text-xs font-black shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Plus size={14} /> Record Verification
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {verifications.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                      <Compass size={44} className="mx-auto mb-3 text-slate-300" />
                      <h3 className="text-base font-bold text-slate-700">No site verifications found</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        No cadastral coordinate surveys or setback audits match your active filters.
                      </p>
                      <button
                        onClick={() => setIsRecordVerificationModalOpen(true)}
                        className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        ➕ Record First Site Verification
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* LAYOUT 1: Cadastral Table Matrix */}
                      {verificationLayout === 'table' && (
                        <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-sm">
                          <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Verification Ref & Method</th>
                                <th className="py-3.5 px-4">Construction Project</th>
                                <th className="py-3.5 px-4">Cadastral Beacons</th>
                                <th className="py-3.5 px-4">Variance & Tolerance</th>
                                <th className="py-3.5 px-4">Setback Clearance</th>
                                <th className="py-3.5 px-4">Status & Seal</th>
                                <th className="py-3.5 px-4 text-right">Quick Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {verifications.map((vrf) => {
                                const isVariance = vrf.variance_detected || (vrf.variance_meters > (vrf.tolerance_limit_meters || 0.05));
                                return (
                                  <tr 
                                    key={vrf.id}
                                    onClick={() => {
                                      setSelectedVerification(vrf);
                                      setIsVerificationDetailDrawerOpen(true);
                                    }}
                                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                                  >
                                    <td className="py-3.5 px-4">
                                      <div className="font-mono text-xs font-black text-blue-700">
                                        {vrf.verification_reference}
                                      </div>
                                      <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                                        <Radio size={11} className="text-blue-500" />
                                        {vrf.method?.replace(/_/g, ' ')}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-[160px]">
                                        {vrf.device_identifier}
                                      </div>
                                    </td>

                                    <td className="py-3.5 px-4">
                                      <div className="font-black text-[#022C4F] text-xs group-hover:text-blue-600 transition-colors">
                                        {vrf.project_name}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        {vrf.project_location || 'Lagos State'} • {vrf.project_reference || 'Ref #'}
                                      </div>
                                    </td>

                                    <td className="py-3.5 px-4">
                                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                                        {(vrf.cadastral_beacon_numbers || ['BC-LA-2026/089', 'BC-LA-2026/090']).slice(0, 2).map((b) => (
                                          <span key={b} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px] font-bold">
                                            {b}
                                          </span>
                                        ))}
                                        {(vrf.cadastral_beacon_numbers || []).length > 2 && (
                                          <span className="text-[10px] text-slate-400 font-bold self-center">
                                            +{(vrf.cadastral_beacon_numbers || []).length - 2} more
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className={`font-mono text-xs font-black ${isVariance ? 'text-rose-600' : 'text-emerald-700'}`}>
                                          {vrf.variance_meters}m
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                          isVariance ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                          {isVariance ? 'EXCEEDS' : 'PASS ≤ 50mm'}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                        ΔElev: {vrf.elevation_variance_meters || 0.01}m
                                      </div>
                                    </td>

                                    <td className="py-3.5 px-4">
                                      {vrf.encroachment_detected ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit">
                                          <AlertTriangle size={10} /> Encroached
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                                          <CheckCircle size={10} /> Setback Clear
                                        </span>
                                      )}
                                    </td>

                                    <td className="py-3.5 px-4">
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-block ${
                                        vrf.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                        vrf.status === 'VARIANCE_DETECTED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                        vrf.status === 'FLAGGED' ? 'bg-red-600 text-white shadow-sm' :
                                        'bg-amber-100 text-amber-800 border border-amber-200'
                                      }`}>
                                        {vrf.status?.replace(/_/g, ' ')}
                                      </span>
                                      {vrf.digital_cert_ref && (
                                        <div className="text-[9px] font-mono text-slate-500 font-bold mt-1 flex items-center gap-0.5">
                                          <Lock size={9} className="text-emerald-600" /> {vrf.digital_cert_ref}
                                        </div>
                                      )}
                                    </td>

                                    <td className="py-3.5 px-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                        {vrf.status !== 'VERIFIED' && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedVerification(vrf);
                                              setIsCertifyVerificationModalOpen(true);
                                            }}
                                            title="Certify Site Verification"
                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                                          >
                                            <ShieldCheck size={12} /> Certify
                                          </button>
                                        )}

                                        {!vrf.encroachment_detected && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedVerification(vrf);
                                              setIsFlagEncroachmentModalOpen(true);
                                            }}
                                            title="Flag Setback Encroachment"
                                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                                          >
                                            <AlertTriangle size={13} />
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedVerification(vrf);
                                            setIsVerificationDetailDrawerOpen(true);
                                          }}
                                          title="Inspect Details"
                                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                        >
                                          <ChevronRight size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* LAYOUT 2: Spatial Cards Grid */}
                      {verificationLayout === 'cards' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {verifications.map((vrf) => {
                            const isVariance = vrf.variance_detected || (vrf.variance_meters > (vrf.tolerance_limit_meters || 0.05));
                            return (
                              <div
                                key={vrf.id}
                                onClick={() => {
                                  setSelectedVerification(vrf);
                                  setIsVerificationDetailDrawerOpen(true);
                                }}
                                className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all space-y-4 group cursor-pointer"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                        {vrf.verification_reference}
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                                        {vrf.method?.replace(/_/g, ' ')}
                                      </span>
                                    </div>
                                    <h4 className="text-base font-black text-[#022C4F] group-hover:text-blue-600 transition-colors mt-1">
                                      {vrf.project_name}
                                    </h4>
                                    <p className="text-xs text-slate-400 font-medium">{vrf.device_identifier}</p>
                                  </div>

                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                    vrf.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                                    vrf.status === 'VARIANCE_DETECTED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {vrf.status?.replace(/_/g, ' ')}
                                  </span>
                                </div>

                                {/* Variance Meter */}
                                <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                                  isVariance ? 'bg-rose-50/70 border-rose-200 text-rose-950' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                }`}>
                                  <div>
                                    <span className="text-[10px] font-bold uppercase block opacity-80">Spatial Displacement</span>
                                    <span className="font-mono text-base font-black">
                                      {vrf.variance_meters}m <span className="text-xs font-normal">({Math.round(vrf.variance_meters * 1000)}mm)</span>
                                    </span>
                                  </div>
                                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                                    isVariance ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
                                  }`}>
                                    {isVariance ? 'Exceeds Tolerance' : 'Within 50mm Limit'}
                                  </span>
                                </div>

                                {/* Cadastral Beacons & Rover Telemetry */}
                                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Boundary Beacons</span>
                                    <div className="font-mono text-[11px] font-bold text-slate-700 truncate">
                                      {(vrf.cadastral_beacon_numbers || ['BC-LA-2026/089']).join(', ')}
                                    </div>
                                  </div>
                                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">GNSS Telemetry</span>
                                    <div className="font-mono text-[11px] font-bold text-blue-700">
                                      {vrf.telemetry_data?.satellites_tracked || 32} Sats • HDOP: {vrf.telemetry_data?.hdop || 0.58}
                                    </div>
                                  </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                                  <div className="text-[11px] text-slate-500 font-medium">
                                    Surveyor: <strong>{vrf.verified_by_name?.split(' ')[0] || 'Officer'}</strong>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {vrf.status !== 'VERIFIED' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedVerification(vrf);
                                          setIsCertifyVerificationModalOpen(true);
                                        }}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <ShieldCheck size={13} /> Certify
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedVerification(vrf);
                                        setIsVerificationDetailDrawerOpen(true);
                                      }}
                                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      Inspect <ChevronRight size={13} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* LAYOUT 3: Live Boundary & RTK Telemetry Map View */}
                      {verificationLayout === 'map' && (
                        <div className="p-6 rounded-3xl border border-slate-200 bg-slate-900 text-white shadow-xl space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                            <div>
                              <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                                <Activity size={15} className="animate-pulse" />
                                <span>LIVE GEODETIC CORS BASE STATION NETWORK</span>
                              </div>
                              <h3 className="text-lg font-black text-white mt-0.5">
                                Spatial Boundary Polygons & RTK Telemetry Map
                              </h3>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-mono font-bold">
                                LASG-CORS: 4/4 Connected
                              </span>
                            </div>
                          </div>

                          {/* Simulated Spatial Boundary Visual Canvas */}
                          <div className="relative w-full h-80 bg-slate-950 rounded-2xl border border-slate-800 p-6 overflow-hidden flex flex-col justify-between">
                            {/* Visual Grid Lines */}
                            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

                            {/* Top Diagnostics Overlay */}
                            <div className="relative z-10 flex justify-between items-start text-xs font-mono">
                              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-blue-300 space-y-0.5">
                                <div>Active Rover: Tersus Oscar GNSS RTK #042</div>
                                <div>Constellation: GPS (12), Galileo (8), GLONASS (7), BeiDou (5)</div>
                                <div className="text-emerald-400 font-bold">Fix Quality: RTK FIXED (±6.2mm)</div>
                              </div>

                              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-right space-y-0.5">
                                <div className="text-slate-400">Base Station Link: LASG-CORS-01</div>
                                <div className="text-slate-300">Correction Latency: 0.2s</div>
                                <div className="text-slate-400">Datum: Minna / UTM Zone 31N</div>
                              </div>
                            </div>

                            {/* Centered Boundary Polygon Graphic */}
                            <div className="relative z-10 mx-auto my-auto text-center space-y-3">
                              <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-blue-950/60 border border-blue-500/40 backdrop-blur shadow-2xl">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center gap-4 text-xs font-mono font-bold">
                                    <span className="text-blue-400">📍 BC-01 (6.425310, 3.421920)</span>
                                    <span className="text-emerald-400">──────────</span>
                                    <span className="text-blue-400">📍 BC-02 (6.425850, 3.422450)</span>
                                  </div>
                                  <div className="py-2 text-sm font-black text-white">
                                    Verified Masterplan Boundary Footprint • 4/4 Beacons Acquired
                                  </div>
                                  <div className="flex items-center justify-center gap-4 text-xs font-mono font-bold">
                                    <span className="text-blue-400">📍 BC-04 (6.424680, 3.422310)</span>
                                    <span className="text-emerald-400">──────────</span>
                                    <span className="text-blue-400">📍 BC-03 (6.425120, 3.422980)</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bottom Coordinates Stream */}
                            <div className="relative z-10 flex justify-between items-end text-[11px] font-mono text-slate-400">
                              <div>Lat: 6.425312° N | Lng: 3.421921° E | Elev: 4.16m MSL</div>
                              <div className="text-emerald-400 font-bold">Tolerance Deviation: 18mm (Compliant)</div>
                            </div>
                          </div>

                          {/* Quick Select Project Verifications */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold uppercase text-slate-400">Active Site Spatial Audits:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              {verifications.map((v) => (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedVerification(v);
                                    setIsVerificationDetailDrawerOpen(true);
                                  }}
                                  className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center justify-between text-[10px] font-mono text-blue-400">
                                    <span>{v.verification_reference}</span>
                                    <span className={v.variance_detected ? 'text-rose-400' : 'text-emerald-400'}>
                                      {v.variance_meters}m
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-white group-hover:text-blue-300 truncate mt-1">
                                    {v.project_name}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal & Drawer Components */}
      <CreateMilestoneModal
        isOpen={isCreateMilestoneModalOpen}
        onClose={() => setIsCreateMilestoneModalOpen(false)}
        onSuccess={() => fetchMonitoringData()}
      />

      <UpdateMilestoneProgressModal
        isOpen={isUpdateProgressModalOpen}
        onClose={() => setIsUpdateProgressModalOpen(false)}
        milestone={selectedMilestone}
        onSuccess={() => fetchMonitoringData()}
      />

      <FlagMilestoneDelayModal
        isOpen={isFlagDelayModalOpen}
        onClose={() => setIsFlagDelayModalOpen(false)}
        milestone={selectedMilestone}
        onSuccess={() => fetchMonitoringData()}
      />

      <MilestoneDetailDrawer
        isOpen={isMilestoneDetailDrawerOpen}
        onClose={() => setIsMilestoneDetailDrawerOpen(false)}
        milestone={selectedMilestone}
        onVerify={(m) => {
          setSelectedMilestone(m);
          setIsMilestoneModalOpen(true);
        }}
        onUpdateProgress={(m) => {
          setSelectedMilestone(m);
          setIsUpdateProgressModalOpen(true);
        }}
        onFlagDelay={(m) => {
          setSelectedMilestone(m);
          setIsFlagDelayModalOpen(true);
        }}
      />

      {/* Site Verification Modals & Drawers */}
      <RecordSiteVerificationModal
        isOpen={isRecordVerificationModalOpen}
        onClose={() => setIsRecordVerificationModalOpen(false)}
        onSuccess={(newVrf) => {
          if (newVrf) {
            setVerifications(prev => [newVrf, ...prev]);
          }
          fetchMonitoringData();
        }}
      />

      <CertifyVerificationModal
        isOpen={isCertifyVerificationModalOpen}
        onClose={() => {
          setIsCertifyVerificationModalOpen(false);
          setSelectedVerification(null);
        }}
        verification={selectedVerification}
        onSuccess={() => {
          fetchMonitoringData();
        }}
      />

      <FlagEncroachmentModal
        isOpen={isFlagEncroachmentModalOpen}
        onClose={() => {
          setIsFlagEncroachmentModalOpen(false);
          setSelectedVerification(null);
        }}
        verification={selectedVerification}
        onSuccess={() => {
          fetchMonitoringData();
        }}
      />

      <SiteVerificationDetailDrawer
        isOpen={isVerificationDetailDrawerOpen}
        onClose={() => {
          setIsVerificationDetailDrawerOpen(false);
          setSelectedVerification(null);
        }}
        verification={selectedVerification}
        onCertify={(v) => {
          setSelectedVerification(v);
          setIsCertifyVerificationModalOpen(true);
        }}
        onFlagEncroachment={(v) => {
          setSelectedVerification(v);
          setIsFlagEncroachmentModalOpen(true);
        }}
      />

      <CreateDailyUpdateDrawer
        isOpen={isUpdateDrawerOpen}
        onClose={() => setIsUpdateDrawerOpen(false)}
        onSuccess={(newUpdate) => {
          if (newUpdate) {
            setDailyUpdates(prev => [newUpdate, ...prev]);
            setStats(prev => prev ? ({
              ...prev,
              live: {
                ...prev.live,
                daily_photos: prev.live.daily_photos + (newUpdate.photos?.length || 1),
                drone_surveys: newUpdate.update_type === 'DRONE_SURVEY' ? prev.live.drone_surveys + 1 : prev.live.drone_surveys
              },
              progress: {
                ...prev.progress,
                progress_reports: prev.progress.progress_reports + 1
              }
            }) : prev);
          }
          fetchMonitoringData();
        }}
      />

      <CreateObservationModal
        isOpen={isObservationModalOpen}
        onClose={() => setIsObservationModalOpen(false)}
        onSuccess={(newObs) => {
          if (newObs) {
            setObservations(prev => [newObs, ...prev]);
            setStats(prev => prev ? ({
              ...prev,
              live: {
                ...prev.live,
                active_observations: prev.live.active_observations + 1
              },
              observations: {
                ...prev.observations,
                active: prev.observations.active + 1,
                quality: newObs.category === 'QUALITY' ? prev.observations.quality + 1 : prev.observations.quality,
                safety: newObs.category === 'SAFETY' ? prev.observations.safety + 1 : prev.observations.safety
              }
            }) : prev);
          }
          fetchMonitoringData();
        }}
      />

      <ReportIssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={(newIssue) => {
          if (newIssue) {
            setIssues(prev => [newIssue, ...prev]);
            setStats(prev => prev ? ({
              ...prev,
              issues: {
                ...prev.issues,
                open: prev.issues.open + 1,
                critical: newIssue.severity === 'CRITICAL' ? prev.issues.critical + 1 : prev.issues.critical
              }
            }) : prev);
          }
          fetchMonitoringData();
        }}
      />

      <VerifyMilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        milestone={selectedMilestone}
        onSuccess={fetchMonitoringData}
      />

      <SiteVerificationDrawer
        isOpen={isVerificationDrawerOpen}
        onClose={() => setIsVerificationDrawerOpen(false)}
        onSuccess={fetchMonitoringData}
      />

      <DailyPhotosGalleryModal
        isOpen={isPhotosGalleryOpen}
        onClose={() => setIsPhotosGalleryOpen(false)}
        updates={dailyUpdates}
        onUploadNew={() => setIsUpdateDrawerOpen(true)}
      />

      <SiteProgressDetailModal
        isOpen={isProgressDetailModalOpen}
        onClose={() => setIsProgressDetailModalOpen(false)}
        onUpdateProgress={() => setIsUpdateDrawerOpen(true)}
        onViewPhotos={() => setIsPhotosGalleryOpen(true)}
        onFlagDelay={() => setIsIssueModalOpen(true)}
      />

      <MonitoringDetailSideDrawer
        isOpen={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        item={selectedDetailItem}
        onAction={(action, payload) => {
          if (action === 'VIEW_PHOTOS') {
            setIsPhotosGalleryOpen(true);
          } else if (action === 'VERIFY_MILESTONE') {
            setSelectedMilestone(payload);
            setIsMilestoneModalOpen(true);
          } else if (action === 'ISSUE_STOP_WORK') {
            setSelectedProjectForStopWork({
              id: payload.project,
              name: payload.project_name
            });
            setIsStopWorkModalOpen(true);
          } else if (action === 'ESCALATE_DIRECTORATE') {
            setSelectedIssueForEscalation(payload);
            setIsEscalateDirectorateModalOpen(true);
          } else if (action === 'REVIEW_CRITICAL') {
            setIsCriticalDefectsDrawerOpen(true);
          }
        }}
      />

      <IssueStopWorkModal
        isOpen={isStopWorkModalOpen}
        onClose={() => setIsStopWorkModalOpen(false)}
        project={selectedProjectForStopWork}
        onSuccess={() => {
          fetchMonitoringData();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Stop-Work Order enforced. Site suspended & registered in Stop-Work Registry!', type: 'success' }
          }));
        }}
      />

      <ReviewCriticalDefectsDrawer
        isOpen={isCriticalDefectsDrawerOpen}
        onClose={() => setIsCriticalDefectsDrawerOpen(false)}
        issues={issues}
        onEscalateIssue={(iss) => {
          setSelectedIssueForEscalation(iss);
          setIsEscalateDirectorateModalOpen(true);
        }}
        onStopWorkOrder={(iss) => {
          setSelectedProjectForStopWork({
            id: iss.project,
            name: iss.project_name
          });
          setIsStopWorkModalOpen(true);
        }}
        onRefresh={fetchMonitoringData}
      />

      <EscalateToDirectorateModal
        isOpen={isEscalateDirectorateModalOpen}
        onClose={() => {
          setIsEscalateDirectorateModalOpen(false);
          setSelectedIssueForEscalation(null);
        }}
        issue={selectedIssueForEscalation}
        issuesList={issues}
        onSuccess={() => {
          fetchMonitoringData();
        }}
      />

      <LogMissedSiteVisitModal
        isOpen={isMissedVisitModalOpen}
        onClose={() => setIsMissedVisitModalOpen(false)}
        onSuccess={() => fetchMonitoringData()}
      />
    </div>
  );
}
