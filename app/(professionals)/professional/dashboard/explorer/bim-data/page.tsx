"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft, Search, Filter, Play, CheckCircle2,
  XCircle, AlertTriangle, Database, ShieldCheck, Download
} from "lucide-react";
import Button from "@/components/ui/Button";
import { BIMStructuralElement, getBIMStructuralElements } from "@/services/digitalEye";

// Numeric element properties that actually exist on the real BIM element
// records — unrecorded values (0/empty) never satisfy a numeric comparison.
const numericProperties: Record<string, { label: string; get: (el: BIMStructuralElement) => number | null }> = {
  rebar_spacing: { label: "Rebar Spacing (mm)", get: (e) => e.designed_rebar_spacing_mm > 0 ? e.designed_rebar_spacing_mm : null },
  cover_depth: { label: "Cover Depth (mm)", get: (e) => e.designed_cover_depth_mm > 0 ? e.designed_cover_depth_mm : null },
  elevation: { label: "Elevation Level (m)", get: (e) => e.elevation_level_m ?? null },
};

type QaqcResult = { id: string, name: string, status: 'pass' | 'fail' | 'warning', message: string };

export default function BimDataExplorer() {
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [queryCategory, setQueryCategory] = useState("All");
  const [queryProperty, setQueryProperty] = useState("rebar_spacing");
  const [queryOperator, setQueryOperator] = useState(">");
  const [queryValue, setQueryValue] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  const [filteredElements, setFilteredElements] = useState<BIMStructuralElement[]>([]);

  const [isRunningQAQC, setIsRunningQAQC] = useState(false);
  const [qaqcResults, setQaqcResults] = useState<QaqcResult[] | null>(null);

  // Load the real BIM element registry (imported IFC/RVT model mappings).
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    getBIMStructuralElements()
      .then((data) => {
        if (cancelled) return;
        setElements(data);
        setFilteredElements(data);
      })
      .catch((err) => {
        console.error("Failed to load BIM elements", err);
        if (!cancelled) setLoadError("BIM elements could not be loaded. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Real categories present in the loaded data.
  const categories = useMemo(
    () => Array.from(new Set(elements.map(e => e.category).filter(Boolean))).sort(),
    [elements]
  );

  const handleRunQuery = () => {
    setIsQuerying(true);

    let filtered = queryCategory === "All"
      ? elements
      : elements.filter(e => e.category === queryCategory);

    if (queryValue.trim() !== "") {
      const val = parseFloat(queryValue);
      const prop = numericProperties[queryProperty];
      if (!Number.isNaN(val) && prop) {
        filtered = filtered.filter(e => {
          const propVal = prop.get(e);
          if (propVal == null) return false;
          if (queryOperator === ">") return propVal > val;
          if (queryOperator === "<") return propVal < val;
          if (queryOperator === "=") return propVal === val;
          if (queryOperator === ">=") return propVal >= val;
          if (queryOperator === "<=") return propVal <= val;
          return true;
        });
      }
    }

    setFilteredElements(filtered);
    setIsQuerying(false);
  };

  // Export the currently filtered REAL rows as CSV.
  const handleExportCsv = () => {
    if (filteredElements.length === 0) return;
    const header = ["GlobalId", "Category", "Name", "Discipline", "Level", "Grid Location", "Concrete Grade", "Rebar Spacing (mm)", "Cover Depth (mm)"];
    const rows = filteredElements.map(e => [
      e.element_guid || e.id,
      e.category,
      e.name,
      e.discipline,
      e.level,
      e.grid_location,
      e.designed_concrete_grade,
      e.designed_rebar_spacing_mm > 0 ? String(e.designed_rebar_spacing_mm) : "",
      e.designed_cover_depth_mm > 0 ? String(e.designed_cover_depth_mm) : "",
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bim_elements.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Data-completeness checks computed from the REAL loaded element records —
  // every count below comes from the actual data, nothing is invented.
  const handleRunQAQC = () => {
    if (elements.length === 0) return;
    setIsRunningQAQC(true);

    const total = elements.length;
    const withGuid = elements.filter(e => (e.element_guid || "").trim() !== "").length;
    const withGrade = elements.filter(e => (e.designed_concrete_grade || "").trim() !== "").length;
    const withRebar = elements.filter(e => e.designed_rebar_spacing_mm > 0).length;
    const withCover = elements.filter(e => e.designed_cover_depth_mm > 0).length;

    const evaluate = (recorded: number): { status: QaqcResult['status']; message: string } => {
      if (recorded === total) return { status: 'pass', message: `Recorded on all ${total} elements.` };
      if (recorded === 0) return { status: 'fail', message: `Not recorded on any of the ${total} loaded elements.` };
      return { status: 'warning', message: `Recorded on ${recorded} of ${total} elements.` };
    };

    const results: QaqcResult[] = [
      { id: "QA-01", name: "Element GUID Recorded", ...evaluate(withGuid) },
      { id: "QA-02", name: "Concrete Grade Specified", ...evaluate(withGrade) },
      { id: "QA-03", name: "Rebar Spacing Recorded", ...evaluate(withRebar) },
      { id: "QA-04", name: "Cover Depth Recorded", ...evaluate(withCover) },
    ];

    setQaqcResults(results);
    setIsRunningQAQC(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500">

      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/professional/dashboard/explorer"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-[#022C4F]" />
          </Link>
          <div>
            <h1 className="text-[20px] font-extrabold text-[#022C4F] flex items-center gap-3">
              <Database size={20} className="text-[#022C4F]" />
              BIM Data Explorer
            </h1>
            <p className="text-[12px] text-gray-500 font-medium">
              {isLoading ? "Loading BIM elements..." : `${elements.length} element${elements.length === 1 ? "" : "s"} • Structured Data View`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="border-[#022C4F] text-[#022C4F] h-10 px-4 gap-2"
            onClick={handleExportCsv}
          >
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-1 mt-6 gap-6 min-h-0">

        {/* Left Side: Data Query & Table */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">

          {/* Query Builder */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm shrink-0">
            <h2 className="text-[15px] font-extrabold text-[#022C4F] mb-4 flex items-center gap-2">
              <Filter size={16} /> Element Query Builder
            </h2>

            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <select
                  value={queryCategory}
                  onChange={(e) => setQueryCategory(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-gray-200 text-[13px] font-medium outline-none focus:border-[#022C4F]"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Property</label>
                <select
                  value={queryProperty}
                  onChange={(e) => setQueryProperty(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-gray-200 text-[13px] font-medium outline-none focus:border-[#022C4F]"
                >
                  {Object.entries(numericProperties).map(([key, prop]) => (
                    <option key={key} value={key}>{prop.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 w-[80px] shrink-0">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Op</label>
                <select
                  value={queryOperator}
                  onChange={(e) => setQueryOperator(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-gray-200 text-[13px] font-medium outline-none focus:border-[#022C4F]"
                >
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value="=">=</option>
                  <option value=">=">&ge;</option>
                  <option value="<=">&le;</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Value</label>
                <input
                  type="text"
                  value={queryValue}
                  onChange={(e) => setQueryValue(e.target.value)}
                  placeholder="e.g. 150"
                  className="h-10 px-3 rounded-lg border border-gray-200 text-[13px] font-medium outline-none focus:border-[#022C4F]"
                />
              </div>

              <button
                onClick={handleRunQuery}
                disabled={isQuerying || isLoading}
                className="h-10 px-6 rounded-lg bg-[#022C4F] text-white text-[13px] font-bold hover:bg-[#033A6B] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isQuerying ? "Querying..." : <><Search size={16} /> Execute Query</>}
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-[15px] font-extrabold text-[#0F181F]">
                BIM Model Elements
              </h2>
              <span className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-bold">
                {filteredElements.length} Results
              </span>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr>
                    <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">GlobalId</th>
                    <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Category</th>
                    <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Name / Type</th>
                    <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Discipline</th>
                    <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Level / Grid</th>
                    <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Concrete Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[13px] text-gray-400 font-medium">
                        Loading BIM elements...
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[13px] text-red-500 font-medium">
                        {loadError}
                      </td>
                    </tr>
                  ) : filteredElements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[13px] text-gray-500 font-medium">
                        {elements.length === 0
                          ? "No BIM elements found. Import a BIM model to populate the explorer."
                          : "No elements match the current query."}
                      </td>
                    </tr>
                  ) : (
                    filteredElements.map((el) => (
                      <tr key={el.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                        <td className="p-4 text-[12px] text-gray-500 font-mono">{el.element_guid || el.id}</td>
                        <td className="p-4 text-[12px] font-bold text-[#022C4F]">{el.category}</td>
                        <td className="p-4 text-[13px] font-bold text-[#0F181F]">{el.name}</td>
                        <td className="p-4 text-[12px] text-gray-600 font-medium">{el.discipline}</td>
                        <td className="p-4 text-[12px] text-gray-600 font-medium">
                          {[el.level, el.grid_location].filter(Boolean).join(" • ") || "—"}
                        </td>
                        <td className="p-4 text-[12px] text-gray-600 font-medium">{el.designed_concrete_grade || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: QA/QC Engine */}
        <div className="w-[360px] shrink-0 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#022C4F]/20 shadow-sm flex-1 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#022C4F]/5 rounded-bl-full -z-10" />

            <h2 className="text-[16px] font-extrabold text-[#022C4F] mb-1 flex items-center gap-2">
              <ShieldCheck size={18} /> Data Completeness QA/QC
            </h2>
            <p className="text-[12px] text-gray-500 mb-6 leading-relaxed">
              Run automated completeness checks over the loaded BIM element records.
            </p>

            <button
              onClick={handleRunQAQC}
              disabled={isRunningQAQC || isLoading || elements.length === 0}
              className="w-full h-12 rounded-xl bg-green-600 text-white font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-70 mb-6 shrink-0 shadow-sm shadow-green-600/20"
            >
              {isRunningQAQC ? (
                <>Running Checks...</>
              ) : (
                <><Play size={16} fill="currentColor" /> Run Automated QA/QC</>
              )}
            </button>

            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {!qaqcResults && !isRunningQAQC && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                    <ShieldCheck size={24} />
                  </div>
                  <p className="text-[13px] font-bold text-gray-600">No results yet</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {elements.length === 0
                      ? "Load BIM elements first to run the checks."
                      : "Run the automated checks to view data completeness."}
                  </p>
                </div>
              )}

              {isRunningQAQC && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-[#022C4F]">
                  <div className="w-8 h-8 border-4 border-[#022C4F]/20 border-t-[#022C4F] rounded-full animate-spin" />
                  <span className="text-[13px] font-bold animate-pulse">Evaluating rules...</span>
                </div>
              )}

              {qaqcResults && !isRunningQAQC && qaqcResults.map((result, i) => (
                <div key={i} className={`p-4 rounded-xl border ${
                  result.status === 'pass' ? 'bg-green-50 border-green-200' :
                  result.status === 'fail' ? 'bg-red-50 border-red-200' :
                  'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {result.status === 'pass' && <CheckCircle2 size={16} className="text-green-600" />}
                      {result.status === 'fail' && <XCircle size={16} className="text-red-600" />}
                      {result.status === 'warning' && <AlertTriangle size={16} className="text-orange-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          result.status === 'pass' ? 'text-green-700' :
                          result.status === 'fail' ? 'text-red-700' :
                          'text-orange-700'
                        }`}>
                          {result.id}
                        </span>
                      </div>
                      <h4 className={`text-[13px] font-bold mb-1 ${
                        result.status === 'pass' ? 'text-green-900' :
                        result.status === 'fail' ? 'text-red-900' :
                        'text-orange-900'
                      }`}>
                        {result.name}
                      </h4>
                      <p className={`text-[11px] font-medium leading-relaxed ${
                        result.status === 'pass' ? 'text-green-700' :
                        result.status === 'fail' ? 'text-red-700' :
                        'text-orange-700'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
