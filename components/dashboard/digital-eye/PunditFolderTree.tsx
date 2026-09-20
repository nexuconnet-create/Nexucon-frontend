"use client";

import React, { useMemo, useState } from "react";
import { Boxes, ChevronDown, ChevronRight, Folder, FolderOpen, Sparkles } from "lucide-react";
import { formatVelocityMs, PunditTest } from "@/services/digitalEye";

/**
 * Shared Floor → Station folder tree for the Pundit section pages.
 *
 * Extracted from the UPV Test Registry page (`pundit/tests/page.tsx`) so the
 * registry, waveforms, data-collection and AI-analysis pages all present their
 * scans in the same folder structure: Floor folder → Station sub-menu → the
 * page's own rows/cards, with a Folders / Flat-list toggle and each station's
 * mean values.
 *
 * Grouping uses ONLY fields the records actually carry — an empty floor or
 * element name falls into an honest "not recorded / not named" bucket; nothing
 * is ever fabricated client-side.
 */

// Worst-first quality order for the station-level remark badge.
export const RATING_SEVERITY = ['VERY_POOR', 'POOR', 'DOUBTFUL', 'PENDING', 'GOOD', 'EXCELLENT'];

export const ratingBadgeClass = (rating: string) =>
  rating === 'EXCELLENT' || rating === 'GOOD'
    ? 'bg-emerald-100 text-emerald-800'
    : rating === 'PENDING'
    ? 'bg-gray-100 text-gray-600'
    : 'bg-rose-100 text-rose-800';

/** Mean values shown on a folder / station row. */
export interface StationSummary {
  meanV: number | null;
  meanF: number | null;
  remark: string;
}

// ---- PunditTest-specific grouping keys & means (registry semantics) ----

export const punditFloorOf = (t: PunditTest): string =>
  (t.floor || '').trim() || 'Floor not recorded';

export const punditStationOf = (t: PunditTest): string =>
  (t.structural_element_name || t.test_location || '').trim() || 'Station not named';

/** Grouping key for the outer folder level, for pages whose records span more
 *  than one project (the Inspector workspace sees every project in their
 *  scope, so `Floor:200THK RC SLAB` legitimately recurs across projects and
 *  must not merge into one folder). Same honest-bucket rule as the others: a
 *  record naming no project is its own group, never folded into a neighbour. */
export const punditProjectOf = (t: PunditTest): string =>
  (t.project_name || '').trim() || 'Project not recorded';

/** Mean velocity / mean f_cu / worst rating across a station's tests
 *  (server-persisted element means per test). */
export const punditStationSummary = (rows: PunditTest[]): StationSummary => {
  const vs = rows.map((t) => t.pulse_velocity_ms).filter((v): v is number => v > 0);
  const fs = rows.map((t) => t.estimated_compressive_strength_mpa).filter((f): f is number => f != null);
  return {
    meanV: vs.length ? vs.reduce((s, v) => s + v, 0) / vs.length : null,
    meanF: fs.length ? fs.reduce((s, f) => s + f, 0) / fs.length : null,
    remark: rows.reduce((worst, t) => {
      const a = RATING_SEVERITY.indexOf(t.concrete_quality_rating);
      const b = RATING_SEVERITY.indexOf(worst);
      return a < b ? t.concrete_quality_rating : worst;
    }, 'EXCELLENT' as string),
  };
};

// ---- Folder view state (Floor → Station) ----

export type FolderViewMode = 'grouped' | 'flat';

/** Holds the Folders/Flat choice and the open floor/station sets for one
 *  page's tree. Each page gets its own independent tree state. */
