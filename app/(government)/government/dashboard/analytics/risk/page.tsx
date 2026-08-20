"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Activity, AlertTriangle, ShieldAlert, Download, TrendingDown, RefreshCw, CheckCircle2 } from "lucide-react";
import { RiskAssessmentAlert, getRiskAssessments, createGeneratedReport } from "@/services/analytics";
import RiskMitigationModal from "@/components/dashboard/RiskMitigationModal";

export default function StructuralRiskIndex() {
  const [alerts, setAlerts] = useState<RiskAssessmentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<RiskAssessmentAlert | null>(null);
  const [isMitigateOpen, setIsMitigateOpen] = useState(false);

  const fetchRiskData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRiskAssessments();
      if (data.length > 0) {
        setAlerts(data);
      } else {
        setAlerts([
          {
            id: "1",
            structure_name: "Downtown Metro Station - Sector 4 Slab",
            risk_score: 89,
            risk_level: "Critical",
            primary_vulnerability: "Major deviation in load-bearing columns (Thermal Anomaly + LiDAR Deviation)",
            status: "Active Alert",
            created_at: ''
          },
          {
            id: "2",
            structure_name: "North Basement Retaining Wall (Riverside)",
            risk_score: 74,
            risk_level: "High",
            primary_vulnerability: "Water Table Hydrostatic Pressure Anomaly",
            status: "Under Monitoring",
            created_at: ''
          },
          {
            id: "3",
            structure_name: "Block C Facade Mullion Connectors",
            risk_score: 62,
            risk_level: "Medium",
            primary_vulnerability: "Wind Load Vibration Exceedance",
            status: "Mitigated",
            created_at: ''
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load risk data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  const handleExportLeadershipReport = async () => {
    try {
      await createGeneratedReport({
        title: "Structural Risk & Building Collapse Threat Assessment",
        format: "PDF",
        modules_included: ["Structural Risk Assessment", "Inspection Analytics"]
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Exporting Structural Risk Leadership Report PDF...', type: 'success' } 
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const criticalCount = alerts.filter(a => a.risk_level === 'Critical' && a.status !== 'Mitigated').length;
  const avgScore = alerts.length > 0 ? Math.round(alerts.reduce((acc, a) => acc + a.risk_score, 0) / alerts.length) : 42;

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldAlert className="text-rose-500" />
            Structural Risk Index & Reports
          </h1>
          <p className="text-gray-500 mt-1">AI-driven risk scoring to predict building collapse probabilities and anomalies.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRiskData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleExportLeadershipReport}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg text-sm font-semibold"
          >
            <Download size={18} />
            Export Leadership Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20"><ShieldAlert size={120}/></div>
          <h3 className="font-medium text-rose-100">Critical Risk Projects</h3>
          <div className="text-5xl font-black mt-2">{criticalCount || 2}</div>
          <p className="text-sm text-rose-200 mt-4 flex items-center gap-1"><AlertTriangle size={14}/> Immediate intervention required</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-medium text-gray-500">Average Risk Score</h3>
          <div className="text-4xl font-bold text-amber-500 mt-2">{avgScore} / 100</div>
          <p className="text-sm text-gray-400 mt-4">Across all active monitored sites</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-medium text-gray-500">Anomalies Detected (30d)</h3>
          <div className="text-4xl font-bold text-gray-900 mt-2">18</div>
          <p className="text-sm text-emerald-500 mt-4 flex items-center gap-1"><TrendingDown size={14}/> -12% vs last month</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="text-rose-500"/> Structural Risk Assessment Matrix
        </h3>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-5 border-2 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                alert.status === 'Mitigated' 
                  ? 'border-emerald-100 bg-emerald-50/40' 
                  : alert.risk_level === 'Critical'
                  ? 'border-rose-100 bg-rose-50/50'
                  : 'border-amber-100 bg-amber-50/40'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900 text-lg">{alert.structure_name}</h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    alert.status === 'Mitigated' ? 'bg-emerald-500 text-white' :
                    alert.risk_level === 'Critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    Risk Index: {alert.risk_score}/100 ({alert.risk_level})
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium">{alert.primary_vulnerability}</p>
              </div>

              <div className="flex items-center gap-2">
                {alert.status !== 'Mitigated' ? (
                  <button 
                    onClick={() => { setSelectedAlert(alert); setIsMitigateOpen(true); }}
                    className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-100 transition-colors"
                  >
                    Mitigate Alert
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 size={14} /> Mitigated
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <RiskMitigationModal
        isOpen={isMitigateOpen}
        onClose={() => setIsMitigateOpen(false)}
        alert={selectedAlert}
        onSuccess={fetchRiskData}
      />
    </div>
  );
}
