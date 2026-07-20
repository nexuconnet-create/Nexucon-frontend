'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DrawingMetrics from './components/DrawingMetrics';
import DrawingsTable from './components/DrawingsTable';
import ConstructionHandoff from './components/ConstructionHandoff';

export default function DrawingsPage() {
  const router = useRouter();
  return (
    <div className="max-w-7xl mx-auto py-8 px-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-10 gap-6">
        <div className="max-w-2xl">
          <h1 className="text-[32px] font-extrabold text-[#022C4F] mb-3 tracking-tight">Drawings & Plans</h1>
          <p className="text-[12px] text-[#0F181F] font-medium leading-relaxed">
            Access, review, organize, share, and approve all project drawings and technical plans. <br/>
            Collaborate with architects, engineers, consultants, and reviewers through annotations, comments, and structured review workflows.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-6 shrink-0">
          <div className="flex items-center gap-4 ml-auto">
            {/* Search Icon */}
            <button className="w-12 h-12 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm">
              <Search size={20} />
            </button>

            {/* Notifications */}
            <button className="relative w-12 h-12 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#0F181F] rounded-full"></span>
            </button>

            {/* User Profile Pill */}
            <button className="flex items-center gap-3 pl-2 pr-6 py-1.5 rounded-full border border-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm bg-white">
              <div className="w-9 h-9 rounded-full bg-[#022C4F] flex items-center justify-center text-white text-[12px] font-bold tracking-wider shrink-0">
                JD
              </div>
              <div className="flex flex-col items-start justify-center">
                <span className="text-[12px] font-bold text-[#0F181F] leading-tight">John Doe</span>
                <span className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5">client@nexucon.tech</span>
              </div>
            </button>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/client/drawings/repository')}
              className="py-3 px-6 border border-[#022C4F] text-[#022C4F] rounded-full text-[12px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              Go to Drawing Repository
            </button>
            <button 
              onClick={() => router.push('/client/drawings/review-center')}
              className="py-3 px-6 bg-[#022C4F] text-white rounded-full text-[12px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
            >
              Go to Review Center
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <DrawingMetrics />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          <DrawingsTable />
        </div>
        
        <div className="lg:col-span-1 flex flex-col">
          <ConstructionHandoff />
        </div>
      </div>
      
    </div>
  );
}
