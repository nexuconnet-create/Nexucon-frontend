"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Radio,
  Wifi,
  Activity,
  Battery,
  Signal,
  CheckCircle2,
  RefreshCw,
  Scan,
  Thermometer,
  Zap,
} from "lucide-react";

interface DeviceTelemetry {
  id: string;
  name: string;
  category: "GPR" | "UPV" | "SLAM" | "THERMAL";
  status: "ONLINE" | "STANDBY" | "OFFLINE";
  battery: number;
  signalStrength: number;
  connectionType: "BLE 5.2" | "Wi-Fi Direct" | "USB-C Serial" | "RTK Radio";
  frequencyOrSpec: string;
  lastTelemetryAt: string;
}

const DEVICES: DeviceTelemetry[] = [
  {
    id: "dev-gpr",
    name: "GSSI Conquest 100",
    category: "GPR",
    status: "ONLINE",
    battery: 92,
    signalStrength: 95,
    connectionType: "Wi-Fi Direct",
    frequencyOrSpec: "400 MHz Subsurface Transducer",
    lastTelemetryAt: "2s ago",
  },
  {
    id: "dev-upv",
    name: "Proceq Pundit PL-200",
    category: "UPV",
    status: "ONLINE",
    battery: 88,
    signalStrength: 90,
    connectionType: "BLE 5.2",
    frequencyOrSpec: "54 kHz Direct Transmission",
    lastTelemetryAt: "Just now",
  },
  {
    id: "dev-slam",
    name: "Tersus Oscar GNSS / SLAM",
    category: "SLAM",
    status: "ONLINE",
    battery: 76,
    signalStrength: 85,
    connectionType: "RTK Radio",
    frequencyOrSpec: "LiDAR & GNSS RTK Fixed (±14mm)",
    lastTelemetryAt: "1s ago",
  },
  {
    id: "dev-thermal",
    name: "FLIR E8-XT Infrared",
    category: "THERMAL",
    status: "STANDBY",
    battery: 64,
    signalStrength: 70,
    connectionType: "USB-C Serial",
    frequencyOrSpec: "320x240 IR Thermal Sensor",
    lastTelemetryAt: "1m ago",
  },
];

export default function TelemetryStatusPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<DeviceTelemetry[]>(DEVICES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/inspector/dashboard/sync")}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Sync Center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[11px] font-mono text-gray-400 font-bold uppercase">
              SYNC CENTER &bull; PATH A: TELEMETRY STREAM
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#022C4F]">
              PAIRED HARDWARE TELEMETRY STATUS
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
          title="Poll Hardware Telemetry"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Hardware Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#022C4F]/10 flex items-center justify-center text-[#022C4F] font-bold">
                  {d.category === "GPR" && "📡"}
                  {d.category === "UPV" && "🔊"}
                  {d.category === "SLAM" && "🏗️"}
                  {d.category === "THERMAL" && "🌡️"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{d.name}</h3>
                  <span className="text-xs font-mono text-gray-400">{d.connectionType}</span>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                d.status === "ONLINE"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {d.status === "ONLINE" ? "ONLINE 🟢" : "STANDBY 🟡"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono space-y-1.5">
              <div className="text-gray-600">Specification: <strong className="text-gray-900">{d.frequencyOrSpec}</strong></div>
              <div className="flex items-center justify-between">
                <span>Battery Level:</span>
                <strong className="text-emerald-700">{d.battery}%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Signal RSSI:</span>
                <strong className="text-cyan-700">{d.signalStrength}% Quality</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-slate-200">
                <span>Telemetry Heartbeat:</span>
                <span>{d.lastTelemetryAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
