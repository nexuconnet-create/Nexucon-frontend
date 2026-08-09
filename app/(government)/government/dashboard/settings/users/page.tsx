"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, UserPlus, MoreVertical, ShieldCheck, Mail } from "lucide-react";

export default function UserManagement() {
  const users = [
    {
      id: "USR-01",
      name: "Elena Rodriguez",
      email: "elena.r@dud.city.gov",
      role: "System Administrator",
      department: "IT / Operations",
      status: "Active",
      lastLogin: "2 mins ago"
    },
    {
      id: "USR-02",
      name: "Marcus Chen",
      email: "m.chen@dud.city.gov",
      role: "Lead Inspector",
      department: "Structural Engineering",
      status: "Active",
      lastLogin: "1 hour ago"
    },
    {
      id: "USR-05",
      name: "David Rivera",
      email: "drivera@dud.city.gov",
      role: "Reviewer",
      department: "Environmental Planning",
      status: "Inactive",
      lastLogin: "3 weeks ago"
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Users className="text-blue-500" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage internal government staff access, roles, and departmental assignments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <UserPlus size={16} />
            Invite User
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email, or role..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Role & Department</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Last Login</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0 border border-blue-100">
                        {user.name.charAt(0)}{user.name.split(' ')[1].charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">{user.name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} /> {user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                        {user.role === 'System Administrator' && <ShieldCheck size={10} />}
                        {user.role}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">{user.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                      user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {user.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-600">{user.lastLogin}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm">
          <span className="text-gray-500 font-semibold">Showing 1 to 3 of 145 internal users</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 bg-white font-semibold shadow-sm disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 bg-white font-semibold shadow-sm">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
