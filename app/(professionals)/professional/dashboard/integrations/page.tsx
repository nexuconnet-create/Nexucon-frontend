"use client";

import React, { useState } from "react";
import TopRightControls from "@/components/dashboard/TopRightControls";
import ConnectIntegrationSideDrawer from "@/components/dashboard/ConnectIntegrationSideDrawer";
import { Hexagon, Globe, Box, Link2, Cloud, Package, Kanban, CloudSnow, CheckSquare } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
}

export default function IntegrationsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2500);
    }, 800);
  };

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "revit",
      name: "Autodesk Revit",
      description: "Synchronize BIM models, design revisions, families, and project data directly with your Revit workspace.",
      enabled: true,
      icon: <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/imgbin-autodesk-revit-computer-icons-building-information-modeling-autocad-revit-logo-blue-logo-vEvaPUFXG0yxZDgmhAQSRku1B_1_1_lxpxwr.png" alt="Revit logo" className="w-8 h-8 object-contain" />,
    },
    {
      id: "acc",
      name: "Autodesk Construction Cloud",
      description: "Connect project documents, issues, reviews, and design coordination workflows across the Autodesk Construction Cloud platform.",
      enabled: true,
      icon: <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/6171553f83bd01770ab424a3_ACC-Logo_1_1_e6fwey.png" alt="Autodesk Construction Cloud logo" className="w-8 h-8 object-contain" />,
    },
    {
      id: "trimble",
      name: "Trimble Connect",
      description: "Collaborate on BIM models, drawings, and project data in real time while maintaining synchronized model versions and review workflows.",
      enabled: true,
      icon: <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784686269/unnamed_1_1_ndmven.png" alt="Trimble Connect logo" className="w-8 h-8 object-contain" />,
    },
    {
      id: "navisworks",
      name: "Autodesk Navisworks",
      description: "Import coordinated models for clash detection, model federation, construction sequencing, and design validation.",
      enabled: true,
      icon: <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/Autodesk_Navisworks_1_1_atnafq.png" alt="Autodesk Navisworks logo" className="w-8 h-8 object-contain" />,
    },
    {
      id: "ifc",
      name: "IFC Model Support",
      description: "Import coordinated models for clash detection, model federation, construction sequencing, and design validation.",
      enabled: true,
      icon: <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784686255/images_1_1_ooo4k9.png" alt="IFC Model Support logo" className="w-8 h-8 object-contain" />,
    },
    {
      id: "gdrive",
      name: "Google Drive",
      description: "Store, organize, and synchronize project drawings, documents, BIM files, and reports directly with Google Drive.",
      enabled: true,
      icon: <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/images_2_1_oeo83f.png" alt="Google Drive logo" className="w-8 h-8 object-contain" />,
    },
    {
      id: "onedrive",
      name: "Microsoft OneDrive",
      description: "Securely access, share, and manage project files across devices using Microsoft OneDrive integration.",
      enabled: true,
      icon: <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784686254/2c0b189a9b9ba1708d95f152d82a333b_1_1_b2krtn.png" alt="Microsoft OneDrive logo" className="w-8 h-8 object-contain" />,
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Synchronize project folders, design documents, and collaboration files with Dropbox for seamless team access.",
      enabled: true,
      icon: <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784686269/sm_5b321ca31dc13_1_1_jzcoii.png" alt="Dropbox logo" className="w-8 h-8 object-contain" />,
    },
    {
      id: "jira",
      name: "Jira",
      description: "Synchronize project folders, design documents, and collaboration files with Dropbox for seamless team access.",
      enabled: true,
      icon: <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784686255/images_1_1_1_fyerox.png" alt="Jira logo" className="w-8 h-8 object-contain" />,
    },
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, enabled: !int.enabled } : int
    ));
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500 relative">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-3xl">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#022C4F] leading-tight">
            Integrations
          </h1>
          <p className="text-[12px] md:text-[14px] text-gray-600 font-medium leading-relaxed min-h-[40px]">
            Connect third-party applications and cloud services to streamline project collaboration, document management, BIM coordination, communication, and data synchronization.
          </p>
        </div>
        <div className="hidden lg:block">
          <TopRightControls />
        </div>
      </div>

      {/* Connected Applications Header Area */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
        <h2 className="text-[24px] font-extrabold text-[#022C4F]">
          Connected Applications
        </h2>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-full border border-[#022C4F] text-[#022C4F] font-semibold text-[13px] hover:bg-[#022C4F]/5 transition-all whitespace-nowrap min-w-[190px]"
          >
            {isSaving ? "Saving..." : showSaveSuccess ? "✓ Settings Saved" : "Save Integration Settings"}
          </button>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-full bg-[#022C4F] text-white font-semibold text-[13px] hover:bg-[#022C4F]/90 transition-all whitespace-nowrap"
          >
            Connect New Integration
          </button>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div 
            key={integration.id}
            className="flex flex-col gap-4 p-6 bg-white border border-[#022C4F]/20 rounded-2xl hover:shadow-lg hover:border-[#022C4F]/40 transition-all duration-300"
          >
            {/* Top row: Icon and Toggle */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                {integration.icon}
              </div>
              <button 
                onClick={() => toggleIntegration(integration.id)}
                className={`relative w-[52px] h-[28px] rounded-full transition-colors duration-300 ${
                  integration.enabled ? "bg-[#022C4F]" : "bg-gray-300"
                } border border-transparent outline-none focus:outline-none`}
              >
                <div 
                  className={`absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full transition-transform duration-300 shadow-sm ${
                    integration.enabled ? "translate-x-[24px]" : "translate-x-0"
                  }`} 
                />
              </button>
            </div>

            {/* Bottom row: Details */}
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-[18px] font-extrabold text-[#022C4F]">
                {integration.name}
              </h3>
              <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                {integration.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ConnectIntegrationSideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
