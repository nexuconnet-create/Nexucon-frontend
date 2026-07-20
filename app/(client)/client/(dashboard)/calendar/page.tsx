'use client';

import React, { useState } from 'react';
import { Search, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import ReviewMeetingModal from '@/components/dashboard/ReviewMeetingModal';
import ScheduleReviewDrawer from '@/components/dashboard/ScheduleReviewDrawer';

export default function ReviewCalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Data structure for the calendar cells matching the design
  const calendarData = [
    // Row 1
    { day: '29', isCurrentMonth: false, events: [] },
    { day: '30', isCurrentMonth: false, events: [{ title: 'Structural Design Review', type: 'orange' }] },
    { day: '1', isCurrentMonth: true, events: [] },
    { day: '2', isCurrentMonth: true, events: [] },
    { day: '3', isCurrentMonth: true, events: [{ title: 'Accessibility Compliance Review', type: 'pink' }] },
    { day: '4', isCurrentMonth: true, events: [] },
    { day: '5', isCurrentMonth: true, events: [{ title: 'Sustainability Design Review', type: 'blue' }] },
    // Row 2
    { day: '6', isCurrentMonth: true, events: [] },
    { day: '7', isCurrentMonth: true, events: [{ title: 'Architectural Drawing Review', type: 'pink' }] },
    { day: '8', isCurrentMonth: true, events: [{ title: 'Floor Plan Validation Session', type: 'pink' }, { title: 'MEP Coordination Workshop', type: 'orange' }] },
    { day: '9', isCurrentMonth: true, events: [] },
    { day: '10', isCurrentMonth: true, events: [] },
    { day: '11', isCurrentMonth: true, events: [] },
    { day: '12', isCurrentMonth: true, events: [{ title: 'BIM Coordination Meeting', type: 'blue' }] },
    // Row 3
    { day: '13', isCurrentMonth: true, events: [] },
    { day: '14', isCurrentMonth: true, events: [] },
    { day: '15', isCurrentMonth: true, isActive: true, events: [{ title: 'Electrical Layout Review', type: 'orange' }, { title: 'Mechanical Systems Review', type: 'blue' }] },
    { day: '16', isCurrentMonth: true, events: [] },
    { day: '17', isCurrentMonth: true, events: [{ title: 'Building Code Compliance Review', type: 'blue' }, { title: 'Quantity Survey & BOQ Review', type: 'pink' }] },
    { day: '18', isCurrentMonth: true, events: [{ title: 'Material Specification Review', type: 'orange' }] },
    { day: '19', isCurrentMonth: true, events: [] },
    // Row 4
    { day: '20', isCurrentMonth: true, events: [{ title: 'MEP Coordination Review', type: 'blue' }] },
    { day: '21', isCurrentMonth: true, events: [] },
    { day: '22', isCurrentMonth: true, events: [{ title: 'Plumbing Layout Review', type: 'pink' }, { title: 'Fire Protection Design Review', type: 'orange' }] },
    { day: '23', isCurrentMonth: true, events: [] },
    { day: '24', isCurrentMonth: true, events: [] },
    { day: '25', isCurrentMonth: true, events: [{ title: 'Constructability Assessment', type: 'blue' }] },
    { day: '26', isCurrentMonth: true, events: [{ title: 'Clash Detection Review', type: 'pink' }, { title: 'Site Development Plan Review', type: 'blue' }] },
    // Row 5
    { day: '27', isCurrentMonth: true, events: [] },
    { day: '28', isCurrentMonth: true, events: [{ title: 'Final Design Approval Meeting', type: 'pink' }] },
    { day: '29', isCurrentMonth: true, events: [] },
    { day: '30', isCurrentMonth: true, events: [] },
    { day: '31', isCurrentMonth: true, events: [] },
    { day: '13', isCurrentMonth: false, events: [] },
    { day: '13', isCurrentMonth: false, events: [] },
  ];

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'orange': return 'bg-[#FEEBCC] text-[#0F181F]'; 
      case 'pink': return 'bg-[#FFD9DC] text-[#0F181F]'; 
      case 'blue': return 'bg-[#D9F1FF] text-[#0F181F]'; 
      default: return 'bg-gray-100 text-[#0F181F]';
    }
  };

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
            Review Calendar
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-3xl leading-relaxed">
            Access, review, organize, share, and approve all project drawings and technical plans.
            Collaborate with architects, engineers, consultants, and reviewers through annotations, comments, and structured review workflows.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 shrink-0">
          <Button 
            variant="outline" 
            className="flex-1 md:flex-none border-[#022C4F] text-[#022C4F] hover:bg-[#022C4F]/5 h-[44px]"
            onClick={() => setIsScheduleOpen(true)}
          >
            Schedule New Review
          </Button>
          <Button variant="primary" className="flex-1 md:flex-none h-[44px]">
            Sync Google Calendar
          </Button>
        </div>
      </div>

      {/* Calendar Area */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        
        {/* Calendar Header Controls */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[28px] font-extrabold text-[#022C4F]">
            June <span className="font-normal text-[#022C4F]">2026</span>
          </h2>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[700px]">
            {/* Days of week header */}
            <div className="grid grid-cols-7 mb-4">
              {daysOfWeek.map((day, index) => (
                <div key={index} className="text-center text-[13px] font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7 gap-[1px] bg-gray-100 border-t border-gray-100">
              {calendarData.map((cell, index) => (
                <div key={index} className="bg-white min-h-[140px] p-2 flex flex-col">
                  <div className="flex justify-center mb-2 mt-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold ${cell.isActive ? 'bg-[#0F181F] text-white' : cell.isCurrentMonth ? 'text-[#0F181F]' : 'text-gray-400'}`}>
                      {cell.day}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 px-1">
                    {cell.events.map((evt, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          setSelectedEvent({ ...evt, day: cell.day });
                          setIsModalOpen(true);
                        }}
                        className={`text-[9px] font-bold px-2 py-1.5 rounded-[4px] leading-tight truncate cursor-pointer hover:opacity-80 transition-opacity ${getColorClasses(evt.type)}`}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <ReviewMeetingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
      />

      <ScheduleReviewDrawer
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />

    </div>
  );
}
