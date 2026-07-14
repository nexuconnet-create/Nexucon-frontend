"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function CtaSection() {
  return (
    <section className="w-full bg-[#ffffff] py-24 relative overflow-hidden">
      {/* Nexucon Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <Image
          src="https://res.cloudinary.com/depeqzb6z/image/upload/v1774500774/gaskia_logo-04_112538_1_1_ye9l2c.png"
          alt=""
          width={1000}
          height={400}
          className="w-[600px] md:w-[800px] lg:w-[1000px] opacity-5 select-none object-contain object-center"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: false, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-20 space-y-8"
      >

        {/* Tagline */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#022C4F] text-[#ffffff] text-xs font-bold uppercase tracking-widest">
          Nexucon
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0F181F] leading-tight">
          Start Managing Construction <br /> Projects the Smarter Way
        </h2>

        <p className="text-sm text-[#0F181F]/70 max-w-xl mx-auto leading-relaxed">
          Whether you’re building residential, commercial, or infrastructure projects, Nexucon gives you the tools to hire, manage, and deliver efficiently.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-[#022C4F] hover:bg-[#022C4F]/90 text-[#ffffff] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-98">
            Get Started Now
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-[#0F181F] hover:bg-[#0F181F]/90 text-[#ffffff] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-98">
            Become a Verified Professional
          </button>
        </div>

      </motion.div>

      {/* Floating Profiles Nodes (Decorative Figma Avatar bubbles) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-10 left-10 w-16 h-16 rounded-full overflow-hidden border-2 border-[#ffffff] shadow-lg hidden md:block animate-bounce" style={{ animationDuration: '6s' }}
      >
        <Image src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779947893/__2_1_yzvq59.png" alt="avatar" fill sizes="64px" className="object-cover" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute bottom-12 left-20 w-12 h-12 rounded-full overflow-hidden border-2 border-[#ffffff] shadow-lg hidden md:block animate-bounce" style={{ animationDuration: '8s' }}
      >
        <Image src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779947885/African_Civil_Engineer_at_Work_Site_1_jyjamp.png" alt="avatar" fill sizes="64px" className="object-cover" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute top-20 right-12 w-14 h-14 rounded-full overflow-hidden border-2 border-[#ffffff] shadow-lg hidden md:block animate-bounce" style={{ animationDuration: '7s' }}
      >
        <Image src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779947876/Contractor_Photos_-_Download_Free_High-Quality_Pictures___Freepik_1_hh2ith.png" alt="avatar" fill sizes="64px" className="object-cover" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-16 right-20 w-16 h-16 rounded-full overflow-hidden border-2 border-[#ffffff] shadow-lg hidden md:block animate-bounce" style={{ animationDuration: '9s' }}
      >
        <Image src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779947865/The_Diamondback_701_Tool_Vest_1_bibcvv.png" alt="avatar" fill sizes="64px" className="object-cover" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute top-1/2 left-32 -translate-y-1/2 w-14 h-14 rounded-full overflow-hidden border-2 border-[#ffffff] shadow-lg hidden md:block animate-bounce" style={{ animationDuration: '10s' }}
      >
        <Image src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779947865/Reinigungsfirma_Du%CC%88sseldorf_Verla%CC%88ssliche_Dienstleistungen_fu%CC%88r_jeden_Bedarf_1_elnjpc.png" alt="avatar" fill sizes="64px" className="object-cover" />
      </motion.div>
    </section>
  );
}
