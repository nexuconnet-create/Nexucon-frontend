"use client";

import React from 'react';
import { Box, Info, MapPin, Sliders, Tag, Layers, ClipboardList } from 'lucide-react';
import {
  BIMModelGeometry,
  BIMModelGeometryElement,
  BIMStructuralElement,
} from '@/services/digitalEye';

interface BIMElementPropertiesPanelProps {
  /** The tessellated mesh currently selected in the 3D preview (if any). */
  geometryElement: BIMModelGeometryElement | null;
  /** The whole-model record the meshes came from (source file, date). */
  geometry: BIMModelGeometry | null;
  /** The project's BIM element mapping matched by GUID — carries the IFC
   *  property sets and design attributes. Null when the clicked mesh has no
   *  linked structural element record. */
  mapping: BIMStructuralElement | null;
}

/** One label/value row — values the import never recorded render as an
 *  honest "Not recorded", never a placeholder number. */
function Row({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  const empty = value === null || value === undefined || value === '';
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-[11px] text-gray-500 shrink-0">{label}</span>
      <span className={`text-[11px] text-right ${mono ? 'font-mono' : ''} ${
        empty ? 'text-gray-400 italic' : 'text-gray-800 font-semibold'
      }`}>
        {empty ? 'Not recorded' : value}
      </span>
    </div>
  );
}

function SectionTitle({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#022C4F] flex items-center gap-1.5">
        {icon}
        <span>{title}</span>
      </h4>
      {badge && (
        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </div>
  );
}

/** World-coordinate bounds of a tessellated element mesh. The preview's
 *  meshes are world-positioned (ifcopenshell applies the full placement
 *  hierarchy) and emitted in SI metres whatever unit the IFC file uses —
 *  unlike the IFC ObjectPlacement, which Revit/Autodesk translations
 *  typically leave at 0,0,0. */
function elementBounds(verts: number[]): {
  center: [number, number, number];
  size: [number, number, number];
} | null {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let seen = 0;
  for (let i = 0; i + 2 < verts.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      const v = verts[i + a];
      if (!Number.isFinite(v)) continue;
      seen++;
      if (v < min[a]) min[a] = v;
      if (v > max[a]) max[a] = v;
    }
  }
  if (seen === 0) return null;
  return {
    center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
  };
}

const fmtCoord = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });

/**
 * Moderate properties panel beside the BIM 3D preview: every property the
 * platform actually attributes to the selected element — its geometry
 * identity, the BIM mapping record (designation, level, coordinates, source)
 * and the full IFC property set captured at import. Nothing is summarised or
 * invented: absent values render as honest "Not recorded" rows, and a mesh
 * with no linked mapping record says so.
 */
