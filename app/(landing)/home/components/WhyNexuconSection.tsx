"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function WhyNexuconSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

        {/* Left Image Side */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 relative mt-8 lg:mt-0"
        >
          <div className="w-full h-full min-h-[400px] lg:min-h-0 relative">
            <div className="absolute inset-0 rounded-[2rem] shadow-xl overflow-hidden">
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/f_auto,q_auto/v1783902995/imagesidesection_wtddix.png"
                alt="Why Nexucon"
                fill
                className="object-cover z-0"
              />
              <div className="absolute inset-0 bg-[#0F181F]/30 z-10" />
            </div>

            {/* Floating Why Nexucon tag */}
            <div className="absolute top-0 right-2 sm:right-8 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#0F181F] text-[#ffffff] font-bold text-[9px] sm:text-[11px] uppercase tracking-widest shadow-2xl flex flex-col items-center justify-center gap-2 sm:gap-3">
              <span className="text-center leading-tight">Why<br />Nexucon</span>
            </div>
          </div>
        </motion.div>

        {/* Right Value Propositions Side */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
          className="lg:col-span-7 space-y-8"
        >

          {/* Feature 1 */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783902962/construction_1_jwvdkz.png"
              alt="Industry-Specific Marketplace Icon"
              width={48}
              height={48}
              className="w-12 h-12 flex-shrink-0 object-contain"
            />
            <div>
              <h4 className="text-lg font-bold text-[#0F181F]">Industry-Specific Marketplace</h4>
              <p className="text-sm text-[#0F181F]/70 mt-1">Unlike generic freelance platforms, Nexucon is purpose-built for construction workflows, documentation, and project coordination.</p>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783902945/medal_1_bdulps.png"
              alt="Vetted & Professional Crews Icon"
              width={48}
              height={48}
              className="w-12 h-12 flex-shrink-0 object-contain"
            />
            <div>
              <h4 className="text-lg font-bold text-[#0F181F]">Verified Professionals</h4>
              <p className="text-sm text-[#0F181F]/70 mt-1">Every contractor, consultant, and specialist undergoes identity and professional verification before onboarding.</p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783902963/credit-card_1_oxxeit.png"
              alt="Secure Milestone Payments Icon"
              width={48}
              height={48}
              className="w-12 h-12 flex-shrink-0 object-contain"
            />
            <div>
              <h4 className="text-lg font-bold text-[#0F181F]">Secure Milestone Payments</h4>
              <p className="text-sm text-[#0F181F]/70 mt-1">Escrow-backed payment protection ensures funds are only released upon approved project milestones.</p>
            </div>
          </motion.div>

          {/* Feature 4 */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783902963/innovation_1_ma1xfd.png"
              alt="Smart Project Matching Icon"
              width={48}
              height={48}
              className="w-12 h-12 flex-shrink-0 object-contain"
            />
            <div>
              <h4 className="text-lg font-bold text-[#0F181F]">Smart Project Matching</h4>
              <p className="text-sm text-[#0F181F]/70 mt-1">Clients are matched with qualified professionals based on expertise, location, certifications, and project scope.</p>
            </div>
          </motion.div>

          {/* Feature 5 */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783902962/compliant_1_sodsmx.png"
              alt="Compliance & Documentation Icon"
              width={48}
              height={48}
              className="w-12 h-12 flex-shrink-0 object-contain"
            />
            <div>
              <h4 className="text-lg font-bold text-[#0F181F]">Compliance & Documentation</h4>
              <p className="text-sm text-[#0F181F]/70 mt-1">Access standardized contract templates, compliance checklists, and project documentation to ensure quality execution.</p>
            </div>
          </motion.div>

          {/* Feature 6 */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783902946/support_1_d5qupq.png"
              alt="Community Rating System Icon"
              width={48}
              height={48}
              className="w-12 h-12 flex-shrink-0 object-contain"
            />
            <div>
              <h4 className="text-lg font-bold text-[#0F181F]">Dispute Resolution Support</h4>
              <p className="text-sm text-[#0F181F]/70 mt-1">Structured dispute workflows help resolve conflicts transparently and professionally</p>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
