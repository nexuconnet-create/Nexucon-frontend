"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SearchAndFilter() {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filterCategories = [
    {
      name: "Profession Category",
      options: ["All Professionals", "Skippers (Senior)", "Architects", "Structural Engineers", "MEP Engineers", "GeoTech Engineers", "Quantity Surveyors", "Site Supervisors", "Permit Specialists", "Project Managers", "Field Workers", "Safety Officers", "QA/QC Inspectors"]
    },
    {
      name: "Location",
      options: ["All Locations", "Lagos", "Abuja", "Rivers (Port Harcourt)", "Kano", "Oyo (Ibadan)", "Remote"]
    },
    {
      name: "Years of Experience",
      options: ["All Experience", "0-2 Years", "3-5 Years", "6-10 Years", "10+ Years"]
    },
    {
      name: "Project Type",
      options: ["All Projects", "Residential", "Commercial", "Industrial", "Infrastructure"]
    },
    {
      name: "Budget Range",
      options: ["All Budgets", "Under ₦500,000", "₦500k - ₦2M", "₦2M - ₦10M", "₦10M+"]
    },
    {
      name: "Availability",
      options: ["All Availability", "Full-time", "Part-time", "Contract", "Hourly"]
    },
    {
      name: "Verification Status",
      options: ["Any Verification", "Verified Only", "All Professionals"]
    },
    {
      name: "Ratings & Reviews",
      options: ["Any Rating", "4.5 & up", "4.0 & up", "3.0 & up"]
    }
  ];

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    
    if (selectedCategory && !selectedCategory.toLowerCase().startsWith("all ") && !selectedCategory.toLowerCase().startsWith("any ")) {
      params.set("category", selectedCategory);
    }

    // Smoothly update the URL without scrolling to the top
    router.push(`?${params.toString()}`, { scroll: false });
    setShowFilters(false);
  };

  return (
    <section className="w-full bg-[#ffffff] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        >
          {/* Left Text */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F181F] mb-2">
              Find the Right Expert for Your Project
            </h2>
            <p className="text-[#0F181F]/70 text-[14px]">
              Search and filter professionals based on expertise, location, experience, certifications, project type, availability, and ratings to find the best fit for your construction needs.
            </p>
          </div>

          {/* Right Search Input & Filters */}
          <div className="flex-1 w-full max-w-lg relative">
            <div className="flex items-center w-full bg-[#ffffff] border border-gray-300 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-shadow relative z-10">
              <div className="pl-6 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                className="w-full h-14 px-4 text-[14px] text-[#0F181F] bg-transparent outline-none placeholder:text-[#0F181F]/40 font-medium"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 h-full px-8 text-[#0F181F] font-bold text-[14px] hover:bg-gray-50 border-l border-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Filter
              </button>
            </div>

            {/* Filter Dropdown Popover */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-4 right-0 w-full sm:w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 grid grid-cols-1 sm:grid-cols-2 gap-5"
                >
                  <div className="col-span-1 sm:col-span-2 mb-2 flex justify-between items-center border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-[#0F181F]">Filter Categories</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {filterCategories.map((cat, idx) => (
                    <div key={idx} className="flex flex-col space-y-1.5">
                      <label className="text-[12px] font-bold text-[#0F181F]/70 uppercase tracking-wider">{cat.name}</label>
                      <select
                        onChange={(e) => cat.name === "Profession Category" ? setSelectedCategory(e.target.value) : null}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-[#0F181F] font-medium outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all"
                      >
                        {cat.options.map((opt, optIdx) => (
                          <option key={optIdx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div className="col-span-1 sm:col-span-2 flex justify-end mt-4 gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("");
                        router.push("?", { scroll: false });
                        setShowFilters(false);
                      }}
                      className="px-6 py-2.5 text-[13px] font-bold text-gray-500 hover:text-[#0F181F] transition-colors rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="px-6 py-2.5 bg-[#022C4F] hover:bg-[#021c33] text-white text-[13px] font-bold rounded-lg transition-colors shadow-md"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
