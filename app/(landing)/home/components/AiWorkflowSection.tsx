"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AiWorkflowSection() {
  return (
    <section className="w-full bg-[#ffffff] pt-24 pb-0 lg:pb-24 -mb-12 sm:-mb-32 lg:mb-0 z-20 relative overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F181F]">AI-Powered Construction Workflow Support</h2>
          <p className="text-sm text-[#0F181F]/70 leading-relaxed max-w-2xl mx-auto">
            Leverage intelligent assistance to generate project scopes, refine technical specifications, organize documentation, and improve project clarity before hiring begins.
          </p>
        </motion.div>

        {/* Robot Head Central Visual & Side Info Cards */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:gap-8 items-center relative overflow-visible mt-8 lg:mt-0">

          {/* Left Info Card 01 */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-4 bg-[#0F181F] text-[#ffffff] p-8 sm:p-10 rounded-3xl shadow-lg border border-[#0F181F]/5 space-y-4 transition-transform hover:-translate-y-1 z-40 relative w-[90%] sm:w-[85%] lg:w-full max-w-[360px] h-auto lg:h-[410px] lg:min-h-[410px] mr-auto lg:ml-0 lg:mr-auto"
          >
            <div className="text-5xl sm:text-6xl font-black text-[#ffffff]">01</div>
            <p className="text-xs sm:text-sm mt-6 sm:mt-10 text-[#ffffff]/80 leading-relaxed">
              Nexucon simplifies complex construction workflows with AI-assisted tools that help clients create clear project briefs, define accurate requirements, and streamline project planning from the start. By reducing ambiguity, the platform improves communication between project owners and construction professionals.
            </p>
          </motion.div>

          {/* Center Robot Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-[60px] sm:top-[80px] left-1/2 -translate-x-[45%] sm:-translate-x-[42%] z-30 pointer-events-none lg:static lg:col-span-4 lg:flex lg:justify-center lg:translate-x-0 lg:-mx-16 overflow-visible"
          >
            <div className="w-[545px] h-[606px] max-w-none lg:w-[70%] md:w-[60%] lg:h-[606px] select-none relative z-30 lg:translate-y-[100px] lg:-mb-[100px]">
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779944027/Download_free_png_of_PNG_Robot_looking_at_his_hand_robot_technology_futuristic_by_Ratcharin_Noiruksa_about_robot_png__robot_hand__3d_png__robot__and_cartoon_robot_13161177-removebg-preview_1_vemwew.png"
                alt="AI Visual"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Right Info Card 02 */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-4 bg-[#0F181F] text-[#ffffff] p-8 sm:p-10 mt-[120px] sm:mt-[160px] lg:mt-24 rounded-3xl shadow-lg border border-[#0F181F]/5 space-y-4 transition-transform hover:-translate-y-1 z-40 relative w-[90%] sm:w-[85%] lg:w-full max-w-[360px] h-auto lg:h-[410px] lg:min-h-[410px] ml-auto lg:mr-0 lg:ml-auto"
          >
            <div className="text-5xl sm:text-6xl font-black text-[#ffffff]">02</div>
            <p className="text-xs sm:text-sm mt-6 sm:mt-10 text-[#ffffff]/80 leading-relaxed">
              From intelligent scope clarification to automated workflow guidance and organized documentation management, Nexucon helps teams stay efficient, compliant, and aligned throughout every phase of the construction lifecycle.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}




