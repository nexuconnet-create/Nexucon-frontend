import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0F181F] text-[#ffffff] border-t border-[#ffffff]/10 pt-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 pb-16">

        {/* Col 1 Logo lockup */}
        <div className="lg:col-span-2 space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={200}
            height={55}
            className="h-14 w-auto object-contain brightness-0 invert"
          />
          <p className="text-[12px] text-[#ffffff]/60 max-w-xs leading-relaxed">
            Nexucon is a specialized construction management platform that connects project owners
            with verified contractors, engineers, architects, and construction professionals through a secure and streamlined
            hiring and contract management system tailored for the construction industry.
          </p>
        </div>

        {/* Col 2 - Platform */}
        <div className="space-y-6 text-center md:text-left">
          <span className="text-[18px] font-bold capitalize tracking-wider block mb-2 text-[#ffffff]">Platform</span>
          <ul className="space-y-4 text-[16px] text-[#ffffff]/70">
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">About Nexucon Mode</a></li>
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">How it works</a></li>
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">FAQs</a></li>
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">Contact Us</a></li>
          </ul>
        </div>

        {/* Col 3 - Professionals */}
        <div className="space-y-6 text-center md:text-left">
          <span className="text-[18px] font-bold capitalize tracking-wider block text-[#ffffff]">Professionals</span>
          <ul className="space-y-4 text-[16px] text-[#ffffff]/70">
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">Find Projects</a></li>
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">Verification Process</a></li>
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">Professional Categories</a></li>
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">Contractor Resources</a></li>
          </ul>
        </div>

        {/* Col 4 - Clients */}
        <div className="space-y-6 text-center md:text-left">
          <span className="text-[18px] font-bold capitalize tracking-wider block text-[#ffffff]">Clients</span>
          <ul className="space-y-4 text-[16px] text-[#ffffff]/70">
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">Post a Project</a></li>
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">Hire Professionals</a></li>
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">Payment Protection</a></li>
            <li><a href="#" className="hover:text-[#022C4F] transition-colors">Project Management</a></li>
          </ul>
        </div>

        {/* Col 5 - Legal */}
        <div className="space-y-6 text-center md:text-left">
          <span className="text-[18px] font-bold capitalize tracking-wider block text-[#ffffff]">Legal</span>
          <ul className="space-y-4 text-[16px] text-[#ffffff]/70">
            <li><Link href="/terms" className="hover:text-[#022C4F] transition-colors">Terms of Services</Link></li>
            <li><Link href="/privacy" className="hover:text-[#022C4F] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/compliance" className="hover:text-[#022C4F] transition-colors">Compliance & KYC</Link></li>
            <li><Link href="/dispute-resolution" className="hover:text-[#022C4F] transition-colors">Dispute Resolution</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright Section */}
      <div className="w-full bg-[#022C4F] overflow-x-hidden py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[#ffffff]/80">
          © {new Date().getFullYear()} Nexucon Ecosystem, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
