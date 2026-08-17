'use client';

import React from 'react';

import { useAuth } from '@/context/AuthContext';

interface ProfilePillProps {
  className?: string;
}

export default function ProfilePill({ className = '' }: ProfilePillProps) {
  const { user } = useAuth();

  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-full border border-[#022C4F] bg-white cursor-pointer hover:bg-gray-50 transition-colors shrink-0 min-w-[200px] ${className}`}>
      <div className="w-8 h-8 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-[10px] font-bold shrink-0 uppercase">
        {user ? (user.first_name?.[0] || user.email?.[0] || 'U') : 'U'}
      </div>
      <div className="flex flex-col justify-center items-start">
        <span className="text-[11px] font-bold text-[#0F181F] leading-tight">
          {user ? `${user.first_name} ${user.last_name}`.trim() || user.email : 'Loading...'}
        </span>
        <span className="text-[9px] font-medium text-[#0F181F] leading-tight mt-0.5">
          {user ? user.email : '...'}
        </span>
      </div>
    </div>
  );
}
