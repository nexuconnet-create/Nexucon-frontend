'use client';

import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import ReviewMetrics from './components/ReviewMetrics';
import ActiveReviewsTable from './components/ActiveReviewsTable';
import AwaitingReviewCards from './components/AwaitingReviewCards';
import ReviewDrawingDrawer from './components/ReviewDrawingDrawer';
import AddCommentDrawer from './components/AddCommentDrawer';
import AssignReviewerDrawer from './components/AssignReviewerDrawer';
import SendReminderDrawer from './components/SendReminderDrawer';
import Button from '@/components/ui/Button';
import ProfilePill from '@/components/ui/ProfilePill';

export default function DrawingReviewCenterPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [isAssignReviewerDrawerOpen, setIsAssignReviewerDrawerOpen] = useState(false);
  const [isSendReminderDrawerOpen, setIsSendReminderDrawerOpen] = useState(false);
  return (
    <div className="max-w-7xl mx-auto py-8 px-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[32px] font-extrabold text-[#022C4F] mb-3 tracking-tight">Drawing Review Center</h1>
          <p className="text-[12px] text-[#0F181F] font-medium leading-relaxed">
            Collaborate with architects, engineers, consultants, and reviewers to evaluate drawings, resolve comments, track annotations, and manage approvals before project sign-off.
          </p>
        </div>
        
        <div className="flex items-center gap-4 ml-auto shrink-0">
          {/* Search Icon */}
          <button className="w-12 h-12 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm">
            <Search size={20} />
          </button>

          {/* Notifications */}
          <button className="relative w-12 h-12 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#0F181F] rounded-full"></span>
          </button>

          {/* Profile Pill */}
          <ProfilePill />
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex justify-end mb-10 gap-4">
        <Button 
          variant="outline"
          onClick={() => setIsAssignReviewerDrawerOpen(true)}
        >
          Add Reviewer
        </Button>
        <Button 
          variant="primary"
          onClick={() => setIsSendReminderDrawerOpen(true)}
        >
          Send Reminder
        </Button>
      </div>

      {/* Top Metrics Grid */}
      <ReviewMetrics />

      {/* Main Split Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ActiveReviewsTable onOpenDrawer={() => setIsDrawerOpen(true)} />
        </div>
        
        <div className="lg:col-span-1">
          <AwaitingReviewCards 
            onOpenDrawer={() => setIsDrawerOpen(true)} 
            onOpenCommentDrawer={() => setIsCommentDrawerOpen(true)}
          />
        </div>
      </div>

      <ReviewDrawingDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      <AddCommentDrawer 
        isOpen={isCommentDrawerOpen} 
        onClose={() => setIsCommentDrawerOpen(false)} 
      />

      <AssignReviewerDrawer
        isOpen={isAssignReviewerDrawerOpen}
        onClose={() => setIsAssignReviewerDrawerOpen(false)}
      />

      <SendReminderDrawer
        isOpen={isSendReminderDrawerOpen}
        onClose={() => setIsSendReminderDrawerOpen(false)}
      />
    </div>
  );
}
