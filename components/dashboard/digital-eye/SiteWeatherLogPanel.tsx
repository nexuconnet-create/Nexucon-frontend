"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  CloudDrizzle,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Trash2,
  ShieldCheck,
  Gauge,
  Info,
  ChevronRight,
  Layers,
  FileText,
  Clock,
  UserCheck,
  Sparkles,
  Globe,
} from "lucide-react";
import {
  PunditWeatherCondition,
  TestingDayWeatherSummary,
  getPunditTestingDays,
  getPunditWeatherConditions,
  createOrUpdatePunditWeatherCondition,
  deletePunditWeatherCondition,
  syncPunditWeatherToTests,
  getPunditTests,
  fetchGoogleWeather,
  GoogleWeatherTelemetry,
} from "@/services/digitalEye";

interface SiteWeatherLogPanelProps {
  projectId?: string;
  batchId?: string;
  readOnly?: boolean;
  onWeatherChanged?: (records: PunditWeatherCondition[]) => void;
  className?: string;
}

const WEATHER_PRESETS = [
  {
    id: "Clear / Sunny",
    label: "Clear / Sunny",
    icon: Sun,
    color: "amber",
    bg: "bg-amber-50 text-amber-700 border-amber-300",
    defaultTemp: 32,
    defaultHumidity: 55,
    defaultSurface: "Dry",
    defaultPrecip: "None",
    description: "Optimal coupling and baseline propagation per BS 1881-203.",
  },
  {
    id: "Partly Cloudy",
    label: "Partly Cloudy",
    icon: CloudSun,
    color: "sky",
    bg: "bg-sky-50 text-sky-700 border-sky-300",
    defaultTemp: 29,
    defaultHumidity: 65,
    defaultSurface: "Dry",
    defaultPrecip: "None",
    description: "Stable ambient conditions; transducer coupling verified.",
  },
  {
    id: "Overcast / High Humidity",
    label: "Overcast / High Humidity",
    icon: Cloud,
    color: "slate",
    bg: "bg-slate-100 text-slate-700 border-slate-300",
    defaultTemp: 27,
    defaultHumidity: 82,
    defaultSurface: "Damp",
    defaultPrecip: "None",
    description: "High relative humidity; minimal couplant evaporation.",
  },
  {
    id: "Intermittent Drizzle",
    label: "Intermittent Drizzle",
    icon: CloudDrizzle,
    color: "indigo",
    bg: "bg-indigo-50 text-indigo-700 border-indigo-300",
    defaultTemp: 24,
    defaultHumidity: 88,
    defaultSurface: "Damp",
    defaultPrecip: "Light Drizzle",
    description: "Surface dampness noted; acoustic couplant shielded from rain.",
  },
  {
    id: "Adverse Weather / Heavy Downpour",
    label: "Adverse Weather / Rain",
    icon: CloudRain,
    color: "rose",
    bg: "bg-rose-50 text-rose-700 border-rose-300",
    defaultTemp: 23,
    defaultHumidity: 94,
    defaultSurface: "Wet",
    defaultPrecip: "Heavy Downpour",
    description: "Surface water film detected; testing paused or shielded under shelter.",
  },
  {
    id: "Hot & Arid (Dry Couplant)",
    label: "Hot & Arid",
    icon: Thermometer,
    color: "orange",
    bg: "bg-orange-50 text-orange-700 border-orange-300",
    defaultTemp: 36,
    defaultHumidity: 35,
    defaultSurface: "Dry",
    defaultPrecip: "None",
    description: "Elevated temperature; rapid acoustic couplant drying requires rapid measurement.",
  },
];

