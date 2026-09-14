"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ArrowUpRight, Folder, MoreHorizontal, Settings2, X, Box, Database } from "lucide-react";
import TopRightControls from "@/components/dashboard/TopRightControls";
import Link from "next/link";
import FolderDetailsModal from "@/components/dashboard/FolderDetailsModal";
import CreateFolderSideDrawer from "@/components/dashboard/CreateFolderSideDrawer";
import UploadFileModal from "@/components/dashboard/UploadFileModal";
import IfcManagerModal from "@/components/dashboard/IfcManagerModal";
import { getProjects, Project } from "@/services/projects";
import { getDocuments, getDocumentFolders, Document, DocumentFolder } from "@/services/documents";

const formatStatus = (status?: string): string => {
  if (!status) return "—";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function ProjectExplorer() {
  const [fileType, setFileType] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [isIfcModalOpen, setIsIfcModalOpen] = useState(false);

  // Real data: the professional's latest project, their document records, and
  // their document folders. Nothing is pre-populated — honest empty states
  // render until real records exist.
  const [latestProject, setLatestProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      getProjects().catch(() => [] as Project[]),
      getDocuments().catch(() => [] as Document[]),
      getDocumentFolders().catch(() => [] as DocumentFolder[]),
    ]).then(([projects, docs, folderRows]) => {
      if (cancelled) return;
      const latest = [...projects].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      )[0];
      setLatestProject(latest ?? null);
      setDocuments(
        [...docs].sort(
          (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        )
      );
      setFolders(folderRows);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const metricCards = [
    { title: "Project", value: latestProject ? latestProject.name : "No project\nrecorded yet" },
    { title: "Project Phase", value: latestProject ? formatStatus(latestProject.status) : "—" },
    { title: "Total Files", value: isLoading ? "—" : String(documents.length) },
    { title: "Folders", value: isLoading ? "—" : String(folders.length) },
  ];

  // The most recent real documents on record.
  const recentFiles = documents.slice(0, 6);

  // Recent updates derived from the real document records (who uploaded what).
  const recentUpdates = documents.slice(0, 5).map((d) => {
    const who = d.uploader_name ? `${d.uploader_name} uploaded ` : "";
    const version = d.current_version ? ` (${d.current_version})` : "";
    return `${who}${d.title}${version}`;
  });

  const openFolderDetails = (folder: DocumentFolder) => {
    const folderDocs = documents
      .filter((d) => d.folder === folder.name)
      .slice(0, 3)
      .map((d) => d.title);
    setSelectedFolder({
      name: folder.name,
      files: folder.files_count,
      description:
        folder.files_count === 0
          ? "No files recorded in this folder yet."
          : "Recent files recorded in this folder.",
      recentFiles: folderDocs,
    });
  };

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
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-[13px] text-gray-400 font-medium">Loading folders...</div>
        ) : folders.length === 0 ? (
          <div className="col-span-full bg-white rounded-[24px] border border-dashed border-gray-300 p-12 flex flex-col items-center text-center gap-3">
            <Folder className="w-8 h-8 text-gray-300" />
            <p className="text-[14px] font-bold text-[#022C4F]">No folders recorded yet</p>
            <p className="text-[12px] text-gray-500 max-w-[380px]">
              Folders you create for your project documents will appear here.
            </p>
          </div>
        ) : (
          folders.map((folder, idx) => (
            <div
              key={folder.id ?? idx}
              onClick={() => openFolderDetails(folder)}
              className="bg-white rounded-[24px] p-8 border border-gray-200 shadow-sm flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-[#022C4F]/30 transition-all"
            >
              <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
                <path d="M110 88H10C4.47715 88 0 83.5228 0 78V12C0 6.47715 4.47715 2 10 2H38.5C41.8142 2 44.9125 3.66601 46.7725 6.45598L53.2275 16.136C55.0875 18.926 58.1858 20.592 61.5 20.592H110C115.523 20.592 120 25.0691 120 30.592V78C120 83.5228 115.523 88 110 88Z" fill="#FDE047" />
                <path d="M115 88H15C9.47715 88 5 83.5228 5 78V25C5 19.4772 9.47715 15 15 15H115C120.523 15 125 19.4772 125 25V78C125 83.5228 120.523 88 115 88Z" fill="#FACC15" />
              </svg>
              <h3 className="text-[#022C4F] font-bold text-[17px] leading-tight mb-2 max-w-[180px]">{folder.name}</h3>
              <p className="text-gray-500 text-[15px]">{folder.files_count} Files</p>
            </div>
          ))
        )}
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center text-[13px] text-gray-400 font-medium">Loading files...</td>
                  </tr>
                ) : recentFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center text-[13px] text-gray-500 font-medium">No files recorded yet</td>
                  </tr>
                ) : (
                  recentFiles.map((file, idx) => (
                    <tr key={file.id ?? idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-6 text-[13px] text-gray-800 font-medium">{file.title || "—"}</td>
                      <td className="py-5 px-6 text-[13px] text-gray-600">{file.folder || "—"}</td>
                      <td className="py-5 px-6 text-[13px] text-gray-600">{file.current_version || "—"}</td>
                      <td className="py-5 px-6 text-[13px] text-gray-600">{file.uploader_name || "—"}</td>
                      <td className="py-5 px-6 text-[13px] text-gray-600">{formatStatus(file.status)}</td>
                      <td className="py-5 px-6 text-center">
                        <button className="text-gray-400 hover:text-gray-800 transition-colors">
                          <MoreHorizontal className="w-5 h-5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="w-full lg:w-[400px] bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm flex flex-col">
          <h3 className="text-gray-500 text-[15px] mb-8 font-medium">Recent Updates</h3>

          <div className="flex-1 flex flex-col gap-6 mb-12">
            {isLoading ? (
              <p className="text-[13px] text-gray-400 font-medium">Loading updates...</p>
            ) : recentUpdates.length === 0 ? (
              <p className="text-[13px] text-gray-500 font-medium">No updates recorded yet</p>
            ) : (
              recentUpdates.map((update, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-4 h-4 mt-1 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 0L8.1822 5.09312L13.1788 3.51868L9.93291 7.753L13.1788 11.9873L8.1822 10.4129L7 15.506L5.8178 10.4129L0.821217 11.9873L4.06709 7.753L0.821217 3.51868L5.8178 5.09312L7 0Z" fill="#022C4F" />
                    </svg>
                  </div>
                  <p className="text-[14px] text-[#022C4F] font-medium leading-snug">{update}</p>
                </div>
              ))
            )}
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
