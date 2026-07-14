"use client";

import React from "react";
import { motion } from "framer-motion";

export default function FindProfessionalsCta() {
  return (
    <section className="w-full bg-[#ffffff] pb-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto bg-[#0F181F] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row items-center"
      >
        {/* Left Content */}
        <div className="flex-1 p-10 md:p-16 lg:p-20 relative z-10 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#ffffff] leading-tight mb-6 max-w-lg">
            Hire Trusted Construction Professionals Today
          </h2>
          <p className="text-[#ffffff]/80 text-[14px] leading-relaxed mb-8 max-w-md">
            Find experienced and verified construction experts for residential, commercial, and infrastructure projects through Nexucon.
          </p>
          <button className="bg-[#022C4F] hover:bg-[#021c33] text-[#ffffff] text-[14px] font-bold px-10 py-4 rounded-xl transition-all shadow-lg hover:-translate-y-1">
            Get Started
          </button>
        </div>

        {/* Right Graphic Area (Blue Circle) */}
        <div className="absolute right-0 bottom-0 md:top-1/2 md:-translate-y-1/2 w-64 h-64 md:w-96 md:h-96 transform translate-x-1/4 translate-y-1/4 md:translate-y-0 opacity-80 pointer-events-none">
          <div className="w-full h-full bg-[#022C4F] rounded-full blur-sm" />
        </div>
      </motion.div>
    </section>
  );
}
