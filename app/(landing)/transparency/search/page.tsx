"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { getPublicProjects, PublicProject } from '@/services/publicPortal';
import { ProjectCard } from '@/components/transparency/ProjectCard';
import { ProjectFilterBar } from '@/components/transparency/ProjectFilterBar';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialLga = searchParams.get('lga') || 'ALL';
  const initialStatus = searchParams.get('status') || 'ALL';

  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedLga, setSelectedLga] = useState(initialLga);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const data = await getPublicProjects({
          query: searchQuery,
          lga: selectedLga,
          status: selectedStatus,
          category: selectedCategory,
        });

        // Apply Sorting
        const sorted = [...data];
        if (sortBy === 'name_asc') {
          sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'floors_desc') {
          sorted.sort((a, b) => b.number_of_floors - a.number_of_floors);
        } else if (sortBy === 'permit_date') {
          sorted.sort((a, b) => b.permit_issued_date.localeCompare(a.permit_issued_date));
        }

        setProjects(sorted);
      } catch (err) {
        // Fallback handled
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFiltered();
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedLga, selectedStatus, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLga('ALL');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setSortBy('recent');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
          <Building2 className="w-4 h-4" />
          <span>Statutory Building Registry</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#022C4F]">
          Search Approved Building Projects
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Search verified construction developments across Lagos State by project name, statutory permit number, developer, or Local Government Area.
        </p>
      </div>

      {/* Filter Bar Component */}
      <ProjectFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLga={selectedLga}
        onLgaChange={setSelectedLga}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={projects.length}
      />

      {/* Results Container */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
          <div className="w-10 h-10 border-4 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-700">Filtering Approved Projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#022C4F]">
            No Matching Building Projects Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            We could not find any active public records matching your filters. Try clearing your search keyword or selecting "All Local Government Areas".
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            Reset All Search Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-[#022C4F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading project search...</span>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
