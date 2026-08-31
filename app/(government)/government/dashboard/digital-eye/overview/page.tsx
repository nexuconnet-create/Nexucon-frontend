"use client";

import React, { useEffect, useState } from "react";
import { 
  Activity, 
  Map, 
  Scan, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  BarChart,
  ArrowRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const FleetMap = dynamic(
  () => import('@/components/dashboard/digital-eye/FleetMap'),
  { ssr: false, loading: () => <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200">Loading map...</div> }
);
import { motion } from "framer-motion";
import api from "@/lib/api";

interface ScanSession {
  id: string;
  fullId: string;
  location: string;
  time: string;
  status: string;
  issues: number;
}

interface DashboardStats {
  active_scanners: number;
  scans_today: number;
  in_processing: number;
  ai_anomalies: number;
}

interface FleetScanner {
  id: string;
  device_id: string;
  model: string;
  status: string;
  battery_level: number;
  latitude: number | null;
  longitude: number | null;
  last_seen: string | null;
}

interface FleetData {
  scanners: FleetScanner[];
  online: number;
  offline: number;
  idle: number;
  total: number;
  scan_locations?: {
    session_id: string;
    name: string;
    status: string;
    latitude: number;
    longitude: number;
    created_at?: string;
    project_name?: string | null;
    notes?: string;
  }[];
}

export default function DigitalEyeOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<ScanSession[]>([]);
  const [fleet, setFleet] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, scansRes, fleetRes] = await Promise.all([
          api.get('/projects/dashboard-stats/').catch(() => ({ data: { active_scanners: 0, scans_today: 0, in_processing: 0, ai_anomalies: 0 } })),
          api.get('/scans/sessions/').catch(() => ({ data: [] })),
          api.get('/scans/fleet/').catch(() => ({ data: { scanners: [], online: 0, offline: 0, idle: 0, total: 0 } }))
        ]);
        
        setStats(statsRes.data);
        if (fleetRes.data) {
          setFleet(fleetRes.data);
        }

        // Take top 4 recent scans, with their real open-issue counts
        // (defects + thermal anomalies recorded against each session)
        const recent = (scansRes.data || []).slice(0, 4);
        const scans = await Promise.all(recent.map(async (scan: any) => {
          let issues = 0;
          try {
            const [defectsRes, anomaliesRes] = await Promise.all([
              api.get(`/scans/${scan.id}/defects/`).catch(() => ({ data: [] })),
              api.get(`/scans/${scan.id}/thermal-anomalies/`).catch(() => ({ data: [] })),
            ]);
            issues = (defectsRes.data?.length || 0) + (anomaliesRes.data?.length || 0);
          } catch {
            issues = 0;
          }
          return {
            id: scan.id?.substring(0, 8) || "—",
            fullId: scan.id || "",
            location: scan.name || `Session ${scan.id?.substring(0, 8) ?? ""}`,
            time: scan.created_at ? new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
            status: scan.status || 'initialized',
            issues
          };
        }));

        setRecentScans(scans);
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metrics = [
    { label: "Active Tersus S1 Scanners", value: fleet?.total ? `${fleet.online}/${fleet.total}` : (stats?.active_scanners || "0"), icon: Scan, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Scans Today", value: stats?.scans_today || "0", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "In Processing Queue", value: stats?.in_processing || "0", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "AI Anomalies Detected", value: stats?.ai_anomalies || "0", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Digital Eye (T-S1 MVP) Overview</h1>
          <p className="text-gray-500 mt-1">Command center for Tersus S1 fleet operations and digital twin generation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/government/dashboard/digital-eye/scan-sessions/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus size={18} />
            <span className="font-medium">New Scan Session</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={metric.label}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5"
            >
              <div className={`w-14 h-14 rounded-full ${metric.bg} flex items-center justify-center shrink-0`}>
                <Icon size={24} className={metric.color} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? <span className="text-gray-300">...</span> : metric.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Fleet Coverage Map */}
          <div className="bg-white rounded-2xl border border-gray-100 p-1 shadow-sm relative overflow-hidden group h-[400px]">
            {/* Real React-Leaflet Map */}
            <div className="absolute inset-0 z-0">
              <FleetMap scanners={fleet?.scanners || []} scans={fleet?.scan_locations || []} />
            </div>
            {/* UI Header overlay */}
            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-gray-200 pointer-events-auto flex items-center gap-3">
                  <Map size={18} className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Fleet Coverage Map</h3>
                    <p className="text-[11px] text-gray-500">
                      {fleet?.scan_locations?.length || 0} Scan Locations · {fleet?.total || 0} Scanners Registered
                    </p>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-xs font-medium text-emerald-600 flex items-center gap-2 pointer-events-auto">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Live Tracking Active • {fleet?.scan_locations?.length || 0} Scan Sites / {fleet?.online ?? 0} Online
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "View Scan Library", href: "/government/dashboard/digital-eye/scan-library", icon: Scan, desc: "Access raw and processed data." },
                { name: "Processing Pipeline", href: "/government/dashboard/digital-eye/processing-pipeline", icon: Activity, desc: "Monitor data ingestion status." },
                { name: "QA/QC Insights", href: "/government/dashboard/digital-eye/qa-qc-insights", icon: BarChart, desc: "Check sensor calibration metrics." }
              ].map((action, i) => (
                <Link key={i} href={action.href} className="group block p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                    <action.icon size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">{action.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{action.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Scans</h3>
              <Link href="/government/dashboard/digital-eye/scan-sessions" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-sm text-gray-500 text-center py-4">Loading recent scans...</div>
              ) : recentScans.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No recent scans found.</div>
              ) : (
                recentScans.map((scan, i) => (
                  <div
                    key={i}
                    onClick={() => router.push(`/government/dashboard/digital-eye/scan-sessions/${scan.fullId}`)}
                    className="p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-500">{scan.id}</span>
                      {scan.status === 'completed' && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider"><CheckCircle size={10} /> Done</span>}
                      {scan.status === 'processing' && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full uppercase tracking-wider"><Activity size={10} className="animate-pulse" /> Active</span>}
                      {scan.status === 'failed' && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full uppercase tracking-wider"><AlertTriangle size={10} /> Error</span>}
                      {scan.status === 'pending' && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded-full uppercase tracking-wider"><Clock size={10} /> Pending</span>}
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{scan.location}</h4>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} /> {scan.time}
                      </div>
                      {scan.issues > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-full uppercase tracking-wider">
                          <AlertTriangle size={10} /> {scan.issues} {scan.issues === 1 ? 'Issue' : 'Issues'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#022C4F] to-[#044c8c] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Scan size={100} />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">Tersus S1 Integration</h3>
            <p className="text-sm text-blue-100 mb-6 relative z-10 leading-relaxed">
              Your fleet is connected. Real-time kinematic data and LiDAR point clouds are streaming directly to the Nexucon processing engine.
            </p>
            <Link 
              href="/government/dashboard/digital-eye/integration-settings"
              className="inline-flex items-center justify-center w-full py-2.5 bg-white text-[#022C4F] font-semibold text-sm rounded-lg hover:bg-blue-50 transition-colors relative z-10"
            >
              Manage Connection Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

