"use client";

import React, { useState, useMemo } from "react";
import { 
  Activity, 
  Layers, 
  Sliders, 
  Maximize2, 
  Info, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Zap
} from "lucide-react";
import { PunditTest, formatVelocityMs } from "@/services/digitalEye";

interface PunditTomographyHeatmapProps {
  tests: PunditTest[];
  onSelectTest?: (test: PunditTest) => void;
  className?: string;
}

export default function PunditTomographyHeatmap({
  tests,
  onSelectTest,
  className = "",
}: PunditTomographyHeatmapProps) {
  const [threshold, setThreshold] = useState<number>(3500); // 3500 m/s default boundary for good concrete
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<"standard" | "high-contrast" | "inverted">("standard");

  // Filter tests with valid velocities
  const validTests = useMemo(() => {
    return tests.filter((t) => t.pulse_velocity_ms > 0);
  }, [tests]);

  // Selected test record
  const selectedTest = useMemo(() => {
    if (!selectedStationId) return validTests[0] || null;
    return validTests.find((t) => t.id === selectedStationId) || validTests[0] || null;
  }, [validTests, selectedStationId]);

  // Compute color based on velocity and threshold
  const getCellColor = (vel: number) => {
    if (colorMode === "high-contrast") {
      if (vel >= 4200) return "bg-cyan-500 text-slate-950";
      if (vel >= threshold) return "bg-emerald-500 text-slate-950";
      if (vel >= 3000) return "bg-amber-400 text-slate-950 animate-pulse";
      return "bg-rose-600 text-white font-bold animate-bounce";
    }

    if (colorMode === "inverted") {
      if (vel >= 4200) return "bg-blue-600 text-white";
      if (vel >= threshold) return "bg-teal-600 text-white";
      if (vel >= 3000) return "bg-orange-500 text-white";
      return "bg-rose-700 text-white";
    }

    // Standard acoustic gradient
    if (vel >= 4200) return "bg-emerald-600 text-white";
    if (vel >= threshold) return "bg-emerald-500 text-white";
    if (vel >= 3000) return "bg-amber-500 text-slate-950";
    return "bg-rose-600 text-white";
  };

  const getCellStatus = (vel: number) => {
    if (vel >= 4200) return "EXCELLENT (Dense matrix)";
    if (vel >= threshold) return "GOOD (BS compliant)";
    if (vel >= 3000) return "DOUBTFUL (Internal microcracks)";
    return "CRITICAL (Void / Honeycomb)";
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
      {/* Console Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Radio size={16} />
            </span>
            <h3 className="font-black text-slate-900 text-base tracking-tight">
              Interactive 2D Acoustic Tomography &amp; Velocity Gradient
            </h3>
            <span className="text-[10px] font-mono font-bold bg-slate-900 text-amber-400 px-2 py-0.5 rounded">
              BS 1881-203 Inversion
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconstructed ultrasonic velocity field across scanned structural elements. Visualizes internal density variations, micro-fracture planes, and honeycombs.
          </p>
        </div>

        {/* Sensitivity & Visual Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Sliders size={13} className="text-slate-400" />
            <span className="text-slate-500 font-semibold">Cutoff Threshold:</span>
            <span className="font-mono font-black text-amber-600">{threshold} m/s</span>
            <input
              type="range"
              min={2800}
              max={4200}
              step={50}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              title="Adjust compliance threshold boundary"
            />
          </div>

          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold">
            <button
              onClick={() => setColorMode("standard")}
              className={`px-2.5 py-1 transition-colors cursor-pointer ${
                colorMode === "standard" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setColorMode("high-contrast")}
              className={`px-2.5 py-1 transition-colors cursor-pointer ${
                colorMode === "high-contrast" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              High Contrast
            </button>
          </div>
        </div>
      </div>

      {/* Main Heatmap Visualizer Grid */}
      <div className="p-5">
        {validTests.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <Radio className="mb-2 text-slate-300" size={32} />
            <span className="text-xs font-semibold">No active UPV station tests with valid velocity data.</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Record tests to reconstruct the tomographic matrix.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* 2D Slice Representation (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-3 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>ACOUSTIC CROSS-SECTION GRID // TRANSIT INVERSION</span>
                  </span>
                  <span>{validTests.length} Grid Nodes</span>
                </div>

                {/* Simulated / Real Node Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {validTests.map((t, idx) => {
                    const isSelected = selectedTest?.id === t.id;
                    const cellColor = getCellColor(t.pulse_velocity_ms);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedStationId(t.id);
                          onSelectTest?.(t);
                        }}
                        className={`group relative p-3 rounded-xl transition-all duration-200 text-left flex flex-col justify-between h-24 border cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-cyan-400 scale-[1.03] shadow-lg shadow-cyan-950/50 border-white z-10"
                            : "border-slate-800 hover:border-slate-600 hover:scale-[1.01]"
                        } ${cellColor}`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-[10px] font-mono font-bold opacity-80 truncate">
                            #{idx + 1}
                          </span>
                          {t.pulse_velocity_ms < threshold && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                          )}
                        </div>

                        <div>
                          <span className="text-base font-black font-mono block tracking-tight leading-none">
                            {formatVelocityMs(t.pulse_velocity_ms)}
                          </span>
                          <span className="text-[9px] font-mono opacity-80 block mt-0.5">m/s</span>
                        </div>

                        <span className="text-[10px] font-semibold truncate block opacity-90">
                          {t.test_location || t.structural_element_name || "Station"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Heatmap Legend */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                      <span>&gt; 4,200 m/s (Sound)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                      <span>{threshold}–4,200 m/s (Compliant)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                      <span>3,000–{threshold} m/s (Doubtful)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-rose-600 inline-block" />
                      <span>&lt; 3,000 m/s (Void/Crack)</span>
                    </span>
                  </div>
                  <span className="text-slate-500">Click any node to inspect depth profile</span>
                </div>
              </div>
            </div>

            {/* Selected Station Deep-Dive Card (1 Col) */}
            {selectedTest && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                      Node Telemetry
                    </span>
                    <h4 className="text-base font-black text-white">
                      {selectedTest.test_location || "Selected Station"}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {selectedTest.test_reference}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                      selectedTest.pulse_velocity_ms >= threshold
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                        : "bg-rose-950/80 text-rose-400 border border-rose-500/40"
                    }`}
                  >
                    {selectedTest.pulse_velocity_ms >= threshold ? "PASSED" : "DEFECT DETECTED"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Pulse Velocity</span>
                    <span className="text-lg font-black text-cyan-300">
                      {formatVelocityMs(selectedTest.pulse_velocity_ms)} m/s
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Est. Strength</span>
                    <span className="text-lg font-black text-amber-300">
                      {selectedTest.estimated_compressive_strength_mpa != null
                        ? `${selectedTest.estimated_compressive_strength_mpa.toFixed(1)} MPa`
                        : "—"}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Transit Time</span>
                    <span className="text-sm font-bold text-slate-200">
                      {selectedTest.transit_time_us ? `${selectedTest.transit_time_us} µs` : "—"}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Path Length</span>
                    <span className="text-sm font-bold text-slate-200">
                      {selectedTest.path_length_mm ? `${selectedTest.path_length_mm} mm` : "—"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Inversion Quality State:</span>
                    <span className="font-bold text-slate-200">
                      {getCellStatus(selectedTest.pulse_velocity_ms)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Transducer Setup:</span>
                    <span className="font-bold text-cyan-400">
                      {selectedTest.transducer_type || "DIRECT"} ({selectedTest.transducer_frequency_khz || 54} kHz)
                    </span>
                  </div>
                  {selectedTest.concrete_age_days != null && (
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Concrete Age:</span>
                      <span className="font-bold text-slate-200">
                        {selectedTest.concrete_age_days} Days
                      </span>
                    </div>
                  )}
                </div>

                {onSelectTest && (
                  <button
                    type="button"
                    onClick={() => onSelectTest(selectedTest)}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/40"
                  >
                    <Zap size={14} />
                    <span>Inspect Raw Waveform Oscillogram</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
