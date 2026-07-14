import React from "react";
import HowItWorksHero from "./components/HowItWorksHero";
import ModernDelivery from "./components/ModernDelivery";
import PlatformSteps from "./components/PlatformSteps";
import WhyChoose from "./components/WhyChoose";
import Faqs from "./components/Faqs";
import HowItWorksCta from "./components/HowItWorksCta";

export const metadata = {
  title: "How it works | Nexucon",
  description: "Learn how the Nexucon construction marketplace and contract management system works.",
};

export default function HowItWorksPage() {
  return (
    <main className="w-full overflow-x-hidden relative">
      <HowItWorksHero />
      <ModernDelivery />
      <PlatformSteps />
      <WhyChoose />
      <Faqs />
      <HowItWorksCta />
    </main>
  );
}