export default function BIMElementPropertiesPanel({
  geometryElement,
  geometry,
  mapping,
}: BIMElementPropertiesPanelProps) {
  // Nothing selected yet — the operator is told how to use the panel.
  if (!geometryElement) {
    return (
      <div className="w-full xl:w-[340px] shrink-0 border-t xl:border-t-0 xl:border-l border-gray-100 bg-slate-50/60 p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[160px]">
        <Info size={18} className="text-gray-300" />
        <span className="text-xs font-bold text-gray-500">Element Properties</span>
        <span className="text-[11px] text-gray-400 leading-relaxed max-w-[240px]">
          Click an element in the 3D preview — every property attributed to it
          (IFC identity, level, position, design attributes and its full IFC
          property set) is listed here.
        </span>
      </div>
    );
  }

  // The IFC property set captured at import — flat {Pset.Key: value}, sorted
  // for a stable read. Rendered verbatim.
  const propEntries = Object.entries(mapping?.raw_properties || {})
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  // Real world position/size from the tessellated mesh.
  const bounds = elementBounds(geometryElement.verts || []);

  return (
    <div className="w-full xl:w-[340px] shrink-0 border-t xl:border-t-0 xl:border-l border-gray-100 bg-slate-50/60 p-5 space-y-5 overflow-y-auto max-h-[420px] xl:max-h-[560px]">
      {/* Header: which element this panel describes */}
      <div>
        <h3 className="text-xs font-bold text-[#022C4F] flex items-center gap-2">
          <Box size={14} className="text-amber-500 shrink-0" />
          <span className="truncate" title={geometryElement.name || geometryElement.guid}>
            {geometryElement.name || 'Unnamed element'}
          </span>
        </h3>
        <p className="text-[10px] font-mono text-gray-400 mt-0.5 break-all">{geometryElement.guid}</p>
      </div>

      {/* IFC identity from the tessellated geometry + the mapping record */}
      <div className="space-y-1">
        <SectionTitle icon={<Tag size={12} className="text-gray-400" />} title="Element identity" />
        <div className="divide-y divide-gray-100">
          <Row label="IFC type" value={geometryElement.type} />
          <Row label="Designation" value={mapping?.grid_location} />
          <Row label="Element name" value={mapping?.name || geometryElement.name} />
          <Row label="Level" value={mapping?.level} />
          <Row label="Discipline" value={mapping?.discipline} />
        </div>
      </div>

      {/* The model the geometry came from */}
      <div className="space-y-1">
        <SectionTitle icon={<Layers size={12} className="text-gray-400" />} title="Model" />
        <div className="divide-y divide-gray-100">
          <Row label="Source file" value={geometry?.source_file} />
          <Row
            label="Origin"
            value={geometry?.translated_from_rvt
              ? 'Revit (.rvt) — translated via Autodesk'
              : 'Uploaded IFC'}
          />
          <Row
            label="Tessellated"
            value={geometry?.updated_at ? new Date(geometry.updated_at).toLocaleString() : ''}
          />
        </div>
      </div>

      {/* Real world position and size, computed from the tessellated mesh
          the 3D preview itself renders (world-positioned, SI metres). */}
      {bounds && (
        <div className="space-y-1">
          <SectionTitle icon={<MapPin size={12} className="text-gray-400" />} title="Position & size (world, metres)" />
          <div className="divide-y divide-gray-100">
            <Row label="Centre X" value={`${fmtCoord(bounds.center[0])} m`} />
            <Row label="Centre Y" value={`${fmtCoord(bounds.center[1])} m`} />
            <Row label="Centre Z" value={`${fmtCoord(bounds.center[2])} m`} />
            <Row label="Size X" value={`${fmtCoord(bounds.size[0])} m`} />
            <Row label="Size Y" value={`${fmtCoord(bounds.size[1])} m`} />
            <Row label="Size Z" value={`${fmtCoord(bounds.size[2])} m`} />
          </div>
        </div>
      )}

      {/* Design attributes held on the mapping record — only rendered when
          at least one is recorded, so files without them don't show a wall
          of "Not recorded" (their real attributes are listed verbatim in
          the property-set section below). */}
      {mapping && (mapping.designed_concrete_grade
        || mapping.concrete_grade_specified
        || mapping.designed_rebar_spacing_mm > 0
        || mapping.designed_cover_depth_mm > 0) && (
        <div className="space-y-1">
          <SectionTitle icon={<Sliders size={12} className="text-gray-400" />} title="Design attributes" />
          <div className="divide-y divide-gray-100">
            <Row label="Designed concrete grade" value={mapping.designed_concrete_grade} />
            <Row label="Specified grade" value={mapping.concrete_grade_specified} />
            <Row
              label="Rebar spacing"
              value={mapping.designed_rebar_spacing_mm > 0 ? `${mapping.designed_rebar_spacing_mm} mm` : ''}
            />
            <Row
              label="Cover depth"
              value={mapping.designed_cover_depth_mm > 0 ? `${mapping.designed_cover_depth_mm} mm` : ''}
            />
          </div>
        </div>
      )}

      {/* The full IFC property set captured at import — the point of the
          panel: every attributed property, verbatim. */}
      <div className="space-y-1.5">
        <SectionTitle
          icon={<ClipboardList size={12} className="text-gray-400" />}
          title="IFC property sets"
          badge={propEntries.length > 0 ? `${propEntries.length} attribute${propEntries.length === 1 ? '' : 's'}` : undefined}
        />
        {propEntries.length === 0 ? (
          <p className="text-[11px] text-gray-400 italic leading-relaxed">
            {mapping
              ? 'No IFC property-set values were recorded for this element at import.'
              : 'No linked structural element record for this mesh — only the geometry attributes above are available.'}
          </p>
        ) : (
          <div className="bg-white border border-gray-100 rounded-lg divide-y divide-gray-50">
            {propEntries.map(([key, value]) => (
              <div key={key} className="px-2.5 py-1.5">
                <div className="text-[10px] font-mono text-gray-400 break-all leading-tight">{key}</div>
                <div className="text-[11px] font-mono font-semibold text-gray-800 break-words leading-tight mt-0.5">
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
