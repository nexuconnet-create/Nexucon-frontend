"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell, ArrowUpRight, Filter } from "lucide-react";
import CreateTopicSideDrawer from "@/components/dashboard/CreateTopicSideDrawer";
import TopicSuccessModal from "@/components/dashboard/TopicSuccessModal";
import ExportTopicsModal from "@/components/dashboard/ExportTopicsModal";
import AssignReviewerSideDrawer from "@/components/dashboard/AssignReviewerSideDrawer";
import AssignReviewerSuccessModal from "@/components/dashboard/AssignReviewerSuccessModal";
import TopRightControls from "@/components/dashboard/TopRightControls";

export default function Reviews() {
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [isTopicSuccessModalOpen, setIsTopicSuccessModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAssignReviewerOpen, setIsAssignReviewerOpen] = useState(false);
  const [isAssignSuccessModalOpen, setIsAssignSuccessModalOpen] = useState(false);

  const metricCards = [
    { title: "Total Topics", value: "126" },
    { title: "Open", value: "34" },
    { title: "In Progress", value: "22" },
    { title: "High Priority", value: "8" },
  ];

  const assignedTopics = [
    { topic: "Foundation Detail Review", discipline: "Structural", priority: "High", status: "In Progress", dueDate: "Jul 09" },
    { topic: "Door Schedule Verification", discipline: "Architecture", priority: "Medium", status: "Open", dueDate: "Jul 11" },
    { topic: "Fire Escape Layout", discipline: "Architecture", priority: "High", status: "Awaiting Review", dueDate: "Jul 12" },
    { topic: "HVAC Coordination", discipline: "Mechanical", priority: "Medium", status: "Awaiting Review", dueDate: "Jul 13" },
  ];

  const recentlyUpdated = [
    "Structural beam comments added",
    "Architectural annotations resolved",
    "Electrical layout reassigned for review",
    "Client approval recommendation submitted",
    "Fire safety topic marked as completed"
  ];

  return (
    <div className="h-full flex flex-col pt-2 pb-12 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-[40px] font-bold text-[#022C4F] leading-tight mb-4">
            Review Topics
          </h1>
          <p className="text-gray-600 text-[13px] leading-relaxed max-w-3xl">
            Track, discuss, and resolve design review topics raised throughout the project lifecycle. Review Topics centralize technical feedback, drawing annotations, design issues, approval recommendations, and multidisciplinary discussions to ensure every concern is documented and resolved before project approval.
          </p>
        </div>

        <TopRightControls />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <button 
          onClick={() => setIsCreateTopicOpen(true)}
          className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-10 py-3.5 rounded-full font-medium transition-colors text-[13px] shadow-sm"
        >
          Create Review Topic
        </button>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-10 py-3.5 rounded-full font-medium transition-colors shadow-sm text-[13px]"
        >
          Export Topics Report
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

      {/* Search Topics */}
      <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-4">Search Topics</h2>
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by title, drawing, reviewer, discipline, or keyword..." 
            className="w-full h-[52px] bg-white rounded-full border border-gray-300 pl-14 pr-6 text-[13px] focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] shadow-sm"
          />
        </div>
        <button className="h-[52px] px-8 bg-white rounded-full border border-gray-300 flex items-center gap-3 text-[13px] font-bold text-[#022C4F] hover:bg-gray-50 shadow-sm shrink-0">
          All Topics
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* My Assigned Topics */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[22px] font-extrabold text-[#022C4F]">My Assigned Topics</h2>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
              <span className="text-xs font-bold cursor-pointer text-gray-500 hover:text-gray-800">{"<"}</span>
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#022C4F] shadow-sm">1</span>
              <span className="text-xs font-bold text-gray-400">...</span>
              <span className="text-xs font-bold cursor-pointer text-gray-500 hover:text-gray-800">{">"}</span>
            </div>
          </div>
          
          <div className="w-full">
            <div className="bg-[#022C4F] rounded-full flex px-8 py-4 mb-4">
              <div className="flex-[2] text-[12px] font-bold text-white">Topic</div>
              <div className="flex-1 text-[12px] font-bold text-white text-center">Discipline</div>
              <div className="w-[120px] text-[12px] font-bold text-white text-center">Priority</div>
              <div className="w-[120px] text-[12px] font-bold text-white text-center">Status</div>
              <div className="w-[120px] text-[12px] font-bold text-white text-right">Due Date</div>
            </div>
            
            <div className="flex flex-col">
              {assignedTopics.map((item, idx) => (
                <div key={idx} className="flex px-8 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-[2] text-[12px] text-gray-600 font-medium pr-4">{item.topic}</div>
                  <div className="flex-1 text-[12px] text-gray-500 px-4 text-center">{item.discipline}</div>
                  <div className="w-[120px] text-[12px] text-gray-500 px-4 text-center">{item.priority}</div>
                  <div className="w-[120px] text-[12px] text-gray-500 px-4 text-center">{item.status}</div>
                  <div className="w-[120px] text-[12px] text-gray-500 pl-4 text-right">{item.dueDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Stack */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          {/* Recently Updated */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-6">Recently Updated</h2>
            <div className="flex flex-col gap-5">
              {recentlyUpdated.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 0L8.1822 5.09312L13.1788 3.51868L9.93291 7.753L13.1788 11.9873L8.1822 10.4129L7 15.506L5.8178 10.4129L0.821217 11.9873L4.06709 7.753L0.821217 3.51868L5.8178 5.09312L7 0Z" fill="#022C4F"/>
                    </svg>
                  </div>
                  <span className="text-[12px] text-gray-600 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Progress */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col flex-1 hover:shadow-md transition-shadow">
            <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-6">Resolution Progress</h2>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-[#022C4F]">Topics Resolved This Week</span>
                <span className="text-[13px] text-gray-500">18</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-[#022C4F]">Average Resolution Time</span>
                <span className="text-[13px] text-gray-500">2.3 Days</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-[#022C4F]">Outstanding Critical Topics</span>
                <span className="text-[13px] text-[#022C4F]">5</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-[#022C4F]">Approval Ready</span>
                <span className="text-[13px] text-gray-500">14 Topics</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Active Review Topics Section */}
      <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-6">Active Review Topics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Topic Card 1 */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Structural Beam Reinforcement</h3>
          
          <div className="mb-5">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-1.5">Reference</h4>
            <p className="text-[12px] text-gray-500">RT-00124</p>
          </div>
          <div className="mb-5">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-1.5">Drawing</h4>
            <p className="text-[12px] text-gray-500">Structural Layout - Level 02</p>
          </div>
          <div className="mb-5">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-1.5">Created By</h4>
            <p className="text-[12px] text-[#022C4F]">Michael Adeyemi</p>
          </div>
          <div className="mb-5">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-1.5">Assigned To</h4>
            <p className="text-[12px] text-gray-500">Structural Team</p>
          </div>
          <div className="mb-8 flex flex-col gap-1.5">
            <h4 className="text-[12px] font-extrabold text-[#022C4F]">Priority</h4>
            <span className="text-[12px] text-gray-500">High</span>
          </div>

          <div className="flex gap-3 mt-auto">
            <button className="flex-[1.5] bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
              View Topic
            </button>
            <button className="flex-[1.5] bg-[#022C4F] hover:bg-[#033A6B] text-white py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
              Reply
            </button>
            <button className="flex-[2] bg-[#111827] hover:bg-[#1F2937] text-white py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm whitespace-nowrap">
              Mark Resolved
            </button>
          </div>
        </div>

        {/* Topic Card 2 */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Staircase Width Compliance</h3>
          
          <div className="mb-5">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-1.5">Reference</h4>
            <p className="text-[12px] text-gray-500">RT-00118</p>
          </div>
          <div className="mb-5">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-1.5">Drawing</h4>
            <p className="text-[12px] text-gray-500">Ground Floor Plan</p>
          </div>
          <div className="mb-5">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-1.5">Created By</h4>
            <p className="text-[12px] text-[#022C4F]">Sarah Williams</p>
          </div>
          <div className="mb-5">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-1.5">Assigned To</h4>
            <p className="text-[12px] text-gray-500">Architectural Team</p>
          </div>
          <div className="mb-8 flex flex-col gap-1.5">
            <h4 className="text-[12px] font-extrabold text-[#022C4F]">Priority</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <span className="text-[12px] text-gray-500">Medium</span>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button className="flex-1 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
              Open
            </button>
            <button className="flex-1 bg-[#022C4F] hover:bg-[#033A6B] text-white py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
              Add Comment
            </button>
          </div>
        </div>

        {/* Action Stack Card */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <h2 className="text-[16px] font-extrabold text-[#022C4F] mb-auto">Quick Actions</h2>
          <div className="flex flex-col gap-4 w-full max-w-[280px] mx-auto mt-6 mb-auto">
            <div className="flex gap-4">
              <button 
                onClick={() => setIsCreateTopicOpen(true)}
                className="flex-1 bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 py-3 rounded-full font-bold transition-colors text-[11px] shadow-sm"
              >
                Create Review Topic
              </button>
              <button 
                onClick={() => setIsAssignReviewerOpen(true)}
                className="flex-1 bg-[#022C4F] hover:bg-[#033A6B] text-white py-3 rounded-full font-bold transition-colors text-[11px] shadow-sm"
              >
                Assign Reviewer
              </button>
            </div>
            <div className="flex gap-4">
              <Link href="/professional/dashboard/messages" className="flex-1">
                <button className="w-full bg-[#022C4F] hover:bg-[#033A6B] text-white py-3 rounded-full font-bold transition-colors text-[11px] shadow-sm">
                  Start Discussion
                </button>
              </Link>
              <button 
                onClick={() => setIsExportModalOpen(true)}
                className="flex-1 bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 py-3 rounded-full font-bold transition-colors text-[11px] shadow-sm"
              >
                Export Review Topics
              </button>
            </div>
            <div className="flex justify-center mt-2">
              <button className="w-2/3 bg-[#022C4F] hover:bg-[#033A6B] text-white py-3 rounded-full font-bold transition-colors text-[11px] shadow-sm">
                Generate Review Report
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Create Topic Side Drawer */}
      <CreateTopicSideDrawer
        isOpen={isCreateTopicOpen}
        onClose={() => setIsCreateTopicOpen(false)}
        onCreate={() => {
          setIsCreateTopicOpen(false);
          setIsTopicSuccessModalOpen(true);
        }}
      />

      {/* Topic Success Modal */}
      <TopicSuccessModal
        isOpen={isTopicSuccessModalOpen}
        onClose={() => setIsTopicSuccessModalOpen(false)}
      />

      {/* Export Topics Modal */}
      <ExportTopicsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Assign Reviewer Side Drawer */}
      <AssignReviewerSideDrawer
        isOpen={isAssignReviewerOpen}
        onClose={() => setIsAssignReviewerOpen(false)}
        onAssign={() => {
          setIsAssignReviewerOpen(false);
          setIsAssignSuccessModalOpen(true);
        }}
      />

      {/* Assign Reviewer Success Modal */}
      <AssignReviewerSuccessModal
        isOpen={isAssignSuccessModalOpen}
        onClose={() => setIsAssignSuccessModalOpen(false)}
      />
    </div>
  );
}
