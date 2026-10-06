'use client';

import React, { useState, useEffect } from 'react';
import { Download, Filter, FileText, FileCheck, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getArchivedNdtReports, DeviceReportRecord } from '@/services/digitalEye';

export default function ReportsPage() {
  const [reports, setReports] = useState<DeviceReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getArchivedNdtReports()
      .then(data => {
        if (!cancelled) setReports(data || []);
      })
      .catch(err => {
        console.error("Failed to load reports:", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
            Official Assessment Reports
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-3xl leading-relaxed">
            Access and download certified Non-Destructive Testing (NDT) reports and digital twin assessments submitted by government inspectors.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} /> Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#022C4F]">
              <FileCheck size={20} />
            </div>
            <h3 className="text-[18px] font-extrabold text-[#022C4F]">Available Reports</h3>
          </div>
          
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm">Loading certified reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-sm text-gray-500 font-medium">No official assessment reports are available yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reports.map((report) => (
                <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-colors gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#022C4F]/5 flex items-center justify-center text-[#022C4F] shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#0F181F] mb-1">{report.report_reference}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-[12px]">
                        <span className="font-bold text-[#022C4F]">{report.project_name}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600 font-medium uppercase tracking-wider">{report.device_type} Assessment</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={report.report_file}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-[#022C4F] hover:bg-[#022C4F] hover:text-white hover:border-[#022C4F] transition-all shadow-sm"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
