"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Folder,
  Compass,
  FileSearch,
  History,
  Home,
  FileText,
  Scan,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ClipboardCheck,
  Building2,
  ClipboardList,
  AlertTriangle,
  Activity,
  CheckCircle,
  MonitorPlay,
  Eye,
  ShieldCheck,
  Map,
  ShieldAlert,
  Box,
  FolderOpen,
  FileCheck,
  ListTodo,
  BarChart,
  PieChart,
  Bell,
  Users,
  Briefcase,
  Link as LinkIcon,
  AlertOctagon,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface GovernmentSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

type SidebarItem = {
  name: string;
  icon: React.ElementType;
  href?: string;
  requiredPermission?: string;
  subItems?: {
    name: string;
    href: string;
    icon: React.ElementType;
    requiredPermission?: string;
  }[];
};

const sidebarLinks: SidebarItem[] = [
  {
    name: "Dashboard",
    icon: Home,
    subItems: [
      { name: "Government Command Center", href: "/government/dashboard/command-center", icon: Home },
    ],
  },
  {
    name: "Projects",
    icon: Building2,
    requiredPermission: "projects.view",
    subItems: [
      { name: "All Projects ", href: "/government/dashboard/projects/all", icon: Building2 },
      { name: "Active Projects", href: "/government/dashboard/projects/active", icon: Building2 },
      { name: "Completed Projects", href: "/government/dashboard/projects/completed", icon: Building2 },
      { name: "Pending Projects", href: "/government/dashboard/projects/pending", icon: Building2 },
      { name: "Flagged Projects", href: "/government/dashboard/projects/flagged", icon: AlertTriangle },
      { name: "Project Monitoring", href: "/government/dashboard/projects/monitoring", icon: Activity },
      { name: "Blacklist / Red-Flags", href: "/government/dashboard/stakeholders/blacklist", icon: AlertOctagon },
    ],
  },
  {
    name: "Applications & Permits",
    icon: ClipboardList,
    requiredPermission: "applications.view",
    subItems: [
      { name: "Permit Applications", href: "/government/dashboard/applications/permits", icon: ClipboardList },
      { name: "Submitted Applications", href: "/government/dashboard/applications/submitted", icon: ClipboardList },
      { name: "Under Review", href: "/government/dashboard/applications/review", icon: ClipboardList },
      { name: "Conditional Approvals", href: "/government/dashboard/applications/conditional", icon: ClipboardCheck },
      { name: "Approved", href: "/government/dashboard/applications/approved", icon: CheckCircle },
      { name: "Rejected", href: "/government/dashboard/applications/rejected", icon: AlertTriangle },
      { name: "Expired / Renewal", href: "/government/dashboard/applications/expired", icon: History },
    ],
  },
  {
    name: "Inspections",
    icon: FileSearch,
    requiredPermission: "inspections.view",
    subItems: [
      { name: "Inspection Requests", href: "/government/dashboard/inspections/requests", icon: FileSearch },
      { name: "Inspection Schedule", href: "/government/dashboard/inspections/schedule", icon: FileSearch },
      { name: "Active Inspection", href: "/government/dashboard/inspections/active", icon: Activity },
      { name: "Inspection Findings", href: "/government/dashboard/inspections/findings", icon: FileSearch },
      { name: "Stop-Work Orders", href: "/government/dashboard/inspections/stop-work", icon: AlertOctagon },
      { name: "Re-Inspection", href: "/government/dashboard/inspections/re-inspections", icon: History },
      { name: "Inspection Reports", href: "/government/dashboard/inspections/reports", icon: FileText },
    ],
  },
  {
    name: "Site Monitoring",
    icon: MonitorPlay,
    subItems: [
      { name: "Live Site View", href: "/government/dashboard/monitoring/live", icon: Eye },
      { name: "Site Progress", href: "/government/dashboard/monitoring/progress", icon: Activity },
      { name: "Field Observations", href: "/government/dashboard/monitoring/observations", icon: Eye },
      { name: "Site Issues", href: "/government/dashboard/monitoring/issues", icon: AlertTriangle },
      { name: "Construction Milestones", href: "/government/dashboard/monitoring/milestones", icon: CheckCircle },
      { name: "Site Verification", href: "/government/dashboard/monitoring/verification", icon: ShieldCheck },
    ],
  },
  {
    name: "Digital Eye (T-S1 MVP)",
    href: "/government/dashboard/digital-eye/scan-sessions/new",
    icon: Scan,
    subItems: [
      { name: "Overview", href: "/government/dashboard/digital-eye/overview", icon: Eye },
      { name: "Scan Planning", href: "/government/dashboard/digital-eye/scan-planning", icon: ListTodo },
      { name: "Site Surveys", href: "/government/dashboard/digital-eye/scan-sessions", icon: Activity },
      { name: "Scan Library", href: "/government/dashboard/digital-eye/scan-library", icon: Folder },
      { name: "Data Processing", href: "/government/dashboard/digital-eye/processing-pipeline", icon: BarChart },
      { name: "Scan-to-BIM", href: "/government/dashboard/digital-eye/scan-to-bim", icon: Box },
      { name: "Deviation Heatmap", href: "/government/dashboard/digital-eye/deviation-heatmap", icon: Map },
      { name: "AI Analysis", href: "/government/dashboard/digital-eye/ai-analysis", icon: PieChart },
      { name: "Automated Compliance", href: "/government/dashboard/digital-eye/compliance", icon: ShieldCheck },
      { name: "Compliance Results", href: "/government/dashboard/digital-eye/qa-qc-insights", icon: ShieldCheck },
      { name: "Reports", href: "/government/dashboard/digital-eye/reports", icon: FileText },
      { name: "Integration Settings", href: "/government/dashboard/digital-eye/integration-settings", icon: Settings },
    ],
  },
  {
    name: "BIM & Model Review",
    icon: Box,
    subItems: [
      { name: "BIM Models", href: "/government/dashboard/bim/models", icon: Box },
      { name: "Model Versions", href: "/government/dashboard/bim/versions", icon: History },
      { name: "Design Review", href: "/government/dashboard/bim/review", icon: FileSearch },
      { name: "Model Annotations", href: "/government/dashboard/bim/annotations", icon: FileText },
      { name: "BIM Issues & Clashes", href: "/government/dashboard/bim/issues", icon: AlertTriangle },
      { name: "Progress Validation", href: "/government/dashboard/bim/progress-validation", icon: Activity },
      { name: "Approved Model", href: "/government/dashboard/bim/approved", icon: CheckCircle },
    ],
  },
  {
    name: "Documents",
    icon: FolderOpen,
    subItems: [
      { name: "Project Documents", href: "/government/dashboard/documents/project", icon: FolderOpen },
      { name: "Submitted Drawings", href: "/government/dashboard/documents/drawings", icon: FileText },
      { name: "Technical Reports", href: "/government/dashboard/documents/reports", icon: FileText },
      { name: "Compliance Documents", href: "/government/dashboard/documents/compliance", icon: FileCheck },
      { name: "Inspection Reports", href: "/government/dashboard/documents/inspection-reports", icon: FileText },
      { name: "Approval Records", href: "/government/dashboard/documents/approvals", icon: CheckCircle },
      { name: "Document Versions", href: "/government/dashboard/documents/versions", icon: History },
    ],
  },
  {
    name: "Compliance",
    icon: ShieldCheck,
    subItems: [
      { name: "Compliance Overview", href: "/government/dashboard/compliance/overview", icon: ShieldCheck },
      { name: "Requirements", href: "/government/dashboard/compliance/requirements", icon: ListTodo },
      { name: "Escalation Matrix", href: "/government/dashboard/regulatory/escalation", icon: ShieldAlert },
      { name: "Compliance Reviews", href: "/government/dashboard/compliance/reviews", icon: FileSearch },
      { name: "Non-Conformances", href: "/government/dashboard/compliance/non-conformances", icon: AlertTriangle },
      { name: "Corrective Actions", href: "/government/dashboard/compliance/corrective-actions", icon: Activity },
      { name: "Compliance Certificates", href: "/government/dashboard/compliance/certificates", icon: FileCheck },
    ],
  },
  {
    name: "Approvals",
    icon: CheckCircle,
    subItems: [
      { name: "Pending Approvals", href: "/government/dashboard/approvals/pending", icon: CheckCircle },
      { name: "Technical Reviews", href: "/government/dashboard/approvals/technical", icon: FileSearch },
      { name: "Permit Decisions", href: "/government/dashboard/approvals/decisions", icon: CheckCircle },
      { name: "Document Approvals", href: "/government/dashboard/approvals/documents", icon: FileCheck },
      { name: "Escalated Reviews", href: "/government/dashboard/approvals/escalated", icon: AlertTriangle },
      { name: "Approval History", href: "/government/dashboard/approvals/history", icon: History },
    ],
  },
  {
    name: "Reports & Analytics",
    icon: BarChart,
    requiredPermission: "analytics.view_industry",
    subItems: [
      { name: "Project Performance", href: "/government/dashboard/analytics/performance", icon: BarChart },
      { name: "Structural Risk Index", href: "/government/dashboard/analytics/risk", icon: ShieldAlert },
      { name: "Construction Progress", href: "/government/dashboard/analytics/progress", icon: Activity },
      { name: "Inspection Analytics", href: "/government/dashboard/analytics/inspections", icon: PieChart },
      { name: "Compliance Reports", href: "/government/dashboard/analytics/compliance", icon: FileText },
      { name: "Industry Performance", href: "/government/dashboard/analytics/industry", icon: BarChart },
      { name: "Financial Overview", href: "/government/dashboard/analytics/financial", icon: BarChart },
      { name: "Agency Performance", href: "/government/dashboard/analytics/agency", icon: BarChart },
      { name: "Export Reports", href: "/government/dashboard/analytics/export", icon: FileText },
    ],
  },
  {
    name: "Notifications",
    icon: Bell,
    subItems: [
      { name: "New Application", href: "/government/dashboard/notifications/applications", icon: Bell },
      { name: "Inspection Requests", href: "/government/dashboard/notifications/inspections", icon: Bell },
      { name: "Approval Requests", href: "/government/dashboard/notifications/approvals", icon: Bell },
      { name: "Compliance Alerts", href: "/government/dashboard/notifications/compliance", icon: AlertTriangle },
      { name: "Emergency Dispatch", href: "/government/dashboard/notifications/emergency", icon: ShieldAlert },
      { name: "Overdue Actions", href: "/government/dashboard/notifications/overdue", icon: AlertTriangle },
      { name: "Critical Issues", href: "/government/dashboard/notifications/critical", icon: AlertTriangle },
    ],
  },
  {
    name: "Activity & Audit",
    icon: History,
    subItems: [
      { name: "Activity Log", href: "/government/dashboard/audit/activity", icon: History },
      { name: "Approval History", href: "/government/dashboard/audit/approvals", icon: History },
      { name: "Inspection History", href: "/government/dashboard/audit/inspections", icon: History },
      { name: "Document History", href: "/government/dashboard/audit/documents", icon: History },
      { name: "User Activity", href: "/government/dashboard/audit/users", icon: Activity },
      { name: "Audit Records", href: "/government/dashboard/audit/records", icon: FileText },
    ],
  },
  {
    name: "Stakeholders",
    icon: Users,
    subItems: [
      { name: "Developers", href: "/government/dashboard/stakeholders/developers", icon: Users },
      { name: "Contractors", href: "/government/dashboard/stakeholders/contractors", icon: Users },
      { name: "Professionals", href: "/government/dashboard/stakeholders/professionals", icon: Briefcase },
      { name: "Consultants", href: "/government/dashboard/stakeholders/consultants", icon: Users },
      { name: "Inspectors", href: "/government/dashboard/stakeholders/inspectors", icon: Users },
      { name: "Project Teams", href: "/government/dashboard/stakeholders/teams", icon: Users },
      { name: "Meetings & Calls", href: "/government/dashboard/stakeholders/meetings", icon: Calendar },
      { name: "Messages & Channels", href: "/government/dashboard/stakeholders/messages", icon: MessageSquare },
    ],
  },
  {
    name: "Integrations",
    icon: LinkIcon,
    subItems: [
      { name: "Tersus GNSS", href: "/government/dashboard/integrations/tersus", icon: LinkIcon },
      { name: "BIM & Design Platforms", href: "/government/dashboard/integrations/bim", icon: LinkIcon },
      { name: "Document Systems", href: "/government/dashboard/integrations/documents", icon: LinkIcon },
      { name: "Government APIs (CAC, LASRRA, e-GIS)", href: "/government/dashboard/integrations/government", icon: LinkIcon },
      { name: "API Connections", href: "/government/dashboard/integrations/api", icon: LinkIcon },
      { name: "Integration Logs", href: "/government/dashboard/integrations/logs", icon: History },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    subItems: [
      { name: "Agency Profile", href: "/government/dashboard/settings/profile", icon: Settings },
      { name: "User Management", href: "/government/dashboard/settings/users", icon: Users },
      { name: "Roles & Permissions", href: "/government/dashboard/settings/roles", icon: ShieldCheck },
      { name: "Approval Workflows", href: "/government/dashboard/settings/workflows", icon: Settings },
      { name: "Inspection Templates", href: "/government/dashboard/settings/templates", icon: FileText },
      { name: "Compliance Standards", href: "/government/dashboard/settings/standards", icon: ShieldCheck },
      { name: "Notification Preferences", href: "/government/dashboard/settings/notifications", icon: Bell },
      { name: "Integration Settings", href: "/government/dashboard/settings/integrations", icon: LinkIcon },
    ],
  },
];

export default function GovernmentSidebar({ isCollapsed, onToggleCollapse }: GovernmentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasPermission, logout } = useAuth();

  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    const activeSection = sidebarLinks.find(link =>
      (link.href && (pathname === link.href || pathname.startsWith(`${link.href}/`))) ||
      link.subItems?.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`))
    );
    if (activeSection && !openSections.includes(activeSection.name)) {
      setOpenSections(prev => [...prev, activeSection.name]);
    }
  }, [pathname]);

  return (
    <aside
      className={`fixed top-4 bottom-4 left-4 z-40 bg-[#022C4F] rounded-[30px] text-white flex flex-col hidden lg:flex transition-all duration-300 ${isCollapsed ? "w-[100px]" : "w-[300px]"
        }`}
    >
      {/* Top Area - Logo and Collapse Toggle */}
      <div className={`flex items-center ${isCollapsed ? "justify-center pt-8 pb-12" : "justify-between px-8 pt-8 pb-12"}`}>
        <div
          className={`flex items-center overflow-hidden transition-all duration-300 ${isCollapsed ? "w-12 h-12 cursor-pointer" : "w-auto"}`}
          onClick={isCollapsed ? onToggleCollapse : undefined}
          title={isCollapsed ? "Expand Sidebar" : undefined}
        >
          <Image
            src={isCollapsed
              ? "https://res.cloudinary.com/depeqzb6z/image/upload/v1774500774/gaskia_logo-04_112538_1_1_ye9l2c.png"
              : "https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"}
            alt="Nexucon Logo"
            width={isCollapsed ? 48 : 160}
            height={48}
            priority
            className={`transition-all duration-300 brightness-0 invert ${isCollapsed ? "h-12 w-12 object-contain" : "h-12 w-auto object-contain"}`}
          />
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-full bg-white text-[#022C4F] hover:scale-110 transition-transform shrink-0 shadow-lg"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
        )}
      </div>

      {!isCollapsed && <div className="w-full h-px bg-white/20 mb-6"></div>}

      {/* Navigation Links */}
      <div className={`flex-1 overflow-y-auto pb-8 flex flex-col gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? "px-0 items-center" : "px-6"}`}>
        {sidebarLinks.filter(link => {
          if (!link.requiredPermission) return true;
          if (hasPermission(link.requiredPermission)) return true;
          const role = (user?.role_name || '').toLowerCase().trim();
          if (
            !role ||
            role === 'agency head' ||
            role === 'agency_head' ||
            role === 'agency-head' ||
            role === 'director' ||
            role === 'admin' ||
            role === 'superadmin' ||
            role === 'agency officer'
          ) {
            return true;
          }
          if (user?.permissions?.includes('admin') || user?.permissions?.includes('*')) return true;
          return false;
        }).map((link, idx) => {
          const isParent = !!(link.subItems && link.subItems.length > 0);
          const targetHref = link.href || (isParent ? link.subItems![0].href : "#");

          const isActive = link.href ? (pathname === link.href || pathname.startsWith(`${link.href}/`)) : false;
          const isSubActive = link.subItems?.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`));

          const isItemActive = isActive || isSubActive;
          const Icon = link.icon;

          const isOpen = openSections.includes(link.name);

          const toggleSection = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenSections(prev =>
              prev.includes(link.name)
                ? prev.filter(n => n !== link.name)
                : [...prev, link.name]
            );
          };

          return (
            <div key={link.name} className="flex flex-col mb-1 w-full">
              {/* Main Item */}
              <Link
                href={targetHref}
                onClick={(e) => {
                  if (link.name === "Notifications") {
                    e.preventDefault();
                    window.dispatchEvent(new Event('open-notifications'));
                  }
                }}
                className={`flex items-center justify-between rounded-xl transition-all duration-300 group ${isCollapsed ? "justify-center p-3 w-12 h-12 mx-auto" : "px-4 py-3 w-full"
                  } ${isItemActive
                    ? "text-white font-semibold"
                    : "text-white/70 hover:text-white"
                  }`}
                title={isCollapsed ? link.name : undefined}
              >
                <div className="flex items-center gap-4">
                  <Icon
                    size={isCollapsed ? 24 : 18}
                    className={`shrink-0 transition-transform duration-300 ${isItemActive ? "text-white" : "text-white/70 group-hover:text-white"}`}
                    strokeWidth={isItemActive ? 2 : 1.5}
                  />
                  {!isCollapsed && (
                    <span className="tracking-wide text-[13px]">{link.name}</span>
                  )}
                </div>
                {isParent && !isCollapsed && (
                  <button onClick={toggleSection} className="p-1 rounded hover:bg-white/10 transition-colors ml-2">
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                )}
              </Link>

              {/* Sub Items */}
              {isParent && !isCollapsed && isOpen && (
                <div className="flex flex-col ml-8 mt-1 gap-1">
                  {link.subItems?.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubItemActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                    return (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 group ${isSubItemActive
                          ? "text-white font-semibold"
                          : "text-white/60 hover:text-white"
                          }`}
                      >
                        <SubIcon
                          size={16}
                          className={`shrink-0 transition-transform duration-300 ${isSubItemActive ? "text-white" : "text-white/60 group-hover:text-white"}`}
                          strokeWidth={isSubItemActive ? 2 : 1.5}
                        />
                        <span className="tracking-wide text-[13px]">{sub.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Area - User Profile & Logout */}
      <div className={`p-6 border-t border-white/10 flex ${isCollapsed ? "flex-col items-center justify-center gap-8" : "items-center justify-between"}`}>
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-12 h-12 shrink-0 rounded-full bg-white text-[#022C4F] font-extrabold flex items-center justify-center text-lg shadow-inner uppercase">
            {user?.first_name?.[0] || 'G'}{user?.last_name?.[0] || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-bold text-sm truncate max-w-[150px]">{user ? `${user.first_name} ${user.last_name}` : 'Government User'}</span>
              <span className="text-xs text-white/60 truncate max-w-[150px]">{user?.role_name || 'Agency Head'}</span>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          title="Log Out"
        >
          <LogOut size={22} />
        </button>
      </div>

    </aside>
  );
}
