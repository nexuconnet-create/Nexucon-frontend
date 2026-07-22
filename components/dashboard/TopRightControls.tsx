"use client";

import React, { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import NotificationCenterSideDrawer from './NotificationCenterSideDrawer';

export default function TopRightControls() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsNotificationOpen(true);
    window.addEventListener('open-notifications', handleOpen);
    return () => window.removeEventListener('open-notifications', handleOpen);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-4 shrink-0">
      <button className="w-12 h-12 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors">
        <Search size={20} />
      </button>
      <button 
        onClick={() => setIsNotificationOpen(true)}
        className="relative w-12 h-12 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors"
      >
        <Bell size={20} />
        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#022C4F] rounded-full animate-pulse"></span>
      </button>
      <div className="h-12 rounded-full border border-[#022C4F] flex items-center px-2 pr-6 gap-3 ml-2">
        <div className="w-8 h-8 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-xs font-bold">
          JD
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#0F181F] leading-tight">John Doe</span>
          <span className="text-[9px] text-gray-500 leading-tight">professional@nexucon.tech</span>
        </div>
      </div>

      <NotificationCenterSideDrawer 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </div>
  );
}
