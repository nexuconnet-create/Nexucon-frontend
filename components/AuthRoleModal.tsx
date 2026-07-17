"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, HardHat, GraduationCap, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export default function AuthRoleModal({ isOpen, onClose, initialMode = "register" }: AuthRoleModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const router = useRouter();

  // Reset mode if initialMode changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(initialMode);
  }, [initialMode, isOpen]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleRoleSelect = (role: string) => {
    onClose();
    // Navigate to the appropriate auth page based on the role and mode
    router.push(`/${role}/${mode}`);
  };

  const roles = [
    {
      id: "client",
      title: "Client",
      description: "Post projects, hire verified professionals, and manage construction.",
      icon: <Building2 size={24} />,
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-500",
    },
    {
      id: "professional",
      title: "Professional",
      description: "Find jobs, bid on projects, and showcase your expertise.",
      icon: <HardHat size={24} />,
      color: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-500",
    },
    {
      id: "mentor",
      title: "Mentor",
      description: "Guide emerging talent, share industry expertise, and give back.",
      icon: <Users size={24} />,
      color: "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-500",
    },
    {
      id: "mentee",
      title: "Mentee",
      description: "Learn from mentors, build your skills, and start your career.",
      icon: <GraduationCap size={24} />,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-500",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex gap-4 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setMode("login")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                      mode === "login"
                        ? "bg-white text-[#0F181F] shadow-sm"
                        : "text-gray-500 hover:text-[#0F181F]"
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setMode("register")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                      mode === "register"
                        ? "bg-white text-[#0F181F] shadow-sm"
                        : "text-gray-500 hover:text-[#0F181F]"
                    }`}
                  >
                    Register
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-[#0F181F] hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 overflow-y-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F181F] mb-2">
                    {mode === "login" ? "Welcome back" : "Join Nexucon"}
                  </h2>
                  <p className="text-gray-500 font-medium">
                    {mode === "login"
                      ? "Select your role to access your account."
                      : "Choose how you want to use the platform to get started."}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`flex items-center p-5 border-2 rounded-2xl transition-all duration-300 text-left group ${role.color} bg-white hover:bg-opacity-50 hover:-translate-y-1 hover:shadow-lg`}
                    >
                      <div className={`p-4 rounded-xl mr-5 bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                        {role.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg mb-1 text-[#0F181F]">{role.title}</h3>
                        <p className="text-sm font-medium text-gray-500">{role.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
