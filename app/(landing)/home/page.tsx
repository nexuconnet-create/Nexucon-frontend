"use client";

import React from "react";
import HeroSection from "./components/HeroSection";
import ServicesSection from "./components/ServicesSection";
import StatsSection from "./components/StatsSection";
import WhyNexuconSection from "./components/WhyNexuconSection";
import HowItWorksSection from "./components/HowItWorksSection";
import HireProfessionalsSection from "./components/HireProfessionalsSection";
import AiWorkflowSection from "./components/AiWorkflowSection";
import SecurePaymentsSection from "./components/SecurePaymentsSection";
import CtaSection from "./components/CtaSection";
import ScrollToTopButton from "./components/ScrollToTopButton";

export default function HomePage() {
  return (
    <main className="w-full overflow-x-hidden relative">
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <WhyNexuconSection />
      <HowItWorksSection />
      <HireProfessionalsSection />
      <AiWorkflowSection />
      <SecurePaymentsSection />
      <CtaSection />
      
      <ScrollToTopButton />
    </main>
  );
}
