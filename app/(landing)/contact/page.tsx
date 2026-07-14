import React from "react";
import ContactSection from "./components/ContactSection";
import Newsletter from "./components/Newsletter";

export const metadata = {
  title: "Contact Us | Nexucon",
  description: "Get in touch with Nexucon. We are available to assist you throughout your experience on the platform.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#ffffff]">
      <div className="py-12 md:py-20 flex flex-col gap-12 md:gap-24">
        <ContactSection />
        <Newsletter />
      </div>
    </div>
  );
}
