'use client';

import React, { use } from 'react';
import { Search, Bell, FileText, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProfilePill from '@/components/ui/ProfilePill';

export default function RepositoryFolderPage({ params }: { params: Promise<{ folderId: string }> | { folderId: string } }) {
  const router = useRouter();
  
  // Handle Next.js 15+ dynamic params as promises or sync objects
  const resolvedParams = 'then' in params ? use(params as Promise<{ folderId: string }>) : params;
  const folderId = resolvedParams.folderId;

  // Format folder name from URL (e.g., "architectural-drawings" -> "Architectural Drawings")
  const formatFolderName = (id: string) => {
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const folderName = formatFolderName(folderId);

  const files = [
    { id: 1, title: 'Ground Floor Plan.pdf', desc: 'Detailed layout of the ground floor showing room arrangements, dimensions, entrances, circulation paths, and space allocations.' },
    { id: 2, title: 'First Floor Plan.pdf', desc: 'Illustrates the first-floor layout, including room configurations, their locations, balconies, and functional spaces.' },
    { id: 3, title: 'Roof Layout Plan.pdf', desc: 'Provides roof structure details, slopes, drainage points, roofing materials, and equipment placement locations.' },
    { id: 4, title: 'Building Elevations.pdf', desc: 'Shows the exterior appearance of the building from all sides, including finishes, heights, windows, doors, and architectural features.' },
    { id: 5, title: 'Building Sections.pdf', desc: 'Vertical cut-through views of the building highlighting floor-to-floor heights, structural elements, and internal relationships between spaces.' },
    { id: 6, title: 'Site Layout Plan.pdf', desc: 'Displays the overall project site, including building positioning, access roads, parking areas, landscaping, and utility connections.' },
    { id: 7, title: 'Door Schedule.pdf', desc: 'Comprehensive list of all doors within the project, including dimensions, materials, hardware specifications, and location references.' },
    { id: 8, title: 'Window Schedule.pdf', desc: 'Detailed inventory of window types, sizes, glazing specifications, materials, and installation locations throughout the project.' },
    { id: 9, title: 'Landscape Design Layout.pdf', desc: 'Presents landscaping elements such as green areas, walkways, outdoor amenities, planting zones, and site beautification features.' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-6">
        <div className="max-w-2xl">
          <h1 className="text-[32px] font-extrabold text-[#022C4F] mb-3 tracking-tight">Drawing Repository</h1>
          <p className="text-[12px] text-[#0F181F] font-medium leading-relaxed">
            Browse and manage all project drawings organized by discipline and folder structure. <br/>
            Access approved plans, active revisions, and technical documentation from a centralized repository.
          </p>
        </div>
        
        <div className="flex items-center gap-4 ml-auto shrink-0">
          {/* Search Icon */}
          <button className="w-12 h-12 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm">
            <Search size={20} />
          </button>

          {/* Notifications */}
          <button className="relative w-12 h-12 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#0F181F] rounded-full"></span>
          </button>

          {/* Profile Pill */}
          <ProfilePill />
        </div>
      </div>

      {/* Controls & Breadcrumbs Section */}
      <div className="flex flex-col items-start mb-8 gap-2">
        <h3 className="text-[20px] font-extrabold text-[#022C4F]">Project Drawing Files</h3>
        
        <div className="flex items-center text-[12px] font-bold text-[#022C4F]">
          <span 
            className="cursor-pointer hover:underline text-[#022C4F]"
            onClick={() => router.push('/client/drawings/repository')}
          >
            {folderName}
          </span>
          <ChevronRight size={14} className="mx-1" />
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <div 
            key={file.id} 
            className="bg-[#022C4F] rounded-2xl p-6 min-h-[160px] flex flex-col justify-between cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
          >
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-start relative z-10 mb-4">
              <FileText size={28} className="text-white/80 shrink-0" strokeWidth={1.5} />
            </div>
            
            <div className="relative z-10 mt-auto">
              <h4 className="text-[14px] font-extrabold text-white tracking-wide mb-2 leading-snug">{file.title}</h4>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{file.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
