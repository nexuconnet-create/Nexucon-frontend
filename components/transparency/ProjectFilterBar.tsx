"use client";

import React from 'react';
import { Search, Filter, RotateCcw, LayoutGrid, List } from 'lucide-react';

interface ProjectFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLga: string;
  onLgaChange: (lga: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalCount: number;
}

const LGAS = [
  'ALL',
  'Ikeja',
  'Eti-Osa',
  'Lagos Mainland',
  'Surulere',
  'Lagos Island',
  'Ibeju-Lekki',
  'Alimosho',
  'Oshodi-Isolo',
  'Apapa',
  'Kosofe',
];

const STATUSES = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
  { value: 'APPROVED', label: 'Permit Approved' },
  { value: 'COMPLETED', label: 'Completed & Certified' },
  { value: 'STOP_WORK_ORDER', label: 'Stop-Work Order' },
];

const CATEGORIES = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'Commercial', label: 'Commercial High-Rise' },
  { value: 'Residential', label: 'Residential Apartments' },
  { value: 'Institutional', label: 'Institutional & Civic' },
  { value: 'Civil', label: 'Civil Infrastructure' },
];

export const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedLga,
  onLgaChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onReset,
  viewMode,
  onViewModeChange,
  totalCount,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by project name, permit number (e.g. LASBCA/PRM/2026/0419), or address..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F]/20 focus:border-[#022C4F] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Chips & Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* District / LGA Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            District / LGA
          </label>
          <select
            value={selectedLga}
            onChange={(e) => onLgaChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-[#022C4F]"
          >
            {LGAS.map((lga) => (
              <option key={lga} value={lga}>
                {lga === 'ALL' ? 'All Local Government Areas' : lga}
              </option>
            ))}
          </select>
        </div>

        {/* Regulatory Status */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Regulatory Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-[#022C4F]"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Project Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-[#022C4F]"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Sort Results By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-[#022C4F]"
          >
            <option value="recent">Most Recently Inspected</option>
            <option value="name_asc">Project Name (A - Z)</option>
            <option value="floors_desc">Height / Floors (Highest First)</option>
            <option value="permit_date">Permit Issue Date</option>
          </select>
        </div>
      </div>

      {/* Filter Bottom Bar: Results Count, Reset, & View Mode */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">
            {totalCount} Verified Projects Found
          </span>
          {(searchQuery || selectedLga !== 'ALL' || selectedStatus !== 'ALL' || selectedCategory !== 'ALL') && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white text-[#022C4F] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white text-[#022C4F] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="List View"
            aria-label="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
