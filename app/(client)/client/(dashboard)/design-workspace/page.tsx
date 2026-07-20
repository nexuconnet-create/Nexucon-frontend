"use client";

import React, { useState, useRef } from "react";
import { Search, Bell, MoreHorizontal, CheckCircle, Hourglass, FileText, Upload, X, ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import OverviewTab from "./components/OverviewTab";
import DrawingsTab from "./components/DrawingsTab";
import DocumentsTab from "./components/DocumentsTab";
import ReviewsTab from "./components/ReviewsTab";
import TeamTab from "./components/TeamTab";
import TimelineTab from "./components/TimelineTab";
import MeetingsTab from "./components/MeetingsTab";
import ActivityTab from "./components/ActivityTab";

import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DrawingPreviewModal from "@/components/dashboard/DrawingPreviewModal";
import DocumentPreviewModal from "@/components/dashboard/DocumentPreviewModal";

const DRAWINGS = [
  { id: 1, title: "TYPICAL FLOOR PLAN", imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784489051/3_Bedroom_House_Plan_-_ID_13501_-_CAD_PDF___Architectural_Drawings_1_kk7vmz.png" },
  { id: 2, title: "GROUND FLOOR PLAN", imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784489053/9x10m_house_plan_is_given_in_this_Autocad_drawing_file__1_itp4pu.png" },
  { id: 3, title: "ROOF PLAN", imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784499060/Residential_Electrical_Layout_DWG_with_Lighting_Points_1_ynofyf.png" },
  { id: 4, title: "ELECTRICAL LAYOUT PLAN", imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784489052/__16_1_dgy7qg.png" },
  { id: 5, title: "PLUMBING LAYOUT PLAN", imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784489051/__17_1_gjc6ii.png" },
  { id: 6, title: "HVAC LAYOUT PLAN", imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784489052/__18_1_qmkang.png" }
];

export default function DesignWorkspacePage() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Documents");
  const [previewDrawing, setPreviewDrawing] = useState<{ title: string, imageUrl: string } | null>(null);
  const [previewDocument, setPreviewDocument] = useState<File | null>(null);

  // Document Upload State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-8 relative pb-12">

      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
        <div>
          <h1 className="text-3xl font-extrabold text-[#022C4F] mb-1">Design Workspace</h1>
          <p className="text-[11px] text-gray-500 font-medium max-w-lg">
            Collaborate with design professionals, review project deliverables, manage drawings, track revisions, and coordinate approvals throughout the design lifecycle.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-start lg:items-end gap-4 w-full lg:w-auto">
          <div className="hidden lg:flex items-center justify-end w-auto gap-4">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Action executed successfully!', type: 'success' } })); }} className="w-10 h-10 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0">
              <Search size={18} />
            </button>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="w-10 h-10 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0 relative"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#022C4F] rounded-full"></span>
            </button>

            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Action executed successfully!', type: 'success' } })); }} className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#022C4F] hover:bg-gray-50 transition-colors shrink-0">
              <div className="w-7 h-7 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-[10px] font-bold">
                JD
              </div>
              <div className="text-left hidden sm:block pr-2">
                <p className="text-[11px] font-bold text-[#0F181F] leading-tight">John Doe</p>
                <p className="text-[9px] text-gray-500 leading-tight">client@nexucon.tech</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#022C4F] rounded-[32px] p-8 md:p-10 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 ease-out fill-mode-both">
        <h2 className="text-white text-2xl md:text-[28px] font-bold tracking-wide">Victoria Heights Residential Estate</h2>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Action executed successfully!', type: 'success' } })); }} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#022C4F] hover:bg-gray-100 transition-colors shrink-0">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Grid: Overview & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 ease-out fill-mode-both">

        {/* Project Overview */}
        <div className="pr-4">
          <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-8">Project Overview</h3>
          <h4 className="text-[13px] font-bold text-[#022C4F] mb-6">Project Information</h4>

          <div className="flex flex-col gap-5">
            <p className="text-[12px]"><span className="font-bold text-[#0F181F] w-32 inline-block">Project Status:</span> <span className="text-gray-600 font-medium">Structural Design Review</span></p>
            <p className="text-[12px]"><span className="font-bold text-[#0F181F] w-32 inline-block">Location:</span> <span className="text-gray-600 font-medium">Lekki, Lagos, Nigeria</span></p>
            <p className="text-[12px]"><span className="font-bold text-[#0F181F] w-32 inline-block">Team Members:</span> <span className="text-gray-600 font-medium">12 Professionals</span></p>
            <p className="text-[12px]"><span className="font-bold text-[#0F181F] w-32 inline-block">Review Sessions:</span> <span className="text-gray-600 font-medium">3 Upcoming</span></p>
            <p className="text-[12px]"><span className="font-bold text-[#0F181F] w-32 inline-block">Document Count:</span> <span className="text-gray-600 font-medium">48 Documents</span></p>
            <p className="text-[12px]"><span className="font-bold text-[#0F181F] w-32 inline-block">Start Date:</span> <span className="text-gray-600 font-medium">January 15, 2026</span></p>
            <p className="text-[12px]"><span className="font-bold text-[#0F181F] w-32 inline-block">Current Phase:</span> <span className="text-gray-600 font-medium">Foundation & Structural Works</span></p>

            <div className="flex items-center gap-4 mt-2">
              <span className="font-bold text-[#0F181F] text-[12px] w-32 shrink-0">Overall Progress:</span>
              <div className="flex-1 max-w-[220px]">
                <div className="flex justify-between text-[9px] font-bold text-gray-500 mb-1.5">
                  <span>In Progress</span>
                  <span>30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#6A994E] h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Design Progress */}
        <div className="border border-[#022C4F] rounded-[32px] p-8 md:p-10 shadow-sm">
          <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-8">Design Progress</h3>
          <h4 className="text-[13px] font-bold text-[#022C4F] mb-8">Design Workflow</h4>

          <div className="grid grid-cols-2 gap-y-10 gap-x-6">
            <div>
              <p className="text-[13px] font-bold text-[#022C4F] mb-3">Architectural Design</p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <div className="bg-[#4CAF50] rounded-sm p-[2px]">
                  <CheckCircle size={10} className="text-white" strokeWidth={4} />
                </div>
                Complete
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold text-[#022C4F] mb-3">Peer Review</p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <Hourglass size={12} className="text-[#8B4513]" strokeWidth={3} />
                Pending
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold text-[#022C4F] mb-3">Structural Design</p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F1C40F]"></div>
                Under Review
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold text-[#022C4F] mb-3">Final Approval</p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <Hourglass size={12} className="text-[#8B4513]" strokeWidth={3} />
                Pending
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold text-[#022C4F] mb-3">MEP Design</p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F1C40F]"></div>
                Under Review
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold text-[#022C4F] mb-3">Quantity Surveying</p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"></div>
                Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Breakdown */}
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 ease-out fill-mode-both mt-12">
        <div className="border border-[#022C4F] rounded-[32px] p-8 md:p-10 shadow-sm">
          <h3 className="text-[20px] font-extrabold text-[#022C4F] mb-6">Budget Breakdown</h3>
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full min-w-[700px] text-left border-collapse">
               <thead>
                  <tr className="border-b-2 border-gray-100">
                     <th className="py-4 px-4 text-[13px] font-bold text-[#0F181F]">Category</th>
                     <th className="py-4 px-4 text-[13px] font-bold text-[#0F181F]">Budgeted</th>
                     <th className="py-4 px-4 text-[13px] font-bold text-[#0F181F]">Committed</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                     <td className="py-4 px-4 text-[12px] font-medium text-[#022C4F]">Design Fees</td>
                     <td className="py-4 px-4 text-[12px] text-gray-600 font-medium">₦2,500,000</td>
                     <td className="py-4 px-4 text-[12px] text-gray-600 font-medium">₦2,500,000</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                     <td className="py-4 px-4 text-[12px] font-medium text-[#022C4F]">BOQ Production</td>
                     <td className="py-4 px-4 text-[12px] text-gray-600 font-medium">₦1,200,000</td>
                     <td className="py-4 px-4 text-[12px] text-gray-600 font-medium">₦1,200,000</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                     <td className="py-4 px-4 text-[12px] font-medium text-[#022C4F]">Permits/Fees</td>
                     <td className="py-4 px-4 text-[12px] text-gray-600 font-medium">₦500,000</td>
                     <td className="py-4 px-4 text-[12px] text-gray-600 font-medium">₦500,000</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                     <td className="py-5 px-4 text-[13px] font-extrabold text-[#022C4F]">Total Budget</td>
                     <td className="py-5 px-4 text-[13px] font-extrabold text-[#022C4F]">₦4,200,000</td>
                     <td className="py-5 px-4 text-[13px] font-extrabold text-[#022C4F]">₦4,200,000</td>
                  </tr>
               </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pt-4 pb-2 border-b-2 border-gray-100 flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 ease-out fill-mode-both">
        {['Overview', 'Drawings', 'Documents', 'Reviews', 'Team', 'Timeline', 'Meetings', 'Activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2 rounded-full text-[11px] font-bold border transition-colors ${activeTab === tab
              ? 'bg-[#022C4F] text-white border-[#022C4F]'
              : 'bg-white text-gray-600 border-[#022C4F] hover:bg-gray-50'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && <OverviewTab />}

      {activeTab === 'Drawings' && <DrawingsTab DRAWINGS={DRAWINGS} setPreviewDrawing={setPreviewDrawing} />}

      {activeTab === 'Documents' && <DocumentsTab uploadedFiles={uploadedFiles} isDragging={isDragging} handleDragOver={handleDragOver} handleDragLeave={handleDragLeave} handleDrop={handleDrop} handleFileSelect={handleFileSelect} fileInputRef={fileInputRef} removeFile={removeFile} setPreviewDocument={setPreviewDocument} />}

      {activeTab === 'Reviews' && <ReviewsTab />}

      {activeTab === 'Team' && <TeamTab />}

      {activeTab === 'Timeline' && <TimelineTab />}

      {activeTab === 'Meetings' && <MeetingsTab />}

      {activeTab === 'Activity' && <ActivityTab />}

      <DrawingPreviewModal
        isOpen={!!previewDrawing}
        onClose={() => setPreviewDrawing(null)}
        imageUrl={previewDrawing?.imageUrl || ""}
        title={previewDrawing?.title || ""}
      />

      <DocumentPreviewModal
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        file={previewDocument}
      />

      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
