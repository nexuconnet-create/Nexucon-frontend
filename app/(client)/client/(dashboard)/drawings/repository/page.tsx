'use client';

import React, { useState } from 'react';
import { Search, Bell, MoreVertical, Compass, Box, Zap, PenTool, Droplets, Trees, Flame, HardHat } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UploadFolderModal from '@/components/dashboard/UploadFolderModal';
import CreateFolderModal from '@/components/dashboard/CreateFolderModal';
import Button from '@/components/ui/Button';

export default function DrawingRepositoryPage() {
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const folders = [
    { id: 1, title: 'Architectural Drawings', files: 18, icon: Compass },
    { id: 2, title: 'Structural Drawings', files: 15, icon: Box },
    { id: 3, title: 'Electrical Drawings', files: 12, icon: Zap },
    { id: 4, title: 'Mechanical Drawings', files: 10, icon: PenTool },
    { id: 5, title: 'Plumbing Drawings', files: 11, icon: Droplets },
    { id: 6, title: 'Landscape & External Works', files: 8, icon: Trees },
    { id: 7, title: 'Fire & Safety Drawings', files: 10, icon: Flame },
    { id: 8, title: 'Approved Construction Package', files: 24, icon: HardHat },
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

          {/* User Profile Pill */}
          <button className="flex items-center gap-3 pl-2 pr-6 py-1.5 rounded-full border border-[#022C4F] hover:bg-gray-50 transition-colors shadow-sm bg-white">
            <div className="w-9 h-9 rounded-full bg-[#022C4F] flex items-center justify-center text-white text-[12px] font-bold tracking-wider shrink-0">
              JD
            </div>
            <div className="flex flex-col items-start justify-center">
              <span className="text-[12px] font-bold text-[#0F181F] leading-tight">John Doe</span>
              <span className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5">client@nexucon.tech</span>
            </div>
          </button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h3 className="text-[20px] font-extrabold text-[#022C4F]">Project Drawing Folders</h3>
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Folder
          </Button>
          <Button 
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Folder
          </Button>
        </div>
      </div>

      {/* Folder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => {
          const Icon = folder.icon;
          const slug = folder.title.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
          return (
            <div 
              key={folder.id} 
              onClick={() => router.push(`/client/drawings/repository/${slug}`)}
              className="bg-[#022C4F] rounded-3xl p-6 min-h-[180px] flex flex-col justify-between cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
            >
              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#011B33] flex items-center justify-center shadow-inner">
                  <Icon size={20} className="text-[#FFD54F]" />
                </div>
                <button className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <div className="relative z-10 mt-6">
                <h4 className="text-[16px] font-extrabold text-white tracking-wide mb-1.5">{folder.title}</h4>
                <p className="text-[11px] text-gray-400 font-medium tracking-wider uppercase">{folder.files} Files</p>
              </div>
            </div>
          );
        })}
      </div>

      <UploadFolderModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      <CreateFolderModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
