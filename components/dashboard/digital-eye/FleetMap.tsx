"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Battery } from 'lucide-react';

interface ScanLocation {
  session_id: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  project_name?: string | null;
  notes?: string;
}

interface FleetMapProps {
  scanners: any[];
  scans?: ScanLocation[];
}

const makeScannerIcon = (online: boolean) => L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;border-radius:50%;background:${online ? '#10b981' : '#f59e0b'};border:3px solid #ffffff;box-shadow:0 1px 5px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;border-radius:50%;background:#ffffff"></div></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

// Scan-site markers are visually distinct from live scanner dots: a navy
// survey pin with a status ring.
const makeScanIcon = (status: string) => {
  const color =
    status === 'processing' ? '#f59e0b' :
    status === 'failed' ? '#ef4444' :
    '#022C4F';
  const pulse = status === 'processing' ? '<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid #f59e0b;animation:scanPulse 1.6s ease-out infinite"></div>' : '';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:20px;height:20px;border-radius:50%;background:${color};border:3px solid #ffffff;box-shadow:0 1px 5px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center">${pulse}<div style="width:7px;height:7px;border-radius:50%;background:#ffffff"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  });
};

// Auto-fit the viewport to every plotted marker (scanners + scan sites)
// whenever the set changes, so the map always shows where scans happened.
function FitToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map(p => p.join(',')).join('|');
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points).pad(0.3));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

/**
 * Fleet coverage map. Two kinds of real data are plotted, nothing invented:
 *  - registered scanner devices that have reported a GPS position
 *  - scan sessions whose metadata carries a GPS fix (where scans were taken)
 * Devices/sessions without coordinates are listed in the overlay instead of
 * being placed at made-up coordinates.
 */
export default function FleetMap({ scanners, scans = [] }: FleetMapProps) {
  const withCoords = (scanners || []).filter(s => s.latitude != null && s.longitude != null);
  const withoutCoords = (scanners || []).filter(s => s.latitude == null || s.longitude == null);
  const scanSites = (scans || []).filter(s => s.latitude != null && s.longitude != null);

  const allPoints: [number, number][] = [
    ...withCoords.map(s => [s.latitude, s.longitude] as [number, number]),
    ...scanSites.map(s => [s.latitude, s.longitude] as [number, number]),
  ];

  const center: [number, number] = allPoints.length
    ? allPoints[0]
    : [9.0765, 7.3986];

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-sm relative z-0">
      <style>{`@keyframes scanPulse{0%{transform:scale(.6);opacity:1}100%{transform:scale(1.6);opacity:0}}`}</style>
      <MapContainer center={center} zoom={allPoints.length ? 13 : 6} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        <FitToMarkers points={allPoints} />

        {scanSites.map((scan, idx) => (
          <Marker
            key={scan.session_id || idx}
            position={[scan.latitude, scan.longitude]}
            icon={makeScanIcon(scan.status)}
          >
            <Popup>
              <div className="font-sans min-w-[180px]">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  {scan.name}
                </h3>
                <p className="text-[11px] text-gray-500 mb-2">
                  {scan.project_name || 'Scan session'}
                  {scan.created_at ? ` · ${new Date(scan.created_at).toLocaleDateString()}` : ''}
                </p>
                <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                  <p className="text-[11px] text-gray-600">
                    <span className="font-semibold">GPS:</span> {scan.latitude}, {scan.longitude}
                  </p>
                  <p className="text-[11px]">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      scan.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      scan.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                      scan.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {scan.status}
                    </span>
                  </p>
                  {scan.notes && (
                    <p className="text-[11px] text-gray-600 italic leading-snug">{scan.notes}</p>
                  )}
                </div>
                <a
                  href={`/government/dashboard/digital-eye/scan-sessions/${scan.session_id}`}
                  className="mt-2 inline-block text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  View session →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {withCoords.map((scanner, idx) => {
          const isOnline = scanner.status === 'online';

          return (
            <Marker
              key={scanner.id || scanner.device_id || idx}
              position={[scanner.latitude, scanner.longitude]}
              icon={makeScannerIcon(isOnline)}
            >
              <Popup>
                <div className="font-sans min-w-[150px]">
                  <h3 className="font-bold text-gray-900 text-sm">{scanner.device_id}</h3>
                  <p className="text-[11px] text-gray-500 mb-2">{scanner.model}</p>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {scanner.status}
                    </span>
                    <span className="text-[11px] font-medium text-gray-600 flex items-center gap-1">
                      <Battery size={12} className={scanner.battery_level < 20 ? 'text-red-500' : 'text-emerald-500'} />
                      {scanner.battery_level}%
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {withoutCoords.length > 0 && (
        <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur rounded-lg shadow-md border border-gray-200 p-3 max-w-[220px]">
          <p className="text-[11px] font-semibold text-gray-800">
            {withCoords.length} on map · {withoutCoords.length} no position
          </p>
          <p className="text-[10px] text-gray-500 leading-snug mt-1">
            Awaiting first GPS report:
          </p>
          <ul className="mt-1 space-y-0.5 max-h-24 overflow-y-auto">
            {withoutCoords.map((s, i) => (
              <li key={s.id || s.device_id || i} className="text-[10px] text-gray-600 truncate">
                {s.device_id}{s.model ? ` · ${s.model}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
