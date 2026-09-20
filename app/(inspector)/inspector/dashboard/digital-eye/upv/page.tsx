"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UpvRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/inspector/dashboard/digital-eye/pundit");
  }, [router]);

  return (
    <div className="p-8 text-center text-sm text-gray-500 font-mono">
      Redirecting to PUNDIT UPV Ultrasonic...
    </div>
  );
}
