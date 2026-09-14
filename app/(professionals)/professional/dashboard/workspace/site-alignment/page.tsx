"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft, Layers, Camera, AlertTriangle, MessageSquare,
  MapPin, CheckCircle, SlidersHorizontal, Settings, Users, ArrowRight, Save
} from "lucide-react";
import { getDigitalEyeFindings, DigitalEyeFinding } from "@/services/digitalEye";
import { getProjects, Project } from "@/services/projects";
import { getDocuments, Document } from "@/services/documents";
import { getBIMModels, BIMModel } from "@/services/bim";
import { getProjectTeams } from "@/services/stakeholders";
import { useAuth } from "@/context/AuthContext";

// One entry in the alignment history, derived from a real Digital Eye finding.
interface HistoryItem {
  id: string;
  type: 'deviation' | 'annotation' | 'field-note';
  title: string;
  location: string;
  status: string;
  time: string;
  deviationMm?: number | null;
}

// Map a real finding status onto the badge styles the panel renders.
const mapFindingStatus = (status: DigitalEyeFinding['status']): string => {
  if (status === 'RESOLVED' || status === 'VERIFIED') return 'Resolved';
  if (status === 'CONVERTED_TO_NCR') return 'Escalated';
  return 'Open'; // OPEN / INVESTIGATING
};

const formatRelativeTime = (iso?: string): string => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

