"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Building2, MapPin, ArrowRight, Activity, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { getProjects, Project } from "@/services/projects";
import { useRouter } from "next/navigation";

interface QuickActionSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actionTitle: string;
}

export default function QuickActionSideDrawer({ isOpen, onClose, actionTitle }: QuickActionSideDrawerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const res: any = await getProjects();
        const projectsArray = Array.isArray(res) ? res : (res.results || res.data || []);
        
        // Map backend data to UI format
        const mapped = projectsArray.map((p: any) => ({
          id: p.id,
          name: p.name,
          developer: p.developer_name || 'Pending Assignment',
          location: p.lga || p.site_address || 'Unknown',
          status: p.status === 'PLANNING' ? 'Pending' : p.status === 'ACTIVE' ? 'Active' : p.status === 'COMPLETED' ? 'Completed' : 'Flagged',
          reference: p.reference_number
        }));
        setProjects(mapped);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectSelect = (project: any) => {
    onClose();
    
    // Route to monitoring page based on action
    const monitoringActions = ["Open Project Monitoring", "View Project", "Review Documents", "View BIM Model", "View Site Activity", "Monitor Project", "Review Progress"];
    
    if (monitoringActions.includes(actionTitle)) {
      let tab = 'overview';
      if (actionTitle.includes('Document')) tab = 'documents';
      if (actionTitle.includes('BIM')) tab = 'bim';
      if (actionTitle.includes('Activity')) tab = 'activity';
      
      router.push(`/government/dashboard/projects/view/${project.id}/monitoring?tab=${tab}`);
    } else {
      router.push(`/government/dashboard/projects/view/${project.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'Flagged': return 'bg-red-100 text-red-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Completed': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionSubtitle = () => {
    if (actionTitle.includes("Document")) return "Select a project to inspect architectural drawings, permits, and structural submittals.";
    if (actionTitle.includes("BIM")) return "Select a project to view 3D IFC models, element properties, and clash reports.";
    if (actionTitle.includes("Activity") || actionTitle.includes("Progress")) return "Select a project to inspect field observations, daily photo logs, and site progress.";
    if (actionTitle.includes("Monitor")) return "Select a project to open dedicated real-time compliance and stage monitoring.";
    return "Select a project to view complete statutory and regulatory records.";
  };

  const getGlobalShortcut = () => {
    if (actionTitle.includes("Document")) return { label: "Browse Global Documents Vault", path: "/government/dashboard/documents/project" };
    if (actionTitle.includes("BIM")) return { label: "Browse Global BIM Models", path: "/government/dashboard/bim/models" };
    if (actionTitle.includes("Activity") || actionTitle.includes("Monitor") || actionTitle.includes("Progress")) return { label: "Open Live Site Monitoring", path: "/government/dashboard/monitoring/live" };
    return null;
  };

  const globalShortcut = getGlobalShortcut();

  return (
    <>
      <div
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 w-full max-w-md h-full bg-[#F4F7F9] z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Quick Action</span>
            <h2 className="text-xl font-extrabold text-[#022C4F]">
              {actionTitle || "Select Project"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{getActionSubtitle()}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Shortcut Banner */}
        {globalShortcut && (
          <div className="px-6 pt-4 shrink-0">
            <button
              onClick={() => {
                onClose();
                router.push(globalShortcut.path);
              }}
              className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer"
            >
              <span>{globalShortcut.label}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Search */}
        <div className="p-6 pb-2 shrink-0 bg-[#F4F7F9]">
          <p className="text-xs text-gray-500 mb-3 font-medium">Or choose a specific project below:</p>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 flex flex-col gap-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-6 h-6 border-2 border-[#022C4F] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <Building2 size={32} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No projects found.</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <button 
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex flex-col gap-1.5 overflow-hidden pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                      {project.reference || project.id}
                    </span>
                  </div>
                  <h4 className="text-[13px] font-extrabold text-[#022C4F] truncate group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <span className="text-[11px] font-medium truncate">{project.location}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                  <ArrowRight size={14} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
