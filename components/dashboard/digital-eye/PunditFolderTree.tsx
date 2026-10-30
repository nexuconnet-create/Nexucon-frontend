"use client";

import React, { useMemo, useState } from "react";
import { Boxes, Building2, ChevronDown, ChevronRight, Folder, FolderOpen, Sparkles, Trash2 } from "lucide-react";
import { formatVelocityMs, PunditTest } from "@/services/digitalEye";

/**
 * Shared Building → Floor → Station folder tree for the Pundit section pages.
 *
 * Grouping structure:
 *  - When tests span multiple buildings (e.g. Building A, B, C):
 *      Project folder → Building folder → Floor folder → Station sub-menu → tests.
 *  - When tests belong to a single building (e.g. single tower / no building prefix):
 *      Project folder → Floor folder → Station sub-menu → tests.
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

/**
 * Automatically infers building / block name from element or location naming conventions.
 * Examples:
 *   "A-GFC1" -> "Building A"
 *   "B--GCF13" -> "Building B"
 *   "C-FFS3" -> "Building C"
 *   "BLD-A-COL1" -> "Building A"
 *   "BLOCK-2-COL1" -> "Block 2"
 *   "TOWER-B-FFC1" -> "Tower B"
 *   "COL-10-C1" -> null (single structure)
 *   "FFCW1" -> null (single structure)
 */
export const inferBuildingFromElement = (
  elementName?: string | null,
  location?: string | null
): string | null => {
  const str = `${elementName || ''} ${location || ''}`.trim();
  if (!str) return null;
  const upper = str.toUpperCase();

  // 1. Explicit building/block/tower/wing tokens:
  const explicitMatch = upper.match(/(?:^|[-_\s:/])(?:BUILDING|BLOCK|BLD|BLK|TOWER|WING)[-_\s:/]?([A-Z0-9]+)/i);
  if (explicitMatch) {
    const rawType = upper.match(/(BUILDING|BLOCK|BLD|BLK|TOWER|WING)/i)?.[1]?.toUpperCase() || 'BUILDING';
    const labelType = rawType.startsWith('BLD') || rawType === 'BUILDING' ? 'Building'
      : rawType.startsWith('BLK') || rawType === 'BLOCK' ? 'Block'
      : rawType === 'TOWER' ? 'Tower' : 'Wing';
    return `${labelType} ${explicitMatch[1].toUpperCase()}`;
  }

  // 2. Single-letter building prefix before hyphen: e.g. "A-GFC1", "B-GCF3", "B--GCF13", "C-FFS3"
  const pfxMatch = upper.match(/^([A-Z])--?([A-Z0-9]+)/);
  if (pfxMatch) {
    const letter = pfxMatch[1].toUpperCase();
    const rest = pfxMatch[2].toUpperCase();
    if (
      /(?:GF|FF|SF|TF|RF|BF|B\d|0F|1F|2F|3F|\d+F|COL|BM|SL|BEAM|SLAB|WALL|GCF|GFC|FFC|FFB|FFS|SFC|SFB|SFS|TFC|TFB|TFS)/i.test(rest)
    ) {
      return `Building ${letter}`;
    }
  }

  return null;
};

export const punditBuildingOf = (t: PunditTest): string | null => {
  return inferBuildingFromElement(
    t.structural_element_name || t.structural_element,
    t.test_location
  );
};

/**
 * Automatically infers floor from element naming convention (e.g. FFCW1 -> First Floor, GFCW1 -> Ground Floor)
 * when raw floor is generic, missing, or defaulted to Ground Floor.
 */
