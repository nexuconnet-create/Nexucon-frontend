"use client";

import React, { useEffect, useState } from 'react';
import { getSessions, revokeSession, UserSession } from '@/services/sessions';
import { Shield, AlertTriangle, Monitor, Smartphone, Globe, Clock, Power } from 'lucide-react';

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await getSessions();
      setSessions(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError('Failed to load active sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to revoke this session? The user will be logged out immediately.")) return;
    
    try {
      await revokeSession(sessionId);
      // Refresh the list
      await fetchSessions();
    } catch (err) {
      console.error('Failed to revoke session:', err);
      alert('Failed to revoke session. Please try again.');
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const lower = deviceInfo.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) return <Smartphone size={18} />;
    return <Monitor size={18} />;
  };

  const parseBrowser = (deviceInfo: string) => {
    if (!deviceInfo) return "Unknown Browser";
    const lower = deviceInfo.toLowerCase();
    if (lower.includes('edg/')) return 'Edge';
    if (lower.includes('chrome')) return 'Chrome';
    if (lower.includes('safari') && !lower.includes('chrome')) return 'Safari';
    if (lower.includes('firefox')) return 'Firefox';
    return deviceInfo.split(' ')[0] || "Unknown Browser";
  };

  const parseOS = (deviceInfo: string) => {
    if (!deviceInfo) return "Unknown OS";
    const lower = deviceInfo.toLowerCase();
    if (lower.includes('windows')) return 'Windows';
    if (lower.includes('mac os')) return 'macOS';
    if (lower.includes('linux')) return 'Linux';
    if (lower.includes('android')) return 'Android';
    if (lower.includes('iphone') || lower.includes('ipad')) return 'iOS';
    return "Unknown OS";
  };

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <Shield size={20} />
          </div>
          <h1 className="text-[32px] font-bold text-slate-900 leading-tight">
            Security Settings
          </h1>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed ml-[52px]">
          Manage your account security, review active sessions, and configure access controls.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-8 max-w-4xl">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                Active Sessions
              </h2>
              <p className="text-sm text-slate-500">
                Review and manage devices that are currently logged into your account.
              </p>
            </div>
            <button 
              onClick={fetchSessions}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading sessions...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 text-sm">{error}</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No active sessions found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sessions.map((session, index) => {
                  const browser = parseBrowser(session.device_info);
                  const os = parseOS(session.device_info);
                  const isCurrentSession = index === 0; // The API returns descending order by last activity, so usually index 0 is current.

                  return (
                    <div key={session.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:bg-slate-50 transition-colors">
                      <div className="p-3 bg-slate-100 rounded-xl text-slate-600 shrink-0">
                        {getDeviceIcon(session.device_info)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {os} — {browser}
                          </h3>
                          {isCurrentSession && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded">
                              Current Session
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Globe size={14} className="opacity-70" />
                            <span>{session.ip_address || 'Unknown IP'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="opacity-70" />
                            <span>Last active: {new Date(session.last_activity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                        {!isCurrentSession && (
                          <button 
                            onClick={() => handleRevoke(session.id)}
                            className="w-full sm:w-auto px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <Power size={14} /> Revoke
                          </button>
                        )}
                        {isCurrentSession && (
                          <div className="px-4 py-2 text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Now
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
