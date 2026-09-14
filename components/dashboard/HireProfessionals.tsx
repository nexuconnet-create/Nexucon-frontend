"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { getLicensedProfessionals, LicensedProfessional } from "@/services/stakeholders";

const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const getStatusColor = (status: string): string => {
  const s = (status || "").toLowerCase();
  if (s.includes("active") || s.includes("valid") || s.includes("verified")) return "bg-green-500";
  if (s.includes("expire") || s.includes("revoked") || s.includes("suspended")) return "bg-red-500";
  return "bg-gray-400";
};

export default function HireProfessionals() {
  const [professionals, setProfessionals] = useState<LicensedProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLicensedProfessionals()
      .then((data) => {
        if (!cancelled) setProfessionals(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setProfessionals([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#022C4F] flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[#0F181F] font-extrabold text-sm">Hire Top Professionals</h3>
        <div className="w-8 h-8 rounded-full border border-[#022C4F] flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-50 transition-colors">
          <ArrowUpRight size={18} className="text-[#022C4F]" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-12 text-[11px] font-semibold text-gray-400 animate-pulse">
          Loading licensed professionals…
        </div>
      ) : professionals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12 text-[11px] font-medium text-gray-500 text-center px-4">
          No licensed professionals registered yet
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 h-full">
          {professionals.map((pro) => (
            <div key={pro.id} className="flex-1 min-w-[140px] border border-[#022C4F] rounded-2xl p-4 flex flex-col items-center justify-between hover:shadow-md transition-shadow">
              <div className="w-full flex justify-end mb-2">
                <span
                  className={`inline-block w-8 h-3 rounded-full ${getStatusColor(pro.license_status)}`}
                  title={pro.license_status || "Status not recorded"}
                />
              </div>

              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 mb-3 bg-[#022C4F]/10 flex items-center justify-center">
                <span className="text-xl font-extrabold text-[#022C4F]">{getInitials(pro.name)}</span>
              </div>

              <div className="text-center mb-4">
                <p className="text-xs font-bold text-[#0F181F]">{pro.name}</p>
                <p className="text-[10px] font-medium text-gray-500">{pro.role_title}</p>
                {pro.firm_name && (
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5">{pro.firm_name}</p>
                )}
              </div>

              <Button variant="outline" className="w-full h-[36px]">
                Hire for Project
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
