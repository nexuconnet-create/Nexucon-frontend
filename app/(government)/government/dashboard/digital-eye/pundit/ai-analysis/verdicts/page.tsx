"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
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
  Activity,
  Zap,
} from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import PunditAiNav from "@/components/dashboard/digital-eye/PunditAiNav";
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
  getBIMStructuralElements,
  BIMStructuralElement,
  formatVelocityMs,
} from "@/services/digitalEye";

interface ElementVerdict {
  id: string;
  reference: string;
  element: string;
  floor: string;
  points: number;
  meanVelocity: number;
  meanFcu: number | null;
  grade: string;
  test: PunditTest;
}

export default function PunditAIVerdictsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [activeTest, setActiveTest] = useState<PunditTest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const folders = useFloorStationFolders(tests, punditFloorOf, punditStationOf);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [testsData, elementsData] = await Promise.all([
        getPunditTests({ project: selectedProjectId || undefined }),
        getBIMStructuralElements({ project: selectedProjectId || undefined }),
      ]);
      setTests(testsData);
      setElements(elementsData);
    } catch (err: any) {
      setTests([]);
      setElements([]);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load element verdict records from the server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProjectId, ratingFilter, searchQuery]);

  // Transform tests to verdicts
  const verdicts: ElementVerdict[] = useMemo(() => {
    return tests
      .filter((t) => t.pulse_velocity_ms > 0)
      .map((t) => ({
        id: t.id,
        reference: t.test_reference,
        element: (t.structural_element_name || t.test_location || "Station reading").trim(),
        floor: (t.floor || "Floor not recorded").trim(),
        points: t.readings.length > 0 ? t.readings.length : 1,
        meanVelocity: t.pulse_velocity_ms,
        meanFcu: t.estimated_compressive_strength_mpa,
        grade: t.concrete_quality_rating,
        test: t,
      }));
  }, [tests]);

  // Metrics
  const stats = useMemo(() => {
    if (!verdicts.length) {
      return { total: 0, compliant: 0, doubtful: 0, critical: 0, compliantPct: 0 };
    }
    const compliant = verdicts.filter((v) => v.grade === "EXCELLENT" || v.grade === "GOOD").length;
    const doubtful = verdicts.filter((v) => v.grade === "DOUBTFUL").length;
    const critical = verdicts.filter((v) => v.grade === "POOR" || v.grade === "VERY_POOR").length;

    return {
      total: verdicts.length,
      compliant,
      doubtful,
      critical,
      compliantPct: Math.round((compliant / verdicts.length) * 100),
    };
  }, [verdicts]);

  // Filtered verdicts
  const filteredVerdicts = useMemo(() => {
    return verdicts.filter((v) => {
      if (ratingFilter !== "ALL" && v.grade !== ratingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.element.toLowerCase().includes(q) ||
          v.reference.toLowerCase().includes(q) ||
          v.floor.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [verdicts, ratingFilter, searchQuery]);

  const paginatedVerdicts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVerdicts.slice(start, start + pageSize);
  }, [filteredVerdicts, currentPage, pageSize]);

  return (
    <div className="w-full min-h-screen pb-16 animate-in fade-in duration-300 bg-slate-50/50">
      <DigitalEyeHeader
        activePillar="PUNDIT AI: Structural Element Verdicts"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      {/* AI Analysis Navigation Ribbon */}
      <div className="mb-6">
        <PunditAiNav subtitle="Element Verdicts" />
      </div>

      {/* Executive Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Evaluated Elements
            </span>
            <span className="text-xl font-black text-slate-900 font-mono">{stats.total}</span>
          </div>
          <Box size={18} className="text-blue-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Compliant Rate
            </span>
            <span className="text-xl font-black text-emerald-600 font-mono">{stats.compliantPct}%</span>
          </div>
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Doubtful Pockets
            </span>
            <span className="text-xl font-black text-amber-600 font-mono">{stats.doubtful}</span>
          </div>
          <AlertTriangle size={18} className="text-amber-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Critical &lt; 3,000 m/s
            </span>
            <span className="text-xl font-black text-rose-600 font-mono">{stats.critical}</span>
          </div>
          <Zap size={18} className="text-rose-500" />
        </div>
      </div>

      {/* Main Verdicts Table Console */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Box size={18} className="text-blue-600" />
              <span>Structural Element Acoustic Means &amp; Ratings</span>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                {verdicts.length} elements computed
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-point acoustic mean velocity (Vp) and calibrated compressive strength (f_cu) per structural element.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <FolderViewToggle viewMode={folders.viewMode} onChange={folders.setViewMode} />
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:px-5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search structural element, reference or floor..."
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
            <span className="text-xs text-slate-500 font-semibold">Quality Grade:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Grades</option>
              <option value="EXCELLENT">EXCELLENT (&gt;4.5 km/s)</option>
              <option value="GOOD">GOOD (3.5–4.5 km/s)</option>
              <option value="DOUBTFUL">DOUBTFUL (3.0–3.5 km/s)</option>
              <option value="POOR">POOR (&lt;3.0 km/s)</option>
            </select>
          </div>
        </div>

        {/* Views */}
        {isLoading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400 animate-pulse flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin mb-2 text-slate-400" size={24} />
            <span>Calculating multi-station acoustic means…</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 bg-rose-50/50 flex flex-col items-center justify-center">
            <AlertTriangle className="mb-2 text-rose-500" size={24} />
            <span className="font-bold">Error loading element verdicts</span>
            <span className="text-[11px] text-rose-500 mt-1">{error}</span>
          </div>
        ) : verdicts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <Activity className="mb-2 text-slate-300" size={32} />
            <span className="text-xs font-semibold">No structural element verdicts found for this project.</span>
            <span className="text-[11px] text-slate-400 mt-1">Record station tests to compute multi-point element means.</span>
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
                      <th className="py-2.5 px-4">Element / Station</th>
                      <th className="py-2.5 px-4">Test Reference</th>
                      <th className="py-2.5 px-3 text-right">Mean Velocity</th>
                      <th className="py-2.5 px-3 text-right">Mean E.C.S</th>
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
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {test.structural_element_name || test.test_location || "Element"}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                          {test.test_reference}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600">
                          {formatVelocityMs(test.pulse_velocity_ms)} m/s
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
                            Inspect Waveform
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
                    <th className="py-3 px-4">Structural Element</th>
                    <th className="py-3 px-4">Test Reference</th>
                    <th className="py-3 px-3">Floor Level</th>
                    <th className="py-3 px-3 text-center">Points</th>
                    <th className="py-3 px-3 text-right">Mean Velocity</th>
                    <th className="py-3 px-3 text-right">Mean E.C.S</th>
                    <th className="py-3 px-3 text-center">BS 1881 Rating</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVerdicts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No structural element verdicts match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedVerdicts.map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setActiveTest(v.test)}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">{v.element}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{v.reference}</td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{v.floor}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">{v.points}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-600">
                          {formatVelocityMs(v.meanVelocity)} m/s
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-teal-700">
                          {v.meanFcu != null ? `${v.meanFcu.toFixed(1)} MPa` : "—"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${ratingBadgeClass(
                              v.grade
                            )}`}
                          >
                            {v.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTest(v.test);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredVerdicts.length > 0 && (
              <PaginationBar
                currentPage={currentPage}
                totalItems={filteredVerdicts.length}
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
                    {activeTest.structural_element_name || activeTest.test_location || "Element"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Element time-of-flight acoustic transit and amplitude envelope verification.
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
              <PunditWaveformViewer test={activeTest} onClose={() => setActiveTest(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