export const inferFloorFromElement = (elementName?: string | null, location?: string | null): string | null => {
  const str = `${elementName || ''} ${location || ''}`.trim();
  if (!str) return null;
  const upper = str.toUpperCase();

  // 1. Multi-storey station codes: COL-10-C1, BM-20-B1, SL-15-S1, etc.
  const multiMatch = upper.match(/(?:^|[-_\s:/])(?:COL|BM|SL|BEAM|SLAB|WALL)[-_\s:/](\d+)[-_\s:/]/i);
  if (multiMatch) {
    const num = parseInt(multiMatch[1], 10);
    if (num === 0) return 'Ground Floor';
    if (num === 1) return 'First Floor';
    if (num === 2) return 'Second Floor';
    if (num === 3) return 'Third Floor';
    const sfx = (num % 10 === 1 && num % 100 !== 11) ? 'st' : (num % 10 === 2 && num % 100 !== 12) ? 'nd' : (num % 10 === 3 && num % 100 !== 13) ? 'rd' : 'th';
    return `${num}${sfx} Floor`;
  }

  // 2. Numbered floor combined acronyms: 10FC, 15FB, 20FS, 10F, 20F, 4F, 5F, etc.
  const numFMatch = upper.match(/(?:^|[-_\s:/])(\d+)F(?:[CBWSF]|\b|[-_\s:/0-9])/i);
  if (numFMatch) {
    const num = parseInt(numFMatch[1], 10);
    if (num === 0) return 'Ground Floor';
    if (num === 1) return 'First Floor';
    if (num === 2) return 'Second Floor';
    if (num === 3) return 'Third Floor';
    const sfx = (num % 10 === 1 && num % 100 !== 11) ? 'st' : (num % 10 === 2 && num % 100 !== 12) ? 'nd' : (num % 10 === 3 && num % 100 !== 13) ? 'rd' : 'th';
    return `${num}${sfx} Floor`;
  }

  // 3. First Floor: FF, 1F, FIRST, 1ST (e.g. A-FFB1, A-FFC1, A-FFS1, A-FF-GB, FFCW1, FFC1)
  if (
    /(?:^|[-_\s:/])(?:FF|1F|FL1)(?:[CBWSF0-9\b]|[-_\s:/]|$)/i.test(upper) ||
    /(?:^|[-_\s:/])(?:FIRST|1ST)(?:[-_\s:/]|$)/i.test(upper) ||
    /FIRST\s+FLOOR/i.test(upper)
  ) {
    return 'First Floor';
  }

  // 4. Ground Floor: GF, 0F, GROUND, GCF (typo in test files) (e.g. A-GFB1, A-GFC1, A-GFS1, A-GF-GB, GFCW1, GFC1, A-GCF1)
  if (
    /(?:^|[-_\s:/])(?:GF|GCF|0F|FL0)(?:[CBWSF0-9\b]|[-_\s:/]|$)/i.test(upper) ||
    /(?:^|[-_\s:/])GROUND(?:[-_\s:/]|$)/i.test(upper) ||
    /GROUND\s+FLOOR/i.test(upper)
  ) {
    return 'Ground Floor';
  }

  // 5. Second Floor: SF, 2F, SECOND, 2ND
  if (
    /(?:^|[-_\s:/])(?:SF|2F|FL2)(?:[CBWSF0-9\b]|[-_\s:/]|$)/i.test(upper) ||
    /(?:^|[-_\s:/])(?:SECOND|2ND)(?:[-_\s:/]|$)/i.test(upper) ||
    /SECOND\s+FLOOR/i.test(upper)
  ) {
    return 'Second Floor';
  }

  // 6. Third Floor: TF, 3F, THIRD, 3RD
  if (
    /(?:^|[-_\s:/])(?:TF|3F|FL3)(?:[CBWSF0-9\b]|[-_\s:/]|$)/i.test(upper) ||
    /(?:^|[-_\s:/])(?:THIRD|3RD)(?:[-_\s:/]|$)/i.test(upper) ||
    /THIRD\s+FLOOR/i.test(upper)
  ) {
    return 'Third Floor';
  }

  // 7. Roof: RF, ROOF, RFC, RFB, RFS, RFW
  if (
    /(?:^|[-_\s:/])(?:RF)(?:[CBWSF0-9\b]|[-_\s:/]|$)/i.test(upper) ||
    /(?:^|[-_\s:/])ROOF(?:[-_\s:/]|$)/i.test(upper)
  ) {
    return 'Roof';
  }

  // 8. Basement: B1, B2, BF, BASEMENT
  if (/(?:^|[-_\s:/])B1(?:[-_\s:/]|$)/i.test(upper)) return 'Basement 1';
  if (/(?:^|[-_\s:/])B2(?:[-_\s:/]|$)/i.test(upper)) return 'Basement 2';
  if (/(?:^|[-_\s:/])(?:BF|BASEMENT)(?:[-_\s:/]|$)/i.test(upper)) return 'Basement';

  // 9. Explicit unrecorded: UF
  if (/(?:^|[-_\s:/])UF(?:[-_\s:/]|$)/i.test(upper)) return 'Floor not recorded';

  return null;
};

export const punditFloorOf = (t: PunditTest): string => {
  const rawFloor = (t.floor || '').trim();
  const inferred = inferFloorFromElement(
    t.structural_element_name || t.structural_element,
    t.test_location
  );

  if (inferred) {
    if (
      !rawFloor ||
      rawFloor.toLowerCase() === 'floor not recorded' ||
      rawFloor.toLowerCase() === 'unspecified' ||
      (rawFloor.toLowerCase() === 'ground floor' && inferred !== 'Ground Floor')
    ) {
      return inferred;
    }
  }

  return rawFloor || inferred || 'Floor not recorded';
};

export const punditStationOf = (t: PunditTest): string =>
  (t.structural_element_name || t.structural_element || t.test_location || '').trim() || 'Station not named';

/** Natural alphanumeric sorting helper (e.g. S1, S2, ..., S9, S10, S11, ..., S20) */
export const naturalSortStations = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

/** Natural building sorting helper (Building A, Building B, Building C...) */
export const naturalSortBuildings = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

