"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const categories = [
  { id: 1, title: "Residential Construction", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" },
  { id: 2, title: "Commercial Construction", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80" },
  { id: 3, title: "Infrastructure Projects", image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&q=80" },
  { id: 4, title: "Renovation & Remodeling", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80" },
  { id: 5, title: "Architectural Design", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80" }, // Replaced below with distinct later if needed
  { id: 6, title: "Engineering Consultancy", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80" },
  { id: 7, title: "Interior Fit-Out Projects", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80" },
  { id: 8, title: "Site Supervision", image: "https://images.unsplash.com/photo-1504307651254-35680f356f12?auto=format&fit=crop&q=80" },
  { id: 9, title: "MEP Installations", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80" },
  { id: 10, title: "Procurement & Supply Projects", image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&q=80" }
];

export default function PostProjectCategories() {
  return (
    <section className="w-full bg-[#ffffff] py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#022C4F]">
              Categories
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => {
            const isLast = index === categories.length - 1;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                className={`relative group rounded-xl overflow-hidden shadow-md h-[220px] md:h-[260px] cursor-pointer hover:shadow-2xl transition-all duration-300 ${
                  isLast ? "lg:col-start-2" : ""
                }`}
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-[#022C4F]/40 group-hover:bg-[#022C4F]/60 transition-colors duration-300" />
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <h3 className="text-white font-semibold text-lg md:text-xl max-w-[80%] leading-tight drop-shadow-md">
                    {cat.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-white text-sm font-medium tracking-wide">
                      Explore
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <ArrowRight className="w-4 h-4 text-[#022C4F]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
