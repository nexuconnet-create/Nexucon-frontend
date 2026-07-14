"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or declined cookies
    const cookiePreference = localStorage.getItem("cookie_preference");
    if (!cookiePreference) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_preference", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_preference", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto bg-[#0F181F] rounded-2xl shadow-2xl border border-white/10 p-6 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">We value your privacy</h3>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
              <button 
                onClick={handleDecline}
                className="px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Decline
              </button>
              <button 
                onClick={handleAccept}
                className="px-6 py-3 rounded-xl bg-[#022C4F] hover:bg-[#00386C] text-white font-medium shadow-lg transition-colors"
              >
                Accept All
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
