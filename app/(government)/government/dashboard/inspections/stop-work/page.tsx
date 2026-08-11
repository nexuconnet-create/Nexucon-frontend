"use client";
import React from "react";
import { AlertOctagon, FileWarning, Search, Filter, Plus, FileText, CheckCircle, Clock } from "lucide-react";

export default function StopWorkOrders() {
  const swos = [
    { id: "SWO-2026-081", project: "Downtown Metro Station", reason: "Critical Structural Deviation", issuedBy: "T. Bakare", date: "Oct 10, 2026", status: "active" },
    { id: "SWO-2026-082", project: "Riverside Complex", reason: "Unregistered Developer (CAC Failure)", issuedBy: "System Escalation", date: "Oct 11, 2026", status: "active" },
    { id: "SWO-2026-079", project: "Highway Bridge A4", reason: "Failed Concrete Core Test", issuedBy: "O. Adeleke", date: "Oct 05, 2026", status: "lifted" },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Stop-Work Orders</h1>
          <p className="text-gray-500 mt-1">Enforce compliance by suspending construction activities.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-900/20">
          <AlertOctagon size={18} />
          <span className="font-medium">Issue New Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-gray-500">Active SWOs</p><h2 className="text-3xl font-bold text-rose-600 mt-1">12</h2></div>
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600"><AlertOctagon size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-gray-500">Pending Appeals</p><h2 className="text-3xl font-bold text-amber-600 mt-1">4</h2></div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><FileWarning size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm font-medium text-gray-500">Orders Lifted (30d)</p><h2 className="text-3xl font-bold text-emerald-600 mt-1">28</h2></div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle size={24}/></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search orders..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors">
            <Filter size={16}/> Filter
          </button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Order ID</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Project</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Reason</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Date Issued</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Status</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {swos.map((swo) => (
              <tr key={swo.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-6 text-sm font-medium text-gray-900">{swo.id}</td>
                <td className="py-4 px-6 text-sm font-bold text-gray-700">{swo.project}</td>
                <td className="py-4 px-6 text-sm text-rose-600 font-medium">{swo.reason}</td>
                <td className="py-4 px-6 text-sm text-gray-500"><Clock size={14} className="inline mr-1 mb-0.5"/>{swo.date}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    swo.status === 'active' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {swo.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-end gap-1 ml-auto">
                    <FileText size={16}/> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
