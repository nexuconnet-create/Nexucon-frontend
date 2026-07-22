"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Bell, ArrowUpRight, RefreshCcw, CheckCircle } from "lucide-react";
import ScheduleCollaborativeReviewSideDrawer from "@/components/dashboard/ScheduleCollaborativeReviewSideDrawer";
import CalibrateModelSideDrawer from "@/components/dashboard/CalibrateModelSideDrawer";
import TopRightControls from "@/components/dashboard/TopRightControls";

export default function SharedDesignWorkspace() {
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);
  const [isCalibrateDrawerOpen, setIsCalibrateDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);

  const handleSyncModel = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncComplete(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncComplete(true);
      setTimeout(() => {
        setSyncComplete(false);
      }, 3000);
    }, 2000);
  };

  const metricCards = [
    { title: "Active Collaborators", value: "24" },
    { title: "Shared Drawings", value: "186" },
    { title: "BIM Models", value: "12" },
    { title: "AR Sessions", value: "7" },
  ];

  const designModels = [
    {
      title: "Architectural BIM Model",
      version: "V4.0",
      discipline: "Architecture",
      status: "Approved",
    },
    {
      title: "Structural BIM Model",
      version: "V3.2",
      discipline: "Structural Engineering",
      status: "Under Review",
    },
    {
      title: "MEP Coordination Model",
      version: "V2.6",
      status: "Coordination Review",
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12">
        <div className="max-w-[750px]">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#022C4F] mb-4 tracking-tight">
            Shared Design Workspace
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-600 leading-relaxed">
            Collaborate with architects, engineers, consultants, clients, and contractors in a centralized design environment.
            Review drawings, coordinate disciplines, conduct peer reviews, and visualize BIM models using Augmented Reality (AR) for improved design validation before construction.
          </p>
        </div>

        {/* Top Right Controls */}
        <TopRightControls />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <Link href="/professional/dashboard/workspace/model-viewer">
          <button className="bg-[#022C4F] text-white hover:bg-[#033A6B] px-8 py-3.5 rounded-full font-medium transition-colors text-[13px] shadow-sm">
            Open Web Model Viewer
          </button>
        </Link>
        <Link href="/professional/dashboard/workspace/ar-viewer">
          <button className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-8 py-3.5 rounded-full font-medium transition-colors text-[13px] shadow-sm">
            Launch AR Design Review
          </button>
        </Link>
        <button onClick={() => setIsScheduleDrawerOpen(true)} className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-8 py-3.5 rounded-full font-medium transition-colors shadow-sm text-[13px]">
          Schedule Collaborative Review
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metricCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-[24px] p-6  shadow-sm relative group hover:shadow-md transition-all">
            <h3 className="text-[#022C4F] font-bold text-[12px] mb-6">{card.title}</h3>
            <p className="text-[32px] font-extrabold text-[#022C4F] leading-none">{card.value}</p>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center group-hover:bg-[#022C4F] group-hover:border-[#022C4F] transition-colors cursor-pointer">
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Shared Design Models */}
      <h2 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Shared Design Models</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        {/* Model 1 */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow h-full">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">{designModels[0].title}</h3>

          <div className="flex flex-col gap-5 mb-auto">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Version</span>
              <span className="text-[11px] text-gray-500">{designModels[0].version}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Discipline</span>
              <span className="text-[11px] text-gray-500">{designModels[0].discipline}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Status</span>
              <span className="text-[11px] text-gray-500">{designModels[0].status}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Last Updated</span>
              <span className="text-[11px] text-gray-500">Today • 9:42 AM</span>
            </div>
          </div>

          <div className="flex gap-2 mt-8">
            <button className="flex-1 bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 py-2.5 rounded-md font-medium transition-colors text-[9px] shadow-sm whitespace-nowrap">
              Open Model
            </button>
            <button className="flex-1 bg-[#022C4F] hover:bg-[#033A6B] text-white py-2.5 rounded-md font-medium transition-colors text-[9px] shadow-sm whitespace-nowrap">
              Share
            </button>
            <button className="flex-1 bg-[#111827] hover:bg-[#1F2937] text-white py-2.5 rounded-md font-medium transition-colors text-[9px] shadow-sm whitespace-nowrap">
              Launch AR View
            </button>
          </div>
        </div>

        {/* Model 2 */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow h-full">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">{designModels[1].title}</h3>

          <div className="flex flex-col gap-5 mb-auto">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Version</span>
              <span className="text-[11px] text-gray-500">{designModels[1].version}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Discipline</span>
              <span className="text-[11px] text-gray-500">{designModels[1].discipline}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Status</span>
              <span className="text-[11px] text-gray-500">{designModels[1].status}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-8">
            <button className="flex-1 bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 py-2.5 rounded-md font-medium transition-colors text-[9px] shadow-sm whitespace-nowrap">
              View Model
            </button>
            <button className="flex-1 bg-[#022C4F] hover:bg-[#033A6B] text-white py-2.5 rounded-md font-medium transition-colors text-[9px] shadow-sm whitespace-nowrap">
              Add Review
            </button>
            <button className="flex-1 bg-[#111827] hover:bg-[#1F2937] text-white py-2.5 rounded-md font-medium transition-colors text-[9px] shadow-sm whitespace-nowrap">
              View in AR
            </button>
          </div>
        </div>

        {/* Model 3 */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow h-full">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">{designModels[2].title}</h3>

          <div className="flex flex-col gap-5 mb-auto">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Version</span>
              <span className="text-[11px] text-gray-500">{designModels[2].version}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-[#022C4F]">Status</span>
              <span className="text-[11px] text-gray-500">{designModels[2].status}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-8 w-2/3">
            <button className="flex-1 bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 py-2.5 rounded-md font-medium transition-colors text-[9px] shadow-sm whitespace-nowrap">
              Open
            </button>
            <button className="flex-1 bg-[#022C4F] hover:bg-[#033A6B] text-white py-2.5 rounded-md font-medium transition-colors text-[9px] shadow-sm whitespace-nowrap">
              AR Coordination
            </button>
          </div>
        </div>

      </div>

      {/* Augmented Reality (AR) Workspace */}
      <h2 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Augmented Reality (AR) Workspace</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

        {/* AR Model Viewer */}
        <div className="bg-[#FAFAFA] rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">AR Model Viewer</h3>
          <div className="relative w-full aspect-[4/3] mb-8 bg-white rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-4">
            <Image
              src="/placeholder.svg"
              alt="AR Model Viewer"
              fill
              className="object-contain"
              style={{ content: 'url(https://res.cloudinary.com/depeqzb6z/image/upload/v1784646913/Implementac%CC%A7a%CC%83o_do_BIM_com_Revit__Como_implementar_o_BIM_usando_o_Revit__1_2_rxlqcv.png)' }}
            />
          </div>
          <div className="flex gap-4 mt-auto">
            <Link 
              href={`/professional/dashboard/workspace/ar-viewer?image=${encodeURIComponent('https://res.cloudinary.com/depeqzb6z/image/upload/v1784646913/Implementac%CC%A7a%CC%83o_do_BIM_com_Revit__Como_implementar_o_BIM_usando_o_Revit__1_2_rxlqcv.png')}`} 
              className="flex-1 flex"
            >
              <button className="w-full bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-8 py-3.5 rounded-md font-medium transition-colors text-[11px] shadow-sm">
                Launch AR Viewer
              </button>
            </Link>
            <button 
              onClick={handleSyncModel}
              disabled={isSyncing}
              className={`px-8 py-3.5 rounded-md font-medium transition-colors text-[11px] shadow-sm flex-1 flex items-center justify-center gap-2 ${
                syncComplete 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-[#022C4F] hover:bg-[#033A6B] text-white'
              }`}
            >
              {isSyncing ? (
                <>
                  <RefreshCcw size={14} className="animate-spin" />
                  Syncing...
                </>
              ) : syncComplete ? (
                <>
                  <CheckCircle size={14} />
                  Synced
                </>
              ) : (
                "Sync Latest Model"
              )}
            </button>
          </div>
        </div>

        {/* Site Alignment */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Site Alignment</h3>
          <div className="relative w-full aspect-[4/3] mb-8 bg-[#FAFAFA] rounded-2xl overflow-hidden border border-gray-100 p-4">
            <Image
              src="/placeholder.svg"
              alt="Site Alignment Plan"
              fill
              className="object-contain"
              style={{ content: 'url(https://res.cloudinary.com/depeqzb6z/image/upload/v1784646922/Information_Site_Practice_1_1_rcssls.png)' }}
            />
          </div>
          <div className="flex gap-4 mt-auto">
            <Link href="/professional/dashboard/workspace/site-alignment" className="flex-1 flex">
              <button className="w-full bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-8 py-3.5 rounded-md font-medium transition-colors text-[11px] shadow-sm">
                Start Site Alignment
              </button>
            </Link>
            <button onClick={() => setIsCalibrateDrawerOpen(true)} className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-8 py-3.5 rounded-md font-medium transition-colors text-[11px] shadow-sm flex-1">
              Calibrate Model Position
            </button>
          </div>
        </div>

      </div>

      <ScheduleCollaborativeReviewSideDrawer
        isOpen={isScheduleDrawerOpen}
        onClose={() => setIsScheduleDrawerOpen(false)}
      />
      <CalibrateModelSideDrawer 
        isOpen={isCalibrateDrawerOpen} 
        onClose={() => setIsCalibrateDrawerOpen(false)} 
      />
    </div>
      );
}
