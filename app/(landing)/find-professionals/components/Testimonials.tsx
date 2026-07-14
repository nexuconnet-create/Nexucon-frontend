"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote: "Nexucon has completely transformed how I source and hire subcontractors. The verification process gives me total peace of mind.",
    author: "Chinedu Eze",
    role: "Project Manager"
  },
  {
    quote: "The platform's unified workflow makes it incredibly easy to manage multiple projects, contracts, and milestone payments seamlessly.",
    author: "Amina Bello",
    role: "Real Estate Developer"
  },
  {
    quote: "Finding specialized engineers used to take weeks. With Nexucon, I had three qualified candidates interviewed and one hired in 48 hours.",
    author: "Oluwaseun Adeyemi",
    role: "General Contractor"
  },
  {
    quote: "The escrow payment feature ensures that I only pay when milestones are met. It has removed so much risk from our developments.",
    author: "Ngozi Okoro",
    role: "Property Investor"
  },
  {
    quote: "As a structural engineer, Nexucon has connected me with top-tier developers. The contract management tools are a game changer.",
    author: "Emeka Nwachukwu",
    role: "Structural Engineer"
  },
  {
    quote: "We've reduced our project delays by 40% simply because we can now find the right professionals locally without endless background checks.",
    author: "Fatimah Abubakar",
    role: "Operations Director"
  },
  {
    quote: "The transparent bidding system allows us to compare quotes side-by-side, saving our firm millions of Naira on recent constructions.",
    author: "Tunde Bakare",
    role: "Procurement Manager"
  },
  {
    quote: "I appreciate the robust communication tools. Having all plans, milestones, and chats in one place has streamlined our workflow.",
    author: "Chika Ike",
    role: "Lead Architect"
  },
  {
    quote: "Nexucon is the future of construction in Nigeria. Fast, secure, and incredibly reliable.",
    author: "Ibrahim Musa",
    role: "Site Supervisor"
  }
];

export default function Testimonials() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalPages]);

  const currentTestimonials = testimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <section className="w-full bg-[#ffffff] py-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0F181F] mb-4">
              Trusted by Project Owners <br className="hidden md:block" /> and Construction Teams
            </h2>
          </motion.div>
        </div>

        {/* Testimonials Grid with Animation */}
        <div className="min-h-[350px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {currentTestimonials.map((testimonial, index) => (
                <div
                  key={`${currentPage}-${index}`}
                  className="bg-[#022C4F] rounded-3xl p-8 flex flex-col relative shadow-xl hover:-translate-y-2 transition-transform duration-300"
                >
                  {/* Quote Icon */}
                  <svg className="w-8 h-8 text-white mb-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  
                  <p className="text-white/90 text-[14px] leading-relaxed mb-8 flex-grow">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="mt-auto">
                    <p className="font-bold text-white text-[14px]">
                      {testimonial.author}
                    </p>
                    <p className="text-white/60 text-[12px]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center mt-12 space-x-3">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentPage === index 
                  ? "bg-[#022C4F] w-8" 
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
