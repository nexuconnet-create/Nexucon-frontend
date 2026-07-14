"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function PostProjectConfidence() {
  return (
    <section className="w-full bg-[#ffffff] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Floating Images Container */}
        <div className="relative flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px]">

          {/* Top Left Image */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: -20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block absolute left-0 top-0 w-56 h-56 rounded-2xl overflow-hidden shadow-lg"
          >
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784014433/sectionpicture_ijmllf.png"
              alt="Team reviewing plans"
              fill
              sizes="(max-width: 1024px) 100vw, 250px"
              className="object-cover"
              unoptimized
            />
          </motion.div>

          {/* Center Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center z-10 bg-white/80 backdrop-blur-sm p-4 rounded-3xl"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0F181F] mb-6">
              Start Your Project With Confidence
            </h2>
            <p className="text-sm md:text-base text-[#0F181F]/70 leading-relaxed mb-6 font-medium">
              Nexucon simplifies the process of hiring construction professionals by allowing clients to post detailed project requirements, receive bids from verified experts, and manage contracts, milestones, payments, and communication in one centralized platform.
            </p>
            <p className="text-sm md:text-base text-[#0F181F]/70 leading-relaxed font-medium">
              Whether you are planning residential, commercial, renovation, or infrastructure projects, Nexucon helps streamline project coordination from start to finish.
            </p>
          </motion.div>

          {/* Bottom Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block absolute right-0 -bottom-10 w-56 h-56 rounded-2xl overflow-hidden shadow-lg"
          >
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784014434/sectionpicture2_blphsg.png"
              alt="Professionals looking at blueprint"
              fill
              sizes="(max-width: 1024px) 100vw, 220px"
              className="object-cover"
              unoptimized
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
