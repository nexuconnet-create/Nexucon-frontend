"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ModernDelivery() {
  return (
    <section className="w-full bg-[#ffffff] py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0F181F] leading-tight tracking-tight">
              Built for Modern <span className="text-[#022C4F]">Construction</span> Project Delivery
            </h2>
            <div className="space-y-4 text-[14px] text-[#0F181F]/70 leading-relaxed font-sans">
              <p>
                Nexucon simplifies the entire construction project lifecycle — from posting project requirements and hiring verified professionals to managing contracts, approvals, documentation, and milestone payments within one centralized platform.
              </p>
              <p>
                Whether you are managing residential, commercial, or infrastructure projects, the platform provides the tools needed for transparent collaboration, secure transactions, and efficient project execution.
              </p>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783952869/workers_y2odsi.png"
              alt="Modern Construction Project Delivery"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center hover:scale-105 transition-transform duration-700"
            />
            {/* Subtle overlay for better blending */}
            <div className="absolute inset-0 bg-[#0F181F]/10 pointer-events-none" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
