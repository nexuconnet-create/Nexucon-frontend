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

const tagVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function HireProfessionalsSection() {
  return (
    <section className="w-full bg-[#0F181F] text-[#ffffff] rounded-3xl pt-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 h-full">

          {/* Left Side: Text and Image */}
          <div className="flex flex-col justify-between h-full">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="space-y-6 lg:pr-8"
            >
              {/* Icon */}
              <div className="w-12 h-12 flex-shrink-0 relative">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1783935293/Mask_group3_cst0of.png"
                  alt="Review Contractor Profiles Icon"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Hire Verified <br className="hidden lg:inline" /> Construction Professionals
              </h2>
              <p className="text-lg md:text-xl text-[#ffffff]/80 max-w-xl leading-relaxed">
                Connect with trusted contractors, engineers, architects, and construction specialists verified for quality, professionalism, and project delivery excellence.
              </p>
              <div className="pt-4">
                <button className="w-full max-w-[305px] h-auto min-h-[78px] py-4 flex items-center justify-center rounded-xl text-lg font-bold bg-[#022C4F] hover:bg-[#022C4F]/90 text-[#ffffff] transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95">
                  Hire Now
                </button>
              </div>
            </motion.div>

            {/* Professional Image */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-12 flex justify-center lg:justify-start items-end h-[400px] md:h-[500px] lg:h-[550px] w-full"
            >
              <div className="relative h-full w-full">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779868807/Contractor_Photos_-_Download_Free_High-Quality_Pictures___Freepik-removebg-preview_1_i4vvw5.png"
                  alt="Construction Professional"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain object-bottom drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Side: Staggered Tags */}
          <div className="hidden md:flex flex-col justify-center py-12 lg:py-24 pb-24 w-full relative">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
              className="flex flex-col space-y-4 md:space-y-6 items-start w-full"
            >
              {[
                { text: "Skippers (Senior)", ml: "ml-0 md:ml-20 lg:ml-32" },
                { text: "Navigators", ml: "ml-0 md:ml-14 lg:ml-24" },
                { text: "Structural Engineers", ml: "ml-0 md:ml-8 lg:ml-16" },
                { text: "MEP Engineers", ml: "ml-0 md:ml-2 lg:ml-8" },
                { text: "GEOTECH Engineer", ml: "ml-0 md:ml-2 lg:ml-8" },
                { text: "Quantity Surveyor", ml: "ml-0 md:ml-8 lg:ml-16" },
                { text: "Civil Engineers", ml: "ml-0 md:ml-14 lg:ml-24" },
                { text: "Permit Specialists", ml: "ml-0 md:ml-20 lg:ml-32" },
                { text: "And Many More", ml: "ml-0 md:ml-8 lg:ml-16" }
              ].map((tag, idx) => (
                <motion.div
                  key={idx}
                  variants={tagVariants}
                  className={`flex items-center justify-center w-full max-w-[384px] h-auto min-h-[82px] py-4 px-4 text-center text-sm md:text-lg font-bold bg-[#ffffff] text-[#0F181F] rounded-2xl shadow-xl hover:scale-105 transition-transform duration-200 cursor-pointer whitespace-normal md:whitespace-nowrap ${tag.ml}`}
                >
                  {tag.text}
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
