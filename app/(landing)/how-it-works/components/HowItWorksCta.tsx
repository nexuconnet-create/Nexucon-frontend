"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuthModal } from "@/components/AuthModalContext";

export default function HowItWorksCta() {
  const { openAuthModal } = useAuthModal();
  return (
    <section className="w-full bg-[#ffffff] pb-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto bg-[#022C4F] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row items-center"
      >

        {/* Left Content */}
        <div className="flex-1 p-10 md:p-16 lg:p-20 relative z-10 text-center md:text-left">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-[#0F181F] leading-tight mb-6">
            Transform the Way You <br className="hidden md:block" /> Manage Construction Projects
          </h2>
          <p className="text-base md:text-lg text-[#ffffff]/90 leading-relaxed mb-8 max-w-2xl">
            Simplify hiring, project coordination, compliance, and payments with a platform built specifically for the construction industry.
          </p>
          <button 
            onClick={() => openAuthModal("register")}
            className="bg-[#0F181F] hover:bg-[#1a2530] text-[#ffffff] text-[14px] font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Join Nexucon Today
          </button>
        </div>

        {/* Right Graphic Area (Abstract Architectural Lines) */}
        <div className="w-full md:w-2/5 h-64 md:h-full relative overflow-hidden flex items-end justify-end opacity-40 md:opacity-100">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1774500774/gaskia_logo-04_112538_1_1_ye9l2c.png"
            alt="Watermark icon"
            width={500}
            height={500}
            className="w-full h-full max-w-[550px] object-cover transform translate-x-1/4 translate-y-1/4 opacity-60"
          />
        </div>
      </motion.div>
    </section>
  );
}
