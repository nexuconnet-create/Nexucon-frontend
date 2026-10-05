"use client";

import React, { useMemo, useState } from "react";
import { Activity, ShieldCheck, AlertTriangle, Info, TrendingUp } from "lucide-react";
import { PunditTest, formatVelocityMs } from "@/services/digitalEye";

interface PunditElementVelocityBarChartProps {
  tests: PunditTest[];
  targetDesignStrengthMpa?: number;
  onSelectTest?: (test: PunditTest) => void;
  className?: string;
}

export default function PunditElementVelocityBarChart({
  tests,
  targetDesignStrengthMpa = 25,
  onSelectTest,
  className = "",
}: PunditElementVelocityBarChartProps) {
  const [metricMode, setMetricMode] = useState<"velocity" | "strength">("velocity");
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);

  // Filter & sort tests using natural numeric order (S1, S2, S3... S20)
  const sortedTests = useMemo(() => {
    const valid = tests.filter((t) => t.pulse_velocity_ms > 0);
    return [...valid].sort((a, b) => {
      const nameA = a.structural_element || a.test_location || a.test_reference || "";
      const nameB = b.structural_element || b.test_location || b.test_reference || "";
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" });
    });
  }, [tests]);

  // Calculated statistics
  const stats = useMemo(() => {
    if (sortedTests.length === 0) return { meanV: 0, minV: 0, maxV: 0, goodCount: 0, lowCount: 0 };
    const vList = sortedTests.map((t) => t.pulse_velocity_ms);
    const meanV = Math.round(vList.reduce((acc, curr) => acc + curr, 0) / vList.length);
    const minV = Math.min(...vList);
    const maxV = Math.max(...vList);
    const goodCount = vList.filter((v) => v >= 3500).length;
    const lowCount = vList.filter((v) => v < 3500).length;
    return { meanV, minV, maxV, goodCount, lowCount };
  }, [sortedTests]);

  const getVelocityBarColor = (v: number) => {
    if (v > 5000) return "bg-purple-600 border-purple-400";
    if (v >= 4500) return "bg-emerald-600 border-emerald-400";
    if (v >= 3500) return "bg-teal-500 border-teal-300";
    if (v >= 3000) return "bg-amber-500 border-amber-300";
    return "bg-rose-600 border-rose-400";
  };

  const getStrengthBarColor = (fcu: number | null | undefined) => {
    if (fcu == null) return "bg-slate-300 border-slate-400";
    if (fcu >= targetDesignStrengthMpa * 1.2) return "bg-emerald-600 border-emerald-400";
    if (fcu >= targetDesignStrengthMpa) return "bg-teal-500 border-teal-300";
    if (fcu >= targetDesignStrengthMpa * 0.8) return "bg-amber-500 border-amber-300";
    return "bg-rose-600 border-rose-400";
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden ${className}`}>
      {/* Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <TrendingUp size={16} />
            </span>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">
              Orderly Element Distribution &amp; Safety Threshold Bar Chart
            </h3>
            <span className="text-[10px] font-mono font-bold bg-slate-900 text-teal-300 px-2 py-0.5 rounded">
              BS 1881-203 Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual inspection of pulse velocities (V) and compressive strengths (f_cu) ordered sequentially across all structural elements (S1 through S{sortedTests.length}).
          </p>
        </div>

        {/* Metric Selector Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold p-0.5 bg-slate-100">
            <button
              onClick={() => setMetricMode("velocity")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === "velocity"
                  ? "bg-[#022C4F] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pulse Velocity (m/s)
            </button>
            <button
              onClick={() => setMetricMode("strength")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === "strength"
                  ? "bg-[#022C4F] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Comp. Strength (f_cu MPa)
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950 text-white border-b border-slate-800 text-xs">
        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Tested Elements</span>
          <span className="text-base font-bold font-mono text-cyan-300">{sortedTests.length} Elements</span>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Mean Velocity</span>
          <span className="text-base font-bold font-mono text-emerald-400">{formatVelocityMs(stats.meanV)} m/s</span>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Compliant (&ge; 3,500 m/s)</span>
          <span className="text-base font-bold font-mono text-teal-300">{stats.goodCount} / {sortedTests.length} ({Math.round((stats.goodCount / (sortedTests.length || 1)) * 100)}%)</span>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Doubtful (&lt; 3,500 m/s)</span>
          <span className={`text-base font-bold font-mono ${stats.lowCount > 0 ? "text-rose-400" : "text-slate-400"}`}>
            {stats.lowCount} Low Zone{stats.lowCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Bar Chart Canvas Container */}
      <div className="p-5 overflow-x-auto">
        {sortedTests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No active structural elements recorded for bar chart rendering.
          </div>
        ) : (
          <div className="min-w-[650px] space-y-4">
            {/* Legend & Threshold Reference Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 inline-block" />
                  <span>&gt;5000 (Rebar)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
                  <span>4500-5000 (Excellent)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" />
                  <span>3500-4500 (Good)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                  <span>3000-3500 (Fair)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 inline-block" />
                  <span>&lt;3000 (Poor/Void)</span>
                </span>
              </div>
              <span className="font-bold text-teal-800">
                {metricMode === "velocity" ? "Dashed Line: BS 1881-203 Threshold (3,500 m/s)" : `Dashed Line: Target Design Strength (${targetDesignStrengthMpa} MPa)`}
              </span>
            </div>

            {/* Bars Column List */}
            <div className="space-y-2 pt-2">
              {sortedTests.map((test, index) => {
                const elemName = test.structural_element || test.test_location || `S${index + 1}`;
                const vel = test.pulse_velocity_ms;
                const fcu = test.estimated_compressive_strength_mpa;
                const isHovered = hoveredStationId === test.id;

                // Percentages for bar width (max velocity 5500 m/s, max strength 60 MPa)
                const velPercent = Math.min(100, Math.max(5, (vel / 5500) * 100));
                const fcuPercent = fcu != null ? Math.min(100, Math.max(5, (fcu / 60) * 100)) : 0;
                const thresholdPercent = metricMode === "velocity" ? (3500 / 5500) * 100 : (targetDesignStrengthMpa / 60) * 100;

                return (
                  <div
                    key={test.id || index}
                    onMouseEnter={() => setHoveredStationId(test.id)}
                    onMouseLeave={() => setHoveredStationId(null)}
                    onClick={() => onSelectTest?.(test)}
                    className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isHovered
                        ? "bg-slate-100 border-teal-400 shadow-xs"
                        : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Element Tag */}
                      <div className="w-24 shrink-0 flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-teal-300 flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        <span className="truncate" title={elemName}>
                          {elemName}
                        </span>
                      </div>

                      {/* Bar Track Container with Threshold Line */}
                      <div className="flex-1 relative h-6 bg-slate-200/80 rounded-lg overflow-hidden border border-slate-300/60">
                        {/* Cutoff Threshold Line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 border-r-2 border-dashed border-teal-900 z-10 opacity-70"
                          style={{ left: `${thresholdPercent}%` }}
                        />

                        {/* Animated Bar Fill */}
                        <div
                          className={`h-full transition-all duration-500 rounded-r-md flex items-center justify-end pr-2 font-mono text-[11px] font-bold text-white shadow-2xs ${
                            metricMode === "velocity" ? getVelocityBarColor(vel) : getStrengthBarColor(fcu)
                          }`}
                          style={{ width: `${metricMode === "velocity" ? velPercent : fcuPercent}%` }}
                        >
                          {metricMode === "velocity" ? `${formatVelocityMs(vel)} m/s` : fcu != null ? `${fcu} MPa` : "Pending"}
                        </div>
                      </div>

                      {/* Numerical Summary Value */}
                      <div className="w-28 shrink-0 text-right font-mono text-xs font-bold">
                        {metricMode === "velocity" ? (
                          <span className={vel >= 3500 ? "text-teal-700" : "text-rose-600 font-black"}>
                            {formatVelocityMs(vel)} m/s
                          </span>
                        ) : (
                          <span className={fcu != null && fcu >= targetDesignStrengthMpa ? "text-teal-700" : "text-rose-600 font-black"}>
                            {fcu != null ? `${fcu} MPa` : "N/A"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
