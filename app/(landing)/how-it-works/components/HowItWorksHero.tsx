

"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HowItWorksHero() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <section
        className="relative w-full h-[540px] md:h-[620px] lg:h-[700px] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/f_auto,q_auto/v1783950514/Group_11_td0p7w.png')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Overlay for optimal readability strictly using brand dark #0F181F */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F181F]/90 via-[#0F181F]/50 to-[#022C4F]/30 z-10" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] z-10 opacity-30" />

        {/* Hero Content Area */}
        <div className="relative z-20 h-full w-full flex flex-col justify-center px-5 sm:px-10 md:px-16 lg:px-24 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            className="max-w-4xl space-y-4 sm:space-y-6"
          >

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-4xl font-bold tracking-tight text-[#ffffff] leading-tight sm:leading-[1.15] max-w-3xl drop-shadow-sm font-sans"
            >
              How Nexucon Works
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base md:text-xl text-[#ffffff]/90 leading-relaxed max-w-2xl drop-shadow-md font-sans"
            >
              A streamlined construction marketplace and contract management system designed to help project owners hire verified professionals, manage workflows, and deliver projects efficiently.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative max-w-xl pt-6"
            >
              <div className="flex items-center w-full bg-[#ffffff] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#ffffff]/20 backdrop-blur-sm">
                <input
                  type="text"
                  placeholder="Search for professionals..."
                  className="w-full h-14 px-6 text-[14px] text-[#0F181F] bg-transparent outline-none placeholder:text-[#0F181F]/40 font-medium"
                />
                <button className="flex items-center justify-center h-14 w-16 bg-[#ffffff] hover:bg-[#F4F4F4] transition-colors group">
                  <svg
                    className="w-5 h-5 text-[#0F181F] group-hover:scale-110 transition-transform"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </motion.div>

          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0F181F]/20 to-transparent pointer-events-none z-10" />
      </section>
    </div>
  );
}
