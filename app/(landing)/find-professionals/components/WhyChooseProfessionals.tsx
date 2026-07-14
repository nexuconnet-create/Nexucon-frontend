"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function WhyChooseProfessionals() {
  return (
    <section className="w-full bg-[#ffffff] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0F181F] max-w-sm leading-tight">
              Why Clients Choose Nexucon Professionals
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-[#0F181F] rounded-full flex items-center justify-center hidden sm:flex"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[600px]">

          {/* Left Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden shadow-xl group h-[400px] lg:h-full"
          >
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783979228/Mask_content_1_i8jfsx.png"
              alt="Verified Experts"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F181F]/90 via-[#0F181F]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Verified Experts</h3>
              <p className="text-white/80 text-[14px] leading-relaxed max-w-md">
                Every professional undergoes identity and qualification verification before joining the platform.
              </p>
            </div>
          </motion.div>

          {/* Right Smaller Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">

            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative rounded-3xl overflow-hidden shadow-lg group h-[250px] lg:h-auto"
            >
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783996214/transport_p5aldq.png"
                alt="Transparent Hiring"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F181F]/90 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h4 className="text-lg font-bold text-white mb-2">Transparent Hiring</h4>
                <p className="text-white/70 text-[12px] leading-relaxed">
                  Review portfolios, certifications, ratings, pricing, and project history before making hiring decisions.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden shadow-lg group h-[250px] lg:h-auto"
            >
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783979244/secure_collaboration_utinfk.png"
                alt="Secure Milestone Payments"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F181F]/90 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h4 className="text-lg font-bold text-white mb-2">Secure Collaboration</h4>
                <p className="text-white/70 text-[12px] leading-relaxed">
                  Manage communication, documentation, contracts, and project workflows from one centralized platform.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative rounded-3xl overflow-hidden shadow-lg group h-[250px] lg:h-auto"
            >
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783995985/escrow_rjl3yh.png"
                alt="Escrow Payment Protection"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F181F]/90 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h4 className="text-lg font-bold text-white mb-2">Escrow Payment Protection</h4>
                <p className="text-white/70 text-[12px] leading-relaxed">
                  Milestone-based escrow payments help improve transparency and reduce project risks.
                </p>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative rounded-3xl overflow-hidden shadow-lg group h-[250px] lg:h-auto"
            >
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783979291/project_wpl5fv.png"
                alt="Efficient Project Delivery"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F181F]/90 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h4 className="text-lg font-bold text-white mb-2">Efficient Project Delivery</h4>
                <p className="text-white/70 text-[12px] leading-relaxed">
                  Streamlined collaboration tools help improve accountability, coordination, and project execution.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
