"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Settings,
  ShieldCheck,
  BookOpen,
  Info,
  RefreshCw,
  Save,
  AlertTriangle,
  LineChart,
  CheckCircle2,
  Lock,
  Cpu,
  Sliders,
  Scale,
  Sparkles,
} from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import NexuconLinkNav from "@/components/dashboard/digital-eye/NexuconLinkNav";
import {
  ActiveCurveResponse,
  CurveType,
  NexuconLinkSettings,
  SEAnalysis,
  StandardEntry,
  getActiveCurve,
  getNexuconLinkSettings,
  getSEAnalysis,
  getStandards,
  updateNexuconLinkSettings,
} from "@/services/digitalEye";

const CURVE_TYPE_LABEL: Record<CurveType, string> = {
  linear: "Linear (Straight Line)",
  polynomial: "Polynomial (Degree 2)",
  exponential: "Exponential (Recommended)",
  sonreb: "SonReb (UPV + Rebound)",
  lookup: "Lookup Table",
};

const DEFINITION_LABELS: Record<string, string> = {
  r2_score: "R² (Coefficient of Determination)",
  standard_error: "Standard Error of Regression",
  mean_residual: "Mean Residual Bias",
  aic: "AIC (Akaike Information Criterion)",
  point_count: "Calibration Core Points",
  velocity_step: "Application Step",
  margin_scope: "Confidence Scope",
};

