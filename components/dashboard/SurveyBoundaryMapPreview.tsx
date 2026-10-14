"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Globe, ExternalLink, Compass } from "lucide-react";
import { ConvertedCorner } from "@/lib/coordinateUtils";

interface SurveyBoundaryMapPreviewProps {
  corners: ConvertedCorner[];
  center: {
    lat: number;
    lng: number;
    formattedLatDms?: string;
    formattedLngDms?: string;
  };
  footprintAreaSqm: number;
  perimeterMeters: number;
  coordinateSystem: string;
  googleMapsUrl?: string;
  figureTitle?: string;
  tableTitle?: string;
  className?: string;
}

// Auto-fit viewport to surveyed corner points
function FitBoundary({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => `${p[0]},${p[1]}`).join("|");

  useEffect(() => {
    if (points.length >= 3) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
    } else if (points.length === 1) {
      map.setView(points[0], 16);
    }
  }, [key, map, points]);

  return null;
}

// Marker icon with corner point label badge
const createCornerPinIcon = (label: string, pointNumber: string) => {
  const displayLabel = label || `Corner ${pointNumber}`;
  return L.divIcon({
    className: "survey-corner-marker",
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;pointer-events:auto;transform:translate(-50%, -100%);">
        <div style="
          background:#022C4F;
          color:#ffffff;
          border:1.5px solid #38bdf8;
          padding:2px 7px;
          border-radius:6px;
          font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
          font-size:11px;
          font-weight:700;
          white-space:nowrap;
          box-shadow:0 2px 6px rgba(0,0,0,0.5);
          letter-spacing:0.3px;
        ">
          ${displayLabel}
        </div>
        <div style="
          width:12px;
          height:12px;
          border-radius:50%;
          background:#38bdf8;
          border:2.5px solid #ffffff;
          box-shadow:0 1px 4px rgba(0,0,0,0.6);
          margin-top:2px;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Center point crosshair marker icon
const centerIcon = L.divIcon({
  className: "survey-center-marker",
  html: `
    <div style="
      width:14px;
      height:14px;
      border-radius:50%;
      background:#ef4444;
      border:2.5px solid #ffffff;
      box-shadow:0 1px 5px rgba(0,0,0,0.6);
      transform:translate(-50%, -50%);
    "></div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export default function SurveyBoundaryMapPreview({
  corners,
  center,
  footprintAreaSqm,
  perimeterMeters,
  coordinateSystem,
  googleMapsUrl,
  figureTitle = "Figure 3.1: Site Location and Survey Boundary Map",
  tableTitle = "TABLE 3.1: 4-CORNER BOUNDARY MAPPING & CONVERSION",
  className = "",
}: SurveyBoundaryMapPreviewProps) {
  const [basemap, setBasemap] = useState<"satellite" | "street">("satellite");

  const validCorners = useMemo(() => {
    return corners.filter(
      (c) =>
        c.lat != null &&
        !isNaN(c.lat) &&
        c.lng != null &&
        !isNaN(c.lng) &&
        c.lat !== 0 &&
        c.lng !== 0
    );
  }, [corners]);

  const polygonPositions = useMemo<[number, number][]>(() => {
    return validCorners.map((c) => [c.lat, c.lng]);
  }, [validCorners]);

  const mapCenter: [number, number] = useMemo(() => {
    if (center.lat && center.lng) return [center.lat, center.lng];
    if (validCorners.length > 0) return [validCorners[0].lat, validCorners[0].lng];
    return [6.424153, 3.386375]; // Lagos default
  }, [center, validCorners]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SATELLITE MAP CONTAINER */}
      <div className="bg-slate-900/5 rounded-2xl border border-slate-200 p-4 overflow-hidden shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#022C4F]" />
            <span className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
              High-Precision Satellite Survey Map
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Basemap Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setBasemap("satellite")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  basemap === "satellite"
                    ? "bg-[#022C4F] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setBasemap("street")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  basemap === "street"
                    ? "bg-[#022C4F] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Street Map
              </button>
            </div>

            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <Globe size={12} />
                Google Earth View
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        {/* Leaflet Map Frame */}
        <div className="h-[360px] md:h-[420px] w-full rounded-xl overflow-hidden shadow-inner relative z-0 border border-slate-300">
          <MapContainer
            center={mapCenter}
            zoom={16}
            className="h-full w-full z-0"
            scrollWheelZoom={false}
          >
            {basemap === "satellite" ? (
              <TileLayer
                attribution="&copy; <a href='https://www.esri.com/'>Esri</a> &mdash; Maxar, Earthstar Geographics"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                crossOrigin="anonymous"
              />
            ) : (
              <TileLayer
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                crossOrigin="anonymous"
              />
            )}

            <FitBoundary points={polygonPositions} />

            {/* Boundary Polygon */}
            {polygonPositions.length >= 3 && (
              <Polygon
                positions={polygonPositions}
                pathOptions={{
                  color: "#0080ff",
                  weight: 2.5,
                  fillColor: "#0080ff",
                  fillOpacity: 0.16,
                  dashArray: undefined,
                }}
              >
                <Tooltip sticky>
                  Surveyed Building Boundary ({footprintAreaSqm.toLocaleString()} sqm)
                </Tooltip>
              </Polygon>
            )}

            {/* Corner Markers with custom label badge */}
            {validCorners.map((c, idx) => (
              <Marker
                key={c.id || idx}
                position={[c.lat, c.lng]}
                icon={createCornerPinIcon(c.label, c.pointNumber || String(idx + 1))}
              />
            ))}

            {/* Center Coordinate Pin */}
            {center.lat !== 0 && center.lng !== 0 && (
              <Marker position={[center.lat, center.lng]} icon={centerIcon}>
                <Tooltip>Site Center Point</Tooltip>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Figure Caption Block (Matches Document Specification) */}
        <div className="mt-3.5 text-center space-y-1">
          <p className="text-[11px] italic text-slate-500">
            Satellite imagery © Esri, Maxar, Earthstar Geographics.
          </p>
          <h5 className="text-xs font-bold text-slate-900 tracking-wide">
            {figureTitle}
          </h5>
          <p className="text-xs font-mono text-[#022C4F] font-semibold">
            Site Center Coordinates: {center.lat.toFixed(6)}° N, {center.lng.toFixed(6)}° E
          </p>
        </div>
      </div>

      {/* TABLE 3.1 CONVERSION METRICS & RULED TABLE */}
      <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-xs">
        <div className="text-center space-y-1.5 pb-4 border-b border-slate-100">
          <h4 className="text-sm font-extrabold text-[#022C4F] tracking-wide uppercase">
            {tableTitle}
          </h4>
          <p className="text-xs font-bold text-blue-700">
            Calculated: {footprintAreaSqm.toLocaleString()} sqm footprint (
            {(footprintAreaSqm / 10000).toFixed(3)} ha) &nbsp;|&nbsp; Perimeter:{" "}
            {perimeterMeters.toLocaleString()} m &nbsp;|&nbsp; System:{" "}
            <span className="font-mono">{coordinateSystem}</span>
          </p>
        </div>

        {/* Ruled Coordinates Table */}
        <div className="overflow-x-auto mt-4 rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[#022C4F] font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4 border-r border-slate-200">
                  Corner / Point
                </th>
                <th className="py-2.5 px-4 text-center border-r border-slate-200 font-mono">
                  Latitude (°N)
                </th>
                <th className="py-2.5 px-4 text-center border-r border-slate-200 font-mono">
                  Longitude (°E)
                </th>
                <th className="py-2.5 px-4 text-center border-r border-slate-200 font-mono">
                  UTM Easting (m)
                </th>
                <th className="py-2.5 px-4 text-center border-r border-slate-200 font-mono">
                  UTM Northing (m)
                </th>
                <th className="py-2.5 px-4 text-center">DMS Format</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {corners.map((c, idx) => (
                <tr
                  key={c.id || idx}
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  <td className="py-2.5 px-4 font-bold text-[#022C4F] border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>{c.label || `Corner ${c.pointNumber || idx + 1}`}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-medium border-r border-slate-200">
                    {c.lat ? `${c.lat.toFixed(6)}°` : "-"}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-medium border-r border-slate-200">
                    {c.lng ? `${c.lng.toFixed(6)}°` : "-"}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-medium border-r border-slate-200">
                    {c.easting != null
                      ? c.easting.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "-"}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-medium border-r border-slate-200">
                    {c.northing != null
                      ? c.northing.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "-"}
                  </td>
                  <td className="py-2.5 px-4 text-center text-[11px] text-slate-500 font-mono">
                    {c.formattedLatDms && c.formattedLngDms
                      ? `${c.formattedLatDms}, ${c.formattedLngDms}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
