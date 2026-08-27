"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Save, Plus, Search, ShieldAlert, RefreshCw, CheckCircle2 } from "lucide-react";
import { RolesMatrixResponse, getRolesMatrix, updateRolesMatrix } from "@/services/settings";
import CreateRoleDrawer from "@/components/dashboard/CreateRoleDrawer";

export default function RolesPermissions() {
  const [matrixData, setMatrixData] = useState<RolesMatrixResponse | null>(null);
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchMatrix = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRolesMatrix();
      setMatrixData(data);
    } catch (err) {
      console.error("Failed to load roles matrix", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  const rolesList = (matrixData?.roles || []).filter(r => 
    !search.trim() || r.toLowerCase().includes(search.toLowerCase())
  );

  const activeRoleName = rolesList[selectedRoleIdx] || rolesList[0] || "City Planner";

  const handleToggle = (mIdx: number, pIdx: number) => {
    if (!matrixData) return;
    
    const updatedModules = [...matrixData.permission_modules];
    const currentVal = updatedModules[mIdx].permissions[pIdx].roles[activeRoleName] ?? false;
    updatedModules[mIdx].permissions[pIdx].roles[activeRoleName] = !currentVal;

    setMatrixData({
      ...matrixData,
      permission_modules: updatedModules
    });
  };

  const handleSave = async () => {
    if (!matrixData) return;
    setIsSaving(true);
    try {
      const updates: { role_name: string; module: string; permission_name: string; is_granted: boolean }[] = [];

      matrixData.permission_modules.forEach(m => {
        const moduleName = m.name || m.module || "General";
        m.permissions.forEach(p => {
          updates.push({
            role_name: activeRoleName,
            module: moduleName,
            permission_name: p.name,
            is_granted: p.roles[activeRoleName] ?? false
          });
        });
      });

      await updateRolesMatrix(updates);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Permissions for ${activeRoleName} updated successfully!`, type: 'success' } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to save permissions', type: 'error' } }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldCheck className="text-purple-500" />
            Roles &amp; Permissions
          </h1>
          <p className="text-gray-500 mt-1">Configure Role-Based Access Control (RBAC) and define permission matrices.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchMatrix}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Col: Role List */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 border-dashed text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold cursor-pointer"
          >
            <Plus size={16} /> Create New Role
          </button>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input 
                   type="text" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search roles..." 
                   className="pl-8 pr-3 py-1.5 w-full bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>
            </div>
            <div className="divide-y divide-gray-100">
              {rolesList.map((roleName, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedRoleIdx(idx)}
                  className={`p-4 cursor-pointer transition-colors ${
                    activeRoleName === roleName ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`text-sm font-bold ${activeRoleName === roleName ? 'text-blue-700' : 'text-gray-900'}`}>{roleName}</h3>
                    {roleName === 'System Administrator' && <ShieldAlert size={14} className="text-red-500" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {roleName === 'System Administrator' ? 'System Default' : 'Custom Agency Role'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Permission Matrix */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div>
                  <h2 className="text-lg font-bold text-gray-900">Editing Permissions: {activeRoleName}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Toggle switches to grant or restrict access for this role.</p>
               </div>
            </div>

            <div className="p-6">
               {matrixData?.permission_modules.map((module, mIdx) => (
                 <div key={mIdx} className="mb-8 last:mb-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 pb-2 border-b border-gray-100">
                       {module.name || module.module}
                    </h3>
                    
                    <div className="space-y-3">
                       {module.permissions.map((perm, pIdx) => {
                          const isGranted = perm.roles[activeRoleName] ?? false;

                          return (
                            <div key={pIdx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                               <div>
                                  <span className="text-sm font-semibold text-gray-700 block">{perm.name}</span>
                                  {perm.description && <span className="text-xs text-gray-400">{perm.description}</span>}
                               </div>
                               
                               {/* Toggle Switch */}
                               <div 
                                  onClick={() => handleToggle(mIdx, pIdx)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ml-4 ${
                                     isGranted ? 'bg-blue-600' : 'bg-gray-200'
                                  }`}
                               >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                     isGranted ? 'translate-x-6' : 'translate-x-1'
                                  }`} />
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </div>

      <CreateRoleDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchMatrix}
      />
    </div>
  );
}
