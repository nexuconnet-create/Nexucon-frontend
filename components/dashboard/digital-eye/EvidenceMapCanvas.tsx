"use client";

import React, { useMemo, useState } from "react";
import {
  Map,
  Layers,
  Crosshair,
  MapPin,
  Radio,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Navigation,
  Info
} from "lucide-react";
import { EvidenceSpatialPoint } from "@/services/digitalEye";

interface EvidenceMapCanvasProps {
  points?: EvidenceSpatialPoint[];
  selectedPoint?: EvidenceSpatialPoint | null;
  onSelectPoint?: (point: EvidenceSpatialPoint) => void;
  onOpenGprDetail?: (point: EvidenceSpatialPoint) => void;
  onOpenPunditDetail?: (point: EvidenceSpatialPoint) => void;
}

/** A point's position on the canvas, as a percentage of the plot area. */
interface PlottedPoint {
  point: EvidenceSpatialPoint;
  leftPct: number;
  topPct: number;
}

/** Whether a point carries a position it can actually be drawn at. */
function isPlottable(point: EvidenceSpatialPoint): boolean {
  return (
    typeof point.lat === "number" &&
    Number.isFinite(point.lat) &&
    typeof point.lng === "number" &&
    Number.isFinite(point.lng)
  );
}

/**
 * Place recorded points by their own coordinates.
 *
 * This used to position each pin from its *array index* —
 * `25 + (i * 14) % 65` across and `20 + (i * 22) % 60` down — while the panel
 * beside the canvas reported the point's real latitude and longitude under the
 * heading "Minna Coordinates". The map was therefore a diagram of the order the
 * API happened to return rows in, presented as a survey layout, and two pins
 * were guaranteed to collide once the modulo wrapped. A site plan that places a
 * defect at the wrong end of the plot is worse than no site plan.
 *
 * The projection is a plain linear one over the extent of the points actually
 * held: honest about being a local plot rather than a projected map, and it
 * never invents a position. A single point, or points sharing a coordinate on
 * one axis, are centred on that axis instead of dividing by zero.
 *
 * Only plottable points reach here. `lat` and `lng` are nullable on the model —
 * a point recorded before it was surveyed is a real row — and a null in the
 * arithmetic below would produce `NaN`, i.e. a pin silently dropped from the
 * middle of the plot. The caller counts those separately and says so.
 */
function plotPoints(points: EvidenceSpatialPoint[]): PlottedPoint[] {
  if (points.length === 0) return [];

  const lats = points.map((p) => p.lat as number);
  const lngs = points.map((p) => p.lng as number);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  // Inset so a pin's own width never falls outside the plot.
  const INSET = 8;
  const SPAN = 100 - INSET * 2;

  return points.map((point) => {
    const lat = point.lat as number;
    const lng = point.lng as number;
    return {
      point,
      // Longitude grows east (right); latitude grows north, and the canvas's
      // y-axis grows downward, so north is inverted.
      leftPct: lngSpan === 0 ? 50 : INSET + ((lng - minLng) / lngSpan) * SPAN,
      topPct: latSpan === 0 ? 50 : INSET + ((maxLat - lat) / latSpan) * SPAN,
    };
  });
}

/**
 * How each layer is drawn.
 *
 * `layer_type` is a free-text field on the model, not a constrained choice set,
 * so anything not listed here is drawn neutrally rather than being coloured as
 * a defect. The previous version fell through to the rose "AI_ANOMALY" styling
 * for every unrecognised type, which painted an unclassified point as a
 * detected defect.
 */
const LAYER_STYLES: Record<
  string,
  { label: string; pin: string; chip: string; active: string }
