"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ServicesSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-50px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center"
      >

        {/* Service 1 */}
        <motion.div variants={itemVariants} className="flex flex-col items-center p-4 rounded-2xl hover:bg-[#0F181F]/5 transition-all duration-200 group">
          <div className="w-12 h-12  flex items-center justify-center  mb-3 group-hover:scale-110 transition-transform overflow-hidden">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783936413/icon_construction_pq2r0z.png"
              alt="Construction Icon"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
          <span className="text-xs font-bold capitalize tracking-wider text-[#0F181F]/80">Verified Construction Experts</span>
        </motion.div>

        {/* Service 2 */}
        <motion.div variants={itemVariants} className="flex flex-col items-center p-4 rounded-2xl hover:bg-[#0F181F]/5 transition-all duration-200 group">
          <div className="w-12 h-12  flex items-center justify-center  mb-3 group-hover:scale-110 transition-transform overflow-hidden">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783936201/mortgage-cheque_1_obnlmk.png"
              alt="Payment Icon"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
          <span className="text-xs font-bold capitalize tracking-wider text-[#0F181F]/80">Escrow-Protected Payments</span>
        </motion.div>

        {/* Service 3 */}
        <motion.div variants={itemVariants} className="flex flex-col items-center p-4 rounded-2xl hover:bg-[#0F181F]/5 transition-all duration-200 group">
          <div className="w-12 h-12  flex items-center justify-center  mb-3 group-hover:scale-110 transition-transform overflow-hidden">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783936440/workflow_1_w4sejg.png"
              alt="Project Icon"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
          <span className="text-xs font-bold capitalize tracking-wider text-[#0F181F]/80">Transparent Project Workflows</span>
        </motion.div>

        {/* Service 4 */}
        <motion.div variants={itemVariants} className="flex flex-col items-center p-4 rounded-2xl hover:bg-[#0F181F]/5 transition-all duration-200 group">
          <div className="w-12 h-12  flex items-center justify-center  mb-3 group-hover:scale-110 transition-transform overflow-hidden">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783936707/file_1_nkp4ex.png"
              alt="Project Icon"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
          <span className="text-xs font-bold capitalize tracking-wider text-[#0F181F]/80">Compliance & Documentation Support</span>
        </motion.div>

        {/* Service 5 */}
        <motion.div variants={itemVariants} className="flex flex-col items-center p-4 rounded-2xl hover:bg-[#0F181F]/5 transition-all duration-200 group">
          <div className="w-12 h-12  flex items-center justify-center  mb-3 group-hover:scale-110 transition-transform overflow-hidden">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783936131/brain_1_b7aekh.png"
              alt="Project Icon"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
          <span className="text-xs font-bold capitalize tracking-wider text-[#0F181F]/80">AI-Assisted Project Specifications</span>
        </motion.div>

        {/* Service 6 */}
        <motion.div variants={itemVariants} className="flex flex-col items-center p-4 rounded-2xl hover:bg-[#0F181F]/5 transition-all duration-200 group">
          <div className="w-12 h-12  flex items-center justify-center  mb-3 group-hover:scale-110 transition-transform overflow-hidden">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783936185/deal_1_deuirr.png"
              alt="Project Icon"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
          <span className="text-xs font-bold capitalize tracking-wider text-[#0F181F]/80">Real-Time Collaboration & Reporting</span>
        </motion.div>

      </motion.div>
    </section>
  );
}
