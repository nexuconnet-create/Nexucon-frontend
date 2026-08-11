"use client";
import React from "react";
import { Clock, AlertTriangle, FileWarning, Search } from "lucide-react";

export default function DocumentExpiryTracking() {
  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Expiry & Validity Tracking</h1>
          <p className="text-gray-500 mt-1">Track permits, licenses, and certifications approaching their expiration dates.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center"><AlertTriangle size={32}/></div>
          <div><h2 className="text-2xl font-bold text-gray-900">4 Permits Expired</h2><p className="text-sm text-gray-500">Action required immediately</p></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center"><Clock size={32}/></div>
          <div><h2 className="text-2xl font-bold text-gray-900">12 Approaching Expiry</h2><p className="text-sm text-gray-500">Expiring in next 30 days</p></div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search documents..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64" />
          </div>
        </div>
        <div className="p-6 text-center text-gray-500 py-20 flex flex-col items-center">
          <FileWarning size={48} className="text-gray-300 mb-4"/>
          <p>List of documents will render here...</p>
        </div>
      </div>
    </div>
  );
}
