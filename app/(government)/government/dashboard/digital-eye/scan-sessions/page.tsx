"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Folder,
  ChevronRight,
  FolderOpen,
  Loader2,
  MoreVertical,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api, { notify } from "@/lib/api";

interface ScanSession {
  id: string;
  scanner_id?: string;
  project: string;
  date: string;
  duration: string;
  sensors: string[];
  status: string;
  operator: string;
}

export default function ScanSessionsIndex() {
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/scans/sessions/');
        const formattedSessions = response.data.map((scan: any) => ({
          id: scan.id,
          scanner_id: scan.scanner_id || 'Unknown',
          project: scan.project_name || (scan.project ? scan.project : 'Unknown Project'),
          date: new Date(scan.created_at).toLocaleDateString(),
          duration: scan.duration || '-',
          sensors: scan.sensors_used || [],
          status: scan.status,
          operator: scan.operator || '—'
        }));
        setSessions(formattedSessions);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleDownloadReport = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      setDownloadingId(sessionId);
      const res = await api.get(`/scans/${sessionId}/report/pdf/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${sessionId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify("Report downloaded.", "success");
    } catch (err) {
      console.error("Failed to download report", err);
      notify("Failed to download the report for this session.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  // Group sessions by project
  const projects = Array.from(new Set(sessions.map(s => s.project)));
  const projectSessions = currentProject ? sessions.filter(s => s.project === currentProject) : sessions;
  const filteredSessions = searchQuery.trim()
    ? projectSessions.filter(s =>
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.scanner_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.operator || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projectSessions;

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Site Surveys</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all active and historical site surveys.</p>
        </div>
        <Link 
          href="/government/dashboard/digital-eye/scan-sessions/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} />
          <span className="font-medium">New Site Survey</span>
        </Link>
      </div>

      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button 
          onClick={() => setCurrentProject(null)}
          className={`flex items-center gap-2 transition-colors ${currentProject ? 'text-gray-500 hover:text-blue-600' : 'text-blue-600 font-semibold'}`}
        >
          <FolderOpen size={16} />
          Projects
        </button>
        
        {currentProject && (
          <>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-blue-600 font-semibold flex items-center gap-2">
              <Folder size={16} />
              {currentProject}
            </span>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {currentProject ? `Sessions in ${currentProject}` : 'All Projects'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading data...</div>
          ) : currentProject === null ? (
            /* PROJECT FOLDERS VIEW */
            projects.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No projects found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {projects.map((project) => (
                  <div 
                    key={project}
                    onClick={() => setCurrentProject(project)}
                    className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group"
                  >
                    <Folder className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={48} fill="#93c5fd" />
                    <h3 className="font-semibold text-gray-800 text-center">{project}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {sessions.filter(s => s.project === project).length} Sessions
                    </p>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* SESSIONS TABLE VIEW */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Session ID</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Date / Duration</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Sensors</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Operator</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Status</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No sessions found in this project.</td>
                  </tr>
                ) : filteredSessions.map((session) => (
                  <tr 
                    key={session.id} 
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/government/dashboard/digital-eye/scan-sessions/${session.id}`)}
                  >
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-gray-900 uppercase">{session.id ? session.id.substring(0, 8) : 'N/A'}</span>
                      <span className="text-xs text-gray-500 block mt-0.5">Scanner: {session.scanner_id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{session.date}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Clock size={12}/> {session.duration}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-1 flex-wrap">
                        {session.sensors.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wide">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{session.operator}</td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        session.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                        session.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {session.status === 'completed' && <CheckCircle size={12} />}
                        {session.status === 'processing' && <Activity size={12} className="animate-pulse" />}
                        {session.status === 'failed' && <AlertTriangle size={12} />}
                        {session.status}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {session.status === 'completed' && (
                          <button
                            onClick={(e) => handleDownloadReport(e, session.id)}
                            disabled={downloadingId === session.id}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                            title="Download QA/QC Report (PDF)"
                          >
                            {downloadingId === session.id
                              ? <Loader2 size={16} className="animate-spin" />
                              : <Download size={16} />}
                          </button>
                        )}
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === session.id ? null : session.id); }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Session actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {menuOpenId === session.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 text-left" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => { setMenuOpenId(null); router.push(`/government/dashboard/digital-eye/scan-sessions/${session.id}`); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye size={14} className="text-gray-400" /> View session details
                                </button>
                                <button
                                  onClick={(e) => { setMenuOpenId(null); handleDownloadReport(e, session.id); }}
                                  disabled={session.status !== 'completed' || downloadingId === session.id}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={session.status === 'completed' ? 'Download the QA/QC report (PDF)' : 'Report available once the session completes'}
                                >
                                  {downloadingId === session.id
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <Download size={14} className="text-gray-400" />}
                                  Download QA/QC report
                                </button>
                                <button
                                  onClick={() => { setMenuOpenId(null); router.push(`/government/dashboard/digital-eye/scan-library`); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Folder size={14} className="text-gray-400" /> Browse session files
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

