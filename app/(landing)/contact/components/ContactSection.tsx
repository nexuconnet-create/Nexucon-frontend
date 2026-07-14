"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ContactSection() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">

        {/* Left Image Area */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 relative min-h-[500px] lg:min-h-[700px] rounded-[2rem] overflow-hidden shadow-xl"
        >
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784071166/Another_construction_2K_202605231845_1_up6xpt.png"
            alt="Construction Site Sunset"
            fill
            className="object-cover"
          />
        </motion.div>

        {/* Right Form Area */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full lg:w-1/2 flex flex-col justify-center py-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F181F] mb-4">
            Get in Touch
          </h1>
          <p className="text-[#0F181F]/70 text-lg mb-10 leading-relaxed font-medium">
            Whether you are a project owner looking to hire verified construction professionals or a professional seeking support with onboarding, Nexucon is available to assist you throughout your experience on the platform.
          </p>

          <form className="w-full flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-bold text-[#0F181F] mb-2">Name</label>
                <input
                  type="text"
                  className="w-full bg-[#E8ECEF] rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#022C4F] transition-all"
                  placeholder=""
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-bold text-[#0F181F] mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-[#E8ECEF] rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#022C4F] transition-all"
                  placeholder=""
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-[#0F181F] mb-2">Message</label>
              <textarea
                className="w-full bg-[#E8ECEF] rounded-xl px-4 py-4 h-48 resize-none focus:outline-none focus:ring-2 focus:ring-[#022C4F] transition-all"
                placeholder=""
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0F181F] hover:bg-[#1A2834] text-[#ffffff] font-bold text-[15px] py-4 rounded-xl transition-all shadow-md mt-4"
            >
              Send Message
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  );
}
