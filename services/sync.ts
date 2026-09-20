import api from './api';

/**
 * The offline replay queue, as `apps.sync` reports it.
 *
 * `last_synced_at` is `null` until something has actually synced — it is
 * `max(synced_at)` over the inspector's own queue, never the time of the
 * request. A screen that renders it as "synced just now" when nothing ever has
 * is the defect this field exists to make impossible.
 */
export interface SyncStatus {
  counts: Record<string, number>;
  pending: number;
  failed: number;
  synced: number;
  processing: number;
  /** The oldest item still waiting, or null when nothing is waiting. */
  oldest_pending_at: string | null;
  last_synced_at: string | null;
  max_retries: number;
  /** Items past the retry cap. Reported, never dropped. */
  exhausted: SyncExhaustedItem[];
}

export interface SyncExhaustedItem {
  reference: string;
  client_item_id: string;
  entity_type: string;
  action: string;
  retry_count: number;
  last_error: string | null;
  queued_at: string;
}

export interface SyncEnqueueResult {
  reference: string;
  client_item_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  sync_status: string;
  /** True when this key and payload were already queued — a retry, not a write. */
  deduplicated: boolean;
}

export interface SyncAppliedItem {
  reference: string;
  entity_type: string;
  action: string;
  status: string;
  target_model?: string;
  target_id?: string;
  error?: string | null;
}

export interface SyncProcessResult {
  processed: number;
  synced: number;
  failed: number;
  skipped: number;
  /** Items left pending after the run, so a caller can loop without re-reading. */
  remaining: number;
  applied: SyncAppliedItem[];
}

/** `GET /sync/status/` — this inspector's queue depth and health. */
export async function getSyncStatus(): Promise<SyncStatus> {
  const res: any = await api.get('/sync/status/');
  return (res?.data || res) as SyncStatus;
}

/**
 * `POST /sync/queue/` — hand one offline write to the server.
 *
 * `client_item_id` is required and is what makes this safe to retry: the same
 * key with the same payload comes back `deduplicated: true`, and the same key
 * with a *different* payload is refused with a 409 rather than overwriting the
 * queued row. That refusal is deliberate — overwriting is how a replay turns
 * into data loss — so callers must treat a 409 as a real answer, not a
 * transient failure to retry.
 */
export async function enqueueSyncItem(item: {
  client_item_id: string;
  entity_type: string;
  entity_id?: string;
  action: string;
  payload: Record<string, unknown>;
}): Promise<SyncEnqueueResult> {
  const res: any = await api.post('/sync/queue/', item);
  return (res?.data || res) as SyncEnqueueResult;
}

/**
 * `POST /sync/process/` — flush the queue.
 *
 * Synchronous on purpose: the PWA needs the answer on reconnect rather than a
 * job id to poll. Items past their retry cap are skipped and stay visible in
 * `status/` as exhausted; a queue that silently dropped them would be a
 * data-loss bug wearing a green tick.
 */
export async function processSyncQueue(): Promise<SyncProcessResult> {
  const res: any = await api.post('/sync/process/');
  return (res?.data || res) as SyncProcessResult;
}
