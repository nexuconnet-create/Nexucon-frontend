import React, { useState, useEffect } from "react";
import { Bluetooth, Wifi, Cloud, Loader2, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { 
  FieldDeviceRecord, 
  connectFieldDevice, 
  disconnectFieldDevice,
  getTrimbleConnectionStatus,
  triggerTrimbleSync
} from "@/services/digitalEye";
import Link from "next/link";

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
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Automatically reset to disconnected when viewing or switching devices
  useEffect(() => {
    setConnState("disconnected");
    setMethod(null);
    setConnectedDeviceName(null);
    setErrorMessage(null);
  }, [device?.id]);

  const connectBluetooth = async () => {
    setMethod("bluetooth");
    setConnState("connecting");
    setErrorMessage(null);

    try {
      if (typeof window === "undefined" || !navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not available in this browser. Please use Chrome or Edge in a secure context (HTTPS or localhost).");
      }

      // Prompt real native browser Bluetooth chooser
      const btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["generic_access", "battery_service"]
      });

      if (!btDevice) {
        throw new Error("Bluetooth pairing cancelled: No device selected.");
      }

      if (!btDevice.gatt) {
        throw new Error("Selected device does not support Bluetooth GATT server connections.");
      }

      // Establish real GATT connection and verify it is actively connected
      const server = await btDevice.gatt.connect();
      if (!server || !server.connected) {
        throw new Error(`Failed to establish active GATT connection with ${btDevice.name || "device"}.`);
      }

      const devName = btDevice.name || `BLE-${btDevice.id?.slice(0, 8) || "Instrument"}`;
      setConnectedDeviceName(devName);

      // Listen for physical hardware disconnection
      btDevice.addEventListener("gattserverdisconnected", () => {
        setConnState("disconnected");
        setMethod(null);
        setConnectedDeviceName(null);
        disconnectFieldDevice(device.id, { protocol: "bluetooth" }).catch(() => {});
      });

      // Update backend status with real device information
      await connectFieldDevice(device.id, {
        protocol: "bluetooth",
        firmware_banner: devName,
      });

      setConnState("connected");
      notifySuccess(`Successfully paired with ${devName}`);
    } catch (err: any) {
      console.error(err);
      setConnState("error");
      setConnectedDeviceName(null);
      const errorMsg = err.name === "NotFoundError" 
        ? "Bluetooth pairing cancelled or device not found." 
        : (err.message || "Failed to pair with Bluetooth device.");
      setErrorMessage(errorMsg);
      await disconnectFieldDevice(device.id, { protocol: "bluetooth", error: true, error_message: errorMsg }).catch(() => {});
    }
  };

  const connectWifi = async () => {
    setMethod("wifi");
    setConnState("connecting");
    setErrorMessage(null);

    const targetIp = (device as any).ip_address || "192.168.4.1";

    try {
      // Real network probe to instrument IP without fake timeout or simulated success
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        await fetch(`http://${targetIp}/`, {
          mode: "no-cors",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (netErr: any) {
        clearTimeout(timeoutId);
        throw new Error(`Device unreachable at IP ${targetIp}. Ensure your computer is connected to the instrument's Wi-Fi hotspot.`);
      }

      await connectFieldDevice(device.id, {
        protocol: "wifi",
        ip_address: targetIp,
      });

      setConnState("connected");
      notifySuccess(`Connected to local Wi-Fi device stream at ${targetIp}`);
    } catch (err: any) {
      console.error(err);
      setConnState("error");
      const errorMsg = err.message || `Could not reach device IP at ${targetIp}. Are you connected to the instrument's Wi-Fi hotspot?`;
      setErrorMessage(errorMsg);
      await disconnectFieldDevice(device.id, { protocol: "wifi", error: true, error_message: errorMsg }).catch(() => {});
    }
  };

  const connectCloud = async () => {
    setMethod("cloud");
    setConnState("connecting");
    setErrorMessage(null);

    try {
      // Real check for Trimble Connect Cloud or configured device workspace
      const projectId = (device as any).assigned_project || (device as any).project || undefined;
      const trimble = await getTrimbleConnectionStatus(projectId).catch(() => null);

      if (trimble && trimble.status === "CONNECTED") {
        const syncRes = await triggerTrimbleSync(trimble.id);
        if (!syncRes.success) {
          throw new Error(syncRes.message || "Failed to sync with Trimble Connect API.");
        }

        await connectFieldDevice(device.id, {
          protocol: "cloud",
          cloud_workspace_id: "OIK9qaCK1Vg",
          notes: `Connected to Trimble Connect Cloud (Project: OIK9qaCK1Vg)`,
        });

        setConnState("connected");
        notifySuccess("Connected to Trimble Cloud (Project: OIK9qaCK1Vg)");
        return;
      }

      if (device.cloud_workspace_id && device.cloud_workspace_id !== "se-workspace-demo-123") {
        await connectFieldDevice(device.id, {
          protocol: "cloud",
          cloud_workspace_id: device.cloud_workspace_id,
        });
        setConnState("connected");
        notifySuccess(`Connected to cloud workspace: ${device.cloud_workspace_id}`);
        return;
      }

      // No mock: strictly show disconnected/unauthorized if no valid session
      throw new Error("Cloud Sync Disconnected: Trimble Connect is not authorized for Project OIK9qaCK1Vg. No active cloud session exists.");
    } catch (err: any) {
      console.error(err);
      setConnState("error");
      const errorMsg = err.message || "Cloud authentication failed.";
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
    setConnectedDeviceName(null);
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Connected ({method}{connectedDeviceName ? `: ${connectedDeviceName}` : ""})
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
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="font-medium">{errorMessage}</span>
              </div>
              {errorMessage.includes("Trimble") && (
                <div className="pt-1 border-t border-red-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Project ID: <strong>OIK9qaCK1Vg</strong></span>
                  <Link
                    href="/inspector/dashboard/digital-eye/trimble"
                    className="font-bold underline text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    Open Trimble Connect CDE &rarr;
                  </Link>
                </div>
              )}
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
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Active Hardware Stream: {connectedDeviceName || device.name}</span>
            </div>
            <p className="text-xs text-emerald-700 pl-6">
              Live {method?.toUpperCase()} link verified. Readings and acoustic velocity pulses will automatically log to your Telemetry Session.
            </p>
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
