import React from "react";
import MentorshipHero from "./components/MentorshipHero";
import MentorshipIntro from "./components/MentorshipIntro";
import BecomeMentor from "./components/BecomeMentor";
import GrowAsMentee from "./components/GrowAsMentee";
import HowMentorshipWorks from "./components/HowMentorshipWorks";
import MentorshipFeatures from "./components/MentorshipFeatures";
import MentorshipPlans from "./components/MentorshipPlans";
import MentorshipFAQ from "./components/MentorshipFAQ";
import MentorshipCta from "./components/MentorshipCta";

export const metadata = {
  title: "Mentorship | Nexucon",
  description: "Construction Mentorship & Professional Growth. Empowering the Next Generation of Construction Professionals.",
};

export default function MentorshipPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <MentorshipHero />
      <MentorshipIntro />
      <BecomeMentor />
      <GrowAsMentee />
      <HowMentorshipWorks />
      <MentorshipFeatures />
      <MentorshipPlans />
      <MentorshipFAQ />
      <MentorshipCta />
    </div>
  );
}
