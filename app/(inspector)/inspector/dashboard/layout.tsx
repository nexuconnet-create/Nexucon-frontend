"use client";

import React, { useEffect } from "react";
import InspectorAppShell from "@/components/inspector/InspectorAppShell";
import Toast from "@/components/Toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

export default function InspectorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/inspector/login');
        return;
      }
      const role = (user.role_name || '').toLowerCase();
      const isInsp = role.includes('inspector') || role.includes('field officer') || role.includes('site officer') || role.includes('hse');
      if (!isInsp) {
        logout();
        router.replace('/inspector/login');
      }
    }
  }, [user, isLoading, router, logout]);

  if (!isLoading && user) {
    const role = (user.role_name || '').toLowerCase();
    const isInsp = role.includes('inspector') || role.includes('field officer') || role.includes('site officer') || role.includes('hse');
    if (!isInsp) {
      const isGov = role.includes('agency') || role.includes('director') || role.includes('executive') || role.includes('admin') || role.includes('government') || role.includes('ministry') || role.includes('regulator');
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {isGov
                ? "This terminal is strictly for accredited Field Inspectors. Government agency executives must use the Government Command Center."
                : "This terminal is strictly for accredited Field Inspectors. Stakeholders must use the Stakeholder Portal."}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={isGov ? "https://government.nexucon.net" : "https://stakeholder.nexucon.net"}
                className="w-full py-3 px-4 bg-[#022C4F] text-white rounded-xl font-bold text-sm hover:bg-[#033c6c] transition-all shadow-md"
              >
                Go to {isGov ? "Government Command Center" : "Stakeholder Portal"}
              </a>
              <button
                onClick={() => { logout(); router.replace('/inspector/login'); }}
                className="w-full py-2.5 px-4 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                Switch Account / Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <InspectorAppShell>
      {children}
      <Toast />
    </InspectorAppShell>
  );
}
