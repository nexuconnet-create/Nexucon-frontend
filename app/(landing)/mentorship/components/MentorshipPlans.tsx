"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useAuthModal } from "@/components/AuthModalContext";

export default function MentorshipPlans() {
  const { openAuthModal } = useAuthModal();
  return (
    <section className="w-full bg-[#ffffff] py-24 px-4 sm:px-6 lg:px-8" id="plans">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0F181F] mb-4">
            Flexible Mentorship Plans
          </h2>
          <p className="text-[#0F181F]/70 text-lg md:text-xl max-w-3xl mx-auto font-medium">
            Choose the level of guidance and resources that fits your career goals.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Starter Plan (Left Column, Tall) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/3 bg-[#f8fafc] border border-gray-200 rounded-[32px] p-10 flex flex-col"
          >
            <h3 className="text-2xl font-extrabold text-[#0F181F] mb-2">Starter Plan</h3>
            <p className="text-[#0F181F]/60 font-medium mb-8">Free Basic Access</p>

            <div className="mb-8">
              <h4 className="font-bold text-[#0F181F] mb-2">Ideal for</h4>
              <p className="text-[#0F181F]/70 text-sm leading-relaxed">
                Students and recent graduates starting their construction journey.
              </p>
            </div>

            <div className="mb-10 flex-grow">
              <h4 className="font-bold text-[#0F181F] mb-4">Features</h4>
              <ul className="space-y-4">
                {["Basic Profile Creation", "Access to Community Forum", "1 Mentorship Match", "Monthly Newsletter"].map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="text-[#022C4F] mt-1 mr-3 flex-shrink-0" size={14} />
                    <span className="text-[#0F181F]/80 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => openAuthModal("register")}
              className="w-full bg-[#022C4F] hover:bg-[#021c33] text-[#ffffff] py-4 rounded-xl font-bold transition-all mt-auto shadow-md"
            >
              Get Started for Free
            </button>
          </motion.div>

          {/* Right Column (Two Stacked Cards) */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">

            {/* Professional Plan (Top Right) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#ffffff] border border-[#022C4F]/20 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row gap-8 shadow-sm"
            >
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#0F181F] mb-2">Professional Plan</h3>
                  <p className="text-[#0F181F]/60 font-medium text-sm mb-6">Unlock advanced networking and dedicated mentor access.</p>
                  <div className="text-3xl font-extrabold text-[#0F181F] mb-6">
                    ₦5,000 <span className="text-lg text-[#0F181F]/50 font-medium">/ month</span>
                  </div>
                </div>
                <button 
                  onClick={() => openAuthModal("register")}
                  className="w-full md:w-auto bg-transparent border-2 border-[#022C4F] text-[#022C4F] hover:bg-[#022C4F] hover:text-[#ffffff] py-3 px-8 rounded-xl font-bold transition-all"
                >
                  Select Professional
                </button>
              </div>
              <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
                <ul className="space-y-4">
                  {["Unlimited Mentor Matches", "Priority Support & Visibility", "Resume & Portfolio Review", "Access to Exclusive Workshops", "Advanced Career Coaching"].map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="text-[#022C4F] mt-1 mr-3 flex-shrink-0" size={14} />
                      <span className="text-[#0F181F]/80 text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Advanced / Enterprise Plan (Bottom Right, Dark) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#022C4F] rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row gap-8 shadow-lg"
            >
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#ffffff] mb-2">Advanced Plan</h3>
                  <p className="text-[#ffffff]/70 font-medium text-sm mb-6">Comprehensive coaching and organizational access.</p>
                  <div className="text-3xl font-extrabold text-[#ffffff] mb-6">
                    ₦15,000 <span className="text-lg text-[#ffffff]/70 font-medium">/ month</span>
                  </div>
                </div>
                <button className="w-full md:w-auto bg-[#ffffff] text-[#022C4F] hover:bg-gray-100 py-3 px-8 rounded-xl font-bold transition-all shadow-md">
                  Contact Sales
                </button>
              </div>
              <div className="flex-1 border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0 md:pl-8">
                <ul className="space-y-4">
                  {["Dedicated Account Manager", "Organizational Training", "Custom Mentorship Programs", "Detailed Progress Analytics", "Executive Level Coaching", "Team Collaboration Tools"].map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="text-[#00A3FF] mt-1 mr-3 flex-shrink-0" size={14} />
                      <span className="text-[#ffffff]/90 text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
