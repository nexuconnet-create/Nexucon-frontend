"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HowMentorshipWorks() {
  const steps = [
    {
      num: "01",
      title: "Create your Profile",
      desc: "Sign up and complete your profile, highlighting your experience, skills, and goals."
    },
    {
      num: "02",
      title: "Get Matched",
      desc: "Our algorithm connects you with mentors or mentees that align with your professional objectives."
    },
    {
      num: "03",
      title: "Establish Mentorship Relationship",
      desc: "Connect, set expectations, and begin your journey through guided communication."
    },
    {
      num: "04",
      title: "Track Progress",
      desc: "Utilize our platform tools to set milestones, track achievements, and measure success."
    }
  ];

  return (
    <section className="relative w-full py-24">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop"
          alt="How Mentorship Works"
          fill
          className="object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0F181F]/80 z-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#ffffff]">
            How Mentorship Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#1A2228]/90 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all flex flex-col h-full"
            >
              <div className="bg-[#022C4F] w-12 h-12 rounded-lg flex items-center justify-center text-[#ffffff] font-bold text-xl mb-6">
                {step.num}
              </div>
              <h3 className="text-[#ffffff] text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-[#ffffff]/70 font-medium leading-relaxed flex-grow">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
