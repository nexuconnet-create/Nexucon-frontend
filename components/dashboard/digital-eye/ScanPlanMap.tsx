"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#022C4F;border:2.5px solid #00b4d8;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"><div style="position:absolute;top:7px;left:7px;width:8px;height:8px;border-radius:50%;background:#fff"></div></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -26],
});

interface ScanPlanMapProps {
  plans: any[];
  onMarkerClick: (plan: any) => void;
}

/**
 * Map view of scan plans. Only plans with real coordinates are plotted —
 * plans without a surveyed position are listed in the overlay instead of
 * being scattered at invented locations.
 */
export default function ScanPlanMap({ plans, onMarkerClick }: ScanPlanMapProps) {
  const withCoords = plans.filter(p => p.latitude != null && p.longitude != null);
  const withoutCoords = plans.filter(p => p.latitude == null || p.longitude == null);

  const center: [number, number] = withCoords.length
    ? [withCoords[0].latitude, withCoords[0].longitude]
    : [9.0765, 7.3986];

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer center={center} zoom={withCoords.length ? 12 : 6} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        {withCoords.map((plan) => (
          <Marker
            key={plan.id}
            position={[plan.latitude, plan.longitude]}
            icon={pinIcon}
            eventHandlers={{ click: () => onMarkerClick(plan) }}
          >
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-gray-900">{plan.displayId}</h3>
                <p className="text-xs text-gray-600 mb-2">{plan.project}</p>
                <div className="flex items-center gap-1">
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    plan.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    plan.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {plan.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {withoutCoords.length > 0 && (
        <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur rounded-xl shadow-md border border-gray-200 p-3 max-w-xs pointer-events-auto">
          <p className="text-xs font-semibold text-gray-800 mb-1">
            {withCoords.length} plotted · {withoutCoords.length} without coordinates
          </p>
          <p className="text-[11px] text-gray-500 leading-snug">
            {withoutCoords.length === plans.length
              ? 'No plans have a surveyed position yet. Set the target location in the planning wizard to see it on this map.'
              : 'These plans were created without a target location:'}
          </p>
          {withoutCoords.length < plans.length && (
            <ul className="mt-1.5 space-y-0.5 max-h-24 overflow-y-auto">
              {withoutCoords.slice(0, 8).map(p => (
                <li key={p.id} className="text-[11px] text-gray-600 truncate">{p.displayId} — {p.project}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
