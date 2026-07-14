"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqsList = [
  {
    question: "Are the professionals on the platform verified?",
    answer: "Yes, every professional on Nexucon undergoes a rigorous verification process. We check their credentials, licenses, past projects, and insurance to ensure they meet our high standards before they can join the platform."
  },
  {
    question: "How does the payment process work?",
    answer: "We use a secure escrow system. You fund a milestone, the money is held safely, and it is only released to the contractor once you approve the completed work for that specific milestone."
  },
  {
    question: "Can I manage multiple projects at once?",
    answer: "Absolutely. Nexucon provides a centralized dashboard where you can oversee multiple projects, teams, and budgets simultaneously without losing track of details."
  },
  {
    question: "Is Nexucon suitable for large commercial projects?",
    answer: "Yes, our platform scales to accommodate everything from small residential renovations to multi-million dollar commercial developments, providing the necessary tools for complex workflows."
  },
  {
    question: "What happens if there's a dispute with a contractor?",
    answer: "We have a dedicated dispute resolution center. If an issue arises, our team steps in to mediate and help reach a fair resolution based on the project contracts and platform guidelines."
  },
  {
    question: "Do you provide document storage for my projects?",
    answer: "Yes, each project comes with unlimited secure cloud storage for blueprints, permits, contracts, and photos, ensuring all stakeholders have access to the latest files."
  }
];

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#ffffff] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            className="inline-block bg-[#0F181F] text-[#ffffff] px-6 py-2 rounded-full text-sm font-bold tracking-widest mb-6"
          >
            FAQS
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-[#0F181F]"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        {/* FAQs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {faqsList.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-[#EAEAEA] rounded-xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'shadow-md' : 'shadow-sm'}`}
            >
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-bold text-[#0F181F] text-[14px] pr-4">{faq.question}</span>
                <span className="text-[#0F181F] font-light text-2xl leading-none">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-[#0F181F]/70 text-[14px] leading-relaxed font-sans">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
