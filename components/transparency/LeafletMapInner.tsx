"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PublicProject } from '@/services/publicPortal';

// Custom SVG map icons matching status
function createCustomIcon(status: string, isSelected: boolean) {
  let bgColor = '#022C4F'; // default
  const borderColor = '#ffffff';

  if (status === 'COMPLETED') bgColor = '#059669'; // Emerald
  else if (status === 'UNDER_CONSTRUCTION') bgColor = '#2563EB'; // Blue
  else if (status === 'APPROVED') bgColor = '#4F46E5'; // Indigo
  else if (status === 'UNDER_INSPECTION') bgColor = '#D97706'; // Amber
  else if (status === 'SUSPENDED' || status === 'STOP_WORK_ORDER') bgColor = '#DC2626'; // Red

  const size = isSelected ? 38 : 30;
  const pulse = isSelected ? '<div style="position:absolute; width:100%; height:100%; border-radius:50%; background:' + bgColor + '; opacity:0.4; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>' : '';

  const html = `
    <div style="position:relative; width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center;">
      ${pulse}
      <div style="
        width:${size}px;
        height:${size}px;
        background:${bgColor};
        border:2.5px solid ${borderColor};
        border-radius:50%;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:12px;
        font-weight:bold;
      ">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

interface LeafletMapInnerProps {
  projects: PublicProject[];
  selectedProject: PublicProject | null;
  onSelectProject: (p: PublicProject) => void;
}

export const LeafletMapInner: React.FC<LeafletMapInnerProps> = ({
  projects,
  selectedProject,
  onSelectProject,
}) => {
  // Center of Lagos State
  const defaultCenter: [number, number] = [6.5244, 3.3792];
  const center: [number, number] = selectedProject
    ? [selectedProject.latitude, selectedProject.longitude]
    : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={true}
      className="w-full h-full z-10"
      style={{ minHeight: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {selectedProject && (
        <MapRecenter lat={selectedProject.latitude} lng={selectedProject.longitude} />
      )}

      {projects.map((project) => {
        const isSelected = selectedProject?.id === project.id;
        const icon = createCustomIcon(project.status, isSelected);

        return (
          <Marker
            key={project.id}
            position={[project.latitude, project.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectProject(project),
            }}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 space-y-1.5 text-xs max-w-xs">
                <div className="font-bold text-[#022C4F]">{project.name}</div>
                <div className="text-[11px] text-slate-500">{project.site_address}</div>
                <div className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {project.permit_number}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};
