"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Create Your Project Detail",
    desc: "Provide project details including scope, location, timelines, budget expectations, and technical requirements using AI-assisted project specification tools."
  },
  {
    num: "02",
    title: "Receive Proposals",
    desc: "Verified contractors, engineers, architects, and consultants submit tailored bids and technical proposals for your review."
  },
  {
    num: "03",
    title: "Review & Compare",
    desc: "Compare professionals based on experience, pricing, certifications, ratings, portfolios, and project suitability."
  },
  {
    num: "04",
    title: "Hire & Collaborate",
    desc: "Select the right professional or team and manage project workflows, communication, documentation, and payments directly through Nexucon."
  }
];

export default function PostProjectSteps() {
  return (
    <section className="w-full bg-[#0F181F] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#ffffff] mb-4">
              How Posting a Project Works
            </h2>
          </motion.div>
        </div>

        {/* Staggered Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">

          {steps.map((step, index) => {
            // Layout logic:
            // 01 (index 0) and 03 (index 2) span 2 rows and center vertically.
            // 02 (index 1) and 04 (index 3) take 1 row each in the middle column.
            const isSide = index === 0 || index === 2;
            const isBottomMiddle = index === 3;

            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`flex w-full ${isSide
                  ? "md:row-span-2 md:flex md:items-center"
                  : "md:row-span-1"
                  } ${isBottomMiddle ? "md:col-start-2 md:col-span-1" : ""}`}
              >
                <div className="w-full bg-[#022C4F] rounded-2xl p-8 flex flex-col items-start shadow-xl border border-white/5 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center mb-6">
                    <span className="text-white font-bold">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/70 text-[13px] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
