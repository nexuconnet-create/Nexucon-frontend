"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function BecomeMentor() {
  const benefits = [
    "Share your industry expertise",
    "Build your professional brand",
    "Shape the future of construction",
    "Network with other leaders",
    "Flexible commitment options"
  ];

  return (
    <section className="w-full bg-[#ffffff] pb-12 px-4 sm:px-6 lg:px-8" id="become-mentor">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#022C4F] rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl"
        >
          {/* Left Side: Image */}
          <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-auto">
            <Image
              src="https://images.unsplash.com/photo-1504307651254-35680f356f27?q=80&w=2000&auto=format&fit=crop"
              alt="Construction Mentors"
              fill
              className="object-cover"
            />
          </div>

          {/* Right Side: Content */}
          <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#ffffff] mb-4">
              Become a Mentor
            </h2>
            <p className="text-[#ffffff]/80 text-lg mb-8 font-medium leading-relaxed">
              Give back to the industry by guiding the next generation of professionals. Share your knowledge, experiences, and insights to help others navigate their careers successfully.
            </p>

            <div className="mb-6">
              <h3 className="text-[#ffffff] font-bold text-xl mb-4">Why Mentorship Matters</h3>
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
              <button className="bg-[#ffffff] hover:bg-gray-100 text-[#022C4F] px-8 py-3 rounded-xl font-bold transition-all w-fit shadow-md">
                Apply to be a Mentor
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
