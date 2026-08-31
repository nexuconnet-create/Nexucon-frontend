"use client";

import React, { useState, useEffect } from "react";
import { 
  Server,
  Activity,
  CheckCircle,
  Clock,
  Terminal,
  Cpu,
  RefreshCcw,
  AlertTriangle,
  ArrowRight,
  Loader2
} from "lucide-react";
import api from "@/lib/api";

interface NodeStatus {
  hostname: string;
  status: string;
  cpu_utilization: number;
  gpu_utilization: number;
  memory_used_gb: number;
  memory_total_gb: number;
  gpu_workers: number;
}

/** Keep the console log array bounded so long-running polling doesn't grow it forever. */
const MAX_LOG_ENTRIES = 200;
function capLogs(logs: string[]): string[] {
  return logs.length > MAX_LOG_ENTRIES ? logs.slice(logs.length - MAX_LOG_ENTRIES) : logs;
}

export default function ProcessingPipeline() {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    setLogs([
      `[${new Date().toLocaleTimeString()}] INFO - Initializing pipeline connection...`,
      `[${new Date().toLocaleTimeString()}] INFO - Fetching server node status...`
    ]);
  }, []);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [pipelineStages, setPipelineStages] = useState([
    { name: "Ingestion", status: "completed", desc: "Data transfer from edge devices." },
    { name: "Alignment", status: "completed", desc: "Point cloud registration." },
    { name: "Meshing", status: "pending", desc: "Generating 3D surfaces." },
    { name: "AI Inference", status: "pending", desc: "Running anomaly detection models." },
    { name: "Export", status: "pending", desc: "Generating deliverables." },
  ]);
  const [loading, setLoading] = useState(true);

  const [nodeStatus, setNodeStatus] = useState<NodeStatus>({
    hostname: "Connecting...",
    status: "unknown",
    cpu_utilization: 0,
    gpu_utilization: 0,
    memory_used_gb: 0,
    memory_total_gb: 0,
    gpu_workers: 0,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);

        // 1. Fetch live node cluster status from backend
        try {
          const nodeRes = await api.get('/processing/node-status/');
          if (nodeRes.data) {
            const data = nodeRes.data;
            setNodeStatus({
              hostname: data.hostname || "Unknown Node",
              status: data.status || "unknown",
              cpu_utilization: data.cpu_utilization ?? 0,
              gpu_utilization: data.gpu_utilization ?? 0,
              memory_used_gb: data.memory_used_gb ?? 0,
              memory_total_gb: data.memory_total_gb ?? 0,
              gpu_workers: data.gpu_workers ?? 0,
            });
            setLogs(prev => capLogs([
              ...prev,
              `[${new Date().toLocaleTimeString()}] INFO - Node cluster status: ${(data.status || 'unknown').toUpperCase()} (CPU: ${data.cpu_utilization ?? 0}%, GPU: ${data.gpu_utilization ?? 0}%)`,
              `[${new Date().toLocaleTimeString()}] INFO - Allocated ${data.gpu_workers ?? 0} GPU workers.`
            ]));
          }
        } catch (e) {
          console.error("Failed to fetch node status", e);
        }

        // 2. Fetch sessions
        const res = await api.get('/scans/sessions/');
        const sessions = res.data;
        
        if (sessions.length > 0) {
          // Use the most recent session or first processing session
          const active = sessions.find((s: any) => s.status === 'processing') || sessions[0];
          setActiveSession(active);
          
          setLogs(prev => capLogs([...prev, `[${new Date().toLocaleTimeString()}] INFO - Found active session: ${active.id.substring(0,8)}`]));
          
          // 3. Fetch tasks for this session
          try {
            const tasksRes = await api.get(`/scans/${active.id}/processing-status/`);
            const tasks = tasksRes.data;
            
            // Map tasks to pipeline stages
            let ingestionStatus = active.status === 'initialized' ? 'pending' : 'completed';
            let aiStatus = 'pending';
            
            if (tasks.length > 0) {
              const aiTask = tasks.find((t: any) => t.task_type === 'ai_analysis');
              if (aiTask) {
                aiStatus = aiTask.status === 'completed' ? 'completed' : 
                          aiTask.status === 'in_progress' ? 'processing' : 'pending';
              }
            } else {
              // Fallback logic based on session status
              if (active.status === 'processing') aiStatus = 'processing';
              if (active.status === 'completed') aiStatus = 'completed';
            }
            
            setPipelineStages([
              { name: "Ingestion", status: ingestionStatus, desc: "Data transfer from edge devices." },
              { name: "Alignment", status: active.status === 'completed' ? 'completed' : 'processing', desc: "Point cloud registration." },
              { name: "Meshing", status: active.status === 'completed' ? 'completed' : 'pending', desc: "Generating 3D surfaces." },
              { name: "AI Inference", status: aiStatus, desc: "Running anomaly detection models." },
              { name: "Export", status: active.status === 'completed' ? 'completed' : 'pending', desc: "Generating deliverables." },
            ]);
            
            setLogs(prev => capLogs([...prev, `[${new Date().toLocaleTimeString()}] INFO - Pipeline stages synced.`]));

          } catch (e) {
            console.error("Failed to fetch tasks", e);
            setLogs(prev => capLogs([...prev, `[${new Date().toLocaleTimeString()}] WARN - Could not fetch task details.`]));
          }
        }
      } catch (error) {
        console.error("Failed to fetch sessions", error);
        setLogs(prev => capLogs([...prev, `[${new Date().toLocaleTimeString()}] ERR - Server unreachable.`]));
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
    
    // Set up polling
    const interval = setInterval(fetchStatus, 15000); // Poll every 15s
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const ramUsagePercent = Math.round((nodeStatus.memory_used_gb / (nodeStatus.memory_total_gb || 1)) * 100);
  const completedStagesCount = pipelineStages.filter(s => s.status === 'completed').length;
  const processingStagesCount = pipelineStages.filter(s => s.status === 'processing').length;
  const progressPercentage = Math.round(((completedStagesCount * 100) + (processingStagesCount * 50)) / (pipelineStages.length || 1));

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Processing Pipeline</h1>
          <p className="text-gray-500 mt-1">Monitor real-time data ingestion and server processing nodes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Node Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Server size={20} className="text-blue-600" />
              Node Cluster Status
            </h2>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
              nodeStatus.status === 'healthy' ? 'bg-emerald-100 text-emerald-700' :
              nodeStatus.status === 'degraded' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                nodeStatus.status === 'healthy' ? 'bg-emerald-500' :
                nodeStatus.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
              }`}></div>
              {nodeStatus.status}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-600 flex items-center gap-1.5"><Cpu size={14}/> GPU Utilization</span>
                <span className="font-bold text-gray-900">{Math.round(nodeStatus.gpu_utilization)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(0, nodeStatus.gpu_utilization))}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-600 flex items-center gap-1.5"><Activity size={14}/> Memory (RAM)</span>
                <span className="font-bold text-gray-900">{nodeStatus.memory_used_gb}GB / {nodeStatus.memory_total_gb}GB</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(0, ramUsagePercent))}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Job Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Active Job: {loading && !activeSession ? <Loader2 size={16} className="animate-spin text-blue-500" /> : (activeSession?.id ? `SCN-${activeSession.id.substring(0,8)}` : "None")}
            </h2>
            <span className="text-sm font-medium text-blue-600">{activeSession?.project_name || (activeSession?.project ? `Project ${activeSession.project}` : "N/A")}</span>
          </div>

          <div className="flex items-center justify-between relative mb-8 overflow-x-auto pb-4">
            <div className="absolute left-0 top-4 w-full h-1 bg-gray-100 -z-10"></div>
            
            {pipelineStages.map((stage) => (
              <div key={stage.name} className="flex flex-col items-center min-w-[80px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm ${
                  stage.status === 'completed' ? 'bg-emerald-500 text-white' :
                  stage.status === 'processing' ? 'bg-blue-500 text-white border-2 border-blue-200' :
                  'bg-gray-100 text-gray-400 border border-gray-200'
                }`}>
                  {stage.status === 'completed' ? <CheckCircle size={16} /> :
                   stage.status === 'processing' ? <RefreshCcw size={14} className="animate-spin" /> :
                   <Clock size={16} />}
                </div>
                <span className={`text-xs font-bold whitespace-nowrap ${
                  stage.status === 'completed' ? 'text-emerald-700' :
                  stage.status === 'processing' ? 'text-blue-700' :
                  'text-gray-400'
                }`}>{stage.name}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 mb-1 capitalize">Status: {activeSession?.status || "Idle"}</h4>
            <p className="text-xs text-blue-700 mb-3">Monitoring pipeline progression.</p>
            {activeSession?.status === 'processing' && (
              <>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full relative transition-all duration-500" style={{ width: `${progressPercentage}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-blue-500 uppercase mt-2">
                  <span>0%</span>
                  <span>{progressPercentage}%</span>
                  <span>100%</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Live Terminal Logs */}
      <div className="bg-[#0a192f] rounded-2xl shadow-xl overflow-hidden border border-gray-800 flex flex-col h-[400px]">
        <div className="bg-[#020c1b] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Terminal size={16} />
            <span className="text-sm font-mono tracking-wider">{nodeStatus.hostname}</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto font-mono text-[13px] leading-relaxed">
          {logs.map((log: string, i: number) => {
            if (typeof log !== 'string') return null;
            const timeMatch = log.match(/^\[(.*?)\]/);
            const timeStr = timeMatch ? timeMatch[0] : "";
            const restLog = timeMatch ? log.substring(timeMatch[0].length).trim() : log;
            const typeMatch = restLog.match(/^(INFO|WARN|ERR)/);
            const typeStr = typeMatch ? typeMatch[0] : "";
            const msg = typeMatch ? restLog.substring(typeMatch[0].length).trim() : restLog;

            return (
              <div key={i} className="mb-1">
                <span className="text-gray-500">{timeStr}</span>
                <span className={`ml-2 ${
                  typeStr === 'INFO' ? 'text-blue-400' :
                  typeStr === 'WARN' ? 'text-amber-400' :
                  typeStr === 'ERR' ? 'text-red-400' : 'text-gray-300'
                }`}>{typeStr}</span>
                <span className="text-gray-300 ml-2">{msg.startsWith('-') ? msg.substring(1).trim() : msg}</span>
              </div>
            );
          })}
          <div className="flex items-center mt-2">
            <span className="text-emerald-500 animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  );
}