export default function SiteWeatherLogPanel({
  projectId,
  batchId,
  readOnly = false,
  onWeatherChanged,
  className = "",
}: SiteWeatherLogPanelProps) {
  const [testingDays, setTestingDays] = useState<TestingDayWeatherSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [allWeatherRecords, setAllWeatherRecords] = useState<PunditWeatherCondition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Google Weather Platform state
  const [googleTelemetry, setGoogleTelemetry] = useState<GoogleWeatherTelemetry | null>(null);
  const [isFetchingGoogle, setIsFetchingGoogle] = useState<boolean>(false);

  // Form fields
  const [currentWeatherId, setCurrentWeatherId] = useState<string | null>(null);
  const [formCondition, setFormCondition] = useState<string>("Clear / Sunny");
  const [formTempC, setFormTempC] = useState<number>(31);
  const [formHumidity, setFormHumidity] = useState<number>(62);
  const [formSurface, setFormSurface] = useState<string>("Dry");
  const [formPrecipitation, setFormPrecipitation] = useState<string>("None");
  const [formWindKmh, setFormWindKmh] = useState<number>(10);
  const [formImpact, setFormImpact] = useState<string>(
    "Optimal acoustic coupling achieved across all structural stations per BS 1881-203."
  );
  const [formRecorderName, setFormRecorderName] = useState<string>("Site Structural Inspector");
  const [formNotes, setFormNotes] = useState<string>("");

  const activeLoadIdRef = React.useRef(0);
  const activeWeatherReqRef = React.useRef(0);

  const resetFormState = (targetDate?: string) => {
    const defaultDate = targetDate || new Date().toISOString().slice(0, 10);
    setCurrentWeatherId(null);
    setGoogleTelemetry(null);
    setSyncSuccessMsg(null);
    setSelectedDate(defaultDate);
    setFormCondition("Clear / Sunny");
    setFormTempC(31);
    setFormHumidity(62);
    setFormSurface("Dry");
    setFormPrecipitation("None");
    setFormWindKmh(10);
    setFormImpact(
      "Optimal acoustic coupling achieved across all structural stations per BS 1881-203."
    );
    setFormRecorderName("Site Structural Inspector");
    setFormNotes("");
  };

  const toast = (message: string, type: "success" | "error" | "info") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message, type },
        })
      );
    }
  };

  const loadData = async () => {
    const currentLoadId = ++activeLoadIdRef.current;
    const targetProjectId = projectId;
    const targetBatchId = batchId;

    if (!projectId) {
      setTestingDays([]);
      setAllWeatherRecords([]);
      resetFormState();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [days, records] = await Promise.all([
        getPunditTestingDays(projectId),
        getPunditWeatherConditions(projectId, batchId),
      ]);

      // Guard: Ignore if another loadData was triggered or project changed in flight
      if (
        activeLoadIdRef.current !== currentLoadId ||
        projectId !== targetProjectId ||
        batchId !== targetBatchId
      ) {
        return;
      }

      setTestingDays(days);
      setAllWeatherRecords(records);
      if (onWeatherChanged) onWeatherChanged(records);

      // Default select the earliest missing day or the latest testing day
      if (days.length > 0) {
        const missingDay = days.find((d) => !d.has_weather);
        const targetDay = missingDay ? missingDay.date : days[0].date;
        setSelectedDate(targetDay);
        populateFormForDate(targetDay, days, records);
      } else {
        // Reset record ID and form whenever testing days are empty for the project
        const today = new Date().toISOString().slice(0, 10);
        resetFormState(today);
        if (records.length > 0) {
          const latestRecord = records[0];
          setSelectedDate(latestRecord.test_date);
          populateFormForDate(latestRecord.test_date, days, records);
        }
      }
    } catch (err: any) {
      if (activeLoadIdRef.current === currentLoadId) {
        toast("Could not load testing days or weather telemetry.", "error");
      }
    } finally {
      if (activeLoadIdRef.current === currentLoadId) {
        setIsLoading(false);
      }
    }
  };

  const populateFormForDate = (
    dateStr: string,
    days: TestingDayWeatherSummary[] = testingDays,
    records: PunditWeatherCondition[] = allWeatherRecords
  ) => {
    const existing = records.find((r) => r.test_date === dateStr);
    const daySummary = days.find((d) => d.date === dateStr);

    if (existing) {
      setCurrentWeatherId(existing.id);
      setFormCondition(existing.weather_condition || "Clear / Sunny");
      setFormTempC(existing.temperature_c ?? 31);
      setFormHumidity(existing.relative_humidity_pct ?? 62);
      setFormSurface(existing.surface_condition || "Dry");
      setFormPrecipitation(existing.precipitation || "None");
      setFormWindKmh(existing.wind_speed_kmh ?? 10);
      setFormImpact(
        existing.impact_on_testing ||
          "Optimal acoustic coupling achieved across all structural stations per BS 1881-203."
      );
      setFormRecorderName(existing.recorded_by_name || "Site Structural Inspector");
      setFormNotes(existing.notes || "");
    } else if (daySummary && daySummary.test_weather_conditions.length > 0) {
      // Pre-fill from test's existing string if any
      const c = daySummary.test_weather_conditions[0];
      setCurrentWeatherId(null);
      setFormCondition(c);
      setFormTempC(30);
      setFormHumidity(60);
      setFormSurface("Dry");
      setFormPrecipitation("None");
      setFormWindKmh(10);
      setFormImpact(
        `Site weather captured as '${c}' during ultrasonic testing on ${dateStr}.`
      );
      setFormRecorderName("Site Structural Inspector");
      setFormNotes("");
    } else {
      // New record for this date
      setCurrentWeatherId(null);
      setFormCondition("Clear / Sunny");
      setFormTempC(31);
      setFormHumidity(62);
      setFormSurface("Dry");
      setFormPrecipitation("None");
      setFormWindKmh(10);
      setFormImpact(
        "Optimal acoustic coupling achieved across all structural stations per BS 1881-203."
      );
      setFormRecorderName("Site Structural Inspector");
      setFormNotes("");
    }
  };

  useEffect(() => {
    resetFormState();
    loadData();
  }, [projectId, batchId]);

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    populateFormForDate(dateStr);
    setSyncSuccessMsg(null);
  };

  const handleApplyPreset = (preset: (typeof WEATHER_PRESETS)[0]) => {
    setFormCondition(preset.label);
    setFormTempC(preset.defaultTemp);
    setFormHumidity(preset.defaultHumidity);
    setFormSurface(preset.defaultSurface);
    setFormPrecipitation(preset.defaultPrecip);
    setFormImpact(preset.description);
  };

  const handleFetchGoogleWeather = async (targetDateOverride?: string, autoApply = false) => {
    if (!projectId) {
      toast("Please select an active project first.", "error");
      return;
    }
    const currentReqId = ++activeWeatherReqRef.current;
    const targetProjectId = projectId;
    const dateToFetch = targetDateOverride || selectedDate || new Date().toISOString().split("T")[0];

    setIsFetchingGoogle(true);
    try {
      const data = await fetchGoogleWeather(projectId, {
        date: dateToFetch,
        autoApply,
      });

      // Guard: Ignore if another weather request was triggered
      if (activeWeatherReqRef.current !== currentReqId || projectId !== targetProjectId) {
        return;
      }
      // If user switched date in the panel while fetching without override, ignore stale
      if (!targetDateOverride && selectedDate !== dateToFetch) {
        return;
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to retrieve Google Weather telemetry.");
      }

      setGoogleTelemetry(data);
      if (data.temperature_c !== undefined) setFormTempC(Math.round(data.temperature_c * 10) / 10);
      if (data.relative_humidity_pct !== undefined) setFormHumidity(Math.round(data.relative_humidity_pct));
      if (data.weather_condition) setFormCondition(data.weather_condition);
      if (data.surface_condition) setFormSurface(data.surface_condition);
      if (data.precipitation) setFormPrecipitation(data.precipitation);
      if (data.wind_speed_kmh !== undefined) setFormWindKmh(Math.round(data.wind_speed_kmh));
      if (data.impact_on_testing) setFormImpact(data.impact_on_testing);
      if (!selectedDate) setSelectedDate(dateToFetch);

      if (autoApply) {
        if (data.applied === true) {
          if (data.weather_record_id) {
            setCurrentWeatherId(data.weather_record_id);
          }
          toast(`Google Weather applied & synchronized for ${dateToFetch} (${data.weather_condition}).`, "success");
          setSyncSuccessMsg(
            `Google Weather Platform verified & applied for ${dateToFetch}. Synchronized to ${data.synced_tests_count ?? "all"} station tests.`
          );
          await loadData();
        } else {
          // Explicitly save & sync the fetched values if backend did not confirm application
          await handleSaveWeather(undefined, {
            project_id: projectId,
            batch_id: batchId || null,
            test_date: dateToFetch,
            weather_condition: data.weather_condition || formCondition,
            temperature_c: data.temperature_c !== undefined ? Number(data.temperature_c) : Number(formTempC),
            relative_humidity_pct: data.relative_humidity_pct !== undefined ? Number(data.relative_humidity_pct) : Number(formHumidity),
            surface_condition: data.surface_condition || formSurface,
            precipitation: data.precipitation || formPrecipitation,
            wind_speed_kmh: data.wind_speed_kmh !== undefined ? Number(data.wind_speed_kmh) : Number(formWindKmh),
            impact_on_testing: data.impact_on_testing || formImpact,
            notes: `Auto-synchronized via Google Weather Platform (${data.condition_description || data.weather_condition}).`,
          });
        }
      } else {
        toast(`Live Google Weather retrieved for ${dateToFetch}: ${data.temperature_c}°C, ${data.condition_description}.`, "info");
      }
    } catch (err: any) {
      if (activeWeatherReqRef.current === currentReqId) {
        toast(err.message || "Failed to fetch Google Weather telemetry.", "error");
      }
    } finally {
      if (activeWeatherReqRef.current === currentReqId) {
        setIsFetchingGoogle(false);
      }
    }
  };

  const handleSaveWeather = async (
    e?: React.FormEvent,
    payloadOverride?: Partial<PunditWeatherCondition>
  ) => {
    if (e) e.preventDefault();
    if (!projectId) {
      toast("Please select an active project first.", "error");
      return;
    }
    const targetDate = payloadOverride?.test_date || selectedDate;
    if (!targetDate) {
      toast("Please specify the date testing occurred.", "error");
      return;
    }

    setIsSaving(true);
    setSyncSuccessMsg(null);
    try {
      const payload: Partial<PunditWeatherCondition> = {
        id: currentWeatherId || undefined,
        project_id: projectId,
        batch_id: batchId || null,
        test_date: targetDate,
        weather_condition: formCondition.trim(),
        temperature_c: Number(formTempC),
        relative_humidity_pct: Number(formHumidity),
        surface_condition: formSurface,
        precipitation: formPrecipitation,
        wind_speed_kmh: Number(formWindKmh),
        impact_on_testing: formImpact.trim(),
        recorded_by_name: formRecorderName.trim() || "Site Structural Inspector",
        notes: formNotes.trim(),
        ...payloadOverride,
      };

      const saved = await createOrUpdatePunditWeatherCondition(payload);
      setCurrentWeatherId(saved.id);

      // Trigger automatic sync to tests for this testing date
      let syncedCount = 0;
      if (saved.id && !saved.id.startsWith("local-")) {
        const syncRes = await syncPunditWeatherToTests(saved.id);
        syncedCount = syncRes.updated_test_count;
      }

      toast(
        `Weather condition saved & synchronized for ${targetDate} (${saved.weather_condition}).`,
        "success"
      );
      setSyncSuccessMsg(
        `Synchronized to ${syncedCount > 0 ? `${syncedCount} site test stations` : "site activities"} on ${targetDate}. Reflected in Section 3.1 NDT Dossier.`
      );

      // Reload days and records
      await loadData();
    } catch (err: any) {
      toast(
        err?.response?.data?.detail || err?.message || "Failed to save weather condition.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSync = async () => {
    if (!currentWeatherId) {
      await handleSaveWeather();
      return;
    }
    setIsSyncing(true);
    try {
      const result = await syncPunditWeatherToTests(currentWeatherId);
      toast(
        `Synchronized weather to ${result.updated_test_count} tests on ${selectedDate}.`,
        "success"
      );
      setSyncSuccessMsg(
        `Successfully linked weather conditions to ${result.updated_test_count} test stations on site.`
      );
    } catch (err: any) {
      toast(
        err?.message || "Failed to synchronize weather condition with station tests.",
        "error"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteWeather = async () => {
    if (!currentWeatherId) return;
    if (!confirm(`Remove recorded weather condition for ${selectedDate}?`)) return;

    try {
      await deletePunditWeatherCondition(currentWeatherId);
      toast(`Weather record for ${selectedDate} deleted.`, "info");
      resetFormState(selectedDate);
      await loadData();
    } catch (err: any) {
      toast(err?.message || "Could not delete weather record.", "error");
    }
  };

  // Temperature compliance indicator per BS 1881-203
  const tempStatus = useMemo(() => {
    if (formTempC < 5) {
      return {
        badge: "Cold Concrete Warning (< 5°C)",
        color: "text-blue-600 bg-blue-50 border-blue-200",
        note: "Ice crystals in pore water cause elevated acoustic velocity. Temperature correction required.",
      };
    }
    if (formTempC > 35) {
      return {
        badge: "Elevated Heat Warning (> 35°C)",
        color: "text-amber-700 bg-amber-50 border-amber-200",
        note: "Rapid couplant evaporation. Immediate measurement after transducer coupling is essential.",
      };
    }
    return {
      badge: "Optimal Testing Range (10°C – 35°C)",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      note: "Standard temperature range per BS 1881-203 / ASTM C597. No velocity thermal penalty applied.",
    };
  }, [formTempC]);

  const activeDaySummary = useMemo(
    () => testingDays.find((d) => d.date === selectedDate),
    [testingDays, selectedDate]
  );

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 overflow-hidden ${className}`}
    >
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-[#022C4F] via-[#0A192F] to-[#0F172A] p-6 text-white border-b border-slate-700/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 flex items-center gap-1.5">
                <Sun size={12} className="text-amber-400" />
                <span>Site Activities & Weather Telemetry</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck size={12} />
                <span>BS 1881-203 Section 3.1 Compatible</span>
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>PUNDIT Site Weather Input & Atmospheric Conditions</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Capture, calibrate, and report the atmospheric weather conditions for the specific days ultrasonic
              pulse velocity (UPV) testing was conducted. Resolves absence of site weather input and enriches Section
              3.1 of official NDT Dossiers.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleFetchGoogleWeather(undefined, false)}
              disabled={isFetchingGoogle || !projectId}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-950/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Query Google Weather Platform for current site atmospheric conditions"
            >
              <Globe size={13} className={isFetchingGoogle ? "animate-spin text-white" : "text-cyan-200"} />
              <span>{isFetchingGoogle ? "Querying Google..." : "Google Weather Auto-Detect"}</span>
            </button>

            <button
              type="button"
              onClick={() => loadData()}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-cyan-200 border border-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh Days</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* STEP 1: TESTING DAYS DISCOVERY & SELECTION STRIP */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-cyan-600" size={16} />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                1. Select Specific Day Testing Occurred
              </h4>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              {testingDays.length} Testing Day{testingDays.length === 1 ? "" : "s"} Identified for Site
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-center gap-2 text-xs text-slate-500">
              <RefreshCw className="animate-spin text-cyan-600" size={16} />
              <span>Detecting testing days and weather records from PUNDIT stations…</span>
            </div>
          ) : testingDays.length === 0 ? (
            <div className="p-6 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <p className="text-xs font-bold">No test stations recorded yet for this project.</p>
                <p className="text-[11px] text-amber-800">
                  You can still manually record weather conditions for today or specify any past inspection date below.
                  When station measurements are subsequently uploaded for this day, they will inherit these climate parameters.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {testingDays.map((day) => {
                const isSelected = selectedDate === day.date;
                const hasWeather = day.has_weather;
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => handleSelectDate(day.date)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-slate-900 text-white border-cyan-400 shadow-md ring-2 ring-cyan-500/20"
                        : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono font-bold text-xs">
                        {day.date}
                      </span>
                      {day.weather_record?.is_local_draft || day.weather_record?.id?.startsWith("local-") ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            isSelected
                              ? "bg-purple-500/20 text-purple-300 border-purple-400/40"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          <Clock size={11} />
                          <span>Local Draft</span>
                        </span>
                      ) : hasWeather ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <CheckCircle2 size={11} />
                          <span>Logged</span>
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            isSelected
                              ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          <AlertTriangle size={11} />
                          <span>Needs Input</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] space-y-0.5 opacity-90">
                      <p className="font-semibold truncate">
                        {day.test_count} Station{day.test_count === 1 ? "" : "s"} Ingested
                      </p>
                      <p className="text-[10px] truncate opacity-75">
                        {day.weather_record?.weather_condition ||
                          day.test_weather_conditions[0] ||
                          "⚠️ Weather not captured"}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDate(day.date);
                          handleFetchGoogleWeather(day.date, true);
                        }}
                        className={`text-[10px] font-bold flex items-center gap-1 rounded px-1.5 py-0.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                        title="Auto-fill & synchronize from Google Weather Platform"
                      >
                        <Globe size={10} className="text-sky-400" />
                        <span>Google Sync</span>
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rotate-45 rounded-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 2: ACTIVE WEATHER INPUT & TELEMETRY FORM */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 flex-wrap">
                <Sun className="text-amber-500" size={15} />
                <span>2. Environmental Telemetry for Testing Day: {selectedDate || "Select Date"}</span>
                {currentWeatherId?.startsWith("local-") && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                    Unsynchronized Local Draft
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeDaySummary
                  ? `${activeDaySummary.test_count} structural test stations conducted on this date`
                  : "Logging climate baseline for site testing session"}
              </p>
            </div>

            {/* Manual Date Input Picker */}
            <div className="flex items-center gap-2">
              <label htmlFor="test-date-input" className="text-[11px] font-bold text-slate-600">
                Date:
              </label>
              <input
                id="test-date-input"
                type="date"
                disabled={isFetchingGoogle || isSaving || isSyncing}
                value={selectedDate}
                onChange={(e) => handleSelectDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 shadow-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Google Weather Platform Live Intelligence Card */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-[#031d38] to-[#022c4f] p-4 sm:p-5 text-white shadow-lg shadow-cyan-950/20 relative overflow-hidden">
            {/* Background ambient accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="relative z-10 space-y-4">
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-inner">
                    <Globe size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black tracking-wide uppercase text-cyan-200">
                        Google Weather Platform
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                        DeepMind WeatherNext
                      </span>
                      {googleTelemetry?.target_date && (
                        <span className="text-[10px] font-mono text-slate-400">
                          [{googleTelemetry.target_date}]
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {googleTelemetry?.coordinates ? (
                        <span>
                          Coordinates: {googleTelemetry.coordinates.latitude.toFixed(4)}°N, {googleTelemetry.coordinates.longitude.toFixed(4)}°E
                          <span className="text-cyan-300/80 ml-1.5 font-mono text-[10px]">
                            ({googleTelemetry.coordinate_resolution?.replace(/_/g, " ") || "Site GPS"})
                          </span>
                        </span>
                      ) : (
                        <span>Georeferenced site atmospheric telemetry & acoustic couplant calibration</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isFetchingGoogle}
                    onClick={() => handleFetchGoogleWeather(selectedDate, false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={isFetchingGoogle ? "animate-spin" : ""} />
                    <span>{googleTelemetry ? "Refresh Telemetry" : `Auto-Detect (${selectedDate || "Today"})`}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isFetchingGoogle || isSaving}
                    onClick={() => handleFetchGoogleWeather(selectedDate, true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-900/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    <span>Apply & Auto-Sync to Tests</span>
                  </button>
                </div>
              </div>

              {/* Telemetry metrics display */}
              {googleTelemetry ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {/* Temperature */}
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-cyan-500/20 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                        <span>Temperature</span>
                        <Thermometer size={14} className="text-amber-400" />
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-white font-mono">
                          {googleTelemetry.temperature_c ?? "--"}°C
                        </span>
                        {googleTelemetry.feels_like_c !== undefined && (
                          <span className="block text-[10px] text-slate-400">
                            Feels {googleTelemetry.feels_like_c}°C
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Condition */}
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-cyan-500/20 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                        <span>Sky / Atmosphere</span>
                        <Sun size={14} className="text-amber-300" />
                      </div>
                      <div className="mt-1">
                        <span className="text-xs font-bold text-cyan-200 line-clamp-1">
                          {googleTelemetry.condition_description || googleTelemetry.weather_condition || "Clear"}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {googleTelemetry.surface_condition || "Dry surface"}
                        </span>
                      </div>
                    </div>

                    {/* Humidity */}
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-cyan-500/20 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                        <span>Humidity</span>
                        <Droplets size={14} className="text-cyan-400" />
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-white font-mono">
                          {googleTelemetry.relative_humidity_pct ?? "--"}%
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Couplant evaporation rate
                        </span>
                      </div>
                    </div>

                    {/* Precipitation */}
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-cyan-500/20 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                        <span>Precipitation</span>
                        <CloudRain size={14} className="text-blue-400" />
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-white font-mono">
                          {googleTelemetry.precipitation_probability !== undefined ? `${googleTelemetry.precipitation_probability}%` : "0%"}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {googleTelemetry.precipitation_mm ? `${googleTelemetry.precipitation_mm} mm QPF` : "No rain recorded"}
                        </span>
                      </div>
                    </div>

                    {/* Wind */}
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-cyan-500/20 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                        <span>Wind</span>
                        <Wind size={14} className="text-teal-300" />
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-white font-mono">
                          {googleTelemetry.wind_speed_kmh ?? "--"} <span className="text-xs font-normal">km/h</span>
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {googleTelemetry.wind_direction || "Breeze"}
                        </span>
                      </div>
                    </div>

                    {/* UV Index / Radiation */}
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-cyan-500/20 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                        <span>UV Index</span>
                        <Gauge size={14} className="text-purple-400" />
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-black text-white font-mono">
                          {googleTelemetry.uv_index !== undefined ? googleTelemetry.uv_index : "--"}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Solar exposure
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acoustic Advisory per BS 1881-203 */}
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-cyan-200 uppercase tracking-wide text-[10px] block mb-0.5">
                        BS 1881-203 & ASTM C597 Acoustic Testing Guidance
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {googleTelemetry.impact_on_testing || "Standard testing climate. Calibrate acoustic transducers per BS 1881-203."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/40 border border-cyan-500/20">
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={16} className="text-cyan-400 shrink-0" />
                    <p className="text-xs text-slate-300">
                      Query Google Weather Platform to automatically ingest live site temperature, relative humidity, sky conditions, and acoustic couplant calibration for <strong className="text-cyan-200">{selectedDate || "the selected testing date"}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isFetchingGoogle}
                    onClick={() => handleFetchGoogleWeather(selectedDate, false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Globe size={13} />
                    <span>Auto-Detect for {selectedDate || "Today"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Weather Presets */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
              Quick Weather Presets (Click to Auto-Configure)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {WEATHER_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = formCondition === preset.label;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#022C4F] text-white border-[#022C4F] shadow-sm"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isSelected ? "text-cyan-300 mb-1" : "text-slate-500 mb-1"}
                    />
                    <div>
                      <span className="text-xs font-bold block leading-tight">
                        {preset.label}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          isSelected ? "text-cyan-200" : "text-slate-400"
                        }`}
                      >
                        {preset.defaultTemp}°C · {preset.defaultSurface}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Climate Metrics Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Condition Title */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Weather Condition Descriptor
              </label>
              <input
                type="text"
                value={formCondition}
                onChange={(e) => setFormCondition(e.target.value)}
                placeholder="e.g. Clear / Sunny (31°C)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Ambient Temperature */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Thermometer size={12} className="text-rose-500" />
                  <span>Ambient Temp (°C)</span>
                </label>
                <span className="font-mono text-xs font-black text-rose-600">
                  {formTempC}°C
                </span>
              </div>
              <input
                type="number"
                step="0.5"
                value={formTempC}
                onChange={(e) => setFormTempC(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 shadow-sm"
              />
            </div>

            {/* Relative Humidity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Droplets size={12} className="text-cyan-500" />
                  <span>Humidity (%)</span>
                </label>
                <span className="font-mono text-xs font-black text-cyan-600">
                  {formHumidity}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={formHumidity}
                onChange={(e) => setFormHumidity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 shadow-sm"
              />
            </div>

            {/* Concrete Surface Moisture Condition */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Surface Condition (BS 1881-203)
              </label>
              <select
                value={formSurface}
                onChange={(e) => setFormSurface(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 shadow-sm"
              >
                <option value="Dry">Dry (Optimal Coupling)</option>
                <option value="Damp">Damp (Moist Surface)</option>
                <option value="Wet">Wet (Surface Water Film)</option>
                <option value="Saturated">Saturated / Standing Water</option>
              </select>
            </div>

            {/* Precipitation */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Precipitation
              </label>
              <select
                value={formPrecipitation}
                onChange={(e) => setFormPrecipitation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 shadow-sm"
              >
                <option value="None">None (Dry Skies)</option>
                <option value="Light Drizzle">Light Drizzle</option>
                <option value="Intermittent Rain">Intermittent Rain</option>
                <option value="Heavy Downpour">Heavy Downpour</option>
              </select>
            </div>

            {/* Wind Velocity */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <Wind size={12} className="text-slate-500" />
                <span>Wind Speed (km/h)</span>
              </label>
              <input
                type="number"
                min="0"
                value={formWindKmh}
                onChange={(e) => setFormWindKmh(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 shadow-sm"
              />
            </div>

            {/* Recorded by Engineer / Inspector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck size={12} className="text-teal-600" />
                <span>Recorded By</span>
              </label>
              <input
                type="text"
                value={formRecorderName}
                onChange={(e) => setFormRecorderName(e.target.value)}
                placeholder="Inspector or Resident Engineer"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 shadow-sm"
              />
            </div>
          </div>

          {/* Operational Impact on Testing (Observations) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Impact on Site Activities & Ultrasonic Pulse Velocity Measurements
            </label>
            <textarea
              rows={2}
              value={formImpact}
              onChange={(e) => setFormImpact(e.target.value)}
              placeholder="e.g. Optimal acoustic coupling across structural grid; no wind disturbance on couplant gel."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Temperature & Compliance Advisory */}
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${tempStatus.color}`}>
            <Info size={16} className="shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-bold block">{tempStatus.badge}</span>
              <span className="opacity-90">{tempStatus.note}</span>
            </div>
          </div>

          {/* Success Banner if synced */}
          {syncSuccessMsg && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-900 flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              {currentWeatherId && (
                <button
                  type="button"
                  onClick={handleDeleteWeather}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete Record</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing || isSaving}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={13} className={isSyncing ? "animate-spin text-cyan-600" : "text-cyan-600"} />
                <span>Re-Sync to {activeDaySummary?.test_count || "Day"} Tests</span>
              </button>

              <button
                type="button"
                onClick={handleSaveWeather}
                disabled={isSaving || isSyncing}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-300 hover:opacity-95 shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={14} className={isSaving ? "animate-spin" : ""} />
                <span>
                  {isSaving ? "Saving & Syncing…" : "Save & Sync Weather to Day's Testing"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* STEP 3: WEATHER TELEMETRY AUDIT REGISTRY */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileText className="text-teal-600" size={15} />
              <span>3. Recorded Site Climate Conditions Registry ({allWeatherRecords.length})</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Exported into Section 3.1 & AI Executive Fact Pack
            </span>
          </div>

          {allWeatherRecords.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
              No climate telemetry records saved yet for this project. Save the active day above to initialize.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3">Testing Date</th>
                    <th className="py-2.5 px-3">Weather Condition</th>
                    <th className="py-2.5 px-3 text-center">Temp / Humidity</th>
                    <th className="py-2.5 px-3 text-center">Surface Condition</th>
                    <th className="py-2.5 px-3">Impact on UPV Activities</th>
                    <th className="py-2.5 px-3">Inspector</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allWeatherRecords.map((rec) => {
                    const isSelected = selectedDate === rec.test_date;
                    return (
                      <tr
                        key={rec.id}
                        onClick={() => handleSelectDate(rec.test_date)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isSelected ? "bg-cyan-50/40" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {rec.test_date}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            <Sun size={11} className="text-amber-500" />
                            {rec.weather_condition}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700 whitespace-nowrap">
                          {rec.temperature_c != null ? `${rec.temperature_c}°C` : "—"} ·{" "}
                          {rec.relative_humidity_pct != null ? `${rec.relative_humidity_pct}%` : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              rec.surface_condition === "Dry"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : rec.surface_condition === "Damp"
                                ? "bg-sky-50 text-sky-700 border-sky-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {rec.surface_condition || "Dry"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={rec.impact_on_testing}>
                          {rec.impact_on_testing || "Normal surface coupling"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                          {rec.recorded_by_name || "Site Inspector"}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDate(rec.test_date);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
