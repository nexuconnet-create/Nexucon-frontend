"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/home" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "Find Professionals", href: "/find-professionals" },
  { name: "Post a Project", href: "/post-project" },
  { name: "Mentorship", href: "/mentorship" },
  { name: "Contact Us", href: "/contact" }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="w-full bg-[#ffffff] py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* LOGO */}
        <Link href="/home" className="flex items-center group">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={200}
            height={60}
            priority
            className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative group text-xs font-semibold capitalize tracking-wider transition-colors py-1 ${isActive ? "text-[#022C4F]" : "text-[#0F181F]/70 hover:text-[#022C4F]"
                  }`}
              >
                {link.name}
                {/* Active Indicator Underline */}
                <span
                  className={`absolute left-0 bottom-0 h-[2px] bg-[#022C4F] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                />
              </Link>
            );
          })}
        </div>

        {/* DESKTOP CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/professionals"
            className="w-[150px] h-[50px] flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-[#ffffff] bg-[#0F181F] rounded-lg transition-all duration-200 hover:bg-[#0F181F]/90 hover:shadow-md active:scale-95 text-center leading-none"
          >
            Find Professionals
          </Link>
          <Link
            href="/register"
            className="w-[150px] h-[50px] flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-[#ffffff] bg-[#022C4F] rounded-lg transition-all duration-200 hover:bg-[#022C4F]/90 hover:shadow-md active:scale-95 text-center leading-none"
          >
            Get Started
          </Link>
          {/* <Link
            href="/register"
            className="w-[150px] h-[50px] flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-[#022C4F] border border-[#022C4F] bg-transparent rounded-lg transition-all duration-200 hover:bg-[#022C4F]/5 hover:shadow-md active:scale-95 text-center leading-none"
          >
            Get Started
          </Link> */}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-lg text-[#0F181F] hover:bg-[#0F181F]/5 transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      </div>

      {/* MOBILE NAV DRAWER */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-[#0F181F]/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`lg:hidden fixed top-0 right-0 z-50 w-4/5 max-w-sm h-full bg-[#ffffff] shadow-2xl p-6 flex flex-col justify-between transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div>
          {/* Header of Mobile Menu */}
          <div className="flex items-center justify-between pb-6 border-b border-[#0F181F]/10">
            <div className="flex items-center">
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                alt="Nexucon Logo"
                width={180}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-[#0F181F] hover:bg-[#0F181F]/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2 py-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold uppercase tracking-wider py-3 transition-all duration-200 ${isActive
                    ? "text-[#022C4F] border-l-[3px] border-[#022C4F] pl-3 bg-blue-50/50"
                    : "text-[#0F181F]/70 hover:text-[#022C4F] hover:bg-gray-50 pl-4"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Buttons in Mobile Menu */}
        <div className="flex flex-col gap-3 pt-6 border-t border-[#0F181F]/10">
          <Link
            href="/professionals"
            className="w-full py-3 text-center text-sm font-bold text-[#ffffff] bg-[#0F181F] rounded-xl transition-all hover:bg-[#0F181F]/90"
          >
            Find Professionals
          </Link>
          <Link
            href="/register"
            className="w-full py-3 text-center text-sm font-bold text-[#ffffff] bg-[#022C4F] rounded-xl transition-all hover:bg-[#022C4F]/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
