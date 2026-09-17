"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BimRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/inspector/dashboard/digital-eye/trimble");
  }, [router]);

  return (
    <div className="p-8 text-center text-sm text-gray-500 font-mono">
      Redirecting to Trimble Connect BIM...
    </div>
  );
}
