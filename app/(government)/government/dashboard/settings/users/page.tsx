"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, UserPlus, MoreVertical, ShieldCheck, Mail, RefreshCw, Power, AlertCircle } from "lucide-react";
import { StaffUser, getStaffUsers, toggleStaffUserStatus } from "@/services/settings";
import InviteUserDrawer from "@/components/dashboard/InviteUserDrawer";

export default function UserManagement() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getStaffUsers({
        search: search.trim() || undefined,
        department: departmentFilter !== "ALL" ? departmentFilter : undefined
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load staff users", err);
      setFetchError(err?.message || "Unable to retrieve staff roster from server.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, departmentFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user: StaffUser) => {
    try {
      await toggleStaffUserStatus(user.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `User status for ${user.name || 'user'} toggled!`, type: 'info' } 
      }));
      fetchUsers();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to update user status', type: 'error' } }));
    }
  };

  const departments = ["ALL", "Urban Planning", "Structural Engineering", "Development Control", "Environmental Planning", "IT / Operations"];
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Users className="text-blue-500" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage internal government staff access, roles, and departmental assignments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold cursor-pointer"
          >
            <UserPlus size={16} />
            Invite User
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button 
            onClick={fetchUsers}
            className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or role..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  departmentFilter === dept ? 'bg-blue-600 text-white font-bold' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Role &amp; Department</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Last Login</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {safeUsers.map((user, idx) => {
                const userName = user?.name || 'Staff User';
                const initial = userName.charAt(0).toUpperCase() || 'U';
                const userEmail = user?.email || 'No email';
                const userRole = user?.role || 'Reviewer';
                const userDept = user?.department || 'General';
                const userStatus = user?.status || 'Active';
                const userLogin = user?.lastLogin || (userStatus === 'Pending' ? 'Invite Sent (Pending)' : 'Recent');

                return (
                  <tr key={user?.id || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0 border border-blue-100">
                          {initial}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-gray-900">{userName}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} /> {userEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                          {userRole === 'System Administrator' && <ShieldCheck size={10} />}
                          {userRole}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold">{userDept}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        userStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        userStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                        'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {userStatus === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        {userStatus === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                        {userStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-gray-600">
                        {userLogin}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {userStatus === 'Pending' ? (
                        <button
                          onClick={async () => {
                            try {
                              await fetch('/api/email/send', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  to: userEmail,
                                  name: userName,
                                  role: userRole,
                                  department: userDept
                                })
                              });
                              window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Invitation resent to ${userEmail}!`, type: 'success' } }));
                            } catch {
                              window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to resend invite', type: 'error' } }));
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Mail size={12} className="text-amber-600" />
                          Resend Invite
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Power size={12} className={userStatus === 'Active' ? "text-red-500" : "text-emerald-500"} />
                          {userStatus === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {safeUsers.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 text-xs">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
          <span className="text-gray-500 font-semibold">Showing {safeUsers.length} internal officers</span>
        </div>
      </motion.div>

      <InviteUserDrawer
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
