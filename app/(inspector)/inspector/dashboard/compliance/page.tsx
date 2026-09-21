"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  ClipboardList,
  Gavel,
} from "lucide-react";
import {
  getInspectorStopWorkOrders,
  getInspectorFindings,
} from "@/services/inspector";
import { InspectionFinding, StopWorkOrder } from "@/services/inspections";
import { orDash, dateOr } from "@/lib/display";

/**
 * Statutory compliance, read from the records the platform actually holds.
 *
 * Every figure on this page was a literal. "92.4%" jurisdiction compliance
 * score, "05" active remediation plans, "01" stop-work notice enforced, and a
 * banner for "SWO-2026-0014 · Active Enforcement" on "Eko Atlantic Tower D -
 * Sector 4 Transfer Slab" that had been "Issued 3 Days Ago". There was no data
 * layer at all — no fetch, no service import, no state. A building-control
 * officer opening this screen read a compliance position for a jurisdiction,
 * including a live enforcement notice against a named site, that no one had
 * recorded.
 *
 * Two scoped endpoints replace it, both filtered server-side to this
 * inspector's projects: stop-work orders (`StopWorkOrderViewSet`) and
 * non-conformance findings (`FindingViewSet`). What the record does not hold is
 * shown as absent, and an unreachable server is reported as unreachable rather
 * than as a clean bill.
 */
export default function InspectorCompliancePage() {
  const [orders, setOrders] = useState<StopWorkOrder[]>([]);
  const [findings, setFindings] = useState<InspectionFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchCompliance = async () => {
    setIsLoading(true);
    setLoadError(null);

    const [orderRows, findingRows] = await Promise.allSettled([
      getInspectorStopWorkOrders(),
      getInspectorFindings({ resolved: false }),
    ]);

    if (orderRows.status === "fulfilled") {
      setOrders(Array.isArray(orderRows.value) ? orderRows.value : []);
    } else {
      setOrders([]);
    }

    if (findingRows.status === "fulfilled") {
      setFindings(Array.isArray(findingRows.value) ? findingRows.value : []);
    } else {
      setFindings([]);
    }

    // One combined error, because either source failing makes the page's
    // totals wrong and a partially-loaded page would understate enforcement.
    const failures = [orderRows, findingRows].filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      const reason: any = (failures[0] as PromiseRejectedResult).reason;
      setLoadError(
        reason?.response?.data?.detail ||
          reason?.message ||
          "The compliance register could not be read."
      );
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  const activeOrders = orders.filter((o) => o.status === "ACTIVE");
  const appealedOrders = orders.filter((o) => o.status === "APPEALED");
  const criticalFindings = findings.filter(
    (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
              Statutory Compliance &amp; Orders
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
              Stop-work orders and open non-conformance findings on the projects in your scope.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchCompliance}
          className="self-start md:self-auto p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
          title="Refresh"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loadError ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 mb-1">
            The compliance register could not be read
          </h3>
          <p className="text-xs text-amber-800">{loadError}</p>
          <p className="text-xs text-amber-700 mt-2">
            No order and no finding is listed below because neither register
            could be read. This is not a statement that the sites in your scope
            are compliant.
          </p>
        </div>
      ) : (
        <>
          {/* Overview metrics, counted from the rows above */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 border-l-4 border-l-emerald-500 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#022C4F]">
                    {findings.length}
                  </div>
                  <div className="text-xs text-slate-500">
                    Open Non-Conformance Findings
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 border-l-4 border-l-amber-500 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#022C4F]">
                    {criticalFindings.length}
                  </div>
                  <div className="text-xs text-slate-500">
                    Critical / High Severity
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 border-l-4 border-l-rose-500 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#022C4F]">
                    {activeOrders.length}
                  </div>
                  <div className="text-xs text-slate-500">
                    Stop-Work Orders In Force
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active enforcement notices */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
              Enforcement Notices
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
                <Gavel size={32} className="text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  No Stop-Work Orders Recorded
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No enforcement order has been recorded against the projects in
                  your scope. Orders are issued from the inspections module, not
                  from this screen.
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const isActive = order.status === "ACTIVE";
                return (
                  <div
                    key={order.id}
                    className={`p-5 rounded-2xl border shadow-sm space-y-2 ${
                      isActive
                        ? "bg-rose-50/70 border-rose-200"
                        : "bg-white border-slate-200/80"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isActive
                            ? "bg-rose-100 text-rose-800 border-rose-200"
                            : order.status === "APPEALED"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {orDash(order.order_number, "No order number")} &bull;{" "}
                        {orDash(order.status, "Status not recorded")}
                      </span>
                      <span className="text-xs text-slate-500">
                        Issued {dateOr(order.issued_at, "date not recorded")}
                      </span>
                      {order.status === "LIFTED" && order.lifted_at && (
                        <span className="text-xs text-emerald-700 font-semibold">
                          Lifted {dateOr(order.lifted_at)}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-base font-bold ${
                        isActive ? "text-rose-900" : "text-[#022C4F]"
                      }`}
                    >
                      {orDash(order.project_name, "Project not recorded")}
                      {order.project_reference
                        ? ` (${order.project_reference})`
                        : ""}
                    </h3>

                    <p
                      className={`text-xs leading-relaxed max-w-3xl ${
                        isActive ? "text-rose-800" : "text-slate-600"
                      }`}
                    >
                      {orDash(order.reason, "No reason recorded for this order.")}
                    </p>

                    <div className="text-[11px] text-slate-500 pt-1">
                      Issued by{" "}
                      <strong className="text-slate-700 font-semibold">
                        {orDash(order.issued_by_name, "not recorded")}
                      </strong>
                      {order.inspection_reference && (
                        <>
                          {" "}
                          &bull; Inspection{" "}
                          <span className="font-mono">
                            {order.inspection_reference}
                          </span>
                        </>
                      )}
                      {order.lifted_by_name && (
                        <>
                          {" "}
                          &bull; Lifted by{" "}
                          <strong className="text-slate-700 font-semibold">
                            {order.lifted_by_name}
                          </strong>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {appealedOrders.length > 0 && (
              <p className="text-[11px] text-slate-500">
                {appealedOrders.length} order
                {appealedOrders.length === 1 ? " is" : "s are"} under appeal and
                remain in force until lifted.
              </p>
            )}
          </div>

          {/* Open non-conformance findings */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
              Open Non-Conformance Findings
            </h2>

            {findings.length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
                <ShieldAlert size={32} className="text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  No Open Findings
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No unresolved finding has been recorded against the projects in
                  your scope.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                {findings.map((f) => (
                  <div key={f.id} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {orDash(f.finding_reference, "No reference")}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          f.severity === "CRITICAL"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : f.severity === "HIGH"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {orDash(f.severity, "Severity not recorded")}
                      </span>
                      {f.requires_reinspection && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Re-inspection required
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#022C4F] leading-snug">
                      {orDash(f.title, "Finding title not recorded")}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">
                      {orDash(f.project_name, "Site not recorded")} &bull;
                      Reported {dateOr(f.created_at)}
                      {f.resolution_deadline
                        ? ` • Remedy due ${dateOr(f.resolution_deadline)}`
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
