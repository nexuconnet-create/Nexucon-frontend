"use client";

import React, { useState } from "react";
import { Search, Bell, ArrowUpRight, CheckCircle2 } from "lucide-react";
import SubmitDeliverableSideDrawer from "@/components/dashboard/SubmitDeliverableSideDrawer";
import SubmitDeliverableSuccessModal from "@/components/dashboard/SubmitDeliverableSuccessModal";
import TopRightControls from "@/components/dashboard/TopRightControls";
import CreateReleaseSideDrawer from "@/components/dashboard/CreateReleaseSideDrawer";
import ReleaseSuccessModal from "@/components/dashboard/ReleaseSuccessModal";
import SiteSuperviseHandoffDrawer from "@/components/dashboard/SiteSuperviseHandoffDrawer";

export default function Deliverables() {
  const [isSubmitDeliverableOpen, setIsSubmitDeliverableOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCreateReleaseOpen, setIsCreateReleaseOpen] = useState(false);
  const [isReleaseSuccessModalOpen, setIsReleaseSuccessModalOpen] = useState(false);
  const [isHandoffDrawerOpen, setIsHandoffDrawerOpen] = useState(false);

  const metricCards = [
    { title: "Total Deliverables", value: "32" },
    { title: "Draft", value: "6" },
    { title: "Under Review", value: "8" },
    { title: "Approved", value: "15" },
  ];

  const submissionTimeline = [
    { deliverable: "Architectural Package", discipline: "Architecture", dueDate: "Jun 20", status: "Approved", statusColor: "text-green-500", dotColor: "bg-green-500" },
    { deliverable: "Structural Package", discipline: "Structural", dueDate: "Jun 22", status: "Under Review", statusColor: "text-yellow-500", dotColor: "bg-yellow-500" },
    { deliverable: "MEP Package", discipline: "Mechanical", dueDate: "Jun 24", status: "Submitted", statusColor: "text-green-500", dotColor: "bg-green-500" },
    { deliverable: "Electrical Package", discipline: "Electrical", dueDate: "Jun 25", status: "Awaiting Approval", statusColor: "text-yellow-500", dotColor: "bg-yellow-500" },
    { deliverable: "Final BOQ", discipline: "Quantity Surveying", dueDate: "Jun 26", status: "Approved", statusColor: "text-green-500", dotColor: "bg-green-500" },
  ];

  const pendingApprovals = [
    "Structural Design Package",
    "Electrical Layout Package",
    "Fire Protection Report",
    "Landscape Design Package"
  ];

  const milestoneDeliverables = [
    { title: "Design Development", status: "Completed", statusColor: "text-green-500", dotColor: "bg-green-500", icon: "check" },
    { title: "Technical Coordination", status: "In Progress", statusColor: "text-yellow-500", dotColor: "bg-yellow-500", icon: "dot" },
    { title: "Peer Review", status: "Ongoing", statusColor: "text-yellow-500", dotColor: "bg-yellow-500", icon: "dot" },
    { title: "Final Design Approval", status: "Pending", statusColor: "text-gray-400", dotColor: "bg-gray-400", icon: "dot" },
    { title: "Construction Handoff Package", status: "Not Released", statusColor: "text-gray-400", dotColor: "bg-gray-400", icon: "dot" },
  ];

  return (
    <div className="h-full flex flex-col pt-2 pb-12 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-[40px] font-bold text-[#022C4F] leading-tight mb-4">
            Deliverables
          </h1>
          <p className="text-gray-600 text-[13px] leading-relaxed max-w-3xl">
            Manage all project deliverables throughout the design lifecycle. Track submissions, revisions, approvals, release milestones, and issued packages to ensure every project output is complete, reviewed, and ready for handover.
          </p>
        </div>

        <TopRightControls />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <button 
          onClick={() => setIsSubmitDeliverableOpen(true)}
          className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-10 py-3.5 rounded-full font-medium transition-colors text-[13px] shadow-sm"
        >
          Submit New Deliverable
        </button>
        <button 
          onClick={() => setIsHandoffDrawerOpen(true)}
          className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-10 py-3.5 rounded-full font-medium transition-colors text-[13px] shadow-sm"
        >
          Prepare Site Handoff
        </button>
        <button 
          onClick={() => setIsCreateReleaseOpen(true)}
          className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-10 py-3.5 rounded-full font-medium transition-colors shadow-sm text-[13px]"
        >
          Create Deliverable Release
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Submission Timeline */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[22px] font-extrabold text-[#022C4F]">Submission Timeline</h2>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
              <span className="text-xs font-bold cursor-pointer text-gray-500 hover:text-gray-800">{"<"}</span>
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#022C4F] shadow-sm">1</span>
              <span className="text-xs font-bold text-gray-400">...</span>
              <span className="text-xs font-bold cursor-pointer text-gray-500 hover:text-gray-800">{">"}</span>
            </div>
          </div>
          
          <div className="w-full">
            <div className="bg-[#022C4F] rounded-full flex px-8 py-4 mb-4">
              <div className="flex-1 text-[12px] font-bold text-white">Deliverable</div>
              <div className="flex-1 text-[12px] font-bold text-white">Discipline</div>
              <div className="w-[120px] text-[12px] font-bold text-white">Due Date</div>
              <div className="w-[150px] text-[12px] font-bold text-white">Status</div>
            </div>
            
            <div className="flex flex-col">
              {submissionTimeline.map((item, idx) => (
                <div key={idx} className="flex px-8 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 text-[13px] text-gray-600 font-medium pr-4">{item.deliverable}</div>
                  <div className="flex-1 text-[13px] text-gray-500 pr-4">{item.discipline}</div>
                  <div className="w-[120px] text-[13px] text-gray-500">{item.dueDate}</div>
                  <div className="w-[150px] flex items-center gap-2">
                    {item.status === "Approved" ? (
                      <CheckCircle2 className={`w-4 h-4 ${item.statusColor}`} />
                    ) : (
                      <div className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`}></div>
                    )}
                    <span className={`text-[12px] font-medium ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="lg:col-span-1 bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-8">Pending Approvals</h2>
          
          <div className="flex flex-col gap-5 flex-1">
            {pendingApprovals.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0L8.1822 5.09312L13.1788 3.51868L9.93291 7.753L13.1788 11.9873L8.1822 10.4129L7 15.506L5.8178 10.4129L0.821217 11.9873L4.06709 7.753L0.821217 3.51868L5.8178 5.09312L7 0Z" fill="#022C4F"/>
                  </svg>
                </div>
                <span className="text-[13px] text-gray-600 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <button className="flex-1 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
              Approve
            </button>
            <button className="flex-1 bg-[#022C4F] hover:bg-[#033A6B] text-white py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
              Request Revision
            </button>
            <button className="flex-1 bg-[#111827] hover:bg-[#1F2937] text-white py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
              Comment
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recent Releases */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-6">Recent Releases</h2>
          
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Release 04</h3>
          
          <div className="mb-6">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-2">Issued For</h4>
            <p className="text-[12px] text-gray-500">Client Review</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-2">Release Date</h4>
            <p className="text-[12px] text-gray-500">June 22, 2026</p>
          </div>

          <div className="mb-8">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-4">Contents</h4>
            <div className="flex flex-col gap-4">
              {["Architectural Drawings", "Structural Drawings", "Design Reports", "Technical Specifications"].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 0L8.1822 5.09312L13.1788 3.51868L9.93291 7.753L13.1788 11.9873L8.1822 10.4129L7 15.506L5.8178 10.4129L0.821217 11.9873L4.06709 7.753L0.821217 3.51868L5.8178 5.09312L7 0Z" fill="#022C4F"/>
                    </svg>
                  </div>
                  <span className="text-[12px] text-gray-600 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <button className="flex-1 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
              View Release
            </button>
            <button className="flex-1 bg-[#022C4F] hover:bg-[#033A6B] text-white py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
              Download Package
            </button>
          </div>
        </div>

        {/* Release 03 */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6 pt-[2px]">Release 03</h3>
          
          <div className="mb-6">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-2">Issued For</h4>
            <p className="text-[12px] text-gray-500">Peer Review</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-2">Release Date</h4>
            <p className="text-[12px] text-gray-500">June 18, 2026</p>
          </div>

          <div className="mb-8">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] mb-4">Contents</h4>
            <div className="flex flex-col gap-4">
              {["Design Package V3.0", "Review Documents", "BOQ Draft"].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 0L8.1822 5.09312L13.1788 3.51868L9.93291 7.753L13.1788 11.9873L8.1822 10.4129L7 15.506L5.8178 10.4129L0.821217 11.9873L4.06709 7.753L0.821217 3.51868L5.8178 5.09312L7 0Z" fill="#022C4F"/>
                    </svg>
                  </div>
                  <span className="text-[12px] text-gray-600 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <button className="flex-1 bg-[#022C4F] hover:bg-[#033A6B] text-white py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
              Open
            </button>
          </div>
        </div>

        {/* Milestone Deliverables */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-8">Milestone Deliverables</h2>
          
          <div className="flex flex-col gap-8 flex-1">
            {milestoneDeliverables.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <h4 className="text-[14px] font-extrabold text-[#022C4F]">{item.title}</h4>
                <div className="flex items-center gap-2">
                  {item.icon === "check" ? (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${item.statusColor}`} />
                  ) : (
                    <div className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`}></div>
                  )}
                  <span className={`text-[12px] font-medium ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Submit Deliverable Modal (Side Drawer) */}
      <SubmitDeliverableSideDrawer 
        isOpen={isSubmitDeliverableOpen} 
        onClose={() => setIsSubmitDeliverableOpen(false)} 
        onSubmit={() => {
          setIsSubmitDeliverableOpen(false);
          setIsSuccessModalOpen(true);
        }}
      />

      {/* Success Modal */}
      <SubmitDeliverableSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {/* Create Release Modal (Side Drawer) */}
      <CreateReleaseSideDrawer 
        isOpen={isCreateReleaseOpen} 
        onClose={() => setIsCreateReleaseOpen(false)} 
        onPublish={() => {
          setIsCreateReleaseOpen(false);
          setIsReleaseSuccessModalOpen(true);
        }}
      />

      {/* Release Success Modal */}
      <ReleaseSuccessModal
        isOpen={isReleaseSuccessModalOpen}
        onClose={() => setIsReleaseSuccessModalOpen(false)}
      />

      {/* Site Handoff Drawer */}
      <SiteSuperviseHandoffDrawer 
        isOpen={isHandoffDrawerOpen}
        onClose={() => setIsHandoffDrawerOpen(false)}
      />
    </div>
  );
}
