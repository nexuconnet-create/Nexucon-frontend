"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DigitalEyeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inspector/dashboard/digital-eye/ts-1");
  }, [router]);

  return (
    <div className="min-h-[400px] flex items-center justify-center font-mono text-xs text-slate-500">
      Redirecting to T-S1 MVP...
    </div>
  );
}
