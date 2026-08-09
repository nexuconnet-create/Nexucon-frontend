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
  ArrowRight
} from "lucide-react";

export default function ProcessingPipeline() {
  const [logs, setLogs] = useState<string[]>([
    "[10:45:01] INFO - Initializing pipeline for SCN-26-002...",
    "[10:45:02] INFO - Fetching LiDAR asset (1.2GB) from S3 bucket...",
    "[10:45:10] INFO - Download complete. Starting point cloud alignment...",
  ]);

  useEffect(() => {
    // Simulate incoming logs
    const newLogs = [
      "[10:45:15] INFO - Running ICP registration (Iteration 1)...",
      "[10:45:18] INFO - ICP registration (Iteration 2)...",
      "[10:45:22] WARN - Low point density detected in sector 4B.",
      "[10:45:25] INFO - ICP registration completed. Error: 0.002m.",
      "[10:45:26] INFO - Starting mesh generation...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < newLogs.length) {
        setLogs(prev => [...prev, newLogs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const pipelineStages = [
    { name: "Ingestion", status: "completed", desc: "Data transfer from edge devices." },
    { name: "Alignment", status: "completed", desc: "Point cloud registration." },
    { name: "Meshing", status: "processing", desc: "Generating 3D surfaces." },
    { name: "AI Inference", status: "pending", desc: "Running anomaly detection models." },
    { name: "Export", status: "pending", desc: "Generating deliverables." },
  ];

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
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Healthy
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-600 flex items-center gap-1.5"><Cpu size={14}/> GPU Utilization</span>
                <span className="font-bold text-gray-900">78%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-600 flex items-center gap-1.5"><Activity size={14}/> Memory (RAM)</span>
                <span className="font-bold text-gray-900">45GB / 64GB</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Job Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Active Job: SCN-26-002</h2>
            <span className="text-sm font-medium text-blue-600">Riverside Commercial Complex</span>
          </div>

          <div className="flex items-center justify-between relative mb-8">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10"></div>
            
            {pipelineStages.map((stage, idx) => (
              <div key={stage.name} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm ${
                  stage.status === 'completed' ? 'bg-emerald-500 text-white' :
                  stage.status === 'processing' ? 'bg-blue-500 text-white border-2 border-blue-200' :
                  'bg-gray-100 text-gray-400 border border-gray-200'
                }`}>
                  {stage.status === 'completed' ? <CheckCircle size={16} /> :
                   stage.status === 'processing' ? <RefreshCcw size={14} className="animate-spin" /> :
                   <Clock size={16} />}
                </div>
                <span className={`text-xs font-bold ${
                  stage.status === 'completed' ? 'text-emerald-700' :
                  stage.status === 'processing' ? 'text-blue-700' :
                  'text-gray-400'
                }`}>{stage.name}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 mb-1">Current Stage: Meshing</h4>
            <p className="text-xs text-blue-700 mb-3">Reconstructing 3D surfaces from aligned point cloud data.</p>
            <div className="w-full bg-blue-100 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full relative" style={{ width: "45%" }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-blue-500 uppercase mt-2">
              <span>0%</span>
              <span>45% Complete</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Terminal Logs */}
      <div className="bg-[#0a192f] rounded-2xl shadow-xl overflow-hidden border border-gray-800 flex flex-col h-[400px]">
        <div className="bg-[#020c1b] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Terminal size={16} />
            <span className="text-sm font-mono tracking-wider">nexucon-processing-node-01</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto font-mono text-[13px] leading-relaxed">
          {logs.map((log: string, i: number) => (
            <div key={i} className="mb-1">
              <span className="text-gray-500">{log?.substring(0, 12)}</span>
              <span className={`ml-2 ${
                log?.includes('INFO') ? 'text-blue-400' :
                log?.includes('WARN') ? 'text-amber-400' :
                log?.includes('ERR') ? 'text-red-400' : 'text-gray-300'
              }`}>{log?.substring(12, 19)}</span>
              <span className="text-gray-300 ml-2">{log?.substring(19)}</span>
            </div>
          ))}
          <div className="flex items-center mt-2">
            <span className="text-emerald-500 animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  );
}