export default function NeuralLinkSettingsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [settings, setSettings] = useState<NexuconLinkSettings | null>(null);
  const [active, setActive] = useState<ActiveCurveResponse | null>(null);
  const [seAnalysis, setSeAnalysis] = useState<SEAnalysis | null>(null);
  const [standards, setStandards] = useState<StandardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [preferredType, setPreferredType] = useState<CurveType>("exponential");
  const [refStandard, setRefStandard] = useState<string>("BS 1881-203:1986");
  const [dispUnits, setDispUnits] = useState<string>("m/s");
  const [sePolicy, setSePolicy] = useState<string>("none");
  const [kFactor, setKFactor] = useState<number>(1.645);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [settingsRes, standardsRes, seRes] = await Promise.all([
        getNexuconLinkSettings().catch(() => null),
        getStandards().catch(() => []),
        selectedProjectId ? getSEAnalysis(selectedProjectId).catch(() => null) : Promise.resolve(null),
      ]);

      if (settingsRes) {
        setSettings(settingsRes);
        setPreferredType(settingsRes.preferred_curve_type || "exponential");
        setRefStandard(settingsRes.default_standard || "BS 1881-203:1986");
        setDispUnits(settingsRes.velocity_unit || "m/s");
      }
      setStandards(standardsRes);
      setSeAnalysis(seRes ? seRes.analysis : null);

      if (selectedProjectId) {
        const activeRes = await getActiveCurve(selectedProjectId).catch(() => null);
        setActive(activeRes);
        if (activeRes?.curve?.se_adjustment_method) {
          setSePolicy(activeRes.curve.se_adjustment_method);
          setKFactor(activeRes.curve.se_adjustment_factor ?? 1.645);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await updateNexuconLinkSettings({
        preferred_curve_type: preferredType as any,
        default_standard: refStandard,
        velocity_unit: dispUnits,
      });
      setSettings(updated);
      setSuccessMsg("Neural Link system calibration defaults updated successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-16 animate-in fade-in duration-300 bg-slate-50/50">
      <DigitalEyeHeader
        activePillar="PUNDIT: System & Calibration Settings"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      {/* Neural Link Navigation Ribbon */}
      <div className="mb-6">
        <NexuconLinkNav subtitle="System Defaults" />
      </div>

      {/* Hero Configuration Banner */}
      <div className="bg-gradient-to-r from-[#022C4F] via-[#0A192F] to-[#0F172A] rounded-2xl p-6 text-white shadow-xl border border-slate-700/60 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 flex items-center gap-1">
                <Settings size={12} />
                <span>Engine Configuration</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                Governs FCU Conversion
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Neural Link Calibration & Standards Architecture
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Define the platform-wide mathematical regression defaults, statutory reference standard, and
              standard-error margins applied during compressive strength evaluation.
            </p>
          </div>

          <button
            onClick={loadAll}
            disabled={isLoading}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calibration Engine Defaults */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6"
          >
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Platform Regression Defaults</h3>
                  <p className="text-xs text-slate-500">Configure default curve model and units.</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-[#022C4F] hover:bg-[#03467B] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSaving ? "Saving…" : "Save Preferences"}</span>
              </button>
            </div>

            <div className="space-y-5">
              {/* Preferred Curve Type */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Preferred Model Architecture
                </label>
                <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                  Concrete strength behavior is inherently non-linear across pulse velocities. The exponential model
                  (fcu = a · e^(b·V)) is the recommended international engineering default.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(["linear", "polynomial", "exponential", "sonreb"] as CurveType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPreferredType(type)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        preferredType === type
                          ? "border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20"
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{CURVE_TYPE_LABEL[type]}</span>
                        {preferredType === type && <CheckCircle2 size={14} className="text-blue-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">
                        {type === "exponential"
                          ? "BS 1881 / RILEM standard for non-destructive correlation"
                          : type === "sonreb"
                          ? "Combined UPV + Rebound Hammer multi-variable regression"
                          : "Direct regression fit"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Standard */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Default Regulatory Standard
                </label>
                <select
                  value={refStandard}
                  onChange={(e) => setRefStandard(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="BS 1881-203:1986">BS 1881-203:1986 (Testing Concrete — Pulse Velocity)</option>
                  <option value="BS EN 12504-4:2021">BS EN 12504-4:2021 (Determination of Ultrasonic Pulse Velocity)</option>
                  <option value="ASTM C597-16">ASTM C597-16 (Standard Test Method for Pulse Velocity)</option>
                  <option value="IS 13311-1:1992">IS 13311-1:1992 (Non-Destructive Testing of Concrete)</option>
                </select>
              </div>

              {/* Display Units */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Engineering Velocity Units
                </label>
                <div className="flex items-center gap-3">
                  {["m/s", "km/s"].map((u) => (
                    <label key={u} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="dispUnits"
                        value={u}
                        checked={dispUnits === u}
                        onChange={(e) => setDispUnits(e.target.value)}
                        className="text-blue-600"
                      />
                      <span>{u}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </form>

          {/* Active Project Calibration Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <LineChart size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Active Project Calibration Benchmark</h3>
                  <p className="text-xs text-slate-500">Live snapshot of the selected project curve.</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-teal-100 text-teal-800">
                {active?.source === "project_setting" ? "PROJECT CALIBRATION" : "PLATFORM DEFAULT"}
              </span>
            </div>

            {active?.curve ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Model</span>
                    <span className="text-sm font-black text-slate-900 capitalize">{active.curve.curve_type}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Fit (R²)</span>
                    <span className="text-sm font-black text-blue-700 font-mono">
                      {active.curve.r2_score ? active.curve.r2_score.toFixed(3) : "—"}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Standard Error</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {active.curve.standard_error ? `±${active.curve.standard_error.toFixed(2)} MPa` : "—"}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Core Pairs</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {active.curve.data_points?.length ?? "—"} pts
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-xl font-mono text-xs flex items-center justify-between">
                  <span className="text-slate-400">Formula:</span>
                  <span className="text-cyan-300 font-bold truncate max-w-xs" title={active.curve.formula_display || undefined}>
                    {active.curve.formula_display || (active.curve.formula_params ? JSON.stringify(active.curve.formula_params) : "fcu = a · e^(b · Vp)")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Select a project above to inspect its active strength curve parameters.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Standards Registry & Definitions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm mb-3">
              <BookOpen size={16} className="text-blue-600" />
              <span>International Standards Library</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Authoritative standards governing ultrasonic pulse velocity non-destructive testing:
            </p>

            <div className="space-y-3">
              {standards.map((st) => (
                <div key={st.code} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-900 font-mono">{st.code}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase bg-blue-100 text-blue-800">
                      {st.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{st.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{st.scope}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Definitions Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg shadow-slate-950/20 border border-slate-800">
            <div className="flex items-center gap-2 font-black text-sm text-cyan-400 mb-3">
              <Info size={16} />
              <span>Statistical Evaluation Metrics</span>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <span className="font-bold text-white block">R² Coefficient</span>
                <span className="text-[11px] text-slate-400 leading-relaxed">
                  Proportion of variance in core strength explained by ultrasonic pulse velocity (0.0 to 1.0). Target ≥ 0.85.
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="font-bold text-white block">Standard Error (s)</span>
                <span className="text-[11px] text-slate-400 leading-relaxed">
                  Residual standard deviation between predicted and observed compressive strengths (s = √(SSE / (n-k))).
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="font-bold text-white block">Akaike Information (AIC)</span>
                <span className="text-[11px] text-slate-400 leading-relaxed">
                  Penalizes over-parameterized models to select the most reliable, generalizable curve architecture.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
