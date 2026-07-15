"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useAuthModal } from "@/components/AuthModalContext";

export default function GrowAsMentee() {
  const { openAuthModal } = useAuthModal();
  const benefits = [
    "Accelerate your career",
    "Gain practical insights",
    "Expand your network",
    "Navigate challenges",
    "Build confidence"
  ];

  return (
    <section className="w-full bg-[#ffffff] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#1A2228] rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl"
        >
          {/* Left Side: Content */}
          <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#ffffff] mb-4">
              Grow as a Mentee
            </h2>
            <p className="text-[#ffffff]/80 text-lg mb-8 font-medium leading-relaxed">
              Take charge of your professional development. Connect with experienced professionals who can provide guidance, constructive feedback, and industry insights to help you reach your goals faster.
            </p>

            <div className="mb-6">
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-[#ffffff]/90 font-medium">
                    <CheckCircle className="text-[#00A3FF] mr-3 flex-shrink-0" size={18} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => openAuthModal("register")}
                className="bg-transparent hover:bg-white/10 border-2 border-white/30 text-[#ffffff] px-8 py-3 rounded-xl font-bold transition-all w-fit"
              >
                Find a Mentor
              </button>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-auto order-1 md:order-2">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784069196/Mentorship_and_mentee_constructi__202605261208-Photoroom_1_r1sfgr.png"
              alt="Construction Mentee"
              fill
              className="object-contain object-bottom scale-110 md:scale-125 origin-bottom"
            />
          </div>

        </motion.div>
      </div>
    </section>
  );
}
