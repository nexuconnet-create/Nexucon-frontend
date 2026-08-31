"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, AlertTriangle, ThermometerSun, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface ScanReportSummaryProps {
  sessionId: string;
  reportData: {
    defect_count: number;
    anomaly_count: number;
    recommendations: string[];
    report_url: string;
  } | null;
  apiUrl: string;
}

export default function ScanReportSummary({ sessionId, reportData, apiUrl }: ScanReportSummaryProps) {
  const [defects, setDefects] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    if (reportData) {
      fetchExtras();
    }
  }, [reportData]);

  const fetchExtras = async () => {
    setLoadingExtras(true);
    try {
      const [defectsRes, anomaliesRes] = await Promise.all([
        api.get(`/scans/${sessionId}/defects/`).catch(() => null),
        api.get(`/scans/${sessionId}/thermal-anomalies/`).catch(() => null),
      ]);

      if (defectsRes && defectsRes.data) {
        setDefects(defectsRes.data.results || defectsRes.data || []);
      }
      
      if (anomaliesRes && anomaliesRes.data) {
        setAnomalies(anomaliesRes.data.results || anomaliesRes.data || []);
      }
    } catch (e) {
      console.error("Failed to load extra report data", e);
    } finally {
      setLoadingExtras(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setDownloading(true);
    try {
      const response = await api.get(`/scans/${sessionId}/report/pdf/`, {
        responseType: 'blob' // Important to get the binary file with JWT token!
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `QA_QC_Report_${sessionId.substring(0,8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download report", error);
      alert("Failed to download PDF report. The session may not have a generated report yet.");
    } finally {
      setDownloading(false);
    }
  };

  if (!reportData) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          QA/QC Report Summary
        </h2>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-red-50 rounded-lg p-5 border border-red-100 flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium uppercase tracking-wide">Structural Defects</p>
              <h3 className="text-3xl font-bold text-red-900 mt-1">{reportData.defect_count}</h3>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-5 border border-orange-100 flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <ThermometerSun className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium uppercase tracking-wide">Thermal Anomalies</p>
              <h3 className="text-3xl font-bold text-orange-900 mt-1">{reportData.anomaly_count}</h3>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {reportData.recommendations && reportData.recommendations.length > 0 ? (
              reportData.recommendations.map((rec: any, idx: number) => {
                // The backend returns recommendations as objects
                // ({recommendation, priority, related_finding_id}); plain
                // strings are also accepted.
                const text = typeof rec === 'string' ? rec : rec.recommendation || rec.description || '';
                const priority = typeof rec === 'object' ? rec.priority : null;
                return (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-blue-500 font-bold">{idx + 1}.</span>
                    <span className="flex-1">{text}</span>
                    {priority && (
                      <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${
                        priority.toLowerCase() === 'urgent' ? 'bg-red-100 text-red-700' :
                        priority.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {priority}
                      </span>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="text-gray-500 italic">No specific recommendations provided.</li>
            )}
          </ul>
        </div>

        {/* Detailed Lists */}
        {loadingExtras ? (
          <div className="flex items-center justify-center p-8 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading detailed findings...
          </div>
        ) : (
          <div className="space-y-6">
            {defects.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Detected Defects</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-2 rounded-tl-lg">Type</th>
                        <th className="px-4 py-2">Severity</th>
                        <th className="px-4 py-2 rounded-tr-lg">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defects.map((d, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-800">{d.type || 'Unknown'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              d.severity === 'high' ? 'bg-red-100 text-red-700' :
                              d.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {d.severity || 'Normal'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{d.description || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {anomalies.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Thermal Anomalies</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-2 rounded-tl-lg">Location</th>
                        <th className="px-4 py-2">ΔT (°C)</th>
                        <th className="px-4 py-2 rounded-tr-lg">Classification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anomalies.map((a, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-800">{a.location || 'N/A'}</td>
                          <td className="px-4 py-3 text-red-600 font-semibold">+{a.delta_t || '0'}°</td>
                          <td className="px-4 py-3 text-gray-600">{a.classification || 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
