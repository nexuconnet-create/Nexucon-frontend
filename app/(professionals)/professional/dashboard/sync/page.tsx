"use client";

import React, { useState } from "react";
import TopRightControls from "@/components/dashboard/TopRightControls";
import { Download, CheckCircle2 } from "lucide-react";

export default function SynchronizationPage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const [services, setServices] = useState([
    {
      id: "revit",
      name: "Autodesk Revit",
      icon: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/imgbin-autodesk-revit-computer-icons-building-information-modeling-autocad-revit-logo-blue-logo-vEvaPUFXG0yxZDgmhAQSRku1B_1_1_lxpxwr.png",
      enabled: true,
      status: "Synchronized",
      pending: false,
    },
    {
      id: "acc",
      name: "Autodesk Construction Cloud",
      icon: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/6171553f83bd01770ab424a3_ACC-Logo_1_1_e6fwey.png",
      enabled: true,
      status: "Synchronized",
      pending: false,
    },
    {
      id: "trimble",
      name: "Trimble Connect",
      icon: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784686269/unnamed_1_1_ndmven.png",
      enabled: true,
      status: "Synchronized",
      pending: false,
    },
    {
      id: "navisworks",
      name: "Autodesk Navisworks",
      icon: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/Autodesk_Navisworks_1_1_atnafq.png",
      enabled: true,
      status: "Synchronization Pending",
      pending: true,
    },
    {
      id: "gdrive",
      name: "Google Drive",
      icon: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/images_2_1_oeo83f.png",
      enabled: true,
      status: "Synchronized",
      pending: false,
    },
  ]);

  const [plugins, setPlugins] = useState([
    {
      id: "autocad",
      name: "AutoCAD",
      icon: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/imgbin-autodesk-revit-computer-icons-building-information-modeling-autocad-revit-logo-blue-logo-vEvaPUFXG0yxZDgmhAQSRku1B_1_1_lxpxwr.png",
      version: "v2.1.4",
      status: "Installed",
    },
    {
      id: "revit",
      name: "Revit",
      icon: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/imgbin-autodesk-revit-computer-icons-building-information-modeling-autocad-revit-logo-blue-logo-vEvaPUFXG0yxZDgmhAQSRku1B_1_1_lxpxwr.png",
      version: "v3.0.1",
      status: "Installed",
    },
    {
      id: "sketchup",
      name: "SketchUp",
      icon: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784686269/unnamed_1_1_ndmven.png",
      version: "v1.8.0",
      status: "Download",
    },
    {
      id: "archicad",
      name: "ArchiCAD",
      icon: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/6171553f83bd01770ab424a3_ACC-Logo_1_1_e6fwey.png",
      version: "v2.0.0",
      status: "Download",
    },
  ]);

  const toggleService = (id: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleSyncProject = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Project synchronization started successfully', type: 'success' } }));
      
      // Clear pending state for Navisworks just for realism
      setServices(services.map(s => 
        s.pending ? { ...s, status: "Synchronized", pending: false } : s
      ));
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500 relative">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-4xl">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#022C4F] leading-tight">
            Synchronization
          </h1>
          <p className="text-[12px] md:text-[14px] text-gray-600 font-medium leading-relaxed min-h-[40px] max-w-3xl">
            Monitor and manage synchronization between BIM models, project documents, cloud storage, and connected applications to ensure every team member is working with the latest project information.
          </p>
        </div>
        <div className="hidden lg:block">
          <TopRightControls />
        </div>
      </div>

      <div className="flex flex-col mt-4 gap-12">
        
        {/* Synchronization Status */}
        <div className="flex flex-col gap-6">
          <h2 className="text-[22px] font-extrabold text-[#022C4F]">
            Synchronization Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 max-w-[800px]">
            <div className="flex flex-col gap-3">
              <span className="text-[16px] font-extrabold text-[#022C4F]">Overall Status</span>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="text-[15px] text-gray-600">All Systems Operational</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <span className="text-[16px] font-extrabold text-[#022C4F]">Next Scheduled Sync</span>
              <span className="text-[15px] text-gray-600">Today • 11:00 AM</span>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[16px] font-extrabold text-[#022C4F]">Last Synchronization</span>
              <span className="text-[15px] text-gray-600">Today • 10:42 AM</span>
            </div>
          </div>
        </div>

        {/* Connected Services */}
        <div className="flex flex-col gap-6 mt-2">
          <h2 className="text-[22px] font-extrabold text-[#022C4F]">
            Connected Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div 
                key={service.id}
                className="flex flex-col gap-4 p-6 bg-white border border-[#022C4F]/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Top row: Icon and Toggle */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <img src={service.icon} alt={service.name} className="w-8 h-8 object-contain" />
                  </div>
                  <button 
                    onClick={() => toggleService(service.id)}
                    className={`relative w-[52px] h-[28px] rounded-full transition-colors duration-300 ${
                      service.enabled ? "bg-[#022C4F]" : "bg-gray-300"
                    } border border-transparent outline-none focus:outline-none`}
                  >
                    <div 
                      className={`absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full transition-transform duration-300 shadow-sm ${
                        service.enabled ? "translate-x-[24px]" : "translate-x-0"
                      }`} 
                    />
                  </button>
                </div>

                {/* Middle: Title */}
                <h3 className="text-[18px] font-extrabold text-[#022C4F] mt-2">
                  {service.name}
                </h3>

                {/* Bottom: Status */}
                <div className="flex flex-col gap-2 mt-auto pt-2">
                  <span className="text-[13px] font-extrabold text-[#022C4F]">Status</span>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-[14px] h-[14px] rounded-full ${service.pending ? "bg-[#FCD34D]" : "bg-[#22C55E]"} shadow-sm`} />
                    <span className="text-[14px] text-gray-600">{service.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nexucon Connect Desktop Plugins */}
        <div className="flex flex-col gap-6 mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-col gap-2">
            <h2 className="text-[22px] font-extrabold text-[#022C4F]">
              Nexucon Connect Desktop Plugins
            </h2>
            <p className="text-[13px] text-gray-600 max-w-3xl leading-relaxed">
              Enable continuous background synchronization and automated versioning directly from your authoring software. Installing these plugins replaces the need for manual batch file uploads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plugins.map((plugin) => (
              <div 
                key={plugin.id}
                className="flex flex-col gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-white rounded-lg border border-gray-100">
                    <img src={plugin.icon} alt={plugin.name} className="w-6 h-6 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#0F181F]">{plugin.name}</h3>
                    <span className="text-[11px] text-gray-500 font-medium">Version {plugin.version}</span>
                  </div>
                </div>

                <button 
                  className={`mt-2 flex items-center justify-center gap-2 h-10 w-full rounded-xl text-[12px] font-bold transition-colors ${
                    plugin.status === 'Installed' 
                      ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]' 
                      : 'bg-white text-[#022C4F] border border-[#022C4F] hover:bg-[#022C4F]/5'
                  }`}
                >
                  {plugin.status === 'Installed' ? (
                    <>
                      <CheckCircle2 size={16} />
                      Installed
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download Plugin
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <button 
            onClick={handleSyncProject}
            disabled={isSyncing}
            className="min-w-[200px] px-8 py-3.5 rounded-full border-[1.5px] border-[#022C4F] text-[#022C4F] font-bold text-[13px] hover:bg-[#022C4F]/5 transition-all disabled:opacity-50"
          >
            {isSyncing ? "Synchronizing..." : "Synchronize Project"}
          </button>
          <button 
            className="min-w-[200px] px-8 py-3.5 rounded-full bg-[#022C4F] text-white font-bold text-[13px] hover:bg-[#022C4F]/90 transition-all shadow-sm"
          >
            View Synchronization Logs
          </button>
        </div>

      </div>

    </div>
  );
}
