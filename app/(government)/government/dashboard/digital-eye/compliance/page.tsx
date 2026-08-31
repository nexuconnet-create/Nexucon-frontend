"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  ArrowUpRight,
  Search,
  Loader2
} from "lucide-react";
import Link from "next/link";
import api, { notify } from "@/lib/api";

interface StopWorkFlag {
  id: string;
  status: string;
  reason: string;
  check_id?: string | null;
  created_at: string;
  flagged_by?: string;
}

export default function ComplianceCheckPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [complianceChecks, setComplianceChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChecks, setLoadingChecks] = useState(false);
  const [issuing, setIssuing] = useState(false);

  // Stop-work order state
  const [activeFlag, setActiveFlag] = useState<StopWorkFlag | null>(null);
  const [flaggingCheck, setFlaggingCheck] = useState<any | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [liftingFlag, setLiftingFlag] = useState(false);

  const refreshFlag = async (sessionId: string) => {
    try {
      const res = await api.get(`/scans/${sessionId}/stop-work-flag/`);
      const flags = res.data?.results || res.data;
      setActiveFlag(
        Array.isArray(flags) ? flags.find((f: StopWorkFlag) => f.status === "active") || null : flags || null
      );
    } catch {
      setActiveFlag(null);
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/scans/sessions/');
        const data = res.data;
        setSessions(data);
        if (data.length > 0) {
          setSelectedSessionId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;

    const fetchComplianceChecks = async () => {
      try {
        setLoadingChecks(true);
        const response = await api.get(`/scans/compliance-checks/?session_id=${selectedSessionId}`);
        setComplianceChecks(response.data.results || response.data);
      } catch (error) {
        console.error("Failed to fetch compliance checks", error);
      } finally {
        setLoadingChecks(false);
      }
    };

    fetchComplianceChecks();
    refreshFlag(selectedSessionId);
  }, [selectedSessionId]);

  const handleFlagStopWork = async () => {
    if (!flaggingCheck || !selectedSessionId) return;
    if (!flagReason.trim()) {
      notify("Please provide a reason for the stop-work order.", "error");
      return;
    }
    try {
      setFlagSubmitting(true);
      const res = await api.post(`/scans/${selectedSessionId}/stop-work-flag/`, {
        reason: flagReason.trim(),
        check_id: flaggingCheck.id,
      });
      notify(
        res.data?.status === "active"
          ? "Stop-work order issued and the flagger has been notified by email."
          : "Stop-work order issued.",
        "success"
      );
      setFlaggingCheck(null);
      setFlagReason("");
      refreshFlag(selectedSessionId);
    } catch (err: any) {
      console.error(err);
      notify(err?.response?.data?.detail || err?.response?.data?.reason || "Failed to issue stop-work order.", "error");
    } finally {
      setFlagSubmitting(false);
    }
  };

  const handleLiftStopWork = async () => {
    if (!selectedSessionId) return;
    try {
      setLiftingFlag(true);
      await api.patch(`/scans/${selectedSessionId}/stop-work-flag/`);
      notify("Stop-work order lifted. Work may resume.", "success");
      refreshFlag(selectedSessionId);
    } catch (err: any) {
      console.error(err);
      notify(err?.response?.data?.detail || "Failed to lift stop-work order.", "error");
    } finally {
      setLiftingFlag(false);
    }
  };

  const handleIssueCertificate = async () => {
    if (!selectedSessionId) return;
    try {
      setIssuing(true);
      const res = await api.post(`/scans/${selectedSessionId}/compliance-certificate/`);
      const certNumber = res.data?.certificate_number || 'Unknown';
      
      // Generate a downloadable HTML certificate
      const certContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Compliance Certificate ${certNumber}</title>
  <style>
    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
    .cert-box { border: 2px solid #022C4F; padding: 40px; border-radius: 12px; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
    h1 { color: #022C4F; margin: 0; }
    .seal { background: ${res.data.failed_checks > 0 ? '#f59e0b' : '#10b981'}; color: white; padding: 10px 20px; border-radius: 99px; font-weight: bold; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 18px; }
    .label { font-weight: bold; color: #64748b; }
    .value { font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="cert-box">
    <div class="header">
      <h1>Compliance Certificate</h1>
      <div class="seal">${res.data.failed_checks > 0 ? 'CONDITIONAL' : 'VERIFIED'}</div>
    </div>
    <div class="row"><span class="label">Certificate Number:</span> <span class="value">${certNumber}</span></div>
    <div class="row"><span class="label">Session ID:</span> <span class="value">${selectedSessionId}</span></div>
    <div class="row"><span class="label">Date Issued:</span> <span class="value">${new Date().toLocaleDateString()}</span></div>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
    <div class="row"><span class="label">Total Checks Analysed:</span> <span class="value">${res.data.total_checks}</span></div>
    <div class="row"><span class="label">Tolerances Passed:</span> <span class="value" style="color: #10b981">${res.data.passed_checks}</span></div>
    <div class="row"><span class="label">Tolerances Failed:</span> <span class="value" style="color: #ef4444">${res.data.failed_checks}</span></div>
    
    <div class="footer">
      Generated automatically by Digital Eye System based on Point Cloud to BIM Deviation Analysis.
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
      `;
      
      const blob = new Blob([certContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certNumber}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      notify(`Certificate ${certNumber} Issued Successfully!`, "success");
    } catch (err) {
      console.error(err);
      notify("Failed to issue certificate.", "error");
    } finally {
      setIssuing(false);
    }
  };

  const filteredChecks = complianceChecks.filter(c => {
    if (filter === 'pass') return c.status === 'pass';
    if (filter === 'fail') return c.status === 'fail';
    return true;
  }).filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.element || '').toLowerCase().includes(q) ||
      (c.rule || '').toLowerCase().includes(q) ||
      (c.id || '').toLowerCase().includes(q) ||
      (c.measured || '').toLowerCase().includes(q)
    );
  });

  const passCount = complianceChecks.filter(c => c.status === 'pass').length;
  const failCount = complianceChecks.filter(c => c.status === 'fail').length;

  return (
    <div className="w-full h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={32} />
            Automated Compliance Check
          </h1>
          <p className="text-gray-500 mt-1">
            Phase 3: AI-driven verification of structural elements against regulatory and design tolerances using fused SLAM+GNSS data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleIssueCertificate}
            disabled={issuing || !selectedSessionId}
            className="px-4 py-2 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors font-medium flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {issuing ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
            Issue Compliance Certificate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {activeFlag && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={22} />
                <div>
                  <p className="font-bold text-red-800 text-sm">
                    Stop-work order active on this session
                  </p>
                  <p className="text-sm text-red-700 mt-0.5">
                    {activeFlag.reason}
                    {activeFlag.check_id ? ` (check ${activeFlag.check_id})` : ''}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Issued {activeFlag.created_at ? new Date(activeFlag.created_at).toLocaleString() : ''}
                    {activeFlag.flagged_by ? ` by ${activeFlag.flagged_by}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLiftStopWork}
                disabled={liftingFlag}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50 shrink-0"
              >
                {liftingFlag ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Lift Stop-Work
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Checks</p>
                <p className="text-2xl font-bold text-[#022C4F]">{complianceChecks.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Passed Tolerances</p>
                <p className="text-2xl font-bold text-emerald-600">{passCount}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-red-500">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Failed / Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">{failCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Session:</span>
                  <select 
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none min-w-[120px]"
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                  >
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name || `SCN-${s.id.substring(0,8)}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-[#022C4F] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    All Checks
                  </button>
                  <button 
                    onClick={() => setFilter('pass')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    Passed
                  </button>
                  <button 
                    onClick={() => setFilter('fail')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'fail' ? 'bg-red-100 text-red-700' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    Failed
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search elements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1 relative">
              {loadingChecks ? (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : null}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Element / ID</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tolerance Rule</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Measured Value</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Confidence</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredChecks.length === 0 && !loadingChecks ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                        No compliance checks found for this scan session.
                      </td>
                    </tr>
                  ) : (
                    filteredChecks.map((check) => (
                      <tr key={check.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#022C4F]">{check.element}</div>
                          <div className="text-xs text-slate-500">{check.id}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{check.rule}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-sm font-bold ${check.status === 'fail' ? 'text-red-600' : 'text-[#022C4F]'}`}>
                            {check.measured}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {check.status === 'pass' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                              <CheckCircle size={14} /> Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                              <XCircle size={14} /> Fail
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-slate-500">{check.confidence}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link href={`/government/dashboard/digital-eye/scan-to-bim?session_id=${selectedSessionId}`} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 justify-end w-full">
                            View Scan <ArrowUpRight size={14} />
                          </Link>
                          {check.status === 'fail' && (
                            <button
                              onClick={() => { setFlaggingCheck(check); setFlagReason(""); }}
                              disabled={!!activeFlag}
                              className="text-red-600 hover:text-red-800 text-xs font-bold mt-1 text-right w-full disabled:opacity-50"
                              title={activeFlag ? "A stop-work order is already active on this session" : "Issue a stop-work order for this failed check"}
                            >
                              {activeFlag ? 'Stop-Work Already Active' : 'Flag for Stop-Work'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Stop-work order reason modal */}
      {flaggingCheck && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#022C4F]">Issue Stop-Work Order</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Work on session <span className="font-semibold">{selectedSessionId.substring(0, 8)}</span> will be
                  formally halted and the flagger notified by email.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm mb-4">
              <p className="font-semibold text-[#022C4F]">{flaggingCheck.element}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {flaggingCheck.id} · {flaggingCheck.rule} · measured {flaggingCheck.measured}
              </p>
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Reason for stop-work
            </label>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              rows={3}
              placeholder="e.g. Vertical tolerance exceeded beyond permissible limit on column — rework required before proceeding."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => { setFlaggingCheck(null); setFlagReason(""); }}
                disabled={flagSubmitting}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagStopWork}
                disabled={flagSubmitting || !flagReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {flagSubmitting ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                Issue Stop-Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
