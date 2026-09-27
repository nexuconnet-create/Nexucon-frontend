import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Ban, Construction } from 'lucide-react';
import { PublicProjectStatus, ComplianceState } from '@/services/publicPortal';

interface ProjectStatusBadgeProps {
  status: PublicProjectStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-3 py-1 gap-1.5 font-medium',
    lg: 'text-sm sm:text-base px-4 py-1.5 gap-2 font-semibold',
  };

  switch (status) {
    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses[size]}`}
          title="Construction fully completed and statutory certificate of fitness endorsed"
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          <span>Completed & Certified</span>
        </span>
      );
    case 'UNDER_CONSTRUCTION':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses[size]}`}
          title="Active permitted construction undergoing regular stage inspections"
        >
          {showIcon && <Construction className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
          <span>Under Construction</span>
        </span>
      );
    case 'APPROVED':
    case 'PERMIT_APPROVED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${sizeClasses[size]}`}
          title="Statutory planning permit issued and setting-out authorized"
        >
          {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
          <span>Permit Approved</span>
        </span>
      );
    case 'UNDER_INSPECTION':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses[size]}`}
          title="Site is currently undergoing statutory engineering review or pour audit"
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          <span>Under Inspection</span>
        </span>
      );
    case 'SUSPENDED':
    case 'STOP_WORK_ORDER':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-200/80 ${sizeClasses[size]}`}
          title="Enforcement Stop-Work Order active; construction operations halted"
        >
          {showIcon && <Ban className="w-3.5 h-3.5 text-red-600 shrink-0" />}
          <span>Stop-Work Order Served</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          <span>{status.replace(/_/g, ' ')}</span>
        </span>
      );
  }
};

interface ComplianceBadgeProps {
  state: ComplianceState | string;
  size?: 'sm' | 'md';
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({ state, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  switch (state) {
    case 'COMPLIANT':
      return (
        <span className={`inline-flex items-center rounded-md bg-emerald-100/70 text-emerald-800 font-semibold border border-emerald-300/60 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Statutory Compliant</span>
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className={`inline-flex items-center rounded-md bg-amber-100/70 text-amber-800 font-semibold border border-amber-300/60 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Under Review</span>
        </span>
      );
    case 'STOP_WORK_ORDER':
      return (
        <span className={`inline-flex items-center rounded-md bg-red-100 text-red-800 font-bold border border-red-300 ${sizeClasses}`}>
          <Ban className="w-3.5 h-3.5 text-red-600" />
          <span>Stop Work Enforcement</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <span>{state}</span>
        </span>
      );
  }
};
