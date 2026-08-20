"use client";

import React, { useState } from 'react';
import { X, Satellite, Activity, Wifi, MapPin } from 'lucide-react';
import { registerTersusDevice } from '@/services/integrations';

interface ConnectDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ConnectDeviceModal({
  isOpen,
  onClose,
  onSuccess
}: ConnectDeviceModalProps) {
  const [name, setName] = useState('');
  const [deviceType, setDeviceType] = useState('Rover 1');
  const [ipAddress, setIpAddress] = useState('192.168.1.145');
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
        name,
        device_type: deviceType,
        ip_address: ipAddress,
        status: 'Active',
        battery_level: '100%',
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
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Satellite size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Connect Tersus Device</h3>
              <p className="text-xs text-slate-500">RTK Base Station & Rover Ingestion</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Device Name & Station Tag
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tersus Oscar (Rover 3 - Sector B)"
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Device Type
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="Base Station">RTK Base Station</option>
                <option value="Rover 1">Field Rover 1</option>
                <option value="Rover 2">Field Rover 2</option>
                <option value="GPR Scanner">GPR Sensor Unit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Telemetry IP
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.145"
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex items-center gap-2">
            <Wifi size={16} className="text-emerald-500 shrink-0" />
            <span>Telemetry endpoint will automatically ingest sub-centimeter point clouds.</span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              {isSubmitting ? 'Pairing...' : 'Pair & Ingest Telemetry'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
