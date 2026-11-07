"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InspectorProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inspector/dashboard/profile");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
      Loading Inspector Profile...
    </div>
  );
}

