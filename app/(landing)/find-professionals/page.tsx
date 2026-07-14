"use client";

import React from "react";
import FindProfessionalsHero from "./components/FindProfessionalsHero";
import SearchAndFilter from "./components/SearchAndFilter";
import ProfessionalCategories from "./components/ProfessionalCategories";
import WhyChooseProfessionals from "./components/WhyChooseProfessionals";
import HireSteps from "./components/HireSteps";
import Testimonials from "./components/Testimonials";
import FindProfessionalsCta from "./components/FindProfessionalsCta";
import ScrollToTopButton from "../home/components/ScrollToTopButton";

export default function FindProfessionalsPage() {
  return (
    <main className="w-full min-h-screen bg-[#ffffff]">
      <FindProfessionalsHero />
      <SearchAndFilter />
      <ProfessionalCategories />
      <WhyChooseProfessionals />
      <HireSteps />
      <Testimonials />
      <FindProfessionalsCta />
      <ScrollToTopButton />
    </main>
  );
}
