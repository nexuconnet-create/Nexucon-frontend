import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface LoginSuccessModalProps {
  isOpen: boolean;
  onClose?: () => void;
  message?: string;
}

export default function LoginSuccessModal({ isOpen, onClose, message = "Login Successful!" }: LoginSuccessModalProps) {
  useEffect(() => {
    if (isOpen && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-[90%] mx-auto shadow-2xl flex flex-col items-center text-center border border-gray-100"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
            </div>
            
            <h3 className="text-2xl font-bold text-[#022C4F] mb-3">
              {message}
            </h3>
            
            <p className="text-sm font-medium text-gray-500 mb-2">
              You will be redirected shortly...
            </p>
            
            <div className="w-full h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear" }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
