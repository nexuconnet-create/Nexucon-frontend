"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  CloudOff,
  Cloud,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Info,
  Send,
  Clock,
} from "lucide-react";
import {
  getSyncStatus,
  type SyncProcessResult,
  type SyncStatus,
} from "@/services/sync";
import {
  countOffline,
  discardOffline,
  listOffline,
  offlineStoreState,
  type LocalQueueItem,
  type OfflineStoreState,
} from "@/lib/offlineQueue";
import { flushQueue, type FlushResult } from "@/lib/syncEngine";
import { dateTimeOr, orDash } from "@/lib/display";

/**
 * The capture actions that journal to the local queue when the network is not
 * there.
 *
 * This list is the honest answer to "what works offline?", and it is written
 * out rather than implied because the alternative — a page that says "offline
 * ready" while two of four field actions silently need a connection — is the
 * kind of claim this whole module exists to stop. It is updated in the same
 * commit as the wiring it describes.
 *
 * Only a failure to *reach* the server falls back to the queue. A refusal is
 * shown to the inspector as a refusal, because an item the server has already
 * rejected would fail on every flush and hide the real problem behind a
 * "queued" badge.
 */
const JOURNALED_ACTIONS: string[] = [
  // Requires a description: the queue's own validator refuses a CREATE FINDING
  // without one, while the online `log-finding/` action accepts an empty one.
  // The offline path therefore asks for it up front rather than filing
  // something the next flush would reject.
  "Logging a finding against an inspection (with a description)",
];