> = {
  GNSS_RTK_BEACON: {
    label: "RTK Beacons",
    pin: "bg-emerald-500 shadow-emerald-500/50",
    chip: "bg-slate-800 text-slate-500",
    active: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  },
  GPR_TRANSECT: {
    label: "GPR Transects",
    pin: "bg-cyan-500 shadow-cyan-500/50",
    chip: "bg-slate-800 text-slate-500",
    active: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  },
  PUNDIT_STATION: {
    label: "UPV Test Points",
    pin: "bg-amber-500 shadow-amber-500/50",
    chip: "bg-slate-800 text-slate-500",
    active: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  },
  AI_ANOMALY: {
    label: "Defects",
    pin: "bg-rose-500 shadow-rose-500/50",
    chip: "bg-slate-800 text-slate-500",
    active: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  },
};

/** The style for a layer, defaulting to a neutral mark the platform cannot name. */
function styleFor(layerType: string) {
  return (
    LAYER_STYLES[layerType] ?? {
      label: layerType || "Unclassified",
      pin: "bg-slate-500 shadow-slate-500/50",
      chip: "bg-slate-800 text-slate-500",
      active: "bg-slate-700/40 text-slate-300 border border-slate-600/50",
    }
  );
}

export default function EvidenceMapCanvas({
  points = [],
  selectedPoint,
  onSelectPoint,
  onOpenGprDetail,
  onOpenPunditDetail
}: EvidenceMapCanvasProps) {
  // Every layer the data actually contains is on by default, so a point can
  // never be hidden from an inspector by a switch they never touched.
  const [hiddenLayers, setHiddenLayers] = useState<Record<string, boolean>>({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeHoverPoint, setActiveHoverPoint] = useState<EvidenceSpatialPoint | null>(null);

  const toggleLayer = (layerType: string) => {
    setHiddenLayers(prev => ({ ...prev, [layerType]: !prev[layerType] }));
  };

  const layerTypes = useMemo(
    () => Array.from(new Set(points.map((p) => p.layer_type || ""))).sort(),
    [points]
  );

  const visiblePoints = useMemo(
    () => points.filter((p) => !hiddenLayers[p.layer_type || ""]),
    [points, hiddenLayers]
  );

  const plottable = useMemo(() => visiblePoints.filter(isPlottable), [visiblePoints]);

  /** Recorded rows that carry no measured position, so cannot be drawn. */
  const unplottableCount = visiblePoints.length - plottable.length;

  const plotted = useMemo(() => plotPoints(plottable), [plottable]);

  const activeInspect = selectedPoint || activeHoverPoint || (visiblePoints.length > 0 ? visiblePoints[0] : null);

  /**
   * The best positional accuracy among the points on screen, or `null`.
   *
   * `null` — never a default figure — because a precision stated for a project
   * with no recorded GNSS fix would be a measured value nobody measured. The
   * HUD below reads "not reported" in that case.
   */
  const bestAccuracy = useMemo(() => {
    const values = visiblePoints
      .map((p) => p.accuracy_mm)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0);
    return values.length > 0 ? Math.min(...values) : null;
  }, [visiblePoints]);

  /** The plot's own extent, or null when nothing is placed on it. */
  const extent = useMemo(() => {
    if (plottable.length === 0) return null;
    const lats = plottable.map((p) => p.lat as number);
    const lngs = plottable.map((p) => p.lng as number);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [plottable]);

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 flex flex-col' : 'min-h-[580px] flex flex-col'}`}>

      {/* Header Bar */}
      <div className="bg-slate-900 text-white rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Map size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Multi-Modal Technical Evidence Map</h3>
            {/* The datum line used to assert "Minna Datum (EPSG:26391 / UTM 31N)
                & WGS84" for every project, whatever the record held. The
                coordinates the platform stores are WGS84 decimal degrees; the
                plot below is a local linear projection of them, and it now says
                so rather than naming a datum nothing was transformed into. */}
            <p className="text-xs text-slate-400">Recorded points plotted by their WGS84 coordinates</p>
          </div>
        </div>

        {/* Layer Switches.
            These were four fixed buttons — RTK Beacons, GPR Transects, UPV Test
            Points, Defects — that toggled keys named gnss/gpr/pundit/ai and
            filtered on the four matching constants. A layer the platform holds
            but did not enumerate (`BIM_ANCHOR`, `DRONE_POINT`, or an empty
            layer_type) matched none of them, so it was always drawn and could
            not be switched off. They are now built from the layers the loaded
            points actually carry. */}
        <div className="flex items-center gap-2 flex-wrap">
          {layerTypes.length === 0 ? (
            <span className="text-xs text-slate-500">No layer to switch</span>
          ) : (
            layerTypes.map((layerType) => {
              const style = styleFor(layerType);
              const isHidden = !!hiddenLayers[layerType];
              const count = points.filter((p) => (p.layer_type || "") === layerType).length;
              return (
                <button
                  key={layerType || "__unclassified"}
                  onClick={() => toggleLayer(layerType)}
                  title={isHidden ? `Show ${style.label}` : `Hide ${style.label}`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isHidden ? style.chip : style.active
                  }`}
                >
                  <Layers size={12} />
                  <span>
                    {style.label} ({count})
                  </span>
                </button>
              );
            })
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors ml-2"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 bg-slate-950 relative overflow-hidden rounded-b-2xl border-x border-b border-slate-900">

        {/* Plot area (Cols 1-3) */}
        <div className="lg:col-span-3 relative h-[420px] lg:h-[500px] flex items-center justify-center overflow-hidden">

          {/* Grid texture. Decorative only — it marks no coordinate, and the
              plot's real extent is printed in the HUD below. */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(56, 189, 248, 0.25) 1px, transparent 0)',
              backgroundSize: `${32 * zoomLevel}px ${32 * zoomLevel}px`
            }}
          />

          {/* This SVG block used to draw a fixed site-boundary polygon at
              hardcoded pixel coordinates plus four fixed "GPR grid scan lines",
              on every project, whether or not any survey existed. Both are
              gone: a boundary the platform has not been told is not a boundary,
              and GPR transects are recorded points that now appear in their own
              layer. */}

          {plotted.length === 0 && (
            <div className="relative text-center text-slate-500 px-6 max-w-sm">
              <MapPin size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs leading-relaxed">
                {points.length === 0
                  ? "No spatial evidence point is recorded against this project, so there is nothing to plot."
                  : visiblePoints.length === 0
                    ? "Every layer is switched off, so no recorded point is currently drawn."
                    : "The points recorded against this project carry no measured position, so there is no coordinate to plot."}
              </p>
            </div>
          )}

          {/* Recorded points, positioned by their own coordinates. */}
          {plotted.map(({ point: pt, leftPct, topPct }) => {
            const isSelected = activeInspect?.id === pt.id;
            const style = styleFor(pt.layer_type);

            return (
              <div
                key={pt.id}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                onClick={() => {
                  if (onSelectPoint) onSelectPoint(pt);
                  setActiveHoverPoint(pt);
                }}
                onMouseEnter={() => setActiveHoverPoint(pt)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg ${style.pin} border-2 border-white`}>
                  {pt.layer_type === 'GNSS_RTK_BEACON' && <Crosshair size={11} />}
                  {pt.layer_type === 'GPR_TRANSECT' && <Radio size={11} />}
                  {pt.layer_type === 'PUNDIT_STATION' && <Sparkles size={11} />}
                  {pt.layer_type === 'AI_ANOMALY' && <AlertTriangle size={11} />}
                  {!LAYER_STYLES[pt.layer_type] && <MapPin size={11} />}
                </div>

                {isSelected && (
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] whitespace-nowrap border border-slate-700 font-mono shadow-md">
                    {pt.title || pt.name}
                  </div>
                )}
              </div>
            );
          })}

          {/* HUD. This read "E: 541,209m • N: 714,032m • Z: 18.2m" on every
              project — a single fixed coordinate, in a projected datum, for
              every site in the country. It now reports the extent of the points
              actually plotted, or says there are none. */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white p-3 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2">
              <Navigation size={12} className="text-emerald-400" />
              <span className="font-mono text-[11px]">
                {extent
                  ? `${plotted.length} plotted point${plotted.length === 1 ? "" : "s"}`
                  : "Nothing plotted"}
              </span>
            </div>
            {extent ? (
              <>
                <div className="text-[10px] text-slate-400 font-mono">
                  {extent.minLat.toFixed(5)}°N to {extent.maxLat.toFixed(5)}°N
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {extent.minLng.toFixed(5)}°E to {extent.maxLng.toFixed(5)}°E
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Best recorded accuracy:{" "}
                  {bestAccuracy === null
                    ? "not reported"
                    : `±${bestAccuracy} mm`}
                </div>
              </>
            ) : (
              <div className="text-[10px] text-slate-400 font-mono">
                No coordinate to report
              </div>
            )}
            {unplottableCount > 0 && (
              <div className="text-[10px] text-amber-400/90 font-mono pt-0.5">
                {unplottableCount} recorded point
                {unplottableCount === 1 ? " carries" : "s carry"} no measured
                position
              </div>
            )}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 flex items-center gap-1 text-white">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.0))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
          </div>
        </div>

        {/* Selected Evidence Point Metadata Panel (Col 4) */}
        <div className="lg:col-span-1 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 text-white flex flex-col justify-between overflow-y-auto">
          {activeInspect ? (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Spatial Evidence Point
                </span>
                <h4 className="font-bold text-sm text-slate-100">{activeInspect.title || activeInspect.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{activeInspect.project_name || activeInspect.project}</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl space-y-2 border border-slate-700/60 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Layer Type:</span>
                  <span className="text-cyan-400 font-bold">
                    {activeInspect.layer_type || "not classified"}
                  </span>
                </div>
                {activeInspect.beacon_code && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Beacon:</span>
                    <span className="text-slate-200">{activeInspect.beacon_code}</span>
                  </div>
                )}
                {/* "Minna Coordinates" was the label here; the values are WGS84
                    decimal degrees, which is what the platform stores. The
                    figure also fell back through `latitude`/`longitude`, names
                    the serializer does not send, and would have thrown on
                    `.toFixed` had the real `lat`/`lng` been null — which is
                    their state on the model until the point is measured. */}
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400 shrink-0">WGS84:</span>
                  <span className="text-slate-200 text-right">
                    {isPlottable(activeInspect)
                      ? `${(activeInspect.lat as number).toFixed(5)}°N, ${(activeInspect.lng as number).toFixed(5)}°E`
                      : "no measured position"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Elevation:</span>
                  <span className="text-slate-200">
                    {typeof activeInspect.elevation_m === "number"
                      ? `+${activeInspect.elevation_m} m`
                      : "not reported"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RTK Precision:</span>
                  <span className="text-emerald-400 font-bold">
                    {typeof activeInspect.accuracy_mm === "number"
                      ? `±${activeInspect.accuracy_mm} mm`
                      : "not reported"}
                  </span>
                </div>
                {activeInspect.structural_element_name && (
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 shrink-0">Element:</span>
                    <span className="text-slate-200 text-right">
                      {activeInspect.structural_element_name}
                    </span>
                  </div>
                )}
                {activeInspect.timestamp && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recorded:</span>
                    <span className="text-slate-200">
                      {new Date(activeInspect.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {activeInspect.description ? (
                <p className="text-slate-300 leading-relaxed text-xs">
                  {activeInspect.description}
                </p>
              ) : (
                <p className="text-slate-500 italic leading-relaxed text-xs">
                  No description is recorded against this point.
                </p>
              )}

              {/* Action Triggers to open Radargram or Waveform */}
              <div className="space-y-2 pt-2">
                {activeInspect.layer_type === 'GPR_TRANSECT' && onOpenGprDetail && (
                  <button
                    onClick={() => onOpenGprDetail(activeInspect)}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Radio size={13} />
                    <span>Open GPR Radargram</span>
                  </button>
                )}

                {activeInspect.layer_type === 'PUNDIT_STATION' && onOpenPunditDetail && (
                  <button
                    onClick={() => onOpenPunditDetail(activeInspect)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>Open UPV Waveform</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <MapPin size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs leading-relaxed">
                No spatial evidence point is recorded for this project, so there
                is no geodetic metadata to show.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
