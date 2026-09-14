"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InspectorRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nexucon_access_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('nexucon_auth_user') : null;

    if (token || userStr) {
      router.replace('/inspector/dashboard');
    } else {
      router.replace('/inspector/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F181F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono font-medium tracking-wide">
          Initializing Inspector Terminal...
        </p>
      </div>
    </div>
  );
}
