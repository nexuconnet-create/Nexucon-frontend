"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';

export const LandingPageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() || '';
  const [isPtpHost, setIsPtpHost] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.host;
      if (h.startsWith('ptp.') || h.includes('ptp.localhost') || h.includes('ptp-')) {
        setIsPtpHost(true);
      }
    }
  }, []);

  const isTransparencyRoute = pathname.startsWith('/transparency') || isPtpHost;

  if (isTransparencyRoute) {
    return (
      <div className="flex flex-col min-h-screen bg-[#ffffff] text-[#0F181F]">
        <div className="flex-grow">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff] text-[#0F181F]">
      <Navbar />
      <div className="flex-grow">{children}</div>
      <Footer />
      <CookieBanner />
    </div>
  );
};
