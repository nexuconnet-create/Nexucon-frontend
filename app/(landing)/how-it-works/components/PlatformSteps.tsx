"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    id: "01",
    title: "Create Your Project",
    desc: "Clients can create detailed project listings by defining project scope, timelines, budget expectations, location, and technical requirements using AI-assisted 1project specification tools."
  },
  {
    id: "02",
    title: "Receive Proposals",
    desc: "Verified contractors, engineers, architects, and consultants submit proposals tailored to the project requirements, including pricing, delivery timelines, and technical approaches."
  },
  {
    id: "03",
    title: "Hire Quality Pro's",
    desc: "Compare applicants based on expertise, ratings, experience, certifications, and pricing before awarding contracts securely through the platform."
  },
  {
    id: "04",
    title: "Manage Project Execution",
    desc: "Monitor project milestones, approvals, reports, communication,and task updates in real time using a centralized project management dashboard."
  },
  {
    id: "05",
    title: "Secure Payments",
    desc: "Payments are securely held and released based on approved project milestones, ensuring protection for both project owners and professionals."
  },
  {
    id: "06",
    title: "Compliance & Dispute Resolution",
    desc: "Nexucon supports compliance monitoring, documentation management, audit trails, and structured dispute resolution to reduce project risks."
  }
];

export default function PlatformSteps() {
  return (
    <section className="w-full bg-[#EAEAEA] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F181F]">
            How the Platform Works
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-[256px] h-[256px] bg-[#0F181F] text-[#ffffff] p-6 rounded-2xl flex flex-col hover:-translate-y-2 transition-transform duration-300"
            >
              {/* Number Badge */}
              <div className="w-10 h-10 rounded-full bg-[#022C4F] flex items-center justify-center text-sm font-bold text-[#ffffff] mb-2">
                {step.id}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[#ffffff] mb-2">
                {step.title}
              </h3>
              <p className="text-[10px] text-[#ffffff]/60 leading-relaxed font-sans flex-grow">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