function errorOf(err: any, fallback: string): string {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

const STATE_STYLES: Record<LocalQueueItem["state"], string> = {
  QUEUED: "bg-amber-50 text-amber-700 border-amber-200",
  SENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function InspectorSyncCenterPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const [storeState, setStoreState] = useState<OfflineStoreState | null>(null);
  const [storeReason, setStoreReason] = useState<string | undefined>(undefined);
  const [localItems, setLocalItems] = useState<LocalQueueItem[]>([]);
  const [localCount, setLocalCount] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [flushResult, setFlushResult] = useState<FlushResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [discarding, setDiscarding] = useState<string | null>(null);

  const readServer = useCallback(async () => {
    setIsLoadingStatus(true);
    setStatusError(null);
    try {
      setStatus(await getSyncStatus());
    } catch (err) {
      setStatus(null);
      setStatusError(
        errorOf(err, "The server's queue status could not be read.")
      );
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  const readLocal = useCallback(async () => {
    setLocalError(null);
    const health = await offlineStoreState();
    setStoreState(health.state);
    setStoreReason(health.reason);
    if (health.state === "unavailable") {
      // No local store means no local answer. Reporting zero here would be a
      // fabricated count of work the device may well be holding in another
      // tab's storage; the state is shown instead.
      setLocalItems([]);
      setLocalCount(null);
      return;
    }
    try {
      setLocalItems(await listOffline());
      setLocalCount(await countOffline());
    } catch (err: any) {
      setLocalError(errorOf(err, "The local queue could not be read."));
      setLocalCount(null);
    }
  }, []);

  useEffect(() => {
    void readServer();
    void readLocal();
  }, [readServer, readLocal]);

  const handleSyncNow = async (includeFailed: boolean) => {
    setIsSyncing(true);
    setSyncError(null);
    setFlushResult(null);
    try {
      const result = await flushQueue({ includeFailed });
      setFlushResult(result);
      await Promise.all([readServer(), readLocal()]);
    } catch (err) {
      setSyncError(errorOf(err, "The sync run could not be completed."));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDiscard = async (item: LocalQueueItem) => {
    setDiscarding(item.client_item_id);
    setSyncError(null);
    try {
      await discardOffline(item.client_item_id);
      await readLocal();
    } catch (err) {
      setSyncError(errorOf(err, "The item could not be removed from this device."));
    } finally {
      setDiscarding(null);
    }
  };

  const queuedLocal = localItems.filter((i) => i.state === "QUEUED").length;
  const failedLocal = localItems.filter((i) => i.state === "FAILED").length;
  const heldLocal = localItems.filter((i) => i.state !== "SENT").length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#022C4F]">Sync Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Field work captured on this device, and what the server has done
            with it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleSyncNow(false)}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
            <span>{isSyncing ? "Syncing…" : "Sync now"}</span>
          </button>
          <button
            type="button"
            onClick={() => void readLocal().then(() => readServer())}
            disabled={isLoadingStatus}
            className="p-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            title="Re-read this device and the server"
          >
            <RefreshCw size={15} className={isLoadingStatus ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {syncError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium">{syncError}</span>
        </div>
      )}

      {/* What the last run actually did, item by item. A count alone would let
          "3 items processed" read as success when all three were refused. */}
      {flushResult && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#022C4F]">Last sync run</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Handed over", value: flushResult.pushed },
              { label: "Already queued", value: flushResult.deduplicated },
              { label: "Server refused", value: flushResult.refused },
              { label: "Device offline", value: flushResult.unreachable },
            ].map((tile) => (
              <div
                key={tile.label}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70"
              >
                <div className="text-lg font-bold text-[#022C4F]">{tile.value}</div>
                <div className="text-[11px] text-slate-500">{tile.label}</div>
              </div>
            ))}
          </div>

          {flushResult.processed ? (
            <div className="text-xs text-slate-600">
              The server applied{" "}
              <strong className="text-slate-800">{flushResult.processed.synced}</strong>{" "}
              of {flushResult.processed.processed} item
              {flushResult.processed.processed === 1 ? "" : "s"}
              {flushResult.processed.failed > 0 && (
                <span className="text-rose-700">
                  , and {flushResult.processed.failed} failed
                </span>
              )}
              {flushResult.processed.skipped > 0 && (
                <span className="text-amber-700">
                  , skipping {flushResult.processed.skipped} past their retry cap
                </span>
              )}
              . {flushResult.processed.remaining} still waiting.
            </div>
          ) : flushResult.processError ? (
            <div className="text-xs text-amber-800">
              {flushResult.processError} Anything already handed over is on the
              server's queue and will be applied on the next run.
            </div>
          ) : flushResult.considered === 0 ? (
            <div className="text-xs text-slate-600">
              There was nothing on this device to hand over.
            </div>
          ) : null}

          {flushResult.processed && flushResult.processed.applied.length > 0 && (
            <div className="rounded-xl border border-slate-200/70 divide-y divide-slate-200/70 overflow-hidden">
              {flushResult.processed.applied.map((row) => (
                <div
                  key={row.reference}
                  className="px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-slate-50/60"
                >
                  <span className="text-[11px] font-mono text-slate-600">
                    {row.reference} · {row.entity_type} {row.action}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      row.status === "SYNCED"
                        ? "text-emerald-700"
                        : row.status === "FAILED"
                        ? "text-rose-700"
                        : "text-slate-600"
                    }`}
                  >
                    {row.status}
                    {row.error ? ` — ${row.error}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* This device */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              storeState === "ready"
                ? "bg-[#022C4F]/10 text-[#022C4F] border-[#022C4F]/20"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <HardDrive size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#022C4F]">On this device</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {storeState === null
                ? "Reading the local queue…"
                : storeState === "unavailable"
                ? "This browser is not holding a local queue."
                : localCount === null
                ? "The local queue could not be counted."
                : heldLocal === 0
                ? "Nothing captured on this device is waiting to be sent."
                : `${heldLocal} capture${heldLocal === 1 ? "" : "s"} held on this device.`}
            </p>
          </div>
        </div>

        {storeState === "unavailable" && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <div className="font-bold mb-1">
              There is no local queue in this browser
            </div>
            <p className="leading-relaxed">
              {storeReason} IndexedDB is blocked in some private-browsing modes
              and by some browser policies. A capture taken while the network is
              unreachable cannot be held here, so field work must be sent while
              there is a connection. This is not the same as the queue being
              empty.
            </p>
          </div>
        )}

        {localError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {localError}
          </div>
        )}

        {heldLocal > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {queuedLocal > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                <Clock size={12} />
                {queuedLocal} not yet sent
              </span>
            )}
            {failedLocal > 0 && (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                  <AlertTriangle size={12} />
                  {failedLocal} refused by the server
                </span>
                <button
                  type="button"
                  onClick={() => void handleSyncNow(true)}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  Re-send refused items
                </button>
              </>
            )}
          </div>
        )}

        {localItems.length > 0 && (
          <div className="space-y-2">
            {localItems.map((item) => (
              <div
                key={item.client_item_id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800">
                    {item.entity_type.replace(/_/g, " ")}{" "}
                    {item.action.toLowerCase()}
                    {item.entity_id ? ` · ${item.entity_id.slice(0, 8)}…` : ""}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono break-all">
                    {item.client_item_id}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Captured {dateTimeOr(item.queued_at, "at an unrecorded time")}
                    {item.attempts > 0 ? ` · ${item.attempts} attempt${item.attempts === 1 ? "" : "s"}` : ""}
                    {item.remote_reference ? ` · queued as ${item.remote_reference}` : ""}
                  </div>
                  {item.last_error && (
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      {item.last_error}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                      STATE_STYLES[item.state]
                    }`}
                  >
                    {item.state === "SENT"
                      ? "On the server"
                      : item.state === "FAILED"
                      ? "Refused"
                      : "Not sent"}
                  </span>
                  {item.state !== "SENT" && (
                    <button
                      type="button"
                      onClick={() => void handleDiscard(item)}
                      disabled={discarding === item.client_item_id}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                      title="Remove this capture from this device without sending it"
                    >
                      {discarding === item.client_item_id ? "Removing…" : "Discard"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
          <Info size={12} className="shrink-0 mt-0.5" />
          <span>
            {JOURNALED_ACTIONS.length > 0 ? (
              <>
                These actions are journaled on this device when the network is
                unreachable: {JOURNALED_ACTIONS.join("; ")}. Everything else on
                this app writes to the server directly and needs a connection.
              </>
            ) : (
              <>
                No capture action on this app journals to the local queue yet, so
                it holds only what has been written to it directly. Field work
                currently requires a connection.
              </>
            )}
          </span>
        </p>
      </div>

      {/* The server's queue */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#022C4F]/10 text-[#022C4F] border border-[#022C4F]/20">
            <Cloud size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#022C4F]">On the server</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {statusError
                ? "The server's queue could not be read."
                : isLoadingStatus && !status
                ? "Reading the server's queue…"
                : status
                ? status.pending + status.failed + status.processing === 0
                  ? status.synced === 0
                    ? "No work has ever been queued by this account."
                    : `Nothing is waiting. ${status.synced} item${
                        status.synced === 1 ? " has" : "s have"
                      } been applied to the registries.`
                  : `${status.pending} waiting, ${status.failed} failed, ${status.processing} in progress.`
                : ""}
            </p>
          </div>
        </div>

        {statusError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {statusError} Nothing is shown because nothing could be read — this
            is not a queue that is empty.
          </div>
        )}

        {status && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Pending", value: status.pending, tone: "text-amber-700" },
                { label: "Failed", value: status.failed, tone: "text-rose-700" },
                { label: "Applied", value: status.synced, tone: "text-emerald-700" },
                { label: "In progress", value: status.processing, tone: "text-slate-700" },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70"
                >
                  <div className={`text-lg font-bold ${tile.tone}`}>{tile.value}</div>
                  <div className="text-[11px] text-slate-500">{tile.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-slate-600">
              <span>
                Oldest still waiting:{" "}
                {status.oldest_pending_at
                  ? dateTimeOr(status.oldest_pending_at, "at an unrecorded time")
                  : "nothing is waiting"}
              </span>
              <span>
                Last applied:{" "}
                {status.last_synced_at
                  ? dateTimeOr(status.last_synced_at, "at an unrecorded time")
                  : "nothing has been applied yet"}
              </span>
              <span>Retry cap: {status.max_retries}</span>
            </div>

            {status.exhausted.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  {status.exhausted.length} item
                  {status.exhausted.length === 1 ? "" : "s"} past the retry cap
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  These have been retried {status.max_retries} times and still
                  cannot be applied. They are kept rather than dropped, with the
                  server&apos;s own reason, so the field work is not lost.
                </p>
                <div className="rounded-xl border border-rose-200 bg-white divide-y divide-rose-100 overflow-hidden">
                  {status.exhausted.map((row) => (
                    <div key={row.reference} className="px-3 py-2 space-y-0.5">
                      <div className="text-[11px] font-mono text-slate-600">
                        {row.reference} · {row.entity_type} {row.action} ·{" "}
                        {row.retry_count} attempts
                      </div>
                      <div className="text-[11px] text-rose-700">
                        {orDash(row.last_error, "The server recorded no reason.")}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Queued {dateTimeOr(row.queued_at, "at an unrecorded time")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* What the queue is, and what it is not. */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
        <h2 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <CloudOff size={14} />
          How this works
        </h2>
        <ul className="text-[11px] text-slate-600 leading-relaxed space-y-1.5 list-disc pl-4">
          <li>
            Captures are handed to the server in the order they were taken. The
            server applies them in that same order, because an update replayed
            before the row it updates would corrupt the record.
          </li>
          <li>
            Each capture carries a key generated on this device. Sending the same
            capture twice is recognised as a retry, not a second finding.
          </li>
          <li>
            Work is only ever applied to the statutory registries by the server,
            through the same validation a manual entry goes through. This app
            never writes to a registry itself.
          </li>
          <li>
            An item the server has refused is kept with the reason. Nothing is
            discarded automatically.
          </li>
        </ul>
      </div>
    </div>
  );
}
