"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const categories = [
  { id: 1, title: "Residential Construction", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784072820/__7_1_kvakpz.png" },
  { id: 2, title: "Commercial Construction", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784072832/Transform_Your_Commercial_Space_with_Effective_Maintenance_1_cnu8vl.png" },
  { id: 3, title: "Infrastructure Projects", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784072833/M3M_Industrial_Plots_Manesar_1_hs45tf.png" },
  { id: 4, title: "Renovation & Remodeling", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784072832/Home_Renovations_1_j8q7xy.png" },
  { id: 5, title: "Architectural Design", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784072823/Architecture_1_kxq0bf.png" }, // Replaced below with distinct later if needed
  { id: 6, title: "Engineering Consultancy", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784072826/Environmental_Consultants_in_Sydney_-_iEnvironmental_Australia_1_ifhnoe.png" },
  { id: 7, title: "Interior Fit-Out Projects", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784072819/__8_1_tkdstf.png" },
  { id: 8, title: "Site Supervision", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784072824/Happy_african_american_architect_1_rmbhjh.png" },
  { id: 9, title: "MEP Installations", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784072821/Complete_MEP_Design_Process_for_Modern_Buildings_1_d9zlh7.png" },
  { id: 10, title: "Procurement & Supply Projects", image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784072833/Procestechniek_vacatures___Procesoperator_technici_1_nmbap2.png" }
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
                className={`relative group rounded-xl overflow-hidden shadow-md h-[220px] md:h-[260px] cursor-pointer hover:shadow-2xl transition-all duration-300 ${isLast ? "lg:col-start-2" : ""
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
