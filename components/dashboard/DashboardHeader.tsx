"use client";

import React from "react";
import { Bell, Search, Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-30 transition-all duration-300">
      
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-4 lg:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-[#0F181F] transition-colors"
        >
          <Menu size={24} />
        </button>
        {/* Mobile Logo */}
        <Image
          src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
          alt="Nexucon Logo"
          width={120}
          height={36}
          priority
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Search Bar - Hidden on small mobile */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-0">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search projects, professionals..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 ml-auto">
        {/* Notifications */}
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Action executed successfully!', type: 'success' } })); }} className="relative p-2.5 rounded-full text-gray-500 hover:bg-gray-50 hover:text-[#0F181F] transition-all duration-300 hover:scale-105">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        {/* User Profile */}
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Action executed successfully!', type: 'success' } })); }} className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 bg-white group">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-blue-100 border-2 border-white shadow-sm">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg"
              alt="Profile"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-[#0F181F] leading-none mb-1">John Doe</p>
            <p className="text-[11px] font-medium text-gray-500 leading-none">Client Account</p>
          </div>
        </button>
      </div>
    </header>
  );
}
