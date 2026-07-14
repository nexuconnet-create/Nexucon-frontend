import React from "react";

export const metadata = {
  title: "Privacy Policy | Nexucon",
  description: "Privacy Policy for the Nexucon platform.",
};

export default function PrivacyPage() {
  return (
    <div className="w-full bg-[#ffffff] min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 text-[#0F181F]/80">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F181F] mb-10">Privacy Policy</h1>
        
        <p className="text-lg font-medium">Last updated: July 14, 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">1. Data Collection</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">2. Use of Information</h2>
          <p>We may use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, and develop new features.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">3. Sharing of Information</h2>
          <p>We may share the information we collect about you with third parties for business purposes, such as with vendors, consultants, marketing partners, and other service providers who need access to such information to carry out work on our behalf.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">4. Data Security</h2>
          <p>Nexucon takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
        </section>
      </div>
    </div>
  );
}
