import {
  LocalQueueItem,
  listOffline,
  markOfflineFailed,
  markOfflineSent,
} from './offlineQueue';
import { enqueueSyncItem, processSyncQueue } from '@/services/sync';

/**
 * Moving work from the browser's queue to the server's.
 *
 * Two distinct steps, and conflating them is the mistake this module exists to
 * avoid:
 *
 *  1. **Upload** — each locally-held item is handed to `POST sync/queue/`. The
 *     server validates the payload against the applier registry for that entity
 *     type and either accepts the row or refuses it. Nothing is applied to any
 *     registry yet.
 *  2. **Flush** — `POST sync/process/` applies what was accepted, through the
 *     same serializers the manual endpoints use.
 *
 * An item that fails step 1 has not been written anywhere and stays local. An
 * item that fails step 2 is on the server's queue and the server owns its
 * retries. The Sync Center reports the two separately because they call for
 * different actions from the inspector: re-send, versus wait.
 */

/** Why a push did not land. Distinguishing these is the whole point. */
export type PushOutcome =
  /** Accepted by the queue — a new row, or a retry the server recognised. */
  | 'accepted'
  /** The device could not reach the server. The item is still local, untouched. */
  | 'unreachable'
  /** The server refused it. Retrying the identical item cannot succeed. */
  | 'refused';

export interface PushResult {
  client_item_id: string;
  entity_type: string;
  outcome: PushOutcome;
  /** The queue reference, when accepted. */
  reference?: string;
  deduplicated?: boolean;
  error?: string;
}

function messageOf(err: any, fallback: string): string {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

/**
 * Whether a failure means "the server said no" rather than "the server was not
 * there".
 *
 * axios sets `response` only when a response was actually received, so its
 * absence is the honest signal that the request never completed. Treating a
 * refused item as merely offline would retry a payload the server has already
 * rejected, forever, and treat a 400 as a connectivity problem.
 */
export function wasRefused(err: any): boolean {
  const status = err?.response?.status;
  return typeof status === 'number' && status >= 400 && status < 500;
}

/**
 * The mirror of `wasRefused`: no response came back at all.
 *
 * This is the condition that licenses journaling a write locally. It is
 * deliberately not "anything that is not a 4xx" — a 5xx means the server
 * answered and failed, and a payload that reached a broken server must not be
 * silently re-filed as never-having-been-sent; the inspector has to see it.
 *
 * A request that was cancelled mid-flight also lands here and is journaled,
 * which is correct: nothing confirms it was received.
 */
export function isOffline(err: any): boolean {
  return !err?.response;
}

/**
 * Hand one local item to the server's queue.
 *
 * A 409 is a refusal and is recorded as one: it means this `client_item_id` is
 * already queued with a *different* payload, and the server has kept the stored
 * row rather than overwrite it. Overwriting is how a replay becomes data loss,
 * so the local item is marked failed with the server's own explanation instead
 * of being pushed again.
 */
export async function pushItem(item: LocalQueueItem): Promise<PushResult> {
  try {
    const result = await enqueueSyncItem({
      client_item_id: item.client_item_id,
      entity_type: item.entity_type,
      entity_id: item.entity_id || undefined,
      action: item.action,
      payload: item.payload,
    });
    await markOfflineSent(item.client_item_id, result.reference);
    return {
      client_item_id: item.client_item_id,
      entity_type: item.entity_type,
      outcome: 'accepted',
      reference: result.reference,
      deduplicated: result.deduplicated,
    };
  } catch (err: any) {
    const detail = messageOf(err, 'The server did not accept this item.');
    if (!wasRefused(err)) {
      // Unreachable. The item stays QUEUED — it has not been written anywhere,
      // and marking it failed would suggest the server had seen it.
      return {
        client_item_id: item.client_item_id,
        entity_type: item.entity_type,
        outcome: 'unreachable',
        error: detail,
      };
    }
    await markOfflineFailed(item.client_item_id, detail);
    return {
      client_item_id: item.client_item_id,
      entity_type: item.entity_type,
      outcome: 'refused',
      error: detail,
    };
  }
}

export interface FlushResult {
  /** Local items considered on this pass. */
  considered: number;
  pushed: number;
  /** Already queued under this key — a retry the server recognised. */
  deduplicated: number;
  unreachable: number;
  refused: number;
  /** The server's queue was flushed. Null when nothing was pushed and no attempt was made. */
  processed: Awaited<ReturnType<typeof processSyncQueue>> | null;
  /** Set when the flush itself could not run. */
  processError?: string;
  items: PushResult[];
}

/**
 * Push everything local, then flush the server's queue.
 *
 * Local items are pushed in capture order. That matters: the server applies the
 * queue FIFO, and an UPDATE replayed before its CREATE is a corruption — so the
 * order the inspector captured the work in is the order it has to be handed
 * over in, not the order a store happened to return.
 *
 * Failed items are re-pushed only when `includeFailed` is set. A refusal is
 * permanent until a human changes something, and the Sync Center is where they
 * see that and decide; a background retry of a refused payload is just noise.
 */
export async function flushQueue(options?: {
  includeFailed?: boolean;
}): Promise<FlushResult> {
  const includeFailed = options?.includeFailed ?? false;
  const all = await listOffline();
  const sendable = all.filter(
    (item) => item.state === 'QUEUED' || (includeFailed && item.state === 'FAILED')
  );

  const items: PushResult[] = [];
  for (const item of sendable) {
    items.push(await pushItem(item));
  }

  const pushed = items.filter((i) => i.outcome === 'accepted').length;
  const unreachable = items.filter((i) => i.outcome === 'unreachable').length;
  const refused = items.filter((i) => i.outcome === 'refused').length;
  const deduplicated = items.filter((i) => i.deduplicated).length;

  // The flush runs when anything is on the server's queue, even if this pass
  // pushed nothing — pending work may have been queued by an earlier session.
  let processed: FlushResult['processed'] = null;
  let processError: string | undefined;
  try {
    processed = await processSyncQueue();
  } catch (err: any) {
    processError = messageOf(err, 'The server queue could not be flushed.');
  }

  return {
    considered: sendable.length,
    pushed,
    deduplicated,
    unreachable,
    refused,
    processed,
    processError,
    items,
  };
}
