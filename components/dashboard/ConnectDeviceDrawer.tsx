"use client";

import React, { useState } from 'react';
import { X, Satellite, Activity, Wifi, MapPin, RefreshCw, ShieldCheck, Layers } from 'lucide-react';
import { registerTersusDevice } from '@/services/integrations';

interface ConnectDeviceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ConnectDeviceDrawer({
  isOpen,
  onClose,
  onSuccess
}: ConnectDeviceDrawerProps) {
  const [name, setName] = useState('');
  const [deviceType, setDeviceType] = useState('Rover 1');
  const [ipAddress, setIpAddress] = useState('192.168.1.145');
  const [latitude, setLatitude] = useState('6.5244');
  const [longitude, setLongitude] = useState('3.3792');
  const [coordinateSystem, setCoordinateSystem] = useState('WGS84 / Minna Datum UTM Zone 31N');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Device name is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      await registerTersusDevice({
        name: name.trim(),
        device_type: deviceType,
        ip_address: ipAddress.trim(),
        latitude: parseFloat(latitude) || 6.5244,
        longitude: parseFloat(longitude) || 3.3792,
        coordinate_system: coordinateSystem,
        status: 'Active',
        battery_level: '100%',
        satellites_tracked: 28,
        rtk_fix_status: 'FIXED_RTK',
        firmware_version: 'v2.4.2'
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Tersus GNSS device "${name}" successfully registered and synchronized!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to connect device', type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[600px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Satellite size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                Connect Tersus GNSS Receiver
              </h2>
              <p className="text-xs text-gray-500 font-medium">RTK Base Station & High-Precision Rover Telemetry</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-8 leading-relaxed">
            Register high-precision GNSS sensors to stream live RTK fixes, raw RINEX observation files, and site boundary control points into Nexucon survey workflows.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Device Name & Station Tag
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tersus Oscar (Rover 3 - Lekki Sector B)"
                required
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                  Device Hardware Type
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value="Base Station">RTK Base Station</option>
                  <option value="Rover 1">Field Survey Rover</option>
                  <option value="RTK Receiver">Fixed Cadastral Sensor</option>
                  <option value="Matrix-RTK">Matrix-RTK Station</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                  Telemetry IP / Host
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="192.168.1.145"
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                  Latitude (° N)
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="6.5244"
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                  Longitude (° E)
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="3.3792"
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                Reference Coordinate Datum
              </label>
              <input
                type="text"
                value={coordinateSystem}
                onChange={(e) => setCoordinateSystem(e.target.value)}
                placeholder="WGS84 / Minna Datum UTM Zone 31N"
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-950 flex items-start gap-3">
              <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold block">Extreme Accuracy Guarantee:</span>
                Tersus Oscar Extreme Tilt Compensation provides millimeter-level accuracy (±2.4mm) without manual calibration rods.
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                {isSubmitting ? 'Registering Device...' : 'Register & Sync'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
