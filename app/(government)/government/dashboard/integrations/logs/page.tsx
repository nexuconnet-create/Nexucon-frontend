"use client";

import React from "react";
import { motion } from "framer-motion";
import { History, Search, Filter, AlertCircle, CheckCircle2, ChevronRight, XCircle } from "lucide-react";

export default function IntegrationLogs() {
  const logs = [
    { id: "log-8821a", time: "Oct 12, 10:42 AM", service: "Tersus GNSS", event: "Sync Point Cloud", status: "Success", details: "145 MB transferred" },
    { id: "log-8821b", time: "Oct 12, 10:38 AM", service: "SharePoint", event: "Upload Permit PDF", status: "Failed", details: "Error 500: Timeout" },
    { id: "log-8821c", time: "Oct 12, 10:15 AM", service: "National Land Registry", event: "Parcel Lookup", status: "Success", details: "200 OK" },
    { id: "log-8821d", time: "Oct 12, 09:55 AM", service: "Procore", event: "Webhook Received", status: "Success", details: "Project Updated" },
    { id: "log-8821e", time: "Oct 12, 09:30 AM", service: "Procore", event: "Webhook Received", status: "Warning", details: "Retry 1/3 successful" },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-orange-500" />
            Integration Logs
          </h1>
          <p className="text-gray-500 mt-1">Audit trail of all inbound and outbound API and webhook activity.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search logs by ID, service, or event..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold">
            <Filter size={16} />
            Filter Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Service</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Event</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log, idx) => (
                <motion.tr 
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-700">{log.time}</span>
                    <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{log.id}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">{log.service}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-600">{log.event}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {log.status === 'Success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                      {log.status === 'Failed' && <XCircle size={14} className="text-red-500" />}
                      {log.status === 'Warning' && <AlertCircle size={14} className="text-amber-500" />}
                      <span className={`text-sm font-bold ${
                        log.status === 'Success' ? 'text-emerald-700' :
                        log.status === 'Failed' ? 'text-red-700' :
                        'text-amber-700'
                      }`}>{log.status}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3 text-sm">
                      <span className="text-gray-500 font-mono text-xs">{log.details}</span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
          <button className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            Load More Logs
          </button>
        </div>
      </div>
    </div>
  );
}
