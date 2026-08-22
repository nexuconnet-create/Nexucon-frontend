"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, AlertTriangle, ArrowRight } from "lucide-react";

export default function IssuesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/government/dashboard/bim/issues");
  }, [router]);

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center animate-pulse">
        <Box size={28} />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-black text-[#022C4F]">Redirecting to BIM Model Issues...</h2>
        <p className="text-xs text-slate-500 max-w-md">
          Issue management has been organized into <strong>BIM & Model Review</strong> (for 3D clashes & spatial deviations) and <strong>Site Monitoring</strong> (for field defects).
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => router.push("/government/dashboard/bim/issues")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Box size={14} /> Go to BIM Issues
        </button>
        <button
          onClick={() => router.push("/government/dashboard/monitoring/issues")}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <AlertTriangle size={14} className="text-amber-500" /> Go to Site Issues
        </button>
      </div>
    </div>
  );
}
