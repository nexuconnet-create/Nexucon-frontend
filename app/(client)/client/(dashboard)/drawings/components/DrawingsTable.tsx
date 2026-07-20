'use client';

import React from 'react';
import { MoreHorizontal, ChevronLeft, ChevronRight, Archive, Cloud, CloudOff } from 'lucide-react';

export default function DrawingsTable() {
  const drawings = [
    { id: 'ARC-001', name: 'Ground Floor Plan', discipline: 'Architectural', version: 'v1.4', status: 'Approved', comments: 24, source: 'AutoCAD', offline: true },
    { id: 'ARC-002', name: 'First Floor Plan', discipline: 'Architectural', version: 'v1.5', status: 'Approved', comments: 18, source: 'Revit', offline: true },
    { id: 'ARC-003', name: 'Roof Layout Plan', discipline: 'Architectural', version: 'v1.6', status: 'Approved', comments: 12, source: 'AutoCAD', offline: false },
    { id: 'ARC-004', name: 'Building Elevations', discipline: 'Architectural', version: 'v1.6', status: 'Under Review', comments: 8, source: 'Revit', offline: false },
    { id: 'ARC-005', name: 'Section Details', discipline: 'Architectural', version: 'v1.7', status: 'Pending Approval', comments: 7, source: 'Revit', offline: true },
  ];

  return (
    <div className="bg-white rounded-[32px] border border-[#022C4F] p-8 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[20px] font-extrabold text-[#022C4F]">Drawing Categories</h3>

        {/* Pagination Dots & Arrows */}
        <div className="flex items-center gap-3">
          <button className="w-6 h-6 rounded-full bg-[#022C4F] flex items-center justify-center text-white hover:bg-[#033A6B] transition-colors shadow-sm">
            <ChevronLeft size={14} />
          </button>
          <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#022C4F]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
          </div>
          <button className="w-6 h-6 rounded-full bg-[#022C4F] flex items-center justify-center text-white hover:bg-[#033A6B] transition-colors shadow-sm">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="bg-[#022C4F] text-white">
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider rounded-l-2xl">Drawing ID</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Drawing Name</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Discipline</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Source</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Version</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider">Status</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider text-center">Offline</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider text-center">Comments</th>
              <th className="py-4 px-6 text-[10px] font-bold capitalize tracking-wider rounded-r-2xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {drawings.map((doc, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                <td className="py-5 px-6 text-[11px] font-bold text-[#0F181F]">{doc.id}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{doc.name}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{doc.discipline}</td>
                <td className="py-5 px-6">
                  <span className="text-[9px] font-bold bg-blue-50 text-[#022C4F] px-2 py-1 rounded-md border border-blue-100">
                    {doc.source}
                  </span>
                </td>
                <td className="py-5 px-6 text-[11px] font-bold text-[#022C4F]">{doc.version}</td>
                <td className="py-5 px-6 text-[11px] font-medium text-gray-700">{doc.status}</td>
                <td className="py-5 px-6 text-center">
                  {doc.offline ? (
                    <div className="flex justify-center" title="Available Offline">
                      <Cloud size={16} className="text-green-500" />
                    </div>
                  ) : (
                    <div className="flex justify-center" title="Cloud Only">
                      <CloudOff size={16} className="text-gray-300" />
                    </div>
                  )}
                </td>
                <td className="py-5 px-6 text-[11px] font-bold text-gray-700 text-center">{doc.comments}</td>
                <td className="py-5 px-6">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Drawing archived successfully.', type: 'info' } })); }} 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      title="Archive Drawing"
                    >
                      <Archive size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Menu executed successfully!', type: 'success' } })); }} 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#022C4F] hover:bg-[#022C4F]/10 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
