"use client";

import React, { useState, useEffect } from "react";
import api, { notify } from "@/lib/api";
import {
  Settings,
  Key,
  Shield,
  RefreshCcw,
  Wifi,
  WifiOff,
  Link as LinkIcon,
  Save,
  CheckCircle,
  Copy,
  Loader2,
  X,
  Plus,
  ExternalLink
} from "lucide-react";

interface ApiDocs {
  base_url: string;
  schema_url: string;
  authentication: {
    type: string;
    login_endpoint: string;
    refresh_endpoint: string;
    header: string;
    notes: string[];
  };
  webhook: {
    delivery: string;
    events: { event: string; description: string }[];
    notes: string[];
  };
  openapi: {
    schema_url: string;
    swagger_ui: string;
    redoc: string;
  };
}

export default function IntegrationSettings() {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [revokingKey, setRevokingKey] = useState(false);
  const [hardware, setHardware] = useState<any[]>([]);
  const [loadingFleet, setLoadingFleet] = useState(true);

  // Register-device modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState("");
  const [newDeviceModel, setNewDeviceModel] = useState("Tersus S1");
  const [registering, setRegistering] = useState(false);

  // Backend-served API documentation
  const [docs, setDocs] = useState<ApiDocs | null>(null);
  const [docsModal, setDocsModal] = useState<"auth" | "webhook" | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/scans/integration-settings/');
        setApiKey(res.data.api_key || "");
        setWebhookUrl(res.data.webhook_url || "");
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };

    const fetchDocs = async () => {
      try {
        const res = await api.get('/scans/docs/');
        setDocs(res.data);
      } catch (err) {
        console.error("Failed to load API docs:", err);
      }
    };

    fetchSettings();
    fetchDocs();
  }, []);

  const fetchFleet = async () => {
    try {
      setLoadingFleet(true);
      const res = await api.get('/scans/fleet/');
      const scanners = res.data.scanners || [];
      setHardware(scanners.map((s: any) => ({
        id: s.device_id,
        model: s.model || "Tersus S1",
        lastSeen: s.last_seen ? new Date(s.last_seen).toLocaleString() : "Never",
        status: s.status,
        battery: s.battery_level != null ? `${Math.round(s.battery_level)}%` : "—"
      })));
    } catch (err) {
      console.error("Failed to load fleet:", err);
    } finally {
      setLoadingFleet(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleRevokeKey = async () => {
    if (!confirm("Are you sure you want to revoke this key? Apps using it will immediately stop working.")) return;
    setRevokingKey(true);
    try {
      const res = await api.post('/scans/integration-settings/', { action: 'rotate_key' });
      setApiKey(res.data.api_key);
      notify("API key rotated. Update any apps using the old key.", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to rotate key.", "error");
    } finally {
      setRevokingKey(false);
    }
  };

  const handleSaveWebhook = async () => {
    setSavingWebhook(true);
    try {
      const res = await api.post('/scans/integration-settings/', { action: 'save_webhook', webhook_url: webhookUrl });
      setWebhookUrl(res.data.webhook_url);
      notify("Webhook saved successfully.", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to save webhook.", "error");
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleRegisterDevice = async () => {
    if (!newDeviceId.trim()) {
      notify("Enter the device ID printed on the scanner.", "error");
      return;
    }
    try {
      setRegistering(true);
      await api.post('/scans/scanners/', {
        device_id: newDeviceId.trim(),
        model: newDeviceModel.trim() || "Tersus S1",
      });
      notify(`Device ${newDeviceId.trim()} registered.`, "success");
      setShowRegisterModal(false);
      setNewDeviceId("");
      setNewDeviceModel("Tersus S1");
      await fetchFleet();
    } catch (err: any) {
      console.error(err);
      const detail = err?.response?.data?.device_id?.[0] || err?.response?.data?.detail;
      notify(detail || "Failed to register device.", "error");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Integration Settings</h1>
          <p className="text-gray-500 mt-1">Manage API keys, webhooks, and connected Tersus S1 hardware.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Key size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">API Credentials</h2>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Live Secret Key</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input 
                    type={apiKeyVisible ? "text" : "password"} 
                    value={apiKey} 
                    readOnly
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-800 focus:outline-none"
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                    onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  >
                    {apiKeyVisible ? <Shield size={16} /> : <Key size={16} />}
                  </button>
                </div>
                <button onClick={() => navigator.clipboard.writeText(apiKey)} className="px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm font-medium text-sm flex items-center gap-2 transition-colors">
                  <Copy size={16} /> Copy
                </button>
                <button disabled={revokingKey} onClick={handleRevokeKey} className="px-4 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                  <RefreshCcw size={16} className={revokingKey ? "animate-spin" : ""} /> Revoke
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Use this key to authenticate requests from your custom applications to the Nexucon processing engine.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL (Optional)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="url" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook/nexucon" 
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button disabled={savingWebhook} onClick={handleSaveWebhook} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50">
                  {savingWebhook ? "Saving..." : <><Save size={16} /> Save</>}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">We will send a POST request to this URL whenever a scan finishes processing.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <LinkIcon size={20} className="text-emerald-500" />
              <h2 className="text-lg font-bold text-gray-800">Connected Hardware Fleet</h2>
            </div>

            <div className="space-y-4">
              {loadingFleet ? (
                <div className="flex justify-center items-center py-6 gap-2 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" /> Loading fleet status…
                </div>
              ) : hardware.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-xl">
                  <WifiOff size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-600">No scanners registered yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Register your first Tersus S1 device below to start streaming surveys into Digital Eye.
                  </p>
                </div>
              ) : hardware.map((device) => (
                <div key={device.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      device.status === 'online' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {device.status === 'online' ? <Wifi size={20} /> : <WifiOff size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        {device.id}
                        {device.status === 'online' && <CheckCircle size={14} className="text-emerald-500" />}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{device.model} • Battery: {device.battery}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                      device.status === 'online' ? 'text-emerald-600 bg-emerald-100' : 'text-gray-500 bg-gray-200'
                    }`}>
                      {device.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Last seen: {device.lastSeen}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowRegisterModal(true)}
              className="mt-6 w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Register New Device
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-blue-400" />
              API Documentation
            </h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Integrate Nexucon directly into your ERP or project management software. Our RESTful API allows you to trigger scans programmatically and fetch results.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setDocsModal("auth")}
                className="w-full text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-sm font-medium"
              >
                Authentication Guide
              </button>
              <a
                href={docs?.openapi?.swagger_ui || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`block p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-sm font-medium ${docs ? "" : "pointer-events-none opacity-50"}`}
              >
                <span className="flex items-center justify-between">
                  Endpoints Reference <ExternalLink size={14} className="opacity-60" />
                </span>
              </a>
              <button
                onClick={() => setDocsModal("webhook")}
                className="w-full text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-sm font-medium"
              >
                Webhook Event Types
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ── REGISTER DEVICE MODAL ─────────────────────────────────────── */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-[#022C4F]">Register New Device</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Add a scanner to the fleet so its sessions are recognised by Digital Eye.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Device ID</label>
            <input
              type="text"
              value={newDeviceId}
              onChange={(e) => setNewDeviceId(e.target.value)}
              placeholder="e.g. TERSUS-S1-0042 (as printed on the device)"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm mb-4"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Model</label>
            <input
              type="text"
              value={newDeviceModel}
              onChange={(e) => setNewDeviceModel(e.target.value)}
              placeholder="e.g. Tersus S1"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              The device appears as offline until it reports its first heartbeat.
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowRegisterModal(false)}
                disabled={registering}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterDevice}
                disabled={registering || !newDeviceId.trim()}
                className="px-4 py-2 bg-[#022C4F] text-white rounded-xl text-sm font-semibold hover:bg-[#033c6c] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {registering ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Register Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── API DOCUMENTATION MODALS ──────────────────────────────────── */}
      {docsModal && docs && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between text-white rounded-t-2xl sticky top-0">
              <h3 className="font-bold flex items-center gap-2">
                <Settings size={18} className="text-blue-400" />
                {docsModal === "auth" ? "Authentication Guide" : "Webhook Event Types"}
              </h3>
              <button onClick={() => setDocsModal(null)} className="p-1 rounded-lg hover:bg-white/20">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 text-sm text-gray-700">
              {docsModal === "auth" ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Authentication type</p>
                    <p className="font-medium">{docs.authentication.type}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 font-mono text-xs space-y-1.5 break-all">
                    <p><span className="text-gray-400 not-italic font-sans font-semibold">Login:</span> POST {docs.authentication.login_endpoint}</p>
                    <p><span className="text-gray-400 not-italic font-sans font-semibold">Refresh:</span> POST {docs.authentication.refresh_endpoint}</p>
                    <p><span className="text-gray-400 not-italic font-sans font-semibold">Header:</span> {docs.authentication.header}</p>
                  </div>
                  <ul className="space-y-2">
                    {docs.authentication.notes.map((note, i) => (
                      <li key={i} className="flex gap-2 text-xs text-gray-600">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" /> {note}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Delivery</p>
                    <p className="font-medium">{docs.webhook.delivery}</p>
                  </div>
                  <div className="space-y-2">
                    {docs.webhook.events.map(ev => (
                      <div key={ev.event} className="border border-gray-100 rounded-xl p-3">
                        <p className="font-mono text-xs font-bold text-[#022C4F]">{ev.event}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                  <ul className="space-y-2">
                    {docs.webhook.notes.map((note, i) => (
                      <li key={i} className="flex gap-2 text-xs text-gray-600">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" /> {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