/** Structural floor ordering helper (Basement -> Ground Floor -> First Floor -> Second Floor ...) */
export const floorOrderIndex = (floor: string): number => {
  const f = floor.toLowerCase();
  if (f.includes('basement 2') || f.includes('b2')) return -2;
  if (f.includes('basement 1') || f.includes('b1')) return -1;
  if (f.includes('basement') || f.startsWith('b')) return -1;
  if (f.includes('ground') || f.startsWith('gf') || f.startsWith('0')) return 0;
  if (f.includes('first') || f.startsWith('ff') || f.startsWith('1')) return 1;
  if (f.includes('second') || f.startsWith('sf') || f.startsWith('2')) return 2;
  if (f.includes('third') || f.startsWith('tf') || f.startsWith('3')) return 3;
  const match = f.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  if (f.includes('roof') || f.startsWith('rf')) return 999;
  return 50;
};

export const naturalSortFloors = (a: string, b: string): number => {
  const idxA = floorOrderIndex(a);
  const idxB = floorOrderIndex(b);
  if (idxA !== idxB) return idxA - idxB;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

/** Grouping key for the outer folder level, for pages whose records span more than one project. */
export const punditProjectOf = (t: PunditTest): string =>
  (t.project_name || '').trim() || 'Project not recorded';

/** Mean velocity / mean f_cu / worst rating across a station's tests. */
export const punditStationSummary = (rows: PunditTest[]): StationSummary => {
  const vs = rows.map((t) => t.pulse_velocity_ms).filter((v): v is number => v != null && v > 0 && v <= 5000);
  const fs = rows.map((t) => t.estimated_compressive_strength_mpa).filter((f): f is number => f != null && f > 0);
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

// ---- Folder view state (Building → Floor → Station or Floor → Station) ----

export type FolderViewMode = 'grouped' | 'flat';

/** Holds the Folders/Flat choice and the open building/floor/station sets for one page's tree. */
export function useFloorStationFolders<T>(
  items: T[],
  getFloor: (item: T) => string,
  getStation: (item: T) => string,
  getBuilding?: (item: T) => string | null,
) {
  const [viewMode, setViewMode] = useState<FolderViewMode>('grouped');
  const [openBuildings, setOpenBuildings] = useState<Set<string>>(new Set());
  const [openFloors, setOpenFloors] = useState<Set<string>>(new Set());
  const [openStations, setOpenStations] = useState<Set<string>>(new Set());

  const resolveBuilding = getBuilding || ((item: any) =>
    inferBuildingFromElement(item?.structural_element_name || item?.structural_element, item?.test_location)
  );

  // Check if multiple buildings exist across items
  const { hasMultipleBuildings, buildings, groups } = useMemo(() => {
    const bldSet = new Set<string>();
    for (const item of items) {
      const b = resolveBuilding(item);
      if (b) bldSet.add(b);
    }
    const multi = bldSet.size > 1;

    // Building -> Floor -> Station -> items
    const bldMap = new Map<string, Map<string, Map<string, T[]>>>();
    // Flat Floor -> Station -> items (for single-building or direct floor grouping)
    const floorMap = new Map<string, Map<string, T[]>>();

    for (const item of items) {
      const bld = resolveBuilding(item) || 'Main Building';
      const fl = getFloor(item);
      const st = getStation(item);

      if (!bldMap.has(bld)) bldMap.set(bld, new Map());
      const bFloors = bldMap.get(bld)!;
      if (!bFloors.has(fl)) bFloors.set(fl, new Map());
      const bStations = bFloors.get(fl)!;
      if (!bStations.has(st)) bStations.set(st, []);
      bStations.get(st)!.push(item);

      if (!floorMap.has(fl)) floorMap.set(fl, new Map());
      const fStations = floorMap.get(fl)!;
      if (!fStations.has(st)) fStations.set(st, []);
      fStations.get(st)!.push(item);
    }

    // Sort buildings
    const sortedBuildings = new Map<string, Map<string, Map<string, T[]>>>();
    const sortedBldKeys = Array.from(bldMap.keys()).sort(naturalSortBuildings);
    for (const bKey of sortedBldKeys) {
      const bFloors = bldMap.get(bKey)!;
      const sortedFloors = Array.from(bFloors.entries())
        .sort(([a], [b]) => naturalSortFloors(a, b))
        .map(([fKey, stMap]) => {
          const sortedStations = Array.from(stMap.entries()).sort(([a], [b]) => naturalSortStations(a, b));
          return [fKey, new Map(sortedStations)] as [string, Map<string, T[]>];
        });
      sortedBuildings.set(bKey, new Map(sortedFloors));
    }

    // Sort flat floors
    const sortedFloors = Array.from(floorMap.entries())
      .sort(([a], [b]) => naturalSortFloors(a, b))
      .map(([fKey, stMap]) => {
        const sortedStations = Array.from(stMap.entries()).sort(([a], [b]) => naturalSortStations(a, b));
        return [fKey, new Map(sortedStations)] as [string, Map<string, T[]>];
      });

    return {
      hasMultipleBuildings: multi,
      buildings: sortedBuildings,
      groups: sortedFloors,
    };
  }, [items, getFloor, getStation, resolveBuilding]);

  const toggleBuilding = (building: string) =>
    setOpenBuildings((prev) => {
      const next = new Set(prev);
      if (next.has(building)) next.delete(building);
      else next.add(building);
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
    hasMultipleBuildings,
    buildings,
    openBuildings,
    openFloors,
    openStations,
    toggleBuilding,
    toggleFloor,
    toggleStation,
  };
}

/** Project group holding building-first hierarchy or direct floor hierarchy */
export interface ProjectNode<T> {
  project: string;
  hasMultipleBuildings: boolean;
  buildings: Map<string, Map<string, Map<string, T[]>>>;
  floors: Map<string, Map<string, T[]>>;
  allRows: T[];
}

/**
 * Three/Four-level variant: Project → Building (if multiple) → Floor → Station.
 *
 * For cross-project registers (e.g. Inspector workspace).
 */
export function useProjectFloorStationFolders<T>(
  items: T[],
  getProject: (item: T) => string,
  getFloor: (item: T) => string,
  getStation: (item: T) => string,
  getBuilding?: (item: T) => string | null,
) {
  const [viewMode, setViewMode] = useState<FolderViewMode>('grouped');
  const [openProjects, setOpenProjects] = useState<Set<string>>(new Set());
  const [openBuildings, setOpenBuildings] = useState<Set<string>>(new Set());
  const [openFloors, setOpenFloors] = useState<Set<string>>(new Set());
  const [openStations, setOpenStations] = useState<Set<string>>(new Set());

  const resolveBuilding = getBuilding || ((item: any) =>
    inferBuildingFromElement(item?.structural_element_name || item?.structural_element, item?.test_location)
  );

  const groups = useMemo<[string, ProjectNode<T>][]>(() => {
    // 1. Group items by project
    const projectMap = new Map<string, T[]>();
    for (const item of items) {
      const p = getProject(item);
      if (!projectMap.has(p)) projectMap.set(p, []);
      projectMap.get(p)!.push(item);
    }

    const result: [string, ProjectNode<T>][] = [];

    for (const [project, pItems] of projectMap.entries()) {
      // Check if project has multiple buildings
      const bldSet = new Set<string>();
      for (const item of pItems) {
        const b = resolveBuilding(item);
        if (b) bldSet.add(b);
      }
      const hasMultipleBuildings = bldSet.size > 1;

      const buildings = new Map<string, Map<string, Map<string, T[]>>>();
      const floors = new Map<string, Map<string, T[]>>();

      for (const item of pItems) {
        const bld = resolveBuilding(item) || 'Main Building';
        const fl = getFloor(item);
        const st = getStation(item);

        if (!buildings.has(bld)) buildings.set(bld, new Map());
        const bFloors = buildings.get(bld)!;
        if (!bFloors.has(fl)) bFloors.set(fl, new Map());
        const bStations = bFloors.get(fl)!;
        if (!bStations.has(st)) bStations.set(st, []);
        bStations.get(st)!.push(item);

        if (!floors.has(fl)) floors.set(fl, new Map());
        const fStations = floors.get(fl)!;
        if (!fStations.has(st)) fStations.set(st, []);
        fStations.get(st)!.push(item);
      }

      // Sort buildings
      const sortedBuildings = new Map<string, Map<string, Map<string, T[]>>>();
      const sortedBldKeys = Array.from(buildings.keys()).sort(naturalSortBuildings);
      for (const bKey of sortedBldKeys) {
        const bFloors = buildings.get(bKey)!;
        const sortedFloors = Array.from(bFloors.entries())
          .sort(([a], [b]) => naturalSortFloors(a, b))
          .map(([fKey, stMap]) => {
            const sortedStations = Array.from(stMap.entries()).sort(([a], [b]) => naturalSortStations(a, b));
            return [fKey, new Map(sortedStations)] as [string, Map<string, T[]>];
          });
        sortedBuildings.set(bKey, new Map(sortedFloors));
      }

      // Sort flat floors
      const sortedFlatFloors = new Map<string, Map<string, T[]>>();
      const sortedFlatFloorEntries = Array.from(floors.entries())
        .sort(([a], [b]) => naturalSortFloors(a, b))
        .map(([fKey, stMap]) => {
          const sortedStations = Array.from(stMap.entries()).sort(([a], [b]) => naturalSortStations(a, b));
          return [fKey, new Map(sortedStations)] as [string, Map<string, T[]>];
        });
      for (const [k, v] of sortedFlatFloorEntries) {
        sortedFlatFloors.set(k, v);
      }

      result.push([
        project,
        {
          project,
          hasMultipleBuildings,
          buildings: sortedBuildings,
          floors: sortedFlatFloors,
          allRows: pItems,
        },
      ]);
    }

    return result;
  }, [items, getProject, getFloor, getStation, resolveBuilding]);

  const toggleProject = (project: string) =>
    setOpenProjects((prev) => {
      const next = new Set(prev);
      if (next.has(project)) next.delete(project);
      else next.add(project);
      return next;
    });

  const toggleBuilding = (key: string) =>
    setOpenBuildings((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
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
    openBuildings,
    openFloors,
    openStations,
    toggleProject,
    toggleBuilding,
    toggleFloor,
    toggleStation,
  };
}

/** The Folders / Flat list segmented toggle. */
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

/** The grouped body for single-project views (e.g. Government registry). */
export function FloorStationTreeBody<T>({
  groups,
  hasMultipleBuildings = false,
  buildings,
  openBuildings,
  openFloors,
  openStations,
  toggleBuilding,
  toggleFloor,
  toggleStation,
  stationSummary,
  renderStationBody,
}: {
  groups: [string, Map<string, T[]>][];
  hasMultipleBuildings?: boolean;
  buildings?: Map<string, Map<string, Map<string, T[]>>>;
  openBuildings?: Set<string>;
  openFloors: Set<string>;
  openStations: Set<string>;
  toggleBuilding?: (building: string) => void;
  toggleFloor: (floor: string) => void;
  toggleStation: (key: string) => void;
  /** Mean badges for a folder/station row; return null to hide them. */
  stationSummary: (rows: T[]) => StationSummary | null;
  /** The page's rows/cards for one open station. */
  renderStationBody: (rows: T[]) => React.ReactNode;
}) {
  const [internalOpenBuildings, setInternalOpenBuildings] = useState<Set<string>>(new Set());
  const activeOpenBuildings = openBuildings || internalOpenBuildings;
  const activeToggleBuilding =
    toggleBuilding ||
    ((b: string) =>
      setInternalOpenBuildings((prev) => {
        const next = new Set(prev);
        if (next.has(b)) next.delete(b);
        else next.add(b);
        return next;
      }));

  // If multiple buildings exist, render Building folders -> Floor folders -> Stations
  if (hasMultipleBuildings && buildings && buildings.size > 1) {
    return (
      <div className="divide-y divide-gray-100">
        {Array.from(buildings.entries()).map(([building, bFloors]) => {
          const isBldOpen = activeOpenBuildings.has(building);
          const bldRows = Array.from(bFloors.values())
            .flatMap((s) => Array.from(s.values()))
            .flat();
          const bldSummary = stationSummary(bldRows);
          return (
            <div key={building}>
              {/* Building Folder */}
              <button
                type="button"
                onClick={() => activeToggleBuilding(building)}
                className="w-full px-5 py-3 flex flex-wrap items-center gap-3 bg-slate-100/90 hover:bg-slate-200/80 transition-colors text-left cursor-pointer border-t border-slate-200"
              >
                {isBldOpen ? <ChevronDown size={14} className="text-indigo-600 shrink-0" /> : <ChevronRight size={14} className="text-indigo-600 shrink-0" />}
                <Building2 size={16} className="text-indigo-600 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wide text-indigo-950">{building}</span>
                <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded shrink-0">
                  {bFloors.size} floor{bFloors.size === 1 ? '' : 's'} · {bldRows.length} test{bldRows.length === 1 ? '' : 's'}
                </span>
                {bldSummary && (
                  <span className="ml-auto text-[10px] font-mono text-gray-500">
                    mean V {formatVelocityMs(bldSummary.meanV)} m/s · mean f_cu{' '}
                    {bldSummary.meanF != null ? `${bldSummary.meanF.toFixed(1)} MPa` : '—'}
                  </span>
                )}
              </button>

              {/* Floors inside this building */}
              {isBldOpen && (
                <div className="bg-white">
                  {Array.from(bFloors.entries()).map(([floor, stations]) => {
                    const floorKey = `${building}::${floor}`;
                    const floorOpen = openFloors.has(floorKey);
                    const floorRows = Array.from(stations.values()).flat();
                    const floorSummary = stationSummary(floorRows);
                    return (
                      <div key={floorKey} className="border-t border-gray-100">
                        {/* Floor folder indented */}
                        <button
                          type="button"
                          onClick={() => toggleFloor(floorKey)}
                          className="w-full px-5 py-2.5 pl-10 flex flex-wrap items-center gap-3 bg-gray-50/80 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                        >
                          {floorOpen ? <ChevronDown size={13} className="text-gray-500 shrink-0" /> : <ChevronRight size={13} className="text-gray-500 shrink-0" />}
                          {floorOpen ? <FolderOpen size={15} className="text-amber-500 shrink-0" /> : <Folder size={15} className="text-amber-500 shrink-0" />}
                          <span className="text-xs font-black uppercase tracking-wide text-[#022C4F]">{floor}</span>
                          <span className="text-[10px] font-mono text-gray-500 shrink-0">
                            {stations.size} station{stations.size === 1 ? '' : 's'} · {floorRows.length} test{floorRows.length === 1 ? '' : 's'}
                          </span>
                          {floorSummary && (
                            <span className="ml-auto text-[10px] font-mono text-gray-400">
                              mean V {formatVelocityMs(floorSummary.meanV)} m/s · mean f_cu{' '}
                              {floorSummary.meanF != null ? `${floorSummary.meanF.toFixed(1)} MPa` : '—'}
                            </span>
                          )}
                        </button>

                        {/* Stations */}
                        {floorOpen && (
                          <div className="bg-white">
                            {Array.from(stations.entries()).map(([station, rows]) => {
                              const stationKey = `${building}::${floor}::${station}`;
                              const stationOpen = openStations.has(stationKey);
                              const summary = stationSummary(rows);
                              return (
                                <div key={stationKey} className="border-t border-gray-100">
                                  <button
                                    type="button"
                                    onClick={() => toggleStation(stationKey)}
                                    className="w-full px-5 py-2 pl-16 flex flex-wrap items-center gap-3 hover:bg-amber-50/40 transition-colors text-left cursor-pointer"
                                  >
                                    {stationOpen ? <ChevronDown size={13} className="text-gray-400 shrink-0" /> : <ChevronRight size={13} className="text-gray-400 shrink-0" />}
                                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                      <Sparkles size={12} className="text-sky-500 shrink-0" />
                                      {station}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-500 shrink-0">{rows.length} test{rows.length === 1 ? '' : 's'}</span>
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

  // Fallback: Direct Floor folders
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
              type="button"
              onClick={() => toggleFloor(floor)}
              className="w-full px-5 py-3 flex items-center gap-3 bg-gray-50/80 hover:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              {isOpen ? <ChevronDown size={14} className="text-gray-500 shrink-0" /> : <ChevronRight size={14} className="text-gray-500 shrink-0" />}
              {isOpen ? <FolderOpen size={15} className="text-amber-500 shrink-0" /> : <Folder size={15} className="text-amber-500 shrink-0" />}
              <span className="text-xs font-black uppercase tracking-wide text-[#022C4F]">{floor}</span>
              <span className="text-[10px] font-mono text-gray-500 shrink-0">
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
                      <button
                        type="button"
                        onClick={() => toggleStation(stationKey)}
                        className="w-full px-5 py-2.5 pl-12 flex flex-wrap items-center gap-3 hover:bg-amber-50/40 transition-colors text-left cursor-pointer"
                      >
                        {stationOpen ? <ChevronDown size={13} className="text-gray-400 shrink-0" /> : <ChevronRight size={13} className="text-gray-400 shrink-0" />}
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-sky-500 shrink-0" />
                          {station}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 shrink-0">{rows.length} test{rows.length === 1 ? '' : 's'}</span>
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

// ---- Three/Four-level folder tree (Project → Building → Floor → Station) ----

/**
 * Grouped body for cross-project registers:
 * Project folder → Building folder (if multi-building) → Floor folder → Station sub-menu → tests.
 */
export function ProjectFloorStationTreeBody<T>({
  groups,
  openProjects,
  openBuildings,
  openFloors,
  openStations,
  toggleProject,
  toggleBuilding,
  toggleFloor,
  toggleStation,
  stationSummary,
  renderStationBody,
  onClearProject,
}: {
  groups: [string, any][];
  openProjects: Set<string>;
  openBuildings?: Set<string>;
  openFloors: Set<string>;
  openStations: Set<string>;
  toggleProject: (project: string) => void;
  toggleBuilding?: (buildingKey: string) => void;
  toggleFloor: (floor: string) => void;
  toggleStation: (key: string) => void;
  /** Mean badges for a folder/station row; return null to hide them. */
  stationSummary: (rows: T[]) => StationSummary | null;
  /** The page's rows/cards for one open station. */
  renderStationBody: (rows: T[]) => React.ReactNode;
  /** Optional callback to clear the entire project/folder of tests. */
  onClearProject?: (projectName: string, rows: T[]) => void;
}) {
  const [internalOpenBuildings, setInternalOpenBuildings] = useState<Set<string>>(new Set());
  const activeOpenBuildings = openBuildings || internalOpenBuildings;
  const activeToggleBuilding =
    toggleBuilding ||
    ((key: string) =>
      setInternalOpenBuildings((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      }));

  return (
    <div className="divide-y divide-gray-100">
      {groups.map(([project, data]) => {
        const isNode = data && typeof data === 'object' && 'hasMultipleBuildings' in data;
        const hasMultipleBuildings: boolean = isNode ? data.hasMultipleBuildings : false;
        const buildings: Map<string, Map<string, Map<string, T[]>>> = isNode ? data.buildings : new Map();
        const floors: Map<string, Map<string, T[]>> = isNode ? data.floors : (data as Map<string, Map<string, T[]>>);
        const projectRows: T[] = isNode
          ? data.allRows
          : Array.from((data as Map<string, any>).values())
              .flatMap((stations: any) => Array.from(stations.values()))
              .flat();
        const projectOpen = openProjects.has(project);
        const projectSummary = stationSummary(projectRows);

        return (
          <div key={project}>
            {/* Project folder */}
            <div className="w-full px-5 py-3.5 flex flex-wrap items-center gap-3 bg-slate-100/80 hover:bg-slate-200/70 transition-colors text-left">
              <button
                type="button"
                onClick={() => toggleProject(project)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                {projectOpen ? <ChevronDown size={14} className="text-gray-600 shrink-0" /> : <ChevronRight size={14} className="text-gray-600 shrink-0" />}
                {projectOpen ? <FolderOpen size={16} className="text-[#022C4F] shrink-0" /> : <Folder size={16} className="text-[#022C4F] shrink-0" />}
                <span className="text-xs font-black uppercase tracking-wide text-[#022C4F] truncate">{project}</span>
                <span className="text-[10px] font-mono text-gray-500 shrink-0">
                  {hasMultipleBuildings ? `${buildings.size} buildings · ` : ''}
                  {floors.size} floor{floors.size === 1 ? '' : 's'} · {projectRows.length} test{projectRows.length === 1 ? '' : 's'}
                </span>
              </button>
              <div className="ml-auto flex items-center gap-3">
                {projectSummary && (
                  <span className="text-[10px] font-mono text-gray-500">
                    mean V {formatVelocityMs(projectSummary.meanV)} m/s · mean f_cu{' '}
                    {projectSummary.meanF != null ? `${projectSummary.meanF.toFixed(1)} MPa` : '—'}
                  </span>
                )}
                {onClearProject && projectRows.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearProject(project, projectRows);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                    title={`Clear all tests in ${project}`}
                  >
                    <Trash2 size={11} />
                    <span>Clear Folder</span>
                  </button>
                )}
              </div>
            </div>

            {projectOpen && (
              <div className="bg-white">
                {/* 1. Multi-building project: Render Building folders */}
                {hasMultipleBuildings ? (
                  Array.from(buildings.entries()).map(([building, bFloors]) => {
                    const bldKey = `${project}::${building}`;
                    const bldOpen = activeOpenBuildings.has(bldKey);
                    const bldRows = Array.from(bFloors.values())
                      .flatMap((s) => Array.from(s.values()))
                      .flat();
                    const bldSummary = stationSummary(bldRows);
                    return (
                      <div key={bldKey} className="border-t border-slate-200/80">
                        {/* Building folder row */}
                        <button
                          type="button"
                          onClick={() => activeToggleBuilding(bldKey)}
                          className="w-full px-5 py-3 pl-9 flex flex-wrap items-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                        >
                          {bldOpen ? <ChevronDown size={14} className="text-indigo-600 shrink-0" /> : <ChevronRight size={14} className="text-indigo-600 shrink-0" />}
                          <Building2 size={16} className="text-indigo-600 shrink-0" />
                          <span className="text-xs font-black uppercase tracking-wide text-indigo-950">{building}</span>
                          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded shrink-0">
                            {bFloors.size} floor{bFloors.size === 1 ? '' : 's'} · {bldRows.length} test{bldRows.length === 1 ? '' : 's'}
                          </span>
                          {bldSummary && (
                            <span className="ml-auto text-[10px] font-mono text-gray-500">
                              mean V {formatVelocityMs(bldSummary.meanV)} m/s · mean f_cu{' '}
                              {bldSummary.meanF != null ? `${bldSummary.meanF.toFixed(1)} MPa` : '—'}
                            </span>
                          )}
                        </button>

                        {/* Floors inside this building */}
                        {bldOpen && (
                          <div className="bg-white">
                            {Array.from(bFloors.entries()).map(([floor, stations]) => {
                              const floorKey = `${project}::${building}::${floor}`;
                              const floorOpen = openFloors.has(floorKey);
                              const floorRows = Array.from(stations.values()).flat();
                              const floorSummary = stationSummary(floorRows);
                              return (
                                <div key={floorKey} className="border-t border-gray-100">
                                  {/* Floor folder indented */}
                                  <button
                                    type="button"
                                    onClick={() => toggleFloor(floorKey)}
                                    className="w-full px-5 py-2.5 pl-14 flex flex-wrap items-center gap-3 bg-gray-50/70 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                                  >
                                    {floorOpen ? <ChevronDown size={13} className="text-gray-500 shrink-0" /> : <ChevronRight size={13} className="text-gray-500 shrink-0" />}
                                    {floorOpen ? <FolderOpen size={15} className="text-amber-500 shrink-0" /> : <Folder size={15} className="text-amber-500 shrink-0" />}
                                    <span className="text-xs font-black uppercase tracking-wide text-[#022C4F]">{floor}</span>
                                    <span className="text-[10px] font-mono text-gray-500 shrink-0">
                                      {stations.size} station{stations.size === 1 ? '' : 's'} · {floorRows.length} test{floorRows.length === 1 ? '' : 's'}
                                    </span>
                                    {floorSummary && (
                                      <span className="ml-auto text-[10px] font-mono text-gray-400">
                                        mean V {formatVelocityMs(floorSummary.meanV)} m/s · mean f_cu{' '}
                                        {floorSummary.meanF != null ? `${floorSummary.meanF.toFixed(1)} MPa` : '—'}
                                      </span>
                                    )}
                                  </button>

                                  {/* Stations inside floor */}
                                  {floorOpen && (
                                    <div className="bg-white">
                                      {Array.from(stations.entries()).map(([station, rows]) => {
                                        const stationKey = `${project}::${building}::${floor}::${station}`;
                                        const stationOpen = openStations.has(stationKey);
                                        const summary = stationSummary(rows);
                                        return (
                                          <div key={stationKey} className="border-t border-gray-100">
                                            <button
                                              type="button"
                                              onClick={() => toggleStation(stationKey)}
                                              className="w-full px-5 py-2 pl-20 flex flex-wrap items-center gap-3 hover:bg-amber-50/40 transition-colors text-left cursor-pointer"
                                            >
                                              {stationOpen ? <ChevronDown size={13} className="text-gray-400 shrink-0" /> : <ChevronRight size={13} className="text-gray-400 shrink-0" />}
                                              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                                <Sparkles size={12} className="text-sky-500 shrink-0" />
                                                {station}
                                              </span>
                                              <span className="text-[10px] font-mono text-gray-500 shrink-0">{rows.length} test{rows.length === 1 ? '' : 's'}</span>
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
                  })
                ) : (
                  /* 2. Single-building project: Render Floor folders directly */
                  Array.from(floors.entries()).map(([floor, stations]) => {
                    const floorKey = `${project}::${floor}`;
                    const floorOpen = openFloors.has(floorKey);
                    const floorRows = Array.from(stations.values()).flat();
                    const floorSummary = stationSummary(floorRows);
                    return (
                      <div key={floorKey} className="border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => toggleFloor(floorKey)}
                          className="w-full px-5 py-3 pl-10 flex flex-wrap items-center gap-3 bg-gray-50/80 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                        >
                          {floorOpen ? <ChevronDown size={13} className="text-gray-500 shrink-0" /> : <ChevronRight size={13} className="text-gray-500 shrink-0" />}
                          {floorOpen ? <FolderOpen size={15} className="text-amber-500 shrink-0" /> : <Folder size={15} className="text-amber-500 shrink-0" />}
                          <span className="text-xs font-black uppercase tracking-wide text-[#022C4F]">{floor}</span>
                          <span className="text-[10px] font-mono text-gray-500 shrink-0">
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
                              const stationKey = `${project}::${floor}::${station}`;
                              const stationOpen = openStations.has(stationKey);
                              const summary = stationSummary(rows);
                              return (
                                <div key={stationKey} className="border-t border-gray-100">
                                  <button
                                    type="button"
                                    onClick={() => toggleStation(stationKey)}
                                    className="w-full px-5 py-2.5 pl-16 flex flex-wrap items-center gap-3 hover:bg-amber-50/40 transition-colors text-left cursor-pointer"
                                  >
                                    {stationOpen ? <ChevronDown size={13} className="text-gray-400 shrink-0" /> : <ChevronRight size={13} className="text-gray-400 shrink-0" />}
                                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                      <Sparkles size={12} className="text-sky-500 shrink-0" />
                                      {station}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-500 shrink-0">{rows.length} test{rows.length === 1 ? '' : 's'}</span>
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
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Single-level folder list (findings) ----

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
  renderItem: (item: T) => React.ReactNode;
  itemNoun?: string;
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
    return Array.from(map.entries()).sort(([a], [b]) => naturalSortStations(a, b));
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
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="w-full px-5 py-3 flex items-center gap-3 bg-gray-50/80 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                >
                  {isOpen ? <ChevronDown size={14} className="text-gray-500 shrink-0" /> : <ChevronRight size={14} className="text-gray-500 shrink-0" />}
                  {isOpen ? <FolderOpen size={15} className="text-amber-500 shrink-0" /> : <Folder size={15} className="text-amber-500 shrink-0" />}
                  <span className="text-xs font-black uppercase tracking-wide text-[#022C4F]">{group}</span>
                  <span className="text-[10px] font-mono text-gray-500 shrink-0">
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
