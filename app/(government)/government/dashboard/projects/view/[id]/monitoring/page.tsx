"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getProjectById, Project } from '@/services/projects';
import { 
  Building2, Activity, FileText, Box, 
  ArrowLeft, MapPin, Calendar, User, CheckCircle, ShieldCheck, 
  AlertTriangle, Clock, Eye, Layers, UploadCloud, RefreshCw, FileCheck
} from 'lucide-react';
import { getInspections, Inspection } from '@/services/inspections';

// --- MOCK COMPONENTS FOR TABS --- //

const OverviewTab = ({ project }: { project: Project }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#022C4F] mb-4">Project Overview</h3>
        <div className="grid grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <p className="text-xs text-slate-500 mb-1">Project Name</p>
            <p className="text-sm font-medium text-slate-800">{project.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Developer</p>
            <p className="text-sm font-medium text-slate-800">{project.developer_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Site Address</p>
            <p className="text-sm font-medium text-slate-800">{project.site_address || project.location || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">LGA</p>
            <p className="text-sm font-medium text-slate-800">{project.lga || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#022C4F] mb-4">Technical Details</h3>
        <div className="grid grid-cols-3 gap-y-6 gap-x-8">
          <div>
            <p className="text-xs text-slate-500 mb-1">Primary Use</p>
            <p className="text-sm font-medium text-slate-800">{project.primary_use || 'Commercial'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">No. of Floors</p>
            <p className="text-sm font-medium text-slate-800">{project.number_of_floors || '12'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Estimated Value</p>
            <p className="text-sm font-medium text-slate-800">{project.estimated_project_value || '₦500M'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Permit Number</p>
            <p className="text-sm font-medium text-slate-800">{project.permit_number || 'Pending'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Gross Floor Area</p>
            <p className="text-sm font-medium text-slate-800">{project.gross_floor_area || '2500 sqm'}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#022C4F] to-[#044073] rounded-2xl p-6 text-white shadow-md relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-blue-400/20 transition-all"></div>
        <h3 className="text-sm font-bold text-blue-100 mb-4 flex items-center gap-2">
          <Activity size={16} /> Current Status
        </h3>
        <div className="mb-6">
          <span className="text-3xl font-bold">{project.status}</span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-blue-100">Overall Progress</span>
              <span className="font-bold">{project.progress || 45}%</span>
            </div>
            <div className="h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${project.progress || 45}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-blue-100">Compliance Score</span>
              <span className="font-bold">{project.complianceScore || 92}%</span>
            </div>
            <div className="h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${project.complianceScore || 92}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
         <h3 className="text-sm font-bold text-[#022C4F] mb-4">Key Personnel</h3>
         <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
               <ShieldCheck size={18} />
            </div>
            <div>
               <p className="text-xs text-slate-500">Assigned Inspector</p>
               <p className="text-sm font-medium text-slate-800">{project.assigned_inspector || 'John Doe'}</p>
            </div>
         </div>
         <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
               <User size={18} />
            </div>
            <div>
               <p className="text-xs text-slate-500">Compliance Officer</p>
               <p className="text-sm font-medium text-slate-800">{project.compliance_officer || 'Jane Smith'}</p>
            </div>
         </div>
      </div>
    </div>
  </div>
);

const DocumentsTab = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
      <div>
        <h3 className="text-base font-bold text-[#022C4F]">Project Documents</h3>
        <p className="text-xs text-slate-500 mt-1">Review architectural drawings, permits, and structural reports.</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
        <UploadCloud size={16} /> Upload Document
      </button>
    </div>
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
            <button className="text-slate-400 hover:text-[#022C4F] transition-colors p-2 hover:bg-slate-200 rounded-lg">
              <Eye size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
    <div className="flex-1 overflow-auto bg-slate-50 relative pb-20">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="px-8 pt-6 pb-0 max-w-7xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#022C4F] transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Projects
          </button>
          
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-5 items-start">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <Building2 size={28} className="drop-shadow-sm" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-2xl font-black text-[#022C4F]">{project.name}</h1>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                    ${project.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${project.status === 'Flagged' ? 'bg-red-100 text-red-700' : ''}
                    ${project.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ''}
                    ${project.status === 'Completed' ? 'bg-indigo-100 text-indigo-700' : ''}
                  `}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin size={14}/> {project.lga || 'Unknown Location'}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14}/> Reg: {project.reference_number}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                Generate Report
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 border-t border-slate-100 pt-1 relative">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-bold flex items-center gap-2 relative transition-colors ${
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
      <div className="p-8 max-w-7xl mx-auto">
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'bim' && <BIMTab />}
        {activeTab === 'activity' && <ActivityTab projectId={projectId} />}
      </div>
    </div>
  );
}
