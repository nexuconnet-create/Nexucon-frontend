"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  initialCenter?: [number, number];
  height?: string;
}

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#022C4F;border:2.5px solid #00b4d8;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"><div style="position:absolute;top:7px;left:7px;width:8px;height:8px;border-radius:50%;background:#fff"></div></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -26],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Leaflet map where the operator clicks to set the survey target location.
 * The picked coordinates are sent with the scan plan and drive the plan map view.
 */
export default function LocationPickerMap({ latitude, longitude, onChange, initialCenter, height = '300px' }: LocationPickerMapProps) {
  const center: [number, number] =
    latitude != null && longitude != null ? [latitude, longitude] : (initialCenter || [9.0765, 7.3986]);

  return (
    <div className="w-full" style={{ height }}>
      <MapContainer center={center} zoom={latitude != null ? 15 : 6} className="h-full w-full rounded-xl z-0" worldCopyJump>
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        <ClickHandler onPick={onChange} />
        {latitude != null && longitude != null && (
          <Marker position={[latitude, longitude]} icon={pinIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <p className="font-bold text-gray-900">Survey target</p>
                <p className="text-gray-600">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
