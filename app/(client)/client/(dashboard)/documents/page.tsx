'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, MoreHorizontal, Archive, Cloud, CloudOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import CreateFolderDrawer from '@/components/dashboard/CreateFolderDrawer';
import UploadFilesDrawer from '@/components/dashboard/UploadFilesDrawer';

export default function DocumentsPage() {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadFilesOpen, setIsUploadFilesOpen] = useState(false);

  const recentDocs = [
    { name: 'Architectural Design Package.pdf', category: 'Design Documents', version: 'V4.0', status: 'Approved', date: 'Today', source: 'Revit', offline: true },
    { name: 'Structural Design Report.pdf', category: 'Technical Reports', version: 'V3.0', status: 'Under Review', date: 'Today', source: 'STAAD Pro', offline: false },
    { name: 'BOQ Package.xlsx', category: 'BOQ', version: 'V2.0', status: 'Approved', date: 'Yesterday', source: 'Excel', offline: true }
  ];

  const sharedDocs = [
    { name: 'Architectural Package', sharedWith: 'Design Team', date: 'Today' },
    { name: 'BOQ Package', sharedWith: 'Quantity Survey Team', date: 'Yesterday' },
    { name: 'Structural Reports', sharedWith: 'Review Committee', date: 'Yesterday' }
  ];

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
            Documents
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-3xl leading-relaxed">
            Manage, organize, review, and share all project documentation throughout the design, review, approval, and construction handoff process.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
          <Button variant="outline" onClick={() => setIsUploadFilesOpen(true)}>
            Upload Document
          </Button>
          <Button variant="primary" onClick={() => setIsCreateFolderOpen(true)}>
            Create New Folder
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Documents', value: '128' },
          { label: 'Approved Documents', value: '76' },
          { label: 'Under Review', value: '24' },
          { label: 'Draft Documents', value: '13' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-[#022C4F] rounded-[32px] p-6 flex flex-col justify-between min-h-[140px] shadow-sm relative group hover:shadow-md transition-shadow">
            <h4 className="text-[12px] font-bold text-[#022C4F]">{stat.label}</h4>
            <p className="text-[32px] font-extrabold text-[#0F181F] leading-tight mt-4 pr-10">
              {stat.value}
            </p>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] group-hover:bg-[#022C4F] group-hover:text-white transition-colors cursor-pointer">
              <ArrowUpRight size={16} strokeWidth={3} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Tables */}
        <div className="w-full lg:w-[65%] flex flex-col gap-6">
          
          {/* Recent Documents Table */}
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-extrabold text-[#022C4F]">Recent Documents</h3>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button className="w-6 h-6 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#022C4F]/90 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 h-6">
                  <span className="text-[11px] font-bold text-gray-500">1</span>
                  <span className="text-[11px] font-bold text-gray-500 tracking-widest">...</span>
                </div>
                <button className="w-6 h-6 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#022C4F]/90 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            
            <div className="bg-[#022C4F] text-white rounded-[24px] px-8 py-5 grid grid-cols-12 gap-4 items-center mb-4">
              <span className="col-span-3 text-[11px] font-bold tracking-wider uppercase">Document Name</span>
              <span className="col-span-2 text-[11px] font-bold tracking-wider uppercase">Category</span>
              <span className="col-span-2 text-[11px] font-bold tracking-wider uppercase">Source</span>
              <span className="col-span-1 text-[11px] font-bold tracking-wider uppercase text-center">Offline</span>
              <span className="col-span-2 text-[11px] font-bold tracking-wider uppercase">Status</span>
              <span className="col-span-2 text-[11px] font-bold tracking-wider uppercase">Last Updated</span>
            </div>

            <div className="flex flex-col">
              {recentDocs.map((row, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-12 gap-4 items-center px-8 py-5 hover:bg-gray-50 transition-colors group ${index !== recentDocs.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="col-span-3 text-[12px] text-[#0F181F] font-bold truncate pr-4">{row.name}</span>
                  <span className="col-span-2 text-[11px] text-gray-600 font-medium">{row.category}</span>
                  <div className="col-span-2">
                    <span className="text-[9px] font-bold bg-blue-50 text-[#022C4F] px-2 py-1 rounded-md border border-blue-100">
                      {row.source}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {row.offline ? (
                      <div title="Available Offline"><Cloud size={16} className="text-green-500" /></div>
                    ) : (
                      <div title="Cloud Only"><CloudOff size={16} className="text-gray-300" /></div>
                    )}
                  </div>
                  <span className="col-span-2 text-[11px] text-gray-600 font-medium">{row.status}</span>
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-[11px] text-gray-600 font-medium">{row.date}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Document archived successfully.', type: 'info' } }))}
                        className="text-gray-500 hover:text-orange-600 hover:bg-orange-50 p-1.5 rounded-full transition-colors"
                        title="Archive Document"
                      >
                        <Archive size={16} />
                      </button>
                      <button className="text-[#022C4F] hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Documents Table */}
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-extrabold text-[#022C4F]">Shared Documents</h3>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button className="w-6 h-6 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#022C4F]/90 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 h-6">
                  <span className="text-[11px] font-bold text-gray-500">1</span>
                  <span className="text-[11px] font-bold text-gray-500 tracking-widest">...</span>
                </div>
                <button className="w-6 h-6 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#022C4F]/90 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            
            <div className="bg-[#022C4F] text-white rounded-[24px] px-8 py-5 grid grid-cols-12 gap-4 items-center mb-4">
              <span className="col-span-5 text-[11px] font-bold tracking-wider uppercase">Document Name</span>
              <span className="col-span-4 text-[11px] font-bold tracking-wider uppercase">Shared With</span>
              <span className="col-span-3 text-[11px] font-bold tracking-wider uppercase">Date Shared</span>
            </div>

            <div className="flex flex-col">
              {sharedDocs.map((row, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-12 gap-4 items-center px-8 py-5 hover:bg-gray-50 transition-colors ${index !== sharedDocs.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="col-span-5 text-[12px] text-[#0F181F] font-bold">{row.name}</span>
                  <span className="col-span-4 text-[11px] text-gray-600 font-medium">{row.sharedWith}</span>
                  <div className="col-span-3 flex items-center justify-between">
                    <span className="text-[11px] text-gray-600 font-medium">{row.date}</span>
                    <button className="text-[#022C4F] hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Approval Queue */}
        <div className="w-full lg:w-[35%] flex flex-col">
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm flex flex-col min-h-[400px] h-full sticky top-4">
            <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Document Approval Queue</h3>
            
            <div className="flex-1 flex flex-col">
              <h4 className="text-[13px] font-extrabold text-[#022C4F] mb-6">Awaiting Approval</h4>
              
              <div className="flex flex-col gap-4 mb-8">
                <h5 className="text-[13px] font-bold text-[#022C4F]">Structural Design Report.pdf</h5>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#0F181F]">Submitted By:</span>
                  <span className="text-[11px] font-medium text-blue-600 cursor-pointer hover:underline">Michael Adeyemi</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#0F181F]">Status:</span>
                  <span className="text-[11px] font-medium text-gray-500">Pending Approval</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#0F181F]">Due Date:</span>
                  <span className="text-[11px] font-medium text-gray-500">June 28, 2026</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-auto">
              <Button variant="outline" className="!w-full h-[48px]">
                Review Document
              </Button>
              <Button variant="primary" className="!w-full h-[48px]">
                Approve
              </Button>
              <Button variant="outline" className="!w-full h-[48px] bg-[#0F181F] text-white hover:bg-black border-none">
                Request Revision
              </Button>
            </div>
          </div>
        </div>

      </div>

      <CreateFolderDrawer 
        isOpen={isCreateFolderOpen} 
        onClose={() => setIsCreateFolderOpen(false)} 
      />

      <UploadFilesDrawer 
        isOpen={isUploadFilesOpen} 
        onClose={() => setIsUploadFilesOpen(false)} 
      />
    </div>
  );
}
