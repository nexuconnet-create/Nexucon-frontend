"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PostProjectHero() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">
      <section
        className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784014356/herosection_zqhhkc.png')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F181F]/90 via-[#0F181F]/60 to-[#0F181F]/20 z-10" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] z-10 opacity-30" />

        {/* Content Area */}
        <div className="relative z-20 h-full w-full flex flex-col justify-center px-5 sm:px-10 md:px-16 lg:px-24 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            className="max-w-3xl space-y-4 sm:space-y-6"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#ffffff] leading-tight max-w-2xl font-sans"
            >
              Post Your <br className="hidden sm:block" /> Construction Project
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-[#ffffff]/90 leading-relaxed max-w-2xl font-sans"
            >
              Find the right professionals and contractors for your next build. Describe your project requirements, post your job, and let our verified contractors and engineers submit competitive proposals.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
            >
              <button className="w-full sm:w-auto px-8 py-4 text-[14px] font-bold text-[#ffffff] bg-[#0F181F] hover:bg-[#0F181F]/90 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 text-center flex items-center justify-center">
                Post a Project
              </button>

              <button className="w-full sm:w-auto px-8 py-4 text-[14px] font-bold text-[#ffffff] bg-[#022C4F] hover:bg-[#022C4F]/90 border border-[#022C4F] rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 text-center flex items-center justify-center">
                How it Works
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
