"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, Save, Smartphone, Mail, Globe, AlertTriangle } from "lucide-react";

export default function NotificationPreferences() {
  const categories = [
    {
      title: "Critical Safety Incidents",
      description: "Work stoppages, severe environmental breaches, and major safety hazards.",
      icon: AlertTriangle,
      color: "text-red-500",
      settings: [
        { label: "In-App Dashboard Alerts", email: true, sms: true, push: true, locked: true },
      ]
    },
    {
      title: "Permits & Approvals",
      description: "New submissions, required reviews, and final sign-offs.",
      icon: Globe,
      color: "text-blue-500",
      settings: [
        { label: "New Permit Application", email: true, sms: false, push: true, locked: false },
        { label: "Technical Review Required", email: true, sms: false, push: true, locked: false },
        { label: "Approval Decision Finalized", email: true, sms: false, push: false, locked: false },
      ]
    },
    {
      title: "Field Inspections",
      description: "Inspection requests, NCR generation, and schedule changes.",
      icon: Smartphone,
      color: "text-emerald-500",
      settings: [
        { label: "Inspection Requested (Contractor)", email: true, sms: true, push: true, locked: false },
        { label: "Failed Inspection (NCR Generated)", email: true, sms: true, push: true, locked: false },
        { label: "Inspection Passed", email: false, sms: false, push: true, locked: false },
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Bell className="text-amber-500" />
            Notification Preferences
          </h1>
          <p className="text-gray-500 mt-1">Configure how and when the system sends automated alerts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <Save size={16} />
            Save Preferences
          </button>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Header Row for Toggles */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50/50 border-b border-gray-100">
             <div className="col-span-6"></div>
             <div className="col-span-2 text-center text-xs font-bold uppercase tracking-wider text-gray-500 flex flex-col items-center gap-1">
                <Globe size={16} /> In-App
             </div>
             <div className="col-span-2 text-center text-xs font-bold uppercase tracking-wider text-gray-500 flex flex-col items-center gap-1">
                <Mail size={16} /> Email
             </div>
             <div className="col-span-2 text-center text-xs font-bold uppercase tracking-wider text-gray-500 flex flex-col items-center gap-1">
                <Smartphone size={16} /> SMS Text
             </div>
          </div>

          {categories.map((cat, idx) => (
             <div key={idx} className="border-b border-gray-100 last:border-0">
                <div className="p-6 bg-gray-50/30">
                   <div className="flex items-center gap-3 mb-1">
                      <cat.icon size={18} className={cat.color} />
                      <h2 className="text-base font-bold text-gray-900">{cat.title}</h2>
                   </div>
                   <p className="text-sm text-gray-500 pl-7">{cat.description}</p>
                </div>

                <div className="p-6 space-y-6">
                   {cat.settings.map((setting, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                         <div className="md:col-span-6">
                            <p className="text-sm font-bold text-gray-700">{setting.label}</p>
                            {setting.locked && <p className="text-[10px] uppercase font-bold text-red-500 mt-1">System Required (Cannot Disable)</p>}
                         </div>
                         
                         {/* In-App Toggle */}
                         <div className="md:col-span-2 flex justify-start md:justify-center">
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                               setting.push ? 'bg-blue-600' : 'bg-gray-200'
                            } ${setting.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  setting.push ? 'translate-x-6' : 'translate-x-1'
                               }`} />
                            </div>
                            <span className="md:hidden ml-3 text-sm font-bold text-gray-500">In-App</span>
                         </div>
                         
                         {/* Email Toggle */}
                         <div className="md:col-span-2 flex justify-start md:justify-center">
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                               setting.email ? 'bg-blue-600' : 'bg-gray-200'
                            } ${setting.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  setting.email ? 'translate-x-6' : 'translate-x-1'
                               }`} />
                            </div>
                            <span className="md:hidden ml-3 text-sm font-bold text-gray-500">Email</span>
                         </div>

                         {/* SMS Toggle */}
                         <div className="md:col-span-2 flex justify-start md:justify-center">
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                               setting.sms ? 'bg-blue-600' : 'bg-gray-200'
                            } ${setting.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  setting.sms ? 'translate-x-6' : 'translate-x-1'
                               }`} />
                            </div>
                            <span className="md:hidden ml-3 text-sm font-bold text-gray-500">SMS</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
