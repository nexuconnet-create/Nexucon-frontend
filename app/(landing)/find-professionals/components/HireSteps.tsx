"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
  {
    title: "Search verified professionals based on your project requirements.",
    image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783996761/new1_cd8mb3.png"
  },
  {
    title: "Review profiles, portfolios, certifications, and client feedback.",
    image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783996761/new_fvq2ox.png"
  },
  {
    title: "Invite professionals or receive proposals directly through the platform.",
    image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783996578/15_Smart_Tips_for_Smooth_Boiler_Installation_Kidderminster_2_fvr7ex.png"
  },
  {
    title: "Hire securely and manage project execution within Nexucon.",
    image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1783996582/group71_zuyb1b.png"
  }
];

export default function HireSteps() {
  return (
    <section className="w-full bg-[#ffffff] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-left mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-[#022C4F] text-white text-[12px] font-bold px-4 py-1.5 rounded-full mb-4">
              Process Section
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#0F181F] leading-tight">
              Hire in Simple Steps
            </h2>
          </motion.div>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative w-full h-[200px] md:h-[250px] rounded-3xl overflow-hidden shadow-md group"
            >
              <Image
                src={step.image}
                alt={step.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#0F181F]/60 group-hover:bg-[#0F181F]/70 transition-colors duration-300" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-row items-end justify-between gap-4">
                <span className="text-9xl md:text-8xl font-bold text-white/20 leading-none tracking-tighter">
                  0{index + 1}
                </span>
                <h3 className="text-lg md:text-xl font-light text-white text-right max-w-[65%]">
                  {step.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
