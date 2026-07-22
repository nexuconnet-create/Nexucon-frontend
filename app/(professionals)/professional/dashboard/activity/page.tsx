"use client";

import React, { useState } from "react";
import { Search, Bell, ArrowUpRight, Filter } from "lucide-react";
import ExportActivityLogModal from "@/components/dashboard/ExportActivityLogModal";
import TopRightControls from "@/components/dashboard/TopRightControls";
import CommentOnDocumentModal from "@/components/dashboard/CommentOnDocumentModal";
import ActivityAlertsModal from "@/components/dashboard/ActivityAlertsModal";

export default function Activity() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  const metricCards = [
    { title: "Total Activities", value: "1,284" },
    { title: "Today", value: "32" },
    { title: "This Week", value: "147" },
    { title: "Latest Update", value: "2 Minutes Ago" },
  ];

  const liveActivityFeed = [
    {
      title: "Olivia Thompson uploaded Architectural Floor Plan V4.0",
      quote: null,
      details: [
        { label: "Category", value: "Drawing Upload" },
        { label: "Project", value: "Victoria Heights Residential Estate" },
        { label: "Time", value: "2 minutes ago" }
      ],
      buttonText: "View Drawing"
    },
    {
      title: "Michael Adeyemi commented on Structural Design Report",
      quote: `"Updated the reinforcement schedule based on peer review recommendations."`,
      details: [
        { label: "Category", value: "Comment" },
        { label: "Time", value: "10 minutes ago" }
      ],
      buttonText: "View Discussion"
    },
    {
      title: "Client approved Architectural Design Package",
      quote: null,
      details: [
        { label: "Approved By", value: "Sarah Johnson" },
        { label: "Time", value: "25 minutes ago" }
      ],
      buttonText: "View Approval"
    }
  ];

  const myRecentActivities = [
    { activity: "Uploaded Structural Report", project: "Victoria Heights", date: "Today", status: "Completed" },
    { activity: "Reviewed Architectural Package", project: "Victoria Heights", date: "Today", status: "Completed" },
    { activity: "Added Drawing Annotation", project: "Victoria Heights", date: "Yesterday", status: "Completed" },
    { activity: "Attended Coordination Meeting", project: "Victoria Heights", date: "Yesterday", status: "Completed" },
  ];

  const teamActivitySummary = [
    { label: "Drawings Uploaded", value: "18" },
    { label: "Meetings Held", value: "8" },
    { label: "Reviews Completed", value: "11" },
    { label: "Deliverables Published", value: "3" },
    { label: "Comments Added", value: "42" },
    { label: "Documents Shared", value: "27" },
    { label: "Tasks Completed", value: "36" },
  ];

  return (
    <div className="h-full flex flex-col pt-2 pb-12 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-[40px] font-bold text-[#022C4F] leading-tight mb-4">
            Activity
          </h1>
          <p className="text-gray-600 text-[13px] leading-relaxed max-w-3xl">
            Monitor all project activities in one place. Track uploads, reviews, approvals, comments, task updates, meetings, releases, and team collaboration with a complete project activity timeline.
          </p>
        </div>

        <TopRightControls />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <button 
          onClick={() => setIsAlertsModalOpen(true)}
          className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-10 py-3.5 rounded-full font-medium transition-colors text-[13px] shadow-sm flex items-center gap-2"
        >
          <Bell size={16} /> Set Activity Alerts
        </button>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-10 py-3.5 rounded-full font-medium transition-colors text-[13px] shadow-sm"
        >
          Export Activity Log
        </button>
        <button 
          onClick={() => setIsCommentModalOpen(true)}
          className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-10 py-3.5 rounded-full font-medium transition-colors shadow-sm text-[13px]"
        >
          Comment on Document
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metricCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm relative group hover:shadow-md transition-all">
            <h3 className="text-[#022C4F] font-bold text-[12px] mb-6">{card.title}</h3>
            <p className="text-[32px] font-extrabold text-[#022C4F] leading-none">{card.value}</p>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-[#022C4F] group-hover:border-[#022C4F] transition-colors cursor-pointer">
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Search Activity */}
      <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-4">Search Activity</h2>
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by user, document, drawing, task, or keyword..." 
            className="w-full h-[52px] bg-white rounded-full border border-gray-300 pl-14 pr-6 text-[13px] focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] shadow-sm"
          />
        </div>
        <button className="h-[52px] px-8 bg-white rounded-full border border-gray-300 flex items-center gap-3 text-[13px] font-bold text-[#022C4F] hover:bg-gray-50 shadow-sm shrink-0">
          All Activities
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Live Activity Feed */}
      <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-6">Live Activity Feed</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {liveActivityFeed.map((item, idx) => (
          <div key={idx} className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-4 leading-relaxed">
              {item.title}
            </h3>
            
            {item.quote && (
              <p className="text-[12px] text-gray-500 italic mb-4">
                {item.quote}
              </p>
            )}

            <div className="flex flex-col gap-5 flex-1 mb-8">
              {item.details.map((detail, dIdx) => (
                <div key={dIdx}>
                  <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1">{detail.label}</h4>
                  <p className="text-[12px] text-gray-500">{detail.value}</p>
                </div>
              ))}
            </div>

            <button className="w-[140px] bg-[#022C4F] hover:bg-[#033A6B] text-white py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm mt-auto">
              {item.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* My Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[22px] font-extrabold text-[#022C4F]">My Recent Activities</h2>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
              <span className="text-xs font-bold cursor-pointer text-gray-500 hover:text-gray-800">{"<"}</span>
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#022C4F] shadow-sm">1</span>
              <span className="text-xs font-bold text-gray-400">...</span>
              <span className="text-xs font-bold cursor-pointer text-gray-500 hover:text-gray-800">{">"}</span>
            </div>
          </div>
          
          <div className="w-full">
            <div className="bg-[#022C4F] rounded-full flex px-8 py-4 mb-4">
              <div className="flex-[2] text-[12px] font-bold text-white">Activity</div>
              <div className="flex-1 text-[12px] font-bold text-white">Project</div>
              <div className="w-[120px] text-[12px] font-bold text-white">Date</div>
              <div className="w-[120px] text-[12px] font-bold text-white">Status</div>
            </div>
            
            <div className="flex flex-col">
              {myRecentActivities.map((item, idx) => (
                <div key={idx} className="flex px-8 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-[2] text-[12px] text-gray-600 font-medium pr-4">{item.activity}</div>
                  <div className="flex-1 text-[12px] text-gray-500 pr-4">{item.project}</div>
                  <div className="w-[120px] text-[12px] text-gray-500">{item.date}</div>
                  <div className="w-[120px] text-[12px] text-gray-500">{item.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Activity Summary */}
        <div className="lg:col-span-1 bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-8">Team Activity Summary</h2>
          
          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            {teamActivitySummary.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <h4 className="text-[11px] font-extrabold text-[#022C4F]">{item.label}</h4>
                <span className="text-[12px] text-gray-500">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Export Activity Log Modal */}
      <ExportActivityLogModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Comment on Document Modal */}
      <CommentOnDocumentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
      />

      {/* Activity Alerts Modal */}
      <ActivityAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
      />
    </div>
  );
}
