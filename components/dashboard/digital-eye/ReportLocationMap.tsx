"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Download, Map as MapIcon, MapPin, Ruler, RefreshCw, Satellite, ImageDown, X } from "lucide-react";
import {
  getReportMapData,
  type ReportMapData,
  type ReportMapTestPoint,
} from "@/services/digitalEye";

/** Marker colours by strength band — the legend explains each. */
const BAND_COLORS: Record<ReportMapTestPoint['properties']['band'], string> = {
  good: '#10b981',
  poor: '#ef4444',
  unassessed: '#f59e0b',
  no_velocity: '#64748b',
};

const makeTestPointIcon = (band: ReportMapTestPoint['properties']['band']) =>
  L.divIcon({
    className: '',
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${BAND_COLORS[band]};border:3px solid #ffffff;box-shadow:0 1px 5px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center"><div style="width:7px;height:7px;border-radius:50%;background:#ffffff"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  });

/**
 * The project's recorded site location (latitude/longitude captured when
 * the project was created) — shown when no test carries GPS yet, so the
 * map still centres on the real site. Deliberately a different marker from
 * the strength-banded test points: it is site metadata, not a measurement.
 */
const makeProjectSiteIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;border-radius:8px 8px 8px 0;transform:rotate(-45deg);background:#022C4F;border:3px solid #ffffff;box-shadow:0 1px 5px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center"><div style="transform:rotate(45deg);width:9px;height:9px;border-radius:2px;background:#ffffff"></div></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 24],
    popupAnchor: [0, -20],
  });

// Auto-fit the viewport to every plotted test point + the project centre.
function FitToPoints({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(',')).join('|');
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points).pad(0.3));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

/** Live lat/lng under the cursor (spec §2.4 coordinates display). */
function HoverCoordinates({ onMove }: { onMove: (latlng: L.LatLng | null) => void }) {
  useMapEvents({
    mousemove: (e) => onMove(e.latlng),
    mouseout: () => onMove(null),
  });
  return null;
}

/**
 * Click-to-measure distance (spec §2.4): each click drops a vertex; the
 * polyline's total length is computed with Leaflet's own geodesic
 * `distanceTo` (haversine on the real sphere) — a chain of real map
 * clicks, never an estimated span.
 */
