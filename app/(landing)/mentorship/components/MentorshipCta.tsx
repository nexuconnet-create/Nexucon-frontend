"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function MentorshipCta() {
  return (
    <section className="w-full bg-[#ffffff] py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto bg-[#0F181F] rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col items-center text-center py-24 px-6 sm:px-12"
      >
        
        {/* Content */}
        <div className="relative z-10 max-w-2xl flex flex-col items-center">
          <div className="inline-block bg-[#022C4F] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6">
            Join Us
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#ffffff] leading-tight mb-6">
            Invest in Your Professional Growth
          </h2>
          <p className="text-sm md:text-base text-[#ffffff]/80 leading-relaxed mb-10 max-w-xl font-medium">
            Whether you are looking to accelerate your career or share your expertise, Nexucon Mentorship provides the perfect platform to connect, grow, and succeed.
          </p>
          <button className="bg-[#022C4F] hover:bg-[#021c33] text-[#ffffff] text-[15px] font-bold px-12 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Get Started
          </button>
        </div>

        {/* Right Graphic Area (Abstract Architectural Lines) */}
        <div className="absolute right-0 bottom-0 w-[250px] md:w-[350px] lg:w-[450px] h-full pointer-events-none flex items-end justify-end">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1774500774/gaskia_logo-04_112538_1_1_ye9l2c.png"
            alt="Abstract architectural lines"
            width={500}
            height={500}
            className="w-full h-auto object-contain transform translate-x-[15%] translate-y-[20%] opacity-80"
          />
        </div>

      </motion.div>
    </section>
  );
}
