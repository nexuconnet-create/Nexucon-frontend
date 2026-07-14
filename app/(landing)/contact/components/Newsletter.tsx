"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Newsletter() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto bg-[#11181D] rounded-[2.5rem] overflow-hidden p-10 md:p-16 lg:p-20 flex flex-col md:flex-row gap-12 lg:gap-20 items-center shadow-2xl"
      >
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#ffffff] leading-tight mb-4">
            Subscribe to <br />
            our newsletter
          </h2>
          <p className="text-[#ffffff]/60 text-sm md:text-base leading-relaxed font-medium max-w-md">
            Stay updated with the latest construction industry insights, platform updates, project management tips, and opportunities from Nexucon.
          </p>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 flex flex-col">
          <label className="text-[#ffffff]/90 text-sm font-medium mb-3">
            Enter your email address
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              className="flex-grow bg-[#090D11] border border-[#ffffff]/10 rounded-xl px-5 py-4 text-[#ffffff] focus:outline-none focus:border-[#022C4F] transition-all"
              placeholder=""
            />
            <button className="bg-[#00386C] hover:bg-[#002a52] text-[#ffffff] px-8 py-4 rounded-xl font-medium transition-all whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-[#ffffff]/40 text-[11px] leading-relaxed mt-4 max-w-sm">
            Get access to industry trends, expert resources, product announcements, compliance updates, and professional opportunities delivered directly to your inbox.
          </p>
        </div>

      </motion.div>
    </section>
  );
}
