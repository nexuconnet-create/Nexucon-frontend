"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Search, Filter, Play, CheckCircle2, 
  XCircle, AlertTriangle, Box, ArrowDownToLine,
  Database, ShieldCheck, Download
} from "lucide-react";
import Button from "@/components/ui/Button";

// Mock IFC Data
const mockElements = [
  { id: "3cR1x_Odf4gPZ_M1wX9$e1", category: "IfcBeam", name: "B-200x600", material: "Concrete (C30/37)", depth: 600, width: 200, length: 4500, volume: 0.54, status: "Approved" },
  { id: "1aQ9z_Klm2yRX_V8bQ$c3", category: "IfcBeam", name: "B-250x450", material: "Concrete (C30/37)", depth: 450, width: 250, length: 3200, volume: 0.36, status: "Under Review" },
  { id: "9vB2t_Xyz9mAQ_L4cN$p8", category: "IfcColumn", name: "C-400x400", material: "Concrete (C40/50)", depth: 400, width: 400, length: 3000, volume: 0.48, status: "Approved" },
  { id: "2hM5k_Plm8zWR_B9vT$k2", category: "IfcWall", name: "W-200-Exterior", material: "Concrete (C30/37)", depth: 200, width: 5000, length: 3000, volume: 3.00, status: "Approved" },
  { id: "7xJ4n_Qwe6cTY_N1mV$d5", category: "IfcBeam", name: "B-300x700", material: "Concrete (C40/50)", depth: 700, width: 300, length: 6000, volume: 1.26, status: "Changes Requested" },
  { id: "4yK8p_Asd2fGH_M3bZ$x9", category: "IfcSlab", name: "S-150", material: "Concrete (C30/37)", depth: 150, width: 8000, length: 12000, volume: 14.4, status: "Approved" },
  { id: "5zL9q_Zxc4vBN_P7nC$m1", category: "IfcBeam", name: "B-200x600", material: "Concrete (C30/37)", depth: 600, width: 200, length: 4000, volume: 0.48, status: "Approved" },
];

export default function BimDataExplorer() {
  const [queryCategory, setQueryCategory] = useState("IfcBeam");
  const [queryProperty, setQueryProperty] = useState("depth");
  const [queryOperator, setQueryOperator] = useState(">");
  const [queryValue, setQueryValue] = useState("500");
  const [isQuerying, setIsQuerying] = useState(false);
  
  const [filteredElements, setFilteredElements] = useState(mockElements);
  
  const [isRunningQAQC, setIsRunningQAQC] = useState(false);
  const [qaqcResults, setQaqcResults] = useState<{ id: string, name: string, status: 'pass' | 'fail' | 'warning', message: string }[] | null>(null);

  const handleRunQuery = () => {
    setIsQuerying(true);
    setTimeout(() => {
      let filtered = mockElements.filter(e => e.category === queryCategory || queryCategory === "All");
      
      if (queryValue !== "") {
        const val = parseFloat(queryValue);
        filtered = filtered.filter(e => {
          const propVal = e[queryProperty as keyof typeof e];
          if (typeof propVal === 'number') {
            if (queryOperator === ">") return propVal > val;
            if (queryOperator === "<") return propVal < val;
            if (queryOperator === "=") return propVal === val;
            if (queryOperator === ">=") return propVal >= val;
            if (queryOperator === "<=") return propVal <= val;
          }
          return true;
        });
      }
      
      setFilteredElements(filtered);
      setIsQuerying(false);
    }, 600);
  };

  const handleRunQAQC = () => {
    setIsRunningQAQC(true);
    setTimeout(() => {
      setQaqcResults([
        { id: "QA-01", name: "Rebar Spacing ≤ 200mm", status: "pass", message: "All elements compliant." },
        { id: "QA-02", name: "Beam Depth to Span Ratio > 1/15", status: "fail", message: "2 elements fail (B-250x450, B-300x700)." },
        { id: "QA-03", name: "Fire Rating: Minimum 2 Hours", status: "warning", message: "Missing data on W-200-Exterior." },
        { id: "QA-04", name: "Column Minimum Dimension ≥ 300mm", status: "pass", message: "All elements compliant." },
      ]);
      setIsRunningQAQC(false);
    }, 1500);
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
            <p className="text-[12px] text-gray-500 font-medium">Architectural Model V4.0 • Structured Data View</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="border-[#022C4F] text-[#022C4F] h-10 px-4 gap-2">
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
                  <option value="IfcBeam">IfcBeam</option>
                  <option value="IfcColumn">IfcColumn</option>
                  <option value="IfcWall">IfcWall</option>
                  <option value="IfcSlab">IfcSlab</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Property</label>
                <select 
                  value={queryProperty}
                  onChange={(e) => setQueryProperty(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-gray-200 text-[13px] font-medium outline-none focus:border-[#022C4F]"
                >
                  <option value="depth">Depth (mm)</option>
                  <option value="width">Width (mm)</option>
                  <option value="length">Length (mm)</option>
                  <option value="volume">Volume (m³)</option>
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
                  placeholder="e.g. 600"
                  className="h-10 px-3 rounded-lg border border-gray-200 text-[13px] font-medium outline-none focus:border-[#022C4F]"
                />
              </div>

              <button 
                onClick={handleRunQuery}
                disabled={isQuerying}
                className="h-10 px-6 rounded-lg bg-[#022C4F] text-white text-[13px] font-bold hover:bg-[#033A6B] transition-colors flex items-center gap-2"
              >
                {isQuerying ? "Querying..." : <><Search size={16} /> Execute Query</>}
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-[15px] font-extrabold text-[#0F181F]">
                Extracted IFC Elements
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
                    <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Material</th>
                    <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">D × W × L (mm)</th>
                    <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">Vol (m³)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredElements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[13px] text-gray-500 font-medium">
                        No elements match the current query.
                      </td>
                    </tr>
                  ) : (
                    filteredElements.map((el, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                        <td className="p-4 text-[12px] text-gray-500 font-mono">{el.id}</td>
                        <td className="p-4 text-[12px] font-bold text-[#022C4F]">{el.category}</td>
                        <td className="p-4 text-[13px] font-bold text-[#0F181F]">{el.name}</td>
                        <td className="p-4 text-[12px] text-gray-600 font-medium">{el.material}</td>
                        <td className="p-4 text-[12px] text-gray-600 text-right font-mono">
                          {el.depth} × {el.width} × {el.length}
                        </td>
                        <td className="p-4 text-[12px] text-gray-600 text-right font-bold">{el.volume.toFixed(2)}</td>
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
              <ShieldCheck size={18} /> Rule-Based QA/QC
            </h2>
            <p className="text-[12px] text-gray-500 mb-6 leading-relaxed">
              Run automated checks against the extracted IFC data based on project specifications.
            </p>

            <button 
              onClick={handleRunQAQC}
              disabled={isRunningQAQC}
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
                  <p className="text-[11px] text-gray-400 mt-1">Run the automated checks to view compliance.</p>
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
