"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Save, Plus, Search, Check, X, ShieldAlert } from "lucide-react";

export default function RolesPermissions() {
  const roles = [
    { name: "System Administrator", users: 3, type: "System Default" },
    { name: "City Planner", users: 12, type: "Custom Role" },
    { name: "Lead Inspector", users: 45, type: "Custom Role" },
    { name: "Reviewer", users: 85, type: "Custom Role" }
  ];

  const permissionModules = [
    {
      module: "Permits & Approvals",
      permissions: [
        { name: "View Permit Applications", admin: true, planner: true, inspector: true, reviewer: true },
        { name: "Approve/Reject Permits", admin: true, planner: true, inspector: false, reviewer: false },
        { name: "Grant Zoning Variances", admin: true, planner: true, inspector: false, reviewer: false },
        { name: "Sign Off Final Occupancy", admin: true, planner: true, inspector: true, reviewer: false },
      ]
    },
    {
      module: "Site Inspections",
      permissions: [
        { name: "View Inspection Logs", admin: true, planner: true, inspector: true, reviewer: true },
        { name: "Generate Non-Conformance (NCR)", admin: true, planner: false, inspector: true, reviewer: false },
        { name: "Halt Construction (Work Stoppage)", admin: true, planner: false, inspector: true, reviewer: false },
      ]
    },
    {
      module: "System & Audit",
      permissions: [
        { name: "View Audit Records", admin: true, planner: false, inspector: false, reviewer: false },
        { name: "Export Compliance Packages", admin: true, planner: false, inspector: false, reviewer: false },
        { name: "Manage Roles & Permissions", admin: true, planner: false, inspector: false, reviewer: false },
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldCheck className="text-purple-500" />
            Roles & Permissions
          </h1>
          <p className="text-gray-500 mt-1">Configure Role-Based Access Control (RBAC) and define permission matrices.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Col: Role List */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 border-dashed text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold">
            <Plus size={16} /> Create New Role
          </button>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="Search roles..." 
                   className="pl-8 pr-3 py-1.5 w-full bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>
            </div>
            <div className="divide-y divide-gray-100">
              {roles.map((role, idx) => (
                <div key={idx} className={`p-4 cursor-pointer transition-colors ${idx === 1 ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`text-sm font-bold ${idx === 1 ? 'text-blue-700' : 'text-gray-900'}`}>{role.name}</h3>
                    {role.name === 'System Administrator' && <ShieldAlert size={14} className="text-red-500" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{role.type}</span>
                    <span className="text-[10px] font-bold text-gray-500">{role.users} Users</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Permission Matrix */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div>
                  <h2 className="text-lg font-bold text-gray-900">Editing Permissions: City Planner</h2>
                  <p className="text-sm text-gray-500">Changes will affect 12 active users.</p>
               </div>
            </div>

            <div className="p-6">
               {permissionModules.map((module, mIdx) => (
                 <div key={mIdx} className="mb-8 last:mb-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 pb-2 border-b border-gray-100">
                       {module.module}
                    </h3>
                    
                    <div className="space-y-3">
                       {module.permissions.map((perm, pIdx) => (
                          <div key={pIdx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                             <span className="text-sm font-semibold text-gray-700">{perm.name}</span>
                             
                             {/* Toggle Switch */}
                             <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                perm.planner ? 'bg-blue-600' : 'bg-gray-200'
                             }`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                   perm.planner ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
