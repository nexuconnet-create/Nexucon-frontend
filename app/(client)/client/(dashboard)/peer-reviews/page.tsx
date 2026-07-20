'use client';

import React, { useState } from 'react';
import { ArrowUpRight, Calendar, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Button from '@/components/ui/Button';
import InviteReviewerDrawer from '@/components/dashboard/InviteReviewerDrawer';
import InviteReviewerSuccessModal from '@/components/dashboard/InviteReviewerSuccessModal';
import GenerateReportDrawer from '@/components/dashboard/GenerateReportDrawer';

export default function PeerReviewsPage() {
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const queueData = [
    { item: 'Foundation Layout Package', discipline: 'Structural', reviewer: 'Michael Adeyemi', status: 'In Review', date: 'Jun 25' },
    { item: 'Architectural Design Report', discipline: 'Architecture', reviewer: 'Sarah Williams', status: 'Pending Review', date: 'Jun 24' },
    { item: 'Electrical Layout Plan', discipline: 'Electrical', reviewer: 'James Ibrahim', status: 'In Review', date: 'Jun 23' },
    { item: 'BOQ Package', discipline: 'Quantity Surveying', reviewer: 'Samuel Bello', status: 'Pending Review', date: 'Jun 20' },
    { item: 'HVAC Coordination Report', discipline: 'Mechanical', reviewer: 'David Smith', status: 'Under Review', date: 'Jun 24' },
  ];

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
            Peer Reviews
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-3xl leading-relaxed">
            Facilitate independent technical reviews of project drawings, reports, specifications, and deliverables to improve quality, compliance, and project readiness before approval.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
          <Button variant="outline" onClick={() => setIsInviteDrawerOpen(true)}>
            Invite Reviewer
          </Button>
          <Button variant="primary" onClick={() => setIsReportDrawerOpen(true)}>
            Generate Review Report
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Active Peer Reviews', value: '12' },
          { label: 'Pending Reviews', value: '7' },
          { label: 'Completed Reviews', value: '34' },
          { label: 'Approval Readiness', value: '89%' },
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
        
        {/* Left Column: Peer Review Queue */}
        <div className="w-full lg:w-[65%] bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[18px] font-extrabold text-[#022C4F]">Peer Review Queue</h3>
            
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
            <span className="col-span-3 text-[11px] font-bold tracking-wider uppercase">Item</span>
            <span className="col-span-2 text-[11px] font-bold tracking-wider uppercase">Discipline</span>
            <span className="col-span-3 text-[11px] font-bold tracking-wider uppercase">Reviewer</span>
            <span className="col-span-2 text-[11px] font-bold tracking-wider uppercase">Status</span>
            <span className="col-span-2 text-[11px] font-bold tracking-wider uppercase">Date</span>
          </div>

          <div className="flex flex-col flex-1">
            {queueData.map((row, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-12 gap-4 items-center px-8 py-6 hover:bg-gray-50 transition-colors ${index !== queueData.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <span className="col-span-3 text-[12px] text-[#0F181F] font-bold leading-tight">{row.item}</span>
                <span className="col-span-2 text-[11px] text-gray-600 font-medium">{row.discipline}</span>
                <span className="col-span-3 text-[11px] text-gray-600 font-medium">{row.reviewer}</span>
                <span className="col-span-2 text-[11px] text-gray-600 font-medium">{row.status}</span>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-[11px] text-gray-600 font-medium">{row.date}</span>
                  <button className="text-[#022C4F] hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Meetings */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6">
          
          {/* Card 1: Upcoming Peer Review Meetings */}
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm flex flex-col min-h-[300px]">
            <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Upcoming Peer Review Meetings</h3>
            
            <div className="flex-1">
              <h4 className="text-[14px] font-bold text-[#0F181F] mb-3">Structural Coordination Review</h4>
              <div className="flex items-center gap-2 text-gray-500 mb-8">
                <Calendar size={14} className="text-[#F44336]" />
                <span className="text-[12px] font-medium">June 25, 2026</span>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <Button variant="outline" className="flex-1">
                Reschedule
              </Button>
              <Button variant="primary" className="flex-1">
                Join Meeting
              </Button>
            </div>
          </div>

          {/* Card 2: Design Compliance Workshop */}
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm flex flex-col min-h-[300px]">
            <h3 className="text-[16px] font-extrabold text-[#0F181F] mb-6">Design Compliance Workshop</h3>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-500 mb-8">
                <Calendar size={14} className="text-[#F44336]" />
                <span className="text-[12px] font-medium">June 27, 2026</span>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <Button variant="outline" className="flex-1">
                Reschedule
              </Button>
              <Button variant="primary" className="flex-1">
                Join Meeting
              </Button>
            </div>
          </div>

        </div>
      </div>

      <InviteReviewerDrawer 
        isOpen={isInviteDrawerOpen} 
        onClose={() => setIsInviteDrawerOpen(false)} 
        onSuccess={() => {
          setIsInviteDrawerOpen(false);
          setIsSuccessModalOpen(true);
        }}
      />
      
      <InviteReviewerSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onInviteAnother={() => {
          setIsSuccessModalOpen(false);
          setIsInviteDrawerOpen(true);
        }}
      />

      <GenerateReportDrawer 
        isOpen={isReportDrawerOpen} 
        onClose={() => setIsReportDrawerOpen(false)} 
      />
    </div>
  );
}
