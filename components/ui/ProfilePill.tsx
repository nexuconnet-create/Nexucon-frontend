'use client';

import React from 'react';

interface ProfilePillProps {
  className?: string;
}

export default function ProfilePill({ className = '' }: ProfilePillProps) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-full border border-[#022C4F] bg-white cursor-pointer hover:bg-gray-50 transition-colors shrink-0 min-w-[200px] ${className}`}>
      <div className="w-8 h-8 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
        JD
      </div>
      <div className="flex flex-col justify-center items-start">
        <span className="text-[11px] font-bold text-[#0F181F] leading-tight">John Doe</span>
        <span className="text-[9px] font-medium text-[#0F181F] leading-tight mt-0.5">client@nexucon.tech</span>
      </div>
    </div>
  );
}
