import React from "react";

export const metadata = {
  title: "Dispute Resolution | Nexucon",
  description: "Dispute resolution policies and procedures for Nexucon users.",
};

export default function DisputeResolutionPage() {
  return (
    <div className="w-full bg-[#ffffff] min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 text-[#0F181F]/80">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F181F] mb-10">Dispute Resolution</h1>
        
        <p className="text-lg font-medium">How we handle conflicts and ensure fair outcomes.</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">1. Direct Communication</h2>
          <p>We encourage all parties to first attempt to resolve any disagreements directly through the Nexucon messaging system. Open communication often resolves most misunderstandings.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">2. Mediation Request</h2>
          <p>If direct communication fails, either party can escalate the issue by opening a formal dispute. A Nexucon mediator will be assigned to review the project scope, communications, and deliverables.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">3. Evidence Collection</h2>
          <p>During mediation, both parties will be asked to provide evidence supporting their claims. This includes contracts, milestone agreements, photos, and chat logs.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0F181F]">4. Binding Decision</h2>
          <p>The Nexucon mediation team will make a binding decision based on the evidence provided and the platform&apos;s Terms of Service. Funds held in escrow will be released according to this decision.</p>
        </section>
      </div>
    </div>
  );
}
