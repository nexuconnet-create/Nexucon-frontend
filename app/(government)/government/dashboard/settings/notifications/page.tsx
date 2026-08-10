"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, Save, Smartphone, Mail, Globe, AlertTriangle, Network, Clock, Trash2, Plus } from "lucide-react";

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
        
        {/* Notification Routing & SLAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
                <Network className="text-blue-500" />
                Notification Routing & SLAs
              </h2>
              <p className="text-sm text-gray-500 mt-1">Define who receives critical notifications and escalation timelines.</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
              <Plus size={16} /> Add Routing Rule
            </button>
          </div>
          
          <div className="p-6">
            <div className="hidden md:grid grid-cols-4 gap-4 mb-4 font-bold text-xs uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
              <div className="col-span-1">Trigger Event</div>
              <div className="col-span-1">Primary Recipient</div>
              <div className="col-span-1">SLA / Timeline</div>
              <div className="col-span-1">Escalation Target</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <div className="col-span-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                  <AlertTriangle size={12} /> Critical Alerts
                </span>
              </div>
              <div className="col-span-1 text-sm font-semibold text-gray-800">
                Agency Director
              </div>
              <div className="col-span-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  <Clock size={12} /> Within 15 mins
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-between text-sm font-bold text-purple-700">
                Permanent Secretary
                <button className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <div className="col-span-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
                  <AlertTriangle size={12} /> Stop-Work Order
                </span>
              </div>
              <div className="col-span-1 text-sm font-semibold text-gray-800">
                Chief Inspector
              </div>
              <div className="col-span-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                  <Clock size={12} /> Within 2 hours
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-between text-sm font-bold text-gray-700">
                Agency Director
                <button className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        </motion.div>

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
