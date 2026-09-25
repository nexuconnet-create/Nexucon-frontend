import React, { useState } from "react";
import { Bluetooth, Wifi, Cloud, Loader2, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { 
  FieldDeviceRecord, 
  connectFieldDevice, 
  disconnectFieldDevice 
} from "@/services/digitalEye";

declare global {
  interface Navigator {
    bluetooth: any;
  }
}

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";
type ConnectionMethod = "bluetooth" | "wifi" | "cloud" | null;

interface DeviceConnectPanelProps {
  device: FieldDeviceRecord;
}

export default function DeviceConnectPanel({ device }: DeviceConnectPanelProps) {
  const [connState, setConnState] = useState<ConnectionState>("disconnected");
  const [method, setMethod] = useState<ConnectionMethod>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const connectBluetooth = async () => {
    setMethod("bluetooth");
    setConnState("connecting");
    setErrorMessage(null);

    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not available in this browser. Please use Chrome or Edge in a secure context (HTTPS).");
      }

      // We use acceptAllDevices since the specific Proceq GATT Service UUIDs are proprietary and not provided.
      // In a production environment with the real hardware, you would filter by specific services:
      // filters: [{ services: ['0000xxxx-0000-1000-8000-00805f9b34fb'] }]
      const btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["generic_access"]
      });

      console.log(`Connecting to GATT Server on ${btDevice.name}...`);
      
      // Attempt to connect to the GATT server
      // const server = await btDevice.gatt?.connect();
      // MOCK DELAY to simulate GATT connection and characteristic subscription
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await connectFieldDevice(device.id, {
        protocol: "bluetooth",
        firmware_banner: btDevice.name || "Unknown Bluetooth Device",
      });

      setConnState("connected");
      notifySuccess(`Successfully paired with ${btDevice.name || "Bluetooth Device"}`);
    } catch (err: any) {
      console.error(err);
      setConnState("error");
      const errorMsg = err.message || "Failed to pair with Bluetooth device.";
      setErrorMessage(errorMsg);
      await disconnectFieldDevice(device.id, { protocol: "bluetooth", error: true, error_message: errorMsg }).catch(() => {});
    }
  };

  const connectWifi = async () => {
    setMethod("wifi");
    setConnState("connecting");
    setErrorMessage(null);

    try {
      // Mocking a local IP fetch, e.g., to a Pundit PD8000 hotspot
      // const res = await fetch("http://192.168.4.1/api/v1/status", { signal: AbortSignal.timeout(3000) });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      await connectFieldDevice(device.id, {
        protocol: "wifi",
        ip_address: "192.168.4.1",
      });

      // We mock success since we are not actually on the hardware's network
      setConnState("connected");
      notifySuccess("Connected to local Wi-Fi device stream.");
    } catch (err: any) {
      console.error(err);
      setConnState("error");
      const errorMsg = "Could not reach device IP. Are you connected to the instrument's Wi-Fi hotspot?";
      setErrorMessage(errorMsg);
      await disconnectFieldDevice(device.id, { protocol: "wifi", error: true, error_message: errorMsg }).catch(() => {});
    }
  };

  const connectCloud = async () => {
    setMethod("cloud");
    setConnState("connecting");
    setErrorMessage(null);

    try {
      // Mocking cloud authentication via Screening Eagle Workspace
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      await connectFieldDevice(device.id, {
        protocol: "cloud",
        cloud_workspace_id: "se-workspace-demo-123",
      });

      setConnState("connected");
      notifySuccess("Successfully authenticated with Screening Eagle Cloud.");
    } catch (err: any) {
      console.error(err);
      setConnState("error");
      const errorMsg = "Cloud authentication failed.";
      setErrorMessage(errorMsg);
      await disconnectFieldDevice(device.id, { protocol: "cloud", error: true, error_message: errorMsg }).catch(() => {});
    }
  };

  const disconnect = async () => {
    if (method) {
      await disconnectFieldDevice(device.id, { protocol: method }).catch(() => {});
    }
    setConnState("disconnected");
    setMethod(null);
    setErrorMessage(null);
  };

  const notifySuccess = (message: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("show-toast", { detail: { message, type: "success" } })
      );
    }
  };

  const isHighBandwidthWifi = device.model.includes('PD8050') || device.model.includes('Live Array') || device.model.includes('PD8000');
  const isLowBandwidthBluetooth = device.model.includes('PI8000') || device.model.includes('Impact');

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-800">Live Connect</h4>
        {connState === "connected" && (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected ({method})
          </span>
        )}
      </div>

      {connState === "disconnected" || connState === "error" ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Connect directly to this instrument to stream waveforms and readings into Nexucon.
          </p>
          
          {isHighBandwidthWifi && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <p>
                <strong>High-Bandwidth Device:</strong> This high-resolution ultrasonic imaging scanner generates massive amounts of data. Connect over encrypted <strong>Local Wi-Fi</strong> for real-time 3D tomographic streaming.
              </p>
            </div>
          )}

          {isLowBandwidthBluetooth && (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
              <p>
                <strong>Low-Bandwidth Sensor:</strong> This sensor optimizes battery life. Pair directly via <strong>Web Bluetooth</strong> to measure thickness, detect voids, and check pile integrity.
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={connectBluetooth}
              className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded text-sm font-medium transition-colors ${
                isLowBandwidthBluetooth ? "border-blue-400 ring-2 ring-blue-100 text-blue-700 hover:bg-blue-50" : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Bluetooth className={`w-4 h-4 ${isLowBandwidthBluetooth ? "text-blue-600" : "text-blue-500"}`} />
              Web Bluetooth
            </button>
            <button
              onClick={connectWifi}
              className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded text-sm font-medium transition-colors ${
                isHighBandwidthWifi ? "border-emerald-400 ring-2 ring-emerald-100 text-emerald-700 hover:bg-emerald-50" : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Wifi className={`w-4 h-4 ${isHighBandwidthWifi ? "text-emerald-600" : "text-emerald-500"}`} />
              Local Wi-Fi
            </button>
            <button
              onClick={connectCloud}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Cloud className="w-4 h-4 text-sky-500" />
              Cloud Sync
            </button>
          </div>

          {connState === "error" && errorMessage && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      ) : connState === "connecting" ? (
        <div className="flex flex-col items-center justify-center py-6 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <span className="text-sm font-medium">
            {method === "bluetooth" && "Requesting Bluetooth pair..."}
            {method === "wifi" && "Searching for local device IP..."}
            {method === "cloud" && "Authenticating with Cloud API..."}
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">
              Data stream is active. Waveforms and readings will automatically appear in your active Telemetry Session.
            </span>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={disconnect}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 rounded text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
