'use client';

import React from 'react';
import { Download, Filter, FileText, AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ReportsPage() {
  const financialData = [
    { category: 'Design Fees', budget: 15000, spent: 12000, status: 'On Track' },
    { category: 'BOQ Preparation', budget: 5000, spent: 5000, status: 'Completed' },
    { category: 'Permits & Approvals', budget: 8000, spent: 4000, status: 'In Progress' },
    { category: 'Site Investigations', budget: 4000, spent: 4500, status: 'Over Budget' },
  ];

  const progressData = [
    { phase: 'Concept Design', completion: 100 },
    { phase: 'Schematic Design', completion: 100 },
    { phase: 'Detailed Design', completion: 75 },
    { phase: 'Construction Documentation', completion: 20 },
  ];

  const riskData = [
    { issue: 'Delayed Soil Test Results', severity: 'High', mitigation: 'Expedited with external lab', status: 'In Progress' },
    { issue: 'Budget Overrun on Structural', severity: 'Medium', mitigation: 'Value engineering review scheduled', status: 'Pending' },
    { issue: 'Missing Zoning Permit', severity: 'Critical', mitigation: 'Consultant following up with city council', status: 'In Progress' },
  ];

  const auditData = [
    { action: 'Approved Architectural V4', user: 'John Doe (Client)', date: 'Oct 24, 2026', time: '14:30' },
    { action: 'Certified Structural V3', user: 'Sarah Williams (Skipper)', date: 'Oct 23, 2026', time: '09:15' },
    { action: 'Requested Revisions on MEP', user: 'Daniel Otero (Rep)', date: 'Oct 20, 2026', time: '16:45' },
  ];

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
            Reports Dashboard
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-3xl leading-relaxed">
            Monitor financial health, track design progress, mitigate project risks, and review detailed audit trails across all your active projects.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} /> Filter
          </Button>
          <Button variant="primary" className="flex items-center gap-2">
            <Download size={16} /> Export Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Financial Reports */}
        <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#022C4F]">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-[18px] font-extrabold text-[#022C4F]">Financial Overview</h3>
          </div>
          
          <div className="flex flex-col gap-5">
            {financialData.map((item, idx) => {
              const percentage = Math.min((item.spent / item.budget) * 100, 100);
              const isOver = item.spent > item.budget;
              return (
                <div key={idx} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] font-bold text-[#0F181F]">{item.category}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${isOver ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[20px] font-extrabold text-[#022C4F]">${item.spent.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-500 font-medium">of ${item.budget.toLocaleString()} budget</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-[#022C4F]'}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Reports */}
        <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle size={20} />
            </div>
            <h3 className="text-[18px] font-extrabold text-[#022C4F]">Design Progress</h3>
          </div>

          <div className="flex flex-col gap-6">
            {progressData.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-bold text-[#0F181F]">{item.phase}</span>
                  <span className="text-[13px] font-extrabold text-[#022C4F]">{item.completion}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8BC34A] rounded-full" style={{ width: `${item.completion}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Reports */}
        <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <AlertCircle size={20} />
            </div>
            <h3 className="text-[18px] font-extrabold text-[#022C4F]">Risk Register</h3>
          </div>

          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Identified Issue</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mitigation Plan</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {riskData.map((risk, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-[13px] font-bold text-[#0F181F]">{risk.issue}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                        risk.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                        risk.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[12px] text-gray-600 font-medium">{risk.mitigation}</td>
                    <td className="py-4 px-4 text-[12px] font-bold text-[#022C4F]">{risk.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Reports */}
        <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Clock size={20} />
            </div>
            <h3 className="text-[18px] font-extrabold text-[#022C4F]">Audit Log</h3>
          </div>

          <div className="flex flex-col gap-4">
            {auditData.map((log, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#022C4F]/5 flex items-center justify-center text-[#022C4F]">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#0F181F]">{log.action}</h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">Performed by <span className="text-[#022C4F] font-bold">{log.user}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold text-gray-700">{log.date}</p>
                  <p className="text-[11px] text-gray-500 font-medium">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
