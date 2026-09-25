"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import NexuconLinkNav from "@/components/dashboard/digital-eye/NexuconLinkNav";
import PunditWaveformViewer from "@/components/dashboard/digital-eye/PunditWaveformViewer";
import PaginationBar from "@/components/dashboard/PaginationBar";
import {
  FolderViewToggle,
  FloorStationTreeBody,
  punditFloorOf,
  punditStationOf,
  punditStationSummary,
  ratingBadgeClass,
  useFloorStationFolders,
} from "@/components/dashboard/digital-eye/PunditFolderTree";
import { PunditTest, SEAdjustmentDisclosure, getPunditTests, downloadNdtReport, exportPunditResults, formatVelocityMs } from "@/services/digitalEye";

export default function PunditTestsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [activeTest, setActiveTest] = useState<PunditTest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  // A1: row expansion reveals the element's per-point readings (A, B, C…).
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // 8 Sep meeting: registry folder structure — Floor folder -> Station
  // sub-menu -> tests, with mean values per station. The flat list stays
  // available as a toggle. (Shared with the other Pundit pages.)
  const folders = useFloorStationFolders(tests, punditFloorOf, punditStationOf);

  const refreshTests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setTests(await getPunditTests({ project: selectedProjectId || undefined }));
    } catch (err: any) {
      setTests([]);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load PUNDIT tests from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTests();
  }, [selectedProjectId]);

  const handleDownloadReport = () => {
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '⚠️ Select a project to download its official NDT report.', type: "error" } }));
      return;
    }
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Generating official BS 1881-203 NDT report PDF…', type: "info" } }));
    downloadNdtReport(selectedProjectId)
      .then((filename) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Downloaded ${filename} (MTL-style NDT dossier, real registry data).`, type: "success" } })))
      .catch((err: any) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `⚠️ ${err?.response?.data?.detail || err?.message || 'Report generation failed.'}`, type: "error" } })));
  };

  // Excel export whose values match the report's Section 5.0 tables exactly.
  const handleExportResults = () => {
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '⚠️ Select a project to export its results to Excel.', type: "error" } }));
      return;
    }
    exportPunditResults(selectedProjectId)
      .then((filename) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Downloaded ${filename} — values match the generated NDT report (m/s).`, type: "success" } })))
      .catch((err: any) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `⚠️ ${err?.response?.data?.detail || err?.message || 'Excel export failed.'}`, type: "error" } })));
  };

  // Folder tree: Floor -> Station (structural element / test location) ->
  // tests. Stations carry their own mean velocity / mean strength across
  // the tests recorded on them (server-persisted element means per test).
  // The grouping, means and folder rows come from the shared component.

  const testCount = tests.length;
  const strengthHeader = testCount > 0 && tests.some((t) => t.readings.length > 1)
    ? 'Avg. Compressive Strength (MPa)'
    : 'Strength (MPa)';

  const rowProps = { setActiveTest, handleDownloadReport, expandedId, setExpandedId };

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: Ultrasonic Pulse Velocity Test Registry"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      {/* The Nexucon Link navigation layer (client's "castle-like" structure). */}
      <div className="mb-6">
        <NexuconLinkNav subtitle="Measurements" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-[#022C4F]">Proceq Pundit PL-200 NDT Test Records</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Folder structure per floor and station, with each station&apos;s mean values
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FolderViewToggle viewMode={folders.viewMode} onChange={folders.setViewMode} />
            <button
              onClick={handleExportResults}
              disabled={!selectedProjectId}
              title="Export results to Excel — values match the generated NDT report"
              className="px-3 py-1.5 border border-gray-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-gray-700 cursor-pointer disabled:opacity-50"
            >
              Export to Excel
            </button>
            <span className="text-xs text-gray-500 font-mono">{testCount} Records</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-semibold text-gray-400 animate-pulse">
              Loading test registry from server…
            </div>
          ) : error ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs font-bold text-rose-600">{error}</p>
              <button onClick={refreshTests} className="px-4 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold">
                Retry
              </button>
            </div>
          ) : testCount === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No PUNDIT tests recorded for this project yet.
            </div>
          ) : folders.viewMode === 'flat' ? (
            <div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                    <th className="py-3 px-3 w-8"></th>
                    <th className="py-3 px-5">Test Ref</th>
                    <th className="py-3 px-5">Project & Location</th>
                    <th className="py-3 px-5">Floor</th>
                    <th className="py-3 px-5">Points</th>
                    <th className="py-3 px-5">Transducer Mode</th>
                    <th className="py-3 px-5">Velocity (m/s)</th>
                    <th className="py-3 px-5">{strengthHeader}</th>
                    <th className="py-3 px-5">Remarks</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tests
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((t) => (
                      <TestRow key={t.id} t={t} {...rowProps} />
                    ))}
                </tbody>
              </table>

              {tests.length > 0 && (
                <PaginationBar
                  currentPage={currentPage}
                  totalItems={tests.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
              )}
            </div>
          ) : (
            <FloorStationTreeBody
              groups={folders.groups}
              openFloors={folders.openFloors}
              openStations={folders.openStations}
              toggleFloor={folders.toggleFloor}
              toggleStation={folders.toggleStation}
              stationSummary={punditStationSummary}
              renderStationBody={(rows) => (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                      <th className="py-2.5 px-3 w-8"></th>
                      <th className="py-2.5 px-5">Test Ref</th>
                      <th className="py-2.5 px-5">Project & Location</th>
                      <th className="py-2.5 px-5">Points</th>
                      <th className="py-2.5 px-5">Transducer Mode</th>
                      <th className="py-2.5 px-5">Velocity (m/s)</th>
                      <th className="py-2.5 px-5">{strengthHeader}</th>
                      <th className="py-2.5 px-5">Remarks</th>
                      <th className="py-2.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((t) => (
                      <TestRow key={t.id} t={t} {...rowProps} showFloor={false} />
                    ))}
                  </tbody>
                </table>
              )}
            />
          )}
        </div>
      </div>

      {activeTest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full my-auto">
            <PunditWaveformViewer test={activeTest} onClose={() => setActiveTest(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

/** The standard-error disclosure stored alongside a test's strength, when
 *  the curve that produced it carried a policy — whether the policy was
 *  applied or was requested and honestly refused. Null when the curve has no
 *  policy at all: the figure is then the curve estimate as fitted and there
 *  is nothing to disclose. */
function strengthAdjustment(t: PunditTest): SEAdjustmentDisclosure | null {
  const d = t.strength_curve_snapshot?.se_adjustment;
  if (!d) return null;
  return d.applied || (d.method && d.method !== 'none') ? d : null;
}

/** One registry test row (shared by the flat table and the folder view) —
 *  expandable to its per-point readings. */
function TestRow({
  t,
  expandedId,
  setExpandedId,
  setActiveTest,
  handleDownloadReport,
  showFloor = true,
}: {
  t: PunditTest;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  setActiveTest: (t: PunditTest) => void;
  handleDownloadReport: () => void;
  showFloor?: boolean;
}) {
  // Resolved once: the row badge and the expanded disclosure are the same
  // statement, and they must never disagree about whether a policy applied.
  const adjustment = strengthAdjustment(t);
  return (
    <React.Fragment>
      <tr
        className="hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
      >
        <td className="py-3.5 px-3 text-gray-400">
          {t.readings.length > 0 && (
            expandedId === t.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </td>
        <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{t.test_reference}</td>
        <td className="py-3.5 px-5 text-gray-700">{t.project_name}{t.test_location ? ` - ${t.test_location}` : ''}</td>
        {showFloor && <td className="py-3.5 px-5 text-gray-600">{t.floor || '—'}</td>}
        <td className="py-3.5 px-5 font-mono text-gray-700">
          {t.readings.length > 0
            ? <span title={t.readings.map(r => r.point_label).join(', ')}>{t.readings.map(r => r.point_label).join('/')}</span>
            : 'A'}
        </td>
        <td className="py-3.5 px-5 font-mono text-gray-600">{t.transducer_type ? `${t.transducer_type} (${t.transducer_frequency_khz || '—'}kHz)` : `${t.transducer_frequency_khz || '—'} kHz`}</td>
        <td className="py-3.5 px-5 font-mono font-bold text-amber-700">{t.pulse_velocity_ms ? `${formatVelocityMs(t.pulse_velocity_ms)} m/s` : 'Pending'}</td>
        <td className="py-3.5 px-5 font-mono font-bold text-gray-800" title={t.readings.length > 1 ? 'Element mean across its test points' : undefined}>
          {t.estimated_compressive_strength_mpa != null
            ? `${t.estimated_compressive_strength_mpa.toFixed(1)} MPa`
            : '—'}
          {adjustment?.applied && (
            <span
              className="ml-1.5 align-super px-1 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold"
              title={`Standard-error policy applied to this figure — ${adjustment.detail}`}
            >
              SE
            </span>
          )}
        </td>
        <td className="py-3.5 px-5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ratingBadgeClass(t.concrete_quality_rating)}`}>
            {t.concrete_quality_rating}
          </span>
        </td>
        <td className="py-3.5 px-5 text-right flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setActiveTest(t); }}
            className="px-3 py-1 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Oscillogram
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownloadReport(); }}
            title="Download official BS 1881-203 NDT report (PDF)"
            className="p-1 border border-gray-200 hover:bg-slate-100 rounded-lg text-gray-600 cursor-pointer"
          >
            <Download size={13} />
          </button>
        </td>
      </tr>
      {expandedId === t.id && (
        <tr className="bg-slate-50/70">
          <td colSpan={showFloor ? 10 : 9} className="px-5 py-4">
            {/* Outside the readings branch on purpose: a legacy
                single-measurement record can still carry a policy-adjusted
                verdict, and this figure must never print without the
                statement of what moved it. */}
            {adjustment && (
              <p className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-900">
                <span className="font-bold uppercase tracking-wider">
                  Standard-error policy — {adjustment.method_label}
                </span>
                {adjustment.base_f_cu_mpa != null &&
                  adjustment.adjusted_f_cu_mpa != null && (
                    <span className="font-mono">
                      {' '}
                      {adjustment.base_f_cu_mpa.toFixed(2)} →{' '}
                      {adjustment.adjusted_f_cu_mpa.toFixed(2)} N/mm²
                    </span>
                  )}
                {/* Where the correction was actually applied. The client's
                    method folds the standard error into the PULSE VELOCITY
                    before the conversion to f_cu (15 Sep 2026), so the
                    increment is shown in m/s next to the strength it
                    produced — otherwise the only visible number is the
                    result, and the step itself cannot be checked. Absent
                    when the correction stayed on the strength: a lookup
                    table, a curve flat at this velocity, or a move that
                    would leave the calibrated range. */}
                {adjustment.velocity_step && (
                  <span className="font-mono">
                    {' · applied to the pulse velocity '}
                    {formatVelocityMs(adjustment.velocity_step.base_velocity_ms)} →{' '}
                    {formatVelocityMs(adjustment.velocity_step.adjusted_velocity_ms)} m/s
                    {' ('}
                    {adjustment.velocity_step.delta_velocity_ms >= 0 ? '+' : ''}
                    {adjustment.velocity_step.delta_velocity_ms.toFixed(1)} m/s
                    {' at '}
                    {adjustment.velocity_step.slope_mpa_per_ms} N/mm² per m/s)
                  </span>
                )}
                <br />
                {adjustment.detail}
              </p>
            )}
            {t.readings.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Test-point readings — {t.structural_element_name || t.test_location || 'element not named'}
                    {t.test_type === 'crack_depth'
                      ? ' · element verdict = server-computed mean depth'
                      : ' · element verdict = server-computed mean'}
                  </span>
                  {t.weather_condition && (
                    <span className="text-[10px] font-mono text-gray-500">Weather: {t.weather_condition}</span>
                  )}
                </div>
                {t.test_type === 'crack_depth' ? (
                  <table className="w-full text-xs bg-white rounded-xl border border-gray-100">
                    <thead>
                      <tr className="text-gray-500 text-[10px] uppercase border-b border-gray-100">
                        <th className="py-2 px-4 text-left">Point</th>
                        <th className="py-2 px-4 text-right">Spacing L (mm)</th>
                        <th className="py-2 px-4 text-right">t_cracked (µs)</th>
                        <th className="py-2 px-4 text-right">t_uncracked (µs)</th>
                        <th className="py-2 px-4 text-right">Crack depth (mm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {t.readings.map(r => (
                        <tr key={r.id || r.point_label}>
                          <td className="py-2 px-4 font-bold text-gray-900">{r.point_label}</td>
                          <td className="py-2 px-4 text-right text-gray-700">{r.path_length_mm ?? '—'}</td>
                          <td className="py-2 px-4 text-right text-gray-700">{r.transit_time_us ?? '—'}</td>
                          <td className="py-2 px-4 text-right text-gray-700">{r.uncracked_transit_time_us ?? '—'}</td>
                          <td className="py-2 px-4 text-right font-bold text-amber-700">{r.crack_depth_mm != null ? r.crack_depth_mm.toFixed(1) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : t.test_type === 'surface_quality' ? (
                  <table className="w-full text-xs bg-white rounded-xl border border-gray-100">
                    <thead>
                      <tr className="text-gray-500 text-[10px] uppercase border-b border-gray-100">
                        <th className="py-2 px-4 text-left">Point</th>
                        <th className="py-2 px-4 text-left">Surface condition observed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {t.readings.map(r => (
                        <tr key={r.id || r.point_label}>
                          <td className="py-2 px-4 font-bold text-gray-900 font-mono">{r.point_label}</td>
                          <td className="py-2 px-4 text-gray-700">{r.surface_condition || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-xs bg-white rounded-xl border border-gray-100">
                    <thead>
                      <tr className="text-gray-500 text-[10px] uppercase border-b border-gray-100">
                        <th className="py-2 px-4 text-left">Point</th>
                        <th className="py-2 px-4 text-right">Path L (mm)</th>
                        <th className="py-2 px-4 text-right">Transit t (µs)</th>
                        <th className="py-2 px-4 text-right">Velocity (m/s)</th>
                        <th className="py-2 px-4 text-right">E.C.S (MPa)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {t.readings.map(r => (
                        <tr key={r.id || r.point_label}>
                          <td className="py-2 px-4 font-bold text-gray-900">{r.point_label}</td>
                          <td className="py-2 px-4 text-right text-gray-700">{r.path_length_mm ?? '—'}</td>
                          <td className="py-2 px-4 text-right text-gray-700">{r.transit_time_us ?? '—'}</td>
                          <td className="py-2 px-4 text-right font-bold text-amber-700">{formatVelocityMs(r.velocity_km_s != null ? r.velocity_km_s * 1000 : null)}</td>
                          <td className="py-2 px-4 text-right text-gray-800">{r.ecs_mpa != null ? r.ecs_mpa.toFixed(1) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">
                Single-measurement record (legacy / cloud-receiver entry) — no multi-point readings stored for this test.
              </p>
            )}
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
