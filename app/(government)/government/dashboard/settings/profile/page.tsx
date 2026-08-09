"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings, Save, Upload, MapPin, Mail, Phone, Building } from "lucide-react";

export default function AgencyProfile() {
  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Settings className="text-blue-500" />
            Agency Profile
          </h1>
          <p className="text-gray-500 mt-1">Manage global configuration, contact details, and branding for the government entity.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Logo & Branding */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Agency Branding</h2>
            
            <div className="flex items-start gap-8">
              <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
                <Building size={32} className="mb-2 text-gray-300" />
                <span className="text-xs font-bold">Upload Logo</span>
              </div>
              
              <div className="flex-1 space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Agency Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="Department of Urban Development" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Short Name / Acronym</label>
                  <input 
                    type="text" 
                    defaultValue="DUD-City" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Public Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Mail size={14} /> Official Email</label>
                <input 
                  type="email" 
                  defaultValue="contact@dud.city.gov" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Phone size={14} /> Main Phone</label>
                <input 
                  type="tel" 
                  defaultValue="+1 (555) 019-2000" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={14} /> Physical Address</label>
                <textarea 
                  rows={3}
                  defaultValue="100 City Hall Plaza\nSuite 400\nMetropolis, NY 10007" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Regional Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Timezone</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Mountain Time (MT)</option>
                  <option>Pacific Time (PT)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Measurement System</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
                  <option>Imperial (ft, lbs)</option>
                  <option>Metric (m, kg)</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
