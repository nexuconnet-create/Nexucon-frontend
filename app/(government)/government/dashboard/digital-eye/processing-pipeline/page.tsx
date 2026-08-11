"use client";
import React, { useState } from "react";
import { Server, Activity, RefreshCw, CheckCircle, Wifi, WifiOff } from "lucide-react";

export default function ProcessingPipeline() {
  const [activeTab, setActiveTab] = useState<'cloud' | 'edge'>('edge');

  const edgeDevices = [
    { id: "T-Rover-01", status: "online", battery: "84%", sync: "syncing", activeScan: "PLN-2026-042", lastSeen: "Just now" },
    { id: "Drone-Alpha", status: "offline", battery: "12%", sync: "pending", activeScan: "None", lastSeen: "4 hours ago" },
    { id: "Stationary-Scanner-B", status: "online", battery: "100%", sync: "synced", activeScan: "PLN-2026-043", lastSeen: "2 mins ago" },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Processing Pipeline</h1>
          <p className="text-gray-500 mt-1">Manage cloud ingestion and edge-device processing integration.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="flex items-center p-6 border-b border-gray-100 gap-2 bg-slate-50">
          <button 
            onClick={() => setActiveTab('cloud')}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${activeTab === 'cloud' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Cloud Processing
          </button>
          <button 
            onClick={() => setActiveTab('edge')}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${activeTab === 'edge' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Edge Devices (Field)
          </button>
        </div>

        {activeTab === 'edge' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <div className="flex items-center gap-3 text-emerald-600 mb-2"><Server size={20}/><h3 className="font-bold">Edge Processing</h3></div>
                <p className="text-sm text-emerald-800">Raw LiDAR and RGB data is compressed and pre-processed on the field devices before syncing to the cloud.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {edgeDevices.map(device => (
                <div key={device.id} className="p-5 border border-gray-100 rounded-xl flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${device.status === 'online' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {device.status === 'online' ? <Wifi size={24}/> : <WifiOff size={24}/>}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{device.id}</h3>
                      <p className="text-sm text-gray-500">Active Task: <span className="font-medium text-gray-700">{device.activeScan}</span> • Battery: {device.battery}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {device.sync === 'syncing' && <span className="flex items-center gap-2 text-blue-500 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium"><RefreshCw size={14} className="animate-spin"/> Syncing Data...</span>}
                    {device.sync === 'synced' && <span className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle size={14}/> Synced</span>}
                    {device.sync === 'pending' && <span className="flex items-center gap-2 text-amber-500 bg-amber-50 px-3 py-1 rounded-full text-sm font-medium"><Activity size={14}/> Pending Upload</span>}
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Manage</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'cloud' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-blue-600 mb-1"><Server size={20}/><h3 className="font-bold">Cloud Nodes</h3></div>
                <h2 className="text-3xl font-bold text-blue-900 mt-2">12 / 16</h2>
                <p className="text-sm text-blue-700 mt-1">Active GPU nodes processing</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm text-gray-500 font-medium">Pending Jobs</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">8</h2>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm text-gray-500 font-medium">Processing</p>
                <h2 className="text-3xl font-bold text-blue-600 mt-2">3</h2>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm text-gray-500 font-medium">Completed (24h)</p>
                <h2 className="text-3xl font-bold text-emerald-600 mt-2">42</h2>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-4 text-lg">Active Processing Jobs</h3>
            <div className="space-y-4">
              {/* Job 1 */}
              <div className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><RefreshCw size={18} className="animate-spin"/></div>
                    <div>
                      <h4 className="font-bold text-gray-900">3D Gaussian Splatting Rendering</h4>
                      <p className="text-sm text-gray-500">Project: Downtown Metro • Job ID: JOB-9923</p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full">Processing (45%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[45%]"></div>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-right">Est. time remaining: 14 mins</p>
              </div>
              
              {/* Job 2 */}
              <div className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><RefreshCw size={18} className="animate-spin"/></div>
                    <div>
                      <h4 className="font-bold text-gray-900">AI Thermal Anomaly Detection</h4>
                      <p className="text-sm text-gray-500">Project: Riverside Complex • Job ID: JOB-9924</p>
                    </div>
                  </div>
                  <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full">Analyzing (82%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[82%]"></div>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-right">Est. time remaining: 2 mins</p>
              </div>
              
              {/* Job 3 */}
              <div className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle size={18}/></div>
                    <div>
                      <h4 className="font-bold text-gray-900">LiDAR Point Cloud Registration</h4>
                      <p className="text-sm text-gray-500">Project: Highway Bridge A4 • Job ID: JOB-9920</p>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">Completed</span>
                </div>
                <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full"></div>
                </div>
                <p className="text-xs text-emerald-600 mt-3 text-right">Finished 1 hour ago</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
