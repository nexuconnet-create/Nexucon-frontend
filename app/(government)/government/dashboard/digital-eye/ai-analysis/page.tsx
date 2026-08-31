"use client";

import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Info,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  Eye,
  CheckSquare,
  Loader2,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import api, { notify } from "@/lib/api";

interface Anomaly {
  id: string | number;
  sessionId: string;
  kind: "defect" | "thermal";
  project: string;
  type: string;
  severity: string;
  confidence: number;
  status: string;
  desc: string;
}

interface AIModel {
  id: string;
  name: string;
  task_type: string;
  version: string;
  accuracy: number;
}

interface FeedbackStats {
  false_positive_rate: number | null;
  true_positive_rate: number | null;
}

export default function AIAnalysis() {
  const router = useRouter();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | number | null>(null);
  const [stats, setStats] = useState({
    scansProcessed: 0,
    anomaliesFound: 0
  });

  const [models, setModels] = useState<AIModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        setLoading(true);
        // 1. Fetch all sessions
        const sessionsRes = await api.get('/scans/sessions/');
        const sessions = sessionsRes.data;
        
        let allAnomalies: Anomaly[] = [];
        
        // 2. For each session, fetch defects and thermal anomalies
        for (const session of sessions) {
          try {
            // Fetch defects
            const defectsRes = await api.get(`/scans/${session.id}/defects/`);
            const defects = defectsRes.data.map((d: any) => ({
              id: d.id,
              sessionId: session.id,
              kind: "defect" as const,
              project: session.project_name || (session.project ? `Project ${session.project}` : session.name || 'Unnamed Session'),
              type: d.type ? d.type.replace('_', ' ') : 'Defect',
              image_url: d.image_url,
              severity: (d.severity || 'medium').toLowerCase(),
              confidence: d.confidence_score ? Math.round(d.confidence_score * 100) : 0,
              status: (d.status || 'OPEN').toLowerCase(),
              desc: d.description || `Defect detected in zone ${d.grid_zone || 'unknown'}`
            }));

            // Fetch thermal anomalies
            const thermalRes = await api.get(`/scans/${session.id}/thermal-anomalies/`);
            const thermalAnomalies = thermalRes.data.map((t: any) => ({
              id: t.id,
              sessionId: session.id,
              kind: "thermal" as const,
              project: session.project_name || (session.project ? `Project ${session.project}` : session.name || 'Unnamed Session'),
              type: 'Thermal Anomaly',
              image_url: t.image_url,
              severity: (t.severity || 'medium').toLowerCase(),
              confidence: t.confidence_score ? Math.round(t.confidence_score * 100) : 0,
              status: (t.status || 'OPEN').toLowerCase(),
              desc: `Temperature variance of ${t.temperature_variance}°C detected.`
            }));
            
            allAnomalies = [...allAnomalies, ...defects, ...thermalAnomalies];
          } catch (e) {
            console.error(`Failed to fetch anomalies for session ${session.id}`, e);
          }
        }
        
        setAnomalies(allAnomalies);
        setStats({
          scansProcessed: sessions.length,
          anomaliesFound: allAnomalies.length
        });
      } catch (error) {
        console.error("Failed to fetch assets", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        const res = await api.get('/processing/ai-models/');
        const list = res.data.results || res.data;
        if (Array.isArray(list)) {
          const parsed = list.map((m: any) => ({
            id: m.id,
            name: m.name,
            task_type: m.task_type,
            version: m.version,
            accuracy: m.accuracy ?? m.observed_confidence ?? 0,
          }));
          setModels(parsed);
        }
      } catch (e) {
        console.error("Failed to fetch AI models", e);
      } finally {
        setLoadingModels(false);
      }
    };

    const fetchFeedbackStats = async () => {
      try {
        const res = await api.get('/processing/ai-feedback-stats/');
        setFeedbackStats(res.data);
      } catch (e) {
        console.error("Failed to fetch feedback stats", e);
      }
    };

    fetchAnomalies();
    fetchModels();
    fetchFeedbackStats();
  }, []);

  const matchesSearch = (anm: Anomaly) =>
    anm.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    anm.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    anm.desc.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredAnomalies = anomalies.filter(anm =>
    matchesSearch(anm) && (severityFilter === "all" || anm.severity === severityFilter)
  );

  const severityOptions = Array.from(new Set(anomalies.map(a => a.severity)));

  // PATCH the defect / thermal anomaly to RESOLVED on the backend, then
  // reflect the new status locally.
  const handleMarkResolved = async (anm: Anomaly) => {
    if (resolvingId !== null) return;
    setResolvingId(anm.id);
    try {
      const base = anm.kind === "defect"
        ? `/scans/${anm.sessionId}/defects/${anm.id}/`
        : `/scans/${anm.sessionId}/thermal-anomalies/${anm.id}/`;
      const res = await api.patch(base, { status: "RESOLVED" });
      if (res.status >= 200 && res.status < 300) {
        setAnomalies(prev =>
          prev.map(a => (a.id === anm.id && a.sessionId === anm.sessionId ? { ...a, status: "resolved" } : a))
        );
        notify("Anomaly marked as resolved.", "success");
      }
    } catch (e: any) {
      console.error("Failed to resolve anomaly", e);
      notify(e?.response?.data?.detail || "Could not resolve anomaly.", "error");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <BrainCircuit className="text-blue-600" size={32} />
            AI Analysis & Inference
          </h1>
          <p className="text-gray-500 mt-1">Review automated anomaly detections comparing As-Built scans to BIM models.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scans Processed</div>
            <div className="text-xl font-bold text-[#022C4F]">
              {loading ? <Loader2 className="w-4 h-4 inline animate-spin" /> : stats.scansProcessed}
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Anomalies Found</div>
            <div className="text-xl font-bold text-red-600">
              {loading ? <Loader2 className="w-4 h-4 inline animate-spin" /> : stats.anomaliesFound}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Anomaly List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Detected Issues</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen(o => !o)}
                    className={`p-2 border rounded-lg flex items-center gap-1.5 transition-colors ${
                      severityFilter !== "all"
                        ? "border-blue-300 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                    title="Filter by severity"
                  >
                    <Filter size={16} />
                    {severityFilter !== "all" && (
                      <span className="text-xs font-medium capitalize pr-0.5">{severityFilter}</span>
                    )}
                    <ChevronDown size={12} />
                  </button>
                  {filterOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                      <div className="absolute right-0 mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[150px]">
                        <button
                          onClick={() => { setSeverityFilter("all"); setFilterOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          All severities
                        </button>
                        {severityOptions.map(sev => (
                          <button
                            key={sev}
                            onClick={() => { setSeverityFilter(sev); setFilterOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize flex items-center justify-between"
                          >
                            {sev}
                            {severityFilter === sev && <CheckCircle size={14} className="text-blue-500" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search issues..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredAnomalies.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No issues found matching your search.
                </div>
              ) : (
                filteredAnomalies.map((anm, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={anm.id} 
                    className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white relative overflow-hidden group cursor-pointer"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      anm.severity === 'critical' ? 'bg-red-600' :
                      anm.severity === 'high' ? 'bg-orange-500' :
                      anm.severity === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                    }`}></div>
                    
                    <div className="flex justify-between items-start pl-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-400">{typeof anm.id === 'number' ? `ANM-${anm.id}` : anm.id.toString().substring(0, 8)}</span>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{anm.project}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors capitalize">{anm.type}</h3>
                        <p className="text-sm text-gray-600 mt-1">{anm.desc}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          anm.status === 'open' ? 'bg-red-100 text-red-700' :
                          anm.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          anm.status === 'rejected' ? 'bg-gray-100 text-gray-600' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {anm.status.replace('_', ' ')}
                        </span>
                        
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 mt-2">
                          <BrainCircuit size={12} className="text-blue-500" />
                          {anm.confidence}% Confidence
                        </div>
                      </div>
                    </div>
                    
                    <div className="pl-3 mt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => router.push(`/government/dashboard/digital-eye/scan-to-bim?session_id=${anm.sessionId}`)}
                        className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
                      >
                        <Eye size={14}/> View in 3D Viewer
                      </button>
                      {anm.status !== 'resolved' && anm.status !== 'rejected' && (
                        <button
                          onClick={() => handleMarkResolved(anm)}
                          disabled={resolvingId === anm.id}
                          className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700 disabled:opacity-50"
                        >
                          {resolvingId === anm.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <CheckSquare size={14}/>}
                          {resolvingId === anm.id ? 'Resolving…' : 'Mark Resolved'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI Model Metrics */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Model Performance</h3>
            
            <div className="space-y-5">
              {loadingModels ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : models.length === 0 ? (
                <div className="text-sm text-gray-500">No model performance metrics available.</div>
              ) : (
                models.map((model) => (
                  <div key={model.id || model.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-600">{model.name}</span>
                      <span className="font-bold text-gray-900">{model.version}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            model.task_type === 'thermal_anomaly' ? 'bg-amber-500' :
                            model.task_type === 'rebar_detection' ? 'bg-purple-600' : 'bg-blue-600'
                          }`} 
                          style={{ width: `${Math.min(100, Math.max(0, model.accuracy))}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-bold w-8 ${
                        model.task_type === 'thermal_anomaly' ? 'text-amber-600' :
                        model.task_type === 'rebar_detection' ? 'text-purple-600' : 'text-blue-600'
                      }`}>{Math.round(model.accuracy)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#022C4F] to-[#044c8c] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-blue-300" />
              <h3 className="font-bold text-lg">AI Feedback Loop</h3>
            </div>
            <p className="text-sm text-blue-100 mb-6 leading-relaxed">
              When you manually resolve or dismiss anomalies, the Digital Eye inference engine retrains in the background, improving precision for future scans.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="text-xs text-blue-200 mb-1">False Positives</div>
                <div className="text-xl font-bold flex items-center gap-2">
                  {feedbackStats && feedbackStats.false_positive_rate !== null ? (
                    <>{feedbackStats.false_positive_rate}% <TrendingDown size={16} className="text-emerald-400" /></>
                  ) : (
                    <span className="text-blue-200 text-sm font-medium">No feedback yet</span>
                  )}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="text-xs text-blue-200 mb-1">True Positives</div>
                <div className="text-xl font-bold flex items-center gap-2">
                  {feedbackStats && feedbackStats.true_positive_rate !== null ? (
                    <>{feedbackStats.true_positive_rate}% <TrendingUp size={16} className="text-emerald-400" /></>
                  ) : (
                    <span className="text-blue-200 text-sm font-medium">No feedback yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
