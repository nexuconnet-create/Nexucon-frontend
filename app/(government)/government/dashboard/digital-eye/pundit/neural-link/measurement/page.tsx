"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Folder,
  Layers,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Gauge,
  Radio,
  CheckCircle2,
  X,
} from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import NexuconLinkNav from "@/components/dashboard/digital-eye/NexuconLinkNav";
import PunditWaveformViewer from "@/components/dashboard/digital-eye/PunditWaveformViewer";
import PaginationBar from "@/components/dashboard/PaginationBar";
import {
  FolderViewToggle,
  FloorStationTreeBody,
  punditFloorOf,
  punditStationOf,
  punditStationSummary,
  ratingBadgeClass,
  useFloorStationFolders,
} from "@/components/dashboard/digital-eye/PunditFolderTree";
import {
  PunditTest,
  getPunditTests,
  downloadNdtReport,
  exportPunditResults,
  formatVelocityMs,
} from "@/services/digitalEye";

export default function NeuralLinkMeasurementPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [activeTest, setActiveTest] = useState<PunditTest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const folders = useFloorStationFolders(tests, punditFloorOf, punditStationOf);

  const refreshTests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPunditTests({ project: selectedProjectId || undefined });
      setTests(data);
    } catch (err: any) {
      setTests([]);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load UPV test measurements from the server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTests();
  }, [selectedProjectId]);

  const handleDownloadReport = () => {
    if (!selectedProjectId) {
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: "⚠️ Select a project to download its official NDT report.",
            type: "error",
          },
        })
      );
      return;
    }
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: {
          message: "Generating official BS 1881-203 NDT report PDF…",
          type: "info",
        },
      })
    );
    downloadNdtReport(selectedProjectId)
      .then((filename) =>
        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: {
              message: `Downloaded ${filename} (MTL-style NDT dossier).`,
              type: "success",
            },
          })
        )
      )
      .catch((err: any) =>
        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: {
              message: `⚠️ ${
                err?.response?.data?.detail || err?.message || "Report generation failed."
              }`,
              type: "error",
            },
          })
        )
      );
  };

  const handleExportResults = () => {
    if (!selectedProjectId) {
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: "⚠️ Select a project to export its results to Excel.",
            type: "error",
          },
        })
      );
      return;
    }
    exportPunditResults(selectedProjectId)
      .then((filename) =>
        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: {
              message: `Downloaded ${filename} — tabular dataset exported.`,
              type: "success",
            },
          })
        )
      )
      .catch((err: any) =>
        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: {
              message: `⚠️ ${
                err?.response?.data?.detail || err?.message || "Excel export failed."
              }`,
              type: "error",
            },
          })
        )
      );
  };

  // Metrics computation
  const stats = useMemo(() => {
    if (!tests.length) {
      return { total: 0, meanVel: 0, meanStrength: 0, passingPct: 0, doubtful: 0 };
    }
    let totalVel = 0;
    let totalStrength = 0;
    let passing = 0;
    let doubtfulCount = 0;

    tests.forEach((t) => {
      totalVel += t.pulse_velocity_ms || 0;
      const str = t.estimated_compressive_strength_mpa || 0;
      totalStrength += str;
      if (str >= 25.0) passing++;
      if (t.concrete_quality_rating === "DOUBTFUL" || t.concrete_quality_rating === "VERY_POOR") doubtfulCount++;
    });

    return {
      total: tests.length,
      meanVel: Math.round(totalVel / tests.length),
      meanStrength: +(totalStrength / tests.length).toFixed(1),
      passingPct: Math.round((passing / tests.length) * 100),
      doubtful: doubtfulCount,
    };
  }, [tests]);

  // Filtered tests for flat view
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      if (ratingFilter !== "ALL" && t.concrete_quality_rating !== ratingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const loc = (t.test_location || "").toLowerCase();
        const el = (t.structural_element_name || "").toLowerCase();
        const ref = (t.test_reference || "").toLowerCase();
        return loc.includes(q) || el.includes(q) || ref.includes(q);
      }
      return true;
    });
  }, [tests, ratingFilter, searchQuery]);

  // Reset to first page when filtering or changing projects
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProjectId, ratingFilter, searchQuery]);

  // Paginated tests for flat view
  const paginatedTests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTests.slice(startIndex, startIndex + pageSize);
  }, [filteredTests, currentPage, pageSize]);

  return (
    <div className="w-full min-h-screen pb-16 animate-in fade-in duration-300 bg-slate-50/50">
      <DigitalEyeHeader
        activePillar="PUNDIT: Ultrasonic Pulse Velocity Test Registry"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      {/* Neural Link Navigation Ribbon */}
      <div className="mb-6">
        <NexuconLinkNav subtitle="Field Measurements" />
      </div>

      {/* Executive Telemetry Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Scans</span>
            <span className="text-xl font-black text-slate-900 font-mono">{stats.total}</span>
          </div>
          <Activity size={18} className="text-blue-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Mean Velocity</span>
            <span className="text-xl font-black text-amber-600 font-mono">
              {stats.meanVel > 0 ? `${stats.meanVel} m/s` : "—"}
            </span>
          </div>
          <Gauge size={18} className="text-amber-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Mean Strength (fcu)</span>
            <span className="text-xl font-black text-teal-700 font-mono">
              {stats.meanStrength > 0 ? `${stats.meanStrength} MPa` : "—"}
            </span>
          </div>
          <ShieldCheck size={18} className="text-teal-600" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Passing (≥25 MPa)</span>
            <span className="text-xl font-black text-emerald-600 font-mono">{stats.passingPct}%</span>
          </div>
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Doubtful / NCR</span>
            <span className="text-xl font-black text-rose-600 font-mono">{stats.doubtful}</span>
          </div>
          <AlertTriangle size={18} className="text-rose-500" />
        </div>
      </div>

      {/* Main Measurement Console */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Radio size={18} className="text-blue-600" />
              <span>UPV Station Measurements</span>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                {tests.length} tests recorded
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Field ultrasonic pulse velocity readings with calibrated compressive strength (BS 1881-203).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FolderViewToggle viewMode={folders.viewMode} onChange={folders.setViewMode} />

            <button
              onClick={handleExportResults}
              disabled={isLoading || !tests.length}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Export test dataset to Excel spreadsheet"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleDownloadReport}
              disabled={isLoading || !tests.length}
              className="px-3.5 py-1.5 bg-[#022C4F] hover:bg-[#03467B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              <span>Official NDT PDF</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:px-5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search station, floor, or element..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-semibold">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Ratings</option>
              <option value="EXCELLENT">EXCELLENT (&gt;4.5 km/s)</option>
              <option value="GOOD">GOOD (3.5–4.5 km/s)</option>
              <option value="DOUBTFUL">DOUBTFUL (3.0–3.5 km/s)</option>
              <option value="POOR">POOR (&lt;3.0 km/s)</option>
            </select>
          </div>
        </div>

        {/* Content Views */}
        {isLoading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400 animate-pulse flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin mb-2 text-slate-400" size={24} />
            <span>Loading UPV measurements from device session…</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 bg-rose-50/50 flex flex-col items-center justify-center">
            <AlertTriangle className="mb-2 text-rose-500" size={24} />
            <span className="font-bold">Error loading measurement records</span>
            <span className="text-[11px] text-rose-500 mt-1">{error}</span>
          </div>
        ) : tests.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <Activity className="mb-2 text-slate-300" size={32} />
            <span className="text-xs font-semibold">No UPV test measurements found for this project.</span>
            <span className="text-[11px] text-slate-400 mt-1">Upload an inspection session or record station tests.</span>
          </div>
        ) : folders.viewMode === "grouped" ? (
          <FloorStationTreeBody
            groups={folders.groups}
            openFloors={folders.openFloors}
            openStations={folders.openStations}
            toggleFloor={folders.toggleFloor}
            toggleStation={folders.toggleStation}
            stationSummary={punditStationSummary}
            renderStationBody={(rows) => (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Test Ref</th>
                      <th className="py-2.5 px-4">Station / Location</th>
                      <th className="py-2.5 px-3">Structural Element</th>
                      <th className="py-2.5 px-3 text-right">Pulse Velocity</th>
                      <th className="py-2.5 px-3 text-right">Comp. Strength</th>
                      <th className="py-2.5 px-3 text-center">BS 1881 Rating</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((test) => (
                      <tr
                        key={test.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => setActiveTest(test)}
                      >
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                          {test.test_reference}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {test.test_location || "Station reading"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {test.structural_element_name || "Structural Element"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatVelocityMs(test.pulse_velocity_ms)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                          {test.estimated_compressive_strength_mpa != null
                            ? `${test.estimated_compressive_strength_mpa.toFixed(1)} MPa`
                            : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${ratingBadgeClass(
                              test.concrete_quality_rating
                            )}`}
                          >
                            {test.concrete_quality_rating}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTest(test);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Oscillogram
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Station / Location</th>
                    <th className="py-3 px-3">Structural Element</th>
                    <th className="py-3 px-3 text-right">Pulse Velocity</th>
                    <th className="py-3 px-3 text-right">Comp. Strength</th>
                    <th className="py-3 px-3 text-center">BS 1881 Rating</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        No UPV test measurements match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedTests.map((test) => (
                      <tr
                        key={test.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setActiveTest(test)}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {test.test_location || "Station reading"}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {test.structural_element_name || "Structural Element"}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatVelocityMs(test.pulse_velocity_ms)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-teal-700">
                          {test.estimated_compressive_strength_mpa != null
                            ? `${test.estimated_compressive_strength_mpa.toFixed(1)} MPa`
                            : "—"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${ratingBadgeClass(
                              test.concrete_quality_rating
                            )}`}
                          >
                            {test.concrete_quality_rating || "PENDING"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTest(test);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Oscillogram
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredTests.length > 0 && (
              <PaginationBar
                currentPage={currentPage}
                totalItems={filteredTests.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            )}
          </div>
        )}
      </div>

      {/* Waveform Inspection Modal */}
      {activeTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Waveform Oscillogram Analysis</span>
                  <span className="text-xs font-mono font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50">
                    {activeTest.test_location || "Station"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Time-of-flight acoustic transit and amplitude envelope verification.
                </p>
              </div>
              <button
                onClick={() => setActiveTest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <PunditWaveformViewer
                test={activeTest}
                onClose={() => setActiveTest(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
