"use client";

import React from "react";
import { motion } from "framer-motion";

export default function MentorshipIntro() {
  return (
    <section className="w-full bg-[#ffffff] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-24 items-center">
        
        {/* Left Side: Bold Title */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0F181F] leading-tight">
            Empowering the Next <br className="hidden md:block"/>
            <span className="text-[#022C4F]/60">Generation of</span> <br className="hidden md:block"/>
            Construction Professionals
          </h2>
        </motion.div>

        {/* Right Side: Description */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <p className="text-[#0F181F]/70 text-base md:text-lg leading-relaxed mb-6 font-medium">
            Nexucon's mentorship program connects emerging talent with seasoned industry veterans. Whether you're looking to accelerate your career or give back to the community, our platform provides the tools, structure, and network to make meaningful professional connections.
          </p>
          <p className="text-[#0F181F]/70 text-base md:text-lg leading-relaxed font-medium">
            Join a community dedicated to excellence, continuous learning, and shaping the future of the construction industry.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