export function useFloorStationFolders<T>(
  items: T[],
  getFloor: (item: T) => string,
  getStation: (item: T) => string,
) {
  const [viewMode, setViewMode] = useState<FolderViewMode>('grouped');
  const [openFloors, setOpenFloors] = useState<Set<string>>(new Set());
  const [openStations, setOpenStations] = useState<Set<string>>(new Set());

  // Floor folder -> Station sub-menu -> items, in record order.
  const groups = useMemo<[string, Map<string, T[]>][]>(() => {
    const floors = new Map<string, Map<string, T[]>>();
    for (const item of items) {
      const floorKey = getFloor(item);
      const stationKey = getStation(item);
      if (!floors.has(floorKey)) floors.set(floorKey, new Map());
      const stations = floors.get(floorKey)!;
      if (!stations.has(stationKey)) stations.set(stationKey, []);
      stations.get(stationKey)!.push(item);
    }
    return Array.from(floors.entries());
  }, [items, getFloor, getStation]);

  const toggleFloor = (floor: string) =>
    setOpenFloors((prev) => {
      const next = new Set(prev);
      if (next.has(floor)) next.delete(floor);
      else next.add(floor);
      return next;
    });

  const toggleStation = (key: string) =>
    setOpenStations((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return { viewMode, setViewMode, groups, openFloors, openStations, toggleFloor, toggleStation };
}

/** Three-level variant: Project → Floor → Station.
 *
 *  For pages whose records span several projects — the Inspector workspace
 *  calls `getPunditTests()` with no project filter, so its 14 records cross
 *  five projects and a Floor-first tree would merge different projects' tests
 *  under one heading. The Government registry has a single-project selector
 *  above its tree and so keeps using the two-level hook.
 *
 *  Same state shape as `useFloorStationFolders`, with the project level added.
 */
export function useProjectFloorStationFolders<T>(
  items: T[],
  getProject: (item: T) => string,
  getFloor: (item: T) => string,
  getStation: (item: T) => string,
) {
  const [viewMode, setViewMode] = useState<FolderViewMode>('grouped');
  const [openProjects, setOpenProjects] = useState<Set<string>>(new Set());
  const [openFloors, setOpenFloors] = useState<Set<string>>(new Set());
  const [openStations, setOpenStations] = useState<Set<string>>(new Set());

  // Project folder -> Floor folder -> Station sub-menu -> items, in record order.
  const groups = useMemo<[string, Map<string, Map<string, T[]>>][]>(() => {
    const projects = new Map<string, Map<string, Map<string, T[]>>>();
    for (const item of items) {
      const projectKey = getProject(item);
      const floorKey = getFloor(item);
      const stationKey = getStation(item);
      if (!projects.has(projectKey)) projects.set(projectKey, new Map());
      const floors = projects.get(projectKey)!;
      if (!floors.has(floorKey)) floors.set(floorKey, new Map());
      const stations = floors.get(floorKey)!;
      if (!stations.has(stationKey)) stations.set(stationKey, []);
      stations.get(stationKey)!.push(item);
    }
    return Array.from(projects.entries());
  }, [items, getProject, getFloor, getStation]);

  const toggleProject = (project: string) =>
    setOpenProjects((prev) => {
      const next = new Set(prev);
      if (next.has(project)) next.delete(project);
      else next.add(project);
      return next;
    });

  const toggleFloor = (floor: string) =>
    setOpenFloors((prev) => {
      const next = new Set(prev);
      if (next.has(floor)) next.delete(floor);
      else next.add(floor);
      return next;
    });

  const toggleStation = (key: string) =>
    setOpenStations((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return {
    viewMode,
    setViewMode,
    groups,
    openProjects,
    openFloors,
    openStations,
    toggleProject,
    toggleFloor,
    toggleStation,
  };
}

/** The Folders / Flat list segmented toggle (each page places it in its own
 *  toolbar row, next to its own buttons and record count). */
export function FolderViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: FolderViewMode;
  onChange: (mode: FolderViewMode) => void;
}) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-bold">
      <button
        onClick={() => onChange('grouped')}
        className={`px-3 py-1.5 flex items-center gap-1.5 cursor-pointer ${viewMode === 'grouped' ? 'bg-[#022C4F] text-white' : 'bg-white text-gray-600 hover:bg-slate-50'}`}
      >
        <Boxes size={13} />
        <span>Folders</span>
      </button>
      <button
        onClick={() => onChange('flat')}
        className={`px-3 py-1.5 cursor-pointer ${viewMode === 'flat' ? 'bg-[#022C4F] text-white' : 'bg-white text-gray-600 hover:bg-slate-50'}`}
      >
        Flat list
      </button>
    </div>
  );
}

