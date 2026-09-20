"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SlamViewerPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/inspector/dashboard/digital-eye/ts-1");
  }, [router]);

  return (
    <div className="p-8 text-center text-sm text-gray-500 font-mono">
      Redirecting to Tersus T-S1 MVP Scanner...
    </div>
  );
}
