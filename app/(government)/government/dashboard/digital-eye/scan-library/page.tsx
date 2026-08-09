"use client";

import React, { useState } from "react";
import { 
  Folder,
  File,
  Image as ImageIcon,
  MoreVertical,
  Download,
  Share2,
  Search,
  Filter,
  Layers,
  Box
} from "lucide-react";
import { motion } from "framer-motion";

export default function ScanLibrary() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const assets = [
    { id: 1, name: "Downtown_Metro_LiDAR.las", type: "lidar", size: "1.2 GB", date: "Oct 10, 2026", project: "Downtown Metro Station" },
    { id: 2, name: "Riverside_RGB_Orthomosaic.tif", type: "rgb", size: "450 MB", date: "Oct 10, 2026", project: "Riverside Commercial" },
    { id: 3, name: "Highway_Bridge_A4_Mesh.obj", type: "mesh", size: "850 MB", date: "Oct 09, 2026", project: "Highway Bridge A4" },
    { id: 4, name: "Hospital_Annex_Thermal.jpg", type: "thermal", size: "12 MB", date: "Oct 08, 2026", project: "City Hospital Annex" },
    { id: 5, name: "Green_Valley_Point_Cloud.e57", type: "lidar", size: "2.1 GB", date: "Oct 07, 2026", project: "Green Valley High School" },
    { id: 6, name: "Metro_Station_BIM_Comparison.pdf", type: "report", size: "4 MB", date: "Oct 10, 2026", project: "Downtown Metro Station" },
  ];

  const getIcon = (type: string, iconSize: number = 32) => {
    switch(type) {
      case 'lidar': return <Layers className="text-purple-500" size={iconSize} />;
      case 'rgb': return <ImageIcon className="text-blue-500" size={iconSize} />;
      case 'mesh': return <Box className="text-emerald-500" size={iconSize} />;
      case 'thermal': return <ImageIcon className="text-amber-500" size={iconSize} />;
      case 'report': return <File className="text-red-500" size={iconSize} />;
      default: return <File className="text-gray-500" size={iconSize} />;
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case 'lidar': return "bg-purple-50";
      case 'rgb': return "bg-blue-50";
      case 'mesh': return "bg-emerald-50";
      case 'thermal': return "bg-amber-50";
      case 'report': return "bg-red-50";
      default: return "bg-gray-50";
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Scan Library</h1>
          <p className="text-gray-500 mt-1">Repository of raw scan data, processed point clouds, and generated meshes.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search assets by name or project..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
            <Filter size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('grid')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Grid
          </button>
          <button 
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            List
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map((asset, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={asset.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all cursor-pointer"
            >
              <div className={`h-40 ${getBgColor(asset.type)} flex items-center justify-center relative`}>
                {getIcon(asset.type)}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 bg-white/80 hover:bg-white rounded text-gray-600 shadow-sm backdrop-blur"><Download size={14} /></button>
                  <button className="p-1.5 bg-white/80 hover:bg-white rounded text-gray-600 shadow-sm backdrop-blur"><Share2 size={14} /></button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors" title={asset.name}>
                    {asset.name}
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 shrink-0"><MoreVertical size={16} /></button>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{asset.project}</p>
                <div className="flex items-center justify-between mt-4 text-xs font-medium text-gray-400">
                  <span className="uppercase tracking-wider px-2 py-0.5 bg-gray-100 rounded">{asset.type}</span>
                  <div className="flex items-center gap-2">
                    <span>{asset.size}</span>
                    <span>•</span>
                    <span>{asset.date}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Asset Name</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Project</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Type</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Size</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Date Added</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${getBgColor(asset.type)}`}>
                        {getIcon(asset.type, 16)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{asset.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{asset.project}</td>
                  <td className="py-4 px-6">
                    <span className="uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                      {asset.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{asset.size}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{asset.date}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"><Download size={16} /></button>
                      <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"><Share2 size={16} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
