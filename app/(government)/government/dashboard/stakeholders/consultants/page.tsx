"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, ShieldCheck, MapPin, Scale, Leaf, Ear, Shield } from "lucide-react";

export default function ConsultantsDirectory() {
  const consultants = [
    {
      id: "CNS-101",
      name: "EcoBalance Partners",
      specialty: "Environmental",
      status: "Verified",
      activeRoles: 4,
      hq: "Seattle, WA",
      description: "Specializes in deep soil analysis, silt runoff management, and acoustic/noise compliance for urban environments.",
      icon: Leaf,
      color: "bg-emerald-600 text-white"
    },
    {
      id: "CNS-204",
      name: "Lexicon Advisory Group",
      specialty: "Legal & Zoning",
      status: "Verified",
      activeRoles: 2,
      hq: "Washington, DC",
      description: "Provides third-party legal oversight for master variance requests and public air-rights negotiations.",
      icon: Scale,
      color: "bg-slate-700 text-white"
    },
    {
      id: "CNS-312",
      name: "Acoustic Dynamics",
      specialty: "Noise Mitigation",
      status: "Pending Review",
      activeRoles: 0,
      hq: "Boston, MA",
      description: "Consults on heavy machinery dampening and night-shift decibel management strategies.",
      icon: Ear,
      color: "bg-blue-600 text-white"
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Users className="text-blue-500" />
            Third-Party Consultants
          </h1>
          <p className="text-gray-500 mt-1">Directory of specialized advisory firms for environmental, legal, and safety oversight.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative hidden md:block">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input 
               type="text" 
               placeholder="Search consultants..." 
               className="pl-9 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
             />
           </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultants.map((firm, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={firm.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative"
          >
            {/* Specialty Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                firm.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {firm.status === 'Verified' && <ShieldCheck size={12} />}
                {firm.status}
              </span>
            </div>

            <div className={`h-24 ${firm.color} p-6 flex items-start`}>
               <firm.icon size={32} className="opacity-80" />
            </div>

            <div className="p-6 flex-1 flex flex-col relative pt-8">
              {/* Overlapping ID Badge */}
              <div className="absolute -top-4 left-6 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-gray-700">
                {firm.id}
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-1">{firm.name}</h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
                <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-700 uppercase tracking-wider font-bold">{firm.specialty}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {firm.hq}</span>
              </div>

              <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                {firm.description}
              </p>

              <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-0.5">Active Advisory Roles</p>
                   <p className="text-lg font-bold text-gray-900">{firm.activeRoles}</p>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-blue-600 hover:bg-gray-50 shadow-sm transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
