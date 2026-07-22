"use client";

import React, { useState } from "react";
import { Search, Bell, ChevronDown, ArrowUpRight, Folder, MoreHorizontal, Settings2, X, Box, Database } from "lucide-react";
import TopRightControls from "@/components/dashboard/TopRightControls";
import { CustomSelect } from "@/components/CustomSelect";
import Link from "next/link";
import FolderDetailsModal from "@/components/dashboard/FolderDetailsModal";
import CreateFolderSideDrawer from "@/components/dashboard/CreateFolderSideDrawer";
import UploadFileModal from "@/components/dashboard/UploadFileModal";
import IfcManagerModal from "@/components/dashboard/IfcManagerModal";

export default function ProjectExplorer() {
  const [fileType, setFileType] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [isIfcModalOpen, setIsIfcModalOpen] = useState(false);

  const metricCards = [
    { title: "Project", value: "Victoria Heights\nResidential Estate" },
    { title: "Project Phase", value: "Design\nDevelopment" },
    { title: "Total Files", value: "247" },
    { title: "Folders", value: "18" },
  ];

  const folders = [
    { 
      name: "Architectural Drawings", 
      files: 21,
      description: "Contains floor plans, elevations, sections, reflected ceiling plans, and architectural details.",
      recentFiles: ["Ground Floor Plan.pdf", "First Floor Plan.pdf", "Roof Layout Plan.pdf"]
    },
    { 
      name: "MEP Drawings", 
      files: 18,
      description: "Contains mechanical, electrical, and plumbing layouts and schematics.",
      recentFiles: ["Electrical Layout.dwg", "HVAC Routing.pdf", "Plumbing Isometric.pdf"]
    },
    { 
      name: "Bill of Quantities (BOQ)", 
      files: 9,
      description: "Contains detailed cost estimates and material takeoffs for all trades.",
      recentFiles: ["Structural BOQ Final.xlsx", "Architectural BOQ.xlsx"]
    },
    { 
      name: "Technical Reports", 
      files: 16,
      description: "Contains soil reports, structural analysis, and feasibility studies.",
      recentFiles: ["Structural Design Report.pdf", "Geotechnical Survey.pdf"]
    },
    { 
      name: "Specifications", 
      files: 11,
      description: "Contains detailed material specifications and construction methodologies.",
      recentFiles: ["Concrete Specs.pdf", "Finishes Schedule.pdf"]
    },
    { 
      name: "Meeting Records", 
      files: 14,
      description: "Contains minutes of meetings, site visit logs, and client correspondences.",
      recentFiles: ["Coordination MOM - Aug 12.pdf", "Client Feedback - V2.pdf"]
    },
    { 
      name: "Reviews & Approvals", 
      files: 19,
      description: "Contains peer review reports, code compliance checks, and final sign-offs.",
      recentFiles: ["Peer Review Report.pdf", "Fire Safety Approval.pdf"]
    },
    { 
      name: "Construction Handoff", 
      files: 1,
      description: "Contains the consolidated package issued for construction.",
      recentFiles: ["IFC Package V1.zip"]
    },
  ];

  const recentFiles = [
    { name: "Architectural Floor Plan.pdf", folder: "Architectural Drawings", version: "V4.0", updatedBy: "Olivia Thompson", status: "Approved" },
    { name: "Structural Design Report.pdf", folder: "Technical Reports", version: "V3.2", updatedBy: "Michael Adeyemi", status: "Under Review" },
    { name: "Electrical Layout.dwg", folder: "MEP Drawings", version: "V2.1", updatedBy: "James Ibrahim", status: "Approved" },
    { name: "Peer Review Report.pdf", folder: "Reviews & Approvals", version: "V1.0", updatedBy: "Sarah Williams", status: "Completed" },
  ];

  const recentUpdates = [
    "Architectural Package updated to V4.0",
    "Structural Drawings updated to V3.2",
    "BOQ Final approved",
    "Mechanical Layout revised",
    "Design Package issued for peer review"
  ];

  return (
    <div className="h-full flex flex-col pt-2 pb-12 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-[40px] font-bold text-[#022C4F] leading-tight mb-4">
            Project Explorer
          </h1>
          <p className="text-gray-600 text-[13px] leading-relaxed max-w-2xl">
            Browse and manage your project's complete file structure. Access drawings, documents, models, reports, reviews, and
            construction deliverables from a centralized workspace with version control and collaboration tools.
          </p>
        </div>

        <TopRightControls />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <Link href="/professional/dashboard/explorer/bim-data">
          <button className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-8 py-3 rounded-full font-medium transition-colors text-sm shadow-sm flex items-center gap-2">
            <Database size={16} /> BIM Data Explorer
          </button>
        </Link>
        <button 
          onClick={() => setIsIfcModalOpen(true)}
          className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-8 py-3 rounded-full font-medium transition-colors text-sm shadow-sm flex items-center gap-2"
        >
          <Box size={16} /> Manage IFC Models
        </button>
        <button 
          onClick={() => setIsCreateFolderOpen(true)}
          className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-12 py-3 rounded-full font-medium transition-colors text-sm shadow-sm"
        >
          Create Folder
        </button>
        <button 
          onClick={() => setIsUploadFileOpen(true)}
          className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-12 py-3 rounded-full font-medium transition-colors shadow-sm text-sm"
        >
          Upload File
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {metricCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-[20px] p-6 border border-gray-200 shadow-sm relative group cursor-pointer hover:border-[#022C4F]/30 transition-colors">
            <h3 className="text-gray-900 font-bold text-xs mb-4">{card.title}</h3>
            <p className="text-[#022C4F] font-extrabold text-[22px] leading-tight whitespace-pre-line">{card.value}</p>
            <div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-900 group-hover:bg-gray-50">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <h2 className="text-[#022C4F] font-bold text-[17px] mb-4">Search & Filters</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search files, folders, or document tags..."
            className="w-full h-12 bg-white rounded-full border border-gray-300 pl-14 pr-6 text-[15px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] focus:border-[#022C4F]"
          />
        </div>
        <div className="w-full md:w-[220px]">
          <div className="relative">
            <select defaultValue="" className="w-full h-12 bg-white rounded-full border border-gray-300 px-6 text-[15px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] focus:border-[#022C4F] cursor-pointer">
              <option value="" disabled>File Type</option>
              <option value="pdf">PDF</option>
              <option value="dwg">DWG</option>
              <option value="doc">Document</option>
            </select>
            <Settings2 className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {folders.map((folder, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedFolder(folder)}
            className="bg-white rounded-[24px] p-8 border border-gray-200 shadow-sm flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-[#022C4F]/30 transition-all"
          >
            <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
              <path d="M110 88H10C4.47715 88 0 83.5228 0 78V12C0 6.47715 4.47715 2 10 2H38.5C41.8142 2 44.9125 3.66601 46.7725 6.45598L53.2275 16.136C55.0875 18.926 58.1858 20.592 61.5 20.592H110C115.523 20.592 120 25.0691 120 30.592V78C120 83.5228 115.523 88 110 88Z" fill="#FDE047" />
              <path d="M115 88H15C9.47715 88 5 83.5228 5 78V25C5 19.4772 9.47715 15 15 15H115C120.523 15 125 19.4772 125 25V78C125 83.5228 120.523 88 115 88Z" fill="#FACC15" />
            </svg>
            <h3 className="text-[#022C4F] font-bold text-[17px] leading-tight mb-2 max-w-[180px]">{folder.name}</h3>
            <p className="text-gray-500 text-[15px]">{folder.files} Files</p>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Recent Files Table */}
        <div className="flex-1 bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[22px] font-bold text-[#022C4F]">Recent Files</h3>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
              <span className="text-xs font-bold cursor-pointer text-gray-500 hover:text-gray-800">{"<"}</span>
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#022C4F] shadow-sm">1</span>
              <span className="text-xs font-bold text-gray-400">...</span>
              <span className="text-xs font-bold cursor-pointer text-gray-500 hover:text-gray-800">{">"}</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="bg-[#022C4F] text-white">
                  <th className="py-4 px-6 rounded-l-2xl text-xs font-semibold w-1/4">File Name</th>
                  <th className="py-4 px-6 text-xs font-semibold w-1/4">Folder</th>
                  <th className="py-4 px-6 text-xs font-semibold">Version</th>
                  <th className="py-4 px-6 text-xs font-semibold">Updated By</th>
                  <th className="py-4 px-6 text-xs font-semibold">Status</th>
                  <th className="py-4 px-6 rounded-r-2xl text-xs font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentFiles.map((file, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-6 text-[13px] text-gray-800 font-medium">{file.name}</td>
                    <td className="py-5 px-6 text-[13px] text-gray-600">{file.folder}</td>
                    <td className="py-5 px-6 text-[13px] text-gray-600">{file.version}</td>
                    <td className="py-5 px-6 text-[13px] text-gray-600">{file.updatedBy}</td>
                    <td className="py-5 px-6 text-[13px] text-gray-600">{file.status}</td>
                    <td className="py-5 px-6 text-center">
                      <button className="text-gray-400 hover:text-gray-800 transition-colors">
                        <MoreHorizontal className="w-5 h-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="w-full lg:w-[400px] bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm flex flex-col">
          <h3 className="text-gray-500 text-[15px] mb-8 font-medium">Recent Updates</h3>

          <div className="flex-1 flex flex-col gap-6 mb-12">
            {recentUpdates.map((update, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-4 h-4 mt-1 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0L8.1822 5.09312L13.1788 3.51868L9.93291 7.753L13.1788 11.9873L8.1822 10.4129L7 15.506L5.8178 10.4129L0.821217 11.9873L4.06709 7.753L0.821217 3.51868L5.8178 5.09312L7 0Z" fill="#022C4F" />
                  </svg>
                </div>
                <p className="text-[14px] text-[#022C4F] font-medium leading-snug">{update}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between gap-3 mt-auto">
            <button className="flex-1 py-3 border border-gray-300 rounded-lg text-[8px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
              Compare Versions
            </button>
            <button className="flex-1 py-3 bg-[#022C4F] text-white rounded-lg text-[8px] font-bold hover:bg-[#033A6B] transition-colors">
              View History
            </button>
            <button className="flex-1 py-3 bg-[#111827] text-white rounded-lg text-[8px] font-bold hover:bg-[#1F2937] transition-colors whitespace-nowrap px-2">
              Restore Previous Version
            </button>
          </div>
        </div>
      </div>

      {/* Folder Details Modal */}
      <FolderDetailsModal 
        folder={selectedFolder} 
        onClose={() => setSelectedFolder(null)} 
        onOpenUploadFile={() => setIsUploadFileOpen(true)}
      />

      {/* Create Folder Modal (Side Drawer) */}
      <CreateFolderSideDrawer 
        isOpen={isCreateFolderOpen} 
        onClose={() => setIsCreateFolderOpen(false)} 
      />

      {/* Upload File Modal */}
      <UploadFileModal 
        isOpen={isUploadFileOpen}
        onClose={() => setIsUploadFileOpen(false)}
      />

      {/* IFC Manager Modal */}
      <IfcManagerModal
        isOpen={isIfcModalOpen}
        onClose={() => setIsIfcModalOpen(false)}
      />
    </div>
  );
}