/** The grouped body: floor folder rows → station sub-menu rows (with mean
 *  values) → the page's own rows/cards via `renderStationBody`. The flat
 *  variant stays on the page — its table keeps page-specific columns. */
export function FloorStationTreeBody<T>({
  groups,
  openFloors,
  openStations,
  toggleFloor,
  toggleStation,
  stationSummary,
  renderStationBody,
}: {
  groups: [string, Map<string, T[]>][];
  openFloors: Set<string>;
  openStations: Set<string>;
  toggleFloor: (floor: string) => void;
  toggleStation: (key: string) => void;
  /** Mean badges for a folder/station row; return null to hide them. */
  stationSummary: (rows: T[]) => StationSummary | null;
  /** The page's rows/cards for one open station (table, card grid…). */
  renderStationBody: (rows: T[]) => React.ReactNode;
}) {
  return (
    <div className="divide-y divide-gray-100">
      {groups.map(([floor, stations]) => {
        const floorRows = Array.from(stations.values()).flat();
        const isOpen = openFloors.has(floor);
        const floorSummary = stationSummary(floorRows);
        return (
          <div key={floor}>
            {/* Floor folder */}
            <button
              onClick={() => toggleFloor(floor)}
              className="w-full px-5 py-3 flex items-center gap-3 bg-gray-50/80 hover:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
              {isOpen ? <FolderOpen size={15} className="text-amber-500" /> : <Folder size={15} className="text-amber-500" />}
              <span className="text-xs font-black uppercase tracking-wide text-[#022C4F]">{floor}</span>
              <span className="text-[10px] font-mono text-gray-500">
                {stations.size} station{stations.size === 1 ? '' : 's'} · {floorRows.length} test{floorRows.length === 1 ? '' : 's'}
              </span>
              {floorSummary && (
                <span className="ml-auto text-[10px] font-mono text-gray-400">
                  mean V {formatVelocityMs(floorSummary.meanV)} m/s · mean f_cu{' '}
                  {floorSummary.meanF != null ? `${floorSummary.meanF.toFixed(1)} MPa` : '—'}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="bg-white">
                {Array.from(stations.entries()).map(([station, rows]) => {
                  const stationKey = `${floor}::${station}`;
                  const stationOpen = openStations.has(stationKey);
                  const summary = stationSummary(rows);
                  return (
                    <div key={stationKey} className="border-t border-gray-100">
                      {/* Station sub-menu row with its mean values */}
                      <button
                        onClick={() => toggleStation(stationKey)}
                        className="w-full px-5 py-2.5 pl-12 flex flex-wrap items-center gap-3 hover:bg-amber-50/40 transition-colors text-left cursor-pointer"
                      >
                        {stationOpen ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-sky-500" />
                          {station}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">{rows.length} test{rows.length === 1 ? '' : 's'}</span>
                        {summary && (
                          <span className="ml-auto flex items-center gap-4 text-[11px] font-mono">
                            <span className="text-gray-500">
                              Mean V: <span className="font-bold text-amber-700">{formatVelocityMs(summary.meanV)} m/s</span>
                            </span>
                            <span className="text-gray-500">
                              Mean f_cu: <span className={`font-bold ${summary.meanF != null && summary.meanF < 25 ? 'text-rose-600' : 'text-gray-800'}`}>{summary.meanF != null ? `${summary.meanF.toFixed(1)} MPa` : '—'}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ratingBadgeClass(summary.remark)}`}>{summary.remark}</span>
                          </span>
                        )}
                      </button>

                      {stationOpen && <div>{renderStationBody(rows)}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Three-level folder tree (Project → Floor → Station) ----

/**
 * The grouped body for a cross-project register: Project folder → Floor folder
 * → Station sub-menu → the page's own rows/cards via `renderStationBody`.
 *
 * Each level indents one step further so the hierarchy is legible without
 * colour alone. Project and Floor rows both carry the same mean badges via
 * `stationSummary`; the Station row additionally carries the worst-rating
 * badge, as in the two-level tree. Means are whatever the summary returns —
 * `null` renders as `—`, never as `0`.
 */
export function ProjectFloorStationTreeBody<T>({
  groups,
  openProjects,
  openFloors,
  openStations,
  toggleProject,
  toggleFloor,
  toggleStation,
  stationSummary,
  renderStationBody,
}: {
  groups: [string, Map<string, Map<string, T[]>>][];
  openProjects: Set<string>;
  openFloors: Set<string>;
  openStations: Set<string>;
  toggleProject: (project: string) => void;
  toggleFloor: (floor: string) => void;
  toggleStation: (key: string) => void;
  /** Mean badges for a folder/station row; return null to hide them. */
  stationSummary: (rows: T[]) => StationSummary | null;
  /** The page's rows/cards for one open station (table, card grid…). */
  renderStationBody: (rows: T[]) => React.ReactNode;
}) {
  return (
    <div className="divide-y divide-gray-100">
      {groups.map(([project, floors]) => {
        const projectRows = Array.from(floors.values())
          .flatMap((stations) => Array.from(stations.values()))
          .flat();
        const projectOpen = openProjects.has(project);
        const projectSummary = stationSummary(projectRows);
        return (
          <div key={project}>
            {/* Project folder */}
            <button
              onClick={() => toggleProject(project)}
              className="w-full px-5 py-3.5 flex flex-wrap items-center gap-3 bg-slate-100/80 hover:bg-slate-200/70 transition-colors text-left cursor-pointer"
            >
              {projectOpen ? <ChevronDown size={14} className="text-gray-600" /> : <ChevronRight size={14} className="text-gray-600" />}
              {projectOpen ? <FolderOpen size={16} className="text-[#022C4F]" /> : <Folder size={16} className="text-[#022C4F]" />}
              <span className="text-xs font-black uppercase tracking-wide text-[#022C4F]">{project}</span>
              <span className="text-[10px] font-mono text-gray-500">
                {floors.size} floor{floors.size === 1 ? '' : 's'} · {projectRows.length} test{projectRows.length === 1 ? '' : 's'}
              </span>
              {projectSummary && (
                <span className="ml-auto text-[10px] font-mono text-gray-500">
                  mean V {formatVelocityMs(projectSummary.meanV)} m/s · mean f_cu{' '}
                  {projectSummary.meanF != null ? `${projectSummary.meanF.toFixed(1)} MPa` : '—'}
                </span>
              )}
            </button>

            {projectOpen && (
              <div className="bg-white">
                {Array.from(floors.entries()).map(([floor, stations]) => {
                  const floorKey = `${project}::${floor}`;
                  const floorOpen = openFloors.has(floorKey);
                  const floorRows = Array.from(stations.values()).flat();
                  const floorSummary = stationSummary(floorRows);
                  return (
                    <div key={floorKey} className="border-t border-gray-100">
                      {/* Floor folder — indented one step under the project */}
                      <button
                        onClick={() => toggleFloor(floorKey)}
                        className="w-full px-5 py-3 pl-10 flex flex-wrap items-center gap-3 bg-gray-50/80 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                      >
                        {floorOpen ? <ChevronDown size={13} className="text-gray-500" /> : <ChevronRight size={13} className="text-gray-500" />}
                        {floorOpen ? <FolderOpen size={15} className="text-amber-500" /> : <Folder size={15} className="text-amber-500" />}
                        <span className="text-xs font-black uppercase tracking-wide text-[#022C4F]">{floor}</span>
                        <span className="text-[10px] font-mono text-gray-500">
                          {stations.size} station{stations.size === 1 ? '' : 's'} · {floorRows.length} test{floorRows.length === 1 ? '' : 's'}
                        </span>
                        {floorSummary && (
                          <span className="ml-auto text-[10px] font-mono text-gray-400">
                            mean V {formatVelocityMs(floorSummary.meanV)} m/s · mean f_cu{' '}
                            {floorSummary.meanF != null ? `${floorSummary.meanF.toFixed(1)} MPa` : '—'}
                          </span>
                        )}
                      </button>

                      {floorOpen && (
                        <div className="bg-white">
                          {Array.from(stations.entries()).map(([station, rows]) => {
                            // Unique across projects and floors — two projects can
                            // legitimately name the same floor and station.
                            const stationKey = `${project}::${floor}::${station}`;
                            const stationOpen = openStations.has(stationKey);
                            const summary = stationSummary(rows);
                            return (
                              <div key={stationKey} className="border-t border-gray-100">
                                {/* Station sub-menu row with its mean values */}
                                <button
                                  onClick={() => toggleStation(stationKey)}
                                  className="w-full px-5 py-2.5 pl-16 flex flex-wrap items-center gap-3 hover:bg-amber-50/40 transition-colors text-left cursor-pointer"
                                >
                                  {stationOpen ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
                                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                    <Sparkles size={12} className="text-sky-500" />
                                    {station}
                                  </span>
                                  <span className="text-[10px] font-mono text-gray-500">{rows.length} test{rows.length === 1 ? '' : 's'}</span>
                                  {summary && (
                                    <span className="ml-auto flex items-center gap-4 text-[11px] font-mono">
                                      <span className="text-gray-500">
                                        Mean V: <span className="font-bold text-amber-700">{formatVelocityMs(summary.meanV)} m/s</span>
                                      </span>
                                      <span className="text-gray-500">
                                        Mean f_cu: <span className={`font-bold ${summary.meanF != null && summary.meanF < 25 ? 'text-rose-600' : 'text-gray-800'}`}>{summary.meanF != null ? `${summary.meanF.toFixed(1)} MPa` : '—'}</span>
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ratingBadgeClass(summary.remark)}`}>{summary.remark}</span>
                                    </span>
                                  )}
                                </button>

                                {stationOpen && <div>{renderStationBody(rows)}</div>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Single-level folder list (findings) ----
// DigitalEyeFinding carries no floor — structural element is the honest
// deepest grouping available without a backend change, so findings lists get
// a one-level Element → findings tree in the same folder styling.

/**
 * Self-contained one-level folder list: Element folder → the page's own rows.
 * Renders its own toolbar (Folders/Flat toggle + record count); the page keeps
 * its section header and any search box outside.
 */
export function ElementFolderList<T>({
  items,
  getGroup,
  renderItem,
  itemNoun = 'record',
  bodyClassName = 'divide-y divide-gray-100',
  toolbarExtra,
}: {
  items: T[];
  getGroup: (item: T) => string;
  /** Must return a keyed element (it is rendered directly into lists). */
  renderItem: (item: T) => React.ReactNode;
  itemNoun?: string;
  /** Class of the container holding one folder's (or the flat list's) rows. */
  bodyClassName?: string;
  toolbarExtra?: React.ReactNode;
}) {
  const [viewMode, setViewMode] = useState<FolderViewMode>('grouped');
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const groups = useMemo<[string, T[]][]>(() => {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const key = getGroup(item);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [items, getGroup]);

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div>
      <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <FolderViewToggle viewMode={viewMode} onChange={setViewMode} />
        {toolbarExtra}
        <span className="text-xs text-gray-500 font-mono">
          {items.length} {itemNoun}{items.length === 1 ? '' : 's'}
        </span>
      </div>

      {viewMode === 'flat' ? (
        <div className={bodyClassName}>{items.map((item) => renderItem(item))}</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {groups.map(([group, rows]) => {
            const isOpen = openGroups.has(group);
            return (
              <div key={group}>
                {/* Element folder */}
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full px-5 py-3 flex items-center gap-3 bg-gray-50/80 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                >
                  {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                  {isOpen ? <FolderOpen size={15} className="text-amber-500" /> : <Folder size={15} className="text-amber-500" />}
                  <span className="text-xs font-black uppercase tracking-wide text-[#022C4F]">{group}</span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {rows.length} {itemNoun}{rows.length === 1 ? '' : 's'}
                  </span>
                </button>
                {isOpen && <div className={bodyClassName}>{rows.map((item) => renderItem(item))}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
