"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function SecurePaymentsSection() {
  return (
    <section
      className="w-full py-16 lg:py-24 relative z-10 overflow-hidden bg-cover bg-center text-[#ffffff]"
    >
      <Image
        src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779946280/__1_1_yl2uli.png"
        alt="Secure Payments Background"
        fill
        className="object-cover z-0"
      />
      {/* Strict Brand Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F181F]/95 via-[#022C4F]/90 to-[#0F181F]/90 z-10" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0F181F] leading-tight">
              Secure Payments. <br /> Transparent Contracts
            </h2>
            <p className="text-base text-[#ffffff]/90 max-w-lg leading-relaxed font-sans">
              Nexucon protects both clients and professionals through milestone-based escrow payments, identity verification, audit logs, and structured approval workflows.
            </p>
          </motion.div>

          {/* Right Column Stack (Staggered offset cards matching the mockup) */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            className="flex flex-col items-stretch lg:items-end space-y-4 w-full"
          >
            {[
              { text: "Escrow-backed milestone payments", color: "bg-[#0F181F]/90", offset: "lg:-translate-x-12" },
              { text: "KYC & identity verification", color: "bg-[#022C4F]/95", offset: "lg:-translate-x-32" },
              { text: "Role-based access control", color: "bg-[#0F181F]/90", offset: "lg:-translate-x-20" },
              { text: "Activity audit trails", color: "bg-[#022C4F]/95", offset: "lg:-translate-x-36" },
              { text: "Contract and invoice management", color: "bg-[#0F181F]/90", offset: "lg:-translate-x-16" },
              { text: "Secure document storage", color: "bg-[#022C4F]/95", offset: "lg:-translate-x-24" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`p-4 px-6 rounded-2xl ${item.color} ${item.offset} border border-[#ffffff]/15 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-102 flex items-center gap-4 cursor-pointer group w-full lg:w-fit`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffffff] group-hover:scale-125 transition-transform" />
                <span className="text-xs font-bold tracking-wide text-[#ffffff]">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}

