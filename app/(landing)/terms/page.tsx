import React from "react";

export const metadata = {
  title: "Terms of Service | Nexucon",
  description: "Terms of Service for the Nexucon platform.",
};

export default function TermsPage() {
  return (
    <div className="w-full bg-[#ffffff] min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 text-[#0F181F]/80">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F181F] mb-10">Terms of Service</h1>
        
        <p className="text-lg font-medium">Last updated: July 14, 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">1. Introduction</h2>
          <p>Welcome to Nexucon. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">2. User Responsibilities</h2>
          <p>As a user of Nexucon, you agree to provide accurate, current, and complete information during the registration process. You are responsible for maintaining the confidentiality of your account credentials.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">3. Professional Conduct</h2>
          <p>All interactions on Nexucon must be conducted professionally. Harassment, fraud, or deceptive practices are strictly prohibited and will result in immediate account termination.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">4. Payments and Escrow</h2>
          <p>Payments for services rendered through Nexucon are subject to our payment processing terms. Funds may be held in escrow until project milestones are officially approved by both parties.</p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">5. Limitation of Liability</h2>
          <p>Nexucon provides a platform for connection and project management but is not liable for the quality, safety, or legality of the services provided by independent contractors.</p>
        </section>
      </div>
    </div>
  );
}
