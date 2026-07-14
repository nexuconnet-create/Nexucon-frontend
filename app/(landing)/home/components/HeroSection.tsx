"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <section
        className="relative w-full h-[540px] md:h-[620px] lg:h-[700px] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500"
      >
        {/* Background Image using next/image */}
        <Image
          src="https://res.cloudinary.com/depeqzb6z/image/upload/f_auto,q_auto/v1779868806/Make_it_look_like_an_202605192308_1_rdayse.png"
          alt="Hero Background"
          fill
          priority
          className="object-cover z-0"
        />

        {/* Overlay for optimal readability strictly using brand dark #0F181F */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F181F]/90 via-[#0F181F]/50 to-transparent z-10" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] z-10 opacity-30" />

        {/* Hero Content Area */}
        <div className="relative z-20 h-full w-full flex flex-col justify-center px-5 sm:px-10 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            className="max-w-4xl space-y-4 sm:space-y-6"
          >

            {/* Main Headline (matches Figma artboard in pure white) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-4xl font-bold tracking-tight text-[#ffffff] leading-tight sm:leading-[1.15] max-w-3xl drop-shadow-sm font-sans"
            >
              Build With Verified Construction Professionals
            </motion.h1>

            {/* Responsive descriptive subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base md:text-xl text-[#ffffff]/90 leading-relaxed max-w-2xl drop-shadow-md"
            >
              Nexucon connects project owners with trusted contractors, engineers, architects, and construction specialists through a secure contract management and hiring platform built specifically for the construction industry.
            </motion.p>

            {/* Hero Call-to-Actions (matches Figma button layout) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6"
            >

              {/* Post a Project Button (glassmorphic dark #0F181F variant) */}
              <button className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-[#ffffff] bg-[#0F181F]/80 hover:bg-[#0F181F] border border-[#ffffff]/15 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:scale-98 text-center flex items-center justify-center gap-2 group backdrop-blur-md">
                Post a Project
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {/* Find Construction Professionals Button (Solid brand blue #022C4F) */}
              <button className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-[#ffffff] bg-[#022C4F] hover:bg-[#022C4F]/90 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:scale-98 text-center flex items-center justify-center gap-2 group">
                Find Construction Professionals
                <svg
                  className="w-4 h-4 text-[#ffffff] transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

            </motion.div>

          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0F181F]/20 to-transparent pointer-events-none z-10" />
      </section>
    </div>
  );
}
