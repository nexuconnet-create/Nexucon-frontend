"use client";

import React, { useState } from "react";
import { Search, Bell, ArrowUpRight, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import ReviewDrawingDrawer from "@/components/dashboard/ReviewDrawingDrawer";
import FinalApprovalDrawer from "@/components/dashboard/FinalApprovalDrawer";
import ApprovalSuccessModal from "@/components/dashboard/ApprovalSuccessModal";
import Button from "@/components/ui/Button"
import ProfilePill from "@/components/ui/ProfilePill";

export default function MyProjectsPage() {
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [isFinalApprovalDrawerOpen, setIsFinalApprovalDrawerOpen] = useState(false);
  const [isApprovalSuccessModalOpen, setIsApprovalSuccessModalOpen] = useState(false);

  const projects = [
    {
      id: 1,
      name: "Lekki Commercial Plaza",
      location: "Lekki, Lagos",
      stage: "Tender/Procurement",
      statusText: "In Progress",
      progress: 72,
      progressColor: "bg-[#7DA627]",
      drawings: "24 Uploaded",
      pendingReviews: "3",
      nextMilestone: "Contract Award"
    },
    {
      id: 2,
      name: "Green Valley Apartments",
      location: "Abuja, FCT",
      stage: "Internal Review",
      statusText: "In Progress",
      progress: 95,
      progressColor: "bg-[#7DA627]",
      drawings: "38 Uploaded",
      pendingReviews: "2",
      nextMilestone: "Client Review"
    },
    {
      id: 3,
      name: "Crestview Residences",
      location: "Port Harcourt, Rivers State",
      stage: "Client Review",
      statusText: "In Progress",
      progress: 95,
      progressColor: "bg-[#7DA627]",
      drawings: "31 Uploaded",
      pendingReviews: "1",
      nextMilestone: "Approved"
    },
    {
      id: 4,
      name: "Victoria Heights",
      location: "Victoria Island, Lagos",
      stage: "Approved",
      statusText: "Completed",
      progress: 100,
      progressColor: "bg-[#7DA627]",
      drawings: "45 Uploaded",
      pendingReviews: "Completed",
      nextMilestone: "Tender/Procurement"
    },
    {
      id: 5,
      name: "Sunrise Medical Centre",
      location: "Enugu, Enugu State",
      stage: "Draft",
      statusText: "In Progress",
      progress: 42,
      progressColor: "bg-[#FF3B30]",
      drawings: "12 Uploaded",
      pendingReviews: "0",
      nextMilestone: "Structural Design Development"
    }
  ];

  return (
    <div className="space-y-10 relative pb-12 w-full animate-in fade-in duration-500">

      {/* Invisible Overlay for click outside */}
      {openDropdown !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#022C4F] mb-3">My Projects</h1>
          <p className="text-[13px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
            Manage all your design, review, and execution-ready projects from one centralized workspace.<br />
            Track progress, monitor reviews, collaborate with professionals, and prepare projects for successful construction delivery.
          </p>
        </div>

        <div className="flex flex-col items-end gap-6 w-full lg:w-auto">
          {/* Top Right Utilities */}
          <div className="hidden lg:flex items-center gap-4">
            <button className="w-11 h-11 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0">
              <Search size={18} />
            </button>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="w-11 h-11 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0 relative"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-[#022C4F] rounded-full"></span>
            </button>

            {/* Profile Pill */}
            <ProfilePill />
          </div>

          <Button
            onClick={() => router.push('/client/design-workspace')}
            variant="primary"
            className="mt-10"
          >
            Go to Design Workspace
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Projects", value: "12" },
          { label: "Drawings Under Review", value: "14" },
          { label: "Pending Approvals", value: "8" },
          { label: "Ready for Execution", value: "3" }
        ].map((metric, idx) => (
          <div key={idx} className="bg-white border border-[#022C4F] rounded-[16px] p-6 flex flex-col justify-between h-[150px] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-[13px] font-bold text-[#022C4F]">{metric.label}</span>
              <div className="w-8 h-8 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] shrink-0">
                <ArrowUpRight size={16} />
              </div>
            </div>
            <span className="text-[40px] font-extrabold text-[#0F181F]">{metric.value}</span>
          </div>
        ))}
      </div>

      {/* Active Projects Table Section */}
      <div className="bg-white rounded-[32px] border border-[#022C4F] p-8 mt-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[18px] font-extrabold text-[#022C4F]">Active Project (3)</h2>

          {/* Pagination dots mimicking the screenshot */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
            <div className="w-5 h-5 rounded-full bg-[#022C4F] flex items-center justify-center text-white text-[10px] cursor-pointer">&lt;</div>
            <div className="w-5 h-5 rounded-full border-[1.5px] border-[#022C4F] bg-white mx-1 cursor-pointer"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mx-0.5"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mx-0.5"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mx-0.5"></div>
            <div className="w-5 h-5 rounded-full bg-[#022C4F] flex items-center justify-center text-white text-[10px] cursor-pointer">&gt;</div>
          </div>
        </div>

        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="bg-[#022C4F] text-white">
                <th className="py-4 px-4 text-left text-[9px] font-bold rounded-l-[16px] capitalize tracking-widest">Name</th>
                <th className="py-4 px-4 text-left text-[9px] font-bold  capitalize tracking-widest">Location</th>
                <th className="py-4 px-4 text-left text-[9px] font-bold capitalize tracking-widest">Current Stage</th>
                <th className="py-4 px-4 text-left text-[9px] font-bold capitalize tracking-widest">Progress</th>
                <th className="py-4 px-4 text-left text-[9px] font-bold capitalize tracking-widest">Drawings</th>
                <th className="py-4 px-4 text-center text-[9px] font-bold capitalize tracking-widest">Pending Reviews</th>
                <th className="py-4 px-4 text-left text-[9px] font-bold capitalize tracking-widest">Next Milestone</th>
                <th className="py-4 px-4 text-center text-[9px] font-bold rounded-r-[16px] capitalize tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, idx) => (
                <tr key={project.id} className="border-b border-[#022C4F]/20 hover:bg-gray-50 transition-colors">
                  <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F] break-words">{project.name}</td>
                  <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F] break-words">{project.location}</td>
                  <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F] break-words">{project.stage}</td>
                  <td className="py-5 px-4 min-w-[120px] max-w-[140px]">
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex justify-between items-center text-[8px] font-bold text-[#8FA4B5]">
                        <span>{project.statusText}</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${project.progressColor}`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F]">{project.drawings}</td>
                  <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F] text-center">{project.pendingReviews}</td>
                  <td className="py-5 px-4 text-[10px] font-semibold text-[#0F181F] break-words">{project.nextMilestone}</td>
                  <td className="py-5 px-4 text-center relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
                      className="text-[#022C4F] hover:bg-gray-100 rounded transition-colors p-1"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openDropdown === project.id && (
                      <div className="absolute right-6 top-10 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={() => { setOpenDropdown(null); router.push('/client/design-workspace'); }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-[#0F181F] hover:bg-gray-50 transition-colors"
                        >
                          Go to Project Workspace
                        </button>
                        <button
                          onClick={() => { setOpenDropdown(null); setIsReviewDrawerOpen(true); }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-[#0F181F] hover:bg-gray-50 transition-colors"
                        >
                          Review Drawings
                        </button>
                        <button
                          onClick={() => { setOpenDropdown(null); setIsFinalApprovalDrawerOpen(true); }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-[#0F181F] hover:bg-gray-50 transition-colors"
                        >
                          Approve Final Design
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReviewDrawingDrawer
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
      />

      <FinalApprovalDrawer
        isOpen={isFinalApprovalDrawerOpen}
        onClose={() => setIsFinalApprovalDrawerOpen(false)}
        onApprove={() => {
          setIsFinalApprovalDrawerOpen(false);
          setIsApprovalSuccessModalOpen(true);
        }}
      />

      <ApprovalSuccessModal
        isOpen={isApprovalSuccessModalOpen}
        onClose={() => setIsApprovalSuccessModalOpen(false)}
      />

      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
