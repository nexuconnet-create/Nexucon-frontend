"use client";
import React from "react";
import { AlertOctagon, UserX, ShieldCheck, History, Clock } from "lucide-react";

export default function RecurringOffenders() {
  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Blacklist & Verification</h1>
          <p className="text-gray-500 mt-1">Track recurring offenders, validate credentials, and monitor expiries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><UserX className="text-rose-500"/> Recurring Offenders List</h3>
          <div className="space-y-3">
            <div className="p-4 border border-rose-100 bg-rose-50 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-rose-900">Apex Builders Ltd.</h4>
                <p className="text-xs text-rose-700">3 Stop-Work Orders in last 12 months</p>
              </div>
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Blacklisted</span>
            </div>
            <div className="p-4 border border-amber-100 bg-amber-50 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-amber-900">Structura Engineering</h4>
                <p className="text-xs text-amber-700">2 Failed Concrete Tests (Warning Level)</p>
              </div>
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Monitoring</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="text-amber-500"/> License Expiry Tracking</h3>
          <div className="space-y-3">
            <div className="p-4 border border-gray-100 hover:bg-slate-50 transition-colors rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900">Engr. David Rossi</h4>
                <p className="text-xs text-gray-500">COREN License • ID: CRN-99234</p>
              </div>
              <span className="text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1 rounded-full">Expired 2 days ago</span>
            </div>
            <div className="p-4 border border-gray-100 hover:bg-slate-50 transition-colors rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900">BuildMax Corp</h4>
                <p className="text-xs text-gray-500">CAC Registration • RC-102934</p>
              </div>
              <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={14}/> Valid via API
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
