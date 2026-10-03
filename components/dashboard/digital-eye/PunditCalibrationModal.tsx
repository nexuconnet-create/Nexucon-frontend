"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  HelpCircle,
  TrendingUp,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  FileCheck2,
} from "lucide-react";
import { CurveType, BatchCalibrationPayload } from "@/services/digitalEye";

interface PunditCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
  batchId?: string;
  batchName?: string;
  elementCount?: number;
  onConfirmCalibrationAndAnalyze: (calibration: BatchCalibrationPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export default function PunditCalibrationModal({
  isOpen,
  onClose,
  projectId,
  projectName = "Active Project",
  batchId,
  batchName = "Target Scan Batch",
  elementCount = 48,
  onConfirmCalibrationAndAnalyze,
  isSubmitting = false,
}: PunditCalibrationModalProps) {
  // 1. Mandatory Default: EXPONENTIAL MODEL (Non-negotiable per review meeting)
  const [curveType, setCurveType] = useState<CurveType>("exponential");

  // Calibration coefficients for exponential: f_cu = a * exp(b * V_km/s) + c
  // or with V in m/s: f_cu = a * exp(b * V_ms) + c
  // Standard recommended defaults:
  // a = 1.20, b = 0.85 (for V in km/s) or 0.00085 (for V in m/s), c = 0.0
  const [paramA, setParamA] = useState<number>(1.2);
  const [paramB, setParamB] = useState<number>(0.85); // exponent per km/s
  const [paramC, setParamC] = useState<number>(0.0); // intercept offset MPa

  // Target concrete design strength (e.g. C25/30 -> 25 N/mm2)
  const [designStrengthMpa, setDesignStrengthMpa] = useState<number>(25.0);
  const [calibrationNotes, setCalibrationNotes] = useState<string>(
    "Calibrated for project mix design using non-linear exponential acoustic response."
  );

  // Calibration Cube Test data points (optional ground truth pairs)
  const [cubePoints, setCubePoints] = useState<Array<{ velocity_ms: number; cube_strength_mpa: number }>>([
    { velocity_ms: 3200, cube_strength_mpa: 18.5 },
    { velocity_ms: 3800, cube_strength_mpa: 29.8 },
    { velocity_ms: 4300, cube_strength_mpa: 45.2 },
  ]);
  const [newVel, setNewVel] = useState<string>("");
  const [newCube, setNewCube] = useState<string>("");

  // Function to calculate f_cu based on current parameters
  const calculateStrength = (velocityMs: number, type: CurveType): number | null => {
    if (velocityMs < 2000 || velocityMs > 5000) return null;
    const vKmS = velocityMs / 1000;

    if (type === "exponential") {
      // f_cu = a * exp(b * V_km) + c
      const res = paramA * Math.exp(paramB * vKmS) + paramC;
      return Number(res.toFixed(1));
    } else if (type === "linear") {
      // f_cu = 8.961 * V_km - 7.97
      const res = 8.961 * vKmS - 7.97;
      return Number(res.toFixed(1));
    } else if (type === "polynomial") {
      // f_cu = -12.5 + 4.2*V + 1.8*V^2
      const res = -12.5 + 4.2 * vKmS + 1.8 * Math.pow(vKmS, 2);
      return Number(res.toFixed(1));
    } else if (type === "sonreb") {
      // f_cu = 0.0286 * (V_ms^0.84) * (R^0.35) [assume R=32]
      const res = 0.0286 * Math.pow(velocityMs, 0.84) * Math.pow(32, 0.35);
      return Number(res.toFixed(1));
    }
    return null;
  };

  // Sample points across standard concrete velocity bands
  const testVelocities = [2500, 3000, 3500, 3750, 4000, 4500, 4800];

  const simulationCurve = useMemo(() => {
    return testVelocities.map((v) => {
      const expStrength = calculateStrength(v, "exponential");
      const linearStrength = calculateStrength(v, "linear");
      const activeStrength = calculateStrength(v, curveType);
      const isAboveDesign = activeStrength !== null && activeStrength >= designStrengthMpa;
      return {
        velocity: v,
        expStrength,
        linearStrength,
        activeStrength,
        isAboveDesign,
      };
    });
  }, [paramA, paramB, paramC, curveType, designStrengthMpa]);

  if (!isOpen) return null;

  const handleAddCubePoint = () => {
    const v = Number(newVel);
    const c = Number(newCube);
    if (!v || !c || v < 1500 || v > 5500 || c <= 0 || c > 100) {
      alert("Please enter a valid pulse velocity (1500–5500 m/s) and cube strength (1–100 MPa).");
      return;
    }
    setCubePoints([...cubePoints, { velocity_ms: v, cube_strength_mpa: c }]);
    setNewVel("");
    setNewCube("");
  };

  const handleRemoveCubePoint = (index: number) => {
    setCubePoints(cubePoints.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: BatchCalibrationPayload = {
      project_id: projectId,
      batch_id: batchId,
      curve_type: curveType,
      params: {
        a: Number(paramA),
        b: Number(paramB),
        c: Number(paramC),
      },
      design_strength_mpa: Number(designStrengthMpa),
      notes: calibrationNotes.trim(),
      cube_correlation_points: cubePoints,
    };

    await onConfirmCalibrationAndAnalyze(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#022C4F] text-white p-6 flex items-start justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Non-Negotiable Pre-Analysis Step
              </span>
              <span className="text-slate-300 text-xs">
                Project: <strong>{projectName}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2.5">
              <Sliders size={20} className="text-cyan-400" />
              Manual UPV-to-Strength (f_cu) Calibration Model
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Concrete strength is project-specific. Per the executive engineering review, automatic analysis is suspended until the correlation model is calibrated for this scan batch.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Batch Info Badge */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Layers size={18} className="text-[#0284C7]" />
              <div>
                <span className="font-bold text-[#022C4F]">Selected Scan Batch / Folder:</span>{" "}
                <span className="text-slate-700">{batchName}</span>
                <span className="ml-2 font-mono font-bold text-[#0284C7] bg-white px-2 py-0.5 rounded border border-sky-200">
                  {elementCount} Elements Verified
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500">
              Isolating this batch guarantees no data clashes or false element counts.
            </span>
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Select Correlation Model</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Default: Exponential (Non-Linear Physics)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Exponential (Mandatory Default) */}
              <div
                onClick={() => setCurveType("exponential")}
                className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                  curveType === "exponential"
                    ? "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">Exponential</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    RECOMMENDED
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-800 font-semibold mb-1">
                  f_cu = a · e^(b·V) + c
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Accurately models non-linear concrete behavior, especially around strength thresholds.
                </p>
              </div>

              {/* Polynomial */}
              <div
                onClick={() => setCurveType("polynomial")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  curveType === "polynomial"
                    ? "bg-sky-50/60 border-sky-500 ring-2 ring-sky-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="text-xs font-bold text-slate-900 block mb-1">Polynomial (2nd Deg)</span>
                <div className="text-[11px] font-mono text-sky-800 font-semibold mb-1">
                  f_cu = a + b·V + c·V²
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Second-order curvature across wide velocity ranges.
                </p>
              </div>

              {/* SonReb */}
              <div
                onClick={() => setCurveType("sonreb")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  curveType === "sonreb"
                    ? "bg-purple-50/60 border-purple-500 ring-2 ring-purple-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="text-xs font-bold text-slate-900 block mb-1">SonReb Combined</span>
                <div className="text-[11px] font-mono text-purple-800 font-semibold mb-1">
                  f_cu = a · V^b · R^c
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Combines UPV velocity with rebound hammer (R).
                </p>
              </div>

              {/* Linear (With Warning) */}
              <div
                onClick={() => setCurveType("linear")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  curveType === "linear"
                    ? "bg-rose-50/60 border-rose-400 ring-2 ring-rose-400/20"
                    : "bg-white border-slate-200 hover:border-slate-300 opacity-75"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">Linear</span>
                  <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                    NOT RECOMMENDED
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-700 font-semibold mb-1">
                  f_cu = m·V + c
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Contradicts non-linear behavior; causes threshold misclassifications.
                </p>
              </div>
            </div>

            {/* Warning if Linear is selected */}
            {curveType === "linear" && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Critical Warning:</strong> The review meeting identified linear models as a core flaw in past reports. Concrete compressive strength does not grow linearly with acoustic wave speed. Use the Exponential model unless legally mandated otherwise.
                </div>
              </div>
            )}
          </div>

          {/* Model Parameter Tuning */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>2. Mathematical Parameter Calibration</span>
              <span className="font-mono text-[11px] text-[#0284C7]">
                Formula: f_cu = {paramA} · e^({paramB} · V_km/s) + {paramC}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Scaling Factor (a)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paramA}
                  onChange={(e) => setParamA(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-[#0284C7]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Baseline: 1.15 – 1.25</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Velocity Exponent (b)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paramB}
                  onChange={(e) => setParamB(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-[#0284C7]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Baseline: 0.80 – 0.90 per km/s</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Intercept Offset (c) MPa
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={paramC}
                  onChange={(e) => setParamC(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-[#0284C7]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Offset in MPa (Default: 0.0)</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Design Target (f_cu) MPa *
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={designStrengthMpa}
                  onChange={(e) => setDesignStrengthMpa(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#022C4F] outline-none focus:border-[#0284C7]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">e.g. 25 MPa for C25/30</span>
              </div>
            </div>
          </div>

          {/* Interactive Calibration Table / Simulation Curve */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider">
                3. Real-Time Sensitivity Table across Standard Pulse Velocities
              </span>
              <span className="text-[11px] text-slate-500">
                Design Threshold: <strong>{designStrengthMpa} MPa</strong>
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Pulse Velocity (V)</th>
                    <th className="py-2.5 px-3">BS 1881-203 Band</th>
                    <th className="py-2.5 px-3">Calibrated f_cu (MPa)</th>
                    <th className="py-2.5 px-3">Linear Old Model</th>
                    <th className="py-2.5 px-3">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {simulationCurve.map((row) => (
                    <tr key={row.velocity} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-mono font-bold text-[#022C4F]">
                        {row.velocity} m/s
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600">
                        {row.velocity >= 4500
                          ? "EXCELLENT"
                          : row.velocity >= 3500
                          ? "GOOD"
                          : row.velocity >= 3000
                          ? "MEDIUM (FAIR)"
                          : "DOUBTFUL / POOR"}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                        {row.activeStrength !== null ? `${row.activeStrength} MPa` : "—"}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-400 line-through">
                        {row.linearStrength !== null ? `${row.linearStrength} MPa` : "—"}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            row.isAboveDesign
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {row.isAboveDesign ? "MEETS SPEC (PASS)" : "BELOW TARGET (FAIL)"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optional Project Cube Correlation Points */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  4. Site Laboratory Cube Crush Calibration Pairs (Ground Truth)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Add destructive cube test pairs from this project to mathematically ground the curve.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                placeholder="UPV (e.g. 3950 m/s)"
                value={newVel}
                onChange={(e) => setNewVel(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono w-40 outline-none focus:border-[#0284C7]"
              />
              <input
                type="number"
                placeholder="Cube Strength (e.g. 31.5 MPa)"
                value={newCube}
                onChange={(e) => setNewCube(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono w-48 outline-none focus:border-[#0284C7]"
              />
              <button
                type="button"
                onClick={handleAddCubePoint}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                + Add Calibration Pair
              </button>
            </div>

            {cubePoints.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {cubePoints.map((pt, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-[11px] font-mono px-2.5 py-1 rounded-lg text-slate-700 shadow-2xs"
                  >
                    <span>
                      {pt.velocity_ms} m/s &rarr; <strong>{pt.cube_strength_mpa} MPa</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCubePoint(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Calibration Record Notes & Engineering Justification
            </label>
            <textarea
              rows={2}
              value={calibrationNotes}
              onChange={(e) => setCalibrationNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0284C7]"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>
              Mandatory calibration will be sealed with this analysis run.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Activity size={14} className="animate-spin" />
                  <span>Calibrating & Running Analysis...</span>
                </>
              ) : (
                <>
                  <FileCheck2 size={15} />
                  <span>Confirm Calibration & Execute Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
