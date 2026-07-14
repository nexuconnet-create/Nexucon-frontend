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
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function HowItWorksSection() {
  return (
    <section className="w-full bg-[#ffffff] border-t border-[#0F181F]/5 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F181F]">How Nexucon Works</h2>
          <div className="w-24 h-1 bg-[#022C4F] mx-auto mt-4" />
        </motion.div>

        {/* 4 Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1024px] mx-auto mb-4"
        >

          {/* Card 1 */}
          <motion.div variants={itemVariants} className="bg-[#022C4F] text-[#ffffff] p-6 sm:p-8  rounded-2xl transition-transform duration-300 hover:-translate-y-1 shadow-lg flex gap-4 sm:gap-6 items-center w-full max-w-[500px] h-auto sm:h-[234px] min-h-[234px] mx-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0  flex items-center justify-center p-3 relative">
              <Image src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783902863/Mask_group_gbpyni.png" alt="Post Your Project" fill sizes="64px" className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold mb-2 sm:mb-3">Post Your Project</h3>
              <p className="text-xs sm:text-sm text-[#ffffff]/80 leading-relaxed">Describe your construction project requirements, timelines, location, and budget using our AI-assisted project specification system.</p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="bg-[#0F181F] text-[#ffffff] p-6 sm:p-8 rounded-2xl transition-transform duration-300 hover:-translate-y-1 shadow-lg flex gap-4 sm:gap-6 items-center w-full max-w-[500px] h-auto sm:h-[234px] min-h-[234px] mx-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center p-3 relative">
              <Image src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783902876/Mask_group1_mbb92i.png" alt="Receive & Compare Bids" fill sizes="64px" className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold mb-2 sm:mb-3">Receive Competitive Bids</h3>
              <p className="text-xs sm:text-sm text-[#ffffff]/80 leading-relaxed">Verified professionals submit proposals, quotations, timelines, and technical approaches.</p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="bg-[#0F181F] text-[#ffffff] p-6 sm:p-8 rounded-3xl transition-transform duration-300 hover:-translate-y-1 shadow-lg flex gap-4 sm:gap-6 items-center w-full max-w-[500px] h-auto sm:h-[234px] min-h-[234px] mx-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0  flex items-center justify-center p-3 relative">
              <Image src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783904793/hire_pt0sfu.png" alt="Hire with Confidence" fill sizes="64px" className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Hire with Confidence</h3>
              <p className="text-xs sm:text-sm text-[#ffffff]/80 leading-relaxed">Review portfolios, certifications, ratings, and experience before selecting your preferred professional or team.</p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} className="bg-[#022C4F] text-[#ffffff] p-6 sm:p-8 rounded-3xl transition-transform duration-300 hover:-translate-y-1 shadow-lg flex gap-4 sm:gap-6 items-center w-full max-w-[500px] h-auto sm:h-[234px] min-h-[234px] mx-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center p-3 relative">
              <Image src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783904799/manage_progress_vlrvzt.png" alt="Manage & Track Progress" fill sizes="64px" className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Manage & Track Progress</h3>
              <p className="text-xs sm:text-sm text-[#ffffff]/80 leading-relaxed">Monitor milestones, approvals, documentation, communication, and payments from your dashboard.</p>
            </div>
          </motion.div>

        </motion.div>

        {/* 5th Centered Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-[#022C4F] text-[#ffffff] p-6 sm:p-8 rounded-3xl shadow-lg transition-transform duration-300 hover:-translate-y-1 flex gap-4 sm:gap-6 items-center text-left w-full max-w-[500px] h-auto sm:h-[234px] min-h-[234px] mx-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center p-3 relative">
              <Image src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783904816/payment_igqwqb.png" alt="Secure Payment Release " fill sizes="64px" className="object-contain" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Secure Payment Release</h3>
              <p className="text-xs sm:text-sm text-[#ffffff]/80 leading-relaxed">Funds are released securely based on completed and approved project milestones.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
