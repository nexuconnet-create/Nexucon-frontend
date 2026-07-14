"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    title: "Centralized Project Management",
    desc: "Manage contracts, communication, documentation, and payments from one platform.",
    icon: (
      <svg className="w-6 h-6 text-[#ffffff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    )
  },
  {
    title: "Industry-Specific Workflows",
    desc: "Designed specifically for construction project operations and collaboration.",
    icon: (
      <svg className="w-6 h-6 text-[#ffffff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    title: "Verified Professionals",
    desc: "Hire trusted and credential-verified construction specialists.",
    icon: (
      <svg className="w-6 h-6 text-[#ffffff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  }
];

export default function WhyChoose() {
  return (
    <section className="w-full bg-[#ffffff] pt-16 relative z-0">
      <div className="w-full bg-[#0F181F] rounded-3xl max-w-[95%] mx-auto pb-48 pt-24 px-4 sm:px-6 lg:px-8 text-center shadow-2xl relative">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold text-[#ffffff] mb-16 tracking-tight"
        >
          Why Teams Choose Nexucon
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#022C4F] flex items-center justify-center mb-4 shadow-lg">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-[#ffffff]">
                {feature.title}
              </h3>
              <p className="text-[14px] text-[#ffffff]/60 leading-relaxed font-sans max-w-xs mx-auto">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Overlapping Image */}
      <div className="relative -mt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-8 border-[#ffffff]"
        >
          <div className="relative w-full h-full hover:scale-105 transition-transform duration-700">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783953596/Working_man_czijgp.png"
              alt="Construction worker"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
