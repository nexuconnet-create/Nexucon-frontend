"use client";
import React from "react";
import { AlertTriangle, CheckCircle, Clock, Plus, Search, Filter, MessageSquare, Paperclip } from "lucide-react";

export default function CentralizedIssues() {
  const issues = [
    { id: "ISS-092", title: "Thermal Anomaly in HVAC Core", source: "Digital Eye (AI)", severity: "high", status: "open", assignee: "Robert Chen (Inspector)", date: "2 hours ago" },
    { id: "ISS-093", title: "Clash: Structural vs MEP Pipe", source: "BIM Detection", severity: "critical", status: "in_progress", assignee: "Sarah Jenkins (BIM Manager)", date: "5 hours ago" },
    { id: "ISS-094", title: "Deviation: Concrete Pour out of tolerance", source: "Scan-to-BIM", severity: "medium", status: "open", assignee: "David Rossi (Contractor)", date: "1 day ago" },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Issue Management</h1>
          <p className="text-gray-500 mt-1">Centralized ticketing for BIM clashes, AI detected anomalies, and site defects.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors shadow-lg shadow-blue-900/20">
          <Plus size={18} />
          <span className="font-medium">Create Issue</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-gray-500">Total Open</p><h2 className="text-3xl font-bold text-gray-900 mt-1">24</h2></div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><AlertTriangle size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-gray-500">Critical / High</p><h2 className="text-3xl font-bold text-rose-600 mt-1">7</h2></div>
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"><AlertTriangle size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-gray-500">AI Detected</p><h2 className="text-3xl font-bold text-indigo-600 mt-1">12</h2></div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500"><AlertTriangle size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-gray-500">Resolved (7d)</p><h2 className="text-3xl font-bold text-emerald-600 mt-1">45</h2></div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"><CheckCircle size={24}/></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search issues..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors">
            <Filter size={16}/> Filter
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {issues.map(issue => (
            <div key={issue.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-6 items-start group cursor-pointer">
              <div className="shrink-0">
                <div className={`p-2 rounded-full ${
                  issue.severity === 'critical' ? 'bg-rose-100 text-rose-600' :
                  issue.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <AlertTriangle size={20}/>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">{issue.title}</h3>
                  <span className="text-sm text-gray-400 flex items-center gap-1"><Clock size={14}/> {issue.date}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-900">{issue.id}</span>
                  <span>•</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{issue.source}</span>
                  <span>•</span>
                  <span>Assigned to: <span className="font-medium text-gray-900">{issue.assignee}</span></span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    issue.status === 'open' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-sm"><MessageSquare size={14}/> 3 comments</div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm"><Paperclip size={14}/> 2 attachments</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