export default function SiteAlignmentWorkspace() {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAssignIssueModalOpen, setIsAssignIssueModalOpen] = useState(false);
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);
  const [isFieldNoteDrawerOpen, setIsFieldNoteDrawerOpen] = useState(false);
  const [newFieldNoteTitle, setNewFieldNoteTitle] = useState('');
  const [newFieldNoteDesc, setNewFieldNoteDesc] = useState('');

  // Alignment history: real Digital Eye findings, plus field notes the user
  // records in this session. Nothing is pre-populated or fabricated.
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingHistory(true);
    setHistoryError(null);
    getDigitalEyeFindings()
      .then((findings) => {
        if (cancelled) return;
        setHistory(findings.map(f => ({
          id: f.id,
          type: (f.deviation_mm != null || f.taxonomy === 'BIM_GEOMETRIC_DEVIATION') ? 'deviation' : 'annotation',
          title: f.title,
          location: f.structural_element_name || 'Location not specified',
          status: mapFindingStatus(f.status),
          time: formatRelativeTime(f.created_at),
          deviationMm: f.deviation_mm ?? null,
        })));
      })
      .catch((err) => {
        console.error("Failed to load alignment findings", err);
        if (!cancelled) setHistoryError("Alignment records could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingHistory(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Real context for the comparison view: the professional's latest project,
  // the latest real site photo on record, and the registered BIM model. No
  // stock placeholder photography.
  const [projectName, setProjectName] = useState<string | null>(null);
  const [sitePhoto, setSitePhoto] = useState<Document | null>(null);
  const [bimModel, setBimModel] = useState<BIMModel | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProjects().catch(() => [] as Project[]),
      getDocuments().catch(() => [] as Document[]),
      getBIMModels().catch(() => [] as BIMModel[]),
    ]).then(([projects, docs, models]) => {
      if (cancelled) return;
      const latest = [...projects].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      )[0];
      setProjectName(latest?.name ?? null);
      const photos = docs
        .filter((d) => d.document_type === 'SITE_PHOTO' && d.file_url)
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
      setSitePhoto(photos[0] ?? null);
      setBimModel(models.find((m) => m.status === 'Active') ?? models[0] ?? null);
    });
    return () => { cancelled = true; };
  }, []);

  // Real assignable people: project stakeholder team members recorded on the
  // backend, plus the signed-in user. No fabricated names.
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; role: string }>>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingTeam(true);
    getProjectTeams()
      .then((teams) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const members: Array<{ name: string; role: string }> = [];
        teams.forEach((team) => {
          Object.values(team.team_data || {}).forEach((member) => {
            if (member?.name && !seen.has(member.name)) {
              seen.add(member.name);
              members.push({ name: member.name, role: member.role || "" });
            }
          });
        });
        setTeamMembers(members);
      })
      .catch((err) => {
        console.error("Failed to load project teams", err);
        if (!cancelled) setTeamMembers([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTeam(false);
      });
    return () => { cancelled = true; };
  }, []);

  // The signed-in user is always an honest assignee option.
  const currentUserName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const assignableMembers = [...teamMembers];
  if (currentUserName && !assignableMembers.some((m) => m.name === currentUserName)) {
    assignableMembers.push({ name: currentUserName, role: user?.role_name || "" });
  }

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tools for left sidebar
  const tools = [
    { id: 'align', icon: SlidersHorizontal, label: 'Align Model' },
    { id: 'measure', icon: Layers, label: 'Field Measurement' },
    { id: 'photo', icon: Camera, label: 'Capture Photo' },
    { id: 'deviation', icon: AlertTriangle, label: 'Identify Deviation' },
    { id: 'annotate', icon: MapPin, label: 'Add Annotation' },
  ];

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleInteractionStart = () => setIsDragging(true);
  const handleInteractionEnd = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchend', handleInteractionEnd);
    return () => {
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] w-full h-screen bg-[#F0F2F5] animate-in fade-in duration-500 overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/professional/dashboard/workspace">
            <button className="p-2 rounded-full hover:bg-gray-100 text-[#022C4F] transition-colors" title="Back to Workspace">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-[16px] font-extrabold text-[#022C4F] leading-tight">
              Site Alignment Workspace
            </h1>
            <span className="text-[11px] text-gray-500 font-medium">{projectName || 'No project recorded'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setIsAssignIssueModalOpen(true)}
            className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-6 py-2 rounded-full font-medium transition-colors text-[11px] shadow-sm flex items-center gap-2"
          >
            <Users size={14} /> Assign Issue
          </button>
          <button 
            onClick={() => setIsGenerateReportModalOpen(true)}
            className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-6 py-2 rounded-full font-medium transition-colors text-[11px] shadow-sm"
          >
            Generate Report
          </button>
          <button 
            onClick={() => showToast("Findings successfully synced!")}
            className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-6 py-2 rounded-full font-medium transition-colors shadow-sm text-[11px] flex items-center gap-2"
          >
            <Save size={14} /> Sync Findings
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Sidebar (Tool Palette) */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-4 z-20 shadow-sm shrink-0">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isActive ? null : tool.id)}
                className={`p-3 rounded-xl transition-all group relative ${isActive
                  ? tool.id === 'deviation' ? 'bg-red-50 text-red-600' : 'bg-[#022C4F] text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#022C4F]'
                  }`}
                title={tool.label}
              >
                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {tool.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Center Comparison Area */}
        <div
          className="flex-1 relative bg-black overflow-hidden select-none"
          ref={sliderRef}
          onMouseMove={handleSliderMove}
          onTouchMove={handleSliderMove}
        >
          {/* Site Photo View (Background) — the latest real site photo on record. */}
          <div className="absolute inset-0">
            {sitePhoto?.file_url ? (
              <img
                src={sitePhoto.file_url}
                alt={sitePhoto.title || 'Site Condition'}
                className="w-full h-full object-cover opacity-80"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-[#0F181F] flex flex-col items-center justify-center text-center px-8">
                <Camera size={32} className="text-white/30 mb-3" />
                <p className="text-[13px] font-bold text-white/70">No site photo recorded yet.</p>
                <p className="text-[11px] text-white/40 mt-1">Uploaded site photos will appear here for comparison against the BIM model.</p>
              </div>
            )}
            <div className="absolute top-6 right-6 bg-black/60 text-white px-4 py-2 rounded-lg text-[12px] font-bold backdrop-blur-sm border border-white/20">
              Actual Site Condition
            </div>
          </div>

          {/* BIM Model View (Clipped foreground) — the registered model. The
              IFC file itself is not an image, so no snapshot is invented. */}
          <div
            className="absolute inset-0 border-r-[3px] border-white cursor-ew-resize overflow-hidden shadow-[2px_0_15px_rgba(0,0,0,0.5)]"
            style={{ width: `${sliderPosition}%` }}
          >
            {bimModel ? (
              <div className="absolute inset-0 bg-[#022C4F] flex flex-col items-center justify-center text-center px-8">
                <Layers size={32} className="text-white/40 mb-3" />
                <p className="text-[13px] font-bold text-white/90">{bimModel.name}</p>
                <p className="text-[11px] text-white/50 mt-1">
                  {bimModel.discipline} • Version {bimModel.current_version} • {bimModel.format}
                </p>
                <p className="text-[10px] text-white/30 mt-3">
                  {bimModel.element_count} elements registered — 3D model file; snapshot rendering not available
                </p>
              </div>
            ) : (
              <div className="absolute inset-0 bg-[#022C4F] flex flex-col items-center justify-center text-center px-8">
                <Layers size={32} className="text-white/30 mb-3" />
                <p className="text-[13px] font-bold text-white/70">No BIM model registered yet.</p>
                <p className="text-[11px] text-white/40 mt-1">The registered BIM model will appear here once uploaded.</p>
              </div>
            )}
            <div className="absolute top-6 left-6 bg-[#022C4F]/90 text-white px-4 py-2 rounded-lg text-[12px] font-bold backdrop-blur-sm border border-white/20">
              BIM Model{bimModel ? ` (V${bimModel.current_version})` : ''}
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-1/2 -right-[15px] -translate-y-1/2 w-[30px] h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-ew-resize z-10"
              onMouseDown={handleInteractionStart}
              onTouchStart={handleInteractionStart}
            >
              <div className="flex gap-1">
                <div className="w-0.5 h-5 bg-gray-400 rounded-full"></div>
                <div className="w-0.5 h-5 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Overlay: log a deviation via a field note the user fills in —
              no deviation value or location is fabricated. */}
          {activeTool === 'deviation' && (
            <div
              className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer animate-pulse z-20 hover:scale-105 transition-transform"
              onClick={() => {
                setIsFieldNoteDrawerOpen(true);
                setActiveTool(null);
              }}
            >
              <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg mb-2">
                <AlertTriangle size={16} className="text-white" />
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg shadow-lg text-[11px] font-bold text-red-600 border border-red-100 whitespace-nowrap">
                Click to record a field note
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (Issue & Alignment History) */}
        {showRightPanel && (
          <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col z-20 shadow-sm shrink-0">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-[14px] font-extrabold text-[#022C4F]">Alignment History</h3>
              <button className="text-gray-400 hover:text-[#022C4F] transition-colors"><Settings size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {isLoadingHistory ? (
                <div className="py-12 text-center text-[12px] text-gray-400 font-medium">Loading alignment records...</div>
              ) : historyError ? (
                <div className="py-12 text-center text-[12px] text-red-500 font-medium">{historyError}</div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center gap-2 py-12 px-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <AlertTriangle size={18} />
                  </div>
                  <p className="text-[12px] font-bold text-gray-500">No alignment records yet</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Deviations and findings recorded through Digital Eye scan sessions will appear here.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-gray-100 hover:border-[#022C4F]/30 hover:shadow-sm transition-all cursor-pointer bg-white group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[12px] font-extrabold text-[#0F181F] group-hover:text-[#022C4F] transition-colors flex items-center gap-1.5">
                        {item.type === 'deviation' && <AlertTriangle size={12} className="text-red-500 shrink-0" />}
                        {item.type === 'annotation' && <MessageSquare size={12} className="text-gray-400 shrink-0" />}
                        {item.title}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Open' ? 'bg-red-50 text-red-600' :
                        item.status === 'Resolved' ? 'bg-green-50 text-green-600' :
                          'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                      <MapPin size={12} />
                      <span className="text-[11px]">{item.location}</span>
                    </div>
                    {item.deviationMm != null && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#022C4F] mb-2">
                        <SlidersHorizontal size={11} />
                        <span>Recorded deviation: {item.deviationMm} mm</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[10px]">{item.time}</span>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#022C4F]" />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-[#FAFAFA]">
              <button 
                onClick={() => setIsFieldNoteDrawerOpen(true)}
                className="w-full bg-[#FAFAFA] border border-dashed border-gray-300 text-gray-600 hover:text-[#022C4F] hover:border-[#022C4F] py-3 rounded-lg font-bold transition-all text-[12px] flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} /> Add Field Note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Issue Modal */}
      {isAssignIssueModalOpen && (
        <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-[500px] p-8 shadow-2xl relative">
            <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-6">Assign Issue</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1.5">Issue Title</label>
                <input type="text" placeholder="e.g. HVAC Duct Clash" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#022C4F] transition-colors" />
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1.5">Assign To</label>
                {isLoadingTeam ? (
                  <div className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[13px] text-gray-400">
                    Loading team members...
                  </div>
                ) : assignableMembers.length === 0 ? (
                  <>
                    <select disabled className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[13px] outline-none bg-white text-gray-400 appearance-none cursor-not-allowed">
                      <option value="">No team members recorded</option>
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Team members will appear here once they are added to a project stakeholder team.
                    </p>
                  </>
                ) : (
                  <select className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#022C4F] transition-colors appearance-none bg-white">
                    <option value="">Select team member...</option>
                    {assignableMembers.map((member) => (
                      <option key={member.name} value={member.name}>
                        {member.role ? `${member.name} (${member.role})` : member.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1.5">Priority</label>
                <div className="flex gap-3">
                  {['High', 'Medium', 'Low'].map(p => (
                    <label key={p} className="flex-1 cursor-pointer">
                      <input type="radio" name="priority" className="peer sr-only" />
                      <div className="text-center py-2 border border-gray-200 rounded-xl text-[12px] font-medium peer-checked:bg-[#022C4F] peer-checked:text-white peer-checked:border-[#022C4F] transition-all">
                        {p}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1.5">Notes</label>
                <textarea rows={3} placeholder="Additional context..." className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#022C4F] transition-colors resize-none"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsAssignIssueModalOpen(false)} className="px-6 py-2.5 text-[12px] font-bold text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={() => { setIsAssignIssueModalOpen(false); showToast("Issue assigned successfully"); }} className="px-6 py-2.5 bg-[#022C4F] text-white rounded-xl text-[12px] font-bold hover:bg-[#033A6B] transition-colors">
                Assign Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {isGenerateReportModalOpen && (
        <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-[500px] p-8 shadow-2xl relative">
            <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-2">Generate Alignment Report</h2>
            <p className="text-[12px] text-gray-500 mb-6">Select the information you want to include in the report export.</p>
            
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-3">Include Sections</label>
                <div className="flex flex-col gap-3">
                  {[
                    { id: 'dev', label: 'Deviations & Clashes' },
                    { id: 'notes', label: 'Field Notes & Annotations' },
                    { id: 'photos', label: 'Site Progress Photos' },
                    { id: 'metrics', label: 'Alignment Metrics' }
                  ].map(sec => (
                    <label key={sec.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" defaultChecked className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center peer-checked:bg-[#022C4F] peer-checked:border-[#022C4F] transition-colors">
                          <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-[13px] font-medium text-gray-700 group-hover:text-[#022C4F] transition-colors">{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-2">Export Format</label>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="format" defaultChecked className="peer sr-only" />
                    <div className="text-center py-2.5 border border-gray-200 rounded-xl text-[12px] font-bold peer-checked:bg-[#0F181F] peer-checked:text-white peer-checked:border-[#0F181F] transition-all">
                      PDF Document
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" name="format" className="peer sr-only" />
                    <div className="text-center py-2.5 border border-gray-200 rounded-xl text-[12px] font-bold peer-checked:bg-[#0F181F] peer-checked:text-white peer-checked:border-[#0F181F] transition-all">
                      Excel Spreadsheet
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsGenerateReportModalOpen(false)} className="px-6 py-2.5 text-[12px] font-bold text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={() => { setIsGenerateReportModalOpen(false); showToast("Report generation started"); }} className="px-6 py-2.5 bg-[#022C4F] text-white rounded-xl text-[12px] font-bold hover:bg-[#033A6B] transition-colors">
                Generate Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Note Drawer */}
      {isFieldNoteDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[200] animate-in fade-in duration-300" onClick={() => setIsFieldNoteDrawerOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl z-[201] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
              <h2 className="text-[18px] font-extrabold text-[#022C4F]">Add Field Note</h2>
              <button onClick={() => setIsFieldNoteDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1.5">Note Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newFieldNoteTitle}
                  onChange={(e) => setNewFieldNoteTitle(e.target.value)}
                  placeholder="e.g. Column rebar inspection" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#022C4F] transition-colors" 
                />
              </div>
              
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1.5">Description</label>
                <textarea 
                  rows={5} 
                  value={newFieldNoteDesc}
                  onChange={(e) => setNewFieldNoteDesc(e.target.value)}
                  placeholder="Enter detailed observation..." 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#022C4F] transition-colors resize-none"
                ></textarea>
              </div>
              
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-1.5">Attach Photo (Optional)</label>
                <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#022C4F] hover:bg-gray-50 transition-colors">
                  <Camera size={24} className="text-gray-400" />
                  <span className="text-[11px] font-medium text-gray-500">Click or drag image here</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-[#FAFAFA] flex gap-3">
              <button 
                onClick={() => setIsFieldNoteDrawerOpen(false)} 
                className="flex-1 py-3 text-[13px] font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!newFieldNoteTitle.trim()) return;
                  const newNote: HistoryItem = {
                    id: `field-note-${Date.now()}`,
                    type: 'field-note',
                    title: newFieldNoteTitle,
                    location: 'Location not specified',
                    status: 'Open',
                    time: 'Just now',
                    deviationMm: null,
                  };
                  setHistory([newNote, ...history]);
                  setIsFieldNoteDrawerOpen(false);
                  setNewFieldNoteTitle('');
                  setNewFieldNoteDesc('');
                  showToast("Field note added");
                }} 
                disabled={!newFieldNoteTitle.trim()}
                className="flex-1 py-3 text-[13px] font-bold text-white bg-[#022C4F] rounded-xl hover:bg-[#033A6B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Note
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0F181F] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-[12px] font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
