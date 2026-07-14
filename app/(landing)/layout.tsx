import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff] text-[#0F181F]">
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
      <CookieBanner />
    </div>
  );
}
