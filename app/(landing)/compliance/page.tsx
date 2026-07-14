import React from "react";

export const metadata = {
  title: "Compliance & KYC | Nexucon",
  description: "Compliance and Know Your Customer (KYC) guidelines for Nexucon.",
};

export default function CompliancePage() {
  return (
    <div className="w-full bg-[#ffffff] min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 text-[#0F181F]/80">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F181F] mb-10">Compliance & KYC</h1>
        
        <p className="text-lg font-medium">Ensuring trust and security on the Nexucon platform.</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">1. Know Your Customer (KYC)</h2>
          <p>To maintain a safe and secure environment, Nexucon requires all professionals and high-value clients to undergo a rigorous KYC process. This involves verifying government-issued IDs, business registration documents, and relevant professional certifications.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">2. Anti-Money Laundering (AML)</h2>
          <p>Nexucon complies with international AML regulations. All transactions on our platform are monitored for suspicious activity, and any flags are reported to the appropriate regulatory bodies.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">3. Professional Verification</h2>
          <p>Contractors, architects, and engineers must provide proof of their qualifications and insurance. Nexucon regularly audits these credentials to ensure ongoing compliance.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">4. Data Privacy Compliance</h2>
          <p>Our KYC and compliance procedures are conducted in strict adherence to data protection laws. Your sensitive documents are encrypted and stored securely.</p>
        </section>
      </div>
    </div>
  );
}
