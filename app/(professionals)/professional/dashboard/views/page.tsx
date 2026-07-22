"use client";

import React, { useState } from "react";
import { Search, Bell, Filter, Star, Plus, MoreHorizontal, ArrowUpRight } from "lucide-react";
import TopRightControls from "@/components/dashboard/TopRightControls";
import CreateViewSideDrawer from "@/components/dashboard/CreateViewSideDrawer";
import ViewSuccessModal from "@/components/dashboard/ViewSuccessModal";
import ImportViewSideDrawer from "@/components/dashboard/ImportViewSideDrawer";

export default function SavedViews() {
  const [isCreateViewOpen, setIsCreateViewOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isImportViewOpen, setIsImportViewOpen] = useState(false);

  const metricCards = [
    { title: "Total Saved Views", value: "18" },
    { title: "Personal Views", value: "10" },
    { title: "Shared Team Views", value: "6" },
    { title: "Project Default Views", value: "2" },
  ];

  const viewCards = [
    {
      sectionTitle: "My Saved Views",
      title: "Architectural Review Workspace",
      description: "Displays architectural drawings awaiting review with open comments and annotations.",
      createdBy: "You",
      lastUpdated: "Today • 9:15 AM",
    },
    {
      title: "Structural Coordination",
      description: "Focuses on structural drawings, calculations, and coordination documents.",
      createdBy: "You",
      lastUpdated: "Yesterday",
    },
    {
      title: "MEP Coordination View",
      description: "Shows all mechanical, electrical, and plumbing drawings with active review topics.",
      createdBy: "You",
      lastUpdated: "2 Days Ago",
    },
    {
      title: "Pending Reviews",
      description: "Displays documents and drawings awaiting your review or approval.",
      createdBy: "You",
      lastUpdated: "Today",
    },
  ];

  return (
    <div className="h-full flex flex-col pt-2 pb-12 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-[40px] font-bold text-[#022C4F] leading-tight mb-4">
            Saved Views
          </h1>
          <p className="text-gray-600 text-[13px] leading-relaxed max-w-3xl">
            Save and quickly access customized project views, document filters, drawing layouts, review dashboards, and workspace configurations to improve productivity and collaboration.
          </p>
        </div>

        <TopRightControls />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <button
          onClick={() => setIsCreateViewOpen(true)}
          className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-10 py-3.5 rounded-full font-medium transition-colors text-[13px] shadow-sm"
        >
          Create New View
        </button>
        <button
          onClick={() => setIsImportViewOpen(true)}
          className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-10 py-3.5 rounded-full font-medium transition-colors shadow-sm text-[13px]"
        >
          Import View Configuration
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

      {/* Views Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {viewCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-[32px] p-10 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">

            {card.sectionTitle && (
              <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-8">{card.sectionTitle}</h2>
            )}

            <h3 className={`text-[16px] font-extrabold text-[#022C4F] ${card.sectionTitle ? 'mb-8' : 'mb-10'}`}>
              {card.title}
            </h3>

            <div className="mb-8 flex flex-col gap-8">
              <div>
                <h4 className="text-[13px] font-extrabold text-[#022C4F] mb-3">Description</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed max-w-[90%]">{card.description}</p>
              </div>

              <div>
                <h4 className="text-[13px] font-extrabold text-[#022C4F] mb-3">Created by</h4>
                <p className="text-[13px] text-gray-500">{card.createdBy}</p>
              </div>

              <div>
                <h4 className="text-[13px] font-extrabold text-[#022C4F] mb-3">Last Updated</h4>
                <p className="text-[13px] text-gray-500">{card.lastUpdated}</p>
              </div>
            </div>

            <div className="flex gap-4 mt-auto pt-6">
              <button className="flex-1 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 py-3.5 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
                Open
              </button>
              <button className="flex-1 bg-[#022C4F] hover:bg-[#033A6B] text-white py-3.5 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
                Edit
              </button>
              <button className="flex-1 bg-[#111827] hover:bg-[#1F2937] text-white py-3.5 rounded-lg font-bold transition-colors text-[11px] shadow-sm">
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create View Modal (Side Drawer) */}
      <CreateViewSideDrawer
        isOpen={isCreateViewOpen}
        onClose={() => setIsCreateViewOpen(false)}
        onSave={() => {
          setIsCreateViewOpen(false);
          setIsSuccessModalOpen(true);
        }}
      />

      {/* Success Modal */}
      <ViewSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {/* Import View Modal (Side Drawer) */}
      <ImportViewSideDrawer
        isOpen={isImportViewOpen}
        onClose={() => setIsImportViewOpen(false)}
      />
    </div>
  );
}
