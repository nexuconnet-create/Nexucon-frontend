"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Toast() {
  const [toasts, setToasts] = useState<{id: number, message: string, type: 'success' | 'info'}[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message: e.detail.message, type: e.detail.type || 'info' }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto border ${
              toast.type === 'success' 
                ? 'bg-white border-green-100 text-[#0F181F]' 
                : 'bg-[#022C4F] border-[#022C4F] text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={20} className="text-green-500 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-blue-200 shrink-0" />
            )}
            <span className="text-[13px] font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