function MeasureLayer({
  active,
  vertices,
  onAdd,
}: {
  active: boolean;
  vertices: [number, number][];
  onAdd: (latlng: L.LatLng) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (active) onAdd(e.latlng);
    },
  });
  if (vertices.length === 0) return null;
  return (
    <>
      <Polyline positions={vertices} pathOptions={{ color: '#022C4F', weight: 2.5, dashArray: '6 6' }} />
      {vertices.map((v, i) => (
        <CircleMarker
          key={i}
          center={v}
          radius={4}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#022C4F', fillOpacity: 1 }}
        >
          <Tooltip>Vertex {i + 1}: {v[0].toFixed(5)}, {v[1].toFixed(5)}</Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}


const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium' });
  } catch {
    return iso;
  }
};

/**
 * Interactive location map for a project's NDT report (REFINED EXECUTIVE
 * SUMMARY §2.4): every geolocated PUNDIT test plotted as a marker
 * colour-coded by its strength band, with a legend, satellite/street
 * toggle, and per-marker details (element, velocity, strength, tested
 * date). Only real recorded coordinates are plotted — a test without a
 * position is counted as "not mapped" instead of being invented.
 */
export default function ReportLocationMap({ projectId }: { projectId?: string }) {
  const [data, setData] = useState<ReportMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // §2.4 wireframe toolbar: two explicit basemap buttons, not a toggle.
  const [basemap, setBasemap] = useState<'satellite' | 'street'>('street');
  // Distance measurement (spec §2.4): vertices are real map clicks.
  const [measuring, setMeasuring] = useState(false);
  const [measureVertices, setMeasureVertices] = useState<[number, number][]>([]);
  // Live cursor coordinates (spec §2.4).
  const [hover, setHover] = useState<L.LatLng | null>(null);
  // PNG export (spec §2.4 [📥 Export]): html2canvas snapshot of the map.
  const [exporting, setExporting] = useState(false);
  const mapDivRef = React.useRef<HTMLDivElement | null>(null);

  const load = React.useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const d = await getReportMapData(projectId);
      setData(d);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'The map data could not be loaded.',
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const features = useMemo(
    () => data?.test_points.features ?? [],
    [data],
  );

  const boundaryPolygons = useMemo(
    () => data?.boundary_polygons ?? [],
    [data],
  );

  // Leaflet latlng rings ([lat, lng]) for each boundary polygon.
  const boundaryRings = useMemo(
    () =>
      boundaryPolygons.map((b) =>
        b.polygon.coordinates[0]
          .slice(0, -1) // drop the GeoJSON closing repeat
          .map(([lng, lat]) => [lat, lng] as [number, number]),
      ),
    [boundaryPolygons],
  );

  // Total measured length between the clicked vertices — Leaflet's own
  // geodesic distanceTo (haversine), a chain of real map clicks.
  const measuredTotalM = useMemo(() => {
    let total = 0;
    for (let i = 1; i < measureVertices.length; i++) {
      total += L.latLng(measureVertices[i - 1]).distanceTo(
        L.latLng(measureVertices[i]),
      );
    }
    return total;
  }, [measureVertices]);

  // Export the map's real data as a standalone GeoJSON file — the same
  // server-provided rows the map renders, re-serialised verbatim (nothing
  // is added or estimated client-side).
  const exportGeoJSON = () => {
    if (!data) return;
    const out: any = {
      type: 'FeatureCollection',
      name: `nexucon_map_${projectId ?? 'project'}`,
      features: [...features],
    };
    for (const b of boundaryPolygons) {
      out.features.push({
        type: 'Feature',
        geometry: b.polygon,
        properties: {
          kind: 'project_boundary',
          survey_reference: b.survey_reference,
          title: b.title,
        },
      });
    }
    if (data.project_center) {
      out.features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: data.project_center },
        properties: {
          kind: 'project_site',
          site_address: data.site_address || '',
        },
      });
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], {
      type: 'application/geo+json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexucon-map-${projectId ?? 'project'}.geojson`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const toast = (message: string, type: 'success' | 'error' | 'info') => {
    window.dispatchEvent(
      new CustomEvent('show-toast', { detail: { message, type } }),
    );
  };

  /**
   * PNG export (spec §2.4 [📥 Export]): a raster snapshot of exactly the map
   * on screen — markers, boundary, legend and all. Tile servers must permit
   * cross-origin reads (the TileLayers set crossOrigin) or the snapshot
   * degrades; on any failure the user is told honestly instead of getting a
   * blank image.
   */
  const exportPng = async () => {
    const el = mapDivRef.current;
    if (!el || exporting) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#e2e8f0',
        scale: 2,
      });
      canvas.toBlob((blob) => {
        if (!blob) {
          toast('⚠️ The map snapshot could not be produced — try again.', 'error');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexucon-map-${projectId ?? 'project'}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch {
      toast('⚠️ The map could not be exported as an image (the imagery '
        + 'provider blocked it). The GeoJSON export still works.', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Fit to every test point + boundary ring; fall back to the recorded
  // project centre.
  const fitPoints: [number, number][] = useMemo(() => {
    const pts = features.map(
      (f) => [f.geometry.coordinates[1], f.geometry.coordinates[0]] as [number, number],
    );
    const ringPts = boundaryRings.flat();
    const all = [...pts, ...ringPts];
    if (all.length === 0 && data?.project_center) {
      return [[data.project_center[1], data.project_center[0]]];
    }
    return all;
  }, [features, boundaryRings, data]);

  const center: [number, number] =
    fitPoints[0] ?? (data?.project_center
      ? [data.project_center[1], data.project_center[0]]
      : [9.0765, 7.3986]); // no coordinates anywhere: honest national view

  // No test carries GPS, but the project's own recorded coordinates exist:
  // centre the map on the real site instead of an empty box. Labelled as
  // the project site — never presented as a test point.
  const showProjectSite =
    features.length === 0 && !!data?.project_center;
  const projectSite: [number, number] | null = data?.project_center
    ? [data.project_center[1], data.project_center[0]]
    : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5" aria-label="Report location map">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-[#0F181F] flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Test-Point Location Map
          </h3>
          <p className="text-xs text-[#6B7A85] mt-0.5">
            {data?.site_address ? `${data.site_address} · ` : ''}
            {features.length} geolocated test{features.length === 1 ? '' : 's'}
            {boundaryPolygons.length > 0
              ? ` · ${boundaryPolygons.length} surveyed boundary polygon${boundaryPolygons.length === 1 ? '' : 's'}`
              : ''}
            {data && features.length === 0
              ? showProjectSite
                ? ' — showing the project’s recorded site location'
                : ' — no recorded coordinates for this project'
              : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* §2.4 wireframe toolbar: explicit basemap buttons with the
              active one highlighted. */}
          <button
            type="button"
            onClick={() => setBasemap('satellite')}
            aria-pressed={basemap === 'satellite'}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              basemap === 'satellite'
                ? 'border-[#022C4F] bg-[#022C4F] text-white'
                : 'border-slate-300 text-[#0F181F] hover:bg-slate-50'
            }`}
            title="Esri World Imagery satellite basemap"
          >
            <Satellite className="w-3.5 h-3.5" />
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setBasemap('street')}
            aria-pressed={basemap === 'street'}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              basemap === 'street'
                ? 'border-[#022C4F] bg-[#022C4F] text-white'
                : 'border-slate-300 text-[#0F181F] hover:bg-slate-50'
            }`}
            title="OpenStreetMap street basemap"
          >
            <MapIcon className="w-3.5 h-3.5" />
            Street
          </button>
          <button
            type="button"
            onClick={() => {
              setMeasuring((m) => !m);
              if (measuring) setMeasureVertices([]);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              measuring
                ? 'border-[#022C4F] bg-[#022C4F] text-white'
                : 'border-slate-300 text-[#0F181F] hover:bg-slate-50'
            }`}
            aria-pressed={measuring}
            title="Click points on the map to measure the distance between them (straight-line, geodesic)"
          >
            <Ruler className="w-3.5 h-3.5" />
            {measuring ? 'Stop measuring' : 'Measure'}
          </button>
          <button
            type="button"
            onClick={exportPng}
            disabled={!data || exporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-[#0F181F] hover:bg-slate-50 disabled:opacity-50"
            title="Download the map exactly as displayed as a PNG image"
          >
            <ImageDown className={`w-3.5 h-3.5 ${exporting ? 'animate-pulse' : ''}`} />
            {exporting ? 'Exporting…' : 'Export'}
          </button>
          <button
            type="button"
            onClick={exportGeoJSON}
            disabled={!data}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-[#0F181F] hover:bg-slate-50 disabled:opacity-50"
            title="Download this map's recorded data as a GeoJSON file"
          >
            <Download className="w-3.5 h-3.5" />
            GeoJSON
          </button>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-[#0F181F] hover:bg-slate-50"
            aria-label="Reload map data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {measuring && (
        <div className="mb-3 rounded-lg border border-[#022C4F]/20 bg-slate-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#4B5B66]">
            <Ruler className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            Click the map to drop measure points — distances are geodesic
            (straight-line) between your clicks.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#0F181F] font-mono">
              {measureVertices.length < 2
                ? `${measureVertices.length} point${measureVertices.length === 1 ? '' : 's'} — click at least 2`
                : `Total: ${(measuredTotalM >= 1000
                    ? `${(measuredTotalM / 1000).toFixed(3)} km`
                    : `${measuredTotalM.toFixed(1)} m`)} over ${measureVertices.length} points`}
            </span>
            {measureVertices.length > 0 && (
              <button
                type="button"
                onClick={() => setMeasureVertices([])}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#4B5B66] hover:text-[#0F181F]"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="h-[400px] rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-2" role="status">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0A3D2E]" />
          <p className="text-sm text-[#4B5B66]">Loading recorded test locations…</p>
        </div>
      )}

      {!loading && error && (
        <div className="h-[400px] rounded-xl bg-slate-100 flex items-center justify-center" role="alert">
          <div className="max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {!loading && !error
        && features.length === 0 && !showProjectSite
        && boundaryPolygons.length === 0 && (
        <div className="h-[400px] rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-2 text-center px-6">
          <MapPin className="w-6 h-6 text-[#6B7A85]" />
          <p className="text-sm font-medium text-[#0F181F]">
            No test locations recorded
          </p>
          <p className="text-xs text-[#6B7A85] max-w-sm leading-relaxed">
            No PUNDIT test on this project carries GPS coordinates yet, no
            project location was recorded at creation, and no GNSS boundary
            survey exists. Test points appear here only when a real position
            is recorded with the measurement — positions are never estimated
            or fabricated.
          </p>
        </div>
      )}

      {!loading && !error
        && (features.length > 0 || showProjectSite || boundaryPolygons.length > 0) && (
        <>
        <div
          ref={mapDivRef}
          className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm relative z-0"
        >
          <MapContainer
            center={center}
            zoom={fitPoints.length === 1 ? 15 : 13}
            className="h-full w-full z-0"
          >
            {basemap === 'satellite' ? (
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                crossOrigin="anonymous"
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                crossOrigin="anonymous"
              />
            )}
            <FitToPoints points={fitPoints} />

            {/* Surveyed site boundary (spec §2.4) — one polygon per GNSS
                boundary survey; absent when none was recorded. */}
            {boundaryPolygons.map((b, i) => (
              <Polygon
                key={b.survey_reference}
                positions={boundaryRings[i]}
                pathOptions={{
                  color: '#022C4F',
                  weight: 2,
                  fillColor: '#022C4F',
                  fillOpacity: 0.08,
                }}
              >
                <Tooltip sticky>
                  Site boundary — {b.title} ({b.survey_reference})
                </Tooltip>
              </Polygon>
            ))}

            {/* Distance measurement + live cursor coordinates (spec §2.4) */}
            <MeasureLayer
              active={measuring}
              vertices={measureVertices}
              onAdd={(latlng) =>
                setMeasureVertices((vs) => [...vs, [latlng.lat, latlng.lng]])
              }
            />
            <HoverCoordinates onMove={setHover} />

            {showProjectSite && projectSite && (
              <Marker position={projectSite} icon={makeProjectSiteIcon()}>
                <Popup>
                  <div className="font-sans min-w-[190px]">
                    <h3 className="font-bold text-gray-900 text-sm">Project site</h3>
                    <p className="text-[11px] text-gray-500 mb-2">
                      {data?.site_address || 'Address not recorded'}
                    </p>
                    <div className="border-t border-gray-100 pt-2 space-y-1">
                      <p className="text-[11px] text-gray-600">
                        <span className="font-semibold">GPS:</span>{' '}
                        {projectSite[0].toFixed(5)}, {projectSite[1].toFixed(5)}
                      </p>
                      <p className="text-[11px] text-gray-500 leading-snug">
                        Coordinates recorded when the project was created. No
                        test carries GPS yet — test points appear here only
                        when a real position is recorded with the measurement.
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {features.map((f, idx) => {
              const [lng, lat] = f.geometry.coordinates;
              const p = f.properties;
              return (
                <Marker
                  key={`${p.element}-${idx}`}
                  position={[lat, lng]}
                  icon={makeTestPointIcon(p.band)}
                >
                  <Popup>
                    <div className="font-sans min-w-[190px]">
                      <h3 className="font-bold text-gray-900 text-sm">{p.element}</h3>
                      <p className="text-[11px] text-gray-500 mb-2">
                        {[p.floor, p.grid_location].filter(Boolean).join(' · ') || 'Location not recorded'}
                      </p>
                      <div className="border-t border-gray-100 pt-2 space-y-1">
                        <p className="text-[11px] text-gray-600">
                          <span className="font-semibold">Velocity:</span>{' '}
                          {p.velocity_m_s != null
                            ? `${p.velocity_m_s.toFixed(0)} m/s`
                            : 'not computable'}
                        </p>
                        <p className="text-[11px] text-gray-600">
                          <span className="font-semibold">Est. strength:</span>{' '}
                          {p.strength_n_mm2 != null
                            ? `${p.strength_n_mm2.toFixed(1)} N/mm²`
                            : 'outside calibrated range'}
                        </p>
                        {p.strength_note && (
                          <p className="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] leading-relaxed text-amber-900">
                            {p.strength_note}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-600">
                          <span className="font-semibold">Tested:</span> {fmtDate(p.tested_at)}
                        </p>
                        <p className="text-[11px] text-gray-600">
                          <span className="font-semibold">GPS:</span> {lat.toFixed(5)}, {lng.toFixed(5)}
                        </p>
                        <p className="pt-1">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white"
                            style={{ background: BAND_COLORS[p.band] }}
                          >
                            {p.band.replace('_', ' ')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Legend — the backend's own band explanations (test points only) */}
          {features.length > 0 && (
            <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur rounded-lg shadow-md border border-gray-200 p-2.5 max-w-[230px]">
              <p className="text-[10px] font-semibold text-gray-800 mb-1.5 uppercase tracking-wide">
                Strength bands
              </p>
              <ul className="space-y-1">
                {Object.entries(BAND_COLORS).map(([band, color]) => (
                  <li key={band} className="flex items-start gap-1.5">
                    <span
                      className="mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 border border-white shadow"
                      style={{ background: color }}
                      aria-hidden="true"
                    />
                    <span className="text-[10px] text-gray-600 leading-snug">
                      {data?.legend?.[band] || band}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showProjectSite && (
            <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur rounded-lg shadow-md border border-gray-200 p-2.5 max-w-[280px]">
              <p className="text-[10px] font-semibold text-gray-800 mb-1 uppercase tracking-wide">
                Project site
              </p>
              <p className="text-[10px] text-gray-600 leading-snug">
                Showing the location recorded when the project was created —
                no test carries GPS yet. Test points appear here only when a
                real position is recorded with the measurement.
              </p>
            </div>
          )}

          {/* Live cursor coordinates (spec §2.4) */}
          <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur rounded-lg shadow-md border border-gray-200 px-2.5 py-1.5 font-mono text-[10px] text-gray-700">
            {hover
              ? `${hover.lat.toFixed(5)}, ${hover.lng.toFixed(5)}`
              : '— move over the map —'}
          </div>
        </div>

        {/* §2.4 wireframe footer: COORDINATES (live cursor position, or
            the map centre when the cursor is off the map) + SITE ADDRESS
            from the project record — "not recorded" when absent, never a
            guessed value. */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 flex items-baseline gap-2 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A85] shrink-0">
              Coordinates
            </span>
            <span className="font-mono text-xs text-[#0F181F] truncate">
              {hover
                ? `${hover.lat.toFixed(5)}, ${hover.lng.toFixed(5)}`
                : `${center[0].toFixed(5)}, ${center[1].toFixed(5)}`}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 flex items-baseline gap-2 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A85] shrink-0">
              Site address
            </span>
            <span className="text-xs text-[#0F181F] truncate" title={data?.site_address || undefined}>
              {data?.site_address || 'Not recorded'}
            </span>
          </div>
        </div>
      </>
      )}
    </section>
  );
}
