"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Users, Laptop, Target, ClipboardCheck, 
  FileText, Mic, FolderOpen, Network 
} from "lucide-react";

export default function MentorshipFeatures() {
  const features = [
    {
      icon: <Users size={24} />,
      title: "One-on-One Mentoring",
      desc: "Personalized guidance tailored to your specific career goals and challenges in the construction industry."
    },
    {
      icon: <Laptop size={24} />,
      title: "Professional Workshops",
      desc: "Access to exclusive webinars and workshops led by industry veterans."
    },
    {
      icon: <Target size={24} />,
      title: "Goal Setting & Tracking",
      desc: "Interactive tools to define, manage, and track your professional milestones."
    },
    {
      icon: <ClipboardCheck size={24} />,
      title: "Skill Assessment",
      desc: "Evaluate your competencies and identify key areas for growth and improvement."
    },
    {
      icon: <FileText size={24} />,
      title: "Resume Building",
      desc: "Expert feedback on your resume to help you stand out to top construction firms."
    },
    {
      icon: <Mic size={24} />,
      title: "Interview Coaching",
      desc: "Mock interviews and preparation strategies to ace your next career move."
    },
    {
      icon: <FolderOpen size={24} />,
      title: "Project Portfolio",
      desc: "Build and showcase a comprehensive portfolio of your construction projects."
    },
    {
      icon: <Network size={24} />,
      title: "Community Networking",
      desc: "Connect with a broader network of peers, mentors, and industry leaders."
    }
  ];

  return (
    <section className="w-full bg-[#f8fafc] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0F181F] mb-4">
            Mentorship Features
          </h2>
          <p className="text-[#0F181F]/70 text-lg md:text-xl max-w-3xl mx-auto font-medium">
            Comprehensive tools and resources to support your professional journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-[#ffffff] rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start"
            >
              <div className="bg-[#022C4F] text-[#ffffff] p-4 rounded-xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-[#0F181F] text-lg font-bold mb-3">{feature.title}</h3>
              <p className="text-[#0F181F]/70 text-sm font-medium leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
