"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function MentorshipFAQ() {
  const faqs = [
    {
      question: "Who can become a mentor?",
      answer: "Anyone with at least 5 years of professional experience in the construction industry can apply to be a mentor. We look for individuals who are passionate about sharing their knowledge and guiding the next generation."
    },
    {
      question: "Is there a cost to join as a mentee?",
      answer: "We offer a Starter Plan that provides free basic access. For mentees looking for unlimited matches, priority support, and advanced coaching, we offer Professional and Advanced paid plans."
    },
    {
      question: "How does the matching process work?",
      answer: "Our intelligent algorithm matches mentors and mentees based on career goals, industry sector, specific skills, and location preferences to ensure a mutually beneficial relationship."
    },
    {
      question: "How much time commitment is expected?",
      answer: "The time commitment is flexible and agreed upon by both the mentor and mentee. Typically, we recommend at least one hour of interaction per month to maintain momentum."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#f8fafc] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-[#022C4F] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            Got Questions?
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0F181F] mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-[#0F181F]/70 text-lg font-medium">
            Have questions about our Mentorship program? Find the answers to our most common queries below.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-[#ffffff] border border-gray-200 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-[#0F181F] text-lg pr-8">{faq.question}</span>
                  <ChevronDown 
                    className={`text-[#022C4F] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6 pt-0 text-[#0F181F]/70 font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
